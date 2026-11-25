import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { createActionPotentialMaterial } from '../shaders/actionPotentialShader';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';

const VESICLE_BASE_POS: [number, number, number][] = [
  [-0.31, 0.12, 0.08],
  [-0.29, -0.11, 0.10],
  [-0.27, 0.04, -0.12],
  [-0.33, -0.04, -0.06],
  [-0.26, 0.15, -0.04],
  [-0.27, -0.15, -0.04],
];

const NT_COLOR: Record<string, string> = {
  glutamatergic: '#38bdf8',
  gabaergic: '#818cf8',
  dopaminergic: '#f59e0b',
  endocannabinoid_retrograde: '#10b981',
};

/**
 * Akt IX — Benchmark D Synapsa (Molekularna Choreografia w Organicznej Sieci Neuronalnej):
 * - Osadzona wewnątrz wielowarstwowego Lasu Neuronów (`neural_forest.glb`), nigdy w czarnej pustce!
 * - Rzeczywiste mechanizmy receptorowe dla 4 rodzin synaps:
 *   1. Glutaminergiczna: otwarcie poru AMPA (PDB 3KG2), wypchnięcie blokera Mg2+ z NMDA + napływ Na+/Ca2+
 *   2. GABA-ergiczna: rozszerzenie beczułki pentameru GABA_A + hiperpolaryzacja błony postsynaptycznej
 *   3. Dopaminergiczna: aktywacja GPCR D1 + fizyczna dysocjacja podjednostki białka G i fala cAMP
 *   4. Wsteczna 2-AG->CB1: wsteczna dyfuzja endokannabinoidu i fizyczne przymknięcie presynaptycznych kanałów CaV
 */
export function Act09InsideSynapse() {
  const { scene: synScene } = useGLTF(MODEL_PATHS.synapse_hero);
  const { scene: forestScene } = useGLTF(MODEL_PATHS.neural_forest);
  const synapsePaused = useBiogenesisStore((s) => s.synapsePaused);
  const synapseStage = useBiogenesisStore((s) => s.synapseStage);
  const synapseType = useBiogenesisStore((s) => s.synapseType);

  const vesicleRefs = useRef<THREE.Mesh[]>([]);
  const ntRefs = useRef<THREE.Mesh[]>([]);
  const caInfluxRefs = useRef<THREE.Mesh[]>([]);
  const gProteinRef = useRef<THREE.Mesh>(null);
  const postIonRefs = useRef<THREE.Mesh[]>([]);
  const localTimeRef = useRef(0);
  const prevMasterTimeRef = useRef(liveSimulationRef.masterTimeSec);

  const apMat = useMemo(
    () => createActionPotentialMaterial({ baseColor: '#0e3a5c', waveColor: '#38f5ff', speed: 1.8, frequency: 1.4 }),
    []
  );

  const clonedSyn = useMemo(() => {
    const c = synScene.clone(true);
    const bdnf = c.getObjectByName('BDNF_Homodimer_1B8M');
    if (bdnf) bdnf.visible = false; // Reserved cleanly for Act X climax

    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.name === 'Neuron_Axon_Shaft') {
          obj.material = apMat;
        } else if (obj.material) {
          const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
          if (obj.name === 'Presynaptic_Bouton' || obj.name === 'Postsynaptic_Dendritic_Spine') {
            applyBioPbrSurface(mat, 'membrane', 0.55, 4, 3);
          }
          obj.material = mat;
        }
      }
    });
    return c;
  }, [synScene, apMat]);

  const clonedForest = useMemo(() => {
    const c = forestScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        mat.transparent = true;
        mat.opacity = 0.72;
        obj.material = mat;
      }
    });
    return c;
  }, [forestScene]);

  const refs = useMemo(() => {
    const g = (n: string) => clonedSyn.getObjectByName(n) as THREE.Mesh | null;
    return {
      ampa: g('Receptors_AMPA'),
      nmda: g('Receptors_NMDA'),
      mgBlocker: g('NMDA_Mg2_Blocker'),
      gaba: g('Receptors_GABAA'),
      gpcr: g('Receptor_GPCR_D1'),
      cb1: g('Receptor_CB1_Group'),
      cav: g('Channel_CaV_Group'),
      spine: g('Postsynaptic_Dendritic_Spine'),
      snare: g('Presynaptic_SNARE_Complexes'),
    };
  }, [clonedSyn]);

  useEffect(() => {
    return () => {
      apMat.dispose();
      [clonedSyn, clonedForest].forEach((r) => {
        r.traverse((o) => {
          if (o instanceof THREE.Mesh && o.name !== 'Neuron_Axon_Shaft') {
            const m = o.material;
            if (Array.isArray(m)) m.forEach((x) => x.dispose());
            else m?.dispose();
          }
        });
      });
    };
  }, [clonedSyn, clonedForest, apMat]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, Math.max(0, delta));
    const store = useBiogenesisStore.getState();

    const timeJump = Math.abs(liveSimulationRef.masterTimeSec - prevMasterTimeRef.current);
    prevMasterTimeRef.current = liveSimulationRef.masterTimeSec;
    if (timeJump > 0.45 && store.mode !== 'interactive') {
      localTimeRef.current = liveSimulationRef.masterTimeSec;
    } else if (store.started && store.isPlaying && !synapsePaused) {
      localTimeRef.current += dt * store.playbackSpeed;
    }
    const t = localTimeRef.current;

    apMat.uniforms.uTime.value = synapsePaused ? (synapseStage / 9) * 0.8 : t;
    const p = synapsePaused ? (synapseStage + 0.4) / 9 : liveSimulationRef.synapseLocalPhase;

    const setMorph = (mesh: THREE.Mesh | null, key: string, val: number) => {
      if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      const idx = mesh.morphTargetDictionary[key];
      if (idx !== undefined) mesh.morphTargetInfluences[idx] = THREE.MathUtils.clamp(val, 0, 1);
    };

    const isGlut = synapseType === 'glutamatergic';
    const isGaba = synapseType === 'gabaergic';
    const isDopa = synapseType === 'dopaminergic';
    const isRetrograde = synapseType === 'endocannabinoid_retrograde';

    // Step 3: Voltage-gated CaV opening & Ca2+ influx
    const caWave = THREE.MathUtils.clamp((p - 0.16) / 0.22, 0, 1) * (1 - THREE.MathUtils.clamp((p - 0.50) / 0.2, 0, 1));
    const caEff = isRetrograde ? caWave * 0.35 : caWave; // CB1 suppresses presynaptic CaV influx!
    caInfluxRefs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = caEff > 0.05;
      const ang = i * 1.57 + 0.4;
      const r = 0.34 - caEff * 0.16;
      m.position.set(-0.22, Math.cos(ang) * r, Math.sin(ang) * r);
    });

    // Step 4-5: SNARE twist & vesicle docking/fusion at active zone X = -0.15
    const dockAmt = THREE.MathUtils.clamp((p - 0.28) / 0.20, 0, 1);
    const resetAmt = THREE.MathUtils.clamp((p - 0.85) / 0.15, 0, 1);
    if (refs.snare) {
      refs.snare.scale.set(1 + dockAmt * 0.22 * (1 - resetAmt), 1, 1);
    }
    vesicleRefs.current.forEach((m, i) => {
      if (!m) return;
      const [bx, by, bz] = VESICLE_BASE_POS[i];
      const x = THREE.MathUtils.lerp(bx, -0.16, dockAmt * (1 - resetAmt));
      m.position.set(x, by * (1 - dockAmt * 0.25), bz * (1 - dockAmt * 0.25));
      m.scale.setScalar(1 - dockAmt * 0.38 * (1 - resetAmt));
    });

    // Step 6-7: Neurotransmitter or retrograde 2-AG cleft diffusion
    const diffAmt = THREE.MathUtils.clamp((p - 0.42) / 0.28, 0, 1);
    const clearAmt = THREE.MathUtils.clamp((p - 0.78) / 0.20, 0, 1);
    ntRefs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = diffAmt > 0.02 && clearAmt < 0.98;
      const yOff = ((i % 5) - 2) * 0.075 + Math.sin(t * 4 + i) * 0.014;
      const zOff = (Math.floor(i / 5) - 1) * 0.075 + Math.cos(t * 3.5 + i) * 0.014;
      if (isRetrograde) {
        const x = THREE.MathUtils.lerp(0.13, -0.16, diffAmt);
        m.position.set(x, yOff * 1.1, zOff * 1.1);
      } else {
        const x = THREE.MathUtils.lerp(-0.13, 0.13, diffAmt) - clearAmt * 0.18;
        m.position.set(x, yOff + clearAmt * 0.12, zOff);
      }
      m.scale.setScalar(1 - clearAmt * 0.65);
    });

    // Step 8-9: Genuinely Distinct Animated Receptor Family Mechanisms!
    const bindWave = THREE.MathUtils.clamp((p - 0.56) / 0.18, 0, 1) * (1 - THREE.MathUtils.clamp((p - 0.90) / 0.10, 0, 1));

    // A) AMPA & NMDA pore dilation + physical Mg2+ block expulsion!
    setMorph(refs.ampa, 'Pore_Open', isGlut ? bindWave : 0);
    setMorph(refs.nmda, 'Pore_Open', isGlut ? Math.max(0, bindWave - 0.15) : 0);
    if (refs.mgBlocker) {
      // Mg2+ pops OUT of NMDA pore into cleft once depolarized in glutamatergic firing!
      const unblock = isGlut ? THREE.MathUtils.smoothstep(bindWave, 0.22, 0.65) : 0;
      refs.mgBlocker.position.set(0.135 - unblock * 0.09, -0.02 + unblock * 0.06, -0.14 + unblock * 0.04);
    }

    // B) GABA_A pentameric Cl- pore barrel expansion + hyperpolarization
    setMorph(refs.gaba, 'Pore_Open', isGaba ? bindWave : 0);

    // Postsynaptic ion rush (Na+/Ca2+ in glutamatergic OR Cl- in GABAergic)
    postIonRefs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = (isGlut || isGaba) && bindWave > 0.1;
      const rush = (t * 0.9 + i * 0.22) % 1;
      m.position.set(0.16 + rush * 0.38, (isGaba ? -0.14 : 0.04) + Math.sin(i + t * 3) * 0.06, Math.cos(i * 1.5) * 0.09);
    });

    // C) Dopaminergic 7TM GPCR rotation + intracellular G-protein detachment & inner-leaflet travel
    if (refs.gpcr) {
      refs.gpcr.rotation.x = isDopa ? bindWave * 0.45 : 0;
    }
    if (gProteinRef.current) {
      gProteinRef.current.visible = isDopa;
      if (isDopa) {
        gProteinRef.current.position.set(0.24 + bindWave * 0.34, Math.sin(t * 2.2) * 0.07, 0.16);
        gProteinRef.current.rotation.y = t * 2.2;
      }
    }

    // D) Retrograde 2-AG -> CB1 receptor activation & presynaptic CaV suppression
    if (refs.cb1) {
      refs.cb1.scale.setScalar(isRetrograde ? 1 + bindWave * 0.32 : 0.88);
    }
    if (refs.cav) {
      refs.cav.scale.setScalar(isRetrograde ? Math.max(0.72, 1 - bindWave * 0.28) : 1.0);
      const cavMat = refs.cav.material as THREE.MeshStandardMaterial;
      if (cavMat) {
        cavMat.emissiveIntensity = isRetrograde ? Math.max(0.12, 0.45 - bindWave * 0.35) : 0.45 + caEff * 1.3;
      }
    }

    if (refs.spine) {
      const spineMat = refs.spine.material as THREE.MeshPhysicalMaterial;
      if (spineMat) {
        spineMat.emissive.set(isGaba ? '#312e81' : isDopa ? '#d97706' : '#0ea5e9');
        spineMat.emissiveIntensity = bindWave * 0.42;
      }
    }
  });

  const ntColor = NT_COLOR[synapseType] ?? '#38bdf8';

  return (
    <group>
      <pointLight position={[0, 1.8, 2.2]} intensity={2.6} color="#e0f2fe" />
      <pointLight position={[-1.5, 0.8, 1.5]} intensity={1.6} color="#38bdf8" />
      <pointLight position={[1.2, -0.5, 1.6]} intensity={1.8} color={ntColor} />

      {/* Organic Neural Forest Surrounding Environment (no void backdrop!) */}
      <group position={[0.2, -0.4, -3.2]} scale={1.5}>
        <primitive object={clonedForest} />
      </group>

      {/* Hero Biological Synapse */}
      <group scale={1.18}>
        <primitive object={clonedSyn} />

        {VESICLE_BASE_POS.map((pos, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) vesicleRefs.current[i] = el;
            }}
            position={pos}
          >
            <sphereGeometry args={[0.044, 14, 10]} />
            <meshStandardMaterial color={ntColor} emissive={ntColor} emissiveIntensity={0.62} transparent opacity={0.88} />
          </mesh>
        ))}

        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) caInfluxRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.020, 10, 8]} />
            <meshStandardMaterial color="#fb7185" emissive="#f43f5e" emissiveIntensity={1.2} />
          </mesh>
        ))}

        {Array.from({ length: 18 }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              if (el) ntRefs.current[i] = el;
            }}
          >
            <icosahedronGeometry args={[0.017, 0]} />
            <meshStandardMaterial color={ntColor} emissive={ntColor} emissiveIntensity={1.05} />
          </mesh>
        ))}

        {/* Postsynaptic Ionotropes rush (Na+/Ca2+ or Cl-) */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={`pi-${i}`}
            ref={(el) => {
              if (el) postIonRefs.current[i] = el;
            }}
            visible={false}
          >
            <sphereGeometry args={[0.015, 8, 6]} />
            <meshStandardMaterial
              color={synapseType === 'gabaergic' ? '#a5b4fc' : '#67e8f9'}
              emissive={synapseType === 'gabaergic' ? '#6366f1' : '#22d3ee'}
              emissiveIntensity={1.3}
            />
          </mesh>
        ))}

        {/* Intracellular GPCR G-protein alpha/cAMP dissociation subunit (Dopaminergic mode) */}
        <mesh ref={gProteinRef} position={[0.26, 0, 0.16]} visible={false}>
          <dodecahedronGeometry args={[0.045, 0]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.15} />
        </mesh>
      </group>
    </group>
  );
}
