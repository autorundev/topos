# Topos — Detail Hierarchy — Implementation Plan

Design: `2026-07-12-detail-hierarchy-design.md` (approved 2026-07-12).
Mode: opus-as-fable — executor(Sonnet 5, worktree) → adversarial reviewer → fix → re-verify. Coordinator merges & gates.

## Waves

### W1 — Data + types (foundation) — one executor
Files: `types.ts`, `data/taxonomy.ts` (NEW), `services/toposService.ts` (helper), `data.ts` (optional export).
- `types.ts`: add `TaxoKind = 'family'|'instance'`, `NodeStatus = 'live'|'todo'|'dead'|'soak'`, `TaxoNode` (id, name, kind, nature?, status?, note?, seq?, children?).
- `data/taxonomy.ts`: `export const TAXONOMY: Record<string, TaxoNode[]>` transcribed from
  `/home/anton/autorun.dev/p/proactive/internals.html` `Z` object. Keyed by Topos class id per
  the design's zone→class map. Family = note-prefix before `·`. status from XED/YEL/DARK sets
  (dead/todo/soak, else live). note = internals note. nature default = parent-class nature
  (code for detectors/tools/tables/crons/connectors); model for brain personas + models and for
  LLM-invoking detectors (verify per file: frame_hypothesis, emergent_direction,
  bottom_up_insights_ready, emergent_sphere, multisignal_divergence — confirm which actually
  call a model). dream stages under `proc_nightly` get `seq` 0..N in pipeline order
  (orient→gather→consolidate→prune→identity_review→trajectory_review→bottom_up→
  formulation_review→secretary→curation→meta).
- `services/toposService.ts`: `getTaxonomy(classId): TaxoNode[]` (returns `TAXONOMY[classId] ?? []`)
  and `flattenTaxo(nodes): TaxoNode[]` helper.
- **AC**: `npm run build` green (TS strict). Exact `Z`-derived counts: detectors 41, connectors 17,
  tools 78, vault 68, admin 29, crons 47, personas 7 + models 3 (banner's 16/~65/46 were
  approximations). Every TAXONOMY key is a real task id
  (`toposService.getTaskById` non-undefined). Every child `id` unique within its class subtree.
  A throwaway node script asserts these and prints the tallies.

### W2 — Rendering + interaction (CanvasPage) — one executor (after W1 merged)
File: `features/topos/components/CanvasPage.tsx` (single big file — one executor, no parallel writers).
- `expanded: Set<string>` state; toggle on chevron.
- Visible-set derivation: base flow tasks + edges, PLUS for each expanded node its direct
  children as nodes and `contains` edges parent→child; nested when a family is also expanded.
- New edge type `contains`: thin neutral grey, NO ports, NO arrowhead, lower z + opacity than flow.
  Extend `ElkEdge` to render membership edges (they are NOT port-anchored like flow edges).
- Dream sequence edges: between consecutive `seq` siblings when the dream family is expanded,
  styled like `contains` but showing order.
- Node components: `FamilyNode` (name + child count + nature dot + chevron), `InstanceNode`
  (compact: name + nature dot + status dot; dead→dimmed+dashed). Colour by `nature` (reuse
  `NATURES`/`natureColor`). Status dot palette matches internals (live green / todo gold /
  dead grey / soak hollow).
- Chevron ▸/▾ affordance on any node that has taxonomy (class or family); click toggles expand.
- ELK re-layout: `computeLayout` runs over the visible set; `expanded` in the effect deps.
- Instance/family click → `DetailDrawer` shows name + note (+ nature/status). Reuse existing drawer.
- Legend: add `contains`/membership line + status-dot key.
- **AC**: build green. Expand each class → children appear, ELK re-flows, collapse restores.
  Dream expands as an ordered chain. Click instance → drawer w/ note. Dead nodes dimmed.
  No regression to class-level flow, ports, I/O chips, Constraints band.

### W3 — Deploy + gate (coordinator)
- `npm run build && rsync -a --delete dist/ ~/autorun.dev/p/topos/vector/`.
- Verify 401 gate + fresh bundle hash (curl --resolve). Report status.

## Divergences
Logged in `2026-07-12-detail-hierarchy-DIVERGENCES.md` (create on first divergence).

## Merge discipline
After each wave: adversarial review (refute stance, re-run build) → fix agent if defects →
coordinator `git merge` from worktree → build green on main → `git worktree prune`. Push after merge.
