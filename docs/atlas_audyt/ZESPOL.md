# Zespół atlasu: sesje i stan punktów kontrolnych

Dyrygent (CEO): `local_d25e62f6-f11b-4af7-b30c-5a3005c68551`, główny checkout, gałąź `atlas-uklady`.
Koordynator (sesja nadrzędna): `local_522be64d-3ad8-4991-8085-7f34b69c40a3`.

| Agent | Sesja | Effort | Port | Baza | K1 | K2 | K3 |
|---|---|---|---|---|---|---|---|
| integrator | `local_172431d6-a66e-4c5b-a8af-65b81ba57f5d` | xhigh | 5190 | `atlas-uklady` `ce6bef0` | zaliczony | zaliczony | w toku |
| hormonalny | `local_ea8edc9b-cb7f-40ae-9ae2-81613e24be2c` | xhigh | 5191 | integrator `b215139` | w toku | — | — |
| powłokowy | `local_e1dedfd1-808a-4610-9b7e-b27f70554bb6` | high | 5192 | integrator `b215139` | w toku | — | — |
| pokarmowy | `local_dc0d456d-5b08-4b78-885d-fbb7b4512592` | high | 5193 | integrator `b215139` | w toku | — | — |
| wydalniczy | `local_37e1ca28-e80a-4465-a772-f7cebfdf8e93` | high | 5194 | integrator `b215139` | w toku | — | — |
| kostny | `local_e40f4943-860f-4eee-9aaf-2615cee60e38` | high | 5195 | integrator `b215139` | w toku | — | — |
| limfatyczny | `local_562c4781-155b-408c-9843-240bfffcb276` | high | 5196 | integrator `b215139` | w toku | — | — |
| rozrodczy | `local_38e25e6a-ea22-4f47-9266-0aa8758cd6d5` | xhigh | 5197 | integrator `b215139` | w toku | — | — |

Sesje układów uruchomił koordynator (jego notatki o końcu tur), raporty K<n> przychodzą do Dyrygenta przez SendMessage.
Kolejność scalania do `atlas-uklady`: najpierw integrator (po K3), potem układy; w `plates/index.ts` i `ScientificReferences.ts` zachować wszystkie wpisy.
