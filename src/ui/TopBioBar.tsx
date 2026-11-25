import { useState } from 'react';
import {
  BookOpen,
  EyeOff,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Microscope,
} from 'lucide-react';
import { useBiogenesisStore } from '../core/SimulationCore';
import { getActById } from '../core/TimelineEngine';
import { QUALITY_PRESETS } from '../core/QualityManager';
import { ExperienceMode, QualityTier } from '../types/biogenesis';

const MODES: { id: ExperienceMode; label: string }[] = [
  { id: 'cinematic', label: 'Filmowy' },
  { id: 'exploration', label: 'Eksploracja' },
  { id: 'interactive', label: 'Interaktywny' },
  { id: 'academic', label: 'Akademicki' },
  { id: 'popular', label: 'Popularny' },
];

export function TopBioBar({ cinemaAutoHide = false }: { cinemaAutoHide?: boolean }) {
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const mode = useBiogenesisStore((s) => s.mode);
  const setMode = useBiogenesisStore((s) => s.setMode);
  const qualityTier = useBiogenesisStore((s) => s.qualityTier);
  const setQualityTier = useBiogenesisStore((s) => s.setQualityTier);
  const autoAdaptQuality = useBiogenesisStore((s) => s.autoAdaptQuality);
  const setAutoAdaptQuality = useBiogenesisStore((s) => s.setAutoAdaptQuality);
  const academicDrawerOpen = useBiogenesisStore((s) => s.academicDrawerOpen);
  const setAcademicDrawerOpen = useBiogenesisStore((s) => s.setAcademicDrawerOpen);
  const setHudHidden = useBiogenesisStore((s) => s.setHudHidden);

  const masterVolume = useBiogenesisStore((s) => s.masterVolume);
  const musicVolume = useBiogenesisStore((s) => s.musicVolume);
  const narrationVolume = useBiogenesisStore((s) => s.narrationVolume);
  const sfxVolume = useBiogenesisStore((s) => s.sfxVolume);
  const setAudioVolumes = useBiogenesisStore((s) => s.setAudioVolumes);
  const narrationRegister = useBiogenesisStore((s) => s.narrationRegister);
  const setNarrationRegister = useBiogenesisStore((s) => s.setNarrationRegister);

  const [openMenu, setOpenMenu] = useState<'audio' | 'quality' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const act = getActById(currentActId);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <>
      {cinemaAutoHide && (
        <div className="pointer-events-none fixed top-3.5 left-4 z-30 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-lg transition-opacity duration-300">
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-mono-tech font-semibold"
            style={{ backgroundColor: `${act.accentColor}22`, color: act.accentColor }}
          >
            AKT {act.roman}
          </span>
          <span className="font-display text-xs font-medium text-slate-100">{act.title}</span>
          <span className="text-[10px] font-mono-tech text-slate-400">· {act.scaleLabel}</span>
        </div>
      )}

      <header
        className={`relative z-30 flex items-center justify-between gap-2 px-3.5 py-2 bio-panel border-x-0 border-t-0 transition-all duration-300 ${
          cinemaAutoHide ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'
        }`}
      >
      {/* Brand + Active Act & Scale telemetry */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Microscope className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-[11px] font-bold tracking-wider text-cyan-300 uppercase">
              BIOGENESIS · HIIT
            </div>
            <div className="text-[10px] text-slate-400 font-mono-tech">SKALA: {act.scaleLabel}</div>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-700/70 hidden sm:block shrink-0" />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-tech font-semibold shrink-0"
              style={{ backgroundColor: `${act.accentColor}22`, color: act.accentColor, border: `1px solid ${act.accentColor}55` }}
            >
              AKT {act.roman}
            </span>
            <h1 className="font-display text-xs sm:text-sm font-semibold text-slate-100 truncate">
              {act.title}
            </h1>
          </div>
          <p className="text-[10px] text-slate-300 truncate">{act.systemLabel}</p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-0.5 bg-slate-950/70 p-0.5 rounded-lg border border-slate-700/60 shrink-0">
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-cyan-500/25 text-cyan-100 border border-cyan-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Right Utility Controls */}
      <div className="flex items-center gap-1.5 relative shrink-0">

        <button
          onClick={() => setAcademicDrawerOpen(!academicDrawerOpen)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
            academicDrawerOpen
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
              : 'bg-slate-900/70 border-slate-700/70 text-slate-200 hover:border-cyan-400/40'
          }`}
          title="Źródła naukowe, bibliografia PubMed i tryb akademicki"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Nauka i Źródła</span>
        </button>

        <button
          onClick={() => setOpenMenu(openMenu === 'audio' ? null : 'audio')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-slate-900/70 border border-slate-700/70 text-slate-200 hover:border-cyan-400/40"
          title="Ustawienia dźwięku, muzyki i lektora"
        >
          {masterVolume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-300" />}
          <span className="hidden lg:inline">Dźwięk</span>
        </button>

        <button
          onClick={() => setOpenMenu(openMenu === 'quality' ? null : 'quality')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-slate-900/70 border border-slate-700/70 text-slate-200 hover:border-cyan-400/40"
          title="Ustawienia grafiki i wydajności GPU"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-300" />
          <span className="hidden lg:inline">{qualityTier}</span>
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-slate-900/70 border border-slate-700/70 text-slate-200 hover:border-cyan-400/40"
          title="Pełny ekran [F]"
          aria-label="Pełny ekran"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setHudHidden(true)}
          className="p-1.5 rounded-lg bg-slate-900/70 border border-slate-700/70 text-slate-200 hover:border-cyan-400/40"
          title="Ukryj interfejs [H]"
          aria-label="Ukryj interfejs"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </button>

        {/* Audio Popover */}
        {openMenu === 'audio' && (
          <div className="absolute right-0 top-12 w-72 bio-panel-strong rounded-xl p-3.5 space-y-3 z-50">
            <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Miks Audio i Narracja</div>
            <div className="space-y-2 text-xs">
              <label className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-300">
                  <span>Głośność główna</span>
                  <span className="font-mono-tech">{Math.round(masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={masterVolume}
                  onChange={(e) => setAudioVolumes({ masterVolume: parseFloat(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-300">
                  <span>Muzyka filmowa (adaptive)</span>
                  <span className="font-mono-tech">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicVolume}
                  onChange={(e) => setAudioVolumes({ musicVolume: parseFloat(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-300">
                  <span>Lektor polski</span>
                  <span className="font-mono-tech">{Math.round(narrationVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={narrationVolume}
                  onChange={(e) => setAudioVolumes({ narrationVolume: parseFloat(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-300">
                  <span>Efekty biologiczne (SFX)</span>
                  <span className="font-mono-tech">{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={sfxVolume}
                  onChange={(e) => setAudioVolumes({ sfxVolume: parseFloat(e.target.value) })}
                />
              </label>
            </div>
            <div className="pt-2 border-t border-slate-700/70 space-y-1.5">
              <div className="text-[11px] text-slate-400">Rejestr narracji lektora:</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setNarrationRegister('popular')}
                  className={`px-2 py-1 rounded text-[11px] font-medium border ${
                    narrationRegister === 'popular'
                      ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-100'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  Popularnonaukowy (Marek)
                </button>
                <button
                  onClick={() => setNarrationRegister('academic')}
                  className={`px-2 py-1 rounded text-[11px] font-medium border ${
                    narrationRegister === 'academic'
                      ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-100'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  Akademicki (Zofia)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quality Popover */}
        {openMenu === 'quality' && (
          <div className="absolute right-0 top-12 w-64 bio-panel-strong rounded-xl p-3.5 space-y-2.5 z-50">
            <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Jakość Renderera 3D</div>
            <div className="space-y-1">
              {(Object.keys(QUALITY_PRESETS) as QualityTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setQualityTier(tier)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs border transition ${
                    qualityTier === tier
                      ? 'bg-cyan-500/25 border-cyan-400/60 text-cyan-100 font-semibold'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:text-white'
                  }`}
                >
                  {QUALITY_PRESETS[tier].labelPl}
                </button>
              ))}
            </div>
            <label className="flex items-center justify-between pt-2 border-t border-slate-700/70 text-xs text-slate-300">
              <span>Auto-adaptacja (60 FPS)</span>
              <input
                type="checkbox"
                checked={autoAdaptQuality}
                onChange={(e) => setAutoAdaptQuality(e.target.checked)}
              />
            </label>
          </div>
        )}
      </div>
    </header>
    </>
  );
}
