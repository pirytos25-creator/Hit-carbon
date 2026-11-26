/**
 * Walidator danych L1 (E1): src/atlas/data/structures.json, mesh_bindings.json, facts/*.json.
 *  1. Zgodność ze schematami (src/atlas/data/schema/*.schema.json; podzbiór JSON Schema: type, required, enum,
 *     const, pattern, items, properties, minItems) – bez zewnętrznych bibliotek.
 *  2. ID faktów unikalne; referenceIds istnieją; structureId istnieje; powiązania siatek: prefiks za:/hra:, bez NC.
 *  3. Migracja 1:1: każdy fakt z plansz (src/atlas/plates/*.ts) ma rekord o tej samej treści i statusie, a liczby
 *     faktów na ekranie (liczby, opisy ról, opisy budowy, podsumowania) są takie same jak w planszach.
 *  4. `textbook_consensus` na ekranie: każde źródło ma ISBN albo NBK (NCBI Bookshelf); brak lokalizatora = UWAGA.
 *  5. `anatomy` bez twierdzeń o zmianie (lista słów).
 * Uruchomienie: node scripts/atlas_check_data.mjs   (kod 0 = OK)
 */
import { build } from 'esbuild';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = process.env.ATLAS_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
// Pliki tekstowe czytamy z końcami linii LF: w checkoucie z core.autocrlf=true źródła mają CRLF, a reguły (regex) zakładają LF.
const readText = (p) => readFileSync(p, 'utf-8').replace(/\r\n/g, '\n');

const out = join(mkdtempSync(join(tmpdir(), 'atlas-data-')), 'bundle.mjs');
await build({
  stdin: {
    contents: `export { ATLAS_SYSTEMS } from './src/atlas/plates/index.ts';
export { SCIENTIFIC_REFERENCES } from './src/science/ScientificReferences.ts';
export { ATLAS_SHOWN_STATUSES } from './src/atlas/types.ts';`,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'silent',
});
const { ATLAS_SYSTEMS, SCIENTIFIC_REFERENCES, ATLAS_SHOWN_STATUSES } = await import(pathToFileURL(out).href);
const shown = (st) => ATLAS_SHOWN_STATUSES.includes(st ?? 'draft');
const CHECKED = new Set(['checked_agent', 'checked_human']);
const data = join(root, 'src/atlas/data');
const read = (p) => JSON.parse(readFileSync(p, 'utf-8'));

let errors = 0;
let warnings = 0;
const err = (m) => { errors++; console.log('BŁĄD  ' + m); };
const warn = (m) => { warnings++; console.log('UWAGA ' + m); };

// ---------------------------------------------------------------- 1. schematy (podzbiór JSON Schema)
function check(schema, v, path) {
  if (schema.const !== undefined && v !== schema.const) return err(`${path}: oczekiwano ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(v)) return err(`${path}: wartość ${JSON.stringify(v)} spoza ${JSON.stringify(schema.enum)}`);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const t = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
    if (!types.includes(t)) return err(`${path}: typ ${t}, oczekiwano ${types.join('|')}`);
  }
  if (typeof v === 'string' && schema.pattern && !new RegExp(schema.pattern).test(v)) err(`${path}: „${v}” nie pasuje do wzorca ${schema.pattern}`);
  if (Array.isArray(v)) {
    if (schema.minItems && v.length < schema.minItems) err(`${path}: za mało elementów`);
    if (schema.items) v.forEach((x, i) => check(schema.items, x, `${path}[${i}]`));
  }
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    for (const r of schema.required ?? []) if (!(r in v)) err(`${path}: brak pola „${r}”`);
    for (const [k, s] of Object.entries(schema.properties ?? {})) if (k in v) check(s, v[k], `${path}.${k}`);
  }
}
const S = (n) => read(join(data, 'schema', `${n}.schema.json`));
const structures = read(join(data, 'structures.json'));
const bindings = read(join(data, 'mesh_bindings.json'));
check(S('structures'), structures, 'structures.json');
check(S('mesh_bindings'), bindings, 'mesh_bindings.json');
const factFiles = readdirSync(join(data, 'facts')).filter((f) => f.endsWith('.json'));
const facts = [];
for (const f of factFiles) {
  const d = read(join(data, 'facts', f));
  check(S('facts'), d, `facts/${f}`);
  facts.push(...d.facts);
}

// ---------------------------------------------------------------- 2. spójność odwołań
const sIds = new Set(structures.structures.map((s) => s.id));
if (sIds.size !== structures.structures.length) err('structures.json: powtórzone ID pojęcia');
const fIds = new Set();
for (const f of facts) {
  if (fIds.has(f.id)) err(`fakt ${f.id}: powtórzone ID`);
  fIds.add(f.id);
  for (const r of f.referenceIds ?? []) if (!SCIENTIFIC_REFERENCES[r]) err(`fakt ${f.id}: brak źródła „${r}”`);
  if (f.structureId && !sIds.has(f.structureId)) err(`fakt ${f.id}: nieznane pojęcie ${f.structureId}`);
}
for (const b of bindings.bindings) {
  if (!sIds.has(b.structureId)) err(`powiązanie ${b.plate}/${b.anchor}: nieznane pojęcie ${b.structureId}`);
  if (b.resolved && !/^(za:[^/]+|hra:[^/]+\.glb\/.+)$/.test(b.meshId ?? '')) err(`powiązanie ${b.plate}/${b.anchor}: meshId „${b.meshId}” nie ma postaci za:<obiekt> albo hra:<plik.glb>/<węzeł>`);
  if (b.license && /NC/.test(b.license)) err(`powiązanie ${b.meshId}: licencja NC na planszy`);
}
const unresolved = bindings.bindings.filter((b) => !b.resolved).length;

// ---------------------------------------------------------------- 3. migracja 1:1 z planszami
const byId = new Map(facts.map((f) => [f.id, f]));
const slug = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const same = (id, field, expected) => {
  const f = byId.get(id);
  if (!f) return err(`brak rekordu ${id} (jest w planszy)`);
  if ((f[field] ?? null) !== (expected ?? null)) err(`${id}.${field}: w danych „${f[field]}”, w planszy „${expected}”`);
};
const planCount = { metrics: 0, roles: 0, anatomy: 0, summaries: 0 };
for (const sys of ATLAS_SYSTEMS) {
  const c = sys.content;
  if (!c) continue;
  for (const m of c.metrics) {
    const id = `${c.id}.metric.${slug(m.labelPl)}`;
    same(id, 'value', m.sprint);
    same(id, 'status', m.status ?? 'draft');
    same(id, 'quote', m.quote);
    same(`${id}.rest`, 'value', m.rest);
    same(`${id}.rest`, 'status', m.restStatus ?? m.status ?? 'draft');
    if (shown(m.status)) planCount.metrics++;
  }
  for (const l of c.labels) for (const state of ['rest', 'sprint']) {
    const id = `${c.id}.role.${l.anchor}.${state}`;
    const st = l.roleStatus?.[state] ?? 'draft';
    same(id, 'textPl', l.role[state]);
    same(id, 'status', st);
    if (CHECKED.has(st)) planCount.roles++;
    if (st === 'anatomy') planCount.anatomy++;
  }
  for (const state of ['rest', 'sprint']) {
    same(`${c.id}.summary.${state}`, 'textPl', c.summary[state]);
    same(`${c.id}.summary.${state}`, 'status', c.summaryStatus?.[state] ?? 'draft');
    if (shown(c.summaryStatus?.[state]) || c.summaryVerified?.[state]) planCount.summaries++;
  }
  if (c.protocolNotePl) same(`${c.id}.protocolNote`, 'status', c.protocolNoteStatus ?? 'draft');
}
const dataCount = {
  metrics: facts.filter((f) => f.kind === 'metric' && shown(f.status)).length,
  roles: facts.filter((f) => f.kind === 'role' && CHECKED.has(f.status)).length,
  anatomy: facts.filter((f) => f.kind === 'role' && f.status === 'anatomy').length,
  summaries: new Set(facts.filter((f) => (f.kind === 'summary' && shown(f.status)) || f.kind === 'summary_verified').map((f) => `${f.plate}.${f.state}`)).size,
};
for (const k of Object.keys(planCount)) if (planCount[k] !== dataCount[k]) err(`liczba „${k}” na ekranie: dane ${dataCount[k]}, plansze ${planCount[k]}`);

// ---------------------------------------------------------------- 3b. E1-K2: treść faktów tylko w facts/*.json
// Plik planszy trzyma sam układ. Pola faktów (opis roli, statusy, źródła, liczby, cytaty, podsumowania) są zakazane.
const FACT_FIELDS = /^\s*(role|roleStatus|referenceIds|evidence|conversionNote|summary|summaryStatus|summaryReferenceIds|summaryVerified|protocolNotePl|protocolNoteStatus|metrics|quote|locator|notePl|protocolMismatch|status|restStatus|lessonGoal|question|summaryShort|momentLabel|curriculumRef)\s*:/m;
for (const f of readdirSync(join(root, 'src/atlas/plates'))) {
  if (!f.endsWith('.ts') || f === 'index.ts') continue;
  const src = readText(join(root, 'src/atlas/plates', f));
  const m = src.match(FACT_FIELDS);
  if (m) err(`plates/${f}: pole faktu „${m[1]}” w pliku układu (treść faktów ma być tylko w src/atlas/data/facts/)`);
}
// każdy rekord roli ma swój podpis w układzie, a każda liczba swoją planszę
const layoutAnchors = new Set();
for (const sys of ATLAS_SYSTEMS) for (const l of sys.content?.labels ?? []) layoutAnchors.add(`${sys.id}.${l.anchor}`);
const plates = new Set(ATLAS_SYSTEMS.filter((s) => s.content).map((s) => s.id));
for (const f of facts) {
  if (f.kind === 'role' && !layoutAnchors.has(`${f.plate}.${f.anchor}`)) err(`fakt ${f.id}: brak podpisu „${f.anchor}” w układzie planszy ${f.plate}`);
  if (f.plate && !plates.has(f.plate)) err(`fakt ${f.id}: nieznana plansza ${f.plate}`);
}

// ---------------------------------------------------------------- 3c. spójność liczb między planszami
// Ta sama nazwa liczby na kilku planszach (na ekranie): ta sama wartość albo jawny odsyłacz (seeAlsoPlate).
// Grupa = pole `topic` (ta sama wielkość pod różnymi nazwami, np. adrenalina na nerwowym i hormonalnym), a bez niego
// nazwa liczby.
const shownMetricsByTopic = new Map();
for (const f of facts.filter((x) => x.kind === 'metric' && shown(x.status))) {
  const key = f.topic ?? `nazwa:${slug(f.labelPl)}`;
  if (!shownMetricsByTopic.has(key)) shownMetricsByTopic.set(key, []);
  shownMetricsByTopic.get(key).push(f);
}
let crossPairs = 0;
for (const list of shownMetricsByTopic.values()) {
  if (new Set(list.map((f) => f.plate)).size < 2) continue;
  crossPairs++;
  const values = new Set(list.map((f) => `${byId.get(`${f.id}.rest`)?.value} → ${f.value}`));
  const linked = list.some((f) => f.seeAlsoPlate && list.some((g) => g.plate === f.seeAlsoPlate));
  if (values.size > 1 && !linked) err(`liczba „${list[0].labelPl}” na planszach ${list.map((f) => f.plate).join(', ')}: różne wartości (${[...values].join(' | ')}) bez odsyłacza seeAlsoPlate`);
}

// ---------------------------------------------------------------- 4. textbook_consensus
const hasBookId = (r) => /NBK\d+|ISBN/i.test(`${r.journal} ${r.url ?? ''} ${r.title}`);
for (const f of facts) {
  if (f.provenance !== 'textbook_consensus' || !shown(f.status)) continue;
  for (const id of f.referenceIds) if (!hasBookId(SCIENTIFIC_REFERENCES[id] ?? {})) err(`fakt ${f.id}: textbook_consensus, a źródło ${id} bez ISBN/NBK`);
  if ('locator' in f && !f.locator) warn(`fakt ${f.id}: textbook_consensus bez lokalizatora (strona/sekcja)`);
}

// ---------------------------------------------------------------- 5. anatomy bez twierdzeń o zmianie
const CHANGE = /\b(więcej|mniej|rośnie|rosną|spada|spadają|szybciej|wolniej|większ\w*|mniejsz\w*|zwęża\w*|rozszerza\w*|przyspiesza\w*|zwalnia\w*)\b|[↑↓]/i;
for (const f of facts) if (f.status === 'anatomy' && CHANGE.test(f.textPl ?? '')) err(`fakt ${f.id}: status anatomy, a tekst mówi o zmianie („${f.textPl}”)`);

console.log(`Wielkości pokazane na kilku planszach (topic albo ta sama nazwa): ${crossPairs}`);
console.log(`Dane L1: ${structures.structures.length} pojęć, ${bindings.bindings.length} powiązań siatek (nierozwiązane: ${unresolved}), ${facts.length} rekordów faktów w ${factFiles.length} plikach`);
console.log(`Na ekranie (dane = plansze): liczby ${dataCount.metrics}, opisy ról ${dataCount.roles}, opisy budowy ${dataCount.anatomy}, podsumowania ${dataCount.summaries}`);
console.log(errors ? `WYNIK: dane ${errors} błędów, ${warnings} uwag` : `WYNIK: dane OK (${warnings} uwag)`);
process.exit(errors ? 1 : 0);
