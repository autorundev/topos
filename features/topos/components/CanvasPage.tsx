import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, Panel, Handle,
  type Node, type Edge, type NodeProps, MarkerType, Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  LogIn, Radar, Filter, Layers, BrainCircuit, Wrench, Send,
  Database, Moon, Sun, CircleCheck, Share2, Box, X,
} from 'lucide-react';
import { toposService } from '../../../services/toposService';
import { TOPOS_DATA } from '../../../data';
import { useDarkMode } from '../../../hooks/useDarkMode';
import type { Task, IOItem } from '../../../types';

// Layout: left→right = inbound→outbound. Outbound pushed clear of internal so zones don't overlap.
const POS: Record<string, { x: number; y: number }> = {
  trig_user_message:   { x: 0,    y: -185 },
  trig_connector_sync: { x: 0,    y: 0 },
  trig_cron:           { x: 0,    y: 185 },
  det_detectors:       { x: 350,  y: -10 },
  gate_admission:      { x: 720,  y: 0 },
  starter_recipe:      { x: 1060, y: 0 },
  tool_retrieve:       { x: 1060, y: 210 },
  brain_core:          { x: 1400, y: 0 },
  eff_link_entities:   { x: 1740, y: -195 },
  proc_nightly:        { x: 1740, y: 210 },
  eff_respond:         { x: 2360, y: 0 },
  human_confirm:       { x: 2360, y: 210 },
  store_conversation:  { x: 520,  y: 470 },
  store_focuses:       { x: 870,  y: 470 },
  store_vault:         { x: 1210, y: 470 },
  store_memories:      { x: 1560, y: 470 },
  store_links:         { x: 1900, y: 470 },
};
const NODE_W = 210, NODE_H = 66;

const EDGE_COLOR: Record<string, string> = {
  writes_to: '#59708a', reduces: '#7a5cc4', wakes: '#e6a63c', actuates: '#42c48a',
  precedes: '#3b6ea5', enables: '#3b6ea5', requires_input_from: '#8a8f98',
};
const EDGE_LEGEND = [
  ['writes_to', 'пишет в лог'], ['reduces', 'детектор-reducer'], ['wakes', 'будит ум'],
  ['actuates', 'эффект'], ['enables / precedes', 'поток'], ['requires_input_from', 'тянет'],
] as const;
const BADGES: Record<string, string[]> = {
  trig_user_message: ['always_open'], trig_connector_sync: ['selective'], trig_cron: ['selective', 'clock'],
  gate_admission: ['always_open', 'selective'], starter_recipe: ['budget-bounded', 'dates grounded'],
  tool_retrieve: ['read-only'], brain_core: ['single-brain'], eff_link_entities: ['model-inferred', 'unconfirmed'],
  proc_nightly: ['batch'], eff_respond: ['confirm', 'cost-cap'], human_confirm: ['→ confirmed'],
  store_links: ['provenance', 'confirmed'],
};
const isStore = (id: string) => id.startsWith('store_');
const SIDE_POS: Record<string, Position> = { l: Position.Left, r: Position.Right, t: Position.Top, b: Position.Bottom };

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
const hStyle = (c: string): React.CSSProperties => ({ background: c, border: 'none', width: 6, height: 6, opacity: 0.85 });

// side selection: writes drop into store-top; backward loops under; else by dominant axis.
function sideFor(tid: string, s?: { x: number; y: number }, t?: { x: number; y: number }) {
  if (!s || !t) return { ss: 'r', ts: 'l', back: false };
  if (isStore(tid)) return { ss: 'b', ts: 't', back: false };
  const dx = t.x - s.x, dy = t.y - s.y;
  if (t.x < s.x - 60) return { ss: 'b', ts: dy > 100 ? 't' : 'b', back: true };
  if (Math.abs(dy) > Math.abs(dx) && dy > 60) return { ss: 'b', ts: 't', back: false };
  if (Math.abs(dy) > Math.abs(dx) && dy < -60) return { ss: 't', ts: 'b', back: false };
  return { ss: 'r', ts: 'l', back: false };
}

type EdgeSpec = { id: string; source: string; target: string; rel: any; ss: string; ts: string; back: boolean; sourceHandle?: string; targetHandle?: string };
type HandleSpec = { id: string; kind: 'source' | 'target'; side: string; pct: number };

// Build edges + allocate a distinct port per edge on each node side (no shared ports).
function buildGraph(tasks: Task[], idSet: Set<string>) {
  const raw: EdgeSpec[] = [];
  tasks.forEach((t) => (t.relations ?? []).forEach((r, i) => {
    if (!idSet.has(r.target_id)) return;
    const { ss, ts, back } = sideFor(r.target_id, POS[t.id], POS[r.target_id]);
    raw.push({ id: `${t.id}-${r.target_id}-${i}`, source: t.id, target: r.target_id, rel: r, ss, ts, back });
  }));
  const srcG: Record<string, EdgeSpec[]> = {}, tgtG: Record<string, EdgeSpec[]> = {};
  raw.forEach((e) => { (srcG[`${e.source}|${e.ss}`] ??= []).push(e); (tgtG[`${e.target}|${e.ts}`] ??= []).push(e); });
  const handlesByNode: Record<string, HandleSpec[]> = {};
  const add = (node: string, id: string, kind: 'source' | 'target', side: string, pct: number) => { (handlesByNode[node] ??= []).push({ id, kind, side, pct }); };
  const sortGroup = (list: EdgeSpec[], side: string, other: 'source' | 'target') => {
    if (side === 'l' || side === 'r') list.sort((a, b) => (POS[a[other]]?.y ?? 0) - (POS[b[other]]?.y ?? 0));
    else list.sort((a, b) => (POS[a[other]]?.x ?? 0) - (POS[b[other]]?.x ?? 0));
  };
  Object.entries(srcG).forEach(([key, list]) => {
    const [node, side] = key.split('|'); sortGroup(list, side, 'target');
    list.forEach((e, i) => { const pct = ((i + 1) / (list.length + 1)) * 100; e.sourceHandle = `s-${side}-${i}`; add(node, e.sourceHandle, 'source', side, pct); });
  });
  Object.entries(tgtG).forEach(([key, list]) => {
    const [node, side] = key.split('|'); sortGroup(list, side, 'source');
    list.forEach((e, i) => { const pct = ((i + 1) / (list.length + 1)) * 100; e.targetHandle = `t-${side}-${i}`; add(node, e.targetHandle, 'target', side, pct); });
  });
  return { edgeSpecs: raw, handlesByNode };
}

// ---- custom nodes ----
type BrickData = { task: Task; color: string; opacity: number; selected: boolean; badges: string[]; families: string[]; handles: HandleSpec[] };
function BrickNode({ data }: NodeProps) {
  const { task, color, opacity, selected, badges, families, handles } = data as unknown as BrickData;
  const { icon: Icon, kind } = kindOf(task);
  return (
    <div className="rf-brick" title={task.elevator_pitch} style={{
      width: NODE_W, borderRadius: 11, border: `1.5px solid ${color}`,
      background: `linear-gradient(180deg, ${color}22, ${color}0f), var(--surface, #101826)`,
      color: 'var(--text-main, #e6e9ee)', padding: '8px 11px 9px', opacity, transition: 'opacity .2s, box-shadow .12s, transform .12s',
      boxShadow: selected ? `0 0 0 2px ${color}, 0 6px 18px rgba(0,0,0,.4)` : undefined,
    }}>
      {handles.map((h) => (
        <Handle key={h.id} id={h.id} type={h.kind} position={SIDE_POS[h.side]}
          style={{ ...hStyle(color), ...(h.side === 'l' || h.side === 'r' ? { top: `${h.pct}%` } : { left: `${h.pct}%` }) }} />
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ display: 'inline-flex', color }}><Icon size={13} /></span>
        <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color, opacity: 0.9 }}>{kind}</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.15 }}>{task.name}</div>
      {families.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {families.map(f => {
            const [name, count] = f.split('×');
            return (
              <div key={f} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 9.5, padding: '2px 6px', borderRadius: 5, border: `1px solid ${color}44`, background: `${color}12` }}>
                <span style={{ opacity: 0.9 }}>{name.trim()}</span>
                <span style={{ color, fontWeight: 600 }}>×{count?.trim()}</span>
              </div>
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

export function CanvasPage({ height = 'calc(100vh - 60px)' }: { height?: string } = {}) {
  const { isDark, toggle } = useDarkMode();
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [showStores, setShowStores] = useState(true);

  const tasks = useMemo(() => toposService.getTasks(), []);
  const layers = useMemo(() => toposService.getLayers(), []);
  const examples = useMemo(() => toposService.getExamples(), []);
  const idSet = useMemo(() => new Set(tasks.map(t => t.id)), [tasks]);
  const graph = useMemo(() => buildGraph(tasks, idSet), [tasks, idSet]);

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
    const PAD = 48, TOP = 34;
    return layers.map((layer) => {
      const pts = tasks.filter(t => t.layer_id === layer.id).map(t => POS[t.id]).filter(Boolean) as { x: number; y: number }[];
      if (!pts.length) return null;
      const minX = Math.min(...pts.map(p => p.x)) - PAD;
      const minY = Math.min(...pts.map(p => p.y)) - PAD - TOP;
      const maxX = Math.max(...pts.map(p => p.x)) + NODE_W + PAD;
      const maxY = Math.max(...pts.map(p => p.y)) + NODE_H + PAD;
      return {
        id: `zone_${layer.id}`, type: 'zone', position: { x: minX, y: minY },
        data: { label: layer.name, role: layer.role, color: layer.color },
        style: { width: maxX - minX, height: maxY - minY }, draggable: false, selectable: false, zIndex: -1,
      } as Node;
    }).filter(Boolean) as Node[];
  }, [layers, tasks]);

  const brickNodes: Node[] = useMemo(() => {
    let autoRow = 0;
    return tasks.map((t) => {
      const pos = POS[t.id] ?? { x: 2700, y: (autoRow++) * 90 };
      const families = t.id === 'det_detectors' ? (t.common_variants ?? []).filter(v => v.includes('×')) : [];
      let opacity = 1;
      if (flowIds && !flowIds.has(t.id)) opacity = 0.18;
      else if (connected && !connected.has(t.id)) opacity = 0.25;
      return {
        id: t.id, type: 'brick', position: pos,
        data: { task: t, color: layerColor(t.layer_id), opacity, selected: selected?.id === t.id, badges: BADGES[t.id] ?? [], families, handles: graph.handlesByNode[t.id] ?? [] },
        zIndex: selected?.id === t.id ? 3 : 1,
      } as Node;
    });
  }, [tasks, flowIds, connected, selected, graph]);

  const nodes = useMemo(() => [...zoneNodes, ...brickNodes], [zoneNodes, brickNodes]);

  const edges: Edge[] = useMemo(() => {
    const focusId = selected?.id ?? null;
    return graph.edgeSpecs.map((e) => {
      if (isStore(e.target) && !showStores) return null;
      const color = EDGE_COLOR[e.rel.type] ?? '#8a8f98';
      const isLoop = e.source === 'eff_respond' && e.target === 'det_detectors';
      let dim = false, emph = true;
      if (flowIds) { emph = flowIds.has(e.source) && flowIds.has(e.target); dim = !emph; }
      else if (focusId) { emph = e.source === focusId || e.target === focusId; dim = !emph; }
      const wakesFlow = e.rel.type === 'wakes' || e.rel.type === 'actuates';
      return {
        id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle,
        type: 'smoothstep', pathOptions: { borderRadius: 14, offset: e.back ? 42 : 16 } as any,
        label: isLoop ? '↺ эффект = write' : e.rel.type,
        labelStyle: { fontSize: isLoop ? 10 : 9, fontFamily: 'monospace', fill: isLoop ? '#e6a63c' : color, fontWeight: isLoop ? 700 : 400 },
        labelBgStyle: { fill: isDark ? '#0b1420' : '#f4f6f8', fillOpacity: 0.82 }, labelBgPadding: [4, 2] as [number, number],
        style: {
          stroke: isLoop ? '#e6a63c' : color,
          strokeWidth: (emph && (flowIds || focusId)) ? 2.4 : (isLoop ? 2.2 : (e.rel.strength === 'strong' ? 2 : 1.3)),
          strokeDasharray: e.back ? '7 5' : undefined, opacity: dim ? 0.06 : 0.9,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: isLoop ? '#e6a63c' : color, width: 15, height: 15 },
        animated: isLoop || ((flowIds || focusId) ? (emph && wakesFlow) : false), zIndex: dim ? 0 : 1,
      } as Edge;
    }).filter(Boolean) as Edge[];
  }, [graph, flowIds, connected, selected, showStores, isDark]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'zone') return;
    setSelected(toposService.getTaskById(node.id) ?? null);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height, background: isDark ? '#0a1018' : '#f4f6f8' }}>
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes} colorMode={isDark ? 'dark' : 'light'}
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
            <button onClick={() => setShowStores(s => !s)} style={btn(showStores, isDark)} title="Рёбра записи в vault-сторы">стор-записи</button>
            <button onClick={toggle} style={btn(false, isDark)} title="Тема" aria-label="Тема">{isDark ? <Sun size={13} /> : <Moon size={13} />}</button>
          </div>
        </Panel>

        {!selected && (
          <Panel position="top-right">
            <div style={{ background: isDark ? 'rgba(11,20,32,.82)' : 'rgba(255,255,255,.9)', border: '1px solid var(--border,#2a3646)', borderRadius: 8, padding: '9px 11px', fontFamily: 'monospace', fontSize: 10.5, lineHeight: 1.5, color: 'var(--text-main,#e6e9ee)' }}>
              <div style={{ opacity: 0.55, marginBottom: 4, letterSpacing: '.08em' }}>СЛОИ</div>
              {layers.map(l => (<div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: l.color, display: 'inline-block' }} />{l.name}</div>))}
              <div style={{ opacity: 0.55, margin: '7px 0 4px', letterSpacing: '.08em' }}>СВЯЗИ</div>
              {EDGE_LEGEND.map(([type, ru]) => (<div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 2, background: EDGE_COLOR[type.split(' ')[0]] ?? '#8a8f98', display: 'inline-block' }} /><span style={{ opacity: 0.85 }}>{type}</span><span style={{ opacity: 0.45 }}>{ru}</span></div>))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}><span style={{ width: 14, height: 0, borderTop: '2px dashed #e6a63c', display: 'inline-block' }} /><span style={{ opacity: 0.85, color: '#e6a63c' }}>↺ петля</span></div>
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
