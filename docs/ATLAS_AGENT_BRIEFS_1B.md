# Atlas układów: zadania dla agentów fazy 1b (PRZYGOTOWANE, NIE URUCHOMIONE)

Stan na 2026-11-25. Siedem pozostałych układów: hormonalny, powłokowy, pokarmowy, wydalniczy, kostny, limfatyczny, rozrodczy.
Ten plik jest gotowy do użycia: §5 zawiera treść zadania, którą wkleja się przy starcie sesji agenta.
Agentów uruchamia się dopiero na wyraźną decyzję użytkownika i **dopiero po fazie 2** (integracji), patrz §1.

Powiązane dokumenty:
- `docs/ATLAS_STYLE_BIBLE.md` (obowiązuje)
- `docs/ATLAS_KOLEJNE_UKLADY.md` (rola układów w sprincie, kolory, źródła)
- `docs/ATLAS_ASSETS.md` (zasoby)
- `docs/ATLAS_AGENT_BRIEFS.md` (faza 1 i 2)
- `docs/atlas_badania/` (model teoretyczno-architektoniczny, badanie atlasów)

---

## 0. Wnioski z raportów fazy 1 (pięć sesji, 2026-11-25)

Wszystkie pięć plansz jest gotowych na osobnych gałęziach (`claude/atlas-{mozg,miesniowy,nerwowy,krwionosny,oddechowy}-*`).
Każda działa, `npm run build` przechodzi, konsola jest czysta.
Sesje zgłosiły te same braki we wspólnym kodzie, więc obeszły je lokalnie, każda po swojemu. Siedem nowych sesji
powieliłoby te obejścia siedem razy. Dlatego faza 1b czeka na fazę 2.

### Odkrycia, które zmieniają plan
1. **Z-Anatomy ma naczynia całego ciała jako krzywe (CURVE), nie siatki.**
   - 654 obiekty w `5: Cardiovascular system`: 399 tętnic, 209 żył, po ok. 96 na każdą kończynę dolną.
   - Są wśród nich np. `Femoral artery.l`, `Hepatic portal vein`, `Anterior branch of renal artery.l`, `Inferior mesenteric artery`.
   - `find_meshes` i `tools_inventory.py` widzą tylko siatki, dlatego sesja krwionośna tego nie zauważyła
     i naczynia kończyn zbudowała jako schematyczne rurki.
   - Spis krzywych leży w `atlas_raw/z_anatomy/za_curves_inventory.json` (951 krzywych, z kolekcjami).
   - Krzywymi są też nerwy obwodowe, oskrzela segmentowe, przełyk, jelito czcze, moczowody, cewka, przewody trzustkowe i żółciowy, nasieniowody.
   - **Wniosek:** krwionośny v2 (zadanie integratora) zastępuje rurki prawdziwymi naczyniami Z-Anatomy.
     Plansze pokarmowa, wydalnicza i hormonalna biorą naczynia narządów z tych samych krzywych. BodyParts3D nie jest potrzebne.
2. **Przytarczyce są w Z-Anatomy** (`Superior/Inferior parathyroid gland.l/.r`), tylko nie w kolekcji `Endocrine glands`.
3. **Brak naczyń chłonnych** (przewód piersiowy, zbiornik mleczu) w obu źródłach. Na planszy limfatycznej będą schematem z podpisem „schemat”.
4. **Dwa sposoby dopasowania HuBMAP → Z-Anatomy dały różne wyniki:**
   - krwionośny: skala 0,9864 i przesunięcie (0,0025; −0,0014; 0,8097) m, liczone z 24 kręgów `VH_M_Vertebrae`;
   - oddechowy: skala 1,05, środek płuc do środka płuc.

   Integrator musi ustalić **jedną** transformację na wersję HuBMAP (v1.2 i v1.4 mogą mieć różne układy)
   i zapisać ją w `atlas_lib`.

### Pułapki (każdy agent musi je znać)
- **Import GLB:** `import_scene.gltf` wkłada obiekty do aktywnej kolekcji, a w `Startup.blend` to kolekcja szkieletu.
  Wtedy `find_meshes("1: Skeletal system")` zwraca modele HuBMAP jako kości. Importować tylko do własnej kolekcji
  (po fazie 2 przez `atlas_lib.import_glb`).
- **Obrys obiektu:** `bound_box` bywa nieaktualny po edycji siatki w pamięci. Kadr liczyć z wierzchołków.
- **Zabłąkane wierzchołki:** niektóre obiekty je mają, np. `Hypothalamus` ma wierzchołek na z≈1,15 m.
- **Sloty renderu:** `ls` nie pokazuje folderów `.render_slot_*` (zaczynają się kropką), trzeba `ls -a`.
  Slot zajmuje się atomowo, a Blendera uruchamia tylko wtedy, gdy `mkdir` się udał:
  `mkdir "<atlas_raw>/.render_slot_1" && ( blender ... ; rmdir "<atlas_raw>/.render_slot_1" )`. Nigdy nie usuwać cudzego slotu.
- **Playwright MCP jest wspólny dla wszystkich sesji** (jedna przeglądarka, katalog w cudzym worktree). Nie używać go.
  Zrzuty robić przez chrome-devtools MCP we własnej karcie albo headless Chrome
  (skrypt wzorcowy: `zrzuty_mozg/shot_headless_chrome.mjs` w folderze notatek sesji „mózg”).
- **Rejestracja planszy w `plates/index.ts`** wymaga dwóch linii: `import` i `content`.
- **Prześwietlenie:** obecne światło obcina kanał R, więc bursztyn wychodzi cytrynowy, a ceglasty łososiowy.
  Integrator ma to poprawić w fazie 2, a agenci 1b nie kompensują tego sami.
- **Kolor spoczynku tkanek cienkich** (naczynia, przewody): mieszać z kolorem mięśni/tła `#8E7A78`, nie z kością,
  bo inaczej w spoczynku wychodzą prawie białe.

---

## 1. Warunek startu: co musi dać faza 2 (lista zadań integratora z raportów)

Agenci 1b zakładają, że poniższe **już istnieje**. Jeśli czegoś brakuje, agent nie dopisuje tego do wspólnego kodu, tylko zgłasza.

**Stan po fazie 2 (integrator, 2026-11-25):** wszystkie pozycje z tabel poniżej są zrobione (punkty kontrolne K2 i K3 integratora).
Opis API: docstring `blender/atlas/atlas_lib.py`, zasady: `docs/ATLAS_STYLE_BIBLE.md` §2–§4 i §9. Wzór planszy na krzywych: `plate_krwionosny.py`.

### `blender/atlas/atlas_lib.py`
| Funkcja / zmiana | Zgłosili | Po co |
|---|---|---|
| `import_glb(path, collection)`: import do własnej kolekcji, zdjęcie rodziców | oddechowy | pułapka kolekcji |
| `align_hubmap(objs, version)`: jedna sprawdzona transformacja HuBMAP → Z-Anatomy (M); osobno dla modeli żeńskich | krwionośny, oddechowy | spójność dopasowania |
| `find_curves(...)` + pogrubianie krzywych (`bevel_depth`, wyrównanie promieni) + `curve_anchor(obj, z)` | nerwowy | nerwy, naczynia, przewody |
| widoki `detail` i `side`: własny środek, `ortho_scale`, obraz poziomy; widoczność obiektów na widok | oddechowy, krwionośny, mózg | zbliżenia |
| `render()` scala `anchors.json` zamiast go nadpisywać | oddechowy, krwionośny, mięśniowy | kilka widoków |
| obrys z wierzchołków (`vert_bbox`) zamiast `bound_box` | mózg | kadr |
| kotwice w punktach świata (bez pustych obiektów) | oddechowy | wygoda |
| role materiałów: `context_bone_ghost` (alfa ok. 0,22), aktywny półprzezroczysty (`alpha=`), cienkie tkanki z mieszaniem do `#8E7A78` | nerwowy, oddechowy, krwionośny | czytelność |
| `build_silhouette()`: sylwetka z Z-Anatomy (remesh 11 mm, +5 mm), jedna dla wszystkich plansz | nerwowy | kontekst ciała, warstwy „Całość” |
| słabsze światło klucza albo ekspozycja | nerwowy, mięśniowy | wierne kolory |

### `src/atlas/` (React)
| Zmiana | Zgłosili |
|---|---|
| `AtlasPlate`: rysowanie `flows` (linia przerywana, `stroke-dashoffset`, szybciej w sprincie) | wszyscy |
| `AtlasPlate`: margines na podpisy i czcionka proporcjonalne do obrazu, nie stałe (plansza pozioma) | mózg |
| `AtlasApp`/`AtlasPlate`: przełącznik „Całe ciało / Zbliżenie” i `fitHeight` (gotowa łatka: `miesniowy_propozycja_AtlasApp_zblizenie.diff` w folderze notatek) | mięśniowy |
| Strona podpisów przy 2 widokach (linie nie mogą przecinać serca); tytuł widoku nie nachodzi na render | krwionośny |
| `types.ts`: nowe identyfikatory `hormonalny`, `powlokowy`, `pokarmowy`, `wydalniczy`, `kostny`, `limfatyczny`, `rozrodczy` | plan |
| `index.css`: tokeny `--sys-endo`, `--sys-skin`, `--sys-digest`, `--sys-urinary`, `--sys-bone`, `--sys-lymph`, `--sys-repro` (+ `-light`), zatwierdzone na planszy „Całość” | plan |
| `plates/index.ts`: 7 nowych wpisów z `content: null` | plan |

### Pozostałe zadania fazy 2
- Krwionośny v2: naczynia kończyn, szyi i głowy z krzywych Z-Anatomy zamiast rurek.
- `tools_inventory.py`: spis także krzywych (dziś osobny plik `za_curves_inventory.json`).
- Księga stylu: przenieść kolory 7 układów do §2, dopisać zasady z §0 tego pliku.

---

## 2. Wspólne zasady fazy 1b (jak w fazie 1, z poprawkami)

- **Gałąź bazowa:** `atlas-uklady` po fazie 2. Każdy agent pracuje we własnym worktree.
- **Wolno tworzyć i zmieniać tylko:**
  - `blender/atlas/plate_<uklad>.py`
  - `public/atlas/<uklad>/*`
  - `src/atlas/plates/<uklad>.ts`
  - dwie linie w `src/atlas/plates/index.ts`: `import` oraz `content: null → <STAŁA>`
  - nowe pozycje w `src/science/ScientificReferences.ts` (tylko dopisywanie, `acts: []`)
- **Nie wolno zmieniać:** `atlas_lib.py`, `AtlasPlate.tsx`, `AtlasApp.tsx`, `types.ts`, `index.css`, księgi stylu ani plików innych układów.
- **Surowe zasoby** są tylko w głównym checkoutcie: `C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt\atlas_raw`.
  Nie zmieniać ich i nie kopiować do repozytorium. Wyjątek: własne pliki pomocnicze agent trzyma w folderze notatek.
- **Render:** najwyżej 2 Blendery naraz, przez sloty (§0). Szybki podgląd: `ATLAS_QUICK=1`. Tylko kotwice: `ATLAS_ANCHORS_ONLY=1`.
- **Porty serwera podglądu:**

  | Układ | Port |
  |---|---|
  | hormonalny | 5191 |
  | powłokowy | 5192 |
  | pokarmowy | 5193 |
  | wydalniczy | 5194 |
  | kostny | 5195 |
  | limfatyczny | 5196 |
  | rozrodczy | 5197 |

  Pliku `.claude/launch.json` nie commitować.
- **Nauka:** każda liczba ma źródło sprawdzone w PubMed/DOI i poziom dowodów (`EvidenceLevel`). Wartości z `docs/ATLAS_KOLEJNE_UKLADY.md` §2 są
  orientacyjne i **nie wolno ich przepisać bez sprawdzenia**. Wyniki ze zwierząt i hipotezy dostają ostrożniejszą etykietę.
  Lepiej mniej liczb niż jedna wymyślona.
- **Spójność z innymi planszami:**
  - kamera całego ciała taka jak na planszy mięśniowej (obrys kości i mięśni, margines 1,06), żeby warstwy dało się nakładać na „Całość”;
  - sylwetka z `build_silhouette()`;
  - szkielet jako kontekst.
- **Strzałki `flows`** w pikselach renderu danego widoku: kopia w `public/atlas/<uklad>/flows.json` i w treści planszy.
- **Kontrola jakości** (księga stylu §7):
  1. Obejrzane rendery, najwyżej 3 rundy poprawek.
  2. Zrzuty przy 1440 i 390 px, oba stany.
  3. Kotwice sprawdzone na renderze z naniesionymi punktami.
  4. Konsola bez błędów, `npm run build` przechodzi.
- **Raport końcowy** do folderu notatek (`<uklad>_RAPORT.md` + zrzuty). Zawiera:
  - co zrobione i commit (bez push)
  - czego nie zrobiono
  - propozycje zmian wspólnego kodu
  - które liczby są najsłabiej udokumentowane

---

## 3. Kolejność i modele

| Fala | Układy | Model | Uwagi |
|---|---|---|---|
| **A** (najsilniej związane ze sprintem) | hormonalny, powłokowy, pokarmowy, wydalniczy | Opus; hormonalny na **extra**, reszta **high** | 4 sesje równolegle, render najwyżej 2 naraz |
| **B** | kostny, limfatyczny, rozrodczy | Opus; rozrodczy na **extra**, reszta **high** | po fali A albo równolegle, jeśli fala A nie renderuje |
| Integracja 1b | menu, kolory, warstwy „Całość”, przegląd spójności | Opus extra | jeden agent |

---

## 4. Zadania układów

Każde zadanie podaje, co pokazać, źródła modeli (nazwy obiektów sprawdzone w spisie 2026-11-25), widoki, różnicę spoczynek/sprint,
liczby do sprawdzenia, strzałki i pułapki naukowe. Agent może zmienić szczegóły, jeśli render pokaże, że coś nie działa, i opisuje to w raporcie.

### Agent 6: Hormonalny (`hormonalny`, `--sys-endo` `#EF872A`)
- **Teza planszy:** sprint uruchamia oś „mózg → nadnercza → krew → narządy”. Katecholaminy rosną w sekundach, a reszta hormonów zmienia się wolniej.
- **Struktury (Z-Anatomy):**
  - `Endocrine glands`: `Adenohypophysis`, `Neurohypophysis`, `Pineal gland`, `Suprarenal gland.l/.r`, `Thyroid gland`
  - `Superior/Inferior parathyroid gland.l/.r` (kolekcja `8: Visceral systems`)
  - `Pancreas` (z `Digestive system`; wyróżnić jako narząd dokrewny)
  - grasica `Left/Right lobe of thymus` (tylko kontekst, bez roli w sprincie)
  - podwzgórze: `Hypothalamus` (uwaga na zabłąkany wierzchołek), spina z planszą mózgu
  - naczynia z krzywych Z-Anatomy: tętnice nadnerczowe (`Inferior suprarenal artery` itd.), żyła wrotna (droga glukagonu i insuliny do wątroby)
- **Widoki:**
  - `front`: całe ciało, gruczoły na tle przygaszonych narządów i szkieletu
  - `detail`: nadnercze w przekroju (kora i rdzeń, schemat warstw) albo oś podwzgórze–przysadka; agent wybiera to, co da się pokazać rzetelnie
- **Spoczynek / sprint:**
  - w sprincie świeci rdzeń nadnerczy (adrenalina, noradrenalina), przysadka (GH, ADH) i trzustka (glukagon w górę, insulina w dół)
  - tarczyca i szyszynka zostają przygaszone (brak istotnej roli ostrej)
- **Liczby (do sprawdzenia):**
  - adrenalina i noradrenalina po sprincie (spina z planszą nerwową: `brooks_1988`, `zouhal_2008`; nie dublować, tylko odwołać)
  - hormon wzrostu po sprintach (np. Stokes i wsp.)
  - insulina i glukagon przy wysiłku intensywnym
  - kortyzol: rośnie zwykle przy dłuższym lub bardzo intensywnym wysiłku, więc koniecznie podać warunki z badania
- **Strzałki:**
  - `hormone` z nadnerczy przez żyłę główną dolną do serca, potem do mięśni i wątroby
  - `hormone` z trzustki żyłą wrotną do wątroby
  - typ `kind: 'hormone'` dodaje integrator; do tego czasu agent używa `artery`/`vein` z dopiskiem w raporcie
- **Pułapki:**
  - „hormony szczęścia”, „spalanie tłuszczu”, „testosteron po HIIT buduje mięśnie”: nie
  - pokazywać ostre zmiany, nie adaptacje
- **Opcjonalne zbliżenie molekularne:** PDB `4LDO` (receptor β2 z adrenaliną, `atlas_raw/pdb/4LDO.cif`), `3I40` (insulina ludzka), `1GCN` (glukagon).

### Agent 7: Powłokowy (`powlokowy`, `--sys-skin` `#FA947A`)
- **Teza planszy:** w sprincie skóra i mięśnie konkurują o krew. W krótkim HIIT ciepło rośnie szybciej, niż ciało zdąży je oddać.
  **Po wysiłku pocenie i przepływ skórny szybko spadają**, choć temperatura głęboka jest jeszcze podwyższona, więc ciało stygnie
  powoli (Kenny i wsp. 2007/2008; liczby i cytat do sprawdzenia przez agenta faktów). Wcześniejsze zdanie „po interwale skóra
  przejmuje chłodzenie” było błędne (poprawka integracji 1b).
- **Struktury:**
  - skóra jako półprzezroczysta sylwetka z `build_silhouette()` (pasuje do szkieletu Z-Anatomy)
  - `VH_M_Skin` z HuBMAP tylko porównawczo, bo ma inną pozę i wzrost
  - naczynia skórne i powierzchowne żyły z krzywych Z-Anatomy, np. żyły odpiszczelowe, odłokciowe, odpromieniowe
- **Widoki:**
  - `front`: całe ciało, skóra jako warstwa aktywna, pod nią przygaszony szkielet i mięśnie
  - `detail`: przekrój skóry (naskórek, skóra właściwa, gruczoł potowy ekrynowy, splot naczyń skórnych, mięsień przywłosowy)
    jako geometria proceduralna w stylu atlasu, opisana jako schemat
- **Spoczynek / sprint:**
  - w sprincie sylwetka jest cieplejsza i silniej podświetlona w miejscach o dużej gęstości gruczołów potowych (czoło, tułów, plecy)
  - w zbliżeniu gruczoł potowy jest aktywny, a naczynia skórne rozszerzone
  - **uwaga:** na początku intensywnego wysiłku naczynia skórne mogą się zwężać (współczulnie), a rozszerzają się wraz ze wzrostem temperatury.
    Nie rysować prostego „sprint = pełne rozszerzenie” bez sprawdzenia.
- **Liczby (do sprawdzenia):**
  - temperatura głęboka w wysiłku
  - tempo pocenia (rząd 1–2 L/h przy długim, ciężkim wysiłku; w krótkim HIIT podać ostrożnie)
  - przepływ skórny (np. przegląd Johnsona / Kenneya)
  - ułamek energii zamienianej na ciepło (ok. 75–80% przy sprawności mechanicznej ok. 20–25%)
- **Strzałki:** `artery` w skórze (ciepło z rdzenia do powierzchni). Typ `heat` dla wypływu ciepła dodaje integrator.
- **Spina:** z planszą krwionośną (redystrybucja przepływu). Liczby wspólne trzeba wziąć z tego samego źródła.

### Agent 8: Pokarmowy (`pokarmowy`, `--sys-digest` `#B4B474`)
- **Teza planszy:** w sprincie trawienie staje na boczny tor (mniej krwi w trzewiach), a wątroba staje się „elektrownią”:
  uwalnia glukozę i przerabia mleczan z mięśni.
- **Struktury (Z-Anatomy, `Digestive system`):**
  - `Stomach`, `Duodenum`
  - `Ascending/Transverse/Descending/Sigmoid colon`
  - `Liver` (+ 8 segmentów), `Gallbladder`, `Pancreas`
  - z krzywych: `Oesophagus`, `Jejunum`, `Bile duct`, `Pancreatic duct`
  - jelito kręte → HuBMAP `VH_M_Small_Intestine`
  - naczynia trzewne z krzywych Z-Anatomy: `Hepatic portal vein`, `Common hepatic artery`, `Superior/Inferior mesenteric artery`, `Hepatic veins`
  - opcjonalnie `VH_M_Blood_Vasculature_Liver`
- **Widoki:**
  - `front`: tułów (zbliżenie jamy brzusznej jak plansza oddechowa na klatce), przewód pokarmowy i wątroba, szkielet w tle
  - `detail`: wątroba z naczyniami wrotnymi albo schemat cyklu Cori (mięsień → mleczan → wątroba → glukoza → mięsień)
- **Spoczynek / sprint:**
  - w sprincie przewód pokarmowy jest przygaszony (mniej krwi), a wątroba w pełnym kolorze
  - naczynia trzewne cieńsze lub przygaszone, tak samo jak na planszy krwionośnej
- **Liczby (do sprawdzenia):**
  - przepływ trzewny w spoczynku i przy wysiłku maksymalnym
  - glikogenoliza wątrobowa i stężenie glukozy po sprintach
  - udział mleczanu w glukoneogenezie (`brooks_2018`; ostrożnie, bo w czasie samego sprintu cykl Cori dopiero rusza, a większość dzieje się po interwale)
- **Strzałki:**
  - `vein`: żyła wrotna do wątroby
  - `artery`: z wątroby żyłami wątrobowymi
  - typ `lactate`/`glucose` dla cyklu Cori dodaje integrator; agent zapisuje dane i zgłasza
- **Opcjonalnie:** PDB `6LZ0` (transporter mleczanu MCT1, ludzki).

### Agent 9: Wydalniczy (`wydalniczy`, `--sys-urinary` `#276777`)
- **Teza planszy:** nerka w sprincie dostaje mniej krwi i oszczędza wodę oraz sód. Kwasowość zbuforowuje oddech w minutach,
  a nerka w godzinach.
- **Struktury:**
  - **Nerki wyłącznie z HuBMAP:** `VH_M_Kidney_L/R` i `VH_M_Blood_Vasculature_Kidney`
    (dopasowane przez `align_hubmap`). Nerka z Z-Anatomy (`Kidney.l/.r`, `Renal pelvis`) ma licencję **CC BY-NC**
    (`docs/ATLAS_ASSETS.md` §1), więc **nie wolno jej renderować** nawet jako tło. Integrator powinien ją zablokować w `atlas_lib`.
  - Z-Anatomy: `Urinary bladder`; z krzywych `Ureter`, `Urethra` i tętnice nerkowe (`Anterior branch of renal artery.l/.r` i pokrewne).
    Sprawdzić, czy krzywe nie należą do modelu NC.
- **Widoki:**
  - `back` albo `front`: nerki, moczowody, pęcherz na tle szkieletu (nerki leżą zaotrzewnowo, widok z tyłu bywa czytelniejszy)
  - `detail`: nefron jako schemat (kłębuszek, kanaliki, pętla Henlego, cewka zbiorcza z punktem działania ADH)
- **Spoczynek / sprint:**
  - w sprincie przepływ nerkowy przygaszony
  - nadnercza na biegunach nerek wyróżnione (spina z planszą hormonalną)
  - w zbliżeniu cewka zbiorcza z akwaporynami aktywna (ADH)
- **Liczby (do sprawdzenia):**
  - przepływ nerkowy (rząd ok. 20% rzutu serca w spoczynku; spadek w wysiłku maksymalnym)
  - GFR
  - ADH i aldosteron
  - białkomocz wysiłkowy (przejściowy, niegroźny)
  - pH krwi po sprintach (spina z oddechem)
- **Strzałki:** `artery` do nerek (cienka w sprincie). Typ `urine` dla moczu dodaje integrator.
- **Opcjonalnie:** PDB `4NEF` (akwaporyna 2, ludzka) i `3KS3` (anhydraza węglanowa II, bufor wodorowęglanowy).

### Agent 10: Kostny (`kostny`, `--sys-bone` `#A17D2B`)
- **Teza planszy:** szkielet w sprincie to układ dźwigni i amortyzatorów. Przy każdym kroku kości nóg przyjmują siłę równą wielokrotności masy ciała.
- **Struktury:**
  - Z-Anatomy `1: Skeletal system` (cały szkielet)
  - stawy z `3: Joints`: `Knee joint`, `Hip joint`, stawy stopy
  - HuBMAP kolana nie jest potrzebny, bo Z-Anatomy ma kolekcję stawu kolanowego
- **Kolor:** szkielet staje się układem aktywnym, więc dostaje `--sys-bone` (ochra, `palette.json`), wyraźnie odróżniony od kości kontekstowej `#D8D1C4`.
  Mięśnie są wtedy kontekstem.
- **Widoki:**
  - `front` i `side` (strzałka siły reakcji podłoża przy lądowaniu)
  - `detail`: przekrój kości udowej (istota zbita i gąbczasta, beleczki ułożone wzdłuż linii obciążeń, jama szpikowa)
- **Spoczynek / sprint:** w sprincie kości kończyny dolnej, miednica i kręgosłup lędźwiowy w pełnym kolorze, a kończyna górna przygaszona.
- **Liczby (do sprawdzenia):**
  - pionowa siła reakcji podłoża w sprincie (np. Weyand i wsp. 2000: ok. 2–3× masy ciała, w szczycie więcej)
  - czas kontaktu z podłożem
  - szpik i tworzenie krwi tylko jako informacja „po tygodniach”, z oznaczeniem
- **Strzałki:** typ `force` dla wektora siły dodaje integrator. Do tego czasu agent zapisuje dane i zgłasza.
- **Pułapka:** gęstość kości to adaptacja długoterminowa, nie efekt jednego sprintu. Pokazywać tylko z etykietą.

### Agent 11: Limfatyczny i odpornościowy (`limfatyczny`, `--sys-lymph` `#73C770`)
- **Teza planszy:** sprint wypycha komórki odpornościowe do krwi (adrenalina), a pompa mięśniowa przyspiesza limfę. Po wysiłku liczba komórek
  przejściowo spada.
- **Struktury:**
  - Z-Anatomy `Lymphoid system` i `6: Lymphoid organs`: grupy węzłów całego ciała (pachowe, pachwinowe, podkolanowe, biodrowe, szyjne),
    `Spleen`, `Left/Right lobe of thymus`, `Palatine tonsil`
  - HuBMAP `VH_M_Spleen`, `VH_M_Thymus`, `NIH_M_Lymph_Node` do zbliżenia węzła
  - **naczyń chłonnych brak w obu źródłach**: przewód piersiowy i główne pnie jako schemat (krzywa wzdłuż kręgosłupa do kąta żylnego lewego), podpisany „schemat”
- **Widoki:**
  - `front`: całe ciało, węzły i narządy limfatyczne
  - `detail`: węzeł chłonny z HuBMAP (zatoki, grudki) albo schemat zastawek naczynia chłonnego z pompą mięśniową
- **Spoczynek / sprint:**
  - w sprincie węzły kończyn dolnych i śledziona wyróżnione (śledziona oddaje krew i komórki)
  - śledziona i grasica: tylko to, co ma dowody u ludzi
- **Liczby (do sprawdzenia):**
  - leukocytoza wysiłkowa: mobilizacja komórek NK, wielokrotny wzrost w minutach (np. Campbell i Turner 2018, przegląd)
  - spadek po wysiłku
  - przepływ limfy w wysiłku (dane głównie zwierzęce, więc etykieta ostrożna)
- **Pułapka:** „otwarte okno” infekcji po wysiłku jest sporne. Tylko z etykietą `contested_debate`, cytując obie strony (Campbell i Turner 2018 kontra wcześniejsze prace).

### Agent 12: Rozrodczy (`rozrodczy`, `--sys-repro` `#EA7BB2`)
- **Teza planszy:** spokojna, rzeczowa. Pojedynczy sprint wpływa na ten układ słabo i niejednoznacznie. Plansza pokazuje budowę obu płci
  i uczciwie mówi, czego nie wiadomo.
- **Struktury:**
  - **mężczyzna (Z-Anatomy, `Genital systems'`):** `Testis`, `Epididymis`, `Prostate`, `Seminal gland`, ciała prącia;
    z krzywych `Ductus deferens`, `Ejaculatory duct`; HuBMAP `VH_M_Prostate` opcjonalnie
  - **kobieta (HuBMAP `atlas_raw/hubmap/female/`):** `VH_F_Uterus`, `VH_F_Ovary_L/R`, `VH_F_Fallopian_Tube_L/R`, `VH_F_Vagina`,
    `VH_F_Ligaments_Uterus_Ovaries`, `VH_F_Blood_Vasculature_Uterus`, `VH_F_Pelvis`
  - **kontekst żeński:** `VH_F_skin.glb` (v1.3) i `VH_F_Vertebrae.glb` (pobrane 2026-11-25) do sprawdzenia, że narządy leżą w żeńskiej miednicy
  - **nie przenosić narządów żeńskich na męski szkielet Z-Anatomy**
- **Widoki:**
  - `detail` „miednica męska” i `detail` „miednica żeńska”, obok siebie, w tej samej skali i kamerze
  - całe ciało nie jest potrzebne
- **Spoczynek / sprint:** różnica tylko tam, gdzie są dowody. Np. przepływ krwi w miednicy jest przygaszony w sprincie (redystrybucja).
  Hormony płciowe tylko w panelu tekstowym, z etykietami.
- **Liczby (do sprawdzenia, mało i ostrożnie):**
  - przejściowy wzrost testosteronu po intensywnym wysiłku (znaczenie praktyczne niejasne)
  - faza cyklu a wydolność: metaanaliza McNulty i wsp. 2020 (niewielki, niepewny efekt), etykieta `preliminary_human` albo `contested_debate`
  - RED-S tylko jako informacja długoterminowa, nie efekt sprintu
- **Ton:** bez sensacji i bez obrazów, które nie służą anatomii. Ujęcia jak w podręczniku: przekrój strzałkowy miednicy albo widok z przodu.

---

## 5. Treść zadania do wklejenia przy starcie sesji (szablon)

Podstawić `<UKLAD>`, `<NR>`, `<PORT>`. Sesja w osobnym worktree z gałęzi `atlas-uklady` (po fazie 2), model Opus, poziom z §3.

```
Jesteś agentem <NR> fazy 1b atlasu układów BIOGENESIS (repozytorium C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt, gałąź bazowa atlas-uklady).
Twój układ: <UKLAD>. Pracujesz tylko w swoim worktree i tylko w plikach dozwolonych w docs/ATLAS_AGENT_BRIEFS_1B.md §2.
Najpierw przeczytaj w całości:
  1. docs/ATLAS_AGENT_BRIEFS_1B.md: §0 (pułapki), §1 (co już jest we wspólnym kodzie), §2 (zasady) i swoją sekcję w §4
  2. docs/ATLAS_STYLE_BIBLE.md (obowiązuje)
  3. docs/ATLAS_KOLEJNE_UKLADY.md (rola układu w sprincie)
  4. jedną gotową planszę jako wzór: blender/atlas/plate_oddechowy.py + src/atlas/plates/oddechowy.ts
Surowe zasoby: C:\Users\piryt\Desktop\Luźny Vibecoading\HIIt\atlas_raw (tylko odczyt). Spis struktur: atlas_raw/z_anatomy/za_inventory.json
(siatki) i za_curves_inventory.json (krzywe: naczynia, nerwy, przewody).
Port podglądu: <PORT>. Nie używaj Playwright MCP (jest wspólny dla sesji). Zrzuty rób przez chrome-devtools MCP albo headless Chrome.
Render tylko przez slot .render_slot_1/2 zajęty atomowo (mkdir && ...), najwyżej 2 Blendery naraz.
Każda liczba: źródło sprawdzone w PubMed/DOI + poziom dowodów. Niczego nie wymyślaj. Wolisz mniej liczb niż jedną niepewną.
Nie zmieniaj wspólnego kodu. Gdy czegoś brakuje, obejdź to lokalnie w swoim skrypcie i opisz w raporcie.
Na koniec: commit na swojej gałęzi (bez push) i raport <UKLAD>_RAPORT.md ze zrzutami w folderze notatek.
Raport zawiera: co zrobione, czego nie zrobiono, propozycje zmian wspólnego kodu, najsłabiej udokumentowane liczby.
```

---

## 6. Zmiany wynikające z modelu architektonicznego (`docs/ATLAS_MODEL_ARCHITEKTONICZNY.md`)

Model z 2026-11-25 (trzech badaczy, dwie rundy sporu) przesuwa start fazy 1b za etapy **E0** (podpisy HTML, `palette.json`, ikony)
i **E1** (`structures.json`, `mesh_bindings.json`, format faktów). Jeśli użytkownik zdecyduje się ruszyć wcześniej, briefy z §4 działają
na starym formacie, ale agenci muszą przestrzegać poniższych zasad, żeby późniejsze przepięcie było mechaniczne:

1. **Typ treści układu (model §4, punkt 10):**

   | Układ | Typ treści |
   |---|---|
   | hormonalny, pokarmowy (z wątrobą), wydalniczy („Układ moczowy” na ekranie), limfatyczny | pełna plansza ze stanami |
   | powłokowy | plansza w skali sesji: minuty, nie sekundy |
   | kostny | karta z jedną liczbą obciążenia (siła reakcji podłoża), bez wymuszonej różnicy kolorów |
   | rozrodczy | karta, bez stanów |

2. **Każda liczba ma czas pomiaru:**
   - w polu `notePl` zapis typu „koniec 30 s serii” albo „3 min po serii”;
   - w raporcie: populacja, protokół, źródło ze stroną lub tabelą i **dosłowny cytat** (1–2 zdania) dla każdej liczby.

   To gotowy materiał dla agenta danych w E1.
3. **Strzałki w metrach:** obok `flows.json` w pikselach agent zapisuje `flows3d.json` z punktami krzywej w metrach (układ Z-Anatomy),
   najlepiej wziętymi z krzywych naczyń i przewodów. Kierunek przepływu trzeba sprawdzić, bo kierunek krzywych w Z-Anatomy jest przypadkowy.
4. **Kolejność w czasie** musi zgadzać się z literaturą. Przykłady pułapek:
   - adrenalina we krwi szczytuje pod koniec serii lub tuż po niej;
   - skóra na starcie intensywnego wysiłku zwęża naczynia;
   - pocenie i przepływ skórny rosną po minutach;
   - hormon wzrostu szczytuje 10–30 min po sprincie.
5. **Ograniczenia na ekranie:**
   - 6–10 podpisów i najwyżej 4 liczby na planszę;
   - jasność struktur w sprincie to ilustracja w 3 stopniach, a nie liczba „ze źródła”.
6. **Kolor układu nie może być jedynym nośnikiem informacji.** Kolor `--sys-bone` zmieniony przez integratora na `#A17D2B` (`palette.json`, walidator ΔE).
   Kolory wszystkich układów: `src/atlas/data/palette.json`.
7. **Odbiorcy (decyzja użytkownika 2026-11-25):** laicy i uczniowie liceum, z dodatkami dla studentów. Model §3.5 opisuje dwa poziomy.
   Każda plansza ma:
   - 6–10 podpisów `tier: 'primary'`: nazwy szkolne, zrozumiałe dla licealisty, zgodne z podstawą programową biologii;
   - opcjonalnie dodatkowe podpisy `tier: 'secondary'` dla studentów (łacina, drobniejsze struktury);
   - liczby: najwyżej 4 podstawowe, reszta oznaczona w raporcie jako „dla studentów”.

   Uproszczenie to pominięcie szczegółu, nigdy zmiana faktu.
8. **Zatwierdzanie faktów (decyzja użytkownika 2026-11-25):** liczby agenta układu sprawdza potem drugi, niezależny agent
   według `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md` §3.6. Agent układu ułatwia to, podając przy każdej liczbie w raporcie:
   - PMID albo DOI;
   - stronę, tabelę lub rysunek;
   - dosłowny cytat;
   - populację i protokół.

   Liczba bez cytatu nie trafi na ekran.
9. **Protokół wzorcowy (decyzja użytkownika 2026-11-25):** 6 × (45 s pracy przy ok. 88% VO₂max / 45 s przerwy),
   mężczyzna ok. 25 lat, rekreacyjnie aktywny. To ten sam protokół co `DEFAULT_HIIT_CONFIG` w aplikacji.
   - **Najpierw szukaj** badań interwałów o podobnej długości i intensywności.
   - **Liczby ze sprintów maksymalnych** (30 s Wingate, „all-out”) wolno użyć tylko z dopiskiem, z jakiego protokołu pochodzą.
     W raporcie oznacz je `protocolMismatch`.
   - **Moment „Sprint”** to koniec 45 s pracy.
   - **Szczegóły:** `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md` §3.7.
