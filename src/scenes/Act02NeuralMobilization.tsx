import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { NeuralPathwayTube } from './NeuralSimulation';
import { MoleculeSwarm } from './MolecularSimulation';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';

/**
 * Akt II — Mobilizacja układu nerwowego (używa realnego modelu kory i złącza zamiast prymitywów):
 * 1. Prawa/lewa kora ruchowa (`brain_macro`) + pień/rdzeń -> zstępujące szlaki korowo-rdzeniowe
 * 2. Złącze nerwowo-mięśniowe (`synapse_hero`) + rekrutacja włókien wg zasady Hennemana
 * 3. Autonomiczny układ współczulny (noradrenalina lokalnie vs adrenalina rdzenia nadnerczy)
 */
export function Act02NeuralMobilization() {
  const { scene: brainScene } = useGLTF(MODEL_PATHS.brain_macro);
  const { scene: synScene } = useGLTF(MODEL_PATHS.synapse_hero);

  const achGroupRef = useRef<THREE.Group>(null);
  const motorUnitRefs = useRef<THREE.Mesh[]>([]);
  const adrenalRef = useRef<THREE.Mesh>(null);
  const motorUnitRadii = useMemo(() => [0.09, 0.12, 0.15, 0.18], []);

  const miniBrain = useMemo(() => {
    const c = brainScene.clone(true);
    c.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material) {
        const m = (o.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (o.name.startsWith('Cortex_')) {
          applyBioPbrSurface(m, 'cortex', 0.45, 4, 4);
          m.transparent = true;
          m.opacity = 0.55;
        }
        if (o.name === 'Motor_Cortex') {
          m.emissive.set('#22d3ee');
          m.emissiveIntensity = 1.25;
        }
        o.material = m;
      }
    });
    return c;
  }, [brainScene]);

  const nmjBouton = useMemo(() => {
    const c = synScene.clone(true);
    const keep = new Set(['Neuron_Axon_Shaft', 'Myelin_Sheaths', 'Presynaptic_Bouton', 'Presynaptic_Microtubules', 'Channel_CaV_Group']);
    c.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        if (!keep.has(o.name)) {
          o.visible = false;
        } else if (o.material) {
          o.material = (o.material as THREE.Material).clone();
        }
      }
    });
    return c;
  }, [synScene]);

  useEffect(() => {
    return () => {
      [miniBrain, nmjBouton].forEach((r) =>
        r.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            const m = o.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m?.dispose();
          }
        })
      );
    };
  }, [miniBrain, nmjBouton]);

  useFrame(() => {
    const org = liveSimulationRef.organism;
    const t = liveSimulationRef.masterTimeSec;
    const intensity = org.sympatheticDrive;

    motorUnitRefs.current.forEach((m, idx) => {
      if (!m) return;
      const threshold = idx * 0.22;
      const active = intensity >= threshold;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = active ? 0.55 + 0.45 * Math.sin(t * (5.5 + idx * 2.5)) : 0.08;
      }
    });

    if (achGroupRef.current) {
      const wave = 0.5 + 0.5 * Math.sin(t * 4.2);
      achGroupRef.current.scale.setScalar(0.88 + wave * 0.16);
    }

    if (adrenalRef.current) {
      const mat = adrenalRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.35 + intensity * 1.35;
      }
    }
  });

  // Preserve silence/unused helper import note cleanly
  void useBiogenesisStore;

  return (
    <group>
      <pointLight position={[0, 2.2, 2.5]} intensity={2.4} color="#bae6fd" />
      <pointLight position={[1.8, -1.2, 1.5]} intensity={2.2} color="#fbbf24" />

      {/* 1. Górny układ: Kora ruchowa (realny model Allen Brain) + Rdzeń kręgowy */}
      <group position={[-0.75, 0.72, 0]}>
        <group position={[0, 0.72, 0]} scale={0.55}>
          <primitive object={miniBrain} />
        </group>
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.075, 0.068, 1.38, 16]} />
          <meshPhysicalMaterial color="#475569" roughness={0.42} clearcoat={0.25} transparent opacity={0.68} />
        </mesh>
        <NeuralPathwayTube points={[[-0.14, 0.78, 0.1], [-0.04, 0.35, 0.05], [0.02, -0.2, 0.03], [0.05, -0.95, 0.04]]} radius={0.022} waveColor="#38f5ff" speed={2.2} />
        <NeuralPathwayTube points={[[0.14, 0.76, -0.05], [0.05, 0.32, 0.02], [-0.02, -0.25, 0.04], [0.06, -0.98, 0.02]]} radius={0.020} waveColor="#22d3ee" speed={1.9} />
        <NeuralPathwayTube points={[[0.05, -0.95, 0.04], [0.65, -1.05, 0.08], [1.45, -1.15, 0.0]]} radius={0.024} waveColor="#38bdf8" speed={2.4} />
      </group>

      {/* 2. Złącze nerwowo-mięśniowe (NMJ) + Rekrutacja jednostek motorycznych */}
      <group position={[1.25, -0.55, 0]}>
        <mesh position={[0.25, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.28, 1.15, 12, 24]} />
          <meshPhysicalMaterial color="#9f1239" emissive="#f43f5e" emissiveIntensity={0.22} roughness={0.35} transparent opacity={0.78} />
        </mesh>
        <group position={[-0.08, 0.14, 0]} rotation={[0, 0, -0.55]} scale={0.72}>
          <primitive object={nmjBouton} />
        </group>
        <group ref={achGroupRef} position={[-0.08, -0.02, 0]}>
          <MoleculeSwarm count={55} color="#fbbf24" emissive="#f59e0b" radius={0.017} bounds={[0.24, 0.18, 0.22]} origin={[0, 0, 0]} speed={0.9} flowDir={[0.4, -1.0, 0]} />
        </group>
        <group position={[0.55, -0.82, 0]}>
          {motorUnitRadii.map((rad, idx) => (
            <mesh key={idx} ref={(el) => { if (el) motorUnitRefs.current[idx] = el; }} position={[(idx - 1.5) * 0.34, 0, 0]}>
              <sphereGeometry args={[rad, 16, 12]} />
              <meshStandardMaterial color={idx < 2 ? '#e11d48' : '#fb923c'} emissive={idx < 2 ? '#fb7185' : '#f97316'} emissiveIntensity={0.3} roughness={0.32} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 3. Autonomiczny układ współczulny i nadnercza */}
      <group position={[-1.45, -0.95, 0.2]}>
        <mesh ref={adrenalRef} position={[0, 0.08, 0]}>
          <coneGeometry args={[0.16, 0.26, 16]} />
          <meshStandardMaterial color="#d97706" emissive="#f59e0b" emissiveIntensity={0.75} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.18, 0]} scale={[0.9, 1.35, 0.7]}>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.48} />
        </mesh>
        <NeuralPathwayTube points={[[0.6, 1.15, -0.1], [0.25, 0.65, -0.05], [0.05, 0.2, 0.0]]} radius={0.016} baseColor="#3f1d0b" waveColor="#fbbf24" speed={1.5} />
        <MoleculeSwarm count={40} color="#fb923c" emissive="#f59e0b" radius={0.015} bounds={[0.55, 0.65, 0.35]} origin={[0.15, 0.28, 0.1]} speed={0.65} flowDir={[0.7, 0.8, 0]} />
      </group>
    </group>
  );
}
