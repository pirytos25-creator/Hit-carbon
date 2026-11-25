import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InstancedErythrocytes, MoleculeSwarm } from './MolecularSimulation';
import { NeuralPathwayTube } from './NeuralSimulation';
import { createVascularFlowMaterial } from '../shaders/vascularFlowShader';
import { createMembraneProtonMaterial } from '../shaders/membraneProtonShader';
import { useBiogenesisStore } from '../core/SimulationCore';

/**
 * Akt VII — Ciało rozmawia z mózgiem:
 * Podróż tętnicą szyjną do jednostki nerwowo-naczyniowej Bariery Krew–Mózg (BBB).
 * Pokazuje wyraźnie selektywność bariery:
 * - Mleczan przenika aktywnie przez transportery MCT1 (fioletowy strumień)
 * - Obwodowe katecholaminy/serotonina zostają zatrzymane przez ścisłe połączenia śródbłonka (bursztynowe odbicie)
 * - Komunikacja nerwowa biegnie równolegle włóknami aferentnymi (nerw błędny)
 */
export function Act07BodyBrainCrosstalk() {
  const blockedNodesRef = useRef<THREE.Mesh[]>([]);
  const mct1ChannelRef = useRef<THREE.Mesh>(null);

  const carotidCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.6, -0.4, 0.0),
        new THREE.Vector3(-1.3, -0.1, 0.12),
        new THREE.Vector3(0.0, 0.05, 0.0),
        new THREE.Vector3(1.2, 0.05, -0.05),
      ]),
    []
  );

  const vesselGeo = useMemo(() => new THREE.TubeGeometry(carotidCurve, 64, 0.36, 18, false), [carotidCurve]);
  const vesselMat = useMemo(() => createVascularFlowMaterial({ oxygenation: 0.94, opacity: 0.24 }), []);
  const bbbMat = useMemo(
    () => createMembraneProtonMaterial({ primaryColor: '#0d9488', secondaryColor: '#38bdf8', opacity: 0.45 }),
    []
  );

  useEffect(() => {
    return () => {
      vesselGeo.dispose();
      vesselMat.dispose();
      bbbMat.dispose();
    };
  }, [vesselGeo, vesselMat, bbbMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    vesselMat.uniforms.uTime.value = t;
    bbbMat.uniforms.uTime.value = t;
    const isPlaying = useBiogenesisStore.getState().isPlaying;

    // Peripheral catecholamines / serotonin bouncing off BBB endothelial tight junctions
    if (isPlaying) {
      blockedNodesRef.current.forEach((m, i) => {
        if (!m) return;
        const p = (t * 0.65 + i * 0.23) % 1;
        // Approach BBB at X = 0.28 and reflect back toward lumen X < 0.24
        const x = p < 0.5 ? -0.35 + p * 1.16 : 0.23 - (p - 0.5) * 0.9;
        m.position.x = x;
        m.position.y = Math.sin(i * 2.1 + t * 2) * 0.24;
        m.position.z = Math.cos(i * 1.7 + t * 1.6) * 0.22;
      });
    }

    if (mct1ChannelRef.current) {
      mct1ChannelRef.current.scale.setScalar(1 + 0.08 * Math.sin(t * 4));
    }
  });

  return (
    <group>
      <pointLight position={[-1.5, 1.4, 2.0]} intensity={2.2} color="#fda4af" />
      <pointLight position={[1.2, 1.2, 2.0]} intensity={2.5} color="#5eead4" />

      {/* Carotid -> Cerebral Capillary Lumen */}
      <mesh geometry={vesselGeo} material={vesselMat} />
      <InstancedErythrocytes curve={carotidCurve} baseCount={110} radiusSpread={0.18} speedScale={0.14} oxygenationMode="arterial" />

      {/* Blood-Brain Barrier Tight Junction Wall at X = +0.34 */}
      <group position={[0.34, 0.05, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.08, 28, 1, true]} />
          <primitive object={bbbMat} attach="material" />
        </mesh>
        {/* Endothelial cells + Tight Junction ring + Astrocyte endfeet */}
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const ang = (idx / 6) * Math.PI * 2;
          return (
            <group key={idx} position={[0, Math.cos(ang) * 0.42, Math.sin(ang) * 0.42]}>
              <mesh>
                <sphereGeometry args={[0.13, 14, 10]} />
                <meshPhysicalMaterial color="#0f766e" roughness={0.35} transparent opacity={0.75} />
              </mesh>
              <mesh position={[0.22, Math.cos(ang) * 0.08, Math.sin(ang) * 0.08]}>
                <sphereGeometry args={[0.11, 12, 10]} />
                <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.3} transparent opacity={0.68} />
              </mesh>
            </group>
          );
        })}

        {/* MCT1 Lactate Selective Transporter Channel in BBB */}
        <mesh ref={mct1ChannelRef} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <torusGeometry args={[0.14, 0.04, 12, 24]} />
          <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={0.95} roughness={0.25} />
        </mesh>
      </group>

      {/* Lactate & selective metabolites crossing through MCT1 into Brain Parenchyma (X > 0.4) */}
      <MoleculeSwarm
        count={75}
        color="#c084fc"
        emissive="#a855f7"
        radius={0.018}
        bounds={[2.1, 0.26, 0.26]}
        origin={[0.45, 0.05, 0]}
        speed={0.65}
        flowDir={[1.0, 0, 0]}
      />

      {/* Muscle IL-6 Myokines signaling hepatic/systemic loop along blood */}
      <MoleculeSwarm
        count={55}
        color="#38bdf8"
        emissive="#22d3ee"
        radius={0.016}
        bounds={[1.8, 0.42, 0.42]}
        origin={[-1.0, 0.0, 0]}
        speed={0.55}
        flowDir={[0.9, 0.1, 0]}
      />

      {/* Peripheral Catecholamines/Serotonin blocked by BBB tight junctions */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) blockedNodesRef.current[i] = el;
          }}
          position={[-0.1, 0, 0]}
        >
          <octahedronGeometry args={[0.028, 0]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.85} />
        </mesh>
      ))}

      {/* Parallel Vagal / Somatosensory Afferent Neural Pathway bypassing blood barrier */}
      <NeuralPathwayTube
        points={[[-2.5, -0.68, 0.3], [-1.0, -0.55, 0.35], [0.35, -0.45, 0.35], [1.45, -0.25, 0.25]]}
        radius={0.024}
        waveColor="#38bdf8"
        speed={2.1}
      />
    </group>
  );
}
