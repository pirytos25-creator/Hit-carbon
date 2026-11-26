/**
 * Walidator faktów atlasu (model §3.6): na ekran trafia tylko to, co sprawdzone.
 *  - każda liczba pokazywana na ekranie (status checked_agent/checked_human) ma `quote`, `locator` i `referenceIds`,
 *    a każde ID istnieje w src/science/ScientificReferences.ts;
 *  - każdy pokazywany opis roli (roleStatus checked_*) i podsumowanie (summaryStatus checked_*) ma istniejące `referenceIds`;
 *  - wszystkie `referenceIds` na planszach (także przy faktach niepokazywanych) istnieją;
 *  - reguła 1b: podsumowanie draft/disputed/unverifiable nie trafia na ekran. UI bierze tekst tylko z `shownSummary`
 *    (AtlasApp.tsx nie może czytać `content.summary[...]` wprost); `summaryVerified` (zdania już potwierdzone) ma
 *    źródła i wskazuje istniejący raport w docs/atlas_audyt/, i wolno go użyć tylko przy niesprawdzonym `summary`.
 *  - M3 (U0, S2/K4): WSZYSTKIE pola tekstowe planszy przechodzą bramkę: podsumowania (shownSummary), zdanie o „sprincie”
 *    (shownProtocolNote), teksty lekcji – cel, pytanie, opis ≤ 3 zdania, nazwa momentu (lessonText), hasło podstawy
 *    programowej (shownCurriculum). Każdy tekst lekcji ma `derivedFrom` = istniejące fakty checked_*; opis ma ≤ 3 zdania,
 *    pytanie kończy się „?”, nazwa momentu mieści się na przycisku.
 *  - M3: zdania robocze („czeka na sprawdzenie” itp.) tylko w komponencie StatusNotes (AtlasApp.tsx), renderowanym wyłącznie
 *    pod `extended &&`; AtlasApp nie czyta pól protocolNotePl i tekstów lekcji z pominięciem bramek.
 * Wypisuje też listę faktów `draft` (dla agenta sprawdzającego). Kod 0 = OK.
 * Uruchomienie: npm run check:atlas  (albo: node scripts/atlas_check_facts.mjs [--drafts plik.md])
 */
import { build } from 'esbuild';
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = process.env.ATLAS_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
// Pliki tekstowe czytamy z końcami linii LF: w checkoucie z core.autocrlf=true źródła mają CRLF, a reguły (regex) zakładają LF.
const readText = (p) => readFileSync(p, 'utf-8').replace(/\r\n/g, '\n');

const out = join(mkdtempSync(join(tmpdir(), 'atlas-facts-')), 'bundle.mjs');
await build({
  stdin: {
    contents: `export { ATLAS_SYSTEMS } from './src/atlas/plates/index.ts';
export { SCIENTIFIC_REFERENCES } from './src/science/ScientificReferences.ts';
export { ATLAS_SHOWN_STATUSES } from './src/atlas/types.ts';
export { ATLAS_GLOSSARY } from './src/atlas/glossary.ts';`,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'silent',
});
const { ATLAS_SYSTEMS, SCIENTIFIC_REFERENCES, ATLAS_SHOWN_STATUSES, ATLAS_GLOSSARY } = await import(pathToFileURL(out).href);

const CHECKED = new Set(['checked_agent', 'checked_human']);
const STATUSES = new Set(['draft', 'checked_agent', 'disputed', 'unverifiable', 'checked_human', 'anatomy']);
const factIndex = new Map();
for (const f of readdirSync(join(root, 'src', 'atlas', 'data', 'facts')))
  for (const r of JSON.parse(readText(join(root, 'src', 'atlas', 'data', 'facts', f))).facts) factIndex.set(r.id, r);
// Zdania w tekście (kropka/!/? przed wielką literą albo końcem; bez skrótów „ok.”, „np.”, „m.”, „t.”, „ż.” itd.)
const sentences = (t) =>
  String(t ?? '')
    .replace(/\b(ok|np|tzw|itd|itp|wg|ang|łac|in|m|mm|t|tt|ż|żż)\./giu, '$1§')
    .split(/[.!?](?=\s+[\p{Lu}\d„]|\s*$)/u)
    .filter((x) => x.trim()).length;
let shownLesson = 0;
const paletteTs = readText(join(root, 'src', 'atlas', 'palette.ts'));
const shown = (st) => ATLAS_SHOWN_STATUSES.includes(st ?? 'draft');
let errors = 0;
const err = (m) => {
  errors++;
  console.log('BŁĄD  ' + m);
};
const refsOk = (ids, where) => {
  for (const id of ids ?? []) if (!SCIENTIFIC_REFERENCES[id]) err(`${where}: brak źródła „${id}” w ScientificReferences.ts`);
};
const drafts = [];
let shownMetrics = 0;
let shownRoles = 0;
let anatomyRoles = 0;
let shownSummaries = 0;
let shownRest = 0;
let shownNotes = 0;
const numWarn = [];
// Liczby z tekstu faktu (np. „ok. 1,6”, „7–8×”, „−50 / −32”): każda musi być w cytacie albo mieć conversionNote.
const numbersIn = (t) => (String(t ?? '').match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => x.replace(',', '.'));
// Liczba jest w cytacie, gdy ma tę samą wartość (4.9 = 4.90; 1,000 = 1000) albo stoi tam słowem (sixfold, double).
const NUM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, double: 2, twice: 2 };
const inQuote = (n, q) => {
  const qq = String(q ?? '').replace(/(\d),(\d{3})\b/g, '$1$2').replace(/(\d),(\d)/g, '$1.$2');
  const vals = (qq.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
  for (const m of qq.toLowerCase().matchAll(/\b(one|two|three|four|five|six|seven|eight|nine|ten|double|twice)(?:-?fold)?\b/g)) vals.push(NUM_WORDS[m[1]]);
  return vals.some((v) => Math.abs(v - Number(n)) < 1e-9);
};
// Wartość odniesienia spoczynku (1×, 0, 100%) nie wymaga cytatu.
const isBaseline = (t) => /^\s*(1×|0|100\s?%)\s*$/.test(String(t ?? ''));

for (const sys of ATLAS_SYSTEMS) {
  const c = sys.content;
  if (!c) continue;
  for (const m of c.metrics) {
    const where = `${c.id} / liczba „${m.labelPl}”`;
    refsOk(m.referenceIds, where);
    const st = m.status ?? 'draft';
    if (shown(st)) {
      shownMetrics++;
      if (!CHECKED.has(st)) err(`${where}: liczba na ekranie musi mieć status checked_agent (jest ${st})`);
      if (!m.quote) err(`${where}: brak dosłownego cytatu (quote)`);
      if (!m.locator) err(`${where}: brak lokalizatora (locator)`);
      if (!m.referenceIds?.length) err(`${where}: brak referenceIds`);
      // D1 (zgromadzenie): liczba z faktu jest w cytacie albo ma opis przeliczenia (conversionNote)
      if (!m.conversionNote) {
        const missing = [...numbersIn(m.sprint), ...(shown(m.restStatus ?? st) && !isBaseline(m.rest) ? numbersIn(m.rest) : [])].filter((n) => !inQuote(n, m.quote));
        if (missing.length) numWarn.push(`${where}: ${missing.join(', ')}`);
      }
      // D1: wartość spoczynkowa ma jawny status i jest liczona osobno
      if (m.rest && m.rest !== '—' && !m.restStatus) err(`${where}: brak restStatus (wartość spoczynkowa „${m.rest}”)`);
      if (shown(m.restStatus ?? st) && m.rest && m.rest !== '—') shownRest++;
    }

    if (st === 'draft') drafts.push({ plate: c.id, kind: 'liczba', key: m.labelPl, value: `${m.rest} → ${m.sprint}${m.unit ? ' ' + m.unit : ''}`, refs: m.referenceIds, locator: m.locator, quote: m.quote, note: m.notePl });
  }
  for (const l of c.labels) {
    const where = `${c.id} / podpis „${l.anchor}”`;
    refsOk(l.referenceIds, where);
    for (const state of ['rest', 'sprint']) {
      const st = l.roleStatus?.[state] ?? 'draft';
      if (st === 'anatomy') anatomyRoles++;
      if (CHECKED.has(st)) {
        shownRoles++;
        if (!l.referenceIds?.length) err(`${where} (${state}): opis na ekranie bez referenceIds`);
      }
      if (st === 'draft') drafts.push({ plate: c.id, kind: `opis podpisu (${state === 'rest' ? 'spoczynek' : 'sprint'})`, key: `${l.anchor} (${l.namePl})`, value: l.role[state], refs: l.referenceIds });
    }
  }
  if (c.protocolNotePl) {
    const st = c.protocolNoteStatus ?? 'draft';
    if (!c.protocolNoteStatus) err(`${c.id} / zdanie o „sprincie” (protocolNotePl): brak protocolNoteStatus`);
    if (shown(st)) shownNotes++;
    if (st === 'draft') drafts.push({ plate: c.id, kind: 'zdanie o „sprincie” (protocolNotePl)', key: 'protocolNotePl', value: c.protocolNotePl });
  }
  // M3: teksty lekcji (cel, pytanie, opis ≤ 3 zdania, nazwa momentu) – każdy z własnym statusem i źródłem przeformułowania
  const lessonFields = [
    ['lessonGoal', 'cel lekcji', c.lessonGoal],
    ['question', 'pytanie planszy', c.question],
    ['momentLabel', 'nazwa momentu (przycisk)', c.momentLabel],
    ['summaryShort.rest', 'opis ≤ 3 zdania (spoczynek)', c.summaryShort?.rest],
    ['summaryShort.sprint', 'opis ≤ 3 zdania (sprint)', c.summaryShort?.sprint],
  ];
  for (const [key, kind, t] of lessonFields) {
    if (!t) continue;
    const where = `${c.id} / ${kind}`;
    if (!STATUSES.has(t.status)) err(`${where}: nieznany status „${t.status}”`);
    if (!t.text?.trim()) err(`${where}: pusty tekst`);
    if (!t.derivedFrom?.length) err(`${where}: brak derivedFrom (z jakich sprawdzonych faktów powstał tekst)`);
    // Źródłem może być też definicja wzorcowa atlasu DEFAULT_PROTOCOL_NOTE (palette.ts). Niesprawdzony fakt wolno wskazać
    // tylko jako notę protokołu planszy (definicja momentu, np. nazwa momentu hormonalny), obok źródła sprawdzonego.
    let checkedSrc = 0;
    for (const id of t.derivedFrom ?? []) {
      if (id === 'DEFAULT_PROTOCOL_NOTE') {
        if (!/export const DEFAULT_PROTOCOL_NOTE\b/.test(paletteTs)) err(`${where}: brak DEFAULT_PROTOCOL_NOTE w palette.ts`);
        checkedSrc++;
        continue;
      }
      const f = factIndex.get(id);
      if (!f) err(`${where}: derivedFrom wskazuje nieistniejący fakt ${id}`);
      else if (CHECKED.has(f.status)) checkedSrc++;
      else if (f.kind !== 'protocol_note') err(`${where}: derivedFrom wskazuje fakt ${id} bez statusu checked (${f.status}); nowy tekst wolno tylko przeformułować ze sprawdzonego`);
    }
    if (t.derivedFrom?.length && !checkedSrc) err(`${where}: derivedFrom bez żadnego sprawdzonego źródła`);
    if (key.startsWith('summaryShort') && sentences(t.text) > 3) err(`${where}: ${sentences(t.text)} zdań (najwyżej 3)`);
    if (key === 'question' && !t.text.trim().endsWith('?')) err(`${where}: pytanie musi kończyć się „?”`);
    if (key === 'momentLabel' && t.text.length > 24) err(`${where}: za długi napis przycisku (${t.text.length} > 24 znaki)`);
    if (shown(t.status)) shownLesson++;
    if (t.status === 'draft')
      drafts.push({
        plate: c.id,
        kind,
        key,
        value: t.text,
        from: (t.derivedFrom ?? []).map((id) => `${id}: ${factIndex.get(id)?.textPl ?? factIndex.get(id)?.value ?? '?'}`),
      });
  }
  if (c.curriculumRef) {
    const cr = c.curriculumRef;
    const where = `${c.id} / podstawa programowa`;
    if (!cr.quote || !cr.locator) err(`${where}: hasło bez dosłownego cytatu albo numeru`);
    if (!STATUSES.has(cr.status)) err(`${where}: nieznany status „${cr.status}”`);
    if (shown(cr.status)) shownLesson++;
    if (cr.status === 'draft') drafts.push({ plate: c.id, kind: 'hasło podstawy programowej', key: `${cr.scope} ${cr.locator}`, value: cr.quote, note: 'cytat z podstawy programowej (zpe.gov.pl, 2025/2026)' });
  }
  if (c.heroMetricId && !c.metrics.some((m) => m.id === c.heroMetricId)) err(`${c.id}: heroMetricId „${c.heroMetricId}” nie wskazuje liczby tej planszy`);
  // M6: „Sprawdź się” – pytanie, odpowiedź zgodna z rodzajem, źródła sprawdzone
  const anchorsOf = new Set(c.labels.map((l) => l.anchor));
  if (c.quiz) {
    const q = c.quiz;
    const where = `${c.id} / „Sprawdź się”`;
    if (!STATUSES.has(q.status)) err(`${where}: nieznany status „${q.status}”`);
    if (!q.question?.trim() || !q.explain?.trim()) err(`${where}: brak pytania albo wyjaśnienia`);
    if (q.type === 'updown' && !['up', 'down', 'same'].includes(q.answer)) err(`${where}: odpowiedź „${q.answer}” (dozwolone up, down, same)`);
    if (q.type === 'point' && !anchorsOf.has(q.answer)) err(`${where}: odpowiedź „${q.answer}” nie jest kotwicą planszy`);
    if (q.type === 'updown' && !q.question.trim().endsWith('?')) err(`${where}: pytanie musi kończyć się „?”`);
    if (!q.derivedFrom?.length) err(`${where}: brak derivedFrom`);
    for (const id of q.derivedFrom ?? []) {
      const f = factIndex.get(id);
      if (!f) err(`${where}: derivedFrom wskazuje nieistniejący fakt ${id}`);
      else if (!CHECKED.has(f.status)) err(`${where}: derivedFrom wskazuje fakt ${id} bez statusu checked (${f.status})`);
    }
    if (shown(q.status)) shownLesson++;
    if (q.status === 'draft') {
      const ans = q.type === 'updown' ? { up: '↑ rośnie', down: '↓ maleje', same: '= bez zmian' }[q.answer] : `wskaż: ${q.answer}`;
      drafts.push({
        plate: c.id,
        kind: 'Sprawdź się (pytanie, odpowiedź, wyjaśnienie)',
        key: 'quiz',
        value: `PYTANIE: ${q.question} ODPOWIEDŹ: ${ans}. WYJAŚNIENIE: ${q.explain}`,
        from: (q.derivedFrom ?? []).map((id) => `${id}: ${factIndex.get(id)?.textPl ?? `${factIndex.get(`${id}.rest`)?.value ?? '?'} → ${factIndex.get(id)?.value ?? '?'} ${factIndex.get(id)?.unit ?? ''} (w badaniu: ${factIndex.get(id)?.protocolMismatch ?? '—'}; moment: ${factIndex.get(id)?.measuredAt ?? '—'}; notatka: ${factIndex.get(id)?.notePl ?? '—'})`}`),
      });
    }
  }
  // M6: „Co się zmieniło” – powiązania liczba → struktury
  for (const l of c.changeLinks ?? []) {
    const m = c.metrics.find((x) => x.id === l.metric);
    if (!m) err(`${c.id} / changeLinks: liczba ${l.metric} nie istnieje na planszy`);
    for (const a of l.anchors) if (!anchorsOf.has(a)) err(`${c.id} / changeLinks: kotwica ${a} nie istnieje`);
  }
  for (const a of c.changeIllustration ?? []) if (!anchorsOf.has(a)) err(`${c.id} / changeIllustration: kotwica ${a} nie istnieje`);
  // M6: wyróżnik (KONTRAKT_WYROZNIKA.md §5)
  if (c.signature) {
    const sg = c.signature;
    const where = `${c.id} / wyróżnik ${sg.id}`;
    const SIG_IDS = ['OBSZAR', 'IMPULS', 'NADAWCA_ODBIORCA', 'PRACA', 'KONSTRUKCJA', 'OBJETOSC', 'ROZDZIAL', 'MAGAZYN', 'CIEPLO', 'FILTR', 'PATROL', 'DLUGI_CZAS'];
    if (!SIG_IDS.includes(sg.id)) err(`${where}: id spoza karty Reżysera §3.3`);
    if (!['metric', 'order', 'illustration'].includes(sg.variable?.kind)) err(`${where}: variable.kind`);
    if (sg.variable?.kind === 'metric') {
      if (!sg.variable.factIds?.length) err(`${where}: variable.factIds puste (wielkość ruchu tylko z faktów)`);
      for (const id of sg.variable.factIds ?? []) {
        const f = factIndex.get(id);
        if (!f || f.plate !== c.id || !CHECKED.has(f.status)) err(`${where}: variable.factIds: ${id} nie jest sprawdzonym faktem tej planszy`);
      }
    }
    if (sg.variable?.kind === 'illustration' && !sg.chips.includes('ilustracja')) err(`${where}: zmienna poglądowa bez chipu „ilustracja”`);
    for (const a of sg.anchors) if (!anchorsOf.has(a)) err(`${where}: kotwica ${a} nie istnieje`);
    if (!sg.legend?.length) err(`${where}: pusta legenda „Jak czytać”`);
    for (const t of [sg.namePl, sg.variable?.labelPl, ...sg.legend.map((x) => x.labelPl)]) if (/\d/.test(t ?? '')) err(`${where}: tekst wyróżnika z cyfrą („${t}”); liczby tylko z metryki`);
    const f3 = join(root, 'public', 'atlas', c.id, 'flows3d.json');
    const flowIds = existsSync(f3) ? new Set(JSON.parse(readText(f3)).flows.map((x) => x.id)) : new Set();
    for (const id of sg.flows) if (!flowIds.has(id)) err(`${where}: tor ${id} nie istnieje w flows3d.json`);
  }
  for (const state of ['rest', 'sprint']) {
    refsOk(c.summaryReferenceIds?.[state], `${c.id} / podsumowanie ${state}`);
    const st = c.summaryStatus?.[state] ?? 'draft';
    if (CHECKED.has(st) && !c.summaryReferenceIds?.[state]?.length) err(`${c.id} / podsumowanie ${state}: status checked bez referenceIds`);
    if (st === 'draft') drafts.push({ plate: c.id, kind: `podsumowanie (${state === 'rest' ? 'spoczynek' : 'sprint'})`, key: 'summary', value: c.summary[state], refs: c.summaryReferenceIds?.[state] });
    const ver = c.summaryVerified?.[state];
    if (shown(st)) {
      shownSummaries++;
      if (ver) err(`${c.id} / podsumowanie ${state}: summaryVerified przy sprawdzonym podsumowaniu (usuń)`);
    } else if (ver) {
      shownSummaries++;
      const where = `${c.id} / podsumowanie ${state} (summaryVerified)`;
      if (!ver.text?.trim()) err(`${where}: pusty tekst`);
      if (!ver.referenceIds?.length) err(`${where}: brak referenceIds`);
      refsOk(ver.referenceIds, where);
      const file = (ver.source ?? '').split(',')[0].trim();
      if (!file || !existsSync(join(root, 'docs', 'atlas_audyt', file))) err(`${where}: source musi wskazywać raport w docs/atlas_audyt/ (jest „${ver.source ?? ''}”)`);
    }
  }
}

// Słowniczek wspólny (np. definicja VO₂max): ta sama bramka
for (const g of ATLAS_GLOSSARY) {
  refsOk(g.referenceIds, `słowniczek „${g.id}”`);
  if (shown(g.status)) {
    shownNotes++;
    if (!g.referenceIds?.length) err(`słowniczek „${g.id}”: pokazywany bez referenceIds`);
  }
  if (g.status === 'draft') drafts.push({ plate: '(wspólne)', kind: 'słowniczek', key: g.id, value: g.textPl, refs: g.referenceIds });
}
if (numWarn.length) {
  console.log(`UWAGA (D1): liczba z faktu nie występuje w cytacie i fakt nie ma conversionNote (${numWarn.length}); do niezależnej kontroli:`);
  for (const w of numWarn) console.log('  - ' + w);
}

// UI: tekst podsumowania tylko przez shownSummary (reguła 1b).
const app = readText(join(root, 'src', 'atlas', 'AtlasApp.tsx'));
if (/content\.summary\s*\[/.test(app)) err('AtlasApp.tsx czyta content.summary[...] wprost; podsumowanie tylko przez shownSummary()');
if (!/shownSummary\(/.test(app)) err('AtlasApp.tsx nie używa shownSummary(); podsumowanie draft mogłoby trafić na ekran');
// M3 (S2/K4): zdania robocze dla autora tylko w StatusNotes; StatusNotes tylko w poziomie Rozszerzonym
const noComments = (t) => t.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const WORK = /czeka|czekaj|niesprawdz|sprawdzenie źródła/i;
const statusBlock = (app.match(/\nfunction StatusNotes\([\s\S]*?\n\}\n/) ?? [''])[0];
if (!statusBlock) err('AtlasApp.tsx: brak komponentu StatusNotes (jedyne miejsce statusów sprawdzania)');
const appOutside = noComments(app.replace(statusBlock, ''));
for (const [name, src] of [['AtlasApp.tsx (poza StatusNotes)', appOutside], ['AtlasPlate.tsx', noComments(readText(join(root, 'src', 'atlas', 'AtlasPlate.tsx')))]]) {
  const m = src.match(new RegExp(`[^\\n]*(${WORK.source})[^\\n]*`, 'i'));
  if (m) err(`${name}: zdanie robocze dla autora poza StatusNotes: „${m[0].trim().slice(0, 90)}”`);
}
for (const m of app.matchAll(/<StatusNotes\b/g))
  if (!/extended\s*&&\s*$/.test(app.slice(Math.max(0, m.index - 40), m.index))) err('AtlasApp.tsx: <StatusNotes> renderowany poza `extended &&` (statusy tylko w poziomie Rozszerzonym)');
// Bramki pól tekstowych: protocolNotePl tylko przez shownProtocolNote, teksty lekcji tylko przez lessonText/shownCurriculum
if (/protocolNotePl/.test(appOutside)) err('AtlasApp.tsx czyta protocolNotePl wprost; tylko przez shownProtocolNote()');
for (const m of appOutside.matchAll(/content\.(lessonGoal|question|momentLabel|summaryShort|curriculumRef|quiz)\b/g))
  if (!/lessonText\($/.test(appOutside.slice(Math.max(0, m.index - 11), m.index))) err(`AtlasApp.tsx czyta content.${m[1]} z pominięciem bramki lessonText()/shownCurriculum()`);
if (!/shownProtocolNote\(/.test(app)) err('AtlasApp.tsx nie używa shownProtocolNote()');
if (/<QuizBox\b/.test(app) && !/shownQuiz\(content\)/.test(app)) err('AtlasApp.tsx: „Sprawdź się” bez bramki shownQuiz()');

const i = process.argv.indexOf('--drafts');
if (i > 0) {
  const lines = ['| plansza | rodzaj | klucz | nowa treść | przeformułowane z (sprawdzone fakty) | źródła | lokalizator | cytat |', '|---|---|---|---|---|---|---|---|'];
  const esc = (t) => String(t ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
  for (const d of drafts) lines.push(`| ${d.plate} | ${d.kind} | ${esc(d.key)} | ${esc(d.value)}${d.note ? ` (notatka: ${esc(d.note)})` : ''} | ${esc((d.from ?? []).join(' ◆ '))} | ${esc((d.refs ?? []).join(', '))} | ${esc(d.locator)} | ${esc(d.quote)} |`);
  writeFileSync(process.argv[i + 1], lines.join('\n') + '\n', 'utf-8');
}
console.log(`Liczby na ekranie: ${shownMetrics} (w tym wartości spoczynkowe: ${shownRest}), opisy ról na ekranie: ${shownRoles} (+ opisy budowy: ${anatomyRoles}), podsumowania na ekranie: ${shownSummaries}, zdania o „sprincie” i słowniczek na ekranie: ${shownNotes}, teksty lekcji na ekranie: ${shownLesson}, fakty draft (czekają na sprawdzenie): ${drafts.length}`);
console.log(errors ? `WYNIK: ${errors} błędów` : 'WYNIK: fakty OK');
process.exit(errors ? 1 : 0);
