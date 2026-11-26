/**
 * M6 (jednorazowo): statusy „Sprawdź się” po kontroli (side-session-notes/…/dyrygent/M6_kontrola.md: runda 1,
 * runda 2, trzecia kontrola Dyrygenta). Brzmienia ostateczne DOSŁOWNIE z raportu; status checked_agent,
 * checkedBy = raport + runda + wiersz. null = bez zmiany (brzmienie z draftu zatwierdzone).
 * Uruchomienie: node scripts/atlas_m6_apply_quiz_check.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'side-session-notes/dyrygent/M6_kontrola.md';
// plansza: [wiersz rundy 1, pytanie, wyjaśnienie, skąd brzmienie]
const Q = {
  nerwowy: [1, null, null, 'runda 1 OK (brzmienie szkicu)'],
  hormonalny: [6, null, null, 'runda 1 OK (brzmienie szkicu)'],
  limfatyczny: [11, null, null, 'runda 1 OK (brzmienie szkicu)'],
  mozg: [3, 'Jak zmienia się część energii mózgu pochodząca z mleczanu, gdy we krwi jest go dużo?',
    'Rośnie: z ok. 8% do ok. 27% energii mózgu (w badaniu: 30 min jazdy przy 75% VO₂max, z mleczanem podawanym do żyły; nie sam sprint).',
    'runda 1 POPRAWKA, runda 2 OK'],
  rozrodczy: [12, 'Wskaż na planszy męski gruczoł płciowy, który leży w mosznie poza miednicą.',
    'To jądro, męski gruczoł płciowy: powstają w nim plemniki i hormony. U mężczyzny jądra leżą w mosznie poza miednicą, a plemniki płyną przez najądrze i nasieniowód do cewki moczowej.',
    'runda 1 POPRAWKA, runda 2 OK'],
  powlokowy: [7, 'Jak zmienia się pocenie, gdy w czasie treningu rośnie temperatura wnętrza ciała?', null, 'runda 1 zmiana słowa, runda 2 OK'],
  miesniowy: [2, null,
    'Rośnie: z ok. 1 do ok. 10 mmol/L (w badaniach: rower, 8–12 odcinków po 30–60 s przy 70–85% mocy maksymalnej; najwyższa wartość w połowie sesji albo 3 min po niej). Mleczan nie jest „odpadem”: serce, mózg i włókna tlenowe zużywają go jako paliwo.',
    'brzmienie rundy 2, trzecia kontrola OK'],
  oddechowy: [4, 'Jak zmienia się pobór tlenu (VO₂) od spoczynku do końca 45-sekundowego odcinka pracy w treningu?',
    'Rośnie: z ok. 0,25 do ok. 3–3,4 litra tlenu na minutę, czyli do ok. 88% maksymalnego poboru tlenu (VO₂max). To wartość przyjęta w atlasie dla przeciętnego mężczyzny w wieku 20–29 lat, nie pomiar.',
    'brzmienie rundy 2, trzecia kontrola OK'],
  krwionosny: [5, 'Jak zmienia się część krwi pompowanej przez serce, która trafia do pracujących mięśni, przy wysiłku maksymalnym?',
    'Rośnie: z poniżej 20% do ok. 80% krwi pompowanej przez serce, czyli rzutu serca (w badaniu: wysiłek maksymalny całego ciała). Naczynia narządów jamy brzusznej (trzewi) i nerek się zwężają, a naczynia pracujących mięśni się rozszerzają.',
    'brzmienie rundy 2, trzecia kontrola OK'],
  pokarmowy: [8, null,
    'Maleje: z ok. 1,6 do ok. 0,4 litra krwi na minutę przy najcięższym wysiłku (w badaniu: wysiłek ciągły na bieżni, od lekkiego do prawie maksymalnego, czyli 26–97% VO₂max, pomiar od 5. minuty; nie interwały 45 s). Im cięższy wysiłek, tym mniej krwi.',
    'brzmienie rundy 2, trzecia kontrola OK'],
  wydalniczy: [9, 'Jak zmienia się przepływ krwi przez nerki kilka minut po ciężkim wysiłku na rowerze, w którym obciążenie rośnie co 4 minuty?',
    'Maleje: o ok. 30% (w badaniu: rower, coraz cięższe etapy po 4 min, pomiar zaraz po etapie), a 5 min po wysiłku do wyczerpania nawet o ok. 50%.',
    'pytanie: korekta Dyrygenta („kilka minut”); wyjaśnienie: runda 1 = runda 2'],
  kostny: [10, null, null, 'runda 2: zmiana słowa odrzucona, zostaje brzmienie szkicu'],
};

for (const [plate, [row, question, explain, how]] of Object.entries(Q)) {
  const file = join(root, 'src/atlas/data/facts', `${plate}.json`);
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  const r = data.facts.find((f) => f.id === `${plate}.quiz`);
  if (!r) throw new Error(`${plate}: brak pytania`);
  if (question) r.textPl = question;
  if (explain) r.explainPl = explain;
  r.status = 'checked_agent';
  r.checkedBy = { report: REPORT, rows: [`część 1 #${row}`], note: `M6_kontrola.md: ${how} (2026-11-26)` };
  writeFileSync(file, (JSON.stringify(data, null, 1) + '\n').replace(/\n/g, raw.includes('\r\n') ? '\r\n' : '\n'));
}
console.log(`„Sprawdź się”: ${Object.keys(Q).length} pytań checked_agent.`);
