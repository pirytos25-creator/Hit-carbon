import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import { liveSimulationRef, useBiogenesisStore } from '../core/SimulationCore';
import { QUALITY_PRESETS, AdaptiveQualityController } from '../core/QualityManager';
import { performanceMonitor } from '../core/PerformanceMonitor';
import { adaptiveMusicEngine } from '../audio/AdaptiveMusicEngine';
import { spatialAudioSystem } from '../audio/SpatialAudioSystem';
import { narrationEngine } from '../audio/NarrationEngine';
import { CameraSystem } from './CameraSystem';
import { ScaleTransitionSystem } from './ScaleTransitionSystem';

const adaptiveController = new AdaptiveQualityController();

export function CinematicDirector() {
  const { gl } = useThree();
  const qualityTier = useBiogenesisStore((s) => s.qualityTier);
  const currentActId = useBiogenesisStore((s) => s.currentActId);
  const preset = QUALITY_PRESETS[qualityTier];

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
  });

  const isMacroDepth = currentActId >= 8 && currentActId <= 10;

  return (
    <>
      <fogExp2 attach="fog" args={['#070b14', 0.042]} />
      <ambientLight intensity={0.42} color="#b8d4f4" />
      <hemisphereLight args={['#a5d8ff', '#1e1b2e', 0.58]} />
      <directionalLight
        position={[4.5, 7.5, 5.0]}
        intensity={2.4}
        color="#fff6ed"
        castShadow={preset.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4.5, 3.0, -4.5]} intensity={1.15} color="#38bdf8" />

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
