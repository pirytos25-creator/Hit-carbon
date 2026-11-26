import type { AtlasPlateContent, AtlasSystemId } from '../types';
import { MIESNIOWY } from './miesniowy';
import { MOZG } from './mozg';
import { NERWOWY } from './nerwowy';
import { KRWIONOSNY } from './krwionosny';
import { ODDECHOWY } from './oddechowy';
import { KOSTNY } from './kostny';
import { POWLOKOWY } from './powlokowy';
import { LIMFATYCZNY } from './limfatyczny';
import { ROZRODCZY } from './rozrodczy';
import { POKARMOWY } from './pokarmowy';
import { WYDALNICZY } from './wydalniczy';

/** Rejestr plansz. Agent układu podmienia `null` na swoją treść (linia `content`) i dopisuje linię `import`. */
export const ATLAS_SYSTEMS: { id: AtlasSystemId; namePl: string; colorVar: string; content: AtlasPlateContent | null }[] = [
  { id: 'nerwowy', namePl: 'Nerwowy', colorVar: '--sys-nerve', content: NERWOWY },
  { id: 'miesniowy', namePl: 'Mięśniowy', colorVar: '--sys-muscle', content: MIESNIOWY },
  { id: 'mozg', namePl: 'Mózg', colorVar: '--sys-brain', content: MOZG },
  { id: 'oddechowy', namePl: 'Oddechowy', colorVar: '--sys-resp', content: ODDECHOWY },
  { id: 'krwionosny', namePl: 'Krwionośny', colorVar: '--sys-artery', content: KRWIONOSNY },
  // Faza 1b (agenci 6-12): podmieniają `null` na swoją treść i dopisują linię `import`.
  { id: 'hormonalny', namePl: 'Hormonalny', colorVar: '--sys-endo', content: null },
  { id: 'powlokowy', namePl: 'Powłokowy', colorVar: '--sys-skin', content: POWLOKOWY },
  { id: 'pokarmowy', namePl: 'Pokarmowy', colorVar: '--sys-digest', content: POKARMOWY },
  { id: 'wydalniczy', namePl: 'Moczowy', colorVar: '--sys-urinary', content: WYDALNICZY },
  { id: 'kostny', namePl: 'Kostny', colorVar: '--sys-bone', content: KOSTNY },
  { id: 'limfatyczny', namePl: 'Limfatyczny', colorVar: '--sys-lymph', content: LIMFATYCZNY },
  { id: 'rozrodczy', namePl: 'Rozrodczy', colorVar: '--sys-repro', content: ROZRODCZY },
];
