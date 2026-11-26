# Audyt Dyrygenta: Integrator, E1-K1 (dane L1)

Data: 2026-11-26. Commit `76f9419`, scalony do `atlas-uklady`.

## Werdykt: **E1-K1 ZALICZONY, kontynuuj** (runda 1 z 3)

- `structures.json` 176 pojęć (9 w kilku układach), `mesh_bindings.json` 175 powiązań (105 `za:` CC BY-SA, 18 `hra:` CC BY; **52 nierozwiązane** – obiekty liczone w kodzie skryptów plansz), `facts/*.json` 572 rekordy (487 na ekranie) z `provenance`, `accessMode`, `quote`, `locator`, `referenceIds`, `checkedBy`.
- `provenance` i `accessMode` wyliczone regułami i oznaczone `auto`; `checkedBy` 294/317 (123 wywnioskowane – flaga).
- Walidator danych w `check:atlas`: schematy, ID, NC, zgodność 1:1 z planszami, `textbook_consensus` wymaga ISBN/NBK, `anatomy` bez słów zmiany; testy negatywne.
- Sam po scaleniu: build 0; `check:atlas` 0 – „dane = plansze”: 71 liczb, 164 opisy ról, 162 budowy, 21 podsumowań; 0 uwag.

## Decyzje do K2
1. **Treść faktów tylko w `facts/*.json`**, `plates/*.ts` trzyma układ (kotwice, widoki, kolejność, tier) – zgoda (model §3.1: wiedza niezależna od widoku). Migracja jednorazowa; walidator pilnuje, by w `plates/*.ts` nie było tekstów faktów.
2. **Nierozwiązane powiązania:** priorytet krwionośny i mięśniowy (pierwsze w 3D) – 100% rozwiązane w K2. Pozostałe plansze przez zapis siatek w `atlas_lib` przy przebiegu `ATLAS_ANCHORS_ONLY=1` (slot; Blender współdzielony z Wizualizatorem – najwyżej 1 slot naraz dla integratora). Co nie zdąży – opis w raporcie.
3. Punkt montażu 3D w `AtlasApp` (kontrakt przekazany Wizualizatorowi).
