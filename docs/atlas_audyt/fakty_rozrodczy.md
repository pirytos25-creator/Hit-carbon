# Sprawdzenie faktów: karta „Układ rozrodczy” (rozrodczy)

Niezależny agent sprawdzający fakty (procedura §3.6 i §3.7 modelu architektonicznego), 2026-11-25.
Sprawdzane pliki: `.claude/worktrees/atlas-rozrodczy-47639b/src/atlas/plates/rozrodczy.ts` oraz nowe wpisy w `src/science/ScientificReferences.ts` tego worktree (`hackney_2012`, `velasco_orjuela_2018`, `west_2010`, `mcnulty_2020`, `mountjoy_2023`, 8 rozdziałów `statpearls_*`).
Nie otwierano raportów sesji ani `side-session-notes`. Poza tym plikiem nic nie zmieniano.

Źródła sprawdzono tak: PubMed E-utilities (metadane i abstrakty wszystkich 13 PMID); pełne teksty 8 rozdziałów StatPearls (NCBI Bookshelf, przez Exa, bo bezpośredni dostęp blokuje reCAPTCHA); pełny tekst konsensusu MKOl 2023 (bjsm.bmj.com). Hackney 2012 i Velasco-Orjuela 2018: dostępny tylko abstrakt (paywall Springer i Elsevier). West 2010 i McNulty 2020: abstrakt z PubMed, który wystarcza do cytowanych twierdzeń.

## Podsumowanie

| Status | Liczba | Pozycje |
|---|---|---|
| `checked_agent` | 24 | 1, 2, 5, 6, 7, 8, 11, 12, 13, 14, 15, 18, 19, 21, 24, 26, 28, 29, 31, 32, 33, 34, 35, 36 |
| `disputed` | 6 | 4, 16, 22, 23, 27a, 30 |
| `unverifiable` (brak źródła albo twierdzenia nie ma w podanym źródle) | 6 | 3, 9, 10, 17, 20, 27 |

Najważniejsze:
- **Wszystkie 13 identyfikatorów jest poprawnych.** Tytuły, autorzy, rok, czasopismo, tom i strony zgadzają się z PubMed. DOI pięciu badań zgadzają się z rekordami PubMed. PMCID McNulty (PMC7497427) jest poprawny.
- **Wszystkie 5 pól `quote` występuje dosłownie w źródłach** (Hackney, 2 × McNulty, Mountjoy). Jedyna drobna usterka: lokalizator Hackney „abstrakt (Results)”, choć abstrakt nie ma sekcji (jest jednym akapitem).
- **Testosteron.** Karta nie sugeruje, że testosteron po treningu buduje mięśnie. Przeciwnie: przytacza West 2010 i jego wniosek („enhances neither muscle hypertrophy nor strength”). To dobra praktyka. Mimo to są 3 usterki:
  1. „po 12 h wolny testosteron był **niższy niż przed wysiłkiem**”: abstrakt mówi tylko, że FT 12 h po IE był „reduced (p<0.05)”. Odpowiedzi porównywano z sesją kontrolną (CON), a nie z wartością przed wysiłkiem. Pełnego tekstu nie ma.
  2. Velasco-Orjuela 2018 **nie potwierdza** „chwilowego wzrostu wolnego testosteronu”. W grupie HIIT abstrakt podaje spadek kortyzolu i wzrost stosunku T/C (podobne zmiany wystąpiły też w grupie kontrolnej). Wzrostu FT nie podaje.
  3. `protocolMismatch`: „90 s przerwy” to w rzeczywistości **aktywna przerwa przy 40% VO₂max**. „Wytrenowani biegacze” to w źródle „endurance trained males”.
- **RED-S.** Opis jako skutku długotrwałego jest prawidłowy. Konsensus definiuje REDs jako skutek „problematic (prolonged and/or severe) LEA”. Wpływ na układ rozrodczy potwierdza pełny tekst. Konsensus z 2023 r. używa jednak skrótu **REDs**, a nie RED-S.
- **Faza cyklu (McNulty).** Cytaty, wartość ES, przedział CrI, liczba badań (78 i 51) i lokalizatory są poprawne. Etykieta `contested_debate` jest uczciwa: abstrakt sam pisze „data are conflicting, with no consensus”, a jakość dowodów oceniono jako „low”.
- **Anatomia.** 11 z 18 podpisów potwierdzają cytaty z podanych rozdziałów StatPearls. Do poprawy:
  - nasieniowód: brak „od najądrza” w podanych źródłach;
  - pęcherzyk nasienny: położenie „za pęcherzem” nie wynika z cytatu, a łacina to termin TA98 zamiast TA2;
  - więzadło właściwe jajnika: podano niewłaściwe źródło;
  - 3 podpisy nie mają w ogóle `referenceIds`.

## Weryfikacja identyfikatorów (PubMed E-utilities, 2026-11-25)

| id | PMID | DOI / PMCID | Zgodność |
|---|---|---|---|
| hackney_2012 | 23310924 | 10.1007/BF03346740 | OK: Hackney AC, Hosick KP, Myer A, Rubin DA, Battaglini CL. J Endocrinol Invest 2012;35(11):947–50 |
| velasco_orjuela_2018 | 29940266 | 10.1016/j.physbeh.2018.06.034 | OK: Velasco-Orjuela GP i in. Physiol Behav 2018;194:401–409 |
| west_2010 | 19910330 | 10.1152/japplphysiol.01147.2009 / PMC2885075 | OK: West DW i in. J Appl Physiol 2010;108(1):60–7 (w kodzie brak `pmcid`, można dopisać) |
| mcnulty_2020 | 32661839 | 10.1007/s40279-020-01319-3 / PMC7497427 | OK: McNulty KL i in. Sports Med 2020;50(10):1813–1827 |
| mountjoy_2023 | 37752011 | 10.1136/bjsports-2023-106994 | OK: Mountjoy M i in. Br J Sports Med 2023;57(17):1073–1097 (erratum 2024: 10.1136/bjsports-2023-106994corr1) |
| statpearls_testes | 29261881 | NBK470201 | OK: Tiwana MS, Leslie SW; aktualizacja 2023-04-15 |
| statpearls_seminal_vesicle | 29763029 | NBK499854 | OK: McKay AC, Odeluga N, Jiang J, Sharma S; 2023-07-24 |
| statpearls_prostate | 31082031 | NBK540987 | OK: Singh O, Bolla SR; 2023-07-17 |
| statpearls_penis | 29489230 | NBK482236 | OK: Sam P, LaGrange CA; 2023-07-24 |
| statpearls_female_internal | 32119488 | NBK554601 | OK: Hoare BS, Mikes BA, Khan YS; 2025-02-18 |
| statpearls_ovary | 31424771 | NBK545187 | OK: Gibson E, Mahdy H; 2023-07-24 |
| statpearls_fallopian_tube | 31613440 | NBK547660 | OK: Han J, Sadiq NM; 2023-07-24 |
| statpearls_uterus | 29262069 | NBK470297 | OK: Ameer MA, Peterson DC; 2025-06-03 |

## Tabela faktów

Skróty lokalizatorów: SP = StatPearls, „Intro” = sekcja Introduction, „S&F” = Structure and Function.

### A. Podpisy narządów (widok `side`, miednica męska)

| # | fakt (dosłownie z karty) | źródło | status | cytat (≤ 15 słów) | lokalizator | protokół / flaga | uwaga |
|---|---|---|---|---|---|---|---|
| 1 | Jądro / testis: „Męski gruczoł płciowy: plemniki i hormony” | statpearls_testes | `checked_agent` | „The testis is the male reproductive gland responsible primarily for producing sperm and androgens.” | SP Testes, S&F, akapit 1 | karta, nie dotyczy | Nazwy PL i łac. poprawne (TA2: testis). |
| 2 | Najądrze / epididymis: „Tu plemniki dojrzewają i są przechowywane” | statpearls_testes | `checked_agent` | „the epididymal ducts have ample space for storage and maturation of sperm.” | SP Testes, Intro, akapit 3 | nie dotyczy | OK. |
| 3 | Nasieniowód / ductus deferens: „Przewód od najądrza do przewodu wytryskowego” | statpearls_testes, statpearls_seminal_vesicle | `unverifiable` (w podanych źródłach) | SV: „a seminal vesicle ultimately converging with an ampullae to form the ejaculatory duct” | SP Seminal Vesicle, Intro | nie dotyczy | Druga połowa („do przewodu wytryskowego”) jest potwierdzona. „Od najądrza” nie występuje w żadnym z dwóch rozdziałów. Lepsze źródło: SP „Anatomy, Abdomen and Pelvis, Male Genitourinary Tract” (Wu, De Cicco; PMID 32965962): „The vas deferens is the duct for transporting sperm from the epididymis.” (Intro). |
| 4 | Pęcherzyk nasienny / glandula vesiculosa: „Gruczoł za pęcherzem; łączy się z nasieniowodem” | statpearls_seminal_vesicle | `disputed` | „inferior to the fundus of the bladder and posterior to the prostate.” | SP Seminal Vesicle, Intro, zdanie 2 | nie dotyczy | (a) „Łączy się z nasieniowodem” jest potwierdzone (zdanie o ampulla, wyżej). (b) „Za pęcherzem” nie występuje w źródle: rozdział podaje „inferior to the fundus of the bladder”. Anatomicznie „za pęcherzem” jest poprawne, ale cytat tego nie zawiera; trzeba dać inne źródło albo zmienić opis. Wpis `summaryPl` („nad prostatą”) też nie zgadza się z tym rozdziałem, który mówi „posterior to the prostate”. (c) **Łacina:** w TA2 (2019) termin główny to **glandula seminalis**, a glandula vesiculosa jest synonimem (było terminem głównym w TA98). Anchor `seminal_gland` już odpowiada TA2. |
| 5 | Gruczoł krokowy (prostata) / prostata: „Wydzielina, która chroni plemniki” | statpearls_prostate | `checked_agent` | „Its principal purpose is to secrete an alkaline solution protective for sperm” | SP Prostate, Intro, zdanie 2 | nie dotyczy | OK. |
| 6 | Prącie / penis: „Oddawanie moczu i rozród; w środku cewka” | statpearls_penis | `checked_agent` | „The penis is a male organ that is used for reproduction and urination” | SP Penis, Intro, zdanie 1 | nie dotyczy | „W środku cewka”: „The spongy urethra is contained within the corpus spongiosum.” (Intro). |
| 7 | Przewód wytryskowy / ductus ejaculatorius: „Uchodzi do cewki moczowej w prostacie” | statpearls_seminal_vesicle | `checked_agent` | „These two ejaculatory ducts open into the prostatic urethra at the verumontanum” | SP Seminal Vesicle, Intro | nie dotyczy | OK. |
| 8 | Cewka moczowa / urethra masculina: „Biegnie w ciele gąbczastym prącia” | statpearls_penis | `checked_agent` | „The spongy urethra is contained within the corpus spongiosum.” | SP Penis, Intro | nie dotyczy | Ściśle dotyczy tylko części gąbczastej (pars spongiosa). Cewka męska ma też część sterczową i błoniastą. Można doprecyzować: „Jej część gąbczasta biegnie w ciele gąbczastym prącia”. |
| 9 | Pęcherz moczowy (tło) / vesica urinaria: „Narząd układu moczowego, punkt orientacyjny” | brak `referenceIds` | `unverifiable` (brak źródła) | – | – | nie dotyczy | Twierdzenie banalne, ale bez źródła nie spełnia §3.6. Propozycja: SP Male Genitourinary Tract (PMID 32965962): „stored in the urinary bladder for elimination through the urethra”. |
| 10 | Naczynia jądrowe / a. et v. testicularis: „Tętnica i żyła jądra, biegną z jamy brzusznej” | brak `referenceIds` | `unverifiable` (brak źródła) | (propozycja) „They arise from the anterolateral segment of the abdominal aorta” | SP Testes, rozdział Blood Supply and Lymphatics | nie dotyczy | Treść jest zgodna z SP Testes. Wystarczy dodać `statpearls_testes`. Żyła: „The right testicular vein joins the vena cava”. |

### B. Podpisy narządów (widok `detail`, miednica żeńska)

| # | fakt (dosłownie z karty) | źródło | status | cytat (≤ 15 słów) | lokalizator | protokół / flaga | uwaga |
|---|---|---|---|---|---|---|---|
| 11 | Jajnik / ovarium: „Dojrzewają w nim komórki jajowe; wydziela hormony” | statpearls_ovary | `checked_agent` | „It is here in the ovary the follicles will mature” | SP Ovary, Intro | nie dotyczy | Hormony: „Granulosa cells and theca cells found in the ovary secrete multiple hormones” (Intro). Źródło mówi o dojrzewaniu pęcherzyków, w których dojrzewa komórka jajowa; skrót jest dopuszczalny. |
| 12 | Jajowód / tuba uterina: „Droga komórki jajowej i miejsce zapłodnienia” | statpearls_fallopian_tube | `checked_agent` | „They function as channels for oocyte transport and fertilization.” | SP Fallopian Tube, Intro | nie dotyczy | OK. |
| 13 | Macica / uterus: „Ciąża, miesiączka i poród” | statpearls_uterus | `checked_agent` | „The uterus, a hollow, pear-shaped organ, facilitates gestation, menstruation, and labor.” | SP Uterus, Intro, zdanie 1 | nie dotyczy | OK. |
| 14 | Pochwa / vagina: „Do niej uchodzi szyjka macicy” | statpearls_uterus, statpearls_female_internal | `checked_agent` | „the cervix, which projects downward from the isthmus into the vagina” | SP Uterus, Intro | nie dotyczy | OK. Po polsku lepiej brzmi „wnika” niż „uchodzi” (tak jak w pozycji 15), ale to nie błąd faktu. |
| 15 | Szyjka macicy / cervix uteri: „Dolna część macicy, wnika do pochwy” | statpearls_uterus | `checked_agent` | ten sam cytat co w poz. 14 („4 anatomic segments arranged from superior to inferior … the cervix”) | SP Uterus, Intro | nie dotyczy | OK. |
| 16 | Więzadło właściwe jajnika / lig. ovarii proprium: „Łączy jajnik z macicą” | statpearls_uterus | `disputed` (źródło) | Uterus: „Several ligaments stabilize the uterus, including the utero-ovarian, round, broad…” | SP Uterus, Intro | nie dotyczy | Podany rozdział tylko wymienia nazwę więzadła i nie mówi, co łączy. Twierdzenie potwierdza **SP Ovary**: „Inferior to the ovary is the angle of the body and the uterine tube via the proper ligament of the ovary.” (S&F). Trzeba zmienić `referenceIds` na `statpearls_ovary`. Nazwy PL i łac. poprawne. |
| 17 | Tętnica maciczna / a. uterina: „Doprowadza krew do macicy” | brak `referenceIds` | `unverifiable` (brak źródła) | (propozycja) „The uterine arteries serve as the main source of perfusion.” | SP Uterus, Blood Supply and Lymphatics | nie dotyczy | Wystarczy dodać `statpearls_uterus`. |
| 18 | Pęcherz moczowy (tło) / vesica urinaria: „Leży przed macicą” | statpearls_uterus | `checked_agent` | „the uterus lies posterior to the bladder and anterior to the rectum.” | SP Uterus, Intro | nie dotyczy | OK. |

### C. Podsumowanie karty (`summary`)

| # | fakt (dosłownie z karty) | źródło | status | cytat (≤ 15 słów) | lokalizator | protokół / flaga | uwaga |
|---|---|---|---|---|---|---|---|
| 19 | rest: „U mężczyzny jądra leżą w mosznie poza miednicą” | statpearls_testes | `checked_agent` | „oval-shaped reproductive structures that are found in the scrotum” | SP Testes, Intro, zdanie 2 | nie dotyczy | OK. |
| 20 | rest: „plemniki płyną przez najądrze i nasieniowód do cewki moczowej” | statpearls_testes, statpearls_seminal_vesicle | `unverifiable` (w podanych źródłach) | SV: „ejaculatory ducts open into the prostatic urethra” | SP Seminal Vesicle, Intro | nie dotyczy | Brakuje ogniwa najądrze → nasieniowód (jak w poz. 3). SP Male GU Tract (PMID 32965962) mówi to wprost: „During ejaculation, sperm moves through the epididymis to the vas deferens.” |
| 21 | rest: „U kobiety jajniki, jajowody, macica i pochwa leżą w miednicy mniejszej, za pęcherzem moczowym.” | statpearls_female_internal, statpearls_uterus | `checked_agent` | „The internal genitalia are the structures within the true pelvis, including the vagina” | SP Female Internal Genitals, Intro | nie dotyczy | „Za pęcherzem”: Uterus, Intro („posterior to the bladder”). Uwaga: SP Ovary podaje „lower left and right quadrants of the abdomen”, ale rozdział nadrzędny mówi „true pelvis”; karta trzyma się tego drugiego. Akceptowalne. |
| 22 | sprint: „Pojedynczy interwał nie zmienia widocznie budowy ani pracy tego układu, dlatego obraz się nie zmienia.” | brak bezpośredniego cytatu | `disputed` | – | – | §3.7: karta | Żadne źródło nie mówi tego wprost. „Ani pracy” przeczy też następnemu zdaniu, według którego hormony płciowe się zmieniają. Propozycja: „Pojedynczy interwał nie zmienia budowy tego układu, dlatego obraz się nie zmienia.” |
| 23 | sprint: „Po intensywnym wysiłku hormony płciowe we krwi zmieniają się tylko chwilowo, a znaczenie tych zmian jest niejasne.” | hackney_2012, velasco_orjuela_2018 | `disputed` (zakres) | Velasco: „Further study is required to determine the biological importance of these changes” | Velasco 2018, abstrakt, ostatnie zdanie | Hackney: 90/90 s przy 100–110% VO₂max; Velasco: 4 × 4 min przy 85–95% HRmax | „Znaczenie niejasne”: potwierdzone. Ale (a) oba badania dotyczą **tylko mężczyzn** i głównie testosteronu, więc „hormony płciowe” jest uogólnieniem (także na kobiety) bez źródła; (b) według Hackney FT po 12 h był obniżony, więc zmiany trwają co najmniej kilkanaście godzin. Propozycja: „U mężczyzn po intensywnym wysiłku testosteron we krwi zmienia się na kilka do kilkunastu godzin, a znaczenie tych zmian jest niejasne.” |
| 24 | sprint: „Długotrwały niedobór energii (RED-S) może zaburzać pracę tego układu, ale to skutek tygodni, nie jednego treningu.” | mountjoy_2023 | `checked_agent` | „caused by exposure to problematic (prolonged and/or severe) LEA.” | Mountjoy 2023, pełny tekst, ramka definicji REDs | §3.7: długoterminowe | Wpływ na rozród: „The most well-documented sequelae of problematic LEA are impairments of reproductive function” (pełny tekst). Konsensus mówi „prolonged **and/or severe**”, nie podaje liczby tygodni; „skutek tygodni” to uczciwe uproszczenie. Skrót z 2023 r. to **REDs**. |
| 25 | protocolNotePl: „To karta budowy… „sprint” (koniec 45 s pracy przy ok. 88% VO₂max) nie zmienia tu obrazu.” | – | (uwaga redakcyjna, nie fakt) | – | – | zgodne z §3.7 | Opis momentu „sprint” jest zgodny z kanonem. Nie liczono do statusów. |

### D. Liczby (`metrics`)

| # | fakt (dosłownie z karty) | źródło | status | cytat (≤ 15 słów) | lokalizator | protokół / flaga | uwaga |
|---|---|---|---|---|---|---|---|
| 26 | Wolny testosteron we krwi (mężczyźni): „wartość wyjściowa” → „chwilowy wzrost”; `quote` „IE and SSE each caused an increase (p<0.01) in FT, but IE more so…” | hackney_2012 | `checked_agent` | „IE and SSE each caused an increase (p<0.01) in FT, but IE more so” | Hackney 2012, abstrakt, zdanie 7 (abstrakt nie ma sekcji „Results”) | `protocolMismatch` jest, zob. 27a | Cytat dosłowny, populacja: mężczyźni (n = 15). `preliminary_human` jest uczciwe (mała próba, wynik zależny od protokołu). `measuredAt` „zaraz po sesji; ponownie 12 h po sesji” zgodne (POST, 12POST). Lokalizator poprawić na „abstrakt (jednoakapitowy), zdanie 7”. |
| 27 | notePl: „Wzrost jest krótki: po 12 h wolny testosteron był niższy niż przed wysiłkiem.” | hackney_2012 | `unverifiable` | „The 5α-reductase marker 3-α Diol G response at 12POST IE was elevated while FT was reduced” | Hackney 2012, abstrakt, zdanie 8 | – | Abstrakt mówi „reduced (p<0.05)”, ale w ANOVA porównywano odpowiedzi z sesją kontrolną (CON). Nie wynika z niego, że FT był niższy **niż przed wysiłkiem** (PRE). Pełny tekst jest za paywallem. Bezpieczna wersja: „po 12 h wolny testosteron był obniżony”. |
| 27a | protocolMismatch: „90 s biegu przy 100–110% VO₂max / 90 s przerwy przez 42–47 min, wytrenowani biegacze (n = 15)” | hackney_2012 | `disputed` | „90-sec active recovery at 40% VO2max for 42-47 min” | Hackney 2012, abstrakt, zdanie 2 | – | (a) To nie przerwa, tylko **aktywny wypoczynek przy 40% VO₂max**; (b) w źródle „endurance trained males”, a nie „biegacze”. Poprawny opis: „90 s biegu na bieżni przy 100–110% VO₂max / 90 s aktywnej przerwy przy 40% VO₂max przez 42–47 min; mężczyźni wytrenowani wytrzymałościowo (n = 15)”. Względem kanonu (§3.7) intensywność jest wyższa (100–110% zamiast ok. 88%), a uczestnicy są wytrenowani, nie rekreacyjnie aktywni; flaga słusznie jest. To samo trzeba poprawić w `summaryPl` wpisu `hackney_2012`. |
| 28 | notePl: „Czy taka zmiana ma znaczenie, nie wiadomo.” | velasco_orjuela_2018 (pośrednio) | `checked_agent` | „Further study is required to determine the biological importance of these changes” | Velasco 2018, abstrakt, ostatnie zdanie | populacja: nieaktywni mężczyźni z nadwagą | OK. Hackney sam formułuje wniosek ostrożnie („might produce”). |
| 29 | notePl: „W badaniu treningu siłowego podobne chwilowe wyrzuty hormonów nie zwiększyły przyrostu mięśni ani siły.” | west_2010 | `checked_agent` | „acute exercise-induced elevations in endogenous anabolic hormones enhances neither muscle hypertrophy nor strength” | West 2010, abstrakt, ostatnie zdanie | 12 młodych mężczyzn, 15 tyg. treningu zginaczy łokcia | OK. To zdanie dobrze chroni przed błędnym wnioskiem „testosteron po treningu buduje mięśnie”. Zostawić. |
| 30 | Wolny testosteron: `velasco_orjuela_2018` w `referenceIds` (jako źródło „chwilowego wzrostu”) | velasco_orjuela_2018 | `disputed` (źródło) | „HIIT reduced cortisol and increased total-testosterone/cortisol-ratio levels significantly” | Velasco 2018, abstrakt, przedostatnie zdanie | 4 × 4 min przy 85–95% HRmax, nieaktywni mężczyźni z nadwagą (n = 51) | Abstrakt nie podaje wzrostu **wolnego** testosteronu po HIIT. Podaje spadek kortyzolu i wzrost T/C, przy czym podobne zmiany wystąpiły w grupie kontrolnej (bez ćwiczeń), co wskazuje na wpływ pory dnia. Źródło pasuje do „znaczenie niejasne” (poz. 28), nie do „chwilowy wzrost”. Albo zostawić je tylko przy nocie z wyraźnym opisem, albo usunąć z `referenceIds` tej liczby. |
| 31 | Faza cyklu a wydolność: „nie dotyczy” / „efekt znikomy”; `quote` „exercise performance might be trivially reduced during the early follicular phase…” | mcnulty_2020 | `checked_agent` | „exercise performance might be trivially reduced during the early follicular phase of the MC” | McNulty 2020, abstrakt, Conclusion | metaanaliza, różne testy; flaga jest | Cytat dosłowny, lokalizator poprawny. Uwaga redakcyjna: (a) „exercise performance” obejmuje też siłę, więc „wydolność” jest za wąskie; lepiej „wyniki wysiłkowe”; (b) osoba wzorcowa (§3.7) to mężczyzna, więc w kolumnie „sprint” lepiej podkreślić, że to informacja ogólna, nie skutek interwału. |
| 32 | notePl: „…Jakość dowodów jest niska, więc autorzy nie dają ogólnych zaleceń, tylko radzą obserwować własne reakcje.” | mcnulty_2020 | `checked_agent` | „general guidelines on exercise performance across the MC cannot be formed” | McNulty 2020, abstrakt, Conclusion | – | „Jakość niska”: „The quality of evidence for this review was classified as "low"” (Results). Parafraza „personalised approach” jest poprawna. |
| 33 | Faza cyklu: wielkość efektu „−0,06 (95% CrI od −0,16 do 0,04)”; `quote` „(ES0.5 = - 0.06 [95% credible interval (CrI): - 0.16 to 0.04])” | mcnulty_2020 | `checked_agent` | „(ES0.5 = - 0.06 [95% credible interval (CrI): - 0.16 to 0.04])” | McNulty 2020, abstrakt, Results | metaanaliza | Wartość i przedział dosłownie zgodne. „51 badań, model bayesowski” zgodne („data from 51 studies… three-level hierarchical model”, Methods: „grounded in Bayesian principles”). „Przedział obejmuje zero”: poprawny wniosek. |
| 34 | evidenceLevel `contested_debate` dla obu liczb McNulty | mcnulty_2020 | `checked_agent` | „At present, data are conflicting, with no consensus” | McNulty 2020, abstrakt, Background | – | Etykieta uczciwa. Liczba „78 badań” w `protocolMismatch` też jest poprawna („Of the 78 included studies”). |
| 35 | RED-S: „nie dotyczy” / „nie dotyczy (skutek tygodni)”; `quote` „a syndrome of deleterious health and performance outcomes…” | mountjoy_2023 | `checked_agent` | „a syndrome of deleterious health and performance outcomes experienced by female and male athletes” | Mountjoy 2023, abstrakt, zdanie 1 | długoterminowe; flaga trafna | Cytat dosłowny. `established_human` uczciwe (konsensus MKOl, >170 nowych badań). notePl („także praca układu rozrodczego… u kobiet i u mężczyzn”) potwierdza pełny tekst, cytat w poz. 24. Nazwa: w 2023 r. skrót to **REDs** („Relative Energy Deficiency in Sport (REDs)”). Proponuję „REDs (dawniej RED-S)”. |
| 36 | RED-S measuredAt: „długoterminowo (tygodnie, miesiące)” | mountjoy_2023 | `checked_agent` | „Adaptable LEA is typically a short-term experience with minimal (or no) impact” | Mountjoy 2023, pełny tekst, definicje LEA | – | Konsensus odróżnia krótkotrwałe niedobory, które nie szkodzą, od długotrwałych lub ciężkich. „Tygodnie, miesiące” nie występują dosłownie, ale to zgodne uproszczenie. |

### E. Wpisy źródeł (`summaryPl` w ScientificReferences.ts), poza tabelą statusów

- `hackney_2012`: „90 s przerwy” i „wytrenowani biegacze” jak w poz. 27a. „Po 12 h był niższy”: jak w poz. 27.
- `velasco_orjuela_2018`: treść poprawna. Warto dopisać, że podobne zmiany kortyzolu i T/C wystąpiły w grupie kontrolnej. Lista autorów w PubMed jest dłuższa (11 osób, m.in. Hackney AC); „et al.” jest dopuszczalne.
- `west_2010`: „młodzi mężczyźni” poprawne (n = 12). Brak `pmcid: 'PMC2885075'`.
- `mcnulty_2020`, `mountjoy_2023`: zgodne.
- `statpearls_seminal_vesicle`: „za pęcherzem moczowym, nad prostatą” nie zgadza się z tekstem rozdziału („inferior to the fundus of the bladder and posterior to the prostate”). Część „każdy łączy się z bańką nasieniowodu w przewód wytryskowy, który uchodzi do cewki w prostacie” jest poprawna.
- `statpearls_testes`, `_prostate`, `_penis`, `_female_internal`, `_ovary`, `_fallopian_tube`, `_uterus`: zgodne z rozdziałami („ok. 50% przodozgięta i przodopochylona”: „In approximately 50% of women, the uterus adopts an anteflexed and anteverted orientation”).

## Protokół wzorcowy (§3.7) i ton

- Karta słusznie nie ma stanów. `protocolNotePl` jest zgodne z kanonem (koniec 45 s pracy przy ok. 88% VO₂max).
- Jedyne badanie interwałowe przy liczbie testosteronu (Hackney) ma wyższą intensywność (100–110% VO₂max), dłuższe odcinki (90 s) i wytrenowanych uczestników. Flaga jest, wymaga tylko poprawy opisu (poz. 27a).
- Karta **nie** sugeruje skutków, których pojedynczy trening nie ma. Zdanie z West 2010 wprost obala „testosteron po treningu buduje mięśnie”. RED-S jest dwa razy opisany jako długoterminowy („skutek tygodni, nie jednego treningu”; „Jeden trening tego nie wywołuje”).
- Ton jest rzeczowy, bez sensacji, bez ocen ciała.
- Nazewnictwo: polskie nazwy zgodne z mianownictwem szkolnym. Łacina zgodna z TA2 z jednym wyjątkiem: glandula vesiculosa → **glandula seminalis** (TA2 nr 3631; glandula vesiculosa jest tam synonimem).

## Do poprawy przez autora

1. **Poz. 27, notePl testosteronu:** zamiast „po 12 h wolny testosteron był niższy niż przed wysiłkiem” napisać „po 12 h wolny testosteron był obniżony” (abstrakt nie porównuje z PRE). Albo zdobyć pełny tekst i podać tabelę lub rysunek.
2. **Poz. 27a, `protocolMismatch` i `summaryPl` Hackney:** „90 s aktywnej przerwy przy 40% VO₂max”, „mężczyźni wytrenowani wytrzymałościowo (n = 15)”. Lokalizator `quote`: „abstrakt (jednoakapitowy), zdanie 7” zamiast „(Results)”.
3. **Poz. 30:** usunąć `velasco_orjuela_2018` z `referenceIds` liczby „chwilowy wzrost” wolnego testosteronu albo jasno oznaczyć, że to źródło tylko do „znaczenie niejasne”. Abstrakt nie podaje wzrostu FT po HIIT.
4. **Poz. 23, summary sprint:** zawęzić „hormony płciowe” do „testosteron u mężczyzn”. Zamiast „tylko chwilowo” napisać „na kilka do kilkunastu godzin”.
5. **Poz. 22, summary sprint:** usunąć „ani pracy” (sprzeczność z następnym zdaniem i brak źródła).
6. **Poz. 3 i 20, nasieniowód i droga plemników:** dodać źródło SP „Anatomy, Abdomen and Pelvis, Male Genitourinary Tract” (Wu EH, De Cicco FL; PMID 32965962, rekord PubMed sprawdzony; numer NBK nie był sprawdzany). Cytat: „The vas deferens is the duct for transporting sperm from the epididymis.”
7. **Poz. 4, pęcherzyk nasienny:** łacina → `glandula seminalis` (TA2). Do „za pęcherzem” dać źródło, które to mówi (np. rozdział z pkt 6 albo podręcznik), albo zmienić podpis na „Gruczoł pod dnem pęcherza; łączy się z nasieniowodem”. Poprawić `summaryPl` wpisu („nad prostatą” nie zgadza się z rozdziałem).
8. **Poz. 16, więzadło właściwe jajnika:** zmienić `referenceIds` na `statpearls_ovary` (zdanie o „proper ligament of the ovary”).
9. **Poz. 9, 10, 17:** dodać `referenceIds`: pęcherz → SP Male GU Tract; naczynia jądrowe → `statpearls_testes`; tętnica maciczna → `statpearls_uterus` (cytaty w tabeli).
10. **Poz. 24 i 35, nazwa:** „REDs (dawniej RED-S)”, zgodnie z konsensusem 2023.
11. Drobne (nie zmieniają statusu): poz. 8, doprecyzować „część gąbczasta”; poz. 31, „wydolność” → „wyniki wysiłkowe”, bo metaanaliza obejmuje też siłę; dopisać `pmcid` West 2010.
