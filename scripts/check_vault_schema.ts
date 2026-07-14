/**
 * VAULT_SCHEMA integrity check (Blueprint amendment 2026-07-14). Re-derives ground truth by
 * shelling out to scripts/extract_vault_schema.py and cross-checks data/vault_schema.ts.
 * Run: npx tsx scripts/check_vault_schema.ts
 */
import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { VAULT_SCHEMA } from '../data/vault_schema';
import { TAXONOMY } from '../data/taxonomy';
import type { TaxoNode } from '../types';

let failed = false;
function assert(cond: boolean, label: string) {
  if (cond) console.log(`  PASS  ${label}`);
  else { console.error(`  FAIL  ${label}`); failed = true; }
}

function flatten(nodes: TaxoNode[]): TaxoNode[] {
  const out: TaxoNode[] = [];
  for (const n of nodes) { out.push(n); if (n.children) out.push(...flatten(n.children)); }
  return out;
}

const raw = execFileSync('python3', [path.join(__dirname, 'extract_vault_schema.py')], { encoding: 'utf-8' });
const extracted: Record<string, { name: string; type: string; required: boolean }[]> = JSON.parse(raw);

let matched = 0, mismatched: string[] = [];
for (const [taxoId, schema] of Object.entries(VAULT_SCHEMA)) {
  const live = extracted[schema.table];
  if (!live) { mismatched.push(`${taxoId}: table '${schema.table}' not found by extractor`); continue; }
  const eq = JSON.stringify(live) === JSON.stringify(schema.columns);
  if (eq) matched++; else mismatched.push(`${taxoId}: column mismatch vs live extraction`);
}
assert(mismatched.length === 0, `all ${Object.keys(VAULT_SCHEMA).length} VAULT_SCHEMA entries match the live extractor (${matched} matched, ${mismatched.length} mismatched)`);
if (mismatched.length) mismatched.forEach(m => console.error(`    ${m}`));

const storeVaultNames = flatten(TAXONOMY['store_vault'] ?? [])
  .filter(n => n.kind === 'instance' && n.status !== 'dead' && !n.name.includes('.'))
  .map(n => n.name);
console.log(`store_vault non-dead, non-column-note instances: ${storeVaultNames.length}; VAULT_SCHEMA entries: ${Object.keys(VAULT_SCHEMA).length}`);

console.log('\n' + (failed ? 'vault_schema check FAILED.' : 'vault_schema check PASSED.'));
if (failed) process.exit(1);
