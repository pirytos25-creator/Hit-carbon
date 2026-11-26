// Wspólny moduł animacji (atlas 3D, gabloty narządów, film „12 aktów”).
// Moduł NIE importuje stanu filmu (useBiogenesisStore, liveSimulationRef): odbiorca podaje stan przez BioFrame.
import type { QualityTier } from '../types/biogenesis';

/** Stan jednej klatki podawany modułowi przez odbiorcę (film, gablota, atlas). */
export interface BioFrame {
  /** czas główny odbiorcy w sekundach (film: masterTimeSec; gablota: czas od startu) */
  timeSec: number;
  /** przyrost czasu symulacji w tej klatce (0 przy pauzie, uwzględnia tempo odtwarzania) */
  dtSec: number;
  /** true w klatce, w której nastąpił skok czasu (przewinięcie, start): animacje ustawiają się deterministycznie */
  seeked: boolean;
  playing: boolean;
  /** faza cyklu serca 0..1, całkowana (BioClock): nie skacze przy zmianie tętna */
  beatPhase: number;
  /** faza oddechu 0..1, całkowana */
  breathPhase: number;
  heartRate: number;
  respiratoryRate: number;
  cardiacOutputLpm: number;
  strokeVolumeMl: number;
  quality: QualityTier;
}

export function createBioFrame(): BioFrame {
  return {
    timeSec: 0, dtSec: 0, seeked: true, playing: false, beatPhase: 0, breathPhase: 0,
    heartRate: 60, respiratoryRate: 12, cardiacOutputLpm: 5, strokeVolumeMl: 80, quality: 'Low',
  };
}
