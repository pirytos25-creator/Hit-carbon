import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AthleteGymRig } from './Act01GymAwakening';
import { MoleculeSwarm } from './MolecularSimulation';
import { liveSimulationRef } from '../core/SimulationCore';

/**
 * Akt VI — HIIT: Granice intensywności
 * Synchronizuje przyspieszony sprint na bieżni, pulsację układu krążenia,
 * parowanie potu (termoregulacja podwzgórzowa) oraz wieloczynnikową dynamikę
 * szczytowego interwału vs aktywnego odpoczynku.
 */
export function Act06HIITLimits() {
  const pulseLightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const org = liveSimulationRef.organism;
    if (pulseLightRef.current) {
      const beatPulse = Math.exp(-Math.pow((org.beatPhase - 0.14) * 5.5, 2));
      const heatFactor = THREE.MathUtils.clamp((org.coreTempC - 37.0) / 1.8, 0, 1);
      pulseLightRef.current.intensity = 1.6 + beatPulse * 3.0 * (0.4 + heatFactor);
      pulseLightRef.current.color.set(
        org.workoutPhase === 'active_recovery' || org.workoutPhase === 'cooldown' ? '#38bdf8' : '#fb7185'
      );
    }
  });

  return (
    <group>
      <pointLight position={[0, 2.8, 1.2]} intensity={2.8} color="#fee2e2" />
      <pointLight ref={pulseLightRef} position={[0.1, 1.25, 0.4]} intensity={2.5} color="#fb7185" distance={7} />

      <AthleteGymRig modeVariant="act6" />

      {/* Evaporative sweat & thermal dissipation particles rising from skin & head */}
      <MoleculeSwarm
        count={120}
        color="#67e8f9"
        emissive="#38bdf8"
        radius={0.011}
        bounds={[0.85, 1.65, 0.85]}
        origin={[0, 1.15, 0]}
        speed={0.55}
        flowDir={[0.1, 1.0, -0.2]}
      />
      {/* Heat / metabolic stress aura particles */}
      <MoleculeSwarm
        count={70}
        color="#fb923c"
        emissive="#ef4444"
        radius={0.013}
        bounds={[0.95, 1.4, 0.95]}
        origin={[0, 1.0, 0]}
        speed={0.4}
        flowDir={[0, 0.6, 0]}
      />
    </group>
  );
}
