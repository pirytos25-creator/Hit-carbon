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
      'VO₂max to największa ilość tlenu, jaką organizm potrafi zużyć w ciągu minuty w wysiłku maksymalnym; mierzy się ją w teście na bieżni albo rowerze.',
    referenceIds: ['kaminsky_2015'],
    status: 'draft', // runda końcowa: nowe zdanie -> niezależna kontrola
  },
];
