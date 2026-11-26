# Audyt Dyrygenta: Integrator, punkt kontrolny K3 (D: E0, E: rendery, F: księga stylu, poprawki faktów i krwionośnego)

Data: 2026-11-26. Gałąź `claude/atlas-integrator-2ef0c7`, commity `8264e72`, `3e24c28`, `81f7be1`, `e8faaa3`, `aa2afb8`, `9c031e6`.

## Werdykt: **K3 ZALICZONY** (runda 1 z 3). Gałąź scalona do `atlas-uklady`.

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | Wspólny kod, `palette.json`, walidatory, rendery 4 plansz, treść 5 plansz (poprawki faktów zlecone przez Dyrygenta), księga stylu i brief §1. Plików agentów 1b nie dotknięto; API `atlas_lib` z K2 bez zmian sygnatur. |
| 2 | Anatomia i odwzorowanie | Oddechowy przeszedł na `align_hubmap` (przesunięcie drzewa oskrzeli 0,6–2,0 cm; drzewo nadal w płucach). Poprawki z kontroli wizualnej krwionośnego 1–5 zrobione, drobne – zrobione albo uzasadnione (t. podkolanowa leży z tyłu; urwana żyła to koniec krzywej Z-Anatomy). |
| 3 | Obraz | Sam: 20 zrzutów na porcie 5189. Obejrzałem krwionośny 1440 (sprint), oddechowy 1440 (sprint), nerwowy 390 (sprint). Menu w 4 grupach ról + „Inne” z ikonami; nakładka HTML (nazwy 15 px, opisy 14 px); na telefonie numerowane pinezki i lista; przełącznik poziomów; dopisek „W badaniu: …” przy liczbach z innego protokołu; zdanie wyjaśniające „sprint”; poziom dowodów słowami. Krwionośny: strzałki w szyi rozdzielone, bez pętli przy aorcie, bez „kłębów” w oczodołach. |
| 4 | Fakty | Filtr działa: na ekranie tylko `checked_agent` (11 liczb, 35 opisów), 55 faktów `draft` ukrytych i podanych liczbą. Wartości „draft” pochodzą z dosłownych cytatów, nie z szacunków sprawdzającego. Niezależne sprawdzenie 55 faktów `draft` zlecone (`fakty_draft_K3_*.md`). |
| 5 | Testy | Sam: `npm.cmd run build` kod 0; `npm run check:atlas` kod 0 (ΔE: najmniejsza 15,3 dla par pokazywanych razem, także przy deuteranopii i protanopii; rzut 58 kotwic ≤ 0,12 px; fakty OK). Konsola: 0 błędów i wyjątków. |
| 6 | Dydaktyka | Podstawowy: tylko `primary`, bez łaciny, ≤ 4 liczby. Rozszerzony dodaje cytat, lokalizator, źródło i uczciwy dopisek „sprawdzone przez agenta AI z dosłownym cytatem (nie przez eksperta)”. |

## Decyzje do otwartych problemów (§7 raportu integratora)
1. **Nowe kolory 7 układów** (`palette.json`): Dyrygent przekazuje je agentom 1b razem z wiadomością o scaleniu. Rendery końcowe agentów po `git merge atlas-uklady`.
2. **Mózg**: przerenderować na świetle biblioteki (usunąć lokalne `LIGHT_SCALE`) – w integracji 1b.
3. **Mało liczb na ekranie** – po niezależnym sprawdzeniu 55 faktów `draft` integrator nadaje statusy wg raportów (integracja 1b).
4. **Opisy ról bez źródła** (mózg, spoczynek) – zostają ukryte, dopóki nie ma źródła z PMID/DOI; integracja 1b może dodać źródła przeglądowe (StatPearls z PMID).
5. **Obcinanie świateł przy emisji 0,35** (powłokowy 45% w najjaśniejszej ćwiartce) – agent powłokowy sprawdza na swoim renderze w K3.
6. **OpenStax** bez DOI/PMID → `unverifiable` – zgodnie z §3.6 pkt 2, decyzja podtrzymana.

## Do integracji 1b (zebrane z audytów układów)
`rest_level` dla plansz „odwróconych” (pokarmowy, moczowy) i zasada w księdze; ukrycie przełącznika stanów przy `card: true`; rodzaj strzałki `repro`; korekta briefu powłokowego (chłodzenie po wysiłku wg Kenny 2007/2008); skóra VH_F v1.3 jako znany problem zasobu w `ATLAS_ASSETS.md`; oddechowy – mały render w kadrze 1440 (dużo pustego miejsca).
