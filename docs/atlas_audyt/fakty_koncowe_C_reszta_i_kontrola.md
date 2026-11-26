# Fakty końcowe C: reszta plansz (draft) i kontrola wyrywkowa

Agent sprawdzający fakty (niezależny, nie autor). Procedura: `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md` §3.6 i §3.7.
Wzorzec: 6 × (45 s pracy przy ok. 88% VO₂max / 45 s przerwy), mężczyzna ok. 25 lat, rekreacyjnie aktywny.
Data: 2026-11-26. Nie czytałem raportów sesji ani folderu `side-session-notes`. Nie zmieniłem żadnego innego pliku.

## Jak sprawdzałem

- **Identyfikatory:** wszystkie użyte PMID (49) sprawdzone w PubMed (esummary): tytuł i rok zgodne z `src/science/ScientificReferences.ts`, DOI z PubMed zgodne z plikiem.
  Wszystkie 43 DOI odpowiadają w Crossref (HTTP 200). Bez DOI, tylko z PMID: 4 rozdziały StatPearls, Simpson 2020, Marliss 1992.
- **Teksty źródeł:** abstrakty z PubMed (efetch), pełne teksty z PMC (efetch, tylko artykuły otwarte), strony wydawców (APS, CSHL, BMJ, BJA Education), NCBI Bookshelf (StatPearls).
  Strona PMC pokazała reCAPTCHA. Nie obchodziłem jej, tylko szukałem tego samego tekstu u wydawcy.
- **Munro 1987** (J Biomech, zamknięty dostęp): tekst i tabele odczytałem z publicznej kopii skanu w serwisie studylib.net (dwie kopie OCR).
  To nie jest kopia wydawcy. Treść zgadza się z abstraktem z PubMed (te same zdania, strony 147–155).
- „Fragment ≤ 15 słów” w tabelach to dosłowny wycinek źródła, który podpiera zdanie opisu.

---

## Sekcja 1. Fakty `draft` (14 wierszy: kostny, limfatyczny, miesniowy, mozg, nerwowy, oddechowy, rozrodczy)

### Podsumowanie

| Status | Liczba | Wiersze |
|---|---|---|
| `checked_agent` | 12 | nerwowy summary; miesniowy deltoid; mozg summary; oddechowy intercostal (spoczynek); oddechowy summary; kostny × 4; limfatyczny thoracic_duct, inguinal, summary (spoczynek) |
| `disputed` | 2 | limfatyczny „Otwarte okno”; rozrodczy summary (sprint) |
| `unverifiable` | 0 | — |

Uwaga do zdań anatomicznych: zdania 1–4 podsumowania spoczynku na planszy limfatycznej i zdanie 2 podsumowania kostnego („Na rysunku wyróżniono kości…”) to opis budowy albo rysunku.
Mają status `anatomy` w obrębie fragmentu. Cały wpis dostaje `checked_agent`, bo jedyne zdanie fizjologiczne ma oparcie w źródle.

### Tabela

| plansza | klucz | status | dosłowny fragment | lokalizator | uwaga |
|---|---|---|---|---|---|
| nerwowy | summary (sprint) | `checked_agent` | zd. 1: „transmit signals from the cerebral cortex to the brainstem and spinal cord”; zd. 2: „Most CST fibers decussate at the medullary pyramids to form the lateral CST”; zd. 3: „The CST innervates spinal motor neurons” + „The sciatic nerve … provides motor innervation to all muscles of the posterior thigh” + „The femoral nerve supplies the anterior compartment”; zd. 4 (nowe): „both the recruitment of additional motor units and an increase in discharge rate”; zd. 5: „Physiologic effects include increases in heart rate” + „adrenal medullary chromaffin cells … secreting epinephrine directly into the venous system” | StatPearls Pyramidal Tract Lesions i Corticospinal Cord Tract, abstrakt; StatPearls Lower Limb Nerves, Structure and Function; Enoka & Duchateau 2017, „Rate Coding and Contraction Speed”, akapit 2; StatPearls ANS, abstrakt i Structure and Function; Brooks 1988, abstrakt (adrenalina 0,2 → 1,4 nmol/L) | Kolejność „najpierw niski, potem wysoki próg” opisuje tekst Enoki 2017: „low-threshold motor units” i „later-recruited motor units”. Badania dotyczą skurczów izometrycznych, ale to ogólna zasada, nie liczba. Wniosek „lewa półkula → prawa noga” wynika ze skrzyżowania włókien. Można odblokować pełne `summary.sprint` zamiast `summaryVerified`. |
| miesniowy | deltoid, rola (sprint) „Wymach ramion równoważy obrót nóg” | `checked_agent` | „the arms effectively counterbalanced the vertical angular momentum of the lower extremities” | Hamner 2010, abstrakt; Discussion („the arms counterbalanced the change in angular momentum of the legs”) | Zastrzeżenie: symulacja komputerowa jednego biegacza przy 3,96 m/s. Ramiona w modelu poruszają idealne generatory momentu („the arms were driven by…”), a nie mięsień naramienny. Źródło mówi o wymachu ramion. Udział naramiennego w tym ruchu to anatomia. Zalecenie: przy podpisie fraza dowodu dla modelu, np. `evidence: 'preliminary_human'` z dopiskiem „symulacja”. |
| mozg | summary (sprint) | `checked_agent` | „During exercise, the net cerebral lactate uptake was further increased to 0.28+/-0.16 mmol/min”; „Most (13)C-label … was released as (13)CO(2)”; „The mean decrease … was 32% globally in the brain (38.6+/-4.6 versus 26.1+/-5.0” | van Hall 2009, abstrakt; Kemppainen 2005, abstrakt | Dopiski o protokole są zgodne ze źródłami: 30 min przy 75% VO₂max z wlewem mleczanu (6 osób), 35 min przy 30 albo 75% VO₂max (14 mężczyzn). `protocolMismatch` jest opisany w tekście. |
| oddechowy | intercostal, rola (spoczynek) „Pracują przy każdym wdechu (przymostkowe)” | `checked_agent` | „The scalenes and parasternal intercostals were always active during quiet breathing” | De Troyer & Estenne 1984, abstrakt | 5 zdrowych osób, EMG igłowe. Zgodne. |
| oddechowy | summary (sprint) | `checked_agent` | „diaphragm velocity of shortening 6.5-fold”; „immediate recruitment of rib cage and abdominal muscles”; „the internal interosseous intercostals and the triangularis sterni have an expiratory function”; „97 +/- 25 L/min”; „PTT decreased from 9.32 +/- 1.41 sec at rest, to 2.91 +/- 0.30 sec” | Aliverti 1997, abstrakt (QB → 70% Wmax, 5 mężczyzn); De Troyer 2005, abstrakt; Blackie 1991, abstrakt (mężczyźni 20–80 lat, koniec testu maksymalnego); Hopkins 1996, abstrakt | Liczby mają dopiski o protokole. Sugestia, nie blokuje: zdanie o szybszym przepływie przez płuca opiera się na 10 sportowcach z VO₂max 5,15 L/min przy wysiłku maksymalnym. Można dopisać „(w badaniu: wytrenowani sportowcy, wysiłek maksymalny)”. |
| kostny | metryka „Szczyt nacisku podłoża na stopę” ok. 2,5–2,7 × masa ciała | `checked_agent` | cytat dosłownie zgodny: „…its magnitude increased (p < 0.001) from 2.5 BW at 3.0 m s-1 to 2.8 BW at 5.0 m s-1.” | Munro 1987, s. 151, „Thrust maximum”; tab. 3: thrust maximum 2,51 (3,00), 2,56 (3,25), 2,62 (3,50), 2,67 (3,75 m/s) BW | Wartość potwierdzona samodzielnie (2,51–2,67 → 2,5–2,7). Populacja: 20 mężczyzn, 25,4 ± 2,4 roku, 22,8 km biegu tygodniowo. 17 z 20 lądowało na pięcie. `protocolMismatch` poprawny. Szacunek 3,0–3,7 m/s dla 88% VO₂max jest wiarygodny według równania ACSM. W `conversionNote` można usunąć „(wg raportu sprawdzającego)” i wpisać tab. 3 wprost. |
| kostny | metryka „Kontakt stopy z podłożem” ok. 0,24–0,27 s | `checked_agent` | cytat dosłownie zgodny: „…decreased (p < 0.001) from 270 to 198 ms as the running speed increased (Table 2).” | Munro 1987, s. 148, „Stance time”; tab. 2 (s. 149): 270, 258, 247, 238 ms dla 3,00–3,75 m/s | Wartość potwierdzona (238–270 ms). Drobiazg: w tab. 2 dla 5,00 m/s stoi 199 ms, w tekście 198 ms. To nie dotyczy tej metryki. |
| kostny | metryka „Przebudowa kości (po tygodniach)” 120–200 dni | `checked_agent` | cytat dosłownie zgodny z Eriksen 2010 (obie części, z […]); adaptacja: „provides a crucial mechanism for adaptation to physical stress” | Eriksen 2010, „The bone remodeling cycle”, akapit 2 (potwierdzony); Sims & Martin 2014, Introduction, akapit 2 | 120–200 dni ≈ 4–7 mies. zgodne. Wniosek „jeden trening nie zmienia gęstości” to wnioskowanie z czasu cyklu, nie zdanie źródła. Dopuszczalne, ale warto to zaznaczyć. |
| kostny | summary (sprint) | `checked_agent` | zd. 1: jak wyżej (tab. 2 i 3 Munro); zd. 3: „resorption … takes approximately 3 weeks and the formation response 3 to 4 months” | Munro 1987, tab. 2, tab. 3; Sims & Martin 2014, Introduction, akapit 2 | Zdanie 2 opisuje rysunek (`anatomy`). Sugestia: dopisać `eriksen_2010` do `summaryReferenceIds.sprint` dla spójności z metryką. |
| limfatyczny | metryka „Otwarte okno” (sporne) | `disputed` | Pedersen: „During this time of immunodepression, often referred to as 'the open window', the host may be more susceptible…” (zgodny); Campbell: „limited reliable evidence exists to support the claim…”; Simpson: „An issue that remains to be resolved is whether exercise per se is a causative factor” | Pedersen & Bruunsgaard 1995, abstrakt; Campbell & Turner 2018, abstrakt; Simpson 2020, abstrakt | **Rozbieżność:** `notePl` mówi „brak wiarygodnych dowodów”, a źródło „limited reliable evidence”, czyli „mało”, nie „brak”. Poprawka: „mało wiarygodnych dowodów”. Do tego brakuje `protocolMismatch`, np. „długi, intensywny wysiłek (przeglądy), nie interwały 45 s”. Cytat Pedersena w PubMed ma proste apostrofy (‘ ’ w pliku: tylko typografia). Reszta zgodna („po długim, intensywnym” = „prolonged, intense”; komórki do tkanek = „redistribution of immune cells to peripheral tissues”). |
| limfatyczny | thoracic_duct, rola (sprint) „Prawdopodobnie odprowadza więcej limfy z nóg” | `checked_agent` | „Exercise increased the clearance rate three- to sixfold” | Havas 1997, abstrakt, pkt 3 | Pomiar pośredni: usuwanie znakowanego białka z m. obszernego bocznego, 8 mężczyzn, 100 skurczów w 10 min. Przewód piersiowy leży dalej na tej drodze (anatomia), stąd poprawne „prawdopodobnie”. Warunek: włączyć `evidence: 'preliminary_human'`, jak każe komentarz w pliku. |
| limfatyczny | inguinal, rola (sprint) „Prawdopodobnie dopływa więcej limfy z pracujących nóg” | `checked_agent` | „Exercise increased the clearance rate three- to sixfold” | Havas 1997, abstrakt, pkt 3 | Jak wyżej: pomiar w mięśniu uda, węzły pachwinowe leżą dalej na drodze odpływu (anatomia). Włączyć `evidence: 'preliminary_human'`. |
| limfatyczny | summary (spoczynek) | `checked_agent` | zd. 5: „non-specific flushing of the marginal pools” + „adrenaline released during exercise, causing endothelial detachment” | Campbell & Turner 2018, „Transient Changes to Blood Lymphocyte Frequency…”, akapit 1 | Zdania 1–4 to anatomia i fizjologia podręcznikowa (`anatomy`). Zdanie 5 (komórki NK przylegające do ścian naczyń w spoczynku) wynika z opisu puli przyściennej. |
| rozrodczy | summary (sprint) | `disputed` | „IE and SSE each caused an increase (p<0.01) in FT”; „at 12POST IE was elevated while FT was reduced (p<0.05)”; „Further study is required to determine the biological importance”; „caused by exposure to problematic (prolonged and/or severe) low energy availability” + „decreases in … reproductive function” | Hackney 2012, abstrakt; Velasco-Orjuela 2018, abstrakt; Mountjoy 2023, „Definitions”, definicja REDs (BJSM 57:1073) | Treść jest podparta. **Rozbieżność z §3.7 pkt 2:** spadek po 12 h to wynik jednego protokołu. Było 15 mężczyzn trenujących wytrzymałościowo, 90 s biegu przy 100–110% VO₂max / 90 s przerwy, 42–47 min. Spadek wystąpił tylko po interwałach, nie po biegu ciągłym. W podsumowaniu nie ma dopisku. Poprawka: po „…bywa niższy niż zwykle” dodać „(w badaniu: wytrenowani biegacze, 90 s biegu przy 100–110% VO₂max przez ok. 45 min)”. Drobna poprawka przy okazji: „długotrwałym” → „długotrwałym lub silnym” („prolonged and/or severe”). |

---

## Sekcja 2. Kontrola wyrywkowa (§3.6 pkt 6)

### Jak losowałem

- **Pula:** 57 liczb (metryk) z `status: 'checked_agent'`, `quote` i `locator` w 12 plikach `src/atlas/plates/*.ts`.
  Listę wyciąga skrypt w Node, który importuje plansze. Wszystkich faktów `checked_agent` (z rolami podpisów i podsumowaniami) jest 218.
- **Losowanie:** Python 3.12, `random.seed(20261126)`. Plansze w kolejności alfabetycznej, z każdej `random.sample(…, 2)` z jej metryk w kolejności pliku. Potem jedna dodatkowa `random.choice` z reszty puli.
  Razem 25 liczb: 44% puli liczb i 11,5% wszystkich 218 faktów `checked_agent`.
- **Lista (plansza, indeks `metrics[i]`):** hormonalny 3, 4; kostny 3, 5; krwionosny 6, 0; limfatyczny 4, 2; miesniowy 1, 3; mozg 5, 2; nerwowy 0, 3; oddechowy 2, 1; pokarmowy 3, 1; powlokowy 2, 0; rozrodczy 2, 1; wydalniczy 1, 3; dodatkowa: krwionosny 2.
- **Ograniczenie:** próba obejmuje tylko liczby. Na planszy rozrodczej 41 faktów `checked_agent` to głównie podpisy StatPearls, więc 2 liczby to tam ok. 5% wszystkich faktów.
  Pełne 10% tej planszy wymagałoby jeszcze 2–3 podpisów.

### Podsumowanie

- 25 z 25: cytat dosłownie w źródle, lokalizator wskazuje właściwe miejsce, wartość i protokół zgodne.
- Rozbieżności merytoryczne: **0**. Żadna plansza nie przekracza progu 1 na 10, więc **żadna nie wymaga ponownego pełnego sprawdzenia**.
- Drobne uwagi redakcyjne (nie są rozbieżnościami): Brooks 2020 ma w cytacie odstępy w nawiasach odsyłaczy („[14, 47]” zamiast „[14,47]”). Smith & Havenith ma jednostkę zapisaną „g m-2 h-1”, a PubMed „g m(-2) h(-1)”.
  Joyner & Casey: nie potwierdziłem litery podrozdziału „III.B”, ale cytat stoi w akapicie o wysiłku maksymalnym, zaraz po „A. Cardiac Output and Oxygen Extraction at Rest”.
  Munro: sprawdzone na kopii skanu (studylib.net), nie u wydawcy.

### Tabela

| plansza | klucz | status | dosłowny fragment | lokalizator | uwaga |
|---|---|---|---|---|---|
| hormonalny | Kortyzol we krwi: +83% po 30 min | zgodny | „+39.9+/-11.8%, and +83.1+/-18.5%, respectively” | Hill 2008, abstrakt | 12 mężczyzn, 30 min przy 80% VO₂max. |
| hormonalny | Glukagon : insulina 0,20 → 0,26 | zgodny | „the glucagon-to-insulin ratio increased from 0.20 to 0.26 (P = 0.02)” | Sigal 1996, abstrakt | 87 ± 2% VO₂max, grupa kontrolna, krew żylna mieszana. |
| kostny | Szczyt nacisku, cały zakres 2,5–2,8 BW | zgodny | „from 2.5 BW at 3.0 m s-1 to 2.8 BW at 5.0 m s-1” | Munro 1987, s. 151; tab. 3 (2,51–2,83) | Kopia skanu. |
| kostny | Szczyt uderzenia piętą 1,6–2,3 BW | zgodny | „from 1.6 body weight (BW) at 3.0 m s-1 to 2.3 BW at 5.0 m s-1” | Munro 1987, s. 151; tab. 3 (1,57–2,32) | Kopia skanu. |
| krwionosny | Różnica tętniczo-żylna ok. 5 → ok. 15 mL/100 mL | zgodny | „∼140–150 ml of oxygen is extracted by the peripheral tissues for each liter of cardiac output” | Joyner & Casey 2015, rozdz. III (akapit o wysiłku maksymalnym); spoczynek: „50 ml of oxygen is extracted … for each liter” | Przeliczenia w `conversionNote` poprawne, ~33% wg podpisu ryc. 5 → 6,6. Litera podrozdziału niepotwierdzona. |
| krwionosny | Tętno ok. 60 → do ok. 190 /min | zgodny | „A regression equation to predict HRmax is 208 - 0.7 x age in healthy adults.” | Tanaka 2001, abstrakt (Conclusions); Joyner & Casey 2015, tab. 1 (Active, rest 60) | 208 − 0,7 × 25 = 190,5. |
| krwionosny | Rzut serca ok. 5 → ok. 20–25 L/min | zgodny | „CO, l/min Sed ∼5 ∼20 … Active ∼5–6 ∼25” | Joyner & Casey 2015, tab. 1 (reference man) | Zgodne z tabelą. |
| limfatyczny | Komórki NK do 10× | zgodny | „natural killer cells, which rise by up to 10-fold” | Campbell & Turner 2018, „Transient Changes to Blood Lymphocyte Frequency…” | Wysiłek ciągły ≥ 45–60 min, zgodnie z `protocolMismatch`. |
| limfatyczny | Leukocyty 6,1 → 9,7 tys./µL | zgodny | „from 6.1 ± 1.6 to 9.7 ± 2.6 k/μL” | Bogdanis 2022, „Hematologic responses”; tab. 1 (1 h post 6.1 ± 1.8) | 11 mężczyzn, 28 ± 6 lat, 8 × 60 s przy 100% mocy szczytowej, przerwy 90 s. |
| miesniowy | Skład włókien 42 / 35 / 23 % | zgodny | „approximately 41% I, 1% IC, 1% IIC, 31% IIA, 6% IIAB, and 20% IIB” | Staron 2000, abstrakt | Przeliczenie: 41 + 1; 1 + 31 + 3; 3 + 20. 150 biopsji (55 kobiet, 95 mężczyzn). Części lokalizatora poza abstraktem nie sprawdzałem. |
| miesniowy | ATP do ok. 1000× | zgodny | „up to a 1,000-fold increase in the rate of ATP demand” | Baker 2010, abstrakt | — |
| mozg | Utlenowanie kory przedczołowej | zgodny | „After peaking at hard intensities, cerebral oxygen levels dropped during very hard intensities.” | Rooks 2010, abstrakt | „Hard” = 60% do < VO₂peak, więc 88% mieści się w fazie wzrostu. |
| mozg | CMR 6 → < 2 | zgodny | „from a resting value of 6 to <2” | Quistorff 2008, abstrakt | — |
| nerwowy | Wyładowania motoneuronu ok. 30 Hz | zgodny | „the average values are 32.4 for FDI and 29.3 pps for tibialis anterior” | Duchateau & Enoka 2022, „Discharge Rate Characteristics”, tab. 3 (TA: min 8,6, szczyt 29,3; zakres 20,9–41,9) | 60–120 pps (skurcz balistyczny) potwierdzone u Enoki 2017. |
| nerwowy | Adrenalina 0,2 → 1,4 nmol/L | zgodny | „0.2 +/- 0.2 to 1.4 +/- 0.6 nmol.l-1 … for … adrenaline (AD)” | Brooks 1988, abstrakt | 10 mężczyzn, 30 s na bieżni bez napędu. |
| oddechowy | Objętość oddechowa ok. 2–3 L | zgodny | „Tidal volume at the end of exercise (Vtmax) was higher in men (2.70 +/- 0.48 L)” | Blackie 1991, abstrakt | — |
| oddechowy | Częstość oddechów ok. 36 /min | zgodny | „was 36.1 +/- 9.2 breaths per minute for all subjects” | Blackie 1991, abstrakt | Kobiety i mężczyźni, zgodnie z `protocolMismatch`. |
| pokarmowy | Mleczan spalany od razu ok. 50 → 75–80% | zgodny | „(≈50% at rest and 75–80% during sustained exercise)” | Brooks 2020, Background, akapit „Gluconeogenesis from Lactate” | Tylko odstępy w odsyłaczach „[14,47]”. |
| pokarmowy | Oddawanie glukozy ok. 7–8× | zgodny | „in intense exercise, GP rises seven- to eightfold” | Marliss & Vranic 2002, abstrakt; Marliss 1992, abstrakt („Ra increased 7-fold by exhaustion”) | 18 mężczyzn, 80% obciążenia maksymalnego (ok. 100% VO₂max). |
| powlokowy | Pot: czoło ok. 1,7, dłoń ok. 0,12 L/m²/h | zgodny | „on the forehead (1,710 g m(-2) h(-1) at I2)” oraz „palms … 119 g m(-2) h(-1)” | Smith & Havenith 2011, abstrakt | I2 = 75% VO₂max. Różny zapis jednostki. |
| powlokowy | Ciepło > 75% energii | zgodny | „>75% of the energy that is generated by skeletal muscle substrate oxidation is liberated as heat” | Wendt 2007, abstrakt | — |
| rozrodczy | REDs | zgodny | „a syndrome of deleterious health and performance outcomes experienced by female and male athletes” | Mountjoy 2023, abstrakt | — |
| rozrodczy | Faza cyklu: efekt znikomy | zgodny | „exercise performance might be trivially reduced during the early follicular phase” | McNulty 2020, abstrakt (Conclusion) | 78 badań, 51 w metaanalizie par. |
| wydalniczy | ADH, aldosteron rosną od ok. 60% VO₂max | zgodny | „reaching statistical significance when the level of exercise reached greater than or equal to 60%” | Freund 1991, abstrakt | 8 mężczyzn, 20 min przy 25/40/60/80% VO₂max. |
| wydalniczy | pH ok. 7,4 → ok. 7,2 | zgodny | „(7.32 +/- 0.02 vs. approximately 7.22 +/- 0.03; P < 0.05)” | Del Coso 2010, abstrakt; Shaw 2022, „What is acidosis and what is its relevance?” („The normal blood pH is 7.35–7.45”) | 11 mężczyzn, 4 × 1,5 min przy 163% progu kompensacji oddechowej. Wartość 7,2 dotyczy grup S i M. |

Plansze do ponownego pełnego sprawdzenia: **brak**.

---

## Do poprawy

1. **limfatyczny, metryka „Otwarte okno” (`disputed`):** w `notePl` zmienić „brak wiarygodnych dowodów” na „mało wiarygodnych dowodów” (Campbell & Turner: „limited reliable evidence”).
   Dodać `protocolMismatch: 'długi, intensywny wysiłek (przeglądy i debata), nie interwały 45 s'`. Po poprawce może dostać `checked_agent`; cytaty i lokalizatory są dobre.
2. **rozrodczy, `summary.sprint` (`disputed`):** po „…a po 12 godzinach bywa niższy niż zwykle” dodać „(w badaniu: wytrenowani biegacze, 90 s biegu przy 100–110% VO₂max przez ok. 45 min)”.
   Zmienić „wywołany długotrwałym niedoborem energii” na „wywołany długotrwałym lub silnym niedoborem energii”. Reszta podparta.
3. **limfatyczny, thoracic_duct i inguinal:** `checked_agent` pod warunkiem włączenia `evidence: 'preliminary_human'` (pomiar pośredni, Havas 1997), jak przewiduje komentarz w pliku.
4. **miesniowy, deltoid (sprint):** `checked_agent`. Zalecana fraza dowodu albo dopisek „symulacja komputerowa, 1 biegacz”. W modelu Hamnera ramiona napędzają generatory momentu, nie m. naramienny.
5. **kostny:** w `conversionNote` obu zawężonych metryk zamienić „(wg raportu sprawdzającego)” na odwołanie wprost.
   Tab. 3: 2,51 / 2,56 / 2,62 / 2,67 BW. Tab. 2: 270 / 258 / 247 / 238 ms. Do `summaryReferenceIds.sprint` warto dopisać `eriksen_2010`.
6. **oddechowy, `summary.sprint`** (sugestia, nie blokuje): przy zdaniu o szybszym przepływie krwi przez płuca dopisać „(w badaniu: wytrenowani sportowcy, wysiłek maksymalny)”.
7. **nerwowy, `summary.sprint`:** `checked_agent`. Można usunąć `summaryVerified` i pokazać pełny tekst z nowym zdaniem 4.
8. **Kontrola wyrywkowa:** bez poprawek merytorycznych. Do decyzji Dyrygenta: na planszy rozrodczej dobrać 2–3 podpisy StatPearls, żeby próba objęła 10% wszystkich jej faktów `checked_agent`, nie tylko liczb.
