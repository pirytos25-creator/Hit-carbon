import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { MoleculeSwarm } from './MolecularSimulation';
import { NeuralPathwayTube } from './NeuralSimulation';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';

/**
 * Akt X — Benchmark D Kulminacja Neuroplastyczności (BDNF–TrkB, Actin Remodeling, Time-Lapse LTP):
 * Integruje Las Neuronów (`neural_forest.glb`), Synapsę Molekularną z realnym dimerem PDB 1B8M BDNF
 * (`synapse_hero.glb`) oraz makroskopową sieć Hipokamp–PFC (`brain_macro.glb`).
 * - Faza 1: Lot przez sieć neuronalną ku kolcowi dendrytycznemu
 * - Faza 2: Dokowanie homodimeru PDB 1B8M BDNF z zacieśnieniem dimeru TrkB_L + TrkB_R i kaskadami MAPK/PI3K/PLCγ
 * - Faza 3: Polimeryzacja aktyny (`Actin_Polymerized`) i przebudowa kolca (`Spine_Mature_Mushroom`) + wstawianie AMPA (TIME-LAPSE!)
 * - Faza 4: Wielki odjazd ukazujący wzmocnioną synapsę w kontekście Hipokampa i PFC
 */
export function Act10BDNFNeuroplasticity() {
  const { scene: synScene } = useGLTF(MODEL_PATHS.synapse_hero);
  const { scene: forestScene } = useGLTF(MODEL_PATHS.neural_forest);
  const { scene: brainScene } = useGLTF(MODEL_PATHS.brain_macro);

  const subView = useBiogenesisStore((s) => s.act10SubView);
  const mode = useBiogenesisStore((s) => s.mode);
  const insertedAmpaRef = useRef<THREE.Group>(null);

  const clonedSyn = useMemo(() => {
    const c = synScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (obj.name === 'Presynaptic_Bouton' || obj.name === 'Postsynaptic_Dendritic_Spine') {
          applyBioPbrSurface(mat, 'membrane', 0.55, 4, 3);
        }
        obj.material = mat;
      }
    });
    return c;
  }, [synScene]);

  const clonedForest = useMemo(() => {
    const c = forestScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        obj.material = (obj.material as THREE.Material).clone();
      }
    });
    return c;
  }, [forestScene]);

  const clonedBrain = useMemo(() => {
    const c = brainScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (obj.name.startsWith('Cortex_')) {
          mat.transparent = true;
          mat.opacity = 0.24;
          mat.depthWrite = false;
        }
        obj.material = mat;
      }
    });
    return c;
  }, [brainScene]);

  const refs = useMemo(() => {
    const gs = (n: string) => clonedSyn.getObjectByName(n) as THREE.Mesh | null;
    const gb = (n: string) => clonedBrain.getObjectByName(n) as THREE.Mesh | null;
    return {
      bdnf: gs('BDNF_Homodimer_1B8M'),
      trkbL: gs('Receptors_TrkB_L'),
      trkbR: gs('Receptors_TrkB_R'),
      spine: gs('Postsynaptic_Dendritic_Spine'),
      actin: gs('Postsynaptic_Actin_Skeleton'),
      hippo: gb('Hippocampus'),
      pfc: gb('Prefrontal_Cortex'),
    };
  }, [clonedSyn, clonedBrain]);

  useEffect(() => {
    return () => {
      [clonedSyn, clonedForest, clonedBrain].forEach((r) => {
        r.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            const m = o.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m?.dispose();
          }
        });
      });
    };
  }, [clonedSyn, clonedForest, clonedBrain]);

  // Effective narrative stage: auto-progresses smoothly in Cinema mode, manual tab in Lab modes!
  const u = liveSimulationRef.actProgress;
  const activeStage =
    mode === 'cinematic'
      ? u < 0.45
        ? 'bdnf_trkb'
        : u < 0.78
          ? 'ltp_spine'
          : 'hippocampus_pfc'
      : subView;

  useFrame(() => {
    const t = liveSimulationRef.masterTimeSec;
    const prog = liveSimulationRef.actProgress;
    const stage =
      useBiogenesisStore.getState().mode === 'cinematic'
        ? prog < 0.45
          ? 'bdnf_trkb'
          : prog < 0.78
            ? 'ltp_spine'
            : 'hippocampus_pfc'
        : useBiogenesisStore.getState().act10SubView;

    const setMorph = (mesh: THREE.Mesh | null, key: string, val: number) => {
      if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      const idx = mesh.morphTargetDictionary[key];
      if (idx !== undefined) mesh.morphTargetInfluences[idx] = THREE.MathUtils.clamp(val, 0, 1);
    };

    if (stage === 'bdnf_trkb') {
      // BDNF 1B8M homodimer approaches TrkB dimer & triggers monomer mutual dimerization!
      const dock = THREE.MathUtils.clamp(0.5 + 0.5 * Math.sin(t * 1.15), 0, 1);
      if (refs.bdnf) {
        refs.bdnf.position.set(THREE.MathUtils.lerp(-0.12, 0.05, dock), 0.25, 0.0);
        refs.bdnf.rotation.z = t * 0.55;
      }
      // Pull TrkB_L and TrkB_R monomers closer together upon BDNF binding (true RTK dimerization!)
      const pull = dock * 0.022;
      if (refs.trkbL) refs.trkbL.position.z = pull;
      if (refs.trkbR) refs.trkbR.position.z = -pull;

      setMorph(refs.spine, 'Spine_Mature_Mushroom', 0.08);
      setMorph(refs.actin, 'Actin_Polymerized', 0.12);
    } else if (stage === 'ltp_spine') {
      // Time-lapse LTP cytoskeleton polymerization + structural mushroom spine maturation + AMPA insertion!
      const growth = mode === 'cinematic' ? THREE.MathUtils.smoothstep(prog, 0.45, 0.76) : 0.5 + 0.5 * Math.sin(t * 0.75);
      setMorph(refs.actin, 'Actin_Polymerized', growth);
      setMorph(refs.spine, 'Spine_Mature_Mushroom', growth);
      if (insertedAmpaRef.current) {
        insertedAmpaRef.current.scale.setScalar(0.35 + growth * 0.85);
      }
      if (refs.bdnf) refs.bdnf.position.set(0.05, 0.25, 0.0);
    } else {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      setMorph(refs.actin, 'Actin_Polymerized', 1.0);
      setMorph(refs.spine, 'Spine_Mature_Mushroom', 1.0);
      if (refs.hippo) {
        const m = refs.hippo.material as THREE.MeshStandardMaterial;
        if (m) m.emissiveIntensity = 1.2 + pulse * 0.7;
      }
      if (refs.pfc) {
        const m = refs.pfc.material as THREE.MeshStandardMaterial;
        if (m) m.emissiveIntensity = 0.95 + pulse * 0.55;
      }
    }
  });

  const showBrainMacro = activeStage === 'hippocampus_pfc';

  return (
    <group>
      <pointLight position={[1.8, 2.2, 2.4]} intensity={2.8} color="#fef3c7" />
      <pointLight position={[-1.8, 0.8, 1.8]} intensity={1.9} color="#38bdf8" />

      {/* Sprawling illuminated Neural Forest backdrop */}
      <group position={[0.1, -0.35, -4.2]} scale={1.45} visible={!showBrainMacro}>
        <primitive object={clonedForest} />
      </group>

      {!showBrainMacro && (
        <group scale={1.18}>
          <primitive object={clonedSyn} />

          {activeStage === 'bdnf_trkb' && (
            <>
              <NeuralPathwayTube points={[[0.18, 0.25, 0], [0.44, 0.30, 0.08], [0.80, 0.16, 0.02]]} radius={0.018} waveColor="#fbbf24" speed={1.5} />
              <NeuralPathwayTube points={[[0.18, 0.05, 0], [0.46, 0.0, -0.06], [0.80, -0.04, 0.0]]} radius={0.018} waveColor="#34d399" speed={1.4} />
              <NeuralPathwayTube points={[[0.18, -0.18, 0], [0.42, -0.26, 0.05], [0.76, -0.16, 0.02]]} radius={0.018} waveColor="#38bdf8" speed={1.7} />
              <MoleculeSwarm count={65} color="#fde047" emissive="#fbbf24" radius={0.015} bounds={[0.8, 0.6, 0.5]} origin={[0.45, 0, 0]} speed={0.5} flowDir={[0.8, 0, 0]} />
            </>
          )}

          {activeStage === 'ltp_spine' && (
            <group ref={insertedAmpaRef} position={[0.15, 0, 0]}>
              {[-0.22, -0.07, 0.07, 0.22].map((ry, i) => (
                <mesh key={i} position={[0, ry, 0.24 * Math.sin(i + 1)]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.024, 0.030, 0.075, 10]} />
                  <meshStandardMaterial color="#22d3ee" emissive="#38bdf8" emissiveIntensity={1.15} />
                </mesh>
              ))}
              <MoleculeSwarm count={75} color="#4ade80" emissive="#22c55e" radius={0.015} bounds={[0.6, 0.5, 0.5]} origin={[0.28, 0, 0]} speed={0.65} flowDir={[0.6, 0.3, 0]} />
            </group>
          )}
        </group>
      )}

      {showBrainMacro && (
        <group scale={1.42}>
          <primitive object={clonedBrain} />
          <NeuralPathwayTube points={[[0.22, -0.18, -0.04], [0.24, -0.10, 0.08], [0.16, 0.02, 0.14], [0.20, 0.10, 0.44]]} radius={0.018} waveColor="#fbbf24" speed={1.7} />
          <NeuralPathwayTube points={[[-0.22, -0.18, -0.04], [-0.24, -0.10, 0.08], [-0.16, 0.02, 0.14], [-0.20, 0.10, 0.44]]} radius={0.018} waveColor="#38bdf8" speed={1.7} />
        </group>
      )}
    </group>
  );
}
