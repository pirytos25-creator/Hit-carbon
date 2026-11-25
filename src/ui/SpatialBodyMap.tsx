import { Layers, Navigation, Brain, Activity, Play, Pause, RotateCw } from 'lucide-react';
import { useBiogenesisStore } from '../core/SimulationCore';
import { ACT_DEFINITIONS } from '../core/TimelineEngine';
import {
  AnatomicalLayerKey,
  BrainRegionId,
  NeurochemicalSystemId,
  SynapseTypeId,
  TemporalHorizon,
} from '../types/biogenesis';

const LAYER_LABELS: { key: AnatomicalLayerKey; label: string }[] = [
  { key: 'skin', label: 'Skóra' },
  { key: 'muscle', label: 'Mięśnie' },
  { key: 'skeleton', label: 'Kościec' },
  { key: 'vascular', label: 'Krążenie' },
  { key: 'respiratory', label: 'Płuca' },
  { key: 'nervous', label: 'Nerwy' },
];

const NEURO_SYSTEMS: { id: NeurochemicalSystemId; label: string; color: string }[] = [
  { id: 'dopamine', label: 'Dopamina (VTA / NAcc)', color: '#f59e0b' },
  { id: 'serotonin', label: 'Serotonina (Jądra szwu)', color: '#38bdf8' },
  { id: 'noradrenaline', label: 'Noradrenalina (Miejsce sinawe)', color: '#22d3ee' },
  { id: 'endorphins', label: 'Endorfiny (Opioidy endog.)', color: '#f43f5e' },
  { id: 'endocannabinoids', label: 'Endokannabinoidy (AEA / 2-AG)', color: '#10b981' },
  { id: 'glutamate_gaba', label: 'Glutaminian i GABA', color: '#a78bfa' },
];

const BRAIN_REGIONS: { id: BrainRegionId; label: string }[] = [
  { id: 'prefrontal_cortex', label: 'Kora przedczołowa' },
  { id: 'motor_cortex', label: 'Kora ruchowa' },
  { id: 'hippocampus', label: 'Hipokamp' },
  { id: 'hypothalamus', label: 'Podwzgórze' },
  { id: 'brainstem', label: 'Pień mózgu' },
  { id: 'locus_coeruleus', label: 'Miejsce sinawe' },
  { id: 'raphe_nuclei', label: 'Jądra szwu' },
  { id: 'vta', label: 'Pole brzuszne nakrywki' },
  { id: 'nucleus_accumbens', label: 'Jądro półleżące' },
  { id: 'amygdala', label: 'Ciało migdałowate' },
  { id: 'cerebellum', label: 'Móżdżek' },
];

const SYNAPSE_TYPES: { id: SynapseTypeId; label: string; desc: string }[] = [
  { id: 'glutamatergic', label: 'Glutaminergiczna (AMPA/NMDA)', desc: 'Pobudzenie: szybki napływ Na⁺ + bramkowanie Mg²⁺/Ca²⁺' },
  { id: 'gabaergic', label: 'GABA-ergiczna (GABA_A)', desc: 'Hamowanie: napływ Cl⁻ stabilizujący błonę' },
  { id: 'dopaminergic', label: 'Dopaminergiczna (GPCR D₁/D₂)', desc: 'Modulacja wolna: dysocjacja białka G i kaskada cAMP' },
  { id: 'endocannabinoid_retrograde', label: 'Wsteczna (2-AG → CB1)', desc: 'Sygnał wraca wstecz ze szczeliny, hamując kanały CaV' },
];

const SARCOMERE_STAGE_NAMES = [
  '1. Napływ Ca²⁺ → troponina → odsłonięcie aktyny',
  '2. Ruch roboczy miozyny (Power Stroke) i przesuw',
  '3. Nowe ATP → odłączenie główki (brak ATP = rygor)',
  '4. Hydroliza ATP → ADP + Pi i napięcie główki',
];

const SYNAPSE_STAGE_NAMES = [
  '1. Powstanie potencjału czynnościowego',
  '2. Przewodzenie skokowe (przewężenia Ranviera)',
  '3. Otwarcie kanałów CaV i napływ Ca²⁺',
  '4. Fuzja pęcherzyków (kompleks SNARE)',
  '5. Egzocytoza neuroprzekaźnika',
  '6. Dyfuzja przez szczelinę (~20 nm)',
  '7. Wiązanie z receptorami błonowymi',
  '8. Odpowiedź postsynaptyczna (lub wsteczna CB1)',
  '9. Zakończenie sygnału (wychwyt zwrotny / enzymy)',
];

const TEMPORAL_OPTIONS: { id: TemporalHorizon; label: string; sub: string }[] = [
  { id: 'acute', label: 'Ostre (minuty)', sub: 'Tachykardia, kinazy AMPK/CaMKII' },
  { id: 'post_exercise', label: 'Powysiłkowe (2–48h)', sub: 'EPOC, mRNA PGC-1α, GLUT4' },
  { id: 'week_2', label: '2 Tygodnie', sub: 'Wzrost enzymów oksydacyjnych' },
  { id: 'month_3', label: '3 Miesiące', sub: 'Biogeneza mitochondriów, kapilaryzacja' },
  { id: 'year_1', label: '1 Rok', sub: 'Remodeling serca i objętość hipokampa' },
];

export function SpatialBodyMap() {
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const jumpToAct = useBiogenesisStore((s) => s.jumpToAct);
  const anatomicalLayers = useBiogenesisStore((s) => s.anatomicalLayers);
  const toggleAnatomicalLayer = useBiogenesisStore((s) => s.toggleAnatomicalLayer);
  const skinOpacityOverride = useBiogenesisStore((s) => s.skinOpacityOverride);
  const setSkinOpacityOverride = useBiogenesisStore((s) => s.setSkinOpacityOverride);

  const followErythrocyteCam = useBiogenesisStore((s) => s.followErythrocyteCam);
  const setFollowErythrocyteCam = useBiogenesisStore((s) => s.setFollowErythrocyteCam);

  const sarcomerePaused = useBiogenesisStore((s) => s.sarcomerePaused);
  const sarcomereSpeed = useBiogenesisStore((s) => s.sarcomereSpeed);
  const sarcomereStage = useBiogenesisStore((s) => s.sarcomereStage);
  const sarcomereShowAnnotations = useBiogenesisStore((s) => s.sarcomereShowAnnotations);
  const setSarcomereControls = useBiogenesisStore((s) => s.setSarcomereControls);

  const mitoTechnicalMode = useBiogenesisStore((s) => s.mitoTechnicalMode);
  const setMitoTechnicalMode = useBiogenesisStore((s) => s.setMitoTechnicalMode);

  const activeNeuroSystem = useBiogenesisStore((s) => s.activeNeuroSystem);
  const setActiveNeuroSystem = useBiogenesisStore((s) => s.setActiveNeuroSystem);
  const selectedBrainRegion = useBiogenesisStore((s) => s.selectedBrainRegion);
  const setSelectedBrainRegion = useBiogenesisStore((s) => s.setSelectedBrainRegion);

  const synapsePaused = useBiogenesisStore((s) => s.synapsePaused);
  const synapseType = useBiogenesisStore((s) => s.synapseType);
  const synapseStage = useBiogenesisStore((s) => s.synapseStage);
  const setSynapseControls = useBiogenesisStore((s) => s.setSynapseControls);

  const act10SubView = useBiogenesisStore((s) => s.act10SubView);
  const setAct10SubView = useBiogenesisStore((s) => s.setAct10SubView);

  const temporalHorizon = useBiogenesisStore((s) => s.temporalHorizon);
  const setTemporalHorizon = useBiogenesisStore((s) => s.setTemporalHorizon);

  return (
    <aside className="pointer-events-auto w-72 max-h-[calc(100vh-148px)] flex flex-col gap-2.5 overflow-y-auto bio-scroll pr-1">
      {/* Spatial Body Map & Act Selector */}
      <div className="bio-panel rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
            <Navigation className="w-3.5 h-3.5" /> Mapa Podróży (Akty I–XII)
          </span>
        </div>

        {/* Diegetic Anatomical Mini-Map SVG */}
        <div className="flex items-center gap-3 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
          <svg viewBox="0 0 80 120" className="w-16 h-24 shrink-0" aria-hidden="true">
            <ellipse cx="40" cy="18" rx="10" ry="12" fill={currentActId >= 7 && currentActId <= 10 ? '#22d3ee55' : '#1e293b'} stroke="#38bdf8" strokeWidth="1.2" />
            <path d="M25 34 Q40 30 55 34 L52 68 L28 68 Z" fill={currentActId === 3 ? '#fb718544' : '#1e293b'} stroke="#475569" strokeWidth="1.2" />
            <path d="M28 70 L25 112 M52 70 L55 112" stroke={currentActId >= 4 && currentActId <= 6 ? '#f97316' : '#475569'} strokeWidth="5" strokeLinecap="round" />
            {/* Clickable anatomical hotspots */}
            <circle cx="40" cy="16" r="5" fill={currentActId >= 8 && currentActId <= 10 ? '#fbbf24' : '#38bdf8'} className="cursor-pointer" onClick={() => jumpToAct(8)} />
            <circle cx="43" cy="46" r="5" fill={currentActId === 3 ? '#fb7185' : '#e11d48'} className="cursor-pointer" onClick={() => jumpToAct(3)} />
            <circle cx="53" cy="86" r="5" fill={currentActId === 4 || currentActId === 5 ? '#f97316' : '#fb923c'} className="cursor-pointer" onClick={() => jumpToAct(4)} />
          </svg>
          <div className="grid grid-cols-3 gap-1 flex-1">
            {ACT_DEFINITIONS.map((a) => {
              const active = a.id === currentActId;
              return (
                <button
                  key={a.id}
                  onClick={() => jumpToAct(a.id)}
                  title={`${a.roman}. ${a.title}`}
                  className={`py-1 rounded text-[11px] font-mono-tech font-semibold border transition ${
                    active
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600'
                  }`}
                >
                  {a.roman}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Anatomical Layers (Acts I, VI, XI) */}
      {(currentActId === 1 || currentActId === 6 || currentActId === 11) && (
        <div className="bio-panel rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
            <Layers className="w-3.5 h-3.5" /> Warstwy Anatomiczne
          </div>
          <div className="grid grid-cols-3 gap-1">
            {LAYER_LABELS.map((l) => (
              <button
                key={l.key}
                onClick={() => toggleAnatomicalLayer(l.key)}
                className={`px-1.5 py-1 rounded text-[11px] border transition ${
                  anatomicalLayers[l.key]
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-100'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <label className="block text-[11px] text-slate-300 space-y-1 pt-1">
            <div className="flex justify-between">
              <span>Przezroczystość skóry</span>
              <button
                onClick={() => setSkinOpacityOverride(skinOpacityOverride === null ? 0.25 : null)}
                className="text-cyan-400 hover:underline text-[10px]"
              >
                {skinOpacityOverride === null ? 'Auto (reżyseria)' : 'Resetuj Auto'}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={skinOpacityOverride ?? 0.5}
              onChange={(e) => setSkinOpacityOverride(parseFloat(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      )}

      {/* Act III: Erythrocyte Follow Camera */}
      {currentActId === 3 && (
        <div className="bio-panel rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Lot z Krwinką Czerwoną
          </div>
          <button
            onClick={() => setFollowErythrocyteCam(!followErythrocyteCam)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition ${
              followErythrocyteCam
                ? 'bg-rose-500/30 border-rose-400 text-rose-100'
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-rose-400/50'
            }`}
          >
            {followErythrocyteCam ? 'Wyłącz kamerę erytrocytu' : 'Śledź drogę erytrocytu (Kamera)'}
          </button>
        </div>
      )}

      {/* Act IV: Interactive Sarcomere Laboratory */}
      {currentActId === 4 && (
        <div className="bio-panel rounded-xl p-3 space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
            Laboratorium Sarkomeru
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSarcomereControls({ sarcomerePaused: !sarcomerePaused })}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-100 text-xs font-medium"
            >
              {sarcomerePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {sarcomerePaused ? 'Wznów cykl' : 'Zatrzymaj'}
            </button>
            <button
              onClick={() => setSarcomereControls({ sarcomereShowAnnotations: !sarcomereShowAnnotations })}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              {sarcomereShowAnnotations ? 'Ukryj opisy' : 'Opisy 3D'}
            </button>
          </div>
          <label className="block text-[11px] text-slate-300">
            <div className="flex justify-between">
              <span>Szybkość cyklu</span>
              <span className="font-mono-tech">{sarcomereSpeed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.5}
              step={0.05}
              value={sarcomereSpeed}
              onChange={(e) => setSarcomereControls({ sarcomereSpeed: parseFloat(e.target.value) })}
              className="w-full"
            />
          </label>
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Etapy cyklu mostków poprzecznych:</div>
            {SARCOMERE_STAGE_NAMES.map((name, i) => (
              <button
                key={i}
                onClick={() => setSarcomereControls({ sarcomerePaused: true, sarcomereStage: i })}
                className={`w-full text-left px-2 py-1 rounded text-[11px] border ${
                  sarcomerePaused && sarcomereStage === i
                    ? 'bg-amber-500/25 border-amber-400 text-amber-100'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Act V: Mitochondrion Mode Toggle */}
      {currentActId === 5 && (
        <div className="bio-panel rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
            Wizualizacja Mitochondrium
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setMitoTechnicalMode(false)}
              className={`py-1.5 rounded text-xs border ${
                !mitoTechnicalMode
                  ? 'bg-purple-500/25 border-purple-400 text-purple-100 font-medium'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              Tryb filmowy
            </button>
            <button
              onClick={() => setMitoTechnicalMode(true)}
              className={`py-1.5 rounded text-xs border ${
                mitoTechnicalMode
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-100 font-medium'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              Molekularny
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Symbolika ATP i gradientu H⁺ ilustruje przepływ ~3–4 protonów na 1 obrót podjednostki katalitycznej.
          </p>
        </div>
      )}

      {/* Act VIII: Neurochemical Switchboard + 12 Brain Structures */}
      {currentActId === 8 && (
        <div className="bio-panel rounded-xl p-3 space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Układy Neurochemiczne
          </div>
          <div className="space-y-1">
            {NEURO_SYSTEMS.map((ns) => (
              <button
                key={ns.id}
                onClick={() => setActiveNeuroSystem(ns.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-left border transition ${
                  activeNeuroSystem === ns.id
                    ? 'bg-slate-800/90 border-cyan-400/70 text-white font-medium'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ns.color }} />
                <span className="truncate">{ns.label}</span>
              </button>
            ))}
          </div>
          <div className="pt-1 border-t border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase">Podświetl strukturę anatomiczną:</div>
            <select
              value={selectedBrainRegion ?? ''}
              onChange={(e) => setSelectedBrainRegion((e.target.value || null) as BrainRegionId | null)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
            >
              <option value="">Wszystkie wg szlaku</option>
              {BRAIN_REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Act IX: Synapse Stepper & 4 Receptor Types */}
      {currentActId === 9 && (
        <div className="bio-panel rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              Laboratorium Synapsy
            </span>
            <button
              onClick={() => setSynapseControls({ synapsePaused: !synapsePaused })}
              className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 text-[11px]"
            >
              {synapsePaused ? 'Wznów czas' : 'Zamróź czas'}
            </button>
          </div>
          <div className="space-y-1">
            {SYNAPSE_TYPES.map((st) => (
              <button
                key={st.id}
                onClick={() => setSynapseControls({ synapseType: st.id })}
                className={`w-full text-left px-2 py-1.5 rounded-lg border text-[11px] ${
                  synapseType === st.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold">{st.label}</div>
                <div className="text-[10px] text-slate-400">{st.desc}</div>
              </button>
            ))}
          </div>
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Krok transmisji (1–9):</div>
            <select
              value={synapseStage}
              onChange={(e) => setSynapseControls({ synapsePaused: true, synapseStage: parseInt(e.target.value, 10) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200"
            >
              {SYNAPSE_STAGE_NAMES.map((sName, idx) => (
                <option key={idx} value={idx}>
                  {sName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Act X: BDNF / LTP / Hippocampus Sub-Views */}
      {currentActId === 10 && (
        <div className="bio-panel rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
            Warstwa Neuroplastyczności
          </div>
          <div className="space-y-1">
            {[
              { id: 'bdnf_trkb', label: '1. BDNF ↔ TrkB (MAPK / PI3K / PLCγ)' },
              { id: 'ltp_spine', label: '2. LTP: NMDA, AMPA i rozrost kolca' },
              { id: 'hippocampus_pfc', label: '3. Hipokamp (DG–CA3–CA1) i PFC' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setAct10SubView(v.id as 'bdnf_trkb' | 'ltp_spine' | 'hippocampus_pfc')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] border ${
                  act10SubView === v.id
                    ? 'bg-amber-500/25 border-amber-400 text-amber-100 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Act XII: Week, Month, Year Adaptation Scrubber */}
      {currentActId === 12 && (
        <div className="bio-panel rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5" /> Horyzont Czasowy Adaptacji
          </div>
          <div className="space-y-1">
            {TEMPORAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTemporalHorizon(opt.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] ${
                  temporalHorizon === opt.id
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold">{opt.label}</div>
                <div className="text-[10px] text-slate-400">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
