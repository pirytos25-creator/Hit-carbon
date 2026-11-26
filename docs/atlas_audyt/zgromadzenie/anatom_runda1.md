# Zgromadzenie, runda 1: ANATOM-FIZJOLOG

Materiał: `src/atlas/plates/*.ts` (gałąź `atlas-uklady`, `c4420f9`), model §3.5–3.7, 24 zrzuty 1440 (wszystkie sprint i część spoczynku) i 390 (mózg, moczowy). Zbliżenia sprawdzałem wycinkami zrzutów.

## Ocena ogólna: **PRZYJĄĆ Z POPRAWKAMI**

Nie znalazłem błędu krytycznego, czyli fałszywej strony ciała, złej struktury pod podpisem albo odwróconego kierunku zmiany spoczynek → sprint. Strony ciała się zgadzają: wątroba i pęcherzyk po prawej, śledziona i żołądek po lewej, ż. główna dolna na prawo od aorty, prawa nerka niżej, lewy kąt żylny. Zgadza się też żyła odpiszczelowa po przyśrodkowej stronie nogi, a odpromieniowa po bocznej stronie ramienia. Poprawki dotyczą dwóch schematów dróg, jednej sprzeczności w tekście i skali czasu.

## Ważne (poprawić przed zamknięciem)

1. **Mózg, przekrój pośrodkowy: strzałka „Krew przynosi mleczan i glukozę”.**
   - Problem: strzałka biegnie od t. kręgowych i podstawnej (przed pniem) do t. przedniej mózgu i pola nóg. To nieprawda anatomiczna: t. przednia mózgu odchodzi od t. szyjnej wewnętrznej, a t. podstawna przechodzi w tylne tętnice mózgu.
   - Poprawka: wejście strzałki przenieść na t. szyjną wewnętrzną (koło tętnicze, przed skrzyżowaniem wzrokowym), dalej wzdłuż kolana i trzonu ciała modzelowatego do płacika okołośrodkowego. Druga możliwość: dopisać „(schemat, nie przebieg naczyń)” w samym podpisie strzałki.
2. **Mózg, sprzeczność w poziomie Podstawowym.**
   - Problem: podsumowanie mówi „pobiera mniej glukozy” (PET, 75% VO₂max), a nota przy „CMR” mówi „pobiera więcej glukozy i mleczanu, niż spala” (wysiłek do wyczerpania, różnica tętniczo-żylna). Laik widzi dwie sprzeczne karty jedna pod drugą (zrzut 390).
   - Poprawka w nocie CMR: „Przy wysiłku do wyczerpania mózg pobiera z krwi więcej paliwa (głównie mleczanu), niż spala tlenem; inną metodą (PET, 75% VO₂max) pobór samej glukozy był mniejszy”.
3. **Nerwowy, widok z przodu: dwie strzałki wyglądają jak jedna droga.**
   - Problem: strzałka współczulna (szyja → pień → rdzeń nadnercza) i strzałka „Nerw udowy → czworogłowy” stykają się przy nadnerczu. Na zrzucie widać jedną linię szyja → nadnercze → udo, co sugeruje, że rozkaz ruchu idzie przez pień współczulny i nadnercze. Dodatkowo strzałka współczulna zaczyna się w odcinku szyjnym. Włókna przedzwojowe do rdzenia nadnerczy wychodzą z odcinka piersiowego (ok. Th5–Th12).
   - Poprawka:
     - rozdzielić strzałki (inny styl albo przerwa);
     - strzałkę współczulną zacząć w odcinku piersiowym;
     - strzałkę udową wyprowadzić z rdzenia L2–L4 przez splot lędźwiowy (m. lędźwiowy), z dala od nadnercza.
4. **Skala czasu „Sprint = koniec 45 s” a liczby z minut (hormonalny, pokarmowy, krwionośny).**
   - Problem: wątroba „oddaje 4–6 razy więcej glukozy” (Sigal: ok. 14 min ciągłej pracy), przepływ wątrobowy 0,4 L/min (Rowell: pomiar od 5. min) i zwężenie trzewi to stany po minutach pracy, a nie po pierwszych 45 s. Notatki o protokole tego nie mówią, a podpis sugeruje efekt jednego interwału.
   - Poprawka: w `protocolNotePl` obu plansz dopisać „w późniejszych interwałach (po kilku minutach sesji)”, zgodnie z modelem §3.7: „najlepiej w późniejszym interwale”.
5. **Krwionośny, „Ż. odpiszczelowa: Pompa mięśniowa przyspiesza powrót”.**
   - Problem: pompa mięśniowa ściska żyły głębokie. Żyła odpiszczelowa jest powierzchowna i oddaje krew do żył głębokich przez żyły przeszywające oraz do ż. udowej.
   - Poprawka: kotwicę strzałki powrotu i podpis dać na ż. udową albo żyły głębokie łydki. Druga możliwość: podpis „Spływa do żył głębokich, które pompa mięśniowa opróżnia szybciej”.

## Drobne

- **Wszystkie plansze, wartości maksymalne w poziomie Podstawowym.** Tętno „do ok. 190”, rzut 20–25 L/min, wentylacja 97 L/min i pH 7,2 pochodzą z wysiłku maksymalnego. pH 7,2 pochodzi nawet z wysiłku ponadmaksymalnego, 163% progu kompensacji oddechowej. Dopiski „W badaniu…” są uczciwe, ale przy pH (moczowy) i tętnie dodałbym w Podstawowym zdanie: „w naszym interwale najpewniej mniej”. Takie zdanie jest już przy wentylacji.
- **Nerwowy, widok z tyłu.** Kotwica „Kora ruchowa” leży na prawej półkuli, a strzałka startuje z lewej i krzyżuje się poprawnie do prawej nogi. Kotwicę przenieść na lewą półkulę, na początek strzałki.
- **Krwionośny, „Naczynia trzewne”.** Łacina to „a. lienalis (t. śledzionowa)”, a opis mówi „przepływ przez jelita i wątrobę”. Zmienić łacinę na „truncus coeliacus / a. mesenterica sup.” albo opis na śledzionę.
- **Moczowy, podsumowanie.** „Kwas z mięśni najpierw wiążą bufory krwi”: pierwsze są bufory wewnątrz mięśni. Zmienić na „bufory w mięśniach i we krwi”.
- **Pokarmowy, podsumowanie sprintu.** Cykl Cori działa głównie po wysiłku i w dłuższym wysiłku. Przy obniżonym przepływie wątrobowym jego udział w trakcie 45 s jest mały. Dopisać „zwłaszcza po wysiłku”.
- **Rozrodczy, pęcherzyk nasienny.** „Gruczoł pod dnem pęcherza” zmienić na „Gruczoł za pęcherzem (na tylnej ścianie jego dna)”.
- **Hormonalny, widok z przodu.** Pinezka „Wątroba (narząd docelowy)” wisi w pustym miejscu, bo wątroby prawie nie widać w renderze. Rozjaśnić siatkę wątroby albo dodać obrys.
- **Moczowy, strzałka prawej t. nerkowej.** Na zrzucie biegnie przed ż. główną dolną, a anatomicznie przechodzi za nią. To akceptowalne jako nakładka. Jeśli renderer pozwala, przyciemnić odcinek za żyłą.

## Co jest szczególnie dobre

- **Skrzyżowanie drogi korowo-rdzeniowej.** Tekst i strzałka mówią to samo: lewa półkula steruje prawą nogą, a skrzyżowanie leży w rdzeniu przedłużonym.
- **Mózg.** Pole nóg jest pokazane na płaciku okołośrodkowym w przekroju pośrodkowym, a nie na bocznej powierzchni. Jądra podstawy są uczciwie opisane jako „rzut”.
- **Kolejność w czasie.** Najlepiej wypadają skóra i limfa:
  - skóra: zwężenie naczyń na starcie, rozszerzenie i pot po minutach, szybki spadek po wysiłku;
  - limfa: wzrost NK i limfocytów, a po 1–2 h spadek;
  - hormony: GH później, kortyzol tylko przy dłuższym lub bardzo intensywnym wysiłku;
  - ADH i aldosteron „w ciągu minut”, przebudowa kości „tygodnie i miesiące”.
- **Nerka przygaszona w sprincie.** To poprawny kierunek zmiany i jest wyjaśniony w tekście. Schemat nefronu też jest poprawny: tętniczka odprowadzająca przechodzi w naczynia proste, a woda z kanalika zbiorczego wraca do krwi.
- **Kostny.** Przeliczenie 88% VO₂max na ok. 3,0–3,7 m/s sprawdziłem (48 × 0,88 ≈ 42 mL/kg/min → ok. 3,2 m/s wg ACSM). Nacisk podłoża jest jasno oddzielony od siły w kości.
- **Spójność liczb między planszami.** Adrenalina „ponad 12×” (87% VO₂max) i „7×” (30 s sprint) są wyjaśnione. Wątroba ma 4–6× na obu planszach.
