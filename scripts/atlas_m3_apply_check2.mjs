/**
 * M3 (jednorazowo): runda 2 kontroli (side-session-notes/…/dyrygent/M3_kontrola_runda2.md, 2026-11-26).
 *  - 19 wierszy OK -> checked_agent, checkedBy = M3_kontrola.md (wiersz rundy 1) + M3_kontrola_runda2.md (wiersz rundy 2);
 *  - #3 mózg summaryShort.sprint i #11 powłokowy protocolNotePl -> brzmienie DOSŁOWNIE z rundy 2, checked_agent
 *    (trzecia kontrola Dyrygenta, dopisek na końcu M3_kontrola_runda2.md);
 *  - nota pokarmowa: „Sprint w atlasie” -> „Sprint na tej planszy” (zmiana redakcyjna zatwierdzona przez Dyrygenta).
 * Numer wiersza = kolejność w integrator/M3/drafts_M3_runda2.md.
 * Uruchomienie: node scripts/atlas_m3_apply_check2.mjs <ścieżka drafts_M3_runda2.md>
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/atlas/data/facts');
const R1 = 'side-session-notes/dyrygent/M3_kontrola.md';
const R2 = 'side-session-notes/dyrygent/M3_kontrola_runda2.md';
const draftsPath = process.argv[2];
if (!draftsPath) throw new Error('podaj ścieżkę drafts_M3_runda2.md');

const FIX = {
  3: 'W ciężkim wysiłku mózg pobiera i spala więcej mleczanu z krwi, a pobiera mniej glukozy (w badaniach: wysiłek ciągły ok. 75% VO₂max; mleczan mierzono, gdy dodatkowo wlewano go do krwi, a glukozę porównano z lekkim wysiłkiem przy 30% VO₂max).',
  11: 'Na samym starcie wysiłku naczynia skóry się zwężają, a chłodzenie przez skórę (rozszerzone naczynia, więcej potu) rozkręca się dopiero, gdy rośnie temperatura wewnętrzna. Dlatego „Sprint” na tej planszy to koniec treningu 6 × (45 s pracy / 45 s przerwy), a nie pojedyncze 45 s. Liczby z badań o innych protokołach, zwykle dłuższego wysiłku ciągłego, mają dopisek „W badaniu: …”.',
};

const PLATE = { 'mięśniowy': 'miesniowy', 'mózg': 'mozg', oddechowy: 'oddechowy', 'krwionośny': 'krwionosny', hormonalny: 'hormonalny', 'powłokowy': 'powlokowy', pokarmowy: 'pokarmowy', wydalniczy: 'wydalniczy', kostny: 'kostny' };
const rows = readFileSync(draftsPath, 'utf-8').split(/\r?\n/).filter((l) => l.startsWith('| ') && !l.startsWith('| plansza'));
if (rows.length !== 21) throw new Error(`lista ma ${rows.length} wierszy, oczekiwano 21`);

const files = {};
for (const f of readdirSync(dir)) files[f] = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
const byId = new Map();
for (const data of Object.values(files)) for (const r of data.facts) byId.set(r.id, r);

rows.forEach((row, i) => {
  const n = i + 1;
  const [plateRaw, , key] = row.split('|').slice(1, 4).map((x) => x.trim());
  const p = PLATE[plateRaw] ?? plateRaw;
  const id = key === 'protocolNotePl' ? `${p}.protocolNote` : `${p}.${key}`;
  const r = byId.get(id);
  if (!r) throw new Error(`#${n}: brak rekordu ${id}`);
  if (r.status !== 'draft') throw new Error(`#${n}: ${id} nie jest draft (${r.status})`);
  const r1 = r.checkedBy?.rows?.[0] ?? '?';
  if (FIX[n]) {
    r.textPl = FIX[n];
    r.checkedBy = { report: `${R1}; ${R2}`, rows: [r1, `runda 2 #${n}`], note: `M3_kontrola_runda2.md #${n}: POPRAWKA (brzmienie rundy 2) + trzecia kontrola Dyrygenta: OK (2026-11-26)` };
  } else {
    r.checkedBy = { report: `${R1}; ${R2}`, rows: [r1, `runda 2 #${n}`], note: `M3_kontrola.md ${r1}: brzmienie sprawdzającego; M3_kontrola_runda2.md #${n}: OK (drugi niezależny agent, 2026-11-26)` };
  }
  r.status = 'checked_agent';
});

const note = byId.get('pokarmowy.protocolNote');
if (!note.textPl.startsWith('Sprint w atlasie to')) throw new Error('nota pokarmowa: nieoczekiwany początek');
note.textPl = note.textPl.replace('Sprint w atlasie to', 'Sprint na tej planszy to');

for (const [f, data] of Object.entries(files)) {
  const raw = readFileSync(join(dir, f), 'utf-8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  writeFileSync(join(dir, f), (JSON.stringify(data, null, 1) + '\n').replace(/\n/g, eol));
}
console.log('M3 runda 2: 21 × checked_agent (w tym 2 brzmienia z rundy 2), nota pokarmowa „na tej planszy”.');
