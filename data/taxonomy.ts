// Detail hierarchy (drill-down) data — transcribed from
// /home/anton/autorun.dev/p/proactive/internals.html (the `Z` object), extracted
// 2026-07-08, statuses actualized 2026-07-10. See
// docs/superpowers/specs/2026-07-12-detail-hierarchy-design.md for the model.
//
// Keyed by Topos L1 class id (a real task id in data/{system,ai,human}_tasks.ts).
// `common_variants` on the class-level tasks is left untouched (fallback for
// classes without a TAXONOMY entry).
//
// nature omitted on a node = inherits the parent CLASS's nature (see
// data/{system,ai}_tasks.ts) — set explicitly only where a node's nature
// diverges from its class (e.g. proc_nightly is nature="model" but
// eval:sampler / eval:aggregate are deterministic code).
//
// status omitted = 'live'. Mapped from internals' XED (dead) / YEL (todo) /
// DARK (soak) Sets, and colorKey==='dim' (dead/retired).

import { TaxoNode } from '../types';

export const TAXONOMY: Record<string, TaxoNode[]> = {
  // ═══════════════════════════ 02 · Детекторы (41) ═══════════════════════════
  det_detectors: [
    {
      id: 'fam_drift', name: 'drift', kind: 'family',
      children: [
        { id: 'det_sustained_drift', name: 'sustained_drift', kind: 'instance', note: 'drift · SMA_align<0.5' },
        { id: 'det_direction_drift', name: 'direction_drift', kind: 'instance', note: 'drift · по направлению' },
        { id: 'det_locus_blur', name: 'locus_blur', kind: 'instance', note: 'drift · размытие' },
        { id: 'det_fade', name: 'fade', kind: 'instance', note: 'drift · фокус замолк' },
        { id: 'det_blind_spot', name: 'blind_spot', kind: 'instance', note: 'drift · негатив-сфера' },
        { id: 'det_spread_between', name: 'spread_between', kind: 'instance', note: 'drift · >5 фокусов' },
        { id: 'det_density_drop', name: 'density_drop', kind: 'instance', note: 'drift · падение плотности' },
        { id: 'det_tunneling_kinematic', name: 'tunneling_kinematic', kind: 'instance', note: 'drift · кинемат. выход' },
        { id: 'det_tunneling_timeout', name: 'tunneling_timeout', kind: 'instance', note: 'drift · 72ч · timely' },
        { id: 'det_bridge_to_core', name: 'bridge_to_core', kind: 'instance', note: 'drift · мост к цели' },
        { id: 'det_win_fixation', name: 'win_fixation', kind: 'instance', note: 'drift · фиксация побед' },
        // verified: src/awareness/detectors/_frame_hypothesis.py — no anthropic/model call, pure code
        { id: 'det_frame_hypothesis', name: 'frame_hypothesis', kind: 'instance', note: 'drift · рамка · timely' },
        // verified: src/awareness/detectors/_multisignal_divergence.py — reads persisted context blob, pure code
        { id: 'det_multisignal_divergence', name: 'multisignal_divergence', kind: 'instance', note: 'drift · субъект↔объект · timely' },
        { id: 'det_substrate_change', name: 'substrate_change', kind: 'instance', note: 'drift · сдвиг батареи' },
        // verified: src/awareness/detectors/_emergent_sphere.py — calls detect_emergent_sphere_clusters (pure code helper), no LLM
        { id: 'det_emergent_sphere', name: 'emergent_sphere', kind: 'instance', note: 'drift · всплывший кластер' },
        { id: 'det_reflection_proposal', name: 'reflection_proposal', kind: 'instance', note: 'drift · дайджест рефлексий' },
        { id: 'det_projection_realised', name: 'projection_realised', kind: 'instance', note: 'drift · writer есть с V4-G17 (handlers realise)' },
      ],
    },
    {
      id: 'fam_safety', name: 'safety', kind: 'family',
      children: [
        { id: 'det_substrate_acute', name: 'substrate_acute', kind: 'instance', note: 'SAFETY · острое истощение · единственный' },
      ],
    },
    {
      id: 'fam_onboarding', name: 'onboarding', kind: 'family',
      children: [
        { id: 'det_setup_step_pending', name: 'setup_step_pending', kind: 'instance', note: 'onboarding · шаг сетапа' },
        { id: 'det_connector_suggestion_ready', name: 'connector_suggestion_ready', kind: 'instance', note: 'onboarding · подключение' },
      ],
    },
    {
      id: 'fam_lifecycle', name: 'lifecycle', kind: 'family',
      children: [
        { id: 'det_pilot_silence_break', name: 'pilot_silence_break', kind: 'instance', note: 'lifecycle · пилот · timely' },
        { id: 'det_silence_break_checkin', name: 'silence_break_checkin', kind: 'instance', note: 'lifecycle · 14д · dormant-pierce' },
      ],
    },
    {
      id: 'fam_engagement', name: 'engagement', kind: 'family',
      children: [
        { id: 'det_focus_silent', name: 'focus_silent', kind: 'instance', note: 'engagement · фокус затих' },
        { id: 'det_focus_divergence_now', name: 'focus_divergence_now', kind: 'instance', note: 'engagement · сдвиг сейчас · timely' },
        { id: 'det_enrichment_opportunity', name: 'enrichment_opportunity', kind: 'instance', note: 'engagement · обогатить' },
        { id: 'det_feature_hint_ready', name: 'feature_hint_ready', kind: 'instance', note: 'engagement · подсказка' },
        { id: 'det_battery_check_in_ready', name: 'battery_check_in_ready', kind: 'instance', note: 'engagement · чек-ин' },
        { id: 'det_content_nudge', name: 'content_nudge', kind: 'instance', note: 'engagement · контент' },
        // internals DARK set → soak
        { id: 'det_secretary_proposals_pending', name: 'secretary_proposals_pending', kind: 'instance', status: 'soak', note: 'engagement · секретарь одобрить' },
        { id: 'det_secretary_clarify_pending', name: 'secretary_clarify_pending', kind: 'instance', note: 'engagement · секретарь уточнить' },
        { id: 'det_connector_signal_surfaced', name: 'connector_signal_surfaced', kind: 'instance', note: 'engagement · сигнал #63 · timely' },
        { id: 'det_partner_offer_ready', name: 'partner_offer_ready', kind: 'instance', note: 'engagement · реферал' },
      ],
    },
    {
      id: 'fam_reflective', name: 'reflective', kind: 'family',
      children: [
        { id: 'det_identity_review', name: 'identity_review', kind: 'instance', note: 'reflective · established · идентичность' },
        // verified: src/awareness/detectors/_bottom_up_insights_ready.py — reads vault.get_context blob, pure code
        { id: 'det_bottom_up_insights_ready', name: 'bottom_up_insights_ready', kind: 'instance', note: 'reflective · dream bottom-up' },
        { id: 'det_tunneling_exit_report', name: 'tunneling_exit_report', kind: 'instance', note: 'reflective · после туннеля' },
        { id: 'det_curation_proposals_pending', name: 'curation_proposals_pending', kind: 'instance', note: 'reflective · dedup/retire' },
        // verified: src/awareness/detectors/_emergent_direction.py — reads persisted state dict, pure code
        { id: 'det_emergent_direction', name: 'emergent_direction', kind: 'instance', note: 'reflective · направление' },
        { id: 'det_focus_formulation_review', name: 'focus_formulation_review', kind: 'instance', note: 'reflective · формулировка' },
        { id: 'det_trajectory_proposal_ready', name: 'trajectory_proposal_ready', kind: 'instance', note: 'reflective · траектория' },
        { id: 'det_celebration_event', name: 'celebration_event', kind: 'instance', note: 'reflective · признание · timely' },
      ],
    },
    {
      id: 'fam_care', name: 'care', kind: 'family',
      children: [
        { id: 'det_recovery_due', name: 'recovery_due', kind: 'instance', note: 'CARE · признать-и-восстановить · timely' },
      ],
    },
  ],

  // ═══════════════════════════ 05 · Инструменты (78) ═══════════════════════════
  tool_retrieve: [
    {
      id: 'fam_always_on', name: 'always-on', kind: 'family',
      children: [
        { id: 'tool_create_item', name: 'create_item', kind: 'instance', note: 'always-on · захват' },
        { id: 'tool_list_items', name: 'list_items', kind: 'instance', note: 'always-on' },
        { id: 'tool_update_item', name: 'update_item', kind: 'instance', note: 'always-on · правка' },
        { id: 'tool_search_items', name: 'search_items', kind: 'instance', note: 'always-on · FTS/vector' },
        { id: 'tool_create_focus', name: 'create_focus', kind: 'instance', note: 'always-on' },
        { id: 'tool_update_focus', name: 'update_focus', kind: 'instance', note: 'always-on' },
        { id: 'tool_list_focuses', name: 'list_focuses', kind: 'instance', note: 'always-on' },
        { id: 'tool_get_context', name: 'get_context', kind: 'instance', note: 'always-on · контекст-файл' },
        { id: 'tool_update_identity', name: 'update_identity', kind: 'instance', note: 'always-on · факты' },
        { id: 'tool_calculate_date', name: 'calculate_date', kind: 'instance', note: 'always-on · даты' },
      ],
    },
    {
      id: 'fam_trajectory', name: 'trajectory', kind: 'family',
      children: [
        { id: 'tool_record_locus', name: 'record_locus', kind: 'instance', note: 'trajectory · локус past' },
        { id: 'tool_set_trajectory_phase', name: 'set_trajectory_phase', kind: 'instance', note: 'trajectory · dormant↔past' },
        { id: 'tool_add_dormant_entries', name: 'add_dormant_entries', kind: 'instance', note: 'trajectory · bulk LexoRank' },
        { id: 'tool_delete_dormant_entries', name: 'delete_dormant_entries', kind: 'instance', note: 'trajectory' },
        { id: 'tool_resolve_skipped_dormants', name: 'resolve_skipped_dormants', kind: 'instance', note: 'trajectory · batch' },
        { id: 'tool_search_locus_history', name: 'search_locus_history', kind: 'instance', note: 'trajectory' },
        { id: 'tool_rewire_locus_record', name: 'rewire_locus_record', kind: 'instance', note: 'trajectory · пере-адресовать' },
      ],
    },
    {
      id: 'fam_graph', name: 'graph', kind: 'family',
      children: [
        { id: 'tool_graph_neighbors', name: 'graph_neighbors', kind: 'instance', note: 'graph · обход рёбер · флот с 06-12' },
        { id: 'tool_link_entities', name: 'link_entities', kind: 'instance', note: 'граф-запись · SHIPPED W0 07-08 · confirm-gated' },
      ],
    },
    {
      id: 'fam_recall', name: 'recall', kind: 'family',
      children: [
        // search_memories: no literal 'recall' tag in internals note, grouped here on semantic
        // proximity (memory retrieval) — judgment call, see report.
        { id: 'tool_search_memories', name: 'search_memories', kind: 'instance', note: 'unified W2 · deferred + BM25 · память по запросу' },
        { id: 'tool_get_retrospective', name: 'get_retrospective', kind: 'instance', note: 'recall #107' },
        { id: 'tool_get_fading', name: 'get_fading', kind: 'instance', note: 'recall #107' },
        { id: 'tool_search_conversation', name: 'search_conversation', kind: 'instance', note: 'recall · архив' },
        { id: 'tool_search_history', name: 'search_history', kind: 'instance', note: 'recall' },
        { id: 'tool_get_daily_summary', name: 'get_daily_summary', kind: 'instance', note: 'recall' },
      ],
    },
    {
      id: 'fam_support', name: 'support', kind: 'family',
      children: [
        { id: 'tool_create_ticket', name: 'create_ticket', kind: 'instance', note: 'support' },
        { id: 'tool_search_kb', name: 'search_kb', kind: 'instance', note: 'support · вектор (async)' },
        { id: 'tool_resolve_ticket', name: 'resolve_ticket', kind: 'instance', note: 'support' },
        { id: 'tool_escalate_to_owner', name: 'escalate_to_owner', kind: 'instance', note: 'support (async)' },
        { id: 'tool_create_kb_article', name: 'create_kb_article', kind: 'instance', note: 'support · owner-only' },
      ],
    },
    {
      id: 'fam_connectors', name: 'connectors', kind: 'family',
      children: [
        { id: 'tool_use_connector', name: 'use_connector', kind: 'instance', note: 'connectors (async)' },
        { id: 'tool_list_connectors', name: 'list_connectors', kind: 'instance', note: 'connectors' },
      ],
    },
    {
      id: 'fam_biometric', name: 'biometric', kind: 'family',
      children: [
        { id: 'tool_get_biometrics', name: 'get_biometrics', kind: 'instance', note: 'biometric · flag+soak' },
        { id: 'tool_delete_wearable_data', name: 'delete_wearable_data', kind: 'instance', note: 'biometric · owner-only' },
      ],
    },
    {
      id: 'fam_trash', name: 'trash', kind: 'family',
      children: [
        { id: 'tool_delete_item', name: 'delete_item', kind: 'instance', note: 'trash V5-G6 · soft-delete' },
        { id: 'tool_delete_focus', name: 'delete_focus', kind: 'instance', note: 'trash · soft-delete' },
        { id: 'tool_list_trash', name: 'list_trash', kind: 'instance', note: 'trash' },
        { id: 'tool_restore_trash', name: 'restore_trash', kind: 'instance', note: 'trash' },
      ],
    },
    {
      id: 'fam_tunneling', name: 'tunneling', kind: 'family',
      children: [
        { id: 'tool_enter_tunneling', name: 'enter_tunneling', kind: 'instance', note: 'tunneling' },
        { id: 'tool_exit_tunneling', name: 'exit_tunneling', kind: 'instance', note: 'tunneling' },
      ],
    },
    {
      id: 'fam_structure', name: 'structure', kind: 'family',
      children: [
        { id: 'tool_create_direction', name: 'create_direction', kind: 'instance', note: 'структура' },
        { id: 'tool_update_direction', name: 'update_direction', kind: 'instance', note: 'структура' },
        { id: 'tool_list_directions', name: 'list_directions', kind: 'instance', note: 'структура' },
        // close_direction / delete_sphere / close_focus: notes say 'reversible'/'archive'/'закрытие ·
        // reversible' rather than literally 'структура' — grouped here on semantic proximity
        // (entity lifecycle management, same source-list cluster) — judgment call, see report.
        { id: 'tool_close_direction', name: 'close_direction', kind: 'instance', note: 'reversible' },
        { id: 'tool_reopen_direction', name: 'reopen_direction', kind: 'instance', note: 'структура' },
        { id: 'tool_create_sphere', name: 'create_sphere', kind: 'instance', note: 'структура' },
        { id: 'tool_list_spheres', name: 'list_spheres', kind: 'instance', note: 'структура' },
        { id: 'tool_delete_sphere', name: 'delete_sphere', kind: 'instance', note: 'archive' },
        { id: 'tool_reopen_sphere', name: 'reopen_sphere', kind: 'instance', note: 'структура' },
        { id: 'tool_close_focus', name: 'close_focus', kind: 'instance', note: 'закрытие · reversible' },
        { id: 'tool_reopen_focus', name: 'reopen_focus', kind: 'instance', note: 'структура' },
      ],
    },
    {
      id: 'fam_read', name: 'read', kind: 'family',
      children: [
        { id: 'tool_get_focus_details', name: 'get_focus_details', kind: 'instance', note: 'чтение' },
        { id: 'tool_get_focus_progress', name: 'get_focus_progress', kind: 'instance', note: 'чтение' },
        { id: 'tool_get_item', name: 'get_item', kind: 'instance', note: 'чтение' },
        { id: 'tool_list_observations', name: 'list_observations', kind: 'instance', note: 'чтение' },
      ],
    },
    {
      id: 'fam_meta', name: 'meta', kind: 'family',
      children: [
        // crystallize_sphere / confirm_reflection: notes carry a version tag ('V4-G25'/'V4-G6')
        // rather than 'мета' — folded into the meta catch-all (no cleaner fit) — judgment call.
        { id: 'tool_crystallize_sphere', name: 'crystallize_sphere', kind: 'instance', note: 'V4-G25' },
        { id: 'tool_confirm_reflection', name: 'confirm_reflection', kind: 'instance', note: 'V4-G6' },
        { id: 'tool_update_context', name: 'update_context', kind: 'instance', note: 'мета' },
        { id: 'tool_get_context_summary', name: 'get_context_summary', kind: 'instance', note: 'мета' },
        { id: 'tool_get_profile', name: 'get_profile', kind: 'instance', note: 'анализ' },
        { id: 'tool_get_drift', name: 'get_drift', kind: 'instance', note: 'анализ' },
        { id: 'tool_get_usage', name: 'get_usage', kind: 'instance', note: 'стоимость' },
        { id: 'tool_update_schedule', name: 'update_schedule', kind: 'instance', note: 'проактив-префы' },
        { id: 'tool_search_knowledge', name: 'search_knowledge', kind: 'instance', note: 'мета' },
        { id: 'tool_set_feeling', name: 'set_feeling', kind: 'instance', note: 'enrichment' },
        { id: 'tool_mark_unproductive', name: 'mark_unproductive', kind: 'instance', note: 'patience-fold' },
        { id: 'tool_create_feedback', name: 'create_feedback', kind: 'instance', note: 'мета' },
        { id: 'tool_send_choices', name: 'send_choices', kind: 'instance', note: 'inline-кнопки' },
        { id: 'tool_calculate', name: 'calculate', kind: 'instance', note: 'арифметика' },
      ],
    },
    {
      id: 'fam_silence', name: 'silence', kind: 'family',
      children: [
        { id: 'tool_set_silence_declaration', name: 'set_silence_declaration', kind: 'instance', note: 'силенс V4-G26' },
        { id: 'tool_list_silence_declarations', name: 'list_silence_declarations', kind: 'instance', note: 'силенс' },
        { id: 'tool_clear_silence_declaration', name: 'clear_silence_declaration', kind: 'instance', note: 'силенс' },
      ],
    },
    {
      id: 'fam_resources', name: 'resources', kind: 'family',
      children: [
        { id: 'tool_bind_resource_to_focus', name: 'bind_resource_to_focus', kind: 'instance', note: 'ресурсы V4-G35' },
        { id: 'tool_unbind_resource', name: 'unbind_resource', kind: 'instance', note: 'ресурсы' },
        { id: 'tool_list_focus_resources', name: 'list_focus_resources', kind: 'instance', note: 'ресурсы' },
      ],
    },
    {
      id: 'fam_files', name: 'files', kind: 'family',
      children: [
        { id: 'tool_link_attachment', name: 'link_attachment', kind: 'instance', note: 'файлы' },
        { id: 'tool_list_attachments', name: 'list_attachments', kind: 'instance', note: 'файлы' },
      ],
    },
    {
      id: 'fam_secretary', name: 'secretary', kind: 'family',
      children: [
        { id: 'tool_apply_clarify_proposal', name: 'apply_clarify_proposal', kind: 'instance', note: 'секретарь #67' },
      ],
    },
  ],

  // ═══════════════════════════ 07 Vault (~65) + 08 admin (29) ═══════════════════════════
  store_vault: [
    {
      id: 'fam_core', name: 'core', kind: 'family',
      children: [
        { id: 'vault_items', name: 'items', kind: 'instance', note: 'core · unified content' },
        { id: 'vault_items_type', name: 'items.type', kind: 'instance', note: 'note/decision/event/reminder/contact/observation' },
        { id: 'vault_focuses', name: 'focuses', kind: 'instance', note: 'core · фокусы' },
        { id: 'vault_directions', name: 'directions', kind: 'instance', note: 'core · направления' },
        { id: 'vault_direction_history', name: 'direction_history', kind: 'instance', note: 'core' },
        { id: 'vault_spheres', name: 'spheres', kind: 'instance', note: 'core · сферы' },
        { id: 'vault_focus_origins', name: 'focus_origins', kind: 'instance', note: 'core · изнач. цель' },
      ],
    },
    {
      id: 'fam_retired', name: 'RETIRED', kind: 'family',
      children: [
        { id: 'vault_notes', name: 'notes*', kind: 'instance', status: 'dead', note: 'RETIRED v27' },
        { id: 'vault_tasks', name: 'tasks*', kind: 'instance', status: 'dead', note: 'RETIRED v27' },
        { id: 'vault_decisions', name: 'decisions*', kind: 'instance', status: 'dead', note: 'RETIRED v27' },
        { id: 'vault_reminders', name: 'reminders*', kind: 'instance', status: 'dead', note: 'RETIRED v27' },
        { id: 'vault_events', name: 'events*', kind: 'instance', status: 'dead', note: 'RETIRED v27' },
        { id: 'vault_observations', name: 'observations*', kind: 'instance', status: 'dead', note: 'RETIRED v27' },
        { id: 'vault_contacts', name: 'contacts*', kind: 'instance', status: 'dead', note: 'RETIRED v27' },
      ],
    },
    {
      id: 'fam_graph', name: 'граф', kind: 'family',
      children: [
        { id: 'vault_links', name: 'links', kind: 'instance', note: 'ГРАФ · рёбра · пишет link_entities (W0) · охват #181 открыт' },
      ],
    },
    {
      id: 'fam_trajectory', name: 'траектория', kind: 'family',
      children: [
        { id: 'vault_trajectory_entries', name: 'trajectory_entries', kind: 'instance', note: 'траектория · dormant/past' },
        { id: 'vault_trajectory_entries_fts', name: 'trajectory_entries_fts', kind: 'instance', note: 'FTS5 mirror' },
        { id: 'vault_reflections', name: 'reflections', kind: 'instance', note: 'рефлексии ±1' },
        { id: 'vault_confidence_log', name: 'confidence_log', kind: 'instance', note: 'аудит · 90д' },
      ],
    },
    {
      id: 'fam_memory', name: 'память', kind: 'family',
      children: [
        { id: 'vault_memories', name: 'memories', kind: 'instance', note: 'память · семантика' },
        { id: 'vault_episodes', name: 'episodes', kind: 'instance', note: 'эпизоды' },
        { id: 'vault_conversation', name: 'conversation', kind: 'instance', note: 'лог сообщений' },
        { id: 'vault_conversation_log', name: 'conversation_log', kind: 'instance', note: 'саммари' },
        { id: 'vault_conversation_summary', name: 'conversation_summary', kind: 'instance', note: 'Zone-B' },
        { id: 'vault_message_archive', name: 'message_archive', kind: 'instance', note: 'архив >200' },
        { id: 'vault_identity_facts', name: 'identity_facts', kind: 'instance', note: 'идентичность' },
        { id: 'vault_principles', name: 'principles', kind: 'instance', status: 'dead', note: 'legacy rollback' },
        { id: 'vault_user_profile', name: 'user_profile', kind: 'instance', note: '11 измерений' },
        { id: 'vault_extraction_state', name: 'extraction_state', kind: 'instance', note: 'watermark' },
        { id: 'vault_candidate_pool', name: 'candidate_pool', kind: 'instance', note: 'кандидаты' },
        { id: 'vault_weight_log', name: 'weight_log', kind: 'instance', note: 'decay' },
      ],
    },
    {
      id: 'fam_awareness', name: 'awareness', kind: 'family',
      children: [
        { id: 'vault_detector_log', name: 'detector_log', kind: 'instance', note: 'awareness · v48' },
        { id: 'vault_event_subscriptions', name: 'event_subscriptions', kind: 'instance', note: 'awareness · шина' },
        { id: 'vault_awareness_log', name: 'awareness_log', kind: 'instance', note: 'awareness · v59' },
        { id: 'vault_relationship_register_log', name: 'relationship_register_log', kind: 'instance', note: 'awareness · v60' },
        { id: 'vault_satisfaction_ratings', name: 'satisfaction_ratings', kind: 'instance', note: 'awareness · usefulness' },
      ],
    },
    {
      id: 'fam_dream', name: 'dream', kind: 'family',
      children: [
        { id: 'vault_memories_dream_proposal', name: 'memories_dream_proposal', kind: 'instance', note: 'dream · proposals' },
        { id: 'vault_dream_sessions', name: 'dream_sessions', kind: 'instance', note: 'dream · аудит' },
        { id: 'vault_dream_session_events', name: 'dream_session_events', kind: 'instance', note: 'dream · события' },
        { id: 'vault_items_dream_proposal', name: 'items_dream_proposal', kind: 'instance', note: 'dream · curation' },
      ],
    },
    {
      id: 'fam_secretary', name: 'секретарь', kind: 'family',
      children: [
        { id: 'vault_secretary_raw_buffer', name: 'secretary_raw_buffer', kind: 'instance', note: 'секретарь · 48ч' },
        // internals DARK set → soak
        { id: 'vault_secretary_proposals', name: 'secretary_proposals', kind: 'instance', status: 'soak', note: 'секретарь · proposals' },
        { id: 'vault_secretary_applied_log', name: 'secretary_applied_log', kind: 'instance', status: 'soak', note: 'секретарь · v57 dark' },
        { id: 'vault_secretary_chat_identity', name: 'secretary_chat_identity', kind: 'instance', note: 'секретарь · v61' },
      ],
    },
    {
      id: 'fam_connector', name: 'коннектор', kind: 'family',
      children: [
        { id: 'vault_connectors', name: 'connectors', kind: 'instance', note: 'коннектор · триггеры' },
        { id: 'vault_connected_services', name: 'connected_services', kind: 'instance', note: 'коннектор · OAuth' },
        { id: 'vault_connector_signals', name: 'connector_signals', kind: 'instance', note: 'коннектор · сигналы' },
        { id: 'vault_connector_mappings', name: 'connector_mappings', kind: 'instance', note: 'коннектор' },
        { id: 'vault_connector_health', name: 'connector_health', kind: 'instance', note: 'коннектор · breaker' },
        { id: 'vault_connector_sync_runs', name: 'connector_sync_runs', kind: 'instance', note: 'коннектор · синк' },
        { id: 'vault_connector_resources', name: 'connector_resources', kind: 'instance', note: 'коннектор · кэш' },
        { id: 'vault_mcp_connectors', name: 'mcp_connectors', kind: 'instance', note: 'MCP регистрации' },
        { id: 'vault_mcp_tool_calls', name: 'mcp_tool_calls', kind: 'instance', note: 'MCP аудит' },
      ],
    },
    {
      id: 'fam_meta', name: 'мета', kind: 'family',
      children: [
        { id: 'vault_context', name: 'context', kind: 'instance', note: 'мета · kv' },
        { id: 'vault_activity_log', name: 'activity_log', kind: 'instance', note: 'мета · действия' },
        { id: 'vault_reviews', name: 'reviews', kind: 'instance', note: 'мета · ревью' },
        { id: 'vault_eval_scores', name: 'eval_scores', kind: 'instance', note: 'мета · оценки' },
        { id: 'vault_tunneling_sessions', name: 'tunneling_sessions', kind: 'instance', note: 'мета · туннель' },
        { id: 'vault_id_translations', name: 'id_translations', kind: 'instance', note: 'мета · 30д' },
        { id: 'vault_heartbeats', name: 'heartbeats', kind: 'instance', status: 'dead', note: 'мета · не читается' },
        { id: 'vault_heartbeat_log', name: 'heartbeat_log', kind: 'instance', note: 'мета' },
        { id: 'vault_heartbeat_queue', name: 'heartbeat_queue', kind: 'instance', status: 'dead', note: 'мета · legacy' },
        { id: 'vault_enrichment_log', name: 'enrichment_log', kind: 'instance', note: 'мета' },
        { id: 'vault_feeling_history', name: 'feeling_history', kind: 'instance', note: 'мета · эмоции' },
        { id: 'vault_attachments', name: 'attachments', kind: 'instance', note: 'мета · файлы' },
        { id: 'vault_knowledge', name: 'knowledge', kind: 'instance', note: 'мета · vm_* чанки' },
        { id: 'vault_tool_errors', name: 'tool_errors', kind: 'instance', note: 'мета · self-correct' },
        { id: 'vault_tool_usage', name: 'tool_usage', kind: 'instance', note: 'мета · латентность' },
      ],
    },
    {
      id: 'fam_admin', name: 'admin.db (29)', kind: 'family',
      children: [
        { id: 'admin_users', name: 'users', kind: 'instance', note: 'реестр · статус · owner' },
        { id: 'admin_subscriptions', name: 'subscriptions', kind: 'instance', note: 'статус · grace · ban' },
        { id: 'admin_usage_log', name: 'usage_log', kind: 'instance', note: 'спенд токенов (спина)' },
        { id: 'admin_payments', name: 'payments', kind: 'instance', note: 'TON/USDT · idempotency' },
        { id: 'admin_yookassa_payments', name: 'yookassa_payments', kind: 'instance', note: 'ЮKassa intent v11' },
        { id: 'admin_promo_codes', name: 'promo_codes', kind: 'instance', note: 'промо pricing-v2' },
        { id: 'admin_invite_codes', name: 'invite_codes', kind: 'instance', note: 'инвайт-коды' },
        { id: 'admin_applications', name: 'applications', kind: 'instance', note: 'заявки' },
        { id: 'admin_subscription_settings', name: 'subscription_settings', kind: 'instance', note: 'EA/цена/rate' },
        { id: 'admin_price_versions', name: 'price_versions', kind: 'instance', note: 'история цен' },
        { id: 'admin_partners', name: 'partners', kind: 'instance', note: 'реферал-партнёры' },
        { id: 'admin_referral_rewards', name: 'referral_rewards', kind: 'instance', note: '$-revshare' },
        { id: 'admin_referral_day_grants', name: 'referral_day_grants', kind: 'instance', note: '+14д' },
        { id: 'admin_referral_invites', name: 'referral_invites', kind: 'instance', note: 'слоты' },
        { id: 'admin_broadcast_log', name: 'broadcast_log', kind: 'instance', note: 'рассылки' },
        { id: 'admin_support_articles', name: 'support_articles', kind: 'instance', note: 'KB + embedding' },
        { id: 'admin_support_tickets', name: 'support_tickets', kind: 'instance', note: 'тикеты' },
        { id: 'admin_agent_corrections', name: 'agent_corrections', kind: 'instance', note: 'self-reflection хинты' },
        { id: 'admin_agent_correction_runs', name: 'agent_correction_runs', kind: 'instance', note: 'аудит пайплайна' },
        { id: 'admin_subagent_calls', name: 'subagent_calls', kind: 'instance', note: 'трейс субагентов' },
        { id: 'admin_business_connections', name: 'business_connections', kind: 'instance', note: 'секретарь · Business v10' },
        { id: 'admin_pilot_lifecycle_events', name: 'pilot_lifecycle_events', kind: 'instance', note: 'пилот idempotency' },
        { id: 'admin_site_visits', name: 'site_visits', kind: 'instance', note: 'beacon vectoros.ai' },
        { id: 'admin_companion_tokens', name: 'companion_tokens', kind: 'instance', note: 'macOS companion' },
        { id: 'admin_claude_p_log', name: 'claude_p_log', kind: 'instance', note: 'claude -p телеметрия' },
        { id: 'admin_importance_weights', name: 'importance_weights', kind: 'instance', note: 'dream-веса' },
        { id: 'admin_activity_log', name: 'activity_log', kind: 'instance', note: 'cross-user transparency (admin.db)' },
        { id: 'admin_context', name: 'context', kind: 'instance', note: 'cross-cron флаги (admin.db)' },
        { id: 'admin_feedback', name: 'feedback', kind: 'instance', note: 'фидбэк' },
      ],
    },
  ],

  // ═══════════════════════════ 09 · Кроны (46 активных) ═══════════════════════════
  // Flat (per instructions — grouping by cadence hint was not required for v1).
  trig_cron: [
    { id: 'cron_v5g1_anchor_dispatch', name: 'v5g1_anchor_dispatch', kind: 'instance', note: '15min · anchor-моменты → единый ход' },
    { id: 'cron_v5g1_safety_wakeup', name: 'v5g1_safety_wakeup', kind: 'instance', note: '5min · safety-пробуждение · pierce' },
    { id: 'cron_v5g1_silence_break', name: 'v5g1_silence_break', kind: 'instance', note: '10:00 · тишина 14д → единый ход' },
    { id: 'cron_v5g1_connector_sync', name: 'v5g1_connector_sync', kind: 'instance', note: '15min · синк коннекторов' },
    { id: 'cron_v5g1_deferred_reply', name: 'v5g1_deferred_reply', kind: 'instance', note: '1min · legacy drain (§20-F, остаётся)' },
    { id: 'cron_v5g1_reminder_dispatch', name: 'v5g1_reminder_dispatch', kind: 'instance', note: '15min · напоминания' },
    { id: 'cron_v5g1_reflections', name: 'v5g1_reflections', kind: 'instance', note: '15min · рефлексии ±1' },
    { id: 'cron_v5g1_locus_embeddings', name: 'v5g1_locus_embeddings', kind: 'instance', note: '15min · эмбеддинги локуса' },
    { id: 'cron_v5g1_memory_extraction', name: 'v5g1_memory_extraction', kind: 'instance', note: '10min · извлечение памяти' },
    { id: 'cron_v5g1_multisignal_recompute', name: 'v5g1_multisignal_recompute', kind: 'instance', note: '15min · мультисигнал' },
    { id: 'cron_v5g1_tunneling_poll', name: 'v5g1_tunneling_poll', kind: 'instance', note: '15min · туннель-полл' },
    { id: 'cron_v5g1_degradation_checkpoint', name: 'v5g1_degradation_checkpoint', kind: 'instance', note: '03:30 · чекпойнт деградации' },
    // internals XED set (+ colorKey dim) → dead; "закомментирован — не активен"
    { id: 'cron_notion_meeting_sync', name: 'notion_meeting_sync', kind: 'instance', status: 'dead', note: 'закомментирован — не активен' },
    { id: 'cron_dream_cycle', name: 'dream_cycle', kind: 'instance', note: '03:00 · консолидация' },
    { id: 'cron_dream_hybrid_check', name: 'dream_hybrid_check', kind: 'instance', note: 'hourly · importance' },
    { id: 'cron_dream_apply_pending', name: 'dream_apply_pending', kind: 'instance', note: '04:15 · применить' },
    { id: 'cron_eval_judge_daily', name: 'eval_judge_daily', kind: 'instance', note: '03:30 · после dream' },
    { id: 'cron_eval_thinking_sample_check', name: 'eval_thinking_sample_check', kind: 'instance', note: '12:30 · sample-check' },
    { id: 'cron_monthly_review', name: 'monthly_review', kind: 'instance', note: '1-е 11:00 · strategic' },
    { id: 'cron_v5g1_daily_ritual', name: 'v5g1_daily_ritual', kind: 'instance', note: '15min · утро/вечер' },
    { id: 'cron_v5g1_weekly_ritual', name: 'v5g1_weekly_ritual', kind: 'instance', note: '30min · неделя' },
    { id: 'cron_v5g1_shadow_digest', name: 'v5g1_shadow_digest', kind: 'instance', note: '4ч · owner shadow' },
    { id: 'cron_curation_auto_apply', name: 'curation_auto_apply', kind: 'instance', note: '04:20 · структ. дубли' },
    { id: 'cron_trash_purge', name: 'trash_purge', kind: 'instance', note: '04:10 · purge 30д' },
    { id: 'cron_vault_cleanup', name: 'vault_cleanup', kind: 'instance', note: '04:00 · гигиена' },
    { id: 'cron_confidence_log_prune', name: 'confidence_log_prune', kind: 'instance', note: '04:30 · 90д' },
    { id: 'cron_site_visits_prune', name: 'site_visits_prune', kind: 'instance', note: '04:30' },
    { id: 'cron_expire_pending_reflections', name: 'expire_pending_reflections', kind: 'instance', note: '04:45 · 72ч' },
    { id: 'cron_expire_g35_backfill_proposals', name: 'expire_g35_backfill_proposals', kind: 'instance', note: '04:45' },
    { id: 'cron_expire_self_reflection_proposals', name: 'expire_self_reflection_proposals', kind: 'instance', note: '04:55' },
    { id: 'cron_wearable_sync', name: '_wearable_sync', kind: 'instance', note: '02:15 · Oura/Whoop' },
    { id: 'cron_wearable_morning_repoll', name: '_wearable_morning_repoll', kind: 'instance', note: '15min · re-poll' },
    { id: 'cron_refresh_embedding_centroid', name: 'refresh_embedding_centroid', kind: 'instance', note: 'вс 02:30' },
    { id: 'cron_embedding_reindex', name: 'embedding_reindex', kind: 'instance', note: '+120с старт' },
    { id: 'cron_embedding_reindex_recurring', name: 'embedding_reindex_recurring', kind: 'instance', note: '24ч' },
    { id: 'cron_backup_rotation', name: 'backup_rotation', kind: 'instance', note: '05:00 · 14д' },
    { id: 'cron_subscription_expiry', name: 'subscription_expiry', kind: 'instance', note: 'hourly' },
    { id: 'cron_pilot_lifecycle', name: 'pilot_lifecycle', kind: 'instance', note: 'hourly · нуджи' },
    { id: 'cron_vault_health_audit', name: 'vault_health_audit', kind: 'instance', note: 'вс 12:00' },
    { id: 'cron_connector_decay_audit', name: 'connector_decay_audit', kind: 'instance', note: '09:30 · алерт' },
    { id: 'cron_support_timeout_check', name: 'support_timeout_check', kind: 'instance', note: 'hourly' },
    { id: 'cron_support_monthly_digest', name: 'support_monthly_digest', kind: 'instance', note: '1-е 10:00' },
    { id: 'cron_mcp_health_check', name: 'mcp_health_check', kind: 'instance', note: '10min' },
    { id: 'cron_fx_rate_refresh', name: 'fx_rate_refresh', kind: 'instance', note: '10min · USD/RUB' },
    { id: 'cron_event_briefing_rearm', name: 'event_briefing_rearm', kind: 'instance', note: 'hourly · re-arm' },
    { id: 'cron_event_briefing_startup_rearm', name: 'event_briefing_startup_rearm', kind: 'instance', note: '+5с · re-arm' },
    { id: 'cron_secretary_clarify_rehydrate', name: 'secretary_clarify_rehydrate', kind: 'instance', note: '+7с · секретарь-soak' },
  ],

  // ═══════════════════════════ 01 · Вход — connectors only ═══════════════════════════
  // Excludes сообщение юзера / крон · такт / тишина / ↩ свой эффект / скилл: перцепция
  // (other classes / not-yet-built skill placeholder — see design doc zone→class map).
  trig_connector_sync: [
    {
      id: 'fam_source', name: 'source', kind: 'family',
      children: [
        { id: 'conn_filesystem', name: 'filesystem', kind: 'instance', note: 'файлы/git/доки (system)' },
        { id: 'conn_github', name: 'github', kind: 'instance', note: 'PR · issues · коммиты' },
        { id: 'conn_google', name: 'google', kind: 'instance', note: 'Google Calendar' },
        { id: 'conn_notion', name: 'notion', kind: 'instance', note: 'страницы · базы · поиск' },
        { id: 'conn_linear', name: 'linear', kind: 'instance', note: 'issues · проекты' },
        { id: 'conn_sentry', name: 'sentry', kind: 'instance', note: 'ошибки · релизы' },
        { id: 'conn_stripe', name: 'stripe', kind: 'instance', note: 'платежи · выручка' },
        { id: 'conn_slack', name: 'slack', kind: 'instance', note: 'каналы · сообщения' },
        { id: 'conn_hubspot', name: 'hubspot', kind: 'instance', note: 'CRM · сделки' },
        { id: 'conn_google_search_console', name: 'google_search_console', kind: 'instance', note: 'SEO позиции' },
        { id: 'conn_custom_mcp', name: 'custom_mcp', kind: 'instance', note: 'твой MCP-источник' },
      ],
    },
    {
      id: 'fam_websearch', name: 'websearch', kind: 'family',
      children: [
        { id: 'conn_exa', name: 'exa', kind: 'instance', note: 'AI веб-поиск' },
        { id: 'conn_firecrawl', name: 'firecrawl', kind: 'instance', note: 'скрейпинг сайтов' },
        { id: 'conn_brave_search', name: 'brave_search', kind: 'instance', note: 'веб/новости' },
        { id: 'conn_tavily', name: 'tavily', kind: 'instance', note: 'AI поиск + extract' },
      ],
    },
    {
      id: 'fam_biometric', name: 'biometric', kind: 'family',
      children: [
        { id: 'conn_oura', name: 'oura', kind: 'instance', note: 'recovery/sleep · owner' },
        { id: 'conn_whoop', name: 'whoop', kind: 'instance', note: 'strain/recovery · owner' },
      ],
    },
  ],

  // ═══════════════════════════ 04 · Мозг ═══════════════════════════
  // "ОДИН МОЗГ" banner item skipped per instructions.
  brain_core: [
    {
      id: 'fam_models', name: 'models', kind: 'family',
      children: [
        { id: 'model_reactive', name: 'reactive → claude-sonnet-5', kind: 'instance', note: 'модель · восстановлен 07-08 (#183 закрыт)' },
        { id: 'model_smart', name: 'smart → claude-opus-4-8', kind: 'instance', note: 'модель · субагент-эскалация' },
        { id: 'model_light', name: 'light → claude-haiku-4-5', kind: 'instance', note: 'модель · extraction/summaries' },
      ],
    },
    {
      id: 'fam_personas', name: 'personas', kind: 'family',
      children: [
        { id: 'persona_default', name: 'persona: default', kind: 'instance', note: 'острый лаконичный · answer-first' },
        { id: 'persona_challenger', name: 'persona: challenger', kind: 'instance', note: 'стресс-тест решений' },
        { id: 'persona_analyst', name: 'persona: analyst', kind: 'instance', note: 'структура + калибровка' },
        { id: 'persona_writer', name: 'persona: writer', kind: 'instance', note: 'чистый текст под аудиторию' },
        { id: 'persona_steward', name: 'persona: steward', kind: 'instance', note: 'куратор волта · дедуп' },
        { id: 'persona_support', name: 'persona: support', kind: 'instance', note: 'KB + тикеты' },
        { id: 'persona_tunneling', name: 'persona: tunneling', kind: 'instance', note: 'режим туннеля (force)' },
      ],
    },
  ],

  // ═══════════════════════════ 03 · Машина (gate part) — flat ═══════════════════════════
  gate_admission: [
    { id: 'gate_unified_gates', name: 'unified gates', kind: 'instance', note: 'pierce → quiet → буфер → 3b-свежесть → PRD → lock' },
    { id: 'gate_active_skip', name: 'active_skip', kind: 'instance', note: 'EventBus · идёт разговор→скип' },
    { id: 'gate_dedup', name: 'dedup', kind: 'instance', note: 'EventBus · дедуп по evidence · 6ч' },
    { id: 'gate_tier', name: 'tier', kind: 'instance', note: 'EventBus · порог urgency' },
    { id: 'gate_collect_awareness_state', name: 'collect_awareness_state', kind: 'instance', note: 'сборка состояния из detector_log' },
    { id: 'gate_novelty_pre_gate', name: 'novelty_pre_gate', kind: 'instance', status: 'dead', note: 'W10 снесён 07-10 · данные+6ч-гейты остались' },
    { id: 'gate_run_awareness_pass', name: 'run_awareness_pass', kind: 'instance', status: 'dead', note: 'legacy standalone-пасс · удалён W10 07-10' },
    { id: 'gate_run_ritual_fork', name: '_run_ritual_fork', kind: 'instance', status: 'dead', note: 'legacy форк ритуалов (источник дублей) · удалён W10 07-10' },
    { id: 'gate_block5_awareness', name: 'block5_awareness', kind: 'instance', status: 'dead', note: 'legacy персона-блок · удалён W10 07-10' },
  ],

  // ═══════════════════════════ 03 · Машина (assembly part) — flat ═══════════════════════════
  starter_recipe: [
    { id: 'starter_per_trigger', name: 'starter (per-trigger)', kind: 'instance', note: 'эфемерный · grounded-даты · не персистится' },
    { id: 'starter_block1_static', name: 'block1_static', kind: 'instance', note: 'assembler · идентичность/метод/персоны' },
    { id: 'starter_block2_conditional', name: 'block2_conditional', kind: 'instance', note: 'assembler · сетап/калибровка' },
    { id: 'starter_block3_volatile', name: 'block3_volatile', kind: 'instance', note: 'assembler · скелет/сюрфейсы/слоты' },
    { id: 'starter_weave_deferred', name: 'weave_deferred', kind: 'instance', note: 'weave на сист. ходу → §5d.1 inject реактиву' },
    { id: 'starter_relationship_register', name: 'relationship_register', kind: 'instance', note: 'v60 · re-thread на unified' },
    { id: 'starter_slots_5d_5e_5g', name: '§5d·§5e·§5g слоты', kind: 'instance', status: 'dead', note: 'legacy слоты assembler + _g12 · удалены W10 07-10' },
    { id: 'starter_deferred_reply_drain', name: 'deferred_reply drain', kind: 'instance', note: 'legacy ОСТАЁТСЯ за флагом (§20-F · сеть #111)' },
  ],

  // ═══════════════════════════ 03 · Машина (dream+eval) ═══════════════════════════
  proc_nightly: [
    {
      id: 'fam_dream', name: 'dream', kind: 'family',
      children: [
        { id: 'dream_orient', name: 'dream:orient', kind: 'instance', seq: 0, note: 'dream 03:00' },
        { id: 'dream_gather', name: 'dream:gather', kind: 'instance', seq: 1, note: 'dream' },
        { id: 'dream_consolidate', name: 'dream:consolidate', kind: 'instance', seq: 2, note: 'dream · +thinking' },
        { id: 'dream_prune', name: 'dream:prune', kind: 'instance', seq: 3, note: 'dream' },
        { id: 'dream_identity_review', name: 'dream:identity_review', kind: 'instance', seq: 4, note: 'dream' },
        { id: 'dream_trajectory_review', name: 'dream:trajectory_review', kind: 'instance', seq: 5, note: 'dream' },
        { id: 'dream_bottom_up', name: 'dream:bottom_up', kind: 'instance', seq: 6, note: 'dream' },
        { id: 'dream_formulation_review', name: 'dream:formulation_review', kind: 'instance', seq: 7, note: 'dream' },
        { id: 'dream_secretary', name: 'dream:secretary', kind: 'instance', seq: 8, note: 'dream · извлечение' },
        { id: 'dream_curation', name: 'dream:curation', kind: 'instance', seq: 9, note: 'dream · dedup-proposals' },
        { id: 'dream_meta', name: 'dream:meta', kind: 'instance', seq: 10, note: 'dream' },
      ],
    },
    {
      id: 'fam_eval', name: 'eval', kind: 'family',
      children: [
        { id: 'eval_sampler', name: 'eval:sampler', kind: 'instance', nature: 'code', note: 'eval · сэмплинг' },
        { id: 'eval_judge', name: 'eval:judge', kind: 'instance', note: 'eval · LLM-as-judge' },
        { id: 'eval_aggregate', name: 'eval:aggregate', kind: 'instance', nature: 'code', note: 'eval · недельный' },
      ],
    },
  ],

  // ═══════════════════════════ 06 · Эффект — flat ═══════════════════════════
  eff_respond: [
    { id: 'eff_answer_self', name: 'ОТВЕТ · audience=self', kind: 'instance', note: 'видимая реплика в чате' },
    { id: 'eff_await', name: 'await · {on·deadline}', kind: 'instance', note: 'ждать async-детектор' },
    { id: 'eff_create_update_delete', name: 'create / update / delete', kind: 'instance', note: 'запись эффекта · confirm-gated' },
    { id: 'eff_keyboard_arms', name: 'keyboard-arms', kind: 'instance', note: 'code-derived кнопки' },
  ],
};
