import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { InstancedErythrocytes, MoleculeSwarm } from './MolecularSimulation';
import { NeuralPathwayTube } from './NeuralSimulation';
import { createMembraneProtonMaterial } from '../shaders/membraneProtonShader';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { sampleBloodstreamCenterline, BLOODSTREAM_STAGE_OFFSET } from './Act03Cardiopulmonary';

/**
 * Akt VII — Ciało rozmawia z mózgiem:
 * Umieszcza widza WEWNĄTRZ organicznego śródbłonka naczynia mózgowego (`bloodstream_tunnel.glb`):
 * - Aktywny selektywny transport mleczanu przez transportery MCT1 (fioletowy strumień)
 * - Obwodowa adrenalina i serotonina zatrzymywane przez ścisłe połączenia śródbłonka (Tight Junctions)
 * - Równoległy afferencyjny nerw błędny przekazujący sygnał poza barierą krwi
 */
export function Act07BodyBrainCrosstalk() {
  const { scene: tunnelScene } = useGLTF(MODEL_PATHS.bloodstream_tunnel);
  const blockedNodesRef = useRef<THREE.Mesh[]>([]);
  const mct1ChannelRef = useRef<THREE.Mesh>(null);
  const localTimeRef = useRef(0);
  const prevMasterTimeRef = useRef(liveSimulationRef.masterTimeSec);

  const clonedTunnel = useMemo(() => {
    const c = tunnelScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (obj.name.startsWith('Endothelium_')) {
          applyBioPbrSurface(mat, 'endothelium', 0.88, 10, 4);
        }
        obj.material = mat;
      }
    });
    return c;
  }, [tunnelScene]);

  const carotidCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const p = sampleBloodstreamCenterline(i / 20);
      p.y -= BLOODSTREAM_STAGE_OFFSET.y;
      pts.push(p);
    }
    return new THREE.CatmullRomCurve3(pts, false);
  }, []);

  const bbbMat = useMemo(
    () => createMembraneProtonMaterial({ primaryColor: '#0d9488', secondaryColor: '#38bdf8', opacity: 0.42 }),
    []
  );

  useEffect(() => {
    return () => {
      bbbMat.dispose();
      clonedTunnel.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [clonedTunnel, bbbMat]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, Math.max(0, delta));
    const store = useBiogenesisStore.getState();

    const timeJump = Math.abs(liveSimulationRef.masterTimeSec - prevMasterTimeRef.current);
    prevMasterTimeRef.current = liveSimulationRef.masterTimeSec;
    if (timeJump > 0.45 && store.mode !== 'interactive') {
      localTimeRef.current = liveSimulationRef.masterTimeSec;
    } else if (store.started && store.isPlaying) {
      localTimeRef.current += dt * store.playbackSpeed;
    }
    const t = localTimeRef.current;

    bbbMat.uniforms.uTime.value = t;

    // Peripheral catecholamines / serotonin bouncing back from BBB endothelial tight junctions
    blockedNodesRef.current.forEach((m, i) => {
      if (!m) return;
      const p = (t * 0.55 + i * 0.19) % 1;
      const x = p < 0.5 ? -0.45 + p * 1.35 : 0.22 - (p - 0.5) * 1.1;
      m.position.x = x;
      m.position.y = Math.sin(i * 2.1 + t * 1.8) * 0.28 + 0.05;
      m.position.z = Math.cos(i * 1.7 + t * 1.4) * 0.28 - 0.55;
    });

    if (mct1ChannelRef.current) {
      mct1ChannelRef.current.scale.setScalar(1 + 0.08 * Math.sin(t * 3.8));
    }
  });

  // Wall barrier seated perpendicular to centerline around X = +0.34, Z ~ -0.58
  return (
    <group>
      <pointLight position={[-1.8, 1.0, 0.8]} intensity={3.8} color="#fda4af" distance={9} />
      <pointLight position={[1.2, 0.8, 0.4]} intensity={4.0} color="#5eead4" distance={9} />
      <pointLight position={[0.2, 0.2, -0.5]} intensity={2.8} color="#38bdf8" distance={7} />

      <primitive object={clonedTunnel} />

      <InstancedErythrocytes
        curve={carotidCurve}
        baseCount={180}
        cellRadius={0.048}
        radiusSpread={0.38}
        speedScale={0.12}
        oxygenationMode="arterial"
        capillaryDeformRange={[0.55, 0.96]}
      />

      {/* Blood-Brain Barrier Tight Junction Wall at vessel constriction */}
      <group position={[0.38, 0.02, -0.78]} rotation={[0, -0.35, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.08, 28, 1, true]} />
          <primitive object={bbbMat} attach="material" />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const ang = (idx / 6) * Math.PI * 2;
          return (
            <group key={idx} position={[0, Math.cos(ang) * 0.55, Math.sin(ang) * 0.55]}>
              <mesh>
                <sphereGeometry args={[0.14, 14, 10]} />
                <meshPhysicalMaterial color="#0f766e" roughness={0.34} transparent opacity={0.78} />
              </mesh>
              <mesh position={[0.24, Math.cos(ang) * 0.09, Math.sin(ang) * 0.09]}>
                <sphereGeometry args={[0.11, 12, 10]} />
                <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.32} transparent opacity={0.7} />
              </mesh>
            </group>
          );
        })}

        {/* MCT1 Lactate Selective Transporter Channel in BBB */}
        <mesh ref={mct1ChannelRef} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <torusGeometry args={[0.16, 0.042, 12, 24]} />
          <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={1.05} roughness={0.25} />
        </mesh>
      </group>

      {/* Lactate crossing selectively through MCT1 into Brain Parenchyma */}
      <MoleculeSwarm
        count={80}
        color="#c084fc"
        emissive="#a855f7"
        radius={0.017}
        bounds={[2.4, 0.35, 0.35]}
        origin={[0.85, 0.02, -0.72]}
        speed={0.62}
        flowDir={[1.0, 0, 0]}
        brownianJitter={0.025}
      />

      {/* Muscle IL-6 Myokines arriving along vessel */}
      <MoleculeSwarm
        count={55}
        color="#38bdf8"
        emissive="#22d3ee"
        radius={0.015}
        bounds={[2.2, 0.45, 0.45]}
        origin={[-1.4, 0.05, -0.45]}
        speed={0.55}
        flowDir={[0.9, 0.0, -0.2]}
      />

      {/* Peripheral Catecholamines/Serotonin blocked by BBB tight junctions */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) blockedNodesRef.current[i] = el;
          }}
          position={[-0.1, 0, -0.5]}
        >
          <octahedronGeometry args={[0.028, 0]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.9} />
        </mesh>
      ))}

      {/* Parallel Vagal / Somatosensory Afferent Neural Pathway bypassing barrier */}
      <NeuralPathwayTube
        points={[[-3.2, -0.55, 0.15], [-1.2, -0.42, -0.35], [0.4, -0.35, -0.45], [2.2, -0.20, 0.05]]}
        radius={0.028}
        waveColor="#38bdf8"
        speed={2.1}
      />
    </group>
  );
}
