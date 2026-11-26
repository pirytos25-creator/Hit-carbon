# Kontrola końcowa faktów atlasu (trzeci, niezależny agent; model §3.6 pkt 6 i §3.7)

Data: 2026-11-26. Gałąź `atlas-uklady`, commit `fce3408`, tylko odczyt (zmieniony jest wyłącznie ten plik).
Nie czytałem raportów sesji ani `side-session-notes`; dane z plansz wyciągnąłem z `src/atlas/plates/*.ts` przez esbuild,
źródła sprawdzałem w PubMed (efetch, abstrakty), w PMC (WebFetch), w indeksie Exa i na stronach NCBI Bookshelf przez Exa.
Strony z kontrolą przeglądarki (journals.physiology.org, część stron PMC i Bookshelf) pomijałem, nie obchodziłem blokad.
Cytaty mają najwyżej 15 słów. „Exa” w lokalizatorze = tekst z indeksu wyszukiwarki Exa (pełny tekst wydawcy zablokowany dla automatów).

## Podsumowanie

| Część | pozycji | `checked_agent` | `anatomy` | `disputed` | `unverifiable` |
|---|---|---|---|---|---|
| 1a. Nowe brzmienia `draft` | 12 | 7 | 0 | 4 | 1 |
| 1b. Uwagi D1 „liczba w cytacie albo conversionNote” | 16 | 16 (11 wymaga dopisania `conversionNote` albo dłuższego cytatu) | 0 | 0 | 0 |
| 1c. 9 pozycji z reguły „brzmienie od sprawdzającego” | 9 | 9 | 0 | 0 | 0 |
| 2. Próba losowa opisów ról i podsumowań | 23 | 23 | 0 | 0 | 0 |
| 3. Spójność między planszami | 9 tematów | – | – | 2 sprzeczności do poprawy, 5 pozornych (do dopisku) | – |

Odsetek rozbieżności (`disputed`) na planszę. Kolumna „próba” liczy tylko część 2 (próba losowa wg §3.6 pkt 6), kolumna „razem” wszystkie pozycje sprawdzone tu dla tej planszy (części 1 i 2).

| plansza | próba (część 2) | razem (części 1+2) | oznaczenie |
|---|---|---|---|
| nerwowy | 0/2 | 0/2 | – |
| miesniowy | 0/2 | 0/4 | – |
| mozg | 0/2 | 0/4 | – |
| oddechowy | 0/2 | 0/4 | – |
| krwionosny | 0/2 | 0/4 | – |
| hormonalny | 0/2 | **1/6 (17%)** | **> 1/10 – oznaczyć** (sporne zdanie o „sprincie”, nie liczba) |
| powlokowy | 0/2 | **1/6 (17%)** (+1 `unverifiable`) | **> 1/10 – oznaczyć** (sporne zdanie o „sprincie”, nie liczba) |
| pokarmowy | 0/2 | 1/11 (9%) | – (granica) |
| wydalniczy | 0/2 | 0/7 | – |
| kostny | 0/1 | 0/2 | – |
| limfatyczny | 0/2 | 0/6 | – |
| rozrodczy | 0/2 | 0/4 | – |
| (wspólne: słowniczek) | – | 1/1 | do poprawy |

W próbie losowej nie znalazłem żadnej rozbieżności. Wszystkie 4 sporne pozycje to nowe zdania objaśniające (3 × `protocolNotePl`, 1 × słowniczek). Wartości liczbowe się zgadzają.
Plansze hormonalna i powłokowa przekraczają próg 1/10 tylko w kolumnie „razem”. Ponowna kontrola całego układu (§3.6 pkt 6) dotyczy według mnie tylko zdań objaśniających tych plansz, nie liczb.

**Dwa błędy walidatora** (`scripts/atlas_check_facts.mjs`, funkcja `inQuote`, wiersze 58–61), przez które część uwag D1 to fałszywe alarmy:
1. W wyrażeniu `/(\d),(\d{3})…/g` zamiast `\b` stoi dosłowny znak backspace (0x08), więc „1,000” nie zamienia się na „1000”. Następna zamiana robi z tego „1.000”, a „1000” nie zostaje znalezione (uwaga do ATP).
2. W szablonie `` `(^|[^\d.])…([^\d]|$)` `` sekwencja `\d` traci ukośnik, więc wyrażenie ma postać `[^d.]` / `[^d]` (litera „d”, nie cyfra). Sprawdzenie granic liczby działa przez to inaczej, niż zamierzono.

---

## 1a. Nowe brzmienia i zdania bez statusu (12)

| # | plansza / klucz | treść (skrót) | status | dowód: cytat ≤ 15 słów + lokalizator | uwagi / poprawka |
|---|---|---|---|---|---|
| 1 | miesniowy / deltoid (sprint) | „Wymach ramion równoważy obrót nóg (symulacja komputerowa, 1 biegacz)” | `checked_agent` | „the arms effectively counterbalanced the vertical angular momentum of the lower extremities” – Hamner 2010 (PMID 20691972), abstrakt; „A single healthy male subject” – Methods | Zgodne: symulacja, 1 biegacz, 3,96 m/s. **Uwaga do zgodności ze strukturą:** w modelu ramiona napędzały „torque actuators”, nie mięśnie (Methods), więc samego m. naramiennego źródło nie bada. To, że naramienny porusza ramieniem w stawie barkowym, jest wiedzą anatomiczną. Sugestia (nieobowiązkowa): „Porusza ramieniem; wymach ramion równoważy obrót nóg (symulacja…)”. |
| 2 | krwionosny / saphenous (sprint) | „Spływa do żył głębokich, które pompa mięśniowa opróżnia szybciej” | `checked_agent` | „the skeletal muscle pump which acts to empty the veins in the lower extremities” – Joyner & Casey 2015 (PMID 25834232, PMC4551211), rozdz. III.B | Opis pasuje do żyły powierzchownej: sama żyła nie jest pompowana, uchodzi do żył głębokich (ujście odpiszczelowo-udowe to anatomia). Poprzedni błąd („pompa mięśniowa = żyła powierzchowna”) jest usunięty. |
| 3 | hormonalny / protocolNotePl | „…z badań ciągłego wysiłku przy 80–87% VO₂max, z 30 s sprintu maksymalnego albo z krótkiego biegu do wyczerpania… Liczby pochodzą z późniejszych interwałów (po kilku minutach sesji).” | `disputed` | Marliss 1992 (PMID 1458713), abstrakt: „exercised to exhaustion at 80% of maximal workload… on a cycle ergometer”; Peake 2014 (PMID 25096178): „completed a HIIT session [81.6 ± 3.7% maximum oxygen consumption…]” | (a) Wysiłek do wyczerpania to **jazda na rowerze** (ok. 100% VO₂max), nie bieg. (b) Insulina na tej planszy pochodzi też z **interwałów przy ok. 82% VO₂max** (Peake 2014), których lista nie obejmuje. (c) Zdanie „Liczby pochodzą z późniejszych interwałów” jest nieprawdziwe: liczby pochodzą z badań opisanych zdanie wcześniej. Późniejszy interwał to wybór momentu obrazu w atlasie (§3.7). Poprawka niżej, w „Do poprawy”. |
| 4 | powlokowy / liczba „Ciepło oddane w odpoczynku po wysiłku” | „— → 30–50 % ciepła zebranego w wysiłku” (+ dopisek 53% z Kenny 2008) | `checked_agent` | „only 30–50% of the heat gained during exercise is lost during a recovery” – Kenny & McGinn 2017 (PMID 27881668), rozdz. „Postexercise Thermoregulatory Control”, akapit 1 (Exa). Dopisek: „only 53% of the heat stored during 60 min of exercise was dissipated” – Kenny 2008 (PMID 18685528), abstrakt, Conclusion | Cytat i lokalizator się zgadzają. 53% wypada tuż nad przedziałem 30–50%. Przegląd cytuje między innymi to badanie, więc nie ma sprzeczności, ale można dopisać „(nieco więcej niż w przeglądzie)”. Można dać status `checked_agent`. |
| 5 | powlokowy / vessels_sup (spoczynek) | „Umiarkowany przepływ” | `unverifiable` | González-Alonso 2008 (PMC2375553) nie podaje spoczynkowego przepływu w skórze (sprawdzone w pełnym tekście przez WebFetch). Johnson 1992 (PMID 1623893), abstrakt, też nie podaje. | Brak cytatu do słowa „umiarkowany”. W termoneutralnym spoczynku przepływ w skórze to mała część rzutu serca, więc „umiarkowany” może być za mocne. Poprawka: dodać źródło z liczbą spoczynkową (np. przegląd Charkoudian 2003, Mayo Clin Proc, do sprawdzenia) albo zmienić na opis anatomiczny („Sieć naczyń pod naskórkiem”, status `anatomy`). |
| 6 | powlokowy / protocolNotePl | „Naczynia skóry zwężają się już w pierwszych sekundach wysiłku, ale chłodzenie… rozkręca się w minutach…” | `disputed` (precyzja) | „There is a cutaneous vasoconstriction at the beginning of exercise” – Johnson 1992, abstrakt; Yanagimoto 2003 (PMID 12623775): „cycle exercise at 30, 50, and 70% of… VO2 max for 60 s” | Źródła mówią „na początku wysiłku” (pomiar w pierwszej minucie), nie „w pierwszych sekundach”. Druga część („w minutach”) ma luźne oparcie: „As exercise continues… body temperature rises and the vasodilator system is activated” (González-Alonso 2008). Poprawka: „Naczynia skóry zwężają się już na samym początku wysiłku (w badaniu: w pierwszej minucie)…”. Zdanie nie ma pola na źródła, więc warto wpisać Johnson 1992, Yanagimoto 2003 i González-Alonso 2008 w opisie zmian. |
| 7 | pokarmowy / protocolNotePl | „…Badania wątroby i trzewi mierzyły zwykle wysiłek ciągły, kilkunastominutowy… Liczby pochodzą z późniejszych interwałów (po kilku minutach sesji).” | `disputed` | Rowell 1964 (PMID 14201551): „At the fifth minute of exercise 12.5 mg of ICG was injected” (Exa, Methods); Sigal 1994 (PMID 7906280): „13.6 +/- 0.2 (+/-SE) min of cycle ergometer exercise” | Pierwsza część jest dobra: wysiłek ciągły, ok. 14–30 min (Rowell, Sigal, Perko). **Ostatnie zdanie jest nieprawdziwe**, tak samo jak w nr 3. Poprawka: „Obraz pokazuje późniejszy interwał (po kilku minutach sesji).” |
| 8 | wydalniczy / protocolNotePl | „…Badania nerek mierzyły zwykle dłuższy wysiłek albo stan tuż po nim, więc liczby pokazują kierunek zmian…” | `checked_agent` | Freund 1991 (PMID 1827109): „immediately after four 20-min bouts of submaximal exercise”; Kawakami 2018 – pomiar 5 min po (locator planszy) | Zgodne z protokołami liczb na planszy (Freund, Kawakami, Kenney i Ho, Del Coso, McKelvie). |
| 9 | kostny / protocolNotePl | „Sprint = koniec 45 s… (to ok. 3,0–3,7 m/s, szacunek). Siły podłoża zmierzono w pojedynczych krokach… 3–5 m/s, w stanie wypoczętym…” | `checked_agent` | „Subjects ran between 30 and 40 trials across a Kistler… force platform” – Munro 1987 (PMID 3571295), abstrakt | Część o Munro jest zgodna. Szacunek prędkości sprawdziłem rachunkiem z równania biegu ACSM (VO₂ = 0,2 × v[m/min] + 3,5): przy 48 mL/kg/min × 0,88 = 42,2 wychodzi ok. 3,2 m/s, w zakresie 3,0–3,7. Równanie ACSM nie ma pozycji w `ScientificReferences.ts`, więc warto je dopisać jako źródło szacunku. |
| 10 | limfatyczny / protocolNotePl | „…Liczby pochodzą z badań o innych protokołach (opis przy każdej liczbie). „Po” to 1 godzina po wysiłku.” | `checked_agent` | „Venous blood was obtained before, immediately after, and 1 h post-exercise” – Bogdanis 2022 (PMID 35510255), abstrakt | Zgodne. Nieman 1992 też mierzył po 1 h. W przeglądzie Campbell i Turner minimum wypada 1–2 h po wysiłku, co zostało opisane przy liczbie. |
| 11 | rozrodczy / protocolNotePl | „To karta budowy, a nie plansza ze stanami…” | `checked_agent` | (zdanie o budowie planszy, nie fakt fizjologiczny; zgodne z `card` i §4 pkt 10) | – |
| 12 | (wspólne) / słowniczek vo2max | „VO₂max to największa ilość tlenu, jaką organizm potrafi zużyć w ciągu minuty w wysiłku maksymalnym; mierzy się ją w teście na bieżni albo rowerze.” | `disputed` (drobne) | „Percentiles of maximal oxygen consumption (VO 2max)…”; „7783 maximal… treadmill tests” – Kaminsky 2015 (PMID 26455884), abstrakt | Definicja i jednostka (mL·kg⁻¹·min⁻¹) się zgadzają, ale Kaminsky opisuje **tylko bieżnię**. „Albo rowerze” nie ma oparcia w podanym źródle. Poprawka: dodać źródło z testem na cykloergometrze, które już jest w atlasie (Blackie 1991 albo Aaron 1992), albo skrócić do „w teście wysiłkowym do maksimum (np. na bieżni)”. |

## 1b. Uwagi D1: liczba nie występuje dosłownie w cytacie (16)

Każda liczba wynika ze źródła. Kolumna „co dopisać” mówi, czy wystarczy `conversionNote`, czy trzeba wydłużyć cytat.

| # | plansza / liczba | liczby z uwagi | skąd liczba (cytat ≤ 15 słów, lokalizator) | status | co dopisać |
|---|---|---|---|---|---|
| 1 | miesniowy / ATP | 1000 | „up to a 1,000-fold increase in the rate of ATP demand” – Baker 2010, abstrakt | `checked_agent` | nic: **fałszywy alarm** przez błąd walidatora nr 1 (backspace w wyrażeniu) |
| 2 | mozg / glukoza PET | 30 | „exercise intensities corresponding to 30, 55 and 75% of [VO2max]” – Kemppainen 2005, abstrakt | `checked_agent` | dopisać to zdanie do `quote` albo `conversionNote: „30% VO₂max: abstrakt, opis protokołu”` |
| 3 | mozg / NIRS | 88 | „hard - ≥60% VO(2)peak to <VO(2)peak” – Rooks 2010, abstrakt (kategorie) | `checked_agent` | `conversionNote`: „88% VO₂max = kanon atlasu; u Rooks 2010 mieści się w kategorii hard (60–<100% VO₂peak), w której utlenowanie rośnie” |
| 4 | oddechowy / objętość oddechowa | 3 | „Vtmax… higher in men (2.70 +/- 0.48 L)” – Blackie 1991, abstrakt | `checked_agent` | `conversionNote`: „2,70 ± 0,48 L (mężczyźni) → ok. 2–3 L” |
| 5 | oddechowy / tlen mięśni oddechowych | 15 | „the VO2RM required 13-15% of VO2max” – Aaron 1992, abstrakt | `checked_agent` | dopisać to zdanie do `quote` („do 15” = osoby, które zużyły prawie całą rezerwę przepływu wydechowego) |
| 6 | krwionosny / przepływ wieńcowy | 3, 5, 1 | „typically three to five times the resting level” – Duncker & Bache 2008 (cytat planszy) | `checked_agent` | `conversionNote`: „three to five times = 3–5×; spoczynek = 1×” |
| 7 | hormonalny / glukoza z wątroby | 6 | „Ra increased sixfold in control and both IC groups” – Sigal 1996, abstrakt (87% VO₂max) | `checked_agent` | przenieść to zdanie do `quote` (teraz jest w `locator`) albo `conversionNote`: „4× (Sigal 1994, grupa C) – 6× (Sigal 1996)” |
| 8 | hormonalny / kortyzol | 30 | „Twelve active moderately trained men performed 30 min of exercise” – Hill 2008, abstrakt | `checked_agent` | dopisać do `quote` albo `conversionNote` („30 min = czas sesji”) |
| 9 | powlokowy / parowanie potu po 10 min | 23 | „H(E) was only 22.9 +/- 6.9% of the end-exercise value” – Kenny 2008, abstrakt | `checked_agent` | `conversionNote`: „22,9% ≈ 23%” |
| 10 | pokarmowy / tempo oddawania glukozy | 6 | jak nr 7 | `checked_agent` | jak nr 7 |
| 11 | pokarmowy / wysiłek do wyczerpania | 7, 8, 1 | „GP rises seven- to eightfold” – Marliss & Vranic 2002, abstrakt | `checked_agent` | `conversionNote`: „seven- to eightfold = 7–8×” |
| 12 | pokarmowy / glukoza po 8 × 60 s | 6.6 | „glucose concentration (6.56 ± 1.44 mmol L-1)” – Bogdanis 2022, abstrakt | `checked_agent` | `conversionNote`: „6,56 ≈ 6,6” |
| 13 | wydalniczy / przepływ nerkowy przy 60% | 100 | „decreased by 20-25% in both groups at 60% VO2peak” – Kenney i Ho 1995, abstrakt | `checked_agent` | `conversionNote`: „spoczynek = 100% (punkt odniesienia)” |
| 14 | wydalniczy / frakcja filtracyjna | 2, 1 | „the filtration fraction can double with maximal exercise” – Poortmans 1994, abstrakt | `checked_agent` | `conversionNote`: „double = 2×; spoczynek = 1×” |
| 15 | limfatyczny / limfocyty | 4.0, 2.3 | Tabela 1, HIIE60: Pre 2.3 ± 0.6, Post 4.0 ± 0.9 k/μL (Bogdanis 2022, PMC9035712; wartości potwierdzone przez WebFetch) | `checked_agent` | wpisać wiersz tabeli do `quote` (teraz jest tylko w `locator`) |
| 16 | limfatyczny / odpływ limfy | 3, 6, 1 | „Exercise increased the clearance rate three- to sixfold” – Havas 1997, abstrakt | `checked_agent` | `conversionNote`: „three- to sixfold = 3–6×” |

## 1c. 9 pozycji przyjętych regułą „brzmienie dosłownie od sprawdzającego”: sprawdzone od nowa

| # | pozycja | status | cytat ≤ 15 słów + lokalizator | uwagi |
|---|---|---|---|---|
| 1 | hormonalny / „Insulina po wysiłku” | `checked_agent` | „requiring a substantial rise in insulin for 40--60 min” – Marliss & Vranic 2002, abstrakt; „Plasma insulin… doubled to 162 +/- 28 pmol/l” – Marliss 1992, abstrakt; „Plasma insulin decreased during recovery from both HIIT and MOD” – Peake 2014, abstrakt | „ok. 2×”, „40–60 min” i „spadała po interwałach przy ok. 82%” (81,6 ± 3,7%) się zgadzają. W Marliss 1992 insulina była podwyższona do ok. 20 min, a dłuższy czas (40–60 min) podaje przegląd. To nie jest sprzeczność. |
| 2 | pokarmowy / „Przepływ krwi przez wątrobę” 1,6 → 0,4 L/min | `checked_agent` | „The mean resting EHBF was 1,614 ml per minute” oraz „fell to values ranging from 820 to 390” – Rowell 1964, Results (Exa) | 0,4 L/min zgadza się też z najniższym zmierzonym EHBF (390 mL/min). Współczynników regresji z ryc. 2 nie widziałem (PMC to skan, strona za kontrolą przeglądarki), ale rachunek −1,16 × 88 + 127,89 ≈ 26% → ok. 0,42 L/min się zgadza. Do notatki warto dodać: „EHBF przy wysiłku bliskim maksimum nie mierzono” (Rowell: „EHBF measurements were not attempted… at or near… maximal oxygen intake”). Spoczynek mierzono głównie na leżąco. |
| 3 | pokarmowy / „Spadek przepływu: pień trzewny / t. krezkowa górna” | `checked_agent` | „it reduced corresponding blood flows by 32, 50 and 43 %” – Perko 1998, abstrakt pkt 3 | Kolejność: krezkowa 32%, trzewna 50%, wszystkie trzewia 43%, więc −50 / −32 się zgadza. Szczegółu „zmierzone VO₂ ok. 65%” nie sprawdziłem (abstrakt podaje tylko „submaximal cycling”). |
| 4 | pokarmowy / d_portal (sprint) „Mniej krwi z jelit do wątroby” | `checked_agent` | „reduced… blood flows by 32” (t. krezkowa) – Perko 1998; „EHBF fell” – Rowell 1964 | Pasuje do struktury: żyła wrotna zbiera krew z jelit. |
| 5 | pokarmowy / podsumowanie sprintu | `checked_agent` | „renal and splanchnic blood flow can both fall to ∼25% of resting values” – Joyner & Casey 2015, III.C; „Ra… only 4-fold in C” – Sigal 1994; „approximately 25% of lactate disposal is via gluconeogenesis” – Brooks 2020 (cytat planszy) | „kilkukrotnie” (1,6 → 0,4), „4–6 razy” i cykl Cori się zgadzają. „Glukozy we krwi przybywa”: przy 87% wzrost jest skromny (szczyt 5,2 mmol/L), ale kierunek się zgadza. |
| 6 | wydalniczy / collecting_duct (sprint) „Gdy rośnie ADH, wstawia akwaporyny (model zwierzęcy)” | `checked_agent` | „vasopressin increases the water permeability… by inducing a reversible translocation of AQP-CD” – Nielsen 1995, abstrakt (szczur); „vasopressin (ADH)… reaching statistical significance… ≥ 60%” – Freund 1991 | Zastrzeżenie „model zwierzęcy” jest potrzebne i jest. |
| 7 | wydalniczy / podsumowanie sprintu | `checked_agent` | „renal blood flow may fall to 25% of the resting value” i „sympathetic nervous activity… is involved” – Poortmans 1984; „Less than 2%… of the total estimated Lac-… was excreted” – McKelvie 1989; „Clearance by the renal system (hours to days)” – Shaw 2022 (Exa) | Filtracja i ilość moczu spadają (Freund 1991: „markedly reduced at the higher work intensities”). „W ciągu minut”: u Freunda pomiar po 20 min wysiłku, co uchodzi. |
| 8 | limfatyczny / „Otwarte okno” | `checked_agent` | „often referred to as 'the open window'” – Pedersen i Bruunsgaard 1995; „limited reliable evidence exists to support the claim” – Campbell i Turner 2018; „An issue that remains to be resolved” – Simpson 2020 (wszystkie: abstrakty) | Obie strony sporu są opisane uczciwie. |
| 9 | rozrodczy / podsumowanie sprintu | `checked_agent` | „IE and SSE each caused an increase (p<0.01) in FT” i „90-sec treadmill running at 100-110%… for 42-47 min” – Hackney 2012, abstrakt; REDs: „caused by exposure to problematic (prolonged and/or severe) low energy availability” – Mountjoy 2023, s. definicji (Exa) | Protokół i „po 12 h niżej” („FT was reduced”) się zgadzają. Drobna uwaga: „skutek tygodni” nie pada dosłownie, źródło mówi „prolonged and/or severe”. Bezpieczniej: „to skutek dłuższego niedoboru, nie jednego treningu”. |

## 2. Próba losowa opisów ról i podsumowań (`checked_agent`)

**Metoda.** Ziarno **20261126**, generator mulberry32 (skrypt w JS, kolejność plansz jak w `src/atlas/plates/index.ts`). Jednostka losowania to opis roli w jednym stanie albo podsumowanie stanu. Gdy opis jest identyczny w obu stanach i oba mają `checked_agent`, liczę go raz. Z puli wyłączyłem 5 pozycji sprawdzonych już w części 1c. Liczebność próby: max(⌈10% N⌉, 2), ale nie więcej niż pula. Razem 23 pozycje; na każdej planszy co najmniej 10% (kostny: N = 1, sprawdzona 1).

| plansza | N (opisów `checked_agent`) | próba |
|---|---|---|
| nerwowy 15 · miesniowy 16 · mozg 3 · oddechowy 12 · krwionosny 19 · hormonalny 18 · powlokowy 16 · pokarmowy 16 · wydalniczy 20 · kostny 1 · limfatyczny 6 · rozrodczy 20 | 162 | 23 |

| # | plansza / klucz (stan) | opis | cytat ≤ 15 słów + lokalizator | pasuje do struktury? | status |
|---|---|---|---|---|---|
| 1 | nerwowy / tibial (sprint) | Unerwia mięśnie łydki | „The tibial nerve supplies all motor information to the posterior compartment muscles of the leg.” – StatPearls Lower Limb Nerves (NBK532304), Structure and Function (Exa) | tak | `checked_agent` |
| 2 | nerwowy / spinal_cord (sprint) | Przekazuje rozkaz motoneuronom | „synapse at a neuron on the anterior horn” – StatPearls Corticospinal Cord Tract (NBK535423), Structure and Function (Exa) | tak | `checked_agent` |
| 3 | miesniowy / vastus_lateralis (sprint) | Prostuje kolano, amortyzuje lądowanie | „the quadriceps muscle group was the largest contributor to braking… and support” – Hamner 2010, abstrakt | tak (obszerny boczny należy do czworogłowego; prostowanie kolana to anatomia) | `checked_agent` |
| 4 | miesniowy / d_fiber_IIa (sprint) | Dołącza: pracują wszystkie | „glycogen breakdown was observed in all type I and IIA” – Vøllestad & Blom 1985, abstrakt (91% VO₂max) | tak | `checked_agent` |
| 5 | mozg / prefrontal (sprint) | Tlen rośnie, spada dopiero przy maksimum | „After peaking at hard intensities, cerebral oxygen levels dropped during very hard intensities.” – Rooks 2010, abstrakt | tak (NIRS mierzy korę przedczołową) | `checked_agent` |
| 6 | mozg / podsumowanie spoczynku | ok. 20% tlenu, głównie glukoza | „the brain accounts for about 20% of the oxygen”; „largely of the oxidation of glucose” – Raichle & Gusnard 2002, s. 10237 (Exa) | tak | `checked_agent` |
| 7 | oddechowy / intercostal (sprint) | Unoszą żebra (wdech), ściągają (wydech) | „the internal interosseous intercostals… have an expiratory function” – De Troyer 2005, abstrakt | tak | `checked_agent` |
| 8 | oddechowy / main_bronchus (sprint) | Oskrzela lekko się rozszerzają | „Exercise in healthy subjects is usually associated with progressive bronchodilatation.” – Antonelli 2012, abstrakt | tak | `checked_agent` |
| 9 | krwionosny / d_lad (sprint) | Przepływ wieńcowy ok. 3–5× większy | „three to five times the resting level” – Duncker & Bache 2008 (cytat planszy); „three- to fourfold” – Joyner & Casey 2015, III.C | tak (LAD to gałąź tętnicy wieńcowej) | `checked_agent` |
| 10 | krwionosny / brachial (sprint) | Ramiona pracują słabiej: mniej krwi, więcej pobranego tlenu | „less active arms can be supported with reduced total blood flow and more oxygen extraction” – Joyner & Casey 2015, III.B | tak | `checked_agent` |
| 11 | hormonalny / portal_vein (sprint) | Niesie glukagon i insulinę do wątroby | „the portal glucagon-to-insulin ratio causes the… increase in GP” – Marliss & Vranic 2002, abstrakt | tak | `checked_agent` |
| 12 | hormonalny / pancreas (sprint) | Zmiana niewielka: glukagon bez zmian lub lekko w górę | „plasma glucagon increased modestly in all groups” – Sigal 1994; „glucagon did not change in control subjects” – Sigal 1996 | tak | `checked_agent` |
| 13 | powlokowy / skin_forehead (sprint) | Tu pot płynie najobficiej | „high sweat rates on the forehead (1,710 g m(-2) h(-1) at I2)” – Smith & Havenith 2011, abstrakt | tak: 1710 to najwyższa wartość w abstrakcie; plecy do 1197 | `checked_agent` |
| 14 | powlokowy / skin_back (sprint) | Najmocniej pocąca się część tułowia | „highest sweat rates were observed on the central (upper and mid) and lower back” – Smith & Havenith 2011, abstrakt | tak | `checked_agent` |
| 15 | pokarmowy / portal_vein (sprint) | Mniej krwi płynie do wątroby | „EHBF fell to values ranging from 820 to 390 ml per minute” – Rowell 1964 (Exa) | tak | `checked_agent` |
| 16 | pokarmowy / d_liver (sprint) | Mniej krwi, ale dużo więcej glukozy | Rowell 1964 (jw.); „GP rises seven- to eightfold” – Marliss & Vranic 2002 | tak | `checked_agent` |
| 17 | wydalniczy / podsumowanie spoczynku | ok. 1/5 rzutu serca, 180 L/dobę, kanaliki odzyskują prawie całą wodę | „Approximately 20% of total cardiac output… is delivered to the kidneys.”; „180 L of fluid per day is filtered” – StatPearls Kidneys (NBK482385), Blood Supply (Exa) | tak | `checked_agent` |
| 18 | wydalniczy / kidney (sprint) | Mniej krwi, mniej moczu | „Urine flow… markedly reduced at the higher work intensities” – Freund 1991, abstrakt | tak | `checked_agent` |
| 19 | kostny / podsumowanie sprintu | 2,5–2,7 × masa ciała; 0,24–0,27 s; gęstość kości nie zmienia się po jednym treningu | „increased… from 2.5 BW at 3.0 m s-1 to 2.8 BW” i „decreased… from 270 to 198 ms” – Munro 1987, s. 151 i 148–149 (cytaty planszy); „median of 120 days” – Eriksen 2010 | tak | `checked_agent` (wartości z tabel 2–3 dla 3,0–3,75 m/s mieszczą się w zakresie z tekstu; samych tabel nie widziałem) |
| 20 | limfatyczny / inguinal (sprint) | Prawdopodobnie dopływa więcej limfy z pracujących nóg | „Exercise increased the clearance rate three- to sixfold” – Havas 1997, abstrakt (m. obszerny boczny) | tak (węzły pachwinowe zbierają limfę z nogi); zastrzeżenie „prawdopodobnie” jest potrzebne | `checked_agent` |
| 21 | limfatyczny / thoracic_duct (sprint) | Prawdopodobnie odprowadza więcej limfy z nóg | Havas 1997 (jw.) | tak, ale to wniosek: Havas nie mierzył przewodu piersiowego. Zastrzeżenie i poziom `preliminary_human` są na miejscu. | `checked_agent` |
| 22 | rozrodczy / testicular_vessels | Tętnica i żyła jądra, biegną z jamy brzusznej | „They arise from the anterolateral segment of the abdominal aorta” – StatPearls Testes (NBK470201), Blood Supply (Exa) | tak | `checked_agent` |
| 23 | rozrodczy / uterine_artery | Doprowadza krew do macicy | „The uterine arteries serve as the main source of perfusion.” – StatPearls Uterus (NBK470297), Blood Supply (Exa) | tak | `checked_agent` |

**Opisy `anatomy` z twierdzeniem o zmianie (więcej/mniej/rośnie).** Przeszukałem wszystkie opisy ról i podsumowania o statusie `anatomy` (więcej, mniej, rośnie, spada, szybciej, większy, zwęża, rozszerza, ↑, ↓). **Żaden nie zawiera twierdzenia o zmianie.**
Kilka opisów kostnych w stanie „sprint” mówi o działaniu pod obciążeniem, bez zmiany ilościowej. Można je zostawić jako `anatomy`, ale gdyby pojawiło się „bardziej”/„mocniej”, potrzebne będzie źródło:
- kostny / knee: „Łąkotki rozkładają nacisk przy każdym lądowaniu”;
- kostny / lumbar: „Dźwiga górną część ciała, amortyzuje kroki”;
- kostny / disc: „…amortyzuje nacisk”;
- kostny / hip_bone: „Przekazuje nacisk z nogi na kręgosłup”;
- kostny / femoral_head: „…przez niego nacisk przechodzi na miednicę”.

**Uwagi poza próbą** (zauważone przy okazji, bez statusu):
- powlokowy / cephalic, basilic, great_saphenous, small_saphenous (sprint): „Odprowadza więcej krwi ze skóry…”. Źródło (González-Alonso 2008) w ogóle nie omawia żył skóry; to wniosek z większego przepływu w skórze. Rozsądny, ale bez cytatu.
- `ScientificReferences.ts` / `statpearls_corticospinal`: autorzy w pliku to „Munakomi, Reddy, Bordoni 2026”, a strona NBK535423 w indeksie Exa podaje „Natali, Reddy, Bordoni”, aktualizacja 14.08.2023. Warto sprawdzić aktualną wersję rozdziału.

## 3. Spójność liczb między planszami

| # | temat | gdzie | co się nie zgadza | ocena | co zrobić |
|---|---|---|---|---|---|
| 1 | Adrenalina | nerwowy: 0,2 → 1,4 nmol/L (7×, 30 s sprint maks.); hormonalny: „ponad 12×” (87% VO₂max, ok. 14 min), podsumowanie i d_medulla „kilkanaście razy” | Na poziomie podstawowym czytelnik zobaczy mniejszy wzrost przy sprincie „na maksa” (7×) niż przy wysiłku submaksymalnym (> 12×). | pozorna sprzeczność (inny czas trwania); notatka hormonalna to wyjaśnia, nerwowa nie | w nerwowym dodać `seeAlsoPlate: 'hormonalny'` i dopisek „po 30 s sprintu; po kilkunastu minutach ciężkiej pracy stężenie jest wyższe” |
| 2 | Glukoza z wątroby | hormonalny i pokarmowy: 4–6×; pokarmowy: 7–8× (do wyczerpania) | brak | spójne (protokoły opisane) | – |
| 3 | Tętno | krwionosny: ok. 60 → do ok. 190/min; mozg (brainstem, medulla – niepokazywane) „wyższe tętno”; nerwowy „przyspiesza serce” | brak | spójne | – |
| 4 | Udział mięśni w rzucie serca | krwionosny: < 20 → ok. 80%; miesniowy (`unverifiable`, niepokazywany): 15–20 → 80–85% | 80 a 80–85 | drobna niespójność (liczba w mięśniowym i tak nie trafia na ekran) | ujednolicić z krwionośną (Calbet & Joyner 2010: „70–80% (or perhaps more)”) albo usunąć z mięśniowego |
| 5 | Przepływ krwi przez nerki | wydalniczy: −30% (do −50%), przy 60% VO₂peak −20–25%; źródło podsumowania wydalniczego (Poortmans 1984) i krwionośnego (Joyner & Casey): „fall to ~25% of resting” (≈ −75%) | podsumowanie wydalnicze cytuje źródło z −75%, a liczba na planszy to −30/−50% | **sprzeczność do wyjaśnienia** (różne metody: USG / klirens PAH, różne intensywności) | w notatce do „Przepływu krwi przez nerki” dopisać: „w przeglądach przy bardzo ciężkim wysiłku nawet do ok. 25% spoczynku (Poortmans 1984)” |
| 6 | Przepływ przez wątrobę i trzewia | pokarmowy: 1,6 → 0,4 L/min (−75%, przy 88%); Perko: trzewia −43% (wysiłek submaksymalny); Joyner: ok. 25% spoczynku | brak | spójne (inne intensywności) | – |
| 7 | Limfocyty po wysiłku | limfatyczny: „−30 do −60%” (przegląd), ale Bogdanis 2022 po 1 h: 2,3 → 1,7 (−26%), Nieman 1992: −36% | wartość z badania wzorcowego (−26%) leży tuż poniżej podanego zakresu | drobna | w notatce: „w interwałach 8 × 60 s spadek był mniejszy (ok. −26%)” |
| 8 | Kortyzol | hormonalny: rośnie w dłuższym albo bardzo intensywnym wysiłku (+83% po 30 min przy 80%); rozrodczy (notatka o testosteronie): po HIIT u nieaktywnych kortyzol spadał też w grupie kontrolnej (Velasco-Orjuela 2018: „Decreases in cortisol levels were -57.08”) | czytelnik może odczytać to jako sprzeczność | pozorna (rytm dobowy, inny protokół) | w rozrodczym dopisać „(spadek był też bez ćwiczeń, więc to raczej rytm dobowy)” |
| 9 | Co znaczy „Sprint” | powlokowy: koniec całego treningu 6 × 45/45 s; pozostałe: koniec 45 s pracy; hormonalny i pokarmowy dodatkowo „Liczby pochodzą z późniejszych interwałów” | inna definicja tego samego przełącznika; zdanie o „późniejszych interwałach” jest nieprawdziwe (cz. 1a nr 3 i 7) | **sprzeczność do poprawy** (zdanie) + świadoma różnica (powłokowy) | zdanie poprawić jak niżej; różnicę w powłokowym zostawić, ale w obu miejscach używać tej samej formuły („obraz pokazuje…”) |

---

## Do poprawy

| # | co | gdzie | na co |
|---|---|---|---|
| 1 | `protocolNotePl` (nieprawdziwe zdanie i zła lista protokołów) | `src/atlas/plates/hormonalny.ts` | „Sprint na tej planszy to koniec 45 s pracy przy ok. 88% VO₂max w późniejszym interwale (po kilku minutach sesji). Liczby pochodzą z badań ciągłego wysiłku przy 80–87% VO₂max, z interwałów przy ok. 82% VO₂max, z 30 s sprintu maksymalnego albo z jazdy na rowerze do wyczerpania, więc dla jednego interwału są tylko przybliżeniem.” Status zostaje `draft` do kolejnej kontroli. |
| 2 | `protocolNotePl`, ostatnie zdanie | `src/atlas/plates/pokarmowy.ts` | „Liczby pochodzą z późniejszych interwałów (po kilku minutach sesji).” → „Obraz pokazuje późniejszy interwał (po kilku minutach sesji).” |
| 3 | `protocolNotePl`, „w pierwszych sekundach” | `src/atlas/plates/powlokowy.ts` | „…zwężają się już na samym początku wysiłku (w badaniu: w pierwszej minucie)…”; źródła: Johnson 1992, Yanagimoto 2003, González-Alonso 2008 |
| 4 | vessels_sup, opis spoczynku „Umiarkowany przepływ” (`unverifiable`) | `src/atlas/plates/powlokowy.ts` | źródło z liczbą spoczynkową (do sprawdzenia) albo opis anatomiczny ze statusem `anatomy` |
| 5 | słowniczek vo2max: „albo rowerze” bez źródła | `src/atlas/glossary.ts` | dodać `blackie_1991` (test maksymalny na cykloergometrze) albo zmienić na „w teście wysiłkowym do maksimum (np. na bieżni)” |
| 6 | 11 uwag D1 (cz. 1b nr 2–14 bez 1 i 15) | 7 plansz | dopisać `conversionNote` w brzmieniu z tabeli 1b; nr 5, 7/10, 8 i 15: wydłużyć `quote` o zdanie albo wiersz tabeli |
| 7 | błąd walidatora: backspace (0x08) zamiast `\b` w `/(\d),(\d{3})\b/g` | `scripts/atlas_check_facts.mjs`, wiersz 59 | wpisać `\b` jako dwa znaki (ukośnik + „b”) |
| 8 | błąd walidatora: `\d` w szablonie `` `…[^\d.]…` `` daje `[^d.]` | `scripts/atlas_check_facts.mjs`, wiersz 60 | w szablonie użyć `\\d` (albo `String.raw`) |
| 9 | adrenalina, sprzeczność pozorna | `src/atlas/plates/nerwowy.ts`, liczba „Adrenalina w osoczu” | `seeAlsoPlate: 'hormonalny'` i dopisek o czasie trwania (cz. 3 nr 1) |
| 10 | przepływ nerkowy: inne liczby w źródle podsumowania | `src/atlas/plates/wydalniczy.ts`, notatka „Przepływ krwi przez nerki” | dopisek o „do ok. 25% spoczynku” w przeglądach (cz. 3 nr 5) |
| 11 | udział mięśni w rzucie serca 80–85 a 80 | `src/atlas/plates/miesniowy.ts` | ujednolicić z krwionośną albo usunąć (cz. 3 nr 4) |
| 12 | drobne dopiski (nieobowiązkowe) | miesniowy deltoid; pokarmowy wątroba (Rowell: EHBF nie mierzono przy maksimum); rozrodczy podsumowanie („skutek tygodni” → „dłuższego niedoboru”); limfatyczny limfocyty (−26% w 8 × 60 s); rozrodczy kortyzol (cz. 3 nr 8); kostny – źródło równania ACSM | jak w tabelach wyżej |
| 13 | metadane źródła | `src/science/ScientificReferences.ts`, `statpearls_corticospinal` | sprawdzić autorów i datę (Natali i wsp., 2023, wg indeksu) |

Statusy z tego raportu może przenieść do plansz integrator. Ja nie zmieniałem żadnego pliku poza tym raportem.
