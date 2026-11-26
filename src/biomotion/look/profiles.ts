import * as THREE from 'three';
import { compensateHexForAgX, type LightModel } from './agx';

/**
 * Profile wyglądu modułu.
 * - `film`: OBECNY wygląd filmu (AgX, ekspozycja 1,05, materiały filmu). Domyślny dla filmu (decyzja Dyrygenta).
 * - `atlas`: bez mapowania tonów (zgodność barw z planszami 2D), jak widok 3D atlasu.
 * - `filmMatte`: film z matem atlasu (propozycja Reżysera D) – TYLKO do porównania; użytkownik zdecyduje.
 */
export type LookProfileId = 'film' | 'atlas' | 'filmMatte';

export interface LookProfile {
  id: LookProfileId;
  toneMapping: THREE.ToneMapping;
  exposure: number;
  /** nadpisanie materiałów (mat atlasu) */
  matte: boolean;
}

export const LOOK_PROFILES: Record<LookProfileId, LookProfile> = {
  film: { id: 'film', toneMapping: THREE.AgXToneMapping, exposure: 1.05, matte: false },
  atlas: { id: 'atlas', toneMapping: THREE.NoToneMapping, exposure: 1, matte: false },
  filmMatte: { id: 'filmMatte', toneMapping: THREE.AgXToneMapping, exposure: 1.05, matte: true },
};

/** Barwa tokenu dla materiału w danym profilu (w `film` z kompensacją przed AgX). */
export function tokenColorFor(profile: LookProfile, tokenHex: string, light: Partial<LightModel> = {}): string {
  return profile.toneMapping === THREE.AgXToneMapping ? compensateHexForAgX(tokenHex, { ...light, exposure: profile.exposure }) : tokenHex;
}

interface MatteBackup { roughness: number; metalness: number; roughnessMap: THREE.Texture | null; clearcoat?: number; sheen?: number; envMapIntensity: number }

/**
 * Mat atlasu na materiałach sceny (szorstkość ok. 0,62, bez lakieru i połysku, słabsze odbicia środowiska).
 * Odwracalne: oryginał w userData. Wywoływać przy zmianie profilu, nie co klatkę.
 */
export function applyMatte(root: THREE.Object3D, on: boolean) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const s = m as THREE.MeshPhysicalMaterial;
      if (!(s as THREE.MeshStandardMaterial).isMeshStandardMaterial) continue;
      const ud = s.userData as { bioMatte?: MatteBackup };
      if (on && !ud.bioMatte) {
        ud.bioMatte = { roughness: s.roughness, metalness: s.metalness, roughnessMap: s.roughnessMap, clearcoat: s.clearcoat, sheen: s.sheen, envMapIntensity: s.envMapIntensity };
        // mapa szorstkości filmu mnoży szorstkość i daje połysk mimo wyższej wartości, więc na czas matu jest wyłączona
        s.roughnessMap = null;
        s.roughness = Math.max(s.roughness, 0.7);
        s.metalness = 0;
        if (s.isMeshPhysicalMaterial) { s.clearcoat = 0; s.sheen = Math.min(s.sheen, 0.08); }
        s.envMapIntensity = Math.min(s.envMapIntensity, 0.35);
        s.needsUpdate = true;
      } else if (!on && ud.bioMatte) {
        const b = ud.bioMatte;
        s.roughness = b.roughness; s.metalness = b.metalness; s.roughnessMap = b.roughnessMap; s.envMapIntensity = b.envMapIntensity;
        if (s.isMeshPhysicalMaterial) { s.clearcoat = b.clearcoat ?? 0; s.sheen = b.sheen ?? 0; }
        delete ud.bioMatte;
        s.needsUpdate = true;
      }
    }
  });
}
