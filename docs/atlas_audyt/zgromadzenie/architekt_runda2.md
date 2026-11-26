# Zgromadzenie, runda 2: Architekt 3D i potoku

Przeczytałem: anatom, dydaktyk, strażnik faktów, dostępność i licencje (runda 1).

## (a) Z czym się nie zgadzam

1. **Dydaktyk, p. 3–4: spoczynek „ścieżką `anatomy`”.** Strażnik słusznie pisze, że `anatomy` nie przechodzi żadnej kontroli.
   - Wartości spoczynkowe (6 L/min, 37 °C, nacisk 1× masa ciała) to liczby, a nie budowa.
   - Propozycja: osobne pochodzenie `textbook_consensus` z cytatem i lokalizatorem, sprawdzane jak każdy fakt. Ten format E1 i tak jest potrzebny.
2. **Dydaktyk, p. 3 rekomendacji: łańcuch „Co się dzieje najpierw” jako tekst na każdej planszy.** Byłoby to trzecie źródło scenariusza, obok `chains.json` Reżysera i P2.
   - Propozycja: kroki z `chains.json`, a plansza tylko je wyświetla.
3. **Anatom, p. 1 i 3: poprawka strzałek.**
   - Nie przerysowywać strzałek w pikselach, bo mózg ma je dziś w `plates/mozg.ts`.
   - Tor t. szyjnej wewnętrznej i drogi nerwowe trzeba zapisać w `flows3d.json` (metry, krzywe Z-Anatomy).
   - Nerwowy wymaga tylko przebiegu `ATLAS_ANCHORS_ONLY=1`, bez renderu.
   - Sam dopisek „(schemat)” zostawiłbym tylko na krótko.
4. **Anatom, moczowy: „przyciemnić tętnicę za żyłą”.** Nakładka SVG nie zna głębokości, więc w 2D to praca bez pokrycia. W 3D załatwi to test głębokości. Przenieść do E3.

## (b) Najważniejsze z cudzych list (z mojej perspektywy)

- **Dostępność, p. 2: strzałki niosą znaczenie tylko kolorem.** `FLOW_COLOR` leży w TSX, a nie w `palette.json`, więc walidator ich nie widzi, a shader 3D musiałby je kopiować.
  - Kolory rodzajów przepływu muszą trafić do palety i do walidatora par w jednym widoku. To ten sam problem co mój p. 4 (kolory spoza palety).
- **Dostępność, p. 10 i mój p. 3: wyjątek NC przez `atl_source`.** Przy eksporcie GLB potrzebny jest test w Node, bez Blendera.
- **Strażnik, rekomendacja E1, p. 1: jeden rekord na fakt, także dla ról.** Rekordy faktów, struktur i wiązań (`structureId` ↔ siatka) powinny powstać razem. Wtedy podpis 3D i podpis 2D czytają ten sam rekord.

## (c) Pięć poprawek „must-have”, według wagi

**Teraz, w 2D (przed przyjęciem):**
1. **Kontrast tekstu na kolorze układu** (moczowy 2,97:1, krwionośny 4,04:1, mięśniowy 4,35:1) oraz 5. test w walidatorze palety. *(dostępność, p. 1)*
2. **Błędne drogi strzałek:**
   - mózg: wejście przez t. szyjną wewnętrzną;
   - nerwowy: rozdzielenie strzałek, droga współczulna od Th, udowa od L2–L4.

   Poprawić w `flows3d.json`, a przy okazji przenieść oddechowy i mózg z pikseli na metry. *(anatom, p. 1 i 3; mój p. 3)*
3. **Legenda strzałek i kolory przepływów w `palette.json`:**
   - legenda z `labelPl` i inny wzór kreski dla każdego rodzaju;
   - walidator ΔE dla jasnych wariantów par w jednym widoku.

   *(dostępność, p. 2)*
4. **Treść sprzeczna z decyzjami lub sama ze sobą:**
   - pokarmowy: 7–8× w poziomie Podstawowym;
   - mózg: glukoza „mniej” i „więcej”;
   - `protocolNotePl`: „w późniejszych interwałach” dla liczb z minut.

   Tylko tekst, bez renderów. *(dydaktyk, p. 5; anatom, p. 2 i 4)*

**Przed startem E3 (nie blokuje przyjęcia 2D):**

5. **Kontrakt danych:**
   - `camera.frame` (ciało albo wstawka) i `frame` na torach `d_*`;
   - `bindings.json` z `Plate.render` zamiast kopii reguł w eksporcie GLB;
   - rekordy faktów i struktur wg E1 (rekomendacja strażnika, p. 1);
   - test NC i licencji na plikach GLB w Node.

   *(mój p. 1, 2 i 5)*
