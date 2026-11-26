import { Component, lazy, Suspense, useEffect, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { AtlasPlate, useFlows3d } from './AtlasPlate';
import { AtlasGlyph } from './glyphs';
import { EVIDENCE_PHRASE, PALETTE, flowStyle, isShown, paletteCssVars, shownSummary, systemOfPlate, type AtlasLevel } from './palette';
import { ATLAS_SYSTEMS } from './plates';
import { ATLAS_GLOSSARY } from './glossary';
import { viewResolution } from './projection';
import type { AtlasAnchorsFile, AtlasMetric, AtlasState, AtlasSystemId, AtlasView } from './types';
import { SCIENTIFIC_REFERENCES } from '../science/ScientificReferences';
import { EVIDENCE_LEVEL_META } from '../science/EducationalContent';

// ---------------------------------------------------------------- punkt montażu 3D (E3, kontrakt z wizualizatorem)
/** Kontrakt komponentu src/atlas3d/Atlas3DView (dostarcza wizualizator 3D; AtlasApp tylko go montuje). */
export interface Atlas3DViewProps {
  system: AtlasSystemId;
  state: AtlasState;
  level: AtlasLevel;
  onClose: () => void;
}
// Moduł może jeszcze nie istnieć: import.meta.glob zwraca wtedy pusty obiekt, a build przechodzi.
const view3dLoaders = import.meta.glob<{ default?: ComponentType<Atlas3DViewProps>; Atlas3DView?: ComponentType<Atlas3DViewProps> }>(
  '../atlas3d/Atlas3DView.{tsx,ts,jsx,js}',
);
const loadView3d = Object.values(view3dLoaders)[0];
const Atlas3DView = loadView3d
  ? lazy(() => loadView3d().then((m) => ({ default: (m.default ?? m.Atlas3DView) as ComponentType<Atlas3DViewProps> })))
  : null;

/** Błąd w widoku 3D nie może wywrócić planszy: pokazujemy komunikat i przycisk powrotu. */
class View3DBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Widok "Atlas układów" (adres: #atlas lub #atlas/<uklad>). Osobny tryb, niezależny od 12 aktów.
 * Zasady: docs/ATLAS_STYLE_BIBLE.md. Etap E0: kolory z palette.json, ikony układów, dwa poziomy złożoności,
 * na ekranie tylko fakty sprawdzone (`checked_agent`), poziom dowodów opisany słowami.
 */

const BASE = import.meta.env.BASE_URL;
const LEVEL_KEY = 'atlas.level';
const BASIC_MAX_METRICS = 4; // model §3.5: najwyżej 4 liczby w poziomie podstawowym

function systemFromHash(): AtlasSystemId {
  const id = window.location.hash.replace(/^#atlas\/?/, '') as AtlasSystemId;
  return ATLAS_SYSTEMS.some((s) => s.id === id && s.content) ? id : 'miesniowy';
}

function readLevel(): AtlasLevel {
  try {
    return window.localStorage.getItem(LEVEL_KEY) === 'extended' ? 'extended' : 'basic';
  } catch {
    return 'basic';
  }
}

function cite(id: string): string {
  const r = SCIENTIFIC_REFERENCES[id];
  if (!r) return id;
  const first = r.authors.split(',')[0];
  return `${first} ${r.year}`;
}

function fullCite(id: string): string {
  const r = SCIENTIFIC_REFERENCES[id];
  if (!r) return id;
  const ids = [r.pmid ? `PMID ${r.pmid}` : '', r.doi ? `DOI ${r.doi}` : ''].filter(Boolean).join(', ');
  return `${r.authors} (${r.year}). ${r.title}. ${r.journal}${ids ? `. ${ids}` : ''}`;
}

function MetricCard({ m, sprint, colorLight, extended }: { m: AtlasMetric; sprint: boolean; colorLight: string; extended: boolean }) {
  const ev = EVIDENCE_LEVEL_META[m.evidenceLevel];
  const restOk = isShown(m.restStatus ?? m.status);
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-sm text-slate-300">{m.labelPl}</p>
      <p className="font-mono-tech text-[15px] mt-1">
        {restOk ? (
          <span className={sprint ? 'text-slate-400' : 'text-white'}>{m.rest}</span>
        ) : (
          <span className="text-slate-400" title="Brak sprawdzonej wartości spoczynkowej">
            —<span className="sr-only">brak sprawdzonej wartości spoczynkowej</span>
          </span>
        )}
        <span className="text-slate-400"> → </span>
        <span style={{ color: sprint ? colorLight : '#94a3b8' }} className="font-semibold">
          {m.sprint}
        </span>
        {m.unit && <span className="text-slate-400 text-sm"> {m.unit}</span>}
      </p>
      {m.protocolMismatch && (
        <p className="text-sm text-amber-200/90 mt-1">
          W badaniu: {extended || !m.protocolMismatch.includes(';') ? m.protocolMismatch : `${m.protocolMismatch.split(';')[0]} (…)`}.
        </p>
      )}
      {m.seeAlsoPlate && (
        <p className="text-sm mt-1">
          <a href={`#atlas/${m.seeAlsoPlate}`} className="text-sky-300 underline underline-offset-2 hover:text-sky-200">
            Porównaj: {ATLAS_SYSTEMS.find((s) => s.id === m.seeAlsoPlate)?.content?.titlePl ?? m.seeAlsoPlate}
          </a>
        </p>
      )}
      {m.notePl && <p className="text-sm text-slate-400 mt-1.5 leading-snug">{m.notePl}</p>}
      <p className="text-sm text-slate-400 mt-1.5 flex items-start gap-1.5">
        <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: ev.badgeColor }} aria-hidden="true" />
        <span>
          <span className="text-slate-300">{EVIDENCE_PHRASE[m.evidenceLevel]}</span> · {m.referenceIds.map(cite).join('; ')}
        </span>
      </p>
      {extended && (
        <div className="mt-2 border-t border-slate-800 pt-2 text-sm text-slate-400 space-y-1">
          <p>Poziom dowodów: {ev.labelPl}.</p>
          {m.measuredAt && <p>Moment pomiaru: {m.measuredAt}.</p>}
          {m.quote && (
            <p>
              Cytat: <q className="italic text-slate-300">{m.quote}</q>
              {m.locator && <> ({m.locator})</>}
            </p>
          )}
          {m.conversionNote && <p>Przeliczenie: {m.conversionNote}</p>}
          <ul className="list-disc pl-4">
            {m.referenceIds.map((id) => (
              <li key={id}>{fullCite(id)}</li>
            ))}
          </ul>
          <p className="text-slate-400">Sprawdzone przez agenta AI z dosłownym cytatem (nie przez eksperta).</p>
        </div>
      )}
    </div>
  );
}

export function AtlasApp() {
  const [systemId, setSystemId] = useState<AtlasSystemId>(systemFromHash);
  const [state, setState] = useState<AtlasState>('sprint');
  const [level, setLevel] = useState<AtlasLevel>(readLevel);
  const [anchors, setAnchors] = useState<AtlasAnchorsFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  // Widok 3D: przycisk tylko gdy plansza ma public/atlas3d/<uklad>/manifest.json i urządzenie to desktop.
  const [has3d, setHas3d] = useState(false);
  const [show3d, setShow3d] = useState(false);
  const desktop = !narrow && window.matchMedia('(pointer: fine)').matches;
  // „Całe ciało / Zbliżenie” (łatka sesji mięśniowej): na szerokim ekranie jedna skala naraz, żeby nic nie było za małe.
  const [panel, setPanel] = useState(0);
  const system = ATLAS_SYSTEMS.find((s) => s.id === systemId)!;
  const extended = level === 'extended';

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(LEVEL_KEY, level);
    } catch {
      /* tryb prywatny: poziom działa do końca wizyty */
    }
  }, [level]);

  const content = system.content!;
  const flows3d = useFlows3d(`${BASE}atlas/${systemId}/flows3d.json`);
  // Panele planszy na szerokim ekranie: które widoki stoją obok siebie, a które dostają własną zakładkę.
  // Pomiar przy 1440×900 (obszar planszy 876×804 px): jeden widok 1150×1600 zajmuje 556×773 px, dwa takie widoki
  // obok siebie z kolumnami podpisów tylko ok. 150–210 px szerokości. Dlatego obok siebie stoją wyłącznie wąskie
  // widoki całego ciała (render pionowy ≥ 1,7:1, np. przód i tył: 292×526 px każdy); każdy inny widok
  // (zbliżenie, render 1150×1600, render poziomy) ma własną zakładkę i całą wysokość planszy.
  // Napis zakładki = tytuł widoku z planszy (`viewTitlesPl`), np. na hormonalnym „front” to tułów z głową.
  const viewTitle = (v: AtlasView) => content.viewTitlesPl[v] ?? (v === 'detail' ? 'Zbliżenie' : v);
  const viewsPresent = content.views.filter((v) => !anchors || anchors.views[v]);
  const bodyViews = viewsPresent.filter((v) => v !== 'detail');
  // Rozdzielczość na widok (anchors.json): obok siebie tylko widoki o tej samej rozdzielczości.
  const resKey = (v: AtlasView) => (anchors ? viewResolution(anchors, v).join('x') : '');
  const bodyRes = anchors && bodyViews.length ? viewResolution(anchors, bodyViews[0]) : null;
  const wholeBody = !!bodyRes && bodyRes[1] / bodyRes[0] >= 1.7 && bodyViews.every((v) => resKey(v) === resKey(bodyViews[0]));
  const panels: { views: AtlasView[]; label: string }[] = [];
  // Ile kolumn podpisów dałyby widoki obok siebie (strona jak w AtlasPlate: bliższa kotwicy). Przy > 2 kolumnach
  // obrazy byłyby za małe (powłokowy, poziom rozszerzony: 203×366 px przy 1440), więc każdy widok dostaje zakładkę.
  const labelCols = (v: AtlasView) => {
    const av = anchors?.views[v];
    if (!av) return 0;
    const b = av.bbox ?? [0, 0, 1, 1];
    const mid = (b[0] + b[2]) / 2;
    const sides = new Set(
      content.labels
        .filter((l) => l.view === v && av.anchors[l.anchor] && (extended || l.tier === undefined || l.tier === 'primary'))
        .map((l) => l.side ?? (av.anchors[l.anchor][0] < mid ? 'left' : 'right'))
    );
    return sides.size;
  };
  const groupBody = wholeBody && bodyViews.length > 1 && bodyViews.reduce((n, v) => n + labelCols(v), 0) <= 2;
  if (groupBody) panels.push({ views: bodyViews, label: bodyViews.map(viewTitle).join(' + ') });
  for (const v of viewsPresent) {
    if (groupBody && v !== 'detail') continue;
    panels.push({ views: [v], label: viewTitle(v) });
  }
  // Telefon: każdy widok osobno, ale widoki z tą samą kamerą (ta sama skala ortho, bez zbliżeń), np. przód i bok
  // szkieletu, dostają wspólną skalę obrazu. Widoki z inną kamerą (zbliżenie, wycinek jamy brzusznej) – własną.
  const orthoOf = (v: AtlasView) => anchors?.views[v]?.camera?.orthoScale;
  const sameScaleViews = (v: AtlasView): AtlasView[] | undefined => {
    const o = orthoOf(v);
    if (v === 'detail' || o === undefined) return undefined;
    const group = viewsPresent.filter((x) => x !== 'detail' && orthoOf(x) !== undefined && Math.abs(orthoOf(x)! - o) < 1e-4);
    return group.length > 1 ? group : undefined;
  };
  const splitScale = panels.length > 1;
  const panelIdx = Math.min(panel, Math.max(0, panels.length - 1));
  useEffect(() => setPanel(0), [systemId]);
  useEffect(() => {
    let alive = true;
    setShow3d(false);
    setHas3d(false);
    fetch(`${BASE}atlas3d/${systemId}/manifest.json`)
      .then((r) => (r.ok && (r.headers.get('content-type') ?? '').includes('json') ? r.json() : null))
      .then((m) => alive && setHas3d(!!m))
      .catch(() => alive && setHas3d(false));
    return () => {
      alive = false;
    };
  }, [systemId]);

  useEffect(() => {
    const onHash = () => setSystemId(systemFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    let alive = true;
    setAnchors(null);
    setError(null);
    fetch(`${BASE}atlas/${systemId}/anchors.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<AtlasAnchorsFile>;
      })
      .then((d) => alive && setAnchors(d))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [systemId]);

  // Skrót S przełącza stan tylko z fokusem na planszy (<main>); spacja nie przełącza stanu (przewija stronę, klika przycisk).
  const onPlateKey = (e: React.KeyboardEvent) => {
    if (e.key !== 's' && e.key !== 'S') return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    setState((s) => (s === 'rest' ? 'sprint' : 'rest'));
  };

  // Karta bez stanów (np. rozrodczy): przełącznik stanów ukryty, pokazujemy opis spoczynku.
  const isCard = !!content.card || !!anchors?.card;
  const shownState: AtlasState = isCard ? 'rest' : state;
  const sprint = shownState === 'sprint';
  const color = `var(${content.colorVar})`;
  const colorLight = `var(${content.colorVar}-light)`;
  const shownMetrics = content.metrics.filter((m) => isShown(m.status));
  // Poziom podstawowy: najpierw liczby 'primary' (brak tier = primary), potem 'secondary'; liczby 'student' tylko w rozszerzonym.
  const tierRank = (m: AtlasMetric) => (m.tier === 'secondary' ? 1 : m.tier === 'student' ? 2 : 0);
  const metrics = extended
    ? shownMetrics
    : shownMetrics
        .filter((m) => m.tier !== 'student')
        .sort((a, b) => tierRank(a) - tierRank(b))
        .slice(0, BASIC_MAX_METRICS);
  const hiddenMetrics = content.metrics.length - shownMetrics.length;
  const onColor = systemOfPlate(systemId)?.onColor ?? '#0b1020';
  const protocolNote = !content.protocolNotePl
    ? '„Sprint” to koniec 45 s pracy przy ok. 88% VO₂max (6 × 45 s pracy / 45 s przerwy). Liczby z innego protokołu mają dopisek „W badaniu: …”.'
    : isShown(content.protocolNoteStatus)
      ? content.protocolNotePl
      : '„Sprint” ma na tej planszy własne znaczenie; jego opis czeka na sprawdzenie.';
  const glossary = ATLAS_GLOSSARY.filter((g) => isShown(g.status));
  // Legenda strzałek (zgromadzenie, dostępność): podpis `labelPl` i wzór kreski rodzaju, dla widoków na ekranie.
  const shownViews: string[] = narrow || !splitScale ? viewsPresent : panels[panelIdx]?.views ?? viewsPresent;
  const legend: { kind: string; label: string }[] = [];
  const pushLegend = (kind: string, label?: string, views?: string[], states?: AtlasState[]) => {
    if (states && !states.includes(shownState)) return;
    if (views && !views.some((v) => shownViews.includes(v))) return;
    const l = label ?? flowStyle(kind).namePl;
    if (!legend.some((x) => x.kind === kind && x.label === l)) legend.push({ kind, label: l });
  };
  for (const f of content.flows ?? []) pushLegend(f.kind, f.labelPl, [f.view], f.states);
  for (const f of flows3d?.flows ?? []) pushLegend(f.kind, f.labelPl, f.views, f.states);
  // Reguła 1b: podsumowanie czekające na sprawdzenie nie jest pokazywane (tylko zdania już potwierdzone albo nic).
  const summaries = { rest: shownSummary(content, 'rest'), sprint: shownSummary(content, 'sprint') };
  const groups = PALETTE.groups
    .map((g) => ({ ...g, systems: ATLAS_SYSTEMS.filter((s) => systemOfPlate(s.id)?.group === g.key) }))
    .filter((g) => g.systems.length);

  return (
    <div
      className="w-screen h-screen overflow-auto lg:overflow-hidden bg-[var(--atlas-bg)] text-slate-100 flex flex-col lg:flex-row pb-20 lg:pb-0"
      style={paletteCssVars() as CSSProperties}
    >
      {/* Nawigacja układów: ikona + nazwa (kolor nie jest jedynym nośnikiem informacji) */}
      <nav
        aria-label="Układy"
        className="shrink-0 lg:w-[156px] border-b lg:border-b-0 lg:border-r border-slate-800 p-2 lg:p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto bio-scroll relative"
      >
        <div className="hidden lg:block mb-2 px-1">
          <p className="font-mono-tech text-[14px] tracking-[0.14em] text-slate-400 uppercase">Atlas</p>
          <p className="font-display text-sm font-bold leading-tight">układów</p>
        </div>
        {groups.map((g) => (
          <div key={g.key} className="contents lg:flex lg:flex-col lg:gap-0.5">
            <p className="hidden lg:block mt-2 px-1 font-mono-tech text-[14px] tracking-[0.06em] uppercase text-slate-400">{g.namePl}</p>
            {g.systems.map((s) => {
              const active = s.id === systemId;
              const ready = !!s.content;
              const pal = systemOfPlate(s.id);
              return (
                <button
                  key={s.id}
                  disabled={!ready}
                  onClick={() => (window.location.hash = `atlas/${s.id}`)}
                  aria-current={active ? 'page' : undefined}
                  title={ready ? s.namePl : `${s.namePl}: plansza w przygotowaniu`}
                  className={`shrink-0 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition text-left ${
                    active ? 'bg-slate-800 text-white' : ready ? 'text-slate-200 hover:bg-slate-800/50' : 'text-slate-400 cursor-not-allowed'
                  }`}
                  style={active ? { boxShadow: `inset 3px 0 0 var(${s.colorVar})` } : undefined}
                >
                  <span style={{ color: `var(${s.colorVar})`, opacity: ready ? 1 : 0.5 }}>
                    <AtlasGlyph glyph={pal?.glyph ?? 'heart'} size={18} />
                  </span>
                  <span className="font-display font-semibold leading-tight">
                    {s.namePl}
                    {!ready && <span className="block text-[14px] font-normal text-slate-400">wkrótce</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        <a href="#" className="shrink-0 self-center lg:self-auto lg:mt-auto px-2 lg:px-1 lg:pt-3 text-[14px] leading-tight text-slate-300 hover:text-white whitespace-nowrap">
          ← Podróż filmowa
        </a>
      </nav>

      {/* Plansza */}
      <main
        className="relative flex-1 min-w-0 lg:min-h-0 p-2 lg:p-6 flex flex-col items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        tabIndex={0}
        onKeyDown={onPlateKey}
        aria-label={`Plansza: ${content.titlePl}. Klawisz S przełącza spoczynek i sprint.`}
      >
        {has3d && desktop && !show3d && (
          <button
            type="button"
            onClick={() => setShow3d(true)}
            className="absolute top-3 right-3 z-10 rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-display font-semibold text-slate-100 hover:bg-slate-700"
          >
            Obróć w 3D
          </button>
        )}
        {show3d && (
          <div className="absolute inset-0 z-30 bg-[var(--atlas-bg)]" role="dialog" aria-label={`Widok 3D: ${content.titlePl}`}>
            {(() => {
              const unavailable = (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                  <p>Widok 3D nie jest jeszcze dostępny w tej wersji.</p>
                  <button type="button" onClick={() => setShow3d(false)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">
                    Wróć do planszy
                  </button>
                </div>
              );
              return Atlas3DView ? (
                <View3DBoundary fallback={unavailable}>
                  <Suspense fallback={<p className="h-full flex items-center justify-center text-slate-400">Wczytywanie widoku 3D…</p>}>
                    <Atlas3DView system={systemId} state={shownState} level={level} onClose={() => setShow3d(false)} />
                  </Suspense>
                </View3DBoundary>
              ) : (
                unavailable
              );
            })()}
          </div>
        )}
        {anchors ? (
          narrow ? (
            content.views.map((v) => (
              <AtlasPlate
                key={v}
                content={content}
                anchors={anchors}
                state={shownState}
                baseUrl={`${BASE}atlas/${systemId}/`}
                onlyViews={[v]}
                flows3d={flows3d}
                level={level}
                scaleWithViews={sameScaleViews(v)}
              />
            ))
          ) : (
            <>
              {splitScale && (
                <div
                  className="shrink-0 grid rounded-xl bg-slate-900 p-1 text-sm"
                  style={{ gridTemplateColumns: `repeat(${panels.length}, minmax(0, auto))` }}
                  role="tablist"
                  aria-label="Widok planszy"
                >
                  {panels.map((p, i) => (
                    <button
                      key={p.label}
                      role="tab"
                      aria-selected={panelIdx === i}
                      onClick={() => setPanel(i)}
                      className={`rounded-lg px-4 py-1.5 font-display font-semibold transition ${
                        panelIdx === i ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                <AtlasPlate
                  key={`${systemId}-${splitScale ? panelIdx : 'all'}`}
                  content={content}
                  anchors={anchors}
                  state={shownState}
                  baseUrl={`${BASE}atlas/${systemId}/`}
                  onlyViews={splitScale ? panels[panelIdx].views : undefined}
                  fitHeight
                  flows3d={flows3d}
                  level={level}
                />
              </div>
            </>
          )
        ) : (
          <p className="text-slate-400 text-sm">{error ? `Nie udało się wczytać planszy (${error}).` : 'Wczytywanie planszy…'}</p>
        )}
      </main>

      {/* Panel informacji */}
      <aside className="shrink-0 lg:w-[360px] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col gap-4 lg:overflow-y-auto bio-scroll">
        <header>
          <p className="font-mono-tech text-[14px] tracking-[0.14em] uppercase flex items-center gap-2" style={{ color: colorLight }}>
            <AtlasGlyph glyph={systemOfPlate(systemId)?.glyph ?? 'heart'} size={16} />
            Plansza
          </p>
          <h2 className="font-display text-2xl font-bold">{content.titlePl}</h2>
          <p className="text-sm text-slate-300">{content.subtitlePl}</p>
        </header>

        {!isCard && (
        <div
          className="grid grid-cols-2 rounded-xl bg-slate-900 p-1 max-lg:fixed max-lg:bottom-3 max-lg:left-3 max-lg:right-3 max-lg:z-30 max-lg:shadow-lg max-lg:shadow-black/60 max-lg:border max-lg:border-slate-700"
          role="tablist"
          aria-label="Stan organizmu"
        >
          {(['rest', 'sprint'] as AtlasState[]).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={state === s}
              onClick={() => setState(s)}
              className={`rounded-lg py-2 text-sm font-display font-semibold transition ${
                state === s ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
              style={state === s ? { background: s === 'sprint' ? color : '#334155', color: s === 'sprint' ? onColor : undefined } : undefined}
            >
              {s === 'rest' ? 'Spoczynek' : 'Sprint HIIT'}
            </button>
          ))}
        </div>
        )}

        <div className="grid grid-cols-2 rounded-xl bg-slate-900 p-1" role="radiogroup" aria-label="Poziom szczegółów">
          {(['basic', 'extended'] as AtlasLevel[]).map((l) => (
            <button
              key={l}
              role="radio"
              aria-checked={level === l}
              onClick={() => setLevel(l)}
              className={`rounded-lg py-1.5 text-sm font-display font-semibold transition ${
                level === l ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {l === 'basic' ? 'Podstawowy' : 'Rozszerzony'}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-400 leading-snug">{protocolNote}</p>
        {glossary.map((g) => (
          <p key={g.id} className="text-sm text-slate-400 leading-snug -mt-2">
            {g.textPl}
          </p>
        ))}

        {/* Oba opisy w jednej komórce siatki: wysokość = dłuższy, więc przełączenie stanu nie przesuwa panelu.
            Gdy bieżący stan nie ma sprawdzonego opisu, nie rezerwujemy miejsca (bez pustej przerwy). */}
        {summaries[shownState] && (
          <div className="grid">
            {(['rest', 'sprint'] as AtlasState[]).filter((s) => summaries[s]).map((s) => (
              <p
                key={s}
                aria-hidden={s !== shownState}
                className={`[grid-area:1/1] text-[15px] leading-relaxed text-slate-200 transition-opacity duration-500 motion-reduce:transition-none ${
                  s === shownState ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {summaries[s]}
              </p>
            ))}
          </div>
        )}

        {legend.length > 0 && (
          <section className="flex flex-col gap-1.5" aria-label="Legenda strzałek">
            <h3 className="font-mono-tech text-[14px] tracking-[0.14em] uppercase text-slate-400">Strzałki</h3>
            <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
              {legend.map((it) => {
                const fs = flowStyle(it.kind);
                return (
                  <li key={`${it.kind}-${it.label}`} className="flex items-start gap-2 text-sm text-slate-300 leading-snug">
                    <svg width="34" height="12" viewBox="0 0 34 12" className="mt-1 shrink-0" aria-hidden="true">
                      <line x1="1" y1="6" x2="27" y2="6" stroke={fs.color} strokeWidth="2.6" strokeDasharray={fs.dash.map((d) => d * 0.6).join(' ')} />
                      <path d="M26,1 L33,6 L26,11 z" fill={fs.color} />
                    </svg>
                    <span>
                      {it.label}
                      <span className="text-slate-400"> ({fs.namePl})</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-3" aria-label="Liczby: spoczynek i sprint">
          <h3 className="font-mono-tech text-[14px] tracking-[0.14em] uppercase text-slate-400">Spoczynek → sprint</h3>
          {metrics.map((m) => (
            <MetricCard key={m.labelPl} m={m} sprint={sprint} colorLight={colorLight} extended={extended} />
          ))}
          {!extended && shownMetrics.length > metrics.length && (
            <p className="text-sm text-slate-400">Więcej liczb w poziomie „Rozszerzony”.</p>
          )}
          {hiddenMetrics > 0 && (
            <p className="text-sm text-slate-400">
              {hiddenMetrics === 1
                ? '1 liczba czeka na sprawdzenie źródła i nie jest pokazywana.'
                : hiddenMetrics % 10 >= 2 && hiddenMetrics % 10 <= 4 && (hiddenMetrics % 100 < 12 || hiddenMetrics % 100 > 14)
                  ? `${hiddenMetrics} liczby czekają na sprawdzenie źródła i nie są pokazywane.`
                  : `${hiddenMetrics} liczb czeka na sprawdzenie źródła i nie jest pokazywanych.`}
            </p>
          )}
        </section>

        <p className="text-[14px] text-slate-400 leading-snug mt-auto">
          {content.creditsPl}
          <br />
          Licencje:{' '}
          <a className="underline underline-offset-2 hover:text-slate-200" href="https://creativecommons.org/licenses/by-sa/4.0/deed.pl" target="_blank" rel="noreferrer">
            Z-Anatomy – CC BY-SA 4.0
          </a>{' '}
          (na bazie BodyParts3D © DBCLS,{' '}
          <a className="underline underline-offset-2 hover:text-slate-200" href="https://creativecommons.org/licenses/by-sa/2.1/jp/" target="_blank" rel="noreferrer">
            CC BY-SA 2.1 JP
          </a>
          );{' '}
          <a className="underline underline-offset-2 hover:text-slate-200" href="https://creativecommons.org/licenses/by/4.0/deed.pl" target="_blank" rel="noreferrer">
            HuBMAP Human Reference Atlas – CC BY 4.0
          </a>{' '}
          (NIH Visible Human / Indiana University). Zmiany w modelach: dopasowanie, wybór i uproszczenie struktur, kolory,
          render. Modele z licencją niekomercyjną (NC) są zablokowane. Plansze atlasu: CC BY-SA 4.0.
          <br />
          Klawisz S (gdy plansza ma fokus) przełącza stan. Podpis wyróżnia najechanie, klawisz Tab albo dotknięcie.
        </p>
      </aside>
    </div>
  );
}

export default AtlasApp;
