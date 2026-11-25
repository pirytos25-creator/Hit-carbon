import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NeuralPathwayTube } from './NeuralSimulation';
import { MoleculeSwarm } from './MolecularSimulation';
import { liveSimulationRef } from '../core/SimulationCore';

/**
 * Akt II — Mobilizacja układu nerwowego:
 * 1. Kora ruchowa -> Rdzeń kręgowy -> Zstępujące szlaki korowo-rdzeniowe
 * 2. Jednostki motoryczne & Złącze nerwowo-mięśniowe (uwolnienie ACh -> depolaryzacja błony mięśniowej)
 * 3. Autonomiczny układ nerwowy: wycofanie błędne (cyjan/fiolet) vs wzrost współczulny i nadnercza (adrenalina vs noradrenalina)
 */
export function Act02NeuralMobilization() {
  const achGroupRef = useRef<THREE.Group>(null);
  const motorUnitRefs = useRef<THREE.Mesh[]>([]);
  const adrenalRef = useRef<THREE.Mesh>(null);

  const motorUnitRadii = useMemo(() => [0.09, 0.12, 0.15, 0.18], []);

  useFrame(({ clock }) => {
    const org = liveSimulationRef.organism;
    const t = clock.getElapsedTime();
    const intensity = org.sympatheticDrive;

    // Henneman Size Principle: recruit smaller oxidative motor units first, larger fast units at high drive
    motorUnitRefs.current.forEach((m, idx) => {
      if (!m) return;
      const threshold = idx * 0.22;
      const active = intensity >= threshold;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) {
        const pulse = active ? 0.55 + 0.45 * Math.sin(t * (6 + idx * 3)) : 0.08;
        mat.emissiveIntensity = pulse;
      }
    });

    // Neuromuscular junction ACh vesicle burst pulse
    if (achGroupRef.current) {
      const wave = 0.5 + 0.5 * Math.sin(t * 4.5);
      achGroupRef.current.scale.setScalar(0.88 + wave * 0.18);
    }

    // Adrenal gland hormone release glow
    if (adrenalRef.current) {
      const mat = adrenalRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.3 + intensity * 1.4;
      }
    }
  });

  return (
    <group>
      <pointLight position={[0, 2.2, 2.5]} intensity={2.4} color="#bae6fd" />
      <pointLight position={[1.8, -1.2, 1.5]} intensity={2.2} color="#fbbf24" />

      {/* 1. Górny układ: Kora ruchowa i rdzeń kręgowy */}
      <group position={[-0.7, 0.7, 0]}>
        {/* Motor cortex silhouette */}
        <mesh position={[0, 0.72, 0]} rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[0.42, 24, 18]} />
          <meshPhysicalMaterial
            color="#1e3a5f"
            emissive="#0ea5e9"
            emissiveIntensity={0.28}
            roughness={0.32}
            transparent
            opacity={0.55}
          />
        </mesh>
        {/* Spinal cord column */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 1.45, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.45} transparent opacity={0.6} />
        </mesh>
        {/* Corticospinal descending wave pathways (stylized membrane depolarization, NOT lightning) */}
        <NeuralPathwayTube
          points={[[-0.14, 0.78, 0.1], [-0.04, 0.35, 0.05], [0.02, -0.2, 0.03], [0.05, -0.95, 0.04]]}
          radius={0.022}
          waveColor="#38f5ff"
          speed={2.2}
        />
        <NeuralPathwayTube
          points={[[0.14, 0.76, -0.05], [0.05, 0.32, 0.02], [-0.02, -0.25, 0.04], [0.06, -0.98, 0.02]]}
          radius={0.020}
          waveColor="#22d3ee"
          speed={1.9}
        />
        {/* Motoneuron exiting ventral horn toward muscle */}
        <NeuralPathwayTube
          points={[[0.05, -0.95, 0.04], [0.65, -1.05, 0.08], [1.45, -1.15, 0.0]]}
          radius={0.024}
          waveColor="#38bdf8"
          speed={2.4}
        />
      </group>

      {/* 2. Złącze nerwowo-mięśniowe (NMJ) + Rekrutacja jednostek motorycznych */}
      <group position={[1.25, -0.55, 0]}>
        {/* Motor endplate / Sarcolemma membrane */}
        <mesh position={[0.25, -0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.28, 1.15, 12, 24]} />
          <meshPhysicalMaterial
            color="#9f1239"
            emissive="#f43f5e"
            emissiveIntensity={0.22}
            roughness={0.35}
            transparent
            opacity={0.78}
          />
        </mesh>
        {/* Presynaptic motor terminal */}
        <mesh position={[-0.25, 0.16, 0]} rotation={[0, 0, -0.6]}>
          <capsuleGeometry args={[0.14, 0.24, 10, 16]} />
          <meshPhysicalMaterial color="#0284c7" emissive="#22d3ee" emissiveIntensity={0.45} roughness={0.28} />
        </mesh>
        {/* Acetylcholine vesicles crossing synaptic cleft */}
        <group ref={achGroupRef} position={[-0.08, -0.02, 0]}>
          <MoleculeSwarm
            count={55}
            color="#fbbf24"
            emissive="#f59e0b"
            radius={0.018}
            bounds={[0.24, 0.18, 0.22]}
            origin={[0, 0, 0]}
            speed={0.9}
            flowDir={[0.4, -1.0, 0]}
          />
        </group>
        {/* Muscle fiber recruitment spheres (Henneman size principle) */}
        <group position={[0.55, -0.82, 0]}>
          {motorUnitRadii.map((rad, idx) => (
            <mesh
              key={idx}
              ref={(el) => {
                if (el) motorUnitRefs.current[idx] = el;
              }}
              position={[(idx - 1.5) * 0.34, 0, 0]}
            >
              <sphereGeometry args={[rad, 16, 12]} />
              <meshStandardMaterial
                color={idx < 2 ? '#e11d48' : '#fb923c'}
                emissive={idx < 2 ? '#fb7185' : '#f97316'}
                emissiveIntensity={0.3}
                roughness={0.32}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* 3. Autonomiczny układ nerwowy i nadnercza (Współczulny NA vs Nadnercza Adrenalina) */}
      <group position={[-1.45, -0.95, 0.2]}>
        {/* Adrenal gland above kidney silhouette */}
        <mesh ref={adrenalRef} position={[0, 0.08, 0]}>
          <coneGeometry args={[0.16, 0.26, 16]} />
          <meshStandardMaterial color="#d97706" emissive="#f59e0b" emissiveIntensity={0.75} roughness={0.32} />
        </mesh>
        <mesh position={[0, -0.18, 0]} scale={[0.9, 1.35, 0.7]}>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.48} />
        </mesh>
        {/* Sympathetic chain releasing local norepinephrine vs bloodstream epinephrine */}
        <NeuralPathwayTube
          points={[
            [0.6, 1.15, -0.1],
            [0.25, 0.65, -0.05],
            [0.05, 0.2, 0.0],
          ]}
          radius={0.016}
          baseColor="#3f1d0b"
          waveColor="#fbbf24"
          speed={1.5}
        />
        <MoleculeSwarm
          count={40}
          color="#fb923c"
          emissive="#f59e0b"
          radius={0.015}
          bounds={[0.55, 0.65, 0.35]}
          origin={[0.15, 0.28, 0.1]}
          speed={0.65}
          flowDir={[0.7, 0.8, 0]}
        />
      </group>
    </group>
  );
}
