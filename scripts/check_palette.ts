/**
 * Regression check: every hex in data/palette.ts stays inside its mode's OKLCH lightness band.
 * This is the ONE check from the dataviz validator's report that's cheap enough to keep as a
 * standing repo invariant (no external tool dependency). CVD/contrast were validated once at
 * derivation time (see the plan's Task 3 record) — rerun the dataviz skill's validator by hand if
 * any hex here is ever touched again; don't hand-tune without it.
 *
 * Run: npx tsx scripts/check_palette.ts
 */
import { NATURE_HEX, CLUSTER_HEX } from '../data/palette';

let failed = false;
function assert(cond: boolean, label: string) {
  if (cond) console.log(`  PASS  ${label}`);
  else { console.error(`  FAIL  ${label}`); failed = true; }
}

function hexToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

// sRGB hex -> OKLab L (Björn Ottosson's OKLab, standard coefficients)
function oklchLightness(hex: string): number {
  const r = hexToLinear(parseInt(hex.slice(1, 3), 16));
  const g = hexToLinear(parseInt(hex.slice(3, 5), 16));
  const b = hexToLinear(parseInt(hex.slice(5, 7), 16));
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
}

const BAND: Record<'light' | 'dark', [number, number]> = { light: [0.43, 0.77], dark: [0.48, 0.67] };

function checkGroup(name: string, mode: 'light' | 'dark', hexes: Record<string, string>) {
  const [lo, hi] = BAND[mode];
  for (const [key, hex] of Object.entries(hexes)) {
    const L = oklchLightness(hex);
    assert(L >= lo && L <= hi, `${name} ${mode} ${key} (${hex}) L=${L.toFixed(3)} inside [${lo}, ${hi}]`);
  }
}

checkGroup('nature', 'light', NATURE_HEX.light);
checkGroup('nature', 'dark', NATURE_HEX.dark);
checkGroup('cluster', 'light', CLUSTER_HEX.light);
checkGroup('cluster', 'dark', CLUSTER_HEX.dark);

console.log('\n' + (failed ? 'palette check FAILED.' : 'palette check PASSED.'));
if (failed) process.exit(1);
