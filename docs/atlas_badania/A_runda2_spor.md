# Badacz A, runda 2: spór z B i C

Stan: 2026-11-25. Odnoszę się do `B_runda1_architektura_3d.md` i `C_runda1_ux_narracja.md`. Kodu nie zmieniałem.
Nowy fakt z repo, ważny dla sporu: główna aplikacja ma już ciągły model `src/core/PhysiologyEngine.ts`. Liczy HR, rzut serca, mleczan,
temperaturę i pot z ręcznych stałych (np. `maxHr = 194`, `lactate = 0.9 + eff^1.8 · load · 12.8`, `coreTemp = 37 + load · 1.75`).
Nie ma w nim odwołań do źródeł ani kinetyki narastania: HR zmienia się od razu razem z intensywnością.

## 1. Z czym się nie zgadzam

### U Badacza B

**B-T2: identyfikator `za:rectus_femoris.r` jako kanoniczne ID struktury.** Ten klucz zawiera źródło (`za:`) i stronę (`.r`), więc łączy dwie
rzeczy, które trzeba rozdzielić. Nerka z HuBMAP i nerka z Z-Anatomy dostałyby różne ID, a fakty o „przepływie nerkowym” trzeba by przypinać
dwa razy. Wzorce, na które B sam się powołuje, robią odwrotnie: BioDigital ma osobno `objectId` siatki i `fmaId` pojęcia
([HumanAPI](https://human-api.biodigital.com/docs/unstyled/symbols/HumanAPI.Scene.html)), a HuBMAP wiąże obiekt przestrzenny z pojęciem relacją
`representation_of` ([CCF, arXiv 2007.14474](https://arxiv.org/pdf/2007.14474v1.pdf)).
**Propozycja:** ID B zostaje, ale jako ID *siatki* (`MeshBinding`). `_STRUCTURE_ID` w wierzchołku wskazuje strukturę bez źródła i bez strony
(`kidney`, `rectus_femoris`), a strona trafia do osobnego atrybutu.

**B-§3: `registry/<uklad>.json`, czyli rejestr dzielony per układ.** Przynależność do układu jest wiele-do-wielu. Trzustka trafiłaby do
`pokarmowy.json` i `hormonalny.json`, grasica do `limfatyczny.json` i `hormonalny.json`, a przepona do mięśniowego i oddechowego.
Dwóch agentów równolegle edytowałoby dwie kopie tej samej struktury i nazwy zaczęłyby się rozjeżdżać. Z-Anatomy też nie trzyma tego w folderach
(obiekt ma kilka kolekcji naraz), a HRA ma osobny graf układów
([Börner 2025](https://www.nature.com/articles/s41592-024-02563-5)).
**Propozycja:** jeden globalny `structures.json`, edytowany tylko przez integratora albo przez plik propozycji. Per układ zostają
`registry/<uklad>.json`, ale tylko z wyborem struktur, rolą (aktywna lub kontekst) i powiązaniem z siatkami, bez nazw i ID ontologii.

**B-§6: „A poda poziom aktywności 0–1 per struktura ze źródłem”.** Takiej liczby nie ma w literaturze. Nikt nie mierzy, że wątroba jest
„aktywna w 0,7”. Ze źródłem są wielkości fizyczne: % rzutu serca, przepływ w % spoczynku, EMG w %MVC, stężenie.
**Propozycja:** `activity` to *kodowanie wizualne* wyliczane regułą z faktu, np. `clamp(log2(przepływ_sprint / przepływ_spoczynek) / 3)`,
albo poziom porządkowy (brak/niski/średni/wysoki) z etykietą `illustrative`. Nie może dostać `EvidenceLevel`, jakby był pomiarem.

**B-§6: „dwa stany + interpolacja, a ciągły model żyje w `PhysiologyEngine`”.** Zgadzam się, że silnik atlasu nie powinien niczego symulować.
Nie zgadzam się, żeby `PhysiologyEngine` był źródłem prawdy. To model heurystyczny bez źródeł. Gdyby atlas go czytał, liczby z planszy
(„mięśnie ok. 80–85% rzutu serca”, kenney_2022) i liczby z filmu (`normalizeBloodFlow`) dalej pochodziłyby z dwóch niezależnych miejsc.
**Propozycja:** kierunek odwrotny. Zatwierdzone fakty (zakresy dla faz) są *wyrocznią testową* dla `PhysiologyEngine`: test sprawdza, czy jego
wartości w punktach `rest`, `hiit_peak` i `active_recovery` mieszczą się w zakresach faktów. Wtedy film i atlas mają jedną prawdę,
a silnik pozostaje tani i ciągły.

### U Badacza C

**C-§3, przewodnik „Jeden interwał”: dwa ogniwa są źle umieszczone w czasie.** To najlepszy argument za moją tezą T8/T9 (wartości z czasem
pomiaru), bo pomyłkę widać dopiero na osi czasu.
- „5–15 s nadnercza: adrenalina → serce”. W pierwszych sekundach wysiłku HR rośnie głównie przez **wycofanie napięcia nerwu błędnego**.
  Działanie współczulne i katecholaminy we krwi dochodzą później, a adrenalina w osoczu jest najwyższa pod koniec serii lub tuż po niej
  ([Zouhal 2008, PMID 18416594](https://pubmed.ncbi.nlm.nih.gov/18416594/); kenney_2022). Projekt pisze to sam w Akcie II
  (`SCIENTIFIC_PLAN_AND_BIBLIOGRAPHY.md`: „wycofanie napięcia błędnego… i wzrost aktywności współczulnej”).
  Poprawny krok: „0–10 s: hamulec nerwu błędnego puszcza → serce ↑; później współczulny + adrenalina”.
- „15–30 s redystrybucja: skóra ↑” i „30 s+ pot”. Na początku intensywnego wysiłku naczynia skóry się **zwężają**. Skóra przejmuje krew
  dopiero wtedy, gdy rośnie temperatura głęboka, czyli w skali minut, a nie sekund
  ([Johnson 1992, „Exercise and the cutaneous circulation”, Exerc Sport Sci Rev 20:59–97](https://pubmed.ncbi.nlm.nih.gov/1623893/), PMID do potwierdzenia; kenney_2022).
  W 30-sekundowym sprincie skóra to „↓ lub bez zmian”, a pot i przepływ skórny należą do sesji (kolejne interwały, schłodzenie).

**C-T13: limfatyczny jako karta bez stanów.** Nie zgadzam się. Ostra mobilizacja limfocytów (zwłaszcza NK) do krwi w trakcie wysiłku i spadek
po nim to dobrze zbadane zjawisko. Sporna jest tylko *interpretacja* spadku: „okno immunosupresji” albo przejście komórek do tkanek
([Campbell & Turner 2018](https://pmc.ncbi.nlm.nih.gov/articles/PMC5911985)). To wręcz wzorcowy przykład na trzy fazy:
spoczynek → sprint ↑ → po wysiłku ↓, z etykietą `contested_debate` tylko przy interpretacji ostatniej fazy.

**C-T13: kostny „w pojedynczym sprincie: brak widocznej zmiany”.** Zmienia się obciążenie, a nie kolor tkanki. Szybszy bieg osiąga się większymi
siłami reakcji podłoża, a nie szybszym ruchem nóg (Weyand i in. 2000, J Appl Physiol, PMID do dodania). Kartę przyjmuję, ale z jedną liczbą
obciążenia (wielokrotność masy ciała, trucht → sprint) na widoku „lądowanie”, a nie z napisem „brak zmiany”.

**C-T3, „Co się zmieniło” z krotnością „×3”.** Przyjmuję kierunek ↑/↓, ale krotność wolno liczyć tylko wtedy, gdy obie wartości pochodzą
z tego samego źródła i protokołu. Iloraz liczb z dwóch różnych badań to fałszywa precyzja. Reguła w danych: `foldChange` istnieje tylko
przy wspólnym `refId` i `protocol`. W przeciwnym razie pokazujemy samą strzałkę.

## 2. Co przyjmuję i jak to zmienia moje tezy

- **Od C: zdarzenie zamiast układu (C-T1)** pasuje do mojego grafu przyczynowego i *wzmacnia* T9. C wprost żąda „okna czasowego w interwale
  (s od startu)”, więc `Fact.tSecFromBoutStart` przestaje być opcjonalne dla faktów używanych w przewodniku.
- **Od C: drabina sformułowań (C-T11)** zastępuje mój ogólny punkt T14(4). Walidator sprawdza konkretne frazy przypisane do `EvidenceLevel`.
  Dodaję wymóg 2–3 wariantów na poziom.
- **Od C: limit 6–10 podpisów i 4 liczb.** Przyjmuję na ekranie. W danych dodaję `Fact.displayPriority`. Warunek nienegocjowalny: każda pokazana
  liczba ma znacznik czasu („3 min po serii”).
- **Od C: karty informacyjne** dla rozrodczego i kostnego (z zastrzeżeniem wyżej). Rozrodczy najbardziej uczciwie pokazać jako kartę
  ([McNulty 2020](https://irep.ntu.ac.uk/id/eprint/41201/1/1344931_Elliott-Sale.pdf): efekt fazy cyklu znikomy, dowody niskiej jakości).
- **Od C: nazwy.** Zgadzam się na „Układ moczowy” zamiast „wydalniczy”: TA2 używa *systema urinarium*, a wydalają też płuca i skóra.
  Identyfikator w kodzie może zostać `wydalniczy`, żeby niczego nie psuć. Analogicznie „Układ dokrewny (hormonalny)”.
- **Od C: paleta i daltonizm.** `System` dostaje w danych pole `glyph`, żeby kolor nie był jedynym nośnikiem informacji.
- **Od B: grupy węzłów chłonnych jako jedno ID.** Przyjmuję, bo jest to też poprawne ontologicznie: FMA ma klasy zbiorcze
  („set of axillary lymph nodes”). Grupa to `Structure` z dziećmi w `partOf`, a nie skrót na potrzeby budżetu.
- **Od B: przepływy jako krzywe 3D w metrach (B-T6).** Przyjmuję w całości. `Flow` dostaje `structureId` naczynia lub drogi i `causalEdgeId`,
  a prędkość jest regułą z faktu (np. rzut serca), tak jak `activity`.
- **Od B: BodyParts3D jest dziś na CC BY 4.0.** To wzmacnia FMA jako drugi klucz (BP3D jest kluczowany FMAID) i może otworzyć drogę do
  łagodniejszej licencji dla części siatek. Do zbadania prawnego, nie zakładam tego z góry.
- **Od B: blokada licencji NC w skrypcie** zamiast w pamięci agenta. Zgoda; `MeshBinding.license` jest tym polem.

## 3. Stanowisko końcowe (po korekcie)

1. **Struktura ≠ siatka.** Jeden globalny `structures.json` (ID bez źródła i bez strony, TA2/FMA/Uberon/Wikidata, PL/LA/EN, układy
   wiele-do-wielu). ID siatek w stylu B (`za:…​.r`) są osobnym rejestrem powiązań z polami `side`, `facet` i `license`.
2. **Dane mają czas, widok może mieć dwa stany.** Fakty dotyczą faz `WorkoutPhaseId`, a przy przewodniku również sekund od startu serii.
   Plansze pokazują dwa wybrane punkty, przewodnik pokazuje oś czasu, a shader B dostaje jedną liczbę fazy.
3. **Jedna prawda dla filmu i atlasu.** Zatwierdzone fakty są wyrocznią testową dla `PhysiologyEngine` i źródłem dla plansz. Pulse jest tylko
   offline'owym kontrolerem spójności (`provenance: model_simulation`).
4. **Wartości wizualne (aktywność, prędkość strzałki, „×N”) to reguły nad faktami, a nie fakty.** Nie dostają poziomu dowodów, mają etykietę
   `illustrative` albo są wyliczane z faktów o wspólnym źródle.
5. **Narracja tylko z faktów.** AI pracuje w czasie budowy, a walidator sprawdza `factIds`, liczby, nazwy i frazę dowodu z drabiny C.
   „Zapytaj atlas” to wyszukiwarka, nie generator.
6. **Graf przyczynowy z opóźnieniami jest kręgosłupem przewodnika i planszy „Całość”.** Kolejność kroków wynika z `latency` krawędzi
   (dzięki temu błąd „adrenalina w 5 s” nie przejdzie).
7. **Typ treści zależy od dowodów.** Pełna plansza ze stanami: hormonalny, pokarmowy z wątrobą, moczowy, limfatyczny (3 fazy). Plansza sesyjna
   (minuty, nie sekundy): skóra. Karty: kostny (z liczbą obciążenia) i rozrodczy.

## 4. Pytania do użytkownika (nie rozstrzygną ich dowody)

1. **Kto jest „człowiekiem wzorcowym” atlasu?** Np. mężczyzna, ok. 25 lat, rekreacyjnie aktywny (zgodny z modelem 3D), czy dwa warianty
   (M i K) od początku? Od tego zależy połowa liczb.
2. **Jaki protokół sprintu jest kanoniczny?** 30 s „all-out”, czy domyślny protokół aplikacji (45 s pracy / 45 s przerwy przy 88% VO₂max
   z `DEFAULT_HIIT_CONFIG`)? Liczby z literatury dla tych protokołów się różnią.
3. **Kto zatwierdza fakty?** Czy zgadzasz się przeglądać i zatwierdzać fakty w prostej tabeli (np. arkusz z kolumną „zatwierdzam”), czy ma to
   robić drugi agent AI z obowiązkiem cytatu? Bez tej roli cały model „tylko zweryfikowane fakty” nie działa.
