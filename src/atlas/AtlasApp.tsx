import { useEffect, useState } from 'react';
import { AtlasPlate } from './AtlasPlate';
import { ATLAS_SYSTEMS } from './plates';
import type { AtlasAnchorsFile, AtlasState, AtlasSystemId } from './types';
import { SCIENTIFIC_REFERENCES } from '../science/ScientificReferences';
import { EVIDENCE_LEVEL_META } from '../science/EducationalContent';

/**
 * Widok "Atlas układów" (adres: #atlas lub #atlas/<uklad>). Osobny tryb, niezależny od 12 aktów.
 * Zasady: docs/ATLAS_STYLE_BIBLE.md
 */

const BASE = import.meta.env.BASE_URL;

function systemFromHash(): AtlasSystemId {
  const id = window.location.hash.replace(/^#atlas\/?/, '') as AtlasSystemId;
  return ATLAS_SYSTEMS.some((s) => s.id === id && s.content) ? id : 'miesniowy';
}

function cite(id: string): string {
  const r = SCIENTIFIC_REFERENCES[id];
  if (!r) return id;
  const first = r.authors.split(',')[0];
  return `${first} ${r.year}`;
}

export function AtlasApp() {
  const [systemId, setSystemId] = useState<AtlasSystemId>(systemFromHash);
  const [state, setState] = useState<AtlasState>('sprint');
  const [anchors, setAnchors] = useState<AtlasAnchorsFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const system = ATLAS_SYSTEMS.find((s) => s.id === systemId)!;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const onChange = () => setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const content = system.content!;

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
      if (e.key === 's' || e.key === 'S' || e.key === ' ') {
        e.preventDefault();
        setState((s) => (s === 'rest' ? 'sprint' : 'rest'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sprint = state === 'sprint';
  const color = `var(${content.colorVar})`;
  const colorLight = `var(${content.colorVar}-light)`;

  return (
    <div className="w-screen h-screen overflow-auto lg:overflow-hidden bg-[var(--atlas-bg)] text-slate-100 flex flex-col lg:flex-row">
      {/* Nawigacja układów */}
      <nav
        aria-label="Układy"
        className="shrink-0 lg:w-[104px] border-b lg:border-b-0 lg:border-r border-slate-800 p-3 flex lg:flex-col gap-1.5 overflow-x-auto"
      >
        <div className="hidden lg:block mb-3 px-1">
          <p className="font-mono-tech text-[10px] tracking-[0.18em] text-slate-500 uppercase">Atlas</p>
          <p className="font-display text-sm font-bold leading-tight">układów</p>
        </div>
        {ATLAS_SYSTEMS.map((s) => {
          const active = s.id === systemId;
          const ready = !!s.content;
          return (
            <button
              key={s.id}
              disabled={!ready}
              onClick={() => (window.location.hash = `atlas/${s.id}`)}
              title={ready ? s.namePl : `${s.namePl}: plansza w przygotowaniu`}
              className={`shrink-0 flex lg:flex-col items-center gap-2 lg:gap-1 rounded-lg px-3 lg:px-1 py-2 text-sm lg:text-[11px] transition ${
                active ? 'bg-slate-800/80 text-white' : ready ? 'text-slate-300 hover:bg-slate-800/50' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  background: `var(${s.colorVar})`,
                  opacity: ready ? 1 : 0.35,
                  boxShadow: active ? `0 0 0 3px #0f172a, 0 0 0 5px var(${s.colorVar})` : undefined,
                }}
              />
              <span className="font-display font-semibold">{s.namePl}</span>
              {!ready && <span className="hidden lg:inline text-[9px] text-slate-600 -mt-0.5">wkrótce</span>}
            </button>
          );
        })}
        <a href="#" className="hidden lg:block mt-auto px-1 text-[11px] leading-tight text-slate-500 hover:text-slate-300">
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
                state={state}
                baseUrl={`${BASE}atlas/${systemId}/`}
                onlyViews={[v]}
              />
            ))
          ) : (
            <AtlasPlate content={content} anchors={anchors} state={state} baseUrl={`${BASE}atlas/${systemId}/`} />
          )
        ) : (
          <p className="text-slate-500 text-sm">{error ? `Nie udało się wczytać planszy (${error}).` : 'Wczytywanie planszy…'}</p>
        )}
      </main>

      {/* Panel informacji */}
      <aside className="shrink-0 lg:w-[340px] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col gap-5 lg:overflow-y-auto bio-scroll">
        <header>
          <p className="font-mono-tech text-[11px] tracking-[0.2em] uppercase" style={{ color: colorLight }}>
            Plansza
          </p>
          <h2 className="font-display text-2xl font-bold">{content.titlePl}</h2>
          <p className="text-sm text-slate-400">{content.subtitlePl}</p>
        </header>

        <div className="grid grid-cols-2 rounded-xl bg-slate-900 p-1" role="tablist" aria-label="Stan organizmu">
          {(['rest', 'sprint'] as AtlasState[]).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={state === s}
              onClick={() => setState(s)}
              className={`rounded-lg py-2 text-sm font-display font-semibold transition ${
                state === s ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={state === s ? { background: s === 'sprint' ? color : '#334155' } : undefined}
            >
              {s === 'rest' ? 'Spoczynek' : 'Sprint HIIT'}
            </button>
          ))}
        </div>
        {/* Oba opisy w jednej komórce siatki: wysokość = dłuższy, więc przełączenie stanu nie przesuwa panelu. */}
        <div className="grid">
          {(['rest', 'sprint'] as AtlasState[]).map((s) => (
            <p
              key={s}
              aria-hidden={s !== state}
              className={`[grid-area:1/1] text-sm leading-relaxed text-slate-300 transition-opacity duration-500 ${
                s === state ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {content.summary[s]}
            </p>
          ))}
        </div>

        <section className="flex flex-col gap-3">
          <h3 className="font-mono-tech text-[11px] tracking-[0.2em] uppercase text-slate-500">Spoczynek → sprint</h3>
          {content.metrics.map((m) => {
            const ev = EVIDENCE_LEVEL_META[m.evidenceLevel];
            return (
              <div key={m.labelPl} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-xs text-slate-400">{m.labelPl}</p>
                <p className="font-mono-tech text-sm mt-1">
                  <span className={sprint ? 'text-slate-500' : 'text-white'}>{m.rest}</span>
                  <span className="text-slate-600"> → </span>
                  <span style={{ color: sprint ? colorLight : '#94a3b8' }} className="font-semibold">
                    {m.sprint}
                  </span>
                  {m.unit && <span className="text-slate-500 text-xs"> {m.unit}</span>}
                </p>
                {m.notePl && <p className="text-xs text-slate-400 mt-1.5 leading-snug">{m.notePl}</p>}
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: ev.badgeColor }} title={ev.labelPl} />
                  {m.referenceIds.map(cite).join('; ')}
                </p>
              </div>
            );
          })}
        </section>

        <p className="text-[11px] text-slate-500 leading-snug mt-auto">
          {content.creditsPl}
          <br />
          Klawisz S lub spacja przełącza stan. Najedź na podpis, aby go wyróżnić.
        </p>
      </aside>
    </div>
  );
}

export default AtlasApp;
