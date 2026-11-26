# Kontrakt wyróżnika układu (2D i 3D)

Stan: 2026-11-26, integrator. **Projekt do uzgodnienia z Wizualizatorem** (status na końcu pliku).

Podstawy:
- decyzja Dyrygenta (`docs/atlas_audyt/DECYZJA_UX_NARZADY.md`, tabela „Po bramce A”);
- karta Reżysera `UX_POSIEDZENIE.md` §3.1–3.3 (wyróżniki 12 układów, strażnicy czytelności);
- architektura modułu `BIOMOTION_ARCHITEKTURA.md` (moduł nie zna treści, stan z zewnątrz, ten sam ruch na każdym poziomie jakości).

Na tym kontrakcie agenci 4 układów (krwionośny ROZDZIAŁ, kostny KONSTRUKCJA, nerwowy IMPULS, powłokowy CIEPŁO) zrobią wyróżniki po M4, a pozostałe 8 w M7.

## 1. Dane: pole `signature` w układzie planszy

Wyróżnik opisuje plik układu planszy `src/atlas/plates/<uklad>.ts` (właściciel: integrator, zmiany przez agenta układu w porozumieniu z integratorem). Typ `AtlasSignature` jest w `src/atlas/types.ts`.

```ts
signature: {
  id: 'ROZDZIAL',                     // nazwa wyróżnika z karty Reżysera §3.3 (WIELKIE_LITERY, bez polskich znaków)
  namePl: 'Rozdział krwi',            // nazwa na ekranie („Jak czytać”, miara wyróżnika w panelu)
  variable: {                         // TEST ZMIENNEJ (§3): co steruje ruchem
    kind: 'metric',                   // 'metric' | 'order' | 'illustration'
    factIds: [                        // gdy kind = 'metric': fakty checked_* TEJ planszy (liczby albo opisy ról)
      'krwionosny.metric.udzial_miesni_w_przeplywie_krwi',
      'krwionosny.role.femoral.sprint',
    ],
    labelPl: 'dokąd idzie krew', // co pokazuje ruch (słowami)
  },
  flows: ['aorta_to_leg', 'leg_to_heart'],  // ID torów z public/atlas/<uklad>/flows3d.json (dane dla cząstek); [] = bez torów
  anchors: ['aortic_arch', 'femoral'],      // kotwice, przy których dzieje się ruch (nie zasłaniamy ich podpisów)
  legend: [                                 // „Jak czytać”: JEDYNE miejsce na symbole i kreski (decyzja Dyrygenta)
    { symbol: 'particle', labelPl: 'krwinka (powiększona)' },
    { symbol: 'flow', labelPl: 'kierunek przepływu krwi' },
  ],
  chips: ['powiększone'],                   // 'powiększone' | 'ilustracja' | 'ruch poglądowy' | 'schemat · bez skali' | 'zwolnione ×N'
  acts: [3, 6],                             // akty filmu (mapa w decyzji Dyrygenta §3)
}
```

Zasady danych:
- **Wielkość ruchu tylko z faktu** `checked_*` (`variable.kind = 'metric'`, walidator sprawdza każdy `factIds`: istnieje, ta plansza, status checked). Gdy fakty dają kierunek, a krok między stopniami jest umowny (np. ROZDZIAŁ: 3 stopnie przepływu), `kind: 'metric'` + chip „ilustracja”. Bez faktu: `kind: 'illustration'` z najwyżej 3 stopniami i chipem „ilustracja”; `kind: 'order'` dla samej kolejności zdarzeń (np. IMPULS: mózg → rdzeń → nerw → mięsień).
- Teksty `namePl`, `variable.labelPl`, `legend[].labelPl` to teksty interfejsu, nie fakty. Nie mogą zawierać liczb ani twierdzeń o zmianie (walidator: brak cyfr). Liczba trafia na ekran tylko z metryki.
- `flows` to **dane torów**, a nie rysowane strzałki. Cząstki jadą po torze; strzałka istnieje tylko w legendzie.

### 1a. Pola specyfikacji Reżysera → kontrakt

Specyfikacje wyróżników: `docs/atlas_rezyser/M6_SPECYFIKACJE_WYROZNIKOW.md` (§0, commit 33e052e). Pola opisowe zostają w specyfikacji; dane, które czyta kod, są w `signature`:

| Specyfikacja (Reżyser) | Kontrakt | Kto używa |
|---|---|---|
| `id`, `plate` | `signature.id`; plik `plates/<uklad>.ts` | rama, walidator |
| `variable` | `signature.variable.labelPl` | „Jak czytać”, panel |
| `magnitudeSource` (`factIds` / `"illustration3"`) | `variable.kind` + `variable.factIds`; `illustration3` = `kind: 'illustration'` + chip „ilustracja” | walidator, 2D, 3D |
| `tracks` | `signature.flows` (ID torów z `flows3d.json`) | 2D (`paths`), 3D (`paths`) |
| `legend` | `signature.legend` (2–3 pozycje) | „Jak czytać” (rama) |
| `chips` | `signature.chips` | scena |
| `filmAct` | `signature.acts` | film |
| `sign`, `motion`, `rule`, `moments` | opis w specyfikacji; kod: komponent 2D i wtyczka 3D | agent układu |
| `modules`, `low`, `high` | wtyczka 3D (§4), `quality` | Wizualizator, agent układu |
| `view2d` | komponent 2D (§3); sprite'y z Blendera w `public/atlas/<uklad>/signature/*.webp` | agent układu |
| `reducedMotion` | `reducedMotion` (§2) | 2D, 3D |

## 2. Stan i czas (wspólne dla 2D i 3D)

- `state01`: 0 = spoczynek, 1 = nazwany moment („Koniec 45 s pracy” itd.). Przejście 0,9 s ease-in-out (§3.1 pkt 8) liczy rama (AtlasApp / widok 3D), wyróżnik dostaje gotową liczbę.
- „Co się zmieniło” (trzeci przycisk momentu) to dla wyróżnika `state01 = 1` z flagą `changeView: true`: wyróżnik może pokazać różnicę (np. licznik ×N), ale nie dodaje nowego ruchu.
- `reducedMotion: true` (`prefers-reduced-motion`): stopklatka dla bieżącego `state01`, bez pętli.
- Ruch zaczyna się przy zmianie momentu (przejście 0,9 s) i trwa w pętli; **pauza na „Spacja”** jak w widoku 3D (rama przekazuje `paused` w następnej wersji ramy; do tego czasu wyróżnik zatrzymuje pętlę przy `reducedMotion`).
- Tempo pętli cząstek: 2,6 / 1,6 / 1,0 s dla stopni 1 / 2 / 3 (§3.1). Gdy zmienna jest liczbą, stopień = `clamp(round(1 + 2·x), 1, 3)`, gdzie x to wartość znormalizowana przez agenta układu i opisana w komentarzu pliku.

## 3. Komponent 2D: `src/atlas/signatures/<uklad>.tsx`

- Właściciel: agent układu (tylko ten plik). Rama ładuje go leniwie przez `import.meta.glob('./signatures/*.tsx')`; brak pliku = brak wyróżnika, plansza działa jak dziś.
- Eksport domyślny: komponent rysujący **wewnątrz SVG planszy** jedną klatkę widoku (warstwa nad obrazem, pod podpisami):

```ts
export interface SignatureProps2D {
  signature: AtlasSignature;
  view: AtlasView;
  state01: number;               // 0–1
  changeView: boolean;           // tryb „Co się zmieniło”
  level: AtlasLevel;             // 'basic' | 'extended'
  reducedMotion: boolean;
  /** Rzut punktu 3D (metry, układ Z-Anatomy) na jednostki SVG tej klatki; null = poza kadrem albo brak kamery. */
  project: (p: [number, number, number]) => [number, number] | null;
  /** Tory z flows3d.json wskazane w signature.flows, już w jednostkach SVG klatki. */
  paths: { id: string; kind: AtlasFlowKind; pts: [number, number][] }[];
  /** Kotwice wyróżnika w jednostkach SVG klatki (tylko te widoczne w tym widoku). */
  anchorPts: Record<string, [number, number]>;
  /** Skala: jednostki SVG na piksel ekranu (grubości linii, promienie cząstek). */
  unit: number;
  /** Kolory z palette.json: kolor układu, jasny wariant, kolory rodzajów strzałek. */
  colors: { system: string; light: string; flow: (k: AtlasFlowKind) => string };
}
```

- Wersja 2D może używać sprite'ów wypieczonych w Blenderze (krwinka, kropla potu, pakiet impulsu) jako SVG `<image>` poruszanych po `paths`: obraz z objętością, nie kreska (specyfikacja Reżysera §0).
- Rysuje tylko kształty (cząstki, poświaty, liczniki). Zakazane: półprzezroczyste nakładki na cały kadr, tekst inny niż licznik z metryki, zasłanianie kotwic podpisów (promień 14 px wokół kotwicy wolny).
- Animacja: SVG/CSS albo `requestAnimationFrame` ograniczony do własnych elementów; koszt na Intel UHD ≤ 1 ms na klatkę.

## 4. Wtyczka 3D: do modułu `src/biomotion`

> Do potwierdzenia przez Wizualizatora (właściciel `src/biomotion`, `src/atlas3d`).

- Plik: `src/biomotion/signatures/<uklad>.ts` (agent układu; moduł ładuje go leniwie po ID planszy).
- Eksport: `createSignature3D(ctx: Signature3DContext): Signature3DHandle`.

```ts
interface Signature3DContext {
  signature: AtlasSignature;            // te same dane co w 2D
  scene: THREE.Group;                   // grupa wyróżnika w scenie widoku układu (albo gabloty)
  paths: FlowPathTexture[];             // tory z flows3d.json jako tekstury danych (FlowPaths.ts): położenie, styczna, promień
  meshes: (meshId: string) => THREE.Mesh[] | null; // siatki z bindings.json (np. kości dla KONSTRUKCJI, skóra dla CIEPŁA)
  quality: 'low' | 'high' | 'cinematic';// poziom z QualityManager; ten sam ruch, inna gęstość (BIOMOTION §1 pkt 4)
  look: 'atlas' | 'film';               // profil wyglądu
  colors: { system: string; light: string };
  reducedMotion: boolean;
}
interface Signature3DHandle {
  update(frame: { time: number; dt: number; state01: number; changeView: boolean }): void; // co klatkę (BioFrame)
  dispose(): void;
}
```

- Budżet Low: ≤ 1 ms GPU, bez półprzezroczystych nakładek, kształty cząstek z `particles/shapes.ts`.
- Ten sam plik obsługuje atlas 3D i gablotę (inna `scene`, te same dane). Film używa go przez ten sam kontekst z `look: 'film'`.

## 5. Reguła „test zmiennej” (kontrola przed oddaniem wyróżnika)

1. Każdy ruch ma przyczynę w `variable`: po zmianie `state01` z 0 na 1 zmienia się **dokładnie ta wielkość**, którą opisuje `variable.labelPl` (gęstość, tempo, jasność), i nic innego.
2. Przy `state01` stałym ruch jest pętlą bez nowej informacji (najwyżej 1 nowy ruch na krok, 3 naraz).
3. Wielkość z faktu: kierunek i proporcja zgodne z metryką (np. ROZDZIAŁ: gęstość × prędkość krwinek do mięśni ∝ udział rzutu serca, < 20% → ok. 80%). Bez faktu: 3 stopnie + chip „ilustracja”.
4. Kolor nigdy nie jest jedynym nośnikiem (kształt cząstki, chip, licznik).
5. `reducedMotion` daje stopklatkę z tą samą informacją.
6. Dowód w punkcie kontrolnym: 2 zrzuty (stan 0 i 1) + jedno zdanie „co się zmieniło i z jakiej zmiennej” + pomiar ms na Low.

Walidator (`npm run check:atlas`, integrator):
- `signature.id` z listy §3.3, `variable.kind` poprawny, przy `metric` każdy `factIds` to fakt `checked_*` tej planszy;
- przy `illustration` chip „ilustracja”;
- `flows` istnieją w `flows3d.json`, `anchors` istnieją na planszy;
- teksty wyróżnika bez cyfr;
- `legend` niepusta.

## 5a. Kontrast etykiet momentu i podpisów wyróżnika (zasada Dyrygenta, przez Reżysera)

- Tekst wyróżnika na scenie (licznik, chip, etykieta) zawsze na **własnym tle `#0D1526` z kryciem ≥ 85%** (tekst `#E6ECF5`: 15,3:1).
- Tekst na przycisku albo pinezce w kolorze układu **tylko w `onColor` z `palette.json`**. Zmierzone: nerwowy 9,8:1, kostny 4,9:1, krwionośny 4,7:1, powłokowy 8,6:1.
- **Biały tekst na kolorze nerwowego (1,9:1) i powłokowego (2,2:1) jest zabroniony.**
- Próg **≥ 4,5:1** sprawdza automat: `scripts/atlas_check_palette.ts` (pkt 5: `onColor` każdego układu ≥ 4,5:1, w `npm run check:atlas`). Przełącznik momentu w AtlasApp używa `onColor` (M3, S13).

## 6. „Jak czytać” z danych wyróżnika

Legenda w rogu sceny (2D i 3D) składa się z:
1. pozycji `signature.legend` (symbol rysuje rama: `particle`, `pulse`, `glow`, `counter`, `flow`);
2. chipów `signature.chips`;
3. dopóki wyróżnik nie istnieje: dzisiejsza legenda strzałek z `flows`/`flows3d`.

Strzałki i kreski występują **tylko** w legendzie.

## 7. Status uzgodnienia

| Punkt | Integrator | Wizualizator |
|---|---|---|
| §1 dane `signature` | proponuje | do potwierdzenia |
| §2 stan i czas | proponuje | do potwierdzenia |
| §3 komponent 2D | proponuje (rama w `AtlasPlate`) | — |
| §4 wtyczka 3D | proponuje | **do decyzji: ścieżka pliku, typy `FlowPathTexture`, sposób ładowania** |
| §5 test zmiennej | proponuje | do potwierdzenia |
| §6 „Jak czytać” | proponuje | do potwierdzenia (strona 3D) |
