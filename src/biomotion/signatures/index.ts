/**
 * Loader wtyczek 3D wyróżników (KONTRAKT_WYROZNIKA.md §4). Jeden dla atlasu 3D, gabloty i filmu.
 * Brak pliku src/biomotion/signatures/<uklad>.ts = brak wyróżnika 3D (widok działa jak dziś).
 */
import * as THREE from 'three';
import type { CreateSignature3D, SignaturePath } from './contract';
import { FlowPath, type FlowPathOptions } from '../particles/FlowPath';

export type { Signature3DContext, Signature3DFrame, Signature3DHandle, SignaturePath, CreateSignature3D } from './contract';

const loaders = import.meta.glob<{ createSignature3D?: CreateSignature3D; default?: CreateSignature3D }>(['./*.ts', '!./index.ts', '!./contract.ts']);

/** Wtyczka 3D wyróżnika układu (np. 'krwionosny') albo null, gdy jej jeszcze nie ma. */
export async function loadSignature3D(system: string): Promise<CreateSignature3D | null> {
  const load = loaders[`./${system}.ts`];
  if (!load) return null;
  const m = await load();
  return m.createSignature3D ?? m.default ?? null;
}

/** Tor dla wtyczki z punktów flows3d (już w układzie sceny). Przekrój łożyska opcjonalnie (patrz FlowPath). */
export function signaturePathFromPoints(id: string, kind: string, points: THREE.Vector3[], opts: FlowPathOptions = {}): SignaturePath {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  return { id, kind, points, path: new FlowPath(curve, opts) };
}
