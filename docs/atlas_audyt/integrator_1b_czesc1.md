# Audyt Dyrygenta: Integrator, integracja 1b – część 1

Data: 2026-11-26. Commity `0b6f6ee`…`3cf14d9` na `claude/atlas-integrator-2ef0c7`, scalone do `atlas-uklady`.

## Werdykt: **PRZYJĘTA i scalona**, z jedną nową regułą do wdrożenia

- `rest_level` dla plansz odwróconych (pokarmowy, moczowy) + zasada w księdze stylu.
- `card: true` (karta bez stanów) – sprawdzone na karcie rozrodczej po scaleniu: brak przełącznika stanów.
- Rodzaj strzałki `repro`.
- Przełącznik widoków dla każdej planszy z dwoma widokami – sam obejrzałem 1440: rozrodczy, mózg, oddechowy. Obrazy wyraźnie większe niż przed zmianą (rozrodczy: z ok. 150 px do pełnej wysokości panelu).
- Mózg przerenderowany na świetle biblioteki; naprawiona kamera przekroju w `anchors.json`.
- Statusy 55 faktów wg raportów `fakty_draft_K3_*`: 39 `checked_agent`, disputed/unverifiable ukryte, poprawione teksty `draft`.
- Cofnięta błędna notka o skórze VH_F.
- Po scaleniu (sam): `npm.cmd run build` kod 0, `check:atlas` OK – 29 liczb, 78 opisów na ekranie, 27 `draft`; konsola 0 błędów.

## Decyzje
1. Metryki z dopiskami redakcyjnymi zostają `checked_agent`.
2. `main_bronchus`, `bronchiole`, `d_svc` → `anatomy`.
3. **Nowa reguła:** podsumowanie `draft` nie pokazuje się (dziś widoczne z dopiskiem „Opis roboczy”, np. oddechowy „ok. 6,5 razy szybciej” – niesprawdzone). Pokazywać tylko sprawdzone zdania; walidator ma to wymuszać.
4. 27 pozycji `draft` – niezależne sprawdzenie zlecone (`fakty_draft_1b.md`).
