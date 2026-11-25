# Kontrola wizualna K2: plansza „Układ krwionośny” v2

Worktree: `.claude/worktrees/atlas-integrator-2ef0c7`. Sprawdzone pliki: `public/atlas/krwionosny/{front,detail}_{rest,sprint}.webp`, `anchors.json`, `flows3d.json`, `src/atlas/plates/krwionosny.ts`, skrypt `blender/atlas/plate_krwionosny.py` (tylko odczyt).
Metoda: punkty kotwic i tory strzałek naniesione na rendery (Python + Pillow, rzut tą samą matematyką co `src/atlas/projection.ts`). Do tego automatyczna klasyfikacja pikseli (tętnica / żyła / inne) w renderze sprintu i ocena na powiększeniach. Żadnych plików w repozytorium nie zmieniałem.

Zgodność danych: `anchors` (2D) i `anchors3d` rzutowane kamerą z `anchors.json` różnią się o mniej niż 0,15 px we wszystkich 16 kotwicach. Dane są spójne, a każda rozbieżność wynika z wyboru punktu, nie z błędu rzutu.

Orientacja: widok z przodu, więc prawa strona ciała (−X w Z-Anatomy) jest po lewej stronie obrazu. Wszystkie kotwice naczyń szyi, ramienia i nogi leżą po prawej stronie ciała (lewa połowa obrazu), a łuk aorty i serce po lewej stronie ciała. To się zgadza.

## 1. Kotwice

Widok `front`, obraz 1000×1800 px (1 px ≈ 1 mm). Wyniki są takie same w spoczynku i w sprincie, bo kotwice i kamera są wspólne.

| kotwica | podpis | trafia? | uwaga |
|---|---|---|---|
| `carotid` (474, 294) | T. szyjna wspólna | **blisko, 3 px, ale na złym naczyniu** | Punkt leży na niebieskiej ż. szyjnej wewnętrznej (piksel sprintu 98,111,171). Na tej wysokości żyła przykrywa tętnicę z przodu, a czerwona tętnica wystaje tylko wąskim paskiem 3–4 px przy x≈477–480. Niżej (y≈300–340) t. szyjna wspólna jest wyraźnie widoczna przy x 478–486. Strona ciała się zgadza (prawa). |
| `jugular` (471, 250) | Ż. szyjna wewnętrzna | **blisko, 3–5 px (niepewne)** | Punkt na wysokości zębów i żuchwy, na prawej krawędzi żyły, w miejscu, gdzie krzyżują ją drobne naczynia twarzy (piksel szary 156,154,179, nie naczynie). Żyła biegnie przy x≈463–470. Kilka px dalej w bok (x 451–456) leży druga żyła, prawdopodobnie ż. szyjna zewnętrzna, więc wybór naczynia jest niejednoznaczny. Pod żuchwą (y≈270–295, x 467–478) ż. szyjna wewnętrzna jest czysta i szeroka. |
| `aortic_arch` (518, 374) | Łuk aorty | tak | Środek czerwonego łuku i aorty wstępującej. |
| `heart` (530, 481) | Serce | tak | Przednia ściana komór, lekko w lewo od środka serca, czyli tam, gdzie powinna. Na sercu leżą cienkie naczynia ściany klatki (zob. §3). |
| `brachial` (326, 518) | T. ramienna | tak | Czerwona tętnica po przyśrodkowej stronie kości ramiennej (kość x 286–307, tętnica x 318–326), między żyłami ramiennymi. Anatomicznie poprawnie, prawa ręka. |
| `portal` (493, 584) | Naczynia trzewne (ż. wrotna) | **technicznie tak, wizualnie nie** | Punkt leży na krzywej „Hepatic portal vein” (przygaszony szaroniebieski pasek 114,116,147, taki sam w spoczynku i sprincie, zgodnie z poziomem `dim`). W rzucie z przodu ten odcinek biegnie pionowo, a jego pasek ma ok. 5 px i leży **w całości na jaskrawoniebieskiej ż. głównej dolnej** (x 482–497), tuż obok aorty (x 497–517). Użytkownik zobaczy podpis „Naczynia trzewne – zwężone” wskazujący pełną kolorem ż. główną dolną. Podpis przeczy temu, co widać. |
| `femoral` (427, 960) | T. udowa | tak | Środek czerwonej t. udowej. Żyła udowa leży przyśrodkowo, czyli bliżej środka obrazu, tak jak w rzeczywistości. |
| `saphenous` (440, 1456) | Ż. odpiszczelowa | tak | Niebieska żyła po **przyśrodkowej** stronie goleni (piszczel x≈400–435, żyła x 437–440). Poprawnie. Tor strzałki żylnej biegnie po tej samej żyle. |
| `anterior_tibial` (397, 1527) | T. piszczelowa przednia | tak | Czerwona tętnica bocznie od piszczeli, między piszczelą a strzałką, z żyłami towarzyszącymi po obu stronach. Anatomicznie poprawnie (przód goleni, błona międzykostna). |

Widok `detail` (serce HuBMAP):

| kotwica | podpis | trafia? | uwaga |
|---|---|---|---|
| `d_aortic_arch` (343, 670) | Aorta | tak | Aorta wstępująca, pełna czerwień w sprincie. |
| `d_svc` (203, 753) | Ż. główna górna | tak | Niebieska, po prawej stronie ciała (lewa strona obrazu). |
| `d_pulmonary_trunk` (454, 820) | Pień płucny | tak | Niebieski, bo niesie krew odtlenowaną. Zgodne z konwencją opisaną w `krwionosny.ts`. |
| `d_rca` (197, 1229) | T. wieńcowa prawa | tak | Prawa bruzda wieńcowa. |
| `d_lad` (723, 1351) | Gałąź przednia (LAD) | tak | Bruzda międzykomorowa przednia. Ż. wielka serca biegnie obok (4 px), co odpowiada anatomii. |
| `d_cardiac_vein` (653, 1133) | Ż. wielka serca | tak | Niebieska, w tej samej bruździe. |
| `d_left_ventricle` (774, 1307) | Lewa komora | tak | Lewy dolny brzeg serca (strona ciała lewa). Punkt leży blisko krawędzi, ale na komorze. |

## 2. Strzałki (`flows3d.json` → widok `front`)

Kierunek jest poprawny we wszystkich 4 torach:

| tor | start → koniec (px) | kierunek | na własnym kolorze (≤ 1,5 px / ≤ 4 px) |
|---|---|---|---|
| `artery_leg` | korzeń aorty (519, 441) → grzbiet stopy (429, 1671) | od serca ✔ | 83% / 87% |
| `vein_leg` | grzbiet stopy (433, 1696) → ujście ż. gł. dolnej (485, 498) | do serca ✔ | 89% / 94% |
| `artery_head` | łuk aorty (511, 375) → czaszka (490, 155) | od serca ✔ | 56% / 83% |
| `vein_head` | podstawa czaszki (461, 188) → ż. gł. górna (483, 417) | do serca ✔ | 65% / 73% |

Problemy:
1. **Szyja: tętnica i żyła nakładają się (najważniejsze).** Od y≈240 do y≈300 tory `artery_head` (zielony) i `vein_head` (pomarańczowy) biegną 0–3 px od siebie i krzyżują się. Tor tętnicy na odcinku y 277–294 leży na niebieskiej żyle (do 7 px od czerwieni), bo w 3D t. szyjna wewnętrzna z Z-Anatomy na wysokości z≈1,49–1,53 przechodzi bocznie od żyły. W aplikacji czerwona i niebieska strzałka będą się na siebie nakładać i trudno będzie je rozróżnić.
2. **Korzeń aorty: pętla.** `artery_leg` zaczyna się przy korzeniu aorty, idzie w górę (aorta wstępująca, x 505–519), a potem wraca prawie tą samą linią w dół (aorta zstępująca, x≈519–520). Odcinek y 441–506 biegnie po powierzchni serca, bo aorta zstępująca leży za sercem. W animacji wygląda to jak strzałka idąca w górę i od razu w dół w tym samym miejscu, 10 px od kotwicy „Serce”.
3. **Kolano.** Odcinek y 1217–1376 (t. podkolanowa) biegnie po kości, 9–15 px od widocznego naczynia, bo t. podkolanowa leży za kolanem. Anatomicznie to poprawne, wizualnie strzałka „przeskakuje” przez kość. Do przyjęcia.
4. **Początek `vein_head`** (y 188–211) leży na szczęce i oczodole, do 15 px od widocznej żyły (podstawa czaszki jest schowana za twarzoczaszką). Strzałka żylna zaczyna się więc „na policzku”. Koniec `artery_head` (490, 155) wypada między oczodołami, na nasadzie nosa.
5. Drobne: `vein_leg` przy y 660–760 leży 5–11 px od niebieskiego (prawa t. biodrowa wspólna przykrywa tu ż. główną dolną). Anatomicznie to poprawne. `vein_head` przy y 345–362 jest schowany za obojczykiem.

## 3. Render

- **Kolory.** W sprincie najjaśniejsze piksele tętnic mają ok. (229,63,76) i (217,50,64) przy wzorcu #D93240 (217,50,64), a żył ok. (74,120,228) i (62,111,216) przy wzorcu #3E6FD8. To się zgadza, różnice wynikają z cieniowania. W widoku z przodu kolory są lekko różowawe (np. t. udowa 213,83,99), bo leży na nich półprzezroczysta sylwetka skóry. To akceptowalne. W spoczynku wszystko jest wyraźnie przygaszone: tętnice ok. (157,107,110), żyły ok. (114,116,147).
- **Spoczynek a sprint.** Różnicę widać wyraźnie: nogi, aorta, żyły główne i naczynia płucne w sprincie mają pełny kolor, a szyja, ręce i miednica są stopniowane. Naczynia trzewne i ściany tułowia zostają przygaszone. Detal serca też jest czytelny (przygaszony w spoczynku, pełny w sprincie).
- **Dziury i prześwity.** Drzewo naczyń jest ciągłe, bez szwów. Drobne artefakty:
  - pojedyncza żyła po przyśrodkowej stronie prawej goleni urywa się zaokrąglonym końcem przy (458, 1500);
  - na trzonach obu kości udowych (y≈985–1140) leżą krótkie poprzeczne pary tętnica i żyła („szczeble drabinki”), które urywają się po bokach. Wyglądają na artefakt. Jeśli to tętnice przeszywające, które w rzeczywistości biegną za kością, nie powinny być widoczne na kości z przodu. Do sprawdzenia w Blenderze;
  - w oczodołach widać gęste czerwone „kłęby” (naczynia gałki ocznej), a na skroniach czerwone owalne plamy. Wyglądają jak „krwawe oczy” i odciągają uwagę.
- **Ściana tułowia a serce.** Cienkie, przygaszone naczynia ściany (międzyżebrowe, piersiowe wewnętrzne) tworzą na sercu siatkę pionowych linii (x≈480, 500, 520) i łuków. Serca nie zasłaniają, bo jest czytelne, a kotwica trafia, ale w spoczynku ta „krata” jest wyraźna, bo serce ma podobną jasność. W sprincie przeszkadza mniej.
- Mięsień serca jest brązowo-różowy także w sprincie (domieszka 30%). To celowe (`HEART_MIX`), żeby naczynia wieńcowe się odcinały.

## 4. Wierność anatomiczna (to, co widać)

Wszystko poniżej się zgadza:

- ż. odpiszczelowa biegnie po przyśrodkowej stronie goleni i uda, przed kostką przyśrodkową;
- t. piszczelowa przednia biegnie z przodu, między piszczelą a strzałką, i przechodzi w t. grzbietową stopy;
- t. udowa leży bocznie od żyły udowej;
- t. ramienna leży przyśrodkowo od kości ramiennej;
- ż. główna dolna leży na prawo od aorty;
- ż. szyjna wewnętrzna leży bocznie od t. szyjnej wspólnej;
- pień płucny jest niebieski, a żyły płucne czerwone, zgodnie z opisaną konwencją.

Odchylenie: ż. wrotna z Z-Anatomy w rzucie przednim jest pionowa i leży na ż. głównej dolnej. W rzeczywistości biegnie skośnie w górę i w prawo, do wnęki wątroby.

## 5. Poprawki (co, gdzie)

1. **`carotid`** (`blender/atlas/plate_krwionosny.py`, słownik `A`): przenieść niżej, tam gdzie tętnica nie jest przykryta żyłą, np. `on_vessel("Right common carotid artery", t≈0.35–0.4)`. Cel w 2D ok. (482, 318), czyli u≈0.482, v≈0.177, gdzie tętnica ma 8 px szerokości (x 478–485). Po zmianie sprawdzić, czy piksel jest czerwony.
2. **`jugular`** (to samo miejsce): przesunąć poniżej żuchwy, np. `t≈0.55` (z≈1,486). Cel w 2D ok. (472, 272), czyli u≈0.472, v≈0.151 (żyła x 467–478). Dzięki temu kotwica nie będzie leżała na zębach ani na naczyniach twarzy, a różnica wysokości z `carotid` (≈46 px) zostanie zachowana.
3. **`portal`** (skrypt i ewentualnie `krwionosny.ts`): kotwica nie może leżeć na ż. głównej dolnej. Do wyboru:
   - (a) punkt na naczyniu trzewnym, które w rzucie przednim leży obok żyły i aorty, np. ż. śledzionowa, t. lub ż. krezkowa górna albo koniec ż. wrotnej przy wnęce wątroby (`t≈0.9`, jeśli tam odchodzi w prawo), sprawdzony rzutem na render;
   - (b) zostawić punkt, ale wtedy zmienić `nameLat` i opis, a w UI dać odsuniętą etykietę z linią wiodącą, żeby nie sugerowała ż. głównej.

   Obecny układ jest mylący, bo „zwężone naczynia trzewne” wskazują jaskrawoniebieską żyłę.
4. **Strzałki w szyi** (`FLOW_PATHS` / `al.vessel_path`): rozdzielić tory `artery_head` i `vein_head`. Do wyboru:
   - skończyć `artery_head` na t. szyjnej wspólnej (bez „Internal carotid artery.r”, która krzyżuje żyłę) albo przyciąć ją do z≈1,47;
   - zacząć `vein_head` niżej (od z≈1,50, poniżej żuchwy);
   - w aplikacji przesunąć tory w 2D o kilka px na boki: tętnica przyśrodkowo, żyła bocznie.
5. **Pętla przy korzeniu aorty** (`artery_leg`): w widoku z przodu zacząć tor od szczytu łuku (5. punkt, z≈1,384), żeby strzałka nie szła w górę i w dół po tej samej linii przez serce. Aorta wstępująca jest już i tak pokazana przez `artery_head` (start na łuku). Inna możliwość: przygasić w UI odcinek, który leży za sercem.
6. Drobne:
   - sprawdzić i ukryć poprzeczne „szczeble” na kościach udowych oraz urwaną żyłę przy (458, 1500);
   - przygasić albo ukryć naczynia gałek ocznych i czerwone plamy na skroniach (wyglądają jak „krwawe oczy”);
   - rozważyć dalsze ścieniowanie lub ukrycie naczyń ściany tułowia w prostokącie serca (ok. x 450–600, y 410–530), szczególnie w spoczynku;
   - zakończyć `artery_head` wcześniej, żeby grot nie wypadał na nasadzie nosa.

## Obrazy kontrolne (poza repozytorium)

- Kotwice i tory na całym widoku:
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\marked_front_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\marked_front_rest.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\marked_detail_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\marked_detail_rest.png`
- Powiększenia 4× wokół każdej kotwicy (zestawienia):
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\montage_front_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\montage_front_rest.png`
- Pojedyncze powiększenia: `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\zoom_<widok>_<stan>_<kotwica>.png`
- Regiony z siatką współrzędnych:
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\region_neck_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\region_portal_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\region_portal_rest.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\region_shin_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\region_heart_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\region_heart_rest.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\region_thigh_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\region_head_sprint.png`
- Strzałki w powiększeniu:
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\flows_neck_heart_sprint.png`
  - `C:\Users\piryt\AppData\Local\Temp\claude\02b31e86717e620c\1f8c8df8-cf8f-40ea-8598-8eff271d4e5a\scratchpad\wizualna\flows_knee_sprint.png`
- Skrypty: `mark.py`, `crops.py`, `regions.py`, `classify.py`, `flowcheck.py` w tym samym katalogu.
