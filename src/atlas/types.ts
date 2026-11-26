import type { EvidenceLevel } from '../types/biogenesis';

/**
 * Kontrakty atlasu układów. Zmienia je tylko integrator (docs/ATLAS_MODEL_ARCHITEKTONICZNY.md §5, podział pracy).
 * schemaVersion 2 (faza 2): kamera i punkty 3D w anchors.json, flows3d.json, pola faktów (status, protokół, cytat).
 */
export const ATLAS_SCHEMA_VERSION = 2;

/** Identyfikatory plansz (zob. docs/ATLAS_STYLE_BIBLE.md). Nazwy na ekranie mogą się różnić (np. „Układ moczowy”). */
export type AtlasSystemId =
  | 'nerwowy'
  | 'miesniowy'
  | 'mozg'
  | 'oddechowy'
  | 'krwionosny'
  // faza 1b
  | 'hormonalny'
  | 'powlokowy'
  | 'pokarmowy'
  | 'wydalniczy'
  | 'kostny'
  | 'limfatyczny'
  | 'rozrodczy'
  | 'calosc';
export type AtlasState = 'rest' | 'sprint';
/** Widoki kluczowe. `detail` = zbliżenie; plansza może mieć też własne zbliżenia o nazwie zaczynającej się od `detail`. */
export type AtlasView = 'front' | 'back' | 'side' | 'detail';

/** Poziom złożoności (model §3.5): podstawowy (laik, licealista) i rozszerzony (studenci). */
export type AtlasTier = 'primary' | 'secondary' | 'student';

/** Status faktu (model §3.6). Na ekran trafiają tylko fakty `checked_agent` (filtr: etap E0, nakładka HTML). */
export type AtlasFactStatus = 'draft' | 'checked_agent' | 'disputed' | 'unverifiable' | 'checked_human' | 'anatomy';

/**
 * Statusy dopuszczone na ekran. 'anatomy' = sam opis anatomiczny (np. „zasila m. piszczelowy przedni”), który agent
 * sprawdzający fakty wprost pominął jako nie-fakt (docs/atlas_audyt/fakty_<uklad>.md).
 */
export const ATLAS_SHOWN_STATUSES: readonly AtlasFactStatus[] = ['checked_agent', 'checked_human', 'anatomy'];

/** Treść podpisu. `anchor` musi istnieć w public/atlas/<id>/anchors.json dla danego widoku. */
export interface AtlasLabel {
  anchor: string;
  view: AtlasView;
  namePl: string;
  nameLat?: string;
  /** Krótko: co ta struktura robi w danym stanie (max ok. 60 znaków). */
  role: Record<AtlasState, string>;
  /** Domyślnie 'primary'. Podstawowy poziom pokazuje tylko 'primary'. */
  tier?: AtlasTier;
  /** Źródła twierdzeń w opisie roli (ID z src/science/ScientificReferences.ts). */
  referenceIds?: string[];
  /**
   * Status opisu roli osobno dla stanów (model §3.6). Brak = 'draft'. Nazwa struktury jest zawsze widoczna,
   * a opis roli tylko wtedy, gdy ma status 'checked_agent' (albo 'checked_human').
   */
  roleStatus?: Partial<Record<AtlasState, AtlasFactStatus>>;
  /** Wymuszona strona podpisu; domyślnie strona bliższa kotwicy (linia nie przecina struktury). */
  side?: 'left' | 'right';
  /**
   * Poziom dowodów opisu roli (np. 'animal_model' dla akwaporyn). Brak = nie pokazujemy dopisku.
   * Nakładka pokazuje pod opisem zdanie z drabiny sformułowań (model §3.4), gdy poziom ≠ 'established_human'.
   * Może być osobno dla stanu, np. `{ sprint: 'preliminary_human' }` (limfatyczny: spoczynek to opis anatomiczny).
   */
  evidence?: EvidenceLevel | Partial<Record<AtlasState, EvidenceLevel>>;
  /** Przeliczenie, gdy liczby z opisu roli nie ma dosłownie w cytacie (np. „208 − 0,7 × 25 = 190,5”). */
  conversionNote?: string;
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
  /** Status sprawdzenia (model §3.6). Brak = 'draft'. Na ekranie tylko 'checked_agent' / 'checked_human'. */
  status?: AtlasFactStatus;
  /** Osobny status wartości spoczynkowej, gdy różni się od `status` (np. brak cytatu dla spoczynku). */
  restStatus?: AtlasFactStatus;
  /** Przeliczenie między liczbą w cytacie a liczbą na ekranie (np. „140–150 mL/L = 14–15 mL/100 mL”). */
  conversionNote?: string;
  /**
   * Opis protokołu źródła, gdy różni się od protokołu wzorcowego 6 × (45 s / 45 s) przy ok. 88% VO₂max (model §3.7),
   * np. „30 s sprint maksymalny (Wingate)”. Poziom podstawowy pokazuje go jako krótki dopisek.
   */
  protocolMismatch?: string;
  /** Dosłowny cytat ze źródła (1-2 zdania, język oryginału), znaleziony przez agenta sprawdzającego. */
  quote?: string;
  /** Lokalizator cytatu: strona, tabela, rysunek. */
  locator?: string;
  /** Moment pomiaru, np. „koniec 45 s pracy”, „3 min po serii”. */
  measuredAt?: string;
  tier?: AtlasTier;
  /** Odsyłacz do innej planszy z tą samą wielkością (bez nowej liczby), np. adrenalina: nerwowy → hormonalny. */
  seeAlsoPlate?: AtlasSystemId;
}

/** Rodzaje strzałek. Kolor: tętnice/żyły jak w księdze stylu, pozostałe w kolorze układu planszy. */
export type AtlasFlowKind =
  | 'artery'
  | 'vein'
  | 'air'
  | 'nerve'
  | 'brain'
  | 'muscle'
  // faza 1b (zgłoszone w briefach)
  | 'hormone'
  | 'heat'
  | 'lactate'
  | 'glucose'
  | 'urine'
  | 'force'
  | 'lymph'
  | 'repro'
  // runda końcowa: impuls współczulny (inny wzór kreski niż ruchowy, nerwowy)
  | 'autonomic';

/** Strzałka przepływu w SVG. Punkty w PIKSELACH renderu danego widoku (format fazy 1; nowe plansze: flows3d.json). */
export interface AtlasFlow {
  view: AtlasView;
  points: [number, number][];
  kind: AtlasFlowKind;
  labelPl?: string;
  /** Stany, w których rysować strzałkę; brak = oba. */
  states?: AtlasState[];
}

/** Strzałka w metrach (układ Z-Anatomy), z public/atlas/<id>/flows3d.json. Rzutowana tym samym rzutem co kotwice. */
export interface AtlasFlow3D {
  id: string;
  kind: AtlasFlowKind;
  labelPl?: string;
  /** Widoki, w których rysować; brak = wszystkie widoki z kamerą. */
  views?: AtlasView[];
  /** Stany, w których rysować strzałkę; brak = oba. */
  states?: AtlasState[];
  points: [number, number, number][];
}

export interface AtlasFlows3DFile {
  schemaVersion: number;
  units: 'm';
  frame?: string;
  flows: AtlasFlow3D[];
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
  /** Źródła twierdzeń w podsumowaniu stanu. */
  summaryReferenceIds?: Partial<Record<AtlasState, string[]>>;
  /**
   * Status podsumowania. Reguła 1b: podsumowanie bez statusu pokazywanego (draft, disputed, unverifiable) NIE trafia
   * na ekran; zamiast niego pokazujemy `summaryVerified` (same zdania już sprawdzone), a gdy go nie ma – nic.
   */
  summaryStatus?: Partial<Record<AtlasState, AtlasFactStatus>>;
  /**
   * Zdania podsumowania już potwierdzone przez agenta sprawdzającego (dosłownie w brzmieniu, które sprawdził),
   * pokazywane tylko wtedy, gdy `summary` czeka na sprawdzenie. `source` = raport i pozycja, np.
   * 'fakty_rozrodczy.md, poz. 19 i 21'. Usuwamy, gdy `summary` dostanie status checked.
   */
  summaryVerified?: Partial<Record<AtlasState, AtlasVerifiedSummary>>;
  /** Krótkie wyjaśnienie, co na tej planszy znaczy „sprint” (poziom podstawowy, model §3.7). */
  protocolNotePl?: string;
  /**
   * Status zdania o „sprincie” (runda końcowa, bramka faktów). Brak = 'draft'. Niesprawdzone zdanie nie trafia na
   * ekran: zamiast niego neutralna informacja, że opis czeka na sprawdzenie.
   */
  protocolNoteStatus?: AtlasFactStatus;
  labels: AtlasLabel[];
  metrics: AtlasMetric[];
  flows?: AtlasFlow[];
  /** Atrybucja modeli (licencje CC). */
  creditsPl: string;
  /**
   * Karta bez stanów (model §4 pkt 10: np. rozrodczy): ten sam obraz w spoczynku i sprincie, przełącznik stanów
   * ukryty. To samo może ustawić skrypt planszy w anchors.json (`"card": true`).
   */
  card?: boolean;
}

/** Parametry rzutu ortograficznego kamery widoku (atlas_lib.Plate.camera_meta). */
export interface AtlasCamera {
  direction: string | [number, number, number];
  center: [number, number, number];
  /** Jednostkowy wektor „w prawo” na obrazie (świat, metry). */
  right: [number, number, number];
  /** Jednostkowy wektor „w górę” na obrazie. */
  up: [number, number, number];
  /** Rozmiar dłuższego boku obrazu w metrach (Blender, sensor_fit AUTO). */
  orthoScale: number;
}

export interface AtlasViewMeta {
  images: Partial<Record<AtlasState, string>>;
  anchors: Record<string, [number, number]>;
  /** Punkty kotwic w świecie (metry); od schemaVersion 2. */
  anchors3d?: Record<string, [number, number, number]>;
  /** Obrys ciała na obrazie [x0, y0, x1, y1] w skali 0-1. */
  bbox?: [number, number, number, number];
  /** Kamera widoku; od schemaVersion 2 (starsze rendery jej nie mają, wtedy strzałki 3D są pomijane). */
  camera?: AtlasCamera;
  /**
   * Rozdzielczość obrazu tego widoku [szer., wys.], gdy różni się od `resolution` pliku (np. moczowy: `body_front`
   * 1000×1800 przy planszy 1150×1600). Brak = `resolution` pliku. Kotwice i bbox są w skali 0-1 tego obrazu.
   */
  resolution?: [number, number];
}

/** Plik generowany przez blender/atlas/atlas_lib.py. */
export interface AtlasVerifiedSummary {
  text: string;
  referenceIds: string[];
  /** Raport sprawdzający (plik w docs/atlas_audyt/) i pozycje, z których pochodzą zdania. */
  source: string;
}

export interface AtlasAnchorsFile {
  schemaVersion?: number;
  /** Karta bez stanów (zob. AtlasPlateContent.card). */
  card?: boolean;
  id: string;
  /** Rozdzielczość domyślna widoków (widok może mieć własną: AtlasViewMeta.resolution). */
  resolution: [number, number];
  views: Partial<Record<AtlasView, AtlasViewMeta>>;
}
