/**
 * Copyright 2025 quietloudlab
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Per-child (real) I/O ports — Topos drill-down Step 2a.
// Extracted (not imported) from ~/vectoros via scripts/extract_taxo_io.py,
// which AST-parses:
//   - src/tools/_schemas.py            (tools: input_schema.properties + best-effort
//                                        "Returns X" output label)
//   - src/awareness/detectors/__init__.py (DETECTOR_SPECS: eval_mode -> input,
//                                        event_class -> output)
// Keyed by the TAXONOMY node id (data/taxonomy.ts), matched by the underlying
// `name` (id is always `tool_<name>` / `det_<name>` in this dataset — verified
// by scripts/check_taxo_io.ts). Tools/detectors present in the live vectoros
// source but not (yet) in the taxonomy snapshot — or vice versa — are simply
// absent here; see scripts/check_taxo_io.ts tallies for the full delta.
//
// ONLY tools (tool_retrieve) + detectors (det_detectors) — stores/crons/
// connectors/admin have no cheap per-child I/O source and stay on the class's
// aggregate ports (Step 2b renders the fallback).

import { TaxoIO } from '../types';

export const TAXO_IO: Record<string, TaxoIO> = {
  // ═══════════════════════════ Детекторы ═══════════════════════════
  det_battery_check_in_ready: { inputs: [{ name: "clock-tick" }], outputs: ["engagement"] },
  det_blind_spot: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_bottom_up_insights_ready: { inputs: [{ name: "state-write" }], outputs: ["reflective"] },
  det_bridge_to_core: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_celebration_event: { inputs: [{ name: "state-write" }], outputs: ["reflective"] },
  det_connector_signal_surfaced: { inputs: [{ name: "state-write" }], outputs: ["engagement"] },
  det_connector_suggestion_ready: { inputs: [{ name: "state-write" }], outputs: ["onboarding"] },
  det_content_nudge: { inputs: [{ name: "state-write" }], outputs: ["engagement"] },
  det_curation_proposals_pending: { inputs: [{ name: "state-write" }], outputs: ["reflective"] },
  det_density_drop: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_direction_drift: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_emergent_direction: { inputs: [{ name: "state-write" }], outputs: ["reflective"] },
  det_emergent_sphere: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_enrichment_opportunity: { inputs: [{ name: "clock-tick" }], outputs: ["engagement"] },
  det_fade: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_feature_hint_ready: { inputs: [{ name: "clock-tick" }], outputs: ["engagement"] },
  det_focus_divergence_now: { inputs: [{ name: "clock-tick" }], outputs: ["engagement"] },
  det_focus_formulation_review: { inputs: [{ name: "state-write" }], outputs: ["reflective"] },
  det_focus_silent: { inputs: [{ name: "clock-tick" }], outputs: ["engagement"] },
  det_frame_hypothesis: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_identity_review: { inputs: [{ name: "state-write" }], outputs: ["reflective"] },
  det_locus_blur: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_multisignal_divergence: { inputs: [{ name: "state-write" }], outputs: ["drift"] },
  det_partner_offer_ready: { inputs: [{ name: "state-write" }], outputs: ["engagement"] },
  det_pilot_silence_break: { inputs: [{ name: "clock-tick" }], outputs: ["lifecycle"] },
  det_recovery_due: { inputs: [{ name: "state-write" }], outputs: ["care"] },
  det_reflection_proposal: { inputs: [{ name: "state-write" }], outputs: ["drift"] },
  det_secretary_clarify_pending: { inputs: [{ name: "state-write" }], outputs: ["engagement"] },
  det_secretary_proposals_pending: { inputs: [{ name: "state-write" }], outputs: ["engagement"] },
  det_setup_step_pending: { inputs: [{ name: "state-write" }], outputs: ["onboarding"] },
  det_silence_break_checkin: { inputs: [{ name: "clock-tick" }], outputs: ["lifecycle"] },
  det_spread_between: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_substrate_acute: { inputs: [{ name: "state-write" }], outputs: ["safety"] },
  det_substrate_change: { inputs: [{ name: "state-write" }], outputs: ["drift"] },
  det_sustained_drift: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_trajectory_proposal_ready: { inputs: [{ name: "state-write" }], outputs: ["reflective"] },
  det_tunneling_exit_report: { inputs: [{ name: "state-write" }], outputs: ["reflective"] },
  det_tunneling_kinematic: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_tunneling_timeout: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },
  det_win_fixation: { inputs: [{ name: "clock-tick" }], outputs: ["drift"] },

  // ═══════════════════════════ Инструменты ═══════════════════════════
  tool_add_dormant_entries: { inputs: [{ name: "focus_id", required: true }, { name: "entries", required: true }] },
  tool_apply_clarify_proposal: { inputs: [{ name: "action", required: true, enumValues: ["apply", "defer", "unrelated", "dismiss"] }, { name: "fields" }] },
  tool_bind_resource_to_focus: { inputs: [{ name: "focus_id", required: true }, { name: "connector", required: true }, { name: "external_id", required: true }, { name: "resource_kind" }, { name: "name" }, { name: "url" }, { name: "force" }] },
  tool_calculate: { inputs: [{ name: "expression", required: true }] },
  tool_calculate_date: { inputs: [{ name: "expression", required: true }] },
  tool_clear_silence_declaration: { inputs: [{ name: "declaration_id", required: true }] },
  tool_close_direction: { inputs: [{ name: "direction_id", required: true }, { name: "kind", required: true, enumValues: ["achieved", "refused"] }] },
  tool_close_focus: { inputs: [{ name: "focus_id", required: true }, { name: "kind", required: true, enumValues: ["achieved", "refused"] }, { name: "confirm" }] },
  tool_confirm_reflection: { inputs: [{ name: "reflection_id", required: true }] },
  tool_create_direction: { inputs: [{ name: "title", required: true }, { name: "destination" }] },
  tool_create_feedback: { inputs: [{ name: "content", required: true }, { name: "type", required: true, enumValues: ["bug", "feature", "general", "complaint"] }, { name: "summary" }], outputs: ["confirmation"] },
  tool_create_focus: { inputs: [{ name: "destination", required: true }, { name: "name" }, { name: "initial_status", enumValues: ["active", "paused"] }, { name: "tags" }, { name: "type", enumValues: ["main", "supported"] }, { name: "sphere_id" }] },
  tool_create_item: { inputs: [{ name: "type", required: true, enumValues: ["note", "contact", "event", "decision", "reminder"] }, { name: "title", required: true }, { name: "content" }, { name: "focus" }, { name: "status" }, { name: "properties" }, { name: "tags" }], outputs: ["created item with ID"] },
  tool_create_kb_article: { inputs: [{ name: "question", required: true }, { name: "answer", required: true }, { name: "topic", enumValues: ["billing", "features", "troubleshooting", "onboarding", "general"] }, { name: "product" }, { name: "status", enumValues: ["published", "draft"] }] },
  tool_create_sphere: { inputs: [{ name: "name", required: true }, { name: "emoji" }, { name: "description" }] },
  tool_create_ticket: { inputs: [{ name: "type", required: true, enumValues: ["bug", "billing", "feature", "question", "complaint"] }, { name: "summary", required: true }, { name: "user_message", required: true }, { name: "priority", enumValues: ["low", "medium", "high"] }] },
  tool_crystallize_sphere: { inputs: [{ name: "signature", required: true }, { name: "name", required: true }, { name: "emoji" }] },
  tool_delete_dormant_entries: { inputs: [{ name: "entry_ids", required: true }] },
  tool_delete_focus: { inputs: [{ name: "name", required: true }, { name: "confirm" }], outputs: ["confirmation with deleted entity counts"] },
  tool_delete_item: { inputs: [{ name: "id", required: true }, { name: "confirm" }] },
  tool_delete_sphere: { inputs: [{ name: "name", required: true }], outputs: ["confirmation"] },
  tool_delete_wearable_data: {},
  tool_enter_tunneling: { inputs: [{ name: "focus_id", required: true }, { name: "reason", required: true }, { name: "initiator", enumValues: ["user", "agent"] }] },
  tool_escalate_to_owner: { inputs: [{ name: "ticket_id", required: true }, { name: "reason", required: true }, { name: "recommendation" }] },
  tool_exit_tunneling: {},
  tool_get_biometrics: { inputs: [{ name: "days" }], outputs: ["is_error if no wearable is connected"] },
  tool_get_context: { inputs: [{ name: "file", required: true, enumValues: ["identity", "principles", "schedule_preferences", "daily_digest", "weekly_drift_report", "release_notes"] }] },
  tool_get_context_summary: { outputs: ["structured summary with focus list, reminder counts, and alerts"] },
  tool_get_daily_summary: { inputs: [{ name: "date" }] },
  tool_get_drift: { inputs: [{ name: "days" }], outputs: ["drift score per focus with activity evidence"] },
  tool_get_fading: {},
  tool_get_focus_details: { inputs: [{ name: "focus_name", required: true }, { name: "file" }], outputs: ["focus object with nested reminders, notes, decisions arrays and stats summary"] },
  tool_get_focus_progress: { inputs: [{ name: "focus_id", required: true }], outputs: ["timeline of locus changes and activity stats"] },
  tool_get_item: { inputs: [{ name: "id" }, { name: "title" }] },
  tool_get_profile: { inputs: [{ name: "include_evidence" }], outputs: ["non-sensitive observations grouped by dimension with evidence"] },
  tool_get_retrospective: { inputs: [{ name: "period" }] },
  tool_get_usage: { outputs: ["calls made, tokens used, cost in USD, remaining budget"] },
  tool_graph_neighbors: { inputs: [{ name: "entity_id", required: true }, { name: "relation" }, { name: "limit" }] },
  tool_link_attachment: { inputs: [{ name: "attachment_id", required: true }, { name: "entity_type", required: true, enumValues: ["focus", "note", "decision"] }, { name: "entity_id", required: true }] },
  tool_link_entities: { inputs: [{ name: "source_id", required: true }, { name: "target_id", required: true }, { name: "relation", required: true, enumValues: ["about", "blocks", "contradicts", "implements", "related", "supports"] }, { name: "reason" }, { name: "confirm" }] },
  tool_list_attachments: { inputs: [{ name: "entity_type" }, { name: "entity_id" }] },
  tool_list_connectors: {},
  tool_list_directions: { outputs: ["list of directions with title, destination, status, and nested focus names"] },
  tool_list_focus_resources: { inputs: [{ name: "focus_id", required: true }], outputs: ["connector, external_id, name, url, kind для всего что связано с фокусом"] },
  tool_list_focuses: { outputs: ["list of focus objects with id, name, status (active|paused), type, destination, locus"] },
  tool_list_items: { inputs: [{ name: "type", enumValues: ["note", "contact", "event", "decision", "reminder", "observation"] }, { name: "status" }, { name: "focus" }, { name: "query" }, { name: "limit" }] },
  tool_list_observations: { outputs: ["list of unresolved observations with type, content, and creation date"] },
  tool_list_silence_declarations: {},
  tool_list_spheres: { outputs: ["each sphere with id, name, emoji, kind ('standard' base sphere by default; the 9th..."] },
  tool_list_trash: { inputs: [{ name: "kind", enumValues: ["item", "focus"] }, { name: "since" }, { name: "query" }, { name: "limit" }], outputs: ["rows {trash_id, kind, label, deleted_at, deleted_via}, newest first"] },
  tool_mark_unproductive: { inputs: [{ name: "reason", required: true, enumValues: ["hostile", "testing", "abusive", "trolling"] }, { name: "note" }] },
  tool_record_locus: { inputs: [{ name: "addressing_kind", required: true, enumValues: ["focus", "sphere", "direction"] }, { name: "addressing_id", required: true }, { name: "content", required: true }, { name: "source", enumValues: ["interactive", "retrospective", "agent"] }, { name: "source_channels" }, { name: "observability" }, { name: "intensity" }, { name: "alignment" }, { name: "concentration" }, { name: "definiteness" }, { name: "tentative", enumValues: ["0", "1"] }] },
  tool_reopen_direction: { inputs: [{ name: "direction_id" }, { name: "title" }] },
  tool_reopen_focus: { inputs: [{ name: "focus_id" }, { name: "name" }] },
  tool_reopen_sphere: { inputs: [{ name: "sphere_id", required: true }] },
  tool_resolve_skipped_dormants: { inputs: [{ name: "decisions", required: true }] },
  tool_resolve_ticket: { inputs: [{ name: "ticket_id", required: true }, { name: "resolution", required: true }] },
  tool_restore_trash: { inputs: [{ name: "trash_id", required: true }] },
  tool_rewire_locus_record: { inputs: [{ name: "record_id", required: true }, { name: "new_kind", required: true, enumValues: ["direction", "focus", "sphere"] }, { name: "new_id", required: true }] },
  tool_search_history: { inputs: [{ name: "source", required: true, enumValues: ["heartbeat", "conversation", "activity"] }, { name: "query" }, { name: "days" }, { name: "limit" }] },
  tool_search_items: { inputs: [{ name: "query", required: true }, { name: "type", enumValues: ["note", "contact", "event", "decision", "reminder", "observation"] }, { name: "mode", enumValues: ["text", "semantic", "hybrid"] }, { name: "limit" }] },
  tool_search_kb: { inputs: [{ name: "query", required: true }] },
  tool_search_knowledge: { inputs: [{ name: "query", required: true }] },
  tool_search_locus_history: { inputs: [{ name: "query", required: true }, { name: "limit" }, { name: "addressing_kind", enumValues: ["direction", "focus", "sphere"] }, { name: "addressing_id" }] },
  tool_search_memories: { inputs: [{ name: "query", required: true }, { name: "limit" }], outputs: ["matching memory texts with category and recency"] },
  tool_send_choices: { inputs: [{ name: "text", required: true }, { name: "choices", required: true }] },
  tool_set_feeling: { inputs: [{ name: "sphere_id", required: true }, { name: "feeling", required: true }] },
  tool_set_silence_declaration: { inputs: [{ name: "type", required: true, enumValues: ["no_proactive_focus", "no_proactive_topic"] }, { name: "target_kind", enumValues: ["focus", "sphere", "direction", "topic", "vault"] }, { name: "target_id" }, { name: "target_label" }, { name: "expires_in_hours" }, { name: "reason" }] },
  tool_set_trajectory_phase: { inputs: [{ name: "entry_id", required: true }, { name: "new_phase", required: true, enumValues: ["dormant", "past"] }, { name: "content" }, { name: "recorded_at" }, { name: "position" }] },
  tool_unbind_resource: { inputs: [{ name: "focus_id", required: true }, { name: "connector", required: true }, { name: "external_id", required: true }] },
  tool_update_context: { inputs: [{ name: "file", required: true, enumValues: ["soul", "agents", "operations"] }, { name: "section", required: true }, { name: "action", required: true, enumValues: ["append", "replace", "add_section"] }, { name: "content", required: true }, { name: "dry_run" }] },
  tool_update_direction: { inputs: [{ name: "direction_id", required: true }, { name: "status", enumValues: ["active", "paused"] }, { name: "title" }, { name: "destination" }, { name: "confirmed" }, { name: "cascade_focuses" }, { name: "reason" }] },
  tool_update_focus: { inputs: [{ name: "focus_name", required: true }, { name: "name" }, { name: "status", enumValues: ["active", "paused"] }, { name: "locus" }, { name: "destination" }, { name: "confirmed" }, { name: "direction" }, { name: "main" }, { name: "pause_reason" }, { name: "resume_condition" }] },
  tool_update_identity: { inputs: [{ name: "action", required: true, enumValues: ["add", "update", "remove", "confirm"] }, { name: "id" }, { name: "text" }, { name: "category", enumValues: ["role", "background", "skill", "trait", "preference", "life", "principle:decision", "principle:process", "principle:product", "principle:people"] }, { name: "sphere_id" }] },
  tool_update_item: { inputs: [{ name: "id", required: true }, { name: "title" }, { name: "content" }, { name: "status" }, { name: "focus" }, { name: "fire_at" }, { name: "recurrence" }, { name: "done_at" }, { name: "properties" }, { name: "tags" }] },
  tool_update_schedule: { inputs: [{ name: "active_start" }, { name: "active_end" }, { name: "intensity", enumValues: ["low", "medium", "high"] }, { name: "mode", enumValues: ["normal", "reactive"] }, { name: "monthly_review" }, { name: "weekly_review_weekday" }, { name: "calendar_sync_pref", enumValues: ["ask", "always", "never"] }] },
  tool_use_connector: { inputs: [{ name: "connector", required: true }, { name: "tool", required: true }, { name: "arguments", required: true }] },
};
