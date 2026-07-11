
import { SystemTask } from '../types';

// io_spec helper inline — держим минимально валидным, детали в elevator_pitch.
export const SYSTEM_TASKS: SystemTask[] = [
  // ═══════════════ INBOUND — все входы РАВНОПРАВНЫ (write) ═══════════════
  {
    id: "trig_user_message", layer_id: "layer_inbound", task_type: "system",
    name: "User message (write)", slug: "user-message",
    elevator_pitch: "Изменение данных, НЕОТЛИЧИМОЕ по природе от sync коннектора. Не «реактивный вход» — просто write, который триггерит детекторы. Единственное отличие: gate_mode=always_open.",
    example_usage: "Юзер написал в чат → запись в conversation → фан-аут детекторов.",
    io_spec: {
      inputs: { required: [{ id: "data_text", label: "Сообщение" }], optional: [{ id: "data_voice", label: "Голос" }] },
      outputs: { primary: { id: "data_write", label: "Trigger record" }, metadata: [{ id: "data_flag", label: "gate_mode=always_open" }] }
    },
    common_variants: ["text", "voice", "callback"],
    relations: [
      { target_id: "store_conversation", type: "writes_to", strength: "strong", reason: "Первоклассный write в общий лог (item 7)." },
      { target_id: "det_detectors", type: "reduces", strength: "strong", reason: "Как ЛЮБОЙ write — синхронно триггерит фан-аут детекторов (T1)." }
    ]
  },
  {
    id: "trig_connector_sync", layer_id: "layer_inbound", task_type: "system",
    name: "Connector sync (write)", slug: "connector-sync",
    elevator_pitch: "16 коннекторов (MCP, Whoop) — per-user 15-мин pull. По природе НЕОТЛИЧИМ от сообщения юзера: тоже write, тоже триггерит детекторы. gate_mode=selective.",
    example_usage: "Whoop подтянул recovery → запись в vault → детекторы.",
    io_spec: {
      inputs: { required: [{ id: "data_ext", label: "Внешний фид" }], optional: [] },
      outputs: { primary: { id: "data_write", label: "Vault write" }, metadata: [{ id: "data_flag", label: "gate_mode=selective" }] }
    },
    common_variants: ["mcp_vault", "whoop", "calendar_read"],
    relations: [
      { target_id: "store_vault", type: "writes_to", strength: "strong", reason: "Ingest-поток; Single-Brain-исключение (нет сильной модели в пути)." },
      { target_id: "det_detectors", type: "reduces", strength: "strong", reason: "Тот же фан-аут детекторов, что и на сообщении юзера." }
    ]
  },
  {
    id: "trig_cron", layer_id: "layer_inbound", task_type: "system",
    name: "Cron / cadence tick (write)", slug: "cron-cadence",
    elevator_pitch: "46 кронов. Тик времени — тоже изменение состояния: daily open/close, weekly, strategic, nightly dream, deferred-reply (1-мин). gate_mode=selective.",
    example_usage: "06:30 в tz юзера → тик → morning-starter recipe.",
    io_spec: {
      inputs: { required: [{ id: "data_clock", label: "Каденция + tz" }], optional: [] },
      outputs: { primary: { id: "data_write", label: "Clock write" }, metadata: [{ id: "data_flag", label: "gate_mode=selective" }] }
    },
    common_variants: ["daily_open", "daily_close", "weekly", "nightly_dream", "deferred_reply"],
    relations: [
      { target_id: "det_detectors", type: "reduces", strength: "medium", reason: "Клок-write оценивается детекторами наравне с data-write." },
      { target_id: "starter_recipe", type: "requires_input_from", strength: "strong", reason: "Каденция выбирает recipe стартера." }
    ]
  },

  // ═══════════════ INTERNAL — одна машина ═══════════════
  {
    id: "det_detectors", layer_id: "layer_internal", task_type: "system",
    name: "Detectors (reducers)", slug: "detectors",
    elevator_pitch: "41 детектор = READ-ONLY reducer'ы над V4 state. Не пишут, не зовут LLM, не рекомпутят. Эмитят Event(urgency, class). Свёрнуты в семьи, не поштучно.",
    example_usage: "drift-детектор видит «SETKA молчит» → Event(urgency=timely, class=drift).",
    io_spec: {
      inputs: { required: [{ id: "data_write", label: "Любой write" }], optional: [{ id: "data_state", label: "V4 state" }] },
      outputs: { primary: { id: "data_event", label: "Event", isArray: true }, metadata: [{ id: "data_score", label: "urgency" }] }
    },
    common_variants: ["drift ×16", "engagement ×10", "reflective ×8", "onboarding ×4", "care_safety ×2"],
    relations: [
      { target_id: "gate_admission", type: "precedes", strength: "strong", reason: "T1 срабатывает всегда; дальше решает gate." }
    ]
  },
  {
    id: "gate_admission", layer_id: "layer_internal", task_type: "system",
    name: "Admission gate (gate_mode)", slug: "admission-gate",
    elevator_pitch: "Две транзиции: T1 — детекторы срабатывают на КАЖДЫЙ write; T2 — гейт впускает к уму СЕЛЕКТИВНО по gate_mode + silence/dedup/ceiling. Тишина — первоклассный исход.",
    example_usage: "always_open (юзер) → всегда; selective (проактивный write) → только через dedup+ceiling.",
    io_spec: {
      inputs: { required: [{ id: "data_event", label: "Events" }], optional: [{ id: "data_flag", label: "gate_mode" }] },
      outputs: { primary: { id: "data_signal", label: "admit?" }, metadata: [] }
    },
    common_variants: ["always_open", "selective", "silence_short_circuit"],
    relations: [
      { target_id: "starter_recipe", type: "enables", strength: "strong", reason: "Пропущенный набор идёт в сборку стартера." },
      { target_id: "brain_core", type: "enables", strength: "medium", reason: "Иначе тишина — корректный исход без пробуждения ума." }
    ]
  },
  {
    id: "starter_recipe", layer_id: "layer_internal", task_type: "system",
    name: "Starter (aggregation)", slug: "starter",
    elevator_pitch: "Детерминированный, budget-bounded recipe по trigger (build_starter registry). Свежий на fire-time в tz юзера, даты grounded (anti-confabulation: case David/SETKA).",
    example_usage: "morning: standing (agenda·focuses·overnight) + fresh signals + recent_surfaces.",
    io_spec: {
      inputs: { required: [{ id: "data_state", label: "vault readers" }], optional: [{ id: "data_event", label: "fresh signals" }] },
      outputs: { primary: { id: "data_starter", label: "StarterContext" }, metadata: [{ id: "data_text", label: "grounded dates" }] }
    },
    common_variants: ["reactive", "morning", "evening", "event", "signal", "deferred_reply"],
    relations: [
      { target_id: "brain_core", type: "wakes", strength: "strong", reason: "Эфемерный system-turn: ум читает starter как стимул, не персистится." }
    ]
  },
  {
    id: "tool_retrieve", layer_id: "layer_internal", task_type: "system",
    name: "Read-only tools (agentic pull)", slug: "read-only-tools",
    elevator_pitch: "78 тулов, read-only подмножество. Ум тянет специфику по ходу рассуждения (defer_loading, context minimalism) — starter не front-load'ит.",
    example_usage: "brain дёргает get_focus / search_memory / graph-neighbors по нужде.",
    io_spec: {
      inputs: { required: [{ id: "data_query", label: "Запрос ума" }], optional: [] },
      outputs: { primary: { id: "data_any", label: "Подтянутый контекст" }, metadata: [] }
    },
    common_variants: ["get_focus", "search_memory", "graph_neighbors", "read_agenda"],
    relations: []
  },
  {
    id: "eff_link_entities", layer_id: "layer_internal", task_type: "system",
    name: "link_entities + graph build", slug: "graph-build",
    elevator_pitch: "Построение графа: code-grounded edges на capture + Haiku auto-linker + ночной dream batch-judge + confirm-to-edge (#140/#141). Гэп #1: edges — единственное, что ум читал, но не писал.",
    example_usage: "auto-edge = provenance=model-inferred, confirmed=false до промоушена.",
    io_spec: {
      inputs: { required: [{ id: "data_edge", label: "src→dst, type" }], optional: [] },
      outputs: { primary: { id: "data_write", label: "links row" }, metadata: [{ id: "data_flag", label: "provenance/confirmed" }] }
    },
    common_variants: ["capture_edge", "haiku_autolink", "dream_batch_edge", "confirm_to_edge"],
    relations: [
      { target_id: "store_links", type: "writes_to", strength: "strong", reason: "Восстанавливает write-симметрию (items/focuses/memories писались, edges — нет)." }
    ]
  },
  {
    id: "proc_nightly", layer_id: "layer_internal", task_type: "system",
    name: "Nightly dream cycle", slug: "nightly-dream",
    elevator_pitch: "Ночной batch: семантическое связывание (перенесено из inline), self-reflection (agent_corrections), подготовка morning-starter. Batch-Sonnet, не per-turn.",
    example_usage: "03:00 → dream batch-judge over дневных writes → semantic edges + reflection.",
    io_spec: {
      inputs: { required: [{ id: "data_write", label: "Дневные writes" }], optional: [] },
      outputs: { primary: { id: "data_write", label: "Semantic edges + corrections" }, metadata: [] }
    },
    common_variants: ["batch_judge_edges", "self_reflection", "morning_prep"],
    relations: [
      { target_id: "store_links", type: "writes_to", strength: "medium", reason: "Тяжёлое семантическое связывание живёт здесь, не в hot-path." },
      { target_id: "starter_recipe", type: "enables", strength: "medium", reason: "Готовит overnight-артефакты для утреннего стартера." }
    ]
  },
  // ── vault-субстрат (сторы) ──
  {
    id: "store_conversation", layer_id: "layer_internal", task_type: "system",
    name: "conversation (log)", slug: "store-conversation",
    elevator_pitch: "Лог диалога. Writes — источник истины; всё остальное читает его.",
    example_usage: "Персистятся только REPLY (subtype awareness:<trigger>), не system-turn.",
    io_spec: { inputs: { required: [{ id: "data_write", label: "write" }], optional: [] }, outputs: { primary: { id: "data_log", label: "conversation rows" }, metadata: [] } },
    common_variants: ["user_turn", "reply", "awareness"],
    relations: [
      { target_id: "starter_recipe", type: "reads_from", strength: "strong", reason: "Лог — источник истины; стартер и всё внутри читают его." }
    ]
  },
  {
    id: "store_focuses", layer_id: "layer_internal", task_type: "system",
    name: "focuses", slug: "store-focuses",
    elevator_pitch: "Активные фокусы юзера. Читается детекторами (drift/engagement).",
    example_usage: "focus_fab4717b: SETKA (paused 2026-03-20, unfrozen 07-02).",
    io_spec: { inputs: { required: [{ id: "data_write", label: "write" }], optional: [] }, outputs: { primary: { id: "data_state", label: "focus rows" }, metadata: [] } },
    common_variants: ["active", "dormant", "paused"],
    relations: [
      { target_id: "det_detectors", type: "reads_from", strength: "strong", reason: "Детекторы-reducer читают активные фокусы (drift/engagement)." }
    ]
  },
  {
    id: "store_memories", layer_id: "layer_internal", task_type: "system",
    name: "memories (3-zone)", slug: "store-memories",
    elevator_pitch: "Датированная память (Zone A/B/C). Позволяет уму ДАТИРОВАТЬ, а не конфабулировать.",
    example_usage: "«SETKA paused 2026-03-20» — реальная дата вместо выдуманного «месяцы».",
    io_spec: { inputs: { required: [{ id: "data_write", label: "write" }], optional: [] }, outputs: { primary: { id: "data_state", label: "memory rows" }, metadata: [{ id: "data_text", label: "dates" }] } },
    common_variants: ["zone_a", "zone_b", "zone_c", "episodes"],
    relations: [
      { target_id: "starter_recipe", type: "reads_from", strength: "medium", reason: "Датированные факты (3-zone) — стартер датирует, а не конфабулирует." }
    ]
  },
  {
    id: "store_links", layer_id: "layer_internal", task_type: "system",
    name: "links (typed edges)", slug: "store-links",
    elevator_pitch: "Граф: типизированные рёбра с provenance + confirmed. Раньше ум читал, но не писал (гэп #1).",
    example_usage: "code-grounded edge (capture) · model-inferred edge (Haiku/dream, unconfirmed) · confirmed edge.",
    io_spec: { inputs: { required: [{ id: "data_edge", label: "edge" }], optional: [] }, outputs: { primary: { id: "data_graph", label: "links rows" }, metadata: [{ id: "data_flag", label: "provenance/confirmed" }] } },
    common_variants: ["code_grounded", "model_inferred", "confirmed"],
    relations: [
      { target_id: "det_detectors", type: "reads_from", strength: "medium", reason: "Reducer читает граф-рёбра наравне с фокусами." }
    ]
  },
  {
    id: "store_vault", layer_id: "layer_internal", task_type: "system",
    name: "vault (~65 tables)", slug: "store-vault",
    elevator_pitch: "Субстрат SQLCipher per-user: ~65 таблиц vault + 29 admin. Event-log под мембраной.",
    example_usage: "items · focuses · memories · links · connector data — всё write'ится сюда.",
    io_spec: { inputs: { required: [{ id: "data_write", label: "write" }], optional: [] }, outputs: { primary: { id: "data_state", label: "vault state" }, metadata: [] } },
    common_variants: ["per_user_sqlcipher", "admin"],
    relations: [
      { target_id: "tool_retrieve", type: "reads_from", strength: "strong", reason: "Read-only тулы проецируют vault по нужде ума." },
      { target_id: "starter_recipe", type: "reads_from", strength: "medium", reason: "Vault-readers наполняют стартер standing-контекстом." }
    ]
  },

  // ═══════════════ OUTBOUND ═══════════════
  {
    id: "eff_respond", layer_id: "layer_outbound", task_type: "system",
    name: "actuate_effect (respond)", slug: "actuate-effect",
    elevator_pitch: "Один egress-гейт: audience-render + confirm(необратимое/non-self) + cost-cap + safety-pierce. respond: write | weave | silent.",
    example_usage: "send в чат · vault_write · calendar_write · silent (корректный исход).",
    io_spec: {
      inputs: { required: [{ id: "data_action", label: "Effect{action,audience,reversible}" }], optional: [] },
      outputs: { primary: { id: "data_write", label: "reply persist" }, metadata: [] }
    },
    common_variants: ["send", "vault_write", "calendar_write", "silent"],
    relations: [
      { target_id: "store_conversation", type: "writes_to", strength: "strong", reason: "Эффект — сам write; персистится REPLY (awareness:<trigger>)." },
      { target_id: "det_detectors", type: "reduces", strength: "medium", reason: "↺ Собственный эффект = write → снова триггерит детекторы (echo-guard DARK гасит self-storm)." }
    ]
  }
];
