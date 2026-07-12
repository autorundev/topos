// src/data/human_tasks.ts
import { HumanTask } from '../types';

export const HUMAN_TASKS: HumanTask[] = [
  {
    id: "human_confirm", layer_id: "layer_outbound", task_type: "human", nature: "human", category: "user",
    name: "Confirm irreversible effect", slug: "confirm-effect",
    elevator_pitch: "Юзер подтверждает необратимое / non-self действие или future-behavior-commitment (авторинг WATCH). Переводит model-inferred write в confirmed.",
    example_usage: "Подтвердить рассылку в группу; подтвердить, что model-inferred edge — правда (confirm-to-edge).",
    io_spec: {
      inputs: { required: [{ id: "data_action", label: "Предлагаемый Effect" }], optional: [] },
      outputs: { primary: { id: "data_signal", label: "confirm / deny" }, metadata: [{ id: "data_flag", label: "→ confirmed=true" }] }
    },
    common_variants: ["confirm", "deny", "confirm_to_edge", "future_behavior_commitment"],
    relations: [
      { target_id: "eff_respond", type: "enables", strength: "strong", reason: "model-inferred → confirmed переводит write в доверенный; закрывает reliability-инвариант." }
    ]
  }
];
