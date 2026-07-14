/**
 * Pure, deterministic sizing/grid layout for the Topos in-canvas "class-as-container" mode
 * (Step 1 of the drill-down feature). See
 * docs/superpowers/specs/2026-07-12-detail-hierarchy-step1-plan.md.
 *
 * When a class (or a family nested inside an expanded class) is in `expanded`, it renders as a
 * CONTAINER instead of a normal card: a header strip, an optional left/right port gutter (class
 * root only — families carry no flow ports of their own), and a grid of child cells in the body.
 * This module computes ONLY the geometry (sizes + relative positions); it has no React/DOM/ELK
 * imports so it stays independently testable via `npx tsx scripts/check_container_layout.ts`.
 *
 * Deliberately duplicates a slice of `visibleTaxo.ts`'s recursion (walk expanded children,
 * namespace ids via `taxoRenderId`) rather than reusing it: `visibleTaxo` returns a FLAT list
 * (for React Flow node/edge construction) and is a frozen, independently-tested W2 interface;
 * this module needs the same expand/collapse decision but keeps the tree SHAPE (for positioning).
 * Both recurse under the identical condition (`expanded.has(renderId) && node has children`) and
 * generate the same `taxoRenderId(classId, childId)` per direct child, so the two stay in lock
 * step for any given `expanded` set — verified together in CanvasPage (containerLayout drives
 * position, visibleTaxo drives display metadata by the same render id).
 */
import type { Task, TaxoNode, TaxoKind, TaxoIO } from '../../../types';
import { toposService } from '../../../services/toposService';
import { taxoRenderId } from './visibleTaxo';

// ── geometry constants — single source of truth, imported by CanvasPage.tsx for rendering ──
export const TAXO_W = 168;
export const TAXO_H: Record<TaxoKind, number> = { family: 40, instance: 32 };
export const CONTAINER_HEADER_H = 48;    // header strip: icon/label + nature pill + touch chevron — outer-grid-facing (a class-root container's overall size feeds ELK)
export const CONTAINER_GUTTER_W = 120;   // class-root only: port shape + IOChip column, each side
export const CONTAINER_BODY_PAD = 16;    // header/gutter → first grid cell, and body → far edges
export const CELL_GAP = 8;               // gap between grid cells, both axes
const MAX_GRID_COLS = 4;

// ── Step 2b: per-child I/O chip rows on an instance leaf card ──────────────────────────────
// A leaf whose TaxoNode.id has a TAXO_IO entry (tool_* / det_* — see data/taxonomy_io.ts) grows
// TALLER than the base TAXO_H.instance to fit one row per max(inputs, outputs): input chip on the
// left edge, output chip on the right edge (mirrors the container's own L=in/R=out gutter
// convention, one level down). Exported so CanvasPage's InstanceNode component can render EXACTLY
// the row count/height this module reserves in the grid — the two MUST agree, or leaf cards will
// visually overlap their neighbours' grid slot.
export const IO_ROW_H = 16;
export const IO_ROW_PAD = 4;   // gap between the name row and the first I/O row — a connective micro-gap, deliberately exempt from the 8px grid (like a border width)

// A 2-line-wrapped I/O chip adds this over a single-line row's IO_ROW_H. WebkitLineClamp:2 caps a
// chip at 2 lines, so reserving one extra line for any row whose label CAN wrap keeps the budgeted
// height ALWAYS >= the rendered height (D-004 fix — a flat 1-line budget overflowed the card border).
export const IO_LINE_EXTRA = 12;
// A chip wraps when its label exceeds one line of its ~half-card column. Instance card TAXO_W=168,
// I/O body split into two ~76px grid columns → ~54px text width → ~11 mono glyphs at fontSize 7.5.
// Threshold kept conservative (11) so budgeted >= rendered; over-budget only adds slack.
export const IO_WRAP_CHARS = 11;

export function ioRowCount(io?: TaxoIO): number {
  if (!io) return 0;
  return Math.max(io.inputs?.length ?? 0, io.outputs?.length ?? 0);
}
function ioRowTall(io: TaxoIO, r: number): boolean {
  const inLen = io.inputs?.[r]?.name?.length ?? 0;
  const outLen = io.outputs?.[r]?.length ?? 0;
  return inLen > IO_WRAP_CHARS || outLen > IO_WRAP_CHARS;
}
/** Extra height (beyond TAXO_H.instance) for a leaf's I/O rows, counting 2-line-wrapped rows. */
export function ioRowsExtraHeight(io?: TaxoIO): number {
  const rows = ioRowCount(io);
  if (rows === 0 || !io) return 0;
  let h = IO_ROW_PAD;
  for (let r = 0; r < rows; r++) h += IO_ROW_H + (ioRowTall(io, r) ? IO_LINE_EXTRA : 0);
  return h;
}
/** Full instance-cell height including any I/O rows. `taxoId` is the RAW TaxoNode id (TAXO_IO's
 * key), not the classId-namespaced render id. */
export function instanceCellHeight(taxoId: string): number {
  return TAXO_H.instance + ioRowsExtraHeight(toposService.getTaxoIO(taxoId));
}

export interface ContainerCell {
  renderId: string;
  kind: 'family' | 'instance' | 'container';
  x: number; y: number; w: number; h: number;   // RELATIVE to the container's top-left
  layout?: ContainerLayoutResult;   // present only when kind === 'container' (nested sub-container)
  seq?: number;                     // the underlying TaxoNode's `seq`, if ordered (dream pipeline)
}

export interface ContainerLayoutResult {
  size: { w: number; h: number };
  header: number;
  gutterL: number;
  gutterR: number;
  cells: ContainerCell[];
}

function parseRootId(rootId: string): { classId: string; taxoId: string | null } {
  const idx = rootId.indexOf('::');
  if (idx === -1) return { classId: rootId, taxoId: null };
  return { classId: rootId.slice(0, idx), taxoId: rootId.slice(idx + 2) };
}

function findTaxoNode(nodes: TaxoNode[], taxoId: string): TaxoNode | null {
  for (const n of nodes) {
    if (n.id === taxoId) return n;
    if (n.children && n.children.length > 0) {
      const found = findTaxoNode(n.children, taxoId);
      if (found) return found;
    }
  }
  return null;
}

/** Direct children of a container root: a raw class task id, or a `taxoRenderId`-namespaced family id. */
function childrenOf(rootId: string): TaxoNode[] {
  const { classId, taxoId } = parseRootId(rootId);
  const tree = toposService.getTaxonomy(classId);
  if (taxoId === null) return tree;
  return findTaxoNode(tree, taxoId)?.children ?? [];
}

function gridCols(n: number): number {
  if (n <= 1) return 1;
  return Math.min(MAX_GRID_COLS, n);
}

/**
 * Layout a class/family container's body as a grid, recursing into any DIRECT child family that
 * is itself expanded (producing a nested sub-container cell). Children with a defined `seq`
 * (e.g. the 11 dream stages) are ordered by it first — everything else keeps its declared
 * relative order — so the row-major grid fill reads in pipeline order.
 *
 * `rootId` with no `::` = a class task id (top-level; reserves L/R port gutters, since only the
 * class carries flow ports). `rootId` containing `::` = a `taxoRenderId(classId, taxoId)` family
 * id (nested; gutterL/gutterR are 0 — families have no ports of their own).
 */
export function containerLayout(rootId: string, expanded: Set<string>, _tasks: Task[]): ContainerLayoutResult {
  const { classId, taxoId } = parseRootId(rootId);
  const isTopLevel = taxoId === null;
  const children = childrenOf(rootId);

  const ordered = children
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const sa = typeof a.c.seq === 'number' ? a.c.seq : Infinity;
      const sb = typeof b.c.seq === 'number' ? b.c.seq : Infinity;
      return sa !== sb ? sa - sb : a.i - b.i;
    })
    .map(x => x.c);

  const cells: ContainerCell[] = ordered.map(child => {
    const renderId = taxoRenderId(classId, child.id);
    if (child.kind === 'family' && expanded.has(renderId) && child.children && child.children.length > 0) {
      const nested = containerLayout(renderId, expanded, _tasks);
      return { renderId, kind: 'container' as const, x: 0, y: 0, w: nested.size.w, h: nested.size.h, layout: nested, seq: child.seq };
    }
    const h = child.kind === 'instance' ? instanceCellHeight(child.id) : TAXO_H[child.kind];
    return { renderId, kind: child.kind, x: 0, y: 0, w: TAXO_W, h, seq: child.seq };
  });

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

  const header = CONTAINER_HEADER_H;
  const gutterL = isTopLevel ? CONTAINER_GUTTER_W : 0;
  const gutterR = isTopLevel ? CONTAINER_GUTTER_W : 0;

  cells.forEach(cell => { cell.x += gutterL + CONTAINER_BODY_PAD; cell.y += header + CONTAINER_BODY_PAD; });

  const size = {
    w: gutterL + CONTAINER_BODY_PAD * 2 + bodyW + gutterR,
    h: header + CONTAINER_BODY_PAD * 2 + bodyH,
  };

  return { size, header, gutterL, gutterR, cells };
}

export interface FlatContainerCell {
  renderId: string;
  kind: 'family' | 'instance' | 'container';
  x: number; y: number; w: number; h: number;   // ABSOLUTE canvas coordinates
  header?: number; gutterL?: number; gutterR?: number;  // only present for kind === 'container'
  seq?: number;
}

/** Walks a (possibly nested) ContainerLayoutResult into a flat list with absolute canvas coordinates. */
export function flattenContainerLayout(rootId: string, rootX: number, rootY: number, layout: ContainerLayoutResult): FlatContainerCell[] {
  const out: FlatContainerCell[] = [
    { renderId: rootId, kind: 'container', x: rootX, y: rootY, w: layout.size.w, h: layout.size.h, header: layout.header, gutterL: layout.gutterL, gutterR: layout.gutterR },
  ];
  for (const cell of layout.cells) {
    const x = rootX + cell.x, y = rootY + cell.y;
    if (cell.kind === 'container' && cell.layout) {
      out.push(...flattenContainerLayout(cell.renderId, x, y, cell.layout));
    } else {
      out.push({ renderId: cell.renderId, kind: cell.kind, x, y, w: cell.w, h: cell.h, seq: cell.seq });
    }
  }
  return out;
}
