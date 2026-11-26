/**
 * Test reguły „Co się zmieniło” (src/atlas/change.ts), część npm run check:atlas:
 *  - krotność z wartości na ekranie (przykłady), zmiana procentowa, spoczynek opisowy („cisza; …”) = nieokreślona;
 *  - na każdej planszy: najwyżej MAX_PER_VIEW struktur na widok, kotwice istnieją, liczby bazowe mają krotność;
 *  - wypisuje wybór dla każdej planszy (do przeglądu).
 */
import { build } from 'esbuild';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = process.env.ATLAS_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(mkdtempSync(join(tmpdir(), 'atlas-change-')), 'bundle.mjs');
await build({
  stdin: {
    contents: "export { ATLAS_SYSTEMS } from './src/atlas/plates/index.ts'; export { computeChange, foldOf, MAX_PER_VIEW } from './src/atlas/change.ts';",
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'silent',
});
const { ATLAS_SYSTEMS, computeChange, foldOf, MAX_PER_VIEW } = await import(pathToFileURL(out).href);

let errors = 0;
const err = (m) => {
  errors++;
  console.log('BŁĄD  ' + m);
};
const ok = { status: 'checked_agent', restStatus: 'checked_agent', referenceIds: [], evidenceLevel: 'established_human', labelPl: 'test' };
const near = (a, b) => a !== null && Math.abs(a - b) < 1e-6;
const cases = [
  [{ ...ok, rest: 'ok. 5', sprint: 'ok. 20–25' }, 4.5, '5 → 20–25'],
  [{ ...ok, rest: '100%', sprint: 'ok. −30% (do −50%)' }, 100 / 70, '100% → −30%'],
  [{ ...ok, rest: 'cisza; ok. 8–9 przy włączeniu', sprint: 'ok. 30 (skurcz balistyczny: 60–120)' }, null, 'spoczynek „cisza; …”'],
  [{ ...ok, rest: 'brak', sprint: 'ok. 2' }, null, 'spoczynek „brak”'],
  [{ ...ok, rest: '0', sprint: 'ok. 5' }, null, 'spoczynek 0 bez zmiany procentowej'],
  [{ ...ok, rest: 'ok. 1', sprint: 'ok. 10', tier: 'student' }, null, 'liczba tylko z Rozszerzonego'],
  [{ ...ok, restStatus: 'unverifiable', rest: 'ok. 6', sprint: 'ok. 97' }, null, 'spoczynek niesprawdzony'],
];
for (const [m, want, name] of cases) {
  const got = foldOf(m);
  if (want === null ? got !== null : !near(got, want)) err(`foldOf ${name}: ${got} (oczekiwano ${want})`);
}

for (const sys of ATLAS_SYSTEMS) {
  const c = sys.content;
  if (!c) continue;
  const ch = computeChange(c);
  if (!ch) {
    console.log(`${c.id.padEnd(12)} -`);
    continue;
  }
  const viewOf = new Map(c.labels.map((l) => [l.anchor, l.view]));
  const per = {};
  for (const a of ch.anchors) {
    if (!viewOf.has(a)) err(`${c.id}: kotwica ${a} nie istnieje`);
    per[viewOf.get(a)] = (per[viewOf.get(a)] ?? 0) + 1;
  }
  for (const [v, n] of Object.entries(per)) if (n > MAX_PER_VIEW) err(`${c.id}/${v}: ${n} struktur (najwyżej ${MAX_PER_VIEW})`);
  for (const m of ch.basis) if (foldOf(m) === null) err(`${c.id}: liczba bazowa ${m.id} bez krotności`);
  const basis = ch.basis.map((m) => `${m.id.split('.').pop()} ×${foldOf(m).toFixed(2)}`).join(', ');
  console.log(`${c.id.padEnd(12)} ${ch.illustration ? 'ilustracja: ' : ''}${Object.entries(per).map(([v, n]) => `${v} ${n}`).join(', ')} | ${ch.anchors.join(', ')}${basis ? ` | ${basis}` : ''}`);
}
console.log(errors ? `WYNIK: test „Co się zmieniło” ${errors} błędów` : 'WYNIK: test „Co się zmieniło” OK');
process.exit(errors ? 1 : 0);
