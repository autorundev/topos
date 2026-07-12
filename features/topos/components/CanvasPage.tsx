import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow, Background, Panel, Handle,
  BaseEdge,
  type Node, type Edge, type NodeProps, type EdgeProps, Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import {
  LogIn, Radar, Filter, Layers, BrainCircuit, Wrench, Send,
  Database, Moon, Sun, CircleCheck, Share2, Box, X, User, Rss,
  DoorOpen, VolumeX, ShieldCheck, AlertTriangle, CalendarCheck, CircleDollarSign, Lock, BadgeCheck,
  MessageCircle, LayoutDashboard, Bell, Mic, Plug, Globe,
} from 'lucide-react';
import { toposService } from '../../../services/toposService';
import { TOPOS_DATA } from '../../../data';
import { useDarkMode } from '../../../hooks/useDarkMode';
import type { Task, IOItem, NodeCategory, NodeNature, TaxoKind, NodeStatus } from '../../../types';
import { visibleTaxo, taxoRenderId, type TaxoRender, type ContainsEdge } from '../lib/visibleTaxo';

const NODE_W = 232;   // I/O chips stack as rows inside the card (grows height, not width)
type XY = { x: number; y: number };
type Pos = Record<string, XY>;
type EdgePts = Record<string, XY[]>;
type Side = 'EAST' | 'WEST' | 'NORTH' | 'SOUTH';
type HandleSpec = { id: string; kind: 'source' | 'target'; side: Side; x: number; y: number };
type Handles = Record<string, HandleSpec[]>;
const SIDE_POS: Record<Side, Position> = { EAST: Position.Right, WEST: Position.Left, NORTH: Position.Top, SOUTH: Position.Bottom };

// left→right pipeline: inbound → internal → outbound. ELK partitions keep zones apart.
const LAYER_ORDER: Record<string, number> = { layer_inbound: 0, layer_internal: 1, layer_outbound: 2 };
// SAFE ZONE — clearance ELK keeps between any edge and a node it does NOT connect to.
const SAFE_ZONE = 34;

const EDGE_COLOR: Record<string, string> = {
  writes_to: '#59708a', reads_from: '#3fb6c9', reduces: '#7a5cc4', wakes: '#e6a63c',
  actuates: '#42c48a', precedes: '#3b6ea5', enables: '#3b6ea5', requires_input_from: '#8a8f98',
  surfaces: '#4bb0a2',
};
const EDGE_LEGEND = [
  ['writes_to', 'пишет в стор'], ['reads_from', 'читает из стора'], ['reduces', 'детектор-reducer'],
  ['wakes', 'будит ум'], ['actuates', 'эффект'], ['surfaces', 'наружу в поверхность'], ['enables / precedes', 'поток'], ['requires_input_from', 'тянет'],
] as const;
const BADGES: Record<string, string[]> = {
  trig_user_message: ['always_open'], trig_connector_sync: ['selective'], trig_cron: ['selective', 'clock'],
  gate_admission: ['always_open', 'selective'], starter_recipe: ['budget-bounded', 'dates grounded'],
  tool_retrieve: ['read-only'], brain_core: ['single-brain'], eff_link_entities: ['model-inferred', 'unconfirmed'],
  proc_nightly: ['batch'], eff_respond: ['confirm', 'cost-cap'], human_confirm: ['→ confirmed'],
  store_links: ['provenance', 'confirmed'],
};
const isStore = (id: string) => id.startsWith('store_');
const isStoreEdgeType = (t: string) => t === 'writes_to' || t === 'reads_from';

function kindOf(t: Task): { icon: React.ComponentType<{ size?: number }>; kind: string } {
  const id = t.id;
  if (id.startsWith('trig_')) return { icon: LogIn, kind: 'trigger' };
  if (id === 'det_detectors') return { icon: Radar, kind: 'detectors' };
  if (id === 'gate_admission') return { icon: Filter, kind: 'gate' };
  if (id === 'starter_recipe') return { icon: Layers, kind: 'starter' };
  if (id === 'tool_retrieve') return { icon: Wrench, kind: 'tools' };
  if (id === 'brain_core') return { icon: BrainCircuit, kind: 'brain' };
  if (id === 'eff_link_entities') return { icon: Share2, kind: 'graph' };
  if (id === 'proc_nightly') return { icon: Moon, kind: 'nightly' };
  if (isStore(id)) return { icon: Database, kind: 'store' };
  if (id === 'eff_respond') return { icon: Send, kind: 'effect' };
  if (id === 'human_confirm') return { icon: CircleCheck, kind: 'confirm' };
  if (id === 'surf_tg') return { icon: MessageCircle, kind: 'surface' };
  if (id === 'surf_miniapp') return { icon: LayoutDashboard, kind: 'surface' };
  if (id === 'surf_web') return { icon: Globe, kind: 'surface' };
  if (id === 'surf_push') return { icon: Bell, kind: 'surface' };
  return { icon: Box, kind: t.task_type };
}
const layerColor = (id: string) => toposService.getLayerById(id)?.color ?? '#666';
const ioLabel = (i: IOItem) => (typeof i === 'string' ? i : i.label);
// data on an edge = the primary output of its source; both ports (out + in) carry it.
const ioOut = (t?: Task | null) => (t?.io_spec?.outputs?.primary ? ioLabel(t.io_spec.outputs.primary) : '');

// Presentation registries for the two model-level axes (per-node assignment now lives in data/*.ts).
// SECONDARY axis — functional category (drives icon + label).
type CatKey = NodeCategory;
const CATEGORIES: Record<CatKey, { label: string; color: string; icon: React.ComponentType<{ size?: number }> }> = {
  user:    { label: 'Действия юзера', color: '#e0894a', icon: User },
  ingest:  { label: 'Внешний вход',   color: '#cdae3f', icon: Rss },
  detect:  { label: 'Детекторы',      color: '#9a6cd8', icon: Radar },
  gate:    { label: 'Маршрутизация',  color: '#4f8fd6', icon: Filter },
  starter: { label: 'Сборка / старт', color: '#3fb0a0', icon: Layers },
  ai:      { label: 'Работа ИИ',      color: '#e0699f', icon: BrainCircuit },
  graph:   { label: 'Граф',           color: '#6f8de0', icon: Share2 },
  nightly: { label: 'Ночной цикл',    color: '#7a63c0', icon: Moon },
  data:    { label: 'Данные',         color: '#6c8a9e', icon: Database },
  effect:  { label: 'Эффект наружу',  color: '#46c48a', icon: Send },
  surface: { label: 'Поверхность',    color: '#4bb0a2', icon: LayoutDashboard },
};
const catOf = (id: string): CatKey => (toposService.getTaskById(id)?.category ?? 'data') as CatKey;
const catLabel = (id: string) => CATEGORIES[catOf(id)].label;

// PRIMARY axis — nature of the operation (Atlas: probabilistic / deterministic / human).
// The model runs in a few places, everything else is code — VectorOS doctrine made visible.
type Nature = NodeNature;
const NATURES: Record<Nature, { label: string; short: string; color: string }> = {
  model: { label: 'Вероятностное · модель',  short: 'модель',  color: '#b45fd6' },
  code:  { label: 'Детерминированное · код', short: 'код',     color: '#4a90c2' },
  human: { label: 'Человек',                 short: 'человек', color: '#e0894a' },
};
const natureOf = (id: string): Nature => (toposService.getTaskById(id)?.nature ?? 'code') as Nature;
const natureColor = (id: string) => NATURES[natureOf(id)].color;

// ═══════ cross-cutting bands (Atlas): Constraints (invariants) + Touchpoints (surfaces).
const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  DoorOpen, VolumeX, ShieldCheck, AlertTriangle, CalendarCheck, CircleDollarSign, Lock, BadgeCheck, BrainCircuit,
  MessageCircle, LayoutDashboard, Bell, Mic, Plug, Globe,
};
const BAND: Record<'constraint' | 'touchpoint', { color: string; label: string; role: string }> = {
  constraint: { color: '#c99a4a', label: 'CONSTRAINTS', role: 'инварианты — нельзя нарушать' },
  touchpoint: { color: '#4bb0a2', label: 'TOUCHPOINTS', role: 'где всплывает наружу' },
};
const CONSTRAINT_CAT: Record<string, string> = {
  quality_safety: 'качество / safety', performance_resource: 'ресурсы', model_technical: 'модель',
  ux_interaction: 'ux', data_context: 'данные', execution_behavior: 'исполнение',
  code_philosophy: 'философия', attribution: 'атрибуция',
};
const TOUCHPOINT_CAT: Record<string, string> = {
  conversational: 'диалог', screen_interface: 'экран', voice_audio: 'голос',
  technical: 'тех', spatial_computing: 'spatial', physical_devices: 'девайсы',
};
const ITEM_W = 174, ITEM_H = 54, ITEM_GX = 16, ITEM_GY = 14, BAND_LABEL = 30, BAND_PAD = 16, BAND_GAP = 66;

// deterministic node geometry so ELK ports line up with the rendered I/O rows.
const ROW_H = 34;   // one input/output row — tall enough for a 2-line chip
// family-badge count on the det_detectors header — taxonomy-derived (real family list), not a
// parsed common_variants string. Only det_detectors shows this header strip (unchanged scope);
// see toposService.getTaxonomy('det_detectors') for the source of truth.
const famCountOf = (t: Task) => t.id === 'det_detectors' ? toposService.getTaxonomy(t.id).filter(n => n.kind === 'family').length : 0;
// fixed header-block height (kind + title + families + badges) sitting above the I/O rows.
function headerH(t: Task): number {
  const famRows = famCountOf(t) ? Math.ceil(famCountOf(t) / 2) : 0;
  const badges = (BADGES[t.id] ?? []).length ? 20 : 0;
  return 58 + famRows * 20 + badges;
}

// ═══════════════ detail-hierarchy (drill-down) node geometry + status palette ═══════════════
const TAXO_W = 156;
const TAXO_H: Record<TaxoKind, number> = { family: 40, instance: 34 };
// matches internals.html's status dots (live/todo/dead/soak); soak renders hollow.
const STATUS_COLOR: Record<NodeStatus, string> = { live: '#42c48a', todo: '#e7c66b', dead: '#39434f', soak: '#0a0d12' };
const STATUS_LABEL: Record<NodeStatus, string> = { live: 'работает', todo: 'todo', dead: 'удалено', soak: 'owner-soak' };
function StatusDot({ status, size = 7 }: { status: NodeStatus; size?: number }) {
  if (status === 'soak') {
    return <span style={{ width: size, height: size, borderRadius: '50%', display: 'inline-block', flex: '0 0 auto', background: STATUS_COLOR.soak, border: '1.4px solid #c9d4e0' }} />;
  }
  return <span style={{ width: size, height: size, borderRadius: '50%', display: 'inline-block', flex: '0 0 auto', background: STATUS_COLOR[status] }} />;
}

// ═══════════════ auto-layout + edge-routing (ELK) — no hand-tuned coords ═══════════════
type RawEdge = { id: string; source: string; target: string; rel: any };

function rawEdges(tasks: Task[], idSet: Set<string>): RawEdge[] {
  const out: RawEdge[] = [];
  tasks.forEach(t => (t.relations ?? []).forEach((r, i) => {
    if (!idSet.has(r.target_id)) return;
    out.push({ id: `${t.id}-${r.target_id}-${i}`, source: t.id, target: r.target_id, rel: r });
  }));
  return out;
}

const elk = new ELK();
const portS = (id: string) => `${id}__s`;   // source port (output) → EAST
const portT = (id: string) => `${id}__t`;   // target port (input)  → WEST

const ELK_OPTS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.partitioning.activate': 'true',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.spacing.nodeNode': '58',
  'elk.layered.spacing.nodeNodeBetweenLayers': '150',
  'elk.spacing.edgeNode': String(SAFE_ZONE),            // ← safe zone: edge ↔ foreign node
  'elk.layered.spacing.edgeNodeBetweenLayers': String(SAFE_ZONE),
  'elk.spacing.edgeEdge': '16',
  'elk.layered.spacing.edgeEdgeBetweenLayers': '16',
  'elk.spacing.portPort': '13',
};

// Assign k ports (sorted by partner Y) to `rows` slots, minimising crossings.
// Not top-anchored: the shorter side is spread / aligned to its partner instead of always starting at row 0.
function assignSlots(ports: { eid: string; py: number }[], rows: number, allYs: number[]): Record<string, number> {
  const sorted = [...ports].sort((a, b) => a.py - b.py);
  const n = sorted.length, res: Record<string, number> = {};
  if (n === 0) return res;
  if (n === rows) { sorted.forEach((p, i) => { res[p.eid] = i; }); return res; }
  if (n === 1) {                                             // lone port → row aligned to its partner's vertical rank
    const above = allYs.filter(y => y < sorted[0].py).length;
    const f = allYs.length > 1 ? above / (allYs.length - 1) : 0.5;
    res[sorted[0].eid] = Math.round(f * (rows - 1));
    return res;
  }
  let prev = -1;                                             // n<rows: spread endpoints across the rows, keep order
  sorted.forEach((p, i) => { let s = Math.round((i * (rows - 1)) / (n - 1)); if (s <= prev) s = prev + 1; res[p.eid] = s; prev = s; });
  return res;
}

// Taxo (family/instance) nodes cluster in the SAME zone-partition as their root class (reusing
// LAYER_ORDER by layer_id — the mechanism the class nodes already use), but carry FREE ports:
// contains/seq edges attach to the node border, not to a specific fixed I/O port. When
// `taxoNodes`/`taxoEdges` are empty (nothing expanded), spreading these into pass1/pass2 below is
// a no-op, so the flow-only layout is byte-for-byte identical to the pre-W2 output.
function taxoChildren(taxoNodes: TaxoRender[], tasks: Task[]) {
  const layerOf: Record<string, string> = {};
  tasks.forEach(t => { layerOf[t.id] = t.layer_id; });
  return taxoNodes.map(n => ({
    id: n.id, width: TAXO_W, height: TAXO_H[n.kind],
    layoutOptions: {
      'elk.partitioning.partition': String(LAYER_ORDER[layerOf[n.classId] ?? ''] ?? 1),
      'elk.portConstraints': 'FREE',
    },
  }));
}
const taxoElkEdges = (taxoEdges: ContainsEdge[]) => taxoEdges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] }));

async function computeLayout(
  tasks: Task[],
  edges: RawEdge[],
  taxoNodes: TaxoRender[] = [],
  taxoEdges: ContainsEdge[] = [],
): Promise<{ pos: Pos; pts: EdgePts; handles: Handles; heights: Record<string, number> }> {
  const inList: Record<string, string[]> = {}, outList: Record<string, string[]> = {};
  edges.forEach(e => { (outList[e.source] ??= []).push(e.id); (inList[e.target] ??= []).push(e.id); });
  const heights: Record<string, number> = {};
  tasks.forEach(t => { heights[t.id] = headerH(t) + Math.max(inList[t.id]?.length ?? 0, outList[t.id]?.length ?? 0) * ROW_H + 6; });
  const taxoNodeSpecs = taxoChildren(taxoNodes, tasks);
  const taxoEdgeSpecs = taxoElkEdges(taxoEdges);

  // PASS 1 — free port order (FIXED_SIDE): let ELK pick the crossing-minimal vertical order of each side.
  const pass1 = {
    id: 'root', layoutOptions: ELK_OPTS,
    children: [
      ...tasks.map(t => ({
        id: t.id, width: NODE_W, height: heights[t.id],
        layoutOptions: { 'elk.partitioning.partition': String(LAYER_ORDER[t.layer_id] ?? 1), 'elk.portConstraints': 'FIXED_SIDE' },
        ports: [
          ...(inList[t.id] ?? []).map(eid => ({ id: portT(eid), layoutOptions: { 'elk.port.side': 'WEST' } })),
          ...(outList[t.id] ?? []).map(eid => ({ id: portS(eid), layoutOptions: { 'elk.port.side': 'EAST' } })),
        ],
      })),
      ...taxoNodeSpecs,
    ],
    edges: [
      ...edges.map(e => ({ id: e.id, sources: [portS(e.id)], targets: [portT(e.id)] })),
      ...taxoEdgeSpecs,
    ],
  };
  const r1: any = await elk.layout(pass1 as any);
  const centreY: Record<string, number> = {}, pY1: Record<string, number> = {};
  (r1.children ?? []).forEach((c: any) => {
    centreY[c.id] = (c.y ?? 0) + (c.height ?? 0) / 2;
    (c.ports ?? []).forEach((p: any) => { pY1[p.id] = (c.y ?? 0) + (p.y ?? 0); });
  });

  // slot assignment per node from pass-1 order (partner = the other endpoint's node centre)
  const portsMap: Record<string, any[]> = {};
  tasks.forEach(t => {
    const ins = inList[t.id] ?? [], outs = outList[t.id] ?? [], hH = headerH(t), rows = Math.max(ins.length, outs.length);
    const rowY = (r: number) => hH + r * ROW_H + ROW_H / 2;
    const partnerY = (eid: string, other: string) => centreY[other] ?? pY1[eid] ?? 0;
    const inParts = ins.map(eid => ({ eid, py: partnerY(portT(eid), edges.find(e => e.id === eid)!.source) }));
    const outParts = outs.map(eid => ({ eid, py: partnerY(portS(eid), edges.find(e => e.id === eid)!.target) }));
    const allYs = [...inParts, ...outParts].map(p => p.py);
    const inSlot = assignSlots(inParts, rows, allYs), outSlot = assignSlots(outParts, rows, allYs);
    portsMap[t.id] = [
      ...ins.map(eid => ({ id: portT(eid), x: 0, y: rowY(inSlot[eid]), layoutOptions: { 'elk.port.side': 'WEST' } })),
      ...outs.map(eid => ({ id: portS(eid), x: NODE_W, y: rowY(outSlot[eid]), layoutOptions: { 'elk.port.side': 'EAST' } })),
    ];
  });

  // PASS 2 — pin ports to the assigned row centres (FIXED_POS) and route. Taxo nodes stay FREE
  // (they declare no ports at all — contains/seq edges connect node→node, ELK auto-picks the
  // border crossing point).
  const pass2 = {
    id: 'root', layoutOptions: ELK_OPTS,
    children: [
      ...tasks.map(t => ({
        id: t.id, width: NODE_W, height: heights[t.id],
        layoutOptions: { 'elk.partitioning.partition': String(LAYER_ORDER[t.layer_id] ?? 1), 'elk.portConstraints': 'FIXED_POS' },
        ports: portsMap[t.id],
      })),
      ...taxoNodeSpecs,
    ],
    edges: [
      ...edges.map(e => ({ id: e.id, sources: [portS(e.id)], targets: [portT(e.id)] })),
      ...taxoEdgeSpecs,
    ],
  };
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
  return { pos, pts, handles, heights };
}

// rounded orthogonal SVG path through ELK bend points.
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
// ---- custom edge: draws the exact ELK route (no arrowhead, no label) ----
type ElkEdgeData = { points: XY[] };
function ElkEdge({ id, data, markerEnd, style }: EdgeProps) {
  const d = data as unknown as ElkEdgeData;
  if (!d?.points || d.points.length < 2) return null;
  return <BaseEdge id={id} path={orthoPath(d.points)} markerEnd={markerEnd} style={style} />;
}
// ---- membership edge: class→family / family→instance `contains`, and dream `seq` chaining ----
// thin, neutral grey, no ports, no arrowhead, no label — deliberately recessive vs. the flow edges.
function ContainsEdgeComp({ id, data, style }: EdgeProps) {
  const d = data as unknown as ElkEdgeData;
  if (!d?.points || d.points.length < 2) return null;
  return <BaseEdge id={id} path={orthoPath(d.points, 6)} style={style} />;
}

// ---- custom nodes ----
type PortHandle = HandleSpec & { color: string; label: string };
const DIAMOND = 'M7 1.1 L12.9 7 L7 12.9 L1.1 7 Z';   // output ◇
const TRIANGLE = 'M2 1 L13.5 7 L2 13 Z';             // input ▷ (points into the node)
// output = diamond ◇, input = triangle ▷ (points into the node); coloured by its edge, ringed to sit on the border.
// paths are mass-balanced (≈ equal area) and drawn as SVG so the outline follows the shape.
const PORT = 14;
function PortShape({ h }: { h: PortHandle }) {
  const off: React.CSSProperties = (h.side === 'EAST' || h.side === 'WEST') ? { top: h.y } : { left: h.x };
  return (
    <Handle id={h.id} type={h.kind} position={SIDE_POS[h.side]} isConnectable={false}
      style={{ width: PORT, height: PORT, background: 'transparent', border: 'none', borderRadius: 0, ...off }}>
      <svg width={PORT} height={PORT} viewBox="0 0 14 14" style={{ display: 'block', overflow: 'visible', pointerEvents: 'none' }}>
        <path d={h.kind === 'source' ? DIAMOND : TRIANGLE} fill={h.color} strokeWidth={1.5} strokeLinejoin="round" style={{ stroke: 'var(--surface, #101826)' }} />
      </svg>
    </Handle>
  );
}
// I/O chip: a pill outlined in the edge colour; label in the same tone, wraps up to 2 lines.
function IOChip({ h }: { h: PortHandle }) {
  return (
    <span title={h.label} style={{
      display: 'inline-flex', maxWidth: 98, minWidth: 0,
      border: `1px solid ${h.color}`, background: `${h.color}1f`, color: h.color,
      borderRadius: 6, padding: '2px 6px', fontFamily: 'monospace', fontSize: 8.5, lineHeight: 1.3,
    }}>
      <span style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', overflowWrap: 'anywhere' }}>{h.label}</span>
    </span>
  );
}
type BrickData = { task: Task; color: string; opacity: number; selected: boolean; badges: string[]; families: string[]; handles: PortHandle[]; minH: number; hasTaxonomy: boolean; taxoExpanded: boolean; onToggleTaxo: (id: string) => void };
function BrickNode({ data }: NodeProps) {
  const { task, color, opacity, selected, badges, families, handles, minH, hasTaxonomy, taxoExpanded, onToggleTaxo } = data as unknown as BrickData;
  const { icon: Icon } = kindOf(task);
  // place chips by their port's actual slot (ports may be spread, not top-anchored).
  const hH = headerH(task);
  const slotOf = (h: PortHandle) => Math.round((h.y - hH - ROW_H / 2) / ROW_H);
  const inAt: (PortHandle | undefined)[] = [], outAt: (PortHandle | undefined)[] = [];
  let rows = 0;
  handles.forEach(h => { const s = slotOf(h); rows = Math.max(rows, s + 1); (h.kind === 'target' ? inAt : outAt)[s] = h; });
  return (
    <div className="rf-brick" title={task.elevator_pitch} style={{
      width: NODE_W, minHeight: minH, boxSizing: 'border-box', borderRadius: 11, border: `1.5px solid ${color}`,
      background: `linear-gradient(180deg, ${color}22, ${color}0f), var(--surface, #101826)`,
      color: 'var(--text-main, #e6e9ee)', opacity, transition: 'opacity .2s, box-shadow .12s, transform .12s',
      boxShadow: selected ? `0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)` : undefined,
    }}>
      {/* port shapes on the border: ◇ output right, ▷ input left — aligned to the I/O rows below */}
      {handles.map((h) => (<PortShape key={h.id} h={h} />))}
      {/* header — fixed height so ELK ports stay aligned with the rows */}
      <div style={{ height: headerH(task), overflow: 'hidden', padding: '6px 12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ display: 'inline-flex', color }}><Icon size={13} /></span>
          <span style={{ flex: 1, minWidth: 0, fontFamily: 'monospace', fontSize: 9, letterSpacing: '.05em', textTransform: 'uppercase', color, opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{catLabel(task.id)}</span>
          <span style={{ flex: '0 0 auto', fontFamily: 'monospace', fontSize: 7.5, letterSpacing: '.03em', textTransform: 'uppercase', padding: '1px 4px', borderRadius: 4, border: `1px solid ${color}66`, background: `${color}18`, color, opacity: 0.9 }}>{NATURES[natureOf(task.id)].short}</span>
          {hasTaxonomy && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleTaxo(task.id); }}
              title={taxoExpanded ? 'свернуть состав' : 'развернуть состав'}
              aria-label={taxoExpanded ? 'свернуть состав' : 'развернуть состав'}
              style={{ flex: '0 0 auto', background: 'none', border: 'none', color, cursor: 'pointer', padding: 0, margin: 0, display: 'inline-flex', alignItems: 'center', fontSize: 11, lineHeight: 1 }}
            >
              {taxoExpanded ? '▾' : '▸'}
            </button>
          )}
        </div>
        <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.15 }}>{task.name}</div>
        {families.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {families.map(f => {
              const [name, count] = f.split('×');
              return (
                <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'monospace', fontSize: 9, padding: '1px 5px', borderRadius: 5, border: `1px solid ${color}44`, background: `${color}12` }}>
                  <span style={{ opacity: 0.9 }}>{name.trim()}</span><span style={{ color, fontWeight: 600 }}>×{count?.trim()}</span>
                </span>
              );
            })}
          </div>
        )}
        {badges.length > 0 && (
          <div style={{ marginTop: 5, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {badges.map(b => (<span key={b} style={{ fontFamily: 'monospace', fontSize: 8.5, padding: '1px 5px', borderRadius: 4, border: `1px solid ${color}55`, color, opacity: 0.9 }}>{b}</span>))}
          </div>
        )}
      </div>
      {/* I/O rows — one per max(inputs,outputs): input pill left, output pill right */}
      {rows > 0 && (
        <div style={{ padding: '0 12px 6px' }}>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} style={{ height: ROW_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span style={{ minWidth: 0, display: 'flex' }}>{inAt[r] && <IOChip h={inAt[r]!} />}</span>
              <span style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>{outAt[r] && <IOChip h={outAt[r]!} />}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ---- detail-hierarchy (drill-down) nodes: compact family/instance cards, attach via `contains` ----
type FamilyNodeData = { name: string; childCount: number; nature: NodeNature; expanded: boolean; hasChildren: boolean; onToggle: (id: string) => void; selected: boolean };
function FamilyNode({ id, data }: NodeProps) {
  const { name, childCount, nature, expanded, hasChildren, onToggle, selected } = data as unknown as FamilyNodeData;
  const color = NATURES[nature].color;
  return (
    <div className="rf-brick" style={{
      width: TAXO_W, height: TAXO_H.family, boxSizing: 'border-box', borderRadius: 8, border: `1.3px solid ${color}`,
      background: `linear-gradient(180deg, ${color}20, ${color}0c), var(--surface, #101826)`,
      color: 'var(--text-main, #e6e9ee)', display: 'flex', alignItems: 'center', gap: 5, padding: '0 8px', cursor: 'pointer',
      boxShadow: selected ? `0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)` : undefined,
    }}>
      {hasChildren ? (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(id); }}
          title={expanded ? 'свернуть' : 'развернуть'}
          aria-label={expanded ? 'свернуть' : 'развернуть'}
          style={{ flex: '0 0 auto', width: 12, background: 'none', border: 'none', color, cursor: 'pointer', padding: 0, fontSize: 10, lineHeight: 1, display: 'inline-flex' }}
        >
          {expanded ? '▾' : '▸'}
        </button>
      ) : <span style={{ flex: '0 0 auto', width: 12 }} />}
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flex: '0 0 auto' }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 10.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</span>
      {childCount > 0 && <span style={{ fontFamily: 'monospace', fontSize: 9, opacity: 0.6, flex: '0 0 auto' }}>×{childCount}</span>}
    </div>
  );
}
type InstanceNodeData = { name: string; nature: NodeNature; status: NodeStatus; selected: boolean };
function InstanceNode({ data }: NodeProps) {
  const { name, nature, status, selected } = data as unknown as InstanceNodeData;
  const color = NATURES[nature].color;
  const dead = status === 'dead';
  return (
    <div className="rf-brick" style={{
      width: TAXO_W, height: TAXO_H.instance, boxSizing: 'border-box', borderRadius: 7, border: `1.1px ${dead ? 'dashed' : 'solid'} ${color}`,
      background: `linear-gradient(180deg, ${color}18, ${color}09), var(--surface, #101826)`,
      color: 'var(--text-main, #e6e9ee)', display: 'flex', alignItems: 'center', gap: 5, padding: '0 8px', cursor: 'pointer',
      opacity: dead ? 0.5 : 1, boxShadow: selected ? `0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)` : undefined,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flex: '0 0 auto' }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={name}>{name}</span>
      <StatusDot status={status} size={6} />
    </div>
  );
}
type ZoneData = { label: string; role: string; color: string };
// meta-cluster only: faint neutral contour so the functional-category colours stay dominant.
function ZoneNode({ data }: NodeProps) {
  const { label, role, color } = data as unknown as ZoneData;
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 18, border: `1px dashed ${color}2e`, background: `${color}07` }}>
      <div style={{ position: 'absolute', top: 10, left: 16, fontFamily: 'monospace', fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color, opacity: 0.42 }}>
        {label} <span style={{ letterSpacing: 0, textTransform: 'none' }}>· {role}</span>
      </div>
    </div>
  );
}
// band container (Constraints / Touchpoints) — a labelled lane below the flow.
function BandNode({ data }: NodeProps) {
  const { label, role, color } = data as unknown as ZoneData;
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 14, border: `1px dashed ${color}44`, background: `${color}0a` }}>
      <div style={{ position: 'absolute', top: 8, left: 14, fontFamily: 'monospace', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color, opacity: 0.72 }}>
        {label} <span style={{ opacity: 0.6, letterSpacing: 0, textTransform: 'none' }}>· {role}</span>
      </div>
    </div>
  );
}
type ItemNodeData = { itemId: string; kind: 'constraint' | 'touchpoint'; label: string; category: string; color: string; icon: React.ComponentType<{ size?: number }>; related: string[]; dirLabel?: string; dim: boolean; selected: boolean };
function ItemNode({ data }: NodeProps) {
  const { label, category, color, icon: Icon, dim, selected, dirLabel } = data as unknown as ItemNodeData;
  return (
    <div className="rf-brick" style={{
      width: ITEM_W, boxSizing: 'border-box', borderRadius: 9, border: `1.5px solid ${color}`,
      background: `linear-gradient(180deg, ${color}20, ${color}0c), var(--surface, #101826)`,
      color: 'var(--text-main, #e6e9ee)', padding: '7px 9px', opacity: dim ? 0.22 : 1, transition: 'opacity .2s, box-shadow .12s',
      boxShadow: selected ? `0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)` : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        <span style={{ display: 'inline-flex', color }}><Icon size={12} /></span>
        <span style={{ flex: 1, minWidth: 0, fontFamily: 'monospace', fontSize: 8, letterSpacing: '.05em', textTransform: 'uppercase', color, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category}</span>
        {dirLabel && <span style={{ flex: '0 0 auto', fontFamily: 'monospace', fontSize: 7.5, padding: '0 4px', borderRadius: 3, border: `1px solid ${color}66`, color, opacity: 0.9 }}>{dirLabel}</span>}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.15 }}>{label}</div>
    </div>
  );
}
const nodeTypes = { brick: BrickNode, zone: ZoneNode, band: BandNode, item: ItemNode, family: FamilyNode, instance: InstanceNode };
const edgeTypes = { elk: ElkEdge, contains: ContainsEdgeComp };

export function CanvasPage({ height = 'calc(100vh - 60px)' }: { height?: string } = {}) {
  const { isDark, toggle } = useDarkMode();
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [selItem, setSelItem] = useState<{ kind: 'constraint' | 'touchpoint'; raw: any; related: string[] } | null>(null);
  const [showStores, setShowStores] = useState(true);
  const [layout, setLayout] = useState<{ pos: Pos; pts: EdgePts; handles: Handles; heights: Record<string, number> } | null>(null);
  // detail-hierarchy drill-down: which class/family nodes are expanded on the canvas.
  // Keys: raw class task id (e.g. 'det_detectors'), or taxoRenderId(classId, taxoId) for a family
  // (see features/topos/lib/visibleTaxo.ts for why family ids need the classId prefix).
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [selTaxo, setSelTaxo] = useState<TaxoRender | null>(null);
  const toggleTaxo = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const tasks = useMemo(() => toposService.getTasks(), []);
  const layers = useMemo(() => toposService.getLayers(), []);
  const examples = useMemo(() => toposService.getExamples(), []);
  const constraints = useMemo(() => toposService.getConstraints(), []);
  const idSet = useMemo(() => new Set(tasks.map(t => t.id)), [tasks]);
  const raw = useMemo(() => rawEdges(tasks, idSet), [tasks, idSet]);

  // detail-hierarchy: derive the visible family/instance sub-graph from `expanded` (pure fn).
  const taxoVisible = useMemo(() => visibleTaxo(expanded, tasks), [expanded, tasks]);
  const taxoNodesVisible = taxoVisible.nodes;
  const taxoContainsEdges = taxoVisible.contains;
  const taxoSeqEdges = taxoVisible.seq;
  // ELK treats contains + seq edges identically (node→node, no ports); only rendering (opacity)
  // distinguishes them, so route them together but keep the source arrays for that distinction.
  const taxoAllEdges = useMemo(
    () => [...taxoContainsEdges, ...taxoSeqEdges],
    [taxoContainsEdges, taxoSeqEdges]
  );

  // each port takes the colour of its own edge (loop = amber) and the data label of the edge's source output.
  const portColor = useMemo(() => {
    const m: Record<string, string> = {};
    raw.forEach(e => {
      const isLoop = e.source === 'eff_respond' && e.target === 'det_detectors';
      const c = isLoop ? '#e6a63c' : (EDGE_COLOR[e.rel.type] ?? '#8a8f98');
      m[portS(e.id)] = c; m[portT(e.id)] = c;
    });
    return m;
  }, [raw]);
  const portLabel = useMemo(() => {
    const m: Record<string, string> = {};
    raw.forEach(e => {
      const srcOut = ioOut(toposService.getTaskById(e.source));
      const tgt = toposService.getTaskById(e.target);
      m[portT(e.id)] = srcOut;                                                   // input chip = incoming datum
      m[portS(e.id)] = tgt?.category === 'surface' ? (tgt.name ?? srcOut) : srcOut; // output → a surface: show the surface name
    });
    return m;
  }, [raw]);

  // run the layout+routing engine — coords AND edge routes come from ELK. Re-runs whenever the
  // visible taxo set changes (expand/collapse), reflowing the WHOLE map (flow + taxo together).
  useEffect(() => {
    let alive = true;
    computeLayout(tasks, raw, taxoNodesVisible, taxoAllEdges).then(l => { if (alive) setLayout(l); }).catch(err => console.error('ELK layout failed', err));
    return () => { alive = false; };
  }, [tasks, raw, taxoNodesVisible, taxoAllEdges]);

  const pos = layout?.pos ?? null;
  const pts = layout?.pts ?? {};
  const handles = layout?.handles ?? {};
  const heights = layout?.heights ?? {};

  const flowIds = useMemo(() => {
    if (!activeFlow) return null;
    const ex = examples.find(e => e.id === activeFlow);
    return ex ? new Set(ex.nodes.map(n => n.task_id)) : null;
  }, [activeFlow, examples]);

  // Focus mode: when a node is selected, spotlight it + its direct neighbours.
  const connected = useMemo(() => {
    if (!selected) return null;
    const s = new Set<string>([selected.id]);
    (selected.relations ?? []).forEach(r => s.add(r.target_id));
    tasks.forEach(t => (t.relations ?? []).forEach(r => { if (r.target_id === selected.id) s.add(t.id); }));
    return s;
  }, [selected, tasks]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSelected(null); setSelItem(null); setSelTaxo(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const zoneNodes: Node[] = useMemo(() => {
    if (!pos) return [];
    const PAD = 46, TOP = 34;
    return layers.map((layer) => {
      const members = tasks.filter(t => t.layer_id === layer.id && pos[t.id]);
      if (!members.length) return null;
      const minX = Math.min(...members.map(t => pos[t.id].x)) - PAD;
      const minY = Math.min(...members.map(t => pos[t.id].y)) - PAD - TOP;
      const maxX = Math.max(...members.map(t => pos[t.id].x + NODE_W)) + PAD;
      const maxY = Math.max(...members.map(t => pos[t.id].y + (heights[t.id] ?? headerH(t) + ROW_H))) + PAD;
      return {
        id: `zone_${layer.id}`, type: 'zone', position: { x: minX, y: minY },
        data: { label: layer.name, role: layer.role, color: layer.color },
        style: { width: maxX - minX, height: maxY - minY }, draggable: false, selectable: false, zIndex: -1,
      } as Node;
    }).filter(Boolean) as Node[];
  }, [layers, tasks, pos, heights]);

  const brickNodes: Node[] = useMemo(() => {
    if (!pos) return [];
    const spot = selItem ? new Set(selItem.related) : null;
    return tasks.map((t) => {
      // det_detectors header strip — real taxonomy families (name + actual child count), not a
      // parsed common_variants string (see famCountOf above for the matching row-height calc).
      const families = t.id === 'det_detectors'
        ? toposService.getTaxonomy(t.id).filter(n => n.kind === 'family').map(f => `${f.name} ×${f.children?.length ?? 0}`)
        : [];
      let opacity = 1;
      if (flowIds && !flowIds.has(t.id)) opacity = 0.18;
      else if (spot && !spot.has(t.id)) opacity = 0.2;
      else if (connected && !connected.has(t.id)) opacity = 0.25;
      return {
        id: t.id, type: 'brick', position: pos[t.id] ?? { x: 0, y: 0 },
        data: {
          task: t, color: natureColor(t.id), opacity, selected: selected?.id === t.id, badges: BADGES[t.id] ?? [], families,
          minH: heights[t.id] ?? headerH(t) + ROW_H,
          handles: (handles[t.id] ?? []).map(h => ({ ...h, color: portColor[h.id] ?? natureColor(t.id), label: portLabel[h.id] ?? '' })),
          hasTaxonomy: toposService.getTaxonomy(t.id).length > 0, taxoExpanded: expanded.has(t.id), onToggleTaxo: toggleTaxo,
        },
        zIndex: selected?.id === t.id ? 3 : 1,
      } as Node;
    });
  }, [tasks, flowIds, connected, selected, selItem, pos, handles, heights, portColor, portLabel, expanded, toggleTaxo]);

  // cross-cutting bands (Constraints / Touchpoints) laid out below the flow's bounding box.
  const bands = useMemo(() => {
    if (!pos) return { zones: [] as Node[], items: [] as any[] };
    const present = tasks.filter(t => pos[t.id]);
    const minX = Math.min(...present.map(t => pos[t.id].x));
    const maxX = Math.max(...present.map(t => pos[t.id].x + NODE_W));
    const maxY = Math.max(...present.map(t => pos[t.id].y + (heights[t.id] ?? headerH(t) + ROW_H)));
    const bandW = maxX - minX;
    const cols = Math.max(1, Math.floor((bandW + ITEM_GX) / (ITEM_W + ITEM_GX)));
    const zones: Node[] = [], items: any[] = [];
    // Constraints — grid band below the flow (touchpoints are now full flow nodes, not a band).
    const rows = Math.max(1, Math.ceil(constraints.length / cols));
    constraints.forEach((it, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      items.push({
        id: `item_${it.id}`, itemId: it.id, kind: 'constraint', related: it.applies_to ?? [], raw: it,
        position: { x: minX + c * (ITEM_W + ITEM_GX), y: maxY + BAND_GAP + BAND_LABEL + r * (ITEM_H + ITEM_GY) },
        data: { itemId: it.id, kind: 'constraint', label: it.name, category: CONSTRAINT_CAT[it.category] ?? it.category, color: BAND.constraint.color, icon: ICONS[it.icon] ?? Box, related: it.applies_to ?? [] },
      });
    });
    const h = BAND_LABEL + rows * (ITEM_H + ITEM_GY) - ITEM_GY + BAND_PAD;
    zones.push({ id: 'band_constraint', type: 'band', position: { x: minX - 22, y: maxY + BAND_GAP - 6 }, data: { label: BAND.constraint.label, role: BAND.constraint.role, color: BAND.constraint.color }, style: { width: bandW + 44, height: h + 12 }, draggable: false, selectable: false, zIndex: -1 } as Node);
    return { zones, items };
  }, [pos, heights, tasks, constraints]);

  const itemNodes: Node[] = useMemo(() => bands.items.map((it) => {
    const isSel = selItem?.raw?.id === it.itemId;
    let dim = false;
    if (selItem) dim = !isSel;
    else if (selected) dim = !it.related.includes(selected.id);
    return { id: it.id, type: 'item', position: it.position, data: { ...it.data, raw: it.raw, dim, selected: !!isSel }, zIndex: isSel ? 3 : 1 } as Node;
  }), [bands, selItem, selected]);

  // detail-hierarchy: family/instance cards for the currently visible taxo set. Skip a node until
  // ELK has actually placed it (guards the one-tick window between a toggle and the async layout
  // resolving — avoids a flash at (0,0)).
  const taxoNodesRF: Node[] = useMemo(() => {
    if (!pos) return [];
    return taxoNodesVisible.filter(rt => pos[rt.id]).map(rt => {
      const isSel = selTaxo?.id === rt.id;
      if (rt.kind === 'family') {
        return {
          id: rt.id, type: 'family', position: pos[rt.id],
          data: { name: rt.name, childCount: rt.childCount, nature: rt.nature, expanded: expanded.has(rt.id), hasChildren: rt.hasChildren, onToggle: toggleTaxo, selected: isSel } as FamilyNodeData,
          zIndex: isSel ? 3 : 2,
        } as Node;
      }
      return {
        id: rt.id, type: 'instance', position: pos[rt.id],
        data: { name: rt.name, nature: rt.nature, status: rt.status, selected: isSel } as InstanceNodeData,
        zIndex: isSel ? 3 : 2,
      } as Node;
    });
  }, [taxoNodesVisible, pos, expanded, toggleTaxo, selTaxo]);

  const nodes = useMemo(
    () => [...zoneNodes, ...bands.zones, ...brickNodes, ...itemNodes, ...taxoNodesRF],
    [zoneNodes, bands, brickNodes, itemNodes, taxoNodesRF]
  );

  const edges: Edge[] = useMemo(() => {
    if (!pos) return [];
    const focusId = selected?.id ?? null;
    const centre = (id: string) => ({ x: pos[id].x + NODE_W / 2, y: pos[id].y + (heights[id] ?? 100) / 2 });
    const list = raw.map((e) => {
      if (isStoreEdgeType(e.rel.type) && !showStores) return null;
      const color = EDGE_COLOR[e.rel.type] ?? '#8a8f98';
      const isLoop = e.source === 'eff_respond' && e.target === 'det_detectors';
      const isRead = e.rel.type === 'reads_from';
      let dim = false, emph = true;
      if (selItem) { emph = false; dim = true; }               // band item selected → fade the flow edges
      else if (flowIds) { emph = flowIds.has(e.source) && flowIds.has(e.target); dim = !emph; }
      else if (focusId) { emph = e.source === focusId || e.target === focusId; dim = !emph; }
      const wakesFlow = e.rel.type === 'wakes' || e.rel.type === 'actuates';
      const stroke = isLoop ? '#e6a63c' : color;
      const points = pts[e.id] ?? [centre(e.source), centre(e.target)];
      return {
        id: e.id, source: e.source, target: e.target, sourceHandle: portS(e.id), targetHandle: portT(e.id), type: 'elk',
        data: { points } as ElkEdgeData,
        style: {
          stroke,
          strokeWidth: (emph && (flowIds || focusId)) ? 2.6 : 1.6,   // uniform; thicker only to spotlight a path
          strokeDasharray: isRead ? '1 6' : undefined, opacity: dim ? 0.06 : 0.9,
        },
        animated: isLoop || ((flowIds || focusId) ? (emph && wakesFlow) : false), zIndex: dim ? 0 : 1,
      } as Edge;
    }).filter(Boolean) as Edge[];
    return list;
  }, [raw, pts, pos, flowIds, connected, selected, selItem, showStores, isDark]);

  // `contains` / `seq` membership edges — thin, grey, no ports/arrowhead/label, rendered BELOW
  // the flow edges (negative zIndex) so the flow stays visually dominant per the design doc.
  const taxoEdgesRF: Edge[] = useMemo(() => {
    if (!pos) return [];
    const mk = (e: ContainsEdge, isSeq: boolean): Edge | null => {
      const points = pts[e.id];
      if (!points || points.length < 2) return null;
      return {
        id: e.id, source: e.source, target: e.target, type: 'contains',
        data: { points } as ElkEdgeData,
        style: { stroke: '#5a6675', strokeWidth: isSeq ? 1.4 : 1.2, opacity: isSeq ? 0.7 : 0.5 },
        zIndex: -1,
      } as Edge;
    };
    return [
      ...taxoContainsEdges.map(e => mk(e, false)),
      ...taxoSeqEdges.map(e => mk(e, true)),
    ].filter(Boolean) as Edge[];
  }, [taxoContainsEdges, taxoSeqEdges, pts, pos]);

  const allEdges = useMemo(() => [...edges, ...taxoEdgesRF], [edges, taxoEdgesRF]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'item') {
      const d = node.data as any;
      setSelItem({ kind: d.kind, raw: d.raw, related: d.related }); setSelected(null); setSelTaxo(null);
      return;
    }
    if (node.type === 'zone' || node.type === 'band') return;
    if (node.type === 'family' || node.type === 'instance') {
      const rt = taxoNodesVisible.find(n => n.id === node.id) ?? null;
      setSelTaxo(rt); setSelected(null); setSelItem(null);
      return;
    }
    setSelected(toposService.getTaskById(node.id) ?? null); setSelItem(null); setSelTaxo(null);
  }, [taxoNodesVisible]);

  if (!pos) {
    return (
      <div style={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0a1018' : '#f4f6f8', color: isDark ? '#9aa4b2' : '#5a6270', fontFamily: 'monospace', fontSize: 13 }}>
        раскладка…
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height, background: isDark ? '#0a1018' : '#f4f6f8' }}>
      <ReactFlow
        nodes={nodes} edges={allEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} colorMode={isDark ? 'dark' : 'light'}
        onNodeClick={onNodeClick} onPaneClick={() => { setSelected(null); setSelItem(null); setSelTaxo(null); }}
        fitView fitViewOptions={{ padding: 0.1 }} minZoom={0.2} proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} color={isDark ? '#16202e' : '#dfe4ea'} />

        <Panel position="top-left">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', maxWidth: 700 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', opacity: 0.6, marginRight: 2 }}>{TOPOS_DATA.meta.title} · путь:</span>
            <button onClick={() => setActiveFlow(null)} style={btn(activeFlow === null, isDark)}>весь граф</button>
            {examples.map((e) => (<button key={e.id} onClick={() => setActiveFlow(e.id)} style={btn(activeFlow === e.id, isDark)}>{e.title}</button>))}
            <span style={{ width: 1, height: 16, background: 'var(--border,#2a3646)', margin: '0 2px' }} />
            <button onClick={() => setShowStores(s => !s)} style={btn(showStores, isDark)} title="Рёбра чтения/записи в vault-сторы">стор-рёбра</button>
            <button onClick={toggle} style={btn(false, isDark)} title="Тема" aria-label="Тема">{isDark ? <Sun size={13} /> : <Moon size={13} />}</button>
          </div>
        </Panel>

        {!selected && (
          <Panel position="top-right">
            <div style={{ background: isDark ? 'rgba(11,20,32,.82)' : 'rgba(255,255,255,.9)', border: '1px solid var(--border,#2a3646)', borderRadius: 8, padding: '9px 11px', fontFamily: 'monospace', fontSize: 10.5, lineHeight: 1.5, color: 'var(--text-main,#e6e9ee)', maxHeight: 'calc(100vh - 90px)', overflowY: 'auto' }}>
              <div style={{ opacity: 0.55, marginBottom: 4, letterSpacing: '.08em' }}>ПРИРОДА · цвет</div>
              {(Object.keys(NATURES) as Nature[]).map(k => {
                const n = NATURES[k];
                return (<div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: n.color, display: 'inline-block' }} /><span style={{ opacity: 0.85 }}>{n.label}</span></div>);
              })}
              <div style={{ opacity: 0.55, margin: '7px 0 4px', letterSpacing: '.08em' }}>ФУНКЦИЯ · иконка</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 10px' }}>
                {(Object.keys(CATEGORIES) as CatKey[]).map(k => {
                  const cat = CATEGORIES[k]; const CatIcon = cat.icon;
                  return (<div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}><span style={{ display: 'inline-flex', opacity: 0.6 }}><CatIcon size={10} /></span><span style={{ opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.label}</span></div>);
                })}
              </div>
              <div style={{ opacity: 0.4, marginTop: 4 }}>зоны inbound·internal·outbound — мета-кластер</div>
              <div style={{ opacity: 0.55, margin: '7px 0 4px', letterSpacing: '.08em' }}>СВЯЗИ</div>
              {EDGE_LEGEND.map(([type, ru]) => {
                const c = EDGE_COLOR[type.split(' ')[0]] ?? '#8a8f98';
                const dotted = type === 'reads_from';
                return (<div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 0, borderTop: `2px ${dotted ? 'dotted' : 'solid'} ${c}`, display: 'inline-block' }} /><span style={{ opacity: 0.85 }}>{type}</span><span style={{ opacity: 0.45 }}>{ru}</span></div>);
              })}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}><span style={{ width: 14, height: 0, borderTop: '2px solid #e6a63c', display: 'inline-block' }} /><span style={{ opacity: 0.85, color: '#e6a63c' }}>↺ петля (эффект = write)</span></div>
              <div style={{ opacity: 0.5, marginTop: 5 }}>сплошная = запись / поток</div>
              <div style={{ opacity: 0.5 }}>пунктир = чтение (read-only)</div>
              <div style={{ opacity: 0.55, margin: '7px 0 4px', letterSpacing: '.08em' }}>ПОРТЫ</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" style={{ overflow: 'visible' }}><path d="M7 1.1 L12.9 7 L7 12.9 L1.1 7 Z" fill="#8a8f98" /></svg><span style={{ opacity: 0.85 }}>выход</span>
                <svg width="12" height="12" viewBox="0 0 14 14" style={{ overflow: 'visible', marginLeft: 4 }}><path d="M2 1 L13.5 7 L2 13 Z" fill="#8a8f98" /></svg><span style={{ opacity: 0.85 }}>вход</span>
              </div>
              <div style={{ opacity: 0.55, margin: '7px 0 4px', letterSpacing: '.08em' }}>СОСТАВ (▸ развернуть)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 0, borderTop: '2px solid #5a6675', opacity: 0.5, display: 'inline-block' }} /><span style={{ opacity: 0.85 }}>contains</span><span style={{ opacity: 0.45 }}>принадлежность, без стрелки</span>
              </div>
              <div style={{ opacity: 0.55, margin: '7px 0 4px', letterSpacing: '.08em' }}>СТАТУС</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 10px' }}>
                {(Object.keys(STATUS_LABEL) as NodeStatus[]).map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><StatusDot status={s} /><span style={{ opacity: 0.8 }}>{STATUS_LABEL[s]}</span></div>
                ))}
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {selected && <DetailDrawer task={selected} isDark={isDark} onClose={() => setSelected(null)} />}
      {!selected && selItem && <ItemDrawer item={selItem} isDark={isDark} onClose={() => setSelItem(null)} />}
      {!selected && !selItem && selTaxo && <TaxoDrawer taxo={selTaxo} isDark={isDark} onClose={() => setSelTaxo(null)} />}
    </div>
  );
}

function DetailDrawer({ task, isDark, onClose }: { task: Task; isDark: boolean; onClose: () => void }) {
  const { icon: Icon } = kindOf(task);
  const color = natureColor(task.id);
  const cat = CATEGORIES[catOf(task.id)];
  const nat = NATURES[natureOf(task.id)];
  const layer = toposService.getLayerById(task.layer_id);
  const io = task.io_spec;
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, width: 360, height: '100%', background: isDark ? 'rgba(9,15,23,.96)' : 'rgba(250,251,252,.97)', borderLeft: `1px solid var(--border,#2a3646)`, boxShadow: '-8px 0 24px rgba(0,0,0,.35)', overflowY: 'auto', zIndex: 20, padding: '16px 18px', color: 'var(--text-main,#e6e9ee)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color }}><Icon size={16} /></span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color }}>{cat.label}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted,#9aa4b2)', cursor: 'pointer' }}><X size={16} /></button>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0 4px' }}>{task.name}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: `1px solid ${color}`, background: `${color}18`, color }}>{nat.label}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border,#2a3646)', color: 'var(--text-muted,#c2c9d4)' }}>{cat.label}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border,#2a3646)', color: 'var(--text-muted,#9aa4b2)' }}>зона: {layer?.name}</span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-muted,#c2c9d4)', marginBottom: 12 }}>{task.elevator_pitch}</p>
      {task.example_usage && <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted,#9aa4b2)', marginBottom: 12, fontStyle: 'italic' }}>{task.example_usage}</p>}
      {BADGES[task.id] && <Section title="ОСИ">{BADGES[task.id].map(b => <Chip key={b} color={color}>{b}</Chip>)}</Section>}
      {io && (
        <Section title="ВХОД → ВЫХОД">
          <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6, color: 'var(--text-muted,#c2c9d4)' }}>
            <div><span style={{ opacity: 0.5 }}>in: </span>{[...io.inputs.required, ...io.inputs.optional].map(ioLabel).join(', ') || '—'}</div>
            <div><span style={{ opacity: 0.5 }}>out: </span>{ioLabel(io.outputs.primary)}</div>
          </div>
        </Section>
      )}
      {(() => {
        // prefer the real taxonomy (family ×count, or flat instance names) over the curated
        // common_variants strings; common_variants stays as the fallback for classes with no
        // TAXONOMY entry (see docs/superpowers/specs/2026-07-12-detail-hierarchy-design.md).
        const taxo = toposService.getTaxonomy(task.id);
        if (taxo.length > 0) {
          const labels = taxo.map(n => n.kind === 'family' ? `${n.name} ×${n.children?.length ?? 0}` : n.name);
          return <Section title="ВАРИАНТЫ">{labels.map(v => <Chip key={v} color="#8a8f98">{v}</Chip>)}</Section>;
        }
        if ('common_variants' in task && (task as any).common_variants?.length > 0) {
          return <Section title="ВАРИАНТЫ">{(task as any).common_variants.map((v: string) => <Chip key={v} color="#8a8f98">{v}</Chip>)}</Section>;
        }
        return null;
      })()}
      {task.relations?.length > 0 && (
        <Section title="СВЯЗИ">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {task.relations.map((r, i) => {
              const tgt = toposService.getTaskById(r.target_id); const c = EDGE_COLOR[r.type] ?? '#8a8f98';
              return (
                <div key={i} style={{ fontSize: 12, lineHeight: 1.4 }}>
                  <div><span style={{ fontFamily: 'monospace', fontSize: 10, color: c }}>{r.type}</span> <span>→ {tgt?.name ?? r.target_id}</span></div>
                  <div style={{ color: 'var(--text-muted,#8a8f98)', fontSize: 11 }}>{r.reason}</div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
// Detail drawer for a family/instance taxo node — deliberately NOT the Task DetailDrawer (a
// TaxoNode is a different shape entirely: no io_spec/relations/example_usage).
function TaxoDrawer({ taxo, isDark, onClose }: { taxo: TaxoRender; isDark: boolean; onClose: () => void }) {
  const color = NATURES[taxo.nature].color;
  const cls = toposService.getTaskById(taxo.classId);
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, width: 360, height: '100%', background: isDark ? 'rgba(9,15,23,.96)' : 'rgba(250,251,252,.97)', borderLeft: `1px solid var(--border,#2a3646)`, boxShadow: '-8px 0 24px rgba(0,0,0,.35)', overflowY: 'auto', zIndex: 20, padding: '16px 18px', color: 'var(--text-main,#e6e9ee)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color }}>{taxo.kind === 'family' ? 'СЕМЕЙСТВО' : 'ЭКЗЕМПЛЯР'}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted,#9aa4b2)', cursor: 'pointer' }}><X size={16} /></button>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0 4px' }}>{taxo.name}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: `1px solid ${color}`, background: `${color}18`, color }}>{NATURES[taxo.nature].label}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border,#2a3646)', color: 'var(--text-muted,#c2c9d4)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <StatusDot status={taxo.status} size={7} />{STATUS_LABEL[taxo.status]}
        </span>
        {cls && <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border,#2a3646)', color: 'var(--text-muted,#9aa4b2)' }}>класс: {cls.name}</span>}
      </div>
      {taxo.note && <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-muted,#c2c9d4)', marginBottom: 12 }}>{taxo.note}</p>}
      {taxo.kind === 'family' && <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted,#9aa4b2)' }}>{taxo.childCount} {taxo.childCount === 1 ? 'элемент' : 'элементов'} в составе</p>}
    </div>
  );
}
function ItemDrawer({ item, isDark, onClose }: { item: { kind: 'constraint' | 'touchpoint'; raw: any; related: string[] }; isDark: boolean; onClose: () => void }) {
  const { kind, raw, related } = item;
  const color = BAND[kind].color;
  const Icon = ICONS[raw.icon] ?? Box;
  const catLbl = (kind === 'constraint' ? CONSTRAINT_CAT[raw.category] : TOUCHPOINT_CAT[raw.category]) ?? raw.category;
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, width: 360, height: '100%', background: isDark ? 'rgba(9,15,23,.96)' : 'rgba(250,251,252,.97)', borderLeft: `1px solid var(--border,#2a3646)`, boxShadow: '-8px 0 24px rgba(0,0,0,.35)', overflowY: 'auto', zIndex: 20, padding: '16px 18px', color: 'var(--text-main,#e6e9ee)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color }}><Icon size={16} /></span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color }}>{BAND[kind].label}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted,#9aa4b2)', cursor: 'pointer' }}><X size={16} /></button>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0 4px' }}>{raw.name}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: `1px solid ${color}`, background: `${color}18`, color }}>{catLbl}</span>
        {raw.type && <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border,#2a3646)', color: 'var(--text-muted,#9aa4b2)' }}>{raw.type}</span>}
      </div>
      {raw.description && <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-muted,#c2c9d4)', marginBottom: 12 }}>{raw.description}</p>}
      {raw.example_values && <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-muted,#9aa4b2)', marginBottom: 12, fontFamily: 'monospace' }}>{raw.example_values}</p>}
      {related.length > 0 && (
        <Section title="КАСАЕТСЯ УЗЛОВ">
          {related.map((id: string) => { const t = toposService.getTaskById(id); return <Chip key={id} color={color}>{t?.name ?? id}</Chip>; })}
        </Section>
      )}
      {kind === 'touchpoint' && raw.examples?.length > 0 && (
        <Section title="ПРИМЕРЫ">{raw.examples.map((e: string) => <Chip key={e} color="#8a8f98">{e}</Chip>)}</Section>
      )}
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '.1em', opacity: 0.5, marginBottom: 6 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{children}</div>
    </div>
  );
}
function Chip({ children, color }: { children: React.ReactNode; color: string }) {
  return <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: `1px solid ${color}55`, color }}>{children}</span>;
}
function btn(active: boolean, isDark: boolean): React.CSSProperties {
  return {
    fontSize: 11, fontFamily: 'monospace', padding: '4px 9px', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
    border: `1px solid ${active ? '#42c48a' : 'var(--border, #2a3646)'}`,
    background: active ? 'rgba(66,196,138,.15)' : (isDark ? 'rgba(19,29,43,.85)' : 'rgba(255,255,255,.9)'),
    color: active ? '#42c48a' : 'var(--text-muted, #9aa4b2)',
  };
}
