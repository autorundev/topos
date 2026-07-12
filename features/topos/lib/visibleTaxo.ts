/**
 * Pure derivation of the visible family/instance sub-graph for the Topos in-canvas drill-down.
 * See docs/superpowers/specs/2026-07-12-detail-hierarchy-design.md (W2).
 *
 * Deliberately has NO React / CSS / ReactFlow imports so it stays importable from a plain
 * node/tsx script (CanvasPage.tsx pulls in '@xyflow/react/dist/style.css', which a bare
 * node runtime can't load — keeping this module component-free makes it independently
 * testable without a bundler).
 */
import type { Task, TaxoNode, TaxoKind, NodeNature, NodeStatus } from '../../../types';
import { toposService } from '../../../services/toposService';

/**
 * Raw `TaxoNode.id` is only guaranteed unique WITHIN its class subtree (see types.ts). In the
 * real data a few family ids collide ACROSS classes — e.g. `fam_graph` / `fam_meta` /
 * `fam_secretary` each appear once under `tool_retrieve` and again under `store_vault` with
 * different content. React Flow requires globally-unique node ids, so every rendered taxo
 * node/edge id is namespaced by its root class id to stay collision-free even when two such
 * classes are expanded at once.
 */
export const taxoRenderId = (classId: string, taxoId: string) => `${classId}::${taxoId}`;

export interface TaxoRender {
  id: string;          // classId-qualified render id — globally unique, use as the ReactFlow node id
  taxoId: string;       // raw TaxoNode.id — unique only within its class subtree
  name: string;
  kind: TaxoKind;
  classId: string;      // root L1 class task id this subtree hangs off
  nature: NodeNature;   // node.nature ?? natureOf(classId)
  status: NodeStatus;   // node.status ?? 'live'
  note?: string;
  hasChildren: boolean; // node.children?.length > 0
  childCount: number;   // node.children?.length ?? 0 (for the family card's "×N" count)
}

export interface ContainsEdge {
  id: string;
  source: string;       // render id, or the raw class task id for a class→family root edge
  target: string;       // render id
}

const natureOfClass = (classId: string): NodeNature =>
  (toposService.getTaskById(classId)?.nature ?? 'code') as NodeNature;

/**
 * Given the set of expanded node ids (raw class task id for an L1 class, or
 * `taxoRenderId(classId, taxoId)` for a family), returns every currently-visible family/instance
 * node plus the `contains` edges attaching each to its expanded parent, and `seq` edges chaining
 * ordered siblings (e.g. the dream pipeline) in `seq` order.
 *
 * Pure and deterministic: same inputs → same outputs, no side effects. `tasks` is only consulted
 * to know which task ids are class-level (to look up their taxonomy + nature) — this function
 * never mutates it.
 */
export function visibleTaxo(
  expanded: Set<string>,
  tasks: Task[],
): { nodes: TaxoRender[]; contains: ContainsEdge[]; seq: ContainsEdge[] } {
  const nodes: TaxoRender[] = [];
  const contains: ContainsEdge[] = [];
  const seq: ContainsEdge[] = [];
  const seenIds = new Set<string>();

  const emit = (node: TaxoNode, classId: string): string => {
    const rid = taxoRenderId(classId, node.id);
    if (!seenIds.has(rid)) {
      seenIds.add(rid);
      const childCount = node.children?.length ?? 0;
      nodes.push({
        id: rid,
        taxoId: node.id,
        name: node.name,
        kind: node.kind,
        classId,
        nature: node.nature ?? natureOfClass(classId),
        status: node.status ?? 'live',
        note: node.note,
        hasChildren: childCount > 0,
        childCount,
      });
    }
    return rid;
  };

  const walk = (parentRenderId: string, children: TaxoNode[], classId: string) => {
    const ordered: { rid: string; seq: number }[] = [];
    for (const child of children) {
      const rid = emit(child, classId);
      contains.push({ id: `contains::${parentRenderId}->${rid}`, source: parentRenderId, target: rid });
      if (typeof child.seq === 'number') ordered.push({ rid, seq: child.seq });
      // recurse into an expanded child that itself has children (family-under-family, or the
      // family→instance step); guarded on `expanded` so only opened branches materialise.
      if (expanded.has(rid) && child.children && child.children.length > 0) {
        walk(rid, child.children, classId);
      }
    }
    if (ordered.length > 1) {
      ordered.sort((a, b) => a.seq - b.seq);
      for (let i = 0; i < ordered.length - 1; i++) {
        seq.push({
          id: `seq::${ordered[i].rid}->${ordered[i + 1].rid}`,
          source: ordered[i].rid,
          target: ordered[i + 1].rid,
        });
      }
    }
  };

  for (const t of tasks) {
    if (!expanded.has(t.id)) continue;
    const children = toposService.getTaxonomy(t.id);
    if (children.length === 0) continue;
    walk(t.id, children, t.id);
  }

  return { nodes, contains, seq };
}
