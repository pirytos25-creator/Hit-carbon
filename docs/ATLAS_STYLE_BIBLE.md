# Księga stylu: „Atlas układów” (BIOGENESIS)

Ten dokument jest **obowiązujący** dla każdego agenta, który robi planszę układu.
Cel: 5 układów (nerwowy, mięśniowy, mózg, oddechowy, krwionośny) ma wyglądać jak jeden atlas medyczny,
a nie jak 5 różnych aplikacji. Jeśli coś nie pasuje do tych zasad, zmienia się księgę (jeden agent), a nie jedną planszę.

## 1. Idea
- **Precyzja zamiast efektów.** Statyczne, czyste ujęcia w stylu atlasu anatomicznego, z podpisami i liczbami.
- **Zawsze dwa stany:** `spoczynek` i `sprint` (interwał HIIT, ok. 90–100% VO₂max). Użytkownik przełącza je jednym przyciskiem, a obraz płynnie się przenika.
- **Zawsze kontekst ciała.** Aktywny układ jest kolorowy, a reszta ciała (szkielet i sylwetka) jest neutralna i przygaszona.
- Ruch jest tylko pomocniczy: przesuwające się strzałki przepływu i impulsów w warstwie SVG, nigdy na samym renderze.

## 2. Kolory i ikony układów (jedyne dozwolone kolory akcentu)
**Jedno źródło: `src/atlas/data/palette.json`.** Czyta je Python (`atlas_lib.SYSTEM_COLORS`) i TS (`src/atlas/palette.ts`).
`src/index.css` ma kopię tokenów dla reszty aplikacji. Walidator `node scripts/atlas_check_palette.ts` pilnuje zgodności i ΔE.

| Układ | Klucz (`system=`) | Token | Kolor główny | Jasny (podpis, linia) | Ikona | Grupa |
|---|---|---|---|---|---|---|
| Nerwowy | `nerve` | `--sys-nerve` | `#E8B23A` | `#F6D27A` | neuron | Sterowanie |
| Mózg | `brain` | `--sys-brain` | `#9B7BEA` | `#C3AEF5` | półkule | Sterowanie |
| Hormonalny (dokrewny) | `endo` | `--sys-endo` | `#EF872A` | `#F6BD8A` | kropla | Sterowanie |
| Mięśniowy | `muscle` | `--sys-muscle` | `#C8553D` | `#EE8A6E` | brzusiec | Napęd |
| Kostny (aktywny) | `bone` | `--sys-bone` | `#A17D2B` | `#CBB88A` | kość | Napęd |
| Krwionośny: tętnice | `artery` | `--sys-artery` | `#D93240` | `#F07A84` | serce | Zaopatrzenie |
| Krwionośny: żyły | `vein` | `--sys-vein` | `#3E6FD8` | `#86A6EE` | serce | Zaopatrzenie |
| Oddechowy | `resp` | `--sys-resp` | `#4FC3E0` | `#94DEF0` | płuca | Zaopatrzenie |
| Pokarmowy | `digest` | `--sys-digest` | `#B4B474` | `#D6D6B3` | żołądek | Zaopatrzenie |
| Powłokowy (skóra) | `skin` | `--sys-skin` | `#FA947A` | `#FCC4B6` | warstwy | Równowaga |
| Moczowy (wydalniczy) | `urinary` | `--sys-urinary` | `#276777` | `#88ABB4` | nerka | Równowaga |
| Limfatyczny | `lymph` | `--sys-lymph` | `#73C770` | `#B2E0B0` | węzeł | Równowaga |
| Rozrodczy | `repro` | `--sys-repro` | `#EA7BB2` | `#F3B6D5` | ♀♂ | Inne |

Zasady kolorów (faza 2, integrator):
- **Kolor nigdy nie jest jedynym nośnikiem informacji** (WCAG 1.4.1): układ ma kolor, ikonę (`src/atlas/glyphs.tsx`) i nazwę.
- **ΔE (CIEDE2000) ≥ 15 dla par pokazywanych razem** przy zwykłym widzeniu, deuteranopii i protanopii (symulacja Machado 2009).
  Pary pokazywane razem to:
  - układ i kolory kontekstu;
  - układ i tętnice/żyły na planszach z naczyniami;
  - tętnice–żyły;
  - powłokowy–kostny;
  - hormonalny–moczowy.
- **Menu:** każda para ma ΔE ≥ 15 przy zwykłym widzeniu. Wyjątek z uzasadnieniem: mięśniowy–tętnice (kolory fazy 1, nigdy na jednej planszy).
- Jasny wariant ma kontrast ≥ 4,5:1 na tle strony.
- Kolory 7 nowych układów to propozycja z `docs/ATLAS_KOLEJNE_UKLADY.md` §3 przesunięta tak, by przeszła walidator.
  Przykład: kostny zmieniony z `#B9A37E` na `#A17D2B`, bo był za blisko powłokowego i kości kontekstowej.
- Zmiana koloru = zmiana `palette.json` + walidator, nigdy w skrypcie planszy.

Kontekst (zawsze ten sam, na każdej planszy):
| Rola | Kolor | Materiał |
|---|---|---|
| Kość | `#D8D1C4` | matowa, szorstkość 0,75 |
| Mięśnie nieaktywne / tło | `#8E7A78` | matowa, szorstkość 0,7 |
| Sylwetka skóry (gdy potrzebna) | `#9AA4B5` | półprzezroczysta (alfa 0,12) |
| Tło strony | `#070B14` | renderujemy z przezroczystym tłem, a tło daje strona |

Intensywność w stanach:
- `spoczynek`: kolor układu zmieszany w 35% (`restMix`) z kolorem kontekstu, bez świecenia;
- `sprint`: pełny kolor układu i lekka emisja (0,3 × poziom) tylko na strukturach, które naprawdę pracują;
- poziom pracy (`sprint_level`) to ilustracja w stopniach (1,0 / 0,6–0,9 / `"dim"` = jak w spoczynku), nie liczba ze źródła;
- **cienkie tkanki** (naczynia, przewody, nerwy jako krzywe) mieszamy z kolorem mięśni/tła `#8E7A78` (`ctx="muscle"`, dla krzywych domyślnie),
  bo z kością 35% domieszki daje prawie biel.

## 3. Materiały i światło (Blender, wspólna biblioteka `blender/atlas/atlas_lib.py`)
- Tylko Principled BSDF, **bez połysku lakieru** (coat 0) i ze specular IOR level ≤ 0,35. Cel: matowa ilustracja, nie „cukierek”.
- Lekki subsurface (0,05–0,1) tylko dla tkanek miękkich.
- Światło zawsze z biblioteki: klucz z lewej-góry-przodu, wypełnienie z prawej, kontra z tyłu dla odcięcia sylwetki od tła
  (liczone względem kamery, więc działa w każdym widoku).
  - Moc: `LIGHT_SCALE` 0,45 × (klucz 260 W × 0,7, wypełnienie 90 W, kontra 220 W).
  - Sprawdzone renderem próbek (`tools_color_check.py`): ΔE ≤ 2,6 dla 13 kolorów. Przy świetle fazy 0 bursztyn wychodził cytrynowy.
- Role materiałów: `context_bone`, `context_bone_ghost` (alfa 0,22), `context_muscle`, `context_skin` (alfa 0,12), `active`
  (opcjonalnie `alpha=` dla aktywnego półprzezroczystego).
- Sylwetka ciała zawsze z `al.build_silhouette()` (jedna dla wszystkich plansz).
- Silnik EEVEE, transformacja widoku **Standard** (kolory z tabeli mają wyjść 1:1), przezroczyste tło filmu.
- Kamera **ortograficzna** (bez perspektywy, jak w atlasie).
  - Podstawowe widoki: `front` (−Y) i `back` (+Y), w razie potrzeby `side` (+X).
  - Zbliżenia: `plate.set_view("detail", direction=..., frame=obiekty albo center + ortho_scale, objects=widoczne)`.
  - Ujęcie całego ciała: obrys kości i mięśni, margines 1,06, obraz 1000×1800 px (warstwy da się nakładać na „Całość”).
- `anchors.json` zapisuje na widok kamerę i punkty 3D kotwic (`schemaVersion` 2) i jest **scalany**, nie nadpisywany.
- **Nigdy nie zapisujemy** `Startup.blend` z Z-Anatomy. Skrypty tylko ładują atlas i renderują.

## 4. Podpisy i grafika na planszy (React + SVG + HTML, `src/atlas/`)
- **Podpis:** kropka na strukturze, cienka linia odnośnika i **tekst HTML** w kolumnie obok obrazu.
  - Rozmiar: nazwa 15 px, łacina i opis 14 px; nic poniżej 14 px.
  - Strona podpisu to strona bliższa kotwicy, więc linia nie przecina struktury (stronę można wymusić polem `side`).
- **Wybór podpisu:** najechanie, klawisz Tab (fokus) albo dotknięcie. Na telefonie (< 640 px): numerowane pinezki na obrazie i lista pod spodem.
- **Dwa poziomy** (model §3.5), przełącznik zapamiętywany:
  - *Podstawowy*: podpisy `tier: 'primary'`, bez łaciny, najwyżej 4 liczby;
  - *Rozszerzony*: wszystkie podpisy, łacina, wszystkie liczby, cytat, lokalizator i pełne źródło.
- **Na ekranie tylko fakty sprawdzone:**
  - liczba (`metrics[].status`) i opis roli (`labels[].roleStatus`) pokazują się tylko ze statusem `checked_agent`;
  - wyjątek: `anatomy`, czyli sam opis anatomiczny, który sprawdzający pominął jako nie-fakt;
  - nazwa struktury jest zawsze widoczna.
- **Font:** Figtree dla nazw, JetBrains Mono dla liczb.
- **Liczby** zawsze w parze `spoczynek → sprint`, z jednostką.
- **Inny protokół:** liczba spoza protokołu wzorcowego (6 × 45 s przy 88% VO₂max) ma `protocolMismatch`, a na ekranie dopisek „W badaniu: …”.
- **Poziom dowodów:** plakietka **i zdanie z drabiny sformułowań** (`EVIDENCE_PHRASE`), np. „U ludzi dobrze wiadomo”.
- **Strzałki przepływu:** linia przerywana z grotem i animacją `stroke-dashoffset` (w sprincie szybciej).
  - Najlepiej `flows3d.json` w metrach: `plate.render(..., flows3d=[...])`, kierunek w naczyniach z `al.vessel_path`.
  - Stary format w pikselach (`flows`) nadal działa.
- **`prefers-reduced-motion`:** bez animacji strzałek, pulsowania i przenikania obrazów.

## 5. Struktura plików (każdy agent pracuje tylko w swoich plikach)
```
blender/atlas/atlas_lib.py            wspólne (faza 0): ładowanie atlasu, materiały, światło, kamery, eksport kotwic
blender/atlas/plate_<uklad>.py        skrypt planszy jednego układu
public/atlas/<uklad>/<widok>_<stan>.webp   rendery (np. front_rest.webp, front_sprint.webp)
public/atlas/<uklad>/anchors.json     współrzędne kotwic podpisów (0–1) dla każdego widoku
src/atlas/plates/<uklad>.ts           treść: podpisy, liczby, źródła, opis różnic spoczynek/sprint
src/atlas/AtlasPlate.tsx              wspólny komponent (zmienia tylko integrator)
src/atlas/AtlasApp.tsx                widok atlasu, menu układów w grupach ról (zmienia tylko integrator)
src/atlas/data/palette.json           kolory, ikony i grupy układów (jedno źródło dla Pythona i TS)
public/atlas/<uklad>/flows3d.json     strzałki w metrach (generuje skrypt planszy)
```
Identyfikatory układów: `nerwowy`, `miesniowy`, `mozg`, `oddechowy`, `krwionosny`, `hormonalny`, `powlokowy`, `pokarmowy`,
`wydalniczy` (na ekranie „Moczowy”), `kostny`, `limfatyczny`, `rozrodczy` oraz `calosc`.

## 6. Źródła modeli dla układów
| Układ | Główne źródło | Uzupełnienie |
|---|---|---|
| Mięśniowy | Z-Anatomy, kolekcja `4: Muscular system` | szkielet z `1: Skeletal system` |
| Nerwowy | Z-Anatomy, `7: Nervous system & Sense organs` (nerwy, rdzeń) | HuBMAP `VH_M_Spinal_Cord.glb` |
| Mózg | Z-Anatomy, zakręty i płaty (np. `Precentral gyrus.l`) | HuBMAP `Allen_M_Brain.glb` |
| Oddechowy | Z-Anatomy, `8: Visceral systems` › Respiratory, przepona | HuBMAP płuco, tchawica, oskrzela (v1.4) |
| Krwionośny | Z-Anatomy `5: Cardiovascular system`: 650 naczyń jako **krzywe** (`al.find_curves`) | HuBMAP: serce i naczynia przy sercu (zbliżenie) |
| Skala molekularna (zbliżenia) | PDB przez Molecular Nodes (`atlas_raw/pdb`) | |

Modele HuBMAP:
- import tylko przez `al.import_glb(plik, kolekcja)`;
- dopasowanie tylko przez `al.align_hubmap(obiekty, "male")`: jedna transformacja z 24 kręgów, błąd średnio 1,56 cm; v1.2–v1.4 mają wspólny układ;
- dowód: `tools_align_check.py`;
- narządów żeńskich (HuBMAP VH_F) nie nakładamy na męski szkielet Z-Anatomy.

## 7. Kontrola jakości: każda plansza, przed oddaniem
1. Render obejrzany (nie tylko „skrypt przeszedł”). Kolory zgodne z tabelą, brak prześwitów i dziur.
2. Podpisy trafiają w struktury w obu stanach. Sprawdzić na zrzucie z przeglądarki przy szerokości 1440 i 390 px.
3. Liczby mają źródło. Nic nie jest wymyślone.
4. Konsola przeglądarki bez błędów, `npm run build` przechodzi.

## 8. Licencje
Rendery z Z-Anatomy to utwory zależne na licencji **CC BY-SA 4.0**, a modele HuBMAP są na **CC BY 4.0**.
Atlas w aplikacji musi pokazywać stopkę z autorami (komponent `AtlasApp` ją ma).

**Struktury NC blokuje skrypt** (`atlas_lib.NC_BLOCKLIST`):
- nerka (`Kidney.l/.r`, `Renal pelvis.l/.r`);
- ucho wewnętrzne (`Cochlea`, `Vestibule`);
- ostrożnościowo naczynia wewnątrznerkowe Z-Anatomy.

Funkcje `find_*` je pomijają, a `Plate.add` i `Plate.render` rzucają `LicenseError`. Nerki bierzemy z HuBMAP. Test: `tools_license_test.py`.

## 9. Pułapki (z raportów fazy 1; każdy agent musi je znać)
- **Naczynia, nerwy obwodowe, oskrzela segmentowe i przewody to w Z-Anatomy krzywe (CURVE).** `find_meshes` ich nie widzi.
  Używać `al.find_curves`, `al.thicken_curves`, `al.curve_anchor`. Spis siatek i krzywych: `tools_inventory.py`.
- **Kierunek krzywych jest przypadkowy.** Kierunek przepływu w naczyniach: `al.vessel_path`.
  Rodzic krzywej to naczynie, z którego ona wychodzi albo do którego uchodzi. Zgodność z drzewem trafia do logu.
- **Import GLB** wkłada obiekty do aktywnej kolekcji Startup.blend (kolekcji szkieletu). Importować tylko przez `al.import_glb`.
- **Obrys:** `bound_box` bywa nieaktualny, więc biblioteka liczy obrys z wierzchołków (`al.vert_bbox`).
  Uwaga na zabłąkane wierzchołki (np. `Hypothalamus` ma wierzchołek na z≈1,15 m).
- **Sloty renderu:**
  - `ls -a` (foldery zaczynają się kropką);
  - slot zajmować atomowo, a Blendera uruchamiać tylko po udanym `mkdir`:
    `mkdir "<atlas_raw>/.render_slot_1" && ( blender ... ; rmdir "<atlas_raw>/.render_slot_1" )`;
  - najwyżej 2 Blendery naraz, nigdy nie usuwać cudzego slotu;
  - zawsze najpierw podgląd `ATLAS_QUICK=1`.
- **Playwright MCP jest wspólny dla sesji:** nie używać. Zrzuty: chrome-devtools MCP we własnej karcie albo headless Chrome.
- **Rejestracja planszy** w `src/atlas/plates/index.ts` to dwie linie: `import` i `content: null → STAŁA`.
- **Kolor spoczynku cienkich tkanek** mieszamy z `#8E7A78` (`ctx="muscle"`), nie z kością.
- **Świateł i kolorów nie kompensujemy w skrypcie planszy.** Jeśli kolor wychodzi źle, zgłosić integratorowi.
- **Fakty:** każdy opis roli i każda liczba potrzebuje źródła z dosłownym cytatem.
  Bez statusu `checked_agent` liczba i opis nie trafią na ekran (nazwa struktury tak).
