/**
 * Walidator faktów atlasu (model §3.6): na ekran trafia tylko to, co sprawdzone.
 *  - każda liczba pokazywana na ekranie (status checked_agent/checked_human) ma `quote`, `locator` i `referenceIds`,
 *    a każde ID istnieje w src/science/ScientificReferences.ts;
 *  - każdy pokazywany opis roli (roleStatus checked_*) i podsumowanie (summaryStatus checked_*) ma istniejące `referenceIds`;
 *  - wszystkie `referenceIds` na planszach (także przy faktach niepokazywanych) istnieją;
 *  - reguła 1b: podsumowanie draft/disputed/unverifiable nie trafia na ekran. UI bierze tekst tylko z `shownSummary`
 *    (AtlasApp.tsx nie może czytać `content.summary[...]` wprost); `summaryVerified` (zdania już potwierdzone) ma
 *    źródła i wskazuje istniejący raport w docs/atlas_audyt/, i wolno go użyć tylko przy niesprawdzonym `summary`.
 * Wypisuje też listę faktów `draft` (dla agenta sprawdzającego). Kod 0 = OK.
 * Uruchomienie: npm run check:atlas  (albo: node scripts/atlas_check_facts.mjs [--drafts plik.md])
 */
import { build } from 'esbuild';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
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
const inQuote = (n, q) => {
  const qq = String(q ?? '').replace(/(\d),(\d{3})/g, '$1$2').replace(/(\d),(\d)/g, '$1.$2');
  return new RegExp(`(^|[^\d.])${n.replace('.', '\.')}([^\d]|$)`).test(qq);
};

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
        const missing = [...numbersIn(m.sprint), ...(shown(m.restStatus ?? st) ? numbersIn(m.rest) : [])].filter((n) => !inQuote(n, m.quote));
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
const app = readFileSync(join(root, 'src', 'atlas', 'AtlasApp.tsx'), 'utf-8');
if (/content\.summary\s*\[/.test(app)) err('AtlasApp.tsx czyta content.summary[...] wprost; podsumowanie tylko przez shownSummary()');
if (!/shownSummary\(/.test(app)) err('AtlasApp.tsx nie używa shownSummary(); podsumowanie draft mogłoby trafić na ekran');

const i = process.argv.indexOf('--drafts');
if (i > 0) {
  const lines = ['| plansza | rodzaj | klucz | nowa treść | źródła | lokalizator | cytat |', '|---|---|---|---|---|---|---|'];
  const esc = (t) => String(t ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
  for (const d of drafts) lines.push(`| ${d.plate} | ${d.kind} | ${esc(d.key)} | ${esc(d.value)}${d.note ? ` (notatka: ${esc(d.note)})` : ''} | ${esc((d.refs ?? []).join(', '))} | ${esc(d.locator)} | ${esc(d.quote)} |`);
  writeFileSync(process.argv[i + 1], lines.join('\n') + '\n', 'utf-8');
}
console.log(`Liczby na ekranie: ${shownMetrics} (w tym wartości spoczynkowe: ${shownRest}), opisy ról na ekranie: ${shownRoles} (+ opisy budowy: ${anatomyRoles}), podsumowania na ekranie: ${shownSummaries}, zdania o „sprincie” i słowniczek na ekranie: ${shownNotes}, fakty draft (czekają na sprawdzenie): ${drafts.length}`);
console.log(errors ? `WYNIK: ${errors} błędów` : 'WYNIK: fakty OK');
process.exit(errors ? 1 : 0);
