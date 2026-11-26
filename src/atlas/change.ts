/**
 * M6 (rama), „Co się zmieniło” (UX_POSIEDZENIE §2.2 P5): które struktury planszy zostają w pełnym kolorze.
 *
 * Reguła (oparta na sprawdzonych liczbach):
 *  1. bierzemy liczby planszy z `changeLinks` (powiązanie liczba → struktury w układzie planszy), których wartość
 *     w momencie i wartość spoczynkowa są na ekranie (status checked_*), z poziomu Podstawowego (bez tier 'student');
 *  2. krotność zmiany = max(b/a, a/b) z wartości na ekranie (np. „ok. 5” → „ok. 20–25” = 22,5 / 5 = 4,5;
 *     „100%” → „ok. −30%” = 100 / 70); tekst w nawiasie pomijamy (to dopisek, nie wartość);
 *     spoczynek OPISOWY („cisza; ok. 8–9 przy włączeniu”, „brak”, wartość 0 bez zmiany procentowej) daje krotność
 *     nieokreśloną: liczba nie bierze udziału w regule (decyzja Dyrygenta, kontrola M6);
 *  3. w pełnym kolorze zostają struktury liczb o krotności ≥ 70% największej na planszy, najwyżej
 *     MAX_PER_VIEW = 4 struktury na widok (najpierw największa krotność; remis według kolejności liczb w changeLinks);
 *  4. gdy żadnej liczby nie da się porównać, wyróżniamy struktury z `changeIllustration` z chipem „ilustracja”.
 * Krotność służy tylko do wyboru struktur: na ekranie stoją wyłącznie sprawdzone wartości (spoczynek → moment).
 * Test: scripts/atlas_check_change.mjs (w npm run check:atlas).
 */
import { isShown } from './palette';
import type { AtlasMetric, AtlasPlateContent } from './types';

export const CHANGE_THRESHOLD = 0.7;
export const MAX_PER_VIEW = 4;

/** Liczby w wartości (bez dopisku w nawiasie); minus „−” i „-” przed liczbą; przecinek dziesiętny. */
export function parseValue(v: string): number[] {
  const core = v.replace(/\([^)]*\)/g, ' ');
  return [...core.matchAll(/([−-])?\s?(\d+(?:[.,]\d+)?)/g)].map((m) => (m[1] ? -1 : 1) * Number(m[2].replace(',', '.')));
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Spoczynek opisowy: słowa „cisza”, „brak”, „nie dotyczy” albo kilka stanów rozdzielonych średnikiem. */
export function isDescriptive(v: string): boolean {
  const core = v.replace(/\([^)]*\)/g, ' ');
  return /\b(cisza|brak|nie dotyczy)\b/i.test(core) || core.includes(';');
}

/** Krotność zmiany liczby (≥ 1) albo null, gdy nie da się jej uczciwie policzyć z wartości na ekranie. */
export function foldOf(m: AtlasMetric): number | null {
  if (!isShown(m.status) || !isShown(m.restStatus ?? m.status) || m.tier === 'student') return null;
  if (isDescriptive(m.rest) || isDescriptive(m.sprint)) return null;
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
  /** Kotwice w pełnym kolorze (najwyżej MAX_PER_VIEW na widok). */
  anchors: string[];
  /** Liczby, z których wynika wybór (od największej zmiany); pusta przy ilustracji. */
  basis: AtlasMetric[];
  illustration: boolean;
}

export function computeChange(content: AtlasPlateContent): AtlasChange | null {
  const viewOf = new Map(content.labels.map((l) => [l.anchor, l.view]));
  const scored = (content.changeLinks ?? [])
    .map((l, order) => {
      const m = content.metrics.find((x) => x.id === l.metric);
      const fold = m ? foldOf(m) : null;
      return m && fold !== null ? { m, fold, anchors: l.anchors, order } : null;
    })
    .filter((x): x is { m: AtlasMetric; fold: number; anchors: string[]; order: number } => x !== null)
    .sort((x, y) => y.fold - x.fold || x.order - y.order);
  if (scored.length) {
    const top = scored[0].fold;
    const chosen = scored.filter((s) => s.fold >= CHANGE_THRESHOLD * top);
    const perView = new Map<string, number>();
    const anchors: string[] = [];
    const basis: AtlasMetric[] = [];
    for (const s of chosen) {
      let used = false;
      for (const a of s.anchors) {
        if (anchors.includes(a)) {
          used = true;
          continue;
        }
        const v = viewOf.get(a) ?? '?';
        if ((perView.get(v) ?? 0) >= MAX_PER_VIEW) continue;
        perView.set(v, (perView.get(v) ?? 0) + 1);
        anchors.push(a);
        used = true;
      }
      if (used) basis.push(s.m);
    }
    return { anchors, basis, illustration: false };
  }
  if (content.changeIllustration?.length) return { anchors: content.changeIllustration, basis: [], illustration: true };
  return null;
}
