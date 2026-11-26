# Zgromadzenie, runda 2: DYDAKTYK

## (a) Z czym się nie zgadzam

- **Anatom, „spójność liczb między planszami”.** Spójność jest tylko na hormonalnym:
  - Nerwowy podaje adrenalinę 0,2 → 1,4 (7×) bez odsyłacza do 12×.
  - Podsumowanie pokarmowego w Podstawowym nadal podaje „7–8 razy”, wbrew decyzji a).
  - Uczeń, który przechodzi między planszami, widzi sprzeczność.
- **Anatom, dopisywanie zdań do notatek protokołu i liczb** („w późniejszych interwałach”, „w naszym interwale najpewniej mniej”). Co do treści się zgadzam, ale w Podstawowym tekst musi się w sumie skrócić, a nie wydłużyć. Zamiast długiego „W badaniu: …” wystarczy krótki dopisek, a pełny opis protokołu tylko w Rozszerzonym.
- **Strażnik, zaostrzenie statusu `anatomy`.** Popieram, ale pod jednym warunkiem: nie może to zablokować faktów podręcznikowych o spoczynku. Puste stany spoczynku na nerwowym, mięśniowym, powłokowym i oddechowym to największa strata dydaktyczna. Proponuję osobny status `textbook`: cytat z podręcznika szkolnego lub akademickiego plus drugi sprawdzający, zamiast nieskontrolowanego `anatomy`.
- **Architekt, kolejność „E3 równolegle z R1”.** Dla ucznia przewodnik 2D z pytaniem „przewidź” jest ważniejszy niż scena 3D. R1 nie powinien czekać na kontrakt E3 ani z nim konkurować o zasoby.

## (b) Najważniejsze z cudzych list (z perspektywy ucznia)

- **Anatom 3, nerwowy.** Strzałka współczulna i strzałka ruchowa łączą się w jedną drogę szyja → nadnercze → udo. Atlas uczy wtedy fałszywego łańcucha przyczyn, a to najgorszy rodzaj błędu w materiale dydaktycznym.
- **Anatom 2, mózg.** Karty o glukozie przeczą sobie („mniej” i „więcej”). To pokrywa się z moim zarzutem, że mózg w Podstawowym jest najsłabszy.
- **Anatom 4, skala czasu.** Liczby z minut pracy podpisano jako „koniec 45 s”. To podstawa uczenia kolejności w czasie.
- **Dostępność 2, strzałki bez legendy.** Pole `labelPl` się nie wyświetla, a znaczenie niesie tylko kolor. Strzałki są głównym nośnikiem przyczyn, więc legenda pomaga też dydaktycznie.
- **Dostępność 1 i 6.** Numery pinezek na moczowym są nieczytelne (kontrast 2,97:1). Na telefonie nie da się wrócić z atlasu.
- **Strażnik 3 i 7.** `protocolNotePl` jest poza bramką faktów, więc moja definicja VO₂max też musi przez nią przejść. Symulację (deltoid) trzeba nazwać symulacją.

## (c) 5 poprawek „must-have” przed przyjęciem (od najważniejszej)

1. **Nerwowy:** rozdzielić strzałkę współczulną i ruchową. Strzałka współczulna zaczyna się w odcinku piersiowym, a strzałka ruchowa biegnie z L2–L4 przez splot lędźwiowy (Anatom 3).
2. **Mózg w Podstawowym:**
   - usunąć sprzeczność o glukozie (Anatom 2);
   - przenieść liczby PET i CMR do poziomu `student`, a do Podstawowego wpuścić przepływ krwi przez mózg;
   - dodać 3–4 opisy ról przez ścieżkę `textbook`. Kora ruchowa może dostać opis już sprawdzony na nerwowym.
3. **Spójność liczb w Podstawowym:**
   - usunąć „7–8×” z podsumowania pokarmowego;
   - na nerwowym dopisać odsyłacz do adrenaliny 12×;
   - liczbę rozrodczego „ES −0,06 (CrI…)” przenieść do poziomu `student` i zmienić jej poziom dowodów na „mała pewność” (Strażnik 10).
4. **Strzałki i kontrast:**
   - pod każdym widokiem legenda strzałek z `labelPl` i różnymi wzorami kreski (Dostępność 2);
   - na planszy moczowej numery pinezek i przycisk „Sprint” z kontrastem ≥ 4,5:1 (Dostępność 1).
5. **Język Podstawowego (przez bramkę faktów, Strażnik 3):**
   - jedno zdanie definicji VO₂max;
   - dopiski „W badaniu: …” najwyżej 10 słów, pełny opis tylko w Rozszerzonym;
   - w notatce protokołu dopisek „w późniejszych interwałach” tam, gdzie liczby pochodzą z minut pracy (Anatom 4);
   - poprawić składnię „1 liczba czeka … nie jest pokazywana”.

Pierwsza rzecz po przyjęciu: ścieżka `textbook` dla stanów spoczynku i wartości spoczynkowych, np. ok. 6 L/min wentylacji, 37 °C i nacisk ok. 1× masa ciała w staniu.
