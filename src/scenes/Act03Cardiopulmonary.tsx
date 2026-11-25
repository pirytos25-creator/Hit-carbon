import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef } from '../core/SimulationCore';
import { erythrocyteCameraTarget } from '../director/CameraSystem';
import { InstancedErythrocytes, MoleculeSwarm } from './MolecularSimulation';
import { createVascularFlowMaterial } from '../shaders/vascularFlowShader';

/**
 * Akt III — Serce, płuca i układ krążenia:
 * - Anatomiczny model serca z pracą przedsionków, komór, zastawek i układu SA->AV->Purkinje
 * - Płuca, oskrzela i pęcherzyk płucny z dyfuzją O2 i CO2
 * - Przejrzysta trasa naczyniowa z krwinkami dwuwklęsłymi + kamera podążająca za erytrocytem!
 */
export function Act03Cardiopulmonary() {
  const { scene } = useGLTF(MODEL_PATHS.cardiopulmonary);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        obj.material = (obj.material as THREE.Material).clone();
      }
    });
    return c;
  }, [scene]);

  const parts = useMemo(() => {
    const get = (name: string) => cloned.getObjectByName(name) ?? null;
    return {
      lv: get('Left_Ventricle_Pivot'),
      rv: get('Right_Ventricle_Pivot'),
      la: get('Left_Atrium_Pivot'),
      ra: get('Right_Atrium_Pivot'),
      tricuspid: get('Tricuspid_Valve_Pivot'),
      mitral: get('Mitral_Valve_Pivot'),
      pulmonaryValve: get('Pulmonary_Valve_Pivot'),
      aorticValve: get('Aortic_Valve_Pivot'),
      conduction: get('Conduction_SA_AV_Purkinje') as THREE.Mesh | null,
      lungs: get('Lungs_Assembly'),
    };
  }, [cloned]);

  // Circulatory loop path: Vena Cava -> Right Heart -> Pulmonary Artery -> Alveolar Capillary -> Left Heart -> Aorta -> Muscle Bed
  const circulationCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.22, -0.25, 0.05),  // Venous return
        new THREE.Vector3(-0.16, 0.14, 0.04),   // Right atrium
        new THREE.Vector3(-0.08, -0.06, 0.08),  // Right ventricle
        new THREE.Vector3(0.08, 0.25, 0.06),    // Pulmonary trunk
        new THREE.Vector3(0.95, 0.18, 0.04),    // To Alveolar Capillary bed
        new THREE.Vector3(1.15, 0.0, 0.02),     // Gas exchange zone (O2 binding)
        new THREE.Vector3(0.90, -0.18, -0.04),  // Pulmonary veins back
        new THREE.Vector3(0.14, 0.16, -0.04),   // Left atrium
        new THREE.Vector3(0.12, -0.06, 0.04),   // Left ventricle
        new THREE.Vector3(0.04, 0.36, 0.02),    // Aortic arch
        new THREE.Vector3(-0.18, 0.05, -0.18),  // Descending aorta
        new THREE.Vector3(-0.32, -0.42, -0.05), // Toward working legs
      ],
      true
    );
  }, []);

  const vesselTubeGeo = useMemo(() => new THREE.TubeGeometry(circulationCurve, 110, 0.055, 12, true), [circulationCurve]);
  const vesselMat = useMemo(() => createVascularFlowMaterial({ oxygenation: 0.72, opacity: 0.24 }), []);

  useEffect(() => {
    return () => {
      vesselTubeGeo.dispose();
      vesselMat.dispose();
      cloned.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [cloned, vesselTubeGeo, vesselMat]);

  useFrame(({ clock }) => {
    const org = liveSimulationRef.organism;
    const bp = org.beatPhase;
    const brp = org.breathPhase;

    // 1. Physiological Cardiac Cycle: Atrial systole (0.0..0.18) -> Ventricular systole (0.18..0.48) -> Diastole
    const atrialContract = bp < 0.22 ? Math.sin((bp / 0.22) * Math.PI) * 0.16 : 0;
    const ventContract =
      bp >= 0.18 && bp < 0.52 ? Math.sin(((bp - 0.18) / 0.34) * Math.PI) * (0.15 + (org.strokeVolumeMl - 70) / 550) : 0;

    if (parts.la) parts.la.scale.setScalar(1 - atrialContract);
    if (parts.ra) parts.ra.scale.setScalar(1 - atrialContract);
    if (parts.lv) parts.lv.scale.set(1 - ventContract, 1 - ventContract * 0.65, 1 - ventContract);
    if (parts.rv) parts.rv.scale.set(1 - ventContract, 1 - ventContract * 0.65, 1 - ventContract);

    // AV valves open in diastole, Semilunar valves open in ventricular ejection
    const avOpen = bp >= 0.18 && bp < 0.52 ? 0.55 : 1.0;
    const slOpen = bp >= 0.20 && bp < 0.48 ? 1.0 : 0.45;
    if (parts.tricuspid) parts.tricuspid.scale.setScalar(avOpen);
    if (parts.mitral) parts.mitral.scale.setScalar(avOpen);
    if (parts.pulmonaryValve) parts.pulmonaryValve.scale.setScalar(slOpen);
    if (parts.aorticValve) parts.aorticValve.scale.setScalar(slOpen);

    // Conduction system impulse flash during SA->AV->Purkinje activation
    if (parts.conduction) {
      const m = parts.conduction.material as THREE.MeshStandardMaterial;
      if (m) {
        const wave = bp < 0.30 ? Math.sin((bp / 0.30) * Math.PI) : 0;
        m.emissiveIntensity = 0.8 + wave * 3.2;
      }
    }

    // 2. Lung expansion synced with breathPhase
    if (parts.lungs) {
      const bWave = 0.5 - 0.5 * Math.cos(brp * Math.PI * 2);
      const bScale = 1 + bWave * (0.04 + (org.ventilationLpm / 145) * 0.08);
      parts.lungs.scale.setScalar(bScale);
    }

    vesselMat.uniforms.uTime.value = clock.getElapsedTime();
    vesselMat.uniforms.uBeatPhase.value = bp;
  });

  return (
    <group>
      <pointLight position={[0.4, 1.4, 2.2]} intensity={2.6} color="#fff1f2" />
      <pointLight position={[-1.4, 0.5, 1.5]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[1.4, 0.2, 1.2]} intensity={2.0} color="#fda4af" />

      {/* Scaled anatomical cardiopulmonary pack (centered cleanly) */}
      <group scale={2.15} position={[0, 0.0, 0]}>
        <primitive object={cloned} />
      </group>

      {/* Transparent vascular loop + flowing biconcave erythrocytes */}
      <mesh geometry={vesselTubeGeo} material={vesselMat} />
      <InstancedErythrocytes
        curve={circulationCurve}
        baseCount={280}
        radiusSpread={0.025}
        speedScale={0.09 + (liveSimulationRef.organism.cardiacOutputLpm / 26) * 0.16}
        oxygenationMode="alveolar_transition"
        onHeroSample={(pos, look) => {
          erythrocyteCameraTarget.active = true;
          erythrocyteCameraTarget.position.set(pos.x, pos.y + 0.09, pos.z + 0.26);
          erythrocyteCameraTarget.lookAt.copy(look);
        }}
      />

      {/* O2 molecules diffusing INTO alveolar capillary at hero alveolar sac X = +1.15 */}
      <MoleculeSwarm
        count={80}
        color="#67e8f9"
        emissive="#22d3ee"
        radius={0.016}
        bounds={[0.45, 0.45, 0.45]}
        origin={[1.15, 0.04, 0]}
        speed={0.55}
        flowDir={[0.4, -0.6, 0.2]}
      />
      {/* CO2 molecules diffusing OUT of capillary */}
      <MoleculeSwarm
        count={60}
        color="#a78bfa"
        emissive="#8b5cf6"
        radius={0.016}
        bounds={[0.45, 0.45, 0.45]}
        origin={[1.15, 0.04, 0]}
        speed={0.45}
        flowDir={[-0.3, 0.8, -0.1]}
      />
    </group>
  );
}
