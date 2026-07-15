/**
 * Unit test for gridSnap's roundUp24 / snapTo24 / snapPositions (Blueprint amendment 2026-07-14).
 * Run: npx tsx scripts/check_grid_snap.ts
 */
import { roundUp24, snapTo24, snapPositions, GRID } from '../features/topos/lib/gridSnap';

let failed = false;
function assert(cond: boolean, label: string) {
  if (cond) console.log(`  PASS  ${label}`);
  else { console.error(`  FAIL  ${label}`); failed = true; }
}

assert(roundUp24(232) === 240, `roundUp24(232) === 240 (got ${roundUp24(232)})`);
assert(roundUp24(240) === 240, `roundUp24(240) === 240 — already-aligned stays put (got ${roundUp24(240)})`);
assert(roundUp24(241) === 264, `roundUp24(241) === 264 — one over rounds a full step up (got ${roundUp24(241)})`);
assert(snapTo24(50) === 48, `snapTo24(50) === 48 (got ${snapTo24(50)})`);
assert(snapTo24(61) === 72, `snapTo24(61) === 72 (got ${snapTo24(61)})`);

// snapPositions: two nodes, an edge between them, points not on the grid — after snapping, both
// positions land on 24-multiples AND the edge's endpoints shift by the AVERAGE of both deltas.
{
  const pos = { a: { x: 10, y: 10 }, b: { x: 100, y: 34 } };
  const pts = { e1: [{ x: 10, y: 20 }, { x: 55, y: 20 }, { x: 100, y: 44 }] };
  const edgeEndpoints = { e1: { source: 'a', target: 'b' } };
  const { pos: sp, pts: spts } = snapPositions({ pos, pts, edgeEndpoints });
  assert(sp.a.x % GRID === 0 && sp.a.y % GRID === 0, `node a snapped to a 24-multiple (${sp.a.x},${sp.a.y})`);
  assert(sp.b.x % GRID === 0 && sp.b.y % GRID === 0, `node b snapped to a 24-multiple (${sp.b.x},${sp.b.y})`);
  const expectedDx = ((snapTo24(10) - 10) + (snapTo24(100) - 100)) / 2;
  assert(Math.abs(spts.e1[0].x - (10 + expectedDx)) < 1e-9, `edge point 0 shifted by the averaged delta (got dx applied: ${spts.e1[0].x - 10})`);
  assert(spts.e1.length === 3, `edge point count unchanged (${spts.e1.length})`);
}

console.log('\n' + (failed ? 'gridSnap check FAILED.' : 'gridSnap check PASSED.'));
if (failed) process.exit(1);
