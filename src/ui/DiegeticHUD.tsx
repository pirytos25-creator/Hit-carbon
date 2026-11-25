import { useEffect, useState } from 'react';
import { Eye, Play, Compass, Sliders, GraduationCap, Sparkles } from 'lucide-react';
import { useBiogenesisStore } from '../core/SimulationCore';
import { getActById } from '../core/TimelineEngine';
import { adaptiveMusicEngine } from '../audio/AdaptiveMusicEngine';
import { TopBioBar } from './TopBioBar';
import { SpatialBodyMap } from './SpatialBodyMap';
import { TelemetryConsole } from './TelemetryConsole';
import { CinematicTimeline } from './CinematicTimeline';
import { AcademicDrawer } from './AcademicDrawer';
import { ContextLossBanner } from './ContextLossBanner';
import { EphemeralBioCallout } from './EphemeralBioCallout';
import { ExperienceMode } from '../types/biogenesis';

export function DiegeticHUD() {
  const started = useBiogenesisStore((s) => s.started);
  const startExperience = useBiogenesisStore((s) => s.startExperience);
  const hudHidden = useBiogenesisStore((s) => s.hudHidden);
  const setHudHidden = useBiogenesisStore((s) => s.setHudHidden);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const mode = useBiogenesisStore((s) => s.mode);
  const isPlaying = useBiogenesisStore((s) => s.isPlaying);
  const act = getActById(currentActId);

  const [cinemaControlsVisible, setCinemaControlsVisible] = useState(true);

  useEffect(() => {
    if (!started || mode !== 'cinematic' || !isPlaying) {
      setCinemaControlsVisible(true);
      return;
    }

    let idleTimer: number | undefined;
    const armIdleHide = () => {
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setCinemaControlsVisible(false);
      }, 3000);
    };

    const wakeControls = () => {
      setCinemaControlsVisible(true);
      armIdleHide();
    };

    armIdleHide();
    window.addEventListener('pointermove', wakeControls, { passive: true });
    window.addEventListener('pointerdown', wakeControls, { passive: true });
    window.addEventListener('keydown', wakeControls, { passive: true });

    return () => {
      if (idleTimer !== undefined) window.clearTimeout(idleTimer);
      window.removeEventListener('pointermove', wakeControls);
      window.removeEventListener('pointerdown', wakeControls);
      window.removeEventListener('keydown', wakeControls);
    };
  }, [started, mode, isPlaying]);

  const isCinemaMode = mode === 'cinematic';
  const cinemaAutoHide = isCinemaMode && isPlaying && !cinemaControlsVisible;

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const store = useBiogenesisStore.getState();

      if (e.code === 'Space') {
        e.preventDefault();
        if (!store.started) {
          adaptiveMusicEngine.unlock();
          store.startExperience('cinematic');
        } else {
          store.togglePlay();
        }
      } else if (e.key === 'h' || e.key === 'H') {
        store.setHudHidden(!store.hudHidden);
      } else if (e.key === 'm' || e.key === 'M') {
        store.setAudioVolumes({ masterVolume: store.masterVolume > 0 ? 0 : 0.85 });
      } else if (e.key === 'ArrowRight') {
        store.jumpToAct(Math.min(12, store.currentActId + 1) as any);
      } else if (e.key === 'ArrowLeft') {
        store.jumpToAct(Math.max(1, store.currentActId - 1) as any);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLaunch = (mode: ExperienceMode) => {
    adaptiveMusicEngine.unlock();
    startExperience(mode);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between">
      <ContextLossBanner />

      {/* Welcome / Audio Unlock Overlay */}
      {!started && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-6">
          <div className="bio-panel-strong max-w-2xl w-full rounded-3xl p-7 sm:p-9 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-xs font-mono-tech text-cyan-300">
              INTERAKTYWNA PODRÓŻ NAUKOWO-FILMOWA · 12 AKTÓW · 3D REAL-TIME
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                BIOGENESIS
                <span className="block text-xl sm:text-2xl font-semibold text-cyan-300 mt-1">
                  THE HIIT EXPERIENCE
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
                Wewnętrzny wszechświat ludzkiego organizmu podczas intensywnego wysiłku fizycznego.
                Od kroku na bieżni przez serce, sarkomery i rotor syntazy ATP aż po synapsy i neuroplastyczność mózgu.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleLaunch('cinematic')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-display font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:brightness-110 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                Rozpocznij Podróż (Tryb Filmowy)
              </button>
              <button
                onClick={() => handleLaunch('interactive')}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-600 text-slate-100 font-semibold text-sm hover:border-cyan-400 transition"
              >
                <Sliders className="w-4 h-4 text-cyan-300" />
                Symulator HIIT
              </button>
              <button
                onClick={() => handleLaunch('exploration')}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-600 text-slate-100 font-semibold text-sm hover:border-cyan-400 transition"
              >
                <Compass className="w-4 h-4 text-emerald-300" />
                Eksploracja 3D
              </button>
              <button
                onClick={() => handleLaunch('academic')}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-200 font-semibold text-sm hover:border-emerald-400 transition"
              >
                <GraduationCap className="w-4 h-4" />
                Tryb Akademicki
              </button>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              Skróty: <span className="font-mono-tech text-slate-300">[Spacja]</span> Pauza ·{' '}
              <span className="font-mono-tech text-slate-300">[← / →]</span> Zmiana Aktu ·{' '}
              <span className="font-mono-tech text-slate-300">[H]</span> Ukryj interfejs ·{' '}
              <span className="font-mono-tech text-slate-300">[F]</span> Pełny ekran
            </div>
          </div>
        </div>
      )}

      {/* Restore HUD button when hidden */}
      {started && hudHidden && (
        <button
          onClick={() => setHudHidden(false)}
          className="pointer-events-auto fixed top-4 right-4 z-40 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bio-panel text-xs font-medium text-cyan-200 hover:border-cyan-400"
        >
          <Eye className="w-4 h-4" /> Pokaż interfejs [H]
        </button>
      )}

      {started && !hudHidden && (
        <>
          <TopBioBar cinemaAutoHide={cinemaAutoHide} />
          <div className="flex-1 flex items-start justify-between px-4 py-3 overflow-hidden">
            {!isCinemaMode ? <SpatialBodyMap /> : <div />}
            <div className="flex-1 flex justify-center px-4">
              {!isCinemaMode && act.educationalMagnificationNote && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/75 border border-amber-400/35 text-[10px] text-amber-200 backdrop-blur-md shadow">
                  <Sparkles className="w-3 h-3 shrink-0 text-amber-300" />
                  <span>{act.educationalMagnificationNote}</span>
                </div>
              )}
            </div>
            {!isCinemaMode ? <TelemetryConsole /> : <div />}
          </div>
          <EphemeralBioCallout />
          <CinematicTimeline cinemaAutoHide={cinemaAutoHide} />
          <AcademicDrawer />
        </>
      )}
    </div>
  );
}
