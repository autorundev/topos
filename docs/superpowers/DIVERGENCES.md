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
