
import { ConstraintDefinition } from '../types';

// Constraints — то, что нельзя нарушать (Atlas: «design scaffolding»). applies_to линкует к узлам флоу.
export const CONSTRAINTS: ConstraintDefinition[] = [
  {
    id: 'c_gate_mode', name: 'gate_mode', category: 'execution_behavior', icon: 'DoorOpen', type: 'Enum',
    description: 'Детекторы срабатывают на КАЖДЫЙ write (T1); гейт впускает к уму СЕЛЕКТИВНО (T2). always_open (юзер) — всегда; selective (проактивный write) — через silence/dedup/ceiling.',
    applies_to: ['gate_admission', 'trig_user_message', 'trig_connector_sync', 'trig_cron'], example_values: 'always_open | selective',
  },
  {
    id: 'c_silence', name: 'Тишина — первоклассный исход', category: 'execution_behavior', icon: 'VolumeX',
    description: 'Ход может закончиться без сообщения — это корректный исход, а не сбой. Не форсить ответ ради ответа.',
    applies_to: ['gate_admission', 'eff_respond'],
  },
  {
    id: 'c_confirm', name: 'confirm необратимого', category: 'quality_safety', icon: 'ShieldCheck', type: 'Boolean',
    description: 'Необратимое / non-self действие и future-behavior-commitment требуют подтверждения человеком. model-inferred → confirmed.',
    applies_to: ['eff_respond', 'human_confirm', 'eff_link_entities'],
  },
  {
    id: 'c_safety', name: 'safety-pierce', category: 'quality_safety', icon: 'AlertTriangle',
    description: 'Сигналы вреда/кризиса пробивают тишину и селективный гейт. Классификация — через основной ум (не вторичный детектор/regex).',
    applies_to: ['eff_respond', 'brain_core', 'det_detectors'],
  },
  {
    id: 'c_grounded', name: 'grounded dates', category: 'quality_safety', icon: 'CalendarCheck',
    description: 'Датировать по реальным фактам памяти (3-zone), а не конфабулировать «месяцы». Анти-выдумывание (case David / SETKA).',
    applies_to: ['starter_recipe', 'store_memories', 'brain_core'],
  },
  {
    id: 'c_cost', name: 'cost-cap', category: 'performance_resource', icon: 'CircleDollarSign', type: 'Number',
    description: 'Потолок стоимости на эффект/ход + budget-bounded стартер. echo-guard гасит self-storm (эффект = write ↺).',
    applies_to: ['eff_respond', 'brain_core', 'starter_recipe'],
  },
  {
    id: 'c_privacy', name: 'приватность vault', category: 'data_context', icon: 'Lock',
    description: 'Per-user SQLCipher-изоляция. Ответ в группу мимо confirm = утечка приватного vault (деанон). Default пермиссивный, hard-deny только необратимое.',
    applies_to: ['store_vault', 'eff_respond'],
  },
  {
    id: 'c_provenance', name: 'provenance / confirmed', category: 'data_context', icon: 'BadgeCheck',
    description: 'Рёбра графа несут provenance + confirmed. model-inferred edge не доверенный до промоушена (confirm-to-edge).',
    applies_to: ['store_links', 'eff_link_entities'],
  },
  {
    id: 'c_single_brain', name: 'один ум (single-brain)', category: 'code_philosophy', icon: 'BrainCircuit',
    description: 'Нет второго ума / кода-арбитра. Реактив и проактив — одна машина. Детекторы детерминированы (reducer, не LLM). Haiku-пре-гейт перед гарантированным Sonnet = анти-паттерн.',
    applies_to: ['brain_core', 'det_detectors', 'gate_admission'],
  },
];
