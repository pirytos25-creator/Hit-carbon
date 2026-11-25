import { Sparkles, Timer } from 'lucide-react';
import { useBiogenesisStore } from '../core/SimulationCore';
import { OrganismState } from '../types/biogenesis';

interface CalloutDef {
  label: string;
  readout: (org: OrganismState) => string;
}

const SEGMENT_CALLOUTS: Record<string, CalloutDef> = {
  'act-01-s01': {
    label: 'Mobilizacja wysiłkowa',
    readout: (o) => `HR ${Math.round(o.heartRate)} bpm · Wentylacja ${o.ventilationLpm.toFixed(0)} L/min`,
  },
  'act-01-s02': {
    label: 'Integracja układów',
    readout: (o) => `Rzut serca ${o.cardiacOutputLpm.toFixed(1)} L/min · Napęd ${Math.round(o.sympatheticDrive * 100)}%`,
  },
  'act-02-s02': {
    label: 'Złącze nerwowo-mięśniowe',
    readout: () => 'ACh → Kanały Na⁺ · Depolaryzacja sarkolemy',
  },
  'act-02-s03': {
    label: 'Układ współczulny',
    readout: (o) => `Noradrenalina / Adrenalina · HR ${Math.round(o.heartRate)} bpm`,
  },
  'act-03-s01': {
    label: 'Przewodzenie SA → Purkinje',
    readout: (o) => `HR ${Math.round(o.heartRate)} bpm · CO ${o.cardiacOutputLpm.toFixed(1)} L/min`,
  },
  'act-03-s02': {
    label: 'Bariera pęcherzykowo-włośniczkowa',
    readout: () => 'Dyfuzja O₂ / CO₂ (~0,5 µm) · Hemoglobina',
  },
  'act-03-s03': {
    label: 'Przepływ tętniczy',
    readout: (o) => `Przepływ mięśniowy ${o.bloodFlowPct.muscle.toFixed(0)}% rzutu`,
  },
  'act-04-s02': {
    label: 'Cykl mostków poprzecznych',
    readout: () => 'Ca²⁺ → Troponina C → Ruch roboczy miozyny S1',
  },
  'act-05-s02': {
    label: 'Łańcuch I–IV · Syntaza ATP F₀F₁',
    readout: (o) => `Rotacja H⁺ · Obrót ATP ~${Math.round(o.atpTurnoverMultiplier)}×`,
  },
  'act-05-s03': {
    label: 'Czółenko mleczanowe',
    readout: (o) => `Mleczan ${o.lactateMmol.toFixed(1)} mmol/L · MCT4 → MCT1`,
  },
  'act-06-s01': {
    label: 'Szczyt interwału HIIT',
    readout: (o) => `HR ${Math.round(o.heartRate)} bpm · Temp. ${o.coreTempC.toFixed(1)} °C`,
  },
  'act-06-s02': {
    label: 'Zmęczenie ośrodkowe i obwodowe',
    readout: (o) => `Napęd centralny ${Math.round((1 - o.centralFatigue) * 100)}% · PCr ${Math.round(o.pcrPct)}%`,
  },
  'act-07-s02': {
    label: 'Bariera krew–mózg (BBB)',
    readout: (o) => `Mleczan ${o.lactateMmol.toFixed(1)} mmol/L → MCT1 · Selekcja`,
  },
  'act-08-s01': {
    label: 'Modulacja monoaminergiczna',
    readout: () => 'VTA (Dopamina) · LC (NA) · Szew (5-HT)',
  },
  'act-08-s02': {
    label: 'Endokannabinoidy i nastrój',
    readout: () => 'Anandamid / 2-AG → Receptor CB1',
  },
  'act-09-s02': {
    label: 'Szczelina synaptyczna (~20 nm)',
    readout: () => 'CaV → SNARE → AMPA / NMDA / GABA_A',
  },
  'act-10-s01': {
    label: 'Kaskady neurotroficzne',
    readout: () => 'Homodimer BDNF ↔ TrkB · MAPK/ERK · PI3K/Akt',
  },
  'act-10-s02': {
    label: 'Plastyczność synaptyczna (LTP)',
    readout: () => 'Usunięcie bloku Mg²⁺ (NMDA) · Przebudowa aktyny',
  },
  'act-11-s01': {
    label: 'Powrót przywspółczulny',
    readout: (o) => `Nerw błędny · Spadek HR → ${Math.round(o.heartRate)} bpm`,
  },
  'act-12-s01': {
    label: 'Adaptacja długofalowa',
    readout: () => 'PGC-1α · Biogeneza mitochondriów · Kapilaryzacja',
  },
};

export function EphemeralBioCallout() {
  const mode = useBiogenesisStore((s) => s.mode);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const actProgress = useBiogenesisStore((s) => s.actProgress);
  const segId = useBiogenesisStore((s) => s.activeNarrationSegmentId);
  const organism = useBiogenesisStore((s) => s.organism);

  if (mode !== 'cinematic') return null;

  const callout = segId ? SEGMENT_CALLOUTS[segId] : undefined;
  const isTimeLapse =
    (currentActId === 10 && actProgress >= 0.45) || currentActId === 12;

  if (!callout && !isTimeLapse) return null;

  return (
    <div className="pointer-events-none fixed top-14 right-4 z-25 flex flex-col items-end gap-1.5">
      {isTimeLapse && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/65 backdrop-blur-md border border-amber-400/35 text-[10px] font-mono-tech tracking-wider text-amber-200 shadow-lg">
          <Timer className="w-3 h-3 text-amber-300" />
          <span>
            {currentActId === 12
              ? 'TIME-LAPSE · TYGODNIE → MIESIĄCE → ROK'
              : 'TIME-LAPSE · PRZEBUDOWA SYNAPTYCZNA'}
          </span>
        </div>
      )}

      {callout && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/65 backdrop-blur-md border border-cyan-400/25 shadow-lg transition-opacity duration-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
          <div className="text-right leading-tight">
            <div className="text-[10px] font-semibold text-cyan-200 uppercase tracking-wider">
              {callout.label}
            </div>
            <div className="text-[11px] font-mono-tech text-slate-200">
              {callout.readout(organism)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
