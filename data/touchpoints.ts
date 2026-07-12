
import { TouchpointDefinition } from '../types';

// Touchpoints — где система всплывает наружу (Atlas: «invisible systems made tangible»).
export const TOUCHPOINTS: TouchpointDefinition[] = [
  {
    id: 't_chat', name: 'Telegram-чат', category: 'conversational', icon: 'MessageCircle',
    description: 'Основная поверхность: реплики, awareness-сообщения, диалог. Сообщение юзера = write, ответ = эффект.',
    examples: ['reply', 'awareness:<trigger>', 'user turn'],
  },
  {
    id: 't_miniapp', name: 'Mini App', category: 'screen_interface', icon: 'LayoutDashboard',
    description: 'Экранный интерфейс: Hub, Vault, фокусы, граф. Читает vault-субстрат, показывает состояние.',
    examples: ['Hub', 'Vault', 'focuses / граф'],
  },
  {
    id: 't_push', name: 'Пуши / проактив', category: 'conversational', icon: 'Bell',
    description: 'Проактивная поверхность: утренний бриф, сигналы, deferred-reply. Тот же эффект-гейт, что и реактивный ответ.',
    examples: ['morning brief', 'signal', 'deferred reply'],
  },
  {
    id: 't_voice', name: 'Голос', category: 'voice_audio', icon: 'Mic',
    description: 'Голосовой ввод — тот же write, что и текст (транскрипт → conversation).',
    examples: ['voice message'],
  },
  {
    id: 't_connectors', name: 'Коннекторы (MCP/Whoop)', category: 'technical', icon: 'Plug',
    description: 'Технические поверхности внешних фидов: MCP-vault, Whoop, календарь. 16 коннекторов, per-user 15-мин pull.',
    examples: ['MCP vault sync', 'Whoop recovery', 'calendar read'],
  },
];
