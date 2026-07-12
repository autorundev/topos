# Topos — "Blueprint" visual & motion polish — Design

Owner-approved 2026-07-13. Follows the shipped drill-down (W1+W2+Step1+Step2, `main 3096727`).
This is the deferred UI-polish pass ("юай потом вылижем"), now scoped to a real design direction
synthesised from a design-craft council: apple-design (fluid/materials/typography), frontend-design
(distinctive, anti-slop), emil-design-eng + review-animations (motion craft), dataviz (computed
categorical-color validation).

Mode: **opus-as-fable** — executor (Sonnet 5, worktree) → adversarial reviewer → fix → re-verify →
coordinator merges & gates. This design is the visual/motion target; the wave breakdown is the plan.

## Problem

The drill-down is functionally complete but visually generic and motion-poor:

- Body font is **Inter** (generic); node internals use the OS **system `monospace`** (uncharacterful,
  shifts across platforms).
- Expand/collapse is the tool's primary gesture, yet it is a hard **ELK-snap** — all nodes jump to new
  positions with no transition (reads as "broken", violates "prevent jarring changes").
- Concrete legibility debt: port chips at 62px truncate labels; tall tool cards (10 params) inflate the
  whole grid row; required-marker is bold-only; chevron overlaps the nature pill.
- Hover transforms on family/instance nodes snap (no `transform` in their transition); all `:hover` is
  ungated on an explicitly touch-oriented tool; there is **no `prefers-reduced-motion` anywhere**.
- Dead marketing CSS (`.animate-*`, `.stagger-*`, `.card-hover`, two `@keyframes`) inherited from the
  fork, unused on the canvas.

## Direction: "Blueprint" — engineering schematic

Not a from-scratch reinvention — a **dominance play on what is already latent** (tinted schematic cards,
a nature palette, dashed/solid edge semantics), sharpened into an **engineering drawing**. This is
context-perfect for an architecture map and rhymes with the already-locked VectorOS "Locus" schematic
metaphor (ray-optics / circuit). Dark "night blueprint" (chosen over light "drafting paper" — see Color).

### 1. Typography — the identity

- **IBM Plex Mono** replaces the OS `monospace` for every technical label, id, port, and part-number.
  Distinctive, legible at 8px, genuine character. Loaded via the existing Google-Fonts `<link>`.
- **Instrument Serif** stays as the single expressive display face — the masthead title and cluster
  names — an editorial counter-tension against the technical mono. (Already loaded.)
- **Inter** is dropped from the canvas (may remain for any non-canvas chrome).
- Size-specific tracking (apple-design §15): tight negative tracking on the serif display; near-0 on
  mono body; small positive tracking only on the tiniest uppercase micro-labels.

### 2. Substrate — the drawing

- Dark blue-black canvas (`~#0a0d15`), not pure black.
- Engineering grid: fine dotted grid + a coarser ruled major grid, both very low-alpha. Evolve the
  existing `<Background gap={22}>` toward this (React Flow `Background` supports `dots`/`lines`; may need
  a second layer or a CSS underlay).
- Corner **registration ticks** + a **title block** in a corner (project / subject / sheet / scale) —
  the memorable "real drawing" differentiator.
- Soft vignette for depth (apple-design §12).

### 3. Cards — instrument panels

- Hairline colored borders, a **bright top-edge highlight** (`inset 0 1px 0 rgba(255,255,255,.06)`),
  soft drop shadow, tightened color-tint fill — reads as a machined panel, not a glass blob.
- A small mono **part-id line** under each card title (e.g. `reduce · 41`, `brain · read-only · 78`).

### 4. Ports — circuit terminals

- The **shape** carries the role, on a terminal at the card edge:
  - filled square ■ = required input
  - hollow square □ = optional input
  - triangle ▸ = output
- The **label pill** is clean text (no inner glyphs — honours prior owner feedback "убрать кружки/ромбы,
  текст в тон, несколько строк"), in the wire tone, wrapping to 2 lines. **This fixes the 62px-tight
  truncation.**
- **Port color semantics (dataviz "color follows the entity, not the role"):** a port's color follows the
  connected entity's nature (or a neutral ink) — NOT a blanket "magenta = output". The Step-2 mock's
  all-outputs-magenta is a bug to correct here.

### 5. Layout — masonry

- Container children flow in a **masonry** layout (CSS `columns` or equivalent) so a tall card
  (`update_focus`, ~10 pins) does not stretch its row-mates (`get_usage`, `list_focuses`).
- Output-only children (`list_focuses`) stay asymmetric — that is correct, not a defect.
- **`containerLayout` must follow:** the container's ELK width/height (its `size`) is computed there;
  masonry changes packing from row-max to per-column, so the height becomes the tallest column, not the
  row-sum. `containerLayout.ts` is the one pure function whose logic genuinely changes in this pass, and
  its integrity test (`scripts/check_container_layout.ts`) must be updated to match.

### 6. Edges — formalised legend

- Solid = data / `state-write` (a value flows). Dashed = tick / `clock-trigger` (a signal, no payload).
- A persistent legend states this (answers the owner's standing "в чём разница пунктир/сплошной").
- Continuously-`animated` loop/wake edges stay (justified, narrowly gated) — not touched.

## Motion spec (from review-animations "Block" verdict — this is the punch-list)

- **Spring, interruptible reflow** on expand/collapse: interpolate node positions between the two ELK
  layouts with a critically-damped spring (`bounce: 0`, response ≈ 0.4s) — grabbable/reversible
  mid-flight, not a keyframe. Replaces the snap.
- **Materialize** newly-revealed child cards: `@starting-style` (or `data-mounted` fallback) opacity +
  small scale (≥0.95, never `scale(0)`) + blur, **staggered 40–60ms** between siblings.
- **Chevron press feedback:** `transform: scale(0.94)` on `:active`, `transition: transform 120ms ease-out`.
- **Fix hover:** add `transform` to the family/instance/item node transitions (currently `opacity` only
  → their hover-lift snaps). Gate **all** `:hover` motion behind `@media (hover: hover) and (pointer: fine)`.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` — keep opacity/color, drop the
  position tween and transform movement (reflow becomes an instant re-layout with a gentle opacity cross).
- **Delete dead CSS:** `.animate-*`, `.stagger-*`, `.card-hover`, both `@keyframes`.
- **Ease tokens:** `--ease-out: cubic-bezier(.23,1,.32,1)`, `--ease-in-out: cubic-bezier(.77,0,.175,1)`;
  entrances/exits use `ease-out`, on-screen moves use the spring, hover/opacity may use default `ease`.
- **GPU-only:** animate `transform`/`opacity` only.

## Color foundation (computed — `scripts/validate_palette.js`, do NOT eyeball)

Validated categorical palettes (nature = node identity, cluster = zone identity):

- **Dark is confirmed on accessibility grounds**, not just taste: on the light surface human-orange
  (2.54:1) and outbound-green (2.10:1) FAIL 3:1 contrast; both PASS on the dark surface.
- **Nature code↔model (blue↔magenta) is CVD floor-band** (ΔE 9.6 light / 11.7 dark deutan; target ≥12,
  floor 8–12). Legal **only with secondary encoding** — Topos already has it (nature pill "код/модель/
  человек" + terminal shapes). **Rule: nature is never encoded by color alone.** Preserve pill + shape.
- **Cluster palette is CVD-clean** (ΔE 13.9).
- **The dark palette must be DERIVED and re-validated (snap-to-passing), not hand-flipped.** The Step-2
  mock's hand-brightened `#5a9fd0` + reused magenta/orange FAIL the dark lightness band; cluster green
  needs a small lightness nudge. Derive dark steps from the same hues, run the validator until PASS
  (light AND dark, each against its own surface).
- **Optional robustness:** widen code↔model hue separation to clear CVD ≥ 12 (out of the floor band).
  Only if it does not hurt the aesthetic or diverge from the VectorOS design-system nature colors;
  otherwise the secondary-encoding-guaranteed status quo is already legal.

## Preserve / regression (non-negotiable)

- **Collapsed state** stays visually coherent and functionally identical (class = card, ports, I/O chips,
  Constraints band, spotlight, zones, flow-edge handle ids).
- **Data invariants:** `data/taxonomy.ts` / `data/taxonomy_io.ts` are extractor-generated + self-checked
  (`scripts/check_*.ts` re-run the extractor). **Never hand-edit a value** — fix the extractor. This pass
  is presentation-only; it touches no taxonomy data.
- **ELK two-pass layout, `computeLayout`, namespaced render ids `classId::taxoId`** — the ELK
  orchestration is unchanged; only node sizing/rendering and a position-tween wrapper are added.
  (`containerLayout.ts` child-packing is the one deliberate logic change — see Layout above.)
- **Zoom controls + minimap** stay removed (owner already dropped them).
- **Deploy discipline:** `npm run build && rsync -a --delete dist/ ~/autorun.dev/p/topos/vector/`;
  verify = dist↔served `CanvasPage-*.js` hash parity + curl 401. Executors never touch `.env`, never
  restart services, never run docker in a worktree; fresh worktree needs the `node_modules` symlink.

## Impact on neighbors

- `features/topos/components/CanvasPage.tsx` — node components (Brick/Container/Family/Instance/Item),
  port rendering, `computeLayout` sizing, ReactFlow `Background`, a new position-tween layer, chevron.
- `index.css` — ease/color tokens, dead-CSS removal, hover gating, reduced-motion, substrate underlay.
- `index.html` — add IBM Plex Mono to the font `<link>`.
- Possibly a new small module for the derived+validated palette (single source of truth for nature/
  cluster hues, light + dark steps).
- **No** data-model change, **no** backend, **no** change to `data/taxonomy*.ts` values.

## Non-goals

- Not a functional or data change. Not the Ernest map (`/p/topos/ernest/`, not started).
- Not the light "drafting-paper" variant (dark chosen). Not re-architecting ELK or the drill-down logic.
- Not a font beyond IBM Plex Mono + Instrument Serif (Martian/Departure Mono considered and declined —
  worse at 8px).

## Waves (high-level — detailed steps go in the plan)

1. **Foundation** — IBM Plex Mono + ease/color tokens + **derived & validated dark/light palette module**
   + blueprint substrate (grid, vignette, registration ticks, title block) + delete dead CSS.
2. **Cards & terminals** — instrument-panel card craft + shape-coded port terminals + clean 2-line label
   pills (62px fix) + port-color-follows-entity semantics fix.
3. **Layout** — masonry for container children.
4. **Motion** — spring interruptible reflow + child materialize/stagger + chevron press + hover
   fix/gate + reduced-motion.

Each wave: build green (`npm run build`; only the known `netlify/edge-functions/inject-meta.ts` tsc
error), Puppeteer screenshot for owner review, adversarial review, gate, merge, then deploy at the end
(or per-wave if the owner wants to watch it land).

## Divergences → `2026-07-13-topos-blueprint-DIVERGENCES.md` (create on first divergence).
