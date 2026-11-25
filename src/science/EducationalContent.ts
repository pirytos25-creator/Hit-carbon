import { ActId, EvidenceLevel, ScientificClaim } from '../types/biogenesis';

export const EVIDENCE_LEVEL_META: Record<
  EvidenceLevel,
  { labelPl: string; badgeColor: string; descriptionPl: string }
> = {
  established_human: {
    labelPl: 'Dobrze udokumentowany fakt (ludzie)',
    badgeColor: '#34d399',
    descriptionPl: 'Zjawisko spójnie potwierdzone w badaniach eksperymentalnych u ludzi i kanonicznej fizjologii.',
  },
  probable_human: {
    labelPl: 'Prawdopodobny mechanizm u ludzi',
    badgeColor: '#38bdf8',
    descriptionPl: 'Silne dowody z metaanaliz, badań PET/fMRI oraz zbieżnych badań translacyjnych.',
  },
  preliminary_human: {
    labelPl: 'Wstępne wyniki badań u ludzi',
    badgeColor: '#fbbf24',
    descriptionPl: 'Wyniki obiecujące, lecz oparte na niewielkich próbach lub zależne od szczegółów protokołu.',
  },
  animal_model: {
    labelPl: 'Model zwierzęcy (brak automatycznej ekstrapolacji)',
    badgeColor: '#fb923c',
    descriptionPl: 'Mechanizm zbadany inwazyjnie u gryzoni (np. mikrodializa, nokauty); u ludzi wymaga ostrożności.',
  },
  contested_debate: {
    labelPl: 'Obszar aktywnej debaty naukowej',
    badgeColor: '#f472b6',
    descriptionPl: 'W literaturze funkcjonują sprzeczne wyniki lub ograniczenia metodologiczne.',
  },
};

export const SCIENTIFIC_CLAIMS: ScientificClaim[] = [
  {
    id: 'act1_integrated_response',
    actId: 1,
    titlePl: 'Zintegrowana mobilizacja wieloukładowa na starcie wysiłku',
    popularSummaryPl:
      'Gdy przyspieszasz z marszu do biegu interwałowego, układ nerwowy, oddechowy, krążenia i mięśnie reagują równocześnie jak jedna orkiestra, a nie oddzielne narządy.',
    academicDetailPl:
      'Już w pierwszych sekundach aktywności mechanizm centralnego napędu (central command) wraz ze sprzężeniem zwrotnym z ergoreceptorów mięśniowych (włókna III/IV) przestawia układ autonomiczny, zwiększając wentylację pęcherzykową i rzut serca.',
    evidenceLevel: 'established_human',
    limitationsPl: 'Dynamika przejściowa zależy od wieku, wytrenowania krążeniowo-oddechowego i pozycji ciała.',
    referenceIds: ['kenney_2022', 'macinnis_gibala_2017'],
  },
  {
    id: 'act2_motor_autonomic',
    actId: 2,
    titlePl: 'Kora ruchowa, rekrutacja jednostek motorycznych i przełączenie autonomiczne',
    popularSummaryPl:
      'Mózg planuje ruch ułamek sekundy przed pierwszym krokiem. Fale jonowe biegną wzdłuż nerwów do mięśni, a układ współczulny i nadnercza przestawiają ciało w tryb wysokiej wydajności.',
    academicDetailPl:
      'Potencjał czynnościowy nie jest błyskawicą elektryczną — to propagująca depolaryzacja błony (kanały Na⁺/K⁺). W złączu nerwowo-mięśniowym acetylocholina otwiera receptory nikotynowe. Równolegle wycofanie tonusu nerwu błędnego podnosi tętno już poniżej ~100 ud./min, a powyżej tej wartości dominuje noradrenalina z włókien współczulnych i adrenalina z rdzenia nadnerczy (~80% katecholamin nadnerczowych).',
    evidenceLevel: 'established_human',
    mythCorrectionPl: 'Impuls nerwowy to fala jonowa w błonie komórkowej, a nie iskra elektryczna w pustej przestrzeni.',
    limitationsPl: 'Udział kory i rdzenia podczas zmęczenia wykazuje zmienność osobniczą.',
    referenceIds: ['kandel_2021', 'taylor_gandevia_2001', 'kenney_2022'],
  },
  {
    id: 'act3_cardiopulmonary',
    actId: 3,
    titlePl: 'Hemodynamika serca, wymiana pęcherzykowa i redystrybucja przepływu',
    popularSummaryPl:
      'Węzeł zatokowy przyspiesza rytm, komory pompują więcej krwi na każde uderzenie, a w mikroskopijnych pęcherzykach płucnych tlen przenika do erytrocytów niosących go wprost do pracujących nóg.',
    academicDetailPl:
      'Pojemność minutowa serca (Q = HR × SV) rośnie z ~5 l/min do ponad 20–25 l/min dzięki tachykardii oraz wzrostowi objętości wyrzutowej (mechanizm Franka-Starlinga i efekt inotropowy). W płucach dyfuzja O₂ i CO₂ przebiega zgodnie z gradientem ciśnień cząstkowych przez barierę ~0,5 μm. Krążenie przekierowuje do 80–85% rzutu do pracujących mięśni kosztem łożyska trzewnego.',
    evidenceLevel: 'established_human',
    limitationsPl: 'Maksymalna objętość wyrzutowa i VO₂max różnią się kilkukrotnie między osobami nietrenującymi i wyczynowymi.',
    referenceIds: ['kenney_2022'],
  },
  {
    id: 'act4_sarcomere',
    actId: 4,
    titlePl: 'Mechanizm ślizgowy sarkomeru i rola ATP w skurczu i rozkurczu',
    popularSummaryPl:
      'Jony wapnia z siateczki sarkoplazmatycznej odsłaniają miejsca wiązania na aktynie. Miliony główek miozyny wykonują skoordynowane pociągnięcia, a świeże ATP jest niezbędne również po to, by mogły się odczepić.',
    academicDetailPl:
      'Zasada wielkości Hennemana powoduje stopniową rekrutację włókien: najpierw wolnych oksydacyjnych (Typ I), następnie szybkich oksydacyjno-glikolitycznych (IIa), a przy maksymalnych interwałach HIIT także szybko kurczących się IIx. Ca²⁺ wiąże troponinę C, przesuwając tropomiozynę. Wiązanie nowego ATP zrywa mostek poprzeczny (brak ATP prowadzi do stanu rygoru), a hydroliza ATP napina główkę przed kolejnym cyklem.',
    evidenceLevel: 'established_human',
    mythCorrectionPl: 'ATP nie tylko „napędza” skurcz — jest bezwzględnie konieczne do rozłączenia aktyny i miozyny oraz powrotnego wpompowania Ca²⁺ przez pompę SERCA.',
    limitationsPl: 'Wizualizacja molekularna spowalnia cykle zachodzące fizjologicznie dziesiątki razy na sekundę.',
    referenceIds: ['kenney_2022', 'baker_2010'],
  },
  {
    id: 'act5_energy_mito_lactate',
    actId: 5,
    titlePl: 'Współpraca systemów energetycznych, syntaza ATP i czółenko mleczanowe',
    popularSummaryPl:
      'Wszystkie trzy systemy energetyczne pracują jednocześnie, zmieniając proporcje z sekundą wysiłku. W mitochondriach gradient protonów napędza molekularną turbinę syntazy ATP, a mleczan okazuje się cennym paliwem, nie odpadem.',
    academicDetailPl:
      'Według Baker i wsp. (2010) zapotrzebowanie na ATP rośnie lokalnie nawet 1000-krotnie, lecz wewnątrzkomórkowe stężenie ATP jest rygorystycznie buforowane przez fosfokreatynę (kinaza kreatynowa), glikolizę i fosforylację oksydacyjną. W ~75 s maksymalnego wysiłku udział tlenowy i beztlenowy zrównują się (~50/50). Zgodnie z teorią czółenka mleczanowego (Brooks, 2018) mleczan powstaje również w pełni tlenowo i przez transportery MCT1/MCT4 zasila mięsień sercowy, włókna Typu I oraz mózg.',
    evidenceLevel: 'established_human',
    mythCorrectionPl: 'Mleczan nie jest toksycznym odpadem wywołującym opóźnioną bolesność mięśniową (DOMS) — to kluczowy łącznik między metabolizmem glikolitycznym a tlenowym.',
    limitationsPl: 'Procentowe udziały w symulatorze mają charakter modelowy i zależą od dostępności glikogenu oraz wydolności mitochondrialnej.',
    referenceIds: ['baker_2010', 'brooks_2009', 'brooks_2018', 'macinnis_gibala_2017'],
  },
  {
    id: 'act6_hiit_fatigue',
    actId: 6,
    titlePl: 'Wieloczynnikowe zmęczenie w szczycie interwału HIIT',
    popularSummaryPl:
      'Zmęczenie pod koniec ostrego interwału nie wynika z jednej „złej” cząsteczki. To ochronny hamulec łączący spadek fosfokreatyny, zmiany jonowe, ciepło i sygnały z mózgu.',
    academicDetailPl:
      'Zmęczenie obwodowe obejmuje wyczerpywanie PCr, akumulację nieorganicznego fosforanu (Pi) upośledzającą wiązanie mostków i uwalnianie Ca²⁺, zmiany równowagi kwasowo-zasadowej (H⁺) oraz termoregulacyjne obciążenie podwzgórza. Równolegle zmęczenie ośrodkowe (Taylor & Gandevia, 2001) zmniejsza napęd ponadrdzeniowy z kory ruchowej. W fazie aktywnego odpoczynku tlenowa resynteza PCr częściowo odbudowuje rezerwę przed kolejnym interwałem.',
    evidenceLevel: 'established_human',
    mythCorrectionPl: 'Żaden pojedynczy metabolit (w tym sam mleczan) nie wyjaśnia w całości spadku mocy mięśniowej.',
    limitationsPl: 'Próg tolerancji wysiłku zależy istotnie od motywacji, nawodnienia, temperatury otoczenia i snu.',
    referenceIds: ['baker_2010', 'taylor_gandevia_2001', 'kenney_2022'],
  },
  {
    id: 'act7_crosstalk_bbb',
    actId: 7,
    titlePl: 'Miokiny, komunikacja mięśnie–mózg i selektywność bariery krew–mózg (BBB)',
    popularSummaryPl:
      'Kurczące się mięśnie wysyłają we krwi posłańców — m.in. interleukinę-6 i mleczan. Jednak bariera krew–mózg działa jak ścisła kontrola graniczna: nie wpuszcza krążących z krwi neuroprzekaźników.',
    academicDetailPl:
      'Skurcz uwalnia miokiny (Pedersen & Febbraio, 2012): IL-6 stymuluje wątrobową produkcję glukozy i oksydację tłuszczów przez AMPK (bez prozapalnej kaskady TNF-α typowej dla sepsy). Mleczan przenika BBB przez MCT1. Mięśniowe PGC-1α zwiększa ekspresję aminotransferaz kinureniny (KAT), przekształcając neurotoksyczną kinureninę w nieprzenikający BBB kwas kinureninowy (Pedersen, 2019). Natomiast status irysyny (FNDC5) u ludzi pozostaje przedmiotem debaty z uwagi na wadliwe testy ELISA (Albrecht 2015 vs Jedrychowski 2015 vs Maak 2021). Obwodowa dopamina, serotonina ani noradrenalina nie przekraczają swobodnie BBB.',
    evidenceLevel: 'contested_debate',
    mythCorrectionPl: 'Adrenalina czy serotonina uwalniane na obwodzie nie przenikają swobodnie do mózgu — sygnał dociera m.in. przez włókna aferentne (np. nerw błędny), metabolity i selektywne transportery.',
    limitationsPl: 'Udział katepsyny B i irysyny w bezpośredniej sygnalizacji mięśnie–mózg udowodniono głównie w modelach mysich.',
    referenceIds: ['pedersen_febbraio_2012', 'pedersen_2019', 'severinsen_pedersen_2020', 'albrecht_2015', 'jedrychowski_2015', 'maak_2021'],
  },
  {
    id: 'act8_neurochemistry',
    actId: 8,
    titlePl: 'Neurochemiczna symfonia mózgu — złożona modulacja bez prostych etykiet',
    popularSummaryPl:
      'Mózg nie ma „przycisku szczęścia” z napisem dopamina czy endorfiny. Dobrostan i czujność po treningu to współgranie dopaminy, noradrenaliny, serotoniny, endokannabinoidów, opioidów oraz glutaminianu i GABA.',
    academicDetailPl:
      'Dopamina (szlaki mezolimbiczny, mezokortykalny, nigrostriatalny) koduje motywację, ocenę kosztu wysiłku i uczenie ze wzmocnieniem. Noradrenalina z miejsca sinawego (LC) wzmacnia czujność i stosunek sygnału do szumu w korze (odróżnić od obwodowej NE!). Serotonina z jąder szwu moduluje pobudzenie, nastrój i zmęczenie ośrodkowe. Choć PET wykazał centralne wiązanie opioidów po długim biegu (Boecker 2008), blokada naltreksonem u ludzi NIE znosi euforii ani redukcji lęku (Siebers 2021) — wskazując na kluczową rolę lipofilnych endokannabinoidów (anandamid, 2-AG) działających wstecznie przez CB1, ze znaczną zmiennością międzyosobniczą.',
    evidenceLevel: 'probable_human',
    mythCorrectionPl: 'Dopamina nie jest „hormonem szczęścia”, a „runner’s high” u ludzi nie jest wyjaśnione wyłącznie przez endorfiny (które słabo przekraczają BBB).',
    limitationsPl: 'Większość bezpośrednich pomiarów zmian stężenia w poszczególnych jądrach mózgu pochodzi z mikrodializy u gryzoni (Basso & Suzuki, 2017).',
    referenceIds: ['basso_suzuki_2017', 'boecker_2008', 'siebers_2021', 'kandel_2021'],
  },
  {
    id: 'act9_synapse',
    actId: 9,
    titlePl: 'Transmisja synaptyczna: kanały jonotropowe, receptory GPCR i sygnalizacja wsteczna',
    popularSummaryPl:
      'W szczelinie synaptycznej szerokiej na zaledwie dwadzieścia nanometrów fala jonowa otwiera kanały wapniowe, uwalnia pęcherzyki z neuroprzekaźnikiem i uruchamia szybkie kanały jonowe lub wolniejsze kaskady białek G.',
    academicDetailPl:
      '9 etapów transmisji: (1) powstanie potencjału czynnościowego, (2) przewodzenie skokowe przez przewężenia Ranviera, (3) otwarcie CaV i napływ Ca²⁺, (4) fuzja pęcherzyków przez kompleks SNARE, (5) egzocytoza, (6) dyfuzja na przestrzeni ~20 nm, (7) wiązanie z receptorem, (8) odpowiedź postsynaptyczna (EPSP przez AMPA/NMDA, IPSP przez GABA_A/Cl⁻, modulacja GPCR D1/D2 lub hamowanie wsteczne 2-AG→CB1), (9) zakończenie przez transportery wychwytu zwrotnego (DAT/SERT/EAAT/GAT) i rozkład enzymatyczny.',
    evidenceLevel: 'established_human',
    limitationsPl: 'Czas reakcji oraz rozmiary błon i cząsteczek zostały powiększone i zwolnione na potrzeby edukacyjne.',
    referenceIds: ['kandel_2021'],
  },
  {
    id: 'act10_bdnf_plasticity',
    actId: 10,
    titlePl: 'BDNF, kaskady TrkB, plastyczność synaptyczna i debata o neurogenezie dorosłych',
    popularSummaryPl:
      'Wysiłek wspiera uwalnianie neurotrofiny BDNF, która pobudza receptory TrkB oraz szlaki MAPK/ERK, PI3K/Akt i PLCγ. Sprzyja to przebudowie połączeń i kolców dendrytycznych, choć nauka wciąż bada granice neurogenezy u dorosłych ludzi.',
    academicDetailPl:
      'Metaanaliza Szuhany i wsp. (2015, N=1111) wykazuje umiarkowany wzrost BDNF we krwi po pojedynczym wysiłku (g=0,46), wzmacniany treningiem regularnym (g=0,58) — jednak pomiar w surowicy/osoczu (z udziałem płytek krwi) nie jest równoznaczny z bezpośrednim stężeniem w hipokampie. Aktywacja TrkB uruchamia MAPK/ERK (transkrypcja CREB), PI3K/Akt (przeżycie i lokalna translacja) oraz PLCγ (Ca²⁺/CaMKII). Wpływ na funkcje wykonawcze PFC (Chang 2012; Moreau & Chou 2019) zależy od intensywności, chwili pomiaru i zadania. W hipokampie należy odróżnić: plastyczność synaptyczną (LTP/NMDA/AMPA), synaptogenezę, przebudowę dendrytyczną, angiogenezę oraz neurogenezę dorosłych ludzi — gdzie toczy się debata metodologiczna (Sorrells 2018 vs Boldrini 2018 i Moreno-Jiménez 2019).',
    evidenceLevel: 'contested_debate',
    mythCorrectionPl: 'Pojedyncza sesja HIIT nie „tworzy nowych neuronów od razu” i nie wzmacnia automatycznie wszystkich synaps; obwodowe BDNF ≠ bezpośredni pomiar mózgowy.',
    limitationsPl: 'Bezpośrednie ścieżki wewnątrzkomórkowe TrkB oraz neurogeneza powysiłkowa w zakręcie zębatym są najlepiej udokumentowane w modelach zwierzęcych.',
    referenceIds: ['szuhany_2015', 'chang_2012', 'moreau_chou_2019', 'erickson_2011', 'sorrells_2018', 'boldrini_2018', 'moreno_jimenez_2019', 'severinsen_pedersen_2020'],
  },
  {
    id: 'act11_recovery',
    actId: 11,
    titlePl: 'Powrót do równowagi: EPOC, reaktywacja błędna i rola snu',
    popularSummaryPl:
      'Po zatrzymaniu bieżni organizm nie wraca od razu do stanu sprzed wysiłku: zużywa więcej tlenu na odbudowę fosfokreatyny, utlenianie mleczanu i schłodzenie ciała, a w trakcie snu utrwala procesy naprawcze i plastyczne.',
    academicDetailPl:
      'Zwiększone powysiłkowe zużycie tlenu (EPOC) obejmuje szybką komponentę (resynteza PCr, reoksygenacja mioglobiny/hemoglobiny) i wolniejszą (termoregulacja, klirens i utlenianie mleczanu lub jego przemiana w glukozę/glikogen, podwyższone katecholaminy). Równowaga autonomiczna wraca stopniowo przez reaktywację przywspółczulną (wzrost zmienności rytmu zatokowego HRV). Subiektywne odczucie odprężenia integruje procesy endokannabinoidowe, opioidy ośrodkowe, zmianę temperatury i kontekst psychologiczny.',
    evidenceLevel: 'established_human',
    limitationsPl: 'Czas pełnej reaktywacji przywspółczulnej po bardzo intensywnym HIIT może wynosić od kilkudziesięciu minut do 24 godzin.',
    referenceIds: ['kenney_2022', 'brooks_2018', 'basso_suzuki_2017', 'siebers_2021'],
  },
  {
    id: 'act12_long_term',
    actId: 12,
    titlePl: 'Skutki ostre, powysiłkowe i adaptacje długoterminowe (Tydzień – Rok)',
    popularSummaryPl:
      'Pojedynczy trening to impuls sygnałowy. Dopiero regularny, odpowiednio dawkowany wysiłek przeplatany regeneracją skłania serce, naczynia, mitochondria i sieci neuronalne do trwałej przebudowy.',
    academicDetailPl:
      'Należy wyraźnie rozdzielić: (1) skutki ostre (tachykardia, redystrybucja przepływu, aktywacja AMPK/CaMKII), (2) powysiłkowe (2–48 h: ekspresja PGC-1α mRNA, wzrost wrażliwości insulinowej GLUT4, okna funkcji poznawczych i snu) oraz (3) adaptacje przewlekłe (tygodnie–rok: wzrost objętości wyrzutowej i kapilaryzacji, biogeneza mitochondriów przez PGC-1α/NRF-1/TFAM zwiększająca gęstość sieci nawet o kilkadziesiąt procent w ciągu tygodni, poprawa gospodarki glukozowej oraz potencjalna ochrona objętości hipokampa u osób starszych — Erickson 2011). Efekty są silnie moderowane przez genetykę, odżywianie, regenerację i obciążenie stresem.',
    evidenceLevel: 'probable_human',
    mythCorrectionPl: 'Adaptacja nie jest gwarantowana samym bodźcem — następuje podczas regeneracji i zależy od indywidualnej tolerancji obciążeń.',
    limitationsPl: 'Symulator prezentuje tendencje edukacyjne i nie służy do diagnozowania ani przepisywania indywidualnych planów treningowych.',
    referenceIds: ['macinnis_gibala_2017', 'gibala_2012', 'erickson_2011', 'pedersen_2019', 'kenney_2022'],
  },
];

export function getClaimsForAct(actId: ActId): ScientificClaim[] {
  return SCIENTIFIC_CLAIMS.filter((c) => c.actId === actId);
}
