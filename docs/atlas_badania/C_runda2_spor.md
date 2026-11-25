# Badacz C, runda 2: spór z A i B

Stan na 2026-11-25. Odnoszę się do `A_runda1_dane_i_wiedza.md` i `B_runda1_architektura_3d.md`. Numery tez (A-T…, B-T…, C-T…) są takie jak w plikach z rundy 1.

## 1. Z czym się nie zgadzam

### Z Badaczem A

**A-T13 + ryzyko 8: model faktu jest dobry na papierze, ale „verified” w tym projekcie nikt naprawdę nie nada.**
Fakt ma u A ok. 15 pól: populacja, protokół, `protocolMismatch`, lokalizator strony, proweniencja, `verifiedBy` i inne. Użytkownik nie jest fizjologiem i sam nie sprawdzi, czy „Tab. 2, s. 412” mówi to, co twierdzi agent. W praktyce `verified` nada drugi agent. Jeśli status będzie się nazywał „verified”, wyjdzie z tego teatr bezpieczeństwa: plakietka obiecuje kontrolę, której nie było.

Kontrpropozycja:
- **Statusy nazwane zgodnie z prawdą:** `draft` → `checked_agent` (drugi agent znalazł cytat i wkleił dosłowny fragment źródła, maks. 1–2 zdania) → `checked_human`. Do aplikacji wystarcza `checked_agent`, ale tylko z polem `quote`. Cytat jest tym, co człowiek może sprawdzić w 10 sekund, nie znając fizjologii.
- **Pola obowiązkowe (8):** `id`, tekst, wartość lub zakres, jednostka, faza, źródło z lokalizatorem i cytatem, poziom dowodów, status.
- Populacja i protokół są obowiązkowe tylko dla liczb. Dla zdań jakościowych są opcjonalne.

A sam przyznaje, że „bez osoby zatwierdzającej system zamieni się w ten sam problem”. Moja odpowiedź to zmniejszyć to, co trzeba zatwierdzać, zamiast udawać, że ktoś zatwierdza wszystko.

**A-T15: druga oś („skąd liczba”) nie może być drugą plakietką w interfejsie.**
Dwie równoległe plakietki przy każdej liczbie łamią zasadę spójności (coherence, d=0,70; [Mayer 2017](https://onlinelibrary.wiley.com/doi/10.1111/jcal.12197)). Laik nie odróżni „konsensusu podręcznikowego” od „prawdopodobnego mechanizmu”. W danych obie osie zostają. W interfejsie jest jedna plakietka poziomu (tekst + kształt), a proweniencja trafia do linii źródła („Kenney 2022, podręcznik”).

**A-T10 w części „pokazać z etykietą `model_simulation`”: liczb z Pulse nie pokazujemy w ogóle.**
A sam podaje, że przy wysiłku Pulse ma 33 złe porównania walidacyjne i nie był walidowany dla 30 s all-out. Liczba na ekranie, nawet z etykietą, zostanie odczytana jako pomiar. Pulse ma być tylko kontrolą spójności przy biurku. Na ekran trafiają wyłącznie liczby z literatury.

**A-T9: ciągła oś czasu z interpolacją „jako ilustracja” odpada w atlasie.**
Krzywa narysowana między dwoma punktami wygląda jak dane. Pokazujemy punkty w fazach. Ciągłe krzywe zostają w filmie (`PhysiologyEngine`), gdzie i tak już są.

### Z Badaczem B

**B-T1 / B-T3 / B-T4: prawdziwe 3D w przeglądarce to drogi drugi silnik, a jego zysk dydaktyczny jest nieudowodniony. Ciężar dowodu leży po stronie B.**
Warstwa L3 to sporo pracy dla agentów, a użytkownik nie przeczyta ani linijki tego kodu:
- własny shader;
- `DataTexture` ze stanem;
- osobny przebieg do wybierania struktur (pick pass);
- przekroje;
- sortowanie przezroczystości;
- LOD na urządzenie.

Budżety telefonu (≤6 MB, ≤400 tys. trójkątów) B sam opisuje jako niezmierzone. Zysk z 3D po korekcie jest nieistotny ([Wang 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11055294/)). Obracanie wręcz szkodzi osobom o słabej wyobraźni przestrzennej ([RCT 2023](https://www.mdpi.com/2227-7102/13/10/992)). Do tego dochodzi czytelność: podpisy nad canvasem 3D na ekranie 375 px mają ten sam problem co dzisiejszy SVG, a do tego się ruszają.

Kontrpropozycja to **etap pośredni: obrót z klatek (turntable)**, jak w [Primal Pictures](https://www.anatomy.tv/static/atvhelp/atlas/gettingstarted/pdfs/UserGuide-HTML5-ATLAS-ATV.pdf):
- 24 klatki na stan, wypiekane w tym samym przebiegu Blendera co plansze;
- kotwice rzutowane dla każdej klatki przez istniejące `_project`;
- na telefonie klatki 600 px po ok. 40 kB, czyli ok. 1 MB na stan;
- zero shaderów i zero nowej zależności.

Prawdziwy GLB powstaje dopiero, gdy test z 2–3 osobami pokaże, że obrót z klatek nie wystarcza.

**B-T7 (przekrój) i ghosting z wyborem dowolnej struktury: to „atlas dla atlasu”.**
Żadne pytanie o sprint nie wymaga cięcia ciała płaszczyzną. Wygaszanie kontekstu już mamy, bo kontekst jest neutralny w renderze. Proponuję wykreślić przekrój z planu, a nie tylko przesunąć go na etap 5.

**B-T5: „aktywność 0–1 per struktura” grozi fałszywą precyzją.**
Dla kilku mięśni są dane EMG. Dla węzłów chłonnych, kości czy skóry nikt nie zmierzył „aktywności 0,7”. Shader chętnie przyjmie każdą liczbę, więc zacznie się kolorowanie pod tezę (moje C-T13). Warunek: poziom aktywności jest faktem A ze źródłem albo ma jedną z trzech wartości jakościowych (`kontekst`, `pracuje`, `zmiana mierzona`) i jest opisany jako schemat.

## 2. Co przyjmuję i jak to zmienia mój model

1. **Fazy od A (A-T8, A-T9) przyjmuję, i to jest moja główna korekta.** Moja teza C-T3 („pokaż różnicę spoczynek → sprint”) przy dwóch stanach wprowadzałaby w błąd, bo mleczan i hormon wzrostu szczytują *po* serii. Przełącznik dostaje **trzy momenty**: `Spoczynek | Koniec sprintu | 2–3 min po` (= `rest`, `hiit_peak`, `active_recovery`). Do tego dochodzi tryb „Co się zmieniło”. Każda liczba ma dopisek „kiedy”. Sześć faz `WorkoutPhaseId` zostaje w danych, a nie w przełączniku.
2. **Graf przyczynowy A (A-T16) to szkielet mojego przewodnika.** Kroki przewodnika „Jeden interwał” i plansze „Łańcuchy” to ścieżki w grafie uporządkowane według opóźnienia krawędzi. Krawędź bez faktu nie pojawia się w opowieści.
3. **Reguły narracji A-T14 i moje C-T11 to ta sama reguła.** Uzgadniamy jeden walidator: zdanie z faktu, który nie jest `established_human`, musi zawierać frazę z drabiny sformułowań.
4. **Wspólne ID struktury (A-T1, B-T2) przyjmuję.** Dopiero ono umożliwia moją mechanikę telefonu: dotknięcie pinezki ↔ wiersz listy.
5. **Przepływy jako krzywe w metrach (B-T6) przyjmuję.** Mój zarzut („to dla 3D”) upada, bo krzywe przydają się też w 2D i przy obrocie z klatek: każdy nowy widok czy klatka dostaje strzałki za darmo.
6. **Wspólny plik palety (B-T5) i walidator (B-§3).** Dokładam warunek: walidator sprawdza symulację zaburzeń widzenia barw (deuteranopia, protanopia) dla par kolorów pokazywanych razem i odrzuca pary z ΔE < 15.
7. **Plansza 2D domyślnie, limit ok. 10 podpisów, AI jako kontrola wizualna (B-T1, B-T8, B-§4).** Zgoda pełna. B przewidywał, że będę chciał 3D na start i generatywnego wideo. Nie chcę ani jednego, ani drugiego.
8. **Nazwy podwójne (A, spór 6).** Główną nazwą jest polska anatomiczna, mała łacina pod nią. Nazwa potoczna pojawia się tylko tam, gdzie anatomiczna nic laikowi nie mówi („m. płaszczkowaty (łydka)”).

## 3. Stanowisko końcowe (po korekcie)

1. **Główną ścieżką jest przewodnik „Jeden interwał”, zbudowany z grafu przyczyn A.** Plansze układów to indeks i miejsce eksploracji.
2. **Trzy momenty zamiast dwóch stanów:** spoczynek, koniec sprintu, 2–3 min po. Do tego tryb „Co się zmieniło”, a przy każdej liczbie informacja, *kiedy* ją zmierzono.
3. **2D domyślnie, potem obrót z klatek, a prawdziwe 3D dopiero po teście z ludźmi.** Przekrój i wybór dowolnej z 4500 struktur wykreślamy.
4. **Telefon jest pełnoprawny:** tekst w HTML ≥ 14 px, numerowane pinezki i lista na dole ekranu, obsługa dotykiem i fokusem. Dzisiejsze 6 px to usterka do naprawy przed nowymi układami.
5. **Kolor nigdy sam.** Każdy układ ma ikonę i nazwę, a walidator sprawdza ΔE w symulacji zaburzeń widzenia barw. Kolor powłokowego albo kostnego trzeba zmienić.
6. **AI tylko przy biurku, z faktów.** Walidator wymaga `factIds`, cytatu źródła i frazy z drabiny dowodów. W aplikacji nie ma czatu generatywnego, a liczb z symulatora (Pulse) nie pokazujemy.
7. **Uczciwe statusy:** `checked_agent` z dosłownym cytatem wystarcza do publikacji, a `checked_human` jest opcjonalny. Żadnego „verified” bez człowieka.
8. **Kostny, rozrodczy i limfatyczny to karty bez wymuszonych stanów.** Poziom „aktywności” w kolorze tylko ze źródła albo w trzech jakościowych stopniach.

## 4. Pytania rozstrzygające dla użytkownika

1. **Dla kogo jest atlas:** dla ciebie i laików ciekawych sprintu czy dla studentów (AWF, medycyna)? Od tego zależy, ile 3D i ile anatomii szczegółowej warto budować.
2. **Czy „obrót z gotowych klatek” (jak w Primal Pictures) spełnia twoje marzenie o „atlasie 3D”?** Czy chodzi ci o swobodne kręcenie modelem i zdejmowanie warstw jak w BioDigital?
3. **Kto zatwierdza fakty?** Czy akceptujesz zasadę „drugi agent znajduje dosłowny cytat i tak to oznaczamy”? Czy chcesz sam przeglądać arkusz faktów (np. 10 minut na układ)?
