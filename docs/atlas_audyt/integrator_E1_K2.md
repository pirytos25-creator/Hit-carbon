# Audyt Dyrygenta: Integrator, E1-K2 (przepięcie na dane, walidator, punkt montażu 3D)

Data: 2026-11-26. Commity `e54d0e0`, `b736264`, `60fdf58`, `b7deaf1` (oraz poprawka K1 `d3f2353`), scalone do `atlas-uklady`.

## Werdykt: **E1-K2 ZALICZONY** (runda 1 z 3). E1-K3 (fakty podręcznikowe) – wstrzymane decyzją użytkownika.

- **Jedno źródło treści:** fakty tylko w `facts/*.json`; `plates/*.ts` = układ (kotwice, widoki, kolejność, tier); `src/atlas/facts.ts` buduje planszę. Treść identyczna z poprzednią (22× jawne `tier: 'primary'` zamienione na domyślne – UI bez różnicy).
- **Walidator:** zakaz faktów w `plates/*.ts`; spójność liczb między planszami (wspólny `topic` dla 3 par); migracja nie nadpisuje faktów; wczytuje `public/atlas3d/<pl>/bindings.json` (pole `anchors`, `anchorMethod`: `objects` = rozwiązane, `nearest` = do kontroli).
- **3 uwagi D1:** dopisane przeliczenia (36,1≈36; +83,1%≈+83%; 4,90≈4,9 i 6,91≈6,9) – arytmetyka z dosłownego cytatu, status bez zmian – zgoda Dyrygenta.
- **Punkt montażu 3D:** „Obróć w 3D” tylko przy `public/atlas3d/<uklad>/manifest.json` i na desktopie; `React.lazy(Atlas3DView)` z `{system, state, level, onClose}`; komunikat zastępczy bez modułu.
- **Powiązania siatek:** krwionośny 16/16, mięśniowy 10/10; pozostałe 52 – z `bindings.json` Wizualizatora; pokarmowy nie ma kotwic 3D.

## Testy Dyrygenta po scaleniu
Build 0; `check:atlas` 0 – 71 liczb, 164 opisy ról, 162 budowy, 21 podsumowań, „dane = plansze”, 0 uwag. 24 zrzuty 12 plansz (1440 i 390): 0 błędów konsoli, bez przewijania w poziomie; obejrzany krwionośny 1440 (sprint) – bez zmian względem stanu przed przepięciem, legenda strzałek, przycisk 3D niewidoczny (brak manifestu – poprawnie).

## Runda siatek (commit `4968134`, scalony)
188 kotwic: 111 rozwiązanych (krwionośny 16/16, mięśniowy 10/10), 66 `nearest` do kontroli (`resolved: false` + odległość w mm, maks. 17,8 mm), 11 bez siatki (przekroje schematyczne). 19 wpisów to geometria tworzona przez skrypty plansz (licencja „własna”). ID `hra:` sprowadzone do kontraktu (38/38 istnieje w GLB). Uwagi o niezgodnościach eksportu (nerwowy, oddechowy, 35 kotwic statycznych) przekazane Wizualizatorowi. Po scaleniu (Dyrygent): build 0, `check:atlas` 0 uwag.
