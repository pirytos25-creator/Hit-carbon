import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { MoleculeSwarm } from './MolecularSimulation';
import { createMembraneProtonMaterial } from '../shaders/membraneProtonShader';

/**
 * Akt V — Wojna o energię, wnętrze mitochondrium i czółenko mleczanowe:
 * - Błona zewnętrzna (poryny), pofałdowane grzebienie, macierz, kompleksy ETC I-IV
 * - Obrotowy rotor molekularny F0F1-ATP Syntazy napędzany gradientem protonowym H+
 * - Tryb filmowy vs tryb molekularno-techniczny (wyraźna symbolika, nie "magiczne kulki")
 * - Transport mleczanu (MCT4 -> MCT1) do serca, mięśni tlenowych i mózgu
 */
export function Act05EnergyMitochondria() {
  const { scene } = useGLTF(MODEL_PATHS.mitochondrion);
  const mitoTechnicalMode = useBiogenesisStore((s) => s.mitoTechnicalMode);
  const protonOverlayRef = useRef<THREE.Mesh>(null);
  const atpRingsRef = useRef<THREE.Mesh[]>([]);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        obj.material = (obj.material as THREE.Material).clone();
      }
    });
    return c;
  }, [scene]);

  const rotors = useMemo(() => {
    return {
      f0: cloned.getObjectByName('F0_Membrane_Ring_Pivot') ?? null,
      gamma: cloned.getObjectByName('Gamma_Rotor_Stalk_Pivot') ?? null,
      outer: cloned.getObjectByName('Mitochondrion_Outer_Membrane') as THREE.Mesh | null,
    };
  }, [cloned]);

  const protonShader = useMemo(
    () => createMembraneProtonMaterial({ primaryColor: '#f97316', secondaryColor: '#38bdf8', opacity: 0.25 }),
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

  useFrame(({ clock }, delta) => {
    const dt = Math.min(0.05, delta);
    const org = liveSimulationRef.organism;
    const isPlaying = useBiogenesisStore.getState().isPlaying;
    const oxFactor = Math.max(0.25, org.energyShares.oxidative / 55);

    if (isPlaying) {
      const spinVel = dt * 3.8 * oxFactor;
      if (rotors.f0) rotors.f0.rotation.y += spinVel; // In GLTF Y-up, Blender Z-axis becomes Y
      if (rotors.gamma) rotors.gamma.rotation.y += spinVel;
    }

    // Technical mode: turn outer membrane into wireframe/more transparent & boost proton gradient veil
    if (rotors.outer) {
      const mat = rotors.outer.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.wireframe = mitoTechnicalMode;
        mat.opacity = mitoTechnicalMode ? 0.22 : 0.42;
      }
    }

    protonShader.uniforms.uTime.value = clock.getElapsedTime();
    if (protonOverlayRef.current) {
      protonOverlayRef.current.visible = mitoTechnicalMode;
    }

    // ATP synthesis halo pulse above F1 catalytic hexamer
    const t = clock.getElapsedTime();
    atpRingsRef.current.forEach((m, idx) => {
      if (!m) return;
      const p = ((t * 0.9 * oxFactor + idx * 0.33) % 1);
      m.position.y = 0.62 + p * 0.45;
      m.scale.setScalar(0.6 + p * 0.6);
      const mat = m.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = (1 - p) * 0.65;
    });
  });

  return (
    <group>
      <pointLight position={[0.4, 2.2, 2.0]} intensity={2.8} color="#fed7aa" />
      <pointLight position={[-1.5, 0.8, 1.5]} intensity={2.0} color="#818cf8" />
      <pointLight position={[0.5, 0.6, 0.5]} intensity={2.4} color="#38bdf8" />

      <primitive object={cloned} />

      {/* Technical mode H+ electrochemical gradient plane */}
      <mesh ref={protonOverlayRef} position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[2.1, 0.85, 16, 8]} />
        <primitive object={protonShader} attach="material" />
      </mesh>

      {/* ATP synthesis rings rising from F1 hexamer (symbolic chemical bond energy release) */}
      {[0, 1, 2].map((idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            if (el) atpRingsRef.current[idx] = el;
          }}
          position={[0.46, 0.65, -0.04]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.14, 0.014, 10, 28]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* H+ Proton flux driven downward through F0 c-ring into matrix */}
      <MoleculeSwarm
        count={110}
        color="#38bdf8"
        emissive="#22d3ee"
        radius={0.014}
        bounds={[1.4, 0.55, 0.55]}
        origin={[0.1, 0.25, 0]}
        speed={1.0}
        flowDir={[0.2, 0.9, 0]}
      />

      {/* Lactate Shuttle stream entering mitochondrion via MCT1 & traveling to heart/brain */}
      <MoleculeSwarm
        count={65}
        color="#a855f7"
        emissive="#c084fc"
        radius={0.020}
        bounds={[2.8, 0.7, 0.9]}
        origin={[-0.2, 0.65, 0.25]}
        speed={0.75}
        flowDir={[1.0, -0.25, 0]}
      />
    </group>
  );
}
