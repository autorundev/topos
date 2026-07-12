
import { TouchpointDefinition } from '../types';

// Touchpoints — интерфейсы, через которые эффект уходит наружу (Atlas: «systems made tangible»).
// Эффект пишет в vault И surfaces через touchpoint. Все связаны из eff_respond.
export const TOUCHPOINTS: TouchpointDefinition[] = [
  {
    id: 't_tg', name: 'Telegram', category: 'conversational', icon: 'MessageCircle',
    description: 'Основной интерфейс: реплики, awareness-сообщения, голос. Сюда уходит ответ ума.',
    examples: ['reply', 'awareness:<trigger>', 'voice'],
  },
  {
    id: 't_miniapp', name: 'Mini App', category: 'screen_interface', icon: 'LayoutDashboard',
    description: 'Экранный интерфейс: Hub, Vault, фокусы, граф. Рендерит состояние наружу.',
    examples: ['Hub', 'Vault', 'граф / focuses'],
  },
  {
    id: 't_web', name: 'Сайт', category: 'screen_interface', icon: 'Globe',
    description: 'Веб-поверхность (vectoros.ai / autorun.dev): лендинг, doc-зоны, аналитика.',
    examples: ['лендинг', 'p/ doc-зоны', 'analytics board'],
  },
  {
    id: 't_push', name: 'Пуши', category: 'conversational', icon: 'Bell',
    description: 'Проактивные уведомления: утренний бриф, сигналы, deferred-reply — тот же эффект-гейт.',
    examples: ['morning brief', 'signal', 'deferred reply'],
  },
];
