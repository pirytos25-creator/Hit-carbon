/**
 * M6 (rama, jednorazowo): „Sprawdź się” (UX_POSIEDZENIE §2.2 P6) – jedno pytanie na planszę w
 * src/atlas/data/facts/<plansza>.json (rekord kind 'quiz'). Pytanie ↑/↓ („Jak zmienia się…?”) z odpowiedzią i
 * wyjaśnieniem z JEDNEJ sprawdzonej liczby albo zdania planszy (derivedFrom), z dopiskiem o badaniu jak przy liczbie.
 * Karta bez stanów (rozrodczy): pytanie „Wskaż …” z odpowiedzią = kotwica planszy.
 * Status draft: dwie niezależne kontrole Dyrygenta, potem statusy (jak w M3).
 * Uruchomienie: node scripts/atlas_m6_quiz_texts.mjs   (powtórne uruchomienie podmienia rekordy)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/atlas/data/facts');

const Q = {
  krwionosny: ['updown', 'up', 'Jak zmienia się część krwi z serca, która płynie do pracujących mięśni, przy wysiłku maksymalnym?',
    'Rośnie: z poniżej 20% do ok. 80% rzutu serca (w badaniu: wysiłek maksymalny całego ciała). Naczynia trzewi i nerek się zwężają, a naczynia pracujących mięśni się rozszerzają.',
    ['krwionosny.metric.udzial_miesni_w_przeplywie_krwi']],
  oddechowy: ['updown', 'up', 'Jak zmienia się pobór tlenu (VO₂) od spoczynku do końca 45 s pracy?',
    'Rośnie: z ok. 0,25 do ok. 3–3,4 litra tlenu na minutę (ok. 88% VO₂max).',
    ['oddechowy.metric.pobor_tlenu_vo']],
  pokarmowy: ['updown', 'down', 'Jak zmienia się przepływ krwi przez wątrobę w ciężkim wysiłku?',
    'Maleje: z ok. 1,6 do ok. 0,4 litra krwi na minutę (w badaniu: wysiłek ciągły na bieżni, pomiar od 5. minuty). Im cięższy wysiłek, tym mniej krwi.',
    ['pokarmowy.metric.przeplyw_krwi_przez_watrobe']],
  hormonalny: ['updown', 'up', 'Jak zmienia się stężenie adrenaliny we krwi przy bardzo intensywnym wysiłku?',
    'Rośnie: ponad 12 razy w porównaniu ze spoczynkiem (w badaniu: ok. 14 min ciągłego wysiłku przy 87% VO₂max). Po 30 s sprintu maksymalnego wzrost wynosił ok. 7 razy.',
    ['hormonalny.metric.adrenalina_we_krwi']],
  nerwowy: ['updown', 'up', 'Jak zmienia się stężenie noradrenaliny w osoczu po krótkim, maksymalnym sprincie?',
    'Rośnie: z 2,2 do 13,4 nmol/L (w badaniu: 30 s sprintu maksymalnego na bieżni, pomiar po wysiłku). Noradrenalina pochodzi głównie z zakończeń nerwów współczulnych.',
    ['nerwowy.metric.noradrenalina_w_osoczu']],
  mozg: ['updown', 'up', 'Jak zmienia się udział mleczanu w energii mózgu, gdy we krwi jest go dużo?',
    'Rośnie: z ok. 8% do ok. 27% energii mózgu (w badaniu: 30 min jazdy przy 75% VO₂max z wlewem mleczanu, nie sam sprint).',
    ['mozg.metric.mleczan_z_krwi_jako_paliwo_mozgu']],
  miesniowy: ['updown', 'up', 'Jak zmienia się stężenie mleczanu we krwi w treningu interwałowym?',
    'Rośnie: z ok. 1 do ok. 10 mmol/L (w badaniach: rower, 8–12 odcinków po 30–60 s). Mleczan nie jest „odpadem”: serce, mózg i włókna tlenowe zużywają go jako paliwo.',
    ['miesniowy.metric.mleczan_we_krwi']],
  limfatyczny: ['updown', 'down', 'Jak zmienia się objętość śledziony po wysiłku do wyczerpania?',
    'Maleje: do ok. 44% objętości spoczynkowej (w badaniu: test stopniowany do wyczerpania na rowerze, pomiar zaraz po wysiłku). Śledziona się kurczy i oddaje krew do krążenia.',
    ['limfatyczny.metric.objetosc_sledziony']],
  wydalniczy: ['updown', 'down', 'Jak zmienia się przepływ krwi przez nerki w ciężkim wysiłku?',
    'Maleje: o ok. 30%, a 5 min po wysiłku do wyczerpania nawet o ok. 50% (w badaniu: rower, etapy po 4 min, pomiar zaraz po etapie).',
    ['wydalniczy.metric.przeplyw_krwi_przez_nerki']],
  kostny: ['updown', 'same', 'Jak zmienia się gęstość kości po jednym treningu?',
    'Nie zmienia się: kość przebudowuje się tygodniami i miesiącami, a nie po jednym treningu.',
    ['kostny.summary.sprint']],
  powlokowy: ['updown', 'up', 'Jak zmienia się pocenie, gdy w czasie treningu rośnie temperatura wewnętrzna?',
    'Rośnie: pocenie wyraźnie przybiera, najmocniej na czole i plecach, a naczynia skóry się rozszerzają.',
    ['powlokowy.summary.sprint']],
  rozrodczy: ['point', 'testis', 'Wskaż na planszy narząd, który u mężczyzny leży w mosznie poza miednicą.',
    'To jądro. U mężczyzny jądra leżą w mosznie poza miednicą, a plemniki płyną przez najądrze i nasieniowód do cewki moczowej.',
    ['rozrodczy.summary.rest']],
};

let n = 0;
for (const [plate, [quizType, answer, textPl, explainPl, from]] of Object.entries(Q)) {
  const file = join(dir, `${plate}.json`);
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  const refs = [...new Set(from.flatMap((id) => {
    const f = data.facts.find((x) => x.id === id);
    if (!f) throw new Error(`${plate}: brak faktu ${id}`);
    if (!['checked_agent', 'checked_human'].includes(f.status)) throw new Error(`${plate}: ${id} nie jest sprawdzony`);
    return f.referenceIds;
  }))];
  const rec = { id: `${plate}.quiz`, kind: 'quiz', plate, textPl, quizType, answer, explainPl, status: 'draft', referenceIds: refs, derivedFrom: from };
  const i = data.facts.findIndex((f) => f.id === rec.id);
  if (i >= 0) data.facts[i] = rec;
  else data.facts.push(rec);
  n++;
  writeFileSync(file, (JSON.stringify(data, null, 1) + '\n').replace(/\n/g, raw.includes('\r\n') ? '\r\n' : '\n'));
}
console.log(`„Sprawdź się”: ${n} pytań draft.`);
