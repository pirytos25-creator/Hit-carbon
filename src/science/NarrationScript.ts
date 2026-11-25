import { NarrationSegment } from '../types/biogenesis';

/**
 * Pełny scenariusz polskiej narracji dla wszystkich 12 Aktów (1080s = 18 minut przy tempie 1.0x).
 * Każda sekcja ma wariant:
 * - Popularnonaukowy (pl-PL-MarekNeural): filmowy, obrazowy, odkrywczy
 * - Akademicki (pl-PL-ZofiaNeural): rygorystyczny naukowo, precyzyjny neurobiologicznie i fizjologicznie
 * Pola *TtsPl są zapisane przyjaźnie dla syntezy mowy polskiej (czytelne brzmienie skrótowców i związków).
 */
export const NARRATION_SEGMENTS: NarrationSegment[] = [
  // ================= AKT I (0 - 90s) =================
  {
    id: 'act-01-s01',
    actId: 1,
    startSec: 2,
    endSec: 28,
    popularDisplayPl:
      'Zaledwie kilka sekund temu człowiek zwiększył tempo biegu na bieżni. Na zewnątrz zmieniło się niewiele — rytm kroków, głębszy wdech, napięcie mięśni nóg. Jednak pod powierzchnią skóry rozpoczęła się niezwykła mobilizacja miliardów komórek.',
    popularTtsPl:
      'Zaledwie kilka sekund temu człowiek zwiększył tempo biegu na bieżni. Na zewnątrz zmieniło się niewiele: rytm kroków, głębszy wdech, napięcie mięśni nóg. Jednak pod powierzchnią skóry rozpoczęła się niezwykła mobilizacja miliardów komórek.',
    academicDisplayPl:
      'Przejście ze spoczynku do biegu interwałowego stanowi gwałtowne wyzwanie dla homeostazy energetycznej. Zanim jeszcze w mięśniach wzrośnie stężenie metabolitów, ośrodkowy układ nerwowy uruchamia zintegrowaną odpowiedź krążeniowo-oddechową i mięśniową.',
    academicTtsPl:
      'Przejście ze spoczynku do biegu interwałowego stanowi gwałtowne wyzwanie dla homeostazy energetycznej. Zanim jeszcze w mięśniach wzrośnie stężenie metabolitów, ośrodkowy układ nerwowy uruchamia zintegrowaną odpowiedź krążeniowo-oddechową i mięśniową.',
  },
  {
    id: 'act-01-s02',
    actId: 1,
    startSec: 32,
    endSec: 60,
    popularDisplayPl:
      'Gdy odsłaniamy kolejne warstwy ciała, widzimy, że organizm nie składa się z odizolowanych narządów. Mięśnie szkieletowe, serce, płuca, sieć naczyń i nerwów działają w tej samej chwili jak jeden zsynchronizowany mechanizm przetrwania i ruchu.',
    popularTtsPl:
      'Gdy odsłaniamy kolejne warstwy ciała, widzimy, że organizm nie składa się z odizolowanych narządów. Mięśnie szkieletowe, serce, płuca, sieć naczyń i nerwów działają w tej samej chwili jak jeden zsynchronizowany mechanizm przetrwania i ruchu.',
    academicDisplayPl:
      'Warstwowa wizualizacja anatomiczna ukazuje ścisłe sprzężenie czterech układów: mięśniowo-szkieletowego, sercowo-naczyniowego, oddechowego oraz nerwowego. Zapotrzebowanie metaboliczne mięśni rośnie wielokrotnie w ułamku minuty, wymuszając skoordynowaną redystrybucję tlenu i substratów.',
    academicTtsPl:
      'Warstwowa wizualizacja anatomiczna ukazuje ścisłe sprzężenie czterech układów: mięśniowo-szkieletowego, sercowo-naczyniowego, oddechowego oraz nerwowego. Zapotrzebowanie metaboliczne mięśni rośnie wielokrotnie w ułamku minuty, wymuszając skoordynowaną redystrybucję tlenu i substratów.',
  },
  {
    id: 'act-01-s03',
    actId: 1,
    startSec: 63,
    endSec: 88,
    popularDisplayPl:
      'Zbliżamy się do źródła decyzji o pierwszym kroku. Przenikamy przez tkanki w głąb układu nerwowego, gdzie rodzi się impuls uruchamiający całą tę wewnętrzną podróż.',
    popularTtsPl:
      'Zbliżamy się do źródła decyzji o pierwszym kroku. Przenikamy przez tkanki w głąb układu nerwowego, gdzie rodzi się impuls uruchamiający całą tę wewnętrzną podróż.',
    academicDisplayPl:
      'Przechodzimy ze skali całego ustroju w głąb ośrodkowego układu nerwowego, by prześledzić drogę od planowania ruchu w korze mózgowej do aktywacji jednostek motorycznych i autonomicznej mobilizacji.',
    academicTtsPl:
      'Przechodzimy ze skali całego ustroju w głąb ośrodkowego układu nerwowego, by prześledzić drogę od planowania ruchu w korze mózgowej do aktywacji jednostek motorycznych i autonomicznej mobilizacji.',
  },

  // ================= AKT II (90 - 180s) =================
  {
    id: 'act-02-s01',
    actId: 2,
    startSec: 93,
    endSec: 120,
    popularDisplayPl:
      'Zanim noga oderwie się od taśmy bieżni, kora ruchowa mózgu już projektuje cały ruch. Fale pobudzenia — nie błyskawice, lecz precyzyjne przesunięcia jonów w błonach neuronów — zstępują przez rdzeń kręgowy prosto ku mięśniom nóg.',
    popularTtsPl:
      'Zanim noga oderwie się od taśmy bieżni, kora ruchowa mózgu już projektuje cały ruch. Fale pobudzenia, nie błyskawice, lecz precyzyjne przesunięcia jonów w błonach neuronów, zstępują przez rdzeń kręgowy prosto ku mięśniom nóg.',
    academicDisplayPl:
      'Planowanie wysiłku angażuje korę przedruchową, dodatkowe pole ruchowe i pierwszorzędową korę ruchową. Sygnały drogą korowo-rdzeniową aktywują motoneurony alfa w rogach przednich rdzenia zgodnie z zasadą wielkości Hennemana oraz rosnącą częstotliwością wyładowań.',
    academicTtsPl:
      'Planowanie wysiłku angażuje korę przedruchową, dodatkowe pole ruchowe i pierwszorzędową korę ruchową. Sygnały drogą korowo-rdzeniową aktywują motoneurony alfa w rogach przednich rdzenia zgodnie z zasadą wielkości Hennemana oraz rosnącą częstotliwością wyładowań.',
  },
  {
    id: 'act-02-s02',
    actId: 2,
    startSec: 123,
    endSec: 150,
    popularDisplayPl:
      'Na styku nerwu i włókna mięśniowego uwalnia się acetylocholina. To chemiczny klucz otwierający kanały sodowe. Błona komórki mięśniowej ulega depolaryzacji i w jednej chwili daje sygnał do skurczu.',
    popularTtsPl:
      'Na styku nerwu i włókna mięśniowego uwalnia się acetylocholina. To chemiczny klucz otwierający kanały sodowe. Błona komórki mięśniowej ulega depolaryzacji i w jednej chwili daje sygnał do skurczu.',
    academicDisplayPl:
      'W złączu nerwowo-mięśniowym egzocytoza acetylocholiny aktywuje jonotropowe receptory nikotynowe, generując potencjał płytki końcowej i depolaryzację sarkolemy. Pamiętajmy: wizualizacje świetlne pełnią rolę umownej reprezentacji gradientów jonowych sodu i potasu.',
    academicTtsPl:
      'W złączu nerwowo-mięśniowym egzocytoza acetylocholiny aktywuje jonotropowe receptory nikotynowe, generując potencjał płytki końcowej i depolaryzację sarkolemy. Pamiętajmy, że wizualizacje świetlne pełnią rolę umownej reprezentacji gradientów jonowych sodu i potasu.',
  },
  {
    id: 'act-02-s03',
    actId: 2,
    startSec: 153,
    endSec: 178,
    popularDisplayPl:
      'Równolegle autonomiczny układ nerwowy zdejmuje przywspółczulny hamulec z serca i wzmacnia ramię współczulne. Zakończenia nerwowe uwalniają noradrenalinę, a rdzeń nadnerczy wyrzuca do krwi adrenalinę, przygotowując cały organizm na wysiłek.',
    popularTtsPl:
      'Równolegle autonomiczny układ nerwowy zdejmuje przywspółczulny hamulec z serca i wzmacnia ramię współczulne. Zakończenia nerwowe uwalniają noradrenalinę, a rdzeń nadnerczy wyrzuca do krwi adrenalinę, przygotowując cały organizm na wysiłek.',
    academicDisplayPl:
      'Centralny napęd wycofuje najpierw hamowanie przywspółczulne z węzła zatokowego, a następnie nasila wyładowania współczulne. Włókna pozazwojowe uwalniają lokalnie noradrenalinę jako neuroprzekaźnik, podczas gdy rdzeń nadnerczy wydziela do krążenia głównie adrenalinę, mobilizując glikogenolizę i lipolizę.',
    academicTtsPl:
      'Centralny napęd wycofuje najpierw hamowanie przywspółczulne z węzła zatokowego, a następnie nasila wyładowania współczulne. Włókna pozazwojowe uwalniają lokalnie noradrenalinę jako neuroprzekaźnik, podczas gdy rdzeń nadnerczy wydziela do krążenia głównie adrenalinę, mobilizując glikogenolizę i lipolizę.',
  },

  // ================= AKT III (180 - 270s) =================
  {
    id: 'act-03-s01',
    actId: 3,
    startSec: 183,
    endSec: 210,
    popularDisplayPl:
      'Przenikamy przez klatkę piersiową prosto do pracującego serca. Węzeł zatokowo-przedsionkowy nadaje coraz szybsze tempo. Fala przewodzenia przebiega przez przedsionki i komory, a cztery zastawki otwierają się i zamykają w ułamku sekundy.',
    popularTtsPl:
      'Przenikamy przez klatkę piersiową prosto do pracującego serca. Węzeł zatokowo-przedsionkowy nadaje coraz szybsze tempo. Fala przewodzenia przebiega przez przedsionki i komory, a cztery zastawki otwierają się i zamykają w ułamku sekundy.',
    academicDisplayPl:
      'Depolaryzacja zainicjowana w węźle zatokowo-przedsionkowym ulega fizjologicznemu opóźnieniu w węźle przedsionkowo-komorowym, po czym pęczkiem Hisa i włóknami Purkinjego synchronizuje skurcz komór. Wzrost częstości skurczów i objętości wyrzutowej wielokrotnie zwiększa pojemność minutową serca.',
    academicTtsPl:
      'Depolaryzacja zainicjowana w węźle zatokowo-przedsionkowym ulega fizjologicznemu opóźnieniu w węźle przedsionkowo-komorowym, po czym pęczkiem Hisa i włóknami Purkinjego synchronizuje skurcz komór. Wzrost częstości skurczów i objętości wyrzutowej wielokrotnie zwiększa pojemność minutową serca.',
  },
  {
    id: 'act-03-s02',
    actId: 3,
    startSec: 213,
    endSec: 242,
    popularDisplayPl:
      'Wędrujemy strumieniem powietrza przez tchawicę i oskrzela aż do delikatnych pęcherzyków płucnych. Tu dzieli nas od krwi zaledwie pół mikrometra. Tlen przenika do erytrocytów i wiąże się z hemoglobiną, a dwutlenek węgla ucieka na zewnątrz.',
    popularTtsPl:
      'Wędrujemy strumieniem powietrza przez tchawicę i oskrzela aż do delikatnych pęcherzyków płucnych. Tu dzieli nas od krwi zaledwie pół mikrometra. Tlen przenika do erytrocytów i wiąże się z hemoglobiną, a dwutlenek węgla ucieka na zewnątrz.',
    academicDisplayPl:
      'Wzrost wentylacji pęcherzykowej utrzymuje gradient ciśnień cząstkowych w pęcherzykach płucnych. Przez barierę pęcherzykowo-włośniczkową zachodzi bierna dyfuzja O₂ do osocza i erytrocytów, gdzie wiąże się on kooperatywnie z żelazem hemoglobiny, podczas gdy CO₂ opuszcza krew w drodze dyfuzji zwrotnej.',
    academicTtsPl:
      'Wzrost wentylacji pęcherzykowej utrzymuje gradient ciśnień cząstkowych w pęcherzykach płucnych. Przez barierę pęcherzykowo-włośniczkową zachodzi bierna dyfuzja tlenu do osocza i erytrocytów, gdzie wiąże się on kooperatywnie z żelazem hemoglobiny, podczas gdy dwutlenek węgla opuszcza krew w drodze dyfuzji zwrotnej.',
  },
  {
    id: 'act-03-s03',
    actId: 3,
    startSec: 245,
    endSec: 268,
    popularDisplayPl:
      'Możesz teraz podążać wraz z pojedynczym erytrocytem przez rozgałęzione arterie w stronę mięśni nóg. Naczynia w mięśniach szeroko się otwierają, a układ pokarmowy czasowo oddaje pierwszeństwo pracującym włóknom.',
    popularTtsPl:
      'Możesz teraz podążać wraz z pojedynczym erytrocytem przez rozgałęzione arterie w stronę mięśni nóg. Naczynia w mięśniach szeroko się otwierają, a układ pokarmowy czasowo oddaje pierwszeństwo pracującym włóknom.',
    academicDisplayPl:
      'Redystrybucja rzutu serca wynika z lokalnej wazodylatacji metabolicznej w pracujących mięśniach przy jednoczesnej współczulnej wazokonstrykcji w łożysku trzewnym i nerkowym. Przepływ mięśniowy może pochłonąć nawet ponad osiemdziesiąt procent całkowitej pojemności minutowej.',
    academicTtsPl:
      'Redystrybucja rzutu serca wynika z lokalnej wazodylatacji metabolicznej w pracujących mięśniach przy jednoczesnej współczulnej wazokonstrykcji w łożysku trzewnym i nerkowym. Przepływ mięśniowy może pochłonąć nawet ponad osiemdziesiąt procent całkowitej pojemności minutowej.',
  },

  // ================= AKT IV (270 - 360s) =================
  {
    id: 'act-04-s01',
    actId: 4,
    startSec: 273,
    endSec: 300,
    popularDisplayPl:
      'Docieramy do pracujących mięśni nóg i zanurzamy się coraz głębiej: od całego brzuśca przez pęczki i pojedyncze włókna, aż do miofibryli i mikroskopijnych sarkomerów — biologicznych silników naszego ruchu.',
    popularTtsPl:
      'Docieramy do pracujących mięśni nóg i zanurzamy się coraz głębiej: od całego brzuśca przez pęczki i pojedyncze włókna, aż do miofibryli i mikroskopijnych sarkomerów, biologicznych silników naszego ruchu.',
    academicDisplayPl:
      'Schodzimy przez pięć rzędów wielkości organizacji strukturalnej: mięsień, pęczek, włókno z kanalikami T i siateczką sarkoplazmatyczną, miofibryla oraz sarkomer. W miarę narastania intensywności po powolnych włóknach oksydacyjnych typu pierwszego rekrutowane są szybkie włókna drugiego typu.',
    academicTtsPl:
      'Schodzimy przez pięć rzędów wielkości organizacji strukturalnej: mięsień, pęczek, włókno z kanalikami te i siateczką sarkoplazmatyczną, miofibryla oraz sarkomer. W miarę narastania intensywności po powolnych włóknach oksydacyjnych typu pierwszego rekrutowane są szybkie włókna drugiego typu.',
  },
  {
    id: 'act-04-s02',
    actId: 4,
    startSec: 303,
    endSec: 332,
    popularDisplayPl:
      'Siateczka sarkoplazmatyczna otwiera śluzy i zalewa sarkomer jonami wapnia. Wapń wiąże troponinę, odsłaniając aktynę spod taśmy tropomiozyny. Wtedy główki miozyny chwytają aktynę i wykonują ruch roboczy, przybliżając prążki Z.',
    popularTtsPl:
      'Siateczka sarkoplazmatyczna otwiera śluzy i zalewa sarkomer jonami wapnia. Wapń wiąże troponinę, odsłaniając aktynę spod taśmy tropomiozyny. Wtedy główki miozyny chwytają aktynę i wykonują ruch roboczy, przybliżając prążki zet.',
    academicDisplayPl:
      'Wiązanie jonów wapnia z podjednostką troponiny C indukuje zmianę konformacyjną odsuwającą tropomiozynę z miejsc aktywnych aktyny. Uwolnienie fosforanu nieorganicznego i ADP napędza ruch roboczy główki miozyny S1, przesuwając filamenty cienkie w stronę linii M.',
    academicTtsPl:
      'Wiązanie jonów wapnia z podjednostką troponiny ce indukuje zmianę konformacyjną odsuwającą tropomiozynę z miejsc aktywnych aktyny. Uwolnienie fosforanu nieorganicznego i a de pe napędza ruch roboczy główki miozyny es jeden, przesuwając filamenty cienkie w stronę linii em.',
  },
  {
    id: 'act-04-s03',
    actId: 4,
    startSec: 335,
    endSec: 358,
    popularDisplayPl:
      'Co zaskakujące, cząsteczka ATP jest niezbędna również po to, aby główka miozyny mogła puścić aktynę i przygotować się do kolejnego pociągnięcia. Zatrzymaj czas w laboratorium sarkomeru i obejrzyj każdy etap z bliska.',
    popularTtsPl:
      'Co zaskakujące, cząsteczka a te pe jest niezbędna również po to, aby główka miozyny mogła puścić aktynę i przygotować się do kolejnego pociągnięcia. Zatrzymaj czas w laboratorium sarkomeru i obejrzyj każdy etap z bliska.',
    academicDisplayPl:
      'Kluczowa rola ATP w cyklu mostków poprzecznych polega zarówno na dysocjacji kompleksu aktyna–miozyna ze stanu rygoru, jak i na jego hydrolizie przywracającej konformację wysokonergetyczną główki. Dodatkowe ATP zużywa pompa wapniowa SERCA podczas rozkurczu.',
    academicTtsPl:
      'Kluczowa rola a te pe w cyklu mostków poprzecznych polega zarówno na dysocjacji kompleksu aktyna miozyna ze stanu rygoru, jak i na jego hydrolizie przywracającej konformację wysokonergetyczną główki. Dodatkowe a te pe zużywa pompa wapniowa serka podczas rozkurczu.',
  },

  // ================= AKT V (360 - 450s) =================
  {
    id: 'act-05-s01',
    actId: 5,
    startSec: 363,
    endSec: 392,
    popularDisplayPl:
      'Podczas intensywnego interwału zapotrzebowanie mięśni na ATP potrafi wzrosnąć nawet tysiąckrotnie. System fosfagenowy, glikoliza i oddychanie tlenowe nie włączają się po kolei jak przełączniki — pracują naraz, płynnie dzieląc się zadaniami.',
    popularTtsPl:
      'Podczas intensywnego interwału zapotrzebowanie mięśni na a te pe potrafi wzrosnąć nawet tysiąckrotnie. System fosfagenowy, glikoliza i oddychanie tlenowe nie włączają się po kolei jak przełączniki, pracują naraz, płynnie dzieląc się zadaniami.',
    academicDisplayPl:
      'Wszystkie trzy szlaki resyntezy ATP działają równolegle i nakładają się w czasie. Fosfokreatyna i kinaza kreatynowa buforują gwałtowne skoki zapotrzebowania, glikoliza dostarcza szybkiego obrotu ATP, a już po około siedemdziesięciu pięciu sekundach maksymalnej pracy udział fosforylacji oksydacyjnej zbliża się do połowy.',
    academicTtsPl:
      'Wszystkie trzy szlaki resyntezy a te pe działają równolegle i nakładają się w czasie. Fosfokreatyna i kinaza kreatynowa buforują gwałtowne skoki zapotrzebowania, glikoliza dostarcza szybkiego obrotu a te pe, a już po około siedemdziesięciu pięciu sekundach maksymalnej pracy udział fosforylacji oksydacyjnej zbliża się do połowy.',
  },
  {
    id: 'act-05-s02',
    actId: 5,
    startSec: 395,
    endSec: 423,
    popularDisplayPl:
      'Wpływamy przez błonę zewnętrzną do wnętrza mitochondrium. Na fałdach grzebieni łańcuch transportu elektronów pompuje protony, tworząc silny gradient. Przepływ protonów napędza obrót molekularnej turbiny — syntazy ATP.',
    popularTtsPl:
      'Wpływamy przez błonę zewnętrzną do wnętrza mitochondrium. Na fałdach grzebieni łańcuch transportu elektronów pompuje protony, tworząc silny gradient. Przepływ protonów napędza obrót molekularnej turbiny, syntazy a te pe.',
    academicDisplayPl:
      'Wewnątrz grzebieni mitochondrialnych elektrony z NADH i FADH₂ wędrują przez kompleksy I–IV łańcucha oddechowego do tlenu. Siła protonomotoryczna napędza rotację pierścienia c podjednostki F0 oraz asymetrycznego trzonka gamma w heksamerze F1, katalizując mechaniczną syntezę ATP z ADP i fosforanu.',
    academicTtsPl:
      'Wewnątrz grzebieni mitochondrialnych elektrony z en a de ha i ef a de ha dwa wędrują przez kompleksy od pierwszego do czwartego łańcucha oddechowego do tlenu. Siła protonomotoryczna napędza rotację pierścienia ce podjednostki ef zero oraz asymetrycznego trzonka gamma w heksamerze ef jeden, katalizując mechaniczną syntezę a te pe z a de pe i fosforanu.',
  },
  {
    id: 'act-05-s03',
    actId: 5,
    startSec: 426,
    endSec: 448,
    popularDisplayPl:
      'A mleczan? Wbrew dawnym mitom nie jest bezużytecznym śmieciem ani sprawcą zakwasów. Powstaje nawet wtedy, gdy tlenu jest pod dostatkiem, i wędruje transporterami jako wysokooktanowe paliwo dla serca, sąsiednich mięśni i mózgu.',
    popularTtsPl:
      'A mleczan? Wbrew dawnym mitom nie jest bezużytecznym śmieciem ani sprawcą bolesności mięśni. Powstaje nawet wtedy, gdy tlenu jest pod dostatkiem, i wędruje transporterami jako wysokooktanowe paliwo dla serca, sąsiednich mięśni i mózgu.',
    academicDisplayPl:
      'Zgodnie z teorią czółenka mleczanowego Brooksa mleczan stanowi łącznik między glikolizą a oddychaniem mitochondrialnym. Przez transportery MCT4 i MCT1 zasila mięsień sercowy, włókna oksydacyjne typu pierwszego, wątrobę w glukoneogenezie oraz komórki nerwowe, pełniąc też funkcję sygnałową.',
    academicTtsPl:
      'Zgodnie z teorią czółenka mleczanowego Brooksa mleczan stanowi łącznik między glikolizą a oddychaniem mitochondrialnym. Przez transportery em ce te cztery i em ce te jeden zasila mięsień sercowy, włókna oksydacyjne typu pierwszego, wątrobę w glukoneogenezie oraz komórki nerwowe, pełniąc też funkcję sygnałową.',
  },

  // ================= AKT VI (450 - 540s) =================
  {
    id: 'act-06-s01',
    actId: 6,
    startSec: 453,
    endSec: 482,
    popularDisplayPl:
      'Oto szczyt intensywnego interwału HIIT. Bieg przyspiesza, serce bije blisko maksimum, wentylacja wzrasta wielokrotnie, a podwzgórze uruchamia termoregulację i wydzielanie potu, aby chronić komórki przed przegrzaniem.',
    popularTtsPl:
      'Oto szczyt intensywnego interwału. Bieg przyspiesza, serce bije blisko maksimum, wentylacja wzrasta wielokrotnie, a podwzgórze uruchamia termoregulację i wydzielanie potu, aby chronić komórki przed przegrzaniem.',
    academicDisplayPl:
      'Na szczycie interwału zasoby fosfokreatyny szybko maleją, rośnie stężenie fosforanu nieorganicznego i mleczanu, a układy buforowe pracują na granicy równowagi kwasowo-zasadowej. Ośrodek termoregulacji w podwzgórzu aktywuje rozszerzenie naczyń skórnych i parowanie potu.',
    academicTtsPl:
      'Na szczycie interwału zasoby fosfokreatyny szybko maleją, rośnie stężenie fosforanu nieorganicznego i mleczanu, a układy buforowe pracują na granicy równowagi kwasowo-zasadowej. Ośrodek termoregulacji w podwzgórzu aktywuje rozszerzenie naczyń skórnych i parowanie potu.',
  },
  {
    id: 'act-06-s02',
    actId: 6,
    startSec: 485,
    endSec: 514,
    popularDisplayPl:
      'Zmęczenie nie ma jednej przyczyny. Składa się na nie zarówno lokalne przeciążenie w mięśniach, jak i sygnał ochronny z samego mózgu, który zwalnia napęd mięśniowy, zanim wyczerpie się krytyczne ATP.',
    popularTtsPl:
      'Zmęczenie nie ma jednej przyczyny. Składa się na nie zarówno lokalne przeciążenie w mięśniach, jak i sygnał ochronny z samego mózgu, który zwalnia napęd mięśniowy, zanim wyczerpie się krytyczne a te pe.',
    academicDisplayPl:
      'Badania z przezczaszkową stymulacją magnetyczną pokazują współistnienie zmęczenia obwodowego i ośrodkowego. Jest to mechanizm wieloczynnikowy, w którym hamowanie ponadrdzeniowe chroni mięśnie przed nieodwracalnym spadkiem ATP i stanem rygoru.',
    academicTtsPl:
      'Badania z przezczaszkową stymulacją magnetyczną pokazują współistnienie zmęczenia obwodowego i ośrodkowego. Jest to mechanizm wieloczynnikowy, w którym hamowanie ponadrdzeniowe chroni mięśnie przed nieodwracalnym spadkiem a te pe i stanem rygoru.',
  },
  {
    id: 'act-06-s03',
    actId: 6,
    startSec: 517,
    endSec: 538,
    popularDisplayPl:
      'Gdy nadchodzi faza aktywnego odpoczynku, tlen pozwala szybko odbudować część fosfokreatyny i oczyścić pole przed kolejnym interwałem. W trybie interaktywnym możesz sam przełączyć wszystkie sześć faz treningu.',
    popularTtsPl:
      'Gdy nadchodzi faza aktywnego odpoczynku, tlen pozwala szybko odbudować część fosfokreatyny i oczyścić pole przed kolejnym interwałem. W trybie interaktywnym możesz sam przełączyć wszystkie sześć faz treningu.',
    academicDisplayPl:
      'Przerwa aktywna utrzymuje podwyższony przepływ krwi i wspiera mitochondrialną resyntezę fosfokreatyny oraz utlenianie mleczanu. Stężenie ATP spada jedynie minimalnie, podczas gdy zdolność buforowania szybkich bodźców częściowo powraca przed kolejną serią.',
    academicTtsPl:
      'Przerwa aktywna utrzymuje podwyższony przepływ krwi i wspiera mitochondrialną resyntezę fosfokreatyny oraz utlenianie mleczanu. Stężenie a te pe spada jedynie minimalnie, podczas gdy zdolność buforowania szybkich bodźców częściowo powraca przed kolejną serią.',
  },

  // ================= AKT VII (540 - 630s) =================
  {
    id: 'act-07-s01',
    actId: 7,
    startSec: 543,
    endSec: 572,
    popularDisplayPl:
      'Mięśnie nie tylko poruszają kośćmi — w trakcie skurczu stają się potężnym gruczołem komunikacyjnym. Wysyłają do krwiobiegu cząsteczki sygnałowe zwane miokinami, takie jak interleukina szósta, oraz mleczan podróżujący w górę ku mózgowi.',
    popularTtsPl:
      'Mięśnie nie tylko poruszają kośćmi, w trakcie skurczu stają się potężnym gruczołem komunikacyjnym. Wysyłają do krwiobiegu cząsteczki sygnałowe zwane miokinami, takie jak interleukina szósta, oraz mleczan podróżujący w górę ku mózgowi.',
    academicDisplayPl:
      'Skurcz mięśni szkieletowych uwalnia setki peptydów i metabolitów tworzących pętlę mięśnie–wątroba i mięśnie–mózg. Przykładowo skurczowa interleukina szósta mobilizuje wątrobę do uwalniania glukozy i wspiera oksydację tłuszczów przez kinazę AMPK.',
    academicTtsPl:
      'Skurcz mięśni szkieletowych uwalnia setki peptydów i metabolitów tworzących pętlę mięśnie wątroba i mięśnie mózg. Przykładowo skurczowa interleukina szósta mobilizuje wątrobę do uwalniania glukozy i wspiera oksydację tłuszczów przez kinazę a em pe ka.',
  },
  {
    id: 'act-07-s02',
    actId: 7,
    startSec: 575,
    endSec: 604,
    popularDisplayPl:
      'Docieramy do ścisłej granicy: bariery krew–mózg. Zwarci strażnicy śródbłonka nie wpuszczają wszystkiego z krwi. Obwodowa adrenalina czy serotonina zostają zatrzymane przed bramą, lecz mleczan wchodzi przez wyspecjalizowane transportery.',
    popularTtsPl:
      'Docieramy do ścisłej granicy: bariery krew mózg. Zwarci strażnicy śródbłonka nie wpuszczają wszystkiego z krwi. Obwodowa adrenalina czy serotonina zostają zatrzymane przed bramą, lecz mleczan wchodzi przez wyspecjalizowane transportery.',
    academicDisplayPl:
      'Ścisłe połączenia komórek śródbłonka naczyń mózgowych, perycyty i wypustki astrocytów selekcjonują sygnały. Obwodowe katecholaminy, dopamina czy serotonina nie przekraczają swobodnie bariery krew–mózg. Mleczan przenika przez transportery MCT1, a informacje docierają także drogą aferentną nerwu błędnego i przez konwersję kinureniny.',
    academicTtsPl:
      'Ścisłe połączenia komórek śródbłonka naczyń mózgowych, perycyty i wypustki astrocytów selekcjonują sygnały. Obwodowe katecholaminy, dopamina czy serotonina nie przekraczają swobodnie bariery krew mózg. Mleczan przenika przez transportery em ce te jeden, a informacje docierają także drogą aferentną nerwu błędnego i przez konwersję kinureniny.',
  },
  {
    id: 'act-07-s03',
    actId: 7,
    startSec: 607,
    endSec: 628,
    popularDisplayPl:
      'Nauka uczy nas tu pokory: część sygnałów z mięśni, takich jak katepsyna B czy głośna w mediach irysyna, wciąż jest intensywnie badana i bywa przedmiotem sporów o metody pomiaru u ludzi.',
    popularTtsPl:
      'Nauka uczy nas tu pokory: część sygnałów z mięśni, takich jak katepsyna be czy głośna w mediach irysyna, wciąż jest intensywnie badana i bywa przedmiotem sporów o metody pomiaru u ludzi.',
    academicDisplayPl:
      'W przypadku białka FNDC5 i irysyny literatura pozostaje podzielona ze względu na artefakty testów immunoenzymatycznych oraz niski poziom krążący u ludzi. Z kolei rola katepsyny B jako miokiny przekraczającej barierę i indukującej BDNF w hipokampie została wykazana głównie u gryzoni.',
    academicTtsPl:
      'W przypadku białka ef en de ce pięć i irysyny literatura pozostaje podzielona ze względu na artefakty testów immunoenzymatycznych oraz niski poziom krążący u ludzi. Z kolei rola katepsyny be jako miokiny przekraczającej barierę i indukującej be de en ef w hipokampie została wykazana głównie u gryzoni.',
  },

  // ================= AKT VIII (630 - 720s) =================
  {
    id: 'act-08-s01',
    actId: 8,
    startSec: 633,
    endSec: 662,
    popularDisplayPl:
      'Wchodzimy do wnętrza ludzkiego mózgu. Każda struktura gra tu własną partię. Dopamina z pola brzusznego nakrywki wspiera motywację i uczenie się, noradrenalina z miejsca sinawego wyostrza uwagę, a serotonina z jąder szwu moduluje nastrój.',
    popularTtsPl:
      'Wchodzimy do wnętrza ludzkiego mózgu. Każda struktura gra tu własną partię. Dopamina z pola brzusznego nakrywki wspiera motywację i uczenie się, noradrenalina z miejsca sinawego wyostrza uwagę, a serotonina z jąder szwu moduluje nastrój.',
    academicDisplayPl:
      'W mózgu wysiłek uruchamia wieloukładową modulację. Dopamina w szlakach mezokortykolimbicznym i nigrostriatalnym reguluje kontrolę ruchu, alokację wysiłku i kodowanie wzmocnień, a nie prostą „przyjemność”. Miejsce sinawe rozsyła noradrenalinę zwiększając czujność korową, a jądra szwu modulują pobudzenie, sen i zmęczenie ośrodkowe.',
    academicTtsPl:
      'W mózgu wysiłek uruchamia wieloukładową modulację. Dopamina w szlakach mezokortykolimbicznym i nigrostriatalnym reguluje kontrolę ruchu, alokację wysiłku i kodowanie wzmocnień, a nie prostą przyjemność. Miejsce sinawe rozsyła noradrenalinę zwiększając czujność korową, a jądra szwu modulują pobudzenie, sen i zmęczenie ośrodkowe.',
  },
  {
    id: 'act-08-s02',
    actId: 8,
    startSec: 665,
    endSec: 694,
    popularDisplayPl:
      'A co z legendarną euforią biegacza? Nowoczesne badania u ludzi pokazały, że same endorfiny to nie cała historia. Po zablokowaniu ich receptorów lekiem euforia wciąż się pojawiała — głównymi podejrzanymi są dziś endokannabinoidy, jak anandamid.',
    popularTtsPl:
      'A co z legendarną euforią biegacza? Nowoczesne badania u ludzi pokazały, że same endorfiny to nie cała historia. Po zablokowaniu ich receptorów lekiem euforia wciąż się pojawiała, a głównymi podejrzanymi są dziś endokannabinoidy, takie jak anandamid.',
    academicDisplayPl:
      'Choć badania PET wykazały centralne wiązanie endogennych opioidów po długim biegu, randomizowana blokada naltreksonem u ludzi nie zniosła redukcji lęku ani euforii. Lipofilne endokannabinoidy — anandamid i 2-AG — łatwo przenikają barierę krew–mózg i działają wstecznie przez receptory CB1, choć doświadczenie runner’s high jest silnie zróżnicowane osobniczo.',
    academicTtsPl:
      'Choć badania pet wykazały centralne wiązanie endogennych opioidów po długim biegu, randomizowana blokada naltreksonem u ludzi nie zniosła redukcji lęku ani euforii. Lipofilne endokannabinoidy, anandamid i dwa a gie, łatwo przenikają barierę krew mózg i działają wstecznie przez receptory ce be jeden, choć doświadczenie euforii biegacza jest silnie zróżnicowane osobniczo.',
  },
  {
    id: 'act-08-s03',
    actId: 8,
    startSec: 697,
    endSec: 718,
    popularDisplayPl:
      'Nad wszystkimi układami czuwa krucha równowaga dwóch głównych języków kory: pobudzającego glutaminianu i wyciszającego kwasu GABA. Żaden neuroprzekaźnik nie działa tu w próżni i żaden nie odpowiada za jedną emocję.',
    popularTtsPl:
      'Nad wszystkimi układami czuwa krucha równowaga dwóch głównych języków kory: pobudzającego glutaminianu i wyciszającego kwasu gaba. Żaden neuroprzekaźnik nie działa tu w próżni i żaden nie odpowiada za jedną emocję.',
    academicDisplayPl:
      'Ostateczną dynamikę sieci wyznacza homeostaza pobudzenia i hamowania pomiędzy synapsami glutaminergicznymi a GABA-ergicznymi w korze przedczołowej, hipokampie i ciele migdałowatym. Pojedynczemu treningowi nie można też przypisać dokładnych, uniwersalnych stężeń monoamin w wybranych jądrach mózgu człowieka.',
    academicTtsPl:
      'Ostateczną dynamikę sieci wyznacza homeostaza pobudzenia i hamowania pomiędzy synapsami glutaminergicznymi a gabaergicznymi w korze przedczołowej, hipokampie i ciele migdałowatym. Pojedynczemu treningowi nie można też przypisać dokładnych, uniwersalnych stężeń monoamin w wybranych jądrach mózgu człowieka.',
  },

  // ================= AKT IX (720 - 810s) =================
  {
    id: 'act-09-s01',
    actId: 9,
    startSec: 723,
    endSec: 752,
    popularDisplayPl:
      'Zbliżamy się do pojedynczego neuronu. Fala potencjału czynnościowego przeskakuje między osłonkami mielinowymi w przewężeniach Ranviera i dociera do zakończenia presynaptycznego — bramki komunikacji między komórkami.',
    popularTtsPl:
      'Zbliżamy się do pojedynczego neuronu. Fala potencjału czynnościowego przeskakuje między osłonkami mielinowymi w przewężeniach Ranviera i dociera do zakończenia presynaptycznego, bramki komunikacji między komórkami.',
    academicDisplayPl:
      'Przewodnictwo skokowe w aksonie mielinowym prowadzi falę depolaryzacji przez przewężenia Ranviera do kolbki końcowej. Pamiętajmy, że skala przestrzenna dwudziestonanometrowej szczeliny oraz czas trwania zdarzeń milisekundowych zostały celowo powiększone i spowolnione dla czytelności dydaktycznej.',
    academicTtsPl:
      'Przewodnictwo skokowe w aksonie mielinowym prowadzi falę depolaryzacji przez przewężenia Ranviera do kolbki końcowej. Pamiętajmy, że skala przestrzenna dwudziestonanometrowej szczeliny oraz czas trwania zdarzeń milisekundowych zostały celowo powiększone i spowolnione dla czytelności dydaktycznej.',
  },
  {
    id: 'act-09-s02',
    actId: 9,
    startSec: 755,
    endSec: 785,
    popularDisplayPl:
      'Impuls otwiera kanały wapniowe. Napływ wapnia zmusza pęcherzyki synaptyczne do fuzji z błoną i wyrzucenia neuroprzekaźników w szczelinę. Po drugiej stronie cząsteczki odnajdują swoje receptory jak klucze dopasowane do zamków.',
    popularTtsPl:
      'Impuls otwiera kanały wapniowe. Napływ wapnia zmusza pęcherzyki synaptyczne do fuzji z błoną i wyrzucenia neuroprzekaźników w szczelinę. Po drugiej stronie cząsteczki odnajdują swoje receptory jak klucze dopasowane do zamków.',
    academicDisplayPl:
      'Napływ jonów wapnia przez kanały bramkowane napięciem aktywuje białka kompleksu SNARE i egzocytozę. Po dyfuzji w szczelinie szybkie receptory jonotropowe AMPA i GABA_A otwierają kanały dla sodu lub chlorków, podczas gdy receptory metabotropowe aktywują kaskady białek G.',
    academicTtsPl:
      'Napływ jonów wapnia przez kanały bramkowane napięciem aktywuje białka kompleksu sner i egzocytozę. Po dyfuzji w szczelinie szybkie receptory jonotropowe ampa i gaba a otwierają kanały dla sodu lub chlorków, podczas gdy receptory metabotropowe aktywują kaskady białek gie.',
  },
  {
    id: 'act-09-s03',
    actId: 9,
    startSec: 788,
    endSec: 808,
    popularDisplayPl:
      'Na koniec transportery błonowe oczyszczają szczelinę, kończąc sygnał. Możesz teraz zamrozić czas i porównać cztery różne rodzaje synaps — od pobudzającej po hamującą sygnalizację wsteczną endokannabinoidów.',
    popularTtsPl:
      'Na koniec transportery błonowe oczyszczają szczelinę, kończąc sygnał. Możesz teraz zamrozić czas i porównać cztery różne rodzaje synaps, od pobudzającej po hamującą sygnalizację wsteczną endokannabinoidów.',
    academicDisplayPl:
      'Zakończenie sygnału przez wychwyt zwrotny i rozkład enzymatyczny przywraca gotowość synapsy. W panelu synaptycznym porównasz także sygnalizację wsteczną: zsyntetyzowany postsynaptycznie dwuarachidonyloglicerol wędruje wstecz do presynaptycznych receptorów CB1, hamując kanały wapniowe.',
    academicTtsPl:
      'Zakończenie sygnału przez wychwyt zwrotny i rozkład enzymatyczny przywraca gotowość synapsy. W panelu synaptycznym porównasz także sygnalizację wsteczną: zsyntetyzowany postsynaptycznie dwuarachidonyloglicerol wędruje wstecz do presynaptycznych receptorów ce be jeden, hamując kanały wapniowe.',
  },

  // ================= AKT X (810 - 900s) =================
  {
    id: 'act-10-s01',
    actId: 10,
    startSec: 813,
    endSec: 842,
    popularDisplayPl:
      'Wchodzimy w kulminację podróży — świat neuroplastyczności. Białko BDNF, neurotrofowy czynnik pochodzenia mózgowego, łączy się z receptorami TrkB na powierzchni neuronu i uruchamia wewnątrzkomórkowe szlaki budowy i przetrwania.',
    popularTtsPl:
      'Wchodzimy w kulminację podróży, świat neuroplastyczności. Białko be de en ef, neurotrofowy czynnik pochodzenia mózgowego, łączy się z receptorami te er ka be na powierzchni neuronu i uruchamia wewnątrzkomórkowe szlaki budowy i przetrwania.',
    academicDisplayPl:
      'Neurotrofina BDNF w formie homodimeru indukuje dimeryzację i autofosforylację receptorów kinazy tyrozynowej TrkB, aktywując trzy główne kaskady: szlak MAPK/ERK regulujący transkrypcję genów, szlak PI3K/Akt wspierający przeżycie i lokalną translację oraz szlak PLCγ wzmacniający potencjał synaptyczny.',
    academicTtsPl:
      'Neurotrofina be de en ef w formie homodimeru indukuje dimeryzację i autofosforylację receptorów kinazy tyrozynowej te er ka be, aktywując trzy główne kaskady: szlak mapka erk regulujący transkrypcję genów, szlak pe i trzy ka akt wspierający przeżycie i lokalną translację oraz szlak pe el ce gamma wzmacniający potencjał synaptyczny.',
  },
  {
    id: 'act-10-s02',
    actId: 10,
    startSec: 845,
    endSec: 874,
    popularDisplayPl:
      'Powtarzalne pobudzenie synaps odblokowuje receptory NMDA. Do kolca dendrytycznego wstawiane są nowe receptory AMPA, a szkielet aktynowy fizycznie powiększa połączenie. Pamiętajmy jednak: krew z palca nie mierzy wprost tego, co dzieje się w głębi hipokampa.',
    popularTtsPl:
      'Powtarzalne pobudzenie synaps odblokowuje receptory en em de a. Do kolca dendrytycznego wstawiane są nowe receptory ampa, a szkielet aktynowy fizycznie powiększa połączenie. Pamiętajmy jednak: krew z palca nie mierzy wprost tego, co dzieje się w głębi hipokampa.',
    academicDisplayPl:
      'W długotrwałym wzmocnieniu synaptycznym koincydencja depolaryzacji i glutaminianu usuwa blok magnezowy z kanałów NMDA, napędzając insercję receptorów AMPA i strukturalny wzrost kolców dendrytycznych. Choć metaanalizy potwierdzają wzrost BDNF we krwi po wysiłku, nie wolno utożsamiać pomiaru obwodowego z bezpośrednim pomiarem w mózgu.',
    academicTtsPl:
      'W długotrwałym wzmocnieniu synaptycznym koincydencja depolaryzacji i glutaminianu usuwa blok magnezowy z kanałów en em de a, napędzając insercję receptorów ampa i strukturalny wzrost kolców dendrytycznych. Choć metaanalizy potwierdzają wzrost be de en ef we krwi po wysiłku, nie wolno utożsamiać pomiaru obwodowego z bezpośrednim pomiarem w mózgu.',
  },
  {
    id: 'act-10-s03',
    actId: 10,
    startSec: 877,
    endSec: 898,
    popularDisplayPl:
      'W zakręcie zębatym hipokampa i korze przedczołowej trening długoterminowo sprzyja lepszej sieci naczyń i plastyczności. A pytanie o to, ile nowych neuronów rodzi się w dorosłym ludzkim mózgu, pozostaje jedną z najbardziej fascynujących debat nauki.',
    popularTtsPl:
      'W zakręcie zębatym hipokampa i korze przedczołowej trening długoterminowo sprzyja lepszej sieci naczyń i plastyczności. A pytanie o to, ile nowych neuronów rodzi się w dorosłym ludzkim mózgu, pozostaje jedną z najbardziej fascynujących debat nauki.',
    academicDisplayPl:
      'Należy wyraźnie odróżnić plastyczność synaptyczną, przebudowę dendrytyczną, synaptogenezę i angiogenezę od neurogenezy. Istnienie i skala neurogenezy w dorosłym zakręcie zębatym człowieka pozostają przedmiotem debaty badawczej, a wyniki na gryzoniach nie podlegają prostej ekstrapolacji po pojedynczej sesji HIIT.',
    academicTtsPl:
      'Należy wyraźnie odróżnić plastyczność synaptyczną, przebudowę dendrytyczną, synaptogenezę i angiogenezę od neurogenezy. Istnienie i skala neurogenezy w dorosłym zakręcie zębatym człowieka pozostają przedmiotem debaty badawczej, a wyniki na gryzoniach nie podlegają prostej ekstrapolacji po pojedynczej sesji wysiłku.',
  },

  // ================= AKT XI (900 - 990s) =================
  {
    id: 'act-11-s01',
    actId: 11,
    startSec: 903,
    endSec: 942,
    popularDisplayPl:
      'Opuszczamy głębiny kory mózgowej i wracamy na siłownię. Trening dobiega końca. Oddech zwalnia, serce łagodnieje, a nerw błędny przejmuje kontrolę, przywracając ciału spokojną równowagę.',
    popularTtsPl:
      'Opuszczamy głębiny kory mózgowej i wracamy na siłownię. Trening dobiega końca. Oddech zwalnia, serce łagodnieje, a nerw błędny przejmuje kontrolę, przywracając ciału spokojną równowagę.',
    academicDisplayPl:
      'Po zakończeniu interwałów następuje stopniowa reaktywacja przywspółczulna i wygaszanie napędu współczulnego. Zwiększone powysiłkowe zużycie tlenu obsługuje resyntezę fosfokreatyny, utlenianie i glukoneogenezę mleczanu oraz regulację temperatury ciała.',
    academicTtsPl:
      'Po zakończeniu interwałów następuje stopniowa reaktywacja przywspółczulna i wygaszanie napędu współczulnego. Zwiększone powysiłkowe zużycie tlenu obsługuje resyntezę fosfokreatyny, utlenianie i glukoneogenezę mleczanu oraz regulację temperatury ciała.',
  },
  {
    id: 'act-11-s02',
    actId: 11,
    startSec: 946,
    endSec: 986,
    popularDisplayPl:
      'Spokój i jasność umysłu po dobrym wysiłku nie płyną z jednej cudownej substancji. To efekt współdziałania autonomicznego wyciszenia, sygnałów mózgowych, regeneracji mięśni oraz nadchodzącego nocą głębokiego snu.',
    popularTtsPl:
      'Spokój i jasność umysłu po dobrym wysiłku nie płyną z jednej cudownej substancji. To efekt współdziałania autonomicznego wyciszenia, sygnałów mózgowych, regeneracji mięśni oraz nadchodzącego nocą głębokiego snu.',
    academicDisplayPl:
      'Subiektywny dobrostan powysiłkowy integruje równoległą modulację endokannabinoidową, ośrodkowe układy opioidowe i monoaminergiczne, obniżenie napięcia somatycznego i czynniki psychologiczne. Kluczowe procesy naprawcze oraz konsolidacja pamięci i plastyczności wymagają odpowiedniego odpoczynku i snu.',
    academicTtsPl:
      'Subiektywny dobrostan powysiłkowy integruje równoległą modulację endokannabinoidową, ośrodkowe układy opioidowe i monoaminergiczne, obniżenie napięcia somatycznego i czynniki psychologiczne. Kluczowe procesy naprawcze oraz konsolidacja pamięci i plastyczności wymagają odpowiedniego odpoczynku i snu.',
  },

  // ================= AKT XII (990 - 1080s) =================
  {
    id: 'act-12-s01',
    actId: 12,
    startSec: 993,
    endSec: 1034,
    popularDisplayPl:
      'Rozciągamy teraz czas na tygodnie, miesiące i cały rok. Jeden trening wysyła molekularne zaproszenie do zmiany; dopiero regularność przeplatana snem i regeneracją buduje gęstsze sieci mitochondriów, wydolniejsze serce i odporniejszy układ nerwowy.',
    popularTtsPl:
      'Rozciągamy teraz czas na tygodnie, miesiące i cały rok. Jeden trening wysyła molekularne zaproszenie do zmiany; dopiero regularność przeplatana snem i regeneracją buduje gęstsze sieci mitochondriów, wydolniejsze serce i odporniejszy układ nerwowy.',
    academicDisplayPl:
      'Wyróżniamy trzy skale czasowe: skutki ostre podczas sesji, okno powysiłkowe do czterdziestu ośmiu godzin z ekspresją PGC-1α i wzrostem wrażliwości insulinowej GLUT4 oraz adaptacje przewlekłe: wzrost objętości wyrzutowej serca, kapilaryzację i biogenezę mitochondriów.',
    academicTtsPl:
      'Wyróżniamy trzy skale czasowe: skutki ostre podczas sesji, okno powysiłkowe do czterdziestu ośmiu godzin z ekspresją pe gie ce jeden alfa i wzrostem wrażliwości insulinowej glut cztery oraz adaptacje przewlekłe: wzrost objętości wyrzutowej serca, kapilaryzację i biogenezę mitochondriów.',
  },
  {
    id: 'act-12-s02',
    actId: 12,
    startSec: 1038,
    endSec: 1076,
    popularDisplayPl:
      'Każdy organizm reaguje inaczej — wpływ mają geny, sen, regeneracja i stan zdrowia. Zwykłe kilkanaście minut na bieżni to w rzeczywistości dialog między ruchem mięśni a architekturą naszego mózgu.',
    popularTtsPl:
      'Każdy organizm reaguje inaczej, wpływ mają geny, sen, regeneracja i stan zdrowia. Zwykłe kilkanaście minut na bieżni to w rzeczywistości dialog między ruchem mięśni a architekturą naszego mózgu.',
    academicDisplayPl:
      'Adaptacje poznawcze i neuroplastyczne, w tym ochrona objętości hipokampa w badaniach długoterminowych, nie są mechaniczną gwarancją i zależą od dawkowania obciążeń, zdrowia oraz zmienności indywidualnej. Niniejsza symulacja ma wyłącznie charakter poglądowy i edukacyjny.',
    academicTtsPl:
      'Adaptacje poznawcze i neuroplastyczne, w tym ochrona objętości hipokampa w badaniach długoterminowych, nie są mechaniczną gwarancją i zależą od dawkowania obciążeń, zdrowia oraz zmienności indywidualnej. Niniejsza symulacja ma wyłącznie charakter poglądowy i edukacyjny.',
  },
];
