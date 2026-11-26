import * as THREE from 'three';

/**
 * Cykl serca → wagi kształtów (morph): skurcz przedsionków, skurcz komór, skręt koniuszka, zastawki.
 * Okna faz to parametry; PRESET_FILM_ACT3 i PRESET_FILM_ACT12 odtwarzają 1:1 dotychczasowe formuły filmu.
 * Wielkość ruchu bez faktu checked_agent jest „poglądowa” (chip w UI gabloty).
 */
export interface HeartCycleWindows {
  atrialEnd: number;
  ventStart: number;
  ventEnd: number;
  twistStart: number;
  twistEnd: number;
  /** przedział, w którym zastawki przedsionkowo-komorowe są zamknięte */
  avClosed: [number, number];
  /** przedział, w którym zastawki półksiężycowate są otwarte */
  slOpen: [number, number];
  avOpenValue: number;
  avClosedValue: number;
  slOpenValue: number;
  slClosedValue: number;
}

export const PRESET_FILM_ACT3: HeartCycleWindows = {
  atrialEnd: 0.22, ventStart: 0.16, ventEnd: 0.52, twistStart: 0.18, twistEnd: 0.5,
  avClosed: [0.16, 0.5], slOpen: [0.19, 0.48], avOpenValue: 0.95, avClosedValue: 0.08, slOpenValue: 0.98, slClosedValue: 0.06,
};

/** Akt 12: komora z oknem 0,16–0,50 (dzielnik 0,34), bez przedsionków i zastawek. */
export const PRESET_FILM_ACT12: HeartCycleWindows = { ...PRESET_FILM_ACT3, ventEnd: 0.5 };

export interface HeartCycleWeights {
  atrial: number;
  ventricular: number;
  twist: number;
  avOpen: number;
  slOpen: number;
  /** fala pobudzenia (węzeł zatokowo-przedsionkowy → komory) 0..1 */
  conduction: number;
}

const bump = (x: number, a: number, b: number) => (x >= a && x < b ? Math.sin(((x - a) / (b - a)) * Math.PI) : 0);

export function heartCycle(bp: number, drive: number, w: HeartCycleWindows, out: HeartCycleWeights): HeartCycleWeights {
  out.atrial = bp < w.atrialEnd ? Math.sin((bp / w.atrialEnd) * Math.PI) : 0;
  out.ventricular = bump(bp, w.ventStart, w.ventEnd) * drive;
  out.twist = bump(bp, w.twistStart, w.twistEnd) * drive;
  out.avOpen = bp >= w.avClosed[0] && bp < w.avClosed[1] ? w.avClosedValue : w.avOpenValue;
  out.slOpen = bp >= w.slOpen[0] && bp < w.slOpen[1] ? w.slOpenValue : w.slClosedValue;
  out.conduction = bp < 0.3 ? Math.sin((bp / 0.3) * Math.PI) : 0;
  return out;
}

export const createHeartWeights = (): HeartCycleWeights => ({ atrial: 0, ventricular: 0, twist: 0, avOpen: 0, slOpen: 0, conduction: 0 });

/** Ustawia wagę kształtu po nazwie (bez wyjątków, gdy siatka lub kształt nie istnieje). */
export function setMorph(mesh: THREE.Mesh | null | undefined, key: string, value: number) {
  if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
  const idx = mesh.morphTargetDictionary[key];
  if (idx !== undefined) mesh.morphTargetInfluences[idx] = Math.min(1, Math.max(0, value));
}
