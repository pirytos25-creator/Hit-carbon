import { Component, lazy, Suspense, useEffect, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { AtlasPlate, fullWords, useFlows3d } from './AtlasPlate';
import { AtlasGlyph } from './glyphs';
import { computeChange } from './change';
import { Locator } from './Locator';
import {
  EVIDENCE_PHRASE,
  PALETTE,
  flowStyle,
  isShown,
  lessonText,
  paletteCssVars,
  shownCurriculum,
  shownProtocolNote,
  shownQuiz,
  shownSummary,
  systemOfPlate,
  type AtlasLevel,
} from './palette';
import { ATLAS_SYSTEMS } from './plates';
import { ATLAS_GLOSSARY } from './glossary';
import { viewResolution } from './projection';
import type { AtlasAnchorsFile, AtlasMetric, AtlasPlateContent, AtlasQuiz, AtlasState, AtlasSystemId, AtlasView } from './types';
import { SCIENTIFIC_REFERENCES } from '../science/ScientificReferences';
import { EVIDENCE_LEVEL_META } from '../science/EducationalContent';

// ---------------------------------------------------------------- punkt montażu 3D (E3, kontrakt z wizualizatorem)
/** Kontrakt komponentu src/atlas3d/Atlas3DView (dostarcza wizualizator 3D; AtlasApp tylko go montuje). */
export interface Atlas3DViewProps {
  system: AtlasSystemId;
  state: AtlasState;
  level: AtlasLevel;
  onClose: () => void;
  /**
   * M6 (punkt wejścia gabloty): widok 3D wywołuje to na końcu wejścia diegetycznego (OrganDive, wizualizator)
   * z ID narządu, np. 'heart'. AtlasApp montuje wtedy OrganView; zamknięcie gabloty wraca do widoku 3D.
   */
  onOpenOrgan?: (organ: string) => void;
}

/** Kontrakt gabloty narządu: src/organs/OrganView (wizualizator: scena; integrator: rama i montaż w AtlasApp). */
export interface OrganViewProps {
  organ: string;
  system: AtlasSystemId;
  state: AtlasState;
  level: AtlasLevel;
  onClose: () => void;
}
const organLoaders = import.meta.glob<{ default?: ComponentType<OrganViewProps>; OrganView?: ComponentType<OrganViewProps> }>(
  '../organs/OrganView.{tsx,ts,jsx,js}',
);
const loadOrgan = Object.values(organLoaders)[0];
const OrganView = loadOrgan
  ? lazy(() => loadOrgan().then((m) => ({ default: (m.default ?? m.OrganView) as ComponentType<OrganViewProps> })))
  : null;
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
 * M3 (U0, docs/atlas_audyt/DECYZJA_UX_NARZADY.md, UX_POSIEDZENIE §2.1 S1–S13, §2.2 P1): panel zaczyna się od pytania
 * planszy (pytanie → liczba-bohater → opis ≤ 3 zdania → „Więcej”); protokół i VO₂max w rozwijanym „ⓘ”; przełącznik
 * poziomu mały, w nagłówku; pod sceną tylko przełącznik momentu z nazwą momentu; legenda „Jak czytać” w rogu sceny.
 * Statusy sprawdzania (teksty dla autora) wyłącznie w poziomie Rozszerzonym, pod „Więcej” (komponent StatusNotes;
 * walidator scripts/atlas_check_facts.mjs pilnuje, żeby takie zdania nie stały nigdzie indziej).
 */

const BASE = import.meta.env.BASE_URL;
const LEVEL_KEY = 'atlas.level';
const BASIC_MAX_METRICS = 4; // model §3.5: najwyżej 4 liczby w poziomie podstawowym
const STUDIO_BG = 'radial-gradient(120% 95% at 50% 36%, #13203A 0%, #070B14 74%)'; // S11 (Reżyser)

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

/** Znacznik szkicu: widoczny tylko w podglądzie `?szkice=1` (zrzuty dla agenta sprawdzającego). */
function DraftMark({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <span className="ml-1.5 inline-block rounded border border-dashed border-amber-400/80 px-1 align-middle font-mono-tech text-[14px] leading-tight text-amber-300">
      szkic
    </span>
  );
}

function MetricCard({
  m,
  sprint,
  colorLight,
  extended,
  hero,
}: {
  m: AtlasMetric;
  sprint: boolean;
  colorLight: string;
  extended: boolean;
  hero?: boolean;
}) {
  const ev = EVIDENCE_LEVEL_META[m.evidenceLevel];
  const restOk = isShown(m.restStatus ?? m.status);
  const label = extended ? m.labelPl : fullWords(m.labelPl);
  return (
    <div className={`rounded-xl border bg-slate-900/60 ${hero ? 'border-slate-600 p-4' : 'border-slate-800 p-3'}`}>
      <p className={hero ? 'text-[15px] text-slate-200' : 'text-sm text-slate-300'}>{label}</p>
      <p className={`font-mono-tech mt-1 ${hero ? 'text-[21px] leading-snug' : 'text-[15px]'}`}>
        {restOk ? (
          <span className={sprint ? 'text-slate-400' : 'text-white'}>{m.rest}</span>
        ) : (
          <span className="text-slate-400" title="Brak wartości spoczynkowej">
            —<span className="sr-only">brak wartości spoczynkowej</span>
          </span>
        )}
        <span className="text-slate-400"> → </span>
        <span style={{ color: sprint ? colorLight : '#94a3b8' }} className="font-semibold">
          {m.sprint}
        </span>
        {m.unit && <span className={`text-slate-400 ${hero ? 'text-base' : 'text-sm'}`}> {m.unit}</span>}
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
      {m.notePl && <p className="text-sm text-slate-400 mt-1.5 leading-snug">{extended ? m.notePl : fullWords(m.notePl)}</p>}
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
        </div>
      )}
    </div>
  );
}

/**
 * Statusy sprawdzania (S2/K4): JEDYNE miejsce z tekstami „czeka na sprawdzenie”. Renderowane tylko w poziomie
 * Rozszerzonym, wewnątrz „Więcej” (walidator scripts/atlas_check_facts.mjs).
 */
function StatusNotes({ content, state }: { content: AtlasPlateContent; state: AtlasState }) {
  const hiddenMetrics = content.metrics.filter((m) => !isShown(m.status)).length;
  const hiddenRoles = content.labels.filter((l) => !isShown(l.roleStatus?.[state])).length;
  const noteHidden = !!content.protocolNotePl && !isShown(content.protocolNoteStatus);
  const lesson = [content.lessonGoal, content.question, content.summaryShort?.[state], content.momentLabel, content.curriculumRef];
  const lessonHidden = lesson.filter((t) => t && !isShown(t.status)).length;
  const lines: string[] = ['Liczby i opisy sprawdził agent AI z dosłownym cytatem ze źródła (nie ekspert).'];
  if (hiddenMetrics) lines.push(`Liczby czekające na sprawdzenie źródła (niepokazywane): ${hiddenMetrics}.`);
  if (hiddenRoles) lines.push(`Opisy ról w tym stanie czekające na sprawdzenie (na planszy sama nazwa): ${hiddenRoles}.`);
  if (noteHidden) lines.push('Opis momentu „sprint” na tej planszy czeka na sprawdzenie.');
  if (lessonHidden) lines.push(`Nowe teksty lekcji (cel, pytanie, krótki opis, nazwa momentu) czekające na sprawdzenie: ${lessonHidden}.`);
  return (
    <section aria-label="Stan sprawdzenia" className="rounded-lg border border-slate-800 p-3 text-sm text-slate-400 space-y-1">
      <h4 className="font-mono-tech text-[14px] tracking-[0.12em] uppercase text-slate-400">Stan sprawdzenia</h4>
      {lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </section>
  );
}

/**
 * „Sprawdź się” (P6): jedno pytanie na planszę, bez punktów i bez mierzenia czasu; wynik tylko w tej przeglądarce
 * (stan komponentu, nic nie jest zapisywane). Pytanie „Wskaż…” wybiera się kliknięciem podpisu na planszy.
 */
function QuizBox({
  quiz,
  draft,
  picking,
  setPicking,
  picked,
  reset,
}: {
  quiz: AtlasQuiz;
  draft: boolean;
  picking: boolean;
  setPicking: (b: boolean) => void;
  picked: string | null;
  reset: () => void;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const answer = quiz.type === 'point' ? picked : choice;
  const ok = answer !== null && answer === quiz.answer;
  const OPTIONS: [string, string][] = [
    ['up', '↑ rośnie'],
    ['down', '↓ maleje'],
    ['same', '= bez zmian'],
  ];
  return (
    <section aria-label="Sprawdź się" className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 flex flex-col gap-2">
      <h3 className="font-mono-tech text-[14px] tracking-[0.12em] uppercase text-slate-400">
        Sprawdź się
        <DraftMark on={draft} />
      </h3>
      <p className="text-[15px] text-slate-100 leading-snug">{quiz.question}</p>
      {quiz.type === 'updown' ? (
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Odpowiedź">
          {OPTIONS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={choice === k}
              onClick={() => setChoice(k)}
              className={'rounded-lg px-2 py-1.5 text-sm font-display font-semibold transition ' + (choice === k ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700')}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          aria-pressed={picking}
          onClick={() => setPicking(!picking)}
          className={'self-start rounded-lg px-3 py-1.5 text-sm font-display font-semibold ' + (picking ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700')}
        >
          {picking ? 'Kliknij podpis na planszy…' : 'Wskaż na planszy'}
        </button>
      )}
      {answer !== null && (
        <div aria-live="polite" className="text-sm leading-snug">
          <p className={ok ? 'text-emerald-300 font-semibold' : 'text-amber-200 font-semibold'}>{ok ? 'Dobrze.' : 'Jeszcze nie.'}</p>
          {ok ? (
            <p className="text-slate-300">{quiz.explain}</p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setChoice(null);
                reset();
              }}
              className="mt-1 text-sky-300 underline underline-offset-2"
            >
              Spróbuj jeszcze raz
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/** Mały przełącznik poziomu w nagłówku (S4). Nazwy: „Podstawowy | Rozszerzony”. */
function LevelSwitch({ level, setLevel }: { level: AtlasLevel; setLevel: (l: AtlasLevel) => void }) {
  return (
    <div className="shrink-0 inline-grid grid-cols-2 rounded-lg bg-slate-900 p-0.5 text-[14px]" role="radiogroup" aria-label="Poziom szczegółów">
      {(['basic', 'extended'] as AtlasLevel[]).map((l) => (
        <button
          key={l}
          role="radio"
          aria-checked={level === l}
          onClick={() => setLevel(l)}
          className={`rounded-md px-2 py-1 font-display font-semibold transition ${level === l ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'}`}
        >
          {l === 'basic' ? 'Podstawowy' : 'Rozszerzony'}
        </button>
      ))}
    </div>
  );
}

export function AtlasApp() {
  const [systemId, setSystemId] = useState<AtlasSystemId>(systemFromHash);
  const [state, setState] = useState<AtlasState>('sprint');
  // M6: „Co się zmieniło” (trzeci przycisk momentu) = moment + przygaszenie reszty; „Sprawdź się” w trybie „Wskaż…”
  const [changeMode, setChangeMode] = useState(false);
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [organ, setOrgan] = useState<string | null>(null);
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
  useEffect(() => {
    setPanel(0);
    setChangeMode(false);
    setPicking(false);
    setPicked(null);
    setOrgan(null);
  }, [systemId]);
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
    setChangeMode(false);
    setState((s) => (s === 'rest' ? 'sprint' : 'rest'));
  };

  // Karta bez stanów (np. rozrodczy): przełącznik stanów ukryty, pokazujemy opis spoczynku.
  const isCard = !!content.card || !!anchors?.card;
  const shownState: AtlasState = isCard ? 'rest' : state;
  const sprint = shownState === 'sprint';
  const color = `var(${content.colorVar})`;
  const colorLight = `var(${content.colorVar}-light)`;
  const shownMetrics = content.metrics.filter((m) => isShown(m.status));
  // Liczba-bohater (P1): wskazana w układzie planszy, jeśli sprawdzona; inaczej pierwsza liczba 'primary'.
  const hero = shownMetrics.find((m) => m.id === content.heroMetricId) ?? shownMetrics.find((m) => !m.tier || m.tier === 'primary');
  // Poziom podstawowy: najpierw liczby 'primary' (brak tier = primary), potem 'secondary'; liczby 'student' tylko w rozszerzonym.
  const tierRank = (m: AtlasMetric) => (m.tier === 'secondary' ? 1 : m.tier === 'student' ? 2 : 0);
  const restMetrics = shownMetrics.filter((m) => m !== hero);
  const moreMetrics = extended
    ? restMetrics
    : restMetrics
        .filter((m) => m.tier !== 'student')
        .sort((a, b) => tierRank(a) - tierRank(b))
        .slice(0, BASIC_MAX_METRICS - (hero ? 1 : 0));
  const onColor = systemOfPlate(systemId)?.onColor ?? '#0b1020';
  // S1: protokół i definicja VO₂max w rozwijanym „ⓘ Co znaczy »sprint«” (bramka pola protocolNotePl: shownProtocolNote).
  const protocolNote = shownProtocolNote(content);
  const glossary = ATLAS_GLOSSARY.filter((g) => isShown(g.status));
  // P1 i S5: teksty lekcji przez bramkę lessonText (sprawdzony tekst albo nic; szkic tylko w podglądzie ?szkice=1).
  const goal = lessonText(content.lessonGoal);
  const question = lessonText(content.question);
  const moment = lessonText(content.momentLabel);
  const curriculum = shownCurriculum(content);
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
  // P1: w panelu najpierw opis ≤ 3 zdania (summaryShort); pełne podsumowanie pod „Więcej”.
  const summaries = { rest: shownSummary(content, 'rest'), sprint: shownSummary(content, 'sprint') };
  const shorts = { rest: lessonText(content.summaryShort?.rest), sprint: lessonText(content.summaryShort?.sprint) };
  const lead = (s: AtlasState) => shorts[s]?.text ?? summaries[s];
  const change = isCard ? null : computeChange(content);
  const changeOn = changeMode && !!change;
  const quizShown = shownQuiz(content);
  const groups = PALETTE.groups
    .map((g) => ({ ...g, systems: ATLAS_SYSTEMS.filter((s) => systemOfPlate(s.id)?.group === g.key) }))
    .filter((g) => g.systems.length);

  // Przełącznik momentu (S5, S13): „Spoczynek | <nazwa momentu>”; tekst na kolorze układu = onColor (kontrast ≥ 4,5:1).
  const momentSwitch = !isCard && (
    <div
      className={`relative z-40 shrink-0 grid ${change ? 'grid-cols-3 max-w-[560px]' : 'grid-cols-2 max-w-[420px]'} rounded-xl bg-slate-900 p-1 w-full max-lg:fixed max-lg:bottom-3 max-lg:left-3 max-lg:right-3 max-lg:w-auto max-lg:max-w-none max-lg:z-30 max-lg:shadow-lg max-lg:shadow-black/60 max-lg:border max-lg:border-slate-700`}
      role="tablist"
      aria-label="Stan organizmu"
    >
      {(['rest', 'sprint'] as AtlasState[]).map((s) => {
        const on = state === s && !changeOn;
        return (
          <button
            key={s}
            role="tab"
            aria-selected={on}
            onClick={() => {
              setChangeMode(false);
              setState(s);
            }}
            className={`rounded-lg py-2 px-2 text-sm font-display font-semibold transition ${on ? 'text-white' : 'text-slate-300 hover:text-white'}`}
            style={on ? { background: s === 'sprint' ? color : '#334155', color: s === 'sprint' ? onColor : undefined } : undefined}
          >
            {s === 'rest' ? 'Spoczynek' : moment?.text ?? 'Sprint HIIT'}
            {s === 'sprint' && <DraftMark on={!!moment?.draft} />}
          </button>
        );
      })}
      {change && (
        <button
          role="tab"
          aria-selected={changeOn}
          onClick={() => {
            setState('sprint');
            setChangeMode(true);
          }}
          className={`rounded-lg py-2 px-2 text-sm font-display font-semibold transition ${changeOn ? '' : 'text-slate-300 hover:text-white'}`}
          style={changeOn ? { background: color, color: onColor } : undefined}
        >
          Co się zmieniło
        </button>
      )}
    </div>
  );

  // S7: legenda „Jak czytać” w rogu sceny (rozwijana, nie zasłania obrazu, dopóki jej nie otworzyć).
  const sig = content.signature;
  const howToRead = (legend.length > 0 || !!sig) && (
    <details className="absolute left-2 top-2 lg:left-4 lg:top-4 z-20 max-w-[min(340px,calc(100%-1rem))] rounded-xl border border-slate-700 bg-slate-950/90 text-sm text-slate-300 shadow-lg shadow-black/40">
      <summary className="cursor-pointer select-none px-3 py-1.5 font-display font-semibold text-slate-200">Jak czytać</summary>
      <section className="px-3 pb-3 flex flex-col gap-1.5" aria-label="Legenda strzałek">
        {sig ? (
          <>
            <p className="text-slate-300 font-semibold">{sig.namePl}</p>
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {sig.legend.map((it) => (
                <li key={it.labelPl} className="flex items-center gap-2">
                  <svg width="22" height="14" viewBox="0 0 22 14" className="shrink-0" aria-hidden="true">
                    {it.symbol === 'particle' && <ellipse cx="11" cy="7" rx="7" ry="4.5" fill={colorLight} />}
                    {it.symbol === 'pulse' && <circle cx="11" cy="7" r="4" fill="#fff" stroke={colorLight} strokeWidth="2.5" />}
                    {it.symbol === 'glow' && <circle cx="11" cy="7" r="6" fill={colorLight} fillOpacity="0.45" />}
                    {it.symbol === 'counter' && <text x="11" y="11" textAnchor="middle" fontSize="11" fill={colorLight}>×N</text>}
                    {it.symbol === 'flow' && <path d="M2,7 L16,7 M13,3 L19,7 L13,11" stroke={colorLight} strokeWidth="2" fill="none" />}
                  </svg>
                  <span>{it.labelPl}</span>
                </li>
              ))}
            </ul>
            {sig.chips.length > 0 && <p className="text-slate-400">{sig.chips.join(' · ')}</p>}
          </>
        ) : (
          <p className="text-slate-400">Strzałka pokazuje kierunek przepływu. Numer albo podpis przy kropce opisuje strukturę.</p>
        )}
        <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
          {legend.map((it) => {
            const fs = flowStyle(it.kind);
            return (
              <li key={`${it.kind}-${it.label}`} className="flex items-start gap-2 leading-snug">
                <svg width="34" height="12" viewBox="0 0 34 12" className="mt-1 shrink-0" aria-hidden="true">
                  <line x1="1" y1="6" x2="27" y2="6" stroke={fs.color} strokeWidth="2.6" strokeDasharray={fs.dash.map((d) => d * 0.6).join(' ')} />
                  <path d="M26,1 L33,6 L26,11 z" fill={fs.color} />
                </svg>
                <span>
                  {extended ? it.label : fullWords(it.label)}
                  <span className="text-slate-400"> ({fs.namePl})</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </details>
  );

  return (
    <div
      className="w-screen h-screen overflow-auto lg:overflow-hidden bg-[var(--atlas-bg)] text-slate-100 flex flex-col lg:flex-row pb-20 lg:pb-0"
      style={paletteCssVars() as CSSProperties}
    >
      {/* Nawigacja układów: ikona + nazwa (kolor nie jest jedynym nośnikiem informacji). Telefon (S3): pasek przewijany
          w bok ze wskazówką „›”, że układów jest więcej. */}
      <div className="relative shrink-0 lg:contents">
        <nav
          aria-label="Układy"
          className="shrink-0 lg:w-[156px] border-b lg:border-b-0 lg:border-r border-slate-800 p-2 lg:p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto bio-scroll relative max-lg:pr-12"
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
        <div
          className="lg:hidden pointer-events-none absolute right-0 top-0 bottom-px w-14 flex items-center justify-end pr-2 text-xl font-bold text-slate-200"
          style={{ background: 'linear-gradient(to left, var(--atlas-bg) 45%, transparent)' }}
          aria-hidden="true"
        >
          ›
        </div>
      </div>

      {/* Telefon (S3): tytuł planszy w jednej linii nad obrazem + mały przełącznik poziomu (S4). */}
      {narrow && (
        <div className="shrink-0 flex items-center gap-2 px-3 pt-2">
          <span className="shrink-0" style={{ color: colorLight }}>
            <AtlasGlyph glyph={systemOfPlate(systemId)?.glyph ?? 'heart'} size={18} />
          </span>
          <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold">{content.titlePl}</h1>
        </div>
      )}

      {/* Plansza: studio (S11) – gradient i podest */}
      <main
        className="relative flex-1 min-w-0 lg:min-h-0 p-2 lg:p-6 lg:pb-4 flex flex-col items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        style={{ background: STUDIO_BG }}
        tabIndex={0}
        onKeyDown={onPlateKey}
        aria-label={`Plansza: ${content.titlePl}. Klawisz S przełącza moment.`}
      >
        {!narrow && (
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-12 h-16 w-[58%] rounded-[50%]"
            style={{ background: 'radial-gradient(closest-side, rgba(148,163,184,0.16), rgba(148,163,184,0.05) 60%, transparent)' }}
            aria-hidden="true"
          />
        )}
        {howToRead}
        {narrow && (
          <div className="absolute right-2 top-2 z-20">
            <LevelSwitch level={level} setLevel={setLevel} />
          </div>
        )}
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
          // Widok 3D zajmuje scenę nad przełącznikiem momentu (S4/S5: moment steruje też widokiem 3D, więc musi być widoczny).
          <div
            className={`absolute inset-x-0 top-0 z-30 bg-[var(--atlas-bg)] ${isCard ? 'bottom-0' : 'bottom-16'}`}
            role="dialog"
            aria-label={`Widok 3D: ${content.titlePl}`}
          >
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
                    <Atlas3DView system={systemId} state={shownState} level={level} onClose={() => setShow3d(false)} onOpenOrgan={setOrgan} />
                  </Suspense>
                </View3DBoundary>
              ) : (
                unavailable
              );
            })()}
          </div>
        )}
        {organ && (
          // Gablota narządu (M5, wizualizator) nad widokiem 3D; zamknięcie wraca do widoku 3D (setOrgan(null)).
          <div className="absolute inset-x-0 top-0 bottom-0 z-[35] bg-[var(--atlas-bg)]" role="dialog" aria-label={`Gablota: ${organ}`}>
            {(() => {
              const back = (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-300">
                  <p>Gablota tego narządu nie jest jeszcze dostępna w tej wersji.</p>
                  <button type="button" onClick={() => setOrgan(null)} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700">
                    Wróć do widoku 3D
                  </button>
                </div>
              );
              return OrganView ? (
                <View3DBoundary fallback={back}>
                  <Suspense fallback={<p className="h-full flex items-center justify-center text-slate-400">Wczytywanie gabloty…</p>}>
                    <OrganView organ={organ} system={systemId} state={shownState} level={level} onClose={() => setOrgan(null)} />
                  </Suspense>
                </View3DBoundary>
              ) : (
                back
              );
            })()}
          </div>
        )}
        {anchors && !narrow && (
          <div className="pointer-events-none absolute right-3 bottom-2 z-10 hidden lg:block">
            <Locator
              base={BASE}
              anchors={anchors}
              views={splitScale ? panels[panelIdx]?.views ?? viewsPresent : viewsPresent}
              scaleFree={content.scaleFreeViews}
              height={86}
              color={colorLight}
            />
          </div>
        )}
        {anchors ? (
          narrow ? (
            <div className="w-full flex flex-col items-center gap-2 pt-9">
              {content.views.map((v) => (
                <div key={v} className="relative w-full">
                <div className="pointer-events-none absolute right-1 top-1 z-10">
                  <Locator base={BASE} anchors={anchors} views={[v]} scaleFree={content.scaleFreeViews} height={64} color={colorLight} />
                </div>
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
                  highlight={changeOn ? change!.anchors : null}
                  changeView={changeOn}
                  onPick={picking ? (a) => { setPicked(a); setPicking(false); } : null}
                />
                </div>
              ))}
            </div>
          ) : (
            <>
              {splitScale && (
                <div
                  className="relative z-10 shrink-0 grid rounded-xl bg-slate-900 p-1 text-sm"
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
              <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
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
                  highlight={changeOn ? change!.anchors : null}
                  changeView={changeOn}
                  onPick={picking ? (a) => { setPicked(a); setPicking(false); } : null}
                />
              </div>
            </>
          )
        ) : (
          <p className="text-slate-400 text-sm">{error ? `Nie udało się wczytać planszy (${error}).` : 'Wczytywanie planszy…'}</p>
        )}
        {momentSwitch}
      </main>

      {/* Panel lekcji (P1): pytanie → liczba-bohater → opis ≤ 3 zdania → ⓘ → Więcej */}
      <aside className="shrink-0 lg:w-[360px] border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col gap-4 lg:overflow-y-auto bio-scroll">
        <header className="flex flex-col gap-1">
          {!narrow && (
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono-tech text-[14px] tracking-[0.14em] uppercase flex items-center gap-2" style={{ color: colorLight }}>
                <AtlasGlyph glyph={systemOfPlate(systemId)?.glyph ?? 'heart'} size={16} />
                Plansza
              </p>
              <LevelSwitch level={level} setLevel={setLevel} />
            </div>
          )}
          {!narrow && <h2 className="font-display text-2xl font-bold leading-tight">{content.titlePl}</h2>}
          {goal ? (
            <p className="text-sm text-slate-300">
              {goal.text}
              <DraftMark on={goal.draft} />
            </p>
          ) : (
            <p className="text-sm text-slate-300">{content.subtitlePl}</p>
          )}
        </header>

        {question && (
          <p className="font-display text-xl font-bold leading-snug" style={{ color: colorLight }}>
            {question.text}
            <DraftMark on={question.draft} />
          </p>
        )}

        {changeOn && change && (
          <section aria-label="Co się zmieniło" className="rounded-lg border p-3 text-sm flex flex-col gap-1.5" style={{ borderColor: colorLight }}>
            <h3 className="font-mono-tech text-[14px] tracking-[0.12em] uppercase" style={{ color: colorLight }}>
              Co się zmieniło
            </h3>
            {change.illustration ? (
              <p className="text-slate-300">
                Wyróżnione struktury to <span className="rounded border border-slate-600 px-1 text-slate-200">ilustracja</span>: na tej planszy nie ma
                liczb spoczynku i momentu, które dałoby się porównać.
              </p>
            ) : (
              <>
                <p className="text-slate-300">W pełnym kolorze: struktury, przy których liczby planszy zmieniają się najbardziej.</p>
                <ul className="list-none p-0 m-0 flex flex-col gap-1">
                  {change.basis.map((m) => (
                    <li key={m.labelPl} className="text-slate-200">
                      {extended ? m.labelPl : fullWords(m.labelPl)}:{' '}
                      <span className="font-mono-tech">
                        {m.rest} → <span style={{ color: colorLight }}>{m.sprint}</span>
                        {m.unit ? ` ${m.unit}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        {hero && <MetricCard m={hero} sprint={sprint} colorLight={colorLight} extended={extended} hero />}

        {/* Oba opisy w jednej komórce siatki: wysokość = dłuższy, więc przełączenie stanu nie przesuwa panelu.
            Gdy bieżący stan nie ma sprawdzonego opisu, nie rezerwujemy miejsca (bez pustej przerwy). */}
        {lead(shownState) && (
          <div className="grid">
            {(['rest', 'sprint'] as AtlasState[]).filter((s) => lead(s)).map((s) => (
              <p
                key={s}
                aria-hidden={s !== shownState}
                className={`[grid-area:1/1] text-[15px] leading-relaxed text-slate-200 transition-opacity duration-500 motion-reduce:transition-none ${
                  s === shownState ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {extended ? lead(s) : fullWords(lead(s)!)}
                <DraftMark on={!!shorts[s]?.draft} />
              </p>
            ))}
          </div>
        )}

        {protocolNote && (
          <details className="rounded-lg border border-slate-800 bg-slate-900/40 text-sm text-slate-300">
            <summary className="cursor-pointer select-none px-3 py-2 font-display font-semibold text-slate-200">
              <span aria-hidden="true">ⓘ </span>Co znaczy „sprint”
            </summary>
            <div className="px-3 pb-3 flex flex-col gap-2 leading-snug text-slate-400">
              <p>{protocolNote}</p>
              {glossary.map((g) => (
                <p key={g.id}>{g.textPl}</p>
              ))}
            </div>
          </details>
        )}

        {quizShown && (
          <QuizBox
            key={systemId}
            quiz={quizShown.quiz}
            draft={quizShown.draft}
            picking={picking}
            setPicking={setPicking}
            picked={picked}
            reset={() => {
              setPicked(null);
              setPicking(false);
            }}
          />
        )}

        <details key={level} open={extended} className="group rounded-lg border border-slate-800">
          <summary className="cursor-pointer select-none px-3 py-2 font-display font-semibold text-slate-200">Więcej</summary>
          <div className="px-3 pb-3 flex flex-col gap-3">
            {shorts[shownState] && summaries[shownState] && (
              <p className="text-sm leading-relaxed text-slate-300">{extended ? summaries[shownState] : fullWords(summaries[shownState]!)}</p>
            )}
            {moreMetrics.length > 0 && (
              <section className="flex flex-col gap-3" aria-label="Liczby: spoczynek i sprint">
                <h3 className="font-mono-tech text-[14px] tracking-[0.14em] uppercase text-slate-400">Spoczynek → {moment?.text ?? 'sprint'}</h3>
                {moreMetrics.map((m) => (
                  <MetricCard key={m.labelPl} m={m} sprint={sprint} colorLight={colorLight} extended={extended} />
                ))}
                {!extended && restMetrics.length > moreMetrics.length && <p className="text-sm text-slate-400">Więcej liczb w poziomie „Rozszerzony”.</p>}
              </section>
            )}
            {curriculum && (
              <p className="text-sm text-slate-400 leading-snug">
                Podstawa programowa (zakres {curriculum.scope === 'P' ? 'podstawowy' : 'rozszerzony'}), {curriculum.locator}: <q className="italic">{curriculum.quote}</q>
                <DraftMark on={!isShown(curriculum.status)} />
              </p>
            )}
            {extended && <StatusNotes content={content} state={shownState} />}
            <p className="text-[14px] text-slate-400 leading-snug">
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
              Klawisz S (gdy plansza ma fokus) przełącza moment. Podpis wyróżnia najechanie, klawisz Tab albo dotknięcie.
            </p>
          </div>
        </details>
      </aside>
    </div>
  );
}

export default AtlasApp;
