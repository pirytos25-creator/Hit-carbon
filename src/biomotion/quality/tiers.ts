import { QUALITY_PRESETS } from '../../core/QualityManager';
import type { QualityTier } from '../../types/biogenesis';

/**
 * Parametry modułu per poziom jakości. Źródłem jest QualityManager filmu (bez zmian),
 * a moduł dokłada tylko to, czego film nie miał. Pomiary M2 (Intel UHD, 1440×900):
 * MSAA ok. 12 ms → Low bez MSAA; prawdziwa przezroczystość ściany naczynia +15 ms → Low = dithering Bayera.
 */
export type TransparencyMode = 'dither' | 'blend';

export interface BioTierParams {
  tier: QualityTier;
  particleMultiplier: number;
  msaa: boolean;
  /** ściany naczyń w zbliżeniu */
  vesselTransparency: TransparencyMode;
  /** materiał tkanki: lakier/połysk i mapa środowiska tylko od Medium */
  physicalTissue: boolean;
  /** LOD krwinki (kroki profilu, segmenty obrotu) */
  erythrocyteLod: [number, number];
}

export function tierParams(tier: QualityTier): BioTierParams {
  const p = QUALITY_PRESETS[tier];
  const low = tier === 'Low';
  return {
    tier,
    particleMultiplier: p.particleMultiplier,
    msaa: p.msaaSamples > 0,
    vesselTransparency: low ? 'dither' : 'blend',
    physicalTissue: !low,
    erythrocyteLod: low ? [10, 14] : [26, 28],
  };
}
