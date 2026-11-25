import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { erythrocyteCameraTarget } from '../director/CameraSystem';
import { InstancedErythrocytes, MoleculeSwarm } from './MolecularSimulation';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';

export const BLOODSTREAM_STAGE_OFFSET = new THREE.Vector3(0, -24, 0);

/** Matches blender/gen_06_bloodstream.py main_center(u) converted to Three.js Y-up space. */
export function sampleBloodstreamCenterline(u: number, out = new THREE.Vector3()): THREE.Vector3 {
  const x = -5.5 + u * 11.0;
  const y = Math.cos(u * Math.PI * 1.1) * 0.30 - 0.08 + BLOODSTREAM_STAGE_OFFSET.y;
  const z = -Math.sin(u * Math.PI * 1.25) * 0.85;
  return out.set(x, y, z);
}

/**
 * Akt III — Serce, płuca i immersyjny krwiobieg (Benchmark B):
 * 1. Pierwsza część: realny model serca i płuc HuBMAP z regionalnymi deformacjami Shape Keys
 *    (skurcz przedsionków, skurcz + skręt śrubowy komór, otwieranie zastawek, wdech płuc i przepony),
 *    fala przewodzenia SA->AV->Purkinje oraz bierna dyfuzja O2/CO2 w pęcherzykach płucnych.
 * 2. Druga część / Lot z erytrocytem: wnętrze organicznego tunelu naczyniowego śródbłonka
 *    z przepływem Poiseuille'a, pulsem tętna i odkształceniami kapilarnymi erytrocytów.
 */
export function Act03Cardiopulmonary() {
  const { scene: cardioScene } = useGLTF(MODEL_PATHS.cardiopulmonary);
  const { scene: tunnelScene } = useGLTF(MODEL_PATHS.bloodstream_tunnel);

  const clonedCardio = useMemo(() => {
    const c = cardioScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (obj.name.startsWith('Heart_Ventricles') || obj.name.startsWith('Heart_Atria')) {
          applyBioPbrSurface(mat, 'myocardium', 0.65, 4, 4);
          mat.color.multiplyScalar(0.76);
          mat.roughness = 0.40;
        }
        obj.material = mat;
      }
    });
    return c;
  }, [cardioScene]);

  const clonedTunnel = useMemo(() => {
    const c = tunnelScene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = (obj.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
        if (obj.name.startsWith('Endothelium_')) {
          applyBioPbrSurface(mat, 'endothelium', 0.9, 10, 4);
        }
        obj.material = mat;
      }
    });
    return c;
  }, [tunnelScene]);

  const parts = useMemo(() => {
    const getMesh = (name: string) => clonedCardio.getObjectByName(name) as THREE.Mesh | null;
    return {
      ventricles: getMesh('Heart_Ventricles'),
      atria: getMesh('Heart_Atria'),
      avValves: getMesh('Heart_Valves_AV'),
      slValves: getMesh('Heart_Valves_SL'),
      conduction: getMesh('Conduction_SA_AV_Purkinje'),
      coronary: getMesh('Great_Arteries_Coronary'),
      lungL: getMesh('Lungs_Parenchyma_L'),
      lungR: getMesh('Lungs_Parenchyma_R'),
      diaphragm: getMesh('Diaphragm_Dome'),
      alveoli: getMesh('Alveolar_Sacs_Mesh'),
    };
  }, [clonedCardio]);

  const bloodstreamCurve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      pts.push(sampleBloodstreamCenterline(i / 24));
    }
    return new THREE.CatmullRomCurve3(pts, false);
  }, []);

  useEffect(() => {
    return () => {
      clonedCardio.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
      clonedTunnel.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [clonedCardio, clonedTunnel]);

  useFrame(() => {
    const org = liveSimulationRef.organism;
    const bp = org.beatPhase;
    const brp = org.breathPhase;
    const u = liveSimulationRef.actProgress;

    const setMorph = (mesh: THREE.Mesh | null, key: string, val: number) => {
      if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      const idx = mesh.morphTargetDictionary[key];
      if (idx !== undefined) {
        mesh.morphTargetInfluences[idx] = THREE.MathUtils.clamp(val, 0, 1);
      }
    };

    // 1. Coordinated Cardiac Cycle via Blender Regional Morph Targets (no uniform scaling!)
    const atrialContract = bp < 0.22 ? Math.sin((bp / 0.22) * Math.PI) : 0;
    const svDrive = THREE.MathUtils.clamp(0.68 + (org.strokeVolumeMl - 70) / 120, 0.55, 1.0);
    const ventContract =
      bp >= 0.16 && bp < 0.52 ? Math.sin(((bp - 0.16) / 0.36) * Math.PI) * svDrive : 0;
    const helicalTwist =
      bp >= 0.18 && bp < 0.50 ? Math.sin(((bp - 0.18) / 0.32) * Math.PI) * svDrive : 0;

    setMorph(parts.atria, 'Atrial_Systole', atrialContract);
    setMorph(parts.ventricles, 'Ventricular_Systole', ventContract);
    setMorph(parts.ventricles, 'Apex_Helical_Twist', helicalTwist);

    // AV valves open in ventricular filling diastole; Semilunar valves snap open in ejection!
    const avOpen = bp >= 0.16 && bp < 0.50 ? 0.08 : 0.95;
    const slOpen = bp >= 0.19 && bp < 0.48 ? 0.98 : 0.06;
    setMorph(parts.avValves, 'Valve_Open', avOpen);
    setMorph(parts.slValves, 'Valve_Open', slOpen);

    // Conduction system SA -> AV -> Purkinje depolarization wave
    if (parts.conduction) {
      const m = parts.conduction.material as THREE.MeshStandardMaterial;
      if (m) {
        const wave = bp < 0.30 ? Math.sin((bp / 0.30) * Math.PI) : 0;
        m.emissiveIntensity = 0.7 + wave * 3.0;
      }
    }

    // Coronary perfusion subtle systolic/diastolic pulse
    if (parts.coronary) {
      const m = parts.coronary.material as THREE.MeshStandardMaterial;
      if (m) {
        const perf = 0.5 + 0.5 * Math.sin((bp - 0.45) * Math.PI * 2);
        m.emissiveIntensity = 0.08 + perf * 0.22;
      }
    }

    // 2. Lung bucket-handle / pump-handle expansion + diaphragm contraction via Morph Targets
    const bWave = 0.5 - 0.5 * Math.cos(brp * Math.PI * 2);
    const breathAmp = THREE.MathUtils.clamp(bWave * (0.35 + (org.ventilationLpm / 140) * 0.65), 0, 1);
    setMorph(parts.lungL, 'Lung_Inspiration', breathAmp);
    setMorph(parts.lungR, 'Lung_Inspiration', breathAmp);
    setMorph(parts.diaphragm, 'Diaphragm_Contract', breathAmp);
    setMorph(parts.alveoli, 'Lung_Inspiration', breathAmp);

    // Reveal unobstructed beating heart during Heart/Valve shots (u < 0.34), then bronchial/alveolar gas exchange (0.34..0.58)
    const setLungOpacity = (lung: THREE.Mesh | null, opacity: number) => {
      if (!lung) return;
      const mat = lung.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.transparent = opacity < 0.99;
        mat.opacity = opacity;
        mat.depthWrite = opacity >= 0.95;
      }
    };
    if (u < 0.34) {
      setLungOpacity(parts.lungL, 0.14);
      setLungOpacity(parts.lungR, 0.12);
    } else if (u < 0.58) {
      setLungOpacity(parts.lungL, 0.55);
      setLungOpacity(parts.lungR, 0.18);
    } else {
      setLungOpacity(parts.lungL, 1.0);
      setLungOpacity(parts.lungR, 1.0);
    }
  });

  const bloodstreamSpeed = 0.085 + (liveSimulationRef.organism.cardiacOutputLpm / 26) * 0.14;

  return (
    <group>
      {/* ZONE A (0,0,0): Real HuBMAP Heart & Lungs + Bronchial-to-Alveolar Gas Exchange */}
      <group>
        <pointLight position={[0.4, 1.4, 2.2]} intensity={2.4} color="#fff1f2" />
        <pointLight position={[-1.4, 0.5, 1.5]} intensity={1.5} color="#7dd3fc" />
        <pointLight position={[1.4, 0.2, 1.2]} intensity={1.8} color="#fda4af" />

        <group scale={2.1} position={[0, 0.0, 0]}>
          <primitive object={clonedCardio} />
        </group>

        {/* Passive thermal Brownian O2 & CO2 gas diffusion at offset Hero Alveolar Cluster (X = +2.48 after 2.1x scale) */}
        <MoleculeSwarm
          count={72}
          color="#67e8f9"
          emissive="#22d3ee"
          radius={0.014}
          bounds={[0.42, 0.42, 0.42]}
          origin={[2.45, 0.04, 0]}
          speed={0.45}
          flowDir={[0.35, -0.45, 0.15]}
          brownianJitter={0.055}
        />
        <MoleculeSwarm
          count={56}
          color="#a78bfa"
          emissive="#8b5cf6"
          radius={0.014}
          bounds={[0.42, 0.42, 0.42]}
          origin={[2.45, 0.04, 0]}
          speed={0.40}
          flowDir={[-0.25, 0.55, -0.1]}
          brownianJitter={0.055}
        />
      </group>

      {/* ZONE B (Y = -24): Benchmark B — Immersive Interior Endothelial Bloodstream Tunnel */}
      <group>
        <group position={BLOODSTREAM_STAGE_OFFSET}>
          <primitive object={clonedTunnel} />
        </group>

        {/* Interior lumen hemoglobin bounce lights positioned along tunnel centerline */}
        <pointLight position={[-3.2, BLOODSTREAM_STAGE_OFFSET.y + 0.1, 0.2]} intensity={4.5} color="#fb7185" distance={9} />
        <pointLight position={[0.0, BLOODSTREAM_STAGE_OFFSET.y + 0.1, -0.5]} intensity={5.2} color="#fda4af" distance={9} />
        <pointLight position={[3.2, BLOODSTREAM_STAGE_OFFSET.y - 0.1, 0.4]} intensity={4.5} color="#f43f5e" distance={8} />

        {/* Poiseuille-profile + Windkessel-pulsatile biconcave RBCs squeezing into narrow capillary bed */}
        <InstancedErythrocytes
          curve={bloodstreamCurve}
          baseCount={360}
          cellRadius={0.044}
          radiusSpread={0.42}
          speedScale={bloodstreamSpeed}
          oxygenationMode="alveolar_transition"
          capillaryDeformRange={[0.66, 0.98]}
          onHeroSample={(pos, _look, tangent) => {
            erythrocyteCameraTarget.active = true;
            erythrocyteCameraTarget.position
              .copy(pos)
              .addScaledVector(tangent, -0.55)
              .add(new THREE.Vector3(0, 0.10, 0.14));
            erythrocyteCameraTarget.lookAt.copy(pos).addScaledVector(tangent, 1.35);
          }}
        />

        {/* Plasma proteins / suspended O2 & metabolic stream flowing inside tunnel */}
        <MoleculeSwarm
          count={90}
          color="#fecdd3"
          emissive="#fb7185"
          radius={0.012}
          bounds={[9.5, 0.85, 0.85]}
          origin={[0, BLOODSTREAM_STAGE_OFFSET.y, 0]}
          speed={0.85}
          flowDir={[1.0, 0.0, 0.0]}
          brownianJitter={0.025}
        />
      </group>
    </group>
  );
}
