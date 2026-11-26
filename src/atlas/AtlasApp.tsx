import { useEffect, useState, type CSSProperties } from 'react';
import { AtlasPlate, useFlows3d } from './AtlasPlate';
import { AtlasGlyph } from './glyphs';
import { EVIDENCE_PHRASE, PALETTE, isShown, paletteCssVars, systemOfPlate, type AtlasLevel } from './palette';
import { ATLAS_SYSTEMS } from './plates';
import type { AtlasAnchorsFile, AtlasMetric, AtlasState, AtlasSystemId } from './types';
import { SCIENTIFIC_REFERENCES } from '../science/ScientificReferences';
import { EVIDENCE_LEVEL_META } from '../science/EducationalContent';

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
          <span className="text-slate-500" title="Brak sprawdzonej wartości spoczynkowej">
            —<span className="sr-only">brak sprawdzonej wartości spoczynkowej</span>
          </span>
        )}
        <span className="text-slate-500"> → </span>
        <span style={{ color: sprint ? colorLight : '#94a3b8' }} className="font-semibold">
          {m.sprint}
        </span>
        {m.unit && <span className="text-slate-400 text-sm"> {m.unit}</span>}
      </p>
      {m.protocolMismatch && (
        <p className="text-sm text-amber-200/90 mt-1">W badaniu: {m.protocolMismatch}.</p>
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
          <p className="text-slate-500">Sprawdzone przez agenta AI z dosłownym cytatem (nie przez eksperta).</p>
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
  // „Całe ciało / Zbliżenie” (łatka sesji mięśniowej): na szerokim ekranie jedna skala naraz, żeby nic nie było za małe.
  const [panel, setPanel] = useState<'body' | 'detail'>('body');
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
  const detailViews = content.views.filter((v) => v === 'detail');
  const bodyViews = content.views.filter((v) => v !== 'detail');
  // Całe ciało (render pionowy ≥ 1,7:1) obok zbliżenia byłoby za małe: wtedy jedna skala naraz.
  const wholeBody = !!anchors && anchors.resolution[1] / anchors.resolution[0] >= 1.7;
  // Render poziomy (np. mózg) z dwoma widokami i 4 kolumnami podpisów też byłby za mały: jeden widok naraz.
  const landscape = !!anchors && anchors.resolution[0] >= anchors.resolution[1];
  // Każda plansza ze zbliżeniem pokazuje jedną skalę naraz (integracja 1b: oddechowy przy 1440 był za mały obok zbliżenia).
  const splitScale = detailViews.length > 0 && bodyViews.length >= 1;
  void landscape;
  const panelLabel = (p: 'body' | 'detail') =>
    wholeBody ? (p === 'body' ? 'Całe ciało' : 'Zbliżenie') : (content.viewTitlesPl[p === 'body' ? bodyViews[0] : 'detail'] ?? p);
  useEffect(() => setPanel('body'), [systemId]);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'BUTTON' || t.tagName === 'INPUT' || t.tagName === 'A')) return; // spacja na przycisku = klik
      if (e.key === 's' || e.key === 'S' || e.key === ' ') {
        e.preventDefault();
        setState((s) => (s === 'rest' ? 'sprint' : 'rest'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Karta bez stanów (np. rozrodczy): przełącznik stanów ukryty, pokazujemy opis spoczynku.
  const isCard = !!content.card || !!anchors?.card;
  const shownState: AtlasState = isCard ? 'rest' : state;
  const sprint = shownState === 'sprint';
  const color = `var(${content.colorVar})`;
  const colorLight = `var(${content.colorVar}-light)`;
  const shownMetrics = content.metrics.filter((m) => isShown(m.status));
  const metrics = extended ? shownMetrics : shownMetrics.slice(0, BASIC_MAX_METRICS);
  const hiddenMetrics = content.metrics.length - shownMetrics.length;
  const summaryChecked = isShown(content.summaryStatus?.[shownState]);
  const groups = PALETTE.groups
    .map((g) => ({ ...g, systems: ATLAS_SYSTEMS.filter((s) => systemOfPlate(s.id)?.group === g.key) }))
    .filter((g) => g.systems.length);

  return (
    <div
      className="w-screen h-screen overflow-auto lg:overflow-hidden bg-[var(--atlas-bg)] text-slate-100 flex flex-col lg:flex-row"
      style={paletteCssVars() as CSSProperties}
    >
      {/* Nawigacja układów: ikona + nazwa (kolor nie jest jedynym nośnikiem informacji) */}
      <nav
        aria-label="Układy"
        className="shrink-0 lg:w-[156px] border-b lg:border-b-0 lg:border-r border-slate-800 p-2 lg:p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto bio-scroll relative"
      >
        <div className="hidden lg:block mb-2 px-1">
          <p className="font-mono-tech text-[11px] tracking-[0.18em] text-slate-400 uppercase">Atlas</p>
          <p className="font-display text-sm font-bold leading-tight">układów</p>
        </div>
        {groups.map((g) => (
          <div key={g.key} className="contents lg:flex lg:flex-col lg:gap-0.5">
            <p className="hidden lg:block mt-2 px-1 font-mono-tech text-[10px] tracking-[0.14em] uppercase text-slate-500">{g.namePl}</p>
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
                    active ? 'bg-slate-800 text-white' : ready ? 'text-slate-200 hover:bg-slate-800/50' : 'text-slate-500 cursor-not-allowed'
                  }`}
                  style={active ? { boxShadow: `inset 3px 0 0 var(${s.colorVar})` } : undefined}
                >
                  <span style={{ color: `var(${s.colorVar})`, opacity: ready ? 1 : 0.5 }}>
                    <AtlasGlyph glyph={pal?.glyph ?? 'heart'} size={18} />
                  </span>
                  <span className="font-display font-semibold leading-tight">
                    {s.namePl}
                    {!ready && <span className="block text-[11px] font-normal text-slate-500">wkrótce</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        <a href="#" className="hidden lg:block mt-auto px-1 pt-3 text-[12px] leading-tight text-slate-400 hover:text-slate-200">
          ← Podróż filmowa
        </a>
      </nav>

      {/* Plansza */}
      <main className="flex-1 min-w-0 lg:min-h-0 p-2 lg:p-6 flex flex-col items-center justify-center gap-2">
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
              />
            ))
          ) : (
            <>
              {splitScale && (
                <div className="shrink-0 grid grid-cols-2 rounded-xl bg-slate-900 p-1 text-sm" role="tablist" aria-label="Skala planszy">
                  {(['body', 'detail'] as const).map((p) => (
                    <button
                      key={p}
                      role="tab"
                      aria-selected={panel === p}
                      onClick={() => setPanel(p)}
                      className={`rounded-lg px-4 py-1.5 font-display font-semibold transition ${
                        panel === p ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {panelLabel(p)}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                <AtlasPlate
                  key={`${systemId}-${splitScale ? panel : 'all'}`}
                  content={content}
                  anchors={anchors}
                  state={shownState}
                  baseUrl={`${BASE}atlas/${systemId}/`}
                  onlyViews={splitScale ? (panel === 'detail' ? detailViews : bodyViews) : undefined}
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
          <p className="font-mono-tech text-[12px] tracking-[0.2em] uppercase flex items-center gap-2" style={{ color: colorLight }}>
            <AtlasGlyph glyph={systemOfPlate(systemId)?.glyph ?? 'heart'} size={16} />
            Plansza
          </p>
          <h2 className="font-display text-2xl font-bold">{content.titlePl}</h2>
          <p className="text-sm text-slate-300">{content.subtitlePl}</p>
        </header>

        {!isCard && (
        <div className="grid grid-cols-2 rounded-xl bg-slate-900 p-1" role="tablist" aria-label="Stan organizmu">
          {(['rest', 'sprint'] as AtlasState[]).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={state === s}
              onClick={() => setState(s)}
              className={`rounded-lg py-2 text-sm font-display font-semibold transition ${
                state === s ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
              style={state === s ? { background: s === 'sprint' ? color : '#334155', color: s === 'sprint' ? '#0b1020' : undefined } : undefined}
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

        <p className="text-sm text-slate-400 leading-snug">
          „Sprint” to koniec 45 s pracy przy ok. 88% VO₂max (6 × 45 s pracy / 45 s przerwy). Liczby z innego protokołu mają
          dopisek „W badaniu: …”.
        </p>

        {/* Oba opisy w jednej komórce siatki: wysokość = dłuższy, więc przełączenie stanu nie przesuwa panelu. */}
        <div className="grid">
          {(['rest', 'sprint'] as AtlasState[]).map((s) => (
            <p
              key={s}
              aria-hidden={s !== shownState}
              className={`[grid-area:1/1] text-[15px] leading-relaxed text-slate-200 transition-opacity duration-500 motion-reduce:transition-none ${
                s === shownState ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {content.summary[s]}
            </p>
          ))}
        </div>
        {!summaryChecked && (
          <p className="text-sm text-slate-500 -mt-2">Opis roboczy: część zdań czeka jeszcze na sprawdzenie źródła.</p>
        )}

        <section className="flex flex-col gap-3" aria-label="Liczby: spoczynek i sprint">
          <h3 className="font-mono-tech text-[12px] tracking-[0.2em] uppercase text-slate-400">Spoczynek → sprint</h3>
          {metrics.map((m) => (
            <MetricCard key={m.labelPl} m={m} sprint={sprint} colorLight={colorLight} extended={extended} />
          ))}
          {!extended && shownMetrics.length > metrics.length && (
            <p className="text-sm text-slate-400">Więcej liczb w poziomie „Rozszerzony”.</p>
          )}
          {hiddenMetrics > 0 && (
            <p className="text-sm text-slate-500">
              {hiddenMetrics === 1 ? '1 liczba czeka' : `${hiddenMetrics} liczby czekają`} na sprawdzenie źródła i nie są pokazywane.
            </p>
          )}
        </section>

        <p className="text-[12px] text-slate-400 leading-snug mt-auto">
          {content.creditsPl}
          <br />
          Klawisz S przełącza stan. Podpis wyróżnia najechanie, klawisz Tab albo dotknięcie.
        </p>
      </aside>
    </div>
  );
}

export default AtlasApp;
