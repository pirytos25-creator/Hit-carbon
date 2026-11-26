# Audyt Dyrygenta: rozrodczy, punkt kontrolny K2

Data: 2026-11-26. Sesja `local_38e25e6a-ea22-4f47-9266-0aa8758cd6d5`, worktree `.claude/worktrees/atlas-rozrodczy-47639b`.

## Werdykt: **K2 ZALICZONY warunkowo** (runda 1 z 3): poprawki przed K3; sprawdzam je w audycie K3

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK: plansza, rendery, `index.ts`, `ScientificReferences.ts` +13 źródeł. Wspólny kod nietknięty. |
| 2 | Anatomia | `kotwice_K2.png`: 18/18 kotwic trafia (macica na trzonie, jajowód oddzielony od jajnika). Pęcherz żeński z HRA (VH_F_Urinary_Bladder, CC BY 4.0) – plik skopiowałem do `atlas_raw/hubmap/female/`. Do wyjaśnienia: w widoku z boku pęcherz żeński wystaje przed obrys kości łonowej (sprawdzić renderem z boku i z przodu). |
| 3 | Obraz | `detail.webp`: rzeczowy przekrój jak w podręczniku, wspólna skala z miednicą męską. |
| 4 | Fakty | Niezależny sprawdzający (`fakty_rozrodczy.md`): 36 pozycji – 24 `checked_agent`, 6 `disputed`, 6 `unverifiable`. 13 identyfikatorów poprawnych, 5 cytatów `quote` dosłownych. Ton rzeczowy, brak sugestii „testosteron buduje mięśnie”, REDs długoterminowo. |
| 5 | Testy | Sam: `npm.cmd run build` – kod 0. |

## Poprawki (przed K3)
1. Hackney 2012: „wolny testosteron był niższy” – porównanie z sesją kontrolną, nie z wartością sprzed wysiłku; `protocolMismatch`: „90 s aktywnej przerwy przy 40% VO₂max”, „mężczyźni wytrenowani wytrzymałościowo”; lokalizator „abstrakt”.
2. Velasco-Orjuela 2018 nie podaje wzrostu wolnego testosteronu – usunąć z tego twierdzenia albo opisać to, co podaje (spadek kortyzolu, stosunek T/C, podobnie w grupie kontrolnej).
3. Podsumowanie: usunąć sprzeczność („ani pracy”); „hormony płciowe” → „testosteron u mężczyzn” (o kobietach badania tego nie mówią).
4. Nasieniowód: źródło StatPearls „Male Genitourinary Tract” (PMID 32965962) albo bez „od najądrza”.
5. Pęcherzyk nasienny: łacina TA2 `glandula seminalis`; położenie „za pęcherzem” ze źródłem albo bez niego.
6. Więzadło właściwe jajnika: źródło `statpearls_ovary`.
7. Trzy podpisy bez źródła (pęcherz męski, naczynia jądrowe, tętnica maciczna) – cytaty z raportu sprawdzającego.
8. Skrót „REDs” (jak w konsensusie 2023).
9. Pęcherz żeński – sprawdzić położenie (pkt 2 tabeli).
10. Statusy: potwierdzone → `checked_agent`; zmienione → `draft`.

Ukrycie przełącznika stanów przy `card: true` i rodzaj strzałki `repro` – do integracji 1b (nie blokują karty).
