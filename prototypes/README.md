# Prototypy 3D atlasu (do porównania, nie część aplikacji)

Trzy propozycje przestrzeni 3D z 2026-11-26. Opis, pomiary i porównanie: `docs/atlas_wizualizacja/PROPOZYCJE_3D.md`.

| Prototyp | Status |
|---|---|
| `atlas3d/p1_gablota/` | **Przyjęty jako etap E3.** Wersja w aplikacji: `src/atlas3d/` (przycisk „Obróć w 3D” na planszy). |
| `atlas3d/p2_scena/` | Odłożony do etapu E4 („Scena Całość”, po `chains.json` z `factIds` i spełnieniu budżetu). |
| `atlas3d/p3_przestrzen/` | **P3 odrzucone (decyzja §7), tylko do porównania.** Wolna orbita, suwak krycia i wybór dowolnej struktury są wykluczone decyzją użytkownika (model §7, decyzja Dyrygenta po zgromadzeniu). |

Uruchomienie (modele z `prototypes/atlas3d/_assets/`, poza Gitem):

```powershell
npx vite --config prototypes/atlas3d/vite.config.mjs
```
