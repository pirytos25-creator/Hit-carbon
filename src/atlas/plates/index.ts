import type { AtlasPlateContent, AtlasSystemId } from '../types';
import { MIESNIOWY } from './miesniowy';
import { NERWOWY } from './nerwowy';

/** Rejestr plansz. Agenci fazy 1 podmieniają `null` na swoją treść (jedna linia na układ). */
export const ATLAS_SYSTEMS: { id: AtlasSystemId; namePl: string; colorVar: string; content: AtlasPlateContent | null }[] = [
  { id: 'nerwowy', namePl: 'Nerwowy', colorVar: '--sys-nerve', content: NERWOWY },
  { id: 'miesniowy', namePl: 'Mięśniowy', colorVar: '--sys-muscle', content: MIESNIOWY },
  { id: 'mozg', namePl: 'Mózg', colorVar: '--sys-brain', content: null },
  { id: 'oddechowy', namePl: 'Oddechowy', colorVar: '--sys-resp', content: null },
  { id: 'krwionosny', namePl: 'Krwionośny', colorVar: '--sys-artery', content: null },
];
