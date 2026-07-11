/**
 * Topos — canvas-only. Pages/sidebar/marketing removed; the in-canvas detail
 * drawer replaces per-node pages.
 */
import { lazy, Suspense, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { preloadToposData } from './lib/dataLoader';

const CanvasPage = lazy(() => import('./features/topos/components/CanvasPage').then(m => ({ default: m.CanvasPage })));

const LoadingFallback = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted,#888)' }}>
    Loading…
  </div>
);

export default function App() {
  useEffect(() => { preloadToposData(); }, []);
  return (
    <div style={{ height: '100vh' }}>
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          <CanvasPage height="100vh" />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
