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
export const TAXO_W = 156;
export const TAXO_H: Record<TaxoKind, number> = { family: 40, instance: 34 };
export const CONTAINER_HEADER_H = 40;    // header strip: icon/label + nature pill + touch chevron
export const CONTAINER_GUTTER_W = 124;   // class-root only: port shape + IOChip column, each side
export const CONTAINER_BODY_PAD = 14;    // header/gutter → first grid cell, and body → far edges
export const CELL_GAP = 10;              // gap between grid cells, both axes
const MAX_GRID_COLS = 4;

// ── Step 2b: per-child I/O chip rows on an instance leaf card ──────────────────────────────
// A leaf whose TaxoNode.id has a TAXO_IO entry (tool_* / det_* — see data/taxonomy_io.ts) grows
// TALLER than the base TAXO_H.instance to fit one row per max(inputs, outputs): input chip on the
// left edge, output chip on the right edge (mirrors the container's own L=in/R=out gutter
// convention, one level down). Exported so CanvasPage's InstanceNode component can render EXACTLY
// the row count/height this module reserves in the grid — the two MUST agree, or leaf cards will
// visually overlap their neighbours' grid slot.
export const IO_ROW_H = 15;
export const IO_ROW_PAD = 4;   // gap between the name row and the first I/O row

export function ioRowCount(io?: TaxoIO): number {
  if (!io) return 0;
  return Math.max(io.inputs?.length ?? 0, io.outputs?.length ?? 0);
}
export function ioRowsExtraHeight(rows: number): number {
  return rows > 0 ? IO_ROW_PAD + rows * IO_ROW_H : 0;
}
/** Full instance-cell height including any I/O rows. `taxoId` is the RAW TaxoNode id (TAXO_IO's
 * key), not the classId-namespaced render id. */
export function instanceCellHeight(taxoId: string): number {
  return TAXO_H.instance + ioRowsExtraHeight(ioRowCount(toposService.getTaxoIO(taxoId)));
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
