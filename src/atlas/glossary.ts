import type { AtlasFactStatus } from './types';

/**
 * Zdania wspólne dla wszystkich plansz (runda końcowa zgromadzenia, pkt A7). Przechodzą przez tę samą bramkę faktów:
 * na ekran trafia tylko status pokazywany (walidator: scripts/atlas_check_facts.mjs).
 */
export interface AtlasGlossaryEntry {
  id: string;
  textPl: string;
  referenceIds: string[];
  status: AtlasFactStatus;
  quote?: string;
  locator?: string;
}

export const ATLAS_GLOSSARY: AtlasGlossaryEntry[] = [
  {
    id: 'vo2max',
    textPl:
      'VO₂max to największa ilość tlenu, jaką organizm potrafi zużyć w ciągu minuty w wysiłku maksymalnym; mierzy się ją w teście wysiłkowym do maksimum (np. na bieżni).',
    referenceIds: ['kaminsky_2015'],
    status: 'checked_agent', // fakty_kontrola_koncowa.md: brzmienie sprawdzającego (bez „albo rowerze”)
    quote: 'Percentiles of maximal oxygen consumption (VO 2max)… | 7783 maximal… treadmill tests',
    locator: 'Kaminsky 2015, abstrakt',
  },
];
