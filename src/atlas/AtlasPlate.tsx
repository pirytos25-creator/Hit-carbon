import { useMemo, useState } from 'react';
import type { AtlasAnchorsFile, AtlasLabel, AtlasPlateContent, AtlasState, AtlasView } from './types';

/**
 * Wspólny komponent planszy (faza 0). Rysuje 1-2 widoki z renderu Blendera i podpisy w jednym układzie SVG,
 * więc kotwice z anchors.json (0-1) trafiają dokładnie w struktury przy każdej szerokości ekranu.
 * Zasady wyglądu: docs/ATLAS_STYLE_BIBLE.md §4. Nie zmieniać bez uzgodnienia z integratorem.
 */

const PAD = 480; // miejsce na podpisy po bokach (jednostki = piksele renderu)
const GAP = 40; // odstęp między widokami
const LABEL_GAP = 168; // minimalny pionowy odstęp między podpisami
const CROP_MARGIN = 0.025; // margines wokół obrysu ciała
const ROLE_CHARS = 24; // maks. znaków w linii opisu roli

function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    if (cur && (cur + ' ' + w).length > max) {
      lines.push(cur);
      cur = w;
    } else {
      cur = cur ? `${cur} ${w}` : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

interface Props {
  content: AtlasPlateContent;
  anchors: AtlasAnchorsFile;
  state: AtlasState;
  baseUrl: string;
  /** Pokaż tylko te widoki (na wąskich ekranach AtlasApp rysuje każdy widok osobno, jeden pod drugim). */
  onlyViews?: AtlasView[];
}

interface PlacedLabel {
  label: AtlasLabel;
  ax: number;
  ay: number;
  ly: number;
  side: 'left' | 'right';
}

/** Wysokość bloku podpisu w jednostkach SVG (nazwa + łacina + linie roli, w dłuższym z dwóch stanów). */
function labelHeight(l: AtlasLabel): number {
  const lines = Math.max(wrap(l.role.rest, ROLE_CHARS).length, wrap(l.role.sprint, ROLE_CHARS).length);
  return 44 + (l.nameLat ? 36 : 0) + lines * 34;
}

function placeLabels(items: Omit<PlacedLabel, 'ly'>[], height: number): PlacedLabel[] {
  const out: PlacedLabel[] = [];
  for (const side of ['left', 'right'] as const) {
    const group = items.filter((i) => i.side === side).sort((a, b) => a.ay - b.ay);
    let prevBottom = 40;
    const placed = group.map((g) => {
      // ly = linia bazowa nazwy + 14; blok zaczyna się ok. 50 jednostek nad ly.
      const ly = Math.max(g.ay, prevBottom + 50, LABEL_GAP / 2);
      prevBottom = ly - 50 + labelHeight(g.label) + 24;
      return { ...g, ly };
    });
    // Jeśli ostatni podpis wyszedł za dół, przesuń całą grupę w górę.
    const overflow = placed.length ? placed[placed.length - 1].ly - (height - 90) : 0;
    if (overflow > 0) placed.forEach((p) => (p.ly -= overflow));
    out.push(...placed);
  }
  return out;
}

export function AtlasPlate({ content, anchors, state, baseUrl, onlyViews }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [W, H] = anchors.resolution;
  const views = useMemo(
    () => content.views.filter((v) => anchors.views[v] && (!onlyViews || onlyViews.includes(v))),
    [content.views, anchors, onlyViews]
  );
  const color = `var(${content.colorVar})`;
  const colorLight = `var(${content.colorVar}-light)`;

  const layout = useMemo(() => {
    let x = PAD;
    return views.map((view, idx) => {
      const v = anchors.views[view]!;
      const bbox = v.bbox ?? [0, 0, 1, 1];
      const cx0 = Math.max(0, bbox[0] - CROP_MARGIN) * W;
      const cx1 = Math.min(1, bbox[2] + CROP_MARGIN) * W;
      const fw = cx1 - cx0;
      const ox = x;
      x += fw + GAP;
      const forcedSide: 'left' | 'right' | null =
        views.length > 1 ? (idx === 0 ? 'left' : idx === views.length - 1 ? 'right' : null) : null;
      const items = content.labels
        .filter((l) => l.view === view && v.anchors[l.anchor])
        .map((l) => {
          const [nx, ny] = v.anchors[l.anchor];
          const ax = ox + nx * W - cx0;
          const ay = ny * H;
          const side = forcedSide ?? (nx < 0.5 ? 'left' : 'right');
          return { label: l, ax, ay, side };
        });
      return { view, v, ox, fw, cx0, labels: placeLabels(items, H) };
    });
  }, [views, anchors, content.labels, W, H]);

  const totalW = layout.reduce((s, f) => s + f.fw, 0) + GAP * Math.max(0, layout.length - 1) + PAD * 2;
  const sprint = state === 'sprint';

  return (
    <svg
      viewBox={`0 0 ${totalW} ${H}`}
      className={`w-full select-none ${onlyViews ? 'h-auto' : 'h-full'}`}
      role="img"
      aria-label={`${content.titlePl}: ${sprint ? 'sprint' : 'spoczynek'}`}
    >
      <defs>
        {layout.map((f) => (
          <clipPath id={`atlas-clip-${content.id}-${f.view}`} key={f.view}>
            <rect x={f.ox} y={0} width={f.fw} height={H} />
          </clipPath>
        ))}
      </defs>

      {layout.map((f) => (
        <g key={f.view}>
          <g clipPath={`url(#atlas-clip-${content.id}-${f.view})`}>
            {(['rest', 'sprint'] as AtlasState[]).map((s) =>
              f.v.images[s] ? (
                <image
                  key={s}
                  href={`${baseUrl}${f.v.images[s]}`}
                  x={f.ox - f.cx0}
                  y={0}
                  width={W}
                  height={H}
                  style={{ opacity: s === state ? 1 : 0, transition: 'opacity 700ms ease' }}
                />
              ) : null
            )}
          </g>
          <text
            x={f.ox + f.fw / 2}
            y={H - 18}
            textAnchor="middle"
            fill="#64748b"
            style={{ font: '600 30px var(--font-display)', letterSpacing: 3, textTransform: 'uppercase' }}
          >
            {content.viewTitlesPl[f.view as AtlasView] ?? f.view}
          </text>

          {f.labels.map((p) => {
            const key = `${f.view}-${p.label.anchor}`;
            const dim = hovered !== null && hovered !== key;
            const primary = p.label.tier !== 'secondary';
            const edgeX = p.side === 'left' ? f.ox - 6 : f.ox + f.fw + 6;
            const textX = p.side === 'left' ? edgeX - 22 : edgeX + 22;
            const anchor = p.side === 'left' ? 'end' : 'start';
            const lineColor = primary ? colorLight : '#94a3b8';
            return (
              <g
                key={key}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                style={{ opacity: dim ? 0.25 : 1, transition: 'opacity 200ms' }}
              >
                <polyline
                  points={`${p.ax},${p.ay} ${edgeX},${p.ly} ${p.side === 'left' ? edgeX - 14 : edgeX + 14},${p.ly}`}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={2.4}
                  strokeOpacity={0.85}
                />
                {sprint && primary && (
                  <circle className="atlas-pulse" cx={p.ax} cy={p.ay} r={10} fill="none" stroke={colorLight} strokeWidth={3} />
                )}
                <circle cx={p.ax} cy={p.ay} r={9} fill={primary ? color : '#94a3b8'} stroke="#f8fafc" strokeWidth={3} />
                <text x={textX} y={p.ly - 14} textAnchor={anchor} fill="#f1f5f9" style={{ font: '700 38px var(--font-display)' }}>
                  {p.label.namePl}
                </text>
                {p.label.nameLat && (
                  <text x={textX} y={p.ly + 22} textAnchor={anchor} fill="#94a3b8" style={{ font: 'italic 400 28px var(--font-body)' }}>
                    {p.label.nameLat}
                  </text>
                )}
                <text
                  textAnchor={anchor}
                  fill={sprint && primary ? colorLight : '#cbd5e1'}
                  style={{ font: '500 29px var(--font-body)' }}
                >
                  {wrap(p.label.role[state], ROLE_CHARS).map((line, i) => (
                    <tspan key={i} x={textX} y={p.ly + (p.label.nameLat ? 58 : 24) + i * 34}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
