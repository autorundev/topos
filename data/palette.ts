import type { NodeNature } from '../types';

export type ThemeMode = 'light' | 'dark';
export type ClusterSlug = 'inbound' | 'internal' | 'outbound';

// Derived + validated via dataviz/scripts/validate_palette.js (light band 0.43–0.77 / dark band
// 0.48–0.67 OKLCH L, CVD floor 8 ΔE, contrast >=3:1) — see docs/superpowers/plans/
// 2026-07-13-topos-blueprint-implementation.md Task 3 for the full derivation record. Do not
// hand-tune a value here without re-running the validator on the full set.
export const NATURE_HEX: Record<ThemeMode, Record<NodeNature, string>> = {
  light: { model: '#b45fd6', code: '#4a90c2', human: '#e0894a' },
  dark:  { model: '#b45fd6', code: '#4a90c2', human: '#c8763d' },
};

export const CLUSTER_HEX: Record<ThemeMode, Record<ClusterSlug, string>> = {
  light: { inbound: '#3b6ea5', internal: '#7a5cc4', outbound: '#42c48a' },
  dark:  { inbound: '#3b6ea5', internal: '#7a5cc4', outbound: '#37a874' },
};

export function natureColorFor(nature: NodeNature, isDark: boolean): string {
  return NATURE_HEX[isDark ? 'dark' : 'light'][nature];
}

export function clusterColorFor(slug: ClusterSlug, isDark: boolean): string {
  return CLUSTER_HEX[isDark ? 'dark' : 'light'][slug];
}
