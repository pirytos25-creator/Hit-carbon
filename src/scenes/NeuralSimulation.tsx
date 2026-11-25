import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createActionPotentialMaterial } from '../shaders/actionPotentialShader';
import { useBiogenesisStore } from '../core/SimulationCore';

interface NeuralPathwayTubeProps {
  points: [number, number, number][];
  radius?: number;
  baseColor?: string;
  waveColor?: string;
  speed?: number;
  frequency?: number;
  activity?: number;
}

/**
 * Renderuje anatomiczny trakt neuronalny z propagującą falą potencjału czynnościowego
 * (reprezentacja przesuwającej się depolaryzacji błony Na+/K+, nie błyskawic!).
 */
export function NeuralPathwayTube({
  points,
  radius = 0.025,
  baseColor = '#0c3558',
  waveColor = '#22d3ee',
  speed = 1.6,
  frequency = 1.2,
  activity = 1.0,
}: NeuralPathwayTubeProps) {
  const matRef = useRef<THREE.ShaderMaterial | null>(null);

  const { geometry, material } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const geo = new THREE.TubeGeometry(curve, 44, radius, 10, false);
    const mat = createActionPotentialMaterial({ baseColor, waveColor, speed, frequency });
    return { geometry: geo, material: mat };
  }, [points, radius, baseColor, waveColor, speed, frequency]);

  matRef.current = material;

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    if (useBiogenesisStore.getState().isPlaying) {
      matRef.current.uniforms.uTime.value += Math.min(0.05, delta);
    }
    matRef.current.uniforms.uActivity.value = activity;
  });

  return <mesh geometry={geometry} material={material} />;
}
