/**
 * Test końców linii walidatorów atlasu (po M3): w checkoucie z core.autocrlf=true źródła mają CRLF.
 * Kopiuje src/, docs/atlas_audyt/ i public/atlas3d/ do katalogu tymczasowego, zamienia końce linii plików tekstowych
 * na CRLF i uruchamia atlas_check_facts.mjs oraz atlas_check_data.mjs z ATLAS_ROOT = kopia:
 *  1) kopia CRLF bez zmian -> 0 błędów (żadnych fałszywych alarmów);
 *  2) kopia CRLF z prawdziwymi błędami -> walidatory je wykrywają (zdanie robocze w Podstawowym, StatusNotes poza
 *     Rozszerzonym, pytanie z pominięciem bramki, pole lekcji w pliku układu planszy).
 * Kopia jest usuwana na końcu; repozytorium nie jest zmieniane.
 * Uruchomienie: node scripts/atlas_check_crlf_test.mjs   (część npm run check:atlas)
 */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'atlas-crlf-'));
const TEXT = new Set(['.ts', '.tsx', '.mjs', '.js', '.json', '.css', '.md']);
let failures = 0;
const fail = (m) => {
  failures++;
  console.log('BŁĄD  ' + m);
};

const toCrlf = (dir) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) toCrlf(p);
    else if (TEXT.has(extname(e))) writeFileSync(p, readFileSync(p, 'utf-8').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'));
  }
};
const run = (script) => {
  const r = spawnSync(process.execPath, [join(root, 'scripts', script)], { env: { ...process.env, ATLAS_ROOT: tmp }, encoding: 'utf-8' });
  return { code: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};
const edit = (rel, from, to) => {
  const p = join(tmp, rel);
  const s = readFileSync(p, 'utf-8');
  if (!s.includes(from)) throw new Error(`test: brak wzorca w ${rel}: ${from}`);
  writeFileSync(p, s.replace(from, to));
};

try {
  cpSync(join(root, 'src'), join(tmp, 'src'), { recursive: true });
  cpSync(join(root, 'docs', 'atlas_audyt'), join(tmp, 'docs', 'atlas_audyt'), { recursive: true });
  cpSync(join(root, 'public', 'atlas3d'), join(tmp, 'public', 'atlas3d'), { recursive: true, filter: (s) => !/\.glb$/i.test(s) });
  toCrlf(tmp);
  const crlfApp = readFileSync(join(tmp, 'src', 'atlas', 'AtlasApp.tsx'), 'utf-8');
  if (!crlfApp.includes('\r\n')) fail('kopia AtlasApp.tsx nie ma CRLF (test nic nie sprawdza)');

  // 1) bez zmian: 0 fałszywych błędów
  for (const s of ['atlas_check_facts.mjs', 'atlas_check_data.mjs']) {
    const r = run(s);
    if (r.code !== 0) fail(`${s} na kopii CRLF bez zmian: kod ${r.code} (fałszywe alarmy):\n${r.out.split('\n').filter((l) => /BŁĄD/.test(l)).join('\n')}`);
    else console.log(`OK  ${s}: kopia CRLF bez zmian -> 0 błędów`);
  }

  // 2) prawdziwe błędy w plikach CRLF są wykrywane
  const cases = [
    ['atlas_check_facts.mjs', 'src/atlas/AtlasApp.tsx', '<p className="text-sm text-slate-300">{content.subtitlePl}</p>', '<p className="text-sm text-slate-300">{content.subtitlePl} Opis czeka na sprawdzenie.</p>', /zdanie robocze/],
    ['atlas_check_facts.mjs', 'src/atlas/AtlasApp.tsx', '{extended && <StatusNotes', '{<StatusNotes', /StatusNotes> renderowany poza/],
    ['atlas_check_facts.mjs', 'src/atlas/AtlasApp.tsx', 'const question = lessonText(content.question);', 'const question = { text: content.question?.text ?? "", draft: false };', /content\.question z pominięciem bramki/],
    ['atlas_check_data.mjs', 'src/atlas/plates/kostny.ts', '  heroMetricId:', '  question: "x",\r\n  heroMetricId:', /pole faktu „question”/],
    // E1-K3: fakt podręcznikowy gabloty bez dosłownego cytatu (pierwszy rekord serce.json traci pole quote)
    ['atlas_check_data.mjs', 'src/atlas/data/organs/serce.json', '"quote": "', '"quote_usuniety": "', /textbook_consensus bez dosłownego cytatu/],
  ];
  for (const [script, rel, from, to, expect] of cases) {
    const orig = readFileSync(join(tmp, rel), 'utf-8');
    edit(rel, from, to);
    const r = run(script);
    if (r.code === 0 || !expect.test(r.out)) fail(`${script}: nie wykrył błędu w pliku CRLF (${rel}: ${expect})`);
    else console.log(`OK  ${script}: wykryty prawdziwy błąd w pliku CRLF (${expect.source})`);
    writeFileSync(join(tmp, rel), orig);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
console.log(failures ? `WYNIK: test CRLF ${failures} błędów` : 'WYNIK: test CRLF OK');
process.exit(failures ? 1 : 0);
