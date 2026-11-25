import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { createActionPotentialMaterial } from '../shaders/actionPotentialShader';

const VESICLE_BASE_POS: [number, number, number][] = [
  [-0.30, 0.12, 0.08],
  [-0.28, -0.11, 0.10],
  [-0.26, 0.04, -0.12],
  [-0.32, -0.04, -0.06],
  [-0.25, 0.16, -0.04],
  [-0.26, -0.16, -0.04],
];

const NT_COLOR: Record<string, string> = {
  glutamatergic: '#38bdf8',
  gabaergic: '#818cf8',
  dopaminergic: '#f59e0b',
  endocannabinoid_retrograde: '#10b981',
};

/**
 * Akt IX — Podróż do wnętrza synapsy:
 * 9-etapowa animacja transmisji synaptycznej wzdłuż aksonu mielinowego (przewężenia Ranviera)
 * i szczeliny synaptycznej z możliwością zatrzymania czasu, obrotu kamery i wyboru 4 typów synaps.
 */
export function Act09InsideSynapse() {
  const { scene } = useGLTF(MODEL_PATHS.brain_synapse);
  const synapsePaused = useBiogenesisStore((s) => s.synapsePaused);
  const synapseStage = useBiogenesisStore((s) => s.synapseStage);
  const synapseType = useBiogenesisStore((s) => s.synapseType);

  const vesicleRefs = useRef<THREE.Mesh[]>([]);
  const ntRefs = useRef<THREE.Mesh[]>([]);
  const caInfluxRefs = useRef<THREE.Mesh[]>([]);
  const gProteinRef = useRef<THREE.Mesh>(null);

  const apMat = useMemo(
    () => createActionPotentialMaterial({ baseColor: '#0e3a5c', waveColor: '#38f5ff', speed: 1.8, frequency: 1.4 }),
    []
  );

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const macro = c.getObjectByName('Brain_Macro_Assembly');
    const syn = c.getObjectByName('Synapse_Hero_Assembly');
    if (macro) macro.visible = false;
    if (syn) {
      syn.visible = true;
      syn.position.set(0, 0, 0); // Center Hero Synapse at origin!
    }

    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.name === 'Neuron_Axon_Shaft') {
          obj.material = apMat;
        } else if (obj.material) {
          obj.material = (obj.material as THREE.Material).clone();
        }
      }
    });
    return c;
  }, [scene, apMat]);

  const receptorGroups = useMemo(
    () => ({
      ampa: cloned.getObjectByName('Receptors_AMPA') as THREE.Mesh | null,
      nmda: cloned.getObjectByName('Receptors_NMDA') as THREE.Mesh | null,
      gaba: cloned.getObjectByName('Receptors_GABAA') as THREE.Mesh | null,
      cb1: cloned.getObjectByName('Receptor_CB1_Group') as THREE.Mesh | null,
      cav: cloned.getObjectByName('Channel_CaV_Group') as THREE.Mesh | null,
      spine: cloned.getObjectByName('Postsynaptic_Dendritic_Spine') as THREE.Mesh | null,
    }),
    [cloned]
  );

  useEffect(() => {
    return () => {
      apMat.dispose();
      cloned.traverse((o) => {
        if (o instanceof THREE.Mesh && o.name !== 'Neuron_Axon_Shaft') {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [cloned, apMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    apMat.uniforms.uTime.value = synapsePaused ? (synapseStage / 9) * 0.8 : t;

    // 9-stage continuous or manually stepped cycle (0..1)
    const p = synapsePaused ? (synapseStage + 0.4) / 9 : liveSimulationRef.synapseLocalPhase;

    // Stage 2-3: CaV open & Ca2+ influx
    const caWave = THREE.MathUtils.clamp((p - 0.18) / 0.22, 0, 1) * (1 - THREE.MathUtils.clamp((p - 0.5) / 0.2, 0, 1));
    caInfluxRefs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = caWave > 0.05;
      const ang = i * 1.57 + 0.4;
      const r = 0.36 - caWave * 0.18;
      m.position.set(-0.22, Math.cos(ang) * r, Math.sin(ang) * r);
    });

    // Stage 4-5: Vesicle docking & fusion at active zone X = -0.15
    const dockAmt = THREE.MathUtils.clamp((p - 0.30) / 0.20, 0, 1);
    const resetAmt = THREE.MathUtils.clamp((p - 0.85) / 0.15, 0, 1);
    vesicleRefs.current.forEach((m, i) => {
      if (!m) return;
      const [bx, by, bz] = VESICLE_BASE_POS[i];
      const targetX = -0.16;
      const x = THREE.MathUtils.lerp(bx, targetX, dockAmt * (1 - resetAmt));
      m.position.set(x, by * (1 - dockAmt * 0.25), bz * (1 - dockAmt * 0.25));
      m.scale.setScalar(1 - dockAmt * 0.35 * (1 - resetAmt));
    });

    // Stage 6-7: Neurotransmitter diffusion across 20nm cleft (or retrograde 2-AG back toward CB1!)
    const isRetrograde = synapseType === 'endocannabinoid_retrograde';
    const diffAmt = THREE.MathUtils.clamp((p - 0.44) / 0.28, 0, 1);
    const clearAmt = THREE.MathUtils.clamp((p - 0.78) / 0.20, 0, 1);

    ntRefs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = diffAmt > 0.02 && clearAmt < 0.98;
      const yOff = ((i % 5) - 2) * 0.08 + Math.sin(t * 4 + i) * 0.015;
      const zOff = (Math.floor(i / 5) - 1) * 0.08 + Math.cos(t * 3.5 + i) * 0.015;
      if (isRetrograde) {
        // Synthesized postsynaptically (+0.13) -> travels BACKWARD to presynaptic CB1 (-0.17)
        const x = THREE.MathUtils.lerp(0.12, -0.16, diffAmt);
        m.position.set(x, yOff * 1.1, zOff * 1.1);
      } else {
        // Released presynaptically (-0.13) -> travels forward to postsynaptic receptors (+0.12)
        const x = THREE.MathUtils.lerp(-0.13, 0.12, diffAmt) - clearAmt * 0.18;
        m.position.set(x, yOff + clearAmt * 0.12, zOff);
      }
      m.scale.setScalar(1 - clearAmt * 0.65);
    });

    // Stage 7-8: Distinct Receptor Responses per Synapse Type!
    const bindWave = THREE.MathUtils.clamp((p - 0.60) / 0.18, 0, 1) * (1 - THREE.MathUtils.clamp((p - 0.88) / 0.12, 0, 1));

    if (receptorGroups.ampa) {
      const active = synapseType === 'glutamatergic';
      receptorGroups.ampa.scale.setScalar(active ? 1 + bindWave * 0.28 : 0.72);
    }
    if (receptorGroups.nmda) {
      const active = synapseType === 'glutamatergic';
      receptorGroups.nmda.scale.setScalar(active ? 1 + bindWave * 0.34 : 0.72);
    }
    if (receptorGroups.gaba) {
      const active = synapseType === 'gabaergic';
      receptorGroups.gaba.scale.setScalar(active ? 1 + bindWave * 0.38 : 0.72);
    }
    if (receptorGroups.cb1) {
      const active = synapseType === 'endocannabinoid_retrograde';
      receptorGroups.cb1.scale.setScalar(active ? 1 + bindWave * 0.42 : 0.85);
    }
    if (receptorGroups.cav) {
      // CB1 retrograde inhibition dampens CaV channel glow!
      const cavMat = receptorGroups.cav.material as THREE.MeshStandardMaterial;
      if (cavMat) {
        cavMat.emissiveIntensity = isRetrograde ? 0.25 : 0.45 + caWave * 1.4;
      }
    }
    if (receptorGroups.spine) {
      const spineMat = receptorGroups.spine.material as THREE.MeshPhysicalMaterial;
      if (spineMat) {
        const resp = bindWave * (synapseType === 'gabaergic' ? -0.2 : 0.45);
        spineMat.emissive.set(synapseType === 'gabaergic' ? '#312e81' : '#0ea5e9');
        spineMat.emissiveIntensity = Math.max(0, resp);
      }
    }

    // Dopaminergic GPCR intracellular G-protein dissociation animation
    if (gProteinRef.current) {
      gProteinRef.current.visible = synapseType === 'dopaminergic';
      if (synapseType === 'dopaminergic') {
        gProteinRef.current.position.set(0.24 + bindWave * 0.28, Math.sin(t * 2) * 0.08, 0.04);
        gProteinRef.current.rotation.y = t * 2.2;
      }
    }
  });

  const ntColor = NT_COLOR[synapseType] ?? '#38bdf8';

  return (
    <group>
      <pointLight position={[0, 1.8, 2.2]} intensity={2.6} color="#e0f2fe" />
      <pointLight position={[-1.5, 0.8, 1.5]} intensity={1.6} color="#38bdf8" />
      <pointLight position={[1.2, -0.5, 1.6]} intensity={1.8} color={ntColor} />

      <group scale={1.15}>
        <primitive object={cloned} />

        {/* Presynaptic Vesicles */}
        {VESICLE_BASE_POS.map((pos, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) vesicleRefs.current[i] = el;
            }}
            position={pos}
          >
            <sphereGeometry args={[0.048, 14, 10]} />
            <meshStandardMaterial color={ntColor} emissive={ntColor} emissiveIntensity={0.65} transparent opacity={0.85} />
          </mesh>
        ))}

        {/* Ca2+ ions entering through CaV channels */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) caInfluxRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshStandardMaterial color="#fb7185" emissive="#f43f5e" emissiveIntensity={1.2} />
          </mesh>
        ))}

        {/* Neurotransmitter / Endocannabinoid molecules traversing synaptic cleft */}
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) ntRefs.current[i] = el;
            }}
          >
            <icosahedronGeometry args={[0.018, 0]} />
            <meshStandardMaterial color={ntColor} emissive={ntColor} emissiveIntensity={1.1} />
          </mesh>
        ))}

        {/* Intracellular GPCR G-protein complex (visible in Dopaminergic mode) */}
        <mesh ref={gProteinRef} position={[0.26, 0, 0]} visible={false}>
          <dodecahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.1} />
        </mesh>
      </group>
    </group>
  );
}
