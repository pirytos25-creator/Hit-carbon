import type { AtlasPlateContent } from '../types';

/**
 * Plansza „Mózg” (agent 3). Render: blender/atlas/plate_mozg.py, kotwice: public/atlas/mozg/anchors.json.
 * Widok `side`: lewa półkula z boku. Widok `detail`: przekrój pośrodkowy (prawa półkula od środka);
 * jądra podstawy leżą bocznie od tej płaszczyzny, więc są pokazane jako półprzezroczysty rzut z obrysem.
 * Fakty: docs/atlas_audyt/fakty_mozg.md (statusy, cytaty i lokalizatory stamtąd; numery # = wiersze audytu).
 * Opisy ról w podpisach nie mają jeszcze źródła (#21-#33): na ekranie widać tylko nazwy struktur.
 */
export const MOZG: AtlasPlateContent = {
  id: 'mozg',
  titlePl: 'Mózg',
  subtitlePl: 'Kto steruje sprintem i czym mózg się wtedy żywi',
  colorVar: '--sys-brain',
  views: ['side', 'detail'],
  viewTitlesPl: { side: 'Lewa półkula z boku', detail: 'Przekrój pośrodkowy' },
  summary: {
    rest: 'W spoczynku mózg pracuje bez przerwy: zużywa ok. 20% tlenu całego ciała, spalając głównie glukozę.',
    sprint:
      'W ciężkim wysiłku mózg pobiera i spala więcej mleczanu z krwi, a pobiera mniej glukozy (w badaniach: wysiłek ciągły ok. 75% VO₂max).',
  },
  summaryReferenceIds: { rest: ['raichle_gusnard_2002'], sprint: ['van_hall_2009', 'kemppainen_2005'] },
  summaryStatus: { rest: 'draft', sprint: 'draft' }, // fakty_draft_K3_ruch.md: oba disputed -> zostały tylko zdania ze źródłem = draft
  labels: [
    // --- widok z boku (podpisy po lewej)
    {
      anchor: 'prefrontal',
      view: 'side',
      namePl: 'Kora przedczołowa',
      nameLat: 'cortex praefrontalis',
      role: { rest: 'Planowanie i decyzje', sprint: 'Tlen rośnie, spada dopiero przy maksimum' },
      tier: 'secondary',
      referenceIds: ['rooks_2010'],
      roleStatus: { rest: 'unverifiable', sprint: 'draft' }, // #23-#33; fakty_draft_K3_ruch.md: unverifiable -> bez „Pilnuje celu”, + rooks_2010 = draft
    },
    {
      anchor: 'motor_cortex',
      view: 'side',
      namePl: 'Kora ruchowa',
      nameLat: 'gyrus praecentralis',
      role: { rest: 'Niska aktywność ruchowa', sprint: 'Wysyła rozkazy do mięśni nóg i ramion' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    {
      anchor: 'sensory_cortex',
      view: 'side',
      namePl: 'Kora czuciowa',
      nameLat: 'gyrus postcentralis',
      role: { rest: 'Odbiera czucie z ciała', sprint: 'Czucie z pracujących mięśni i stóp' },
      tier: 'secondary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    {
      anchor: 'cerebellum',
      view: 'side',
      namePl: 'Móżdżek',
      nameLat: 'cerebellum',
      role: { rest: 'Napięcie mięśni i postawa', sprint: 'Koryguje każdy krok, rytm i równowagę' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    {
      anchor: 'brainstem',
      view: 'side',
      namePl: 'Pień mózgu',
      nameLat: 'truncus encephali',
      role: { rest: 'Spokojny oddech i tętno', sprint: 'Przyspiesza oddech i pracę serca' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    // --- przekrój pośrodkowy (podpisy po prawej)
    {
      anchor: 'paracentral',
      view: 'detail',
      namePl: 'Płacik okołośrodkowy',
      nameLat: 'lobulus paracentralis',
      role: { rest: 'Pole ruchowe nóg odpoczywa', sprint: 'Pole nóg kory ruchowej: pełna praca' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    {
      anchor: 'basal_ganglia',
      view: 'detail',
      namePl: 'Jądra podstawy (rzut)',
      nameLat: 'nuclei basales',
      role: { rest: 'Hamują zbędne ruchy', sprint: 'Uruchamiają i rytmizują krok' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    {
      anchor: 'thalamus',
      view: 'detail',
      namePl: 'Wzgórze',
      nameLat: 'thalamus',
      role: { rest: 'Przekaźnik czucia do kory', sprint: 'Przekazuje czucie i sygnały móżdżku' },
      tier: 'secondary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    {
      anchor: 'hypothalamus',
      view: 'detail',
      namePl: 'Podwzgórze',
      nameLat: 'hypothalamus',
      role: { rest: 'Stała temperatura i hormony', sprint: 'Chłodzenie (pot) i oś stresu' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    {
      anchor: 'vermis',
      view: 'detail',
      namePl: 'Robak móżdżku',
      nameLat: 'vermis cerebelli',
      role: { rest: 'Postawa i równowaga', sprint: 'Równowaga tułowia przy każdym kroku' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
    {
      anchor: 'medulla',
      view: 'detail',
      namePl: 'Rdzeń przedłużony',
      nameLat: 'medulla oblongata',
      role: { rest: 'Ośrodki oddechu i krążenia', sprint: 'Szybszy oddech, wyższe tętno' },
      tier: 'primary',
      roleStatus: { rest: 'unverifiable', sprint: 'unverifiable' }, // #23-#33
    },
  ],
  metrics: [
    {
      labelPl: 'Mleczan z krwi jako paliwo mózgu',
      rest: 'ok. 8',
      sprint: 'do ok. 27',
      unit: '% energii mózgu',
      referenceIds: ['van_hall_2009', 'brooks_2018', 'quistorff_2008'],
      evidenceLevel: 'probable_human',
      notePl:
        'Pomiar znakowanym mleczanem u 6 osób: wysiłek 75% VO₂max z wlewem mleczanu, nie sam sprint. Im więcej mleczanu we krwi, tym więcej pobiera go mózg.',
      protocolMismatch: '30 min jazdy przy 75% VO₂max z wlewem mleczanu',
      quote: 'The contribution of systemic lactate to cerebral energy expenditure was 8%+/-2%, 19%+/-4%, and 27%+/-4%',
      locator: 'van Hall 2009, abstrakt',
      status: 'checked_agent',
    },
    {
      labelPl: 'Pobór glukozy przez mózg (PET)',
      rest: '38,6 (lekki wysiłek, 30% VO₂max)',
      sprint: '26,1',
      unit: 'µmol/100 g/min',
      referenceIds: ['kemppainen_2005'],
      evidenceLevel: 'probable_human',
      notePl: 'Porównanie wysiłku 30% i 75% VO₂max (14 mężczyzn): ok. 32% mniej glukozy przy cięższym wysiłku. Spoczynku w tym badaniu nie mierzono.',
      protocolMismatch: '35 min jazdy przy 75% VO₂max (pobór uśredniony z 25 min)',
      quote: '38.6+/-4.6 versus 26.1+/-5.0 micromol (100 g)-1 min-1',
      locator: 'Kemppainen 2005, abstrakt',
      status: 'checked_agent', // fakty_draft_K3_ruch.md
    },
    {
      labelPl: 'Stosunek tlenu do paliwa w mózgu (CMR)',
      rest: 'ok. 6',
      sprint: 'poniżej 2',
      referenceIds: ['quistorff_2008', 'raichle_gusnard_2002'],
      evidenceLevel: 'probable_human',
      notePl:
        'W wysiłku mózg pobiera więcej glukozy i mleczanu, niż spala na bieżąco tlenem. W spoczynku mózg (ok. 2% masy ciała) zużywa ok. 20% tlenu całego ciała.',
      protocolMismatch: 'wysiłek maksymalny do wyczerpania (np. wiosłowanie)',
      quote: 'from a resting value of 6 to <2',
      locator: 'Quistorff 2008, abstrakt; Raichle & Gusnard 2002, s. 10237',
      status: 'checked_agent',
    },
    {
      labelPl: 'Przepływ krwi przez mózg',
      rest: 'wyjściowy',
      sprint: 'najpierw ↑, przy ciężkim wysiłku wraca w stronę wyjściowego',
      referenceIds: ['ogoh_ainslie_2009'],
      evidenceLevel: 'established_human',
      notePl:
        'Rośnie mniej więcej do 60% VO₂max. Przy cięższym wysiłku szybki oddech obniża CO₂ we krwi, a to zwęża naczynia mózgu.',
      protocolMismatch: 'wysiłek stopniowany',
      quote: 'CBF decreases toward baseline values because of lower Pa(CO(2))',
      locator: 'Ogoh & Ainslie 2009, abstrakt',
      status: 'checked_agent', // fakty_draft_K3_ruch.md
    },
    {
      labelPl: 'BDNF we krwi po pojedynczym wysiłku',
      rest: 'wyjściowy',
      sprint: 'umiarkowany wzrost',
      referenceIds: ['szuhany_2015', 'rasmussen_2009', 'erickson_2011'],
      evidenceLevel: 'probable_human',
      notePl:
        'Metaanaliza: efekt umiarkowany (g ≈ 0,46), mierzony we krwi, nie w mózgu. Wiele krążącego BDNF pochodzi z mózgu (8 osób, 4 h wiosłowania). Długofalowo: roczny trening aerobowy (marsz, osoby starsze) powiększył hipokamp o ok. 2% (głównie część przednią). To nie był HIIT.',
      measuredAt: 'od zaraz po wysiłku do 60 min po nim',
      protocolMismatch: 'różne pojedyncze wysiłki; udział mózgu: 4 h wiosłowania',
      quote: "Hedges' g = 0.46",
      locator: 'Szuhany 2015, abstrakt; Results, ryc. 2; Rasmussen 2009, abstrakt; Erickson 2011, abstrakt; Results (odsyłacz do tab. 2)',
      status: 'checked_agent', // fakty_draft_K3_ruch.md
    },
    {
      labelPl: 'Utlenowanie kory przedczołowej (NIRS)',
      rest: 'wyjściowe',
      sprint: 'przy 88% VO₂max zwykle ↑; spada dopiero przy VO₂max',
      referenceIds: ['rooks_2010', 'dietrich_2003'],
      evidenceLevel: 'contested_debate',
      notePl:
        'Spadek utlenowania przy wysiłku maksymalnym (≥ VO₂peak) jest zmierzony. Ale to, czy kora przedczołowa naprawdę „przygasa” (hipoteza przejściowej hipofrontalności), pozostaje sporne.',
      protocolMismatch: 'wysiłek stopniowany do maksimum',
      quote: 'After peaking at hard intensities, cerebral oxygen levels dropped during very hard intensities.',
      locator: 'Rooks 2010, abstrakt',
      status: 'checked_agent', // fakty_draft_K3_ruch.md
    },
  ],
  // Mleczan jako paliwo mózgu (brooks_2018, van_hall_2009): krew wpływa od dołu (t. kręgowe i podstawna przed pniem),
  // przez podstawę mózgu, wzdłuż t. przedniej mózgu nad ciałem modzelowatym do pola nóg kory ruchowej.
  // Schemat drogi, nie dokładny przebieg naczyń. Piksele renderu 1200×1100, widok `detail`.
  // (Z-Anatomy ma tętnice mózgu jako krzywe; przy nowym renderze można przejść na flows3d.json.)
  flows: [
    {
      view: 'detail',
      kind: 'artery',
      labelPl: 'Krew przynosi mleczan i glukozę',
      points: [
        [640, 1057],
        [585, 914],
        [505, 800],
        [452, 671],
        [414, 600],
        [314, 471],
        [371, 357],
        [543, 307],
        [671, 243],
        [757, 157],
      ],
    },
  ],
  creditsPl:
    'Model: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
