import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useBiogenesisStore } from '../core/SimulationCore';

export function ContextLossBanner() {
  const lost = useBiogenesisStore((s) => s.webglContextLost);
  if (!lost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-6">
      <div className="bio-panel-strong max-w-md rounded-2xl p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Przerwano kontekst graficzny WebGL</h2>
        <p className="text-sm text-slate-300">
          Sterownik GPU chwilowo zresetował kontekst renderowania 3D. Możesz obniżyć poziom jakości do
          „Średniej” lub odświeżyć sesję, aby bezpiecznie przywrócić obraz.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              useBiogenesisStore.getState().setQualityTier('Medium');
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 hover:bg-cyan-500/30 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Przywróć (Jakość Średnia)
          </button>
        </div>
      </div>
    </div>
  );
}
