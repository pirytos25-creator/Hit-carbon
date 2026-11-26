/**
 * Kontrakt wtyczki 3D wyróżnika układu (docs/atlas_wizualizacja/KONTRAKT_WYROZNIKA.md §4, uzgodnione: Wizualizator).
 *
 * Plik wtyczki: src/biomotion/signatures/<uklad>.ts (właściciel: agent układu), eksport `createSignature3D`.
 * Ładowanie: `loadSignature3D(uklad)` (index.ts) – jeden loader dla atlasu 3D, gabloty i filmu.
 * Budżet na poziomie Low (Intel UHD, 1440×900): ≤ 1 ms GPU na wyróżnik, bez półprzezroczystych nakładek
 * (półprzezroczystość tylko ditheringiem), kształty cząstek z ../particles/shapes.ts, ten sam ruch na każdym poziomie.
 */
import type * as THREE from 'three';
import type { QualityTier } from '../../types/biogenesis';
import type { AtlasSignature } from '../../atlas/types';
import type { LookProfileId } from '../look/profiles';
import type { BioTierParams } from '../quality/tiers';
import type { FlowPath } from '../particles/FlowPath';

/** Tor z flows3d.json gotowy dla cząstek (dane, nie strzałka). */
export interface SignaturePath {
  id: string;
  /** rodzaj toru z flows3d.json (artery, vein, nerve, …) */
  kind: string;
  /** tor w układzie sceny (three.js, metry); prędkość z przekroju przez FlowPath({ area }) */
  path: FlowPath;
  /** punkty toru w układzie sceny (gdy wtyczka potrzebuje własnej geometrii, np. rury strumienia) */
  points: THREE.Vector3[];
}

export interface Signature3DContext {
  /** te same dane co w 2D (plates/<uklad>.ts → signature) */
  signature: AtlasSignature;
  /** grupa wyróżnika w scenie odbiorcy (widok układu, gablota, akt filmu); wtyczka dodaje obiekty tylko tu */
  scene: THREE.Group;
  camera: THREE.Camera;
  /** tory z signature.flows (tylko istniejące w flows3d.json i w bieżącym widoku) */
  paths: SignaturePath[];
  /**
   * Siatki struktury po meshId z bindings.json (np. kości dla KONSTRUKCJI, skóra dla CIEPŁA); null = brak w tym widoku.
   * Zwraca SCALONE siatki pliku (wiele struktur, atrybut wierzchołka `_id`) razem z numerem `_id` tej struktury:
   * wtyczka filtruje trójkąty po `_id` (np. `Math.round(_id.getX(index[i])) === id`) i NIE modyfikuje tych siatek
   * (własna kopia trójkątów, własny materiał).
   */
  meshes: (meshId: string) => { mesh: THREE.Mesh; id: number }[] | null;
  /** poziom jakości z QualityManager i parametry modułu dla niego (gęstość cząstek, przezroczystość, LOD) */
  quality: QualityTier;
  tier: BioTierParams;
  /** profil wyglądu: 'atlas' (bez mapowania tonów) albo 'film' (AgX) */
  look: LookProfileId;
  /** barwa tokenu palety gotowa dla profilu (w 'film' z kompensacją przed AgX, gdy potrzebna) */
  color: (tokenHex: string) => string;
  colors: { system: string; light: string };
  reducedMotion: boolean;
}

/** Klatka wyróżnika (co klatkę od odbiorcy). */
export interface Signature3DFrame {
  timeSec: number;
  /** przyrost czasu (0 przy pauzie) */
  dtSec: number;
  /** skok czasu (przewinięcie, start): ustaw stan deterministycznie */
  seeked: boolean;
  /** 0 = spoczynek, 1 = nazwany moment; przejście 0,9 s liczy odbiorca */
  state01: number;
  /** tryb „Co się zmieniło”: bez nowego ruchu, najwyżej licznik różnicy */
  changeView: boolean;
  /** pauza (Spacja) albo prefers-reduced-motion: stopklatka dla bieżącego state01 */
  paused: boolean;
  /** faza serca 0..1 (BioClock), dla wyróżników zależnych od rytmu */
  beatPhase: number;
}

export interface Signature3DHandle {
  update(frame: Signature3DFrame): void;
  /** zmiana widoku/ujęcia: tory i siatki mogą się zmienić (np. zbliżenie) */
  setPaths?(paths: SignaturePath[]): void;
  dispose(): void;
}

export type CreateSignature3D = (ctx: Signature3DContext) => Signature3DHandle;
