# Audyt Dyrygenta: Wizualizator 3D, E3-K3 (integracja, poprawki K2, pomiary)

Data: 2026-11-26. Gałąź `claude/atlas-wizualizacja-3d-1dc29a` (`406c87c` WIP, `3e31136`, `32b7ded`), scalona do `atlas-uklady` (merge `a289337`).

## Werdykt: **E3-K2 i E3-K3 ZALICZONE** – E3 (P1 „Gablota”) przyjęte i scalone

### Warunki z K2 – spełnione
| Warunek | Wynik (sprawdzone na własnych zrzutach) |
|---|---|
| Czytelność podpisów na modelu | Kolumny podpisów poza obrysem modelu, każdy podpis na ciemnym tle (kontrast ≥ 4,5:1). Oddechowy: „Płuco prawe”, „Przepona” obok klatki; moczowy, krwionośny (bok), rozrodczy, mięśniowy – czytelne. |
| Kadr | Obszar 3D między paskami (góra 60 px, dół 104 px); model nie wchodzi pod przełączniki ani stopkę licencji (oddechowy – czaszka ucięta krawędzią kadru jak na planszy 2D, nie pod paskiem). Długie nazwy skracane wielokropkiem. |
| Wydajność | Intel UHD, 1440: wszystkie 12 ≥ 50 FPS (moczowy 25→50, oddechowy 29→56, krwionośny 48→60) dzięki odcięciu nieużywanych trójkątów (np. krwionośny 784→418 tys.). |

### K3
- Integracja przez punkt montażu integratora (`React.lazy(Atlas3DView)`); „Obróć w 3D” otwiera widok na każdej z 12 plansz; na telefonie 390 px przycisk ukryty.
- Zakres plików: tylko `src/atlas3d/**`, `public/atlas3d/**` (bindings), `docs/atlas_wizualizacja/**`, `prototypes/**`, `scripts/atlas3d*`, `blender/atlas/atlas_export_glb.py`.

### Testy Dyrygenta
- Worktree Wizualizatora: build 0, `check:atlas` 0 (dane 0 uwag), `check:atlas3d` 0 (12 układów, licencje rozdzielone, 0 struktur NC, budżet desktopu).
- Własny skrypt CDP (bez Playwright MCP): kliknięcie „Obróć w 3D”, sprint, przód i bok lewy – moczowy, oddechowy, krwionośny, rozrodczy (serwer z worktree, port 5187) oraz krwionośny, mięśniowy, mózg z głównego checkoutu (port 5199): canvas obecny, 0 błędów konsoli.
- Po scaleniu w `atlas-uklady`: build 0, `check:atlas` 0. Pliki GLB są poza Gitem – w głównym checkoucie skopiowane lokalnie z worktree Wizualizatora (25 MB, w `.gitignore`, łącznie z `_shared/ids.json`); `check:atlas3d` 0 (12 układów).

### Znane braki (przyjęte)
- RTX 4050 niezmierzony (zmiana ustawień grafiki Windows – decyzja użytkownika).
- Na nowym komputerze/klonie: `npm run atlas:export3d` (ok. 15 min, Blender) przed pierwszym użyciem 3D.
- Zbliżenia-kolaże 2D (mięśniowy: włókna i cząsteczki) w 3D częściowe, z komunikatem.
- Oddechowy pobiera 7 MB (cały wspólny plik mięśni).
- Kotwice `nearest` (70) mogą podświetlać sąsiednią strukturę – lista do kontroli u integratora.
- Moczowy: na górze kadru widać ziarnisty wzór półprzezroczystej sylwetki (ditheringu) – kosmetyka.
