import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { applyAthleteLayerVisibility } from './AnatomySystem';
import { MoleculeSwarm } from './MolecularSimulation';

interface AthleteGymSceneProps {
  modeVariant?: 'act1' | 'act6' | 'act11';
}

export function AthleteGymRig({ modeVariant = 'act1' }: AthleteGymSceneProps) {
  const { scene } = useGLTF(MODEL_PATHS.athlete_gym);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material = (obj.material as THREE.Material).clone();
        }
      }
    });
    return c;
  }, [scene]);

  const pivots = useMemo(() => {
    const get = (name: string) => cloned.getObjectByName(name) ?? null;
    return {
      pelvis: get('Pelvis_Pivot'),
      spine: get('Spine_Pivot'),
      chestBreath: get('Chest_Breath_Pivot'),
      head: get('Head_Pivot'),
      shL: get('Shoulder_L_Pivot'),
      elL: get('Elbow_L_Pivot'),
      shR: get('Shoulder_R_Pivot'),
      elR: get('Elbow_R_Pivot'),
      hipL: get('Hip_L_Pivot'),
      kneeL: get('Knee_L_Pivot'),
      ankleL: get('Ankle_L_Pivot'),
      hipR: get('Hip_R_Pivot'),
      kneeR: get('Knee_R_Pivot'),
      ankleR: get('Ankle_R_Pivot'),
      beltSlats: get('Treadmill_Belt_Slats'),
      consoleScreen: get('Treadmill_Console_Screen'),
      heartProxy: get('Layer_Heart_Proxy'),
    };
  }, [cloned]);

  const basePelvisY = useRef<number | null>(null);
  useEffect(() => {
    if (pivots.pelvis && basePelvisY.current === null) {
      basePelvisY.current = pivots.pelvis.position.y;
    }
    return () => {
      cloned.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [cloned, pivots]);

  useFrame(() => {
    const org = liveSimulationRef.organism;
    const u = liveSimulationRef.actProgress;
    const state = useBiogenesisStore.getState();

    // 1. Biomechanical Walk -> Jog -> Sprint Kinematics synced to stridePhase & speedKmh
    const strideRad = org.stridePhase * Math.PI * 2;
    const runRatio = THREE.MathUtils.clamp(org.speedKmh / 16.5, 0, 1);
    const isMoving = org.speedKmh > 0.3;

    const hipAmp = isMoving ? 0.24 + runRatio * 0.56 : 0.02;
    const kneeFlexBase = isMoving ? 0.28 + runRatio * 0.42 : 0.04;
    const kneeAmp = isMoving ? 0.45 + runRatio * 0.65 : 0.02;
    const armAmp = isMoving ? 0.22 + runRatio * 0.68 : 0.03;
    const elbowBend = isMoving ? 0.35 + runRatio * 0.55 : 0.15;

    // Left leg
    const sinL = Math.sin(strideRad);
    const sinR = Math.sin(strideRad + Math.PI);
    if (pivots.hipL) pivots.hipL.rotation.x = sinL * hipAmp;
    if (pivots.hipR) pivots.hipR.rotation.x = sinR * hipAmp;
    if (pivots.kneeL) pivots.kneeL.rotation.x = -(kneeFlexBase + Math.max(0, -Math.cos(strideRad)) * kneeAmp);
    if (pivots.kneeR) pivots.kneeR.rotation.x = -(kneeFlexBase + Math.max(0, -Math.cos(strideRad + Math.PI)) * kneeAmp);
    if (pivots.ankleL) pivots.ankleL.rotation.x = Math.cos(strideRad) * 0.18 * runRatio;
    if (pivots.ankleR) pivots.ankleR.rotation.x = Math.cos(strideRad + Math.PI) * 0.18 * runRatio;

    // Counter-swinging arms
    if (pivots.shL) pivots.shL.rotation.x = sinR * armAmp;
    if (pivots.shR) pivots.shR.rotation.x = sinL * armAmp;
    if (pivots.elL) pivots.elL.rotation.x = elbowBend + Math.max(0, sinR) * 0.25;
    if (pivots.elR) pivots.elR.rotation.x = elbowBend + Math.max(0, sinL) * 0.25;

    // Pelvis vertical bounce & forward trunk lean during fast HIIT sprint
    if (pivots.pelvis && basePelvisY.current !== null) {
      const bounce = isMoving ? Math.abs(Math.sin(strideRad)) * (0.014 + runRatio * 0.036) : 0;
      pivots.pelvis.position.y = basePelvisY.current + bounce;
      pivots.pelvis.rotation.y = Math.cos(strideRad) * 0.05 * (0.3 + runRatio);
    }
    if (pivots.spine) {
      pivots.spine.rotation.x = 0.04 + runRatio * 0.15;
      pivots.spine.rotation.y = -Math.cos(strideRad) * 0.08 * (0.2 + runRatio);
    }
    if (pivots.head) {
      pivots.head.rotation.x = -(0.02 + runRatio * 0.08);
    }

    // Chest respiratory expansion synced to breathPhase
    if (pivots.chestBreath) {
      const bWave = 0.5 - 0.5 * Math.cos(org.breathPhase * Math.PI * 2);
      const bAmp = 0.015 + (org.ventilationLpm / 140) * 0.055;
      pivots.chestBreath.scale.set(1 + bWave * bAmp * 0.7, 1 + bWave * bAmp * 0.4, 1 + bWave * bAmp);
    }

    // Internal Heart Proxy beat synced to beatPhase
    if (pivots.heartProxy) {
      const beat = Math.exp(-Math.pow((org.beatPhase - 0.15) * 6, 2)) * 0.12;
      pivots.heartProxy.scale.setScalar(1 + beat);
    }

    // Treadmill belt slat looping motion synced to speedKmh
    if (pivots.beltSlats) {
      const beltPhase = (liveSimulationRef.masterTimeSec * (org.speedKmh / 3.6)) % 0.105;
      pivots.beltSlats.position.z = beltPhase;
    }

    // Anatomical skin reveal choreography:
    // Act 1: Solid skin 0..0.38 -> progressive semi-transparent reveal 0.38..0.88 -> dive into nervous system
    // Act 6: Semi-transparent X-ray physiological view at peak HIIT
    // Act 11: Reverse transition returning to opaque outer skin in warm cooldown
    let autoSkinOpacity = 1.0;
    let muscleOpacity = 0.85;
    if (modeVariant === 'act1') {
      autoSkinOpacity = u < 0.36 ? 1.0 : u < 0.86 ? 1.0 - ((u - 0.36) / 0.50) * 0.84 : 0.16;
      muscleOpacity = u < 0.62 ? 0.92 : 0.55;
    } else if (modeVariant === 'act6') {
      autoSkinOpacity = 0.24;
      muscleOpacity = 0.68;
    } else {
      autoSkinOpacity = Math.min(1.0, 0.22 + u * 0.95);
      muscleOpacity = 0.88;
    }

    const finalSkinOpacity =
      state.skinOpacityOverride !== null ? state.skinOpacityOverride : autoSkinOpacity;

    applyAthleteLayerVisibility(cloned, state.anatomicalLayers, finalSkinOpacity, muscleOpacity);
  });

  return <primitive object={cloned} />;
}

export function Act01GymAwakening() {
  return (
    <group>
      <pointLight position={[0, 2.75, 0.8]} intensity={3.8} color="#e0f2fe" distance={8} />
      <pointLight position={[-1.8, 1.4, -1.6]} intensity={2.2} color="#38bdf8" distance={6} />
      <pointLight position={[1.8, 1.2, 1.8]} intensity={1.8} color="#fb7185" distance={6} />
      <AthleteGymRig modeVariant="act1" />
      <MoleculeSwarm
        count={65}
        color="#38bdf8"
        radius={0.008}
        bounds={[3.6, 2.4, 3.6]}
        origin={[0, 1.2, 0]}
        speed={0.12}
        flowDir={[0, 0.2, 0.1]}
      />
    </group>
  );
}
