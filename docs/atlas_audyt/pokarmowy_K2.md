# Audyt Dyrygenta: pokarmowy, punkt kontrolny K2

Data: 2026-11-26. Sesja `local_dc0d456d-5b08-4b78-885d-fbb7b4512592`, worktree `.claude/worktrees/atlas-pokarmowy-b0b770`.

## Werdykt: **K2 ZALICZONY warunkowo** (runda 1 z 3): poprawki przed K3; sprawdzam je w audycie K3

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK: plansza, rendery, `index.ts`, `ScientificReferences.ts` +6. Wspólny kod nietknięty. |
| 2 | Anatomia | Poprawki K1 zrobione: kadr obniżony, podpisy wnęki wątroby rozsunięte. 19 kotwic sprawdzonych promieniem. |
| 3 | Obraz | `K2/zrzuty_cmp/cmp.jpg`: plansza obok oddechowej; przy 1440 rendery mniejsze, bo bez filtra poziomów widać 19 podpisów – ocena w K3 po scaleniu (filtr `tier`). |
| 4 | Fakty | Niezależny sprawdzający (`fakty_pokarmowy.md`): 37 – 17 `checked_agent`, 16 `anatomy`, 4 `disputed`, 0 `unverifiable`. Produkcja glukozy 7–8×, glukoza 4,9 → 6,9, Brooks 50% / 75–80%, Perko −50/−32% – zgodne. |
| 5 | Testy | Sam: `npm.cmd run build` – kod 0. |

## Poprawki (przed K3)
1. Przepływ przez wątrobę w sprincie: zawęzić do ok. 0,4 L/min (regresja Rowella dla ok. 88% VO₂max ≈ 26% spoczynku); pełny zakres 0,4–0,8 w poziomie rozszerzonym.
2. Cykl Cori „głównie w przerwach i po serii” (podsumowanie, podpis ż. wrotnej): Brooks 2020 tego nie mówi – usunąć tę frazę albo podać źródło.
3. Jelito grube w sprincie: źródło Perko 1998 (t. krezkowa górna −32%), nie Rowell; `protocolMismatch` Perko: 75% VO₂max, rower półleżąco.
4. Rozważyć glukozę z Bogdanis 2022 (6,56 mmol/L zaraz po 8 × 60 s) jako bliższą wzorcowi – w poziomie rozszerzonym obok Marliss 1992.
5. Drogi żółciowe: wymienić przewód żółciowy wspólny (ductus choledochus) uchodzący do dwunastnicy.
6. ID źródła Marliss i Vranic 2002: `marliss_vranic_2002` (wspólne z hormonalnym).
7. Statusy: potwierdzone → `checked_agent`/`anatomy`; zmienione → `draft`.
