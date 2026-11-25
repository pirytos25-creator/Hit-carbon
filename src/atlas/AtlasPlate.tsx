import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { projectToPixels } from './projection';
import type {
  AtlasAnchorsFile,
  AtlasFlowKind,
  AtlasFlows3DFile,
  AtlasLabel,
  AtlasPlateContent,
  AtlasState,
  AtlasView,
} from './types';

/**
 * Wspólny komponent planszy. Rysuje 1-3 widoki z renderu Blendera, podpisy i strzałki przepływu w jednym układzie SVG,
 * więc kotwice z anchors.json (0-1) trafiają dokładnie w struktury przy każdej szerokości ekranu.
 * Faza 2 (integrator):
 *  - rozmiar podpisów i kolumn liczony w PIKSELACH EKRANU (proporcjonalnie do miejsca), a nie w stałych jednostkach
 *    renderu: plansza pozioma (mózg) i pionowa (całe ciało) mają tak samo duże napisy;
 *  - strona podpisu = strona bliższa kotwicy (linia nie przecina struktury); między widokami powstaje kolumna podpisów;
 *  - tytuł widoku pod obrazem, nie na renderze;
 *  - strzałki: content.flows (piksele renderu) i flows3d.json (metry, rzut kamerą widoku z anchors.json).
 * Zasady wyglądu: docs/ATLAS_STYLE_BIBLE.md §4. Zmienia tylko integrator.
 */

const CROP_MARGIN = 0.025; // margines wokół obrysu ciała (ułamek renderu)

/** Kolor strzałki wg rodzaju (tokeny z index.css). */
const FLOW_COLOR: Record<AtlasFlowKind, string> = {
  artery: 'var(--sys-artery-light)',
  vein: 'var(--sys-vein-light)',
  air: 'var(--sys-resp-light)',
  nerve: 'var(--sys-nerve-light)',
  brain: 'var(--sys-brain-light)',
  muscle: 'var(--sys-muscle-light)',
  hormone: 'var(--sys-endo-light)',
  heat: 'var(--sys-skin-light)',
  lactate: 'var(--sys-muscle-light)',
  glucose: 'var(--sys-digest-light)',
  urine: 'var(--sys-urinary-light)',
  force: 'var(--sys-bone-light)',
};

/** Wymiary typograficzne w pikselach ekranu. */
interface Typo {
  name: number;
  lat: number;
  role: number;
  col: number; // szerokość kolumny podpisów
  gap: number; // odstęp między podpisami
  title: number;
}
const TYPO_WIDE: Typo = { name: 14, lat: 11.5, role: 12, col: 200, gap: 8, title: 11 };
const TYPO_NARROW: Typo = { name: 11, lat: 9.5, role: 10, col: 118, gap: 5, title: 10 };

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
  /** Pokaż tylko te widoki. */
  onlyViews?: AtlasView[];
  /** Dopasuj do wysokości kontenera (szeroki ekran), a nie tylko do szerokości (widoki jeden pod drugim). */
  fitHeight?: boolean;
  /** Strzałki w metrach (public/atlas/<id>/flows3d.json). */
  flows3d?: AtlasFlows3DFile | null;
}

interface PlacedLabel {
  label: AtlasLabel;
  ax: number;
  ay: number;
  ly: number;
  side: 'left' | 'right';
}

export function AtlasPlate({ content, anchors, state, baseUrl, onlyViews, fitHeight, flows3d }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 900, h: 700 });
  const [W, H] = anchors.resolution;
  const views = useMemo(
    () => content.views.filter((v) => anchors.views[v] && (!onlyViews || onlyViews.includes(v))),
    [content.views, anchors, onlyViews]
  );
  const color = `var(${content.colorVar})`;
  const colorLight = `var(${content.colorVar}-light)`;
  const sprint = state === 'sprint';

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth || 900, h: el.clientHeight || 700 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Widoki: kadr (obrys ciała + margines) i strona każdego podpisu.
  const frames = useMemo(
    () =>
      views.map((view) => {
        const v = anchors.views[view]!;
        const bbox = v.bbox ?? [0, 0, 1, 1];
        const cx0 = Math.max(0, bbox[0] - CROP_MARGIN) * W;
        const cx1 = Math.min(1, bbox[2] + CROP_MARGIN) * W;
        const mid = ((bbox[0] + bbox[2]) / 2) * W;
        const labels = content.labels
          .filter((l) => l.view === view && v.anchors[l.anchor])
          .map((l) => {
            const [nx, ny] = v.anchors[l.anchor];
            const side: 'left' | 'right' = l.side ?? (nx * W < mid ? 'left' : 'right');
            return { label: l, nx, ny, side };
          });
        return {
          view,
          v,
          cx0,
          fw: cx1 - cx0,
          hasLeft: labels.some((l) => l.side === 'left'),
          hasRight: labels.some((l) => l.side === 'right'),
          labels,
        };
      }),
    [views, anchors, content.labels, W]
  );

  // Skala: ile pikseli ekranu przypada na jednostkę renderu. Kolumny podpisów mają stałą szerokość w pikselach ekranu.
  const narrow = box.w < 640;
  const cols = frames.reduce((n, f) => n + (f.hasLeft ? 1 : 0) + (f.hasRight ? 1 : 0), 0);
  // Kolumny podpisów zajmują najwyżej połowę szerokości; przy wielu kolumnach są węższe (tekst się zawija).
  const base = narrow ? TYPO_NARROW : TYPO_WIDE;
  const colPx = Math.round(Math.min(base.col, Math.max(narrow ? 96 : 132, (box.w * 0.5) / Math.max(1, cols))));
  const T: Typo = useMemo(() => ({ ...base, col: colPx }), [base, colPx]);
  const gapPx = 16;
  const imagesW = frames.reduce((s, f) => s + f.fw, 0);
  const titlePx = T.title * 2.4;
  const sW = (box.w - cols * T.col - gapPx * Math.max(0, frames.length - 1) - 8) / Math.max(1, imagesW);
  const sH = (box.h - titlePx) / H;
  const s = Math.max(0.05, fitHeight || !onlyViews ? Math.min(sW, sH) : sW);
  const u = 1 / s; // jednostki renderu na piksel ekranu
  const colU = T.col * u;
  const titleU = titlePx * u;

  const layout = useMemo(() => {
    let x = 0;
    // Szacunkowa szerokość znaku (Figtree pogrubiony / Noto Sans) - nazwy i opisy zawijają się w kolumnie.
    const roleChars = Math.max(12, Math.floor((T.col - 20) / (T.role * 0.56)));
    const nameChars = Math.max(10, Math.floor((T.col - 20) / (T.name * 0.6)));
    const latChars = Math.max(12, Math.floor((T.col - 20) / (T.lat * 0.52)));
    const blockH = (l: AtlasLabel) => {
      const lines = Math.max(wrap(l.role.rest, roleChars).length, wrap(l.role.sprint, roleChars).length);
      const nl = wrap(l.namePl, nameChars).length;
      const ll = l.nameLat ? wrap(l.nameLat, latChars).length : 0;
      return (nl * T.name * 1.2 + ll * T.lat * 1.25 + lines * T.role * 1.25) * u;
    };
    return frames.map((f) => {
      const leftEdge = x + (f.hasLeft ? colU : 0);
      const ox = leftEdge;
      x = ox + f.fw + (f.hasRight ? colU : 0) + gapPx * u;
      const placed: PlacedLabel[] = [];
      for (const side of ['left', 'right'] as const) {
        const group = f.labels
          .filter((l) => l.side === side)
          .map((l) => ({ label: l.label, ax: ox + l.nx * W - f.cx0, ay: l.ny * H, side }))
          .sort((a, b) => a.ay - b.ay);
        let prevBottom = 0;
        const col = group.map((g) => {
          const top = Math.max(g.ay - T.name * 0.9 * u, prevBottom + T.gap * u);
          prevBottom = top + blockH(g.label);
          return { ...g, ly: top + T.name * 0.9 * u };
        });
        const overflow = col.length ? prevBottom - H : 0;
        if (overflow > 0) col.forEach((p) => (p.ly -= overflow));
        placed.push(...col);
      }
      return { ...f, ox, placed, roleChars, nameChars, latChars };
    });
  }, [frames, colU, u, W, H, T]);

  const totalW = layout.length
    ? layout[layout.length - 1].ox + layout[layout.length - 1].fw + (layout[layout.length - 1].hasRight ? colU : 0)
    : W;
  // Gdy podpisy jednej kolumny nie mieszczą się w wysokości obrazu, rysunek rośnie w górę (nic nie jest ucinane).
  const minTop = Math.min(0, ...layout.flatMap((f) => f.placed.map((p) => p.ly - T.name * 1.1 * u)));
  const totalH = H + titleU - minTop;

  // Strzałki: piksele renderu -> współrzędne SVG widoku.
  const flowsByView = useMemo(() => {
    const out: Record<string, { key: string; kind: AtlasFlowKind; label?: string; pts: [number, number][] }[]> = {};
    for (const f of content.flows ?? []) {
      (out[f.view] ??= []).push({ key: `px-${f.view}-${f.labelPl ?? ''}-${f.points[0]}`, kind: f.kind, label: f.labelPl, pts: f.points });
    }
    for (const f of flows3d?.flows ?? []) {
      for (const view of views) {
        const cam = anchors.views[view]?.camera;
        if (!cam || (f.views && !f.views.includes(view))) continue;
        (out[view] ??= []).push({
          key: `3d-${view}-${f.id}`,
          kind: f.kind,
          label: f.labelPl,
          pts: f.points.map((p) => projectToPixels(p, cam, anchors.resolution)),
        });
      }
    }
    return out;
  }, [content.flows, flows3d, views, anchors]);

  const dash = 9 * u;
  const dashGap = 7 * u;
  const cycle = dash + dashGap;

  return (
    <div ref={wrapRef} className={`w-full ${onlyViews && !fitHeight ? '' : 'h-full min-h-0'} flex items-center justify-center`}>
      <svg
        viewBox={`0 ${minTop} ${totalW} ${totalH}`}
        width={totalW * s}
        height={totalH * s}
        className="select-none"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        role="img"
        aria-label={`${content.titlePl}: ${sprint ? 'sprint' : 'spoczynek'}`}
      >
        <defs>
          {layout.map((f) => (
            <clipPath id={`atlas-clip-${content.id}-${f.view}`} key={f.view}>
              <rect x={f.ox} y={0} width={f.fw} height={H} />
            </clipPath>
          ))}
          {(Object.keys(FLOW_COLOR) as AtlasFlowKind[]).map((k) => (
            <marker
              key={k}
              id={`atlas-arrow-${content.id}-${k}`}
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.2"
              markerHeight="3.2"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={FLOW_COLOR[k]} />
            </marker>
          ))}
        </defs>

        {layout.map((f) => (
          <g key={f.view}>
            <g clipPath={`url(#atlas-clip-${content.id}-${f.view})`}>
              {(['rest', 'sprint'] as AtlasState[]).map((st) =>
                f.v.images[st] ? (
                  <image
                    key={st}
                    href={`${baseUrl}${f.v.images[st]}`}
                    x={f.ox - f.cx0}
                    y={0}
                    width={W}
                    height={H}
                    style={{ opacity: st === state ? 1 : 0, transition: 'opacity 700ms ease' }}
                  />
                ) : null
              )}
              {(flowsByView[f.view] ?? []).map((fl) => {
                const pts = fl.pts.map(([px, py]) => `${f.ox - f.cx0 + px},${py}`).join(' ');
                return (
                  <g key={fl.key} className="atlas-flow-group" aria-label={fl.label}>
                    <title>{fl.label}</title>
                    <polyline points={pts} fill="none" stroke="#070b14" strokeOpacity={0.55} strokeWidth={5.5 * u} strokeLinejoin="round" strokeLinecap="round" />
                    <polyline
                      points={pts}
                      fill="none"
                      stroke={FLOW_COLOR[fl.kind]}
                      strokeWidth={2.6 * u}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${dashGap}`}
                      markerEnd={`url(#atlas-arrow-${content.id}-${fl.kind})`}
                      opacity={sprint ? 0.95 : 0.7}
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to={`${-cycle}`}
                        dur={sprint ? '0.55s' : '1.6s'}
                        repeatCount="indefinite"
                      />
                    </polyline>
                  </g>
                );
              })}
            </g>
            <text
              x={f.ox + f.fw / 2}
              y={H + titleU * 0.62}
              textAnchor="middle"
              fill="#64748b"
              style={{ font: `600 ${T.title * u}px var(--font-display)`, letterSpacing: 0.2 * T.title * u, textTransform: 'uppercase' }}
            >
              {content.viewTitlesPl[f.view as AtlasView] ?? f.view}
            </text>

            {f.placed.map((p) => {
              const key = `${f.view}-${p.label.anchor}`;
              const dim = hovered !== null && hovered !== key;
              const primary = p.label.tier === undefined || p.label.tier === 'primary';
              const edgeX = p.side === 'left' ? f.ox - 4 * u : f.ox + f.fw + 4 * u;
              const textX = p.side === 'left' ? edgeX - 12 * u : edgeX + 12 * u;
              const anchor = p.side === 'left' ? 'end' : 'start';
              const lineColor = primary ? colorLight : '#94a3b8';
              const nameLines = wrap(p.label.namePl, f.nameChars);
              const latLines = p.label.nameLat ? wrap(p.label.nameLat, f.latChars) : [];
              const latY0 = p.ly + (nameLines.length - 1) * T.name * 1.2 * u + T.lat * 1.2 * u;
              const roleY0 = latY0 + (latLines.length ? (latLines.length - 1) * T.lat * 1.25 * u + T.role * 1.25 * u : T.role * 0.05 * u);
              return (
                <g
                  key={key}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ opacity: dim ? 0.25 : 1, transition: 'opacity 200ms' }}
                >
                  <polyline
                    points={`${p.ax},${p.ay} ${edgeX},${p.ly - T.name * 0.35 * u} ${p.side === 'left' ? edgeX - 8 * u : edgeX + 8 * u},${p.ly - T.name * 0.35 * u}`}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth={1.1 * u}
                    strokeOpacity={0.85}
                  />
                  {sprint && primary && (
                    <circle className="atlas-pulse" cx={p.ax} cy={p.ay} r={4 * u} fill="none" stroke={colorLight} strokeWidth={1.2 * u} />
                  )}
                  <circle cx={p.ax} cy={p.ay} r={3.6 * u} fill={primary ? color : '#94a3b8'} stroke="#f8fafc" strokeWidth={1.2 * u} />
                  <text textAnchor={anchor} fill="#f1f5f9" style={{ font: `700 ${T.name * u}px var(--font-display)` }}>
                    {nameLines.map((line, i) => (
                      <tspan key={i} x={textX} y={p.ly + i * T.name * 1.2 * u}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                  {latLines.length > 0 && (
                    <text textAnchor={anchor} fill="#94a3b8" style={{ font: `italic 400 ${T.lat * u}px var(--font-body)` }}>
                      {latLines.map((line, i) => (
                        <tspan key={i} x={textX} y={latY0 + i * T.lat * 1.25 * u}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  )}
                  <text textAnchor={anchor} fill={sprint && primary ? colorLight : '#cbd5e1'} style={{ font: `500 ${T.role * u}px var(--font-body)` }}>
                    {wrap(p.label.role[state], f.roleChars).map((line, i) => (
                      <tspan key={i} x={textX} y={roleY0 + i * T.role * 1.25 * u}>
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
    </div>
  );
}

/** Wczytuje public/atlas/<id>/flows3d.json (brak pliku = brak strzałek 3D). */
export function useFlows3d(url: string): AtlasFlows3DFile | null {
  const [data, setData] = useState<AtlasFlows3DFile | null>(null);
  useEffect(() => {
    let alive = true;
    setData(null);
    fetch(url)
      .then((r) => (r.ok ? (r.json() as Promise<AtlasFlows3DFile>) : null))
      .then((d) => alive && setData(d))
      .catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, [url]);
  return data;
}
