# Atlas układów: zadania dla agentów fazy 1

Faza 0 jest gotowa. Każdy agent dostaje **jeden układ** i pracuje **tylko w swoich plikach**.
Przed startem każdy agent czyta: `docs/ATLAS_STYLE_BIBLE.md` (obowiązuje), `docs/ATLAS_ASSETS.md` (zasoby)
i plansze wzorcowe: `blender/atlas/plate_miesniowy.py` oraz `src/atlas/plates/miesniowy.ts`.

## Wspólne zasady pracy
- Gałąź bazowa: `atlas-uklady`. Każdy agent pracuje w swoim worktree lub gałęzi `atlas-<uklad>`.
- **Wolno tworzyć/zmieniać tylko:**
  - `blender/atlas/plate_<uklad>.py`
  - `public/atlas/<uklad>/*`
  - `src/atlas/plates/<uklad>.ts`
  - jedną linię `content: null → content: <STAŁA>` w `src/atlas/plates/index.ts`
  - nowe pozycje w `src/science/ScientificReferences.ts` (tylko dopisywanie)
- **Nie wolno zmieniać:** `atlas_lib.py`, `AtlasPlate.tsx`, `AtlasApp.tsx`, `index.css`, księgi stylu.
  Potrzebna zmiana wspólnego kodu → opisać ją w raporcie, a integrator (faza 2) ją wprowadzi.
- **Surowe zasoby są tylko w głównym checkoutcie** (poza Gitem):
  `C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt\atlas_raw`.
  W worktree trzeba używać tej ścieżki bezwzględnej. `atlas_lib.RAW` znajduje ją sam (można ją nadpisać zmienną `ATLAS_RAW`).
  Plików w `atlas_raw/` nie zmieniamy i nie kopiujemy do repozytorium.
- **Model:** Opus. Krwionośny i mózg na poziomie extra, pozostałe na high. W Blenderze renderują najwyżej 2–3 agenci naraz.
- Render: `blender.exe --background --disable-autoexec "C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt\atlas_raw\z_anatomy\extracted\Z-Anatomy\Startup.blend" --python blender/atlas/plate_<uklad>.py`
  - szybki podgląd: zmienna `ATLAS_QUICK=1`
  - tylko kotwice: `ATLAS_ANCHORS_ONLY=1`
  - podgląd kolekcji: `blender/atlas/tools_inspect.py -- "<kolekcja>" [regex]`
- Modele HuBMAP (`atlas_raw/hubmap/*.glb`) importuje się do sceny planszy i dopasowuje do układu Z-Anatomy
  (metry, ciało przodem do −Y, stopy na Z≈0). Dopasowanie trzeba potwierdzić renderem z nałożonym szkieletem.
- Kontrola jakości: księga stylu §7.
  1. Obejrzany render.
  2. Zrzuty w przeglądarce przy 1440 i 375 px: `http://127.0.0.1:5173/#atlas/<uklad>`.
  3. Każda liczba ma źródło.
  4. `npm run build` przechodzi.
- Raport końcowy: co zrobione, zrzuty, czego nie udało się zrobić, propozycje zmian wspólnego kodu.

---

## Agent 1: Układ nerwowy (`nerwowy`, kolor `--sys-nerve`)
**Pokazać:** drogę rozkazu ruchu od kory ruchowej, przez drogę korowo-rdzeniową i rdzeń kręgowy, do nerwów kończyny dolnej
(nerw kulszowy, piszczelowy, udowy) i jednostek ruchowych. Do tego układ współczulny (pień współczulny, rdzeń nadnerczy).
- **Źródła:** Z-Anatomy `7: Nervous system & Sense organs` (nerwy rdzeniowe, rdzeń, splot lędźwiowo-krzyżowy) oraz HuBMAP `VH_M_Spinal_Cord.glb`.
- **Kontekst:** szkielet i półprzezroczysta sylwetka (`context_skin`).
- **Widoki:** `back` (rdzeń i nerw kulszowy), `front` (nerw udowy). Opcjonalnie `detail`: płytka nerwowo-mięśniowa.
- **Spoczynek / sprint:** w sprincie nerwy kończyn dolnych świecą mocniej. Strzałka impulsu `kind: 'nerve'`
  (`AtlasFlow`) biegnie od kory do łydki i w sprincie przyspiesza.
- **Liczby (do zweryfikowania w literaturze):**
  - częstotliwość wyładowań motoneuronów
  - odsetek rekrutowanych jednostek ruchowych
  - noradrenalina i adrenalina w osoczu (wielokrotny wzrost w wysiłku maksymalnym)
  - źródła startowe: `taylor_gandevia_2001`, `kenney_2022`

## Agent 2: Mięśnie, rozbudowa planszy wzorcowej (`miesniowy`)
Plansza całego ciała już istnieje. Zadanie: dodać widok `detail` z zbliżeniem **jednego mięśnia uda w przekroju**
(włókna I / IIa / IIx w proporcjach z literatury) oraz, opcjonalnie, sarkomer z PDB `5H53` przez Molecular Nodes
(skala 1 nm = 1 m w MN 520). Dopuszczalne poprawki kotwic i tekstów planszy całego ciała.

## Agent 3: Mózg (`mozg`, kolor `--sys-brain`)
**Pokazać:** mózg z prawdziwymi zakrętami (Z-Anatomy: płaty i zakręty, np. `Precentral gyrus.l`, móżdżek, pień),
w widoku `side` i `detail` (przekrój pośrodkowy).
- **W sprincie wyróżnić:**
  - korę ruchową, móżdżek i jądra podstawy
  - pień mózgu (ośrodki oddechowe i krążeniowe)
  - podwzgórze
- **Mleczan jako paliwo mózgu:** strzałka z naczyń, źródło `brooks_2018`.
- **BDNF:** z etykietą poziomu dowodów (`szuhany_2015`, `erickson_2011`), bez przesady.
- **Hipofrontalność przejściowa:** jeśli w ogóle, to tylko z etykietą `contested_debate`.
- **Źródła:** Z-Anatomy (mózgowie) oraz HuBMAP `Allen_M_Brain.glb` (tylko porównawczo, jeśli lepszy).

## Agent 4: Układ oddechowy (`oddechowy`, kolor `--sys-resp`)
**Pokazać:** krtań, tchawicę, oskrzela, płuca i przeponę z mięśniami międzyżebrowymi, w widoku `front` (półprzezroczyste płuca, drzewo oskrzelowe).
Opcjonalnie `detail`: pęcherzyk płucny z wymianą O₂/CO₂.
- **Źródła:**
  - HuBMAP v1.4: `3d-vh-m-lung.glb`, `trachea`, `main-bronchus`, `larynx`
  - Z-Anatomy: przepona i międzyżebrowe (`4: Muscular system`), `8: Visceral systems` › Respiratory
- **Spoczynek / sprint:** przepona w sprincie mocno wyróżniona. Strzałki powietrza `kind: 'air'` szybsze w sprincie.
- **Liczby:** wentylacja minutowa (ok. 6 → ponad 100–150 L/min), częstość oddechów, objętość oddechowa, VO₂.
  Źródło: `kenney_2022`, ewentualnie dopisać nowe.

## Agent 5: Układ krwionośny (`krwionosny`, kolor `--sys-artery` / `--sys-vein`)
**Pokazać:** serce i naczynia całego ciała (tętnice czerwone, żyły niebieskie), w widoku `front`, oraz `detail` z sercem.
- **W sprincie:** tętnice nóg i wieńcowe wyróżnione, naczynia trzewne przygaszone (redystrybucja przepływu).
- **Źródła:**
  - HuBMAP v1.4: `3d-vh-m-blood-vasculature.glb`
  - HuBMAP v1.2: `VH_M_Heart.glb`, `VH_M_Blood_Vasculature_Heart.glb`
  - Z-Anatomy `5: Cardiovascular system` (tylko pomocniczo)
- **Uwaga:** trzeba rozdzielić tętnice od żył po nazwach obiektów w GLB. Najpierw zrobić inspekcję nazw.
- **Liczby:** HR (ok. 60 → ok. 180–190 /min), objętość wyrzutowa, rzut serca (ok. 5 → 20–25 L/min),
  podział przepływu (mięśnie ok. 15–20% → 80–85%), ciśnienie skurczowe. Źródło: `kenney_2022`.
- **Hemoglobina** (`4HHB` / `1HHO`) tylko jako opcjonalne zbliżenie.

---

## Faza 2: integrator (jeden agent, po zakończeniu fazy 1)
1. Połączyć gałęzie układów w `atlas-uklady`. Rozwiązać konflikty w `plates/index.ts` i `ScientificReferences.ts`.
2. Wprowadzić zgłoszone zmiany wspólnego kodu (np. rysowanie `flows`, które jest już w typach, ale nie w `AtlasPlate`).
3. Plansza `calosc`: całe ciało z warstwami układów do włączania i wyłączania. Jeden render na układ, te same kamery,
   nakładanie przez przezroczyste PNG/WebP.
4. Przegląd spójności: zestawić wszystkie plansze obok siebie (zrzuty), wyrównać kolory, jasność i podpisy.
5. Zaktualizować `docs/LICENSES_AND_ASSETS.md` (Z-Anatomy CC BY-SA 4.0, HuBMAP CC BY 4.0, PDB) i README.
