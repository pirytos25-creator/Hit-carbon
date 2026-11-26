/**
 * M6 (rama), „Co się zmieniło” (UX_POSIEDZENIE §2.2 P5): które struktury planszy zostają w pełnym kolorze.
 *
 * Reguła (oparta na sprawdzonych liczbach):
 *  1. bierzemy liczby planszy z `changeLinks` (powiązanie liczba → struktury w układzie planszy), których wartość
 *     w momencie i wartość spoczynkowa są na ekranie (status checked_*), z poziomu Podstawowego (bez tier 'student');
 *  2. krotność zmiany = max(b/a, a/b) z wartości na ekranie (np. „ok. 5” → „ok. 20–25” = 22,5 / 5 = 4,5;
 *     „100%” → „ok. −30%” = 100 / 70); tekst w nawiasie pomijamy (to dopisek, nie wartość);
 *  3. w pełnym kolorze zostają struktury liczb o krotności ≥ 70% największej na planszy;
 *  4. gdy żadnej liczby nie da się porównać (brak sprawdzonego spoczynku, wartości słowne), wyróżniamy struktury
 *     z `changeIllustration` z chipem „ilustracja”.
 * Krotność służy tylko do wyboru struktur: na ekranie stoją wyłącznie sprawdzone wartości (spoczynek → moment).
 */
import { isShown } from './palette';
import type { AtlasMetric, AtlasPlateContent } from './types';

export const CHANGE_THRESHOLD = 0.7;

/** Średnia liczb w wartości (bez dopisku w nawiasie); minus „−” i „-” przed liczbą; przecinek dziesiętny. */
export function parseValue(v: string): number[] {
  const core = v.replace(/\([^)]*\)/g, ' ');
  return [...core.matchAll(/([−-])?\s?(\d+(?:[.,]\d+)?)/g)].map((m) => (m[1] ? -1 : 1) * Number(m[2].replace(',', '.')));
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Krotność zmiany liczby (≥ 1) albo null, gdy nie da się jej uczciwie policzyć z wartości na ekranie. */
export function foldOf(m: AtlasMetric): number | null {
  if (!isShown(m.status) || !isShown(m.restStatus ?? m.status) || m.tier === 'student') return null;
  const restVals = parseValue(m.rest);
  const sprintVals = parseValue(m.sprint);
  if (!restVals.length || !sprintVals.length) return null;
  let a = mean(restVals);
  let b = mean(sprintVals);
  // zmiana procentowa względem wartości wyjściowej: „100%” albo „0” → „−30%”
  const pct = /^\s*(100\s?%|0)\s*$/.test(m.rest) && sprintVals.every((x) => x < 0);
  if (pct) {
    a = 100;
    b = 100 + mean(sprintVals);
  }
  if (!(a > 0) || !(b > 0)) return null;
  return Math.max(a / b, b / a);
}

export interface AtlasChange {
  /** Kotwice w pełnym kolorze. */
  anchors: string[];
  /** Liczby, z których wynika wybór (od największej zmiany); pusta przy ilustracji. */
  basis: AtlasMetric[];
  illustration: boolean;
}

export function computeChange(content: AtlasPlateContent): AtlasChange | null {
  const scored = (content.changeLinks ?? [])
    .map((l) => {
      const m = content.metrics.find((x) => x.id === l.metric);
      const fold = m ? foldOf(m) : null;
      return m && fold !== null ? { m, fold, anchors: l.anchors } : null;
    })
    .filter((x): x is { m: AtlasMetric; fold: number; anchors: string[] } => x !== null)
    .sort((x, y) => y.fold - x.fold);
  if (scored.length) {
    const top = scored[0].fold;
    const chosen = scored.filter((s) => s.fold >= CHANGE_THRESHOLD * top);
    return { anchors: [...new Set(chosen.flatMap((s) => s.anchors))], basis: chosen.map((s) => s.m), illustration: false };
  }
  if (content.changeIllustration?.length) return { anchors: content.changeIllustration, basis: [], illustration: true };
  return null;
}
