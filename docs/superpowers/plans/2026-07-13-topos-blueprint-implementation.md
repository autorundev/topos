# Topos "Blueprint" Visual + Motion Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Topos canvas from generic (Inter + OS monospace, ELK-snap reflow) to the
owner-approved "Blueprint" identity — Geist-mono-forward engineering-schematic aesthetic, computed
categorical color, circuit-terminal ports, masonry layout, and interruptible motion — with zero change
to the underlying taxonomy data or ELK layout logic.

**Architecture:** All work lands in `features/topos/components/CanvasPage.tsx` (node components +
layout), `features/topos/lib/containerLayout.ts` (pure masonry packing), `index.css`/`index.html`
(fonts, tokens, motion), and one new file `data/palette.ts` (the derived, validated color source of
truth). No backend, no data-model change, no ELK-orchestration change.

**Tech Stack:** React 19, `@xyflow/react` (React Flow) v12, `elkjs`, TypeScript strict, Vite 6, plain
CSS (no animation library added — see Global Constraints).

## Global Constraints

- **Design spec of record:** `docs/superpowers/specs/2026-07-13-topos-blueprint-design.md`. **Brand of
  record:** `.agents/brand-context.md`. Both owner-approved 2026-07-13. Where this plan and the design
  spec differ in a literal word choice (see "Spring vs. CSS transition" below), the plan's choice is the
  one to implement; it satisfies the spec's underlying intent.
- **Typography = Geist Mono everywhere (incl. masthead), Geist Sans only for prose longer than a line.
  No serif. No Inter.** (`.agents/brand-context.md` DECISION A.)
- **Color is computed, never hand-tuned.** The exact hex values in Task 3 were derived by iterating
  candidates through `dataviz`'s `scripts/validate_palette.js` in this session until every check
  PASSed for both the light and dark surface. Do not adjust any hex value in this plan without
  re-running that validator (or an equivalent OKLCH-lightness + CVD-ΔE check) — copy the exact values
  given, do not approximate.
- **Spring vs. CSS transition (documented simplification):** the design spec calls the reflow animation
  a "critically-damped spring". This plan implements it as a **CSS transition on `transform` with a
  strong custom `ease-out` cubic-bezier**, not a JS spring library. Reasoning: (a) no animation library
  is in `package.json` and this plan does not add one — the existing dependency set stays unchanged;
  (b) a native CSS transition on a browser-computed `transform` **is** interruptible/retargetable
  (emil-design-eng: "CSS transitions over keyframes for interruptible UI" — a re-target mid-transition
  smoothly blends, satisfying review-animations' non-negotiable #6); (c) the reflow here is a
  programmatic re-layout (ELK), not a hand-drag gesture, so true physical velocity hand-off (relevant to
  direct manipulation) does not apply. This is a deliberate, in-scope substitution, not a silent
  deviation.
- **No data changes.** `data/taxonomy.ts` / `data/taxonomy_io.ts` are extractor-generated +
  self-checked (`scripts/check_taxo_io.ts` re-runs `scripts/extract_taxo_io.py` and diffs). Task 7 is
  the ONE task that touches extracted data, and it does so by fixing the extractor and regenerating —
  never by hand-editing the `.ts` output.
- **Verification pattern for this plan (adapted from strict TDD):** this project's own established
  convention for CanvasPage work (see prior waves W1/W2/Step1/Step2 in `docs/superpowers/specs/`) is
  `npx tsc --noEmit` (only the pre-existing unrelated `netlify/edge-functions/inject-meta.ts` error is
  allowed) + `npm run build` green + a Puppeteer screenshot for visual/motion tasks, and the existing
  `scripts/check_*.ts` pure-function tests for logic tasks (palette lightness, containerLayout masonry).
  Every task below uses whichever of these applies; tasks with a pure-function deliverable (Task 3,
  Task 8) follow literal write-test-first TDD.
- **Deploy discipline (only at the end, wave-by-wave optional):** `npm run build && rsync -a --delete
  dist/ ~/autorun.dev/p/topos/vector/`; verify = dist↔served `assets/CanvasPage-*.js` hash parity +
  `curl` 401. Executors never touch `.env`, never restart services, never run docker in a worktree.
  Fresh worktree needs `ln -s /home/anton/topos/node_modules ./node_modules`.
- **Regression bar:** collapsed-class rendering, ELK two-pass layout, `computeLayout`, namespaced render
  ids (`classId::taxoId`), flow-edge handle ids, zoom/minimap removal (stay removed) — all unchanged in
  logic. `git branch --show-current` before every commit (per-project parallel-session rule).

---

## Task 1: Fonts — Geist Mono + Geist Sans, drop Inter/Instrument Serif/OS-monospace

**Files:**
- Modify: `index.html:38` (font `<link>`)
- Modify: `index.css:46-58` (body font-family, drop `.font-instrument`)
- Modify: `features/topos/components/CanvasPage.tsx` (34x `fontFamily: 'monospace'` → `var(--font-mono)`)
- Test: manual — Puppeteer screenshot + computed-style check (see Step 5)

**Interfaces:**
- Produces: CSS custom properties `--font-mono` and `--font-sans` on `:root` (index.css), consumed by
  every subsequent task that sets `fontFamily`.

- [ ] **Step 1: Swap the Google Fonts `<link>`**

In `index.html`, replace line 38:

```html
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

with:

```html
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Define `--font-mono`/`--font-sans` tokens, update body, drop `.font-instrument`**

In `index.css`, replace lines 5-22 (`:root { ... }`) — insert two new lines right after the opening
brace (before `--bg:`):

```css
:root {
  --font-mono: 'Geist Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --bg: #F9F9F7;
```

(leave the rest of the `:root` block — `--surface` through `--color-brand-rose` — unchanged).

Replace lines 46-58:

```css
body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--text-main);
}

#root {
  height: 100%;
}

.font-instrument {
  font-family: 'Instrument Serif', serif;
}
```

with:

```css
body {
  font-family: var(--font-sans);
  background-color: var(--bg);
  color: var(--text-main);
}

#root {
  height: 100%;
}
```

(`.font-instrument` is deleted outright — confirmed zero usages via `grep -rn "font-instrument"
features App.tsx`.)

- [ ] **Step 3: Replace all 34 inline `'monospace'` references in one mechanical pass**

Every occurrence in `features/topos/components/CanvasPage.tsx` is the byte-identical substring
`fontFamily: 'monospace'`. Use a single `replace_all` edit:

- Find: `fontFamily: 'monospace'`
- Replace: `fontFamily: 'var(--font-mono)'`
- `replace_all: true`

This touches lines 371, 386, 474, 475, 486, 495, 532, 569, 628, 629, 652, 663, 681, 682, 1028, 1045,
1056, 1118, 1124, 1125, 1126, 1133, 1160, 1181, 1187, 1188, 1191, 1208, 1214, 1215, 1218, 1233, 1239,
1243 (34 total) — verify the count matches after the edit:

```bash
grep -c "fontFamily: 'var(--font-mono)'" features/topos/components/CanvasPage.tsx
```

Expected: `34`. And confirm zero literal `'monospace'` remain:

```bash
grep -c "fontFamily: 'monospace'" features/topos/components/CanvasPage.tsx
```

Expected: `0`.

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"
```

Expected: `1` (only the pre-existing `netlify/edge-functions/inject-meta.ts` error).

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ built` with no new errors.

- [ ] **Step 5: Puppeteer screenshot + computed-font verification**

Launch the dev preview and screenshot the canvas, then assert the computed font on a labeled node
element actually resolves to Geist Mono (catches a wrong Google-Fonts family-name silently falling back
to the generic `monospace` keyword, which would look identical in a screenshot but fail the brand
requirement):

```js
// scratchpad/verify-fonts.mjs — run with: node scratchpad/verify-fonts.mjs
import puppeteer from '/home/anton/topos/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';
const CHROME = process.env.CHROME_PATH; // pass the cached Chrome binary path
const b = await puppeteer.launch({ headless: 'new', executablePath: CHROME, args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle0' }); // vite preview port
await p.evaluate(() => document.fonts.ready);
const bodyFont = await p.evaluate(() => getComputedStyle(document.body).fontFamily);
const monoFont = await p.evaluate(() => {
  const el = document.querySelector('.react-flow__node');
  return el ? getComputedStyle(el).fontFamily : null;
});
console.log('body font:', bodyFont);
console.log('node font:', monoFont);
if (!bodyFont.includes('Geist')) { console.error('FAIL: body is not Geist'); process.exit(1); }
await p.screenshot({ path: 'scratchpad/task1-fonts.png' });
await b.close();
console.log('OK');
```

Run `npm run build && npx vite preview --port 4173 &` then the script above; confirm `body font`
contains `Geist` and the screenshot shows Geist Mono glyphs (distinctive `1`/`l`/`I` disambiguation) in
node labels, not a generic system mono. Kill the preview server after.

- [ ] **Step 6: Commit**

```bash
git add index.html index.css features/topos/components/CanvasPage.tsx
git commit -m "topos: brand fonts — Geist Mono + Geist Sans, drop Inter/Instrument Serif"
```

---

## Task 2: Ease tokens + delete dead marketing CSS

**Files:**
- Modify: `index.css:118-183` (delete dead animation CSS, add ease tokens)

**Interfaces:**
- Produces: CSS custom properties `--ease-out` and `--ease-in-out` on `:root`, consumed by Task 11/12
  (motion) and any transition that wants a stronger curve than the browser default.

- [ ] **Step 1: Add ease tokens to `:root`**

In `index.css`, extend the `:root` block from Task 1 (insert after `--font-sans`):

```css
:root {
  --font-mono: 'Geist Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --bg: #F9F9F7;
```

- [ ] **Step 2: Delete dead marketing CSS**

Verified unused (`grep -rnE "animate-fade|animate-scale|card-hover|stagger-[123]" features App.tsx` →
zero hits outside `index.css` itself). Delete lines 118-176 in full — the block from the `/* Animations
for marketing pages */` comment through the end of `.card-hover:hover`:

```css
/* Animations for marketing pages */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-scale-in {
  animation: scale-in 0.4s ease-out forwards;
}

.animate-fade-in {
  animation: fade-in-up 0.3s ease-out forwards;
}

/* Staggered animation delays */
.stagger-1 {
  animation-delay: 0.1s;
}

.stagger-2 {
  animation-delay: 0.2s;
}

.stagger-3 {
  animation-delay: 0.3s;
}

/* Card hover effect */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

`.rf-brick:hover` (the following block, real/used) stays untouched here — it is reworked in Task 10.

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1 (pre-existing netlify error)
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 4: Commit**

```bash
git add index.css
git commit -m "topos: ease tokens + delete dead marketing CSS"
```

---

## Task 3: Derived + validated color palette module (nature + cluster, light + dark)

**Files:**
- Create: `data/palette.ts`
- Create: `scripts/check_palette.ts`
- Modify: `features/topos/components/CanvasPage.tsx` (NATURES restructure — see exact line list below)
- Modify: `data/layers.ts` — NO changes (its static `color` field becomes unused by `ZoneNode` after
  this task but is left in place; it's descriptive data, not code, and touching it is out of scope —
  see Task-level note at the end)

**Interfaces:**
- Produces: `NATURE_HEX: Record<'light'|'dark', Record<NodeNature, string>>`,
  `CLUSTER_HEX: Record<'light'|'dark', Record<'inbound'|'internal'|'outbound', string>>`,
  `natureColorFor(nature: NodeNature, isDark: boolean): string`,
  `clusterColorFor(slug: 'inbound'|'internal'|'outbound', isDark: boolean): string` — all from
  `data/palette.ts`. Consumed by every subsequent task that paints a nature- or cluster-colored surface.
- Consumes: `NodeNature` type from `../types` (already exists, unchanged).

### Derivation record (already run in-session — do not re-derive, just encode)

Every value below was validated via `dataviz`'s `scripts/validate_palette.js` (light band 0.43–0.77,
dark band 0.48–0.67 OKLCH lightness; CVD ΔE target ≥12/floor 8; contrast ≥3:1 vs the mode's surface).
Light-mode values are the app's pre-existing hexes (validated as-is: `ALL CHECKS PASS`, with two WARNs
that are legal because Topos already carries the mandatory secondary encoding — see below). Dark-mode
values needed two changes (nature `human`, cluster `outbound`) to clear the dark lightness band; both
were iterated to PASS with the best available tritan margin among the candidates tried:

```
nature   light: model #b45fd6, code #4a90c2, human #e0894a   → PASS (WARN: human 2.54:1 vs light surface — relief = nature pill text, already present)
nature   dark:  model #b45fd6, code #4a90c2, human #c8763d   → PASS (validated against surface #10151f)
cluster  light: inbound #3b6ea5, internal #7a5cc4, outbound #42c48a → PASS (WARN: outbound 2.10:1 vs light surface — relief = zone label text, already present)
cluster  dark:  inbound #3b6ea5, internal #7a5cc4, outbound #37a874 → PASS (validated against surface #0a0d15)
```

CVD note (both modes): nature code↔model ΔE 9.6 (light) / 11.7 (dark) deutan — inside the 8–12 floor
band, legal ONLY with secondary (non-color) encoding. Topos already has one: the nature pill text
("код"/"модель"/"человек") is always rendered alongside the color, never color-alone. **Do not remove
the nature pill text in any later task** — it is not decorative, it is the CVD compliance mechanism.

- [ ] **Step 1: Write `data/palette.ts`**

```typescript
import type { NodeNature } from '../types';

export type ThemeMode = 'light' | 'dark';
export type ClusterSlug = 'inbound' | 'internal' | 'outbound';

// Derived + validated via dataviz/scripts/validate_palette.js (light band 0.43–0.77 / dark band
// 0.48–0.67 OKLCH L, CVD floor 8 ΔE, contrast >=3:1) — see docs/superpowers/plans/
// 2026-07-13-topos-blueprint-implementation.md Task 3 for the full derivation record. Do not
// hand-tune a value here without re-running the validator on the full set.
export const NATURE_HEX: Record<ThemeMode, Record<NodeNature, string>> = {
  light: { model: '#b45fd6', code: '#4a90c2', human: '#e0894a' },
  dark:  { model: '#b45fd6', code: '#4a90c2', human: '#c8763d' },
};

export const CLUSTER_HEX: Record<ThemeMode, Record<ClusterSlug, string>> = {
  light: { inbound: '#3b6ea5', internal: '#7a5cc4', outbound: '#42c48a' },
  dark:  { inbound: '#3b6ea5', internal: '#7a5cc4', outbound: '#37a874' },
};

export function natureColorFor(nature: NodeNature, isDark: boolean): string {
  return NATURE_HEX[isDark ? 'dark' : 'light'][nature];
}

export function clusterColorFor(slug: ClusterSlug, isDark: boolean): string {
  return CLUSTER_HEX[isDark ? 'dark' : 'light'][slug];
}
```

- [ ] **Step 2: Write the failing test — `scripts/check_palette.ts`**

A self-contained OKLCH-lightness regression check (sRGB hex → linear → OKLab → OKLCH L), guarding the
one property most likely to silently regress if someone brightens a hex later. (Full CVD-ΔE
verification is a one-time perceptual design check, not wired into this repo's CI — rerun
`dataviz/scripts/validate_palette.js` by hand if any hex in `data/palette.ts` changes.)

```typescript
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
```

- [ ] **Step 3: Run test to verify it passes immediately (values are already correct by construction)**

```bash
npx tsx scripts/check_palette.ts
```

Expected: all 12 lines `PASS` (3 nature × 2 modes + 3 cluster × 2 modes), `palette check PASSED.`

If any line FAILs, the hex in `data/palette.ts` was mistyped relative to the Derivation record above —
fix the typo, do not adjust the passing/failing math.

- [ ] **Step 4: Restructure `NATURES` → `NATURES_META` (metadata only, no color) + mode-aware color**

In `features/topos/components/CanvasPage.tsx`, add the import near the top (after the existing
`toposService`/`TOPOS_DATA` imports around line 16):

```typescript
import { natureColorFor, clusterColorFor } from '../../../data/palette';
```

Replace lines 106-112:

```typescript
type Nature = NodeNature;
const NATURES: Record<Nature, { label: string; short: string; color: string }> = {
  model: { label: 'Вероятностное · модель',  short: 'модель',  color: '#b45fd6' },
  code:  { label: 'Детерминированное · код', short: 'код',     color: '#4a90c2' },
  human: { label: 'Человек',                 short: 'человек', color: '#e0894a' },
};
const natureOf = (id: string): Nature => (toposService.getTaskById(id)?.nature ?? 'code') as Nature;
const natureColor = (id: string) => NATURES[natureOf(id)].color;
```

with:

```typescript
type Nature = NodeNature;
const NATURES_META: Record<Nature, { label: string; short: string }> = {
  model: { label: 'Вероятностное · модель',  short: 'модель' },
  code:  { label: 'Детерминированное · код', short: 'код' },
  human: { label: 'Человек',                 short: 'человек' },
};
const natureOf = (id: string): Nature => (toposService.getTaskById(id)?.nature ?? 'code') as Nature;
const natureColor = (id: string, isDark: boolean) => natureColorFor(natureOf(id), isDark);
```

- [ ] **Step 5: Update every call site**

All 15 call sites, by exact line (line numbers are pre-Task-1/2 baseline; re-locate by content if they
drifted — the content match is unambiguous):

1. Line 475 (inside `BrickNode`, uses only the text label, no color re-lookup — `color` is already a
   resolved prop in scope):
   ```typescript
   // before
   }}>{NATURES[natureOf(task.id)].short}</span>
   // after
   }}>{NATURES_META[natureOf(task.id)].short}</span>
   ```

2. Line 517 (`FamilyNode`) — this component currently computes color internally from a raw `nature`
   prop. Change `FamilyNodeData` (line 514) and the component body (lines 515-517):
   ```typescript
   // before
   type FamilyNodeData = { name: string; childCount: number; nature: NodeNature; expanded: boolean; hasChildren: boolean; onToggle: (id: string) => void; selected: boolean; opacity: number };
   function FamilyNode({ id, data }: NodeProps) {
     const { name, childCount, nature, expanded, hasChildren, onToggle, selected, opacity } = data as unknown as FamilyNodeData;
     const color = NATURES[nature].color;
   // after
   type FamilyNodeData = { name: string; childCount: number; color: string; expanded: boolean; hasChildren: boolean; onToggle: (id: string) => void; selected: boolean; opacity: number };
   function FamilyNode({ id, data }: NodeProps) {
     const { name, childCount, color, expanded, hasChildren, onToggle, selected, opacity } = data as unknown as FamilyNodeData;
   ```

3. Line 541-544 (`InstanceNode`) — same pattern:
   ```typescript
   // before
   type InstanceNodeData = { name: string; nature: NodeNature; status: NodeStatus; selected: boolean; opacity: number; seq?: number; io?: TaxoIO };
   function InstanceNode({ data }: NodeProps) {
     const { name, nature, status, selected, opacity, seq, io } = data as unknown as InstanceNodeData;
     const color = NATURES[nature].color;
   // after
   type InstanceNodeData = { name: string; color: string; status: NodeStatus; selected: boolean; opacity: number; seq?: number; io?: TaxoIO };
   function InstanceNode({ data }: NodeProps) {
     const { name, color, status, selected, opacity, seq, io } = data as unknown as InstanceNodeData;
   ```

4. Line 629 (inside `ContainerNode`, text label only — `color` already a resolved prop, `nature` stays
   in `ContainerNodeData` for this text lookup):
   ```typescript
   // before
   }}>{NATURES[nature].short}</span>
   // after
   }}>{NATURES_META[nature].short}</span>
   ```

5. Line 842 (`brickNodes` builder, inside `CanvasPage` body — `isDark` is in scope):
   ```typescript
   // before
   task: t, color: natureColor(t.id), opacity, selected: selected?.id === t.id, badges: BADGES[t.id] ?? [], families,
   // after
   task: t, color: natureColor(t.id, isDark), opacity, selected: selected?.id === t.id, badges: BADGES[t.id] ?? [], families,
   ```

6. Line 844 (same builder, same line group):
   ```typescript
   // before
   handles: (handles[t.id] ?? []).map(h => ({ ...h, color: portColor[h.id] ?? natureColor(t.id), label: portLabel[h.id] ?? '' })),
   // after
   handles: (handles[t.id] ?? []).map(h => ({ ...h, color: portColor[h.id] ?? natureColor(t.id, isDark), label: portLabel[h.id] ?? '' })),
   ```

7. Line 875 (`containerNodesRF` builder, class-root branch):
   ```typescript
   // before
   const color = natureColor(t.id);
   // after
   const color = natureColor(t.id, isDark);
   ```

8. Line 892 (`containerNodesRF` builder, family branch):
   ```typescript
   // before
   variant: 'family', label: rt?.name ?? f.renderId, nature, color: NATURES[nature].color, opacity,
   // after
   variant: 'family', label: rt?.name ?? f.renderId, nature, color: natureColorFor(nature, isDark), opacity,
   ```

9. Lines 903-923 (`taxoLeafNodesRF` builder) — this is where `FamilyNode`/`InstanceNode`'s new `color`
   field (from step 2/3 above) gets computed instead of passing raw `nature`:
   ```typescript
   // before
   const taxoLeafNodesRF: Node[] = useMemo(() => {
     return containerFlat.filter(f => f.kind !== 'container').map(f => {
       const rt = taxoById.get(f.renderId);
       if (!rt) return null;
       const classId = f.renderId.split('::')[0];
       const opacity = classOpacity(classId);
       const isSel = selTaxo?.id === f.renderId;
       if (f.kind === 'family') {
         return {
           id: f.renderId, type: 'family', position: { x: f.x, y: f.y },
           data: { name: rt.name, childCount: rt.childCount, nature: rt.nature, expanded: expanded.has(f.renderId), hasChildren: rt.hasChildren, onToggle: toggleTaxo, selected: isSel, opacity } as FamilyNodeData,
           zIndex: 2,
         } as Node;
       }
       return {
         id: f.renderId, type: 'instance', position: { x: f.x, y: f.y },
         data: { name: rt.name, nature: rt.nature, status: rt.status, selected: isSel, opacity, seq: f.seq, io: toposService.getTaxoIO(rt.taxoId) } as InstanceNodeData,
         zIndex: 2,
       } as Node;
     }).filter(Boolean) as Node[];
   }, [containerFlat, taxoById, selTaxo, classOpacity, expanded, toggleTaxo]);
   // after
   const taxoLeafNodesRF: Node[] = useMemo(() => {
     return containerFlat.filter(f => f.kind !== 'container').map(f => {
       const rt = taxoById.get(f.renderId);
       if (!rt) return null;
       const classId = f.renderId.split('::')[0];
       const opacity = classOpacity(classId);
       const isSel = selTaxo?.id === f.renderId;
       const color = natureColorFor(rt.nature, isDark);
       if (f.kind === 'family') {
         return {
           id: f.renderId, type: 'family', position: { x: f.x, y: f.y },
           data: { name: rt.name, childCount: rt.childCount, color, expanded: expanded.has(f.renderId), hasChildren: rt.hasChildren, onToggle: toggleTaxo, selected: isSel, opacity } as FamilyNodeData,
           zIndex: 2,
         } as Node;
       }
       return {
         id: f.renderId, type: 'instance', position: { x: f.x, y: f.y },
         data: { name: rt.name, color, status: rt.status, selected: isSel, opacity, seq: f.seq, io: toposService.getTaxoIO(rt.taxoId) } as InstanceNodeData,
         zIndex: 2,
       } as Node;
     }).filter(Boolean) as Node[];
   }, [containerFlat, taxoById, selTaxo, classOpacity, expanded, toggleTaxo, isDark]);
   ```
   (Note the added `isDark` dependency in the `useMemo` deps array — required since `color` now derives
   from it.)

10. Lines 1058-1061 (legend `Panel`, inside `CanvasPage` body):
    ```typescript
    // before
    {(Object.keys(NATURES) as Nature[]).map(k => {
      const n = NATURES[k];
      return (<div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: n.color, display: 'inline-block' }} /><span style={{ opacity: 0.85 }}>{n.label}</span></div>);
    })}
    // after
    {(Object.keys(NATURES_META) as Nature[]).map(k => {
      const n = NATURES_META[k];
      return (<div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: natureColorFor(k, isDark), display: 'inline-block' }} /><span style={{ opacity: 0.85 }}>{n.label}</span></div>);
    })}
    ```

11. Line 1108 (`DetailDrawer`, `isDark` already a component prop):
    ```typescript
    // before
    const color = natureColor(task.id);
    // after
    const color = natureColor(task.id, isDark);
    ```

12. Line 1110 (`DetailDrawer`, text label only):
    ```typescript
    // before
    const nat = NATURES[natureOf(task.id)];
    // after
    const nat = NATURES_META[natureOf(task.id)];
    ```

13. Line 1174 (`TaxoDrawer`, `isDark` already a component prop):
    ```typescript
    // before
    const color = NATURES[taxo.nature].color;
    // after
    const color = natureColorFor(taxo.nature, isDark);
    ```

14. Line 1187 (`TaxoDrawer`, text label only):
    ```typescript
    // before
    }}>{NATURES[taxo.nature].label}</span>
    // after
    }}>{NATURES_META[taxo.nature].label}</span>
    ```

- [ ] **Step 6: Thread cluster color into `ZoneNode`**

Line 791-810 (`zoneNodes` builder, inside `CanvasPage` body — `isDark` in scope). The `Layer` type
already carries a `slug` field (`data/layers.ts` entries: `slug: "inbound"` / `"internal"` /
`"outbound"`):

```typescript
// before
data: { label: layer.name, role: layer.role, color: layer.color },
// after
data: { label: layer.name, role: layer.role, color: clusterColorFor(layer.slug as ClusterSlug, isDark) },
```

Add the `ClusterSlug` import to the existing palette import from Step 4:

```typescript
import { natureColorFor, clusterColorFor, type ClusterSlug } from '../../../data/palette';
```

Add `isDark` to the `zoneNodes` `useMemo` deps array (currently `[layers, tasks, pos, heights,
widths]` → `[layers, tasks, pos, heights, widths, isDark]`).

`data/layers.ts`'s static `color` field on each `LAYER` entry becomes unused after this change — leave
it in place (descriptive data, not code; deleting it is out of scope for this plan and risks breaking
an untraced future consumer).

- [ ] **Step 7: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
npx tsx scripts/check_palette.ts              # expect PASSED
```

- [ ] **Step 8: Puppeteer screenshot — verify both themes**

Screenshot the canvas once in light mode and once in dark mode (toggle via the existing Sun/Moon
button, `Panel[position=top-left]`'s last button) — confirm nature/cluster colors render, the nature
pill text is still present next to every colored port (CVD relief), and no console errors.

- [ ] **Step 9: Commit**

```bash
git add data/palette.ts scripts/check_palette.ts features/topos/components/CanvasPage.tsx
git commit -m "topos: derived + validated nature/cluster color palette (light+dark)"
```

> **Correction D-001 (applied 2026-07-14 during execution).** Step 5 items 5-8 make `brickNodes`
> and `containerNodesRF` read `isDark` inside their `useMemo` bodies, but the original plan only
> added `isDark` to the `taxoLeafNodesRF` (item 9) and `zoneNodes` (Step 6) deps arrays. Without it,
> those two memos keep stale colors on a theme toggle. Fix: **also add `isDark` to the `brickNodes`
> deps array (`}, [tasks, flowIds, …, containerLayouts, isDark]);`) and the `containerNodesRF` deps
> array (`}, [containerFlat, taxoById, …, toggleTaxo, isDark]);`).** Committed separately as
> `38fecaa`. See `docs/superpowers/DIVERGENCES.md` D-001.

---

## Task 4: Blueprint substrate — grid, registration ticks, title block, vignette

**Files:**
- Modify: `features/topos/components/CanvasPage.tsx` (Background props + new Panel elements)

**Interfaces:**
- Consumes: `isDark`, `TOPOS_DATA.meta.title` (existing).
- No new exports.

- [ ] **Step 1: Tune the existing `<Background>` for a two-layer engineering grid**

React Flow's `Background` component supports `variant` (`dots`/`lines`/`cross`), `gap`, `size`, `color`.
Replace the single `<Background>` at line 1041 with two stacked layers (a fine dotted grid + a coarse
ruled major grid — mirrors the approved concept mock):

```typescript
// before
<Background gap={22} color={isDark ? '#16202e' : '#dfe4ea'} />
// after
<Background id="bg-fine" gap={15} size={1} variant={BackgroundVariant.Dots} color={isDark ? '#1b2838' : '#dfe4ea'} />
<Background id="bg-major" gap={105} size={1} variant={BackgroundVariant.Lines} color={isDark ? '#141f2c' : '#e6e9ee'} style={{ opacity: isDark ? 0.5 : 0.35 }} />
```

Add `BackgroundVariant` to the existing React Flow import (line 2-6):

```typescript
// before
import {
  ReactFlow, Background, Panel, Handle,
  BaseEdge,
  type Node, type Edge, type NodeProps, type EdgeProps, Position,
} from '@xyflow/react';
// after
import {
  ReactFlow, Background, BackgroundVariant, Panel, Handle,
  BaseEdge,
  type Node, type Edge, type NodeProps, type EdgeProps, Position,
} from '@xyflow/react';
```

(Two `<Background>` layers with distinct `id`s is a documented React Flow pattern for multi-layer grids
— React Flow requires a unique `id` per instance when more than one is rendered.)

- [ ] **Step 2: Add a title block `Panel` (bottom-right)**

Insert after the closing `</ReactFlow>`-internal legend `Panel` block (after line 1096, before the
closing `</ReactFlow>` tag at line 1097):

```typescript
<Panel position="bottom-right">
  <div style={{
    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.04em',
    color: isDark ? '#77839a' : '#5a6270',
    background: isDark ? 'rgba(16,21,31,.72)' : 'rgba(255,255,255,.85)',
    border: `1px solid ${isDark ? 'rgba(150,168,200,.14)' : 'rgba(0,0,0,.08)'}`,
    borderRadius: 6, minWidth: 220, backdropFilter: 'blur(6px)',
  }}>
    {[
      ['project', TOPOS_DATA.meta.title.split('—')[0].trim()],
      ['sheet', activeFlow ? (examples.find(e => e.id === activeFlow)?.title ?? 'весь граф') : 'весь граф'],
      ['scale', 'кластер → класс → семейство → экземпляр'],
    ].map(([k, v], i) => (
      <div key={k} style={{ display: 'flex', borderBottom: i < 2 ? `1px solid ${isDark ? 'rgba(150,168,200,.14)' : 'rgba(0,0,0,.08)'}` : 'none' }}>
        <div style={{ padding: '5px 9px', borderRight: `1px solid ${isDark ? 'rgba(150,168,200,.14)' : 'rgba(0,0,0,.08)'}`, textTransform: 'uppercase', color: isDark ? '#4a556b' : '#9aa4b2', width: 60, flex: '0 0 auto' }}>{k}</div>
        <div style={{ padding: '5px 9px' }}>{v}</div>
      </div>
    ))}
  </div>
</Panel>
```

- [ ] **Step 3: Add corner registration ticks**

Insert immediately before the title-block `Panel` from Step 2 — a fixed-position overlay (not a
`Panel`, since it needs all four corners simultaneously and React Flow `Panel` only takes one
`position`):

```typescript
<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
  {(['tl', 'tr', 'bl', 'br'] as const).map(corner => {
    const style: React.CSSProperties = { position: 'absolute', width: 22, height: 22, opacity: isDark ? 0.35 : 0.25 };
    if (corner.includes('t')) style.top = 12; else style.bottom = 12;
    if (corner.includes('l')) style.left = 12; else style.right = 12;
    const c = isDark ? '#4a556b' : '#9aa4b2';
    return (
      <div key={corner} style={style}>
        <div style={{ position: 'absolute', width: 22, height: 1, top: 10, background: c }} />
        <div style={{ position: 'absolute', height: 22, width: 1, left: 10, background: c }} />
      </div>
    );
  })}
</div>
```

Place this `<div>` as a direct child of the outer `<div style={{ position: 'relative', ... }}>` wrapper
(line 1035), as a SIBLING of `<ReactFlow>`, not inside it — registration ticks are a fixed viewport
overlay, not a canvas element that should pan/zoom with the graph. Insert it right after the
`<ReactFlow>` closing tag (after line 1097, i.e. it and the drawers become siblings under the same
wrapper `<div>`).

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 5: Puppeteer screenshot**

Confirm: two-layer grid visible (fine dots + coarse lines), title block bottom-right shows project /
sheet / scale rows, four corner ticks visible and NOT panning when the canvas is dragged (they must
stay viewport-fixed — drag the canvas in the Puppeteer script via `page.mouse` and re-screenshot to
confirm the ticks didn't move while the grid did).

- [ ] **Step 6: Commit**

```bash
git add features/topos/components/CanvasPage.tsx
git commit -m "topos: blueprint substrate — two-layer grid, registration ticks, title block"
```

---

## Task 5: Instrument-panel card craft (top-edge highlight + part-id line)

**Files:**
- Modify: `features/topos/components/CanvasPage.tsx` (`headerH`, `BrickNode`, `ContainerNode`)

**Interfaces:**
- Produces: `partId(t: Task): string` helper.
- No change to `BrickData`/`ContainerNodeData` shapes.

- [ ] **Step 1: Add the `partId` helper**

Insert after `headerH` (after line 145, before the "detail-hierarchy" section comment at line 147):

```typescript
// small mono caption under a card's title — mechanically derived (kind + taxonomy child count when
// present), never hand-curated, so it stays correct for all ~40 classes without a new dataset.
function partId(t: Task): string {
  const { kind } = kindOf(t);
  const n = toposService.getTaxonomy(t.id).length;
  return n > 0 ? `${kind} · ${n}` : kind;
}
```

- [ ] **Step 2: Bump `headerH`'s base budget to fit the new line**

Line 141-145:

```typescript
// before
function headerH(t: Task): number {
  const famRows = famCountOf(t) ? Math.ceil(famCountOf(t) / 2) : 0;
  const badges = (BADGES[t.id] ?? []).length ? 20 : 0;
  return 58 + famRows * 20 + badges;
}
// after
function headerH(t: Task): number {
  const famRows = famCountOf(t) ? Math.ceil(famCountOf(t) / 2) : 0;
  const badges = (BADGES[t.id] ?? []).length ? 20 : 0;
  return 70 + famRows * 20 + badges;   // +12 vs. pre-Blueprint base — reserves the part-id caption line
}
```

- [ ] **Step 3: Render the part-id line + top-edge highlight in `BrickNode`**

Lines 450-480. Replace the `boxShadow` line and insert the caption after the title `<div>`:

```typescript
// before (lines 450-455)
    <div className="rf-brick" title={task.elevator_pitch} style={{
      position: 'relative', width: NODE_W, minHeight: minH, boxSizing: 'border-box', borderRadius: 11, border: `1.5px solid ${color}`,
      background: `linear-gradient(180deg, ${color}22, ${color}0f), var(--surface, #101826)`,
      color: 'var(--text-main, #e6e9ee)', opacity, transition: 'opacity .2s, box-shadow .12s, transform .12s',
      boxShadow: selected ? `0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)` : undefined,
    }}>
// after
    <div className="rf-brick" title={task.elevator_pitch} style={{
      position: 'relative', width: NODE_W, minHeight: minH, boxSizing: 'border-box', borderRadius: 11, border: `1.5px solid ${color}`,
      background: `linear-gradient(180deg, ${color}22, ${color}0f), var(--surface, #101826)`,
      color: 'var(--text-main, #e6e9ee)', opacity, transition: 'opacity .2s, box-shadow .12s, transform .12s',
      boxShadow: selected
        ? `inset 0 1px 0 rgba(255,255,255,.06), 0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)`
        : 'inset 0 1px 0 rgba(255,255,255,.06), 0 10px 22px -14px rgba(0,0,0,.7)',
    }}>
```

```typescript
// before (line 480)
        <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</div>
// after
        <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.name}</div>
        <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase', color, opacity: 0.5, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{partId(task)}</div>
```

- [ ] **Step 4: Apply the same top-edge highlight to `ContainerNode`**

Line 611-614:

```typescript
// before
    <div style={{
      position: 'relative', width: w, height: h, boxSizing: 'border-box', borderRadius: 12,
      border: `1.5px dashed ${color}99`, background: `${color}0c`, opacity, transition: 'opacity .2s, box-shadow .12s',
      boxShadow: selected ? `0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)` : undefined,
    }}>
// after
    <div style={{
      position: 'relative', width: w, height: h, boxSizing: 'border-box', borderRadius: 12,
      border: `1.5px dashed ${color}99`, background: `${color}0c`, opacity, transition: 'opacity .2s, box-shadow .12s',
      boxShadow: selected
        ? `inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)`
        : 'inset 0 1px 0 rgba(255,255,255,.05)',
    }}>
```

- [ ] **Step 5: Add a part-id line to the class-root `ContainerNode` header**

Line 866-885 (`containerNodesRF` builder, class-root branch) — add a `partId` field to
`ContainerNodeData`:

```typescript
// before (ContainerNodeData type, lines 595-603)
type ContainerNodeData = {
  variant: 'class' | 'family';
  label: string; nature: NodeNature; color: string; opacity: number; selected: boolean;
  onToggle: (id: string) => void;
  headerH: number; gutterL: number; gutterR: number; w: number; h: number;
  catLabel?: string; icon?: React.ComponentType<{ size?: number }>;
  handles?: PortHandle[];
  childCount?: number;
};
// after
type ContainerNodeData = {
  variant: 'class' | 'family';
  label: string; nature: NodeNature; color: string; opacity: number; selected: boolean;
  onToggle: (id: string) => void;
  headerH: number; gutterL: number; gutterR: number; w: number; h: number;
  catLabel?: string; icon?: React.ComponentType<{ size?: number }>;
  handles?: PortHandle[];
  childCount?: number;
  partId?: string;
};
```

```typescript
// before (line 876-885)
      if (isClassRoot) {
        const t = toposService.getTaskById(f.renderId);
        if (!t) return null;
        const color = natureColor(t.id, isDark);
        return {
          id: f.renderId, type: 'container', ...base,
          data: {
            variant: 'class', label: t.name, nature: natureOf(t.id), color, opacity,
            selected: selected?.id === t.id, onToggle: toggleTaxo,
            headerH: f.header ?? CONTAINER_HEADER_H, gutterL: f.gutterL ?? 0, gutterR: f.gutterR ?? 0, w: f.w, h: f.h,
            catLabel: catLabel(t.id), icon: kindOf(t).icon,
            handles: (handles[t.id] ?? []).map(h => ({ ...h, color: portColor[h.id] ?? color, label: portLabel[h.id] ?? '' })),
          } as ContainerNodeData,
        } as Node;
      }
// after
      if (isClassRoot) {
        const t = toposService.getTaskById(f.renderId);
        if (!t) return null;
        const color = natureColor(t.id, isDark);
        return {
          id: f.renderId, type: 'container', ...base,
          data: {
            variant: 'class', label: t.name, nature: natureOf(t.id), color, opacity,
            selected: selected?.id === t.id, onToggle: toggleTaxo,
            headerH: f.header ?? CONTAINER_HEADER_H, gutterL: f.gutterL ?? 0, gutterR: f.gutterR ?? 0, w: f.w, h: f.h,
            catLabel: catLabel(t.id), icon: kindOf(t).icon, partId: partId(t),
            handles: (handles[t.id] ?? []).map(h => ({ ...h, color: portColor[h.id] ?? color, label: portLabel[h.id] ?? '' })),
          } as ContainerNodeData,
        } as Node;
      }
```

Now render it in `ContainerNode` — line 604-631, change the header block to a 2-row layout only for
`variant === 'class'` (family containers stay single-row, no room budgeted):

```typescript
// before (lines 604-607)
function ContainerNode({ id, data }: NodeProps) {
  const d = data as unknown as ContainerNodeData;
  const { variant, label, nature, color, opacity, selected, onToggle, headerH: hH, gutterL, gutterR, w, h, handles, childCount } = d;
  const Icon = d.icon;
// after
function ContainerNode({ id, data }: NodeProps) {
  const d = data as unknown as ContainerNodeData;
  const { variant, label, nature, color, opacity, selected, onToggle, headerH: hH, gutterL, gutterR, w, h, handles, childCount, partId: pid } = d;
  const Icon = d.icon;
```

```typescript
// before (lines 621-631)
      <div style={{
        height: hH, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 10px', borderBottom: `1px solid ${color}33`, background: `${color}16`,
        borderRadius: '11px 11px 0 0',
      }}>
        {Icon && <span style={{ display: 'inline-flex', color, flex: '0 0 auto' }}><Icon size={13} /></span>}
        <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: variant === 'class' ? 12.5 : 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>{label}</span>
        {variant === 'family' && !!childCount && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, opacity: 0.6, flex: '0 0 auto' }}>×{childCount}</span>}
        <span style={{ flex: '0 0 auto', fontFamily: 'var(--font-mono)', fontSize: 7.5, letterSpacing: '.03em', textTransform: 'uppercase', padding: '1px 4px', borderRadius: 4, border: `1px solid ${color}66`, background: `${color}18`, color, opacity: 0.9 }}>{NATURES_META[nature].short}</span>
        <TouchChevron color={color} expanded onToggle={() => onToggle(id)} />
      </div>
// after
      <div style={{
        height: hH, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 10px', borderBottom: `1px solid ${color}33`, background: `${color}16`,
        borderRadius: '11px 11px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <span style={{ display: 'inline-flex', color, flex: '0 0 auto' }}><Icon size={13} /></span>}
          <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: variant === 'class' ? 12.5 : 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>{label}</span>
          {variant === 'family' && !!childCount && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, opacity: 0.6, flex: '0 0 auto' }}>×{childCount}</span>}
          <span style={{ flex: '0 0 auto', fontFamily: 'var(--font-mono)', fontSize: 7.5, letterSpacing: '.03em', textTransform: 'uppercase', padding: '1px 4px', borderRadius: 4, border: `1px solid ${color}66`, background: `${color}18`, color, opacity: 0.9 }}>{NATURES_META[nature].short}</span>
          <TouchChevron color={color} expanded onToggle={() => onToggle(id)} />
        </div>
        {variant === 'class' && pid && (
          <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase', color, opacity: 0.5, marginTop: 1 }}>{pid}</div>
        )}
      </div>
```

`CONTAINER_HEADER_H` (currently `40`, from `features/topos/lib/containerLayout.ts:28`) must grow to fit
the new second row — bump it to `50`:

```typescript
// features/topos/lib/containerLayout.ts, line 28
// before
export const CONTAINER_HEADER_H = 40;    // header strip: icon/label + nature pill + touch chevron
// after
export const CONTAINER_HEADER_H = 50;    // header strip: icon/label + nature pill + touch chevron (+ part-id caption row for class roots)
```

- [ ] **Step 6: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
npx tsx scripts/check_container_layout.ts     # expect PASSED (header height constant changed, but no assertion is hardcoded to 40 — confirm no new FAILs)
```

- [ ] **Step 7: Puppeteer screenshot**

Confirm: collapsed brick cards show a small caption line under the title (`детекторы · 41` style,
lowercased `kind` from `kindOf`), expanded class containers show the same caption in their 2-row
header, family containers stay single-row (no caption), no title clipping, no ELK port misalignment
(ports must still land on the correct I/O row — verify by comparing a card with 2+ ports against its
pre-Task-5 screenshot from Task 4's step).

- [ ] **Step 8: Commit**

```bash
git add features/topos/components/CanvasPage.tsx features/topos/lib/containerLayout.ts
git commit -m "topos: instrument-panel card craft — top-edge highlight + part-id caption"
```

---

## Task 6: Port terminal shapes + 2-line label fix (TaxoIOChip)

**Files:**
- Modify: `features/topos/components/CanvasPage.tsx` (`TaxoIOChip`)

**Interfaces:**
- Modifies: `TaxoIOChip` props — adds a `kind: 'required' | 'optional' | 'output'` prop replacing the
  current `required?: boolean` (output vs. input is already implicit at each call site; this makes it
  explicit so the terminal glyph can be chosen without re-deriving it).
- Consumes: nothing new — `InstanceNode`'s two call sites (input/output) already know which is which.

- [ ] **Step 1: Rewrite `TaxoIOChip`**

Lines 377-390:

```typescript
// before
// Per-child I/O chip (Step 2b) — a compact pill for the taxo instance leaf card (narrower than
// BrickNode's IOChip, which is sized for the NODE_W=232 card). `required` bolds the label instead
// of adding a second visual layer (dot/border) — cheapest legible distinction at this size; owner
// polishes later. `title` carries the untruncated label since long tool outputs get ellipsized.
function TaxoIOChip({ label, required, color }: { label: string; required?: boolean; color: string }) {
  return (
    <span title={label} style={{
      display: 'inline-block', maxWidth: 62, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      border: `1px solid ${color}`, background: `${color}1f`, color,
      borderRadius: 4, padding: '0 4px', fontFamily: 'var(--font-mono)', fontSize: 7.5, lineHeight: `${IO_ROW_H - 2}px`,
      fontWeight: required ? 700 : 400,
    }}>{label}</span>
  );
}
// after
// Per-child I/O terminal (Blueprint): the ROLE (required-in / optional-in / output) is carried by a
// small terminal glyph — filled square = required input, hollow square = optional input, triangle =
// output — so the label pill stays clean text in the wire tone and can wrap to 2 lines instead of
// truncating at a fixed 62px (owner-reported: "pause_reason"/"frame_hypothesis" were clipping).
// `title` still carries the untruncated label as a tooltip fallback for anything that still overflows.
function PortTerminal({ kind, color }: { kind: 'required' | 'optional' | 'output'; color: string }) {
  if (kind === 'output') {
    return (
      <svg width="7" height="7" viewBox="0 0 7 7" style={{ flex: '0 0 auto' }}>
        <path d="M0.5 0.5 L6.5 3.5 L0.5 6.5 Z" fill={color} />
      </svg>
    );
  }
  return (
    <span style={{
      width: 6, height: 6, flex: '0 0 auto', boxSizing: 'border-box',
      border: `1.2px solid ${color}`, background: kind === 'required' ? color : 'transparent',
    }} />
  );
}
function TaxoIOChip({ label, kind, color }: { label: string; kind: 'required' | 'optional' | 'output'; color: string }) {
  return (
    <span title={label} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: 118, minWidth: 0,
      border: `1px solid ${color}`, background: `${color}1f`, color,
      borderRadius: 4, padding: '2px 5px', fontFamily: 'var(--font-mono)', fontSize: 7.5, lineHeight: 1.25,
    }}>
      {kind === 'output' ? null : <PortTerminal kind={kind} color={color} />}
      <span style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', overflowWrap: 'anywhere' }}>{label}</span>
      {kind === 'output' ? <PortTerminal kind={kind} color={color} /> : null}
    </span>
  );
}
```

(Output terminal renders trailing — after the label, pointing right, mirroring the input terminal's
leading position pointing right-into-the-pill — this reads as "flowing outward" without needing a
separate legend entry beyond the existing one, extended in Step 3.)

- [ ] **Step 2: Update `InstanceNode`'s two call sites**

Lines 577-584:

```typescript
// before
      {rows > 0 && (
        <div style={{ flex: '0 0 auto', boxSizing: 'border-box', padding: '0 6px 4px' }}>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} style={{ height: IO_ROW_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
              <span style={{ minWidth: 0, display: 'flex' }}>{ins[r] && <TaxoIOChip label={ins[r].name} required={ins[r].required} color={color} />}</span>
              <span style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>{outs[r] && <TaxoIOChip label={outs[r]} color={color} />}</span>
            </div>
          ))}
        </div>
      )}
// after
      {rows > 0 && (
        <div style={{ flex: '0 0 auto', boxSizing: 'border-box', padding: '0 6px 4px' }}>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} style={{ minHeight: IO_ROW_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
              <span style={{ minWidth: 0, display: 'flex' }}>{ins[r] && <TaxoIOChip label={ins[r].name} kind={ins[r].required ? 'required' : 'optional'} color={color} />}</span>
              <span style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>{outs[r] && <TaxoIOChip label={outs[r]} kind="output" color={color} />}</span>
            </div>
          ))}
        </div>
      )}
```

(`height: IO_ROW_H` → `minHeight: IO_ROW_H` + `alignItems: 'center'` → `'flex-start'`: since chips can
now wrap to 2 lines, a fixed single-line row height would clip the wrapped second line. This makes the
row grow with its tallest chip — Task 8 (masonry) already re-derives `ioRowsExtraHeight`/
`instanceCellHeight` from real content, so this is compatible with that task; if Task 8 runs after this
one it will see taller effective rows and size cells accordingly. If Task 8 already ran, re-verify its
`IO_ROW_H` constant still gives enough single-line headroom — 2-line wraps are the exception (long
labels only), most chips stay single-line at `IO_ROW_H=15`.)

> **Correction D-003 + D-004 (applied 2026-07-14 during execution).** The note above under-estimated
> the wrap fallout — visual review found two real defects that the plan-as-written shipped:
> 1. **D-004 (overflow):** `minHeight` on the ROW is not enough — the instance CARD height is a literal
>    value from `instanceCellHeight`, which budgeted a flat `IO_ROW_H` per row and did NOT grow for
>    2-line rows, so wrapped chips (15/~120 cards) spilled ~9-11px past the card border. Task 8 does NOT
>    fix this (it packs by `instanceCellHeight`, so the fix must precede it). **Fix:** `ioRowsExtraHeight`
>    takes `(io?: TaxoIO)` and adds `IO_LINE_EXTRA=12` for any row whose input OR output label length
>    `> IO_WRAP_CHARS=11`; `WebkitLineClamp:2` caps rendered at 2 lines so budget ≥ rendered by
>    construction. Update BOTH call sites (`instanceCellHeight` and `InstanceNode`'s own `height`).
> 2. **D-003 (mid-word break):** `justify-content:space-between` let a wide output chip squeeze a short
>    input label below its text width, breaking it mid-word. **Fix:** row → `display:grid;
>    gridTemplateColumns:'1fr 1fr'`; `TaxoIOChip maxWidth 118 → '100%'`.
> See `docs/superpowers/DIVERGENCES.md` D-003/D-004.

- [ ] **Step 3: Extend the ports legend**

Lines 1079-1083 (the existing "ПОРТЫ" legend section in the top-right `Panel`) — add a line for the
new terminal system, right after the existing diamond/triangle line:

```typescript
// before
              <div style={{ opacity: 0.55, margin: '7px 0 4px', letterSpacing: '.08em' }}>ПОРТЫ</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" style={{ overflow: 'visible' }}><path d="M7 1.1 L12.9 7 L7 12.9 L1.1 7 Z" fill="#8a8f98" /></svg><span style={{ opacity: 0.85 }}>выход</span>
                <svg width="12" height="12" viewBox="0 0 14 14" style={{ overflow: 'visible', marginLeft: 4 }}><path d="M2 1 L13.5 7 L2 13 Z" fill="#8a8f98" /></svg><span style={{ opacity: 0.85 }}>вход</span>
              </div>
// after
              <div style={{ opacity: 0.55, margin: '7px 0 4px', letterSpacing: '.08em' }}>ПОРТЫ</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" style={{ overflow: 'visible' }}><path d="M7 1.1 L12.9 7 L7 12.9 L1.1 7 Z" fill="#8a8f98" /></svg><span style={{ opacity: 0.85 }}>выход</span>
                <svg width="12" height="12" viewBox="0 0 14 14" style={{ overflow: 'visible', marginLeft: 4 }}><path d="M2 1 L13.5 7 L2 13 Z" fill="#8a8f98" /></svg><span style={{ opacity: 0.85 }}>вход</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, border: '1.2px solid #8a8f98', background: '#8a8f98', display: 'inline-block' }} /><span style={{ opacity: 0.85 }}>обяз. параметр</span>
                <span style={{ width: 6, height: 6, border: '1.2px solid #8a8f98', background: 'transparent', display: 'inline-block', marginLeft: 4 }} /><span style={{ opacity: 0.85 }}>опц. параметр</span>
              </div>
```

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 5: Puppeteer screenshot**

Expand `tool_retrieve`'s read-only tools container (or any class with taxonomy_io-bearing children).
Confirm: `update_focus`'s `pause_reason`/`resume_condition` chips wrap to 2 lines instead of
ellipsizing, filled-square terminals on required params, hollow-square on optional, triangle on
outputs, legend shows the new required/optional line.

- [ ] **Step 6: Commit**

```bash
git add features/topos/components/CanvasPage.tsx
git commit -m "topos: circuit-terminal ports + 2-line label wrap on TaxoIOChip"
```

---

## Task 7: Fix extractor output-label truncation, regenerate `taxonomy_io.ts`

**Files:**
- Modify: `scripts/extract_taxo_io.py:97-121` (`_derive_output_label`)
- Modify: `data/taxonomy_io.ts` (regenerated output — NOT hand-edited)

**Interfaces:**
- No interface change — `_derive_output_label(description: str) -> str | None` keeps its signature.

- [ ] **Step 1: Fix the truncation to a word boundary**

`scripts/extract_taxo_io.py`, lines 113-121:

```python
# before
    m = _RETURNS_RE.search(description)
    if not m:
        return None
    label = _WS_RE.sub(" ", m.group(1)).strip()
    if not label:
        return None
    if len(label) > 100:
        label = label[:97].rstrip() + "..."
    return label
# after
    m = _RETURNS_RE.search(description)
    if not m:
        return None
    label = _WS_RE.sub(" ", m.group(1)).strip()
    if not label:
        return None
    if len(label) > 100:
        # cut at the last word boundary at or before 97 chars, not mid-word
        cut = label[:97]
        last_space = cut.rfind(" ")
        if last_space > 60:   # only back off if it doesn't eat more than a third of the budget
            cut = cut[:last_space]
        label = cut.rstrip().rstrip(",;") + "..."
    return label
```

- [ ] **Step 2: Regenerate `data/taxonomy_io.ts` via the extractor (not by hand)**

```bash
cd ~/topos
python3 scripts/extract_taxo_io.py > /tmp/taxo_io_check.json 2>&1
python3 -c "import json; d=json.load(open('/tmp/taxo_io_check.json')); print(d['tools']['list_spheres'])"
```

Expected: the `list_spheres` output label now ends at a word boundary, not mid-word (was:
`"...the 9th 'sphere_open_f..."`).

The `.ts` file itself is generated by whatever process originally produced `data/taxonomy_io.ts` from
this extractor's JSON — locate and re-run that generation step (check for a `scripts/*.ts` or inline
step referenced in `docs/superpowers/specs/2026-07-13-step2-per-child-ports-plan.md` Step 2a — if no
separate codegen script exists, the `.ts` was hand-transcribed from the JSON at Step-2a time; in that
case, regenerate ONLY the `tool_list_spheres` entry's `outputs` array value by copying the new JSON
output verbatim — do not touch any other entry, and do not retype it from memory):

```bash
grep -n "tool_list_spheres" data/taxonomy_io.ts
```

Replace only that line's `outputs` array content with the exact string from the JSON re-run in this
step (copy-paste, not retyped).

- [ ] **Step 3: Run the self-check**

```bash
npx tsx scripts/check_taxo_io.ts 2>&1 | tail -10
```

Expected: `PASSED` (or the same pass/tally output as before, with the `list_spheres` mismatch — if any
— now resolved). If it reports a NEW mismatch, the `.ts` edit in Step 2 diverged from the extractor's
literal output — fix the `.ts` line to match exactly, never adjust the extractor to match a
hand-typed guess.

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 5: Commit**

```bash
git add scripts/extract_taxo_io.py data/taxonomy_io.ts
git commit -m "topos: fix extractor output-label truncation to word boundary, regenerate"
```

---

## Task 8: Masonry packing in `containerLayout.ts`

**Files:**
- Modify: `features/topos/lib/containerLayout.ts` (`containerLayout` grid-fill algorithm)
- Modify: `scripts/check_container_layout.ts` (assertions that assumed row-major fill)

**Interfaces:**
- `containerLayout(rootId, expanded, tasks): ContainerLayoutResult` — signature unchanged.
- `ContainerCell.x`/`.y` semantics change from "row-major grid slot" to "shortest-column greedy
  placement" — `cells[]` ARRAY ORDER stays declaration/seq order (unchanged — this is what the dream
  pipeline's numbered badges rely on, NOT grid position, so masonry reordering of visual position does
  not lose the pipeline-order information).

- [ ] **Step 1: Write the failing test — extend `check_container_layout.ts` for masonry semantics**

The existing `[2]` and `[4]` blocks assert grid-wrap via `distinct x values > 1` / `distinct y values >
1` — those assumed row-major fill where all cells in a "row" share one `y`. Masonry has NO shared rows
(each column has its own running height), so `distinct y values` will be near `cells.length`, not a
small row count. Replace the row-count assertions; keep everything else (bounds, seq-array-order,
container sizing) as-is since those don't depend on the fill algorithm.

In `scripts/check_container_layout.ts`, replace lines 68-71 (inside block `[2]`):

```typescript
// before
    const cols = new Set(nested.cells.map(c => c.x)).size;
    assert(cols > 1, `grid wraps into >1 distinct column (got ${cols} distinct x offsets)`);
    const rows = new Set(nested.cells.map(c => c.y)).size;
    assert(rows > 1, `grid wraps into >1 row (got ${rows} distinct y offsets)`);
// after
    const cols = new Set(nested.cells.map(c => c.x)).size;
    assert(cols > 1, `masonry wraps into >1 distinct column (got ${cols} distinct x offsets)`);
    // masonry: the TALLEST column's total height should be noticeably less than what a single
    // 1-column stack of all 17 cells would need — proves the packer actually distributes load
    // instead of degenerating to one column.
    const singleColumnH = nested.cells.reduce((sum, c) => sum + c.h, 0) + CELL_GAP * (nested.cells.length - 1);
    assert(nested.size.h < singleColumnH, `masonry height (${nested.size.h}) is less than a naive single-column stack (${singleColumnH})`);
```

Add the `CELL_GAP` import at the top of the file (alongside the existing `containerLayout` import from
Step-1's import line):

```typescript
// before
import { containerLayout, flattenContainerLayout, TAXO_W, TAXO_H, CONTAINER_GUTTER_W, instanceCellHeight } from '../features/topos/lib/containerLayout';
// after
import { containerLayout, flattenContainerLayout, TAXO_W, TAXO_H, CONTAINER_GUTTER_W, instanceCellHeight, CELL_GAP } from '../features/topos/lib/containerLayout';
```

(`CELL_GAP` is already exported from `containerLayout.ts` line 31 — no source change needed for the
export itself.)

Replace lines 115-116 (inside block `[4]`, the dream-pipeline test):

```typescript
// before
    const cols = new Set(nested.cells.map(c => c.x)).size;
    assert(cols > 1, `dream grid wraps (>1 column, got ${cols})`);
// after
    const cols = new Set(nested.cells.map(c => c.x)).size;
    assert(cols > 1, `dream masonry wraps (>1 column, got ${cols})`);
    // the seq ARRAY order (already asserted above) is the pipeline's source of truth — masonry is
    // free to place seq-adjacent cells in different columns; each cell's own seq badge (rendered by
    // InstanceNode) carries the order, not grid position.
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx tsx scripts/check_container_layout.ts 2>&1 | grep -E "FAIL|PASS.*masonry"
```

Expected: the two new masonry-height/wrap assertions FAIL or the run errors on the current row-major
implementation (row-major DOES also wrap into >1 column, so `cols > 1` may already pass — but the
single-column-height comparison will fail against the CURRENT row-major sizing formula, which uses
`rowHeights.reduce(...)` summing the max-per-row rather than packing by column — confirm at least one
new assertion fails before proceeding; if both happen to pass already, add a stronger assertion:
`nested.size.h <= Math.ceil(nested.cells.length / cols) * (TAXO_H.instance + CELL_GAP)` to force a
real regression before implementing).

- [ ] **Step 3: Implement greedy shortest-column masonry**

Replace lines 137-155 in `features/topos/lib/containerLayout.ts` (the grid-fill block, from `const cols
= gridCols(...)` through the `bodyH` computation):

```typescript
// before
  const cols = gridCols(cells.length);
  const colWidths: number[] = new Array(cols).fill(0);
  const rowHeights: number[] = [];
  cells.forEach((cell, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    colWidths[col] = Math.max(colWidths[col], cell.w);
    rowHeights[row] = Math.max(rowHeights[row] ?? 0, cell.h);
  });
  const colX: number[] = [0];
  for (let c = 1; c < cols; c++) colX[c] = colX[c - 1] + colWidths[c - 1] + CELL_GAP;
  const rowY: number[] = [0];
  for (let r = 1; r < rowHeights.length; r++) rowY[r] = rowY[r - 1] + rowHeights[r - 1] + CELL_GAP;
  cells.forEach((cell, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    cell.x = colX[col]; cell.y = rowY[row];
  });

  const bodyW = cells.length === 0 ? TAXO_W : colWidths.reduce((a, b) => a + b, 0) + CELL_GAP * (cols - 1);
  const bodyH = cells.length === 0 ? TAXO_H.instance : rowHeights.reduce((a, b) => a + b, 0) + CELL_GAP * (rowHeights.length - 1);
// after
  // Masonry: greedy shortest-column placement. A tall cell (e.g. a 10-param tool card) no longer
  // inflates every cell sharing its row-major "row" — it only affects its OWN column's running
  // height. Column ASSIGNMENT stays declaration/seq order (cells.forEach walks `cells` in that
  // order), so a container that's expanded twice in a row lays out identically (deterministic).
  const cols = gridCols(cells.length);
  const colHeights: number[] = new Array(cols).fill(0);
  const colWidths: number[] = new Array(cols).fill(0);
  const colOf: number[] = [];
  cells.forEach((cell, i) => {
    let col = 0;
    for (let c = 1; c < cols; c++) if (colHeights[c] < colHeights[col]) col = c;
    colOf[i] = col;
    cell.y = colHeights[col];
    colHeights[col] += cell.h + CELL_GAP;
    colWidths[col] = Math.max(colWidths[col], cell.w);
  });
  const colX: number[] = [0];
  for (let c = 1; c < cols; c++) colX[c] = colX[c - 1] + colWidths[c - 1] + CELL_GAP;
  cells.forEach((cell, i) => { cell.x = colX[colOf[i]]; });

  const bodyW = cells.length === 0 ? TAXO_W : colWidths.reduce((a, b) => a + b, 0) + CELL_GAP * (cols - 1);
  const bodyH = cells.length === 0
    ? TAXO_H.instance
    : Math.max(...colHeights.map((h, c) => cells.some((_, i) => colOf[i] === c) ? h - CELL_GAP : 0));
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx tsx scripts/check_container_layout.ts 2>&1 | tail -5
```

Expected: `containerLayout check PASSED.` — all 6 numbered blocks including the two rewritten masonry
assertions from Step 1.

- [ ] **Step 5: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 6: Puppeteer screenshot**

Expand `tool_retrieve`'s read-only tools container (has `update_focus`, a ~10-param tall card, mixed
with several short cards). Confirm: the tall card no longer forces every card in its "row" to match its
height — short cards (`get_usage`, `list_focuses`) pack tightly near other short cards, columns have
visibly different total heights, no cell overlaps another, container width/height fit the content with
no dead space.

- [ ] **Step 7: Commit**

```bash
git add features/topos/lib/containerLayout.ts scripts/check_container_layout.ts
git commit -m "topos: masonry packing in containerLayout — tall cards no longer inflate their row"
```

---

## Task 9: Chevron press feedback + ease-token application

**Files:**
- Modify: `features/topos/components/CanvasPage.tsx` (`TouchChevron`)

**Interfaces:**
- No signature change.

- [ ] **Step 1: Add `:active` scale feedback to the chevron's inner glyph**

Since `TouchChevron` is a plain `<button>` with inline styles (no CSS class to hang a `:active`
pseudo-selector off), add a small dedicated CSS rule keyed by a new class name, and apply the
transform via that class rather than inline (inline styles cannot express `:active`).

In `index.css`, add after the `.rf-brick:hover` rule (this exact rule is reworked again in Task 10 —
add the new rule as its own block right after it for now):

```css
.topos-chevron-glyph {
  transition: transform 120ms var(--ease-out);
}
.topos-chevron-glyph:active {
  transform: scale(0.88);
}
```

In `features/topos/components/CanvasPage.tsx`, `TouchChevron` (lines 415-438), add the class to the
inner `<span>`:

```typescript
// before
      <span aria-hidden style={{
        width: glyph, height: glyph, boxSizing: 'border-box',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, border: `1.3px solid ${color}66`, background: `${color}22`, color,
        fontSize: 11, lineHeight: 1,
      }}>{expanded ? '▾' : '▸'}</span>
// after
      <span aria-hidden className="topos-chevron-glyph" style={{
        width: glyph, height: glyph, boxSizing: 'border-box',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, border: `1.3px solid ${color}66`, background: `${color}22`, color,
        fontSize: 11, lineHeight: 1,
      }}>{expanded ? '▾' : '▸'}</span>
```

`:active` on the OUTER `<button>` wouldn't visually register (the button itself has no visible box —
transparent background, per the existing `TouchChevron` design comment) — the scale must apply to the
inner glyph `<span>`, which is what Step 1 does.

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 3: Manual verify (Puppeteer can synthesize `:active` via `page.mouse.down()` without
  `up()`, screenshot mid-press, then `up()`)**

```js
// after navigating + waiting for layout, find a chevron button and press-hold it
const chevron = await page.$('button[aria-label*="развернуть"]');
const box = await chevron.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await new Promise(r => setTimeout(r, 150)); // let the 120ms transition settle
await page.screenshot({ path: 'scratchpad/task9-chevron-pressed.png' });
await page.mouse.up();
```

Confirm the glyph is visibly smaller (scale 0.88) in the pressed screenshot vs. a baseline unpressed
screenshot.

- [ ] **Step 4: Commit**

```bash
git add index.css features/topos/components/CanvasPage.tsx
git commit -m "topos: chevron press feedback (scale 0.88 on :active)"
```

---

## Task 10: Fix + gate hover transforms

**Files:**
- Modify: `index.css` (`.rf-brick:hover`)
- Modify: `features/topos/components/CanvasPage.tsx` (`FamilyNode`, `InstanceNode`, `ItemNode`
  transitions)

**Interfaces:** No signature change.

- [ ] **Step 1: Gate `.rf-brick:hover` behind a fine-pointer media query**

`index.css`, lines 178-183:

```css
// before
/* Canvas brick nodes — subtle lift on hover */
.rf-brick:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .35);
  cursor: pointer;
}
// after
/* Canvas brick nodes — subtle lift on hover (fine-pointer only: Topos is touch-first, a touch tap
   must not leave a stuck hover-lift behind) */
@media (hover: hover) and (pointer: fine) {
  .rf-brick:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, .35);
    cursor: pointer;
  }
}
```

- [ ] **Step 2: Add `transform` to the transition list on the 3 components that currently animate
  `opacity` only**

`FamilyNode`, line 526:

```typescript
// before
      opacity, transition: 'opacity .2s',
// after
      opacity, transition: 'opacity .2s, transform .12s var(--ease-out), box-shadow .12s',
```

`InstanceNode`, line 559:

```typescript
// before
      opacity: (dead ? 0.5 : 1) * opacity, transition: 'opacity .2s',   // dead-dim × focus-dim, stacked
// after
      opacity: (dead ? 0.5 : 1) * opacity, transition: 'opacity .2s, transform .12s var(--ease-out), box-shadow .12s',   // dead-dim × focus-dim, stacked
```

`ItemNode`, line 676:

```typescript
// before
      color: 'var(--text-main, #e6e9ee)', padding: '7px 9px', opacity: dim ? 0.22 : 1, transition: 'opacity .2s, box-shadow .12s',
// after
      color: 'var(--text-main, #e6e9ee)', padding: '7px 9px', opacity: dim ? 0.22 : 1, transition: 'opacity .2s, box-shadow .12s, transform .12s var(--ease-out)',
```

`FamilyNode` and `InstanceNode` both already have `className="rf-brick"` (confirmed: `FamilyNode` line
519, `InstanceNode` line 555) — so they already receive the `.rf-brick:hover` lift rule from Step 1;
this step just makes their OWN inline `transition` list actually animate the `transform` that rule sets
(previously the CSS rule fired but the element's `transition` property never listed `transform`, so the
lift snapped instantly instead of easing).

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 4: Puppeteer verify**

Hover a family/instance card (`page.hover(selector)`), wait 150ms, screenshot — confirm a smooth
`translateY(-1px)` lift is visible (compare against a same-node unhovered screenshot: the hovered one's
bounding box `y` should be ~1px less). Also emulate a touch device
(`page.emulate(puppeteer.KnownDevices['iPhone 13'])` or set `page.setViewport({ ..., hasTouch: true
})`) and confirm hovering via `page.tap(selector)` does NOT leave a stuck lift after the tap ends.

- [ ] **Step 5: Commit**

```bash
git add index.css features/topos/components/CanvasPage.tsx
git commit -m "topos: fix + gate hover transforms (family/instance/item nodes, fine-pointer only)"
```

---

## Task 11: Interruptible reflow (CSS transition) + materialize/stagger for newly-revealed children

**Files:**
- Modify: `index.css` (`.react-flow__node` transition rule + `.topos-enter` keyframe-free entrance)
- Modify: `features/topos/components/CanvasPage.tsx` (stagger index on `taxoLeafNodesRF` +
  nested-family `containerNodesRF` entries)

**Interfaces:** No signature change to existing exports; adds an inline `style.transitionDelay` +
`className="topos-enter"` on newly-mountable node wrapper elements.

- [ ] **Step 1: CSS transition on node position, excluding active drags**

In `index.css`, add after the Task 9/10 rules:

```css
/* Interruptible reflow: when `expanded` changes, ELK recomputes and every node's `position` prop
   jumps to its new value in one React render. Without this, React Flow snaps nodes to the new
   position with zero transition — the tool's primary gesture (expand/collapse) reads as "broken".
   A CSS transition on the node wrapper's `transform` (which is how React Flow positions nodes)
   retargets smoothly if `expanded` toggles again mid-transition — genuinely interruptible, unlike a
   keyframe animation that would restart from zero. Excludes `.dragging` so a user's own drag stays
   1:1 with the pointer (a 400ms lag on every drag frame would feel broken, not fluid). */
.react-flow__node:not(.dragging) {
  transition: transform 400ms var(--ease-out);
}

/* Materialize: a freshly-mounted child card (just-expanded family/container) fades + scales in from
   a near-full size (never scale(0) — nothing in the real world appears from nothing) with a slight
   blur to bridge the transition, per-sibling staggered via inline transition-delay (see
   taxoLeafNodesRF / containerNodesRF in CanvasPage.tsx). @starting-style only fires on true initial
   DOM insertion — subsequent re-renders of an already-mounted node do NOT replay this, so existing
   siblings never "flicker" when a NEW sibling is added to the same container. */
.topos-enter {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
  transition: opacity 260ms var(--ease-out), transform 260ms var(--ease-out), filter 260ms var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: scale(0.95);
    filter: blur(2px);
  }
}
```

- [ ] **Step 2: Apply `.topos-enter` + stagger delay to newly-revealed leaf cards**

`features/topos/components/CanvasPage.tsx`, `taxoLeafNodesRF` (post-Task-3 version, lines ~903-926) —
add a global sibling index (capped) via `.map((f, i) => ...)`:

```typescript
// before (post-Task-3 state)
  const taxoLeafNodesRF: Node[] = useMemo(() => {
    return containerFlat.filter(f => f.kind !== 'container').map(f => {
      const rt = taxoById.get(f.renderId);
      if (!rt) return null;
      const classId = f.renderId.split('::')[0];
      const opacity = classOpacity(classId);
      const isSel = selTaxo?.id === f.renderId;
      const color = natureColorFor(rt.nature, isDark);
      if (f.kind === 'family') {
        return {
          id: f.renderId, type: 'family', position: { x: f.x, y: f.y },
          data: { name: rt.name, childCount: rt.childCount, color, expanded: expanded.has(f.renderId), hasChildren: rt.hasChildren, onToggle: toggleTaxo, selected: isSel, opacity } as FamilyNodeData,
          zIndex: 2,
        } as Node;
      }
      return {
        id: f.renderId, type: 'instance', position: { x: f.x, y: f.y },
        data: { name: rt.name, color, status: rt.status, selected: isSel, opacity, seq: f.seq, io: toposService.getTaxoIO(rt.taxoId) } as InstanceNodeData,
        zIndex: 2,
      } as Node;
    }).filter(Boolean) as Node[];
  }, [containerFlat, taxoById, selTaxo, classOpacity, expanded, toggleTaxo, isDark]);
// after
  const taxoLeafNodesRF: Node[] = useMemo(() => {
    return containerFlat.filter(f => f.kind !== 'container').map((f, i) => {
      const rt = taxoById.get(f.renderId);
      if (!rt) return null;
      const classId = f.renderId.split('::')[0];
      const opacity = classOpacity(classId);
      const isSel = selTaxo?.id === f.renderId;
      const color = natureColorFor(rt.nature, isDark);
      const enterDelay = Math.min(i, 7) * 45;
      if (f.kind === 'family') {
        return {
          id: f.renderId, type: 'family', position: { x: f.x, y: f.y },
          data: { name: rt.name, childCount: rt.childCount, color, expanded: expanded.has(f.renderId), hasChildren: rt.hasChildren, onToggle: toggleTaxo, selected: isSel, opacity, enterDelay } as FamilyNodeData,
          zIndex: 2,
        } as Node;
      }
      return {
        id: f.renderId, type: 'instance', position: { x: f.x, y: f.y },
        data: { name: rt.name, color, status: rt.status, selected: isSel, opacity, seq: f.seq, io: toposService.getTaxoIO(rt.taxoId), enterDelay } as InstanceNodeData,
        zIndex: 2,
      } as Node;
    }).filter(Boolean) as Node[];
  }, [containerFlat, taxoById, selTaxo, classOpacity, expanded, toggleTaxo, isDark]);
```

Add `enterDelay?: number` to both `FamilyNodeData` and `InstanceNodeData` type definitions:

```typescript
// FamilyNodeData (post-Task-3 state) — before
type FamilyNodeData = { name: string; childCount: number; color: string; expanded: boolean; hasChildren: boolean; onToggle: (id: string) => void; selected: boolean; opacity: number };
// after
type FamilyNodeData = { name: string; childCount: number; color: string; expanded: boolean; hasChildren: boolean; onToggle: (id: string) => void; selected: boolean; opacity: number; enterDelay?: number };
```

```typescript
// InstanceNodeData (post-Task-3 state) — before
type InstanceNodeData = { name: string; color: string; status: NodeStatus; selected: boolean; opacity: number; seq?: number; io?: TaxoIO };
// after
type InstanceNodeData = { name: string; color: string; status: NodeStatus; selected: boolean; opacity: number; seq?: number; io?: TaxoIO; enterDelay?: number };
```

Apply the class + delay in `FamilyNode`'s root `<div>` (line 519, destructure `enterDelay` at line
516):

```typescript
// before
function FamilyNode({ id, data }: NodeProps) {
  const { name, childCount, color, expanded, hasChildren, onToggle, selected, opacity } = data as unknown as FamilyNodeData;
  return (
    <div className="rf-brick" style={{
// after
function FamilyNode({ id, data }: NodeProps) {
  const { name, childCount, color, expanded, hasChildren, onToggle, selected, opacity, enterDelay } = data as unknown as FamilyNodeData;
  return (
    <div className="rf-brick topos-enter" style={{ transitionDelay: enterDelay ? `${enterDelay}ms` : undefined,
```

(The `style={{ transitionDelay: ..., ` opens the existing style object — the remaining properties on
lines 520-527 stay exactly as they are, just now inside the same object as the new `transitionDelay`
key; no other line in that block changes.)

Apply identically in `InstanceNode` (line 542-556):

```typescript
// before
function InstanceNode({ data }: NodeProps) {
  const { name, color, status, selected, opacity, seq, io } = data as unknown as InstanceNodeData;
  const dead = status === 'dead';
  const rows = ioRowCount(io);
  const height = TAXO_H.instance + ioRowsExtraHeight(rows);
  const ins = io?.inputs ?? [];
  const outs = io?.outputs ?? [];
  return (
    <div className="rf-brick" style={{
// after
function InstanceNode({ data }: NodeProps) {
  const { name, color, status, selected, opacity, seq, io, enterDelay } = data as unknown as InstanceNodeData;
  const dead = status === 'dead';
  const rows = ioRowCount(io);
  const height = TAXO_H.instance + ioRowsExtraHeight(rows);
  const ins = io?.inputs ?? [];
  const outs = io?.outputs ?? [];
  return (
    <div className="rf-brick topos-enter" style={{ transitionDelay: enterDelay ? `${enterDelay}ms` : undefined,
```

- [ ] **Step 3: Apply the same treatment to nested (non-class-root) `ContainerNode` entries**

`containerNodesRF` (post-Task-5 state, lines ~866-899) — the family-variant branch (a nested expanded
family is a genuinely "newly revealed" element; the class-root variant is a same-id type swap from
brick→container and is explicitly NOT covered here — an accepted instant-cut, documented in this task
so it doesn't read as an oversight):

```typescript
// before (family-variant return, post-Task-3 state)
      const rt = taxoById.get(f.renderId);
      const nature = rt?.nature ?? 'code';
      return {
        id: f.renderId, type: 'container', ...base,
        data: {
          variant: 'family', label: rt?.name ?? f.renderId, nature, color: natureColorFor(nature, isDark), opacity,
          selected: selTaxo?.id === f.renderId, onToggle: toggleTaxo,
          headerH: f.header ?? CONTAINER_HEADER_H, gutterL: 0, gutterR: 0, w: f.w, h: f.h,
          childCount: rt?.childCount ?? 0,
        } as ContainerNodeData,
      } as Node;
// after
      const rt = taxoById.get(f.renderId);
      const nature = rt?.nature ?? 'code';
      return {
        id: f.renderId, type: 'container', ...base,
        className: 'topos-enter',
        data: {
          variant: 'family', label: rt?.name ?? f.renderId, nature, color: natureColorFor(nature, isDark), opacity,
          selected: selTaxo?.id === f.renderId, onToggle: toggleTaxo,
          headerH: f.header ?? CONTAINER_HEADER_H, gutterL: 0, gutterR: 0, w: f.w, h: f.h,
          childCount: rt?.childCount ?? 0,
        } as ContainerNodeData,
      } as Node;
```

(React Flow's `Node` type accepts a top-level `className` that it merges onto the node's wrapper `div`
— this is simpler here than threading a prop through `ContainerNode`, since no stagger index is needed
for containers: at most one nested family is newly-expanded per user click, so no sibling cascade to
stagger.)

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 5: Puppeteer verify — reflow + materialize**

Two checks:

1. **Reflow eases, doesn't snap:** click a chevron to expand a class, then sample the position of a
   DIFFERENT node that has to move out of the way (e.g. a downstream node in the same layer) at 0ms,
   150ms, and 500ms after the click. Confirm it's at an INTERMEDIATE position at 150ms (not already at
   its final position, and not still at its starting position) — proves the transition is real, not an
   instant jump disguised by the screenshot timing.
2. **Materialize + stagger:** expand a container with several children, screenshot at 0ms and 300ms.
   Confirm children are present (not blank) at 300ms and that the ones with a higher stagger index
   visibly lag the earlier ones at an intermediate timestamp (~150ms) — e.g. sample opacity of the
   1st vs. 5th child's DOM element via `page.evaluate` reading `getComputedStyle(...).opacity` at
   150ms; the 5th should be measurably lower than the 1st (5×45=225ms delay not yet elapsed) while the
   1st (0ms delay) is already near 1.

- [ ] **Step 6: Reduced-motion note (implemented in Task 12)**

This task intentionally does NOT add a `prefers-reduced-motion` override yet — Task 12 adds ONE
consolidated override covering everything from Tasks 9-11, so the override has full context of every
rule it needs to neutralize instead of being split across tasks.

- [ ] **Step 7: Commit**

```bash
git add index.css features/topos/components/CanvasPage.tsx
git commit -m "topos: interruptible reflow transition + materialize/stagger for revealed children"
```

---

## Task 12: `prefers-reduced-motion` — consolidated override

**Files:**
- Modify: `index.css` (final block, added after Task 11)

**Interfaces:** None.

- [ ] **Step 1: Add the reduced-motion override**

Append to the end of `index.css`, after every rule from Tasks 9-11:

```css
/* Reduced motion: keep opacity/color changes (they aid comprehension — a card fading dim on
   spotlight-dim, an entrance still marking "this is new"), drop movement/scale/blur. Reflow becomes
   an instant re-layout instead of a 400ms glide; entrances become a fast opacity-only cross-fade
   instead of scale+blur+stagger (stagger delay removed too — a reduced-motion user shouldn't wait
   through a cascade that exists purely for visual flourish). */
@media (prefers-reduced-motion: reduce) {
  .react-flow__node:not(.dragging) {
    transition: opacity 150ms ease;
  }
  .topos-enter {
    transition: opacity 150ms ease;
    transition-delay: 0ms !important;

    @starting-style {
      opacity: 0;
      transform: none;
      filter: none;
    }
  }
  .topos-chevron-glyph,
  .topos-chevron-glyph:active {
    transition: none;
    transform: none;
  }
  @media (hover: hover) and (pointer: fine) {
    .rf-brick:hover {
      transform: none;
      box-shadow: none;
    }
  }
}
```

(`transition-delay: 0ms !important` overrides the per-node inline `style.transitionDelay` set in Task
11 Step 2/3 — inline styles otherwise win over an external stylesheet rule for the SAME property on
specificity grounds, but `!important` in the media-query rule wins regardless of the inline style's
source, which is exactly the override needed here.)

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 3: Puppeteer verify with emulated reduced motion**

```js
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
// re-run the same expand-click + intermediate-sample checks from Task 11 Step 5 — confirm the node
// reaches its final position/opacity in well under 150ms (no 400ms glide, no stagger lag).
```

- [ ] **Step 4: Commit**

```bash
git add index.css
git commit -m "topos: prefers-reduced-motion — consolidated override for reflow/enter/chevron/hover"
```

---

# Amendment 2026-07-14 — grid discipline, 45° edges, pill-ification, DB-table schema

Owner request, added before Tasks 1-12 executed. Design amendment:
`docs/superpowers/specs/2026-07-13-topos-blueprint-design.md` § "Amendment 2026-07-14". These 5 tasks
extend the plan above — **Task 13 must run before Tasks 5 and 8** (it retunes constants those tasks
also touch; running it first means Tasks 5/8 are implemented directly against final numbers instead of
being retuned twice). Tasks 14-17 have no such ordering constraint against 1-12, but Task 17 depends on
Task 16 (schema data must exist before it can be rendered) and on Task 6/11 having landed (it edits
`InstanceNode`'s post-Task-11 state).

**One judgment call flagged for owner redirect:** "pills must be clickable" did not specify the click
action. Task 15 implements it as copy-to-clipboard (the smallest real utility that doesn't invent a new
UI surface) — say so if a different action (e.g. filter/highlight-by-value) was intended.

---

## Task 13: Global 24px outer grid + 8px inner grid (mandatory, guaranteed by construction)

**Files:**
- Create: `features/topos/lib/gridSnap.ts`
- Create: `scripts/check_grid_snap.ts`
- Modify: `features/topos/components/CanvasPage.tsx` (constants + `computeLayout` + `zoneNodes` +
  `bands`)
- Modify: `features/topos/lib/containerLayout.ts` (constants)

**Interfaces:**
- Produces: `GRID = 24`, `roundUp24(n): number`, `snapTo24(n): number`,
  `snapPositions({pos, pts, edgeEndpoints}): {pos, pts}` from `features/topos/lib/gridSnap.ts`.
- **The guarantee mechanism is `roundUp24` (applied to every top-level node's computed width/height)
  and `snapPositions` (applied once to `computeLayout`'s final `pos`/edge points) — not hand-tuned
  constants.** Constants are retuned too, as a polish layer that reduces the padding `roundUp24` adds,
  per the design amendment's explicit scoping (nested taxo children stay on the 8px inner system).

- [ ] **Step 1: Write `features/topos/lib/gridSnap.ts`**

```typescript
/**
 * The 24px canvas grid guarantee (Blueprint amendment 2026-07-14). Two small pure functions:
 * `roundUp24` pads a computed size UP to the next 24px multiple (applied at every top-level node's
 * width/height computation — collapsed brick, expanded container, item card, zone/band contour).
 * `snapPositions` rounds every node's final x/y to the NEAREST 24px multiple, once, after ELK's pass
 * 2 — and corrects edge routes by the same per-node delta so ports/edges stay visually attached.
 *
 * Nested taxo children (family/instance leaves inside an expanded container) are NOT snapped here —
 * they're positioned relatively via `containerLayout`'s masonry, inside an already-grid-anchored
 * parent, which is what "tied to the grid" means one level down (see the design amendment's scope
 * note — forcing every masonry sum onto a 24-multiple would fight the packer for no visible gain).
 */
export const GRID = 24;

export function roundUp24(n: number): number {
  return Math.ceil(n / GRID) * GRID;
}

export function snapTo24(n: number): number {
  return Math.round(n / GRID) * GRID;
}

export interface XY { x: number; y: number }

export interface SnapInput {
  pos: Record<string, XY>;
  pts: Record<string, XY[]>;
  edgeEndpoints: Record<string, { source: string; target: string }>;
}

export function snapPositions({ pos, pts, edgeEndpoints }: SnapInput): { pos: Record<string, XY>; pts: Record<string, XY[]> } {
  const delta: Record<string, { dx: number; dy: number }> = {};
  const snappedPos: Record<string, XY> = {};
  for (const id of Object.keys(pos)) {
    const p = pos[id];
    const sx = snapTo24(p.x), sy = snapTo24(p.y);
    delta[id] = { dx: sx - p.x, dy: sy - p.y };
    snappedPos[id] = { x: sx, y: sy };
  }
  const snappedPts: Record<string, XY[]> = {};
  for (const [edgeId, points] of Object.entries(pts)) {
    const ep = edgeEndpoints[edgeId];
    const dSrc = ep ? (delta[ep.source] ?? { dx: 0, dy: 0 }) : { dx: 0, dy: 0 };
    const dTgt = ep ? (delta[ep.target] ?? { dx: 0, dy: 0 }) : { dx: 0, dy: 0 };
    const dx = (dSrc.dx + dTgt.dx) / 2, dy = (dSrc.dy + dTgt.dy) / 2;
    snappedPts[edgeId] = points.map(pt => ({ x: pt.x + dx, y: pt.y + dy }));
  }
  return { pos: snappedPos, pts: snappedPts };
}
```

- [ ] **Step 2: Write the failing test — `scripts/check_grid_snap.ts`**

```typescript
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
```

- [ ] **Step 3: Run test to verify it passes**

```bash
npx tsx scripts/check_grid_snap.ts
```

Expected: all lines `PASS`, `gridSnap check PASSED.`

- [ ] **Step 4: Retune outer-grid constants in `features/topos/components/CanvasPage.tsx`**

A single consolidated numeric retuning — each is a literal-value change only, no logic change:

| Constant | Line (pre-amendment) | Before | After |
| --- | --- | --- | --- |
| `NODE_W` | 27 | `232` | `240` |
| `ROW_H` | 135 | `34` | `32` |
| `ITEM_W, ITEM_H, ITEM_GX, ITEM_GY, BAND_LABEL, BAND_PAD, BAND_GAP` | 132 | `174, 54, 16, 14, 30, 16, 66` | `168, 48, 24, 24, 24, 24, 72` |
| `elk.spacing.nodeNode` | 184 | `'58'` | `'48'` |
| `elk.layered.spacing.nodeNodeBetweenLayers` | 185 | `'150'` | `'144'` |
| `SAFE_ZONE` | 39 | `34` | `24` |
| `elk.spacing.edgeEdge` | 188 | `'16'` | `'24'` |
| `elk.layered.spacing.edgeEdgeBetweenLayers` | 189 | `'16'` | `'24'` |

(`elk.spacing.portPort` at line 190, value `'13'`, is deliberately EXEMPT — it governs intra-node port
distribution, not node-to-node spacing, so it doesn't participate in the grid-summation property.)

Apply each as a direct literal replacement at its line. Example for `NODE_W` (line 27):

```typescript
// before
const NODE_W = 232;   // I/O chips stack as rows inside the card (grows height, not width)
// after
const NODE_W = 240;   // I/O chips stack as rows inside the card (grows height, not width) — 24px-grid-aligned
```

Apply the same literal-only pattern for each row in the table above (each is a single-line numeric
swap; the surrounding code/comments on that line stay unchanged except where the table shows a full
replacement group like `ITEM_W...BAND_GAP`, which is one combined `const` statement — line 132):

```typescript
// before
const ITEM_W = 174, ITEM_H = 54, ITEM_GX = 16, ITEM_GY = 14, BAND_LABEL = 30, BAND_PAD = 16, BAND_GAP = 66;
// after
const ITEM_W = 168, ITEM_H = 48, ITEM_GX = 24, ITEM_GY = 24, BAND_LABEL = 24, BAND_PAD = 24, BAND_GAP = 72;
```

- [ ] **Step 5: Retune inner-grid (8px) constants in `features/topos/lib/containerLayout.ts`**

```typescript
// before (line 26-31)
export const TAXO_W = 156;
export const TAXO_H: Record<TaxoKind, number> = { family: 40, instance: 34 };
export const CONTAINER_HEADER_H = 40;    // (or 50, if Task 5 already ran — see below)
export const CONTAINER_GUTTER_W = 124;
export const CONTAINER_BODY_PAD = 14;
export const CELL_GAP = 10;
// after
export const TAXO_W = 168;
export const TAXO_H: Record<TaxoKind, number> = { family: 40, instance: 32 };
export const CONTAINER_HEADER_H = 48;    // outer-grid-facing (a class-root container's overall size feeds ELK)
export const CONTAINER_GUTTER_W = 120;
export const CONTAINER_BODY_PAD = 16;
export const CELL_GAP = 8;
```

(If Task 5 has already run, `CONTAINER_HEADER_H` will read `50` at this point — change that `50` to
`48` instead of the `40` shown above; the end state is `48` either way.)

```typescript
// before (line 41-42)
export const IO_ROW_H = 15;
export const IO_ROW_PAD = 4;   // gap between the name row and the first I/O row
// after
export const IO_ROW_H = 16;
export const IO_ROW_PAD = 4;   // gap between the name row and the first I/O row — a connective micro-gap, deliberately exempt from the 8px grid (like a border width)
```

- [ ] **Step 6: Wire `roundUp24` into `computeLayout`'s size computation**

`features/topos/components/CanvasPage.tsx` — add the import (near the other `lib/` imports, after line
25):

```typescript
import { roundUp24, snapTo24, snapPositions } from '../lib/gridSnap';
```

(`snapTo24` is needed by the D-002 correction in Step 8.)

Replace the sizing block (lines 230-245):

```typescript
// before
  tasks.forEach(t => {
    const rows = Math.max(inList[t.id]?.length ?? 0, outList[t.id]?.length ?? 0);
    if (expanded.has(t.id) && toposService.getTaxonomy(t.id).length > 0) {
      const cl = containerLayout(t.id, expanded, tasks);
      const portsH = cl.header + rows * ROW_H + 6;
      const h = Math.max(cl.size.h, portsH);
      containerLayouts[t.id] = h === cl.size.h ? cl : { ...cl, size: { w: cl.size.w, h } };
      widths[t.id] = cl.size.w;
      heights[t.id] = h;
    } else {
      widths[t.id] = NODE_W;
      heights[t.id] = headerH(t) + rows * ROW_H + 6;
    }
  });
// after
  tasks.forEach(t => {
    const rows = Math.max(inList[t.id]?.length ?? 0, outList[t.id]?.length ?? 0);
    if (expanded.has(t.id) && toposService.getTaxonomy(t.id).length > 0) {
      const cl = containerLayout(t.id, expanded, tasks);
      const portsH = cl.header + rows * ROW_H + 6;
      const h = roundUp24(Math.max(cl.size.h, portsH));
      const w = roundUp24(cl.size.w);
      containerLayouts[t.id] = (h === cl.size.h && w === cl.size.w) ? cl : { ...cl, size: { w, h } };
      widths[t.id] = w;
      heights[t.id] = h;
    } else {
      widths[t.id] = roundUp24(NODE_W);
      heights[t.id] = roundUp24(headerH(t) + rows * ROW_H + 6);
    }
  });
```

- [ ] **Step 7: Wire `snapPositions` into `computeLayout`'s return**

Replace lines 296-312:

```typescript
// before
  const res: any = await elk.layout(pass2 as any);
  const pos: Pos = {};
  const handles: Handles = {};
  (res.children ?? []).forEach((c: any) => {
    pos[c.id] = { x: c.x ?? 0, y: c.y ?? 0 };
    (c.ports ?? []).forEach((p: any) => {
      const side = (p.layoutOptions?.['elk.port.side'] ?? 'EAST') as Side;
      (handles[c.id] ??= []).push({ id: p.id, kind: p.id.endsWith('__s') ? 'source' : 'target', side, x: p.x ?? 0, y: p.y ?? 0 });
    });
  });
  const pts: EdgePts = {};
  (res.edges ?? []).forEach((e: any) => {
    const sec = e.sections?.[0];
    if (!sec) return;
    pts[e.id] = [sec.startPoint, ...(sec.bendPoints ?? []), sec.endPoint];
  });
  return { pos, pts, handles, heights, widths, containerLayouts };
// after
  const res: any = await elk.layout(pass2 as any);
  const rawPos: Pos = {};
  const handles: Handles = {};
  (res.children ?? []).forEach((c: any) => {
    rawPos[c.id] = { x: c.x ?? 0, y: c.y ?? 0 };
    (c.ports ?? []).forEach((p: any) => {
      const side = (p.layoutOptions?.['elk.port.side'] ?? 'EAST') as Side;
      (handles[c.id] ??= []).push({ id: p.id, kind: p.id.endsWith('__s') ? 'source' : 'target', side, x: p.x ?? 0, y: p.y ?? 0 });
    });
  });
  const rawPts: EdgePts = {};
  (res.edges ?? []).forEach((e: any) => {
    const sec = e.sections?.[0];
    if (!sec) return;
    rawPts[e.id] = [sec.startPoint, ...(sec.bendPoints ?? []), sec.endPoint];
  });
  const edgeEndpoints: Record<string, { source: string; target: string }> = {};
  edges.forEach(e => { edgeEndpoints[e.id] = { source: e.source, target: e.target }; });
  const { pos, pts } = snapPositions({ pos: rawPos, pts: rawPts, edgeEndpoints });
  return { pos, pts, handles, heights, widths, containerLayouts };
```

- [ ] **Step 8: `roundUp24` + retuned margins on zone/band contours**

`zoneNodes` (lines 791-810), retune `PAD`/`TOP` and round the derived box:

```typescript
// before
  const zoneNodes: Node[] = useMemo(() => {
    if (!pos) return [];
    const PAD = 46, TOP = 34;
    return layers.map((layer) => {
      const members = tasks.filter(t => t.layer_id === layer.id && pos[t.id]);
      if (!members.length) return null;
      const minX = Math.min(...members.map(t => pos[t.id].x)) - PAD;
      const minY = Math.min(...members.map(t => pos[t.id].y)) - PAD - TOP;
      const maxX = Math.max(...members.map(t => pos[t.id].x + (widths[t.id] ?? NODE_W))) + PAD;
      const maxY = Math.max(...members.map(t => pos[t.id].y + (heights[t.id] ?? headerH(t) + ROW_H))) + PAD;
      return {
        id: `zone_${layer.id}`, type: 'zone', position: { x: minX, y: minY },
        data: { label: layer.name, role: layer.role, color: clusterColorFor(layer.slug as ClusterSlug, isDark) },
        style: { width: maxX - minX, height: maxY - minY }, draggable: false, selectable: false, zIndex: -1,
      } as Node;
    }).filter(Boolean) as Node[];
  }, [layers, tasks, pos, heights, widths, isDark]);
// after
  const zoneNodes: Node[] = useMemo(() => {
    if (!pos) return [];
    const PAD = 48, TOP = 24;
    return layers.map((layer) => {
      const members = tasks.filter(t => t.layer_id === layer.id && pos[t.id]);
      if (!members.length) return null;
      const minX = Math.min(...members.map(t => pos[t.id].x)) - PAD;
      const minY = Math.min(...members.map(t => pos[t.id].y)) - PAD - TOP;
      const maxX = Math.max(...members.map(t => pos[t.id].x + (widths[t.id] ?? NODE_W))) + PAD;
      const maxY = Math.max(...members.map(t => pos[t.id].y + (heights[t.id] ?? headerH(t) + ROW_H))) + PAD;
      return {
        id: `zone_${layer.id}`, type: 'zone', position: { x: minX, y: minY },
        data: { label: layer.name, role: layer.role, color: clusterColorFor(layer.slug as ClusterSlug, isDark) },
        style: { width: roundUp24(maxX - minX), height: roundUp24(maxY - minY) }, draggable: false, selectable: false, zIndex: -1,
      } as Node;
    }).filter(Boolean) as Node[];
  }, [layers, tasks, pos, heights, widths, isDark]);
```

(NOTE: the `data: {...color: clusterColorFor(...)}` line already reflects Task 3's edit — if Task 3 has
not yet run when this step executes, keep whatever that line currently reads and only change `PAD`/
`TOP`/the `style:` line as shown.)

`bands` (lines 925-948) — round the final band height:

```typescript
// before (line 946)
    zones.push({ id: 'band_constraint', type: 'band', position: { x: minX - 22, y: maxY + BAND_GAP - 6 }, data: { label: BAND.constraint.label, role: BAND.constraint.role, color: BAND.constraint.color }, style: { width: bandW + 44, height: h + 12 }, draggable: false, selectable: false, zIndex: -1 } as Node);
// after
    zones.push({ id: 'band_constraint', type: 'band', position: { x: snapTo24(minX - 24), y: snapTo24(maxY + BAND_GAP - 8) }, data: { label: BAND.constraint.label, role: BAND.constraint.role, color: BAND.constraint.color }, style: { width: roundUp24(bandW + 48), height: roundUp24(h + 16) }, draggable: false, selectable: false, zIndex: -1 } as Node);
```

> **Correction D-002 (applied 2026-07-14 during execution).** The band POSITION must be snapped, not
> just its size. `maxY + BAND_GAP - 8` is off the 24-grid by 16px (the `-8` cosmetic offset) even though
> `BAND_GAP` is a 24-multiple — so the "after" above already wraps both `x` and `y` in `snapTo24` (add
> `snapTo24` to the Step 6 import). Without it, `band_constraint` is the one top-level node that violates
> the mandatory grid. See `docs/superpowers/DIVERGENCES.md` D-002.

- [ ] **Step 9: Single 24px background grid, dots centered in each cell**

Supersedes Task 4's two-layer `<Background>` (fine dots @ 15px + major lines @ 105px) with one 24px dot
grid, offset to cell centers:

```typescript
// before (Task 4's version)
<Background id="bg-fine" gap={15} size={1} variant={BackgroundVariant.Dots} color={isDark ? '#1b2838' : '#dfe4ea'} />
<Background id="bg-major" gap={105} size={1} variant={BackgroundVariant.Lines} color={isDark ? '#141f2c' : '#e6e9ee'} style={{ opacity: isDark ? 0.5 : 0.35 }} />
// after
<Background id="bg-grid" gap={24} size={1} offset={12} variant={BackgroundVariant.Dots} color={isDark ? '#1b2838' : '#dfe4ea'} />
```

(If Task 4 has not yet run when this step executes, add this single `<Background>` line in place of
the original single `<Background gap={22} .../>` at that spot instead.)

- [ ] **Step 10: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
npx tsx scripts/check_grid_snap.ts            # expect PASSED
npx tsx scripts/check_container_layout.ts     # expect PASSED (constants changed, no assertion hardcodes old numeric values)
```

- [ ] **Step 11: Puppeteer screenshot — verify grid alignment**

Screenshot the canvas at a zoom level where the 24px dot grid is visible; for 3-4 sampled nodes, read
their rendered bounding box (`page.evaluate` → `getBoundingClientRect()` on `.react-flow__node`,
converted back to flow coordinates via React Flow's own `x`/`y`/zoom transform, or simpler: read the
node's `transform: translate(x,y)` inline style directly) and confirm `x % 24 === 0 && y % 24 === 0`
for each, and that width/height are also multiples of 24.

- [ ] **Step 12: Commit**

```bash
git add features/topos/lib/gridSnap.ts scripts/check_grid_snap.ts features/topos/components/CanvasPage.tsx features/topos/lib/containerLayout.ts
git commit -m "topos: mandatory 24px outer grid (roundUp24 + snapPositions) + 8px inner grid retuning"
```

---

## Task 14: 45° chamfered edges (replace rounded corners)

**Files:**
- Modify: `features/topos/components/CanvasPage.tsx` (`orthoPath`)

**Interfaces:** No signature change.

- [ ] **Step 1: Replace the rounded-corner `Q` command with a straight chamfer**

Lines 316-331:

```typescript
// before
function orthoPath(p: XY[], radius = 12): string {
  if (p.length < 2) return '';
  const dist = (a: XY, b: XY) => Math.hypot(a.x - b.x, a.y - b.y) || 1;
  let d = `M ${p[0].x},${p[0].y}`;
  for (let i = 1; i < p.length - 1; i++) {
    const cur = p[i], prev = p[i - 1], next = p[i + 1];
    const d1 = dist(prev, cur), d2 = dist(cur, next);
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const c1 = { x: cur.x + (prev.x - cur.x) / d1 * r, y: cur.y + (prev.y - cur.y) / d1 * r };
    const c2 = { x: cur.x + (next.x - cur.x) / d2 * r, y: cur.y + (next.y - cur.y) / d2 * r };
    d += ` L ${c1.x},${c1.y} Q ${cur.x},${cur.y} ${c2.x},${c2.y}`;
  }
  const last = p[p.length - 1];
  d += ` L ${last.x},${last.y}`;
  return d;
}
// after
// 45° chamfer instead of a rounded corner (circuit-trace look, Blueprint amendment 2026-07-14):
// c1/c2 are equidistant (`r`) from the bend along each axis-aligned leg, so the straight line
// between them is geometrically exactly 45°.
function orthoPath(p: XY[], radius = 12): string {
  if (p.length < 2) return '';
  const dist = (a: XY, b: XY) => Math.hypot(a.x - b.x, a.y - b.y) || 1;
  let d = `M ${p[0].x},${p[0].y}`;
  for (let i = 1; i < p.length - 1; i++) {
    const cur = p[i], prev = p[i - 1], next = p[i + 1];
    const d1 = dist(prev, cur), d2 = dist(cur, next);
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const c1 = { x: cur.x + (prev.x - cur.x) / d1 * r, y: cur.y + (prev.y - cur.y) / d1 * r };
    const c2 = { x: cur.x + (next.x - cur.x) / d2 * r, y: cur.y + (next.y - cur.y) / d2 * r };
    d += ` L ${c1.x},${c1.y} L ${c2.x},${c2.y}`;
  }
  const last = p[p.length - 1];
  d += ` L ${last.x},${last.y}`;
  return d;
}
```

(`ContainsEdgeComp` at line 341-345 calls `orthoPath(d.points, 6)` — same function, smaller radius,
picks up the chamfer automatically, no separate change needed.)

- [ ] **Step 2: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 3: Puppeteer screenshot**

Zoom into an edge with a bend (any edge whose source/target sit on different rows). Confirm the corner
is now a flat diagonal cut, not a curve — visually compare against a pre-Task-14 screenshot of the same
edge.

- [ ] **Step 4: Commit**

```bash
git add features/topos/components/CanvasPage.tsx
git commit -m "topos: 45° chamfered edge corners (circuit-trace look), replacing rounded corners"
```

---

## Task 15: Pill-ify remaining bare text + clickable enum-value pills

**Files:**
- Modify: `scripts/extract_taxo_io.py` (extract `enum` arrays per input)
- Modify: `data/taxonomy_io.ts` (regenerated — add `enumValues` where present)
- Modify: `types.ts` (`TaxoIO` — add `enumValues?: string[]` per input)
- Modify: `features/topos/components/CanvasPage.tsx` (`DetailDrawer`, `ItemDrawer`, a new
  `ClickablePill`, `TaxoIOChip`'s enum row)

**Interfaces:**
- Extends `TaxoIO.inputs[]` items with an optional `enumValues?: string[]`.
- Produces `ClickablePill({ text, color }): JSX` — copy-to-clipboard on click, reused by all 3 spots.

- [ ] **Step 1: Extract `enum` arrays in the Python extractor**

`scripts/extract_taxo_io.py` — inspect the input-parsing loop (near where `required`/`name` are read
per property) and add `enum` capture. Locate the block that builds each input's `{"name":..,
"required":..}` dict (inside `extract_tools`, iterating `properties.items()`) and extend it:

```python
# before (representative — the exact surrounding loop already exists; this is the per-property dict construction to extend)
        inputs.append({"name": prop_name, "required": prop_name in required_set})
# after
        prop_schema = properties.get(prop_name, {})
        enum_vals = prop_schema.get("enum") if isinstance(prop_schema, dict) else None
        entry = {"name": prop_name, "required": prop_name in required_set}
        if isinstance(enum_vals, list) and enum_vals:
            entry["enum"] = [str(v) for v in enum_vals]
        inputs.append(entry)
```

(Locate the ACTUAL variable names in `extract_tools` — `prop_schema`/`properties`/`required_set` are
descriptive placeholders for whatever the existing loop already calls them; the executor must read the
existing function body first and adapt these names to match exactly, since the file wasn't re-quoted in
full here — the transformation itself, "read the property's own `enum` list and attach it to the
output dict", is exact and unambiguous. Confirm via `npx tsx scripts/check_taxo_io.ts` afterward, which
will catch a wiring mistake immediately.)

- [ ] **Step 2: Update `TaxoIO` type + regenerate `data/taxonomy_io.ts`**

`types.ts` — find the existing `TaxoIO` interface and extend the input item shape:

```typescript
// before
export interface TaxoIO {
  inputs?: { name: string; required?: boolean }[];
  outputs?: string[];
}
// after
export interface TaxoIO {
  inputs?: { name: string; required?: boolean; enumValues?: string[] }[];
  outputs?: string[];
}
```

Regenerate:

```bash
cd ~/topos
python3 scripts/extract_taxo_io.py > /tmp/taxo_io_v2.json
python3 -c "import json; d=json.load(open('/tmp/taxo_io_v2.json')); print(d['tools']['update_focus'])"
```

Expected: `update_focus`'s `status` input now carries `"enum": ["active", "paused"]` (per the
`_schemas.py` grep at design-amendment time, line 57/198/329 all show `"status": {"type": "string",
"enum": ["active", "paused"]}` across different tool schemas — confirm `update_focus`'s specifically has
one). Add the `enumValues` field to that entry in `data/taxonomy_io.ts` by hand-copying the exact JSON
array (same discipline as Task 7 — never retype from memory, copy the extractor's literal output).

- [ ] **Step 3: Run the self-check**

```bash
npx tsx scripts/check_taxo_io.ts 2>&1 | tail -10
```

Expected: still `PASSED` (the check only asserts `inputs` name/required parity — an added `enumValues`
field doesn't break its existing deep-equality assertions as long as those assertions compare specific
keys, not the whole object; if the check does a full deep-equal and now fails on the new field, extend
`check_taxo_io.ts`'s comparison to also diff `enumValues` the same way it diffs `required`).

- [ ] **Step 4: `ClickablePill` — copy-to-clipboard, reused everywhere bare text remains**

Add near `TaxoIOChip` (after its definition):

```typescript
// Blueprint amendment 2026-07-14: no bare text for parameters/types/enum values — everything becomes
// a pill, and every pill is clickable. Click action (owner asked for "clickable", didn't specify the
// action — this is the smallest real utility: copy the exact text, useful when reading the map and
// wanting to paste a param/enum/column name into code or chat). Brief opacity flash confirms the copy.
function ClickablePill({ text, color, mono = true }: { text: string; color: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 400);
      }}
      title={`${text} (клик — копировать)`}
      style={{
        display: 'inline-flex', maxWidth: 140, minWidth: 0, cursor: 'pointer',
        border: `1px solid ${color}`, background: copied ? `${color}44` : `${color}1f`, color,
        borderRadius: 4, padding: '2px 6px', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        fontSize: 9, lineHeight: 1.3, transition: 'background 150ms var(--ease-out)',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
    </button>
  );
}
```

Add `useState` to the existing React import at the top of the file (line 1):

```typescript
// before
import React, { useMemo, useState, useCallback, useEffect } from 'react';
// after (no change — useState is already imported)
```

(`useState` is already imported — confirmed at line 1 — no import change needed for this step.)

- [ ] **Step 5: Pill-ify `DetailDrawer`'s "ВХОД → ВЫХОД" section**

Lines 1131-1138:

```typescript
// before
      {io && (
        <Section title="ВХОД → ВЫХОД">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.6, color: 'var(--text-muted,#c2c9d4)' }}>
            <div><span style={{ opacity: 0.5 }}>in: </span>{[...io.inputs.required, ...io.inputs.optional].map(ioLabel).join(', ') || '—'}</div>
            <div><span style={{ opacity: 0.5 }}>out: </span>{ioLabel(io.outputs.primary)}</div>
          </div>
        </Section>
      )}
// after
      {io && (
        <Section title="ВХОД → ВЫХОД">
          <div style={{ fontSize: 9, opacity: 0.5, width: '100%', marginBottom: 2 }}>in</div>
          {[...io.inputs.required, ...io.inputs.optional].map(ioLabel).map(label => (
            <ClickablePill key={label} text={label} color={color} />
          ))}
          <div style={{ fontSize: 9, opacity: 0.5, width: '100%', margin: '6px 0 2px' }}>out</div>
          <ClickablePill text={ioLabel(io.outputs.primary)} color={color} />
        </Section>
      )}
```

(`Section`'s wrapping `<div style={{display:'flex', flexWrap:'wrap', gap: 5}}>` — line 1234 — already
lays out its children as a wrapping pill row, so this needs no extra wrapper; the two `fontSize:9`
labels above are just section sub-headers within that same flex row, and `width:'100%'` forces
`in`/`out` onto their own line before the pills that follow.)

- [ ] **Step 6: Pill-ify `ItemDrawer`'s `example_values`**

Line 1218:

```typescript
// before
      {raw.example_values && <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted,#9aa4b2)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>{raw.example_values}</p>}
// after
      {raw.example_values && (
        <Section title="ПРИМЕРЫ ЗНАЧЕНИЙ">
          {String(raw.example_values).split(',').map((v: string) => v.trim()).filter(Boolean).map((v: string) => (
            <ClickablePill key={v} text={v} color={color} />
          ))}
        </Section>
      )}
```

(`example_values` is a comma-separated string in the source data — confirmed by its current plain-text
render; splitting on `,` and trimming turns it into one pill per value without any data-file change.)

- [ ] **Step 7: Enum-value pills on `TaxoIOChip`'s input rows**

`InstanceNode`'s IO-row rendering (post-Task-6/11 state) needs an extra pill row under any input that
carries `enumValues`. Locate the input-chip cell (post-Task-6: `<span ...>{ins[r] && <TaxoIOChip
label={ins[r].name} kind={...} color={color} />}</span>`) and extend the row's container to also emit
enum pills beneath the param pill when present:

```typescript
// before (post-Task-6/11 state)
            <div key={r} style={{ minHeight: IO_ROW_H, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
              <span style={{ minWidth: 0, display: 'flex' }}>{ins[r] && <TaxoIOChip label={ins[r].name} kind={ins[r].required ? 'required' : 'optional'} color={color} />}</span>
              <span style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>{outs[r] && <TaxoIOChip label={outs[r]} kind="output" color={color} />}</span>
            </div>
// after
            <div key={r} style={{ minHeight: IO_ROW_H, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
                <span style={{ minWidth: 0, display: 'flex' }}>{ins[r] && <TaxoIOChip label={ins[r].name} kind={ins[r].required ? 'required' : 'optional'} color={color} />}</span>
                <span style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>{outs[r] && <TaxoIOChip label={outs[r]} kind="output" color={color} />}</span>
              </div>
              {ins[r]?.enumValues && ins[r].enumValues!.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 10 }}>
                  {ins[r].enumValues!.map(v => <ClickablePill key={v} text={v} color={color} mono={false} />)}
                </div>
              )}
            </div>
```

`instanceCellHeight` (in `containerLayout.ts`) must account for the extra enum-pill row height when
present, or the masonry grid will under-size cells with enum params. Extend `ioRowsExtraHeight`'s
caller chain — add a new export:

```typescript
// features/topos/lib/containerLayout.ts — add after ioRowsExtraHeight (post-Task-13 line numbers shift; locate by content)
export const ENUM_ROW_H = 16;
export function enumRowsExtraHeight(io?: TaxoIO): number {
  if (!io?.inputs) return 0;
  return io.inputs.filter(i => i.enumValues && i.enumValues.length > 0).length * ENUM_ROW_H;
}
```

```typescript
// instanceCellHeight — before
export function instanceCellHeight(taxoId: string): number {
  return TAXO_H.instance + ioRowsExtraHeight(ioRowCount(toposService.getTaxoIO(taxoId)));
}
// after
export function instanceCellHeight(taxoId: string): number {
  const io = toposService.getTaxoIO(taxoId);
  return TAXO_H.instance + ioRowsExtraHeight(ioRowCount(io)) + enumRowsExtraHeight(io);
}
```

And in `InstanceNode` (CanvasPage.tsx), the `height` computation must match:

```typescript
// before
  const height = TAXO_H.instance + ioRowsExtraHeight(rows);
// after
  const height = TAXO_H.instance + ioRowsExtraHeight(rows) + enumRowsExtraHeight(io);
```

(Add `enumRowsExtraHeight` to the existing `containerLayout` import at the top of `CanvasPage.tsx`.)

- [ ] **Step 8: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
npx tsx scripts/check_taxo_io.ts              # expect PASSED
npx tsx scripts/check_container_layout.ts     # expect PASSED
```

- [ ] **Step 9: Puppeteer screenshot + click-to-copy verify**

Screenshot `update_focus`'s expanded card — confirm the `status` param shows `active`/`paused` as two
small pills beneath it. Click one via Puppeteer (`page.click`) and read `navigator.clipboard` (grant
clipboard permission on the page context first: `await context.overridePermissions(url,
['clipboard-read', 'clipboard-write'])`) — confirm the clicked pill's exact text was copied. Also open
a `DetailDrawer` and an `ItemDrawer` with `example_values` — confirm both show pills, not a bare string.

- [ ] **Step 10: Commit**

```bash
git add scripts/extract_taxo_io.py data/taxonomy_io.ts types.ts features/topos/components/CanvasPage.tsx features/topos/lib/containerLayout.ts
git commit -m "topos: pill-ify remaining bare text + clickable copy-to-clipboard pills + enum-value pills"
```

---

## Task 16: Extract vault-table schema (columns + types)

**Files:**
- Create: `scripts/extract_vault_schema.py`
- Create: `data/vault_schema.ts`
- Create: `scripts/check_vault_schema.ts`
- Modify: `services/toposService.ts` (`getVaultSchema`)

**Interfaces:**
- Produces: `VaultColumn { name: string; type: string; required: boolean }`,
  `VaultTableSchema { table: string; columns: VaultColumn[] }`,
  `VAULT_SCHEMA: Record<string, VaultTableSchema>` (keyed by the `data/taxonomy.ts` instance id, e.g.
  `vault_items`), `toposService.getVaultSchema(taxoId): VaultTableSchema | undefined`.

- [ ] **Step 1: Write `scripts/extract_vault_schema.py`**

```python
"""
Throwaway AST/regex parser: extracts CREATE TABLE column schemas from ~/vectoros source, WITHOUT
importing the vectoros package (mirrors scripts/extract_taxo_io.py's discipline).

Vault tables have no ORM — they're raw `CREATE TABLE IF NOT EXISTS <name> (...)` strings, embedded as
Python string literals (module-level `_SCHEMA = """..."""` assignments AND inline
`conn.executescript("""...""")` calls) scattered across ~14 files. Strategy: use `ast` to find EVERY
string-literal node in each file (safe — no exec/import), then regex-parse SQL `CREATE TABLE` blocks
out of each string's raw text.

Output JSON shape: {"<table_name>": [{"name":.., "type":.., "required": bool}, ...], ...}

Run: python3 scripts/extract_vault_schema.py
"""
from __future__ import annotations

import ast
import json
import re
import sys
from pathlib import Path

VECTOROS_SRC = Path.home() / "vectoros" / "src"

CREATE_TABLE_RE = re.compile(
    r"CREATE TABLE(?:\s+IF NOT EXISTS)?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)\s*;",
    re.DOTALL,
)
COMMENT_RE = re.compile(r"--.*?(?=\n|$)")
TABLE_CONSTRAINT_PREFIXES = ("PRIMARY KEY(", "PRIMARY KEY (", "FOREIGN KEY", "UNIQUE(", "UNIQUE (", "CHECK(", "CHECK (")
COLUMN_RE = re.compile(r"^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+([A-Za-z]+)")


def split_top_level(body: str) -> list[str]:
    """Split a CREATE TABLE body on commas that are NOT inside parens (so DEFAULT (expr) survives)."""
    parts, depth, cur = [], 0, []
    for ch in body:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    if cur:
        parts.append("".join(cur))
    return parts


def parse_create_table(name: str, body: str) -> list[dict]:
    body = COMMENT_RE.sub("", body)
    columns = []
    for frag in split_top_level(body):
        frag = frag.strip()
        if not frag or frag.upper().startswith(TABLE_CONSTRAINT_PREFIXES):
            continue
        m = COLUMN_RE.match(frag)
        if not m:
            continue
        col_name, col_type = m.group(1), m.group(2).upper()
        required = "NOT NULL" in frag.upper() or "PRIMARY KEY" in frag.upper()
        columns.append({"name": col_name, "type": col_type, "required": required})
    return columns


def extract_string_literals(py_path: Path) -> list[str]:
    try:
        tree = ast.parse(py_path.read_text(encoding="utf-8"), filename=str(py_path))
    except (SyntaxError, UnicodeDecodeError):
        return []
    out = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            out.append(node.value)
    return out


def main() -> int:
    if not VECTOROS_SRC.exists():
        print(json.dumps({"error": f"{VECTOROS_SRC} not found"}), file=sys.stderr)
        return 1
    tables: dict[str, list[dict]] = {}
    for py_path in VECTOROS_SRC.rglob("*.py"):
        for literal in extract_string_literals(py_path):
            if "CREATE TABLE" not in literal:
                continue
            for m in CREATE_TABLE_RE.finditer(literal):
                name, body = m.group(1), m.group(2)
                cols = parse_create_table(name, body)
                if cols:
                    tables[name] = cols   # last definition wins if a table is re-declared (rare, matches SQLite IF NOT EXISTS semantics — first-wins would need re-order; last-wins is the simpler, documented choice)
    print(json.dumps(tables, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 2: Run it, inspect a known table**

```bash
cd ~/topos
python3 scripts/extract_vault_schema.py > /tmp/vault_schema.json 2>&1
python3 -c "import json; d=json.load(open('/tmp/vault_schema.json')); print(json.dumps(d.get('users'), indent=2))"
```

Expected: the `users` table's columns (`user_id INTEGER required=True`, `username TEXT required=False`,
`is_owner INTEGER required=True` [has `NOT NULL`], etc. — matching the sample DDL read during
investigation). If a table is missing or a column list looks truncated/wrong, the parser's comment-
strip or top-level-comma-split has a gap on that file's specific style — note it, move on (best-effort,
same discipline as `_derive_output_label`).

- [ ] **Step 3: Match to taxonomy instance names, write `data/vault_schema.ts`**

```bash
python3 -c "
import json
d = json.load(open('/tmp/vault_schema.json'))
print(len(d), 'tables extracted')
print(sorted(d.keys())[:20])
"
```

Cross-reference against `data/taxonomy.ts`'s `store_vault` (and the other 4 `store_*` classes, if they
carry table-like instances) instance names — for each instance whose `name` field (after stripping a
trailing `*` dead-marker and skipping any name containing `.`) matches an extracted table name exactly,
emit an entry. Write `data/vault_schema.ts`:

```typescript
/**
 * Extracted, self-checked (scripts/check_vault_schema.ts re-runs the extractor and compares) DB
 * table schema — columns + types — for taxonomy instances under store_vault (and any other store_*
 * class whose instances name real tables). Extractor-generated: NEVER hand-edit a value here — fix
 * scripts/extract_vault_schema.py and regenerate (same discipline as data/taxonomy_io.ts).
 */
export interface VaultColumn { name: string; type: string; required: boolean }
export interface VaultTableSchema { table: string; columns: VaultColumn[] }

export const VAULT_SCHEMA: Record<string, VaultTableSchema> = {
  // populated by copying the extractor's JSON output for each matched instance, e.g.:
  // vault_items: { table: 'items', columns: [{ name: 'id', type: 'INTEGER', required: true }, ...] },
};
```

(The executor fills the object body with one entry per matched instance, each `columns` array copied
verbatim from the Step-2 JSON output for that table — never retyped from memory.)

- [ ] **Step 4: Write the self-check — `scripts/check_vault_schema.ts`**

```typescript
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
const unmatchedTaxo = storeVaultNames.filter(name => !Object.values(VAULT_SCHEMA).some(s => s.table === name) && !extracted[name] === undefined && extracted[name] === undefined);
console.log(`store_vault non-dead, non-column-note instances: ${storeVaultNames.length}; VAULT_SCHEMA entries: ${Object.keys(VAULT_SCHEMA).length}`);

console.log('\n' + (failed ? 'vault_schema check FAILED.' : 'vault_schema check PASSED.'));
if (failed) process.exit(1);
```

- [ ] **Step 5: Run the check**

```bash
npx tsx scripts/check_vault_schema.ts
```

Expected: `PASSED`, with a printed tally of `store_vault` instances vs. `VAULT_SCHEMA` entries (a
sizable delta is expected and fine — not every taxonomy instance is a live, extractable table; retired
`*`-suffixed and `.`-suffixed column-note entries are already excluded from the count, but some live
instance names may still not match a `CREATE TABLE` the regex could parse — report, don't force).

- [ ] **Step 6: Add `toposService.getVaultSchema`**

`services/toposService.ts` — add alongside the existing `getTaxoIO`:

```typescript
// (add near the existing getTaxoIO import/export)
import { VAULT_SCHEMA, type VaultTableSchema } from '../data/vault_schema';

// ... inside the toposService object/class, alongside getTaxoIO:
getVaultSchema(taxoId: string): VaultTableSchema | undefined {
  return VAULT_SCHEMA[taxoId];
},
```

(Match the exact existing export style in `toposService.ts` — object literal vs. class method — by
reading the file first; `getTaxoIO`'s existing declaration is the template to mirror exactly.)

- [ ] **Step 7: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
```

- [ ] **Step 8: Commit**

```bash
git add scripts/extract_vault_schema.py data/vault_schema.ts scripts/check_vault_schema.ts services/toposService.ts
git commit -m "topos: extract vault table schemas (columns+types) — self-checked, mirrors TAXO_IO"
```

---

## Task 17: Render the DB-table schema block on vault instance cards

**Files:**
- Modify: `features/topos/components/CanvasPage.tsx` (`InstanceNode`, `taxoLeafNodesRF`)
- Modify: `features/topos/lib/containerLayout.ts` (`instanceCellHeight`)

**Interfaces:**
- Extends `InstanceNodeData` with `schema?: VaultTableSchema`.

- [ ] **Step 1: Extend `instanceCellHeight` for schema-bearing instances**

`features/topos/lib/containerLayout.ts` — add a schema-row height export near `ENUM_ROW_H` (from Task
15):

```typescript
export const SCHEMA_ROW_H = 24;   // column pills wrap ~2/row at TAXO_W=168; a slightly taller row than IO_ROW_H since "name: TYPE" runs longer than a bare param name
export function schemaRowsExtraHeight(taxoId: string): number {
  const schema = toposService.getVaultSchema(taxoId);
  if (!schema || schema.columns.length === 0) return 0;
  return Math.ceil(schema.columns.length / 2) * SCHEMA_ROW_H;
}
```

```typescript
// instanceCellHeight — before (post-Task-15 state)
export function instanceCellHeight(taxoId: string): number {
  const io = toposService.getTaxoIO(taxoId);
  return TAXO_H.instance + ioRowsExtraHeight(ioRowCount(io)) + enumRowsExtraHeight(io);
}
// after
export function instanceCellHeight(taxoId: string): number {
  const io = toposService.getTaxoIO(taxoId);
  return TAXO_H.instance + ioRowsExtraHeight(ioRowCount(io)) + enumRowsExtraHeight(io) + schemaRowsExtraHeight(taxoId);
}
```

- [ ] **Step 2: Pass `schema` into `InstanceNode`'s data**

`taxoLeafNodesRF` (post-Task-11 state) — add the schema lookup alongside the existing `io` lookup:

```typescript
// before (post-Task-11 state, instance branch)
      return {
        id: f.renderId, type: 'instance', position: { x: f.x, y: f.y },
        data: { name: rt.name, color, status: rt.status, selected: isSel, opacity, seq: f.seq, io: toposService.getTaxoIO(rt.taxoId), enterDelay } as InstanceNodeData,
        zIndex: 2,
      } as Node;
// after
      return {
        id: f.renderId, type: 'instance', position: { x: f.x, y: f.y },
        data: { name: rt.name, color, status: rt.status, selected: isSel, opacity, seq: f.seq, io: toposService.getTaxoIO(rt.taxoId), schema: toposService.getVaultSchema(rt.taxoId), enterDelay } as InstanceNodeData,
        zIndex: 2,
      } as Node;
```

Add `schema?: VaultTableSchema` to `InstanceNodeData` (post-Task-11/15 state):

```typescript
// before
type InstanceNodeData = { name: string; color: string; status: NodeStatus; selected: boolean; opacity: number; seq?: number; io?: TaxoIO; enterDelay?: number };
// after
type InstanceNodeData = { name: string; color: string; status: NodeStatus; selected: boolean; opacity: number; seq?: number; io?: TaxoIO; schema?: VaultTableSchema; enterDelay?: number };
```

Add the `VaultTableSchema` type import (alongside the existing `containerLayout` import block):

```typescript
import type { VaultTableSchema } from '../../../data/vault_schema';
```

- [ ] **Step 3: Render the schema block in `InstanceNode`**

Extend the component (post-Task-6/11/15 state) to destructure `schema` and render a column-pill block
whenever it's present, using the SAME `ClickablePill` from Task 15 (a column shows as `name: TYPE`,
required columns get a filled-square prefix, nullable a hollow one — reusing `PortTerminal` from
Task 6 for the terminal glyph):

```typescript
// before (destructure line, post-Task-11 state)
  const { name, color, status, selected, opacity, seq, io, enterDelay } = data as unknown as InstanceNodeData;
// after
  const { name, color, status, selected, opacity, seq, io, schema, enterDelay } = data as unknown as InstanceNodeData;
```

Insert the schema block after the existing IO-rows block (post-Task-6/11/15's closing `)}` for the `{rows
> 0 && (...)}` block), inside the same root `<div>`:

```typescript
      {schema && schema.columns.length > 0 && (
        <div style={{ flex: '0 0 auto', boxSizing: 'border-box', padding: '0 6px 4px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {schema.columns.map(col => (
            <span key={col.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <PortTerminal kind={col.required ? 'required' : 'optional'} color={color} />
              <ClickablePill text={`${col.name}: ${col.type}`} color={color} />
            </span>
          ))}
        </div>
      )}
```

- [ ] **Step 4: Build check**

```bash
npx tsc --noEmit 2>&1 | grep -c "error TS"   # expect 1
npm run build 2>&1 | tail -5                  # expect ✓ built
npx tsx scripts/check_container_layout.ts     # expect PASSED
```

- [ ] **Step 5: Puppeteer screenshot**

Expand `store_vault`'s core family (`vault_items`, `vault_focuses`, etc.). Confirm `vault_items` (if
`items` matched during Task 16 extraction) now shows a column-pill block below its name — table columns
with `name: TYPE`, required columns marked with a filled terminal, nullable with a hollow one — and the
cell has grown tall enough that pills don't overflow the card (masonry from Task 8 should size it
correctly via the Step-1 `instanceCellHeight` update).

- [ ] **Step 6: Commit**

```bash
git add features/topos/components/CanvasPage.tsx features/topos/lib/containerLayout.ts
git commit -m "topos: render DB-table schema block (columns+types) on vault instance cards"
```

---

## Amendment Final Verification (add to the Final Wave Verification checklist below)

- [ ] `npx tsx scripts/check_grid_snap.ts` → PASSED
- [ ] `npx tsx scripts/check_vault_schema.ts` → PASSED
- [ ] Puppeteer: sampled node bounding boxes are 24px-grid-aligned (position AND size); edges show 45°
  chamfered corners; `update_focus`'s enum params show clickable pills; `vault_items` shows a
  column-pill schema block.

---

## Final Wave Verification (run once, after all 12 tasks are merged to a single branch/worktree)

- [ ] `npx tsc --noEmit 2>&1 | grep -c "error TS"` → `1` (only the pre-existing netlify error)
- [ ] `npm run build 2>&1 | tail -5` → `✓ built`
- [ ] `npx tsx scripts/check_taxonomy.ts` → PASSED (untouched by this plan — regression guard)
- [ ] `npx tsx scripts/check_visible_taxo.ts` → PASSED (untouched — regression guard)
- [ ] `npx tsx scripts/check_container_layout.ts` → PASSED (Task 8's rewritten assertions)
- [ ] `npx tsx scripts/check_taxo_io.ts` → PASSED (Task 7's regenerated data)
- [ ] `npx tsx scripts/check_palette.ts` → PASSED (Task 3)
- [ ] Puppeteer full-page screenshot, light AND dark mode, collapsed AND one class expanded — forward
  both to the owner for visual sign-off before deploying.
- [ ] Deploy: `npm run build && rsync -a --delete dist/ ~/autorun.dev/p/topos/vector/`
- [ ] Verify: `curl` 401 on the live URL + `assets/CanvasPage-*.js` hash parity between `dist/` and the
  served path.
- [ ] Update `~/.remember/-home-anton/remember.md` and this plan's checkboxes; note the final deployed
  commit SHA.
