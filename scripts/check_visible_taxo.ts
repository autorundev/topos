/**
 * Unit test for `visibleTaxo` (W2 AC). Pure-function check, no React/DOM involved.
 *
 * Run: npx tsx scripts/check_visible_taxo.ts
 */
import { loadToposData } from '../lib/dataLoader';
import { toposService } from '../services/toposService';
import { visibleTaxo, taxoRenderId } from '../features/topos/lib/visibleTaxo';
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

async function main() {
  await loadToposData();
  const tasks: Task[] = toposService.getTasks();

  // ── 1. empty expanded → nothing visible ──────────────────────────────────
  console.log('\n[1] empty expanded set');
  {
    const { nodes, contains, seq } = visibleTaxo(new Set(), tasks);
    assert(nodes.length === 0, `0 taxo nodes (got ${nodes.length})`);
    assert(contains.length === 0, `0 contains edges (got ${contains.length})`);
    assert(seq.length === 0, `0 seq edges (got ${seq.length})`);
  }

  // ── 2. expand det_detectors → its families only ──────────────────────────
  console.log('\n[2] expand det_detectors');
  {
    const expanded = new Set(['det_detectors']);
    const { nodes, contains, seq } = visibleTaxo(expanded, tasks);
    const families = nodes.filter(n => n.kind === 'family');
    const instances = nodes.filter(n => n.kind === 'instance');
    assert(families.length === 7, `7 families visible (got ${families.length}: ${families.map(f => f.taxoId).join(', ')})`);
    assert(instances.length === 0, `0 instances visible (got ${instances.length})`);
    assert(contains.length === 7, `7 contains edges (got ${contains.length})`);
    assert(seq.length === 0, `0 seq edges (got ${seq.length})`);
    assert(contains.every(e => e.source === 'det_detectors'), 'every contains edge sources from det_detectors');
    assert(nodes.every(n => n.classId === 'det_detectors'), 'every node tagged classId=det_detectors');
    assert(new Set(nodes.map(n => n.id)).size === nodes.length, 'no duplicate node ids');

    // ── 3. also expand family fam_drift (real id from data/taxonomy.ts) ────
    console.log('\n[3] + expand family fam_drift');
    const famDriftRid = taxoRenderId('det_detectors', 'fam_drift');
    assert(families.some(f => f.id === famDriftRid), `fam_drift render id present (${famDriftRid})`);
    const expanded2 = new Set([...expanded, famDriftRid]);
    const r2 = visibleTaxo(expanded2, tasks);
    const driftInstances = r2.nodes.filter(n => n.kind === 'instance' && n.classId === 'det_detectors');
    assert(driftInstances.length === 17, `17 drift instances appear (got ${driftInstances.length})`);
    assert(r2.nodes.length === 7 + 17, `total visible = 7 families + 17 instances (got ${r2.nodes.length})`);
    assert(r2.contains.length === 7 + 17, `contains edges = 7 (class→family) + 17 (family→instance) (got ${r2.contains.length})`);
    assert(
      r2.contains.filter(e => e.source === famDriftRid).length === 17,
      '17 contains edges sourced from fam_drift'
    );
    assert(new Set(r2.nodes.map(n => n.id)).size === r2.nodes.length, 'no duplicate node ids');

    // ── collapse: remove fam_drift from expanded → drift instances vanish ──
    console.log('\n[collapse] remove fam_drift');
    const r2Collapsed = visibleTaxo(expanded, tasks); // back to just det_detectors expanded
    assert(
      r2Collapsed.nodes.filter(n => n.kind === 'instance').length === 0,
      'instances gone after collapsing fam_drift'
    );
    assert(r2Collapsed.nodes.length === 7, 'back to 7 visible nodes after collapse');
  }

  // ── 4. proc_nightly → fam_dream: seq-ordered dream pipeline ──────────────
  console.log('\n[4] expand proc_nightly then fam_dream (seq-ordered)');
  {
    const expandedClass = new Set(['proc_nightly']);
    const r1 = visibleTaxo(expandedClass, tasks);
    const fams = r1.nodes.filter(n => n.kind === 'family');
    assert(fams.length === 2, `2 families under proc_nightly (dream, eval) (got ${fams.length})`);
    assert(r1.nodes.filter(n => n.kind === 'instance').length === 0, '0 instances before fam_dream expanded');

    const famDreamRid = taxoRenderId('proc_nightly', 'fam_dream');
    assert(fams.some(f => f.id === famDreamRid), `fam_dream render id present (${famDreamRid})`);

    const expandedFull = new Set(['proc_nightly', famDreamRid]);
    const r2 = visibleTaxo(expandedFull, tasks);
    const dreamInstances = r2.nodes.filter(n => n.kind === 'instance' && n.taxoId.startsWith('dream_'));
    assert(dreamInstances.length === 11, `11 dream instances visible (got ${dreamInstances.length})`);
    assert(r2.seq.length === 10, `10 seq edges chaining 11 ordered siblings (got ${r2.seq.length})`);

    // Reconstruct the chain from the seq edges and assert it matches orient..meta in order.
    const byId = new Map(r2.nodes.map(n => [n.id, n]));
    const expectedOrder = [
      'dream_orient', 'dream_gather', 'dream_consolidate', 'dream_prune', 'dream_identity_review',
      'dream_trajectory_review', 'dream_bottom_up', 'dream_formulation_review', 'dream_secretary',
      'dream_curation', 'dream_meta',
    ];
    // seq edges aren't guaranteed to be pre-sorted by position in the array — sort by source's
    // underlying taxonomy `seq` number (we don't have direct access here, so instead verify by
    // walking the edge chain from the first node with no incoming seq edge).
    const targets = new Set(r2.seq.map(e => e.target));
    const sources = new Set(r2.seq.map(e => e.source));
    const startCandidates = [...sources].filter(s => !targets.has(s));
    assert(startCandidates.length === 1, `exactly one chain start (got ${startCandidates.length})`);
    const chain: string[] = [];
    let cur = startCandidates[0];
    const edgeBySource = new Map(r2.seq.map(e => [e.source, e.target]));
    while (cur) {
      chain.push(byId.get(cur)?.taxoId ?? cur);
      cur = edgeBySource.get(cur) as string;
    }
    assert(chain.length === 11, `chain walks all 11 nodes (got ${chain.length})`);
    assert(
      JSON.stringify(chain) === JSON.stringify(expectedOrder),
      `seq order is orient→...→meta exactly (got: ${chain.join(' → ')})`
    );
    assert(new Set(r2.nodes.map(n => n.id)).size === r2.nodes.length, 'no duplicate node ids');
  }

  // ── 5. cross-class id-collision guard: fam_graph/fam_meta/fam_secretary ──
  // exist under BOTH tool_retrieve and store_vault with different content — verify both
  // classes' families render as DISTINCT, non-colliding nodes when both are expanded together.
  console.log('\n[5] cross-class id-collision guard (tool_retrieve + store_vault both expanded)');
  {
    const expanded = new Set(['tool_retrieve', 'store_vault']);
    const { nodes, contains } = visibleTaxo(expanded, tasks);
    assert(new Set(nodes.map(n => n.id)).size === nodes.length, 'no duplicate node ids across two classes');
    const toolFamGraph = nodes.find(n => n.id === taxoRenderId('tool_retrieve', 'fam_graph'));
    const vaultFamGraph = nodes.find(n => n.id === taxoRenderId('store_vault', 'fam_graph'));
    assert(!!toolFamGraph && !!vaultFamGraph, 'both fam_graph families present under their own classId-qualified id');
    assert(toolFamGraph!.id !== vaultFamGraph!.id, 'the two fam_graph nodes have distinct render ids');
    assert(toolFamGraph!.name !== vaultFamGraph!.name, 'the two fam_graph families have distinct names (graph vs граф)');
    const toolFamMeta = nodes.find(n => n.id === taxoRenderId('tool_retrieve', 'fam_meta'));
    const vaultFamMeta = nodes.find(n => n.id === taxoRenderId('store_vault', 'fam_meta'));
    assert(!!toolFamMeta && !!vaultFamMeta, 'both fam_meta families present under their own classId-qualified id');
    assert(contains.length === nodes.length, 'one contains edge per visible top-level family node');
  }

  console.log('\n' + (failed ? 'visibleTaxo check FAILED.' : 'visibleTaxo check PASSED.'));
  if (failed) process.exit(1);
}

main().catch(err => {
  console.error('visibleTaxo check threw:', err);
  process.exit(1);
});
