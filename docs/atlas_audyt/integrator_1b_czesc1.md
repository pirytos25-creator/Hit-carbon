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

## Dokończenie części 1 (2026-11-26, commity `343cfa2`, `356fe8d`, `22a0550`, `c405027`; scalone)
- `shownSummary()`: podsumowanie `draft` nie trafia na ekran; zamiast niego `summaryVerified` (same zdania potwierdzone) albo nic. Walidator to wymusza.
- `protocolNotePl` zamiast stałego zdania o „sprincie” (sprawdzone na planszy skóry: „sprint = koniec treningu”).
- Poziom Podstawowy: liczby `primary`, potem `secondary`; `student` tylko w Rozszerzonym (kostny chwilowo 0 liczb – jego `primary` czekają na sprawdzenie).
- Napis zakładki = tytuł widoku; wspólna skala widoków z tą samą kamerą na telefonie (kostny: przód i bok tej samej wielkości – obejrzane przy 390 px).
- Statusy 27 faktów wg `fakty_draft_1b.md`: 20 `checked_agent`, 6 poprawionych tekstów `draft`. Wolny testosteron (rozrodczy): zmieniony tylko lokalizator – `checked_agent` potwierdzony przez Dyrygenta.
- Decyzje: trasy `repro` i `world_tree` – nie robimy (test zakresu).
- Po scaleniu (sam): build kod 0; `check:atlas` OK – 46 liczb, 132 opisy ról (+91 opisów budowy), 9 podsumowań, 59 `draft`; 20 zrzutów 10 plansz (1440 i 390), 0 błędów konsoli, bez przewijania w poziomie.
