/**
 * Licencje cytatów w danych produktu (decyzja użytkownika (l): użytek komercyjny w szkołach; Dyrygent 2026-11-26).
 * Źródła z licencją NC/ND albo z zastrzeżonymi prawami (sourceLicense w ScientificReferences.ts: StatPearls
 * CC BY-NC-ND 4.0, Clinical Methods „all rights reserved”) NIE mają dosłownego cytatu w src/**. Dosłowny cytat
 * dowodowy zostaje tylko w dokumentacji kontroli poza repozytorium produktu (side-session-notes/…/dyrygent/E1K3_*.md).
 *  - fakt tylko ze źródeł zastrzeżonych: quote = null, quoteNote mówi, gdzie jest cytat dowodowy;
 *  - fakt mieszany: zostają części cytatu z otwartych źródeł (części „ + ” w tej samej kolejności co w locator),
 *    quoteSource = źródła, z których pochodzi pozostały cytat.
 * Idempotentny. Uruchomienie: node scripts/atlas_quote_licenses.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const refsTs = readFileSync(join(root, 'src/science/ScientificReferences.ts'), 'utf-8').replace(/\r\n/g, '\n');
const LIC = new Map();
for (const m of refsTs.matchAll(/^ {2}(\w+): \{\n([\s\S]*?)\n {2}\},/gm)) LIC.set(m[1], m[2].match(/sourceLicense: '([^']+)'/)?.[1] ?? null);
export const isRestricted = (lic) => !!lic && /NC|ND|reserved/i.test(lic);
const restricted = (id) => isRestricted(LIC.get(id));

const files = [
  ...readdirSync(join(root, 'src/atlas/data/facts')).map((f) => join(root, 'src/atlas/data/facts', f)),
  ...readdirSync(join(root, 'src/atlas/data/organs')).map((f) => join(root, 'src/atlas/data/organs', f)),
];
let emptied = 0;
let trimmed = 0;
let sourced = 0;
const problems = [];
for (const file of files) {
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  let changed = false;
  for (const f of data.facts) {
    if (!f.quote) continue;
    const refs = f.quoteSource ?? f.referenceIds ?? [];
    const bad = refs.filter(restricted);
    if (!bad.length) continue;
    const open = refs.filter((r) => !restricted(r));
    const report = /serce/.test(f.id) ? 'E1K3_serce_wyszukane.md' : /^(mozg|miesniowy|nerwowy|oddechowy|powlokowy)\.role\./.test(f.id) ? 'E1K3_podpisy_wyszukane.md' : 'raport kontroli faktu';
    if (!open.length) {
      f.quote = null;
      f.quoteNote = `Cytat dowodowy poza repozytorium produktu (licencja źródła: ${bad.map((r) => LIC.get(r)).join(', ')}): side-session-notes/dyrygent/${report}`;
      emptied++;
      changed = true;
      continue;
    }
    const qParts = f.quote.split(' + ');
    const lParts = (f.locator ?? '').split(' + ');
    if (qParts.length > 1 && qParts.length === lParts.length) {
      const keep = qParts.filter((_, i) => !/StatPearls|NBK\d+|Clinical Methods/.test(lParts[i]));
      if (!keep.length) {
        problems.push(`${f.id}: wszystkie części cytatu ze źródeł zastrzeżonych, choć jest źródło otwarte`);
        continue;
      }
      f.quote = keep.join(' + ');
      f.quoteSource = open;
      f.quoteNote = `Pominięto część cytatu ze źródła ${bad.map((r) => LIC.get(r)).join(', ')}; cytat dowodowy: side-session-notes/dyrygent/${report}`;
      trimmed++;
      changed = true;
      continue;
    }
    // cytat w jednym kawałku: z którego źródła? lokalizator „Brooks 1988, abstrakt” -> brooks_1988
    const who = (f.locator ?? '').toLowerCase().match(/^([a-ząćęłńóśźż]+)[^0-9]*(\d{4})/);
    const src = who ? open.find((r) => r.startsWith(who[1]) && r.includes(who[2])) : null;
    if (!src) {
      problems.push(`${f.id}: nie wiadomo, z którego źródła jest cytat (locator „${f.locator}”)`);
      continue;
    }
    f.quoteSource = [src];
    sourced++;
    changed = true;
  }
  if (changed) writeFileSync(file, (JSON.stringify(data, null, 1) + '\n').replace(/\n/g, raw.includes('\r\n') ? '\r\n' : '\n'));
}
console.log(`cytaty ze źródeł zastrzeżonych: usunięte ${emptied}, przycięte do źródła otwartego ${trimmed}, przypisane do źródła otwartego ${sourced}`);
if (problems.length) {
  for (const p of problems) console.log('PROBLEM ' + p);
  process.exit(1);
}
