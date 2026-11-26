import * as THREE from 'three';

/**
 * Ujęcia na szynie (format CinematicShot z filmu, src/director/ShotChoreography.ts).
 * Ewaluacja jest 1:1 z filmowym evaluateActShot (odcinki z wygładzeniem smoothstep), żeby akt filmu na module
 * nie zmienił ruchu kamery. Tryb 'catmull' (gładka krzywa) jest do nowych ujęć (gabloty).
 */
export type ShotTransition = 'continuous' | 'occlusion_dive' | 'match_cut';
export type Vec3Tuple = [number, number, number];

export interface RailShot<L extends string = string> {
  id: string;
  startU: number;
  endU: number;
  posPoints: Vec3Tuple[];
  targetPoints: Vec3Tuple[];
  fovStart: number;
  fovEnd: number;
  dofFocusDistance: number;
  dofBokehScale: number;
  lightingPreset: L;
  transitionType: ShotTransition;
  dynamicSampler?: (localU: number, outPos: THREE.Vector3, outTarget: THREE.Vector3) => void;
}

export type RailInterpolation = 'smoothstep_segments' | 'catmull';

/** 1:1 z ShotChoreography.evalPolySpline: odcinki liniowe z wygładzeniem smoothstep. */
export function evalSmoothstepSegments(points: readonly Vec3Tuple[], t: number, out: THREE.Vector3) {
  if (points.length === 1) {
    out.set(points[0][0], points[0][1], points[0][2]);
    return out;
  }
  const n = points.length - 1;
  const scaled = Math.max(0, Math.min(n - 1e-6, t * n));
  const i = Math.floor(scaled);
  const f = scaled - i;
  const s = f * f * (3 - 2 * f);
  const a = points[i];
  const b = points[Math.min(n, i + 1)];
  return out.set(a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s);
}

const _cat = new THREE.Vector3();
/** Gładka krzywa Catmulla-Roma (centripetal) przez punkty; dla 1–2 punktów jak wyżej. */
export function evalCatmull(points: readonly Vec3Tuple[], t: number, out: THREE.Vector3) {
  if (points.length < 3) return evalSmoothstepSegments(points, t, out);
  const curve = new THREE.CatmullRomCurve3(points.map((p) => _cat.clone().set(p[0], p[1], p[2])), false, 'centripetal');
  return curve.getPoint(Math.max(0, Math.min(1, t)), out);
}

export interface ShotEval<S extends RailShot> {
  shot: S;
  localU: number;
  fov: number;
  dofFocusDistance: number;
  dofBokehScale: number;
  lightingPreset: S['lightingPreset'];
}

/** 1:1 z ShotChoreography.evaluateActShot, ale dla dowolnej listy ujęć (bez numerów aktów). */
export function evaluateShots<S extends RailShot>(
  shots: readonly S[],
  progress: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3,
  interpolation: RailInterpolation = 'smoothstep_segments'
): ShotEval<S> {
  let active = shots[shots.length - 1];
  for (let i = 0; i < shots.length; i++) {
    if (progress <= shots[i].endU || i === shots.length - 1) {
      active = shots[i];
      break;
    }
  }
  const span = Math.max(0.001, active.endU - active.startU);
  const localU = Math.min(1, Math.max(0, (progress - active.startU) / span));
  if (active.dynamicSampler) {
    active.dynamicSampler(localU, outPos, outTarget);
  } else if (interpolation === 'catmull') {
    evalCatmull(active.posPoints, localU, outPos);
    evalCatmull(active.targetPoints, localU, outTarget);
  } else {
    evalSmoothstepSegments(active.posPoints, localU, outPos);
    evalSmoothstepSegments(active.targetPoints, localU, outTarget);
  }
  const smoothU = localU * localU * (3 - 2 * localU);
  return {
    shot: active,
    localU,
    fov: active.fovStart + (active.fovEnd - active.fovStart) * smoothU,
    dofFocusDistance: active.dofFocusDistance,
    dofBokehScale: active.dofBokehScale,
    lightingPreset: active.lightingPreset,
  };
}
