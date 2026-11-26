# Fakty końcowe A: plansza „powlokowy” (skóra)

Sprawdzający: niezależny agent faktów (procedura `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md` §3.6 i §3.7). Data: 2026-11-26.
Zakres: 31 wierszy planszy **powlokowy** z `docs/atlas_audyt/robocze/drafts_final.md` (wiersze 19–49 tej tabeli).
Treść porównana z `src/atlas/plates/powlokowy.ts` (zgodna z tabelą), źródła z `src/science/ScientificReferences.ts`.
Skala planszy: „Sprint” = koniec treningu 6 × (45 s / 45 s) przy ok. 88% VO₂max.

## Podsumowanie statusów

| Status | Liczba |
|---|---|
| `checked_agent` | 5 |
| `anatomy` | 21 |
| `disputed` | 0 |
| `unverifiable` | 5 |
| **Razem** | **31** |

## Identyfikatory (PubMed esummary, 2026-11-26)

Wszystkie PMID i DOI zgadzają się z `ScientificReferences.ts` (autor, rok, czasopismo, tom, strony):
kenny_mcginn_2017 (PMID 27881668, DOI 10.1152/japplphysiol.00517.2016), kenny_2008 (18685528, 10.1249/MSS.0b013e31817751cb),
kenny_2007 (17622300, 10.1139/H07-044), gonzalez_alonso_2008 (17855754, PMC2375553, 10.1113/jphysiol.2007.142158),
johnson_2010 (21029188, 10.1111/j.1600-0838.2010.01206.x), periard_2021 (33829868, 10.1152/physrev.00038.2020),
smith_havenith_2011 (21153660, 10.1007/s00421-010-1744-8), baker_2019 (31608304, PMC6773238, 10.1080/23328940.2019.1632145),
wendt_2007 (17645370, 10.2165/00007256-200737080-00002), yanagimoto_2003 (12623775, 10.1152/ajpregu.00549.2002).

## Dostęp do tekstów

- Pełny tekst przeczytany: González-Alonso 2008 (PMC), Baker 2019 (PMC/Europe PMC).
- Tylko abstrakt (PubMed): Kenny 2008, Kenny 2007, Johnson 2010, Smith i Havenith 2011, Wendt 2007, Yanagimoto 2003, Périard 2021.
- Kenny i McGinn 2017: strona wydawcy (journals.physiology.org) i repozytoria blokują automaty (Cloudflare, 403). Blokady nie obchodziłem.
  Akapit „Postexercise Thermoregulatory Control” dostałem jako dosłowny fragment w wynikach wyszukiwarki Exa. Tabeli 3 nie widziałem.
- Périard 2021 (repozytorium Radboud) i pełny tekst Smith i Havenith 2011 (repozytorium UNCG): pobranie zablokowane (403 / 202), blokady nie obchodziłem.

## Tabela

| plansza | klucz | rodzaj | status | dosłowny fragment | lokalizator | uwaga |
|---|---|---|---|---|---|---|
| powlokowy | Temperatura wewnętrzna (w przełyku) | liczba | `unverifiable` | — | Kenny i McGinn 2017, tabela 3, wiersz badania (67) (niedostępna) | Pełny tekst zablokowany, abstrakt nie podaje liczb. Nie da się sprawdzić 36,8 / 38,1 / 37,4 ani tego, która kolumna to „15 min po”. `protocolMismatch` (15 min przy 75% VO₂max, 24 °C) wpisany jest słusznie. Zdanie notatki „Po treningu 6 × 45 s temperatura będzie raczej niższa” to wniosek autora, bez cytatu. Ten sam przegląd podaje, że po wysiłku przy 93% VO₂max temperatura zostaje wyższa niż po 70% („0.8°C after higher-intensity exercise”), więc kierunek nie jest oczywisty. |
| powlokowy | Ciepło oddane w odpoczynku po wysiłku (tak długim jak wysiłek) | liczba | `checked_agent` | „only 30–50% of the heat gained during exercise is lost during a recovery of similar duration” | Kenny i McGinn 2017, rozdz. „Postexercise Thermoregulatory Control”, akapit 1 | Cytat zgadza się dosłownie, z dopiskiem „(based on 1:1 work to rest ratio)”. Źródło fragmentu: indeks wyszukiwarki Exa, bo strona wydawcy blokuje automaty. Liczba, jednostka i flaga `protocolMismatch` się zgadzają. Uwaga drobna: zakresu „15–60 min” i słów „kilkanaście minut” nie ma w cytacie. Badanie kalorymetryczne, na które powołuje się przegląd (Kenny 2008), trwało 60 min wysiłku i 60 min odpoczynku. |
| powlokowy | Przepływ krwi w skórze: górna granica w wysiłku | liczba | `checked_agent` | „skin blood flow reaches an apparent upper limit at an internal temperature of around 38°C”; „estimated to be around 50% of maximal” | González-Alonso 2008, rozdz. „Skin circulation”, akapit 2; ryc. 2 (C) | Cytat zgadza się dosłownie, wielokropek obejmuje jedno zdanie. Ryc. 2: „plateau … above an internal temperature of 38°C at a level well below maximal”. Notatkę potwierdzają: „exercise limiting active vasodilator system activity” (G-A 2008) i „competing demands from skin and muscle” (Johnson 2010, abstrakt). Lokalizator warto doprecyzować nazwą rozdziału. |
| powlokowy | Parowanie potu 10 min po wysiłku | liczba | `checked_agent` | „H(E) was only 22.9 +/- 6.9% of the end-exercise value despite elevations in all core temperatures” | Kenny 2008, abstrakt (Results) | Wartość ok. 23% zgadza się. Protokół (8 osób, 60 min przy 70 W, 30 °C, 30% RH) zgadza się z abstraktem (Methods), więc `protocolMismatch` słuszny. Notatkę potwierdza fragment „despite elevations in all core temperatures”. |
| powlokowy | skin_forehead (Skóra czoła), spoczynek | opis podpisu | `unverifiable` | — | Périard 2021 (pełny tekst niedostępny); Smith i Havenith 2011, abstrakt | Abstrakty nie mówią nic o oddawaniu ciepła w spoczynku. Smith i Havenith mierzyli tylko wysiłek. Twierdzenie jest fizjologiczne (nie anatomiczne), więc bez cytatu nie dostaje statusu. |
| powlokowy | skin_trunk (Skóra tułowia), spoczynek | opis podpisu | `unverifiable` | — | jw.; González-Alonso 2008 (pełny tekst, brak takiego zdania) | Jak wyżej. Tekst G-A 2008 dotyczy wysiłku, nie spoczynkowej utraty ciepła. |
| powlokowy | external_jugular (Ż. szyjna zewnętrzna), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne położenie: żyła powierzchowna bocznej części szyi. |
| powlokowy | external_jugular (Ż. szyjna zewnętrzna), sprint | opis podpisu | `anatomy` | — | — | Jw. |
| powlokowy | cephalic (Żyła odpromieniowa), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne: żyła powierzchowna kończyny górnej („ręka” w znaczeniu całej kończyny). Dołączone źródło G-A 2008 nie opisuje anatomii żył, ale anatomia go nie wymaga. |
| powlokowy | median_cubital (Ż. pośrodkowa łokcia), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne: łączy ż. odpromieniową z odłokciową. |
| powlokowy | median_cubital (Ż. pośrodkowa łokcia), sprint | opis podpisu | `anatomy` | — | — | Jw. |
| powlokowy | basilic (Żyła odłokciowa), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne (jak cephalic). |
| powlokowy | hand_veins (Sieć żylna grzbietowa ręki), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne. Ściśle: „grzbiet ręki”. „Grzbiet dłoni” to forma potoczna, dopuszczalna. |
| powlokowy | hand_veins (Sieć żylna grzbietowa ręki), sprint | opis podpisu | `anatomy` | — | — | Jw. |
| powlokowy | great_saphenous (Żyła odpiszczelowa), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne: główna żyła powierzchowna kończyny dolnej. |
| powlokowy | skin_back (Skóra pleców), spoczynek | opis podpisu | `unverifiable` | — | Périard 2021 (niedostępny); Smith i Havenith 2011, abstrakt | Jak skin_forehead (spoczynek). |
| powlokowy | skin_back (Skóra pleców), sprint | opis podpisu | `checked_agent` | „highest sweat rates were observed on the central (upper and mid) and lower back” | Smith i Havenith 2011, abstrakt | Plecy: 1197, 1148 i 856 g/m²/h przy 75% VO₂max. Czoło jest wyżej (1710), ale to głowa, nie tułów, więc zdanie „najmocniej pocąca się część tułowia” jest trafne. Protokół: bieg 55% → 75% VO₂max, 25 °C. |
| powlokowy | small_saphenous (Żyła odstrzałkowa), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne. Zbiera krew także z bocznej części stopy. Uproszczenie „ze skóry łydki” jest dopuszczalne. |
| powlokowy | epidermis (Naskórek), spoczynek | opis podpisu | `anatomy` | „connects with the acrosyringium in the epidermis” | Baker 2019, rozdz. „Anatomy” (eccrine) | Poprawna definicja. Baker potwierdza dodatkowo położenie poru w naskórku. |
| powlokowy | dermis (Skóra właściwa), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne: naczynia, gruczoły, mieszki włosowe. |
| powlokowy | arrector_pili (Mięsień przywłosowy), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne. |
| powlokowy | arrector_pili (Mięsień przywłosowy), sprint | opis podpisu | `anatomy` | — | — | Jw. |
| powlokowy | sebaceous (Gruczoł łojowy), spoczynek | opis podpisu | `anatomy` | „Sebaceous glands … are associated with hair follicles” | Baker 2019, rozdz. „Types of sweat glands” | Poprawne. |
| powlokowy | sebaceous (Gruczoł łojowy), sprint | opis podpisu | `anatomy` | — | — | Jw. |
| powlokowy | hair_follicle (Mieszek włosowy), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne. |
| powlokowy | hair_follicle (Mieszek włosowy), sprint | opis podpisu | `anatomy` | — | — | Jw. |
| powlokowy | vessels_deep (Głęboka sieć naczyń skóry), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne: splot głęboki (skórno-podskórny) zaopatruje skórę. |
| powlokowy | hypodermis (Tkanka podskórna), spoczynek | opis podpisu | `anatomy` | — | — | Poprawne (uproszczenie: także tkanka łączna). |
| powlokowy | hypodermis (Tkanka podskórna), sprint | opis podpisu | `anatomy` | — | — | Jw. |
| powlokowy | summary (spoczynek) | podsumowanie | `unverifiable` | — | Périard 2021 (pełny tekst niedostępny; abstrakt dotyczy wysiłku w cieple) | Żaden dostępny fragment nie potwierdza zdania o niskim wytwarzaniu ciepła i spoczynkowej utracie ciepła. |
| powlokowy | summary (sprint) | podsumowanie | `checked_agent` | (1) „>75% of the energy … is liberated as heat”; (2) „At the onset of exercise, there is an initial cutaneous vasoconstriction”; (3) „nonthermal sweating and cutaneous blood flow responses are exercise intensity dependent but directionally opposite”; (4) „As exercise continues, especially in the heat, body temperature rises and the vasodilator system is activated”; (5) „Eccrine sweat glands primarily respond to thermal stimuli; particularly increased body core temperature”; (6) „highest sweat rates … on the central (upper and mid) and lower back”, „high sweat rates on the forehead”; (7) „skin and muscle are competing for blood flow, muscle wins”; (8) „decrease in sweating, skin blood flow, and skin temperature … within the early stages of recovery”; (9) „only 53% of the heat stored during 60 min of exercise was dissipated after 60 min” | (1) Wendt 2007, abstrakt; (2) G-A 2008, „Skin circulation”, akapit 1; (3) Yanagimoto 2003, abstrakt (wnioski; 60 s jazdy); (4) G-A 2008, „Skin circulation”, akapit 1; (5) Baker 2019, rozdz. „Control of eccrine sweating”; (6) Smith i Havenith 2011, abstrakt; (7) G-A 2008, „Blood flow to active muscle and cardiac output”; (8) Kenny 2007, abstrakt; (9) Kenny 2008, abstrakt (Conclusion) | Każde zdanie ma oparcie. Kolejność w czasie zgodna: zwężenie naczyń na starcie (sekundy) → pocenie od pierwszej minuty, rosnące z temperaturą → rozszerzenie naczyń → po wysiłku szybki spadek pocenia i przepływu, ciepło zostaje (Kenny i McGinn 2017: „for as long as 90 min postexercise”). Dwie drobne uwagi: Yanagimoto badał osoby lekko nagrzane (35 °C, 60 min odpoczynku w cieple), więc „może” jest tu potrzebne. Na tułowiu najmocniej pocą się plecy. |

## Do poprawy

Wartości nie zmieniałem (zgodnie z §3.6). Wiersze `unverifiable` nie trafiają na ekran, dopóki autor ich nie poprawi.

1. **Temperatura wewnętrzna** (`powlokowy.ts`, `metrics[1]`):
   - Potrzebny pełny tekst Kenny i McGinn 2017, tabela 3. Użytkownik może otworzyć stronę wydawcy w zwykłej przeglądarce.
   - Druga droga: podać badanie pierwotne (ref. 67 przeglądu) z PMID i cytatem z jego wyników.
   - Zdanie „Po treningu 6 × 45 s temperatura będzie raczej niższa” trzeba oprzeć na źródle albo usunąć. Wyższa intensywność daje większy wzrost po wysiłku (0,8 vs 0,4 °C), więc kierunek nie jest pewny. Bezpieczniej napisać: „W badaniu: 15 min ciągłej jazdy przy 75% VO₂max; po krótkim HIIT wartość może być inna”.
2. **Ciepło oddane po wysiłku** (`metrics[3]`, `protocolMismatch` i `notePl`), opcjonalnie: zamienić „15–60 min” i „kilkanaście do kilkudziesięciu minut” na to, co jest w źródle: „np. 60 min wysiłku i 60 min odpoczynku (Kenny 2008)”, albo dodać cytat, który podaje zakres.
3. **Opisy spoczynkowe skóry** (`skin_forehead`, `skin_trunk`, `skin_back`: `role.rest`) **i podsumowanie spoczynku** (`summary.rest`):
   - Dodać cytat z Périard 2021, który użytkownik może pobrać ręcznie (artykuł hybrydowy, otwarty, ale serwer blokuje automaty).
   - Albo dodać inne dostępne źródło (np. podręcznik albo przegląd w PMC) z dosłownym zdaniem o oddawaniu ciepła w spoczynku przez promieniowanie i konwekcję.
   - Albo zamienić opis na czysto anatomiczny, np. „Skóra czoła” / „Skóra tułowia” z opisem położenia.
4. **Lokalizator** `metrics[4]` (przepływ skórny): zamienić „rozdz. o przepływie skórnym” na „rozdz. »Skin circulation«, akapit 2; ryc. 2 (C)”. Kosmetyka.
5. **summary.sprint**, opcjonalnie: „najmocniej na czole i tułowiu” → „najmocniej na czole i plecach” (dokładniej wg Smith i Havenith). Jeśli zostaje mowa o pierwszej minucie, można dopisać „(w badaniu: w cieple)”.
6. **Statusy do wpisania w `powlokowy.ts`** (robi to autor albo Dyrygent, nie ja):
   - `anatomy`: 21 wierszy z tabeli;
   - `checked_agent`: `metrics[3]`, `metrics[4]`, `metrics[5]`, `skin_back.sprint`, `summary.sprint`;
   - bez zmian (`draft`) do czasu poprawek: `metrics[1]`, rest trzech skór, `summary.rest`.
