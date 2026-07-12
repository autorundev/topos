# Topos — Drill-down Step 2: real per-child ports

Follows Step 1 (class-as-container, shipped `e37b8c2`). Owner: "давай шаг 2, UI потом вылижем" — so DATA fidelity is the bar; render can be rough (polished next iteration).
Mode: opus-as-fable.

## Goal
On expand, children show their OWN ports instead of the group's aggregate list.
Real, cheap sources (deps.py is import-graph, NOT this):
- **Tools** → `~/vectoros/src/tools/_schemas.py`: each tool's `input_schema.properties` (keys = input params, `required` marks required). Output not in schema → best-effort short label from `description` ("Returns …") else omit.
- **Detectors** → `~/vectoros/src/awareness/detectors/__init__.py` `DETECTOR_SPECS`: `DetectorSpec(name, fn, urgency, event_class, eval_mode)`. Output = `event_class` (= the family it sits under → cross-check). Input = `eval_mode` ('clock'→"clock-tick" / 'state'→"state-write").
- Stores / crons / connectors / admin: NO cheap per-child I/O → stay on the group's aggregate ports.

## Step 2a — data (the careful part, adversarial-reviewed)
- `types.ts`: `export interface TaxoIO { inputs?: { name: string; required?: boolean }[]; outputs?: string[] }`.
- `data/taxonomy_io.ts` (NEW): `export const TAXO_IO: Record<string, TaxoIO>` keyed by the taxonomy node id (e.g. `tool_get_focus`, `det_sustained_drift` — read the exact ids from `data/taxonomy.ts`). Populate tools + detectors only.
- Extraction: a throwaway python AST parser (do NOT import the vectoros package — parse the literals) over `_schemas.py` (dict list) + `DETECTOR_SPECS` (DetectorSpec calls). Match extracted names to taxonomy ids by the underlying name; report unmatched either way.
- `toposService`: expose `getTaxoIO(taxoId): TaxoIO | undefined`.
- **AC**: `npm run build` green. Integrity script `scripts/check_taxo_io.ts`: every detector taxo node has io.outputs == its family (cross-check event_class == family bucket); tool nodes with a matching `_schemas.py` entry have io.inputs == the real property keys; print matched/unmatched tallies (78 taxo tools vs 87 schema entries — report the delta and which are unmatched).

## Step 2b — render (rough ok; polish deferred)
- In the expanded ContainerNode, when a leaf child has `TAXO_IO`, show its own input ports (left) / output ports (right) on the child card, feeding the container's inbound/outbound sections — replacing the group's aggregate ports for that class where children carry io. Keep group ports for classes whose children have no io (stores/crons/etc.).
- Functional over pretty (owner will polish next). Build green + Puppeteer smoke + screenshot for the owner.

## Divergences → `2026-07-12-detail-hierarchy-DIVERGENCES.md`.
