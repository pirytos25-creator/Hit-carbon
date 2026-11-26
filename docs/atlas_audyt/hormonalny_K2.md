# Audyt Dyrygenta: hormonalny, punkt kontrolny K2

Data: 2026-11-26. Sesja `local_ea8edc9b-cb7f-40ae-9ae2-81613e24be2c`, worktree `.claude/worktrees/atlas-hormonalny-e7f0e5`.

## Werdykt: **K2 ZALICZONY warunkowo** (runda 1 z 3): poprawki przed K3; sprawdzam je w audycie K3

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK: plansza, rendery (front, detail, body_front), `index.ts` 2 linie, 11 źródeł. |
| 2 | Anatomia | Decyzje K1 wykonane: `front` = głowa i tułów, `body_front` osobno, przygaszone gruczoły mieszane z `#8E7A78`, kotwice rozsunięte, `marliss_vranic_2002` w tym samym brzmieniu co u pokarmowego. |
| 3 | Obraz | `K2/strona_5191_sprint.jpg` (stary `AtlasApp`): gruczoły widoczne, strzałki hormonów w sprincie. **Czubek głowy (podwzgórze, przysadka) chowa się pod przełącznikiem widoków u góry** – do poprawy kadrem. |
| 4 | Fakty | Niezależny sprawdzający (`fakty_hormonalny.md`): 46 – 30 `checked_agent` (5 wymaga tylko dopisania referencji), 10 `anatomy`, 5 `disputed`, 1 `unverifiable`. Kolejność w czasie zgodna (katecholaminy na końcu wysiłku, GH z opóźnieniem, insulina prawie bez zmian), bez mitów. |
| 5 | Testy | Sam: `npm.cmd run build` – kod 0. |

## Poprawki (przed K3)
1. **Adrenalina „×14–18”** → sprawdzalna wartość dla ok. 87% VO₂max: „ponad 12×” (Sigal 1996); w poziomie rozszerzonym dla porównania ok. 7× po 30 s sprincie (Brooks 1988).
2. **Kortyzol:** „rośnie w dłuższym albo bardzo intensywnym wysiłku” (Kindermann 1982: +35% już po ok. 1,5 min); usunąć „w jednym 45 s interwale wyraźnej zmiany się nie spodziewamy”.
3. **Insulina po wysiłku 40–60 min:** dodać `marliss_vranic_2002` i dopisać, że to po wysiłku do wyczerpania; Peake 2014 (interwały) widział spadek – uczciwie oba.
4. **GH „szczyt ok. 30 min po”:** Stokes 2002 mówi tylko „nadal wyższy 60 min po”, a powtórzony sprint nie dał wzrostu – przeformułować zgodnie z cytatem.
5. Glukagon spójnie w podpisie trzustki i notatce; `sigal_1994.summaryPl` z „przy 87% VO₂max”; brakujące `referenceIds` (ż. wrotna, ż. główna dolna, rdzeń nadnercza, podsumowanie spoczynku).
6. Kadr: górny margines tak, by głowa i podpisy podwzgórza i przysadki nie chowały się pod przełącznikiem.
7. Statusy: potwierdzone → `checked_agent`/`anatomy`; zmienione → `draft`.
