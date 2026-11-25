import { create } from 'zustand';
import {
  ActId,
  AnatomicalLayerKey,
  BrainRegionId,
  ExperienceMode,
  HIITProtocolConfig,
  NarrationRegister,
  NeurochemicalSystemId,
  OrganismState,
  QualityTier,
  SynapseTypeId,
  TemporalHorizon,
  WorkoutPhaseId,
} from '../types/biogenesis';
import {
  createInitialOrganismState,
  DEFAULT_HIIT_CONFIG,
  evaluateCinematicOrganismState,
  stepInteractiveOrganismState,
} from './PhysiologyEngine';
import {
  getActAtTime,
  getActById,
  TOTAL_TIMELINE_DURATION_SEC,
} from './TimelineEngine';
import { assetManager } from './AssetManager';
import { performanceMonitor } from './PerformanceMonitor';

export interface LiveSimulationFrame {
  masterTimeSec: number;
  actId: ActId;
  nextActId: ActId | null;
  actProgress: number;
  transitionBlend: number;
  organism: OrganismState;
  sarcomereLocalPhase: number;
  synapseLocalPhase: number;
}

/**
 * Obiekt o wysokiej częstotliwości aktualizacji (60 FPS) czytany bezpośrednio w `useFrame`
 * bez wywoływania re-renderów Reacta dla każdej klatki!
 */
export const liveSimulationRef: LiveSimulationFrame = {
  masterTimeSec: 0,
  actId: 1,
  nextActId: 2,
  actProgress: 0,
  transitionBlend: 0,
  organism: createInitialOrganismState('recreational'),
  sarcomereLocalPhase: 0,
  synapseLocalPhase: 0,
};

export interface BiogenesisState {
  started: boolean;
  isPlaying: boolean;
  playbackSpeed: number;
  mode: ExperienceMode;
  narrationRegister: NarrationRegister;
  masterTimeSec: number;
  currentActId: ActId;
  nextActId: ActId | null;
  actProgress: number;
  transitionBlend: number;

  // Audio controls
  masterVolume: number;
  musicVolume: number;
  narrationVolume: number;
  sfxVolume: number;
  narrationEnabled: boolean;
  musicEnabled: boolean;
  isNarratorSpeaking: boolean;
  activeSubtitlePl: string;
  activeNarrationSegmentId: string | null;
  repeatTriggerCounter: number;

  // Interactive Physiological Protocol
  hiitConfig: HIITProtocolConfig;
  manualWorkoutPhase: WorkoutPhaseId | 'auto';
  interactiveWorkoutElapsedSec: number;
  organism: OrganismState;

  // Act-specific interactive controls
  anatomicalLayers: Record<AnatomicalLayerKey, boolean>;
  skinOpacityOverride: number | null;
  followErythrocyteCam: boolean;
  sarcomerePaused: boolean;
  sarcomereSpeed: number;
  sarcomereStage: number; // 0..3 (4 cross-bridge steps)
  sarcomereShowAnnotations: boolean;
  mitoTechnicalMode: boolean;
  activeNeuroSystem: NeurochemicalSystemId;
  selectedBrainRegion: BrainRegionId | null;
  synapsePaused: boolean;
  synapseType: SynapseTypeId;
  synapseStage: number; // 0..8 (9 transmission steps)
  act10SubView: 'bdnf_trkb' | 'ltp_spine' | 'hippocampus_pfc';
  temporalHorizon: TemporalHorizon;

  // UI & Quality
  hudHidden: boolean;
  academicDrawerOpen: boolean;
  qualityTier: QualityTier;
  autoAdaptQuality: boolean;
  webglContextLost: boolean;

  // Actions
  startExperience: (mode?: ExperienceMode) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setMode: (mode: ExperienceMode) => void;
  setNarrationRegister: (reg: NarrationRegister) => void;
  seekToTime: (timeSec: number) => void;
  jumpToAct: (actId: ActId) => void;

  setAudioVolumes: (partial: Partial<{ masterVolume: number; musicVolume: number; narrationVolume: number; sfxVolume: number }>) => void;
  setNarrationEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setNarratorStatus: (speaking: boolean, subtitle: string, segId: string | null) => void;
  triggerRepeatSegment: () => void;

  updateHiitConfig: (partial: Partial<HIITProtocolConfig>) => void;
  setManualWorkoutPhase: (phase: WorkoutPhaseId | 'auto') => void;
  toggleAnatomicalLayer: (layer: AnatomicalLayerKey) => void;
  setSkinOpacityOverride: (opacity: number | null) => void;
  setFollowErythrocyteCam: (follow: boolean) => void;
  setSarcomereControls: (partial: Partial<{ sarcomerePaused: boolean; sarcomereSpeed: number; sarcomereStage: number; sarcomereShowAnnotations: boolean }>) => void;
  setMitoTechnicalMode: (tech: boolean) => void;
  setActiveNeuroSystem: (sys: NeurochemicalSystemId) => void;
  setSelectedBrainRegion: (region: BrainRegionId | null) => void;
  setSynapseControls: (partial: Partial<{ synapsePaused: boolean; synapseType: SynapseTypeId; synapseStage: number }>) => void;
  setAct10SubView: (view: 'bdnf_trkb' | 'ltp_spine' | 'hippocampus_pfc') => void;
  setTemporalHorizon: (h: TemporalHorizon) => void;

  setHudHidden: (hidden: boolean) => void;
  setAcademicDrawerOpen: (open: boolean) => void;
  setQualityTier: (tier: QualityTier) => void;
  setAutoAdaptQuality: (auto: boolean) => void;
  setWebglContextLost: (lost: boolean) => void;

  tickSimulation: (dtSec: number) => void;
}

let uiSyncAccumulator = 0;

export const useBiogenesisStore = create<BiogenesisState>((set, get) => ({
  started: false,
  isPlaying: false,
  playbackSpeed: 1.0,
  mode: 'cinematic',
  narrationRegister: 'popular',
  masterTimeSec: 0,
  currentActId: 1,
  nextActId: 2,
  actProgress: 0,
  transitionBlend: 0,

  masterVolume: 0.85,
  musicVolume: 0.65,
  narrationVolume: 0.92,
  sfxVolume: 0.72,
  narrationEnabled: true,
  musicEnabled: true,
  isNarratorSpeaking: false,
  activeSubtitlePl: '',
  activeNarrationSegmentId: null,
  repeatTriggerCounter: 0,

  hiitConfig: DEFAULT_HIIT_CONFIG,
  manualWorkoutPhase: 'auto',
  interactiveWorkoutElapsedSec: 0,
  organism: evaluateCinematicOrganismState(0, 1, 0, DEFAULT_HIIT_CONFIG),

  anatomicalLayers: {
    skin: true,
    muscle: true,
    skeleton: true,
    vascular: true,
    respiratory: true,
    nervous: true,
  },
  skinOpacityOverride: null,
  followErythrocyteCam: false,
  sarcomerePaused: false,
  sarcomereSpeed: 1.0,
  sarcomereStage: 0,
  sarcomereShowAnnotations: true,
  mitoTechnicalMode: false,
  activeNeuroSystem: 'dopamine',
  selectedBrainRegion: null,
  synapsePaused: false,
  synapseType: 'glutamatergic',
  synapseStage: 0,
  act10SubView: 'bdnf_trkb',
  temporalHorizon: 'acute',

  hudHidden: false,
  academicDrawerOpen: false,
  qualityTier: 'High',
  autoAdaptQuality: true,
  webglContextLost: false,

  startExperience: (mode) => {
    const targetMode = mode ?? get().mode;
    const reg: NarrationRegister = targetMode === 'academic' ? 'academic' : get().narrationRegister;
    assetManager.preloadForAct(1);
    set({
      started: true,
      isPlaying: true,
      mode: targetMode,
      narrationRegister: reg,
    });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: Math.max(0, Math.min(4, speed)) }),

  setMode: (mode) => {
    const updates: Partial<BiogenesisState> = { mode };
    if (mode === 'academic') {
      updates.narrationRegister = 'academic';
      updates.academicDrawerOpen = true;
    } else if (mode === 'popular') {
      updates.narrationRegister = 'popular';
      updates.academicDrawerOpen = false;
    } else if (mode === 'interactive' || mode === 'cinematic' || mode === 'exploration') {
      updates.academicDrawerOpen = false;
    }
    set(updates);
  },

  setNarrationRegister: (narrationRegister) => set({ narrationRegister }),

  seekToTime: (timeSec) => {
    const clamped = Math.max(0, Math.min(TOTAL_TIMELINE_DURATION_SEC - 0.05, timeSec));
    const { act, nextAct, actProgress, transitionBlend } = getActAtTime(clamped);
    const org = evaluateCinematicOrganismState(clamped, act.id, actProgress, get().hiitConfig);
    liveSimulationRef.masterTimeSec = clamped;
    liveSimulationRef.actId = act.id;
    liveSimulationRef.nextActId = nextAct?.id ?? null;
    liveSimulationRef.actProgress = actProgress;
    liveSimulationRef.transitionBlend = transitionBlend;
    liveSimulationRef.organism = org;
    assetManager.preloadForAct(act.id);
    set({
      masterTimeSec: clamped,
      currentActId: act.id,
      nextActId: nextAct?.id ?? null,
      actProgress,
      transitionBlend,
      organism: org,
    });
  },

  jumpToAct: (actId) => {
    const act = getActById(actId);
    get().seekToTime(act.startTime + 0.2);
  },

  setAudioVolumes: (partial) => set(partial),
  setNarrationEnabled: (narrationEnabled) => set({ narrationEnabled }),
  setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
  setNarratorStatus: (isNarratorSpeaking, activeSubtitlePl, activeNarrationSegmentId) =>
    set({ isNarratorSpeaking, activeSubtitlePl, activeNarrationSegmentId }),
  triggerRepeatSegment: () => set((s) => ({ repeatTriggerCounter: s.repeatTriggerCounter + 1 })),

  updateHiitConfig: (partial) => set((s) => ({ hiitConfig: { ...s.hiitConfig, ...partial } })),
  setManualWorkoutPhase: (manualWorkoutPhase) => set({ manualWorkoutPhase }),
  toggleAnatomicalLayer: (layer) =>
    set((s) => ({
      anatomicalLayers: { ...s.anatomicalLayers, [layer]: !s.anatomicalLayers[layer] },
    })),
  setSkinOpacityOverride: (skinOpacityOverride) => set({ skinOpacityOverride }),
  setFollowErythrocyteCam: (followErythrocyteCam) => set({ followErythrocyteCam }),
  setSarcomereControls: (partial) => set(partial),
  setMitoTechnicalMode: (mitoTechnicalMode) => set({ mitoTechnicalMode }),
  setActiveNeuroSystem: (activeNeuroSystem) => set({ activeNeuroSystem }),
  setSelectedBrainRegion: (selectedBrainRegion) => set({ selectedBrainRegion }),
  setSynapseControls: (partial) => set(partial),
  setAct10SubView: (act10SubView) => set({ act10SubView }),
  setTemporalHorizon: (temporalHorizon) => set({ temporalHorizon }),

  setHudHidden: (hudHidden) => set({ hudHidden }),
  setAcademicDrawerOpen: (academicDrawerOpen) => set({ academicDrawerOpen }),
  setQualityTier: (qualityTier) => {
    performanceMonitor.setActiveQuality(qualityTier);
    set({ qualityTier });
  },
  setAutoAdaptQuality: (autoAdaptQuality) => set({ autoAdaptQuality }),
  setWebglContextLost: (webglContextLost) => {
    performanceMonitor.setWebglAlive(!webglContextLost);
    set({ webglContextLost });
  },

  tickSimulation: (dtSec) => {
    const state = get();
    if (!state.started) return;

    const dtClamped = Math.min(0.05, Math.max(0, dtSec));
    const effDt = state.isPlaying ? dtClamped * state.playbackSpeed : 0;

    // Advance local interactive sub-clocks (even when main timeline is paused if sub-view unpaused)
    if (!state.sarcomerePaused) {
      liveSimulationRef.sarcomereLocalPhase =
        (liveSimulationRef.sarcomereLocalPhase + dtClamped * 0.45 * state.sarcomereSpeed) % 1;
    }
    if (!state.synapsePaused) {
      liveSimulationRef.synapseLocalPhase = (liveSimulationRef.synapseLocalPhase + dtClamped * 0.14) % 1;
    }

    if (effDt <= 0) return;

    if (state.mode === 'interactive') {
      const nextElapsed = state.interactiveWorkoutElapsedSec + effDt;
      const nextOrg = stepInteractiveOrganismState(
        liveSimulationRef.organism,
        effDt,
        state.hiitConfig,
        state.manualWorkoutPhase,
        nextElapsed
      );
      liveSimulationRef.organism = nextOrg;
      uiSyncAccumulator += dtClamped;
      if (uiSyncAccumulator >= 0.1) {
        uiSyncAccumulator = 0;
        set({
          interactiveWorkoutElapsedSec: nextElapsed,
          organism: nextOrg,
        });
      }
      return;
    }

    // Continuous cinematic / exploration / academic / popular timeline
    const nextTime = (liveSimulationRef.masterTimeSec + effDt) % TOTAL_TIMELINE_DURATION_SEC;
    const { act, nextAct, actProgress, transitionBlend } = getActAtTime(nextTime);
    const org = evaluateCinematicOrganismState(nextTime, act.id, actProgress, state.hiitConfig);

    const actChanged = act.id !== liveSimulationRef.actId;
    liveSimulationRef.masterTimeSec = nextTime;
    liveSimulationRef.actId = act.id;
    liveSimulationRef.nextActId = nextAct?.id ?? null;
    liveSimulationRef.actProgress = actProgress;
    liveSimulationRef.transitionBlend = transitionBlend;
    liveSimulationRef.organism = org;

    if (actChanged) {
      assetManager.preloadForAct(act.id);
      assetManager.releaseUnusedExcept(
        nextAct ? [act.id, nextAct.id] : [act.id]
      );
    }

    uiSyncAccumulator += dtClamped;
    if (actChanged || uiSyncAccumulator >= 0.1) {
      uiSyncAccumulator = 0;
      set({
        masterTimeSec: nextTime,
        currentActId: act.id,
        nextActId: nextAct?.id ?? null,
        actProgress,
        transitionBlend,
        organism: org,
      });
    }
  },
}));
