import { Activity, Flame, Gauge, HeartPulse, Info, Sliders } from 'lucide-react';
import { useBiogenesisStore } from '../core/SimulationCore';
import { FitnessLevel, WorkoutPhaseId } from '../types/biogenesis';

const WORKOUT_PHASES: { id: WorkoutPhaseId | 'auto'; label: string }[] = [
  { id: 'auto', label: 'Automatyczny cykl HIIT' },
  { id: 'rest', label: '1. Spoczynek' },
  { id: 'warmup', label: '2. Rozgrzewka' },
  { id: 'hiit_peak', label: '3. Intensywny interwał' },
  { id: 'active_recovery', label: '4. Aktywny odpoczynek' },
  { id: 'hiit_repeat', label: '5. Kolejny interwał' },
  { id: 'cooldown', label: '6. Zakończenie treningu' },
];

export function TelemetryConsole() {
  const org = useBiogenesisStore((s) => s.organism);
  const mode = useBiogenesisStore((s) => s.mode);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const hiitConfig = useBiogenesisStore((s) => s.hiitConfig);
  const updateHiitConfig = useBiogenesisStore((s) => s.updateHiitConfig);
  const manualWorkoutPhase = useBiogenesisStore((s) => s.manualWorkoutPhase);
  const setManualWorkoutPhase = useBiogenesisStore((s) => s.setManualWorkoutPhase);
  const setMode = useBiogenesisStore((s) => s.setMode);

  const showInteractiveSliders = mode === 'interactive' || currentActId === 6;

  return (
    <aside className="pointer-events-auto w-[308px] max-h-[calc(100vh-148px)] flex flex-col gap-2.5 overflow-y-auto bio-scroll pl-1">
      {/* Primary Cardiovascular & Respiratory Telemetry */}
      <div className="bio-panel rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-300">
            <HeartPulse className="w-3.5 h-3.5" /> Fizjologia (Model Edukacyjny)
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono-tech">
            {org.speedKmh.toFixed(1)} km/h
          </span>
        </div>

        <div className="text-[11px] font-medium text-slate-200 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
          Faza: <span className="text-cyan-300">{org.workoutLabel}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-1.5">
            <div className="text-[10px] text-slate-400">Tętno</div>
            <div className="font-mono-tech text-sm font-bold text-rose-300">{org.heartRate}</div>
            <div className="text-[9px] text-slate-500">ud./min</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-1.5">
            <div className="text-[10px] text-slate-400">Rzut serca</div>
            <div className="font-mono-tech text-sm font-bold text-cyan-300">{org.cardiacOutputLpm}</div>
            <div className="text-[9px] text-slate-500">l/min (SV {org.strokeVolumeMl})</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-1.5">
            <div className="text-[10px] text-slate-400">Wentylacja</div>
            <div className="font-mono-tech text-sm font-bold text-sky-300">{org.ventilationLpm}</div>
            <div className="text-[9px] text-slate-500">l/min ({org.vo2PctMax}% VO₂)</div>
          </div>
        </div>

        {/* Energy Systems Stacked Bar (strictly summing to 100%) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-300">
            <span className="inline-flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Systemy energetyczne (współpraca)
            </span>
            <span className="font-mono-tech text-amber-300">ATP ×{org.atpTurnoverMultiplier}</span>
          </div>
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-900 border border-slate-700/70">
            <div
              style={{ width: `${org.energyShares.phosphagen}%` }}
              className="bg-amber-400 transition-all duration-150"
              title={`Fosfagen (PCr): ${org.energyShares.phosphagen}%`}
            />
            <div
              style={{ width: `${org.energyShares.glycolytic}%` }}
              className="bg-purple-500 transition-all duration-150"
              title={`Glikoliza: ${org.energyShares.glycolytic}%`}
            />
            <div
              style={{ width: `${org.energyShares.oxidative}%` }}
              className="bg-cyan-400 transition-all duration-150"
              title={`Oddychanie tlenowe: ${org.energyShares.oxidative}%`}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono-tech text-slate-300">
            <span className="text-amber-300">PCr {org.energyShares.phosphagen}%</span>
            <span className="text-purple-300">Glik. {org.energyShares.glycolytic}%</span>
            <span className="text-cyan-300">Tlen {org.energyShares.oxidative}%</span>
          </div>
        </div>

        {/* Metabolic & Thermoregulatory Gauges */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 flex justify-between">
            <span className="text-slate-400">Zasób PCr</span>
            <span className="font-mono-tech text-amber-200">{org.pcrPct}%</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 flex justify-between" title="Stężenie ATP jest ściśle buforowane przeciw rygorowi">
            <span className="text-slate-400">Bufor ATP</span>
            <span className="font-mono-tech text-emerald-300">{org.atpBufferPct}%</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 flex justify-between">
            <span className="text-slate-400">Mleczan</span>
            <span className="font-mono-tech text-purple-300">{org.lactateMmol} mmol/l</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1 flex justify-between">
            <span className="text-slate-400">Temp. głęb.</span>
            <span className="font-mono-tech text-orange-300">{org.coreTempC.toFixed(1)} °C</span>
          </div>
        </div>

        {/* Blood Flow Redistribution */}
        <div className="space-y-1">
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-rose-400" /> Redystrybucja rzutu serca (%)
          </div>
          <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono-tech">
            <div className="bg-rose-500/15 border border-rose-500/30 rounded py-0.5 text-rose-200">
              Mięśnie {org.bloodFlowPct.muscle}%
            </div>
            <div className="bg-amber-500/15 border border-amber-500/30 rounded py-0.5 text-amber-200">
              Skóra {org.bloodFlowPct.skin}%
            </div>
            <div className="bg-sky-500/15 border border-sky-500/30 rounded py-0.5 text-sky-200">
              Mózg {org.bloodFlowPct.brain}%
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded py-0.5 text-slate-300">
              Trzewia {org.bloodFlowPct.visceral}%
            </div>
          </div>
        </div>
      </div>

      {/* Interactive HIIT Protocol Controls */}
      <div className="bio-panel rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
            <Sliders className="w-3.5 h-3.5" /> Sterowanie HIIT
          </span>
          {!showInteractiveSliders && (
            <button
              onClick={() => setMode('interactive')}
              className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-200"
            >
              Tryb Interaktywny
            </button>
          )}
        </div>

        <div className="space-y-2 text-[11px]">
          <label className="block">
            <div className="flex justify-between text-slate-300">
              <span>Docelowa intensywność (% VO₂max)</span>
              <span className="font-mono-tech text-cyan-300">{hiitConfig.intensityPctVO2max}%</span>
            </div>
            <input
              type="range"
              min={35}
              max={100}
              step={1}
              value={hiitConfig.intensityPctVO2max}
              onChange={(e) => updateHiitConfig({ intensityPctVO2max: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </label>

          {showInteractiveSliders && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="flex justify-between text-slate-300">
                    <span>Interwał (s)</span>
                    <span className="font-mono-tech">{hiitConfig.intervalWorkSec}s</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={120}
                    step={5}
                    value={hiitConfig.intervalWorkSec}
                    onChange={(e) => updateHiitConfig({ intervalWorkSec: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </label>
                <label className="block">
                  <div className="flex justify-between text-slate-300">
                    <span>Odpoczynek</span>
                    <span className="font-mono-tech">{hiitConfig.intervalRestSec}s</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={180}
                    step={5}
                    value={hiitConfig.intervalRestSec}
                    onChange={(e) => updateHiitConfig({ intervalRestSec: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <div className="flex justify-between text-slate-300">
                    <span>Liczba serii</span>
                    <span className="font-mono-tech">{hiitConfig.intervalsCount}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={hiitConfig.intervalsCount}
                    onChange={(e) => updateHiitConfig({ intervalsCount: parseInt(e.target.value, 10) })}
                    className="w-full"
                  />
                </label>

                <label className="block">
                  <div className="text-slate-300 mb-0.5">Wytrenowanie</div>
                  <select
                    value={hiitConfig.fitnessLevel}
                    onChange={(e) => updateHiitConfig({ fitnessLevel: e.target.value as FitnessLevel })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-[11px] text-slate-200"
                  >
                    <option value="beginner">Początkujący</option>
                    <option value="recreational">Rekreacyjny</option>
                    <option value="trained">Wytrenowany</option>
                  </select>
                </label>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-300" /> Faza wysiłku (6 stanów)
                </div>
                <select
                  value={manualWorkoutPhase}
                  onChange={(e) => {
                    if (mode !== 'interactive') setMode('interactive');
                    setManualWorkoutPhase(e.target.value as WorkoutPhaseId | 'auto');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                >
                  {WORKOUT_PHASES.map((wp) => (
                    <option key={wp.id} value={wp.id}>
                      {wp.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Qualitative signaling & explicit educational disclaimer */}
        <div className="pt-2 border-t border-slate-800/90 space-y-1 text-[10px] text-slate-400 leading-snug">
          <div>
            Współczulność: <span className="text-amber-300">{org.signaling.sympatheticCatecholamines}</span> · Szlak mleczanu:{' '}
            <span className="text-purple-300">{org.signaling.lactateSignaling}</span>
          </div>
          <div className="flex items-start gap-1 text-slate-400/90">
            <Info className="w-3 h-3 shrink-0 mt-0.5 text-cyan-400" />
            <span>
              Model poglądowo-edukacyjny. Nie diagnozuje użytkownika i nie wylicza liczbowych stężeń neuroprzekaźników OUN.
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
