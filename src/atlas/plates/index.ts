import type { AtlasPlateContent, AtlasSystemId } from '../types';
import { MIESNIOWY } from './miesniowy';
import { MOZG } from './mozg';
import { NERWOWY } from './nerwowy';
import { KRWIONOSNY } from './krwionosny';
import { ODDECHOWY } from './oddechowy';

/** Rejestr plansz. Agenci fazy 1 podmieniają `null` na swoją treść (jedna linia na układ). */
export const ATLAS_SYSTEMS: { id: AtlasSystemId; namePl: string; colorVar: string; content: AtlasPlateContent | null }[] = [
  { id: 'nerwowy', namePl: 'Nerwowy', colorVar: '--sys-nerve', content: NERWOWY },
  { id: 'miesniowy', namePl: 'Mięśniowy', colorVar: '--sys-muscle', content: MIESNIOWY },
  { id: 'mozg', namePl: 'Mózg', colorVar: '--sys-brain', content: MOZG },
  { id: 'oddechowy', namePl: 'Oddechowy', colorVar: '--sys-resp', content: ODDECHOWY },
  { id: 'krwionosny', namePl: 'Krwionośny', colorVar: '--sys-artery', content: KRWIONOSNY },
];
