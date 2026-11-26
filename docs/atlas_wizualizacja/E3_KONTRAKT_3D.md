# E3-0: kontrakt danych 3D atlasu

Stan: 2026-11-26. Właściciel: agent wizualizacji (E3). Pliki: `blender/atlas/atlas_export_glb.py`, `scripts/atlas3d_pack.mjs`, `scripts/atlas3d_check.mjs`, `public/atlas3d/**`.
Uzgodnione z integratorem (E1). `src/atlas/data/mesh_bindings.json` jest jego, a `public/atlas3d/*/bindings.json` mój.

## 1. Jak powstają dane

```powershell
$env:ATLAS3D='shared';     blender.exe --background --disable-autoexec atlas_raw/z_anatomy/extracted/Z-Anatomy/Startup.blend --python blender/atlas/atlas_export_glb.py
$env:ATLAS3D='krwionosny'; blender.exe ... (to samo; jeden układ na przebieg, przez slot atlas_raw/.render_slot_N)
node scripts/atlas3d_pack.mjs        # kompresja + manifest/bindings/anchors3d/flows3d
npm run check:atlas3d                # autotest walidatora + kontrola licencji, NC i budżetu
```

**Przechwycenie planszy.** Eksport uruchamia `plate_<uklad>.py` w tym samym procesie Blendera, ale w pamięci podmienia kilka rzeczy:
- `Plate.render`, `Plate.write_flows3d`, `bpy.ops.render.render` i `subprocess.run` nie wykonują się;
- zapisy do `public/atlas/` trafiają do katalogu tymczasowego.

`atlas_lib.py` i `plate_*.py` się nie zmieniają, a pliki plansz zostają nietknięte (sprawdzane przez `git status`).
Zostaje to, co plansza naprawdę pokazuje: `plate.items`, `plate.extra`, `view_specs` i kotwice. **3D pokazuje te same struktury, role i poziomy co 2D.**

## 2. Pliki w `public/atlas3d/`

| Plik | Treść |
|---|---|
| `_shared/za_skeleton.glb` | kości (277) + sylwetka `ATL_silhouette`; baza wspólna, pobierana raz |
| `_shared/za_muscles.glb` | wszystkie mięśnie bez powięzi (504) |
| `_shared/ids.json` | tabela `_ID` → `meshId` dla plików wspólnych, licencja, trójkąty |
| `<uklad>/{za,hra}_{body,staging}.glb` | struktury układu spoza bazy; **jeden plik = jedna licencja i jedna rama** |
| `<uklad>/manifest.json` | pliki (ścieżka, licencja, atrybucja, rama, bajty, trójkąty, warstwy), widoki planszy (kamera, rama), budżet |
| `<uklad>/bindings.json` | `tables` (plik → lista `meshId`, indeks = `_ID` − 1), `structures`, `anchors` i `anchorMethod` (wsad dla E1) |
| `<uklad>/anchors3d.json` | kotwice w metrach: widoki planszy (z `public/atlas/<u>/anchors.json`) + widoki kluczowe 3D `k_front`, `k_left`, `k_back`, `k_right` |
| `<uklad>/flows3d.json` | tory strzałek w metrach z polem `frame`; oddechowy: rzut odwrotny z `flows.json` |

### `structures[]` w `bindings.json`

```json
{ "meshId": "za:Femoral artery.r", "file": "za_body.glb", "layer": "active|artery|muscle|a100",
  "role": "active", "system": "artery", "levels": { "rest": null, "sprint": 1.0 },
  "alpha": null, "ctx": "muscle", "views": ["front"], "frame": "body", "license": "CC-BY-SA-4.0" }
```

Opis pól:
- `meshId`: model §3.1 (`za:<obiekt>` bez sufiksu `.001`, `hra:<plik.glb>/<węzeł>`);
- `file`: `_shared/…` dla bazy wspólnej, wtedy `layer` = null;
- `role` jak w `atlas_lib.role_material` (`context_bone`, `context_bone_ghost`, `context_muscle`, `context_skin`, `active`) albo rola lokalna planszy (np. `heart` w krwionośnym);
- `levels` jak w `Plate.add`: liczba 0–1, `"dim"` albo null; kolor liczy ta sama funkcja co `atlas_lib.active_color`;
- `views`: widoki planszy, w których struktura jest widoczna (zbliżenia mają własne zestawy obiektów).

### Rama scen

- `body`: wspólna rama Z-Anatomy, czyli metry, przód −Y, prawa strona ciała −X, Z w górę. W glTF/three: `(x, z, −y)`. HuBMAP wchodzi tu po `align_hubmap`.
- `staging`: zbliżenie zbudowane w Blenderze z dala od ciała. Środek kadru dalej niż 5 m od osi (oddechowy x = 20, moczowy i skóra x = 30) albo jawny wyjątek `STAGING_VIEWS` (włókna mięśnia przy środku świata).
  Silnik 3D pokazuje taką scenę osobno, kamerą z `manifest.views[widok].camera`, nigdy na ciele.

## 3. Kontrola (`scripts/atlas3d_check.mjs`)

1. **Licencje:** każdy GLB ma `asset.copyright` i `extras.atlas_license` w każdym węźle zgodne z prefiksem nazwy (`za_` = CC BY-SA 4.0, `hra_` = CC BY 4.0). Węzeł z inną albo brakującą licencją to błąd mieszania.
2. **NC:** żaden `meshId` Z-Anatomy nie pasuje do `NC_BLOCKLIST`. Wzorce są czytane **wprost z `atlas_lib.py`**, więc to jedno źródło prawdy z blokadą w Blenderze.
3. **Spójność:** każdy `meshId` z `structures` jest w tabeli swojego pliku, plik jest w manifeście, a licencja struktury zgadza się z licencją pliku.
4. **Budżet desktopu** z modelu §3.2: ≤ 20 MB, ≤ 1,5 mln trójkątów, ≤ 200 wywołań rysowania.
5. **Strzałki:** punkty w metrach, każda ma ramę.
6. **`--selftest`:** walidator musi wykryć celowo podrzuconą nerkę i ślimak Z-Anatomy, plik z mieszanymi licencjami i brak meshopt.

Walidator już raz zadziałał. W pierwszym eksporcie serce HuBMAP (CC BY) trafiło też do pliku Z-Anatomy (CC BY-SA), bo eksporter glTF brał zaznaczone obiekty ze **wszystkich scen** Blendera (plansza tworzy własną).
Poprawka: `use_active_scene=True` i odznaczanie każdego obiektu osobno, bo `select_all` pomija ukryte.

## 4. Budżety (desktop: ≤ 20 MB, ≤ 1,5 mln trójkątów, ≤ 200 wywołań)

| Układ | Pobranie od razu (ciało) | Trójkąty | Wywołania | Ze zbliżeniami | Pliki układu |
|---|---|---|---|---|---|
| hormonalny | 2.61 MB | 416 253 | 9 | 2.61 MB | hra_body.glb, za_body.glb |
| kostny | 1.96 MB | 313 834 | 8 | 1.96 MB | za_body.glb |
| krwionosny | 4.84 MB | 780 565 | 8 | 4.84 MB | hra_body.glb, za_body.glb |
| limfatyczny | 2.89 MB | 457 321 | 9 | 2.89 MB | hra_body.glb, za_body.glb |
| miesniowy | 3.64 MB | 581 366 | 6 | 3.83 MB | za_staging.glb |
| mozg | 2.78 MB | 429 635 | 2 | 2.78 MB | za_body.glb |
| nerwowy | 4.47 MB | 727 982 | 4 | 4.47 MB | za_body.glb |
| oddechowy | 6.78 MB | 892 126 | 9 | 7.04 MB | za_body.glb, za_staging.glb |
| pokarmowy | 2.88 MB | 458 773 | 11 | 2.88 MB | hra_body.glb, za_body.glb |
| powlokowy | 3.79 MB | 603 230 | 7 | 4.19 MB | za_body.glb, za_staging.glb |
| rozrodczy | 3.13 MB | 498 904 | 15 | 3.13 MB | hra_body.glb, za_body.glb |
| wydalniczy | 4.34 MB | 686 467 | 18 | 4.46 MB | hra_body.glb, za_body.glb, za_staging.glb |

Baza wspólna: kości z sylwetką 1,60 MB (257 tys. trójkątów), mięśnie 2,04 MB (324 tys.).
Telefonu (≤ 6 MB, ≤ 400 tys.) nie spełnia żaden układ, bo sam szkielet z sylwetką ma 257 tys. trójkątów. To zgodne z §7: najpierw komputer.

## 5. Otwarte

- **GLB poza Gitem (decyzja Dyrygenta, model §7):** w Gicie są tylko `public/atlas3d/<uklad>/bindings.json`, eksport i kod.
  Poza Gitem: `*.glb`, `manifest.json`, `anchors3d.json`, `flows3d.json` i `_shared/`.
  Przycisk „Obróć w 3D” pojawia się dopiero przy `manifest.json`, więc na czystej kopii repozytorium nic się nie psuje.
  Odtworzenie: `npm run atlas:export3d` (Blender przez sloty, ok. 15 min dla 12 układów, potem kompresja i kontrola).
  **Uwaga:** po scaleniu trzeba to polecenie uruchomić raz w katalogu, z którego użytkownik odpala aplikację, albo skopiować tam gotowe `public/atlas3d/` (ok. 25 MB).
- Pień płucny w HuBMAP ma rolę `heart`, a jego kolor zależy od reguły planszy (utlenowanie). Silnik 3D bierze kolor z tej samej reguły co plansza.
