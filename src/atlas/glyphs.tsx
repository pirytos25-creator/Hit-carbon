/**
 * Ikony (glify) układów: kolor nigdy nie jest jedynym nośnikiem informacji (WCAG 1.4.1, model §2 pkt 6).
 * Proste piktogramy 24×24 rysowane linią w kolorze `currentColor`. Klucz glifu: palette.json → systems[].glyph.
 */
const PATHS: Record<string, string[]> = {
  // neuron: ciało komórki, dendryty, akson z zakończeniem
  nerve: ['M8 8m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M10.2 10.2L18 18', 'M18 18l3 .5', 'M18 18l.5 3', 'M5.9 5.9L3.5 3.5', 'M5 9.5l-2.5 1', 'M9.5 5l1-2.5'],
  // dwie półkule z bruzdą
  brain: [
    'M12 5c-1.6-1.8-4.6-1.4-5.4.8-2 .2-3.2 2.2-2.5 4-1.3 1.2-1.2 3.4.3 4.4-.3 2.2 1.7 3.8 3.6 3.3.8 1.4 2.8 1.8 4 .6',
    'M12 5c1.6-1.8 4.6-1.4 5.4.8 2 .2 3.2 2.2 2.5 4 1.3 1.2 1.2 3.4-.3 4.4.3 2.2-1.7 3.8-3.6 3.3-.8 1.4-2.8 1.8-4 .6',
    'M12 5v13.1',
  ],
  // kropla wydzieliny (gruczoł dokrewny)
  endo: ['M12 3.5c3 4.2 6 7.4 6 10.9a6 6 0 0 1-12 0c0-3.5 3-6.7 6-10.9z', 'M9.2 14.6a2.9 2.9 0 0 0 2.8 2.6'],
  // brzusiec mięśnia z włóknami i ścięgnami
  muscle: ['M2.5 12h3.5', 'M18 12h3.5', 'M6 12c0-3.6 2.8-6 6-6s6 2.4 6 6-2.8 6-6 6-6-2.4-6-6z', 'M8.5 10c2 .9 5 .9 7 0', 'M8.5 14c2-.9 5-.9 7 0'],
  // kość długa
  bone: [
    'M8.6 8.6l6.8 6.8',
    'M5.6 7.8m-2.1 0a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0',
    'M7.8 5.6m-2.1 0a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0',
    'M18.4 16.2m-2.1 0a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0',
    'M16.2 18.4m-2.1 0a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0',
  ],
  // serce
  heart: ['M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z'],
  // tchawica i dwa płuca
  lungs: ['M12 3v8', 'M12 11l-2.5 2', 'M12 11l2.5 2', 'M9.2 7C5.5 7 3.5 12.5 4.2 17.6c.4 2.1 2.8 2.6 4.8 1.6V9.4', 'M14.8 7c3.7 0 5.7 5.5 5 10.6-.4 2.1-2.8 2.6-4.8 1.6V9.4'],
  // żołądek z przełykiem i dwunastnicą
  digest: ['M10 3v4.5c0 1.8-3.5 2.6-3.5 6.8a6 6 0 0 0 10.3 4.1c2-2.2 2.6-6.1-.3-7.7-1.9-1-3.5.4-3.5-3V3', 'M10.8 20.2c.3 .8.3 1.5-.1 1.8'],
  // warstwy skóry
  skin: ['M3 8.5c3-2 6 2 9 0s6-2 9 0', 'M3 13.5h18', 'M3 18.5h18', 'M8 13.5v5', 'M16 13.5v5'],
  // nerka i moczowód
  kidney: ['M9.2 4C6 4 4 7 4 11s2 8 5.2 8c2.5 0 3-2.4 2-4.4-.6-1.2-.6-2.8 0-4C12.2 8.6 11.8 4 9.2 4z', 'M11.6 12h3c2 0 3.2 1.5 3.2 4v5'],
  // węzeł chłonny z naczyniami
  lymph: ['M12 12m-4.5 0a4.5 3.2 0 1 0 9 0a4.5 3.2 0 1 0 -9 0', 'M3 8.5l4.6 2.3', 'M3 15.5l4.6-2.3', 'M16.5 12H21'],
  // symbol obu płci (koło + krzyżyk + strzałka)
  repro: ['M11 11m-4.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0', 'M11 15.5V21', 'M8.2 18.5h5.6', 'M14.3 7.7L19 3', 'M15.5 3H19v3.5'],
};

export function AtlasGlyph({ glyph, size = 18, title }: { glyph: string; size?: number; title?: string }) {
  const paths = PATHS[glyph] ?? PATHS.heart;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

export const GLYPH_KEYS = Object.keys(PATHS);
