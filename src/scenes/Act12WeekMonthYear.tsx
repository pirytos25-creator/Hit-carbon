import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { TemporalHorizon } from '../types/biogenesis';
import { NeuralPathwayTube } from './NeuralSimulation';
import { BioClock, heartCycle, createHeartWeights, setMorph, PRESET_FILM_ACT12 } from '../biomotion';

const act12Clock = new BioClock();
const _act12Heart = createHeartWeights();

const HORIZON_PROGRESS: Record<TemporalHorizon, number> = {
  acute: 0.15,
  post_exercise: 0.35,
  week_2: 0.58,
  month_3: 0.82,
  year_1: 1.0,
};

/**
 * Akt XII — Tydzień, Miesiąc, Rok:
 * Tryptyk długofalowych adaptacji organizmu na bazie realnych modeli anatomicznych
 * (serce HuBMAP + kapilary, sieć mitochondrialna cryo-EM, hipokamp i PFC z Allen Brain Atlas).
 */
export function Act12WeekMonthYear() {
  const { scene: cardioScene } = useGLTF(MODEL_PATHS.cardiopulmonary);
  const { scene: brainScene } = useGLTF(MODEL_PATHS.brain_macro);
  const temporalHorizon = useBiogenesisStore((s) => s.temporalHorizon);

  const heartGroupRef = useRef<THREE.Group>(null);
  const ventMeshRef = useRef<THREE.Mesh | null>(null);
  const mitoGroupRef = useRef<THREE.Group>(null);
  const hippoGroupRef = useRef<THREE.Group>(null);

  const clonedHeart = useMemo(() => {
    const c = cardioScene.clone(true);
    const keep = new Set(['Heart_Ventricles', 'Heart_Atria', 'Great_Arteries_Coronary']);
    c.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        if (!keep.has(o.name)) o.visible = false;
        else if (o.material) o.material = (o.material as THREE.Material).clone();
      }
    });
    return c;
  }, [cardioScene]);

  const clonedBrain = useMemo(() => {
    const c = brainScene.clone(true);
    c.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material) {
        const mat = (o.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (o.name.startsWith('Cortex_')) {
          mat.transparent = true;
          mat.opacity = 0.25;
          mat.depthWrite = false;
        }
        o.material = mat;
      }
    });
    return c;
  }, [brainScene]);

  const mitoPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const ang = i * 2.39996;
      const r = 0.14 + (i / 16) * 0.38;
      arr.push([Math.cos(ang) * r, ((i % 4) - 1.5) * 0.16, Math.sin(ang) * r]);
    }
    return arr;
  }, []);

  useEffect(() => {
    return () => {
      [clonedHeart, clonedBrain].forEach((r) =>
        r.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            const m = o.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m?.dispose();
          }
        })
      );
    };
  }, [clonedHeart, clonedBrain]);

  useFrame(() => {
    const t = liveSimulationRef.masterTimeSec;
    const adapt = HORIZON_PROGRESS[temporalHorizon];

    // Cardiac remodeling via real HuBMAP Ventricular Systole Morph Targets + resting bradycardia.
    // Faza całkowana zegarem modułu (BioClock): zmiana horyzontu (tempa) nie powoduje już skoku skurczu.
    const beatRate = 1.35 - adapt * 0.35;
    act12Clock.update(t, beatRate * 60, 12);
    const hc = heartCycle(act12Clock.beatPhase, 0.6 + adapt * 0.38, PRESET_FILM_ACT12, _act12Heart);
    if (!ventMeshRef.current) ventMeshRef.current = clonedHeart.getObjectByName('Heart_Ventricles') as THREE.Mesh | null;
    setMorph(ventMeshRef.current, 'Ventricular_Systole', hc.ventricular);
    if (heartGroupRef.current) {
      heartGroupRef.current.scale.setScalar(1.35 + adapt * 0.28);
    }

    if (mitoGroupRef.current) {
      mitoGroupRef.current.rotation.y = t * 0.22;
      const activeCount = Math.round(4 + adapt * 12);
      mitoGroupRef.current.children.forEach((child, idx) => {
        child.visible = idx < activeCount;
        child.rotation.z = t * 0.5 + idx;
      });
    }

    if (hippoGroupRef.current) {
      hippoGroupRef.current.rotation.y = Math.sin(t * 0.35) * 0.18;
      hippoGroupRef.current.scale.setScalar(0.56 + adapt * 0.14);
    }
  });

  const adapt = HORIZON_PROGRESS[temporalHorizon];

  return (
    <group position={[0, 0.2, 0]}>
      <pointLight position={[0, 3.0, 3.0]} intensity={2.6} color="#e0f2fe" />
      <pointLight position={[-2.2, 0.8, 1.5]} intensity={1.8} color="#fb7185" />
      <pointLight position={[2.2, 0.8, 1.5]} intensity={1.8} color="#34d399" />

      {/* 1. Układ Krążenia (Realne serce HuBMAP + angiogeneza naczyń włosowatych) */}
      <group position={[-1.32, 0.08, 0]}>
        <group ref={heartGroupRef} scale={1.45}>
          <primitive object={clonedHeart} />
        </group>
        {Array.from({ length: Math.round(3 + adapt * 7) }).map((_, i) => (
          <mesh key={i} rotation={[i * 0.45, i * 0.7, 0]}>
            <torusGeometry args={[0.50 + (i % 3) * 0.06, 0.010 + adapt * 0.005, 8, 32]} />
            <meshStandardMaterial color="#fb7185" emissive="#e11d48" emissiveIntensity={0.45} transparent opacity={0.68} />
          </mesh>
        ))}
      </group>

      {/* 2. Biogeneza Mitochondriów (PGC-1alpha -> +60..100% gęstości w mięśniach) */}
      <group position={[0, 0.08, 0]}>
        <mesh>
          <cylinderGeometry args={[0.58, 0.58, 1.05, 24, 1, true]} />
          <meshPhysicalMaterial color="#7c2d12" roughness={0.4} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
        <group ref={mitoGroupRef}>
          {mitoPositions.map((pos, idx) => (
            <mesh key={idx} position={pos} rotation={[idx * 0.6, idx * 0.9, 0]}>
              <capsuleGeometry args={[0.048, 0.12, 8, 12]} />
              <meshStandardMaterial color="#f97316" emissive="#fb923c" emissiveIntensity={0.55 + adapt * 0.65} roughness={0.28} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 3. Plastyczność Hipokampa i Kory Przedczołowej (Allen Brain Atlas) */}
      <group ref={hippoGroupRef} position={[1.32, 0.08, 0]} scale={0.58}>
        <primitive object={clonedBrain} />
        <NeuralPathwayTube points={[[-0.25, -0.22, 0.1], [-0.08, 0.0, 0.16], [0.15, 0.18, 0.05], [0.28, 0.04, 0.35]]} radius={0.024 + adapt * 0.01} waveColor="#fbbf24" speed={1.4 + adapt * 0.8} />
        {adapt > 0.35 && (
          <NeuralPathwayTube points={[[0.22, -0.18, 0.12], [0.06, 0.10, -0.05], [-0.18, 0.22, 0.28]]} radius={0.022 + adapt * 0.008} waveColor="#34d399" speed={1.6} />
        )}
      </group>
    </group>
  );
}
