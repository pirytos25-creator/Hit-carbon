import type { AtlasPlateContent } from '../types';

/**
 * Plansza „Mózg” (agent 3). Render: blender/atlas/plate_mozg.py, kotwice: public/atlas/mozg/anchors.json.
 * Widok `side`: lewa półkula z boku. Widok `detail`: przekrój pośrodkowy (prawa półkula od środka);
 * jądra podstawy leżą bocznie od tej płaszczyzny, więc są pokazane jako półprzezroczysty rzut z obrysem.
 */
export const MOZG: AtlasPlateContent = {
  id: 'mozg',
  titlePl: 'Mózg',
  subtitlePl: 'Kto steruje sprintem i czym mózg się wtedy żywi',
  colorVar: '--sys-brain',
  views: ['side', 'detail'],
  viewTitlesPl: { side: 'Lewa półkula z boku', detail: 'Przekrój pośrodkowy' },
  summary: {
    rest: 'W spoczynku mózg pracuje bez przerwy i zużywa dużą część tlenu całego ciała, prawie wyłącznie z glukozy. Kora ruchowa, móżdżek i jądra podstawy pilnują tylko postawy, a pień mózgu utrzymuje spokojny rytm oddechu i serca.',
    sprint:
      'W sprincie kora ruchowa (zakręt przedśrodkowy i płacik okołośrodkowy z polem nóg) wysyła rozkazy do mięśni. Móżdżek i jądra podstawy dopasowują rytm i siłę kroku, pień mózgu przyspiesza oddech i pracę serca, a podwzgórze uruchamia chłodzenie i oś stresu. Mózg spala wtedy więcej mleczanu z krwi, a mniej glukozy.',
  },
  labels: [
    // --- widok z boku (podpisy po lewej)
    {
      anchor: 'prefrontal',
      view: 'side',
      namePl: 'Kora przedczołowa',
      nameLat: 'cortex praefrontalis',
      role: { rest: 'Planowanie i decyzje', sprint: 'Pilnuje celu; przy maksimum mniej tlenu' },
      tier: 'secondary',
    },
    {
      anchor: 'motor_cortex',
      view: 'side',
      namePl: 'Kora ruchowa',
      nameLat: 'gyrus praecentralis',
      role: { rest: 'Niska aktywność ruchowa', sprint: 'Wysyła rozkazy do mięśni nóg i ramion' },
      tier: 'primary',
    },
    {
      anchor: 'sensory_cortex',
      view: 'side',
      namePl: 'Kora czuciowa',
      nameLat: 'gyrus postcentralis',
      role: { rest: 'Odbiera czucie z ciała', sprint: 'Czucie z pracujących mięśni i stóp' },
      tier: 'secondary',
    },
    {
      anchor: 'cerebellum',
      view: 'side',
      namePl: 'Móżdżek',
      nameLat: 'cerebellum',
      role: { rest: 'Napięcie mięśni i postawa', sprint: 'Koryguje każdy krok, rytm i równowagę' },
      tier: 'primary',
    },
    {
      anchor: 'brainstem',
      view: 'side',
      namePl: 'Pień mózgu',
      nameLat: 'truncus encephali',
      role: { rest: 'Spokojny oddech i tętno', sprint: 'Przyspiesza oddech i pracę serca' },
      tier: 'primary',
    },
    // --- przekrój pośrodkowy (podpisy po prawej)
    {
      anchor: 'paracentral',
      view: 'detail',
      namePl: 'Płacik okołośrodkowy',
      nameLat: 'lobulus paracentralis',
      role: { rest: 'Pole ruchowe nóg odpoczywa', sprint: 'Pole nóg kory ruchowej: pełna praca' },
      tier: 'primary',
    },
    {
      anchor: 'basal_ganglia',
      view: 'detail',
      namePl: 'Jądra podstawy (rzut)',
      nameLat: 'nuclei basales',
      role: { rest: 'Hamują zbędne ruchy', sprint: 'Uruchamiają i rytmizują krok' },
      tier: 'primary',
    },
    {
      anchor: 'thalamus',
      view: 'detail',
      namePl: 'Wzgórze',
      nameLat: 'thalamus',
      role: { rest: 'Przekaźnik czucia do kory', sprint: 'Przekazuje czucie i sygnały móżdżku' },
      tier: 'secondary',
    },
    {
      anchor: 'hypothalamus',
      view: 'detail',
      namePl: 'Podwzgórze',
      nameLat: 'hypothalamus',
      role: { rest: 'Stała temperatura i hormony', sprint: 'Chłodzenie (pot) i oś stresu' },
      tier: 'primary',
    },
    {
      anchor: 'vermis',
      view: 'detail',
      namePl: 'Robak móżdżku',
      nameLat: 'vermis cerebelli',
      role: { rest: 'Postawa i równowaga', sprint: 'Równowaga tułowia przy każdym kroku' },
      tier: 'primary',
    },
    {
      anchor: 'medulla',
      view: 'detail',
      namePl: 'Rdzeń przedłużony',
      nameLat: 'medulla oblongata',
      role: { rest: 'Ośrodki oddechu i krążenia', sprint: 'Szybszy oddech, wyższe tętno' },
      tier: 'primary',
    },
  ],
  metrics: [
    {
      labelPl: 'Mleczan z krwi jako paliwo mózgu',
      rest: 'ok. 8',
      sprint: 'do ok. 27',
      unit: '% energii mózgu',
      referenceIds: ['van_hall_2009', 'brooks_2018'],
      evidenceLevel: 'probable_human',
      notePl:
        'Pomiar znakowanym mleczanem u 6 osób: wysiłek 75% VO₂max z wlewem mleczanu, nie sam sprint. Im więcej mleczanu we krwi, tym więcej pobiera go mózg.',
    },
    {
      labelPl: 'Pobór glukozy przez mózg (PET)',
      rest: '38,6',
      sprint: '26,1',
      unit: 'µmol/100 g/min',
      referenceIds: ['kemppainen_2005'],
      evidenceLevel: 'probable_human',
      notePl: 'Porównanie wysiłku 30% i 75% VO₂max (14 mężczyzn): ok. 32% mniej glukozy przy cięższym wysiłku.',
    },
    {
      labelPl: 'Stosunek tlenu do paliwa w mózgu (CMR)',
      rest: 'ok. 6',
      sprint: 'poniżej 2',
      referenceIds: ['quistorff_2008', 'raichle_gusnard_2002'],
      evidenceLevel: 'probable_human',
      notePl:
        'W wysiłku mózg pobiera więcej glukozy i mleczanu, niż spala na bieżąco tlenem. W spoczynku mózg (ok. 2% masy ciała) zużywa ok. 20% tlenu całego ciała.',
    },
    {
      labelPl: 'Przepływ krwi przez mózg',
      rest: 'wyjściowy',
      sprint: 'najpierw ↑, przy maksimum ↓',
      referenceIds: ['ogoh_ainslie_2009'],
      evidenceLevel: 'established_human',
      notePl:
        'Rośnie mniej więcej do 60% VO₂max. Przy cięższym wysiłku szybki oddech obniża CO₂ we krwi, a to zwęża naczynia mózgu.',
    },
    {
      labelPl: 'BDNF we krwi po pojedynczym wysiłku',
      rest: 'wyjściowy',
      sprint: 'umiarkowany wzrost',
      referenceIds: ['szuhany_2015', 'rasmussen_2009', 'erickson_2011'],
      evidenceLevel: 'probable_human',
      notePl:
        'Metaanaliza: efekt umiarkowany (g ≈ 0,46), mierzony we krwi, nie w mózgu, i krótkotrwały. Wiele krążącego BDNF pochodzi z mózgu (8 osób, 4 h wiosłowania). Długofalowo: roczny trening aerobowy (marsz, osoby starsze) powiększył przedni hipokamp o ok. 2%. To nie był HIIT.',
    },
    {
      labelPl: 'Utlenowanie kory przedczołowej (NIRS)',
      rest: 'wyjściowe',
      sprint: 'blisko maksimum ↓',
      referenceIds: ['rooks_2010', 'dietrich_2003'],
      evidenceLevel: 'contested_debate',
      notePl:
        'Spadek utlenowania przy wysiłku bliskim maksimum jest zmierzony. Ale to, czy kora przedczołowa naprawdę „przygasa” (hipoteza przejściowej hipofrontalności), pozostaje sporne.',
    },
  ],
  // Mleczan jako paliwo mózgu (brooks_2018, van_hall_2009): krew wpływa od dołu (t. kręgowe i podstawna przed pniem),
  // przez podstawę mózgu, wzdłuż t. przedniej mózgu nad ciałem modzelowatym do pola nóg kory ruchowej.
  // Schemat drogi, nie dokładny przebieg naczyń (Z-Anatomy nie ma tętnic mózgu). Piksele renderu 1200×1100, widok `detail`.
  // Uwaga: AtlasPlate (faza 0) jeszcze nie rysuje `flows`; dorysuje je integrator.
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
