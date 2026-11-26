/**
 * E1-K2: treść faktów żyje wyłącznie w src/atlas/data/facts/<plansza>.json. Plik planszy (plates/<plansza>.ts) trzyma
 * sam układ: kotwice, widoki, kolejność, tier, nazwy struktur i strzałki. Ten moduł składa z obu pełną treść planszy
 * (`AtlasPlateContent`), której używa reszta aplikacji – bez zmiany wyglądu.
 */
import type {
  AtlasFactStatus,
  AtlasLabel,
  AtlasLessonText,
  AtlasMetric,
  AtlasPlateContent,
  AtlasState,
  AtlasSystemId,
  AtlasTier,
  AtlasVerifiedSummary,
} from './types';
import type { EvidenceLevel } from '../types/biogenesis';

/** Rekord faktu (src/atlas/data/schema/facts.schema.json). Pola `null` w JSON-ie = brak. */
export interface AtlasFactRecord {
  id: string;
  kind:
    | 'metric'
    | 'metric_rest'
    | 'role'
    | 'summary'
    | 'summary_verified'
    | 'protocol_note'
    | 'glossary'
    // M3 (U0): nowe teksty lekcji; każdy powstaje z przeformułowania sprawdzonych faktów (`derivedFrom`)
    | 'lesson_goal'
    | 'question'
    | 'summary_short'
    | 'moment_label'
    | 'curriculum_ref';
  plate: string | null;
  status: AtlasFactStatus;
  referenceIds: string[];
  value?: string;
  textPl?: string;
  labelPl?: string;
  unit?: string | null;
  evidenceLevel?: EvidenceLevel;
  evidence?: EvidenceLevel | null;
  quote?: string | null;
  locator?: string | null;
  conversionNote?: string | null;
  protocolMismatch?: string | null;
  measuredAt?: string | null;
  notePl?: string | null;
  seeAlsoPlate?: AtlasSystemId | null;
  restStatusExplicit?: boolean;
  tier?: AtlasTier;
  order?: number;
  anchor?: string;
  state?: AtlasState;
  structureId?: string;
  provenance?: string | null;
  accessMode?: string | null;
  checkedBy?: { report: string | null; rows: string[]; note: string } | null;
  /** M3: ID sprawdzonych faktów (`checked_agent`), z których przeformułowano ten tekst. */
  derivedFrom?: string[];
  /** curriculum_ref: zakres podstawy programowej. */
  scope?: 'P' | 'R';
}
export interface AtlasFactsFile {
  schemaVersion: number;
  plate: string | null;
  facts: AtlasFactRecord[];
}

/** Podpis w układzie planszy: bez opisu roli, statusów i źródeł (te są w faktach). */
export type AtlasLayoutLabel = Omit<AtlasLabel, 'role' | 'roleStatus' | 'referenceIds' | 'evidence' | 'conversionNote'>;

/** Układ planszy (plates/<plansza>.ts): wszystko poza treścią faktów. */
export type AtlasPlateLayout = Omit<
  AtlasPlateContent,
  | 'summary'
  | 'summaryReferenceIds'
  | 'summaryStatus'
  | 'summaryVerified'
  | 'protocolNotePl'
  | 'protocolNoteStatus'
  | 'metrics'
  | 'labels'
  | 'lessonGoal'
  | 'question'
  | 'summaryShort'
  | 'momentLabel'
  | 'curriculumRef'
> & { labels: AtlasLayoutLabel[] };

const u = <T>(v: T | null | undefined): T | undefined => (v === null ? undefined : v);

/** Pełna treść planszy z układu i faktów (ten sam kształt co dawniej w plates/*.ts). */
export function buildPlate(layout: AtlasPlateLayout, file: AtlasFactsFile): AtlasPlateContent {
  const facts = file.facts;
  const byId = new Map(facts.map((f) => [f.id, f]));
  const pick = (id: string) => {
    const f = byId.get(id);
    if (!f) throw new Error(`atlas: brak faktu ${id} w facts/${layout.id}.json`);
    return f;
  };

  const labels: AtlasLabel[] = layout.labels.map((l) => {
    const r = pick(`${layout.id}.role.${l.anchor}.rest`);
    const s = pick(`${layout.id}.role.${l.anchor}.sprint`);
    const ev: Partial<Record<AtlasState, EvidenceLevel>> = {};
    if (r.evidence) ev.rest = r.evidence;
    if (s.evidence) ev.sprint = s.evidence;
    const label: AtlasLabel = {
      ...l,
      role: { rest: r.textPl ?? '', sprint: s.textPl ?? '' },
      roleStatus: { rest: r.status, sprint: s.status },
    };
    if (r.referenceIds.length) label.referenceIds = r.referenceIds;
    if (ev.rest || ev.sprint) label.evidence = ev.rest && ev.sprint && ev.rest === ev.sprint ? ev.rest : ev;
    if (s.conversionNote ?? r.conversionNote) label.conversionNote = u(s.conversionNote ?? r.conversionNote);
    return label;
  });

  const metrics: AtlasMetric[] = facts
    .filter((f) => f.kind === 'metric')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((m) => {
      const rest = byId.get(`${m.id}.rest`);
      const metric: AtlasMetric = {
        id: m.id,
        labelPl: m.labelPl ?? m.id,
        rest: rest?.value ?? '—',
        sprint: m.value ?? '',
        unit: u(m.unit),
        referenceIds: m.referenceIds,
        evidenceLevel: m.evidenceLevel as EvidenceLevel,
        notePl: u(m.notePl),
        status: m.status,
        conversionNote: u(m.conversionNote),
        protocolMismatch: u(m.protocolMismatch),
        quote: u(m.quote),
        locator: u(m.locator),
        measuredAt: u(m.measuredAt),
        tier: m.tier === 'primary' ? undefined : m.tier,
        seeAlsoPlate: u(m.seeAlsoPlate),
      };
      if (rest?.restStatusExplicit) metric.restStatus = rest.status;
      return metric;
    });

  const sum = (st: AtlasState) => pick(`${layout.id}.summary.${st}`);
  const summaryVerified: Partial<Record<AtlasState, AtlasVerifiedSummary>> = {};
  for (const st of ['rest', 'sprint'] as AtlasState[]) {
    const v = byId.get(`${layout.id}.summaryVerified.${st}`);
    if (v) summaryVerified[st] = { text: v.textPl ?? '', referenceIds: v.referenceIds, source: v.checkedBy?.note ?? '' };
  }
  const note = byId.get(`${layout.id}.protocolNote`);
  const refs = (st: AtlasState) => sum(st).referenceIds;

  const content: AtlasPlateContent = {
    ...layout,
    labels,
    metrics,
    summary: { rest: sum('rest').textPl ?? '', sprint: sum('sprint').textPl ?? '' },
    summaryStatus: { rest: sum('rest').status, sprint: sum('sprint').status },
  };
  const sr: Partial<Record<AtlasState, string[]>> = {};
  if (refs('rest').length) sr.rest = refs('rest');
  if (refs('sprint').length) sr.sprint = refs('sprint');
  if (sr.rest || sr.sprint) content.summaryReferenceIds = sr;
  if (summaryVerified.rest || summaryVerified.sprint) content.summaryVerified = summaryVerified;
  if (note) {
    content.protocolNotePl = note.textPl;
    content.protocolNoteStatus = note.status;
  }
  // M3: teksty lekcji (każdy z własnym statusem; bramka w palette.ts: lessonText)
  const lesson = (f: AtlasFactRecord | undefined): AtlasLessonText | undefined =>
    f && f.textPl ? { text: f.textPl, status: f.status, derivedFrom: f.derivedFrom ?? [] } : undefined;
  const one = (kind: AtlasFactRecord['kind']) => facts.find((f) => f.kind === kind);
  const goal = lesson(one('lesson_goal'));
  if (goal) content.lessonGoal = goal;
  const question = lesson(one('question'));
  if (question) content.question = question;
  const moment = lesson(one('moment_label'));
  if (moment) content.momentLabel = moment;
  const short: Partial<Record<AtlasState, AtlasLessonText>> = {};
  for (const st of ['rest', 'sprint'] as AtlasState[]) {
    const t = lesson(byId.get(`${layout.id}.summaryShort.${st}`));
    if (t) short[st] = t;
  }
  if (short.rest || short.sprint) content.summaryShort = short;
  const cur = one('curriculum_ref');
  if (cur?.quote && cur.locator) content.curriculumRef = { scope: cur.scope ?? 'P', locator: cur.locator, quote: cur.quote, status: cur.status };
  return content;
}
