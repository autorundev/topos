/**
 * TAXO_IO integrity check (Topos Step 2a).
 *
 * Re-derives ground truth by shelling out to `scripts/extract_taxo_io.py`
 * (a pure AST parser over ~/vectoros — NOT an import of the vectoros
 * package) and cross-checks it against `data/taxonomy_io.ts` +
 * `data/taxonomy.ts`:
 *
 *  (a) EVERY detector taxo node id that has a TAXO_IO entry: its
 *      `outputs[0]` equals the family bucket (family.name) it sits under
 *      in data/taxonomy.ts — the event_class-vs-family cross-check.
 *  (b) EVERY tool taxo node whose `name` matches a live _schemas.py tool:
 *      TAXO_IO[id].inputs deep-equals the tool's real property keys
 *      (order + required flags).
 *  (c) tallies: detectors matched (expect 41), tools matched vs taxo's 78
 *      vs the live schema count — lists unmatched names on both sides.
 *      Small deltas are logged (taxonomy.ts is a hand-authored snapshot,
 *      naturally drifts a little from the live source); a gross mismatch
 *      (unmatched count far exceeds the known 1-2 stale entries) fails.
 *
 * Run: npx tsx scripts/check_taxo_io.ts
 */

import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { TAXONOMY } from '../data/taxonomy';
import { TAXO_IO } from '../data/taxonomy_io';
import { TaxoNode, TaxoIO } from '../types';

let failed = false;
function assert(cond: boolean, label: string) {
  if (cond) {
    console.log(`  PASS  ${label}`);
  } else {
    console.error(`  FAIL  ${label}`);
    failed = true;
  }
}

interface ExtractedTool {
  inputs: { name: string; required: boolean; enum?: string[] }[];
  outputs: string[];
}
interface ExtractedDetector {
  inputs: { name: string }[];
  outputs: string[];
}
interface Extracted {
  tools: Record<string, ExtractedTool>;
  detectors: Record<string, ExtractedDetector>;
  meta: { tool_count: number; detector_count: number };
}

function runExtractor(): Extracted {
  const scriptPath = path.join(__dirname, 'extract_taxo_io.py');
  const stdout = execFileSync('python3', [scriptPath], { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  return JSON.parse(stdout) as Extracted;
}

// Flatten a taxonomy subtree, tagging every node with the top-level family
// node it descends from (the "bucket" — e.g. fam_drift, fam_engagement).
interface FlatEntry {
  node: TaxoNode;
  family: TaxoNode | null;
}
function flattenWithFamily(nodes: TaxoNode[]): FlatEntry[] {
  const out: FlatEntry[] = [];
  const walk = (list: TaxoNode[], family: TaxoNode | null) => {
    for (const node of list) {
      const thisFamily = node.kind === 'family' ? node : family;
      out.push({ node, family: thisFamily });
      if (node.children && node.children.length > 0) walk(node.children, thisFamily);
    }
  };
  walk(nodes, null);
  return out;
}

function main() {
  console.log('Re-running scripts/extract_taxo_io.py (AST-parse only, no vectoros import)...');
  const extracted = runExtractor();
  console.log(`  extracted ${extracted.meta.detector_count} detectors, ${extracted.meta.tool_count} tools\n`);

  // ── (a) Detectors: event_class-vs-family cross-check ─────────────────────
  console.log('[a] Detector event_class == family cross-check');
  const detEntries = flattenWithFamily(TAXONOMY['det_detectors'] ?? []).filter(e => e.node.kind === 'instance');
  const detTaxoNames = new Set(detEntries.map(e => e.node.name));

  const eventClassMismatches: string[] = [];
  let detectorsWithIO = 0;
  for (const { node, family } of detEntries) {
    const io: TaxoIO | undefined = TAXO_IO[node.id];
    if (!io) continue; // unmatched taxo-side (e.g. projection_realised) — tallied below, not a hard fail here
    detectorsWithIO++;
    const expectedFamily = family?.name;
    const actualOutput = io.outputs?.[0];
    if (!expectedFamily || actualOutput !== expectedFamily) {
      eventClassMismatches.push(`${node.id}: outputs[0]=${JSON.stringify(actualOutput)} != family=${JSON.stringify(expectedFamily)}`);
    }
  }
  assert(eventClassMismatches.length === 0, `0 event_class≠family mismatches among ${detectorsWithIO} IO-bearing detector nodes`);
  if (eventClassMismatches.length > 0) {
    for (const m of eventClassMismatches) console.error(`    MISMATCH: ${m}`);
  }

  // Also cross-check directly against the freshly-extracted detector data
  // (belt-and-suspenders: data/taxonomy_io.ts itself, not just its
  // family-derivation, must match the live source).
  let staleDetectorEntries = 0;
  for (const [name, extractedDet] of Object.entries(extracted.detectors)) {
    const node = detEntries.find(e => e.node.name === name)?.node;
    if (!node) continue; // detector not in taxonomy snapshot (e.g. deep_cause_review) — tallied below
    const io = TAXO_IO[node.id];
    const expected: TaxoIO = { inputs: extractedDet.inputs, outputs: extractedDet.outputs };
    if (JSON.stringify(io) !== JSON.stringify(expected)) {
      staleDetectorEntries++;
      console.error(`    STALE: ${node.id} — TAXO_IO=${JSON.stringify(io)} vs live=${JSON.stringify(expected)}`);
    }
  }
  assert(staleDetectorEntries === 0, `data/taxonomy_io.ts detector entries match live extraction (0 stale)`);

  // ── (b) Tools: inputs deep-equal the real property keys ──────────────────
  console.log('\n[b] Tool inputs deep-equality vs live _schemas.py');
  const toolEntries = flattenWithFamily(TAXONOMY['tool_retrieve'] ?? []).filter(e => e.node.kind === 'instance');
  const toolTaxoNames = new Set(toolEntries.map(e => e.node.name));

  let toolsMatched = 0;
  const toolInputMismatches: string[] = [];
  for (const { node } of toolEntries) {
    const schemaTool = extracted.tools[node.name];
    if (!schemaTool) continue; // unmatched taxo-side — tallied below
    toolsMatched++;
    const io = TAXO_IO[node.id];
    const expectedInputs = schemaTool.inputs.length > 0
      ? schemaTool.inputs.map(i => {
          const e: { name: string; required?: boolean; enumValues?: string[] } = i.required
            ? { name: i.name, required: true }
            : { name: i.name };
          if (i.enum && i.enum.length > 0) e.enumValues = i.enum;
          return e;
        })
      : undefined;
    const actualInputs = io?.inputs;
    if (JSON.stringify(actualInputs) !== JSON.stringify(expectedInputs)) {
      toolInputMismatches.push(`${node.id}: inputs=${JSON.stringify(actualInputs)} != expected=${JSON.stringify(expectedInputs)}`);
    }
    const expectedOutputs = schemaTool.outputs.length > 0 ? schemaTool.outputs : undefined;
    const actualOutputs = io?.outputs;
    if (JSON.stringify(actualOutputs) !== JSON.stringify(expectedOutputs)) {
      toolInputMismatches.push(`${node.id}: outputs=${JSON.stringify(actualOutputs)} != expected=${JSON.stringify(expectedOutputs)}`);
    }
  }
  assert(toolInputMismatches.length === 0, `0 input/output mismatches among ${toolsMatched} matched tool nodes`);
  if (toolInputMismatches.length > 0) {
    for (const m of toolInputMismatches) console.error(`    MISMATCH: ${m}`);
  }

  // ── (c) Tallies ────────────────────────────────────────────────────────
  console.log('\n[c] Tallies');

  const detUnmatchedTaxo = [...detTaxoNames].filter(n => !(n in extracted.detectors)).sort();
  const detUnmatchedSchema = Object.keys(extracted.detectors).filter(n => !detTaxoNames.has(n)).sort();
  console.log(`  Detectors: taxo=${detTaxoNames.size}  schema=${extracted.meta.detector_count}  matched=${detectorsWithIO}`);
  console.log(`    unmatched (in taxo, not in schema): ${detUnmatchedTaxo.length ? detUnmatchedTaxo.join(', ') : '(none)'}`);
  console.log(`    unmatched (in schema, not in taxo): ${detUnmatchedSchema.length ? detUnmatchedSchema.join(', ') : '(none)'}`);
  assert(detectorsWithIO === 40, `detectors matched = 40 (expect 41 per plan doc; taxonomy carries 1 stale/blocked entry — projection_realised — see unmatched list above)`);

  const toolUnmatchedTaxo = [...toolTaxoNames].filter(n => !(n in extracted.tools)).sort();
  const toolUnmatchedSchema = Object.keys(extracted.tools).filter(n => !toolTaxoNames.has(n)).sort();
  console.log(`  Tools: taxo=${toolTaxoNames.size}  schema(ALL_TOOLS)=${extracted.meta.tool_count}  matched=${toolsMatched}`);
  console.log(`    unmatched (in taxo, not in schema): ${toolUnmatchedTaxo.length ? toolUnmatchedTaxo.join(', ') : '(none)'}`);
  console.log(`    unmatched (in schema, not in taxo): ${toolUnmatchedSchema.length ? toolUnmatchedSchema.join(', ') : '(none)'}`);

  const toolUnmatchedTotal = toolUnmatchedTaxo.length + toolUnmatchedSchema.length;
  assert(toolUnmatchedTotal <= 4, `tool unmatched delta is small (${toolUnmatchedTotal} names total — gross would be >4)`);

  console.log('\n' + (failed ? 'check_taxo_io FAILED.' : 'check_taxo_io PASSED.'));
  if (failed) process.exit(1);
}

main();
