import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, Panel, Handle,
  BaseEdge,
  type Node, type Edge, type NodeProps, type EdgeProps, Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import {
  LogIn, Radar, Filter, Layers, BrainCircuit, Wrench, Send,
  Database, Moon, Sun, CircleCheck, Share2, Box, X,
} from 'lucide-react';
import { toposService } from '../../../services/toposService';
import { TOPOS_DATA } from '../../../data';
import { useDarkMode } from '../../../hooks/useDarkMode';
import type { Task, IOItem } from '../../../types';

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
};
const EDGE_LEGEND = [
  ['writes_to', 'пишет в стор'], ['reads_from', 'читает из стора'], ['reduces', 'детектор-reducer'],
  ['wakes', 'будит ум'], ['actuates', 'эффект'], ['enables / precedes', 'поток'], ['requires_input_from', 'тянет'],
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
  return { icon: Box, kind: t.task_type };
}
const layerColor = (id: string) => toposService.getLayerById(id)?.color ?? '#666';
const ioLabel = (i: IOItem) => (typeof i === 'string' ? i : i.label);
// data on an edge = the primary output of its source; both ports (out + in) carry it.
const ioOut = (t?: Task | null) => (t?.io_spec?.outputs?.primary ? ioLabel(t.io_spec.outputs.primary) : '');

// deterministic node geometry so ELK ports line up with the rendered I/O rows.
const ROW_H = 26;   // one input/output row
const famCountOf = (t: Task) => t.id === 'det_detectors' ? (t.common_variants ?? []).filter(v => v.includes('×')).length : 0;
// fixed header-block height (kind + title + families + badges) sitting above the I/O rows.
function headerH(t: Task): number {
  const famRows = famCountOf(t) ? Math.ceil(famCountOf(t) / 2) : 0;
  const badges = (BADGES[t.id] ?? []).length ? 20 : 0;
  return 58 + famRows * 20 + badges;
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

async function computeLayout(tasks: Task[], edges: RawEdge[]): Promise<{ pos: Pos; pts: EdgePts; handles: Handles; heights: Record<string, number> }> {
  // ordered input/output edges per node → one I/O row each; ports pinned to row centres (FIXED_POS).
  const inList: Record<string, string[]> = {}, outList: Record<string, string[]> = {};
  edges.forEach(e => { (outList[e.source] ??= []).push(e.id); (inList[e.target] ??= []).push(e.id); });
  const heights: Record<string, number> = {}, portsMap: Record<string, any[]> = {};
  tasks.forEach(t => {
    const ins = inList[t.id] ?? [], outs = outList[t.id] ?? [], hH = headerH(t);
    const rowY = (r: number) => hH + r * ROW_H + ROW_H / 2;
    portsMap[t.id] = [
      ...ins.map((eid, r) => ({ id: portT(eid), x: 0, y: rowY(r), layoutOptions: { 'elk.port.side': 'WEST' } })),
      ...outs.map((eid, r) => ({ id: portS(eid), x: NODE_W, y: rowY(r), layoutOptions: { 'elk.port.side': 'EAST' } })),
    ];
    heights[t.id] = hH + Math.max(ins.length, outs.length) * ROW_H + 6;
  });
  const graph = {
    id: 'root',
    layoutOptions: {
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
    },
    children: tasks.map(t => ({
      id: t.id, width: NODE_W, height: heights[t.id],
      layoutOptions: { 'elk.partitioning.partition': String(LAYER_ORDER[t.layer_id] ?? 1), 'elk.portConstraints': 'FIXED_POS' },
      ports: portsMap[t.id],
    })),
    edges: edges.map(e => ({ id: e.id, sources: [portS(e.id)], targets: [portT(e.id)] })),
  };
  const res: any = await elk.layout(graph as any);
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
// I/O chip: a pill outlined in the edge colour, with the port shape as an inline icon.
function IOChip({ h }: { h: PortHandle }) {
  return (
    <span title={h.label} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: 98, minWidth: 0,
      border: `1px solid ${h.color}`, background: `${h.color}22`, color: 'var(--text-main, #e6e9ee)',
      borderRadius: 6, padding: '1px 6px', fontFamily: 'monospace', fontSize: 8.5, lineHeight: 1.5,
    }}>
      <svg width="8" height="8" viewBox="0 0 14 14" style={{ flex: '0 0 auto', overflow: 'visible' }}><path d={h.kind === 'source' ? DIAMOND : TRIANGLE} fill={h.color} /></svg>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</span>
    </span>
  );
}
type BrickData = { task: Task; color: string; opacity: number; selected: boolean; badges: string[]; families: string[]; handles: PortHandle[]; minH: number };
function BrickNode({ data }: NodeProps) {
  const { task, color, opacity, selected, badges, families, handles, minH } = data as unknown as BrickData;
  const { icon: Icon, kind } = kindOf(task);
  const inputs = handles.filter(h => h.kind === 'target').sort((a, b) => a.y - b.y);
  const outputs = handles.filter(h => h.kind === 'source').sort((a, b) => a.y - b.y);
  const rows = Math.max(inputs.length, outputs.length);
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
          <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color, opacity: 0.9 }}>{kind}</span>
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
              <span style={{ minWidth: 0, display: 'flex' }}>{inputs[r] && <IOChip h={inputs[r]} />}</span>
              <span style={{ minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>{outputs[r] && <IOChip h={outputs[r]} />}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
type ZoneData = { label: string; role: string; color: string };
function ZoneNode({ data }: NodeProps) {
  const { label, role, color } = data as unknown as ZoneData;
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 18, border: `1px dashed ${color}55`, background: `${color}0d` }}>
      <div style={{ position: 'absolute', top: 10, left: 16, fontFamily: 'monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color, opacity: 0.85 }}>
        {label} <span style={{ opacity: 0.55, letterSpacing: 0, textTransform: 'none' }}>· {role}</span>
      </div>
    </div>
  );
}
const nodeTypes = { brick: BrickNode, zone: ZoneNode };
const edgeTypes = { elk: ElkEdge };

export function CanvasPage({ height = 'calc(100vh - 60px)' }: { height?: string } = {}) {
  const { isDark, toggle } = useDarkMode();
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [showStores, setShowStores] = useState(true);
  const [layout, setLayout] = useState<{ pos: Pos; pts: EdgePts; handles: Handles; heights: Record<string, number> } | null>(null);

  const tasks = useMemo(() => toposService.getTasks(), []);
  const layers = useMemo(() => toposService.getLayers(), []);
  const examples = useMemo(() => toposService.getExamples(), []);
  const idSet = useMemo(() => new Set(tasks.map(t => t.id)), [tasks]);
  const raw = useMemo(() => rawEdges(tasks, idSet), [tasks, idSet]);

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
    raw.forEach(e => { const l = ioOut(toposService.getTaskById(e.source)); m[portS(e.id)] = l; m[portT(e.id)] = l; });
    return m;
  }, [raw]);

  // run the layout+routing engine once — coords AND edge routes come from ELK.
  useEffect(() => {
    let alive = true;
    computeLayout(tasks, raw).then(l => { if (alive) setLayout(l); }).catch(err => console.error('ELK layout failed', err));
    return () => { alive = false; };
  }, [tasks, raw]);

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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
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
    return tasks.map((t) => {
      const families = t.id === 'det_detectors' ? (t.common_variants ?? []).filter(v => v.includes('×')) : [];
      let opacity = 1;
      if (flowIds && !flowIds.has(t.id)) opacity = 0.18;
      else if (connected && !connected.has(t.id)) opacity = 0.25;
      return {
        id: t.id, type: 'brick', position: pos[t.id] ?? { x: 0, y: 0 },
        data: { task: t, color: layerColor(t.layer_id), opacity, selected: selected?.id === t.id, badges: BADGES[t.id] ?? [], families, minH: heights[t.id] ?? headerH(t) + ROW_H, handles: (handles[t.id] ?? []).map(h => ({ ...h, color: portColor[h.id] ?? layerColor(t.layer_id), label: portLabel[h.id] ?? '' })) },
        zIndex: selected?.id === t.id ? 3 : 1,
      } as Node;
    });
  }, [tasks, flowIds, connected, selected, pos, handles, heights, portColor, portLabel]);

  const nodes = useMemo(() => [...zoneNodes, ...brickNodes], [zoneNodes, brickNodes]);

  const edges: Edge[] = useMemo(() => {
    if (!pos) return [];
    const focusId = selected?.id ?? null;
    const centre = (id: string) => ({ x: pos[id].x + NODE_W / 2, y: pos[id].y + (heights[id] ?? 100) / 2 });
    return raw.map((e) => {
      if (isStoreEdgeType(e.rel.type) && !showStores) return null;
      const color = EDGE_COLOR[e.rel.type] ?? '#8a8f98';
      const isLoop = e.source === 'eff_respond' && e.target === 'det_detectors';
      const isRead = e.rel.type === 'reads_from';
      let dim = false, emph = true;
      if (flowIds) { emph = flowIds.has(e.source) && flowIds.has(e.target); dim = !emph; }
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
  }, [raw, pts, pos, flowIds, connected, selected, showStores, isDark]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'zone') return;
    setSelected(toposService.getTaskById(node.id) ?? null);
  }, []);

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
        nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} colorMode={isDark ? 'dark' : 'light'}
        onNodeClick={onNodeClick} onPaneClick={() => setSelected(null)}
        fitView fitViewOptions={{ padding: 0.1 }} minZoom={0.2} proOptions={{ hideAttribution: true }}
      >
        <Background gap={22} color={isDark ? '#16202e' : '#dfe4ea'} />
        <Controls />
        <MiniMap pannable zoomable nodeColor={(n) => n.type === 'zone' ? 'transparent' : layerColor(toposService.getTaskById(n.id)?.layer_id ?? '')} maskColor={isDark ? 'rgba(10,16,24,0.7)' : 'rgba(230,235,240,0.7)'} />

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
            <div style={{ background: isDark ? 'rgba(11,20,32,.82)' : 'rgba(255,255,255,.9)', border: '1px solid var(--border,#2a3646)', borderRadius: 8, padding: '9px 11px', fontFamily: 'monospace', fontSize: 10.5, lineHeight: 1.5, color: 'var(--text-main,#e6e9ee)' }}>
              <div style={{ opacity: 0.55, marginBottom: 4, letterSpacing: '.08em' }}>СЛОИ</div>
              {layers.map(l => (<div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: l.color, display: 'inline-block' }} />{l.name}</div>))}
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
            </div>
          </Panel>
        )}
      </ReactFlow>

      {selected && <DetailDrawer task={selected} isDark={isDark} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DetailDrawer({ task, isDark, onClose }: { task: Task; isDark: boolean; onClose: () => void }) {
  const { icon: Icon, kind } = kindOf(task);
  const color = layerColor(task.layer_id);
  const layer = toposService.getLayerById(task.layer_id);
  const io = task.io_spec;
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, width: 360, height: '100%', background: isDark ? 'rgba(9,15,23,.96)' : 'rgba(250,251,252,.97)', borderLeft: `1px solid var(--border,#2a3646)`, boxShadow: '-8px 0 24px rgba(0,0,0,.35)', overflowY: 'auto', zIndex: 20, padding: '16px 18px', color: 'var(--text-main,#e6e9ee)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color }}><Icon size={16} /></span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color }}>{kind}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted,#9aa4b2)', cursor: 'pointer' }}><X size={16} /></button>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0 4px' }}>{task.name}</h2>
      <div style={{ display: 'inline-block', fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 5, border: `1px solid ${color}`, color, marginBottom: 10 }}>{layer?.name} · {layer?.role}</div>
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
      {'common_variants' in task && (task as any).common_variants?.length > 0 && (
        <Section title="ВАРИАНТЫ">{(task as any).common_variants.map((v: string) => <Chip key={v} color="#8a8f98">{v}</Chip>)}</Section>
      )}
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
