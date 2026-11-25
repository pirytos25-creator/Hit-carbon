import { QualityTier } from '../types/biogenesis';

export interface QualityPreset {
  tier: QualityTier;
  labelPl: string;
  dpr: [number, number];
  particleMultiplier: number; // scales InstancedMesh count (0.25 .. 1.6)
  shadows: boolean;
  postprocessing: boolean;
  bloom: boolean;
  dof: boolean;
  msaaSamples: number;
  envResolution: number;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  Low: {
    tier: 'Low',
    labelPl: 'Niska (Oszczędna)',
    dpr: [0.75, 1.0],
    particleMultiplier: 0.3,
    shadows: false,
    postprocessing: false,
    bloom: false,
    dof: false,
    msaaSamples: 0,
    envResolution: 64,
  },
  Medium: {
    tier: 'Medium',
    labelPl: 'Średnia (Zrównoważona)',
    dpr: [0.9, 1.25],
    particleMultiplier: 0.6,
    shadows: true,
    postprocessing: true,
    bloom: true,
    dof: false,
    msaaSamples: 0,
    envResolution: 128,
  },
  High: {
    tier: 'High',
    labelPl: 'Wysoka (RTX 4050 · 60 FPS)',
    dpr: [1.0, 1.5],
    particleMultiplier: 1.0,
    shadows: true,
    postprocessing: true,
    bloom: true,
    dof: false,
    msaaSamples: 2,
    envResolution: 256,
  },
  Ultra: {
    tier: 'Ultra',
    labelPl: 'Ultra (Wysoka szczegółowość)',
    dpr: [1.0, 1.85],
    particleMultiplier: 1.35,
    shadows: true,
    postprocessing: true,
    bloom: true,
    dof: true,
    msaaSamples: 4,
    envResolution: 256,
  },
  Cinematic: {
    tier: 'Cinematic',
    labelPl: 'Kinowa (Priorytet jakości)',
    dpr: [1.25, 2.0],
    particleMultiplier: 1.6,
    shadows: true,
    postprocessing: true,
    bloom: true,
    dof: true,
    msaaSamples: 4,
    envResolution: 512,
  },
};

const TIER_ORDER: QualityTier[] = ['Low', 'Medium', 'High', 'Ultra', 'Cinematic'];

/**
 * Asymetryczna histereza adaptacyjnej jakości (zgodnie z wytycznymi wydajnościowymi).
 * Chroni przed migotaniem rozdzielczości na granicy klatek.
 */
export class AdaptiveQualityController {
  private windowFrames: number[] = [];
  private healthyWindows = 0;
  private warmupFrames = 0;

  public recordFrameMs(
    dtMs: number,
    currentTier: QualityTier,
    autoAdapt: boolean,
    onChangeTier: (tier: QualityTier) => void
  ) {
    if (!autoAdapt || currentTier === 'Cinematic') return;
    if (this.warmupFrames < 120) {
      this.warmupFrames += 1;
      return;
    }
    this.windowFrames.push(dtMs);
    if (this.windowFrames.length < 90) return;

    const sorted = [...this.windowFrames].sort((a, b) => a - b);
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    this.windowFrames.length = 0;

    const idx = TIER_ORDER.indexOf(currentTier);
    if (p75 > 36.0 && idx > 0) {
      this.healthyWindows = 0;
      onChangeTier(TIER_ORDER[idx - 1]);
    } else if (p75 < 16.5 && idx < TIER_ORDER.length - 2) {
      this.healthyWindows += 1;
      if (this.healthyWindows >= 5) {
        this.healthyWindows = 0;
        onChangeTier(TIER_ORDER[idx + 1]);
      }
    } else {
      this.healthyWindows = 0;
    }
  }
}
