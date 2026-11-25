# Audyt faktów – plansza „Układ moczowy (wydalniczy)” (`wydalniczy.ts`)

Agent sprawdzający fakty (§3.6, §3.7), 2026-11-25. Plik źródłowy: `.claude/worktrees/atlas-wydalniczy-d343d3/src/atlas/plates/wydalniczy.ts` oraz nowe wpisy w `src/science/ScientificReferences.ts` tego worktree.
Nie czytałem raportów autora ani notatek sesji. Identyfikatory sprawdziłem w PubMed (E-utilities, efetch) i Crossref. Pełne teksty przeczytałem dla: Kawakami 2018 (Springer), Kawakami 2024 (PMC10805622), Shaw 2022 (PMC9482868). Dla pozostałych źródeł – tylko abstrakt PubMed.

## Podsumowanie

- **Sprawdzonych faktów: 52** (tytuł i podtytuł, 2 podsumowania rozbite na zdania, notka o protokole, 16 podpisów × 2 stany, 6 metryk z notatkami).
- **`checked_agent`: 27**
- **`disputed`: 8**
- **`unverifiable`: 6**
- **`anatomy`** (sam opis anatomiczny, nie fakt liczbowy ani przyczynowy): **11**
- **`protocolMismatch`**: wszystkie 6 metryk mają flagę; opisy są trafne, 2 wymagają uzupełnienia (Kawakami 2018: 4-min etapy; Del Coso: wysiłek ponadmaksymalny).

Wszystkie cytaty autora w polach `quote` występują **dosłownie** w abstraktach (6/6). Metadane wszystkich 11 źródeł (tytuł, autorzy, rok, tom, strony) zgadzają się z PubMed i Crossref.

Najważniejsze rozbieżności:
1. **„Po treningu nerki sprzątają kwas” / „nerki wydalają jego nadmiar w godzinach po treningu”** (podtytuł, podsumowanie sprintu, notatka do pH). Shaw 2022 opisuje ogólną fizjologię (nerki: „hours to days”), nie wysiłek. Źródło z samej planszy, Poortmans 1994, mówi, że nerki mają **ograniczony** udział w usuwaniu mleczanu. McKelvie 1989 (PMID 2750954) podaje, że **z moczem wydaliło się mniej niż 2%** mleczanu wytworzonego w 4 sprintach po 30 s. Kwasica po wysiłku ustępuje głównie przez spalanie mleczanu w mięśniach i wątrobie oraz przez oddech, a nie przez nerki.
2. **Tętniczka doprowadzająca „węższa”** – brak źródła. Plansza sama podaje (metryka studencka), że frakcja filtracyjna rośnie do ok. 2×. To wymaga zwężenia także (bardziej) tętniczki **odprowadzającej**. Kawakami 2018 łączy wzrost FF z układem renina–angiotensyna.
3. **Kanalik w sprincie „Aldosteron: zatrzymuje więcej soli”** – źródła potwierdzają wzrost aldosteronu (po 20-min etapach i przy 120% progu mleczanowego). Brak źródła, że aldosteron działa już w chwili 45-s sprintu. Według wiedzy podręcznikowej działa z opóźnieniem (przez geny, dziesiątki minut), ale do tego trzeba dodać źródło.
4. **Cewka zbiorcza (akwaporyny)** opiera się na Nielsen 1995 (izolowane cewki szczura). Podpis nie ma etykiety `animal_model` (typ `AtlasLabel` nie ma takiego pola), a czasu „minuty” nie ma w abstrakcie.
5. **Podsumowanie spoczynku** cytuje tylko `poortmans_1984`, a ten przegląd nie zawiera opisu filtracji, odzyskiwania wody ani dróg moczowych. Fakty są poprawne, ale trzeba podać właściwe źródło (podręcznik).
6. **Przepływ nerkowy „ok. −30%”** to raczej dolna granica. Pełny tekst Kawakami 2018 mówi, że powyżej 100% progu mleczanowego przepływ spadał dalej, a 88% VO₂max to najpewniej powyżej tego progu. Plusem jest populacja: 8 mężczyzn, **23 ± 2 lata**, prawie zgodni z osobą wzorcową.

**Kolejność w czasie (§3.7 pkt 6):** zgodna z literaturą: ADH i aldosteron mierzono w minutach (koniec 20-min albo 4-min etapu), białkomocz po wysiłku (półokres ok. 1 h), przepływ nerkowy zaraz po etapie albo 5 min po wysiłku. Wyjątek: przypisanie nerkom „sprzątania kwasu” w godzinach po treningu (pkt 1 wyżej).

## Źródła (sprawdzone identyfikatory)

| Klucz | PubMed / Crossref | Zgodność wpisu w `ScientificReferences.ts` |
|---|---|---|
| kawakami_2018 | PMID 29525855, DOI 10.1007/s10157-018-1559-1; Clin Exp Nephrol 2018;22(5):1061–8 | zgodne |
| kawakami_2024 | PMID 38262710, PMC10805622, DOI 10.14814/phy2.15925; Physiol Rep 2024;12(2):e15925 | zgodne (10 mężczyzn, 37 ± 8 lat; HIIE: 1 min przy OBLA / 2 min przy 20% VO₂peak – potwierdzone w pełnym tekście) |
| kenney_ho_1995 | PMID 8567551, DOI 10.1152/jappl.1995.79.4.1112; J Appl Physiol 79(4):1112–9 | zgodne |
| freund_1991 | PMID 1827109, DOI 10.1152/jappl.1991.70.2.900; J Appl Physiol 70(2):900–6 | zgodne (8 mężczyzn, 29,6 ± 1,9 roku) |
| poortmans_1984 | PMID 6567229, DOI 10.2165/00007256-198401020-00003; Sports Med 1(2):125–53 | zgodne |
| poortmans_1994 | PMID 7886356, DOI 10.2165/00007256-199418060-00006; Sports Med 18(6):419–37 | zgodne |
| poortmans_1985 | PMID 3965775; JAMA 253(2):236–40 | zgodne; **brakuje DOI**: Crossref podaje 10.1001/jama.1985.03350260088032 |
| del_coso_2010 | PMID 19855994, DOI 10.1007/s00421-009-1248-6; Eur J Appl Physiol 108(3):523–32 | zgodne (Crossref: wydanie online 2009-10-24, druk 2010) |
| shaw_2022 | PMID 36132879, PMC9482868, DOI 10.1016/j.bjae.2022.06.003; BJA Educ 22(10):396–401 | zgodne (jest erratum: BJA Educ 2023;23(1):39 – nie dotyczy cytowanych fragmentów, nie sprawdzałem jego treści) |
| nielsen_1995 | PMID 7532304, PMC42627, DOI 10.1073/pnas.92.4.1013; PNAS 92(4):1013–7 | zgodne; **model zwierzęcy** (cewki zbiorcze szczura in vitro) |
| zouhal_2008 | PMID 18416594, DOI 10.2165/00007256-200838050-00004 | zgodne |
| mckelvie_1989 (proponowane) | PMID 2750954, DOI 10.1152/ajpregu.1989.257.1.R102; Am J Physiol 257(1 Pt 2):R102–8 | 5 zdrowych mężczyzn, 4 × 30 s sprintu maksymalnego / 4 min przerwy, pomiary do 90 min po |

## Tabela faktów

Skróty: K18 = Kawakami 2018, K24 = Kawakami 2024, F91 = Freund 1991, P84/P94 = Poortmans 1984/1994, KH95 = Kenney i Ho 1995, DC10 = Del Coso 2010, S22 = Shaw 2022, N95 = Nielsen 1995, Z08 = Zouhal 2008. „Abstrakt” = abstrakt w PubMed.

### A. Tytuł, podsumowania, notka o protokole

| # | Fakt (dosłownie z planszy) | Źródło | Status | Cytat (≤ 15 słów) | Lokalizator | Protokół / flaga | Uwaga |
|---|---|---|---|---|---|---|---|
| 1 | „Układ moczowy (wydalniczy)” | podstawa programowa biologii kl. 5–8 | `checked_agent` | „8. Układ wydalniczy. Uczeń: … rozpoznaje elementy układu wydalniczego” | podstawa 2017, dział 8; program Nowa Era 2024 cytuje nowszą wersję: „7. Układ moczowy i wydalanie” | – | Oba brzmienia podstawy używają obu słów („moczowy”, „wydalniczy”). Tytuł pasuje do obu wersji. |
| 2 | „Dlaczego w sprincie nerki pracują ciszej” | K18, F91 | `checked_agent` | „Urine flow … glomerular filtration rate … markedly reduced at the higher work intensities” | F91, abstrakt | 20-min etapy | – |
| 3 | „a po treningu sprzątają kwas” | S22 (pośrednio) | `disputed` | P94: „renal excretion plays a limited role in lactate metabolism” | P94, abstrakt; McKelvie 1989, abstrakt | – | Nerki wydalają mniej niż 2% mleczanu (McKelvie 1989). Kwasica po wysiłku ustępuje głównie przez metabolizm mleczanu i oddech. Zmienić np. na „a po treningu odzyskują przepływ” albo „i oszczędzają wodę”. |
| 4 | Podsumowanie spoczynku: „przez nerki płynie dużo krwi… kanaliki odzyskują… prawie całą wodę i sól… moczowodami do pęcherza” | `poortmans_1984` | `disputed` (złe źródło) | – (P84 nie zawiera tych twierdzeń) | – | – | Fakty są podręcznikowo poprawne, ale podane źródło ich nie zawiera. Podać podręcznik (np. OpenStax *Anatomy and Physiology 2e*, rozdz. 25) albo przegląd z liczbą (np. ok. 20% rzutu serca, ok. 99% przesączu wraca do krwi). |
| 5 | „W sprincie nerka dostaje mniej krwi: układ współczulny zwęża jej naczynia, a krew płynie do pracujących mięśni.” | K18, P84, KH95 | `checked_agent` | „sympathetic nervous activity and the release of catecholamine substances is involved” | P84, abstrakt; K18 abstrakt („The sympathetic nervous system may be involved”); KH95 abstrakt, zdanie 1 | K18: 4-min etapy; KH95: 60% VO₂peak | K18 pisze ostrożnie („may be involved”). Warto zostawić słowo „głównie”, nie „tylko”. |
| 6 | „Nerki przesączają mniej i tworzą mniej moczu” | F91 | `checked_agent` | „Changes in urine flow paralleled changes in glomerular filtration rate (r = 0.91)” | F91, abstrakt | 20-min etapy przy 25–80% VO₂max | Przy 25% VO₂max obie wartości rosły; spadek dotyczy wyższych obciążeń. |
| 7 | „hormony ADH i aldosteron, rosnące w ciągu minut ciężkiej pracy, każą oszczędzać wodę i sól” | F91, P84, K18 | `checked_agent` | „Increased aldosterone production helps the body to maintain sodium by increasing its reabsorption” | P84, abstrakt; F91, abstrakt; K18 pełny tekst, Results Study 2 (aldosteron ↑ przy 120% LaBP, Fig. 3e) | F91: 20 min; K18: 4-min etapy | Wzrost hormonów: potwierdzony (minuty). Samo działanie aldosteronu jest wolniejsze; zob. #37. |
| 8 | „Kwas z mięśni najpierw buforuje krew i wydycha oddech” | S22, DC10 | `checked_agent` (treść) | „Neutralisation via buffer systems (seconds to minutes)” | S22, sekcja „Balance between acid–base production and clearance” | S22 nie dotyczy wysiłku | **Język:** podmiotem jest „kwas”, więc zdanie mówi, że to kwas buforuje krew i wydycha oddech. Proponuję: „Kwas z mięśni najpierw wiążą bufory krwi, a część usuwa oddech (jako CO₂)”. |
| 9 | „nerki wydalają jego nadmiar dopiero w godzinach po treningu” | S22 | `disputed` | S22: „Clearance by the renal system (hours to days)” – zdanie ogólne, nie o wysiłku | S22, ta sama sekcja; przeciw: P94 abstrakt, McKelvie 1989 abstrakt | – | Jak #3. Nerki mają udział niewielki (mniej niż 2% mleczanu). Proponuję: „resztę kwasu w ciągu kilkudziesięciu minut zużywają mięśnie i wątroba; nerki wydalają tylko niewielką część”. To nowe zdanie wymaga źródła (np. DC10: „maximized H(+) and lactate removal”). |
| 10 | protocolNotePl: „Badania nerek mierzyły zwykle dłuższy wysiłek albo stan tuż po nim…” | K18, F91, KH95, DC10 | `checked_agent` | K18: „RBF was measured … immediately after each exercise in Study 2” | K18, abstrakt (Methods) | – | Trafne. |

### B. Podpisy (16 struktur × spoczynek/sprint)

| # | Fakt (dosłownie z planszy) | Źródło | Status | Cytat (≤ 15 słów) | Lokalizator | Protokół / flaga | Uwaga |
|---|---|---|---|---|---|---|---|
| 11 | Nerka (ren), spoczynek: „Dużo krwi: przesącza osocze, tworzy mocz” | K18, F91 | `unverifiable` | – | – | – | „Dużo krwi” nie występuje w podanych źródłach. Dodać źródło podręcznikowe (ok. 20% rzutu serca). Nazwa „ren” zgodna z TA2. |
| 12 | Nerka, sprint: „Mniej krwi, mniej moczu (stąd przygaszona)” | K18, F91 | `checked_agent` | „RBF after maximum exercise decreased by 51% in Study 1.” | K18, abstrakt (Results); F91, abstrakt | K18: wysiłek maksymalny | – |
| 13 | Miedniczka nerkowa (pelvis renalis), spoczynek: „Zbiera mocz z kielichów nerki” | – | `anatomy` | – | – | – | Nazwy PL i łac. poprawne (TA2: pelvis renalis). |
| 14 | Miedniczka, sprint: „Spływa do niej mniej moczu” | F91 | `checked_agent` | „Urine flow … markedly reduced at the higher work intensities” | F91, abstrakt | 20-min etapy | Wniosek z mniejszej ilości moczu. |
| 15 | Tętnica nerkowa (arteria renalis), spoczynek: „Doprowadza krew z aorty do nerki” | – | `anatomy` | – | – | – | Poprawne. |
| 16 | Tętnica nerkowa, sprint: „Węższa: mniej krwi dla nerki” | K18 | `checked_agent` | „due to decreased cross-sectional area rather than time-averaged flow velocity” | K18, abstrakt (Conclusions); pełny tekst Results Study 2, Fig. 2c (pole przekroju tętnicy nerkowej ↓ przy 120 i 140% LaBP) | 4-min etapy powyżej progu mleczanowego | K18 mierzył USG właśnie tętnicę nerkową. Dodać to miejsce jako lokalizator. |
| 17 | Żyła nerkowa (vena renalis), spoczynek | – | `anatomy` | – | – | – | Poprawne. |
| 18 | Żyła nerkowa, sprint: „Mniej krwi wraca z nerki” | K18 | `checked_agent` | jak #12 | K18, abstrakt | – | Logiczna konsekwencja mniejszego przepływu. |
| 19 | Moczowód (ureter), spoczynek: „Przesuwa mocz do pęcherza” | – | `anatomy` | – | – | – | Poprawne (perystaltyka). |
| 20 | Moczowód, sprint: „Płynie nim mniej moczu” | F91 | `checked_agent` | jak #14 | F91, abstrakt | 20-min etapy | – |
| 21 | Pęcherz moczowy (vesica urinaria), spoczynek: „Gromadzi mocz” | – | `anatomy` | – | – | – | TA2: vesica urinaria. Poprawne. |
| 22 | Pęcherz, sprint: „Gromadzi mocz (bez zmian w czasie serii)” | brak | `unverifiable` | – | – | – | „Bez zmian” to twierdzenie bez źródła (dopływ moczu maleje). Proponuję samo „Gromadzi mocz”. |
| 23 | Cewka moczowa (urethra), oba stany | – | `anatomy` | – | – | – | Poprawne. |
| 24 | Nadnercze (glandula suprarenalis), spoczynek: „Mało adrenaliny we krwi” | Z08 | `checked_agent` | „reported 1.5 to >20 times basal concentrations depending on exercise characteristics” | Z08, abstrakt | przegląd | Nazwa zgodna z TA2. |
| 25 | Nadnercze, sprint: „Wyrzut adrenaliny (plansza hormonalna)” | Z08, K18 | `checked_agent` | jak #24; K18: adrenalina ↑ istotnie przy 100% LaBP | Z08, abstrakt; K18 pełny tekst, Fig. 3a | – | Można dopisać `kawakami_2018` (ten sam wysiłek co przepływ nerkowy). |
| 26 | Aorta brzuszna (pars abdominalis aortae), spoczynek | – | `anatomy` | – | – | – | TA2 dopuszcza „pars abdominalis aortae” i „aorta abdominalis”. Poprawne. |
| 27 | Aorta, sprint: „Więcej krwi, głównie do mięśni nóg” | KH95 | `checked_agent` | „increases in skin and active muscle blood flows are supported by increasing cardiac output” | KH95, abstrakt, zdanie 1 | jazda na rowerze, 60% VO₂peak | „Nóg”: badanie na cykloergometrze, więc pracowały mięśnie nóg. Dobrze. |
| 28 | Żyła główna dolna (vena cava inferior), spoczynek | – | `anatomy` | – | – | – | Poprawne. |
| 29 | Żyła główna dolna, sprint: „Więcej krwi wraca z nóg” | brak | `unverifiable` | – | – | – | Prawdopodobne (większy rzut serca = większy powrót żylny), ale brak `referenceIds`. Dodać np. `kenney_ho_1995` (wzrost rzutu serca) albo źródło o powrocie żylnym. |
| 30 | Kłębuszek nerkowy (glomerulus), spoczynek: „Przesącza osocze z krwi” | – | `anatomy` | – | – | – | Łacina: Wikipedia/TH podają „glomerulus renalis”. Lepiej uzupełnić. |
| 31 | Kłębuszek, sprint: „Mniej krwi, przesącza mniej” | F91, P94 | `checked_agent` | F91: „glomerular filtration rate … markedly reduced at the higher work intensities” | F91, abstrakt | 20-min etapy | Uwaga: w K18 eGFR z cystatyny nie zmieniał się, a eGFR z kreatyniny spadał przy 120–140% LaBP. Kierunek „mniej” jest zgodny z F91 i P84. |
| 32 | Torebka kłębuszka (capsula glomeruli), spoczynek: „Zbiera przesącz (mocz pierwotny)” | – | `anatomy` | – | – | – | Nazwa łacińska poprawna (w TH także „capsula glomerularis”). |
| 33 | Torebka, sprint: „Zbiera mniej przesączu” | F91 | `checked_agent` | jak #31 | F91, abstrakt | – | – |
| 34 | Tętniczka doprowadzająca (arteriola glomerularis afferens), spoczynek | – | `anatomy` | – | – | – | Nazwa zgodna z TA2. |
| 35 | Tętniczka doprowadzająca, sprint: „Węższa (ilustracja): mniej krwi” | P84 | `disputed` | – (P84 nie wspomina tętniczek) | – | – | Brak źródła dla tętniczki **doprowadzającej**. Frakcja filtracyjna rośnie do ok. 2× (P94, #52), a K18 łączy to z układem renina–angiotensyna. To oznacza silniejsze zwężenie tętniczki **odprowadzającej**. Zmienić na „naczynia nerki się zwężają” albo pokazać obie tętniczki ze źródłem. |
| 36 | Kanalik nerkowy (tubulus renalis), spoczynek: „Odzyskuje wodę, sól i glukozę” | F91 | `unverifiable` | – | – | – | Fakt podręcznikowy, F91 go nie zawiera. Dodać źródło podręcznikowe. |
| 37 | Kanalik, sprint: „Aldosteron: zatrzymuje więcej soli” | F91, P84 | `disputed` (moment) | P84: „Increased aldosterone production helps the body to maintain sodium” | P84, abstrakt | F91: 20 min; K18: 120% LaBP | Mechanizm jest potwierdzony, ale nie w chwili 45-s sprintu. W sprincie mniejsze wydalanie sodu wynika ze spadku filtracji i pracy nerwów współczulnych. Przenieść do stanu „po” albo zmienić na „Mniej przesączu: mniej soli w moczu”. Opóźnienie działania aldosteronu wymaga źródła. |
| 38 | Pętla nefronu (Henlego) (ansa nephroni): „Zagęszcza wnętrze nerki” (oba stany) | brak | `unverifiable` | – | – | – | Nazwy poprawne (ZPE: „pętla nefronu (pętla Henlego)”). Opis niejasny i bez źródła. Proponuję: „Tworzy słony (stężony) płyn w rdzeniu nerki”, ze źródłem podręcznikowym. |
| 39 | Cewka zbiorcza (tubulus renalis colligens), spoczynek: „Mało akwaporyn: część wody zostaje w moczu” | N95 | `checked_agent` (`animal_model`) | „vasopressin increases the water permeability of collecting duct cells” | N95, abstrakt (Conclusions) | szczur, cewki in vitro | „Mało” to porównanie z działaniem ADH. Konieczna etykieta modelu zwierzęcego. |
| 40 | Cewka zbiorcza, sprint: „Po serii (minuty) ADH: więcej akwaporyn (ilustracja)” | F91, N95 | `disputed` (formalnie) | N95: „inducing a reversible translocation of AQP-CD water channels from IVs to the APM” | N95, abstrakt | szczur in vitro; ADH u ludzi: F91 (20 min) | (a) Podpis nie ma etykiety `animal_model` (typ `AtlasLabel` nie ma pola poziomu dowodu – sprawa dla integratora). (b) Czasu „minuty” dla przemieszczenia akwaporyn nie ma w abstrakcie N95. Pełny tekst PNAS był niedostępny. Potrzebny cytat z czasem albo usunięcie „(minuty)”. |

**Nazewnictwo (pkt 7):** wszystkie nazwy łacińskie są zgodne z TA2/TH (sprawdzone m.in. w infoboksach Wikipedii z kodami TA2/TH). Dwie drobne uwagi:
- „glomerulus” → lepiej „glomerulus renalis”;
- „Cewka zbiorcza” – podręczniki szkolne (ZPE) mówią „kanalik zbiorczy”. Proponuję „Kanalik zbiorczy (cewka zbiorcza)”, żeby licealista rozpoznał nazwę z podręcznika.

Reszta polskich nazw („torebka kłębuszka”, „pętla nefronu (Henlego)”, „miedniczka nerkowa”, „nadnercze”, „aorta brzuszna”) zgadza się z ZPE i polskim mianownictwem anatomicznym.

### C. Metryki

| # | Fakt (dosłownie z planszy) | Źródło | Status | Cytat (≤ 15 słów) | Lokalizator | Protokół / flaga | Uwaga |
|---|---|---|---|---|---|---|---|
| 41 | Przepływ krwi przez nerki, sprint: „ok. −30% (do −50%)” | K18 | `checked_agent` | „showed a significant decrease (31%) at 100% LaBP compared with at rest” | K18, abstrakt (Results); pełny tekst Results Study 2, Fig. 2a | `protocolMismatch` trafny; dopisać: „etapy po 4 min, kolejno 60–140% LaBP” | Cytat autora dosłowny, przeliczenia poprawne. Pełny tekst: „RBF decreased further depending on the exercise intensity thereafter”. 88% VO₂max to najpewniej powyżej progu mleczanowego, więc −31% to dolna granica. Populacja: 8 mężczyzn, 23 ± 2 lata (Table 1) – zgodna z osobą wzorcową. |
| 42 | Przepływ krwi przez nerki, spoczynek: „100%” | K18 | `checked_agent` | „compared with at rest” | K18, abstrakt | – | Punkt odniesienia; `conversionNote` poprawna. |
| 43 | Notatka: „Interwały krótkie i lżejsze (1 min / 2 min) w innym badaniu nie obniżyły przepływu mierzonego po wysiłku.” | brak w `referenceIds` (to K24) | `disputed` (formalnie) | K24: „no condition-by-time interaction (p = 0.614) … regarding renal blood flow” | K24, abstrakt | HIIE: 1 min przy OBLA / 2 min przy 20% VO₂peak; 10 mężczyzn, 37 ± 8 lat | Treść jest prawdziwa, ale `kawakami_2024` trzeba dodać do `referenceIds`. Słowo „lżejsze” bez porównania – lepiej „krótsze (1 min pracy przy progu OBLA, 2 min odpoczynku)”. |
| 44 | Hormony (ADH, aldosteron), sprint: „rosną (od ok. 60% VO₂max)” | F91 | `checked_agent` | „reaching statistical significance when the level of exercise reached greater than or equal to 60%” | F91, abstrakt | `protocolMismatch` trafny („20 min ciągłej jazdy przy 25–80% VO₂max”) | Cytat autora dosłowny. Populacja: 8 mężczyzn, 29,6 ± 1,9 roku – zgodna. `measuredAt` („zaraz po 20-min etapie”) zgodny z abstraktem („immediately after four 20-min bouts”). |
| 45 | Notatka: „…spadały filtracja w kłębuszkach i ilość moczu. ADH każe cewce zbiorczej odzyskiwać wodę.” | F91 | `checked_agent` | P84: „Changes in urine flow are dependent on the plasma antidiuretic hormone levels” | F91 i P84, abstrakty | – | Zdanie o ADH nie ma źródła w `referenceIds` tej metryki. Dodać `poortmans_1984` (u ludzi) albo `nielsen_1995` z etykietą `animal_model`. |
| 46 | Białko w moczu, sprint: „po wysiłku przejściowo więcej; połowa znika w ok. 1 h” | P84, P94, P85 | `checked_agent` | „a transient state with a half-time of approximately 1 hour” | P84, abstrakt (to samo w P94: „half-time decay of about 1 hour”) | `protocolMismatch` trafny (przegląd) | Cytat autora dosłowny. Uwaga: to wartość „po”, nie „w sprincie”. `measuredAt` mówi to poprawnie, ale kolumna „sprint” może mylić. |
| 47 | Notatka: „Białkomocz wysiłkowy zależy od intensywności, nie od czasu trwania. Jest przejściowy i nie jest chorobą.” | P84, P85 | `unverifiable` (część) | „directly related to the intensity of exercise, rather than to its duration” | P84, abstrakt; P85, abstrakt | – | Pierwsze dwa zdania: potwierdzone. „Nie jest chorobą” – brak w abstraktach. Usunąć albo podać źródło (np. przegląd o łagodnym białkomoczu wysiłkowym). |
| 48 | pH krwi, sprint: „ok. 7,2” | DC10 | `checked_agent` | „increased plasma pH (7.32 +/- 0.02 vs. approximately 7.22 +/- 0.03; P < 0.05)” | DC10, abstrakt | `protocolMismatch` trafny; dopisać, że 163% progu kompensacji oddechowej to wysiłek **ponadmaksymalny** | Cytat autora dosłowny. 7,2 to grupy z krótszą przerwą (S, M). Populacja: 11 umiarkowanie wytrenowanych mężczyzn (wiek nie podany w abstrakcie). Próbki: krew arterializowana. |
| 49 | pH krwi, spoczynek: „ok. 7,4” | S22 | `checked_agent` | „The normal blood pH is 7.35–7.45” | S22, sekcja „What is acidosis and what is its relevance?” | – | Komentarz w kodzie („brak cytatu z 7,4”) jest nieaktualny: cytat jest w S22. Dopisać go i ten lokalizator, potem zmienić `restStatus`. |
| 50 | Notatka: „Kwas z mięśni najpierw buforuje krew i usuwa oddech (minuty), a nerki wydalają jego nadmiar w godzinach po treningu.” | S22 | `disputed` | S22: „Exhalation by the respiratory system (minutes to hours)” | S22, sekcja „Balance between acid–base production and clearance” | S22 nie dotyczy wysiłku | Jak #8 i #9: (a) niejasny podmiot zdania; (b) oddech według S22 to „minuty–godziny”; (c) udział nerek jest niewielki (P94; McKelvie 1989: mniej niż 2% mleczanu). |
| 51 | Przepływ nerkowy przy 60% VO₂peak: „−20–25%” (studenci) | KH95 | `checked_agent` | „then decreased by 20-25% in both groups at 60% VO2peak” | KH95, abstrakt | `protocolMismatch` trafny | Cytat autora dosłowny. Populacja: 6 młodych (26 ± 2 lata) i 6 starszych (64 ± 2 lata) mężczyzn. Pomiar klirensem PAH w trakcie jazdy. |
| 52 | Frakcja filtracyjna: „1× → do ok. 2×” (studenci) | P94 | `checked_agent` | „the filtration fraction can double with maximal exercise” | P94, abstrakt | `protocolMismatch` trafny (wysiłek maksymalny) | Cytat autora dosłowny. Potwierdza K18 (pełny tekst: FF ↑ istotnie przy 120% LaBP, Fig. 4c). Warto dodać `kawakami_2018`. |

## Do poprawy przez autora

1. **`subtitlePl`** – „a po treningu sprzątają kwas” → zmienić (#3). Nerki nie są głównym miejscem usuwania kwasu po wysiłku (P94; McKelvie 1989, PMID 2750954).
2. **`summary.sprint`**, ostatnie zdanie (#8, #9):
   - poprawić podmiot („Kwas z mięśni najpierw wiążą bufory krwi, a część usuwa oddech jako CO₂”);
   - zmienić twierdzenie o nerkach na zgodne z P94 i McKelvie 1989 (nerki wydalają tylko niewielką część; resztę zużywają mięśnie i wątroba);
   - dodać `poortmans_1994` (i ewentualnie nowy `mckelvie_1989`) do `summaryReferenceIds.sprint`.
3. **Metryka „pH krwi”, `notePl`** (#50) – ta sama poprawka co w pkt 2.
4. **Metryka „pH krwi”, spoczynek** (#49) – dodać cytat S22 „The normal blood pH is 7.35–7.45” z lokalizatorem „Shaw 2022, sekcja ‘What is acidosis and what is its relevance?’”. Usunąć nieaktualny komentarz. W `protocolMismatch` dopisać „wysiłek ponadmaksymalny” (#48).
5. **`summary.rest`** (#4) – zamienić `poortmans_1984` na źródło podręcznikowe, które opisuje filtrację, odzyskiwanie wody i soli oraz drogi moczowe.
6. **Podpis `afferent`, sprint** (#35) – usunąć „węższa” dla samej tętniczki doprowadzającej albo pokazać też odprowadzającą. Bez źródła o tętniczkach dać tekst ogólny: „Naczynia nerki zwężone: mniej krwi”.
7. **Podpis `tubule`, sprint** (#37) – „Aldosteron: zatrzymuje więcej soli” przenieść do opisu „po wysiłku” albo zmienić na „Mniej przesączu: mniej soli w moczu” (F91). Jeśli aldosteron zostaje, dodać źródło o czasie jego działania.
8. **Podpis `collecting_duct`** (#39, #40) – oznaczyć jako model zwierzęcy. Integrator powinien dodać pole poziomu dowodu do `AtlasLabel` albo dopisek w tekście „(badania na szczurach)”. Usunąć „(minuty)” albo podać cytat z czasem przemieszczenia akwaporyn.
9. **Metryka „Przepływ krwi przez nerki”** (#41, #43):
   - dodać `kawakami_2024` do `referenceIds`;
   - „lżejsze” zastąpić konkretem (1 min przy OBLA / 2 min przy 20% VO₂peak);
   - w `protocolMismatch` dopisać „etapy po 4 min”;
   - rozważyć dopisek, że przy 88% VO₂max spadek jest najpewniej większy niż 31% (pełny tekst K18: „RBF decreased further depending on the exercise intensity thereafter”).
10. **Metryka „Hormony”, `notePl`** (#45) – zdanie o ADH i cewce zbiorczej: dodać `poortmans_1984` do `referenceIds` (albo `nielsen_1995` z etykietą `animal_model`).
11. **Metryka „Białko w moczu”, `notePl`** (#47) – usunąć „i nie jest chorobą” albo dodać źródło.
12. **Podpisy bez źródła** (#11, #22, #29, #36, #38):
    - nerka spoczynek „Dużo krwi”, kanalik spoczynek, pętla nefronu – dodać źródło podręcznikowe;
    - pęcherz sprint – usunąć „(bez zmian w czasie serii)”;
    - żyła główna dolna sprint – dodać `kenney_ho_1995` albo inne źródło.
13. **Nazewnictwo:** `glomerulus` → `glomerulus renalis`; „Cewka zbiorcza” → „Kanalik zbiorczy (cewka zbiorcza)” (zgodnie z ZPE). Pozostałe nazwy bez zmian.
14. **`ScientificReferences.ts`** – `poortmans_1985`: dopisać `doi: '10.1001/jama.1985.03350260088032'` (Crossref). Opcjonalnie dodać `mckelvie_1989` (PMID 2750954, DOI 10.1152/ajpregu.1989.257.1.R102), ale tylko z flagą protokołu: 4 × 30 s sprint maksymalny.
15. **Podpisy `adrenal` i metryka FF** – opcjonalnie dodać `kawakami_2018` (adrenalina ↑ przy 100% LaBP; FF ↑ przy 120% LaBP, ten sam protokół co przepływ nerkowy).
