# Badacz C, runda 1: UX, narracja i dydaktyka

Rola: adwokat użytkownika. Stan na 2026-11-25. Kodu nie zmieniałem. Atlas obejrzałem na żywo (`#atlas`, plansza mięśniowa, 1440 px i 375 px) i zmierzyłem go skryptem w przeglądarce.

## 0. Co widać dziś (punkt wyjścia)

- **Na telefonie podpisy są nieczytelne.** Plansza to jeden SVG skalowany razem z renderem. Przy szerokości 375 px nazwa struktury ma ok. **8 px**, a opis roli ok. **6 px** (pomiar: skala SVG 0,214 × font 38/29). Na desktopie 1440 px jest to ok. 15 i 11 px, czyli na granicy.
- **Wyróżnianie podpisu działa tylko po najechaniu myszą.** Na dotyku i z klawiatury go nie ma, bo podpisy nie są fokusowalne.
- **Poziom dowodów pokazuje tylko kolorowa kropka** (z `title`). To łamie WCAG 1.4.1, bo informacja jest przekazana samym kolorem.
- **Sprint różni się od spoczynku głównie nasyceniem całego ciała.** W sprincie cała muskulatura jest ceglasta, więc oko nie dostaje odpowiedzi na pytanie „co się *zmieniło* najbardziej”.
- **Atlas i film (12 aktów) są dwiema wyspami.** Łączy je jedynie link „← Podróż filmowa”.

## 1. Przegląd wzorców z atlasów 3D

| Produkt | Kluczowe wzorce | Co działa | Co przytłacza / ograniczenia |
|---|---|---|---|
| **BioDigital Human** | Ukrywanie, wygaszanie (fade) i izolowanie struktury; suwak krycia warstw; „Anatomy Explorer” (drzewo + wyszukiwarka); quizy „znajdź strukturę”; rozdziały (chapters); wymowa nazw | Gotowe „widoki” z rozdziałami i własny przycisk quizu. W 2023 przeniesiono narzędzia do jednego paska i schowano zoom/pan, bo **zaśmiecały ekran** ([BioDigital 2023](https://support.biodigital.com/hc/en-us/articles/14772668920215-May-2023-The-new-and-improved-Human-Viewer)) | Studenci bez prowadzenia „mogą być przytłoczeni lub rozproszeni” ([Aland i in. 2023](https://link.springer.com/article/10.1186/s40561-023-00285-3)); wymaga WebGL i szybkiego łącza |
| **Visible Body** (Atlas, Physiology & Pathology) | Wyszukiwanie i dodawanie dowolnej struktury, tagowanie, „Tours” (zapisane sekwencje widoków), quizy z dysekcji 3D, AR, przycisk „Listen” (lektor) | Powiązania „zobacz też” (unaczynienie, unerwienie) i trasy (tours) ([Visible Body](https://www.visiblebody.com/blog/how-does-visible-body-courseware-compare-with-the-biodigital-human)) | Dokładność spada na drobnych strukturach; model stylizowany ([Aland 2023](https://link.springer.com/article/10.1186/s40561-023-00285-3)) |
| **Zygote Body** | Jeden **suwak krycia** zdejmujący warstwy (skóra → mięśnie → kości), wyszukiwarka, sceny z adnotacjami | Najprostszy model mentalny: jeden suwak = głębokość ([zygotebody.com](https://www.zygotebody.com/)) | Pełna orbita dopiero w wersji płatnej; mało dydaktyki |
| **Primal Pictures** (Anatomy.tv) | „3D” to **sekwencje wcześniej wyrenderowanych klatek** (obrót) i **warstwy** (góra/dół), obok tekst i MRI | Dowód, że atlas oparty na renderach z kontrolowanym obrotem jest pełnoprawnym atlasem ([instrukcja Primal](https://www.anatomy.tv/static/atvhelp/atlas/gettingstarted/pdfs/UserGuide-HTML5-ATLAS-ATV.pdf)); wykładowcy oceniali go najwyżej za szczegółowość ([Lee i in. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11102696/)) | Studenci oceniali jego łatwość obsługi najniżej (58/100) |
| **Anatomage** | Stół-kadawer, cięcia, „Complexity Levels: Basic/Intermediate/Advanced”, animacja przepływu krwi i bicia serca | **Jawne poziomy złożoności** ([przewodnik UI](https://hss.washington.edu/wp-content/uploads/sites/12/2025/08/Anatomage-Table-11.0-User-Interface-Guide.pdf)) | Wymaga szkolenia; łatwość obsługi oceniona na 6/10 ([enatom](https://enatom.com/the-best-3d-anatomy-apps/)) |
| **Complete Anatomy / Kenhub** (porównawczo) | CA: 3D, kursy, nagrywanie ekranu. Kenhub: artykuł + wideo + atlas 2D + quiz z powtórkami | Studenci najwyżej cenią **łatwość obsługi**, a wykładowcy szczegółowość ([Lee 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11102696/)) | CA bywa niestabilny wg tych samych studentów |

**Wnioski:**
1. Wszystkie te atlasy są **narzędziami referencyjnymi dla studentów medycyny**, nie opowieściami. Ich siłą jest kompletność, a słabością to, że bez prowadzenia przytłaczają.
2. Najlepsze wzorce warte przeniesienia to: **izolacja i wygaszanie kontekstu** (już je mamy: neutralny szkielet), **trasy (tours) jako zapisane sekwencje**, **jawne poziomy złożoności**, **wymowa/lektor** i **„znajdź strukturę”**.
3. Nie warto przenosić drzewa 3000 struktur, dowolnego dodawania warstw, rysowania, LMS ani AR. To funkcje dla kursu anatomii, nie dla aplikacji o sprincie.

## 2. Tezy

**T1. Jednostką treści atlasu jest zdarzenie sprintu, a nie układ.** Użytkownik nie pyta „pokaż układ wydalniczy”. Pyta „co się dzieje w ciele, kiedy przyspieszam”. Menu 12 układów to wygodny indeks, ale główną ścieżką ma być **jeden interwał** (np. 30 s sprintu + przerwa) podzielony na przystanki. Przy każdym przystanku aktywne są 1–3 układy. Bez tego dostaniemy „atlas dla atlasu”, czyli gorszą wersję BioDigital.

**T2. Swobodna orbita 3D szkodzi laikom o słabszej wyobraźni przestrzennej, więc domyślnie dajemy widoki kluczowe.** Metaanalizy pokazują umiarkowany zysk z 3D: d=0,50 dla wiedzy przestrzennej i 0,30 dla faktów ([Yammine i Violato 2015](https://doi.org/10.1002/ase.1510)). Po wyłączeniu badań z jednego regionu efekt dla wyników testów przestaje być istotny (SMD 0,29, CI −0,19–0,77; [Wang i in. 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11055294/)). Rośnie za to satysfakcja. Co ważniejsze, **obracanie modelu obniża wyniki osób o niskiej zdolności przestrzennej** o ok. 14,5 pkt proc., a przy widoku bez obrotu tego spadku nie ma ([RCT 2023, MDPI](https://www.mdpi.com/2227-7102/13/10/992)). Podobnie wyszło u [Huka (2006)](https://doi.org/10.1111/j.1365-2729.2006.00180.x) i [Ackermana/Wainmana](https://anatomypubs.onlinelibrary.wiley.com/doi/10.1002/ase.2057). Nasz użytkownik to laik, więc domyślnie: 2–4 widoki kluczowe i ewentualnie **obrót „na szynie”** (jak sekwencje Primal), nigdy wolna kamera na starcie.

**T3. Pokazujemy różnicę, a nie tylko stan.** Najtańszą skuteczną zasadą Mayera jest **sygnalizacja** (d=0,46, [Mayer 2017](https://onlinelibrary.wiley.com/doi/10.1111/jcal.12197)). Proponuję trzeci przełącznik obok „Spoczynek / Sprint”, czyli **„Co się zmieniło”**: struktury, które zmieniły się najbardziej, są w pełnym kolorze, a resztę wygaszamy. W panelu każda liczba ma strzałkę ↑/↓ i krotność („×3”), a nie tylko parę liczb.

**T4. Animacja ma sens tylko wtedy, gdy uczymy się samej zmiany.** Animacje wygrywają ze statycznym obrazem średnio d=0,37. Animacje „reprezentacyjne” dają d=0,40, a „dekoracyjne” d=−0,05 ([Höffler i Leutner 2007](https://www.academia.edu/8873433/Hoffler_Leutner_2007)). Zysk pojawia się dopiero wtedy, gdy **cechy zmiany trzeba się nauczyć**; w przeciwnym razie g≈0,04 ([Ploetzner i in. 2020](https://onlinelibrary.wiley.com/doi/full/10.1111/jcal.12476)). Strzałki przepływu (krew, powietrze, impuls) i przenikanie stanów zostają. Odrzucam natomiast kinowe przeloty kamery po atlasie, „oddychające” świecenie i cząsteczki dla ozdoby. Ich miejsce jest w filmie, nie w atlasie.

**T5. „Całość” nie może być warstwą 12 układów naraz.** Ma być **łańcuchem przyczyn** z najwyżej 3 kolorami jednocześnie. Tak zwana teoria DeFT ([Ainsworth 2006](https://doi.org/10.1016/j.learninstruc.2006.03.001)) mówi, że wiele reprezentacji pomaga tylko wtedy, gdy przejścia między nimi są jawnie pokazane. Do tego dochodzi segmentacja (d=0,70, Mayer). Przykład łańcucha: „mózg → nerw współczulny → nadnercza (adrenalina) → serce ↑ → przepływ: mięśnie ↑, jelita ↓”. Każdy krok to osobny ekran z jednym zdaniem.

**T6. Paleta 12 układów nie działa dla osób z zaburzeniami widzenia barw, więc kolor nigdy nie może być jedynym nośnikiem informacji.** Zasymulowałem paletę z księgi stylu i propozycji (macierze Machado, odległość ΔE w przestrzeni Lab):
- deuteranopia: **mięśniowy / pokarmowy / tętnice** dają ΔE 0–2, czyli są nierozróżnialne; wydalniczy/rozrodczy ΔE 7;
- protanopia: powłokowy/kostny ΔE 6, mózg/żyły 8;
- tritanopia: wydalniczy/limfatyczny ΔE 6;
- **nawet przy normalnym widzeniu** powłokowy (#C99A84) i kostny (#B9A37E) dają tylko ΔE 13, a kostny aktywny ma ΔE 22 od kości kontekstowej.

Kontrast wobec tła #070B14 jest wszędzie ≥ 4,2:1, więc WCAG 1.4.11 jest spełnione. Problemem jest **1.4.1** ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)). Wnioski: (a) każdy układ dostaje **ikonę-glif i nazwę** obok koloru; (b) na planszy aktywne są naraz najwyżej 3–4 kolory; (c) kolor powłokowego lub kostnego trzeba zmienić (np. kostny jako chłodny kość-błękit albo biel z obrysem); (d) poziom dowodów pokazujemy **tekstem i kształtem**, nie samą kropką.

**T7. Na telefonie podpisy muszą wyjść z obrazu.** Na telefonie podpis wygląda tak: numerowana pinezka na strukturze plus **arkusz dolny** z listą. Dotknięcie pinezki podświetla wiersz, dotknięcie wiersza podświetla strukturę. Tekst ma min. 14 px i jest w HTML, a nie w skalowanym SVG. Hover zastępujemy dotykiem i fokusem. Przełącznik stanu jest przyklejony w strefie kciuka. To nie kosmetyka: dziś 6-pikselowy tekst czyni telefon praktycznie bezużytecznym.

**T8. Domyślne wejście to przewodnik, a wolna eksploracja przychodzi po nim.** Swoboda pomaga osobom, które już coś wiedzą, a początkującym szkodzi (efekt odwrócenia ekspertyzy, [Kalyuga i in. 2003](https://doi.org/10.1207/S15326985EP3801_4)). Mayer: zasada wstępnego zapoznania z pojęciami (pre-training, d=0,46) i segmentacji. Przewodnik „Jeden interwał” trwa ok. 90 s, ma 6–8 kroków, przycisk „Dalej” i zawsze widoczne „Pomiń, chcę sam”. Powracający użytkownik ląduje od razu w planszach (pamiętane w `localStorage`).

**T9. Lektor tak, ale tylko nagrany wcześniej, nigdy syntezowany w trakcie działania. Napisy włącza się na żądanie.** Zasady modalności (d=0,72) i redundancji (d=0,87; [Mayer 2017](https://onlinelibrary.wiley.com/doi/10.1111/jcal.12197)) mówią: grafika z głosem działa lepiej niż grafika z tym samym tekstem na ekranie. WCAG 1.2.2 wymaga jednak, żeby napisy były dostępne, więc są przełącznikiem. Darmowe lokalne TTS po polsku:
- **Kokoro nie ma polskiego** ([porównanie](https://promptowy.com/syntezator-mowy/), [lipowczan.pl](https://brain.lipowczan.pl/AI/KNOWLEDGE/INFO/TTS-Engines-Comparison-(Polish)));
- **Piper** ma głosy pl_PL: gosia, mc_speech, darkman i inne. Działa na CPU, ale myli się na trudnych słowach (24–32% błędów na łamańcach) i źle czyta skróty („godz.” jako „goc”).
- Część głosów Pipera wywodzi się z modelu Lessac, a nagrania Lessac mają licencję niekomercyjną ([raport loudness.ai](https://loudness.ai/assets/research/piper-voices-v1/LA-RB-2026-003-en.pdf)). Licencję trzeba sprawdzić dla każdego pliku głosu z osobna.
- **XTTS-v2** jest najlepszy wśród lokalnych, ale jego licencja (Coqui Public Model License) jest niekomercyjna.

Nazwy łacińskie, skróty i jednostki („VO₂max”, „mmol/L”) **zawsze** wymagają osobnego pola tekstu „do czytania” (projekt już ma `*TtsPl`). Każde nagranie odsłuchuje człowiek. Obecne nagrania z głosami pl-PL-MarekNeural/ZofiaNeural pochodzą od Microsoftu, więc trzeba wyjaśnić, na jakich warunkach można je rozpowszechniać.

**T10. Generatywny czat „zapytaj atlas” w trakcie działania aplikacji to zły pomysł. AI pracuje przy biurku autora, nie przy użytkowniku.** Częstość halucynacji w edukacji zdrowotnej: 61% odpowiedzi, a przy prośbach o źródła 97% ([Farajalla i in. 2026](https://pmc.ncbi.nlm.nih.gov/articles/PMC13769848/)). Przy pytaniach anatomicznych od 23 do 48% odnośników jest zmyślonych ([Ülkir i Paslı 2026](https://doi.org/10.1002/ca.70187)). Do tego budżet jest zerowy, a model w przeglądarce po polsku jest słaby. Mój model:
- **czas tworzenia:** AI pisze szkice narracji i podpisów *wyłącznie* z bazy zatwierdzonych twierdzeń. Każde zdanie wskazuje identyfikator twierdzenia, a zdanie bez niego jest odrzucane. Potem weryfikuje człowiek albo drugi agent;
- **czas działania:** „Zapytaj atlas” to wyszukiwarka (fuzzy) po zatwierdzonych twierdzeniach i gotowych odpowiedziach FAQ (wygenerowanych wcześniej i sprawdzonych). Nie da się w niej dostać nowego, niesprawdzonego zdania.

**T11. Poziom dowodów musi być słyszalny w samym języku, nie tylko widoczny na plakietce.** Stała drabina sformułowań przypisana do `EvidenceLevel`:
- `established_human`: „U ludzi dobrze wiadomo, że…”
- `probable_human`: „Najpewniej…”
- `preliminary_human`: „Pierwsze badania sugerują…”
- `animal_model`: „U zwierząt zaobserwowano…; u ludzi tego nie wiemy”
- `contested_debate`: „Naukowcy się spierają, czy…”

Lektor i AI-autor muszą jej używać. Sprawdzi to automat: zdanie z twierdzenia `animal_model` bez frazy „u zwierząt” nie przechodzi.

**T12. Zamiast systemu quizów robimy „przewidź, zanim zobaczysz”.** Ćwiczenie przypominania (retrieval practice) ma solidny efekt (ok. g=0,5; Adesope i in. 2017, *Review of Educational Research*). Generatywne zadania to osobna grupa zasad Mayera ([Mayer 2024](https://link.springer.com/article/10.1007/s10648-023-09842-1)). Przed przełączeniem na sprint pada jedno pytanie: „Przepływ krwi przez jelita: ↑ czy ↓?”. Potem odsłona i jedno zdanie wyjaśnienia. Koszt jest prawie zerowy, a efekt większy niż przy quizie z nazw łacińskich, którego laik nie potrzebuje.

**T13. Nie każdy układ zasługuje na planszę „spoczynek ↔ sprint”, a wymuszona symetria produkuje fałszywe różnice.** Kostny i rozrodczy nie zmieniają się *widocznie* w jednym sprincie. Rendery „sprint” byłyby kolorowaniem pod tezę. Proponuję dla nich **kartę informacyjną**: jeden render, jedno zbliżenie, uczciwy napis „w pojedynczym sprincie: brak widocznej zmiany; liczy się po tygodniach”, link do Aktu XII. Limfatyczny dostaje kartę z sekcją `contested_debate`. Pełne plansze ze stanami należą się hormonalnemu, powłokowemu i pokarmowemu z wątrobą (redystrybucja krwi i cykl Cori). Wydalniczy jest na granicy.

**T14. Poziomy szczegółu: atlas robi dwa (ciało, narząd), a resztę oddaje filmowi.** Skala ciało → narząd → tkanka → komórka → cząsteczka już istnieje w 12 aktach (sarkomer, mitochondrium, synapsa). Atlas ma przy podpisie link „Zobacz w środku → Akt IV, 03:12” z wejściem w odpowiedni moment filmu. Budowanie osobnej skali molekularnej w atlasie dublowałoby film.

## 3. Proponowany model doświadczenia

```
Wejście (#atlas)
 ├─ [domyślnie, pierwszy raz] PRZEWODNIK „Jeden interwał” (~90 s, 6–8 kroków)
 │     oś czasu: 0 s ─ start ─ 10 s ─ 30 s koniec sprintu ─ przerwa ─ 90 s
 │     krok = { czas w interwale, 1–3 układy, 1 zdanie lektora, 1 wyróżnienie, [przewidź?] }
 │     np. 0–5 s  mózg → nerwy → mięśnie (start ruchu)
 │         5–15 s nadnercza: adrenalina → serce, oddech ↑
 │         15–30 s redystrybucja krwi: mięśnie ↑, jelita/nerki ↓, skóra ↑
 │         30 s+  mleczan → wątroba (Cori), pot, powrót tętna
 │     [Pomiń, chcę sam]  [Napisy]  [Lektor wł./wył.]
 │
 ├─ PLANSZE (obecny tryb, rozbudowany)
 │     menu w 4 grupach według roli w sprincie (zamiast 12 równych kropek):
 │       Sterowanie: Mózg, Nerwowy, Hormonalny
 │       Napęd: Mięśniowy, Kostny*
 │       Zaopatrzenie: Oddechowy, Krwionośny, Pokarmowy i wątroba
 │       Równowaga: Powłokowy (ciepło), Wydalniczy, Limfatyczny*
 │       Inne: Rozrodczy*                      (* = karta bez stanów)
 │     przełącznik: Spoczynek | Sprint | Co się zmieniło
 │     podpis → „powiązane”: inne układy w tym samym łańcuchu, „Zobacz w filmie”
 │
 ├─ ŁAŃCUCHY („Całość”): 4–6 gotowych łańcuchów przyczyn, maks. 3 kolory naraz
 │
 └─ ZAPYTAJ ATLAS: wyszukiwarka po zatwierdzonych twierdzeniach i FAQ (bez generowania)
```

**Adres jest stanem:** `#atlas/<uklad>/<stan>/<krok>`, więc da się podlinkować z filmu i udostępnić.

**Telefon:** jeden widok naraz (przesunięcie palcem przód/tył), pinezki z numerami, arkusz dolny, przełącznik stanu na dole.

**Desktop:** obecny układ trzech kolumn, ale podpisy w HTML-owej nakładce (lub SVG z minimalnym rozmiarem fontu).

**Dostępność (minimum):**
- podpisy jako lista w DOM, którą czytnik ekranu czyta w kolejności;
- `prefers-reduced-motion` zatrzymuje strzałki i przenikanie;
- fokus widoczny na pinezkach;
- poziom dowodów opisany tekstem;
- polskie nazwy jako główne, łacina wtórna i dla czytnika oznaczona `lang="la"`;
- spacja jako skrót nie może przewijać strony ani przechwytywać fokusu przycisków.

**Polskie nazwy:** „Układ hormonalny (dokrewny)”, „Skóra (układ powłokowy)”, „Układ moczowy” zamiast „wydalniczy”. „Wydalniczy” to termin szkolny, ale nieprecyzyjny, bo wydalają też płuca i skóra. Warto zapytać A.

## 4. Czego oczekuję od pozostałych i gdzie przewiduję spór

**Od Badacza A (ontologia i fizjologia):**
- Model danych na poziomie **twierdzenia**, nie układu: `claimId`, poziom dowodów, źródło, **okno czasowe w interwale** (s od startu), układy, struktury (kotwice), kierunek i krotność zmiany, tekst do wyświetlenia i tekst dla TTS. Bez osi czasu przewodnik nie powstanie.
- Lista 4–6 łańcuchów przyczyn z literatury, z poziomem dowodów każdego ogniwa.
- **Przewidywany spór:** A będzie chciał kompletności (ontologie typu FMA/Uberon, więcej struktur i liczb). Ja stawiam limity: **6–10 podpisów i najwyżej 4 liczby na planszy**, a reszta trafia do „więcej” (zasada spójności, coherence, d=0,70). Ontologia może być pełna w danych, ale nie na ekranie.

**Od Badacza B (3D i silnik):**
- Gwarancja czytelnych podpisów przy 375 px, stan w URL, `prefers-reduced-motion`, budżet wydajności na średnim telefonie.
- **Przewidywany spór:** B może proponować pełną scenę R3F z wolną orbitą i warstwami jak BioDigital. Moje stanowisko: domyślnie **rendery i widoki kluczowe** (ewentualnie obrót po szynie: 24–36 klatek albo GLB z zablokowaną kamerą), a wolna orbita najwyżej jako tryb „dla zaawansowanych”. Dowody są w T2. Nowe układy dostają statyczne rendery szybciej i taniej, co przy budżecie zerowym ma znaczenie.
- Drugi spór: „Całość” jako jedna scena 3D ze wszystkimi układami. Uważam, że to piękny zrzut ekranu i słaba dydaktyka (T5, T6).

## 5. Ryzyka i niewiadome

1. **Nie znamy użytkownika.** Nie wiem, czy to laik-sportowiec, student AWF czy sam autor. Od tego zależy T2 i T8. Proponuję jedno pytanie do użytkownika projektu przed rundą 3.
2. **Dowody o 3D dotyczą studentów medycyny i anatomii statycznej,** nie fizjologii wysiłku u laików. Przenoszę je ostrożnie. Zysk z 3D jest niepewny (duża heterogeniczność, I² > 90%).
3. **Licencje głosów:** Piper (pochodzenie Lessac), XTTS (niekomercyjna), obecne głosy Microsoftu. Każdy plik trzeba sprawdzić, zanim aplikacja zostanie upubliczniona.
4. **Jakość polskiego TTS:** na nazwach łacińskich i liczbach syntezatory się mylą. Bez odsłuchu przez człowieka lektor obniży wiarygodność.
5. **Drabina sformułowań (T11)** może brzmieć monotonnie. Potrzeba 2–3 wariantów na każdy poziom.
6. **Paleta:** symulacja ΔE to przybliżenie (macierze Machado, ΔE76). Trzeba ją potwierdzić emulacją w DevTools na prawdziwych renderach, bo cieniowanie zmienia odcienie.
7. **Rozrost zakresu:** największym ryzykiem jest dobudowywanie funkcji BioDigital (drzewo struktur, AR, quizy łacińskie). Test dla każdej funkcji: *czy pomaga zrozumieć, co robi sprint?* Jeśli nie, odpada.
8. **Przewodnik może irytować powracających.** Stąd „Pomiń” i zapamiętanie wyboru. Trzeba to sprawdzić na 2–3 osobach (5-minutowy test „pomyśl na głos”, darmowy).
