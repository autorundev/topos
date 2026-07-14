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
