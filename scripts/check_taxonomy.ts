/**
 * Taxonomy integrity check (throwaway/CI-lite, per W1 AC).
 *
 * Asserts:
 *  - every TAXONOMY key resolves via toposService.getTaskById(key) (a real task id)
 *  - every child `id` is unique within its class subtree
 *
 * Prints per-class instance counts (leaf kind==='instance') + a total, and
 * flags gross mismatches against the internals ballpark counts (small
 * deviations are expected and logged, not failed).
 *
 * Run: npx tsx scripts/check_taxonomy.ts
 */

import { loadToposData } from '../lib/dataLoader';
import { toposService } from '../services/toposService';
import { TAXONOMY } from '../data/taxonomy';
import { TaxoNode } from '../types';

// Ballpark expectations from internals.html (extracted 2026-07-08). Small
// deviations are OK (logged); gross mismatches (>20% off) are flagged.
const EXPECTED: Record<string, { label: string; count: number }> = {
  det_detectors: { label: 'detectors', count: 41 },
  trig_connector_sync: { label: 'connectors', count: 16 },
  tool_retrieve: { label: 'tools', count: 78 },
  store_vault: { label: 'vault+admin', count: 65 + 29 },
  trig_cron: { label: 'crons', count: 46 },
  brain_core: { label: 'personas+models (7+3)', count: 10 },
};

function flatten(nodes: TaxoNode[]): TaxoNode[] {
  const out: TaxoNode[] = [];
  const walk = (list: TaxoNode[]) => {
    for (const node of list) {
      out.push(node);
      if (node.children && node.children.length > 0) walk(node.children);
    }
  };
  walk(nodes);
  return out;
}

async function main() {
  await loadToposData();

  let hadError = false;
  const rows: Array<{ classId: string; taskName: string; instances: number; families: number; note: string }> = [];
  let totalInstances = 0;

  for (const [classId, nodes] of Object.entries(TAXONOMY)) {
    // 1. every TAXONOMY key resolves to a real task id
    const task = toposService.getTaskById(classId);
    if (!task) {
      console.error(`FAIL: TAXONOMY key '${classId}' does not resolve via toposService.getTaskById()`);
      hadError = true;
      continue;
    }

    // 2. every child id unique within its class subtree
    const flat = flatten(nodes);
    const seen = new Map<string, number>();
    for (const node of flat) {
      seen.set(node.id, (seen.get(node.id) ?? 0) + 1);
    }
    const dups = [...seen.entries()].filter(([, count]) => count > 1);
    if (dups.length > 0) {
      console.error(
        `FAIL: '${classId}' has duplicate ids within its subtree: ${dups
          .map(([id, count]) => `${id} (x${count})`)
          .join(', ')}`
      );
      hadError = true;
    }

    const instanceCount = flat.filter(n => n.kind === 'instance').length;
    const familyCount = flat.filter(n => n.kind === 'family').length;
    totalInstances += instanceCount;

    let note = '';
    const expected = EXPECTED[classId];
    if (expected) {
      const delta = instanceCount - expected.count;
      const pct = expected.count > 0 ? Math.abs(delta) / expected.count : 0;
      if (pct > 0.2) {
        note = `GROSS MISMATCH vs internals ${expected.label}=${expected.count} (delta ${delta >= 0 ? '+' : ''}${delta})`;
        console.error(`FAIL: '${classId}' instance count ${instanceCount} is a gross mismatch vs expected ~${expected.count} (${expected.label})`);
        hadError = true;
      } else if (delta !== 0) {
        note = `minor deviation vs internals ${expected.label}=${expected.count} (delta ${delta >= 0 ? '+' : ''}${delta})`;
      } else {
        note = `matches internals ${expected.label}=${expected.count}`;
      }
    }

    rows.push({ classId, taskName: task.name, instances: instanceCount, families: familyCount, note });
  }

  // --- print tally table ---
  console.log('\nTaxonomy tallies:\n');
  const colClass = Math.max(...rows.map(r => r.classId.length), 'class id'.length) + 2;
  const colName = Math.max(...rows.map(r => r.taskName.length), 'task name'.length) + 2;
  console.log(
    'class id'.padEnd(colClass) + 'task name'.padEnd(colName) + 'families'.padEnd(10) + 'instances'.padEnd(11) + 'note'
  );
  console.log('-'.repeat(colClass + colName + 10 + 11 + 40));
  for (const r of rows) {
    console.log(
      r.classId.padEnd(colClass) +
        r.taskName.padEnd(colName) +
        String(r.families).padEnd(10) +
        String(r.instances).padEnd(11) +
        r.note
    );
  }
  console.log('-'.repeat(colClass + colName + 10 + 11 + 40));
  console.log(`TOTAL instances across all classes: ${totalInstances}\n`);

  if (hadError) {
    console.error('Taxonomy integrity check FAILED.');
    process.exit(1);
  }
  console.log('Taxonomy integrity check PASSED (no gross mismatches, no duplicate ids, all keys resolve).');
}

main().catch(err => {
  console.error('Taxonomy integrity check threw:', err);
  process.exit(1);
});
