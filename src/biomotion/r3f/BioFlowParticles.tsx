import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BioFrame } from '../frame';
import { FlowParticles, type FlowParticlesOptions } from '../particles/FlowParticles';
import { FlowPath } from '../particles/FlowPath';
import { createErythrocyteGeometry } from '../particles/shapes';
import { tierParams } from '../quality/tiers';

export interface BioFlowParticlesProps extends Omit<FlowParticlesOptions, 'path' | 'count' | 'geometry' | 'material'> {
  /** stan klatki odbiorcy (czytany co klatkę, bez re-renderu) */
  frame: BioFrame;
  curve: THREE.Curve<THREE.Vector3>;
  /** przekrój łożyska wzdłuż toru (patrz FlowPath) */
  area?: (u: number) => number;
  /** liczba bazowa; mnożona przez particleMultiplier poziomu jakości */
  baseCount: number;
  minCount?: number;
  cellRadius?: number;
  /** materiał krwinek; domyślnie jak w filmie (MeshPhysical z lakierem) */
  material?: THREE.Material;
}

/** Komponent R3F modułu: krwinki 3D na torze (używany przez film, gabloty, atlas). */
export function BioFlowParticles({ frame, curve, area, baseCount, minCount = 48, cellRadius = 0.044, material, ...rest }: BioFlowParticlesProps) {
  const count = Math.max(minCount, Math.round(baseCount * tierParams(frame.quality).particleMultiplier));
  const path = useMemo(() => new FlowPath(curve, { area }), [curve, area]);
  const geo = useMemo(() => createErythrocyteGeometry(cellRadius), [cellRadius]);
  const mat = useMemo(
    () => material ?? new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.24, clearcoat: 0.58, clearcoatRoughness: 0.18 }),
    [material]
  );
  const particles = useMemo(
    () => new FlowParticles({ ...rest, path, count, geometry: geo, material: mat }),
    // opcje funkcyjne (colorAt, squeeze, onHero) czytane przy tworzeniu; zmiana liczby/toru tworzy nowe instancje
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, count, geo, mat]
  );
  useEffect(() => () => particles.dispose(), [particles]);
  useEffect(() => () => { geo.dispose(); if (!material) mat.dispose(); }, [geo, mat, material]);

  useFrame(({ camera }) => {
    particles.advance(frame);
    particles.write(camera);
  });

  return <primitive object={particles.mesh} />;
}
