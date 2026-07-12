/**
 * Unit test for `containerLayout` / `flattenContainerLayout` (Topos Step 1 AC). Pure-function
 * check, no React/DOM/ELK involved.
 *
 * Run: npx tsx scripts/check_container_layout.ts
 */
import { loadToposData } from '../lib/dataLoader';
import { toposService } from '../services/toposService';
import { containerLayout, flattenContainerLayout, TAXO_W, TAXO_H, CONTAINER_GUTTER_W } from '../features/topos/lib/containerLayout';
import { taxoRenderId } from '../features/topos/lib/visibleTaxo';
import type { Task } from '../types';

let failed = false;
function assert(cond: boolean, label: string) {
  if (cond) {
    console.log(`  PASS  ${label}`);
  } else {
    console.error(`  FAIL  ${label}`);
    failed = true;
  }
}

// every cell must be positioned strictly inside the container box, and (for a class-root
// container) strictly between the two port gutters.
function assertCellsInBounds(label: string, layout: ReturnType<typeof containerLayout>, checkGutters: boolean) {
  const { size, header, gutterL, gutterR, cells } = layout;
  let allInBounds = true;
  for (const cell of cells) {
    const withinX = cell.x >= 0 && cell.x + cell.w <= size.w;
    const withinY = cell.y >= header && cell.y + cell.h <= size.h;
    const betweenGutters = !checkGutters || (cell.x >= gutterL && cell.x + cell.w <= size.w - gutterR);
    if (!withinX || !withinY || !betweenGutters) {
      allInBounds = false;
      console.error(`    cell ${cell.renderId} out of bounds: x=${cell.x} y=${cell.y} w=${cell.w} h=${cell.h} (container ${size.w}x${size.h}, header=${header}, gutterL=${gutterL}, gutterR=${gutterR})`);
    }
  }
  assert(allInBounds, `${label}: all ${cells.length} cells within container bounds${checkGutters ? ' & between gutters' : ''}`);
}

async function main() {
  await loadToposData();
  const tasks: Task[] = toposService.getTasks();

  // ── 1. collapsed root → no container cells (nothing expanded under it) ───────────────────
  console.log('\n[1] det_detectors with empty expanded set');
  {
    const layout = containerLayout('det_detectors', new Set(), tasks);
    assert(layout.cells.length === 7, `7 top-level family cells (got ${layout.cells.length})`);
    assert(layout.cells.every(c => c.kind === 'family'), 'every cell is a leaf family card (kind=family)');
    assert(layout.cells.every(c => c.kind !== 'container'), 'no container cells when nothing beneath is expanded');
    assert(layout.gutterL === CONTAINER_GUTTER_W && layout.gutterR === CONTAINER_GUTTER_W, 'class root reserves L/R port gutters');
    assertCellsInBounds('det_detectors (collapsed)', layout, true);
  }

  // ── 2. grid WRAPS (cols > 1) for a large family ───────────────────────────────────────────
  console.log('\n[2] det_detectors + fam_drift expanded (17 children)');
  {
    const famDriftRid = taxoRenderId('det_detectors', 'fam_drift');
    const expanded = new Set(['det_detectors', famDriftRid]);
    const layout = containerLayout('det_detectors', expanded, tasks);
    const driftCell = layout.cells.find(c => c.renderId === famDriftRid);
    assert(!!driftCell, 'fam_drift cell present at the top level');
    assert(driftCell!.kind === 'container', 'fam_drift renders as a nested container (kind=container)');
    assert(!!driftCell!.layout, 'fam_drift cell carries its nested layout');
    const nested = driftCell!.layout!;
    assert(nested.cells.length === 17, `17 instance cells inside fam_drift (got ${nested.cells.length})`);
    assert(nested.gutterL === 0 && nested.gutterR === 0, 'nested family container reserves NO port gutters');
    const cols = new Set(nested.cells.map(c => c.x)).size;
    assert(cols > 1, `grid wraps into >1 distinct column (got ${cols} distinct x offsets)`);
    const rows = new Set(nested.cells.map(c => c.y)).size;
    assert(rows > 1, `grid wraps into >1 row (got ${rows} distinct y offsets)`);
    assertCellsInBounds('fam_drift (nested)', nested, false);

    // nested sub-container sized to fit its own children (not just the fixed TAXO_H.instance)
    const maxCellX = Math.max(...nested.cells.map(c => c.x + c.w));
    const maxCellY = Math.max(...nested.cells.map(c => c.y + c.h));
    assert(nested.size.w >= maxCellX, `nested container width (${nested.size.w}) >= its widest child extent (${maxCellX})`);
    assert(nested.size.h >= maxCellY, `nested container height (${nested.size.h}) >= its tallest child extent (${maxCellY})`);
    assert(nested.size.w > TAXO_W && nested.size.h > TAXO_H.instance, 'nested container is bigger than a single leaf cell');

    // container SIZE grows with child count: det_detectors w/ fam_drift expanded is taller/wider
    // than det_detectors collapsed (17 extra instance cells behind fam_drift inflate its own cell,
    // which inflates the outer grid's row height).
    const collapsedLayout = containerLayout('det_detectors', new Set(['det_detectors']), tasks);
    assert(layout.size.h >= collapsedLayout.size.h, 'container height with fam_drift expanded >= collapsed-family height');

    assertCellsInBounds('det_detectors (+fam_drift)', layout, true);
  }

  // ── 3. container size grows with child count (monotonic across increasing family sizes) ──
  console.log('\n[3] container size grows with child count');
  {
    const small = containerLayout('proc_nightly', new Set(['proc_nightly']), tasks); // 2 families, 0 instances
    const famEvalRid = taxoRenderId('proc_nightly', 'fam_eval'); // 3 children
    const famDreamRid = taxoRenderId('proc_nightly', 'fam_dream'); // 11 children
    const withEval = containerLayout('proc_nightly', new Set(['proc_nightly', famEvalRid]), tasks);
    const withDream = containerLayout('proc_nightly', new Set(['proc_nightly', famDreamRid]), tasks);
    assert(withEval.size.h >= small.size.h, 'expanding fam_eval (3 children) does not shrink the container');
    assert(withDream.size.h > small.size.h, `expanding fam_dream (11 children) grows the container height (${small.size.h} -> ${withDream.size.h})`);
  }

  // ── 4. dream pipeline: 11 numbered cells, seq-ordered into the grid fill order ────────────
  console.log('\n[4] proc_nightly + fam_dream (11 seq-ordered dream cells)');
  {
    const famDreamRid = taxoRenderId('proc_nightly', 'fam_dream');
    const expanded = new Set(['proc_nightly', famDreamRid]);
    const layout = containerLayout('proc_nightly', expanded, tasks);
    const dreamCell = layout.cells.find(c => c.renderId === famDreamRid);
    assert(!!dreamCell && dreamCell!.kind === 'container', 'fam_dream renders as a nested container');
    const nested = dreamCell!.layout!;
    assert(nested.cells.length === 11, `11 dream instance cells (got ${nested.cells.length})`);
    assert(nested.cells.every(c => typeof c.seq === 'number'), 'every dream cell carries its seq number');
    const seqs = nested.cells.map(c => c.seq);
    assert(JSON.stringify(seqs) === JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), `cells are seq-ordered 0..10 in grid fill order (got ${seqs.join(',')})`);
    const cols = new Set(nested.cells.map(c => c.x)).size;
    assert(cols > 1, `dream grid wraps (>1 column, got ${cols})`);
    assertCellsInBounds('fam_dream (nested)', nested, false);
  }

  // ── 5. flattenContainerLayout: absolute positions, correct nesting depth ─────────────────
  console.log('\n[5] flattenContainerLayout absolute coordinates');
  {
    const famDriftRid = taxoRenderId('det_detectors', 'fam_drift');
    const expanded = new Set(['det_detectors', famDriftRid]);
    const layout = containerLayout('det_detectors', expanded, tasks);
    const ROOT_X = 500, ROOT_Y = 300;
    const flat = flattenContainerLayout('det_detectors', ROOT_X, ROOT_Y, layout);
    const root = flat.find(f => f.renderId === 'det_detectors');
    assert(!!root && root!.x === ROOT_X && root!.y === ROOT_Y, 'root container placed at the given absolute origin');
    const driftContainer = flat.find(f => f.renderId === famDriftRid);
    assert(!!driftContainer && driftContainer!.kind === 'container', 'fam_drift appears as a container entry in the flat list');
    const driftCellRel = layout.cells.find(c => c.renderId === famDriftRid)!;
    assert(
      driftContainer!.x === ROOT_X + driftCellRel.x && driftContainer!.y === ROOT_Y + driftCellRel.y,
      'fam_drift absolute position = root origin + its relative cell offset'
    );
    const instanceIds = flat.filter(f => f.kind === 'instance');
    assert(instanceIds.length === 17, `17 leaf instance entries in the flattened list (got ${instanceIds.length})`);
    // every instance's absolute position must fall within fam_drift's absolute box
    const allInsideDrift = instanceIds.every(inst =>
      inst.x >= driftContainer!.x && inst.x + inst.w <= driftContainer!.x + driftContainer!.w &&
      inst.y >= driftContainer!.y && inst.y + inst.h <= driftContainer!.y + driftContainer!.h
    );
    assert(allInsideDrift, 'every drift instance sits inside fam_drift\'s absolute box');
    const distinctIds = new Set(flat.map(f => f.renderId));
    assert(distinctIds.size === flat.length, 'no duplicate render ids in the flattened list');
  }

  console.log('\n' + (failed ? 'containerLayout check FAILED.' : 'containerLayout check PASSED.'));
  if (failed) process.exit(1);
}

main().catch(err => {
  console.error('containerLayout check threw:', err);
  process.exit(1);
});
