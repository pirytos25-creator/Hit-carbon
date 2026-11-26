# Audyt Dyrygenta: Integrator, punkt kontrolny K1 (część A: scalenie)

Data: 2026-11-25. Gałąź `claude/atlas-integrator-2ef0c7`, commit `07e3f67`, baza `atlas-uklady` = `ce6bef0`.

## Werdykt: **K1 ZALICZONY, kontynuuj** (runda 1 z 3)

## Lista kontrolna (statut §5)
| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK. 37 plików, tylko pliki 5 plansz + `plates/index.ts` + `ScientificReferences.ts`. Wspólny kod nieruszony. |
| 2 | Anatomia i odwzorowanie | Bez zmian względem gałęzi fazy 1 (pliki plansz bajt w bajt jak na gałęziach źródłowych, wg raportu integratora). Ocena anatomii przy K2/K3. |
| 3 | Obraz | Obejrzałem sam zrzuty 1440 px: krwionośny (sprint), mięśniowy (spoczynek), mózg (sprint). Rendery, podpisy, liczby i stopka na miejscu. Znane usterki (niżej) istniały już na gałęziach. |
| 4 | Fakty | Poza zakresem K1. Sprawdzenie faktów 5 plansz trwa osobno (`docs/atlas_audyt/fakty_*.md`); poprawki trafią do integratora w K3. |
| 5 | Testy | Sam uruchomiłem `npm.cmd run build` w worktree integratora: kod 0, `AtlasApp` 39,04 kB. Sam zrobiłem 20 zrzutów na porcie 5189 (headless Chrome): konsola bez błędów i wyjątków, tylko 2 znane ostrzeżenia `link preload` z `index.html` głównej aplikacji; brak poziomego przewijania przy 390 px. |
| 6 | Dydaktyka | Ocena przy K3 (po nakładce HTML i poziomach). |

Historia: 5 scaleń `--no-ff` w zadanej kolejności (`8abdbc3`, `723dc1c`, `a941fc9`, `9a265ba`, `07e3f67`). 45 unikalnych źródeł, bez powtórzonych ID; `plates/index.ts` ma 5 wpisów z treścią.

## Znane problemy przeniesione do K2/K3 (nie regresje)
1. Mięśniowy 1440: podpisy widoku z tyłu nachodzą na kolumnę zbliżenia (widoczne na moim zrzucie) → B.
2. Krwionośny 1440: tytuł „SERCE Z PRZODU” leży na renderze, linie lewej strony przecinają serce → B.
3. `flows` nie są rysowane → B.
4. Telefon 390: podpisy SVG 5–7 px, pasek układów ucięty bez wskazówki → D.
5. `.claude/launch.json` jest śledzony w repo. Decyzja Dyrygenta: zostaje jak jest (poza zakresem atlasu); agenci dopisują porty lokalnie z `skip-worktree` i nie commitują.

## Wskazówki na K2 (z wyników sprawdzania faktów)
Sprawdzający fakty zgłaszają, że plansze nie mają pola źródeł przy podpisach i podsumowaniach, więc twierdzeń z podpisów nie da się podpiąć pod cytat. Integrator w B (typy) dodaje do schematu: `referenceIds` przy podpisie i podsumowaniu, flagę `protocolMismatch` z opisem protokołu źródła oraz status faktu (`draft` / `checked_agent` / `disputed` / `unverifiable`), tak by nakładka (D) pokazywała tylko `checked_agent`.
