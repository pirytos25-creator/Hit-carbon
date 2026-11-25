import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { MoleculeSwarm } from './MolecularSimulation';
import { createMembraneProtonMaterial } from '../shaders/membraneProtonShader';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';

/**
 * Akt V — Benchmark C: Monumentalna Maszyneria Mitochondrialna:
 * - Głęboka katedra grzebieni mitochondrialnych z teksturami błonowymi PBR
 * - Realne kompleksy oddechowe z Cryo-EM PDB 5XTD (Kompleks I, III2, IV) z kaskadą transportu e⁻
 * - Realna ludzka syntaza F1F0-ATP z Cryo-EM PDB 8H9T:
 *   obrotowy pierścień c8 + asymetryczny trzonek gamma (F0_Membrane_Ring_Pivot) oraz
 *   3 konformacyjne Shape Keys korony katalitycznej F1 (`Catalytic_Open`, `Catalytic_Loose`, `Catalytic_Tight`)!
 */
export function Act05EnergyMitochondria() {
  const { scene } = useGLTF(MODEL_PATHS.mitochondrion);
  const mitoTechnicalMode = useBiogenesisStore((s) => s.mitoTechnicalMode);
  const protonOverlayRef = useRef<THREE.Mesh>(null);
  const atpBurstRefs = useRef<THREE.Mesh[]>([]);
  const rotorAngleRef = useRef(0);
  const prevMasterTimeRef = useRef(liveSimulationRef.masterTimeSec);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (obj.name.startsWith('Inner_Crista') || obj.name.startsWith('Mitochondrion_Outer')) {
          applyBioPbrSurface(mat, 'membrane', 0.72, 6, 4);
        }
        obj.material = mat;
      }
    });
    return c;
  }, [scene]);

  const refs = useMemo(() => {
    return {
      rotor: cloned.getObjectByName('F0_Membrane_Ring_Pivot') ?? null,
      f1Hexamer: cloned.getObjectByName('F1_Catalytic_Hexamer') as THREE.Mesh | null,
      outer: cloned.getObjectByName('Mitochondrion_Outer_Membrane') as THREE.Mesh | null,
      complex1: cloned.getObjectByName('ETC_Complex_I_5XTD') as THREE.Mesh | null,
      complex3: cloned.getObjectByName('ETC_Complex_III2_5XTD') as THREE.Mesh | null,
      complex4: cloned.getObjectByName('ETC_Complex_IV_5XTD') as THREE.Mesh | null,
      coq: cloned.getObjectByName('Carrier_Coenzyme_Q') as THREE.Mesh | null,
      cytc: cloned.getObjectByName('Carrier_Cytochrome_C') as THREE.Mesh | null,
    };
  }, [cloned]);

  const protonShader = useMemo(
    () => createMembraneProtonMaterial({ primaryColor: '#f97316', secondaryColor: '#38bdf8', opacity: 0.28 }),
    []
  );

  useEffect(() => {
    return () => {
      protonShader.dispose();
      cloned.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [cloned, protonShader]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, Math.max(0, delta));
    const store = useBiogenesisStore.getState();
    const org = liveSimulationRef.organism;
    const oxFactor = Math.max(0.35, (org.energyShares.oxidative / 55) * (0.7 + org.atpTurnoverMultiplier / 950));

    // FPS-independent deterministic advancement of rotary ATP Synthase
    const timeJump = Math.abs(liveSimulationRef.masterTimeSec - prevMasterTimeRef.current);
    prevMasterTimeRef.current = liveSimulationRef.masterTimeSec;
    if (timeJump > 0.45 && store.mode !== 'interactive') {
      rotorAngleRef.current = liveSimulationRef.masterTimeSec * 3.8 * oxFactor;
    } else if (store.started && store.isPlaying) {
      rotorAngleRef.current += dt * store.playbackSpeed * 3.8 * oxFactor;
    }

    const theta = rotorAngleRef.current;

    // 1. Rotate c8-ring & asymmetric gamma rotor stalk smoothly around biological axis (+Y in GLTF)
    if (refs.rotor) {
      refs.rotor.rotation.y = theta;
    }

    // 2. Drive Paul Boyer's 3-state conformational Shape Keys on F1 catalytic beta subunits (Open -> Loose -> Tight)
    if (refs.f1Hexamer && refs.f1Hexamer.morphTargetDictionary && refs.f1Hexamer.morphTargetInfluences) {
      const dict = refs.f1Hexamer.morphTargetDictionary;
      const inf = refs.f1Hexamer.morphTargetInfluences;
      const setMorph = (k: string, phaseOffset: number) => {
        if (dict[k] !== undefined) {
          inf[dict[k]] = 0.5 + 0.5 * Math.sin(theta * 3.0 + phaseOffset);
        }
      };
      setMorph('Catalytic_Open', 0.0);
      setMorph('Catalytic_Loose', (Math.PI * 2) / 3);
      setMorph('Catalytic_Tight', (Math.PI * 4) / 3);
    }

    // 3. Sequential Electron Transport Chain pulse (Complex I -> CoQ -> Complex III2 -> Cyt c -> Complex IV)
    const ePhase = (theta * 0.42) % (Math.PI * 2);
    const pulseAt = (centerFrac: number) => {
      const dist = Math.abs(((ePhase / (Math.PI * 2) - centerFrac + 1.5) % 1) - 0.5);
      return Math.exp(-Math.pow(dist * 7.5, 2));
    };
    const setEmissive = (mesh: THREE.Mesh | null, p: number) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 0.16 + p * 0.95;
    };
    setEmissive(refs.complex1, pulseAt(0.12));
    setEmissive(refs.coq, pulseAt(0.32));
    setEmissive(refs.complex3, pulseAt(0.50));
    setEmissive(refs.cytc, pulseAt(0.68));
    setEmissive(refs.complex4, pulseAt(0.86));

    // Subtle biological shuttling oscillation for mobile carriers (CoQ & Cyt c)
    if (refs.coq) {
      refs.coq.position.x = -0.82 + Math.sin(ePhase) * 0.14;
    }
    if (refs.cytc) {
      refs.cytc.position.x = -0.28 + Math.cos(ePhase) * 0.14;
    }

    // 4. Outer Membrane Vault technical / cinema mode
    if (refs.outer) {
      const mat = refs.outer.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.wireframe = mitoTechnicalMode;
        mat.opacity = mitoTechnicalMode ? 0.25 : 0.88;
      }
    }

    protonShader.uniforms.uTime.value = theta * 0.45;
    if (protonOverlayRef.current) {
      protonOverlayRef.current.visible = mitoTechnicalMode;
    }

    // 5. ATP synthesized packet bursts rising upward from F1 catalytic crown strictly synced to Tight->Open release!
    const releaseTurn = theta / ((Math.PI * 2) / 3); // 3 ATP per full 360° turn!
    atpBurstRefs.current.forEach((m, idx) => {
      if (!m) return;
      const p = ((releaseTurn * 0.35 + idx * 0.33) % 1 + 1) % 1;
      m.position.set(0.68 + Math.sin(p * 4 + idx) * 0.08, 0.55 + p * 0.58, 0.04 + Math.cos(p * 3 + idx) * 0.08);
      m.scale.setScalar(0.75 + Math.sin(p * Math.PI) * 0.55);
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = (1 - p) * 0.85;
    });
  });

  return (
    <group>
      <pointLight position={[0.4, 2.2, 2.2]} intensity={3.2} color="#fed7aa" />
      <pointLight position={[-1.5, 0.9, 1.8]} intensity={2.2} color="#818cf8" />
      <pointLight position={[0.7, 0.8, 1.2]} intensity={2.6} color="#38bdf8" />

      <primitive object={cloned} />

      {/* Technical H+ electrochemical proton-motive gradient veil */}
      <mesh ref={protonOverlayRef} position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[2.8, 1.1, 16, 8]} />
        <primitive object={protonShader} attach="material" />
      </mesh>

      {/* Newly synthesized ATP molecules detaching cleanly from catalytic beta sites into matrix */}
      {[0, 1, 2].map((idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            if (el) atpBurstRefs.current[idx] = el;
          }}
          position={[0.68, 0.65, 0.04]}
        >
          <dodecahedronGeometry args={[0.042, 0]} />
          <meshStandardMaterial color="#fde047" emissive="#fbbf24" emissiveIntensity={1.25} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* H+ Proton flux driven downward through F0 c8-ring into mitochondrial matrix */}
      <MoleculeSwarm
        count={120}
        color="#38bdf8"
        emissive="#22d3ee"
        radius={0.014}
        bounds={[2.0, 0.75, 0.85]}
        origin={[0.1, 0.28, 0]}
        speed={0.95}
        flowDir={[0.15, 0.95, 0]}
        brownianJitter={0.03}
      />

      {/* Lactate Shuttle (MCT4 -> MCT1) entering organelle fuel stream */}
      <MoleculeSwarm
        count={65}
        color="#a855f7"
        emissive="#c084fc"
        radius={0.018}
        bounds={[3.2, 0.85, 1.0]}
        origin={[-0.2, 0.65, 0.25]}
        speed={0.70}
        flowDir={[1.0, -0.22, 0]}
        brownianJitter={0.025}
      />
    </group>
  );
}
