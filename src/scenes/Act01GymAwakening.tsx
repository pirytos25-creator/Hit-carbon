import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MODEL_PATHS } from '../core/AssetManager';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { applyAthleteLayerVisibility, upgradeAthleteAndGymMaterials } from './AnatomySystem';
import { MoleculeSwarm } from './MolecularSimulation';
import { createCutawayUniforms } from '../shaders/cutawayShader';

interface AthleteGymSceneProps {
  modeVariant?: 'act1' | 'act6' | 'act11';
}

type GaitKey = 'Idle_Prep' | 'Walk' | 'Jog' | 'Run_Fast' | 'HIIT_Sprint' | 'Recovery_Walk';

const GAIT_META: Record<GaitKey, { strideMeters: number }> = {
  Idle_Prep: { strideMeters: 0.65 },
  Walk: { strideMeters: 1.32 },
  Jog: { strideMeters: 1.92 },
  Run_Fast: { strideMeters: 2.52 },
  HIIT_Sprint: { strideMeters: 3.05 },
  Recovery_Walk: { strideMeters: 1.38 },
};

const GAIT_KEYS = Object.keys(GAIT_META) as GaitKey[];

function computeGaitWeights(speedKmh: number, isRecoveryPhase: boolean): Record<GaitKey, number> {
  const w: Record<GaitKey, number> = {
    Idle_Prep: 0,
    Walk: 0,
    Jog: 0,
    Run_Fast: 0,
    HIIT_Sprint: 0,
    Recovery_Walk: 0,
  };

  if (speedKmh < 0.8) {
    w.Idle_Prep = 1.0;
    return w;
  }

  if (isRecoveryPhase && speedKmh < 7.2) {
    const tWalk = THREE.MathUtils.clamp((speedKmh - 0.8) / 4.0, 0, 1);
    w.Idle_Prep = 1 - tWalk;
    w.Recovery_Walk = tWalk;
    return w;
  }

  if (speedKmh < 5.2) {
    const t = THREE.MathUtils.clamp((speedKmh - 0.8) / 4.4, 0, 1);
    w.Idle_Prep = 1 - t;
    w.Walk = t;
  } else if (speedKmh < 9.8) {
    const t = (speedKmh - 5.2) / 4.6;
    w.Walk = 1 - t;
    w.Jog = t;
  } else if (speedKmh < 14.0) {
    const t = (speedKmh - 9.8) / 4.2;
    w.Jog = 1 - t;
    w.Run_Fast = t;
  } else {
    const t = THREE.MathUtils.clamp((speedKmh - 14.0) / 3.5, 0, 1);
    w.Run_Fast = 1 - t;
    w.HIIT_Sprint = t;
  }
  return w;
}

export function AthleteGymRig({ modeVariant = 'act1' }: AthleteGymSceneProps) {
  const { scene, animations } = useGLTF(MODEL_PATHS.athlete_gym);

  const cutawayUniforms = useMemo(() => createCutawayUniforms(2, '#fb7185'), []);

  const { cloned, skinMaterials, morphTargets, beltSlats, heartProxy } = useMemo(() => {
    const c = cloneSkinned(scene);
    const { skinMaterials: sMats } = upgradeAthleteAndGymMaterials(c, cutawayUniforms);

    const morphMeshes: THREE.Mesh[] = [];
    c.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        morphMeshes.push(obj);
      }
    });

    return {
      cloned: c,
      skinMaterials: sMats,
      morphTargets: morphMeshes,
      beltSlats: c.getObjectByName('Treadmill_Belt_Slats') ?? null,
      heartProxy: c.getObjectByName('Layer_Heart_Proxy') ?? null,
    };
  }, [scene, cutawayUniforms]);

  // Setup AnimationMixer with all 6 glTF NLA gait clips phase-locked for seamless blending
  const mixerState = useMemo(() => {
    const mixer = new THREE.AnimationMixer(cloned);
    const actions: Partial<Record<GaitKey, THREE.AnimationAction>> = {};
    GAIT_KEYS.forEach((key) => {
      const clip = animations.find((a) => a.name === key || a.name.startsWith(key));
      if (clip) {
        const act = mixer.clipAction(clip);
        act.enabled = true;
        act.setLoop(THREE.LoopRepeat, Infinity);
        act.setEffectiveWeight(key === 'Jog' ? 1 : 0);
        act.play();
        actions[key] = act;
      }
    });
    return { mixer, actions };
  }, [cloned, animations]);

  const cycleAccumRef = useRef(0);
  const beltTravelRef = useRef(0);
  const prevMasterTimeRef = useRef(liveSimulationRef.masterTimeSec);

  useEffect(() => {
    return () => {
      mixerState.mixer.stopAllAction();
      cloned.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [cloned, mixerState]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, Math.max(0, delta));
    const store = useBiogenesisStore.getState();
    const org = liveSimulationRef.organism;
    const u = liveSimulationRef.actProgress;

    // Detect seeks vs continuous simulation ticks for 100% FPS-independent & Pause-exact motion
    const timeDelta = Math.abs(liveSimulationRef.masterTimeSec - prevMasterTimeRef.current);
    prevMasterTimeRef.current = liveSimulationRef.masterTimeSec;
    const effDt = store.started && store.isPlaying ? dt * store.playbackSpeed : 0;

    // 1. Gait blending & Foot-to-Treadmill Belt synchronization (ZERO foot sliding)
    const isRecovery = org.workoutPhase === 'cooldown' || org.workoutPhase === 'active_recovery';
    const weights = computeGaitWeights(org.speedKmh, isRecovery);

    let blendedStride = 0;
    let totalW = 0;
    GAIT_KEYS.forEach((k) => {
      const w = weights[k];
      blendedStride += w * GAIT_META[k].strideMeters;
      totalW += w;
    });
    if (totalW > 0.001) blendedStride /= totalW;
    else blendedStride = 1.6;

    const speedMps = org.speedKmh / 3.6;
    if (timeDelta > 0.45 && store.mode !== 'interactive') {
      // Deterministic seek jump
      cycleAccumRef.current = (liveSimulationRef.masterTimeSec * Math.max(0.4, speedMps / Math.max(0.8, blendedStride))) % 1;
      beltTravelRef.current = liveSimulationRef.masterTimeSec * speedMps;
    } else if (effDt > 0) {
      const cycleHz = org.speedKmh < 0.8 ? 0.35 : speedMps / Math.max(0.9, blendedStride);
      cycleAccumRef.current = (cycleAccumRef.current + effDt * cycleHz) % 1;
      beltTravelRef.current += effDt * speedMps;
    }

    // Lock all 6 gait actions to the identical normalized cycle phase so blended strides never scissor
    GAIT_KEYS.forEach((k) => {
      const act = mixerState.actions[k];
      if (!act) return;
      act.setEffectiveWeight(weights[k]);
      act.time = cycleAccumRef.current * act.getClip().duration;
    });
    mixerState.mixer.update(0);

    // Move treadmill slats backward (+Z in Three.js, opposite -Z runner forward facing)
    if (beltSlats) {
      beltSlats.position.z = beltTravelRef.current % 0.105;
    }

    // 2. Shape Keys: Ribcage breathing (`Breath_Expand`) + rising effort face (`Effort_Face`)
    const breathWave = 0.5 - 0.5 * Math.cos(org.breathPhase * Math.PI * 2);
    const breathStrength = THREE.MathUtils.clamp(breathWave * (0.25 + (org.ventilationLpm / 135) * 0.75), 0, 1);
    const effortStrength = THREE.MathUtils.smoothstep(org.speedKmh, 8.5, 17.0);
    morphTargets.forEach((mesh) => {
      const dict = mesh.morphTargetDictionary!;
      const inf = mesh.morphTargetInfluences!;
      if (dict['Breath_Expand'] !== undefined) inf[dict['Breath_Expand']] = breathStrength;
      if (dict['Effort_Face'] !== undefined) inf[dict['Effort_Face']] = effortStrength;
    });

    // 3. Dynamic Sweat Wet Clearcoat Sheen on Skin
    const sweatCoat = THREE.MathUtils.clamp(0.02 + Math.max(0, org.coreTempC - 37.3) * 0.22 + org.sweatRateLph * 0.14, 0.02, 0.34);
    const sweatRough = THREE.MathUtils.clamp(0.42 - org.sweatRateLph * 0.14, 0.20, 0.42);
    skinMaterials.forEach((m) => {
      m.clearcoat = sweatCoat;
      m.clearcoatRoughness = sweatRough;
    });

    // 4. Internal Heart proxy beat synced cleanly to beatPhase
    if (heartProxy) {
      const beat = Math.exp(-Math.pow((org.beatPhase - 0.16) * 6, 2)) * 0.14;
      heartProxy.scale.setScalar(1 + beat);
    }

    // 5. Organic Cutaway Reveal Choreography:
    // Shots 1-4 (0..0.53): Solid realistic athlete
    // Shot 5 (0.53..0.67): Thigh cutaway opens locally on working right quadriceps (-0.14, 0.68, 0.04)
    // Shot 6-8 (0.67..1.0): Expands across torso musculature & circulation prior to scale dive!
    let autoSkinOpacity = 1.0;
    let muscleOpacity = 0.94;
    let cutRadius = 0.0;

    if (modeVariant === 'act1') {
      if (u < 0.52) {
        cutRadius = 0.0;
        autoSkinOpacity = 1.0;
      } else if (u < 0.67) {
        const k = THREE.MathUtils.smoothstep(u, 0.52, 0.67);
        cutRadius = k * 0.44;
        cutawayUniforms.uCutCenter.value.set(-0.14, 0.68, 0.04);
        autoSkinOpacity = 1.0;
      } else {
        const k = THREE.MathUtils.smoothstep(u, 0.67, 0.85);
        cutRadius = 0.44 + k * 0.82;
        cutawayUniforms.uCutCenter.value.set(0.0, THREE.MathUtils.lerp(0.68, 1.06, k), 0.04);
        autoSkinOpacity = 1.0 - k * 0.68;
        muscleOpacity = u < 0.78 ? 0.94 : 0.62;
      }
    } else if (modeVariant === 'act6') {
      cutawayUniforms.uCutCenter.value.set(0.0, 1.12, -0.02);
      cutRadius = 0.36;
      autoSkinOpacity = 1.0;
      muscleOpacity = 0.72;
    } else {
      const k = 1 - THREE.MathUtils.smoothstep(u, 0.10, 0.72);
      cutawayUniforms.uCutCenter.value.set(0.0, 1.12, -0.02);
      cutRadius = k * 0.36;
      autoSkinOpacity = 1.0;
      muscleOpacity = 0.88;
    }

    const finalSkinOpacity =
      store.skinOpacityOverride !== null ? store.skinOpacityOverride : autoSkinOpacity;

    // If user forces full opaque skin via manual slider, close cutaway cleanly
    cutawayUniforms.uCutProgress.value =
      store.skinOpacityOverride !== null && store.skinOpacityOverride > 0.92 ? 0.0 : cutRadius;

    applyAthleteLayerVisibility(
      cloned,
      store.anatomicalLayers,
      finalSkinOpacity,
      muscleOpacity,
      cutawayUniforms.uCutProgress.value > 0.02
    );
  });

  return <primitive object={cloned} />;
}

export function Act01GymAwakening() {
  return (
    <group>
      {/* Natural warm morning daylight pouring through the architectural gym windows on +X */}
      <directionalLight
        position={[4.2, 3.6, 1.4]}
        intensity={2.6}
        color="#fff3df"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0.4, 2.5, 2.1]} intensity={2.2} color="#e2f1ff" distance={8} />
      <pointLight position={[-2.0, 1.5, -1.6]} intensity={1.4} color="#38bdf8" distance={6} />
      <AthleteGymRig modeVariant="act1" />
      <MoleculeSwarm
        count={48}
        color="#bae6fd"
        emissive="#38bdf8"
        radius={0.0055}
        bounds={[3.6, 2.2, 3.6]}
        origin={[0.4, 1.2, 0]}
        speed={0.09}
        flowDir={[-0.15, 0.18, 0.05]}
      />
    </group>
  );
}
