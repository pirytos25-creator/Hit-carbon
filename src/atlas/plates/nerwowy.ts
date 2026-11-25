import type { AtlasPlateContent } from '../types';

/**
 * Plansza układu nerwowego (faza 1, agent 1). Render: blender/atlas/plate_nerwowy.py.
 * Kotwice podpisów i punkty strzałek pochodzą z public/atlas/nerwowy/anchors.json i flows.json
 * (strzałki przepisane tutaj w pikselach renderu 1000×1800; po nowym renderze trzeba je skopiować ponownie).
 */
export const NERWOWY: AtlasPlateContent = {
  id: 'nerwowy',
  titlePl: 'Układ nerwowy',
  subtitlePl: 'Jak rozkaz z mózgu dociera do nóg i jak układ współczulny mobilizuje ciało',
  colorVar: '--sys-nerve',
  views: ['front', 'back'],
  viewTitlesPl: { front: 'Widok z przodu', back: 'Widok z tyłu' },
  summary: {
    rest:
      'W spoczynku nerwy ruchowe nóg prawie milczą: kilka małych jednostek ruchowych podtrzymuje postawę, wyładowując się z małą częstotliwością. Przeważa nerw błędny, a układ współczulny pracuje oszczędnie.',
    sprint:
      'W sprincie kora ruchowa wysyła rozkaz drogą korowo-rdzeniową. Ta droga krzyżuje się w rdzeniu przedłużonym, więc lewa półkula steruje prawą nogą. W rdzeniu kręgowym rozkaz przechodzi na motoneurony, a stamtąd biegnie nerwami kulszowym, piszczelowym i udowym do mięśni. Włączają się kolejno coraz większe jednostki ruchowe, a ich częstotliwość wyładowań rośnie. Jednocześnie pień współczulny przyspiesza serce i każe rdzeniowi nadnerczy wyrzucić adrenalinę.',
  },
  labels: [
    {
      anchor: 'intercostal',
      view: 'front',
      namePl: 'Nerwy międzyżebrowe',
      nameLat: 'nn. intercostales',
      role: { rest: 'Spokojny oddech', sprint: 'Szybki, głęboki oddech' },
      tier: 'secondary',
    },
    {
      anchor: 'sympathetic_trunk',
      view: 'front',
      namePl: 'Pień współczulny',
      nameLat: 'truncus sympathicus',
      role: { rest: 'Niska aktywność, przewaga n. błędnego', sprint: 'Mobilizacja: serce, naczynia, pot' },
      tier: 'primary',
    },
    {
      anchor: 'adrenal',
      view: 'front',
      namePl: 'Rdzeń nadnercza',
      nameLat: 'medulla glandulae suprarenalis',
      role: { rest: 'Mało adrenaliny we krwi', sprint: 'Wyrzut adrenaliny do krwi' },
      tier: 'primary',
    },
    {
      anchor: 'lumbar_plexus',
      view: 'front',
      namePl: 'Splot lędźwiowy',
      nameLat: 'plexus lumbalis',
      role: { rest: 'Prawie cisza', sprint: 'Rozdziela rozkaz na biodro i udo' },
      tier: 'secondary',
    },
    {
      anchor: 'femoral',
      view: 'front',
      namePl: 'Nerw udowy',
      nameLat: 'n. femoralis',
      role: { rest: 'Prawie cisza', sprint: 'Czworogłowy prostuje kolano' },
      tier: 'primary',
    },
    {
      anchor: 'obturator',
      view: 'front',
      namePl: 'Nerw zasłonowy',
      nameLat: 'n. obturatorius',
      role: { rest: 'Prawie cisza', sprint: 'Przywodziciele trzymają oś uda' },
      tier: 'secondary',
    },
    {
      anchor: 'deep_fibular',
      view: 'front',
      namePl: 'Nerw strzałkowy głęboki',
      nameLat: 'n. fibularis profundus',
      role: { rest: 'Prawie cisza', sprint: 'Unosi stopę w fazie wymachu' },
      tier: 'secondary',
    },
    {
      anchor: 'motor_cortex',
      view: 'back',
      namePl: 'Kora ruchowa',
      nameLat: 'gyrus precentralis',
      role: { rest: 'Drobne korekty postawy', sprint: 'Wysyła rozkaz ruchu do nóg' },
      tier: 'primary',
    },
    {
      anchor: 'spinal_cord',
      view: 'back',
      namePl: 'Rdzeń kręgowy',
      nameLat: 'medulla spinalis',
      role: { rest: 'Odruchy i napięcie postawy', sprint: 'Przekazuje rozkaz motoneuronom' },
      tier: 'primary',
    },
    {
      anchor: 'cauda_equina',
      view: 'back',
      namePl: 'Ogon koński',
      nameLat: 'cauda equina',
      role: { rest: 'Korzenie nerwów nóg, mało impulsów', sprint: 'Korzenie L2–S3 niosą salwy do nóg' },
      tier: 'secondary',
    },
    {
      anchor: 'sciatic',
      view: 'back',
      namePl: 'Nerw kulszowy',
      nameLat: 'n. ischiadicus',
      role: { rest: 'Pojedyncze impulsy postawy', sprint: 'Napędza mięśnie tylnej strony uda' },
      tier: 'primary',
    },
    {
      anchor: 'common_fibular',
      view: 'back',
      namePl: 'Nerw strzałkowy wspólny',
      nameLat: 'n. fibularis communis',
      role: { rest: 'Prawie cisza', sprint: 'Prostowniki stopy: wymach nogi' },
      tier: 'primary',
    },
    {
      anchor: 'tibial',
      view: 'back',
      namePl: 'Nerw piszczelowy',
      nameLat: 'n. tibialis',
      role: { rest: 'Napięcie łydki w staniu', sprint: 'Łydka odbija stopę od taśmy' },
      tier: 'primary',
    },
    {
      anchor: 'motor_units',
      view: 'back',
      namePl: 'Jednostki ruchowe łydki',
      nameLat: 'unitates motoriae',
      role: { rest: 'Pracują nieliczne, małe (typ I)', sprint: 'Włączone także duże, szybkie (IIx)' },
      tier: 'primary',
    },
  ],
  metrics: [
    {
      labelPl: 'Częstotliwość wyładowań motoneuronu',
      rest: 'ok. 8',
      sprint: 'ok. 30 (start: 60–120)',
      unit: 'Hz',
      referenceIds: ['duchateau_enoka_2022', 'enoka_duchateau_2017'],
      evidenceLevel: 'established_human',
      notePl:
        'Pomiary w m. piszczelowym przednim: ok. 8 Hz to najmniejsza częstotliwość świeżo włączonej jednostki, ok. 30 Hz to szczyt w maksymalnym skurczu. Szybki, „wybuchowy” skurcz zaczyna się krótką salwą 60–120 Hz.',
    },
    {
      labelPl: 'Rekrutacja jednostek ruchowych',
      rest: 'tylko małe (typ I)',
      sprint: 'prawie wszystkie',
      referenceIds: ['enoka_duchateau_2017', 'kenney_2022'],
      evidenceLevel: 'established_human',
      notePl:
        'Zasada rozmiaru Hennemana: najpierw małe jednostki, potem coraz większe. W m. piszczelowym przednim komplet jest włączony przy ok. 90% siły maksymalnej w powolnym skurczu, a w szybkim już przy ok. 40%.',
    },
    {
      labelPl: 'Noradrenalina w osoczu',
      rest: '2,2',
      sprint: '13,4',
      unit: 'nmol/L',
      referenceIds: ['brooks_1988', 'zouhal_2008'],
      evidenceLevel: 'established_human',
      notePl:
        'Średnie po 30 s maksymalnego biegu na bieżni (10 mężczyzn). Noradrenalina pochodzi głównie z zakończeń nerwów współczulnych. W przeglądzie badań wzrost katecholamin w wysiłku wynosi od 1,5 do ponad 20 razy.',
    },
    {
      labelPl: 'Adrenalina w osoczu',
      rest: '0,2',
      sprint: '1,4',
      unit: 'nmol/L',
      referenceIds: ['brooks_1988', 'zouhal_2008'],
      evidenceLevel: 'established_human',
      notePl: 'To samo badanie (30 s sprintu na bieżni). Adrenalinę wydziela rdzeń nadnerczy na sygnał z nerwów współczulnych.',
    },
    {
      labelPl: 'Skąd bierze się zmęczenie',
      rest: '—',
      sprint: 'mięsień + motoneuron + kora',
      referenceIds: ['taylor_gandevia_2001'],
      evidenceLevel: 'established_human',
      notePl:
        'Badania stymulacją magnetyczną mózgu (TMS) pokazują, że przy zmęczeniu słabnie nie tylko mięsień: część utraty siły powstaje „wyżej”, bo kora ruchowa przestaje wysyłać pełny rozkaz.',
    },
  ],
  flows: [
    {
      view: 'back',
      kind: 'nerve',
      labelPl: 'Rozkaz ruchu: lewa kora → skrzyżowanie w rdzeniu przedłużonym → rdzeń → nerw kulszowy → łydka',
      points: [
        [464, 76], [500, 199], [504, 233], [504, 417], [504, 601], [504, 693], [530, 779], [536, 810], [549, 857],
        [553, 897], [569, 1014], [577, 1186], [584, 1252], [588, 1356], [595, 1432],
      ],
    },
    {
      view: 'front',
      kind: 'nerve',
      labelPl: 'Rdzeń lędźwiowy → nerw udowy → mięsień czworogłowy',
      points: [
        [500, 603], [500, 643], [488, 657], [473, 664], [449, 678], [413, 768], [423, 823], [431, 852], [437, 895],
        [438, 1020], [435, 1128],
      ],
    },
    {
      view: 'front',
      kind: 'nerve',
      labelPl: 'Układ współczulny: pień współczulny → rdzeń nadnercza (adrenalina)',
      points: [
        [486, 255], [494, 275], [494, 302], [491, 324], [486, 346], [486, 376], [484, 408], [483, 447], [482, 473],
        [482, 500], [482, 536], [479, 563], [479, 587], [454, 616],
      ],
    },
  ],
  creditsPl:
    'Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Sylwetka wyliczona z tych samych modeli. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
