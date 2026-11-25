import type { EvidenceLevel } from '../types/biogenesis';

/** Identyfikatory plansz. Każdy agent fazy 1 pracuje na jednym z nich (zob. docs/ATLAS_STYLE_BIBLE.md). */
export type AtlasSystemId = 'nerwowy' | 'miesniowy' | 'mozg' | 'oddechowy' | 'krwionosny' | 'calosc';
export type AtlasState = 'rest' | 'sprint';
export type AtlasView = 'front' | 'back' | 'side' | 'detail';

/** Treść podpisu. `anchor` musi istnieć w public/atlas/<id>/anchors.json dla danego widoku. */
export interface AtlasLabel {
  anchor: string;
  view: AtlasView;
  namePl: string;
  nameLat?: string;
  /** Krótko: co ta struktura robi w danym stanie (max ok. 60 znaków). */
  role: Record<AtlasState, string>;
  tier?: 'primary' | 'secondary';
}

/** Liczba w parze spoczynek → sprint. Każda musi mieć źródło. */
export interface AtlasMetric {
  labelPl: string;
  rest: string;
  sprint: string;
  unit?: string;
  referenceIds: string[];
  evidenceLevel: EvidenceLevel;
  notePl?: string;
}

/** Strzałka przepływu w SVG (krew, powietrze, impuls). Punkty w pikselach renderu danego widoku. */
export interface AtlasFlow {
  view: AtlasView;
  points: [number, number][];
  kind: 'artery' | 'vein' | 'air' | 'nerve' | 'brain' | 'muscle';
  labelPl?: string;
}

export interface AtlasPlateContent {
  id: AtlasSystemId;
  titlePl: string;
  subtitlePl: string;
  /** Token koloru z index.css, np. '--sys-muscle'. */
  colorVar: string;
  views: AtlasView[];
  viewTitlesPl: Partial<Record<AtlasView, string>>;
  summary: Record<AtlasState, string>;
  labels: AtlasLabel[];
  metrics: AtlasMetric[];
  flows?: AtlasFlow[];
  /** Atrybucja modeli (licencje CC). */
  creditsPl: string;
}

/** Plik generowany przez blender/atlas/atlas_lib.py. */
export interface AtlasAnchorsFile {
  id: string;
  resolution: [number, number];
  views: Partial<
    Record<
      AtlasView,
      {
        images: Partial<Record<AtlasState, string>>;
        anchors: Record<string, [number, number]>;
        /** Obrys ciała na obrazie [x0, y0, x1, y1] w skali 0-1. */
        bbox?: [number, number, number, number];
      }
    >
  >;
}
