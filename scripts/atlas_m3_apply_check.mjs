/**
 * M3 (jednorazowo): wynik kontroli 63 szkiców (side-session-notes/…/dyrygent/M3_kontrola.md, 2026-11-26).
 *  - 42 wiersze OK -> status checked_agent, checkedBy = raport i numer wiersza;
 *  - 21 wierszy POPRAWKA -> brzmienie DOSŁOWNIE z kolumny „poprawione brzmienie”, status zostaje draft
 *    (§3.6: brzmienie zaproponowane przez sprawdzającego ogląda drugi, niezależny agent);
 *  - noty protokołu #26 hormonalny, #39 pokarmowy, #33 powłokowy: brzmienie z raportu (bez fałszywego zdania
 *    o „późniejszych interwałach”), status draft;
 *  - derivedFrom nazw momentu: plansze bez własnej noty -> DEFAULT_PROTOCOL_NOTE (palette.ts); hormonalny, pokarmowy ->
 *    własna nota.
 * Numer wiersza = kolejność w integrator/M3/drafts_M3.md (lista z `atlas_check_facts.mjs --drafts`, stan przed tym skryptem).
 * Uruchomienie: node scripts/atlas_m3_apply_check.mjs <ścieżka drafts_M3.md>
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/atlas/data/facts');
const REPORT = 'side-session-notes/dyrygent/M3_kontrola.md';
const draftsPath = process.argv[2];
if (!draftsPath) throw new Error('podaj ścieżkę drafts_M3.md');

const OK = new Set([1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 14, 17, 18, 21, 22, 23, 24, 25, 28, 29, 30, 32, 34, 35, 36, 37, 38, 42, 43, 45, 46, 47, 48, 51, 56, 57, 58, 59, 60, 61, 62, 63]);
const FIX = {
  7: 'Które włókna mięśniowe dołączają do pracy przy bardzo ciężkim wysiłku?',
  10: 'Dowiesz się, czym mózg się żywi w spoczynku i co się zmienia w ciężkim wysiłku.',
  13: 'W ciężkim wysiłku mózg pobiera i spala więcej mleczanu z krwi, a pobiera mniej glukozy (w badaniach: wysiłek ciągły ok. 75% VO₂max, mleczan przy jego dodatkowym wlewie).',
  15: 'Dowiesz się, jak w spoczynku i w wysiłku pracują przepona i pozostałe mięśnie oddechowe.',
  16: 'Jak w sprincie zmienia się praca mięśni oddechowych i płuc?',
  19: 'W sprincie przepona kurczy się szybciej, mocniej pracują mięśnie wdechowe, a wydech staje się czynny dzięki mięśniom międzyżebrowym wewnętrznym i mięśniom brzucha. Przy wysiłku maksymalnym wentylacja płuc rośnie do ok. 97 litrów powietrza na minutę (średnio u mężczyzn w wieku 20–80 lat). Krew płynie wtedy przez płuca szybciej (w badaniu: wytrenowani sportowcy), więc wymiana gazów musi zdążyć w krótszym czasie.',
  20: 'Zobaczysz, jak w wysiłku serce pompuje więcej krwi, a naczynia kierują ją do pracujących mięśni.',
  26: 'Sprint na tej planszy to koniec 45 s pracy przy ok. 88% VO₂max. Liczby pochodzą z badań o innych protokołach (opis przy każdej liczbie): wysiłku ciągłego przy 80–87% VO₂max, 30 s sprintu maksymalnego, wysiłku do wyczerpania albo interwałów przy ok. 82% VO₂max. Dla jednego interwału są więc tylko przybliżeniem.',
  27: 'Dowiesz się, jak hormony, zwłaszcza adrenalina, przestawiają organizm na wysiłek.',
  31: 'W sprincie nerwy współczulne każą rdzeniowi nadnerczy wyrzucić adrenalinę; przy bardzo intensywnym wysiłku jej stężenie we krwi rośnie kilkanaście razy. Adrenalina płynie z krwią do serca, mięśni i wątroby. Wątroba wypuszcza do krwi kilka razy więcej glukozy.',
  33: 'Na samym starcie wysiłku naczynia skóry się zwężają, a chłodzenie przez skórę (rozszerzone naczynia, obfity pot) rozkręca się dopiero, gdy rośnie temperatura wewnętrzna. Dlatego „Sprint” na tej planszy to koniec treningu 6 × (45 s pracy / 45 s przerwy), a nie pojedyncze 45 s. Liczby pochodzą z badań o innych protokołach, zwykle dłuższego wysiłku ciągłego (opis przy każdej liczbie).',
  39: 'Sprint w atlasie to koniec 45 s pracy przy ok. 88% VO₂max (6 × 45 s pracy / 45 s przerwy). Badania wątroby i trzewi mierzyły zwykle wysiłek ciągły albo wysiłek do wyczerpania, a nie interwały 45 s (opis przy każdej liczbie), więc liczby są tylko przybliżeniem.',
  40: 'Dowiesz się, jak w wysiłku wątroba oddaje do krwi więcej glukozy, choć dostaje mniej krwi.',
  41: 'Skąd bierze się glukoza we krwi, gdy jelita dostają mniej krwi?',
  44: 'W sprincie jelita i żołądek dostają mniej krwi, a przepływ przez wątrobę spada kilkukrotnie. Mimo to wątroba oddaje do krwi glukozę kilka razy szybciej niż w spoczynku (w badaniu przy ok. 87% VO₂max: 4–6 razy), więc glukozy we krwi przybywa. Część mleczanu z mięśni wątroba przerabia z powrotem na glukozę.',
  49: 'W spoczynku nerki dostają około jednej piątej krwi wypompowywanej przez serce. W kłębuszkach nerkowych przesącza się z niej ok. 180 litrów osocza na dobę, a kanaliki odzyskują prawie całą tę wodę. Reszta to mocz, który spływa do miedniczki nerkowej, a moczowodami do pęcherza moczowego.',
  50: 'W sprincie nerka dostaje mniej krwi, bo układ współczulny zwęża jej naczynia, a krew płynie głównie do pracujących mięśni. Nerki przesączają mniej i tworzą mniej moczu. Hormony ADH i aldosteron, które rosną w ciągu minut ciężkiej pracy, każą oszczędzać wodę i sól.',
  52: 'Dowiesz się, z jaką siłą podłoże naciska na stopę przy każdym kroku szybkiego biegu i które kości dźwigają ciężar ciała.',
  53: 'Ile razy większy od ciężaru ciała jest szczyt nacisku podłoża na stopę w szybkim biegu?',
  54: 'Krok szybkiego biegu',
  55: 'W szybkim biegu podłoże naciska na stopę w szczycie z siłą ok. 2,5–2,7 razy większą niż ciężar ciała, a stopa dotyka podłoża tylko ok. 0,24–0,27 s. Na rysunku wyróżniono kości, które dźwigają ciężar ciała: kości nóg, miednicę i kręgosłup lędźwiowy (ilustracja, nie pomiar). Gęstość kości nie zmienia się po jednym treningu, bo kość przebudowuje się tygodniami i miesiącami.',
};
if (OK.size + Object.keys(FIX).length !== 63) throw new Error(`OK ${OK.size} + POPRAWKA ${Object.keys(FIX).length} != 63`);

// wiersze listy draft -> ID rekordu
const PLATE = { nerwowy: 'nerwowy', 'mięśniowy': 'miesniowy', miesniowy: 'miesniowy', 'mózg': 'mozg', mozg: 'mozg', oddechowy: 'oddechowy', 'krwionośny': 'krwionosny', krwionosny: 'krwionosny', hormonalny: 'hormonalny', 'powłokowy': 'powlokowy', powlokowy: 'powlokowy', pokarmowy: 'pokarmowy', wydalniczy: 'wydalniczy', kostny: 'kostny', limfatyczny: 'limfatyczny', rozrodczy: 'rozrodczy' };
const rows = readFileSync(draftsPath, 'utf-8').split(/\r?\n/).filter((l) => l.startsWith('| ') && !l.startsWith('| plansza'));
if (rows.length !== 63) throw new Error(`lista draft ma ${rows.length} wierszy, oczekiwano 63`);
const idOf = (row) => {
  const [plateRaw, kind, key] = row.split('|').slice(1, 4).map((x) => x.trim());
  const p = PLATE[plateRaw];
  if (!p) throw new Error(`nieznana plansza ${plateRaw}`);
  if (key === 'protocolNotePl') return `${p}.protocolNote`;
  if (kind === 'hasło podstawy programowej') return `${p}.curriculum`;
  return `${p}.${key}`;
};

const files = {};
for (const f of readdirSync(dir)) files[f] = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
const byId = new Map();
for (const data of Object.values(files)) for (const r of data.facts) byId.set(r.id, r);

let ok = 0;
let fixed = 0;
rows.forEach((row, i) => {
  const n = i + 1;
  const id = idOf(row);
  const r = byId.get(id);
  if (!r) throw new Error(`#${n}: brak rekordu ${id}`);
  if (OK.has(n)) {
    r.status = 'checked_agent';
    r.checkedBy = { report: REPORT, rows: [`#${n}`], note: `M3_kontrola.md #${n}: OK (niezależny agent Dyrygenta, 2026-11-26)` };
    ok++;
  } else {
    r.textPl = FIX[n];
    r.status = 'draft';
    r.checkedBy = { report: REPORT, rows: [`#${n}`], note: `M3_kontrola.md #${n}: POPRAWKA, brzmienie sprawdzającego; czeka na drugiego niezależnego agenta (§3.6)` };
    fixed++;
  }
});

// derivedFrom nazw momentu (uwaga z raportu, zestawienie „Nazwy momentu”)
for (const p of ['nerwowy', 'miesniowy', 'mozg', 'oddechowy', 'krwionosny']) byId.get(`${p}.momentLabel`).derivedFrom = ['DEFAULT_PROTOCOL_NOTE'];
for (const p of ['hormonalny', 'pokarmowy']) byId.get(`${p}.momentLabel`).derivedFrom = [`${p}.protocolNote`, 'DEFAULT_PROTOCOL_NOTE'];
for (const p of ['nerwowy', 'miesniowy', 'mozg', 'oddechowy', 'krwionosny', 'hormonalny', 'pokarmowy']) byId.get(`${p}.momentLabel`).referenceIds = [];

for (const [f, data] of Object.entries(files)) {
  const raw = readFileSync(join(dir, f), 'utf-8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  writeFileSync(join(dir, f), (JSON.stringify(data, null, 1) + '\n').replace(/\n/g, eol));
}
console.log(`M3 kontrola: ${ok} × checked_agent, ${fixed} × poprawione brzmienie (draft).`);
