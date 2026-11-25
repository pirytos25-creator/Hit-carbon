import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useBiogenesisStore, liveSimulationRef } from './core/SimulationCore';
import { QUALITY_PRESETS } from './core/QualityManager';
import { performanceMonitor } from './core/PerformanceMonitor';
import { assetManager } from './core/AssetManager';
import { narrationEngine } from './audio/NarrationEngine';
import { CinematicDirector } from './director/CinematicDirector';
import { SceneManager } from './scenes/SceneManager';
import { Labels3DOverlay } from './ui/Labels3DOverlay';
import { DiegeticHUD } from './ui/DiegeticHUD';
import { ActId, ExperienceMode, QualityTier } from './types/biogenesis';

declare global {
  interface Window {
    __BIOGENESIS_DEBUG__?: {
      getState: () => ReturnType<typeof useBiogenesisStore.getState>;
      jumpToAct: (actId: ActId) => void;
      setMode: (mode: ExperienceMode) => void;
      setQuality: (tier: QualityTier) => void;
      getPerformanceMetrics: () => ReturnType<typeof performanceMonitor.getSnapshot>;
      getOrganism: () => typeof liveSimulationRef.organism;
    };
  }
}

export function App() {
  const qualityTier = useBiogenesisStore((s) => s.qualityTier);
  const preset = QUALITY_PRESETS[qualityTier];

  useEffect(() => {
    void narrationEngine.loadManifest();
    assetManager.preloadForAct(1);

    window.__BIOGENESIS_DEBUG__ = {
      getState: () => useBiogenesisStore.getState(),
      jumpToAct: (actId: ActId) => {
        const st = useBiogenesisStore.getState();
        if (!st.started) st.startExperience('cinematic');
        st.jumpToAct(actId);
      },
      setMode: (mode: ExperienceMode) => useBiogenesisStore.getState().setMode(mode),
      setQuality: (tier: QualityTier) => useBiogenesisStore.getState().setQualityTier(tier),
      getPerformanceMetrics: () => performanceMonitor.getSnapshot(),
      getOrganism: () => liveSimulationRef.organism,
    };

    return () => {
      delete window.__BIOGENESIS_DEBUG__;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#04070d]">
      <Canvas
        shadows={preset.shadows}
        dpr={preset.dpr}
        camera={{ position: [2.4, 1.45, 2.5], fov: 46, near: 0.04, far: 120 }}
        gl={{
          antialias: preset.msaaSamples > 0,
          powerPreference: 'high-performance',
          toneMapping: THREE.AgXToneMapping,
          toneMappingExposure: 1.05,
        }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            useBiogenesisStore.getState().setWebglContextLost(true);
          });
          canvas.addEventListener('webglcontextrestored', () => {
            useBiogenesisStore.getState().setWebglContextLost(false);
          });
        }}
      >
        <CinematicDirector />
        <SceneManager />
        <Labels3DOverlay />
      </Canvas>

      <DiegeticHUD />
    </div>
  );
}

export default App;
