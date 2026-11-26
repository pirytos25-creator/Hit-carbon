import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EVIDENCE_PHRASE, isShown, type AtlasLevel } from './palette';
import { projectToPixels, viewResolution } from './projection';
import type {
  AtlasAnchorsFile,
  AtlasFlowKind,
  AtlasFlows3DFile,
  AtlasLabel,
  AtlasPlateContent,
  AtlasState,
  AtlasView,
} from './types';
import type { EvidenceLevel } from '../types/biogenesis';

/**
 * Wspólny komponent planszy (integrator, faza 2 + E0).
 *  - Obraz, linie odnośników, kropki kotwic i strzałki przepływu: SVG w jednostkach renderu (kotwice z anchors.json trafiają
 *    w struktury przy każdej szerokości).
 *  - Podpisy: nakładka HTML (nazwa 15 px, łacina i opis 14 px), więc tekst jest czytelny, da się go zaznaczyć, czyta go
 *    czytnik ekranu, a podpis wybiera się najechaniem, fokusem (Tab) albo dotknięciem (model E0).
 *  - Wąski ekran (telefon): numerowane pinezki na obrazie i lista pod spodem.
 *  - Poziom podstawowy: tylko podpisy 'primary', bez łaciny. Rozszerzony: wszystkie podpisy i łacina.
 *  - Opis roli widać tylko wtedy, gdy ma status 'checked_agent' (albo 'anatomy'); nazwa struktury jest zawsze.
 *  - prefers-reduced-motion: bez animacji strzałek, pulsowania i przenikania obrazów.
 * Zasady wyglądu: docs/ATLAS_STYLE_BIBLE.md §4. Zmienia tylko integrator.
 */

const CROP_MARGIN = 0.025;

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
  lymph: 'var(--sys-lymph-light)',
  repro: 'var(--sys-repro-light)',
};

/** Typografia w pikselach ekranu (≥ 14 px dla każdego tekstu podpisu). */
const FONT = { name: 15, lat: 14, role: 14, title: 14, pin: 14 };
const COL_MAX = 216;
const COL_MIN = 140;
const CHAR = 0.56; // szacunkowa szerokość znaku względem rozmiaru czcionki (zawijanie, wysokość bloku)
const PENDING = 'opis czeka na sprawdzenie źródła';

function wrapCount(text: string, maxChars: number): number {
  let lines = 1;
  let cur = 0;
  for (const w of text.split(' ')) {
    if (cur && cur + 1 + w.length > maxChars) {
      lines++;
      cur = w.length;
    } else cur = cur ? cur + 1 + w.length : w.length;
  }
  return lines;
}

export function usePrefersReducedMotion(): boolean {
  const q = '(prefers-reduced-motion: reduce)';
  const [r, setR] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setR(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
}

interface Props {
  content: AtlasPlateContent;
  anchors: AtlasAnchorsFile;
  state: AtlasState;
  baseUrl: string;
  onlyViews?: AtlasView[];
  fitHeight?: boolean;
  flows3d?: AtlasFlows3DFile | null;
  level: AtlasLevel;
  /**
   * Widoki, z którymi ten panel ma mieć wspólną skalę obrazu (telefon: każdy widok osobno, ale przód i bok tego samego
   * ciała w tej samej skali). Skala jest liczona dla najszerszego kadru z listy.
   */
  scaleWithViews?: AtlasView[];
}

interface Placed {
  key: string;
  label: AtlasLabel;
  ax: number; // kotwica, jednostki renderu
  ay: number;
  side: 'left' | 'right';
  topPx: number; // górna krawędź bloku podpisu w pikselach (0 = górna krawędź obrazu)
  hPx: number;
}

export function AtlasPlate({ content, anchors, state, baseUrl, onlyViews, fitHeight, flows3d, level, scaleWithViews }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 900, h: 700 });
  const [hover, setHover] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();
  const sprint = state === 'sprint';
  const extended = level === 'extended';
  const color = `var(${content.colorVar})`;
  const colorLight = `var(${content.colorVar}-light)`;
  const active = pinned ?? focus ?? hover;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth || 900, h: el.clientHeight || 700 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const views = useMemo(
    () => content.views.filter((v) => anchors.views[v] && (!onlyViews || onlyViews.includes(v))),
    [content.views, anchors, onlyViews]
  );
  // Rozdzielczość: własna widoku albo pliku. Widoki obok siebie muszą mieć tę samą (AtlasApp ich wtedy nie łączy).
  const [W, H] = views.length ? viewResolution(anchors, views[0]) : anchors.resolution;
  const pinsMode = box.w < 640;

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
          .filter((l) => extended || l.tier === undefined || l.tier === 'primary')
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
          labels,
          hasLeft: !pinsMode && labels.some((l) => l.side === 'left'),
          hasRight: !pinsMode && labels.some((l) => l.side === 'right'),
        };
      }),
    [views, anchors, content.labels, W, extended, pinsMode]
  );

  const roleText = (l: AtlasLabel): string | null => (isShown(l.roleStatus?.[state]) ? l.role[state] : null);
  // Poziom dowodów opisu roli: wspólny albo osobno dla stanu (zgodnie wstecz: zwykły string = oba stany).
  const roleEvidence = (l: AtlasLabel): EvidenceLevel | undefined =>
    typeof l.evidence === 'string' ? l.evidence : l.evidence?.[state];

  // skala: piksele ekranu na jednostkę renderu; kolumny podpisów mają szerokość w pikselach ekranu
  const cols = frames.reduce((n, f) => n + (f.hasLeft ? 1 : 0) + (f.hasRight ? 1 : 0), 0);
  const gapPx = 16;
  const cropW = (view: AtlasView) => {
    const b = anchors.views[view]?.bbox ?? [0, 0, 1, 1];
    return (Math.min(1, b[2] + CROP_MARGIN) - Math.max(0, b[0] - CROP_MARGIN)) * W;
  };
  const ownW = frames.reduce((acc, f) => acc + f.fw, 0);
  // Wspólna skala (jeden widok na panel): dzielimy przez najszerszy kadr z grupy, więc węższy kadr nie jest powiększany.
  const imagesW =
    scaleWithViews && frames.length === 1
      ? Math.max(ownW, ...scaleWithViews.filter((v) => anchors.views[v]).map(cropW))
      : ownW;
  // Kolumny podpisów: domyślnie połowa szerokości na wszystkie kolumny (140–216 px). Gdy obraz ogranicza szerokość,
  // a nie wysokość (np. mózg, render poziomy: przy 1440 tylko 436×400 px), próbujemy węższych kolumn (nie poniżej
  // 140 px) i bierzemy największy obraz, przy którym bloki podpisów nadal mieszczą się w wysokości planszy.
  // Plansze ograniczone wysokością się nie zmieniają.
  const freeW = box.w - gapPx * Math.max(0, frames.length - 1) - 8;
  const colBase = Math.round(Math.min(COL_MAX, Math.max(COL_MIN, (box.w * 0.5) / Math.max(1, cols))));
  // Tytuł widoku pod obrazem: szerokość = obraz + jego kolumny podpisów; wysokość z liczby linii (długie tytuły,
  // np. limfatyczny, nie są ucinane).
  const titleCharW = FONT.title * (CHAR * 1.12 + 0.12); // wielkie litery + odstęp 0.12em
  const captionWc = (f: (typeof frames)[number], sc: number, c: number) =>
    f.fw * sc + (f.hasLeft ? c : 0) + (f.hasRight ? c : 0);
  const linePx = FONT.title * 1.3;
  const blockPxC = (l: AtlasLabel, c: number) => {
    const charsFor = (f: number) => Math.max(10, Math.floor((c - 16) / (f * CHAR)));
    const rt = roleText(l);
    const roleLines = rt ? wrapCount(rt, charsFor(FONT.role)) : extended ? wrapCount(PENDING, charsFor(FONT.role)) : 0;
    const ev = roleEvidence(l);
    const evLines = rt && ev && ev !== 'established_human' ? wrapCount(EVIDENCE_PHRASE[ev], charsFor(FONT.role)) : 0;
    return (
      evLines * FONT.role * 1.3 +
      wrapCount(l.namePl, charsFor(FONT.name)) * FONT.name * 1.22 +
      (extended && l.nameLat ? wrapCount(l.nameLat, charsFor(FONT.lat)) * FONT.lat * 1.3 : 0) +
      roleLines * FONT.role * 1.35 +
      6
    );
  };
  // Najwyższy punkt bloków podpisów (px, ujemny = wystaje nad obraz) przy szerokości kolumny c i skali sc.
  const minTopFor = (c: number, sc: number) => {
    let m = 0;
    for (const f of frames)
      for (const side of ['left', 'right'] as const) {
        const ys = f.labels.filter((l) => l.side === side).map((l) => ({ ay: l.ny * H, l: l.label })).sort((a, b) => a.ay - b.ay);
        let prevBottom = -Infinity;
        let top0 = Infinity;
        for (const g of ys) {
          const topPx = Math.max(g.ay * sc - FONT.name * 0.7, prevBottom + 8);
          if (top0 === Infinity) top0 = topPx;
          prevBottom = topPx + blockPxC(g.l, c);
        }
        if (ys.length) m = Math.min(m, top0 - Math.max(0, prevBottom - H * sc));
      }
    return m;
  };
  const fitFor = (c: number) => {
    const sW = (freeW - cols * c) / Math.max(1, imagesW);
    const fitS = (tPx: number) => Math.max(0.05, fitHeight || !onlyViews ? Math.min(sW, (box.h - tPx) / H) : sW);
    const s0 = fitS(FONT.title * 2.2);
    const lines = Math.max(
      1,
      ...frames.map((f) =>
        wrapCount((content.viewTitlesPl[f.view] ?? f.view).toUpperCase(), Math.max(8, Math.floor(captionWc(f, s0, c) / titleCharW)))
      )
    );
    const tPx = Math.max(FONT.title * 2.2, lines * linePx + FONT.title * 0.9);
    const sc = fitS(tPx);
    return { c, s: sc, titlePx: tPx, fits: H * sc + tPx - minTopFor(c, sc) <= box.h + 1 };
  };
  const base = fitFor(colBase);
  let chosen = base;
  if (fitHeight && !pinsMode && cols > 0 && base.s < (box.h - base.titlePx) / H - 1e-6) {
    // największy obraz; przy remisie szersza kolumna (mniej zawijania)
    for (let c = colBase - 12; c >= COL_MIN; c -= 12) {
      const cand = fitFor(c);
      if (cand.fits && cand.s > chosen.s * 1.01) chosen = cand;
    }
  }
  const colPx = chosen.c;
  const titlePx = chosen.titlePx;
  const s = chosen.s;
  const captionW = (f: (typeof frames)[number], sc: number) => captionWc(f, sc, colPx);
  const u = 1 / s;

  const layout = useMemo(() => {
    const blockPx = (l: AtlasLabel) => blockPxC(l, colPx);
    let x = 0;
    return frames.map((f) => {
      const ox = x + (f.hasLeft ? colPx * u : 0);
      x = ox + f.fw + (f.hasRight ? colPx * u : 0) + gapPx * u;
      const placed: Placed[] = [];
      for (const side of ['left', 'right'] as const) {
        const group = f.labels
          .filter((l) => l.side === side)
          .map((l) => ({ key: `${f.view}-${l.label.anchor}`, label: l.label, ax: ox + l.nx * W - f.cx0, ay: l.ny * H, side }))
          .sort((a, b) => a.ay - b.ay);
        let prevBottom = -Infinity;
        const col = group.map((g) => {
          const hPx = blockPx(g.label);
          const topPx = Math.max(g.ay * s - FONT.name * 0.7, prevBottom + 8);
          prevBottom = topPx + hPx;
          return { ...g, topPx, hPx };
        });
        const overflow = col.length ? prevBottom - H * s : 0;
        if (overflow > 0) col.forEach((p) => (p.topPx -= overflow));
        placed.push(...col);
      }
      const pins = [...f.labels]
        .sort((a, b) => a.ny - b.ny || a.nx - b.nx)
        .map((l, i) => {
          const ax = ox + l.nx * W - f.cx0;
          const ay = l.ny * H;
          return { n: i + 1, key: `${f.view}-${l.label.anchor}`, label: l.label, ax, ay, px: ax, py: ay };
        });
      // Telefon: pinezki bliskich kotwic (np. podwzgórze i przysadka) nie mogą na siebie zachodzić. Odsuwamy późniejszą
      // pinezkę od wcześniejszych (kilka przebiegów); odsunięta dostaje cienką linię do swojej kotwicy.
      if (pinsMode) {
        const minD = 21 * u; // dwa promienie pinezki (9,5 px) + odstęp
        for (let pass = 0; pass < 6; pass++)
          for (let i = 1; i < pins.length; i++)
            for (let j = 0; j < i; j++) {
              const a = pins[j];
              const b = pins[i];
              let dx = b.px - a.px;
              let dy = b.py - a.py;
              let d = Math.hypot(dx, dy);
              if (d >= minD) continue;
              if (d < 1e-6) {
                dx = 1;
                dy = 0;
                d = 1;
              }
              b.px = a.px + (dx / d) * minD;
              b.py = a.py + (dy / d) * minD;
            }
      }
      return { ...f, ox, placed, pins };
    });
  }, [frames, colPx, u, s, W, H, state, extended]); // eslint-disable-line react-hooks/exhaustive-deps

  const last = layout[layout.length - 1];
  const totalW = last ? last.ox + last.fw + (last.hasRight ? colPx * u : 0) : W;
  const minTopPx = Math.min(0, ...layout.flatMap((f) => f.placed.map((p) => p.topPx)));
  const minTop = minTopPx * u; // jednostki renderu (ujemne = rysunek rośnie w górę, nic nie jest ucinane)
  const totalH = H + titlePx * u - minTop;
  const pxW = totalW * s;
  const pxH = totalH * s;

  const flowsByView = useMemo(() => {
    const out: Record<string, { key: string; kind: AtlasFlowKind; label?: string; pts: [number, number][] }[]> = {};
    for (const f of content.flows ?? []) {
      if (f.states && !f.states.includes(state)) continue;
      (out[f.view] ??= []).push({ key: `px-${f.view}-${f.labelPl ?? ''}-${f.points[0]}`, kind: f.kind, label: f.labelPl, pts: f.points });
    }
    for (const f of flows3d?.flows ?? []) {
      if (f.states && !f.states.includes(state)) continue;
      for (const view of views) {
        const cam = anchors.views[view]?.camera;
        if (!cam || (f.views && !f.views.includes(view))) continue;
        (out[view] ??= []).push({
          key: `3d-${view}-${f.id}`,
          kind: f.kind,
          label: f.labelPl,
          pts: f.points.map((p) => projectToPixels(p, cam, viewResolution(anchors, view))),
        });
      }
    }
    return out;
  }, [content.flows, flows3d, views, anchors, state]);

  const dash = 9 * u;
  const dashGap = 7 * u;
  const labelProps = (key: string) => ({
    onMouseEnter: () => setHover(key),
    onMouseLeave: () => setHover((h) => (h === key ? null : h)),
    onFocus: () => setFocus(key),
    onBlur: () => setFocus((f) => (f === key ? null : f)),
    onClick: () => setPinned((p) => (p === key ? null : key)),
    'aria-pressed': pinned === key,
  });
  const dimmed = (key: string) => active !== null && active !== key;

  const roleBlock = (l: AtlasLabel, align: 'left' | 'right') => {
    const rt = roleText(l);
    const primary = l.tier === undefined || l.tier === 'primary';
    return (
      <>
        <span className="block font-display font-bold text-slate-50" style={{ fontSize: FONT.name, lineHeight: 1.22 }}>
          {l.namePl}
        </span>
        {extended && l.nameLat && (
          <span className="block italic text-slate-400" style={{ fontSize: FONT.lat, lineHeight: 1.3 }}>
            {l.nameLat}
          </span>
        )}
        {rt ? (
          <span className="block" style={{ fontSize: FONT.role, lineHeight: 1.35, color: sprint && primary ? colorLight : '#cbd5e1', textAlign: align }}>
            {rt}
          </span>
        ) : null}
        {rt && roleEvidence(l) && roleEvidence(l) !== 'established_human' ? (
          <span className="block italic text-amber-200/90" style={{ fontSize: FONT.role, lineHeight: 1.3, textAlign: align }}>
            {EVIDENCE_PHRASE[roleEvidence(l)!]}
          </span>
        ) : null}
        {!rt && extended && (
          <span className="block italic text-slate-500" style={{ fontSize: FONT.role, lineHeight: 1.35 }}>
            {PENDING}
          </span>
        )}
      </>
    );
  };

  return (
    <div ref={wrapRef} className={`w-full ${onlyViews && !fitHeight ? '' : 'h-full min-h-0'} flex flex-col items-center justify-center`}>
      <figure className="relative m-0 shrink-0" style={{ width: pxW, height: pxH }} aria-label={`${content.titlePl}: ${sprint ? 'sprint' : 'spoczynek'}`}>
        <svg viewBox={`0 ${minTop} ${totalW} ${totalH}`} width={pxW} height={pxH} className="absolute left-0 top-0 select-none" aria-hidden="true">
          <defs>
            {layout.map((f) => (
              <clipPath id={`atlas-clip-${content.id}-${f.view}`} key={f.view}>
                <rect x={f.ox} y={0} width={f.fw} height={H} />
              </clipPath>
            ))}
            {(Object.keys(FLOW_COLOR) as AtlasFlowKind[]).map((k) => (
              <marker key={k} id={`atlas-arrow-${content.id}-${k}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={FLOW_COLOR[k]} />
              </marker>
            ))}
          </defs>
          {layout.map((f) => (
            <g key={f.view}>
              <g clipPath={`url(#atlas-clip-${content.id}-${f.view})`}>
                {(['rest', 'sprint'] as AtlasState[]).map((st) =>
                  f.v.images[st] && (st === state || f.v.images[state]) ? (
                    <image
                      key={st}
                      href={`${baseUrl}${f.v.images[st]}`}
                      x={f.ox - f.cx0}
                      y={0}
                      width={W}
                      height={H}
                      style={{ opacity: st === state || !f.v.images[state] ? 1 : 0, transition: reduced ? undefined : 'opacity 700ms ease' }}
                    />
                  ) : null
                )}
                {(flowsByView[f.view] ?? []).map((fl) => {
                  const pts = fl.pts.map(([px, py]) => `${f.ox - f.cx0 + px},${py}`).join(' ');
                  return (
                    <g key={fl.key}>
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
                        {!reduced && (
                          <animate attributeName="stroke-dashoffset" from="0" to={`${-(dash + dashGap)}`} dur={sprint ? '0.55s' : '1.6s'} repeatCount="indefinite" />
                        )}
                      </polyline>
                    </g>
                  );
                })}
              </g>
              {!pinsMode &&
                f.placed.map((p) => {
                  const primary = p.label.tier === undefined || p.label.tier === 'primary';
                  const edgeX = p.side === 'left' ? f.ox - 4 * u : f.ox + f.fw + 4 * u;
                  const ly = (p.topPx + FONT.name * 0.62) * u;
                  return (
                    <g key={p.key} style={{ opacity: dimmed(p.key) ? 0.25 : 1, transition: reduced ? undefined : 'opacity 200ms' }}>
                      <polyline
                        points={`${p.ax},${p.ay} ${edgeX},${ly} ${p.side === 'left' ? edgeX - 8 * u : edgeX + 8 * u},${ly}`}
                        fill="none"
                        stroke={primary ? colorLight : '#94a3b8'}
                        strokeWidth={(active === p.key ? 2 : 1.1) * u}
                        strokeOpacity={0.9}
                      />
                      {sprint && primary && !reduced && (
                        <circle className="atlas-pulse" cx={p.ax} cy={p.ay} r={4 * u} fill="none" stroke={colorLight} strokeWidth={1.2 * u} />
                      )}
                      <circle cx={p.ax} cy={p.ay} r={(active === p.key ? 5 : 3.6) * u} fill={primary ? color : '#94a3b8'} stroke="#f8fafc" strokeWidth={1.2 * u} />
                    </g>
                  );
                })}
              {pinsMode &&
                f.pins.map((p) => (
                  <g key={p.key} style={{ opacity: dimmed(p.key) ? 0.35 : 1 }}>
                    {(p.px !== p.ax || p.py !== p.ay) && (
                      <>
                        <line x1={p.ax} y1={p.ay} x2={p.px} y2={p.py} stroke="#f8fafc" strokeWidth={1.2 * u} />
                        <circle cx={p.ax} cy={p.ay} r={2.5 * u} fill="#f8fafc" />
                      </>
                    )}
                    {/* Telefon: pinezka mniejsza i półprzezroczysta, żeby nie zakrywała drobnych narządów (limfatyczny);
                        wybrana pinezka pełna i większa. Numer nadal 14 px. */}
                    <circle
                      cx={p.px}
                      cy={p.py}
                      r={(active === p.key ? 12 : 9.5) * u}
                      fill={color}
                      fillOpacity={active === p.key ? 1 : 0.78}
                      stroke="#f8fafc"
                      strokeWidth={(active === p.key ? 1.6 : 1.1) * u}
                    />
                    <text x={p.px} y={p.py + FONT.pin * 0.36 * u} textAnchor="middle" fill="#0b1020" style={{ font: `800 ${FONT.pin * u}px var(--font-display)` }}>
                      {p.n}
                    </text>
                  </g>
                ))}
            </g>
          ))}
        </svg>
        {layout.map((f) => (
          <figcaption
            key={`t-${f.view}`}
            className="absolute text-center font-display font-semibold uppercase text-slate-500"
            style={{
              left: f.ox * s - (f.hasLeft ? colPx : 0),
              width: captionW(f, s),
              top: (H - minTop) * s + 4,
              fontSize: FONT.title,
              lineHeight: 1.3,
              letterSpacing: '0.12em',
            }}
          >
            {content.viewTitlesPl[f.view as AtlasView] ?? f.view}
          </figcaption>
        ))}
        {!pinsMode &&
          layout.map((f) =>
            f.placed.map((p) => {
              const left = p.side === 'left' ? (f.ox - 4 * u) * s - colPx : (f.ox + f.fw + 4 * u) * s + 12;
              return (
                <button
                  key={p.key}
                  type="button"
                  {...labelProps(p.key)}
                  className="absolute rounded-md px-1 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 hover:bg-slate-800/40"
                  style={{
                    left,
                    top: p.topPx - minTopPx,
                    width: colPx - 12,
                    textAlign: p.side === 'left' ? 'right' : 'left',
                    opacity: dimmed(p.key) ? 0.3 : 1,
                    transition: reduced ? undefined : 'opacity 200ms',
                    background: pinned === p.key ? 'rgba(30,41,59,0.6)' : undefined,
                  }}
                >
                  {roleBlock(p.label, p.side === 'left' ? 'right' : 'left')}
                </button>
              );
            })
          )}
      </figure>
      {pinsMode && (
        <ol className="w-full mt-3 flex flex-col gap-1.5 list-none p-0" aria-label={`Podpisy: ${content.viewTitlesPl[views[0]] ?? ''}`}>
          {layout.flatMap((f) =>
            f.pins.map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  {...labelProps(p.key)}
                  className="w-full flex gap-3 items-start rounded-lg px-2 py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  style={{ background: active === p.key ? 'rgba(30,41,59,0.8)' : 'rgba(15,23,42,0.5)' }}
                >
                  <span
                    className="shrink-0 grid place-items-center rounded-full font-display font-extrabold text-[#0b1020]"
                    style={{ width: 26, height: 26, background: color, fontSize: FONT.pin }}
                    aria-hidden="true"
                  >
                    {p.n}
                  </span>
                  <span className="min-w-0">{roleBlock(p.label, 'left')}</span>
                </button>
              </li>
            ))
          )}
        </ol>
      )}
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
