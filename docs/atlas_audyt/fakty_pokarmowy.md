# Audyt faktów: plansza `pokarmowy`

Agent sprawdzający fakty (procedura §3.6 i §3.7 `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md`). Data: 2026-11-26.
Plik planszy: `.claude/worktrees/atlas-pokarmowy-b0b770/src/atlas/plates/pokarmowy.ts` oraz wpisy w `src/science/ScientificReferences.ts` tego samego worktree. Raportów autora ani notatek sesji nie czytałem. Plików planszy nie zmieniałem.

## Podsumowanie

- **Sprawdzonych faktów: 37.** Obejmują 2 podsumowania, 30 podpisów (rest i sprint osobno, gdy się różnią) i 5 metryk z notatkami.
- **`checked_agent`: 17.** Jeden z nich (#1) jest oznaczony † i wymaga dopisania referencji.
- **`anatomy`: 16.** Opisy czysto anatomiczne są poprawne.
- **`disputed`: 4.** To podsumowanie sprintu (cykl Cori), jelito grube w sprincie (złe źródło), żyła wrotna w zbliżeniu w sprincie (cykl Cori) i metryka przepływu przez wątrobę (zakres).
- **`unverifiable`: 0.**
- **`protocolMismatch`:** wszystkie 5 metryk ma trafną flagę. Żadne źródło nie opisuje 6 × 45 s przy 88% VO₂max. Najbliżej są Rowell 1964 (wysiłek ciągły 26–97% VO₂max) i Marliss 1992 (ok. 100% VO₂max do wyczerpania). Opis protokołu Perko 1998 trzeba uściślić (75% VO₂max, półleżąco).
- **Momenty (`measuredAt`):**
  - glukoza: „4 min po wysiłku” zgadza się ze źródłem;
  - produkcja glukozy: „w chwili wyczerpania” się zgadza;
  - przepływ wątrobowy: „od 5. minuty” się zgadza.
- **Cykl Cori „głównie w przerwach i po serii”:** to twierdzenie nie ma pokrycia w podanym źródle. Brooks 2020 pisze, że glukoneogeneza z mleczanu wspiera glikemię „during postabsorptive (fasted) rest and physical exercise”. Nie pisze, że dzieje się to głównie po wysiłku. Potrzebne jest inne źródło albo inne sformułowanie.
- **Spory i dane zwierzęce:** brak na tej planszy.

**Najważniejsze rozbieżności:**
1. **Przepływ przez wątrobę w sprincie „ok. 0,4–0,8 L/min”.** Cytat jest dosłowny, ale zakres 820–390 ml/min dotyczy wszystkich intensywności, także łagodnych. Regresja Rowella dla 88% VO₂max daje ok. 26% klirensu spoczynkowego, czyli ok. 0,4 L/min. Wartość „sprint” powinna wynosić ok. 0,4 (z `conversionNote`), a nie 0,4–0,8.
2. **Cykl Cori „głównie w przerwach i po serii”** (podsumowanie sprintu i żyła wrotna w zbliżeniu). Brak źródła, a podane źródło (Brooks 2020) mówi o glukoneogenezie z mleczanu także w trakcie wysiłku.
3. **Jelito grube, sprint: „Dostaje mniej krwi” ze źródłem Rowell 1964.** Rowell mierzył całkowity przepływ wątrobowy, nie jelito grube. Właściwe źródło to Perko 1998: t. krezkowa górna −32%, a ona zaopatruje okrężnicę wstępującą (`colon ascendens`).

## Weryfikacja źródeł (PubMed efetch, 2026-11-26)

| id w repo | PMID | DOI | Zgodność metadanych | Co czytałem |
|---|---|---|---|---|
| `rowell_1964` | 14201551 (PMC441967) | 10.1172/JCI105043 | tak: Rowell LB, Blackmon JR, Bruce RA, J Clin Invest 1964;43(8):1677–90 | pełny tekst (OCR wersji JCI) |
| `marliss_vranic_2002` | 11815492 | 10.2337/diabetes.51.2007.s271 | tak: Marliss EB, Vranic M, Diabetes 2002;51 Suppl 1:S271–83 | abstrakt |
| `marliss_1992` | 1458713 | brak DOI | tak: Marliss EB i in., Clin Invest Med 1992;15(5):406–19 | abstrakt (wszystkie liczby planszy są w abstrakcie) |
| `perko_1998` | 9824727 (PMC2231328) | 10.1111/j.1469-7793.1998.907ba.x | tak: Perko MJ i in., J Physiol 1998;513(Pt 3):907–13 | pełny tekst (PMC), Metody |
| `brooks_2020` | 32113910 (PMC7284908) | 10.1016/j.redox.2020.101454 | tak: Brooks GA, Redox Biol 2020;35:101454 | pełny tekst (PMC) |
| *proponowane:* Bogdanis i in. 2022 | 35510255 (PMC9035712) | 10.1016/j.jesf.2022.03.005 | tak (zob. audyt limfatyczny) | pełny tekst |

## Tabela faktów

Oznaczenia: PM = `protocolMismatch`; † = `checked_agent` pod warunkiem dopisania wskazanej referencji do `referenceIds` / `summaryReferenceIds`.

| # | fakt na planszy (dosłownie) | źródło | status | cytat (≤ 15 słów) | lokalizator | protokół / flaga | uwaga |
|---|---|---|---|---|---|---|---|
| 1 | summary.rest: „przez samą wątrobę płynie ok. 1,6 litra krwi na minutę. Przewód pokarmowy trawi i wchłania pokarm, a wątroba powoli oddaje do krwi glukozę.” | Rowell 1964 (+ Marliss 1992) | `checked_agent` † | „The mean resting EHBF was 1,614 ml per minute” | Rowell 1964, Results, akapit o EHBF (tab. II, 7 mężczyzn) | spoczynek | 1614 ml/min ≈ 1,6 L/min. „Powoli oddaje glukozę” potwierdza Marliss 1992 (Ra w spoczynku ok. 1,9 mg/kg/min, skoro 13,0 to 7×). Dopisać `marliss_1992` do `summaryReferenceIds.rest`. |
| 2 | summary.sprint: „…Przepływ przez wątrobę spada kilkukrotnie. […] oddaje do krwi glukozę ok. 7–8 razy szybciej […] glukozy we krwi przybywa. Część mleczanu […] (cykl Cori), głównie w przerwach i po serii.” | Rowell; Perko; Marliss 2002; Marliss 1992; Brooks 2020 | `disputed` | „glycemia is supported by gluconeogenesis from lactate during postabsorptive (fasted) rest and physical exercise” | Brooks 2020, rozdz. „Gluconeogenesis from Lactate” | PM jak w metrykach | Zdania o przepływie, glukozie 7–8× i wzroście glikemii się zgadzają. Rowell: przy 88% VO₂max regresja daje spadek ok. 74%, czyli ok. 3,9×, więc „kilkukrotnie” jest OK. Fraza „głównie w przerwach i po serii” nie ma źródła, a Brooks mówi o wysiłku i spoczynku. Usunąć frazę albo podać źródło dla interwałów. |
| 3 | Przełyk / oesophagus: „Przesuwa pokarm do żołądka” | – | `anatomy` | – | – | – | Poprawne (TA2: oesophagus). |
| 4 | Żołądek / gaster, rest: „Trawi pokarm, dużo krwi” | Perko 1998 | `checked_agent` | „reduced corresponding blood flows by 32, 50 and 43 %” | Perko 1998, abstrakt pkt 3 | – | Słowo „dużo” jest względne. W spoczynku przepływ w pniu trzewnym to ok. 0,84 L/min (z 0,42 = 50%). Dopuszczalne. |
| 5 | Żołądek, sprint: „Dostaje mniej krwi niż w spoczynku” | Perko 1998 | `checked_agent` | „reduced corresponding blood flows by 32, 50 and 43 %” | Perko 1998, abstrakt pkt 3 | PM: 75% VO₂max, półleżąco | Żołądek zaopatruje pień trzewny (−50%). |
| 6 | Wątroba / hepar, rest: „Powoli oddaje glukozę do krwi” | Marliss 2002, Marliss 1992 | `checked_agent` | „Ra increased 7-fold by exhaustion to 13.0 +/- 1.18 mg/kg/min” | Marliss 1992, abstrakt | – | Wartość spoczynkowa wynika z ilorazu (ok. 1,9 mg/kg/min). `marliss_1992` jest już w `referenceIds`. |
| 7 | Wątroba, sprint: „Oddaje glukozę ok. 7–8× szybciej” | Marliss 2002 | `checked_agent` | „in intense exercise, GP rises seven- to eightfold and GU rises three- to fourfold” | Marliss & Vranic 2002, abstrakt; Marliss 1992, abstrakt | PM trafny: > 80% VO₂max, do wyczerpania | Ra to produkcja całego ciała, głównie wątroby. Dopuszczalne uproszczenie. |
| 8 | Pęcherzyk żółciowy / vesica biliaris: „Przechowuje żółć” | – | `anatomy` | – | – | – | Poprawne (TA2: vesica biliaris). |
| 9 | Jelito cienkie / intestinum tenue, rest: „Wchłania składniki pokarmu” | – | `anatomy` | – | – | – | Poprawne. |
| 10 | Jelito cienkie, sprint: „Dostaje mniej krwi niż w spoczynku” | Perko 1998 | `checked_agent` | „reduced corresponding blood flows by 32, 50 and 43 %” | Perko 1998, abstrakt pkt 3 | PM: 75% VO₂max | T. krezkowa górna −32% (na czczo). |
| 11 | Jelito grube / intestinum crassum (colon ascendens), rest: „Wchłania wodę” | – | `anatomy` | – | – | – | Poprawne. |
| 12 | Jelito grube, sprint: „Dostaje mniej krwi niż w spoczynku” | Rowell 1964 | `disputed` | „EHBF fell to values ranging from 820 to 390 ml per minute” | Rowell 1964, Results | – | Twierdzenie jest prawdopodobnie prawdziwe, ale źródło nie pasuje. Rowell mierzył całkowity przepływ wątrobowy (suma trzewi), a nie jelito grube. Podmienić na Perko 1998 (t. krezkowa górna −32% zaopatruje okrężnicę wstępującą). Drobna poprawka. |
| 13 | Dwunastnica / duodenum: „Tu wpływają żółć i sok trzustkowy” | – | `anatomy` | – | – | – | Poprawne. |
| 14 | Okrężnica poprzeczna / colon transversum: „Część jelita grubego” | – | `anatomy` | – | – | – | Poprawne. |
| 15 | Okrężnica esowata / colon sigmoideum: „Końcowa część okrężnicy” | – | `anatomy` | – | – | – | Poprawne. |
| 16 | Żyła wrotna / v. portae hepatis, rest: „Krew z jelit i śledziony do wątroby” | – | `anatomy` | – | – | – | Poprawne (także z żołądka i trzustki). |
| 17 | Żyła wrotna, sprint: „Mniej krwi płynie do wątroby” | Rowell 1964 | `checked_agent` | „EHBF fell to values ranging from 820 to 390 ml per minute” | Rowell 1964, Results | PM: wysiłek ciągły | – |
| 18 | Żyły wątrobowe / vv. hepaticae → v. cava inferior, rest: „Krew z wątroby do serca” | – | `anatomy` | – | – | – | Poprawne. |
| 19 | Żyły wątrobowe, sprint: „Wynoszą glukozę z wątroby do krwi” | Marliss 2002 | `checked_agent` | „GP rises seven- to eightfold” | Marliss & Vranic 2002, abstrakt | PM jw. | Glukoza z wątroby opuszcza ją żyłami wątrobowymi (anatomia + źródło). |
| 20 | Zbliżenie – Wątroba, rest: „Przepływ krwi ok. 1,6 L/min” | Rowell 1964 | `checked_agent` | „The mean resting EHBF was 1,614 ml per minute” | Rowell 1964, Results (tab. II) | – | Badani: 10 mężczyzn, 19–37 lat, średnio 26 lat (kanon pasuje). |
| 21 | Zbliżenie – Wątroba, sprint: „Mniej krwi, ale dużo więcej glukozy” | Rowell; Marliss 2002 | `checked_agent` | „GP rises seven- to eightfold” | jw. | PM jw. | – |
| 22 | Zbliżenie – Żyła wrotna, rest: „Przynosi krew z jelit” | – | `anatomy` | – | – | – | Poprawne. |
| 23 | Zbliżenie – Żyła wrotna, sprint: „Przynosi też mleczan (głównie po serii)” | Brooks 2020 | `disputed` | „during postabsorptive (fasted) rest and physical exercise” | Brooks 2020, „Gluconeogenesis from Lactate” | – | Brak źródła dla „głównie po serii”, tak jak w #2. Brooks nie mówi też nic o żyle wrotnej. Mleczan z krwi tętniczej trafia do wątroby obiema drogami. Proponuję „Przynosi też mleczan” bez dopisku o czasie albo źródło dla czasu. |
| 24 | Zbliżenie – Żyły wątrobowe, rest: „Odprowadzają krew do serca” | – | `anatomy` | – | – | – | Poprawne. |
| 25 | Zbliżenie – Żyły wątrobowe, sprint: „Wynoszą glukozę do krwi” | Marliss 2002 | `checked_agent` | „GP rises seven- to eightfold” | Marliss & Vranic 2002, abstrakt | PM jw. | – |
| 26 | Zbliżenie – Trzustka / pancreas, rest: „Wydziela sok trawienny i hormony” | – | `anatomy` | – | – | – | Poprawne. |
| 27 | Zbliżenie – Trzustka, sprint: „Insulina zmienia się niewiele” | Marliss 2002 | `checked_agent` | „glycemia increases and plasma insulin decreases minimally, if at all” | Marliss & Vranic 2002, abstrakt; Marliss 1992: „Plasma insulin was constant during exercise” | PM jw. | Trafne dla trwania wysiłku. Po wysiłku insulina się podwaja (Marliss 1992: „doubled… until 20 min recovery”; Bogdanis 2022 też notuje wzrost po wysiłku). Warto dodać w poziomie rozszerzonym. |
| 28 | Zbliżenie – T. wątrobowa wspólna / a. hepatica communis, rest: „Krew z tlenem dla wątroby” | – | `anatomy` | – | – | – | Poprawne. |
| 29 | Zbliżenie – T. wątrobowa wspólna, sprint: „Niesie też mleczan z mięśni” | Brooks 2020 | `checked_agent` | „an Organ-Organ (muscle to liver) Lactate Shuttle through the vasculature” | Brooks 2020, „Gluconeogenesis from Lactate” | – | Brooks nie wymienia tętnicy wątrobowej, ale jest ona drogą tętniczą do wątroby (wniosek anatomiczny). Dopuszczalne. |
| 30 | Zbliżenie – Pęcherzyk żółciowy / vesica biliaris: „Przechowuje żółć” | – | `anatomy` | – | – | – | Poprawne. |
| 31 | Zbliżenie – Drogi żółciowe / ductus cysticus, ductus hepaticus communis: „Odprowadzają żółć do dwunastnicy” | – | `anatomy` | – | – | – | Nazwy są poprawne. Do dwunastnicy uchodzi jednak przewód żółciowy wspólny (ductus choledochus), którego brakuje na liście. Dopisać, jeśli jest w modelu. |
| 32 | Zbliżenie – Dwunastnica / duodenum: „Początek jelita cienkiego” | – | `anatomy` | – | – | – | Poprawne. |
| 33 | Metryka: Przepływ krwi przez wątrobę ok. 1,6 → „ok. 0,4–0,8” L/min | Rowell 1964 | `disputed` | „during exercise of various intensities, EHBF fell to values ranging from 820 to 390” | Rowell 1964, Results; regresja w tym samym rozdziale: „y = -1.16x + 127.89” | PM trafny: bieżnia, 26–97% VO₂max, od 5. min wysiłku; maks. spadek 84% EHBF | Cytat i przeliczenia są poprawne, a „ok. 80%” przy maksimum się zgadza (81% klirensu, 84% EHBF). Rozbieżność: górna granica 0,8 dotyczy wysiłku łagodnego. Dla 88% VO₂max regresja daje 25,8% klirensu spoczynkowego, czyli ok. 0,4 L/min. Proponuję „sprint: ok. 0,4” z `conversionNote` o regresji (klirens ICG ≈ EHBF wg autorów). |
| 34 | Metryka: Tempo oddawania glukozy 1× → „ok. 7–8×”; „Napędzają je głównie adrenalina i noradrenalina” | Marliss 2002; Marliss 1992 | `checked_agent` | „GP rises seven- to eightfold and GU rises three- to fourfold” | Marliss & Vranic 2002, abstrakt; Marliss 1992, abstrakt („Ra increased 7-fold by exhaustion”) | PM trafny: 80% maks. obciążenia (ok. 100% VO₂max) do wyczerpania, 18 sprawnych mężczyzn | `measuredAt` „w chwili wyczerpania” się zgadza. Katecholaminy: „marked catecholamine responses… are responsible for… the GP increment”. |
| 35 | Metryka: Glukoza we krwi ok. 4,9 → ok. 6,9 mmol/L | Marliss 1992 | `checked_agent` | „4.90 +/- 0.08 mM/L at rest […] 6.91 +/- 0.40 mM/L at 4 min recovery” | Marliss 1992, abstrakt | PM trafny; `measuredAt` „4 min po wysiłku” się zgadza | Cytat w `quote` jest dosłowny. Bliższy protokół (§3.7, priorytet 1): Bogdanis 2022, HIIE60 (8 × 60 s przy 100% PPO), glukoza zaraz po wysiłku 6,56 ± 1,44 mmol/L (abstrakt). Do rozważenia jako druga liczba. |
| 36 | Metryka: Mleczan spalany od razu ok. 50 → ok. 75–80%; notatka: „Reszta, ok. 25% mleczanu, wraca do wątroby (i nerek) i zamienia się w glukozę […] Mleczan to główny surowiec…” | Brooks 2020 | `checked_agent` | „≈50% at rest and 75–80% during sustained exercise” | Brooks 2020, rozdz. „Gluconeogenesis from Lactate” | PM trafny: wysiłek ciągły | Cytat w `quote` jest dosłowny. „Major gluconeogenic precursor” jest w tym samym zdaniu. Drobiazg: w spoczynku 50% + 25% ≠ 100%, więc „reszta” pasuje tylko do wysiłku. Nerki: Brooks („augmented by the kidneys”). |
| 37 | Metryka (stud.): Spadek przepływu: pień trzewny / t. krezkowa górna „ok. −50 / −32” % | Perko 1998 | `checked_agent` | „reduced corresponding blood flows by 32, 50 and 43 %” | Perko 1998, abstrakt pkt 3 | PM: dosłownie 75% VO₂max, rower półleżąco, pomiar w 15.–30. min; na czczo 10 z 19 osób, 28 lat (24–35) | Cytat w `quote` jest dosłowny. Uściślić `protocolMismatch` („75% VO₂max, półleżąco, 30 min”). Notatka „t. krezkowa górna [zaopatruje] jelito cienkie” jest niepełna: także okrężnicę wstępującą i część poprzecznej. |

## Nazwy anatomiczne (TA2, polskie)

Wszystkie nazwy łacińskie są poprawne: oesophagus, gaster, hepar, vesica biliaris, intestinum tenue, intestinum crassum, colon ascendens/transversum/sigmoideum, duodenum, vena portae hepatis, venae hepaticae, vena cava inferior, pancreas, arteria hepatica communis, ductus cysticus, ductus hepaticus communis.

Polskie nazwy też są poprawne, np. „T. wątrobowa wspólna” i „Okrężnica esowata”.

Jedyna uwaga: podpis „Drogi żółciowe” pomija ductus choledochus, a to on uchodzi do dwunastnicy (#31).

## Do poprawy przez autora

1. **#33:** zmienić wartość „sprint” na „ok. 0,4” L/min, z `conversionNote` o regresji Rowella dla 88% VO₂max. Zakres 0,4–0,8 można zostawić w notatce jako „dla różnych intensywności”.
2. **#2 i #23:** usunąć „głównie w przerwach i po serii” / „(głównie po serii)” albo podać źródło dla wysiłku interwałowego. Brooks 2020 temu nie przeczy wprost, ale tego nie mówi i wskazuje też udział w trakcie wysiłku.
3. **#12:** w podpisie jelita grubego podmienić referencję `rowell_1964` na `perko_1998`.
4. **#1:** dopisać `marliss_1992` do `summaryReferenceIds.rest`.
5. **#37:** uściślić `protocolMismatch` (75% VO₂max, półleżąco, 30 min) i notatkę o t. krezkowej górnej.
6. **#31 (opcjonalnie):** dodać ductus choledochus.
7. **#35 (opcjonalnie):** rozważyć Bogdanis 2022 (glukoza 6,56 mmol/L zaraz po 8 × 60 s) jako liczbę z protokołu bliższego kanonowi.
8. **#27 (opcjonalnie, poziom rozszerzony):** dodać, że po wysiłku insulina wyraźnie rośnie.
