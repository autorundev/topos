
import { AiTask } from '../types';

export const AI_TASKS: AiTask[] = [
  {
    id: "brain_core", layer_id: "layer_internal", task_type: "ai", nature: "model", category: "ai",
    name: "The one brain (_run_agent_inner)", slug: "one-brain",
    elevator_pitch: "Единственный реактивный core. Реактив И проактив идут через него — это ОДНА машина. Multi-round read-only tool loop, context minimalism, терминал = структурный respond.",
    example_usage: "Читает starter → тянет специфику тулами → решает: направить внимание или молчать.",
    io_spec: {
      inputs: {
        required: [{ id: "data_starter", label: "Starter (system-turn)" }],
        optional: [{ id: "data_state", label: "3-zone memory" }, { id: "data_persona", label: "block1 self-select" }]
      },
      outputs: {
        primary: { id: "data_action", label: "respond{write|weave|silent}" },
        metadata: [{ id: "data_text", label: "thinking" }]
      }
    },
    implementation_notes: {
      maturity: "established",
      typical_latency: "interactive",
      data_requirements: "continuous",
      human_oversight: "optional"
    },
    ux_notes: {
      risk: "Второй ум / арбитр в коде дублирует суждение — регрессия к «двум машинам».",
      tip: "Обогащай ДАННЫЕ, которые получает один ум, не тюнь персону.",
      anti_patterns: [
        "Haiku пре-гейт перед гарантированным Sonnet-ходом",
        "Код-арбитр вместо истории разговора",
        "Отдельный «проактивный» пайплайн"
      ]
    },
    capabilities: [
      { name: "Attention direction", tag: "attention-director", example: "Отдаёт кросс-граф связь, которую ты упустил, вовремя — вместо ещё одного вопроса." },
      { name: "Agentic retrieval", tag: "read-only-pull", example: "defer_loading: тянет специфику по нужде, не front-load." },
      { name: "Silence as output", tag: "first-class-silence", example: "Ход может закончиться без сообщения — корректный исход." }
    ],
    relations: [
      { target_id: "tool_retrieve", type: "requires_input_from", strength: "strong", reason: "Multi-round read-only tool loop; context minimalism." },
      { target_id: "eff_respond", type: "actuates", strength: "strong", reason: "Структурный терминал respond → egress-гейт." }
    ]
  }
];
