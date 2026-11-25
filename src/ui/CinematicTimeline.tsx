import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useBiogenesisStore } from '../core/SimulationCore';
import { ACT_DEFINITIONS, TOTAL_TIMELINE_DURATION_SEC } from '../core/TimelineEngine';
import { ActId } from '../types/biogenesis';

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CinematicTimeline() {
  const isPlaying = useBiogenesisStore((s) => s.isPlaying);
  const togglePlay = useBiogenesisStore((s) => s.togglePlay);
  const playbackSpeed = useBiogenesisStore((s) => s.playbackSpeed);
  const setPlaybackSpeed = useBiogenesisStore((s) => s.setPlaybackSpeed);
  const masterTimeSec = useBiogenesisStore((s) => s.masterTimeSec);
  const seekToTime = useBiogenesisStore((s) => s.seekToTime);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const jumpToAct = useBiogenesisStore((s) => s.jumpToAct);

  const activeSubtitlePl = useBiogenesisStore((s) => s.activeSubtitlePl);
  const narrationEnabled = useBiogenesisStore((s) => s.narrationEnabled);
  const setNarrationEnabled = useBiogenesisStore((s) => s.setNarrationEnabled);
  const narrationRegister = useBiogenesisStore((s) => s.narrationRegister);
  const triggerRepeatSegment = useBiogenesisStore((s) => s.triggerRepeatSegment);

  return (
    <footer className="pointer-events-none relative z-30 flex flex-col items-center gap-2 px-4 pb-3">
      {/* Synchronized Polish Subtitles */}
      {activeSubtitlePl && (
        <div className="pointer-events-auto max-w-3xl px-4 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/25 shadow-xl text-center">
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
            {activeSubtitlePl}
          </p>
        </div>
      )}

      {/* Timeline Scrubber & Transport Controls */}
      <div className="pointer-events-auto w-full max-w-5xl bio-panel rounded-2xl px-3.5 py-2 flex flex-col gap-1.5">
        {/* 12-Act Interactive Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="font-mono-tech text-[11px] text-cyan-300 w-11 text-right">
            {formatTime(masterTimeSec)}
          </span>
          <div className="relative flex-1 flex items-center gap-0.5 h-3.5">
            {ACT_DEFINITIONS.map((act) => {
              const dur = act.endTime - act.startTime;
              const isCurr = act.id === currentActId;
              const localFill =
                masterTimeSec <= act.startTime
                  ? 0
                  : masterTimeSec >= act.endTime
                    ? 100
                    : ((masterTimeSec - act.startTime) / dur) * 100;
              return (
                <button
                  key={act.id}
                  onClick={() => jumpToAct(act.id)}
                  title={`Akt ${act.roman}: ${act.title}`}
                  className={`relative h-2 flex-1 rounded-sm overflow-hidden transition-all ${
                    isCurr ? 'h-3 ring-1 ring-cyan-300/80' : 'opacity-75 hover:opacity-100'
                  } bg-slate-800`}
                >
                  <div
                    className="h-full transition-all duration-150"
                    style={{ width: `${localFill}%`, backgroundColor: act.accentColor }}
                  />
                </button>
              );
            })}
            <input
              type="range"
              aria-label="Oś czasu symulacji"
              min={0}
              max={TOTAL_TIMELINE_DURATION_SEC - 0.1}
              step={0.5}
              value={masterTimeSec}
              onChange={(e) => seekToTime(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="font-mono-tech text-[11px] text-slate-400 w-11">
            {formatTime(TOTAL_TIMELINE_DURATION_SEC)}
          </span>
        </div>

        {/* Transport & Narration Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => jumpToAct(Math.max(1, currentActId - 1) as ActId)}
              disabled={currentActId === 1}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-200 disabled:opacity-35 hover:border-cyan-400/50"
              title="Poprzedni akt [←]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/25 border border-cyan-400/60 text-cyan-100 font-semibold hover:bg-cyan-500/35"
              title="Odtwarzaj / Zatrzymaj [Spacja]"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pauza' : 'Odtwarzaj'}</span>
            </button>
            <button
              onClick={() => jumpToAct(Math.min(12, currentActId + 1) as ActId)}
              disabled={currentActId === 12}
              className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-200 disabled:opacity-35 hover:border-cyan-400/50"
              title="Następny akt [→]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 ml-2 bg-slate-950/70 px-1.5 py-0.5 rounded-lg border border-slate-800">
              {[0.5, 1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono-tech ${
                    playbackSpeed === spd ? 'bg-cyan-500/30 text-cyan-100 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden md:inline text-[11px] text-slate-400">
              Lektor: <strong className="text-slate-200">{narrationRegister === 'academic' ? 'Akademicki' : 'Popularnonaukowy'}</strong>
            </span>
            <button
              onClick={triggerRepeatSegment}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 hover:border-cyan-400/50 text-[11px]"
              title="Powtórz bieżący fragment narracji"
            >
              <RotateCcw className="w-3 h-3" /> Powtórz
            </button>
            <button
              onClick={() => setNarrationEnabled(!narrationEnabled)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] ${
                narrationEnabled
                  ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
              title="Włącz/Wyłącz głos lektora"
            >
              {narrationEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>{narrationEnabled ? 'Narracja ON' : 'Narracja OFF'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
