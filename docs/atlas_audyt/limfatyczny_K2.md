# Audyt Dyrygenta: limfatyczny, punkt kontrolny K2

Data: 2026-11-26. Sesja `local_562c4781-155b-408c-9843-240bfffcb276`, worktree `.claude/worktrees/atlas-limfatyczny-dcd0be`.

## Werdykt: **K2 ZALICZONY warunkowo** (runda 1 z 3): poprawki przed K3; sprawdzam je w audycie K3

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK: plansza, rendery, `index.ts`, `ScientificReferences.ts` +9 źródeł. Wspólny kod nietknięty (lokalne nadpisanie `write_flows3d` w skrypcie planszy – opisane). |
| 2 | Anatomia | Kamera przodu jak krwionośny. Przewód piersiowy do lewego kąta żylnego, zbiornik mleczu, śledziona po lewej. Kotwice zbliżenia liczone promieniami (strefa przykorowa nie trafia już w rdzeń). |
| 3 | Obraz | `K2_rendery_kotwice.jpg`: w sprincie węzły i śledziona bardziej nasycone; zmniejszenie śledziony (skala 0,88) słabo widoczne przy 1440 – w K3 sprawdzić przy 390 px. Dopisek „węzły powiększone, naczynia chłonne: schemat” w tytule widoku. |
| 4 | Fakty | Niezależny sprawdzający (`fakty_limfatyczny.md`): 34 – 11 `checked_agent`, 18 `anatomy`, 4 `disputed`, 1 `unverifiable`. Liczby Bogdanisa, Niemana, Stewarta i momenty pomiaru zgodne; spór o śledzionę zacytowany uczciwie. |
| 5 | Testy | Sam: `npm.cmd run build` – kod 0. |

## Poprawki (przed K3)
1. Przewód piersiowy i węzły pachwinowe w sprincie: Havas 1997 mierzył usuwanie albuminy z mięśnia uda – opis „prawdopodobnie więcej limfy z nóg”, `preliminary_human`.
2. Podsumowanie spoczynku: limfa to płyn tkankowy, który trafił do naczyń chłonnych (nie „wycieka z naczyń”); zdanie o NK „w ścianach naczyń, śledzionie i węzłach” – źródło albo usunąć.
3. Spadek limfocytów −30 do −60%: cytat z właściwego zdania Campbell 2018 (akapit o apoptozie).
4. „Otwarte okno”: usunąć „przez kilka godzin” (brak u Pedersena 1995); dodać Simpson i in. 2020 (PMID 32139352).
5. Grasica w sprincie: źródło albo tylko nazwa.
6. Statusy: potwierdzone → `checked_agent`/`anatomy`; zmienione → `draft`.
