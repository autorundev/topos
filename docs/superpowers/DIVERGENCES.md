# Topos Blueprint — Execution Divergences

Log of spec/plan-vs-reality corrections found during execution (opus-as-fable §4).
Each entry: what was found, evidence, the fix, and where it was folded back.

## D-001 — stale-memo on theme toggle (brickNodes / containerNodesRF)
- **Found:** Batch 2 (Task 3) executor flagged that the plan added `isDark` usage inside the
  `brickNodes` and `containerNodesRF` `useMemo` bodies (Step 5 items 5-8) but did NOT add `isDark`
  to those two memos' dependency arrays. It only added it to `taxoLeafNodesRF` (item 9) and
  `zoneNodes` (Step 6).
- **Evidence:** `features/topos/components/CanvasPage.tsx` — body refs `natureColor(t.id, isDark)`
  (L841/843, brickNodes) and `natureColor(t.id, isDark)` / `natureColorFor(nature, isDark)`
  (L874/891, containerNodesRF); pre-fix deps arrays (L849/898) omitted `isDark`.
- **Impact:** brick nodes and class/family container nodes would render the previous theme's color
  after a light/dark toggle until some other dep changed (real visual regression, not cosmetic).
- **Fix:** added `isDark` to both deps arrays. Verified: tsc clean (only pre-existing netlify error),
  build green. Committed as `38fecaa` on branch `blueprint`.
- **Folded back:** plan Task 3, Correction D-001 note (after Step 9).

## D-002 — band_constraint off-grid position (Task 13)
- **Found:** Batch 3 adversarial visual review. Task 13 wraps every top-level node's SIZE in
  `roundUp24`, but the `band_constraint` node's POSITION `y = maxY + BAND_GAP - 8` is not snapped —
  `BAND_GAP=72` is a 24-multiple but the leftover `-8` cosmetic offset makes `y % 24 = 16`.
- **Evidence:** live DOM `band_constraint` at `translate(24px, 1072px)`, `1072 % 24 = 16` — the only
  off-grid node among 34 top-level nodes. `features/topos/components/CanvasPage.tsx` band push line.
- **Impact:** violates Task 13's "mandatory... guaranteed by construction" 24px grid for one node
  (visible 16px vertical misalignment of the constraints band vs the grid).
- **Fix:** wrap the band position in the unit-tested `snapTo24` (imported alongside `roundUp24`):
  `position: { x: snapTo24(minX - 24), y: snapTo24(maxY + BAND_GAP - 8) }`. Re-verified live: all 34
  top-level nodes now `%24===0`, band at `(24, 1080)`, 0 console errors. Committed as a follow-up on
  branch `blueprint`.
- **Folded back:** plan Task 13 Step 8 (band push line) — see correction note there.

## D-003 — short input label breaks mid-word (Task 6)
- **Found:** Batch 4 adversarial visual review. `InstanceNode`'s I/O row used `display:flex;
  justify-content:space-between` with both sides `minWidth:0`. A short input label sharing a row with
  a wide output chip got squeezed below its text width and broke mid-word (`type` → "typ"/"e") due to
  `overflowWrap:anywhere` + line-clamp.
- **Fix:** row → `display:grid; gridTemplateColumns:'1fr 1fr'` (each side a fixed half, no contention);
  `TaxoIOChip maxWidth 118 → '100%'` (chip constrained to its grid cell). Re-verified: 0 horizontal
  overflow across 325 cards.
- **Folded back:** plan Task 6 Step 2 (correction note).

## D-004 — I/O chip content overflows instance card (Task 6 height budget)
- **Found:** Batch 4 adversarial visual review — 15/~120 instance cards spilled I/O-chip content
  ~9-11px past their card's bottom border. Cause: `ioRowsExtraHeight` budgeted a flat `IO_ROW_H` per
  row, but Task 6's 2-line-wrapping chips render taller; budgeted < rendered.
- **Fix:** `ioRowsExtraHeight` now takes `(io?: TaxoIO)` and adds `IO_LINE_EXTRA=12` for any row whose
  input OR output label length > `IO_WRAP_CHARS=11` (rows that can wrap). `WebkitLineClamp:2` caps
  rendered at 2 lines, so budget >= rendered by construction. `instanceCellHeight` +
  `InstanceNode.height` both derive from the same function. Re-verified live: 0 vertical overflow
  across 325 fully-expanded cards (was 15).
- **Note:** Task 8 (masonry) packs cells by `instanceCellHeight`, so this fix had to land BEFORE
  Task 8 for the packer to see correct heights.
- **Folded back:** plan Task 6 Step 2 (correction note).

## D-005 — enum-pill height budget ignored CSS gaps (Task 15-R)
- **Found:** Batch 6 interactive review — 19/325 enum-bearing instance cards overflowed vertically
  (up to +17.8px), a visible param pill spilling outside the card border (D-004 bug class again).
- **Cause:** `enumRowsExtraHeight = ceil(nValues/2)*ENUM_ROW_H(18)` did not account for the enum grid's
  `gap:3` between rows + the flex-wrapper `gap:2` — budget < render.
- **Fix:** `ENUM_ROW_H 18 → 24` (parity with SCHEMA_ROW_H, which the review confirmed doesn't overflow;
  slack = 5g+1 per enum-input, provably ≥ render). Re-verified live: 0 vertical + 0 horizontal overflow
  across 325 fully-expanded cards.

## D-006 — schema-pill inspector never matched (Task 17 + findValueOccurrences)
- **Found:** Batch 6 interactive review — clicking a DB-column pill (`id: TEXT`) opened the inspector
  but showed `0 / только здесь`, because the pill passed the COMPOUND `"name: type"` string while
  `findValueOccurrences` matches a bare column name or type. The valuable cross-link (column `status` ↔
  tool param `status`) was dead for every schema pill.
- **Fix:** `ClickablePill` gained an optional `value?: string` (the match/activate KEY, defaults to
  `text`); schema pills pass `value={col.name}` while still DISPLAYING `name: type`. Re-verified live:
  clicking `id: TEXT` now keys on `id` → 62 occurrences listed (4 params + 58 columns), 62 twins ringed.

## D-007 — inspector counts its own origin (Task 15-R)
- **Found:** Batch 6 review — a genuinely-unique value showed `1 / <self>` instead of «только здесь»
  because `findValueOccurrences` includes the clicked occurrence.
- **Fix:** `PillInspector` shows «только здесь» when `occurrences.length <= 1` (was `=== 0`).

## D-008 (note) — T16 extractor docstring had a literal `"""` (SyntaxError)
- The plan's `extract_vault_schema.py` module docstring contained `"""..."""` inside the docstring body,
  prematurely closing the triple-quoted string. Executor reworded the docstring text (logic/regex/AST
  untouched) — necessary, reported. Fold: if regenerating, keep no `"""` inside the docstring.

## D-009 — motion conflict: inline transition overrides `.topos-enter` (Tasks 10 + 11)
- **Found:** Batch 7 pre-dispatch review of T10+T11 together. T10 Step 2 sets an inline
  `style.transition` on FamilyNode/InstanceNode; T11 adds `className="topos-enter"` (a class whose
  `transition` lists opacity+transform+**filter** 260ms) to the SAME element. Inline style beats a
  class selector on specificity → the class's `transition` is DEAD on these two leaf components, so the
  `@starting-style` entrance runs on T10's inline timings, which **omit `filter`** → the entrance blur
  (`blur(2px)→blur(0)`) would snap instantly instead of easing. The plan's literal T10 transition
  (`'opacity .2s, transform .12s var(--ease-out), box-shadow .12s'`) misses this.
- **Fix (folded into Batch 7 executor prompt):** for FamilyNode + InstanceNode ONLY, use a unified
  filter-inclusive inline transition — `'opacity .22s var(--ease-out), transform .22s var(--ease-out),
  filter .22s var(--ease-out), box-shadow .12s'` — so hover-lift AND the @starting-style entrance
  (opacity+scale+blur) all ease, all sub-300ms. `.topos-enter` is kept purely for its `@starting-style`
  initial values (which apply regardless of which transition wins) and still governs container nodes
  (T11 Step 3, `className:'topos-enter'`) where no inline transition overrides it. ItemNode is
  unchanged from the plan (T11 adds no `.topos-enter` to it → no filter needed).

## DEPLOYED — Blueprint polish complete (2026-07-15)
- All 7 batches (T1-T17 + T15-R + T9-T12 motion) merged to main and deployed to `autorun.dev/p/topos/vector/`.
- Deployed commit: `6c8adec` (Merge branch 'blueprint'). Bundle `CanvasPage-yLILsmBF.js` md5 `031b6b09c21d4162f8b3b3de1312ba3e`.
- Verified: dist↔served hash parity exact; live curl → 401 (basic-auth intact). tsc==1, build ✓, all 7 check_*.ts PASSED on main.
- 9 divergences caught adversarially (D-001..D-009); B7 motion Block→fixed→re-verified ALL PASS.
