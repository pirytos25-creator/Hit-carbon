import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { useBiogenesisStore } from '../core/SimulationCore';
import { MoleculeSwarm } from './MolecularSimulation';
import { NeuralPathwayTube } from './NeuralSimulation';

/**
 * Akt X — BDNF i architektura neuroplastyczności (punkt kulminacyjny):
 * 3 podwidoki przełączane automatycznie lub ręcznie przez użytkownika:
 * 1. 'bdnf_trkb' — Wiązanie homodimeru BDNF z receptorem TrkB -> kaskady MAPK/ERK, PI3K/Akt, PLCγ
 * 2. 'ltp_spine' — LTP (odblokowanie NMDA, insercja AMPA i rozrost strukturalny kolca dendrytycznego)
 * 3. 'hippocampus_pfc' — Architektura hipokampa (DG -> CA3 -> CA1) i sieci kory przedczołowej z angiogenezą
 */
export function Act10BDNFNeuroplasticity() {
  const { scene } = useGLTF(MODEL_PATHS.brain_synapse);
  const subView = useBiogenesisStore((s) => s.act10SubView);
  const bdnfDimerRef = useRef<THREE.Group>(null);
  const insertedAmpaRef = useRef<THREE.Group>(null);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        obj.material = (obj.material as THREE.Material).clone();
      }
    });
    return c;
  }, [scene]);

  const refs = useMemo(
    () => ({
      macro: cloned.getObjectByName('Brain_Macro_Assembly') ?? null,
      syn: cloned.getObjectByName('Synapse_Hero_Assembly') ?? null,
      spinePivot: cloned.getObjectByName('Postsynaptic_Spine_Pivot') ?? null,
      trkb: cloned.getObjectByName('Receptors_TrkB') as THREE.Mesh | null,
      hippo: cloned.getObjectByName('Hippocampus') as THREE.Mesh | null,
      pfc: cloned.getObjectByName('Prefrontal_Cortex') as THREE.Mesh | null,
    }),
    [cloned]
  );

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
    const showBrainMacro = subView === 'hippocampus_pfc';

    if (refs.macro) refs.macro.visible = showBrainMacro;
    if (refs.syn) {
      refs.syn.visible = !showBrainMacro;
      refs.syn.position.set(0, 0, 0);
    }

    if (subView === 'bdnf_trkb') {
      if (bdnfDimerRef.current) {
        const dock = 0.5 + 0.5 * Math.sin(t * 1.4);
        bdnfDimerRef.current.position.set(THREE.MathUtils.lerp(-0.08, 0.11, dock), 0.24, 0.0);
        bdnfDimerRef.current.rotation.z = t * 0.8;
      }
      if (refs.trkb) {
        const m = refs.trkb.material as THREE.MeshStandardMaterial;
        if (m) m.emissiveIntensity = 1.2 + Math.sin(t * 3.5) * 0.5;
      }
      if (refs.spinePivot) {
        refs.spinePivot.scale.setScalar(1.0);
      }
    } else if (subView === 'ltp_spine') {
      // Structural dendritic spine enlargement + AMPA insertion over repeated theta-bursts
      const growth = 0.5 + 0.5 * Math.sin(t * 0.65);
      if (refs.spinePivot) {
        refs.spinePivot.scale.set(1 + growth * 0.24, 1 + growth * 0.42, 1 + growth * 0.42);
      }
      if (insertedAmpaRef.current) {
        insertedAmpaRef.current.scale.setScalar(0.35 + growth * 0.85);
      }
    } else if (subView === 'hippocampus_pfc') {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
      if (refs.hippo) {
        const m = refs.hippo.material as THREE.MeshStandardMaterial;
        if (m) m.emissiveIntensity = 1.15 + pulse * 0.65;
      }
      if (refs.pfc) {
        const m = refs.pfc.material as THREE.MeshStandardMaterial;
        if (m) m.emissiveIntensity = 0.9 + pulse * 0.5;
      }
    }
  });

  return (
    <group>
      <pointLight position={[1.8, 2.2, 2.4]} intensity={2.7} color="#fef3c7" />
      <pointLight position={[-1.8, 0.8, 1.8]} intensity={1.9} color="#38bdf8" />

      <group scale={subView === 'hippocampus_pfc' ? 1.55 : 1.15}>
        <primitive object={cloned} />

        {/* Sub-view 1: BDNF homodimer + 3 intracellular TrkB signaling cascades */}
        {subView === 'bdnf_trkb' && (
          <>
            <group ref={bdnfDimerRef} position={[0.04, 0.24, 0]}>
              <mesh position={[0, 0.025, 0]}>
                <sphereGeometry args={[0.042, 14, 10]} />
                <meshStandardMaterial color="#fde047" emissive="#fbbf24" emissiveIntensity={1.3} />
              </mesh>
              <mesh position={[0, -0.025, 0]}>
                <sphereGeometry args={[0.042, 14, 10]} />
                <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.3} />
              </mesh>
            </group>

            {/* MAPK / ERK pathway -> CREB transcription */}
            <NeuralPathwayTube points={[[0.18, 0.21, 0], [0.42, 0.28, 0.08], [0.76, 0.14, 0.02]]} radius={0.018} waveColor="#fbbf24" speed={1.5} />
            {/* PI3K / Akt pathway -> cell survival & mTOR translation */}
            <NeuralPathwayTube points={[[0.18, 0.05, 0], [0.44, 0.0, -0.06], [0.76, -0.04, 0.0]]} radius={0.018} waveColor="#34d399" speed={1.4} />
            {/* PLCgamma pathway -> IP3 / Ca2+ synaptic potentiation */}
            <NeuralPathwayTube points={[[0.18, -0.18, 0], [0.40, -0.26, 0.05], [0.72, -0.16, 0.02]]} radius={0.018} waveColor="#38bdf8" speed={1.7} />

            <MoleculeSwarm count={65} color="#fde047" emissive="#fbbf24" radius={0.016} bounds={[0.8, 0.6, 0.5]} origin={[0.45, 0, 0]} speed={0.5} flowDir={[0.8, 0, 0]} />
          </>
        )}

        {/* Sub-view 2: LTP AMPA insertion & actin spine growth */}
        {subView === 'ltp_spine' && (
          <group ref={insertedAmpaRef} position={[0.14, 0, 0]}>
            {[-0.24, -0.08, 0.08, 0.24].map((ry, i) => (
              <mesh key={i} position={[0, ry, 0.24 * Math.sin(i + 1)]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.026, 0.032, 0.075, 10]} />
                <meshStandardMaterial color="#22d3ee" emissive="#38bdf8" emissiveIntensity={1.1} />
              </mesh>
            ))}
            <MoleculeSwarm count={70} color="#4ade80" emissive="#22c55e" radius={0.015} bounds={[0.55, 0.5, 0.5]} origin={[0.25, 0, 0]} speed={0.65} flowDir={[0.6, 0.3, 0]} />
          </group>
        )}

        {/* Sub-view 3: Hippocampus DG->CA3->CA1 trisynaptic loop & PFC network */}
        {subView === 'hippocampus_pfc' && (
          <>
            <NeuralPathwayTube points={[[0.22, -0.18, -0.04], [0.24, -0.10, 0.08], [0.16, 0.02, 0.14], [0.18, 0.08, -0.38]]} radius={0.018} waveColor="#fbbf24" speed={1.7} />
            <NeuralPathwayTube points={[[-0.22, -0.18, -0.04], [-0.24, -0.10, 0.08], [-0.16, 0.02, 0.14], [-0.18, 0.08, -0.38]]} radius={0.018} waveColor="#38bdf8" speed={1.7} />
          </>
        )}
      </group>
    </group>
  );
}
