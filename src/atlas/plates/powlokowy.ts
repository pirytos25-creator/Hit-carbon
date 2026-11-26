import type { AtlasPlateContent } from '../types';

/**
 * Plansza „Skóra (układ powłokowy)” (faza 1b, agent 7). Render: blender/atlas/plate_powlokowy.py.
 *
 * Plansza w SKALI SESJI (docs/ATLAS_MODEL_ARCHITEKTONICZNY.md §4 pkt 10): chłodzenie przez skórę rozkręca się w minutach.
 * - „Spoczynek” = przed treningiem.
 * - „Sprint” = koniec treningu 6 × (45 s / 45 s), czyli ostatnie interwały (decyzja Dyrygenta, audyt K1).
 * - Kolejność w czasie (start: zwężenie naczyń skóry w sekundach; po minutach: rozszerzenie i wyraźny wzrost pocenia;
 *   po wysiłku: szybki spadek pocenia i przepływu skórnego, ciepło zostaje w ciele) jest w tekście i w `measuredAt`.
 *
 * Fakty: docs/atlas_audyt/fakty_powlokowy.md (numery # = wiersze audytu). Statusy: potwierdzone bez zmian → `checked_agent`;
 * poprawione po audycie K2 → `draft` (do ponownego sprawdzenia). Opisy czysto anatomiczne (budowa, położenie) mają
 * status `draft` z dopiskiem „opis anatomiczny”; status `anatomy` może nadać tylko sprawdzający.
 * Jasność skóry w sprincie (3 stopnie wg mapy pocenia Smith i Havenith 2011) to ilustracja, nie liczba.
 * Łacina: terminy TA98/TA2; opisowe (np. „cutis frontis”) i histologiczne („porus sudoriferus”) usunięte.
 */
export const POWLOKOWY: AtlasPlateContent = {
  id: 'powlokowy',
  titlePl: 'Skóra (układ powłokowy)',
  subtitlePl: 'Jak skóra pozbywa się ciepła z pracujących mięśni',
  colorVar: '--sys-skin',
  views: ['front', 'back', 'detail'],
  viewTitlesPl: { front: 'Widok z przodu', back: 'Widok z tyłu', detail: 'Przekrój skóry (schemat)' },
  protocolNotePl:
    'Naczynia skóry zwężają się już w pierwszych sekundach wysiłku, ale chłodzenie przez skórę (rozszerzone naczynia, obfity pot) rozkręca się w minutach. Dlatego „Sprint” na tej planszy to koniec treningu 6 × (45 s pracy / 45 s przerwy), a nie pojedyncze 45 s.',
  summary: {
    rest: 'Przed treningiem ciało wytwarza mało ciepła, a skóra spokojnie oddaje je do otoczenia.',
    sprint:
      'Obraz „Sprint” pokazuje skórę pod koniec treningu. Pracujące mięśnie zamieniają w ciepło ponad 3/4 zużytej energii. Na samym starcie wysiłku naczynia skóry się zwężają, choć pocenie może lekko wzrosnąć już w pierwszej minucie. Gdy temperatura wewnętrzna rośnie, naczynia skóry się rozszerzają, a pocenie wyraźnie przybiera, najmocniej na czole i tułowiu. Skóra i mięśnie konkurują wtedy o krew, zwłaszcza w upale. Po treningu pocenie i przepływ krwi w skórze szybko spadają, a ciepło zostaje w ciele jeszcze przez kilkadziesiąt minut.',
  },
  summaryReferenceIds: {
    rest: ['periard_2021'],
    sprint: [
      'wendt_2007',
      'gonzalez_alonso_2008',
      'johnson_2010',
      'yanagimoto_2003',
      'baker_2019',
      'smith_havenith_2011',
      'kenny_2007',
      'kenny_2008',
    ],
  },
  summaryStatus: { rest: 'draft', sprint: 'draft' }, // #13 (dopisane źródło); #17, #19 poprawione
  labels: [
    // --- całe ciało: przód ---
    {
      anchor: 'skin_forehead',
      view: 'front',
      namePl: 'Skóra czoła',
      nameLat: 'cutis',
      role: { rest: 'Oddaje ciepło spoczynkowe do otoczenia', sprint: 'Tu pot płynie najobficiej' },
      tier: 'primary',
      referenceIds: ['periard_2021', 'smith_havenith_2011'],
      roleStatus: { rest: 'draft', sprint: 'checked_agent' }, // #32 (dopisane źródło); #23
    },
    {
      anchor: 'skin_trunk',
      view: 'front',
      namePl: 'Skóra tułowia',
      nameLat: 'cutis',
      role: { rest: 'Oddaje ciepło spoczynkowe do otoczenia', sprint: 'Ukrwiona i spocona: oddaje ciepło' },
      tier: 'primary',
      referenceIds: ['periard_2021', 'gonzalez_alonso_2008', 'smith_havenith_2011'],
      roleStatus: { rest: 'draft', sprint: 'checked_agent' }, // #32; #25
    },
    {
      anchor: 'external_jugular',
      view: 'front',
      namePl: 'Ż. szyjna zewnętrzna',
      nameLat: 'v. jugularis externa',
      // opis anatomiczny (położenie), #32
      role: { rest: 'Biegnie pod skórą bocznej części szyi', sprint: 'Biegnie pod skórą bocznej części szyi' },
      tier: 'secondary',
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'cephalic',
      view: 'front',
      namePl: 'Żyła odpromieniowa',
      nameLat: 'v. cephalica',
      role: { rest: 'Odprowadza krew ze skóry ręki', sprint: 'Odprowadza więcej krwi ze skóry ręki' },
      tier: 'primary',
      referenceIds: ['gonzalez_alonso_2008'],
      roleStatus: { sprint: 'checked_agent' }, // #26
    },
    {
      anchor: 'median_cubital',
      view: 'front',
      namePl: 'Ż. pośrodkowa łokcia',
      nameLat: 'v. mediana cubiti',
      // opis anatomiczny (połączenie żył), #32
      role: { rest: 'Łączy ż. odpromieniową i odłokciową', sprint: 'Łączy ż. odpromieniową i odłokciową' },
      tier: 'secondary',
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'basilic',
      view: 'front',
      namePl: 'Żyła odłokciowa',
      nameLat: 'v. basilica',
      role: { rest: 'Odprowadza krew ze skóry ręki', sprint: 'Odprowadza więcej krwi ze skóry ręki' },
      tier: 'secondary',
      referenceIds: ['gonzalez_alonso_2008'],
      roleStatus: { sprint: 'checked_agent' }, // #26
    },
    {
      anchor: 'hand_veins',
      view: 'front',
      namePl: 'Sieć żylna grzbietowa ręki',
      nameLat: 'rete venosum dorsale manus',
      // opis anatomiczny (położenie), #32, #33
      role: { rest: 'Pod skórą grzbietu dłoni', sprint: 'Pod skórą grzbietu dłoni' },
      tier: 'secondary',
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'great_saphenous',
      view: 'front',
      namePl: 'Żyła odpiszczelowa',
      nameLat: 'v. saphena magna',
      role: { rest: 'Odprowadza krew ze skóry nogi', sprint: 'Odprowadza więcej krwi ze skóry nogi' },
      tier: 'primary',
      referenceIds: ['gonzalez_alonso_2008'],
      roleStatus: { sprint: 'checked_agent' }, // #26
    },
    // --- całe ciało: tył ---
    {
      anchor: 'skin_back',
      view: 'back',
      namePl: 'Skóra pleców',
      nameLat: 'cutis',
      role: { rest: 'Oddaje ciepło spoczynkowe do otoczenia', sprint: 'Najmocniej pocąca się część tułowia' },
      tier: 'primary',
      referenceIds: ['periard_2021', 'smith_havenith_2011'],
      roleStatus: { rest: 'draft', sprint: 'draft' }, // #32; #24 poprawione („najmocniej na tułowiu”)
    },
    {
      anchor: 'small_saphenous',
      view: 'back',
      namePl: 'Żyła odstrzałkowa',
      nameLat: 'v. saphena parva',
      role: { rest: 'Odprowadza krew ze skóry łydki', sprint: 'Odprowadza więcej krwi ze skóry łydki' },
      tier: 'secondary',
      referenceIds: ['gonzalez_alonso_2008'],
      roleStatus: { sprint: 'checked_agent' }, // #26
    },
    // --- przekrój skóry (schemat) ---
    {
      anchor: 'epidermis',
      view: 'detail',
      namePl: 'Naskórek',
      nameLat: 'epidermis',
      role: { rest: 'Zewnętrzna warstwa skóry', sprint: 'Pot wypływa porami na powierzchnię' },
      tier: 'primary',
      referenceIds: ['baker_2019'],
      roleStatus: { rest: 'draft', sprint: 'checked_agent' }, // opis anatomiczny; #30
    },
    {
      anchor: 'sweat_pore',
      view: 'detail',
      namePl: 'Por potowy',
      role: { rest: 'Ujście przewodu gruczołu potowego', sprint: 'Wypływa nim pot' },
      tier: 'secondary',
      referenceIds: ['baker_2019'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #30 (łacina histologiczna usunięta, #33)
    },
    {
      anchor: 'dermis',
      view: 'detail',
      namePl: 'Skóra właściwa',
      nameLat: 'dermis',
      role: { rest: 'Naczynia, gruczoły i mieszki włosowe', sprint: 'Więcej krwi w rozszerzonych naczyniach' },
      tier: 'primary',
      referenceIds: ['gonzalez_alonso_2008'],
      roleStatus: { rest: 'draft', sprint: 'checked_agent' }, // opis anatomiczny; #27
    },
    {
      anchor: 'vessels_sup',
      view: 'detail',
      namePl: 'Naczynia krwionośne skóry',
      role: { rest: 'Węższe: skóra dostaje mniej krwi', sprint: 'Rozszerzone: krew oddaje ciepło skórze' },
      tier: 'primary',
      referenceIds: ['gonzalez_alonso_2008', 'johnson_1992'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #28
    },
    {
      anchor: 'arrector_pili',
      view: 'detail',
      namePl: 'Mięsień przywłosowy',
      nameLat: 'm. arrector pili',
      // opis anatomiczny (przyczep), #32
      role: { rest: 'Drobny mięsień przy mieszku włosowym', sprint: 'Drobny mięsień przy mieszku włosowym' },
      tier: 'secondary',
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'sebaceous',
      view: 'detail',
      namePl: 'Gruczoł łojowy',
      nameLat: 'glandula sebacea',
      // opis anatomiczny (ujście), #32
      role: { rest: 'Uchodzi do mieszka włosowego', sprint: 'Uchodzi do mieszka włosowego' },
      tier: 'secondary',
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'hair_follicle',
      view: 'detail',
      namePl: 'Mieszek włosowy',
      nameLat: 'folliculus pili',
      // opis anatomiczny, #32
      role: { rest: 'Otacza korzeń włosa', sprint: 'Otacza korzeń włosa' },
      tier: 'secondary',
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
    {
      anchor: 'sweat_gland',
      view: 'detail',
      namePl: 'Gruczoł potowy ekrynowy',
      nameLat: 'glandula sudorifera',
      role: { rest: 'Kłębek i przewód do poru', sprint: 'Wydziela pot; jego parowanie chłodzi' },
      tier: 'primary',
      referenceIds: ['baker_2019', 'wendt_2007'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #31 (nazwy wg #33)
    },
    {
      anchor: 'vessels_deep',
      view: 'detail',
      namePl: 'Głęboka sieć naczyń skóry',
      role: { rest: 'Doprowadza krew do skóry', sprint: 'Doprowadza do skóry ciepłą krew' },
      tier: 'secondary',
      referenceIds: ['gonzalez_alonso_2008'],
      roleStatus: { rest: 'draft', sprint: 'checked_agent' }, // opis anatomiczny; #29
    },
    {
      anchor: 'hypodermis',
      view: 'detail',
      namePl: 'Tkanka podskórna',
      nameLat: 'tela subcutanea',
      // opis anatomiczny (budowa i położenie), #32
      role: { rest: 'Warstwa tłuszczu pod skórą właściwą', sprint: 'Warstwa tłuszczu pod skórą właściwą' },
      tier: 'primary',
      roleStatus: { rest: 'draft', sprint: 'draft' },
    },
  ],
  metrics: [
    {
      labelPl: 'Energia z pracy mięśni zamieniana w ciepło',
      rest: '—',
      sprint: 'ponad 75',
      unit: '%',
      referenceIds: ['wendt_2007', 'periard_2021'],
      evidenceLevel: 'established_human',
      notePl: 'Tylko ok. 20–25% energii idzie na ruch; resztę ciało musi oddać jako ciepło.',
      status: 'checked_agent', // #1, #2
      measuredAt: 'w trakcie każdej pracy',
      quote:
        'As a result of the inefficiency of metabolic transfer, >75% of the energy that is generated by skeletal muscle substrate oxidation is liberated as heat.',
      locator: 'Wendt 2007, abstrakt; Périard 2021, §2.3.2.1',
      tier: 'primary',
    },
    {
      labelPl: 'Temperatura wewnętrzna (w przełyku)',
      rest: '36,8',
      sprint: '38,1 (15 min po: 37,4)',
      unit: '°C',
      referenceIds: ['kenny_mcginn_2017'],
      evidenceLevel: 'established_human',
      notePl:
        'W badaniu: 15 min ciągłej jazdy przy 75% VO₂max. Po treningu 6 × 45 s temperatura będzie raczej niższa. Po wysiłku spada powoli: ciało oddaje ciepło wolniej, niż je zebrało.',
      status: 'draft', // #3 (dopisany kierunek błędu), #4
      measuredAt: 'przed wysiłkiem; koniec wysiłku; 15 min po wysiłku (siedząc)',
      protocolMismatch: '15 min ciągłej jazdy na rowerze przy 75% VO₂max, 24 °C (większe obciążenie cieplne niż 6 × 45 s)',
      quote:
        'Ex: 24°C, 45% RH, cycling at 75% V̇o2max for 15 min; Rec: upright seated, 24°C (60 min) | Teso | 36.8 | 38.1 | 37.4 | 37.4 | 37.1',
      locator: 'Kenny i McGinn 2017, tabela 3, wiersz badania (67)',
      tier: 'primary',
    },
    {
      labelPl: 'Pot: czoło i dłoń',
      rest: '—',
      sprint: 'czoło ok. 1,7; dłoń ok. 0,12',
      unit: 'L na m² skóry na godzinę',
      referenceIds: ['smith_havenith_2011'],
      evidenceLevel: 'established_human',
      notePl: 'Na czole ok. 14 razy więcej potu niż na dłoni. Najwięcej pocą się też plecy.',
      status: 'checked_agent', // #5, #6 (poprawiona tylko kolejność fragmentów cytatu)
      measuredAt: 'ostatnie 5 min biegu przy 75% VO₂max (55.–60. min)',
      protocolMismatch: 'bieg przy 75% VO₂max po 30 min przy 55%, 25 °C, wytrenowani biegacze',
      conversionNote: '1 g potu ≈ 1 mL: 1710 g/m²/h ≈ 1,7 L/m²/h; 119 g/m²/h ≈ 0,12 L/m²/h; 1710 / 119 ≈ 14.',
      quote:
        'Lowest values were observed on the fingers, thumbs, and palms, with values of 144, 254, and 119 g m-2 h-1, respectively at I2. Sweat mapping of the head demonstrated high sweat rates on the forehead (1,710 g m-2 h-1 at I2)',
      locator: 'Smith i Havenith 2011, abstrakt',
      tier: 'primary',
    },
    {
      labelPl: 'Ciepło oddane w odpoczynku po wysiłku (tak długim jak wysiłek)',
      rest: '—',
      sprint: '30–50',
      unit: '% ciepła zebranego w wysiłku',
      referenceIds: ['kenny_mcginn_2017'],
      evidenceLevel: 'established_human',
      notePl:
        'Dotyczy odpoczynku po wysiłku trwającym kilkanaście do kilkudziesięciu minut, nie krótkich przerw 45 s między interwałami.',
      status: 'draft', // #7, #8 poprawione (bez przenoszenia na interwały)
      measuredAt: 'odpoczynek po wysiłku, tak długi jak wysiłek',
      protocolMismatch: 'wysiłek i odpoczynek po 15–60 min (1:1), nie 45 s / 45 s',
      quote:
        'only 30–50% of the heat gained during exercise is lost during a recovery of similar duration (based on 1:1 work to rest ratio)',
      locator: 'Kenny i McGinn 2017, rozdz. „Postexercise Thermoregulatory Control”, akapit 1',
      tier: 'primary',
    },
    {
      labelPl: 'Przepływ krwi w skórze: górna granica w wysiłku',
      rest: '—',
      sprint: 'ok. 50 (przy ok. 38 °C)',
      unit: '% maksimum',
      referenceIds: ['gonzalez_alonso_2008', 'johnson_2010'],
      evidenceLevel: 'established_human',
      notePl:
        'To granica osiągana przy temperaturze wewnętrznej ok. 38 °C, nie stan po krótkim HIIT. Powyżej niej wysiłek hamuje dalsze rozszerzanie naczyń skóry, a krwi potrzebują też mięśnie.',
      status: 'draft', // #9 poprawione (warunek 38 °C), #10
      measuredAt: 'długi wysiłek, temperatura wewnętrzna ok. 38 °C',
      protocolMismatch: 'długi wysiłek o umiarkowanej intensywności, zwłaszcza w cieple',
      quote:
        'skin blood flow reaches an apparent upper limit at an internal temperature of around 38°C … This occurs at a skin blood flow estimated to be around 50% of maximal',
      locator: 'González-Alonso 2008, rozdz. o przepływie skórnym, ryc. 2',
      tier: 'secondary',
    },
    {
      labelPl: 'Parowanie potu 10 min po wysiłku',
      rest: '—',
      sprint: 'ok. 23',
      unit: '% wartości z końca wysiłku',
      referenceIds: ['kenny_2008'],
      evidenceLevel: 'established_human',
      notePl: 'Pocenie gaśnie szybko, choć temperatura wewnętrzna jest wciąż podwyższona.',
      status: 'draft', // #11 (dopisana niska intensywność), #12
      measuredAt: '10 min po wysiłku',
      protocolMismatch: '60 min jazdy na rowerze przy 70 W (niska intensywność), 30 °C, 8 osób',
      quote:
        'After a 10-min recovery, metabolic heat production returned to pre-exercise levels, and H(E) was only 22.9 +/- 6.9% of the end-exercise value despite elevations in all core temperatures.',
      locator: 'Kenny 2008, abstrakt (Results)',
      tier: 'secondary',
    },
  ],
  // Strzałki: public/atlas/powlokowy/flows3d.json (metry, układ Z-Anatomy). Żyły w górę, tętnica w dół (kierunek
  // z topologii drzewa naczyń Z-Anatomy); strzałki `heat` = ciepło uchodzące przez skórę. Brak strzałek w pikselach.
  creditsPl:
    'Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP): szkielet, mięśnie, żyły powierzchowne; sylwetka skóry wyliczona z tych modeli. Schemat przekroju skóry: BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
