
import { Example } from '../types';

// ОДИН цикл, НЕ четыре машины. «Процессы» = разные точки ВХОДА (какой write)
// и ВЫХОДА (какой effect) в один backbone:
//   [любой write] → detectors → gate → starter → brain → effect (= write ↺)
export const EXAMPLES: Example[] = [
  {
    id: "flow_loop", primary_task_id: "brain_core",
    title: "0 · Единый цикл (одна машина)",
    description: "Любой write → детекторы → гейт → starter → ум → эффект (= новый write ↺). Проактива нет: это один и тот же путь для чата, коннекторов и кронов.",
    industry: "core", complexity: "High", tags: ["single-brain", "write-bus", "no-proactive"],
    image_url: "",
    nodes: [
      { task_id: "det_detectors", x: 350, y: 0, label: "detectors (reduce every write)" },
      { task_id: "gate_admission", x: 720, y: 0, label: "gate (mode per write)" },
      { task_id: "starter_recipe", x: 1050, y: 0, label: "starter (aggregation)" },
      { task_id: "brain_core", x: 1380, y: 0, label: "the one brain" },
      { task_id: "eff_respond", x: 1720, y: 0, label: "effect = write ↺" }
    ]
  },
  {
    id: "view_chat", primary_task_id: "trig_user_message",
    title: "Вход: сообщение юзера",
    description: "Тот же цикл. Вход — user-write (gate_mode=always_open, гарантированно доходит), выход — send.",
    industry: "entry", complexity: "Low", tags: ["always_open", "entry"],
    image_url: "",
    nodes: [
      { task_id: "trig_user_message", x: 0, y: 0, label: "message = write" },
      { task_id: "det_detectors", x: 350, y: 0, label: "→ тот же backbone" },
      { task_id: "eff_respond", x: 1720, y: 0, label: "send" }
    ]
  },
  {
    id: "view_connector", primary_task_id: "trig_connector_sync",
    title: "Вход: sync коннектора",
    description: "Неотличим от сообщения юзера по природе; gate_mode=selective. Тот же backbone.",
    industry: "entry", complexity: "Low", tags: ["selective", "entry"],
    image_url: "",
    nodes: [
      { task_id: "trig_connector_sync", x: 0, y: 0, label: "sync = write" },
      { task_id: "det_detectors", x: 350, y: 0, label: "→ тот же backbone" }
    ]
  },
  {
    id: "view_cron", primary_task_id: "trig_cron",
    title: "Вход: крон / каденция",
    description: "Тик времени = write; gate_mode=selective. Тот же backbone.",
    industry: "entry", complexity: "Low", tags: ["selective", "clock", "entry"],
    image_url: "",
    nodes: [
      { task_id: "trig_cron", x: 0, y: 0, label: "cron tick = write" },
      { task_id: "det_detectors", x: 350, y: 0, label: "→ тот же backbone" }
    ]
  },
  {
    id: "view_graph", primary_task_id: "eff_link_entities",
    title: "Выход: рёбра графа",
    description: "Тот же цикл, где эффект — запись edge (link_entities). Тяжёлое семантическое связывание уходит в ночной batch.",
    industry: "exit", complexity: "Medium", tags: ["graph", "provenance", "exit"],
    image_url: "",
    nodes: [
      { task_id: "eff_link_entities", x: 1720, y: 150, label: "effect = edge-write" },
      { task_id: "proc_nightly", x: 2080, y: 150, label: "dream batch-judge" },
      { task_id: "human_confirm", x: 2080, y: 300, label: "confirm-to-edge" },
      { task_id: "store_links", x: 2440, y: 150, label: "links (typed edges)" }
    ]
  },
  {
    id: "view_nightly", primary_task_id: "proc_nightly",
    title: "Ночной цикл",
    description: "Тот же цикл, вход — nightly cron-write. Batch-эффекты: семантические рёбра + self-reflection → готовят утренний starter.",
    industry: "exit", complexity: "Medium", tags: ["nightly", "batch", "exit"],
    image_url: "",
    nodes: [
      { task_id: "trig_cron", x: 0, y: 450, label: "nightly cron = write" },
      { task_id: "proc_nightly", x: 1720, y: 450, label: "dream + reflection" },
      { task_id: "store_links", x: 2080, y: 410, label: "semantic edges" },
      { task_id: "starter_recipe", x: 2080, y: 540, label: "→ morning prep" }
    ]
  }
];
