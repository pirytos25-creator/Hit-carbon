import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { BrainRegionId, NeurochemicalSystemId } from '../types/biogenesis';
import { NeuralPathwayTube } from './NeuralSimulation';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';
import { createCutawayUniforms, patchMaterialWithOrganicCutaway } from '../shaders/cutawayShader';

const SYSTEM_COLOR: Record<NeurochemicalSystemId, string> = {
  dopamine: '#f59e0b',
  serotonin: '#38bdf8',
  noradrenaline: '#22d3ee',
  endorphins: '#f43f5e',
  endocannabinoids: '#10b981',
  glutamate_gaba: '#a78bfa',
};

const MESH_TO_REGION: Record<string, BrainRegionId> = {
  Prefrontal_Cortex: 'prefrontal_cortex',
  Motor_Cortex: 'motor_cortex',
  Hippocampus: 'hippocampus',
  Hypothalamus: 'hypothalamus',
  Brainstem: 'brainstem',
  Locus_Coeruleus: 'locus_coeruleus',
  Raphe_Nuclei: 'raphe_nuclei',
  VTA: 'vta',
  Nucleus_Accumbens: 'nucleus_accumbens',
  Amygdala: 'amygdala',
  Cerebellum: 'cerebellum',
};

const SYSTEM_HIGHLIGHT_REGIONS: Record<NeurochemicalSystemId, BrainRegionId[]> = {
  dopamine: ['vta', 'nucleus_accumbens', 'prefrontal_cortex', 'motor_cortex'],
  serotonin: ['raphe_nuclei', 'prefrontal_cortex', 'hippocampus', 'hypothalamus'],
  noradrenaline: ['locus_coeruleus', 'prefrontal_cortex', 'amygdala', 'hippocampus'],
  endorphins: ['hypothalamus', 'brainstem', 'amygdala', 'prefrontal_cortex'],
  endocannabinoids: ['hippocampus', 'amygdala', 'nucleus_accumbens', 'prefrontal_cortex'],
  glutamate_gaba: ['prefrontal_cortex', 'motor_cortex', 'hippocampus', 'cerebellum'],
};

/** Offset where Neural Forest awaits seamless dive at end of Act VIII (Benchmark D) */
export const NEURAL_FOREST_DIVE_POS = new THREE.Vector3(0.32, -0.18, -5.2);

/**
 * Akt VIII — Benchmark D (Mózg Allen Brain Atlas + Zanurzenie w Las Neuronów):
 * - Realny anatomiczny mózg człowieka (zakręty, bruzdy, móżdżek, pień, ciało modzelowate, jądra głębokie)
 * - Płynny anatomiczny przekrój strzałkowy prawej półkuli (cutawayShader) odsłaniający hipokamp, wzgórze, NAcc i VTA
 * - 6 dynamicznych układów neurochemicznych + płynne wejście w organiczny Las Neuronów (`neural_forest.glb`)!
 */
export function Act08NeurochemicalSymphony() {
  const { scene: brainScene } = useGLTF(MODEL_PATHS.brain_macro);
  const { scene: forestScene } = useGLTF(MODEL_PATHS.neural_forest);
  const activeNeuroSystem = useBiogenesisStore((s) => s.activeNeuroSystem);
  const selectedBrainRegion = useBiogenesisStore((s) => s.selectedBrainRegion);

  const cortexCutUniforms = useMemo(() => createCutawayUniforms(1, '#38bdf8'), []);
  const forestGroupRef = useRef<THREE.Group>(null);

  const clonedBrain = useMemo(() => {
    const c = brainScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (obj.name.startsWith('Cortex_') || obj.name === 'Prefrontal_Cortex' || obj.name === 'Motor_Cortex' || obj.name === 'Cerebellum') {
          applyBioPbrSurface(mat, 'cortex', 0.55, 5, 5);
          mat.color.multiplyScalar(0.68);
          mat.roughness = 0.62;
          mat.metalness = 0.02;
        }
        if (obj.name === 'Cortex_Hemisphere_R') {
          patchMaterialWithOrganicCutaway(mat, cortexCutUniforms);
        }
        obj.material = mat;
      }
    });
    return c;
  }, [brainScene, cortexCutUniforms]);

  const clonedForest = useMemo(() => {
    const c = forestScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        obj.material = (obj.material as THREE.Material).clone();
      }
    });
    return c;
  }, [forestScene]);

  useEffect(() => {
    return () => {
      [clonedBrain, clonedForest].forEach((root) => {
        root.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            const m = o.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m?.dispose();
          }
        });
      });
    };
  }, [clonedBrain, clonedForest]);

  useFrame(() => {
    const t = liveSimulationRef.masterTimeSec;
    const u = liveSimulationRef.actProgress;
    const activeRegions = SYSTEM_HIGHLIGHT_REGIONS[activeNeuroSystem];

    // Animate anatomical right-hemisphere cutaway revealing deep Allen Brain nuclei (starts u=0.14 -> full slice X=+0.06 at u=0.58)
    const sliceK = THREE.MathUtils.smoothstep(u, 0.14, 0.48);
    cortexCutUniforms.uCutProgress.value = THREE.MathUtils.lerp(1.25, 0.05, sliceK);

    if (forestGroupRef.current) {
      forestGroupRef.current.visible = u > 0.48;
    }

    clonedBrain.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const regionId = MESH_TO_REGION[obj.name];
      if (!regionId) return;
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      const isSelected = selectedBrainRegion === regionId;
      const isInSystem = activeRegions.includes(regionId);
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.0);
      mat.emissiveIntensity = isSelected
        ? 0.48 + pulse * 0.22
        : isInSystem
          ? 0.18 + pulse * 0.14
          : 0.02;
    });
  });

  const pathColor = SYSTEM_COLOR[activeNeuroSystem];

  return (
    <group>
      <pointLight position={[1.8, 2.0, 2.2]} intensity={1.15} color="#e0f2fe" />
      <pointLight position={[-1.8, -0.5, 1.8]} intensity={1.05} color={pathColor} />

      {/* Macro Real Human Brain (Allen Brain Atlas) */}
      <group scale={1.35}>
        <primitive object={clonedBrain} />

        {/* Anatomically aligned dynamic axonal pathways along Allen Brain coordinates */}
        {activeNeuroSystem === 'dopamine' && (
          <>
            <NeuralPathwayTube points={[[0.04, -0.22, -0.04], [0.10, -0.04, 0.30]]} radius={0.015} waveColor="#f59e0b" speed={1.8} />
            <NeuralPathwayTube points={[[-0.04, -0.22, -0.04], [-0.10, -0.04, 0.30]]} radius={0.015} waveColor="#f59e0b" speed={1.8} />
            <NeuralPathwayTube points={[[0.04, -0.22, -0.04], [0.22, 0.14, 0.54]]} radius={0.014} waveColor="#fbbf24" speed={1.5} />
            <NeuralPathwayTube points={[[-0.04, -0.22, -0.04], [-0.22, 0.14, 0.54]]} radius={0.014} waveColor="#fbbf24" speed={1.5} />
          </>
        )}
        {activeNeuroSystem === 'noradrenaline' && (
          <>
            <NeuralPathwayTube points={[[0.04, -0.34, -0.14], [0.22, 0.12, 0.50]]} radius={0.014} waveColor="#22d3ee" speed={2.2} />
            <NeuralPathwayTube points={[[-0.04, -0.34, -0.14], [-0.22, 0.12, 0.50]]} radius={0.014} waveColor="#22d3ee" speed={2.2} />
            <NeuralPathwayTube points={[[0.04, -0.34, -0.14], [0.25, 0.35, 0.08]]} radius={0.013} waveColor="#38bdf8" speed={2.0} />
          </>
        )}
        {activeNeuroSystem === 'serotonin' && (
          <>
            <NeuralPathwayTube points={[[0, -0.40, -0.12], [0.24, -0.14, -0.04], [0.22, 0.12, 0.48]]} radius={0.014} waveColor="#38bdf8" speed={1.4} />
            <NeuralPathwayTube points={[[0, -0.40, -0.12], [-0.24, -0.14, -0.04], [-0.22, 0.12, 0.48]]} radius={0.014} waveColor="#38bdf8" speed={1.4} />
          </>
        )}
        {activeNeuroSystem === 'endorphins' && (
          <>
            <NeuralPathwayTube points={[[0, -0.12, 0.08], [0.20, -0.20, 0.16], [0.18, 0.08, 0.44]]} radius={0.015} waveColor="#f43f5e" speed={1.5} />
            <NeuralPathwayTube points={[[0, -0.12, 0.08], [0, -0.42, -0.14]]} radius={0.015} waveColor="#fb7185" speed={1.5} />
          </>
        )}
        {activeNeuroSystem === 'endocannabinoids' && (
          <>
            <NeuralPathwayTube points={[[0.26, -0.12, -0.02], [0.10, -0.04, 0.30], [0.20, 0.10, 0.50]]} radius={0.015} waveColor="#10b981" speed={1.6} />
            <NeuralPathwayTube points={[[-0.26, -0.12, -0.02], [-0.10, -0.04, 0.30], [-0.20, 0.10, 0.50]]} radius={0.015} waveColor="#34d399" speed={1.6} />
          </>
        )}
        {activeNeuroSystem === 'glutamate_gaba' && (
          <>
            <NeuralPathwayTube points={[[0.22, 0.12, 0.50], [0.0, 0.42, 0.05], [-0.22, 0.12, 0.50]]} radius={0.016} waveColor="#a78bfa" speed={2.1} />
            <NeuralPathwayTube points={[[0.26, -0.12, -0.04], [0.0, 0.18, 0.0], [-0.26, -0.12, -0.04]]} radius={0.014} waveColor="#60a5fa" speed={1.9} />
          </>
        )}
      </group>

      {/* Living Organic Neural Forest stage for seamless dive into cellular scale (Shot 4 u > 0.68) */}
      <group ref={forestGroupRef} position={NEURAL_FOREST_DIVE_POS} scale={0.9}>
        <pointLight position={[0, 1.5, 1.5]} intensity={2.6} color="#38bdf8" distance={8} />
        <pointLight position={[-1.5, 0.2, 0.8]} intensity={1.8} color="#fbbf24" distance={7} />
        <primitive object={clonedForest} />
        <NeuralPathwayTube points={[[-0.85, -0.25, 0.2], [-0.45, 0.25, 0.0], [0.0, 0.55, -0.4], [0.55, 0.35, -0.8]]} radius={0.016} waveColor="#38f5ff" speed={2.4} />
        <NeuralPathwayTube points={[[1.15, -0.85, -0.25], [0.65, 0.10, -0.15], [0.10, 0.65, 0.15]]} radius={0.014} waveColor="#fbbf24" speed={2.0} />
      </group>
    </group>
  );
}
