# Księga stylu: „Atlas układów” (BIOGENESIS)

Ten dokument jest **obowiązujący** dla każdego agenta, który robi planszę układu.
Cel: 5 układów (nerwowy, mięśniowy, mózg, oddechowy, krwionośny) ma wyglądać jak jeden atlas medyczny,
a nie jak 5 różnych aplikacji. Jeśli coś nie pasuje do tych zasad, zmienia się księgę (jeden agent), a nie jedną planszę.

## 1. Idea
- **Precyzja zamiast efektów.** Statyczne, czyste ujęcia w stylu atlasu anatomicznego, z podpisami i liczbami.
- **Zawsze dwa stany:** `spoczynek` i `sprint` (interwał HIIT, ok. 90–100% VO₂max). Użytkownik przełącza je jednym przyciskiem, a obraz płynnie się przenika.
- **Zawsze kontekst ciała.** Aktywny układ jest kolorowy, a reszta ciała (szkielet i sylwetka) jest neutralna i przygaszona.
- Ruch jest tylko pomocniczy: przesuwające się strzałki przepływu i impulsów w warstwie SVG, nigdy na samym renderze.

## 2. Kolory układów (jedyne dozwolone kolory akcentu)
| Układ | Token | Kolor główny | Jasny (podpis, linia) | Uwaga |
|---|---|---|---|---|
| Nerwowy (obwodowy + rdzeń) | `--sys-nerve` | `#E8B23A` | `#F6D27A` | bursztyn |
| Mięśniowy | `--sys-muscle` | `#C8553D` | `#EE8A6E` | ceglasta czerwień |
| Mózg | `--sys-brain` | `#9B7BEA` | `#C3AEF5` | fiolet |
| Oddechowy | `--sys-resp` | `#4FC3E0` | `#94DEF0` | błękit |
| Krwionośny: tętnice | `--sys-artery` | `#D93240` | `#F07A84` | krew utlenowana |
| Krwionośny: żyły | `--sys-vein` | `#3E6FD8` | `#86A6EE` | krew odtlenowana |

Kontekst (zawsze ten sam, na każdej planszy):
| Rola | Kolor | Materiał |
|---|---|---|
| Kość | `#D8D1C4` | matowa, szorstkość 0,75 |
| Mięśnie nieaktywne / tło | `#8E7A78` | matowa, szorstkość 0,7 |
| Sylwetka skóry (gdy potrzebna) | `#9AA4B5` | półprzezroczysta (alfa 0,12) |
| Tło strony | `#070B14` | renderujemy z przezroczystym tłem, a tło daje strona |

Intensywność w stanach: `spoczynek` to kolor układu zmieszany w 35% z kolorem kontekstu, bez świecenia.
`Sprint` to pełny kolor układu i lekka emisja (siła 0,15–0,35) tylko na strukturach, które naprawdę pracują.

## 3. Materiały i światło (Blender, wspólna biblioteka `blender/atlas/atlas_lib.py`)
- Tylko Principled BSDF, **bez połysku lakieru** (coat 0) i ze specular IOR level ≤ 0,35. Cel: matowa ilustracja, nie „cukierek”.
- Lekki subsurface (0,05–0,1) tylko dla tkanek miękkich.
- Światło zawsze z biblioteki: klucz z lewej-góry-przodu, wypełnienie z prawej, kontra z tyłu dla odcięcia sylwetki od tła.
- Silnik EEVEE, transformacja widoku **Standard** (kolory z tabeli mają wyjść 1:1), przezroczyste tło filmu.
- Kamera **ortograficzna** (bez perspektywy, jak w atlasie). Podstawowe widoki to `front` (−Y) i `back` (+Y), a w razie potrzeby `side` i zbliżenia.
  Ujęcie całego ciała: `ortho_scale` 2,0, obraz 1000×1800 px.
- **Nigdy nie zapisujemy** `Startup.blend` z Z-Anatomy. Skrypty tylko ładują atlas i renderują.

## 4. Podpisy i grafika na planszy (React + SVG, `src/atlas/`)
- Podpis to kropka na strukturze, cienka linia odnośnika (1 px, kolor jasny układu) i tekst po lewej lub prawej krawędzi obrazu.
  Linie się nie krzyżują: podpisy z lewej połowy ciała idą w lewo, z prawej w prawo.
- Font: Figtree dla nazw, JetBrains Mono dla liczb. Nazwa polska, a pod nią mniejsza nazwa łacińska.
- Liczby zawsze w parze `spoczynek → sprint` z jednostką, np. `HR 60 → 185 /min`.
- Każda liczba ma źródło w `src/science/ScientificReferences.ts` albo w polu `source` danych planszy.
  Hipotezy i wyniki z badań na zwierzętach oznaczamy etykietą poziomu dowodów, tak jak w reszcie aplikacji.
- Strzałki przepływu (krew, powietrze, impuls) rysujemy w SVG w kolorze układu, jako linia przerywana z animacją `stroke-dashoffset`.
  W `sprint` jest szybsza, w `spoczynek` wolniejsza.

## 5. Struktura plików (każdy agent pracuje tylko w swoich plikach)
```
blender/atlas/atlas_lib.py            wspólne (faza 0): ładowanie atlasu, materiały, światło, kamery, eksport kotwic
blender/atlas/plate_<uklad>.py        skrypt planszy jednego układu
public/atlas/<uklad>/<widok>_<stan>.webp   rendery (np. front_rest.webp, front_sprint.webp)
public/atlas/<uklad>/anchors.json     współrzędne kotwic podpisów (0–1) dla każdego widoku
src/atlas/plates/<uklad>.ts           treść: podpisy, liczby, źródła, opis różnic spoczynek/sprint
src/atlas/AtlasPlate.tsx              wspólny komponent (faza 0), nie zmieniać bez zgody integratora
src/atlas/AtlasApp.tsx                widok atlasu, menu układów (faza 0, rozbudowuje integrator)
```
Identyfikatory układów: `nerwowy`, `miesniowy`, `mozg`, `oddechowy`, `krwionosny`, a w fazie 2 `calosc`.

## 6. Źródła modeli dla układów
| Układ | Główne źródło | Uzupełnienie |
|---|---|---|
| Mięśniowy | Z-Anatomy, kolekcja `4: Muscular system` | szkielet z `1: Skeletal system` |
| Nerwowy | Z-Anatomy, `7: Nervous system & Sense organs` (nerwy, rdzeń) | HuBMAP `VH_M_Spinal_Cord.glb` |
| Mózg | Z-Anatomy, zakręty i płaty (np. `Precentral gyrus.l`) | HuBMAP `Allen_M_Brain.glb` |
| Oddechowy | Z-Anatomy, `8: Visceral systems` › Respiratory, przepona | HuBMAP płuco, tchawica, oskrzela (v1.4) |
| Krwionośny | HuBMAP `3d-vh-m-blood-vasculature.glb`, serce | Z-Anatomy `5: Cardiovascular system` (słabe, tylko pomocniczo) |
| Skala molekularna (zbliżenia) | PDB przez Molecular Nodes (`atlas_raw/pdb`) | |

Modele HuBMAP trzeba dopasować do układu współrzędnych Z-Anatomy (metry, ciało przodem do −Y, stopy na Z≈0).
Dopasowanie sprawdzamy renderem z nałożonym szkieletem.

## 7. Kontrola jakości: każda plansza, przed oddaniem
1. Render obejrzany (nie tylko „skrypt przeszedł”). Kolory zgodne z tabelą, brak prześwitów i dziur.
2. Podpisy trafiają w struktury w obu stanach. Sprawdzić na zrzucie z przeglądarki przy szerokości 1440 i 390 px.
3. Liczby mają źródło. Nic nie jest wymyślone.
4. Konsola przeglądarki bez błędów, `npm run build` przechodzi.

## 8. Licencje
Rendery z Z-Anatomy to utwory zależne na licencji **CC BY-SA 4.0**, a modele HuBMAP są na **CC BY 4.0**.
Atlas w aplikacji musi pokazywać stopkę z autorami (komponent `AtlasApp` ją ma).
