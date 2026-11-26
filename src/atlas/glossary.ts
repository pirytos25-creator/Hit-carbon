import type { AtlasFactStatus } from './types';
import type { AtlasFactsFile } from './facts';
import WSPOLNE from './data/facts/_wspolne.json';

/**
 * Zdania wspólne dla wszystkich plansz (runda końcowa zgromadzenia, pkt A7). Treść i status żyją w
 * src/atlas/data/facts/_wspolne.json (E1-K2) i przechodzą przez tę samą bramkę faktów co plansze.
 */
export interface AtlasGlossaryEntry {
  id: string;
  textPl: string;
  referenceIds: string[];
  status: AtlasFactStatus;
  quote?: string;
  locator?: string;
}

export const ATLAS_GLOSSARY: AtlasGlossaryEntry[] = (WSPOLNE as AtlasFactsFile).facts
  .filter((f) => f.kind === 'glossary')
  .map((f) => ({
    id: f.id.replace(/^_wspolne\.glossary\./, ''),
    textPl: f.textPl ?? '',
    referenceIds: f.referenceIds,
    status: f.status,
    quote: f.quote ?? undefined,
    locator: f.locator ?? undefined,
  }));
