// src/data/layers.ts
import { Layer } from "../types";

export const LAYERS: Layer[] = [
  {
    id: "layer_inbound",
    name: "Inbound",
    slug: "inbound",
    label: "01",
    role: "Данные меняются (write)",
    color: "#3b6ea5",
    description: "Всё — write в общий лог, РАВНОПРАВНО: сообщение юзера === sync коннектора === крон === собственный эффект Vector. Каждый write триггерит детекторы. Нет «реактивного» и «проактивного» входа — есть просто изменение данных.",
    guidance: {
      when_to_use: "Точка входа стимула",
      typical_position: "слева",
      red_flags: [
        "Параллельный вход мимо write-bus",
        "Привилегия юзер-сообщения на ингрессе (супернуто §0.3 A → gate_mode)"
      ]
    }
  },
  {
    id: "layer_internal",
    name: "Internal",
    slug: "internal",
    label: "02",
    role: "Что происходит внутри",
    color: "#7a5cc4",
    description: "Reduce (41 детектор-reducer) → gate (admission по gate_mode) → aggregate (starter-recipe) → the one brain (_run_agent_inner) с read-only тулами → построение графа (link_entities, dream batch) → ночной цикл. Всё читает vault-субстрат (~65 таблиц).",
    guidance: {
      when_to_use: "Обработка, суждение, память",
      typical_position: "центр",
      red_flags: [
        "Второй ум / арбитр в коде",
        "Haiku пре-гейт перед гарантированным Sonnet-ходом",
        "Детектор пишет / зовёт LLM / рекомпутит state"
      ]
    }
  },
  {
    id: "layer_outbound",
    name: "Outbound",
    slug: "outbound",
    label: "03",
    role: "Что уходит наружу",
    color: "#42c48a",
    description: "actuate_effect — один egress-гейт: send в чат, vault/calendar-write, с audience-render + confirm(необратимое/non-self) + cost-cap + safety-pierce. Эффект — сам write, петлёй возвращается входом следующего цикла.",
    guidance: {
      when_to_use: "Любое внешнее действие",
      typical_position: "справа",
      red_flags: [
        "Ответ в группу мимо confirm (утечка приватного vault)",
        "Необратимый эффект без confirm"
      ]
    }
  }
];
