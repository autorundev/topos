# Topos — Detail Hierarchy (drill-down) — Design

Date: 2026-07-12
Status: approved (pending spec review)
Repo: `autorundev/topos` · file: `features/topos/components/CanvasPage.tsx`, `data/*`, `types.ts`

## Problem

The Topos map shows VectorOS as ~20 **class-level** nodes (Detectors, Tools, `vault`, …).
Each class's real members live as flat, non-interactive strings in `common_variants`
(`"drift ×16"`, `"engagement ×10"`). There is no way to see, or click into, the actual
representatives — the 41 detectors, 78 tools, 65 vault tables, 46 crons. The owner wants
to drill from cluster → class → family → instance and inspect concrete components.

A fully code-extracted, name-by-name inventory already exists as a separate flat Cytoscape
page: `/home/anton/autorun.dev/p/proactive/internals.html` (the `Z` object — 41 detectors /
16 connectors / 78 tools / ~65 vault + 29 admin / 46 crons / 7 personas, each with a
family-tagged note, colour, and status, extracted 2026-07-08, statuses 2026-07-10). This
design brings that detail **into** the Topos ELK flow map as clickable, expandable nodes,
unifying the two views.

## Goal

- Every class node can expand **in place on the canvas** into its children; children can
  themselves expand (family → instances). Collapse reverses. ELK re-lays out on each change.
- The taxonomy is real and complete, transcribed from `internals.html`'s `Z`.
- Each node carries its own `nature` (model/code/human — primary colour axis), a `note`
  (tooltip), and a `status` (works / todo / deleted / owner-soak, shown as a dot).
- The **dream cycle** renders as an ordered sub-pipeline (its stages chained in sequence),
  because dream is effectively its own loop.

## Non-goals

- No change to the class-level flow graph, ELK two-pass layout, ports, I/O chips, or the
  Constraints band. Detail is **additive**.
- No editing / builder mode. Read-only map.
- Not replacing `internals.html` in this pass (it can be retired later once Topos supersedes it).

## Level model (ragged, uniform via "children")

| Level | What | Example | On canvas |
|---|---|---|---|
| L0 Cluster | inbound / internal / outbound | — | existing faint zone contour (not a node) |
| L1 Class | existing flow nodes | Detectors, Tools, `vault` | flow node (unchanged) |
| L2 Family | subgroup (only where one exists) | `drift`, `engagement` | appears on expand |
| L3 Instance | concrete representative | `direction_drift`, `get_focus`, table `focuses` | leaf, appears on expand |

The hierarchy is **ragged**: detectors have all three levels; `gate`/`brain`/`effect` have
only flat instance-variants (no family). Uniform rule: **`common_variants` becomes a
structured `children` tree** — some children are families (with their own `children`), others
are leaf instances. One model covers every class.

## Data model

New file `data/taxonomy.ts`. New type in `types.ts`:

```ts
export type TaxoKind = 'family' | 'instance';
export type NodeStatus = 'live' | 'todo' | 'dead' | 'soak';

export interface TaxoNode {
  id: string;            // stable slug, unique within its class subtree
  name: string;
  kind: TaxoKind;
  nature?: NodeNature;   // defaults to the parent class nature; may override (a detector may be model or code)
  status?: NodeStatus;   // defaults 'live'
  note?: string;         // tooltip / drawer detail (from internals note)
  seq?: number;          // ordered position among siblings (dream stages); absent = unordered set
  children?: TaxoNode[];
}

// keyed by L1 class id (task id), e.g. 'det_detectors', 'tool_retrieve', 'store_vault'
export const TAXONOMY: Record<string, TaxoNode[]> = { … };
```

`common_variants: string[]` on the flow tasks is superseded by `TAXONOMY` and removed from the
class nodes that gain a taxonomy (kept where a class has no taxonomy, or migrated wholesale —
decided in the plan). The class node's own `nature`/`category` stay as they are.

### Source of truth & derivation

`internals.html`'s `Z` object is the input. A one-shot conversion (throwaway script, not
shipped) transforms `Z` → `TAXONOMY`:

- **Family** for a detector/tool/table = the prefix of its `internals` note before `·`
  (`'drift · SMA_align<0.5'` → family `drift`). Curated already; not guessed.
- **status**: `internals` sets (`XED`→`dead`, `YEL`→`todo`, `DARK`→`soak`, else `live`).
- **note**: the `internals` note string.
- **nature**: default = parent class nature (detectors/tools/tables/crons/connectors → `code`);
  override to `model` for brain personas + models, and for detectors that invoke an LLM
  (`frame_hypothesis`, `emergent_direction`, `bottom_up_insights_ready`, etc. — verified per
  file during authoring, not assumed).

### Zone → class mapping

| `internals` zone | Topos class(es) | Families |
|---|---|---|
| 01 Вход | `trig_connector_sync` (16 connectors) | source / websearch / biometric |
| 02 Детекторы (41) | `det_detectors` | drift·engagement·reflective·onboarding·lifecycle·safety·care |
| 03 Машина | `gate_admission`, `starter_recipe`, `proc_nightly` (dream ×11, ordered), eval, assembler-blocks | flat / ordered (dream) |
| 04 Мозг | `brain_core` | models (reactive/smart/light) · personas (7) |
| 05 Тулы (78) | `tool_retrieve` | always-on·trajectory·graph·recall·support·connectors·biometric·trash·tunneling·structure·read·meta |
| 06 Эффект | `eff_respond` | flat (send/await/create-update-delete/keyboard) |
| 07 Vault (~65) | `store_vault` | core·graph·trajectory·memory·awareness·dream·secretary·connector·meta·RETIRED |
| 08 admin (29) | `store_vault` → family `admin` | flat |
| 09 Кроны (46) | `trig_cron` | by cadence |

Specific vault tables already modelled as their own Topos stores (`store_conversation`,
`store_focuses`, `store_memories`, `store_links`) stay as class nodes; they are the
instance-level surfaced to the flow. `store_vault` holds the full table catalogue.

## Interaction — "attach-expand"

Expansion **attaches** children to the class; it does not replace it.

- The class node stays a flow participant (`write → Detectors → gate` never breaks).
- Children attach via a new edge type `contains` — thin, neutral grey, **no ports, no
  arrowhead** (membership, not data-flow). Distinct from all flow edges.
- The class header gets a chevron affordance ▸/▾ plus its child count. Click toggles.
- Expansion is per-node, additive, and nestable (class → family → instances); multiple nodes
  may be open at once. State: `expanded: Set<string>` in `CanvasPage`.
- `computeLayout` input = the **visible** node/edge set derived from `expanded`. Toggling
  recomputes the ELK layout (whole map re-flows; the owner has accepted that safe-zones shift).
- Dream (`proc_nightly`) children carry `seq`; when expanded, consecutive stages are joined by
  `contains`-styled **sequence** edges (orient→gather→…→meta) so the loop is legible.

## Rendering

- **Family node**: mid-weight card — name + child count + nature dot. No I/O chips.
- **Instance node**: compact card — name + nature dot + status dot (live/todo/dead/soak, same
  palette as `internals`). Dead/RETIRED shown dimmed + dashed. Click → `DetailDrawer` (note).
- Colour = `nature` (primary axis), consistent with class nodes. Function/family is conveyed
  by grouping + label, not colour.
- `contains` edges render under flow edges (lower z, lower opacity) so the flow stays dominant.

## Impact on neighbors

- `types.ts`: add `TaxoNode` / `TaxoKind` / `NodeStatus`; `common_variants` handling.
- `data/taxonomy.ts`: new.
- `data/{system,ai,human}_tasks.ts`: `common_variants` removed/migrated for classes with a
  taxonomy.
- `CanvasPage.tsx`: `expanded` state; visible-set derivation; `contains` edge type + `ElkEdge`
  handling for arrowless/portless membership edges; family/instance node components; chevron
  affordance; ELK re-layout on toggle; sequence edges for dream.
- `toposService` / data index: expose `TAXONOMY`.
- Legend: add `contains` / membership line; note status dots.

## Scope v1

In: detectors, tools, vault(+admin), crons, connectors, brain(personas/models), machine
internals (gate/starter/dream-ordered/eval/assembler), effect variants — all from `internals`.

Out: builder/edit; retiring `internals.html`; animated transitions; search box (later).

## Testing / verification

- `npm run build` green (TS strict) after each wave.
- Taxonomy integrity check (throwaway/CI-lite): every `TAXONOMY` key is a real task id; every
  child `id` unique within its class subtree; counts match `internals` (41/16/78/65/29/46).
- Manual smoke: expand each class → children appear, ELK re-flows, collapse restores; dream
  expands as an ordered chain; click instance → drawer shows note; dead nodes dimmed.
- Deploy: `npm run build && rsync -a --delete dist/ ~/autorun.dev/p/topos/vector/`; verify 401
  gate + fresh bundle hash.

## Open questions

None blocking. Family assignment and per-instance `nature` overrides are curation decisions
made during authoring against the real files; `internals` notes are the reference.
