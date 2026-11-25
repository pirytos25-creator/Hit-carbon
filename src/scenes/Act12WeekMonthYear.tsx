import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBiogenesisStore } from '../core/SimulationCore';
import { TemporalHorizon } from '../types/biogenesis';
import { NeuralPathwayTube } from './NeuralSimulation';

const HORIZON_PROGRESS: Record<TemporalHorizon, number> = {
  acute: 0.15,
  post_exercise: 0.35,
  week_2: 0.58,
  month_3: 0.82,
  year_1: 1.0,
};

/**
 * Akt XII — Tydzień, Miesiąc, Rok:
 * Interaktywny eksplorator adaptacji czasowych łączący trzy układy:
 * 1. Przerost objętościowy lewej komory i naczyń włosowatych (angiogeneza)
 * 2. Biogeneza sieci mitochondrialnej (PGC-1α -> namnażanie mitochondriów od 100% do ~200%)
 * 3. Utrzymanie i potencjalne wzmocnienie połączeń hipokampa oraz kory przedczołowej
 */
export function Act12WeekMonthYear() {
  const temporalHorizon = useBiogenesisStore((s) => s.temporalHorizon);
  const heartRef = useRef<THREE.Mesh>(null);
  const mitoGroupRef = useRef<THREE.Group>(null);
  const hippoGroupRef = useRef<THREE.Group>(null);

  const mitoPositions = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      const ang = i * 2.39996;
      const r = 0.12 + (i / 16) * 0.42;
      arr.push([Math.cos(ang) * r, ((i % 4) - 1.5) * 0.18, Math.sin(ang) * r]);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const adapt = HORIZON_PROGRESS[temporalHorizon];

    // Cardiac remodeling: stronger, slower resting stroke volume
    if (heartRef.current) {
      const beatRate = 1.4 - adapt * 0.38;
      const beat = Math.exp(-Math.pow((((t * beatRate) % 1) - 0.15) * 6, 2));
      const baseScale = 0.92 + adapt * 0.22;
      heartRef.current.scale.setScalar(baseScale + beat * (0.08 + adapt * 0.08));
    }

    // Mitochondrial biogenesis count & glow (PGC-1alpha driven)
    if (mitoGroupRef.current) {
      mitoGroupRef.current.rotation.y = t * 0.22;
      const activeCount = Math.round(4 + adapt * 12);
      mitoGroupRef.current.children.forEach((child, idx) => {
        child.visible = idx < activeCount;
        child.rotation.z = t * 0.5 + idx;
      });
    }

    // Neural dendritic branching density
    if (hippoGroupRef.current) {
      hippoGroupRef.current.rotation.y = Math.sin(t * 0.35) * 0.18;
      hippoGroupRef.current.scale.setScalar(0.88 + adapt * 0.18);
    }
  });

  const adapt = HORIZON_PROGRESS[temporalHorizon];

  return (
    <group position={[0, 0.2, 0]}>
      <pointLight position={[0, 3.0, 3.0]} intensity={2.6} color="#e0f2fe" />
      <pointLight position={[-2.2, 0.8, 1.5]} intensity={1.8} color="#fb7185" />
      <pointLight position={[2.2, 0.8, 1.5]} intensity={1.8} color="#34d399" />

      {/* 1. Układ Krążenia i Kapilaryzacja (Lewo) */}
      <group position={[-1.28, 0.1, 0]}>
        <group ref={heartRef as any}>
          {/* Sculpted asymmetric ventricular cone + aortic arch */}
          <mesh position={[0.04, -0.04, 0]} rotation={[0.15, 0, -0.25]} scale={[0.92, 1.25, 0.85]}>
            <sphereGeometry args={[0.28, 22, 16]} />
            <meshPhysicalMaterial
              color="#e11d48"
              emissive="#be123c"
              emissiveIntensity={0.35 + adapt * 0.35}
              roughness={0.28}
              clearcoat={0.45}
            />
          </mesh>
          <mesh position={[-0.12, 0.18, 0.04]} scale={[0.9, 1.0, 0.8]}>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshPhysicalMaterial color="#9f1239" roughness={0.32} clearcoat={0.4} />
          </mesh>
          <mesh position={[0.02, 0.30, 0]} rotation={[0, 0, -0.35]}>
            <torusGeometry args={[0.11, 0.045, 10, 20, Math.PI]} />
            <meshPhysicalMaterial color="#dc2626" roughness={0.28} />
          </mesh>
        </group>
        {/* Capillary network density grows across weeks/months */}
        {Array.from({ length: Math.round(3 + adapt * 7) }).map((_, i) => (
          <mesh key={i} rotation={[i * 0.45, i * 0.7, 0]}>
            <torusGeometry args={[0.48 + (i % 3) * 0.07, 0.011 + adapt * 0.005, 8, 32]} />
            <meshStandardMaterial color="#fb7185" emissive="#e11d48" emissiveIntensity={0.45} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>

      {/* 2. Biogeneza Mitochondriów w Mięśniach (Środek) */}
      <group position={[0, 0.1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.58, 0.58, 1.05, 24, 1, true]} />
          <meshPhysicalMaterial color="#7c2d12" roughness={0.4} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
        <group ref={mitoGroupRef}>
          {mitoPositions.map((pos, idx) => (
            <mesh key={idx} position={pos} rotation={[idx * 0.6, idx * 0.9, 0]}>
              <capsuleGeometry args={[0.052, 0.13, 8, 12]} />
              <meshStandardMaterial
                color="#f97316"
                emissive="#fb923c"
                emissiveIntensity={0.55 + adapt * 0.65}
                roughness={0.28}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* 3. Plastyczność Hipokampa i Kory Przedczołowej (Prawo) */}
      <group ref={hippoGroupRef} position={[1.28, 0.1, 0]}>
        <mesh>
          <sphereGeometry args={[0.42, 20, 16]} />
          <meshPhysicalMaterial
            color="#1e3a5f"
            emissive="#0ea5e9"
            emissiveIntensity={0.28 + adapt * 0.42}
            roughness={0.3}
            transparent
            opacity={0.42}
          />
        </mesh>
        <NeuralPathwayTube
          points={[[-0.25, -0.22, 0.1], [-0.08, 0.0, 0.16], [0.15, 0.18, 0.05], [0.28, 0.04, -0.15]]}
          radius={0.016 + adapt * 0.008}
          waveColor="#fbbf24"
          speed={1.4 + adapt * 0.8}
        />
        {adapt > 0.35 && (
          <NeuralPathwayTube
            points={[[0.22, -0.18, 0.12], [0.06, 0.10, -0.05], [-0.18, 0.22, -0.12]]}
            radius={0.014 + adapt * 0.008}
            waveColor="#34d399"
            speed={1.6}
          />
        )}
        {adapt > 0.7 && (
          <NeuralPathwayTube
            points={[[-0.20, 0.18, 0.15], [0.0, -0.12, -0.18], [0.22, -0.08, 0.14]]}
            radius={0.015}
            waveColor="#38bdf8"
            speed={1.8}
          />
        )}
      </group>
    </group>
  );
}
