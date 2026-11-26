# Raport: BIOGENESIS HIIT pod sprzedaż szkołom

> To ocena techniczna, a nie porada prawna. Przed pierwszą umową ze szkołą warto, żeby prawnik przejrzał: umowę licencyjną (EULA), regulamin, politykę prywatności, prawo cytatu w danych atlasu i nazwę BIOGENESIS.

## CZĘŚĆ A: dla Ciebie

**Werdykt.** Sprzedaż szkołom jest możliwa, bo żaden zasób atlasu nie ma zakazu użytku komercyjnego (NC), a kod opiera się na licencjach MIT, ISC, Apache i Zlib. Dziś sprzedaż blokują dwie rzeczy w filmie: model mózgu i głos lektora. Oba trzeba zrobić od nowa. Do tego potrzebne są dokumenty dla szkół i porządne podpisy źródeł.

**Co BLOKUJE:**
1. **Mózg w filmie** (`brain_macro.glb`). Powstał z wersji v1.2 modelu Allena, a jej warunki zabraniają sprzedaży. Wersja v1.3 jest już na wolnej licencji CC BY. Plik ma ten sam rozmiar, więc to prawdopodobnie ta sama geometria. Dwa rendery z tym mózgiem też nie mogą trafić do produktu.
2. **Lektor** (68 plików MP3). Nagrania powstały przez darmową usługę „Czytaj na głos” w przeglądarce Edge, a nie lokalnie, jak podaje dokumentacja. Nie znalazłem żadnego dokumentu Microsoftu, który pozwala używać ich komercyjnie. Komercję wprost dopuszcza tylko płatny plan Azure.

**Co jest WAŻNE do poprawy:**
- Brakuje jednego ekranu „Źródła i licencje”. Film nie pokazuje dziś żadnych podpisów źródeł, a widok 3D atlasu nie ma linku do licencji.
- Czcionki ładują się z serwerów Google, więc adres IP każdego ucznia trafia do Google. Dla szkół to problem z RODO.
- W atlasie zapisanych jest 152 dosłownych cytatów z publikacji. Według Twojej decyzji (l) takie cytaty mają być poza produktem.
- Teksty z OpenStax w gablocie serca muszą mieć pełny podpis źródła. OpenStax zastrzega też, że jego książek nie wolno wprowadzać do AI bez zgody.
- Brakuje dokumentów: regulaminu, polityki prywatności, deklaracji dostępności i raportu WCAG.
- Dostępność filmu: skróty jednoliterowe działają w całym oknie i nie ma wersji tekstowej aktów.
- Zgodność z podstawą programową jest opisana dla 7 z 12 układów i sprawdzał ją agent, a nie nauczyciel. Od 1.09.2027 obowiązuje nowa podstawa.
- Film nie działa w podkatalogu ani bez internetu, nie zmierzono go na Chromebookach i nie ma ekranu zastępczego dla telefonu.
- Nazwa BIOGENESIS: w klasie edukacyjnej (41) jest zarejestrowany znak towarowy o tej nazwie (wyszukiwanie wstępne). Nazwa kojarzy się też z aferą dopingową z 2013 r.
- Dokumentacja licencji ma błędy: Allen opisany jako CC BY, lektor jako „lokalny”, GSAP jako „MIT”.

**Co jest OK:**
- Licencje Z-Anatomy (CC BY-SA), HuBMAP (CC BY), PDB, Poly Haven i MakeHuman (CC0).
- Blokada zasobów NC działa.
- Modele własne (proceduralne) i muzyka syntezowana w przeglądarce.
- Brak kont, analityki i ciasteczek.
- Biblioteki kodu bez GPL.

**Co CC BY-SA znaczy w praktyce:**
- Możesz brać pieniądze za dostęp i wymagać logowania szkoły.
- Obrazy plansz i modele 3D zrobione z Z-Anatomy muszą jednak zostać na CC BY-SA. Każda szkoła i każdy uczeń mogą je legalnie kopiować, rozdawać, a nawet sprzedawać.
- Nie wolno szyfrować tych plików, a umowa nie może zakazywać ich kopiowania.
- Wartość handlowa jest więc w aplikacji: kodzie, tekstach, dydaktyce, aktualizacjach i wsparciu. Na same obrazki nie masz wyłączności.

**3 decyzje dla Ciebie:**
1. **Lektor.** Do wyboru: płatny Azure (ok. 17 tys. znaków, czyli według źródeł wtórnych ułamek dolara; potrzebna Twoja zgoda na wydatek), darmowy lokalny Piper (licencję pliku modelu trzeba jeszcze sprawdzić) albo nagranie lektora-człowieka z umową.
2. **Mózg filmu.** Do wyboru: pobrać Allen v1.3 (CC BY, najprostsze; potrzebna zgoda na pobranie) albo poczekać na wynik sprawdzenia Braindera i użyć mózgu Z-Anatomy, który będzie na CC BY-SA.
3. **Nazwa i prawnik.** Czy sprawdzić nazwę w bazach TMview, EUIPO i UPRP (u rzecznika patentowego) oraz kiedy oddać umowę ze szkołą do prawnika.

## CZĘŚĆ B: dla Dyrygenta

| Działanie | Pliki | Priorytet | Kto | Zgoda użytkownika |
|---|---|---|---|---|
| Przebudować brain_macro z v1.3 (porównać sumy kontrolne, DOI hbm929.xkcl.339) albo z mózgu Brainder po wyniku agenta; usunąć renders v2_brain_macro.png i act-08-brain.png | `scripts/fetch_open_assets.py:48-51`, `blender/gen_05_brain_synapse.py:47`, `public/models/brain_macro.glb` | blokujące | Wizualizator | tak (pobranie) |
| Sprawdzić `git fetch` i potem `git branch -r --contains 9868e79`; jeśli commit jest na publicznym GitHubie, zdecydować o czystym repo | historia git | blokujące | Dyrygent | tak |
| Wygenerować lektora od nowa wybraną drogą i dodać w filmie informację „głos syntetyczny” | `scripts/generate_narration.py`, `public/audio/narration/**` | blokujące | integrator | tak (wydatek albo wybór modelu) |
| Ekran „Źródła i licencje” generowany z manifest.json i creditsPl; stały link w atlasie, w widoku 3D, w filmie i w przyszłych gablotach | `src/atlas/AtlasApp.tsx:995-1036`, `src/atlas3d/Atlas3DView.tsx:183-186`, `src/ui/AcademicDrawer.tsx` | ważne | integrator | nie |
| W attribution dodać URI licencji, DBCLS w zapisie CC BY-SA 2.1 JP z linkiem, Brainder i Dundee dla mózgu i układu nerwowego, a dla HuBMAP cytowanie Browne 2020 i opis zmian | `blender/atlas/atlas_export_glb.py:47,194`, `scripts/atlas3d_pack.mjs` | ważne | Wizualizator | nie |
| Czcionki hostować u siebie (@fontsource lub woff2 z plikiem OFL.txt) | `index.html:8-12`, `src/index.css:1` | ważne | integrator | tak (zależność) |
| Usunąć gsap, który nie jest nigdzie używany | `package.json:21`, `vite.config.ts:31` | ważne | integrator | tak (zależność) |
| Krok prebuild z publiczną wersją faktów: bez `quote` (zgodnie z decyzją l), bez `checkedBy` i `auto`; zmienić render cytatu | `src/atlas/plates/index.ts`, `AtlasApp.tsx:185-197`, `src/atlas/data/facts/*.json` | ważne | zespół faktów + integrator | nie |
| Pole `license` w ScientificReferences; pełny podpis OpenStax z „Access for free at…”; wstrzymać automatyczne pobieranie OpenStax przez agentów | `src/science/ScientificReferences.ts`, `src/atlas/data/organs/serce.json` | ważne | zespół faktów | nie |
| Spisać pochodzenie polskich nazw i opisów (własne, podręcznik, Z-Anatomy lub Wikipedia); doprecyzować stopkę „Plansze: CC BY-SA” w sprawie licencji tekstów | `AtlasApp.tsx:1034`, `structures.json` | ważne | zespół faktów | nie |
| Poprawić dokumentację licencji (Allen, „lokalnie”, GSAP, lucide ISC, postprocessing Zlib, BodyParts3D dziś CC BY 4.0) | `docs/LICENSES_AND_ASSETS.md:19-21,49,50`, `generate_narration.py:2`, `NarrationEngine.ts:23` | ważne | Dyrygent | nie |
| Skróty klawiszowe tylko przy fokusie w odtwarzaczu; wersja tekstowa każdego aktu; krótsze, zsynchronizowane napisy | `src/ui/DiegeticHUD.tsx:62-93`, `CinematicTimeline.tsx` | ważne | integrator | nie |
| Ścieżki przez BASE_URL; start na poziomie Low na słabym GPU; ekran zastępczy dla telefonu | `src/core/AssetManager.ts:16-23`, `SimulationCore.ts:203` | ważne | integrator | nie |
| Tabela zgodności z podstawą programową dla 12 układów i 12 aktów, kolumny 2024 i 2027 | `facts/*.json` (curriculum) | ważne | zespół faktów | tak (nauczyciel) |
| Projekty regulaminu, polityki prywatności, deklaracji dostępności i raportu WCAG do oceny prawnika | `docs/` | ważne | Dyrygent | tak |
| Sprawdzić źródło nerwów VIII, gałęzi tętnicy nerkowej i kosteczek słuchowych w Startup.blend; w razie wątpliwości dopisać je do NC_BLOCKLIST | `blender/atlas/atlas_lib.py:102-108` | ważne (niepewne) | Wizualizator | nie |
| Pliki LICENSE i NOTICE oraz LICENSE-ASSETS.txt w public/atlas*; THIRD_PARTY_NOTICES generowany przy buildzie | katalog główny repo, `public/` | drobne (porządek; weryfikacja obaliła wagę „blokujące”) | integrator | tak (plugin) |
| Lokalny dekoder Draco; `__BIOGENESIS_DEBUG__` tylko w trybie DEV; usunąć dopisek o skanie z lokatora Munro | `drei useGLTF`, `src/App.tsx:55`, `kostny.json:16` | drobne | integrator / zespół faktów | nie |

**Poprawki z weryfikacji:**
- Renderów jest 58, nie 63.
- Sześć zbliżeń (oddechowy, wydalniczy i powłokowy, pliki detail) to czysta geometria własna, więc BY-SA nie jest dla nich wymagane.
- Wpieczone schematy dotyczą tylko plansz kostny/detail, hormonalny/detail i limfatyczny/front.
- Commit 2e70625 nie zawiera mózgu v1.2.

**Zależność:** plansze mózg i nerwowy, gablota mózgu i wariant (b) dla filmu czekają na wynik agenta sprawdzającego Braindera.

**Zasady na przyszłość:**
1. **Biała lista licencji.** Dozwolone: CC0, CC BY, CC BY-SA (tylko w osobnym pliku zasobu), MIT, ISC, BSD, Apache-2.0, Zlib, OFL. Zabronione: NC, ND, „Terms of Use”, brak licencji, GPL w bundlu.
2. **Rejestr zasobów** `docs/ASSET_REGISTRY.json`. Dla każdego pliku: źródło z URL i wersją lub DOI, licencja z URI, autor, opis zmian, data sprawdzenia, czy trafia do produktu.
3. **Nowy `check:licencje`** (osobno i w `check:atlas3d`). Kończy się błędem, gdy:
   - plik w public/** nie ma wpisu w rejestrze;
   - licencja jest spoza białej listy;
   - brakuje URI licencji w attribution;
   - w dist są odwołania do zewnętrznych CDN (googleapis, gstatic, unpkg);
   - zależność npm z bundla ma licencję spoza listy;
   - w bundlu są pola `quote` lub `checkedBy`;
   - zasób ze źródła NC lub ND wszedł do gabloty.
4. Nowe pobrania, płatne usługi i zmiany zależności tylko po zgodzie użytkownika w czacie.
5. Geometrii z Z-Anatomy nie scalamy z HuBMAP w jednym GLB, jeśli wynik ma zostać na CC BY.
6. Nie używamy DRM ani szyfrowania zasobów CC, a umowa ze szkołą wyłącza je spod swoich ograniczeń.


---
## Weryfikacja (8 najpoważniejszych)
- [obalone] (zasoby-atlasu) Brak pliku LICENSE/NOTICE rozdzielającego zamknięty kod od zasobów BY-SA/BY: Obniżyć wagę z „blokujące” do „zalecenie (porządek)”. Zmienić „licencja: brak deklaracji” na: „deklaracje są w aplikacji (AtlasApp.tsx:1018-1034, creditsPl w 12 planszach, Atlas3DView.tsx:184-186, pola license i attribution w manifest.json), brak tylko plików LICENSE i NOTICE w repo”. CC BY-SA 4.0 w sekcji 3(a)(2) dopuszcza atrybucję „in any reasonable manner”, więc plik LICENSE nie jest warunkiem użytku komercyjnego.

Realne poprawki:
1) Dodać w stopce widoku 3D link do tekstu licencji, którego wymaga sekcja 3(a)(1)(C).
2) W umowie EULA dla szkół wyłączyć materiały CC spod dodatkowych ograniczeń, zgodnie z sekcjami 2(a)(5)(C) i 3(b)(3).
3) Opcjonalnie dodać LICENSE (kod zastrzeżony) i plik NOTICE ze zbiorczą listą źródeł, dla porządku.
- [potwierdzone] (zasoby-filmu) brain_macro.glb (mózg filmu, akty 2, 8, 10, 12) z HuBMAP VH_Male/v1.2/Allen_M_Brain.glb: Ustalenie jest trafne, ale trzeba w nim poprawić kilka szczegółów.

1. Historia Gita. Commit 2e70625 nie zawiera brain_macro.glb, tylko starszy brain_synapse.glb. Wersja gen_05_brain_synapse.py z tego commitu nie zawiera słów „allen” ani „import_scene”. Plik pochodny od v1.2 jest więc tylko od commitu 9868e79. Ten sam commit dodał też dwa rendery z modelem: blender/renders/v2_brain_macro.png i docs/screenshots/after/act-08-brain.png. Oba też są przeróbkami v1.2 i nie powinny trafić do produktu ani na sprzedaż. Według lokalnych referencji 9868e79 nie jest na żadnej zdalnej gałęzi, a repozytorium origin jest publiczne. Zanim zdecydujecie o czyszczeniu historii, trzeba sprawdzić stan zdalny (`git fetch`, potem `git branch -r --contains 9868e79`). Jeśli commit nie został wypchnięty, wystarczy podmienić plik przed pierwszym wypchnięciem albo wydać czyste repozytorium. Przepisywanie publicznej historii jest potrzebne tylko wtedy, gdy commit już jest na GitHubie.

2. Naprawa (a) jest prostsza, niż wynika z ustalenia. Plik v1.3 istnieje pod adresem `https://cdn.humanatlas.io/digital-objects/ref-organ/brain-male/v1.3/assets/3d-vh-m-allen-brain.glb` (HTTP 200, 11 977 312 B, dokładnie tyle co lokalny v1.2). To prawdopodobnie ta sama geometria, zmieniła się tylko licencja, ale nie sprawdziłem tego bajt po bajcie. Po pobraniu, na które potrzebna jest zgoda użytkownika, warto porównać sumy kontrolne. Potem trzeba przebudować model przez gen_05 i podać źródło v1.3 z jego DOI (https://doi.org/10.48539/hbm929.xkcl.339) i atrybucją CC BY 4.0.

3. Poza docs/LICENSES_AND_ASSETS.md §2 trzeba też zmienić opis "(CC BY 4.0)" w scripts/fetch_open_assets.py:48, bo dziś przypisuje on wersji v1.2 złą licencję.

4. Ogólna plakietka CC BY 4.0 w README repozytorium HuBMAP nie unieważnia wyjątku. Opis DOI v1.2 jest konkretny dla tego narządu i wprost wyłącza go z CC BY.
- [potwierdzone] (zasoby-filmu) Lektor polski: 2×34 pliki MP3 (popular: pl-PL-MarekNeural, academic: pl-PL-ZofiaNeural) + manifest.json: Ocenę komercji („niepewne”) proponuję doprecyzować tak: brak jakiegokolwiek dokumentu przyznającego prawa do nagrań z Edge oznacza, że użytku komercyjnego w obecnej formie nie da się obronić. Klauzula Azure obejmuje tylko płatny plan Azure, więc nie przenosi się na Edge.

Status klauzuli: jej treść potwierdzają dwa niezależne źródła wtórne, w tym moderator Microsoftu w Q&A. Na oficjalnej stronie MCA nie odczytałem jej osobiście, bo dokument jest bardzo duży.

Do opisu ryzyka warto dodać pkt 3.a.vi Microsoft Services Agreement (zakaz obchodzenia ograniczeń dostępu i niedozwolonego scrapingu). Nie sprawdziłem, czy Edge Read Aloud podlega tej umowie.

Do listy rzeczy do poprawienia trzeba dopisać docstring w scripts/generate_narration.py:2 („real local ... narration”), obok LICENSES_AND_ASSETS.md:49 i NarrationEngine.ts:23.

Proponowane drogi naprawy są poprawne. Przy drodze (1), czyli płatnym planie S0, odpowiedź AI w Q&A 6045956 zaleca, żeby nagrania wygenerowane na darmowym F0 wygenerować ponownie na S0. Samo przejście konta na S0 nie zmienia praw do starszych nagrań. To samo dotyczy obecnych MP3 z Edge: trzeba je wygenerować od nowa, a nie tylko zmienić opis. Microsoft wymaga też informacji, że głos jest syntetyczny (Code of Conduct). Przy drodze (2), czyli Piper, nadal nie sprawdzono licencji samego pliku modelu.
- [potwierdzone] (zasoby-atlasu) Rendery plansz 2D (63 pliki webp, w tym schematy BIOGENESIS wpieczone w obraz): Ustalenie wymaga trzech poprawek.

1. Liczba plików to 58 (56 plansz i 2 pliki lokalizatora), a nie 63.

2. Nie wszystkie rendery są utworami zależnymi od Z-Anatomy. Sześć plików ma wyłącznie proceduralną geometrię BIOGENESIS i nie podlega ShareAlike:
   - public/atlas/oddechowy/detail_rest.webp i detail_sprint.webp;
   - public/atlas/wydalniczy/detail_rest.webp i detail_sprint.webp;
   - public/atlas/powlokowy/detail_rest.webp i detail_sprint.webp.
   Właściciel może je zostawić na BY-SA albo objąć własną licencją. Jest jedno zastrzeżenie: wersje, które zostały już gdzieś opublikowane na BY-SA, zostają na BY-SA.

3. Naprawa „schematy jako osobna warstwa SVG” ma sens tylko dla schematów wpieczonych na geometrię Z-Anatomy, czyli kostny/detail, hormonalny/detail i limfatyczny/front. Wymagałaby wtedy ponownego renderu tych plansz bez schematu.

Reszta ustalenia jest poprawna:
- BY-SA dla renderów z Z-Anatomy;
- EULA musi wyłączać te pliki z zakazów kopiowania;
- płatny dostęp jest dopuszczalny, DRM blokujący prawa już nie.
Plansza mózgu czeka na wynik sprawdzenia Brainder.
- [potwierdzone] (zasoby-atlasu) Modele 3D Z-Anatomy dla przeglądarki (za_body, za_staging, _shared/za_muscles, _shared/za_skeleton): Ustalenie jest trafne. Proponowaną naprawę uzupełniłbym o pięć rzeczy.

(a) W attribution brakuje uznania autorstwa BodyParts3D w formie, o którą prosi Z-Anatomy: "BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan". Dziś jest tylko „z BodyParts3D”, bez DBCLS i bez licencji 2.1 JP. Tekst w LIC w atlas_export_glb.py powinien zawierać DBCLS, CC BY-SA 2.1 JP i link https://creativecommons.org/licenses/by-sa/2.1/jp/.

(b) Stopka widoku 3D (Atlas3DView.tsx, linia 185) też powinna mieć klikalne linki do licencji i wzmiankę o DBCLS, tak jak stopka planszy w AtlasApp.tsx. To ważniejsze niż samo pole copyright w GLB.

(c) Pliki GLB i manifest.json są w .gitignore (linie 22–26) i powstają lokalnie, ale trafiają do buildu, bo Vite kopiuje katalog public. Dlatego LICENSE-ASSETS.txt trzeba wygenerować w tym samym kroku: atlas3d_pack.mjs albo kopia w buildzie.

(d) Przy sprzedaży licencji szkołom umowa nie może ograniczać dalszego użycia samych modeli BY-SA (§2(a)(5)(C)), a modele zmienione muszą pozostać na CC BY-SA. Płatny dostęp sam w sobie nie łamie licencji, ale nie zapewnia wyłączności na te modele.

(e) Ryzyko, którego nie sprawdziłem: za_skeleton.glb zawiera kosteczki słuchowe (Malleus, Incus, Stapes). Nie ustaliłem, czy pochodzą z BodyParts3D, czy z modelu ucha Dundee na licencji NC. Lista blokad obejmuje tylko Cochlea i Vestibule, a według rundy 1 spis za_inventory.json nie pokazuje innych siatek NC. Sprawdzałby to plik pochodzenia w .blend.

Zależność do odnotowania: mozg/za_body.glb, a być może też nerwowy, zawiera pracę pochodną modelu Brainder. Jego licencję sprawdza osobny agent, więc ocena komercyjnego użycia mózgu zależy od jego wyniku.
- [obalone] (zasoby-atlasu) Kod aplikacji (React, three.js, shadery) i teksty dydaktyczne plansz i gablot: Podzielić zasób na części:
(1) Kod aplikacji (src/**/*.ts, *.tsx, shadery, bez danych): licencja do wyboru właściciela, także zamknięta, z warunkiem, że do kodu nie trafia geometria ani teksty z Z-Anatomy. Dziś ten warunek jest spełniony.
(2) Własne polskie teksty dydaktyczne (labelPl, notePl, podsumowania, pytania): licencja do wyboru dopiero po spisaniu ich pochodzenia, tylko dla tekstów naprawdę własnych. Przekład lub parafraza definicji z Z-Anatomy albo Wikipedii jest utworem zależnym, czyli CC BY-SA.
(3) Pola „quote” w src/atlas/data/facts/*.json (152 sztuki): to nie są teksty właściciela. Przed komercją przenieść je z danych produktu do dokumentacji kontroli zgodnie z wymogiem (l) pkt 2. W produkcie zostawić odnośnik i lokalizator albo krótki cytat w granicach prawa cytatu (art. 29 ustawy o prawie autorskim; tego nie sprawdzono). Zmienić też render AtlasApp.tsx:195-197.
(4) mesh_bindings.json i rendery plansz z siatkami: CC BY-SA 4.0, zgodnie z ich własną deklaracją.
(5) Ujednolicić stopkę AtlasApp.tsx:1034. Dziś „Plansze atlasu: CC BY-SA 4.0” obejmuje także treść plansz. Trzeba albo zostawić BY-SA dla plansz i ich tekstów, albo napisać wprost, że BY-SA dotyczy obrazów modeli, a teksty i kod mają osobną licencję.
- [potwierdzone] (zasoby-atlasu) Ekran z atrybucjami: stopka plansz, linia w widoku 3D, brak globalnego ekranu licencji: 1) Numery linii: stopka plansz jest w AtlasApp.tsx:995-1036, a nie 950-991.
2) Dla samego atlasu „ważne” jest lekko zawyżone. Panel z „Więcej” i linkami licencji zostaje widoczny obok widoku 3D (aside poza nakładką, 3D tylko na desktopie). Zwinięta sekcja może spełniać §3(a)(2) („any reasonable manner”). Konkretna wada atlasu to linia 3D: nie ma w niej hiperłącza do licencji (§3(a)(1)(C)) ani BodyParts3D © DBCLS (CC BY-SA 2.1 JP), Brainder i Dundee, a do tego ma 12 px.
3) Wagę „ważne” uzasadnia głównie brak jakiejkolwiek widocznej atrybucji w filmie (Allen, HuBMAP i inne, tylko komentarze w kodzie) oraz brak strony zbiorczej. Przy dystrybucji komercyjnej grozi to automatycznym wygaśnięciem licencji (§6(a)).
4) Gabloty (OrganView) jeszcze nie istnieją. Link trzeba dodać, gdy powstaną.
5) Informacja na stronie, że zasoby BY-SA wolno swobodnie kopiować: dobra praktyka, wynika z §2(a)(5)(B) i §3(b)(3) (zakaz dodatkowych ograniczeń). Nie jest to osobno wymagane zdanie.
- [potwierdzone] (zasoby-atlasu) Model sprzedaży: płatny dostęp, logowanie szkół, zabezpieczenia techniczne: To tylko doprecyzowania, nie obalenie.

(a) Do uzasadnienia warto dopisać najmocniejszy dowód. W FAQ CC przy pytaniu „Can I share CC-licensed material on password-protected sites?” jako dozwolony przykład podano wprost stronę ograniczoną do członków szkoły albo do płacących klientów.

(b) Zasoby z Z-Anatomy po konwersji to raczej „Adapted Material”. Obowiązuje wtedy §3(b)(1): adaptacje muszą zostać udostępnione na CC BY-SA 4.0 (lub zgodnej licencji) z atrybucją według §3(a). Paywall tego nie zmienia: płacący odbiorca może legalnie dalej rozpowszechniać te pliki GLB/webp.

(c) Regulamin i umowa licencyjna ze szkołą nie mogą zakazywać kopiowania ani rozpowszechniania zasobów BY-SA. Zakaz kopiowania całej aplikacji wymaga więc wyjątku dla tych zasobów. Kod własny i własne treści można licencjonować osobno.

(d) Zasoby NC (nerka, ucho Z-Anatomy) muszą pozostać wykluczone. FAQ zaznacza, że pobieranie opłat za dostęp do materiałów NC może być niedozwolone.

(e) Dwie rzeczy są poza zakresem tego ustalenia i nadal otwarte: licencja mózgu filmu (Allen v1.2) i pochodzenie mózgu Brainder (sprawdza osobny agent).

(f) Moja niesprawdzona hipoteza: kompresja Draco lub meshopt nie jest ETM, o ile odbiorca może swobodnie dekodować i kopiować pliki. Ta hipoteza wymaga potwierdzenia.

Niezweryfikowane: Mózg Z-Anatomy (zakręty i obszary Destrieux; Brainder, White matter – University of Washington); Nerwy VIII (przedsionkowo-ślimakowy, ślimakowy, przedsionkowy) i gałęzie tętnicy nerkowej z Z-Anatomy; Mózg Allen_M_Brain v1.2 (HuBMAP) – wpis w dokumentacji; cardiopulmonary.glb (serce, naczynia, płuca) z HuBMAP VH_M_Heart, VH_M_Blood_Vasculature_Heart, VH_M_Lung v1.2; Dokumentacja licencji filmu (opis Allen i lektora); gsap 3.12.5 (zależność produkcyjna, nieużywana w kodzie); Czcionki Figtree, JetBrains Mono i Noto Sans ładowane z Google Fonts CDN; Brak zbiorczej informacji o licencjach stron trzecich i błędny opis w dokumentacji; Lektor TTS (edge-tts, głosy pl-PL-MarekNeural i ZofiaNeural): poza wymiarem kodu, sygnał dla innego agenta; Cytaty z OpenStax Anatomy & Physiology 2e w gablocie serca (40 cytatów, około 8 tys. znaków, plus polskie omówienia oparte na tych zdaniach); Zastrzeżenie OpenStax o używaniu podręcznika w LLM i AI (dotyczy sposobu pracy agentów, nie samego bundla); StatPearls (NCBI Bookshelf): 116 odwołań, 63 fakty oparte tylko na StatPearls (anatomia rozrodcza, nerwowa, nerka) i polskie streszczenia summaryPl w rejestrze; Cytaty wysyłane w bundlu, ale niewyświetlane, oraz metadane kontroli (checkedBy, auto, nazwy raportów); Lektor MP3 filmu wygenerowany przez edge-tts (głosy pl-PL-MarekNeural i pl-PL-ZofiaNeural); wymiar audio, odnotowane przy okazji; Google Fonts (Figtree, JetBrains Mono, Noto Sans) ładowane z fonts.googleapis.com / fonts.gstatic.com; Rola RODO, polityka prywatności, umowa powierzenia; Ustawa o dostępności cyfrowej: deklaracja dostępności i raport WCAG 2.1 AA; Skróty klawiszowe filmu (Spacja, H, M, F, strzałki) na całym oknie; Napisy i tekstowa alternatywa dla filmu 3D (12 aktów); Zgodność z podstawą programową biologii (curriculum_ref); Sprzęt szkolny: budżety, poziomy jakości, telefon i tablet; Tryb offline i wdrożenie w szkolnej sieci lub LMS; Lektor wygenerowany przez edge-tts (głosy pl-PL-MarekNeural, pl-PL-ZofiaNeural); Nazwa „BIOGENESIS” (znak towarowy i skojarzenia); Regulamin, umowa licencyjna, zastrzeżenia treści
