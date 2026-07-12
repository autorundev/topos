# Topos — Drill-down Step 1: class-as-container (group area + sections + resize)

Follows `2026-07-12-detail-hierarchy-{design,plan}.md` (W1+W2 shipped `f07ab36`). Owner iteration 2026-07-12.
Mode: opus-as-fable — executor(Sonnet 5, worktree) → adversarial review → deploy → owner visual verify.

## Why
Owner: expanded children should sit in a **dedicated group area** of the parent that reads like the
inbound/outbound cluster sections — not float on thin membership edges. Also two owner findings:
container/cluster zones **don't resize** on expand (children overflow); the expand button should be
**touch-friendly** (bigger tap target).

## Scope (Step 1 — structure only, NO new data)
- **Class = container on expand.** When `expanded.has(classId)`, the class renders as a CONTAINER (new
  node type / mode): header (the class label + nature + chevron) on top; a tinted body area; a LEFT
  inbound gutter and RIGHT outbound gutter carrying the class's EXISTING I/O ports (the aggregate group
  ports, relocated to the container edges — inbound left, outbound right); children laid out in a GRID
  inside the body between the gutters. This delivers the "inbound/outbound sections" look with no new data.
- **Children in a grid** (wrap by count), NOT ELK's tall column — fixes the earlier tall-column complaint.
- **Resize:** the container node's ELK width/height = header + inner grid + gutters, so ELK reflows the
  flow to make room; cluster-zone contours (`zoneNodes`) recompute their bbox to INCLUDE expanded
  containers so nothing overflows.
- **Nested family:** an expanded family inside the container is itself a sub-container (recursive grid).
  Keep it working; if recursion is too risky blind, fall back to instances added into the class grid
  inline — but attempt nested first.
- **Drop the thin `contains` edges** (containment now shown by the container). Keep dream `seq` order
  legible inside the container (numbered cells or tiny connectors).
- **Touch chevron:** ≥32px hit area, padded, filled rounded affordance; on class + family headers.
- Ports in Step 1 are still the GROUP's ports on the container boundary. Per-child ports = Step 2
  (from `src/tools/_schemas.py` tool inputs + `DETECTOR_SPECS`/`EVENT_CLASS_BY_DETECTOR` detector
  outputs; deps.py is import-graph, NOT a source for I/O).

## Preserve (regression)
- Collapsed state renders EXACTLY as before (class = normal BrickNode card, ports, I/O chips, flow edges,
  Constraints band, spotlight, zones). Only expanded classes become containers.
- Flow edges keep connecting to the class's ports (now on the container edges) via the same handle ids.
- `visibleTaxo` derivation + its test stay green (contains edges may be dropped from render but the
  node-visibility logic stays).

## Verify
- `npx tsc --noEmit` (only netlify error), `npm run build` green.
- Pure `containerLayout(...)` function + unit test (`scripts/check_container_layout.ts`): container size
  grows with child count; child cells inside bounds; nested family sub-container sized correctly; grid
  wraps (not a 1-wide column) for large families.
- Executor Puppeteer DOM/screenshot smoke: expand a class → container with header + gutters + child grid
  renders; cluster zone grew to contain it; collapse restores; zero console errors. Save a screenshot to
  disk (path in report) so the coordinator can forward it to the owner.
- Deploy: build + rsync + dist↔served hash parity + 401.

## Divergences → `2026-07-12-detail-hierarchy-DIVERGENCES.md`.
