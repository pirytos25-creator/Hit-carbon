# Zespół atlasu: sesje i stan punktów kontrolnych

Stan na 2026-11-26 (po wznowieniu o 01:00). Ten plik jest zapisem stanu na wypadek przerwy (limit użycia).

Dyrygent (CEO): `local_d25e62f6-f11b-4af7-b30c-5a3005c68551`, główny checkout, gałąź `atlas-uklady`.
Koordynator (sesja nadrzędna): `local_522be64d-3ad8-4991-8085-7f34b69c40a3`.

| Agent | Sesja | Port | K1 | K2 | K3 |
|---|---|---|---|---|---|
| integrator | `local_172431d6-a66e-4c5b-a8af-65b81ba57f5d` | 5190 | zaliczony | zaliczony | **zaliczony, scalony** (227befb) → teraz integracja 1b cz. 1 |
| hormonalny | `local_ea8edc9b-cb7f-40ae-9ae2-81613e24be2c` | 5191 | zaliczony (zmiana kadru) | w toku | — |
| powłokowy | `local_e1dedfd1-808a-4610-9b7e-b27f70554bb6` | 5192 | zaliczony | warunkowo, poprawki wprowadzone (do sprawdzenia w K3) | sygnał wysłany, w toku |
| pokarmowy | `local_dc0d456d-5b08-4b78-885d-fbb7b4512592` | 5193 | zaliczony | raport przyszedł, czeka na fakty (`fakty_pokarmowy.md`) | — |
| wydalniczy | `local_37e1ca28-e80a-4465-a772-f7cebfdf8e93` | 5194 | zaliczony | warunkowo, poprawki wprowadzone | sygnał wysłany, w toku |
| kostny | `local_e40f4943-860f-4eee-9aaf-2615cee60e38` | 5195 | zaliczony | warunkowo, poprawki wprowadzone | sygnał wysłany, w toku |
| limfatyczny | `local_562c4781-155b-408c-9843-240bfffcb276` | 5196 | zaliczony | raport przyszedł, czeka na fakty (`fakty_limfatyczny.md`) | — |
| rozrodczy | `local_38e25e6a-ea22-4f47-9266-0aa8758cd6d5` | 5197 | zaliczony | warunkowo, poprawki wprowadzone | sygnał wysłany, w toku |
| Reżyser | `local_0e06d3c8-a948-4de9-b211-ddf665a1cee7` | 5198 | plan gotowy (`docs/ATLAS_REZYSER_PLAN.md`), czeka na decyzję użytkownika | | |

Sprawdzanie faktów w toku:
- 55 faktów `draft` 5 plansz po K3 integratora: `fakty_draft_K3_zaopatrzenie.md` (gotowe: 17/5/5), `fakty_draft_K3_ruch.md` (w toku). Po obu – integrator nadaje statusy w 1b.
- K2 limfatyczny i pokarmowy: `fakty_limfatyczny.md`, `fakty_pokarmowy.md` (w toku).
- Fakty `draft` 7 nowych układów po poprawkach K2 – sprawdzane przy ich K3.

Kolejność scalania do `atlas-uklady`: układy po K3 (każdy po audycie), w `plates/index.ts` i `ScientificReferences.ts` zachować wszystkie wpisy (uwaga: `marliss_vranic_2002` u hormonalnego i pokarmowego – jedno ID).
Integracja 1b cz. 1 (integrator): `rest_level`, ukrycie przełącznika przy `card: true`, strzałka `repro`, mózg na świetle biblioteki, brief powłokowego, kadr oddechowego, statusy faktów po sprawdzeniu.
Decyzja użytkownika potrzebna: wdrożenie planu Reżysera (rekomendacja Dyrygenta: po 12 planszach).
