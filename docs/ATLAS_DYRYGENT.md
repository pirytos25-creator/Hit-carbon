# Atlas układów: statut Dyrygenta (CEO) i przebieg prac

Ustanowiony 2026-11-25 na polecenie użytkownika. Obowiązuje Dyrygenta i wszystkich agentów, których on uruchamia.

Powiązane dokumenty:
- `docs/ATLAS_MODEL_ARCHITEKTONICZNY.md` (model i decyzje użytkownika, §7)
- `docs/ATLAS_AGENT_BRIEFS_1B.md` (zadania układów, pułapki, lista zadań integratora w §1)
- `docs/ATLAS_STYLE_BIBLE.md` (księga stylu)
- `docs/ATLAS_AGENT_BRIEFS.md` (faza 1 i 2)

## 1. Rola Dyrygenta

Dyrygent to **szef całego przedsięwzięcia (CEO)** i podejmuje decyzje końcowe. Robi cztery rzeczy:
1. Uruchamia agentów.
2. Pilnuje ich w trakcie pracy: audyt po każdej 1/3 pracy.
3. Sprawdza poprawność układów: anatomię, odwzorowanie, dopasowanie modeli, liczby, testy.
4. Na końcu zwołuje zgromadzenie agentów i wydaje werdykt.

**Wolno mu:**
- uruchamiać sesje agentów (`start_session`) i podagentów (`Agent`);
- wysyłać im polecenia (`SendMessage`);
- scalać zaliczone gałęzie do `atlas-uklady` i zatwierdzać scalenia;
- pisać raporty audytu w `docs/atlas_audyt/`;
- uruchamiać build, serwer podglądu i zrzuty;
- zmieniać zakres zadania agenta (np. obciąć widok, który się nie udaje), z uzasadnieniem w raporcie.

**Nie wolno mu:**
- wysyłać czegokolwiek na serwer (`git push`) ani tworzyć PR;
- używać płatnych usług i API, płatnych generacji (np. `generate_3d`) ani pobierać czegoś spoza oficjalnych, darmowych źródeł;
- samemu pisać kodu planszy ani wspólnego kodu: od tego są agenci (wyjątek: rozwiązywanie konfliktów scalania);
- zmieniać decyzji użytkownika z `ATLAS_MODEL_ARCHITEKTONICZNY.md` §7;
- kasować cudzych gałęzi, worktree ani slotów renderu.

**Do użytkownika** Dyrygent zwraca się tylko wtedy, gdy decyzja wykracza poza ten statut (np. zmiana decyzji z §7, koszt, licencja)
albo gdy po 3 rundach poprawek coś nadal nie działa i żadne obcięcie zakresu nie ratuje układu. Pisze wtedy krótko, po polsku, prostym językiem.

## 2. Zespół

| Agent | Forma | Model | Zadanie |
|---|---|---|---|
| **Dyrygent (CEO)** | sesja w głównym checkoutcie, gałąź `atlas-uklady` | Opus | koordynacja, audyty, scalanie, werdykt |
| **Integrator** | sesja we własnym worktree z `atlas-uklady` | Opus, poziom extra | uporządkowanie 5 gotowych układów (§3) |
| **Agenci układów 6–12** | sesje we własnych worktree z `atlas-uklady` (po scaleniu integratora) | Opus; hormonalny i rozrodczy extra, reszta high | `ATLAS_AGENT_BRIEFS_1B.md` §4 |
| **Sprawdzający fakty** | podagent Dyrygenta, za każdym razem nowy (bez wiedzy autora) | Opus | procedura z modelu §3.6 |
| **Kontrola wizualna** | podagent Dyrygenta | Opus | ogląda rendery i zrzuty, porównuje z kotwicami i z listą struktur |
| **Zgromadzenie** | podagenci Dyrygenta (§6) | Opus | przegląd całości przed werdyktem |

Limity:
- najwyżej 4 sesje agentów pracują naraz;
- najwyżej 2 Blendery naraz (sloty `.render_slot_1/2`, zajmowane atomowo, patrz `ATLAS_AGENT_BRIEFS_1B.md` §0).

Porty podglądu:

| Kto | Port |
|---|---|
| Dyrygent | 5189 |
| Integrator | 5190 |
| Agenci układów | 5191–5197 (wg `ATLAS_AGENT_BRIEFS_1B.md` §2) |

Playwright MCP jest wspólny dla sesji, więc nikt go nie używa. Zrzuty robi się przez chrome-devtools MCP albo headless Chrome.

## 3. Etap 1: Integrator porządkuje pięć gotowych układów

Gałęzie do scalenia, w tej kolejności:
1. `refs/heads/claude/atlas-mozg-cb37bf`
2. `refs/heads/claude/atlas-miesniowy-003f70`
3. `refs/heads/claude/atlas-nerwowy-f69b0b`
4. `refs/heads/claude/atlas-krwionosny-48916b`
5. `refs/heads/claude/atlas-oddechowy-ab77df`

Próba na sucho (`git merge-tree`) pokazała konflikty tylko w `src/atlas/plates/index.ts` i `src/science/ScientificReferences.ts`.
To dopiski na końcu tych samych miejsc, więc rozwiązanie polega na **zachowaniu wszystkich wpisów**. Powtórzonych ID źródeł nie ma.

Zakres integratora:
- **A. Scalenie** pięciu gałęzi w jego worktree, build, zrzuty 5 plansz bez regresji.
- **B. Wspólny kod** z `ATLAS_AGENT_BRIEFS_1B.md` §1 (tabele `atlas_lib.py` i `src/atlas/`):
  - `import_glb`, `align_hubmap` z jedną sprawdzoną transformacją;
  - krzywe: `find_curves`, `curve_anchor`;
  - widoki `detail` i `side`, scalanie `anchors.json`, obrys z wierzchołków, kotwice w punktach;
  - role materiałów, `build_silhouette`, słabsze światło;
  - rysowanie `flows`: piksele dziś, a od razu także obsługa `flows3d.json` w metrach przez rzutowanie;
  - proporcjonalne podpisy, przełącznik „Całe ciało / Zbliżenie” (łatka `miesniowy_propozycja_AtlasApp_zblizenie.diff` z folderu notatek sesji),
    strona podpisów przy 2 widokach;
  - nowe ID 7 układów w `types.ts` i `plates/index.ts` (`content: null`);
  - blokada licencji NC (nerka i ucho Z-Anatomy).
- **C. Krwionośny v2:** naczynia kończyn, szyi i głowy z krzywych Z-Anatomy (`atlas_raw/z_anatomy/za_curves_inventory.json`) zamiast rurek.
- **D. Etap E0 z modelu:**
  - nakładka podpisów HTML (≥ 14 px; na telefonie numerowane pinezki i lista; fokus i dotyk zamiast samego najechania);
  - `palette.json` jako jedno źródło kolorów dla Pythona i TS, z walidatorem ΔE (≥ 15 dla par pokazywanych razem, także przy symulacji daltonizmu);
  - ikony (glify) układów;
  - nowy kolor kostnego;
  - poziom dowodów opisany tekstem, `prefers-reduced-motion`;
  - przełącznik poziomu „Podstawowy / Rozszerzony” filtrujący podpisy po `tier` (model §3.5).
- **E. Ponowne rendery** tylko tam, gdzie zmiana wspólnego kodu tego wymaga (światło, materiały). Zawsze najpierw podgląd `ATLAS_QUICK=1`.
- **F. Księga stylu:** kolory 7 układów w §2 i zasady z `ATLAS_AGENT_BRIEFS_1B.md` §0.

Punkty kontrolne integratora:
- **K1** = A
- **K2** = B + C
- **K3** = D + E + F

Równolegle Dyrygent zleca **sprawdzenie faktów 5 gotowych plansz** (model §3.6, z flagą `protocolMismatch` wg §3.7).
Wynik idzie do `docs/atlas_audyt/fakty_<uklad>.md`. Poprawki liczb wprowadza integrator w K3 albo osobny agent, wskazany przez Dyrygenta.

## 4. Etap 2: siedem pozostałych układów

Start dopiero po zaliczeniu K3 integratora i scaleniu jego gałęzi do `atlas-uklady`. Nowe worktree muszą zawierać wspólny kod.
- **Fala A:** hormonalny, powłokowy, pokarmowy, wydalniczy.
- **Fala B:** kostny, limfatyczny, rozrodczy. Startuje, gdy co najmniej dwa układy fali A zaliczą K2, albo wcześniej, jeśli sloty Blendera są wolne.

Treść zadania to szablon z `ATLAS_AGENT_BRIEFS_1B.md` §5 oraz §6 tego pliku: punkty kontrolne i protokół zatrzymania.

**Zmiana 2026-11-25 (polecenie użytkownika):** wszystkie 7 układów (fale A i B razem) startuje od razu po K2 integratora, z gałęzi `claude/atlas-integrator-2ef0c7` (commit `b215139`), równolegle z jego K3; limit 4 sesji naraz zniesiony (Blender nadal najwyżej 2), agenci nie dotykają plików K3 integratora, a zrzuty K3 robią po scaleniu integratora do `atlas-uklady` i `git merge atlas-uklady` u siebie.

## 5. Punkty kontrolne i audyt (co 1/3 pracy)

### Protokół zatrzymania (wpisywany do zadania każdego agenta)

> Pracujesz w trzech częściach. Po każdej kończysz turę raportem zaczynającym się od `PUNKT KONTROLNY K1` (K2, K3) i **czekasz**
> na decyzję Dyrygenta. Nie zaczynaj kolejnej części bez wiadomości „K1 zaliczony, kontynuuj” (itd.).
> W raporcie podaj:
> - ścieżki renderów i zrzutów;
> - listę zmienionych plików (`git diff --stat` względem bazy);
> - listę struktur i ich źródeł;
> - wyniki builda;
> - otwarte problemy.

Części dla agentów układów:
| Punkt | Zakres (ok. 1/3 pracy każdy) |
|---|---|
| **K1** | Wybór struktur (nazwy z `za_inventory.json` / `za_curves_inventory.json`, modele HuBMAP), render dopasowania z nałożonym szkieletem, podgląd `ATLAS_QUICK=1` obu stanów, kotwice. Plan liczb: lista faktów ze źródłami, populacją, protokołem i dosłownym cytatem |
| **K2** | Pełne rendery, `plates/<uklad>.ts` (podpisy `primary`/`secondary`, ≤ 4 liczby podstawowe), `flows3d.json`, dopisane źródła, rejestracja w `index.ts` |
| **K3** | Zrzuty 1440 i 390 px w obu stanach i obu poziomach, build, konsola, raport `<uklad>_RAPORT.md`, commit na własnej gałęzi (bez push) |

### Lista kontrolna audytu Dyrygenta
1. **Zakres plików:** tylko dozwolone pliki (`ATLAS_AGENT_BRIEFS_1B.md` §2). Bez zmian we wspólnym kodzie.
2. **Anatomia i odwzorowanie:**
   - właściwe struktury, właściwa strona ciała, nic nie brakuje i nic nie jest zbędne;
   - dopasowanie HuBMAP potwierdzone renderem z nałożonym szkieletem (błąd w cm podany liczbą);
   - brak obiektów NC.
3. **Obraz:**
   - Dyrygent sam ogląda rendery i zrzuty (narzędzie Read na plikach graficznych);
   - podagent kontroli wizualnej sprawdza, czy każda kotwica trafia w swoją strukturę;
   - kolory wg `palette.json`, brak prześwitów i dziur, różnica spoczynek/sprint czytelna.
4. **Fakty:**
   - nowy podagent sprawdzający fakty, niezależny od autora, wg modelu §3.6;
   - na ekran trafiają tylko fakty `checked_agent`;
   - liczby z innego protokołu mają `protocolMismatch` (§3.7);
   - kolejność w czasie zgodna z literaturą.
5. **Testy:**
   - Dyrygent sam uruchamia `npm.cmd run build` w worktree agenta i robi zrzut strony na swoim porcie;
   - konsola przeglądarki bez błędów.
6. **Dydaktyka:**
   - ≤ 10 podpisów podstawowych i ≤ 4 liczby;
   - język zrozumiały dla licealisty, nazwy szkolne;
   - poziom rozszerzony nie zmienia faktów, tylko dodaje.

**Werdykt** to „zaliczony, kontynuuj” albo lista konkretnych poprawek (co, gdzie, dlaczego).
- Na jeden punkt kontrolny przypadają **najwyżej 3 rundy poprawek**.
- Potem Dyrygent decyduje sam: przyjąć ze znanym problemem opisanym w raporcie, obciąć zakres albo zatrzymać układ.
- Każdy audyt zapisuje do `docs/atlas_audyt/<agent>_K<n>.md`.

## 6. Etap 3: definicja „100%” i zgromadzenie agentów

**100%** oznacza, że jednocześnie:
- 12 plansz (5 + 7) zalicza K3;
- wszystkie gałęzie są scalone do `atlas-uklady`;
- build przechodzi, a konsola jest czysta;
- na ekranie są tylko fakty `checked_agent`;
- zrzuty 1440 i 390 px są dla każdego układu;
- licencje są opisane w stopce i w `docs/LICENSES_AND_ASSETS.md`.

Integracja fazy 1b należy do integratora (druga tura tej samej sesji albo nowa, decyduje Dyrygent):
- menu w 4 grupach ról;
- kolory w `index.css` z `palette.json`;
- przegląd spójności wszystkich plansz.

Gdy 100% jest osiągnięte, Dyrygent zwołuje **zgromadzenie agentów**, czyli podagentów z osobnymi rolami:

| Rola | Patrzy na |
|---|---|
| Anatom-fizjolog | poprawność anatomii i fizjologii |
| Architekt 3D i potoku | spójność renderów, gotowość do etapu 3D (E3) |
| Dydaktyk (laicy i licealiści, dodatki dla studentów) | zrozumiałość, dwa poziomy |
| Strażnik faktów | cytaty, protokoły, poziomy dowodów |
| Strażnik dostępności i licencji | WCAG, daltonizm, telefon, CC BY-SA/BY, NC |

Przebieg:
1. Każdy ogląda całość (zrzuty wszystkich plansz, raporty, audyty) i pisze werdykt z listą problemów według wagi.
2. Jedna runda wzajemnej krytyki.
3. **Dyrygent podejmuje decyzję końcową:**
   - przyjęte, albo
   - lista ostatnich poprawek z przydziałem do agentów (najwyżej jedna dodatkowa runda), potem przyjęcie.

Na koniec Dyrygent pisze `docs/atlas_audyt/RAPORT_KONCOWY.md`, prostym językiem dla użytkownika:
- co jest gotowe i jak to uruchomić;
- co sprawdzono i czego nie;
- znane problemy;
- rekomendacja następnego etapu (E1/E2′/E3 z modelu).

Zatwierdza wszystko w `atlas-uklady` i kończy. Bez push.

## 7. Zasady ogólne
- Zawsze po polsku, prostym językiem; użytkownik nie jest programistą.
- Pętle są ograniczone: lista agentów jest stała (integrator + 7), 3 punkty kontrolne każdy, najwyżej 3 rundy poprawek na punkt.
- Dowód zamiast deklaracji: „zrobione” znaczy obejrzany render lub zrzut i przechodzący build.
- Notatki robocze i zrzuty agentów: folder notatek sesji (poza repo). Audyty i raport końcowy: `docs/atlas_audyt/`.
