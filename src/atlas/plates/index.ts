import type { AtlasPlateContent, AtlasSystemId } from '../types';
import { buildPlate, type AtlasFactsFile } from '../facts';
import { MIESNIOWY } from './miesniowy';
import MIESNIOWY_FAKTY from '../data/facts/miesniowy.json';
import { MOZG } from './mozg';
import MOZG_FAKTY from '../data/facts/mozg.json';
import { NERWOWY } from './nerwowy';
import NERWOWY_FAKTY from '../data/facts/nerwowy.json';
import { KRWIONOSNY } from './krwionosny';
import KRWIONOSNY_FAKTY from '../data/facts/krwionosny.json';
import { ODDECHOWY } from './oddechowy';
import ODDECHOWY_FAKTY from '../data/facts/oddechowy.json';
import { HORMONALNY } from './hormonalny';
import HORMONALNY_FAKTY from '../data/facts/hormonalny.json';
import { KOSTNY } from './kostny';
import KOSTNY_FAKTY from '../data/facts/kostny.json';
import { POWLOKOWY } from './powlokowy';
import POWLOKOWY_FAKTY from '../data/facts/powlokowy.json';
import { LIMFATYCZNY } from './limfatyczny';
import LIMFATYCZNY_FAKTY from '../data/facts/limfatyczny.json';
import { ROZRODCZY } from './rozrodczy';
import ROZRODCZY_FAKTY from '../data/facts/rozrodczy.json';
import { POKARMOWY } from './pokarmowy';
import POKARMOWY_FAKTY from '../data/facts/pokarmowy.json';
import { WYDALNICZY } from './wydalniczy';
import WYDALNICZY_FAKTY from '../data/facts/wydalniczy.json';

/** Rejestr plansz. Agent układu podmienia `null` na swoją treść (linia `content`) i dopisuje linię `import`. */
export const ATLAS_SYSTEMS: { id: AtlasSystemId; namePl: string; colorVar: string; content: AtlasPlateContent | null }[] = [
  { id: 'nerwowy', namePl: 'Nerwowy', colorVar: '--sys-nerve', content: buildPlate(NERWOWY, NERWOWY_FAKTY as AtlasFactsFile) },
  { id: 'miesniowy', namePl: 'Mięśniowy', colorVar: '--sys-muscle', content: buildPlate(MIESNIOWY, MIESNIOWY_FAKTY as AtlasFactsFile) },
  { id: 'mozg', namePl: 'Mózg', colorVar: '--sys-brain', content: buildPlate(MOZG, MOZG_FAKTY as AtlasFactsFile) },
  { id: 'oddechowy', namePl: 'Oddechowy', colorVar: '--sys-resp', content: buildPlate(ODDECHOWY, ODDECHOWY_FAKTY as AtlasFactsFile) },
  { id: 'krwionosny', namePl: 'Krwionośny', colorVar: '--sys-artery', content: buildPlate(KRWIONOSNY, KRWIONOSNY_FAKTY as AtlasFactsFile) },
  // Faza 1b (agenci 6-12): podmieniają `null` na swoją treść i dopisują linię `import`.
  { id: 'hormonalny', namePl: 'Hormonalny', colorVar: '--sys-endo', content: buildPlate(HORMONALNY, HORMONALNY_FAKTY as AtlasFactsFile) },
  { id: 'powlokowy', namePl: 'Skóra', colorVar: '--sys-skin', content: buildPlate(POWLOKOWY, POWLOKOWY_FAKTY as AtlasFactsFile) },
  { id: 'pokarmowy', namePl: 'Pokarmowy', colorVar: '--sys-digest', content: buildPlate(POKARMOWY, POKARMOWY_FAKTY as AtlasFactsFile) },
  { id: 'wydalniczy', namePl: 'Moczowy', colorVar: '--sys-urinary', content: buildPlate(WYDALNICZY, WYDALNICZY_FAKTY as AtlasFactsFile) },
  { id: 'kostny', namePl: 'Kostny', colorVar: '--sys-bone', content: buildPlate(KOSTNY, KOSTNY_FAKTY as AtlasFactsFile) },
  { id: 'limfatyczny', namePl: 'Limfatyczny', colorVar: '--sys-lymph', content: buildPlate(LIMFATYCZNY, LIMFATYCZNY_FAKTY as AtlasFactsFile) },
  { id: 'rozrodczy', namePl: 'Rozrodczy', colorVar: '--sys-repro', content: buildPlate(ROZRODCZY, ROZRODCZY_FAKTY as AtlasFactsFile) },
];
