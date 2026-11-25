import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { useBiogenesisStore } from '../core/SimulationCore';
import { BrainRegionId, NeurochemicalSystemId } from '../types/biogenesis';
import { NeuralPathwayTube } from './NeuralSimulation';

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

/**
 * Akt VIII — Neurochemiczna symfonia:
 * 12 struktur mózgowych o poprawnym położeniu względnym + interaktywna centrala 6 układów neurochemicznych.
 */
export function Act08NeurochemicalSymphony() {
  const { scene } = useGLTF(MODEL_PATHS.brain_synapse);
  const activeNeuroSystem = useBiogenesisStore((s) => s.activeNeuroSystem);
  const selectedBrainRegion = useBiogenesisStore((s) => s.selectedBrainRegion);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const macro = c.getObjectByName('Brain_Macro_Assembly');
    const syn = c.getObjectByName('Synapse_Hero_Assembly');
    if (macro) macro.visible = true;
    if (syn) syn.visible = false;

    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        obj.material = (obj.material as THREE.Material).clone();
      }
    });
    return c;
  }, [scene]);

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

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const activeRegions = SYSTEM_HIGHLIGHT_REGIONS[activeNeuroSystem];

    cloned.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const regionId = MESH_TO_REGION[obj.name];
      if (!regionId) return;
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      const isSelected = selectedBrainRegion === regionId;
      const isInSystem = activeRegions.includes(regionId);
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
      mat.emissiveIntensity = isSelected
        ? 1.55 + pulse * 0.65
        : isInSystem
          ? 0.75 + pulse * 0.45
          : 0.16;
    });
  });

  const pathColor = SYSTEM_COLOR[activeNeuroSystem];

  return (
    <group>
      <pointLight position={[1.8, 2.0, 2.2]} intensity={2.6} color="#e0f2fe" />
      <pointLight position={[-1.8, -0.5, 1.8]} intensity={1.8} color={pathColor} />

      <group scale={1.55}>
        <primitive object={cloned} />

        {/* Dynamic axonal pathways colored & activated by selected neurochemical system */}
        {activeNeuroSystem === 'dopamine' && (
          <>
            {/* Mesolimbic VTA -> NAcc */}
            <NeuralPathwayTube points={[[0, -0.16, 0.03], [0.10, -0.06, -0.22]]} radius={0.015} waveColor="#f59e0b" speed={1.8} />
            <NeuralPathwayTube points={[[0, -0.16, 0.03], [-0.10, -0.06, -0.22]]} radius={0.015} waveColor="#f59e0b" speed={1.8} />
            {/* Mesocortical VTA -> PFC */}
            <NeuralPathwayTube points={[[0, -0.16, 0.03], [0.18, 0.06, -0.44]]} radius={0.014} waveColor="#fbbf24" speed={1.5} />
            <NeuralPathwayTube points={[[0, -0.16, 0.03], [-0.18, 0.06, -0.44]]} radius={0.014} waveColor="#fbbf24" speed={1.5} />
          </>
        )}

        {activeNeuroSystem === 'noradrenaline' && (
          <>
            {/* Locus Coeruleus sweeping ascending projections to PFC, Motor Cortex, Hippocampus */}
            <NeuralPathwayTube points={[[0.04, -0.28, 0.13], [0.18, 0.06, -0.42]]} radius={0.014} waveColor="#22d3ee" speed={2.2} />
            <NeuralPathwayTube points={[[-0.04, -0.28, 0.13], [-0.18, 0.06, -0.42]]} radius={0.014} waveColor="#22d3ee" speed={2.2} />
            <NeuralPathwayTube points={[[0.04, -0.28, 0.13], [0.22, 0.25, -0.05]]} radius={0.013} waveColor="#38bdf8" speed={2.0} />
          </>
        )}

        {activeNeuroSystem === 'serotonin' && (
          <>
            {/* Raphe Nuclei -> Limbic & Cortical widespread projection */}
            <NeuralPathwayTube points={[[0, -0.26, 0.11], [0.22, -0.12, 0.04], [0.20, 0.06, -0.40]]} radius={0.014} waveColor="#38bdf8" speed={1.4} />
            <NeuralPathwayTube points={[[0, -0.26, 0.11], [-0.22, -0.12, 0.04], [-0.20, 0.06, -0.40]]} radius={0.014} waveColor="#38bdf8" speed={1.4} />
          </>
        )}

        {activeNeuroSystem === 'endorphins' && (
          <>
            <NeuralPathwayTube points={[[0, -0.12, -0.08], [0.18, -0.18, -0.16], [0.16, 0.05, -0.36]]} radius={0.015} waveColor="#f43f5e" speed={1.5} />
            <NeuralPathwayTube points={[[0, -0.12, -0.08], [0, -0.38, 0.14]]} radius={0.015} waveColor="#fb7185" speed={1.5} />
          </>
        )}

        {activeNeuroSystem === 'endocannabinoids' && (
          <>
            <NeuralPathwayTube points={[[0.22, -0.12, 0.02], [0.10, -0.06, -0.22], [0.18, 0.06, -0.42]]} radius={0.015} waveColor="#10b981" speed={1.6} />
            <NeuralPathwayTube points={[[-0.22, -0.12, 0.02], [-0.10, -0.06, -0.22], [-0.18, 0.06, -0.42]]} radius={0.015} waveColor="#34d399" speed={1.6} />
          </>
        )}

        {activeNeuroSystem === 'glutamate_gaba' && (
          <>
            <NeuralPathwayTube points={[[0.20, 0.08, -0.42], [0.0, 0.36, -0.05], [-0.20, 0.08, -0.42]]} radius={0.016} waveColor="#a78bfa" speed={2.1} />
            <NeuralPathwayTube points={[[0.22, -0.12, 0.04], [0.0, 0.15, 0.0], [-0.22, -0.12, 0.04]]} radius={0.014} waveColor="#60a5fa" speed={1.9} />
          </>
        )}
      </group>
    </group>
  );
}
