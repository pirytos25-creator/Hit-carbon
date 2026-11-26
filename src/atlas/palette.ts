import paletteJson from './data/palette.json';
import type { AtlasFactStatus, AtlasPlateContent, AtlasState, AtlasSystemId } from './types';
import { ATLAS_SHOWN_STATUSES } from './types';

/** Paleta atlasu: jedno źródło kolorów dla Pythona i TS (src/atlas/data/palette.json). */
export interface AtlasPaletteSystem {
  key: string;
  plate: string | null;
  token: string;
  namePl: string;
  color: string;
  light: string;
  glyph: string;
  group: string;
}

export const PALETTE = paletteJson as unknown as {
  restMix: number;
  context: Record<string, string>;
  systems: AtlasPaletteSystem[];
  groups: { key: string; namePl: string }[];
};

/** Zmienne CSS --sys-* z palety (atlas ustawia je na swoim korzeniu, więc nie zależy od kopii w index.css). */
export function paletteCssVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const s of PALETTE.systems) {
    vars[s.token] = s.color;
    vars[`${s.token}-light`] = s.light;
  }
  vars['--atlas-bg'] = PALETTE.context.pageBg;
  return vars;
}

export function systemOfPlate(id: AtlasSystemId): AtlasPaletteSystem | undefined {
  return PALETTE.systems.find((s) => s.plate === id);
}

export function isShown(status: AtlasFactStatus | undefined): boolean {
  return ATLAS_SHOWN_STATUSES.includes(status ?? 'draft');
}

/**
 * Tekst podsumowania na ekranie (reguła 1b): sprawdzone podsumowanie, a jeśli czeka na sprawdzenie – same zdania już
 * potwierdzone (`summaryVerified`), a gdy ich nie ma – null (nic). Walidator pilnuje, by UI brał tekst tylko stąd.
 */
export function shownSummary(content: AtlasPlateContent, state: AtlasState): string | null {
  if (isShown(content.summaryStatus?.[state])) return content.summary[state];
  return content.summaryVerified?.[state]?.text ?? null;
}

/** Poziom złożoności (model §3.5). */
export type AtlasLevel = 'basic' | 'extended';

/** Drabina sformułowań poziomu dowodów (model §3.4): poziom dowodów słychać w języku, nie tylko w kolorze plakietki. */
export const EVIDENCE_PHRASE: Record<string, string> = {
  established_human: 'U ludzi dobrze wiadomo',
  probable_human: 'Najpewniej tak u ludzi',
  preliminary_human: 'Pierwsze badania sugerują',
  animal_model: 'Zaobserwowano u zwierząt; u ludzi tego nie wiemy',
  contested_debate: 'Naukowcy się spierają',
};
