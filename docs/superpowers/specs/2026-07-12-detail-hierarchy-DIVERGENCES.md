# Topos — Detail Hierarchy — Divergences from plan/design

Design: `2026-07-12-detail-hierarchy-design.md`. Plan: `2026-07-12-detail-hierarchy-plan.md`.

## W2 — `visibleTaxo` node/edge id scheme (classId-qualified, not raw)

**Found:** `TaxoNode.id` is documented as "stable slug, UNIQUE within its class subtree"
(types.ts) — i.e. only unique per-class, not globally. In the real `data/taxonomy.ts`, three
family ids actually collide ACROSS classes with different content:

- `fam_graph` — `tool_retrieve` (family "graph", 2 children) vs `store_vault` (family "граф", 1 child)
- `fam_meta` — `tool_retrieve` (family "мета"→"meta", 14 children) vs `store_vault` (family "мета", 15 children)
- `fam_secretary` — `tool_retrieve` (1 child) vs `store_vault` (4 children)

**Why it matters:** React Flow requires globally-unique node ids. The plan's `TaxoRender`
sketch implies using the raw `TaxoNode.id` directly as the render/node id. If both
`tool_retrieve` and `store_vault` are expanded at once (a realistic use case — both are large,
independently interesting classes), rendering the raw id directly would either silently drop
one of the two colliding family nodes or merge their edges onto a single node showing the
wrong name/children for whichever class lost the race.

**Divergence:** `TaxoRender.id` (used as the ReactFlow node id, and as `contains`/`seq` edge
source/target) is `taxoRenderId(classId, taxoId) = \`${classId}::${taxoId}\`` — namespaced by
the root class. The raw id is preserved separately as `TaxoRender.taxoId` for anything that
needs to look back into `TAXONOMY`. `expanded: Set<string>` stores this same namespaced id for
family nodes (class-level entries stay as the raw task id, which is already globally unique).

**Verified:** `scripts/check_visible_taxo.ts` §5 expands `tool_retrieve` + `store_vault`
together and asserts both `fam_graph` nodes render distinctly with correct, distinct names.
Confirmed visually via a Puppeteer smoke pass (both "graph" and "граф" family cards render
side-by-side with no dropped/merged nodes, 27 unique family node ids, zero duplicates).

**Owner-visible surface:** none — this is purely an internal id scheme; the interaction
contract (toggle by clicking a node's own chevron) is unaffected.

## W2 — no divergences from the ELK integration contract

`computeLayout(tasks, edges, taxoNodes, taxoEdges)` matches the plan's signature. Taxo nodes
use `elk.partitioning.partition` = the SAME value as their root class's zone (reusing the
existing `LAYER_ORDER`-by-`layer_id` mechanism), with `FREE` ports; `contains`/`seq` edges are
node-to-node (no port ids), confirmed to route cleanly against class nodes that have `FIXED_POS`
ports in pass 2 (probed in isolation before integrating — elkjs 0.11.1 auto-picks a border
attachment point for portless edges against a FIXED_POS-ported node without error).

## W2 — seq edge "subtle dot/marker" — explicitly-optional bullet skipped

Design doc: "a subtle dot/marker is OK to imply order (optional)". Implemented the required
part (seq edges render at opacity ~0.7 vs contains ~0.5, both no-arrowhead) and skipped adding
a directional marker glyph to avoid introducing a new SVG `<marker>`/`<defs>` mechanism (the
app currently uses zero markers anywhere) for a bullet the design doc itself marks optional.
Visually confirmed the dream chain (orient→…→meta) still reads left-to-right in practice
because ELK's layered+model-order layout happens to place seq-chained nodes roughly in
sequence order (screenshot: 11 dream instances, first 6 visible in viewport in correct order).
Not guaranteed by construction — a future pass could add an explicit index badge per instance
card if the ELK ordering ever fights the seq order on a different (larger) family.
