# Atlas: kolejne układy (baza pod fazę 1b)

Stan na 2026-11-25. Faza 1 (nerwowy, mięśniowy, mózg, oddechowy, krwionośny) trwa w osobnych sesjach.
Ten dokument przygotowuje **następną falę**: pozostałe układy organizmu. Zawiera ich listę, rolę w sprincie HIIT,
źródła modeli, kolory i kolejność prac. Na razie **bez kodu**. Kod powstaje dopiero po decyzji użytkownika, po fazie 2.

## 1. Pełna lista układów

Podział szkolny (12 układów). Narządy zmysłów są częścią układu nerwowego.

| Układ | Identyfikator | Stan | Priorytet w HIIT |
|---|---|---|---|
| Nerwowy | `nerwowy` | faza 1 (w toku) | wysoki |
| Mięśniowy | `miesniowy` | faza 1 (w toku) | wysoki |
| Mózg (część nerwowego, osobna plansza) | `mozg` | faza 1 (w toku) | wysoki |
| Oddechowy | `oddechowy` | faza 1 (w toku) | wysoki |
| Krwionośny | `krwionosny` | faza 1 (w toku) | wysoki |
| **Hormonalny (dokrewny)** | `hormonalny` | do zrobienia | **1**: adrenalina, kortyzol, hormon wzrostu, glukagon |
| **Powłokowy (skóra)** | `powlokowy` | do zrobienia | **2**: pot i termoregulacja |
| **Pokarmowy** | `pokarmowy` | do zrobienia | **3**: wątroba (glukoza, cykl Cori), spadek przepływu trzewnego |
| **Wydalniczy (moczowy)** | `wydalniczy` | do zrobienia | **4**: nerki, gospodarka wodą, kwasowość |
| **Kostny (szkieletowy)** | `kostny` | do zrobienia | **5**: obciążenia przy lądowaniu, dźwignie |
| **Limfatyczny i odpornościowy** | `limfatyczny` | do zrobienia | **6**: mobilizacja leukocytów, pompa mięśniowa |
| **Rozrodczy** | `rozrodczy` | do zrobienia | **7**: słaby i niejednoznaczny związek z pojedynczym treningiem |
| Całość (integracja) | `calosc` | faza 2 | wszystkie warstwy naraz |

Kolejność to propozycja. Najpierw idą układy, które w sprincie zmieniają się najwyraźniej i są najlepiej zbadane.

## 2. Co pokazać w sprincie (do weryfikacji w literaturze przez agenta)

Poniższe to punkty wyjścia na poziomie podręcznika fizjologii wysiłku (`kenney_2022`). Każda liczba na planszy musi mieć
źródło i poziom dowodów. Wartości tutaj są orientacyjne i **nie wolno ich przepisać bez sprawdzenia**.

### Hormonalny (`hormonalny`)
- **Struktury:**
  - przysadka (hormon wzrostu, ADH)
  - nadnercza: rdzeń (adrenalina, noradrenalina), kora (kortyzol, aldosteron)
  - trzustka (insulina, glukagon)
  - tarczyca (kontekst)
  - podwzgórze (spina z planszą mózgu)
- **Sprint:**
  - wielokrotny wzrost katecholamin
  - wzrost hormonu wzrostu po interwałach
  - spadek insuliny, wzrost glukagonu
  - wzrost kortyzolu przy dłuższym, intensywnym wysiłku
- **Strzałki (`flows`):** hormon → krew → narząd docelowy (wątroba, mięśnie, serce, tkanka tłuszczowa).
- **Uwaga:** łatwo o przesadę („hormony szczęścia”, „spalanie tłuszczu”). Trzymać się dobrze zbadanych zmian ostrych.

### Powłokowy (`powlokowy`)
- **Struktury:** skóra jako półprzezroczysta sylwetka, gruczoły potowe jako schemat w zbliżeniu (`detail`), naczynia skórne.
- **Sprint:**
  - przepływ skórny rośnie dla oddania ciepła
  - skóra konkuruje z mięśniami o rzut serca
  - pocenie (rząd wielkości 1–2 L/h przy długim, ciężkim wysiłku; w krótkim HIIT mniej)
  - wzrost temperatury głębokiej
- **Spina** z planszą krwionośną (redystrybucja przepływu).

### Pokarmowy (`pokarmowy`)
- **Struktury:** przełyk, żołądek, jelito cienkie i grube, wątroba, pęcherzyk żółciowy, trzustka (część zewnątrzwydzielnicza).
- **Sprint:**
  - przepływ trzewny wyraźnie spada (krew idzie do mięśni)
  - wątroba uwalnia glukozę (glikogenoliza)
  - wątroba przerabia mleczan z mięśni na glukozę (cykl Cori, `brooks_2018`)
  - trawienie zwalnia
- **Uwaga:** ten sam rysunek co plansza krwionośna (naczynia trzewne przygaszone), tylko z perspektywy narządów.

### Wydalniczy (`wydalniczy`)
- **Struktury:** nerki z naczyniami, moczowody, pęcherz moczowy, cewka moczowa.
- **Sprint:**
  - przepływ nerkowy i filtracja kłębuszkowa spadają
  - ADH i aldosteron zatrzymują wodę i sód
  - przejściowy białkomocz wysiłkowy (zjawisko niegroźne)
  - nerki pomagają przywracać równowagę kwasowo-zasadową po wysiłku (wolniej niż oddech)

### Kostny (`kostny`)
- **Struktury:** cały szkielet; wyróżnione kości kończyny dolnej, miednica i kręgosłup.
- **Sprint:**
  - siły reakcji podłoża przy każdym lądowaniu to wielokrotność masy ciała (w sprincie więcej niż w truchcie)
  - kości jako dźwignie dla mięśni
- **Adaptacja długoterminowa** (gęstość kości): tylko jako informacja „po tygodniach treningu”, z oznaczeniem.
- **Uwaga:** szkielet jest już kontekstem na innych planszach. Tu staje się układem aktywnym, więc potrzebuje własnego koloru, a nie koloru kości kontekstowej.

### Limfatyczny i odpornościowy (`limfatyczny`)
- **Struktury:** węzły chłonne, przewód piersiowy, śledziona, grasica, migdałki.
- **Sprint:**
  - leukocytoza wysiłkowa: adrenalina mobilizuje m.in. komórki NK do krwi
  - po wysiłku liczba komórek spada poniżej wartości wyjściowych
  - przepływ limfy rośnie dzięki pompie mięśniowej
- **Uwaga:** teza o „otwartym oknie” na infekcje po wysiłku jest sporna. Tylko z etykietą `contested_debate`.

### Rozrodczy (`rozrodczy`)
- **Struktury:**
  - męskie z Z-Anatomy / HuBMAP (jądra, prostata)
  - żeńskie z HuBMAP `female/` (macica, jajniki, jajowody, pochwa)
  - Z-Anatomy to model męski, więc plansza potrzebuje dwóch wariantów sylwetki albo dwóch zbliżeń
- **Sprint:**
  - u mężczyzn niewielki, przejściowy wzrost testosteronu po intensywnym wysiłku (znaczenie praktyczne niejasne)
  - u kobiet wpływ fazy cyklu na wydolność i termoregulację: wyniki niejednoznaczne, etykieta `preliminary_human` / `contested_debate`
  - długoterminowo: niedobór energii (RED-S) jako ryzyko przy złym bilansie, nie efekt pojedynczego treningu
- **Uwaga:** temat wrażliwy i najsłabiej związany z pojedynczym sprintem. Spokojny, rzeczowy ton, bez sensacji. Najniższy priorytet.

## 3. Proponowane kolory nowych układów

Dopisek do księgi stylu §2 (`docs/ATLAS_STYLE_BIBLE.md`). W atlasie widać zwykle jeden aktywny układ naraz, więc kolory muszą
się przede wszystkim różnić na planszy „Całość”. Integrator sprawdza je razem przed wdrożeniem.

| Układ | Token | Kolor główny | Jasny | Uzasadnienie |
|---|---|---|---|---|
| Hormonalny | `--sys-endo` | `#E0893A` | `#F2B47F` | pomarańcz; jaśniejszy i bardziej żółty niż ceglaste mięśnie |
| Powłokowy | `--sys-skin` | `#C99A84` | `#E5C3B3` | odcień skóry |
| Pokarmowy | `--sys-digest` | `#A8743A` | `#D2A671` | brąz / karmel |
| Wydalniczy | `--sys-urinary` | `#2E9C9A` | `#7CCFCB` | morska zieleń; ciemniejsza i bardziej zielona niż błękit oddechowego |
| Kostny (aktywny) | `--sys-bone` | `#B9A37E` | `#DCCDAE` | piaskowy; ciemniejszy niż kremowa kość kontekstowa `#D8D1C4` |
| Limfatyczny | `--sys-lymph` | `#45A85A` | `#8FD29C` | zieleń, jak w klasycznych atlasach (limfa = zielony) |
| Rozrodczy | `--sys-repro` | `#D45D9A` | `#EDA1C8` | róż / magenta |

## 4. Źródła modeli

### HuBMAP (pobrane do `atlas_raw/hubmap/`, CC BY 4.0)

| Układ | Pliki |
|---|---|
| Wydalniczy | `VH_M_Kidney_L`, `VH_M_Kidney_R`, `VH_M_Ureter_L`, `VH_M_Ureter_R`, `VH_M_Urinary_Bladder`, `VH_M_Urethra`, `VH_M_Blood_Vasculature_Kidney` |
| Pokarmowy | `VH_M_Liver`, `VH_M_Gallbladder`, `VH_M_Biliary_Tree`, `VH_M_Pancreas`, `VH_M_Ducts_of_Pancreas`, `VH_M_Small_Intestine`, `SBU_M_Intestine_Large`, `VH_M_Blood_Vasculature_Liver`, `VH_M_Blood_Vasculature_Large_Intestine` |
| Limfatyczny | `VH_M_Spleen`, `VH_M_Thymus`, `NIH_M_Lymph_Node`, `3d-vh-m-palatine-tonsil-l/-r` |
| Rozrodczy (M) | `VH_M_Prostate` |
| Rozrodczy (K) | `female/VH_F_Uterus`, `VH_F_Ovary_L/R`, `VH_F_Fallopian_Tube_L/R`, `VH_F_Vagina`, `VH_F_Ligaments_Uterus_Ovaries`, `VH_F_Blood_Vasculature_Uterus`, `VH_F_Pelvis` |
| Kostny | `VH_M_Vertebrae`, `VH_M_Pelvis` (uzupełnienie Z-Anatomy) |
| Powłokowy | `VH_M_Skin` |
| Hormonalny | `VH_M_Pancreas`, `VH_M_Thymus` (reszta gruczołów tylko w Z-Anatomy) |

Uwaga: modele HuBMAP mają inny układ współrzędnych niż Z-Anatomy. Trzeba je dopasować i sprawdzić renderem z nałożonym szkieletem,
tak jak w fazie 1 (wspólny kod dopasowania warto wydzielić przy integracji).

### Z-Anatomy (`atlas_raw/z_anatomy/`, CC BY-SA 4.0)

Spis z 2026-11-25 (`blender/atlas/tools_inventory.py`, wynik w `atlas_raw/z_anatomy/za_inventory.json`, 2952 struktury).
Z-Anatomy zapisuje przynależność do układu jako dodatkowe kolekcje obiektu (np. „Urinary system”), a nie jako podkolekcje.

| Układ | Kolekcja Z-Anatomy | Struktur | Co jest | Czego brak → skąd wziąć |
|---|---|---|---|---|
| Pokarmowy | `Digestive system` | 46 | m.in. żołądek, dwunastnica, okrężnica (wstępująca, poprzeczna, zstępująca, esowata), wątroba (8 segmentów), pęcherzyk, trzustka, gardło, język, zęby, ślinianki | jelito czcze i kręte → HuBMAP `VH_M_Small_Intestine` |
| Hormonalny | `Endocrine glands` | 5 | przysadka (2 płaty), szyszynka, nadnercze, tarczyca | trzustka (w `Digestive system`), grasica (w `Lymphoid system`); brak przytarczyc |
| Wydalniczy | `Urinary system` | 3 | nerka, miedniczka nerkowa, pęcherz moczowy | moczowody i cewka → HuBMAP `VH_M_Ureter_L/R`, `VH_M_Urethra` |
| Rozrodczy (M) | `Genital systems'` | 7 | jądro, najądrze, prostata, pęcherzyk nasienny, ciała prącia | wersja żeńska → HuBMAP `female/` |
| Limfatyczny | `Lymphoid system`, `6: Lymphoid organs` | 33 / 106 | grupy węzłów chłonnych całego ciała, śledziona, grasica, migdałek | naczynia limfatyczne słabe; przewód piersiowy do sprawdzenia |
| Kostny | `1: Skeletal system` | 277 | cały szkielet | nic; HuBMAP `VH_M_Vertebrae` tylko porównawczo |
| Powłokowy | brak | 0 | Z-Anatomy nie ma skóry | HuBMAP `VH_M_Skin` (sylwetka); gruczoły potowe tylko jako schemat w zbliżeniu |

Wniosek: dla układów pokarmowego, hormonalnego, rozrodczego (M), limfatycznego i kostnego Z-Anatomy wystarcza jako główne źródło.
Wydalniczy i powłokowy potrzebują HuBMAP. Rozrodczy (K) opiera się wyłącznie na HuBMAP.

## 5. Kolejność prac (propozycja)
1. **Faza 2:** integracja pięciu układów z fazy 1, w tym wydzielenie wspólnego kodu (import GLB z HuBMAP, dopasowanie, rysowanie `flows`, trzeci widok).
   Bez tego nowe układy kopiowałyby te same rozwiązania.
2. **Faza 1b, część A** (najsilniej związane ze sprintem): hormonalny, powłokowy, pokarmowy, wydalniczy. Cztery sesje równolegle, Opus high.
   Wyjątek: hormonalny na extra, bo łatwo w nim o przesadę naukową.
3. **Faza 1b, część B:** kostny, limfatyczny, rozrodczy. Rozrodczy na extra (temat wrażliwy, dwa warianty płci).
4. **Integracja 1b:** nowe układy w menu atlasu, kolory w `index.css`, warstwy na planszy „Całość”.

Zmiany w kodzie, które trzeba będzie zrobić przy starcie fazy 1b (zadanie integratora, nie agentów układów):
- `src/atlas/types.ts`: dopisać nowe identyfikatory do `AtlasSystemId`
- `src/atlas/plates/index.ts`: nowe wpisy w rejestrze (z `content: null`)
- `src/index.css`: tokeny kolorów z §3
- `docs/ATLAS_AGENT_BRIEFS.md`: sekcje „Agent 6–12” na wzór obecnych
