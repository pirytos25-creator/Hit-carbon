/**
 * Gablota narządu (M5): serce. Montaż w AtlasApp (integrator): OrganViewProps {organ, system, state, level, onClose}.
 * Rama wg karty Reżysera i decyzji Dyrygenta: pasek „Atlas › układ › narząd” + cel lekcji, przełącznik momentu pod sceną,
 * „Jak czytać” w lewym dolnym rogu, zakładki panelu Zwiedzaj · Jak to działa · Sprawdź się.
 * Treść WYŁĄCZNIE z danych: organPanel('serce', level) (fakty sprawdzone, „Wiedza podręcznikowa”) i metryki planszy
 * krwionośnej z bramką isShown. Brak faktu = puste pole, nie tekst w kodzie.
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { OrganViewProps } from '../atlas/AtlasApp';
import { organPanel, type OrganPanelItem } from '../atlas/organs';
import { ATLAS_SYSTEMS } from '../atlas/plates';
import { isShown } from '../atlas/palette';
import type { AtlasMetric, AtlasState } from '../atlas/types';
import { usePrefersReducedMotion } from '../atlas/AtlasPlate';
import { stepDurationSec } from '../biomotion';
import { OrganScene } from './OrganScene';
import { HEART_PARTS, PART_NAME_PL, SCHEMATIC_PARTS, sceneKeyOfPanelPart, type HeartPart } from './heartParts';
import './organs.css';

const BASE = `${import.meta.env.BASE_URL}atlas3d/_organs/serce/`;

/** Metryka planszy krwionośnej, tylko gdy sprawdzona (bramka jak na planszy). */
function metric(id: string): AtlasMetric | null {
  const m = ATLAS_SYSTEMS.find((s) => s.id === 'krwionosny')?.content?.metrics.find((x) => x.id === id);
  return m && isShown(m.status) ? m : null;
}
const firstNumber = (s: string | undefined) => { const m = s?.replace(',', '.').match(/(\d+(\.\d+)?)/); return m ? parseFloat(m[1]) : null; };

interface Step {
  title: string;
  /** ID faktów (organ_function) z danych; podpis = ich tekst */
  facts: string[];
  /** metryki planszy krwionośnej (liczba-bohater) */
  metrics?: string[];
  shot: string;
  flags: { flow: boolean; flowFrozen: boolean; valves: boolean; contraction: boolean; impulse: boolean };
  sprint?: boolean;
  exit?: boolean;
}

/** Scenariusz Reżysera (M5_SCENARIUSZ_SERCA.md): 1 nowy ruch na krok, najwyżej 3 naraz, kamera tylko między krokami. */
const STEPS: Step[] = [
  { title: 'Dwie połowy, dwie drogi', facts: ['serce.funkcja.prawa_pluca_lewa_cialo'], shot: 'przekroj',
    flags: { flow: true, flowFrozen: false, valves: false, contraction: false, impulse: false } },
  { title: 'Zastawki: tylko w jedną stronę', facts: ['serce.funkcja.zastawki_kierunek'], shot: 'przekroj',
    flags: { flow: true, flowFrozen: false, valves: true, contraction: false, impulse: false } },
  { title: 'Skurcz: przedsionki, potem komory', facts: ['serce.funkcja.kolejnosc_cyklu'], shot: 'przekroj',
    flags: { flow: true, flowFrozen: false, valves: true, contraction: true, impulse: false } },
  { title: 'Automatyzm serca', facts: ['serce.funkcja.automatyzm', 'serce.funkcja.wezel_sa_rozrusznik'], shot: 'przedsionek',
    flags: { flow: true, flowFrozen: true, valves: true, contraction: true, impulse: true } },
  { title: 'Sprint: szybciej i mocniej', facts: ['serce.funkcja.automatyzm_regulacja'], metrics: ['krwionosny.metric.tetno_hr', 'krwionosny.metric.objetosc_wyrzutowa', 'krwionosny.metric.rzut_serca'],
    shot: 'przekroj', sprint: true, flags: { flow: true, flowFrozen: false, valves: true, contraction: true, impulse: false } },
  { title: 'Dokąd płynie ta krew', facts: [], metrics: ['krwionosny.metric.udzial_miesni_w_przeplywie_krwi'], shot: 'przekroj', sprint: true, exit: true,
    flags: { flow: true, flowFrozen: false, valves: true, contraction: true, impulse: false } },
];

const QUIZ = [
  { q: 'Wskaż komorę, która pompuje krew do całego ciała.', answer: 'left_ventricle' as HeartPart, fact: 'serce.role.left_ventricle' },
  { q: 'Wskaż zastawkę, przez którą krew wypływa do aorty.', answer: 'aortic_valve' as HeartPart, fact: 'serce.role.aortic_valve' },
];

type Tab = 'zwiedzaj' | 'film' | 'quiz';

export default function OrganView({ organ, state, level, onClose }: OrganViewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<OrganScene | null>(null);
  const reduced = usePrefersReducedMotion();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('zwiedzaj');
  const [selected, setSelected] = useState<HeartPart | null>(null);
  const [hover, setHover] = useState<{ part: HeartPart; x: number; y: number } | null>(null);
  const [cut, setCut] = useState(true);
  const [wallsTissue, setWallsTissue] = useState(true);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const [stepPlaying, setStepPlaying] = useState(!reduced);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizResult, setQuizResult] = useState<{ ok: boolean; picked: HeartPart | 'up' | 'down' } | null>(null);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const panel = useMemo(() => organPanel(organ, level), [organ, level]);
  const factById = useMemo(() => new Map<string, OrganPanelItem>([...panel.parts, ...panel.functions].map((f) => [f.id, f])), [panel]);
  const partsByKey = useMemo(() => {
    const m = new Map<HeartPart, OrganPanelItem[]>();
    for (const f of panel.parts) { const k = f.part ? sceneKeyOfPanelPart(f.part) : null; if (k) m.set(k, [...(m.get(k) ?? []), f]); }
    return m;
  }, [panel]);
  const hr = useMemo(() => {
    const m = metric('krwionosny.metric.tetno_hr');
    return { rest: firstNumber(m?.rest) ?? null, sprint: firstNumber(m?.sprint) ?? null };
  }, []);
  const sv = useMemo(() => {
    const m = metric('krwionosny.metric.objetosc_wyrzutowa');
    const r = firstNumber(m?.rest), s = firstNumber(m?.sprint);
    return r && s ? s / r : null;
  }, []);

  // ------------------------------------------------------------------ scena
  useEffect(() => {
    if (organ !== 'serce' || !hostRef.current) return;
    const sc = new OrganScene(hostRef.current);
    sceneRef.current = sc;
    let alive = true;
    sc.load(BASE).then(() => {
      if (!alive) return;
      sc.start();
      setStatus('ready');
      (window as unknown as { __organBench?: (n?: number) => unknown }).__organBench = (n = 240) => sc.bench(n);
      (window as unknown as { __organ?: OrganScene }).__organ = sc;
    }).catch((e: unknown) => { if (alive) { setStatus('error'); setError(e instanceof Error ? e.message : String(e)); } });
    const ro = new ResizeObserver(() => sc.resize());
    ro.observe(hostRef.current);
    return () => { alive = false; ro.disconnect(); sc.dispose(); sceneRef.current = null; delete (window as unknown as { __organBench?: unknown }).__organBench; };
  }, [organ]);

  useEffect(() => { rootRef.current?.focus(); }, []);
  useEffect(() => { const sc = sceneRef.current; if (sc) sc.reducedMotion = reduced; }, [reduced, status]);
  useEffect(() => { const sc = sceneRef.current; if (sc) sc.paused = paused; }, [paused, status]);
  useEffect(() => { const sc = sceneRef.current; if (sc) { sc.setWallsTissue(wallsTissue); } }, [wallsTissue, status]);
  useEffect(() => { const sc = sceneRef.current; if (sc) sc.setSelected(selected); }, [selected, status]);

  // moment: tempo cyklu z faktu (tętno), gęstość krwinek ∝ objętość wyrzutowa (gdy fakt jest)
  // moment z ramy (przełącznik AtlasApp pod sceną, jedno sterowanie jak S10); film ustawia go sam w kroku 5
  const effMoment: AtlasState = tab === 'film' ? (STEPS[step].sprint ? 'sprint' : 'rest') : state;
  useEffect(() => {
    const sc = sceneRef.current;
    if (!sc) return;
    const rest = hr.rest ?? 60, spr = hr.sprint ?? 150;
    sc.heartRate = effMoment === 'sprint' ? spr : rest;
    sc.density = effMoment === 'sprint' ? (sv ?? 1.4) : 1;
  }, [effMoment, hr, sv, status]);

  // flagi ruchu: zwiedzanie = pełny cykl; film = krok; quiz = bez ruchu krwinek (łatwiej wskazać)
  useEffect(() => {
    const sc = sceneRef.current;
    if (!sc || status !== 'ready') return;
    if (tab === 'film') {
      const s = STEPS[step];
      Object.assign(sc.flags, s.flags, { cut });
      sc.goShot(s.shot);
    } else {
      Object.assign(sc.flags, { flow: true, flowFrozen: tab === 'quiz', valves: true, contraction: true, impulse: false, cut });
    }
    sc.applyFlags();
  }, [tab, step, cut, status]);

  // automatyczne kroki filmu (pauza ręczna; przy reduced-motion bez automatu)
  const caption = useMemo(() => STEPS[step].facts.map((id) => factById.get(id)?.text).filter(Boolean).join(' '), [step, factById]);
  useEffect(() => {
    if (tab !== 'film' || !stepPlaying || reduced || paused || step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), stepDurationSec(caption || STEPS[step].title) * 1000);
    return () => clearTimeout(t);
  }, [tab, step, stepPlaying, reduced, paused, caption]);

  // ------------------------------------------------------------------ wskaźnik
  const pickAt = (e: React.PointerEvent) => {
    const sc = sceneRef.current, host = hostRef.current;
    if (!sc || !host) return null;
    const r = host.getBoundingClientRect();
    return { part: sc.pick(e.clientX - r.left, e.clientY - r.top), x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current, sc = sceneRef.current;
    if (d && sc) {
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) d.moved = true;
      sc.orbit(-dx * 0.35, dy * 0.25);
      d.x = e.clientX; d.y = e.clientY;
      return;
    }
    const h = pickAt(e);
    setHover(h?.part ? { part: h.part, x: h.x, y: h.y } : null);
    sc?.setHovered(h?.part ?? null);
  };
  const onClickScene = (e: React.PointerEvent) => {
    const h = pickAt(e);
    if (!h?.part) return;
    if (tab === 'quiz' && quizIdx < QUIZ.length) {
      setQuizResult({ ok: h.part === QUIZ[quizIdx].answer, picked: h.part });
      setSelected(QUIZ[quizIdx].answer);
      return;
    }
    setSelected(h.part);
    if (tab !== 'zwiedzaj') setTab('zwiedzaj');
  };

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const sc = sceneRef.current;
    const handled = () => { e.preventDefault(); e.stopPropagation(); };
    if (e.key === 'Escape') { handled(); onClose(); return; }
    if (!sc) return;
    if ((e.key === 'Enter' || e.key === ' ') && (e.target as HTMLElement).closest('button')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { handled(); sc.orbit(e.key === 'ArrowLeft' ? 45 : -45, 0); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { handled(); sc.orbit(0, e.key === 'ArrowUp' ? 12 : -12); }
    else if (e.key === '+' || e.key === '=') { handled(); sc.zoom(0.85); }
    else if (e.key === '-') { handled(); sc.zoom(1.18); }
    else if (/^[1-4]$/.test(e.key)) { handled(); sc.goShot(['przekroj', 'tyl', 'podstawa', 'przedsionek'][+e.key - 1]); }
    else if (e.key === ' ') { handled(); setPaused((p) => !p); }
    else if (e.key === ',' && tab === 'film') { handled(); setStep((s) => Math.max(0, s - 1)); }
    else if (e.key === '.' && tab === 'film') { handled(); setStep((s) => Math.min(STEPS.length - 1, s + 1)); }
    else if (e.key === 'Tab' && tab === 'zwiedzaj' && (e.target as HTMLElement) === rootRef.current) {
      // Tab po częściach (zastępuje najechanie): podświetla i otwiera opis
      handled();
      const list = HEART_PARTS.filter((p) => partsByKey.has(p) || SCHEMATIC_PARTS.has(p));
      const i = selected ? list.indexOf(selected) : -1;
      setSelected(list[(i + (e.shiftKey ? -1 : 1) + list.length) % list.length]);
    }
  };

  if (organ !== 'serce') {
    return (
      <div className="organ-root organ-center">
        <p>Gablota tego narządu nie jest jeszcze gotowa.</p>
        <button type="button" className="organ-btn" onClick={onClose}>Wróć do widoku 3D</button>
      </div>
    );
  }

  const st = STEPS[step];
  const shownMetrics = (tab === 'film' ? st.metrics ?? [] : []).map((id) => metric(id)).filter((m): m is AtlasMetric => !!m);
  const chips = ['krwinki powiększone', 'schemat · bez skali', ...((tab !== 'film' || st.flags.contraction) ? ['ruch poglądowy'] : [])];
  const selTexts = selected ? partsByKey.get(selected) ?? [] : [];
  const quiz = QUIZ[quizIdx];

  return (
    <div ref={rootRef} className="organ-root" role="application" tabIndex={0} onKeyDown={onKey}
      aria-label="Gablota: serce. Przeciągnij, aby obrócić; strzałki obracają, + i − przybliżają, 1–4 ujęcia, Tab wybiera części, Esc wraca do widoku 3D.">
      <div className="organ-top">
        <span className="organ-crumb">Atlas › Krwionośny › <b>Serce</b></span>
        <span className="organ-goal">Jak serce pompuje krew?</span>
        <span className="organ-chip">Podstawowy</span>
        <button type="button" className="organ-btn organ-back" onClick={onClose}>← Wróć do widoku 3D</button>
      </div>

      <div ref={hostRef} className="organ-stage"
        onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, moved: false }; (e.target as Element).setPointerCapture?.(e.pointerId); }}
        onPointerUp={(e) => { const d = drag.current; drag.current = null; if (d && !d.moved) onClickScene(e); }}
        onPointerMove={onPointerMove}
        onPointerLeave={() => { setHover(null); sceneRef.current?.setHovered(null); }}
        onWheel={(e) => sceneRef.current?.zoom(e.deltaY > 0 ? 1.08 : 0.92)}>
        {hover && (
          <div className="organ-tip" style={{ left: hover.x + 14, top: hover.y + 10 }}>
            {PART_NAME_PL[hover.part]}{SCHEMATIC_PARTS.has(hover.part) ? ' · schemat' : ''}
          </div>
        )}
        {status === 'loading' && <div className="organ-center" role="status">Wczytywanie serca…</div>}
        {status === 'error' && (
          <div className="organ-center" role="alert">
            <p>Brakuje modelu serca do gabloty.</p>
            <p className="organ-small">Model nie jest w repozytorium: zbuduj go skryptem blender/biomotion/export_heart.py ({error}).</p>
          </div>
        )}
        <div className="organ-chips">{chips.map((c) => <span key={c} className="organ-chip">{c}</span>)}</div>
        <div className="organ-legend" aria-label="Jak czytać">
          <b>Jak czytać</b>
          <span><i className="dot" style={{ background: '#D93240' }} /> <i className="dot" style={{ background: '#3E6FD8' }} /> {panel.ui.legendBloodPl ?? ''}</span>
          <span><i className="dot glow" /> jasny punkt: impuls, który uruchamia skurcz</span>
          <span><i className="dot schema" /> bryła w jednym kolorze: schemat, bez skali</span>
        </div>
      </div>

      <div className="organ-under">
        <div className="organ-seg" role="group" aria-label="Ujęcia">
          {(['przekroj', 'tyl', 'podstawa', 'przedsionek'] as const).map((s, i) => (
            <button key={s} type="button" title={`Klawisz ${i + 1}`} onClick={() => sceneRef.current?.goShot(s)}>{['Przekrój', 'Tył', 'Podstawa', 'Przedsionek'][i]}</button>
          ))}
        </div>
        <div className="organ-seg" role="group" aria-label="Widok">
          <button type="button" aria-pressed={cut} onClick={() => setCut((c) => !c)}>Przekrój {cut ? 'wł.' : 'wył.'}</button>
          <button type="button" aria-pressed={wallsTissue} onClick={() => setWallsTissue((w) => !w)}>Ściany: {wallsTissue ? 'mięsień' : 'barwa krwi'}</button>
          <button type="button" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>{paused ? '▶ Wznów' : '❚❚ Pauza'}</button>
        </div>
      </div>

      <aside className="organ-panel" aria-label="Panel gabloty">
        <div className="organ-tabs" role="tablist">
          {([['zwiedzaj', 'Zwiedzaj'], ['film', 'Jak to działa'], ['quiz', 'Sprawdź się']] as const).map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); if (k === 'film') { setStep(0); setStepPlaying(!reduced); } }}>{l}</button>
          ))}
        </div>

        {tab === 'zwiedzaj' && (
          <div className="organ-body">
            {selected ? (
              <>
                <h3>{PART_NAME_PL[selected]}</h3>
                {SCHEMATIC_PARTS.has(selected) && <p className="organ-chip">schemat · bez skali</p>}
                {selTexts.length ? selTexts.map((f) => (
                  <p key={f.id}>{f.text} {f.badge && <span className="organ-badge">{f.badge}</span>}</p>
                )) : <p className="organ-small">Opis tej części jeszcze czeka na sprawdzony fakt.</p>}
                <button type="button" className="organ-btn" onClick={() => setSelected(null)}>Odznacz</button>
              </>
            ) : <p className="organ-small">Najedź na część serca albo ją kliknij. Tab przechodzi po częściach.</p>}
            <ul className="organ-list">
              {HEART_PARTS.filter((p) => partsByKey.has(p)).map((p) => (
                <li key={p}><button type="button" aria-pressed={selected === p} onClick={() => setSelected(p)}>{PART_NAME_PL[p]}</button></li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'film' && (
          <div className="organ-body" aria-live="polite">
            <p className="organ-small">Krok {step + 1} z {STEPS.length}</p>
            <h3>{st.title}</h3>
            {caption && <p>{caption} <span className="organ-badge">Wiedza podręcznikowa</span></p>}
            {shownMetrics.map((m) => (
              <div key={m.id} className="organ-metric">
                <span>{m.labelPl}</span>
                <b>{m.rest} → {m.sprint}{m.unit ? ` ${m.unit}` : ''}</b>
                {m.protocolMismatch && <i>W badaniu: {m.protocolMismatch}</i>}
              </div>
            ))}
            <div className="organ-seg">
              <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>◀ Wstecz</button>
              <button type="button" onClick={() => setStepPlaying((p) => !p)}>{stepPlaying ? '❚❚' : '▶'}</button>
              {st.exit
                ? <button type="button" onClick={onClose}>Wróć do widoku krwionośnego ›</button>
                : <button type="button" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>Dalej ▶</button>}
            </div>
          </div>
        )}

        {tab === 'quiz' && (
          <div className="organ-body" aria-live="polite">
            {quizIdx < QUIZ.length ? (
              <>
                <h3>{quiz.q}</h3>
                <p className="organ-small">Kliknij część na modelu.</p>
                {quizResult && (
                  <div className={`organ-answer ${quizResult.ok ? 'ok' : 'bad'}`}>
                    <b>{quizResult.ok ? 'Dobrze.' : `To jest: ${PART_NAME_PL[quizResult.picked as HeartPart]}.`}</b>
                    {factById.get(quiz.fact) && <p>{factById.get(quiz.fact)!.text}</p>}
                    <button type="button" className="organ-btn" onClick={() => { setQuizResult(null); setSelected(null); setQuizIdx((i) => i + 1); }}>Następne pytanie</button>
                  </div>
                )}
              </>
            ) : (() => {
              const m = metric('krwionosny.metric.objetosc_wyrzutowa');
              const up = m ? (firstNumber(m.sprint) ?? 0) > (firstNumber(m.rest) ?? 0) : null;
              return (
                <>
                  <h3>W sprincie objętość krwi wyrzucanej przy jednym uderzeniu: rośnie czy maleje?</h3>
                  {m ? (
                    <div className="organ-seg">
                      <button type="button" onClick={() => setQuizResult({ ok: up === true, picked: 'up' })}>↑ rośnie</button>
                      <button type="button" onClick={() => setQuizResult({ ok: up === false, picked: 'down' })}>↓ maleje</button>
                    </div>
                  ) : <p className="organ-small">To pytanie czeka na sprawdzony fakt.</p>}
                  {quizResult && m && (
                    <div className={`organ-answer ${quizResult.ok ? 'ok' : 'bad'}`}>
                      <b>{quizResult.ok ? 'Dobrze.' : 'Nie tym razem.'}</b>
                      <p>{m.labelPl}: {m.rest} → {m.sprint}{m.unit ? ` ${m.unit}` : ''}.</p>
                      {m.protocolMismatch && <i className="organ-small">W badaniu: {m.protocolMismatch}</i>}
                      <button type="button" className="organ-btn" onClick={() => { setQuizResult(null); setQuizIdx(0); }}>Od początku</button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        <p className="organ-lic">Model serca: HuBMAP / NIH Visible Human (CC BY 4.0); węzły i pęczek: schemat własny.</p>
      </aside>
    </div>
  );
}
