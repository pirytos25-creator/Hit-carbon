/**
 * M3 (U0, jednorazowo): dopisuje do src/atlas/data/facts/<plansza>.json nowe teksty lekcji (cel, pytanie, opis ≤ 3 zdania,
 * napis momentu, hasło podstawy programowej). Każdy tekst to przeformułowanie sprawdzonych faktów (`derivedFrom`),
 * bez nowych twierdzeń, ze statusem `draft` – statusy nada się po raporcie niezależnego agenta sprawdzającego.
 * Trzy opisy momentu (protocolNotePl: hormonalny, pokarmowy, powłokowy) wracają do `draft` (decyzja Dyrygenta, M3).
 * Uruchomienie: node scripts/atlas_m3_lesson_texts.mjs   (powtórne uruchomienie podmienia rekordy o tych samych ID)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/atlas/data/facts');

// Hasła podstawy programowej: dosłowne brzmienie z side-session-notes/…/dyrygent/podstawy_oceny_narzadow.md
// (Zintegrowana Platforma Edukacyjna, „Podstawa programowa – rok szkolny 2025/2026”, brzmienie z 2024 r.).
const PP_SOURCE = 'Podstawa programowa, biologia, liceum (zpe.gov.pl, rok szkolny 2025/2026, brzmienie z 2024 r.)';
const PP = {
  'V.4.8)': 'przedstawia budowę serca oraz krążenie krwi w obiegu płucnym i ustrojowym;',
  'V.2.7)': 'przedstawia rolę wątroby w przemianach substancji wchłoniętych w przewodzie pokarmowym;',
  'V.6.3)': 'przedstawia antagonistyczne działanie hormonów na przykładzie regulacji poziomu glukozy we krwi;',
  'V.7.5)': 'przedstawia budowę i funkcje mózgu, rdzenia kręgowego i nerwów;',
  'V.1.5)': 'przedstawia mechanizmy warunkujące homeostazę (termoregulacja, osmoregulacja, ciśnienie krwi).',
  'V.5.3)': 'przedstawia proces tworzenia moczu oraz wyjaśnia znaczenie regulacji hormonalnej w tym procesie;',
};

const MOMENT_45 = 'Koniec 45 s pracy';
const T = {
  krwionosny: {
    goal: ['Zobaczysz, jak serce i naczynia kierują krew tam, gdzie organizm najbardziej jej potrzebuje.', ['krwionosny.summary.rest', 'krwionosny.summary.sprint']],
    question: ['Dokąd płynie krew, gdy mięśnie ciężko pracują?', ['krwionosny.summary.sprint', 'krwionosny.metric.udzial_miesni_w_przeplywie_krwi']],
    rest: ['W spoczynku serce bije ok. 60 razy na minutę i pompuje ok. 5 litrów krwi na minutę. Mięśnie dostają mniej niż 20% tej krwi, a dużo trafia do wątroby, jelit i nerek.', ['krwionosny.summary.rest']],
    sprint: ['W sprincie serce bije szybciej i mocniej, a przy wysiłku maksymalnym pompuje ok. 20–25 litrów krwi na minutę. Ok. 80% tej krwi płynie do pracujących mięśni, a naczynia trzewne się zwężają. Mięśnie nóg działają jak pompa, która wyciska krew żyłami z powrotem do serca.', ['krwionosny.summary.sprint']],
    moment: [MOMENT_45, ['wydalniczy.protocolNote', 'limfatyczny.protocolNote']],
    pp: 'V.4.8)',
  },
  oddechowy: {
    goal: ['Dowiesz się, jak oddychanie przyspiesza i pogłębia się w wysiłku.', ['oddechowy.summary.sprint', 'oddechowy.metric.czestosc_oddechow', 'oddechowy.metric.objetosc_oddechowa']],
    question: ['Jak płuca nadążają z dostarczaniem tlenu w sprincie?', ['oddechowy.summary.sprint', 'oddechowy.metric.wentylacja_minutowa']],
    rest: ['W spoczynku oddech jest spokojny: wdech robi przepona z pomocą mięśni międzyżebrowych przymostkowych i pochyłych. Wydech jest bierny, bo mięśnie wydechowe prawie nie pracują.', ['oddechowy.summary.rest']],
    sprint: ['W sprincie przepona kurczy się szybciej, mocniej pracują mięśnie wdechowe, a wydech staje się czynny dzięki mięśniom międzyżebrowym wewnętrznym i mięśniom brzucha. Przy wysiłku maksymalnym przez płuca przepływa ok. 97 litrów powietrza na minutę. Krew płynie przez płuca szybciej, więc wymiana gazów musi zdążyć w krótszym czasie.', ['oddechowy.summary.sprint', 'oddechowy.metric.wentylacja_minutowa']],
    moment: [MOMENT_45, ['wydalniczy.protocolNote', 'limfatyczny.protocolNote']],
  },
  pokarmowy: {
    goal: ['Dowiesz się, jak wątroba dostarcza mięśniom paliwa, gdy trawienie zwalnia.', ['pokarmowy.summary.sprint']],
    question: ['Skąd mięśnie biorą cukier, gdy jelita dostają mniej krwi?', ['pokarmowy.summary.sprint', 'pokarmowy.metric.tempo_oddawania_glukozy_do_krwi']],
    rest: ['W spoczynku żołądek, jelita i wątroba dostają dużo krwi: przez samą wątrobę płynie ok. 1,6 litra krwi na minutę. Przewód pokarmowy trawi i wchłania pokarm, a wątroba powoli oddaje do krwi glukozę.', ['pokarmowy.summary.rest']],
    sprint: ['W sprincie jelita i żołądek dostają mniej krwi, a przepływ przez wątrobę spada kilkukrotnie. Mimo to wątroba oddaje do krwi glukozę 4–6 razy szybciej niż w spoczynku, więc glukozy we krwi przybywa. Część mleczanu z mięśni wątroba przerabia z powrotem na glukozę.', ['pokarmowy.summary.sprint']],
    moment: [MOMENT_45, ['wydalniczy.protocolNote', 'limfatyczny.protocolNote']],
    pp: 'V.2.7)',
  },
  hormonalny: {
    goal: ['Dowiesz się, jak hormony w kilka chwil przestawiają organizm na wysiłek.', ['hormonalny.summary.sprint']],
    question: ['Jak adrenalina przestawia organizm na sprint?', ['hormonalny.summary.sprint', 'hormonalny.metric.adrenalina_we_krwi']],
    rest: ['W spoczynku gruczoły dokrewne wydzielają hormony spokojnie, w rytmie dnia i posiłków. We krwi jest mało adrenaliny, a insulina i glukagon z trzustki utrzymują stały poziom cukru.', ['hormonalny.summary.rest']],
    sprint: ['W sprincie nerwy współczulne każą rdzeniowi nadnerczy wyrzucić adrenalinę, której stężenie we krwi rośnie kilkanaście razy. Adrenalina płynie z krwią do serca, mięśni i wątroby. Wątroba wypuszcza wtedy do krwi kilka razy więcej glukozy.', ['hormonalny.summary.sprint']],
    moment: [MOMENT_45, ['wydalniczy.protocolNote', 'limfatyczny.protocolNote']],
    pp: 'V.6.3)',
  },
  nerwowy: {
    goal: ['Dowiesz się, jak rozkaz ruchu biegnie z mózgu do mięśni nóg.', ['nerwowy.summary.sprint']],
    question: ['Jak rozkaz z kory ruchowej dociera do mięśnia nogi?', ['nerwowy.summary.sprint']],
    sprint: ['W sprincie kora ruchowa wysyła rozkaz drogą korowo-rdzeniową, a w rdzeniu kręgowym przechodzi on na motoneurony i biegnie nerwami do mięśni nóg. Większość włókien tej drogi krzyżuje się, więc lewa półkula steruje głównie prawą nogą. Jednocześnie układ współczulny przyspiesza serce, a rdzeń nadnerczy wyrzuca do krwi adrenalinę.', ['nerwowy.summary.sprint']],
    moment: [MOMENT_45, ['wydalniczy.protocolNote', 'limfatyczny.protocolNote']],
    pp: 'V.7.5)',
  },
  mozg: {
    goal: ['Dowiesz się, czym mózg się żywi i jak zmienia paliwo w ciężkim wysiłku.', ['mozg.summary.rest', 'mozg.summary.sprint']],
    question: ['Czy w ciężkim wysiłku mózg spala tylko glukozę?', ['mozg.summary.sprint', 'mozg.metric.mleczan_z_krwi_jako_paliwo_mozgu']],
    sprint: ['W ciężkim wysiłku mózg pobiera i spala więcej mleczanu z krwi, a pobiera mniej glukozy.', ['mozg.summary.sprint']],
    moment: [MOMENT_45, ['wydalniczy.protocolNote', 'limfatyczny.protocolNote']],
    pp: 'V.7.5)',
  },
  miesniowy: {
    goal: ['Dowiesz się, które mięśnie napędzają bieg i jak włókna mięśniowe dołączają do pracy.', ['miesniowy.summary.sprint']],
    question: ['Które włókna mięśniowe dołączają do pracy dopiero w sprincie?', ['miesniowy.summary.sprint', 'miesniowy.metric.rekrutowane_wlokna_miesniowe']],
    sprint: ['W sprincie pracuje cały łańcuch napędowy: pośladki i mięśnie kulszowo-goleniowe prostują biodro, czworogłowy prostuje kolano, a łydka odbija stopę. Najpierw pracują małe jednostki z włóknami typu I, a przy ok. 90% VO₂max dołączają włókna IIa i część włókien IIx. W każdym pracującym włóknie główki miozyny raz za razem ciągną aktynę, zużywając ATP.', ['miesniowy.summary.sprint']],
    moment: [MOMENT_45, ['wydalniczy.protocolNote', 'limfatyczny.protocolNote']],
  },
  kostny: {
    goal: ['Dowiesz się, jakie siły działają na kości nóg przy każdym kroku biegu.', ['kostny.summary.sprint']],
    question: ['Ile razy mocniej niż ciężar ciała podłoże naciska na stopę w biegu?', ['kostny.summary.sprint', 'kostny.metric.szczyt_nacisku_podloza_na_stope']],
    sprint: ['W szybkim biegu podłoże naciska na stopę w szczycie z siłą ok. 2,5–2,7 razy większą niż ciężar ciała, a stopa dotyka podłoża tylko ok. 0,24–0,27 s. Na rysunku wyróżniono kości, które dźwigają ciężar ciała: kości nóg, miednicę i kręgosłup lędźwiowy. Gęstość kości nie zmienia się po jednym treningu, bo kość przebudowuje się tygodniami i miesiącami.', ['kostny.summary.sprint']],
    moment: ['Krok biegu', ['kostny.protocolNote']],
  },
  limfatyczny: {
    goal: ['Dowiesz się, jak płynie limfa i co wysiłek robi z komórkami odpornościowymi we krwi.', ['limfatyczny.summary.rest', 'limfatyczny.summary.sprint']],
    question: ['Skąd w wysiłku bierze się we krwi więcej komórek odpornościowych?', ['limfatyczny.summary.sprint', 'limfatyczny.metric.komorki_nk_we_krwi']],
    rest: ['Z naczyń krwionośnych wycieka do tkanek płyn tkankowy, który w naczyniach chłonnych staje się limfą. Naczynia chłonne prowadzą ją przez węzły chłonne, które działają jak filtry. Przewód piersiowy oddaje limfę z powrotem do krwi, do żyły przy lewym obojczyku.', ['limfatyczny.summary.rest']],
    sprint: ['W wysiłku adrenalina odrywa komórki odpornościowe od ścian naczyń, więc we krwi szybko przybywa komórek NK i limfocytów. Śledziona się kurczy, a pracujące mięśnie szybciej wyciskają limfę. 1–2 godziny po wysiłku limfocytów we krwi jest przejściowo mniej niż przed nim.', ['limfatyczny.summary.sprint']],
    moment: [MOMENT_45, ['limfatyczny.protocolNote']],
  },
  powlokowy: {
    goal: ['Dowiesz się, jak skóra pomaga pozbyć się ciepła z pracujących mięśni.', ['powlokowy.summary.sprint']],
    question: ['Jak skóra chłodzi organizm, gdy mięśnie wytwarzają dużo ciepła?', ['powlokowy.summary.sprint', 'powlokowy.metric.energia_z_pracy_miesni_zamieniana_w_cieplo']],
    sprint: ['Pracujące mięśnie zamieniają w ciepło ponad 3/4 zużytej energii. Gdy temperatura wewnętrzna rośnie, naczynia skóry się rozszerzają, a pocenie wyraźnie przybiera, najmocniej na czole i plecach. Po treningu ciepło zostaje w ciele jeszcze przez kilkadziesiąt minut.', ['powlokowy.summary.sprint']],
    moment: ['Koniec treningu', ['powlokowy.summary.sprint']],
    pp: 'V.1.5)',
  },
  wydalniczy: {
    goal: ['Dowiesz się, jak nerki tworzą mocz i dlaczego w wysiłku oszczędzają wodę.', ['wydalniczy.summary.rest', 'wydalniczy.summary.sprint']],
    question: ['Dlaczego w sprincie nerki tworzą mniej moczu?', ['wydalniczy.summary.sprint', 'wydalniczy.metric.przeplyw_krwi_przez_nerki']],
    rest: ['W spoczynku nerki dostają około jednej piątej krwi wypompowywanej przez serce. W kłębuszkach nerkowych przesącza się z niej ok. 180 litrów osocza na dobę, a kanaliki odzyskują prawie całą tę wodę. Mocz spływa do miedniczki nerkowej, a moczowodami do pęcherza moczowego.', ['wydalniczy.summary.rest']],
    sprint: ['W sprincie nerka dostaje mniej krwi, bo układ współczulny zwęża jej naczynia, a krew płynie głównie do pracujących mięśni. Nerki przesączają mniej i tworzą mniej moczu. Hormony ADH i aldosteron każą wtedy oszczędzać wodę i sól.', ['wydalniczy.summary.sprint']],
    moment: [MOMENT_45, ['wydalniczy.protocolNote']],
    pp: 'V.5.3)',
  },
  rozrodczy: {
    goal: ['Poznasz budowę układu rozrodczego mężczyzny i kobiety.', ['rozrodczy.summary.rest']],
    question: ['Gdzie leżą narządy rozrodcze mężczyzny i kobiety?', ['rozrodczy.summary.rest']],
    rest: ['Karta pokazuje układ rozrodczy mężczyzny i kobiety z boku, w tej samej skali. U mężczyzny jądra leżą w mosznie poza miednicą, a plemniki płyną przez najądrze i nasieniowód do cewki moczowej. U kobiety jajniki, jajowody, macica i pochwa leżą w miednicy mniejszej, za pęcherzem moczowym.', ['rozrodczy.summary.rest']],
  },
};

const allFacts = new Map();
for (const p of Object.keys(T)) for (const f of JSON.parse(readFileSync(join(dir, `${p}.json`), 'utf-8')).facts) allFacts.set(f.id, f);

let added = 0;
for (const [plate, t] of Object.entries(T)) {
  const file = join(dir, `${plate}.json`);
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  const refsOf = (ids) => [...new Set(ids.flatMap((id) => {
    const f = allFacts.get(id);
    if (!f) throw new Error(`${plate}: brak faktu źródłowego ${id}`);
    if (!['checked_agent', 'checked_human'].includes(f.status)) throw new Error(`${plate}: fakt źródłowy ${id} nie jest sprawdzony (${f.status})`);
    return f.referenceIds;
  }))];
  const rec = (id, kind, [textPl, from], extra = {}) => ({ id, kind, plate, textPl, status: 'draft', referenceIds: refsOf(from), derivedFrom: from, ...extra });
  const recs = [];
  if (t.goal) recs.push(rec(`${plate}.lessonGoal`, 'lesson_goal', t.goal));
  if (t.question) recs.push(rec(`${plate}.question`, 'question', t.question));
  if (t.rest) recs.push(rec(`${plate}.summaryShort.rest`, 'summary_short', t.rest, { state: 'rest' }));
  if (t.sprint) recs.push(rec(`${plate}.summaryShort.sprint`, 'summary_short', t.sprint, { state: 'sprint' }));
  if (t.moment) recs.push(rec(`${plate}.momentLabel`, 'moment_label', t.moment));
  if (t.pp) recs.push({ id: `${plate}.curriculum`, kind: 'curriculum_ref', plate, status: 'draft', referenceIds: [], scope: 'P', locator: t.pp, quote: PP[t.pp], notePl: PP_SOURCE });
  for (const r of recs) {
    const i = data.facts.findIndex((f) => f.id === r.id);
    if (i >= 0) data.facts[i] = r;
    else data.facts.push(r);
    added++;
  }
  // 3 opisy momentu: z powrotem do draft (sprawdzi je niezależny agent w rundzie M3)
  if (['hormonalny', 'pokarmowy', 'powlokowy'].includes(plate)) {
    const note = data.facts.find((f) => f.kind === 'protocol_note');
    if (note) note.status = 'draft';
  }
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  writeFileSync(file, (JSON.stringify(data, null, 1) + '\n').replace(/\n/g, eol));
}
console.log(`Teksty lekcji M3: ${added} rekordów draft w ${Object.keys(T).length} plikach.`);
