export type ActId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ExperienceMode =
  | 'cinematic'
  | 'exploration'
  | 'interactive'
  | 'academic'
  | 'popular';

export type NarrationRegister = 'popular' | 'academic';

export type QualityTier = 'Low' | 'Medium' | 'High' | 'Ultra' | 'Cinematic';

export type EvidenceLevel =
  | 'established_human'
  | 'probable_human'
  | 'preliminary_human'
  | 'animal_model'
  | 'contested_debate';

export type WorkoutPhaseId =
  | 'rest'
  | 'warmup'
  | 'hiit_peak'
  | 'active_recovery'
  | 'hiit_repeat'
  | 'cooldown';

export type FitnessLevel = 'beginner' | 'recreational' | 'trained';

export type NeurochemicalSystemId =
  | 'dopamine'
  | 'serotonin'
  | 'noradrenaline'
  | 'endorphins'
  | 'endocannabinoids'
  | 'glutamate_gaba';

export type SynapseTypeId =
  | 'glutamatergic'
  | 'gabaergic'
  | 'dopaminergic'
  | 'endocannabinoid_retrograde';

export type BrainRegionId =
  | 'prefrontal_cortex'
  | 'motor_cortex'
  | 'hippocampus'
  | 'hypothalamus'
  | 'brainstem'
  | 'locus_coeruleus'
  | 'raphe_nuclei'
  | 'vta'
  | 'nucleus_accumbens'
  | 'amygdala'
  | 'cerebellum'
  | 'pathways';

export type TemporalHorizon = 'acute' | 'post_exercise' | 'week_2' | 'month_3' | 'year_1';

export type AnatomicalLayerKey =
  | 'skin'
  | 'muscle'
  | 'skeleton'
  | 'vascular'
  | 'respiratory'
  | 'nervous';

export interface HIITProtocolConfig {
  intensityPctVO2max: number; // 35 - 100
  intervalWorkSec: number; // 15 - 120
  intervalRestSec: number; // 15 - 180
  intervalsCount: number; // 1 - 10
  fitnessLevel: FitnessLevel;
}

export interface EnergySystemShares {
  phosphagen: number; // 0 - 100
  glycolytic: number; // 0 - 100
  oxidative: number; // 0 - 100
  // Sum always strictly equals 100
}

export interface BloodFlowDistribution {
  muscle: number;
  heart: number;
  brain: number;
  skin: number;
  visceral: number;
}

export interface SignalingQualitativeState {
  sympatheticCatecholamines: 'bazowy' | 'umiarkowany wzrost' | 'silna mobilizacja' | 'wygaszanie';
  muscleIL6Release: 'spoczynkowy' | 'narastający skurczowy' | 'szczytowy sygnał metaboliczny' | 'powysiłkowy spadek';
  lactateSignaling: 'bazowy (MCT równowaga)' | 'aktywny transfer międzykomórkowy' | 'intensywny shuttle do serca i mózgu' | 'utlenianie i glukoneogeneza';
  centralNeuromodulationNote: string;
}

export interface OrganismState {
  workoutPhase: WorkoutPhaseId;
  workoutLabel: string;
  speedKmh: number;
  strideFrequencyHz: number;
  stridePhase: number; // 0..1
  heartRate: number; // bpm
  beatPhase: number; // 0..1
  strokeVolumeMl: number; // mL
  cardiacOutputLpm: number; // L/min
  respiratoryRate: number; // breaths/min
  breathPhase: number; // 0..1
  ventilationLpm: number; // L/min
  vo2Lpm: number;
  vo2PctMax: number;
  epocDebtL: number;
  energyShares: EnergySystemShares;
  atpTurnoverMultiplier: number; // 1x..1000x local peak
  pcrPct: number; // 15..100%
  atpBufferPct: number; // 82..100% (homeostatically buffered!)
  lactateMmol: number; // 0.9..14.0 mmol/L
  lactateShuttleRate: number; // 0..1
  musclePh: number; // 6.65..7.06
  coreTempC: number; // 37.0..38.9
  sweatRateLph: number; // 0..1.8 L/h
  sympatheticDrive: number; // 0..1
  parasympatheticTone: number; // 0..1
  peripheralFatigue: number; // 0..1
  centralFatigue: number; // 0..1
  bloodFlowPct: BloodFlowDistribution;
  signaling: SignalingQualitativeState;
}

export interface ActDefinition {
  id: ActId;
  roman: string;
  title: string;
  subtitle: string;
  systemLabel: string;
  scaleLabel: string;
  scaleExponent: number; // 0 (1m) to -9 (1nm)
  startTime: number;
  endTime: number;
  musicMotif:
    | 'awakening'
    | 'mobilization'
    | 'bloodstream'
    | 'muscle_machinery'
    | 'mitochondria'
    | 'hiit_peak'
    | 'brain'
    | 'neuroplasticity'
    | 'recovery';
  accentColor: string;
  educationalMagnificationNote?: string;
}

export interface ScientificReference {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  url?: string;
  acts: ActId[];
  summaryPl: string;
}

export interface ScientificClaim {
  id: string;
  actId: ActId;
  titlePl: string;
  popularSummaryPl: string;
  academicDetailPl: string;
  evidenceLevel: EvidenceLevel;
  mythCorrectionPl?: string;
  limitationsPl: string;
  referenceIds: string[];
}

export interface NarrationSegment {
  id: string;
  actId: ActId;
  startSec: number;
  endSec: number;
  popularDisplayPl: string;
  popularTtsPl: string;
  academicDisplayPl: string;
  academicTtsPl: string;
}

export interface PerformanceMetricsSnapshot {
  fps: number;
  frameTimeMsP50: number;
  frameTimeMsP95: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  webglContextAlive: boolean;
  audioUnlocked: boolean;
  narrationManifestLoaded: boolean;
  activeQuality: QualityTier;
}
