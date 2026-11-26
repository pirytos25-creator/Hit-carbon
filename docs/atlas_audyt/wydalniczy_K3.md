# Audyt Dyrygenta: wydalniczy (moczowy), punkt kontrolny K3

Data: 2026-11-26. Gałąź `claude/atlas-wydalniczy-d343d3` (`5e4c2b3`, `246cc75`, `056f699`).

## Werdykt: **K3 ZALICZONY**, scalony do `atlas-uklady` (merge `60f18bb`)

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK: 12 plików, tylko pliki planszy, `index.ts` +2/−1, +176 w źródłach. |
| 2 | Anatomia i licencja | Poprawki K2 wprowadzone (bez „nerki sprzątają kwas”, < 2% mleczanu z moczem, akwaporyny jako model zwierzęcy). Nerki z HuBMAP; skrypt nie wczytuje obiektów NC (sprawdzone w K2). |
| 3 | Obraz | Sam: zrzut 1440 (sprint) na scalonym `atlas-uklady`. Przełącznik widoków (jama brzuszna i miednica / nefron), podpisy w jednej kolumnie – render duży. Nerki i moczowody przygaszone w sprincie (plansza odwrócona, opisana w podsumowaniu), nadnercza wyróżnione, strzałki moczu i krwi. Konsola 0 błędów, bez poziomego przewijania. |
| 4 | Fakty | Na ekranie tylko `checked_agent`. Fakty `draft` do przeglądu końcowego. |
| 5 | Testy | Konflikt dopisków w `index.ts` i `ScientificReferences.ts` rozwiązany z zachowaniem wszystkich wpisów: 124 źródła, 0 duplikatów. Po scaleniu: build kod 0, `check:atlas` OK (44 liczby, 116 opisów na ekranie, 80 `draft`). |

Do 1b (część 2): rozdzielczość na widok w `anchors.json` (`body_front` 1000×1800 vs plansza 1150×1600), przejście z lokalnego `rest_level` na biblioteczny, ciasny poziom rozszerzony przy 1440 (16 podpisów).
