import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { MoleculeSwarm } from './MolecularSimulation';

/**
 * Akt IV — Mięśnie: biologiczne silniki
 * Hierarchia: Brzusiec -> Pęczek -> Włókno (Typ I/II) -> Siateczka SR -> Sarkomer
 * Interaktywne laboratorium cyklu mostków poprzecznych z 4 etapami:
 *   0: Napływ Ca2+ i odsłonięcie aktyny -> wiązanie główki miozyny
 *   1: Ruch roboczy (Power Stroke) i uwolnienie Pi/ADP -> przesunięcie prążków Z
 *   2: Wiązanie nowego ATP i odłączenie główki od aktyny
 *   3: Hydroliza ATP -> ADP + Pi i powrotne napięcie główki miozyny
 */
export function Act04MuscleEngines() {
  const { scene } = useGLTF(MODEL_PATHS.muscle_sarcomere);
  const sarcomerePaused = useBiogenesisStore((s) => s.sarcomerePaused);
  const sarcomereStage = useBiogenesisStore((s) => s.sarcomereStage);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        obj.material = (obj.material as THREE.Material).clone();
      }
    });
    return c;
  }, [scene]);

  const parts = useMemo(() => {
    const zLeft = cloned.getObjectByName('Z_Disc_Left_Pivot') ?? null;
    const zRight = cloned.getObjectByName('Z_Disc_Right_Pivot') ?? null;
    const heads: THREE.Object3D[] = [];
    cloned.traverse((obj) => {
      if (obj.name.startsWith('Myosin_Head_Pivot_')) heads.push(obj);
    });
    return { zLeft, zRight, heads };
  }, [cloned]);

  useEffect(() => {
    return () => {
      cloned.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [cloned]);

  useFrame(() => {
    // Either continuous live sarcomere phase OR manual stepped stage when paused
    const phase = sarcomerePaused
      ? (sarcomereStage + 0.35) / 4.0
      : liveSimulationRef.sarcomereLocalPhase;

    // Sliding filament contraction wave (Z-discs approach M-line from +-1.55 down to +-1.18)
    const contractWave = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
    const zSpan = 1.55 - contractWave * 0.34;
    if (parts.zLeft) parts.zLeft.position.x = -zSpan;
    if (parts.zRight) parts.zRight.position.x = zSpan;

    // Cross-bridge 4-stage articulation:
    // phase 0..0.25: reach up toward actin; 0.25..0.55: power stroke tilt; 0.55..0.75: ATP detach; 0.75..1.0: cock head
    parts.heads.forEach((hp, i) => {
      const side = hp.position.x < 0 ? -1 : 1;
      const localP = (phase + (i % 4) * 0.04) % 1;
      let tiltZ = 0;
      let reachScale = 1.0;

      if (localP < 0.25) {
        const k = localP / 0.25;
        tiltZ = side * 0.38 * (1 - k);
        reachScale = 0.92 + k * 0.14;
      } else if (localP < 0.55) {
        const k = (localP - 0.25) / 0.3;
        tiltZ = -side * 0.52 * k;
        reachScale = 1.06;
      } else if (localP < 0.78) {
        const k = (localP - 0.55) / 0.23;
        tiltZ = -side * 0.52 * (1 - k * 0.5);
        reachScale = 1.06 - k * 0.18;
      } else {
        const k = (localP - 0.78) / 0.22;
        tiltZ = -side * 0.26 + side * 0.64 * k;
        reachScale = 0.88 + k * 0.04;
      }

      hp.rotation.z = tiltZ;
      hp.scale.setScalar(reachScale);
    });
  });

  return (
    <group>
      <pointLight position={[0, 2.4, 2.8]} intensity={2.8} color="#fff7ed" />
      <pointLight position={[-2.2, 0.4, 1.5]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[2.2, -0.5, 1.5]} intensity={1.8} color="#4ade80" />

      <primitive object={cloned} />

      {/* Ca2+ ions released from SR flooding actin/troponin */}
      <MoleculeSwarm
        count={120}
        color="#4ade80"
        emissive="#22c55e"
        radius={0.018}
        bounds={[2.8, 0.9, 0.9]}
        origin={[0, 0, 0]}
        speed={0.5}
        flowDir={[0, -0.8, 0]}
      />
      {/* ATP / ADP+Pi turnover cloud around myosin heads */}
      <MoleculeSwarm
        count={85}
        color="#fbbf24"
        emissive="#f59e0b"
        radius={0.016}
        bounds={[2.0, 0.7, 0.7]}
        origin={[0, 0, 0]}
        speed={0.75}
        flowDir={[0.4, 0.3, 0.2]}
      />
    </group>
  );
}
