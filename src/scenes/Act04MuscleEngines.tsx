import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { MoleculeSwarm } from './MolecularSimulation';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';

/**
 * Akt IV — Mięśnie: biologiczne silniki wieloskalowe:
 * Ciągła choreografia od brzuśca -> pęczków -> włókna (SR + kanaliki T) -> miofibryli -> sarkomeru.
 * Zachowuje niezmienną długość filamentów aktyny i miozyny (ślizgowy mechanizm skurczu!),
 * podczas gdy prążki Z przybliżają się pod pracą 32 przegubowych główek miozyny S1.
 */
export function Act04MuscleEngines() {
  const { scene } = useGLTF(MODEL_PATHS.muscle_sarcomere);
  const sarcomerePaused = useBiogenesisStore((s) => s.sarcomerePaused);
  const sarcomereStage = useBiogenesisStore((s) => s.sarcomereStage);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (obj.name.startsWith('Muscle_Belly') || obj.name.startsWith('Fascicles_')) {
          applyBioPbrSurface(mat, 'muscle', 0.85, 6, 4);
        } else if (obj.name.startsWith('Sarcoplasmic_') || obj.name.startsWith('T_Tubules')) {
          applyBioPbrSurface(mat, 'membrane', 0.6, 4, 4);
        }
        obj.material = mat;
      }
    });
    return c;
  }, [scene]);

  const parts = useMemo(() => {
    const zLeft = cloned.getObjectByName('Z_Disc_Left_Pivot') ?? null;
    const zRight = cloned.getObjectByName('Z_Disc_Right_Pivot') ?? null;
    const hierarchy = cloned.getObjectByName('Muscle_Hierarchy_Group') ?? null;
    const sr = cloned.getObjectByName('Sarcoplasmic_Reticulum') as THREE.Mesh | null;
    const heads: THREE.Object3D[] = [];
    cloned.traverse((obj) => {
      if (obj.name.startsWith('Myosin_Head_Pivot_')) heads.push(obj);
    });
    return { zLeft, zRight, hierarchy, sr, heads };
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
    const org = liveSimulationRef.organism;
    const phase = sarcomerePaused
      ? (sarcomereStage + 0.35) / 4.0
      : liveSimulationRef.sarcomereLocalPhase;

    // Sliding filament motion: actin-bearing Z-discs glide closer to M-line WITHOUT shortening filaments!
    const contractWave = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
    const zSpan = 1.55 - contractWave * 0.34;
    if (parts.zLeft) parts.zLeft.position.x = -zSpan;
    if (parts.zRight) parts.zRight.position.x = zSpan;

    // Subtle macro fascicle/belly contraction ripple synced to sarcomere phase & speed
    if (parts.hierarchy) {
      const bellySqueeze = 1 + contractWave * 0.045;
      parts.hierarchy.scale.set(1 - contractWave * 0.035, bellySqueeze, bellySqueeze);
    }
    if (parts.sr) {
      const mat = parts.sr.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 0.3 + Math.max(0, Math.sin(phase * Math.PI * 2)) * (0.4 + org.sympatheticDrive * 0.6);
      }
    }

    // 4-stage articulated myosin S1 cross-bridge cycle
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
      <pointLight position={[-2.2, 0.5, 1.5]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[2.2, -0.5, 1.5]} intensity={1.8} color="#4ade80" />

      <primitive object={cloned} />

      {/* Ca2+ ions released from SR flooding actin/troponin */}
      <MoleculeSwarm
        count={120}
        color="#4ade80"
        emissive="#22c55e"
        radius={0.017}
        bounds={[2.8, 0.9, 0.9]}
        origin={[0, 0, 0]}
        speed={0.5}
        flowDir={[0, -0.75, 0]}
        brownianJitter={0.04}
      />
      {/* ATP / ADP+Pi turnover cloud around myosin heads */}
      <MoleculeSwarm
        count={85}
        color="#fbbf24"
        emissive="#f59e0b"
        radius={0.015}
        bounds={[2.0, 0.7, 0.7]}
        origin={[0, 0, 0]}
        speed={0.75}
        flowDir={[0.4, 0.3, 0.2]}
        brownianJitter={0.035}
      />
    </group>
  );
}
