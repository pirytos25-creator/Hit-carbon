# Audyt Dyrygenta: kostny, punkt kontrolny K2

Data: 2026-11-25. Sesja `local_e40f4943-860f-4eee-9aaf-2615cee60e38`, worktree `.claude/worktrees/atlas-kostny-0ebfd9`. Raport agenta: `side-session-notes/.../kostny/kostny_K2.md`.

## Werdykt: **K2 ZALICZONY warunkowo** (runda 1 z 3): poprawki z listy poniżej wprowadzić przed K3; sprawdzam je w audycie K3

| # | Punkt | Wynik |
|---|---|---|
| 1 | Zakres plików | OK: `plate_kostny.py`, `public/atlas/kostny/*`, `plates/kostny.ts`, 2 linie `index.ts`, dopiski w `ScientificReferences.ts` (`acts: []`). Wspólny kod nietknięty. |
| 2 | Anatomia | Przekrój `Femur.r` (obejrzałem `detail_sprint.webp`): głowa przyśrodkowo, istota zbita grubsza w trzonie, jama szpikowa, pasma beleczek ściskanych (pionowo w głowie) i rozciąganych (łukiem od kory bocznej) – zgodne z podręcznikowym obrazem, podpisane „schemat”. |
| 3 | Obraz | Sam zrobiłem zrzuty 1440 i 390 (sprint) na własnym podglądzie: kotwice trafiają, strzałka siły biegnie drogą obciążenia. Usterki: tytuł widoku z boku ucięty („…(BEZ P”); na 390 px widok z boku dużo większy od przodu. Kolor roboczy (czeka na `palette.json`). |
| 4 | Fakty | Niezależny sprawdzający: `docs/atlas_audyt/fakty_kostny.md`: 11 `checked_agent`, 3 `disputed`, 4 `unverifiable`. Identyfikatory i cytaty Munro 1987 dosłowne, strony zgodne. |
| 5 | Testy | Sam: `npm.cmd run build` w worktree agenta – kod 0; konsola bez błędów. |
| 6 | Dydaktyka | 10 podpisów `primary`, ≤ 4 liczby podstawowe. |

## Poprawki (przed K3)
1. **Munro – zawężenie do protokołu wzorcowego** (decyzja Dyrygenta): 88% VO₂max u rekreacyjnego 25-latka to ok. 3,0–3,7 m/s, dolna część zakresu badania. Liczby podstawowe: szczyt nacisku **ok. 2,5–2,7 × masa ciała**, kontakt stopy **ok. 0,24–0,27 s** (wartości z tabel Munro potwierdzone przez sprawdzającego). Pełny zakres 3–5 m/s w poziomie rozszerzonym. `protocolMismatch`: pojedyncze kroki biegu ze stałą prędkością w stanie wypoczętym, bez % VO₂max.
2. **Przebudowa kości:** „cykl 3–4 miesiące” jest błędny (to faza odbudowy). Podać cały cykl wg Eriksen 2010 (ok. 200 dni w kości gąbczastej, ok. 120 dni w zbitej) z dosłownym cytatem albo mówić tylko „tygodnie i miesiące” bez liczby. Status `draft` (nowa wartość).
3. **Podtytuł:** „nacisk podłoża na stopę”, nie „na kości nogi”.
4. **Krętarz większy:** przyczep mm. pośladkowego średniego i małego.
5. **Weyand 2000:** `quote` dosłownie (wersja w raporcie sprawdzającego).
6. **Opisy roli kości** (udowa, piszczelowa, piętowa) i zdanie o drodze nacisku: źródło anatomiczne albo przeformułowanie na opis anatomiczny bez twierdzenia przyczynowego.
7. **Nazwy łacińskie pasm beleczek:** usunąć neologizmy spoza TA/TA2 (zostawić polski opis „schemat”). „Kość miedniczna” bez dopisku „(miednica)”.
8. **Tytuł widoku z boku:** skrócić, żeby się mieścił.
9. **Statusy:** fakty potwierdzone przez sprawdzającego → `checked_agent` (z jego cytatem i lokalizatorem); zmienione (pkt 2, 6) → `draft`.
