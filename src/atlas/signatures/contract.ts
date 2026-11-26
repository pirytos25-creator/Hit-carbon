/**
 * Kontrakt komponentu 2D wyróżnika (docs/atlas_wizualizacja/KONTRAKT_WYROZNIKA.md §3).
 * Komponent: src/atlas/signatures/<uklad>.tsx, eksport domyślny `(props: SignatureProps2D) => JSX` rysujący wewnątrz SVG
 * planszy (warstwa nad obrazem, pod podpisami). AtlasPlate ładuje go leniwie; brak pliku = plansza bez wyróżnika.
 */
import type { AtlasLevel } from '../palette';
import type { AtlasFlowKind, AtlasSignature, AtlasView } from '../types';

export interface SignatureProps2D {
  signature: AtlasSignature;
  view: AtlasView;
  /** 0 = spoczynek, 1 = nazwany moment; rama liczy przejście 0,9 s (ease-in-out). */
  state01: number;
  /** Tryb „Co się zmieniło” (trzeci przycisk momentu): bez nowego ruchu, najwyżej licznik różnicy. */
  changeView: boolean;
  level: AtlasLevel;
  reducedMotion: boolean;
  /** Rzut punktu 3D (metry, układ Z-Anatomy) na jednostki SVG tej klatki; null = brak kamery widoku. */
  project: (p: readonly [number, number, number]) => [number, number] | null;
  /** Tory z flows3d.json wskazane w signature.flows, w jednostkach SVG klatki. */
  paths: { id: string; kind: AtlasFlowKind; pts: [number, number][] }[];
  /** Kotwice wyróżnika widoczne w tym widoku, w jednostkach SVG klatki. */
  anchorPts: Record<string, [number, number]>;
  /** Jednostki SVG na piksel ekranu (grubości linii, promienie cząstek). */
  unit: number;
  colors: { system: string; light: string; flow: (k: AtlasFlowKind) => string };
}
