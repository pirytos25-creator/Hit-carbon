import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { QUALITY_PRESETS, AdaptiveQualityController } from '../core/QualityManager';
import { performanceMonitor } from '../core/PerformanceMonitor';
import { adaptiveMusicEngine } from '../audio/AdaptiveMusicEngine';
import { spatialAudioSystem } from '../audio/SpatialAudioSystem';
import { narrationEngine } from '../audio/NarrationEngine';
import { CameraSystem, liveCameraMetaRef } from './CameraSystem';
import { ScaleTransitionSystem } from './ScaleTransitionSystem';
import { LightingPresetId } from './ShotChoreography';

const adaptiveController = new AdaptiveQualityController();

interface LightingConfig {
  ambientColor: string;
  ambientIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  keyColor: string;
  keyIntensity: number;
  keyPos: [number, number, number];
  rimColor: string;
  rimIntensity: number;
  rimPos: [number, number, number];
  envIntensity: number;
}

const LIGHTING_CONFIGS: Record<LightingPresetId, LightingConfig> = {
  gym_daylight: {
    ambientColor: '#dbeafe',
    ambientIntensity: 0.46,
    hemiSky: '#e0f2fe',
    hemiGround: '#1e293b',
    hemiIntensity: 0.68,
    keyColor: '#fff5e4',
    keyIntensity: 2.65,
    keyPos: [4.8, 7.8, 5.2],
    rimColor: '#60a5fa',
    rimIntensity: 1.05,
    rimPos: [-4.5, 3.2, -4.2],
    envIntensity: 0.56,
  },
  anatomy_medical: {
    ambientColor: '#bfdbfe',
    ambientIntensity: 0.44,
    hemiSky: '#bae6fd',
    hemiGround: '#1c1917',
    hemiIntensity: 0.62,
    keyColor: '#fff4eb',
    keyIntensity: 2.55,
    keyPos: [4.2, 6.8, 4.8],
    rimColor: '#38bdf8',
    rimIntensity: 1.32,
    rimPos: [-4.5, 2.8, -4.5],
    envIntensity: 0.48,
  },
  bloodstream_organic: {
    ambientColor: '#fecdd3',
    ambientIntensity: 0.36,
    hemiSky: '#fda4af',
    hemiGround: '#24070d',
    hemiIntensity: 0.48,
    keyColor: '#fff1f2',
    keyIntensity: 2.15,
    keyPos: [2.5, -20.5, 3.8],
    rimColor: '#fb7185',
    rimIntensity: 1.45,
    rimPos: [-3.5, -26.5, -3.2],
    envIntensity: 0.28,
  },
  mito_cathedral: {
    ambientColor: '#ddd6fe',
    ambientIntensity: 0.34,
    hemiSky: '#a78bfa',
    hemiGround: '#140b24',
    hemiIntensity: 0.52,
    keyColor: '#fef3c7',
    keyIntensity: 2.35,
    keyPos: [3.6, 5.5, 4.2],
    rimColor: '#22d3ee',
    rimIntensity: 1.55,
    rimPos: [-4.0, 2.4, -4.0],
    envIntensity: 0.35,
  },
  brain_atlas: {
    ambientColor: '#cffafe',
    ambientIntensity: 0.44,
    hemiSky: '#a5f3fc',
    hemiGround: '#0f172a',
    hemiIntensity: 0.60,
    keyColor: '#f8fafc',
    keyIntensity: 2.45,
    keyPos: [4.0, 6.4, 4.6],
    rimColor: '#6366f1',
    rimIntensity: 1.38,
    rimPos: [-4.2, 2.5, -4.2],
    envIntensity: 0.50,
  },
  neural_forest: {
    ambientColor: '#bae6fd',
    ambientIntensity: 0.32,
    hemiSky: '#67e8f9',
    hemiGround: '#090d1f',
    hemiIntensity: 0.46,
    keyColor: '#e0f2fe',
    keyIntensity: 2.05,
    keyPos: [3.2, 5.2, 3.6],
    rimColor: '#a855f7',
    rimIntensity: 1.48,
    rimPos: [-3.8, 2.2, -5.0],
    envIntensity: 0.30,
  },
  synapse_macro: {
    ambientColor: '#e0e7ff',
    ambientIntensity: 0.38,
    hemiSky: '#7dd3fc',
    hemiGround: '#0b0e1e',
    hemiIntensity: 0.54,
    keyColor: '#f8fafc',
    keyIntensity: 2.30,
    keyPos: [3.2, 4.8, 3.8],
    rimColor: '#34d399',
    rimIntensity: 1.38,
    rimPos: [-3.6, 2.0, -3.6],
    envIntensity: 0.38,
  },
  recovery_golden: {
    ambientColor: '#fde68a',
    ambientIntensity: 0.44,
    hemiSky: '#fcd34d',
    hemiGround: '#1e1b2e',
    hemiIntensity: 0.62,
    keyColor: '#ffedd5',
    keyIntensity: 2.35,
    keyPos: [5.0, 6.2, 4.8],
    rimColor: '#38bdf8',
    rimIntensity: 1.05,
    rimPos: [-4.2, 2.8, -4.0],
    envIntensity: 0.52,
  },
};

const _tmpColor = new THREE.Color();
const _tmpVec = new THREE.Vector3();

export function CinematicDirector() {
  const { gl, scene } = useThree();
  const qualityTier = useBiogenesisStore((s) => s.qualityTier);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const preset = QUALITY_PRESETS[qualityTier];

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  useEffect(() => {
    gl.info.autoReset = false;
    return () => {
      gl.info.autoReset = true;
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, Math.max(0.001, delta));
    const store = useBiogenesisStore.getState();

    // 1. Advance master deterministic simulation clock
    store.tickSimulation(dt);

    // 2. Record telemetry & adaptive quality hysteresis, then reset gl.info for next frame
    performanceMonitor.recordFrame(dt, gl);
    gl.info.reset();
    performanceMonitor.setAudioUnlocked(adaptiveMusicEngine.getIsUnlocked());
    adaptiveController.recordFrameMs(dt * 1000, store.qualityTier, store.autoAdaptQuality, (nextTier) => {
      store.setQualityTier(nextTier);
    });

    // 3. Synchronize Adaptive Music, Spatial SFX & Polish Narration with OrganismState
    const org = liveSimulationRef.organism;
    adaptiveMusicEngine.update({
      masterTimeSec: liveSimulationRef.masterTimeSec,
      heartRate: org.heartRate,
      enabled: store.musicEnabled,
      volume: store.musicVolume,
      masterVolume: store.masterVolume,
      isPlaying: store.started && store.isPlaying,
      isExploration: store.mode === 'exploration',
      isNarratorSpeaking: store.isNarratorSpeaking,
    });

    spatialAudioSystem.update({
      actId: liveSimulationRef.actId,
      organism: org,
      isPlaying: store.started && store.isPlaying,
      sfxVolume: store.sfxVolume,
      masterVolume: store.masterVolume,
      timeSec: liveSimulationRef.masterTimeSec,
    });

    narrationEngine.update({
      started: store.started,
      isPlaying: store.isPlaying,
      masterTimeSec: liveSimulationRef.masterTimeSec,
      playbackSpeed: store.playbackSpeed,
      register: store.narrationRegister,
      enabled: store.narrationEnabled,
      volume: store.narrationVolume,
      masterVolume: store.masterVolume,
      repeatTriggerCounter: store.repeatTriggerCounter,
      onStatusChange: (speaking, sub, segId) => {
        if (
          speaking !== store.isNarratorSpeaking ||
          sub !== store.activeSubtitlePl ||
          segId !== store.activeNarrationSegmentId
        ) {
          store.setNarratorStatus(speaking, sub, segId);
        }
      },
    });

    // 4. Smoothly interpolate per-scale cinematic atmosphere & IBL intensity
    const lcfg = LIGHTING_CONFIGS[liveCameraMetaRef.lightingPreset] ?? LIGHTING_CONFIGS.gym_daylight;
    const damp = 1 - Math.exp(-3.2 * dt);

    if (ambientRef.current) {
      _tmpColor.set(lcfg.ambientColor);
      ambientRef.current.color.lerp(_tmpColor, damp);
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, lcfg.ambientIntensity, damp);
    }
    if (hemiRef.current) {
      _tmpColor.set(lcfg.hemiSky);
      hemiRef.current.color.lerp(_tmpColor, damp);
      _tmpColor.set(lcfg.hemiGround);
      hemiRef.current.groundColor.lerp(_tmpColor, damp);
      hemiRef.current.intensity = THREE.MathUtils.lerp(hemiRef.current.intensity, lcfg.hemiIntensity, damp);
    }
    if (keyRef.current) {
      _tmpColor.set(lcfg.keyColor);
      keyRef.current.color.lerp(_tmpColor, damp);
      keyRef.current.intensity = THREE.MathUtils.lerp(keyRef.current.intensity, lcfg.keyIntensity, damp);
      _tmpVec.set(lcfg.keyPos[0], lcfg.keyPos[1], lcfg.keyPos[2]);
      keyRef.current.position.lerp(_tmpVec, damp);
    }
    if (rimRef.current) {
      _tmpColor.set(lcfg.rimColor);
      rimRef.current.color.lerp(_tmpColor, damp);
      rimRef.current.intensity = THREE.MathUtils.lerp(rimRef.current.intensity, lcfg.rimIntensity, damp);
      _tmpVec.set(lcfg.rimPos[0], lcfg.rimPos[1], lcfg.rimPos[2]);
      rimRef.current.position.lerp(_tmpVec, damp);
    }
    if ('environmentIntensity' in scene) {
      const targetEnv = qualityTier === 'Low' ? 0.15 : lcfg.envIntensity;
      scene.environmentIntensity = THREE.MathUtils.lerp(scene.environmentIntensity ?? 0.4, targetEnv, damp);
    }
  });

  const isMacroDepth = currentActId >= 8 && currentActId <= 10;

  return (
    <>
      <fogExp2 attach="fog" args={['#070b14', 0.028]} />
      <ambientLight ref={ambientRef} intensity={0.44} color="#dbeafe" />
      <hemisphereLight ref={hemiRef} args={['#e0f2fe', '#1e293b', 0.64]} />
      <directionalLight
        ref={keyRef}
        position={[4.8, 7.8, 5.2]}
        intensity={2.55}
        color="#fff5e4"
        castShadow={preset.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight ref={rimRef} position={[-4.5, 3.2, -4.2]} intensity={1.15} color="#38bdf8" />

      {qualityTier !== 'Low' && (
        <Suspense fallback={null}>
          <Environment files="/textures/studio_small_09_1k.hdr" />
        </Suspense>
      )}

      <CameraSystem />
      <ScaleTransitionSystem />

      {preset.postprocessing && preset.dof && preset.bloom && (
        <EffectComposer multisampling={preset.msaaSamples}>
          <DepthOfField
            focusDistance={isMacroDepth ? 0.014 : 0.025}
            focalLength={0.032}
            bokehScale={isMacroDepth ? 2.2 : 1.4}
          />
          <Bloom
            luminanceThreshold={1.12}
            luminanceSmoothing={0.28}
            intensity={0.32}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.22} darkness={0.55} />
        </EffectComposer>
      )}
      {preset.postprocessing && !preset.dof && preset.bloom && (
        <EffectComposer multisampling={preset.msaaSamples}>
          <Bloom
            luminanceThreshold={1.12}
            luminanceSmoothing={0.28}
            intensity={0.32}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.22} darkness={0.55} />
        </EffectComposer>
      )}
      {preset.postprocessing && !preset.dof && !preset.bloom && (
        <EffectComposer multisampling={preset.msaaSamples}>
          <Vignette eskil={false} offset={0.22} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}
