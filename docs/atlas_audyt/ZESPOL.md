# Zespół atlasu: sesje i stan punktów kontrolnych

Stan na 2026-11-26 (po wznowieniu o 01:00). Ten plik jest zapisem stanu na wypadek przerwy (limit użycia).

Dyrygent (CEO): `local_d25e62f6-f11b-4af7-b30c-5a3005c68551`, główny checkout, gałąź `atlas-uklady`.
Koordynator (sesja nadrzędna): `local_522be64d-3ad8-4991-8085-7f34b69c40a3`.

| Agent | Sesja | Port | K1 | K2 | K3 |
|---|---|---|---|---|---|
| integrator | `local_172431d6-a66e-4c5b-a8af-65b81ba57f5d` | 5190 | zaliczony | zaliczony | **zaliczony, scalony** (227befb) → teraz integracja 1b cz. 1 |
| hormonalny | `local_ea8edc9b-cb7f-40ae-9ae2-81613e24be2c` | 5191 | zaliczony (zmiana kadru) | zaliczony | **zaliczony, scalony** (12/12) |
| powłokowy | `local_e1dedfd1-808a-4610-9b7e-b27f70554bb6` | 5192 | zaliczony | zaliczony | **zaliczony, scalony** |
| pokarmowy | `local_dc0d456d-5b08-4b78-885d-fbb7b4512592` | 5193 | zaliczony | zaliczony | **zaliczony, scalony** |
| wydalniczy | `local_37e1ca28-e80a-4465-a772-f7cebfdf8e93` | 5194 | zaliczony | zaliczony | **zaliczony, scalony** |
| kostny | `local_e40f4943-860f-4eee-9aaf-2615cee60e38` | 5195 | zaliczony | zaliczony | **zaliczony, scalony** |
| limfatyczny | `local_562c4781-155b-408c-9843-240bfffcb276` | 5196 | zaliczony | zaliczony | **zaliczony, scalony** |
| rozrodczy | `local_38e25e6a-ea22-4f47-9266-0aa8758cd6d5` | 5197 | zaliczony | zaliczony | **zaliczony, scalony** |
| Reżyser | `local_0e06d3c8-a948-4de9-b211-ddf665a1cee7` | 5198 | plan gotowy (`docs/ATLAS_REZYSER_PLAN.md`), czeka na decyzję użytkownika | | |
| Wizualizacja 3D (prototypy P1–P3) | `local_dc5e6e98-3d75-4195-b564-6b8a39eb661f` | 5200–5202 | uruchomiony przez koordynatora; worktree, `prototypes/atlas3d/`, nie scala do `atlas-uklady`; streszczenie do zgromadzenia | | |

Sprawdzanie faktów w toku:
- 55 faktów `draft` 5 plansz po K3 integratora: `fakty_draft_K3_zaopatrzenie.md` (17/5/5), `fakty_draft_K3_ruch.md` (22/4/2) – oba gotowe, przekazane integratorowi. Po obu – integrator nadaje statusy w 1b.
- K2 limfatyczny i pokarmowy: `fakty_limfatyczny.md`, `fakty_pokarmowy.md` – gotowe.
- Fakty `draft` 7 nowych układów po poprawkach K2 – sprawdzane przy ich K3.

Kolejność scalania do `atlas-uklady`: układy po K3 (każdy po audycie), w `plates/index.ts` i `ScientificReferences.ts` zachować wszystkie wpisy (uwaga: `marliss_vranic_2002` u hormonalnego i pokarmowego – jedno ID).
Integracja 1b cz. 1 (integrator): `rest_level`, ukrycie przełącznika przy `card: true`, strzałka `repro`, mózg na świetle biblioteki, brief powłokowego, kadr oddechowego, statusy faktów po sprawdzeniu.
Decyzja użytkownika potrzebna: wdrożenie planu Reżysera (rekomendacja Dyrygenta: po 12 planszach).

## Plan końcowy (polecenie użytkownika przez koordynatora, 2026-11-26)
1. K3 hormonalnego → scalenie do `atlas-uklady`.
2. Zaraz potem wiadomość do Wizualizatora 3D: w `atlas-uklady` jest 12 plansz (doszły limfatyczna, hormonalna, dokończenie 1b) – `git merge atlas-uklady` u siebie.
3. Bez czekania na użytkownika: integracja 1b cz. 2 (przegląd spójności 12 plansz; integrator, w toku od scalenia limfatycznego) → końcowe sprawdzenie wszystkich `draft` → zgromadzenie (statut §6; materiał: plan Reżysera, propozycje Wizualizatora) → decyzja końcowa i `RAPORT_KONCOWY.md`.
Decyzja Dyrygenta: sceny zbliżeń oddechowego, moczowego i powłokowego poza ramą ciała (x = 20–30 m) – nie przerabiamy w 2D (nie wpływa na plansze), opis w raporcie końcowym jako zadanie dla E3.

## Wstrzymanie (polecenie użytkownika, 2026-11-26 wieczorem)
- Prace kończą się na przeglądzie spójności (integracja 1b cz. 2, integrator w toku). Po jego audycie i scaleniu – STOP.
- Końcowe sprawdzenie faktów było już uruchomione (3 agenci: A powłokowy, B hormonalny+moczowy+pokarmowy, C reszta + kontrola wyrywkowa 10%) i zostało **zatrzymane** zgodnie z poleceniem; ich pliki `fakty_koncowe_*.md` mogą nie istnieć lub być niepełne – jutro uruchomić od nowa.
- Listę faktów `draft` generuje: `node scripts/atlas_check_facts.mjs --drafts <plik.md>` (stan przed przeglądem spójności: 74 – powłokowy 31, hormonalny 11, moczowy 10, pokarmowy 8, kostny 4, limfatyczny 4, oddechowy 2, mięśniowy/mózg/nerwowy/rozrodczy po 1).
