/**
 * E1-K3: dane gablot narządów (src/atlas/data/organs/<narzad>.json) dla panelu „budowa i funkcja” w OrganView (M5).
 * Bramka jak na planszach: na ekran trafiają tylko fakty sprawdzone (checked_*); w Podstawowym bez faktów z tier
 * 'student' (liczby, np. 100 ms, 80–100/min). Fakt z provenance 'textbook_consensus' ma dopisek „Wiedza podręcznikowa”.
 * Teksty interfejsu (np. legenda barw krwi) są w polu `interface` pliku, nie w faktach.
 */
import { isShown, type AtlasLevel } from './palette';
import type { AtlasFactRecord } from './facts';

export interface OrganFact extends AtlasFactRecord {
  organ: string;
  part?: string;
  url?: string;
}
interface OrganFile {
  organ: string;
  interface?: Record<string, string>;
  facts: OrganFact[];
}

const FILES = import.meta.glob<OrganFile>('./data/organs/*.json', { eager: true, import: 'default' });
const BY_ORGAN: Record<string, OrganFile> = Object.fromEntries(Object.values(FILES).map((f) => [f.organ, f]));

export const TEXTBOOK_LABEL = 'Wiedza podręcznikowa';

export interface OrganPanelItem {
  id: string;
  /** Część narządu (klucz struktury w scenie gabloty) albo null dla zdania o działaniu. */
  part: string | null;
  text: string;
  /** „Wiedza podręcznikowa” albo null. */
  badge: string | null;
  quote?: string;
  locator?: string;
  referenceIds: string[];
}

/** Panel gabloty: części (role) i działanie (funkcje), tylko fakty sprawdzone; Podstawowy bez faktów z liczbami. */
export function organPanel(organ: string, level: AtlasLevel): { parts: OrganPanelItem[]; functions: OrganPanelItem[]; ui: Record<string, string> } {
  const file = BY_ORGAN[organ];
  if (!file) return { parts: [], functions: [], ui: {} };
  const visible = file.facts.filter(
    (f) => (f.kind === 'organ_role' || f.kind === 'organ_function') && isShown(f.status) && (level === 'extended' || f.tier !== 'student'),
  );
  const item = (f: OrganFact): OrganPanelItem => ({
    id: f.id,
    part: f.part ?? null,
    text: f.textPl ?? '',
    badge: f.provenance === 'textbook_consensus' ? TEXTBOOK_LABEL : null,
    quote: f.quote ?? undefined,
    locator: f.locator ?? undefined,
    referenceIds: f.referenceIds,
  });
  return {
    parts: visible.filter((f) => f.kind === 'organ_role').map(item),
    functions: visible.filter((f) => f.kind === 'organ_function').map(item),
    ui: file.interface ?? {},
  };
}

/** Lista narządów z danymi gabloty. */
export const ORGANS_WITH_DATA = Object.keys(BY_ORGAN);
