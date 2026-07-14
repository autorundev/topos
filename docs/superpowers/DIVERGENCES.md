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
