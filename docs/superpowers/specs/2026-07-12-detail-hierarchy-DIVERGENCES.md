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

## Step 1 — class-as-container

Plan: `2026-07-12-detail-hierarchy-step1-plan.md`.

### Taxo children no longer participate in ELK at all (not just "free ports")

W2's model gave expanded family/instance nodes to ELK as FREE-port nodes in the same partition as
their root class, with `contains`/`seq` edges routed by ELK. Step 1 replaces this entirely: an
expanded class/family's children are positioned by the new pure `containerLayout` grid (relative
coordinates), converted to absolute canvas coordinates once ELK has placed the class root. ELK now
only ever sees the flow-level class nodes — an expanded one simply gets a bigger `width`/`height`
(from `containerLayout(...).size`, reconciled with however many flow ports the class itself has).
This is a bigger structural change than the plan's "keep it working" framing for nested families
implies, but it's what "children laid out in a GRID inside the body between the gutters" requires:
ELK's layered algorithm has no grid-wrap primitive, so a deterministic grid has to be computed
outside it. Verified byte-for-byte parity for the collapsed-everywhere case (empty `expanded` set):
every task falls into `computeLayout`'s `else` branch with the exact same `widths`/`heights`
formula as before, so the flow-only ELK input is unchanged from pre-Step-1.

### `contains`/`seq` edges dropped from render, not just visually recessed

Per the plan ("Drop the thin `contains` edges from render... containment is now shown by the
container box"), `taxoContainsEdges`/`taxoSeqEdges` are no longer turned into `Edge` objects at
all — `CanvasPage` only consumes `visibleTaxo(...).nodes` now. `visibleTaxo` itself is untouched
(frozen W2 interface); its `contains`/`seq` return arrays are computed but simply unused by the
caller. The `contains` edge type/component (`ContainsEdgeComp`, `edgeTypes.contains`) stays
registered — cheap to keep, in case a future pass wants the "light connector" alternative the
step-1 plan explicitly left as "your call" (Step 1 chose numbered instance-card badges instead —
see the dream chain below).

### Known duplication: `containerLayout` re-derives the expand/collapse tree walk

`containerLayout.ts`'s `childrenOf`/recursion and `visibleTaxo.ts`'s `walk` both independently
decide, from the same `expanded: Set<string>`, which taxo nodes are visible and which render id
they get (`taxoRenderId(classId, taxoId)`). This is a real single-source-of-truth tension: two
functions implement the same recursion rather than one. Not resolved in Step 1 because
`visibleTaxo` is a frozen, independently-tested W2 interface (its own script must "stay green")
and it returns a FLAT metadata list, not the nested shape `containerLayout` needs for positioning.
Both recurse under the identical condition (`expanded.has(renderId) && node has children`) and
generate the same namespaced id per direct child, so in practice they stay in lock step for any
given `expanded` set — verified together in `CanvasPage` (`containerFlat`, from `containerLayout`,
and `taxoById`, from `visibleTaxo`, are cross-referenced by render id with no orphans in every
smoke-tested scenario). Flagged here per "surface conflicts, don't average them" rather than
silently accepted — a future pass could have `visibleTaxo` consume `containerLayout`'s cell list
(or vice versa) to collapse this to one recursion, but that touches the frozen W2 interface and
was out of scope for a "structure only" step.

### Nested family: real sub-container (not the inline fallback)

The plan allowed falling back to "instances added into the class grid inline" if recursion proved
too risky. Recursion worked cleanly (see `containerLayout`'s own recursive call + the unit test's
§2/§4 nested-container assertions and the Puppeteer smoke's step [b]) — nested containers are
real, sized-by-their-own-grid boxes rendered by the same `ContainerNode` component (`variant:
'family'`, no port gutters). No fallback needed.

### Touch chevron: hit-area technique varies by call site, not just a "±2px" reading of "≥32×32"

The owner ask was "≥32×32px hit area, padded, a filled rounded button (not a tiny glyph)". All
three call sites render the SAME `TouchChevron` component at literal 32×32 (default `size`), but
the WIRING differs by how much room the legacy layout gives:
- `BrickNode` (collapsed class card): the chevron is a sibling `position:absolute` box in the
  card's top-right corner, OUTSIDE the header's `overflow:hidden` box — chosen specifically so it
  cannot perturb `headerH(task)`, which ELK's port-row math depends on pixel-for-pixel. Retrofitting
  it into the existing tight header flex row (as W2 had it) would have required either shrinking
  the visible glyph back down (defeating the ask) or growing `headerH(task)` (a port-alignment
  regression risk this task's "Preserve" section explicitly guards against).
- `FamilyNode` (collapsed family leaf card, 40px tall): same absolute-corner technique, vertically
  centered via `top:50%`, for the same header-height-is-load-bearing reason (its label/`×N`
  content row would otherwise reflow around a growing inline button).
- `ContainerNode` header (class root or nested family, `CONTAINER_HEADER_H=40`, authored fresh
  for Step 1): the chevron sits inline in the header's normal flex row — no legacy constraint to
  work around, so no absolute-positioning trick needed.

All three reach the literal ≥32×32 hit area; the difference is purely positioning strategy, kept
distinct per-callsite risk rather than forcing one technique everywhere.

### Dream order: numbered badges, not a connector

The step-1 plan offered "number the cells 1..11 (or a light connector), your call." Chose
numbering: `InstanceNode` renders a small circular `seq+1` badge instead of the plain nature dot
when the underlying `TaxoNode` carries a `seq`. `containerLayout` also sorts a container's
children by `seq` first (stable — unordered siblings keep their declared relative order) before
grid-filling, so the numbered badges read in order through the grid's row-major fill (verified:
unit test §4, `cells are seq-ordered 0..10 in grid fill order`). No new edge/connector geometry
needed, unlike the "light connector" alternative.

### Gutter width is a fixed constant, not port-count-driven

`CONTAINER_GUTTER_W = 124` (port shape + up to a 98px-wide `IOChip` + edge padding) is the same
regardless of how many ports a class has — `containerLayout` doesn't know the class's flow-port
count (that lives in `computeLayout`'s `inList`/`outList`, derived from flow edges, not
`TaxoNode` data). What DOES vary with port count is the container's HEIGHT: `computeLayout`
reconciles `containerLayout`'s pure grid height against `header + portRows * ROW_H`, taking
whichever is larger, so a class with more I/O ports than grid rows still gets enough vertical room
for its port row spacing (this is the "reconciled" height in `containerLayouts[t.id]`, not the raw
`containerLayout(...).size.h`).
