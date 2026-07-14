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

Grounded in the brand identity (`.agents/brand-context.md`, owner-approved 2026-07-13): a mono-forward
"precision instrument", achromatic chrome, color reserved for meaning.

- **Geist Mono** (Vercel, OFL — free, on Google Fonts) is the identity face for **everything**: technical
  labels, ids, ports, part-numbers, AND the masthead title + cluster names. Mono end-to-end reads as
  "a machine's-eye view, drawn by the engine, not a studio." Distinctive, legible at 8px.
- **Geist Sans** is the secondary face, used ONLY where real prose runs longer than a line (tooltips,
  the detail-drawer body) so a monospace stream doesn't fatigue.
- **No serif anywhere.** Instrument Serif is removed — it reads editorial/literary and fights the
  precision-instrument identity (owner call 2026-07-13). **Inter** and the OS `monospace` are also
  dropped from the canvas.
- Size-specific tracking (apple-design §15): tight negative tracking (≈ −0.02em) on the large masthead;
  near-0 on mono body; small positive tracking only on the tiniest uppercase micro-labels.

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
- `index.html` — swap the font `<link>` to **Geist Mono + Geist Sans**; drop Inter + Instrument Serif.
- Possibly a new small module for the derived+validated palette (single source of truth for nature/
  cluster hues, light + dark steps).
- **No** data-model change, **no** backend, **no** change to `data/taxonomy*.ts` values.

## Non-goals

- Not a functional or data change. Not the Ernest map (`/p/topos/ernest/`, not started).
- Not the light "drafting-paper" variant (dark chosen). Not re-architecting ELK or the drill-down logic.
- Not a font beyond Geist Mono + Geist Sans (Instrument Serif dropped as off-brand; IBM Plex / Martian /
  Departure Mono considered and declined).

## Waves (high-level — detailed steps go in the plan)

1. **Foundation** — Geist Mono + Geist Sans + ease/color tokens + **derived & validated dark/light palette module**
   + blueprint substrate (grid, vignette, registration ticks, title block) + delete dead CSS.
2. **Cards & terminals** — instrument-panel card craft + shape-coded port terminals + clean 2-line label
   pills (62px fix) + port-color-follows-entity semantics fix.
3. **Layout** — masonry for container children.
4. **Motion** — spring interruptible reflow + child materialize/stagger + chevron press + hover
   fix/gate + reduced-motion.

Each wave: build green (`npm run build`; only the known `netlify/edge-functions/inject-meta.ts` tsc
error), Puppeteer screenshot for owner review, adversarial review, gate, merge, then deploy at the end
(or per-wave if the owner wants to watch it land).

## Amendment 2026-07-14 — grid discipline, edge geometry, pill-ification, DB-table schema blocks

Owner request, added before any of Waves 1-4 executed. Extends (does not replace) the waves above —
implemented as new plan tasks 13-17, appended to the implementation plan. Investigated before writing:
`~/vectoros/src/tools/_schemas.py` has 41 `"enum"` fields (extractable exactly like the existing
inputs/outputs — Step 2a precedent); vault tables have no ORM, they're raw `CREATE TABLE IF NOT EXISTS`
across 14 files (101 statements total); `data/taxonomy.ts`'s `store_vault` class already lists instances
named after real table names (e.g. `vault_items` → table `items`) — the extraction match key already
exists in committed data, no new taxonomy needed.

### 1. Edge geometry — 45° chamfer, not rounded corners

`orthoPath` currently rounds each ELK bend with a quadratic Bézier (`radius=12`). Replace the rounded
corner with a straight 45° chamfer (a PCB-trace / circuit-schematic look, on-brand for the engineering-
drawing identity): draw a straight line between the two radius-clamped points instead of a curve through
the bend vertex. Since incoming/outgoing segments are always axis-aligned (ELK's `ORTHOGONAL` routing)
and the clamp distance is equal on both legs, the connecting line is geometrically exactly 45°.

### 2. Grid discipline — 24px outer canvas grid (mandatory), 8px inner card grid

**Scope split (deliberate, not every number forced to 24):** the 24px grid is mandatory for every
independently ELK-positioned element — task bricks, class-root containers, zones, bands, item cards —
since those are what the eye reads as "placed on the canvas." Nested taxo children (family/instance leaf
cells inside an expanded container) are positioned *relatively* to an already-grid-anchored parent via
`containerLayout`'s masonry — they follow the finer 8px system, since forcing every masonry sum to also
land on a 24-multiple would fight the packing algorithm for no visible benefit (their parent is already
grid-true, which is what reads as "tied to the grid" one level down).

**The actual guarantee mechanism** is not hand-tuning every constant to already be a multiple (masonry
sums of 8px children don't reliably land on 24-multiples even with clean inputs) — it's two small,
independently-testable pure functions applied at the right points:
- `roundUp24(n)`: applied to every top-level node's *computed* width/height (collapsed brick, expanded
  container, item card, zone/band contour) — pads up to the next 24px, never shrinks below content.
- `snapPos24(pos)`: applied ONCE to `computeLayout`'s final `pos`, after ELK's pass 2 — rounds every
  node's `x`/`y` to the nearest 24px. Edge routes are then corrected by the same per-node delta (a
  single averaged translation per edge, not a per-bend-point recompute) so ports/edges stay visually
  attached to their (now-snapped) node.
Existing size constants (`NODE_W`, `TAXO_W`, ELK spacing options, `CELL_GAP`, `CONTAINER_*`, `ITEM_*`,
`BAND_*`) are ALSO retuned toward clean 24-multiples (outer) / 8-multiples (inner) as a polish layer —
this reduces the padding `roundUp24` has to add, it is not itself the guarantee.

Background dots move to a single 24px grid (superseding Wave-1's two-layer 15px/105px split), offset so
dots sit at the CENTER of each 24×24 cell (`offset = 12`), not at the cell corners.

### 3. No bare text — parameters, types, and enum values become pills

Two remaining bare-text spots (missed in the original Wave-2 scope, which only covered
`TaxoIOChip`): `DetailDrawer`'s "ВХОД → ВЫХОД" section (currently a comma-joined plain string) and
`ItemDrawer`'s `example_values` (plain `<p>` text). Both become the same pill treatment as `TaxoIOChip`.

**Enumerations get one pill per value**, extracted from `_schemas.py`'s `"enum"` arrays (same AST
extractor as Step 2a, extended) — e.g. a `status` parameter with `enum: ["active","paused"]` renders as
two small pills, not a string. **Pills are clickable** — owner asked for this explicitly but did not
specify the action; **my call, flagged for redirect:** click = copy the pill's exact text to the
clipboard (a small, real utility for someone reading the map who wants to paste a param/enum name into
code or chat), with a brief visual flash for feedback. This is the smallest defensible interpretation of
"нажимаемые" that doesn't invent a new UI surface (a filter/highlight-on-click feature would be a
materially bigger, separate ask).

### 4. DB-table schema block on vault store nodes

When an instance under `store_vault` (or the other 4 `store_*` classes, if their taxonomy ever gains
real per-table children — currently only `store_vault` does) names a real table, its leaf card grows a
schema block: table name + one pill per column (`name: TYPE`, required/nullable distinguished the same
way as tool parameters — `NOT NULL` → filled terminal, nullable → hollow). Extraction mirrors Step 2a:
a throwaway AST/regex parser over the 14 files' `CREATE TABLE IF NOT EXISTS <name> (...)` blocks (no
import of the vectoros package), matched to taxonomy instance names (stripping the `*` dead-marker and
skipping any instance whose name contains `.` — those are column-level notes like `items.type`, not
real tables). Unmatched names reported both ways, same discipline as `check_taxo_io.ts`.

## Divergences → `2026-07-13-topos-blueprint-DIVERGENCES.md` (create on first divergence).
