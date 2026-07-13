# Topos — Brand Context

Owner-approved 2026-07-13. Source of truth for Topos visual identity. Read before any brand/design work.
Feeds the design spec `docs/superpowers/specs/2026-07-13-topos-blueprint-design.md`.

## What it is
Topos — a self-hosted, interactive **system-map of VectorOS architecture & logic** (React Flow + ELK
canvas). A precision instrument for reading how the system is built.

## Positioning
Internal precision instrument, occasionally shown to technical stakeholders (YADRO / collaborators) as
evidence of VectorOS's engineering rigor. Under the VectorOS umbrella but with its **own, more technical
identity**. Not a consumer product — do not over-brand (no social/print/packaging surfaces).

## Personality
Precise · instrumental · rigorous · calm · systemic. Authority from strictness and legibility, not
decoration. Not playful, not warm-editorial, not "product-glossy".

## Audience
Primarily the builder (Anton); secondarily technical stakeholders reading the map as an artifact.

## Identity strategy
A machine's-eye view of a living system — a map that looks drawn by the engine, not by a studio over it.
Achromatic in chrome, polychrome only where color carries meaning. Reads as an **engineering blueprint
under tension**.

## Typography (DECISION A — mono-forward, 2026-07-13)
- **Geist Mono** (Vercel, OFL — free, on Google Fonts) is the identity face for EVERYTHING: technical
  labels, ids, ports, part-numbers, masthead title, cluster names. Mono end-to-end = machine's-eye view.
- **Geist Sans** — secondary, ONLY for real prose longer than a line (tooltips, detail-drawer body).
- **No serif.** Instrument Serif removed (editorial/literary — off-brand). Inter + OS `monospace` dropped.
- Tracking: tight negative (≈ −0.02em) on large masthead; near-0 on body; small positive on 8px uppercase
  micro-labels.
- Rejected: IBM Plex Mono, Martian Mono, Departure Mono, any serif/humanist-with-character.

## Color
- **Chrome is achromatic:** blueprint graphite (`#0a0d15` canvas, `#10151f` panel) + cool ink (`#c8d2e2`).
- **Principle: saturated color is reserved for meaning.** The brand chrome spends none of it, so the
  functional signal colors always read loud. No separate "brand accent" over the top — that restraint IS
  the statement.
- **Functional signal palette** (validated via `dataviz/scripts/validate_palette.js`, do not eyeball):
  nature model `#b45fd6` / code `#4a90c2` / human `#e0894a`; cluster inbound `#3b6ea5` / internal
  `#7a5cc4` / outbound `#42c48a`. Dark confirmed on contrast; nature code↔model is CVD floor-band → a
  non-color secondary encoding (nature pill + terminal shape) is MANDATORY; never color-alone. Dark
  steps must be derived + re-validated per surface, not hand-flipped.

## Mark / wordmark
- Clean wordmark `topos`, Geist Mono, lowercase, medium (500), tight tracking (−0.02em). Optional leading
  registration glyph (corner tick ⌐ / grid-plus).
- Favicon: replace the fork's green organic circle with a mono glyph (register tick / grid-plus) in ink
  on graphite.
- Avoid: serifs, "AI" gradient spheres, brain/graph/node glyphs, rounded-friendly shapes.
- References to borrow from: Vercel (mono wordmark, restraint), Linear (technical, not cold, one accent),
  Observable (data tool — chrome yields color to the data).

## Design principles
1. **Color = meaning.** Chrome monochrome; saturation only where it encodes an entity.
2. **Shape backstops color.** No encoding rests on color alone (CVD floor-band proven) — nature always
   carries pill + terminal shape too.
3. **Reads as a drawing.** Grid, registration ticks, title block, mono type — one engineering register.
4. **Quiet until asked.** Recessive chrome, data is the hero; motion only to prevent a jarring change or
   give feedback.

## Surfaces (only the real ones)
Canvas app (primary, ~only) · a shared screenshot/link to a stakeholder (title block = the drawing's
signature) · favicon. Social / print / packaging = N/A.
