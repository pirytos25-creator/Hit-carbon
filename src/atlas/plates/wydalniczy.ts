import type { AtlasPlateContent } from '../types';

/**
 * Plansza układu moczowego (wydalniczego) (faza 1b, agent 9). Render: blender/atlas/plate_wydalniczy.py
 * Fakty: docs/atlas_audyt/fakty_wydalniczy.md (niezależny agent sprawdzający; numery # = wiersze audytu).
 * Statusy: potwierdzone w audycie -> 'checked_agent' / 'anatomy'; zmienione po audycie K2 -> 'draft' (do ponownego
 * sprawdzenia w K3). Cytaty i lokalizatory metryk pochodzą z audytu.
 *
 * Licencja: nerki, miedniczki, kielichy, moczowody i naczynia nerkowe z HuBMAP (CC BY 4.0). Nerka Z-Anatomy ma licencję
 * CC BY-NC i nie jest renderowana.
 *
 * Stany: w nerce ODWROTNIE niż na innych planszach. W sprincie nerka dostaje mniej krwi, więc nerki, naczynia nerkowe
 * i moczowody są w sprincie przygaszone (decyzja Dyrygenta, K1). Pełny kolor w sprincie mają nadnercza, aorta,
 * żyła główna dolna i (w zbliżeniu) kanalik zbiorczy. Jasność to ilustracja w 3 stopniach, nie liczba ze źródła.
 *
 * public/atlas/wydalniczy/anchors.json zawiera też widok `body_front` (całe ciało, 1000×1800, kamera planszy mięśniowej)
 * tylko dla warstw „Całość”. Nie jest on widokiem tej planszy (nie ma go w `views`).
 */
export const WYDALNICZY: AtlasPlateContent = {
  id: 'wydalniczy',
  titlePl: 'Układ moczowy (wydalniczy)',
  subtitlePl: 'Dlaczego w sprincie nerki pracują ciszej i oszczędzają wodę',
  colorVar: '--sys-urinary',
  views: ['front', 'detail'],
  viewTitlesPl: { front: 'Jama brzuszna i miednica z przodu', detail: 'Nefron (schemat)' },
  summary: {
    rest:
      'W spoczynku nerki dostają około jednej piątej krwi wypompowywanej przez serce. W kłębuszkach nerkowych przesącza się z niej osocze: około 180 litrów na dobę. Kanaliki odzyskują prawie całą tę wodę, a reszta to mocz. Spływa on do miedniczki nerkowej, a moczowodami do pęcherza moczowego.',
    sprint:
      'W sprincie nerka dostaje mniej krwi: układ współczulny zwęża jej naczynia, a krew płynie głównie do pracujących mięśni. Dlatego na planszy nerki są przygaszone, to nie błąd. Nerki przesączają mniej i tworzą mniej moczu, a hormony ADH i aldosteron, rosnące w ciągu minut ciężkiej pracy, każą oszczędzać wodę i sól. Kwas z mięśni wiążą bufory krwi, a część usuwa oddech jako CO₂. Z moczem wychodzi mniej niż 2% mleczanu: resztę organizm spala albo przerabia na glukozę. Nerki dbają o długotrwałą równowagę kwasowo-zasadową (godziny), ale z moczem usuwają bardzo mało mleczanu.',
  },
  summaryReferenceIds: {
    rest: ['garza_leslie_2025'],
    sprint: [
      'kawakami_2018',
      'kenney_ho_1995',
      'poortmans_1984',
      'freund_1991',
      'shaw_2022',
      'mckelvie_1989',
      'poortmans_1994',
      'brooks_2018',
      'brooks_2020',
    ],
  },
  summaryStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_koncowe_B_horm_mocz_pokarm.md: spoczynek Garza i Leslie 2025; sprint disputed -> 2 zmiany dosłownie wg sprawdzającego
  protocolNotePl:
    'Sprint to koniec 45 s pracy przy ok. 88% VO₂max. Badania nerek mierzyły zwykle dłuższy wysiłek albo stan tuż po nim, więc liczby pokazują kierunek zmian, nie dokładną wartość dla jednej serii.',
  protocolNoteStatus: 'checked_agent', // fakty_kontrola_koncowa.md, cz. 1a
  // K3: podpisy obu widoków po lewej stronie (jak oddechowy): dwie kolumny tekstu zamiast czterech, większe rendery.
  labels: [
    // ---- widok front (prawa strona ciała = lewa strona obrazu)
    {
      anchor: 'kidney',
      view: 'front',
      side: 'left',
      namePl: 'Nerka',
      nameLat: 'ren',
      role: { rest: 'Ok. 20% krwi z serca: tworzy mocz', sprint: 'Mniej krwi, mniej moczu (stąd przygaszona)' },
      tier: 'primary',
      referenceIds: ['garza_leslie_2025', 'kawakami_2018', 'freund_1991'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_koncowe_B_horm_mocz_pokarm.md: Garza i Leslie 2025 („Approximately 20% of total cardiac output”); #12
    },
    {
      anchor: 'renal_pelvis',
      view: 'front',
      side: 'left',
      namePl: 'Miedniczka nerkowa',
      nameLat: 'pelvis renalis',
      role: { rest: 'Zbiera mocz z kielichów nerki', sprint: 'Spływa do niej mniej moczu' },
      tier: 'primary',
      referenceIds: ['freund_1991'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #13, #14
    },
    {
      anchor: 'renal_artery',
      view: 'front',
      side: 'left',
      namePl: 'Tętnica nerkowa',
      nameLat: 'arteria renalis',
      role: { rest: 'Doprowadza krew z aorty do nerki', sprint: 'Węższa: mniej krwi dla nerki' },
      tier: 'primary',
      referenceIds: ['kawakami_2018', 'poortmans_1984'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #15, #16 (K18 Fig. 2c: pole przekroju t. nerkowej)
    },
    {
      anchor: 'renal_vein',
      view: 'front',
      side: 'left',
      namePl: 'Żyła nerkowa',
      nameLat: 'vena renalis',
      role: { rest: 'Odprowadza krew z nerki', sprint: 'Mniej krwi wraca z nerki' },
      tier: 'secondary',
      referenceIds: ['kawakami_2018'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #17, #18
    },
    {
      anchor: 'ureter',
      view: 'front',
      side: 'left',
      namePl: 'Moczowód',
      nameLat: 'ureter',
      role: { rest: 'Przesuwa mocz do pęcherza', sprint: 'Płynie nim mniej moczu' },
      tier: 'primary',
      referenceIds: ['freund_1991'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #19, #20
    },
    {
      anchor: 'bladder',
      view: 'front',
      side: 'left',
      namePl: 'Pęcherz moczowy',
      nameLat: 'vesica urinaria',
      role: { rest: 'Gromadzi mocz', sprint: 'Gromadzi mocz' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // #21; #22: usunięte „(bez zmian w czasie serii)”
    },
    {
      anchor: 'urethra',
      view: 'front',
      side: 'left',
      namePl: 'Cewka moczowa',
      nameLat: 'urethra',
      role: { rest: 'Wyprowadza mocz na zewnątrz', sprint: 'Wyprowadza mocz na zewnątrz' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // #23
    },
    {
      anchor: 'adrenal',
      view: 'front',
      side: 'left',
      namePl: 'Nadnercze',
      nameLat: 'glandula suprarenalis',
      role: { rest: 'Mało adrenaliny we krwi', sprint: 'Wyrzut adrenaliny (plansza hormonalna)' },
      tier: 'primary',
      referenceIds: ['zouhal_2008', 'kawakami_2018'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #24, #25
    },
    {
      anchor: 'aorta',
      view: 'front',
      side: 'left',
      namePl: 'Aorta brzuszna',
      nameLat: 'pars abdominalis aortae',
      role: { rest: 'Krew z serca do nerek i nóg', sprint: 'Więcej krwi, głównie do mięśni nóg' },
      tier: 'secondary',
      referenceIds: ['kenney_ho_1995'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #26, #27
    },
    {
      anchor: 'ivc',
      view: 'front',
      side: 'left',
      namePl: 'Żyła główna dolna',
      nameLat: 'vena cava inferior',
      role: { rest: 'Krew z nerek i nóg do serca', sprint: 'Więcej krwi wraca z nóg' },
      tier: 'secondary',
      referenceIds: ['kenney_ho_1995'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #28; fakty_koncowe_B_horm_mocz_pokarm.md: Kenney i Ho 1995
    },
    // ---- widok detail: nefron (schemat)
    {
      anchor: 'glomerulus',
      view: 'detail',
      side: 'left',
      namePl: 'Kłębuszek nerkowy',
      nameLat: 'glomerulus renalis',
      role: { rest: 'Przesącza osocze z krwi', sprint: 'Mniej krwi, przesącza mniej' },
      tier: 'primary',
      referenceIds: ['freund_1991', 'poortmans_1994'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #30, #31
    },
    {
      anchor: 'bowman',
      view: 'detail',
      side: 'left',
      namePl: 'Torebka kłębuszka',
      nameLat: 'capsula glomeruli',
      role: { rest: 'Zbiera przesącz (mocz pierwotny)', sprint: 'Zbiera mniej przesączu' },
      tier: 'secondary',
      referenceIds: ['freund_1991'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #32, #33
    },
    {
      anchor: 'afferent',
      view: 'detail',
      side: 'left',
      namePl: 'Tętniczka doprowadzająca',
      nameLat: 'arteriola glomerularis afferens',
      // #35: bez źródła o samej tętniczce doprowadzającej -> opis ogólny (zwężają się naczynia nerki; na schemacie
      // węższe są obie tętniczki kłębuszka, co jest ilustracją, nie pomiarem)
      role: { rest: 'Doprowadza krew do kłębuszka', sprint: 'Naczynia nerki zwężone: mniej krwi' },
      tier: 'secondary',
      referenceIds: ['kawakami_2018', 'poortmans_1984'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #34; fakty_koncowe_B_horm_mocz_pokarm.md: Kawakami 2018, Poortmans 1984
    },
    {
      anchor: 'tubule',
      view: 'detail',
      side: 'left',
      namePl: 'Kanalik nerkowy',
      nameLat: 'tubulus renalis',
      role: { rest: 'Odzyskuje prawie całą wodę z przesączu', sprint: 'Mniej przesączu: mniej soli w moczu' },
      tier: 'primary',
      referenceIds: ['garza_leslie_2025', 'freund_1991'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_koncowe_B_horm_mocz_pokarm.md: Garza i Leslie 2025; Freund 1991
    },
    {
      anchor: 'loop',
      view: 'detail',
      side: 'left',
      namePl: 'Pętla nefronu (Henlego)',
      nameLat: 'ansa nephroni',
      role: { rest: 'Tworzy słony płyn w rdzeniu nerki', sprint: 'Tworzy słony płyn w rdzeniu nerki' },
      tier: 'secondary',
      referenceIds: ['sands_layton_2009'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_koncowe_B_horm_mocz_pokarm.md: Sands i Layton 2009
    },
    {
      anchor: 'collecting_duct',
      view: 'detail',
      side: 'left',
      namePl: 'Kanalik zbiorczy (cewka zbiorcza)',
      nameLat: 'tubulus renalis colligens',
      role: {
        rest: 'Mało akwaporyn: część wody zostaje w moczu',
        sprint: 'Gdy rośnie ADH, wstawia akwaporyny (model zwierzęcy)',
      },
      tier: 'primary',
      referenceIds: ['freund_1991', 'nielsen_1995'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #39; fakty_koncowe_B_horm_mocz_pokarm.md: disputed („po serii”) -> brzmienie wg sprawdzającego
    },
  ],
  metrics: [
    {
      labelPl: 'Przepływ krwi przez nerki',
      rest: '100%',
      sprint: 'ok. −30% (do −50%)',
      referenceIds: ['kawakami_2018', 'kawakami_2024'],
      evidenceLevel: 'probable_human',
      notePl:
        '8 zdrowych mężczyzn (23 lata), USG. Bez spadku do 80% progu mleczanowego; −31% przy 100% progu, a przy wyższych etapach dalej w dół; −51% po wysiłku do wyczerpania. Przy 88% VO₂max spadek jest więc najpewniej większy niż 31%. W innym badaniu interwały 1 min przy progu OBLA i 2 min odpoczynku nie obniżyły przepływu mierzonego po wysiłku.',
      status: 'checked_agent', // #41
      restStatus: 'checked_agent', // #42
      conversionNote: 'Spoczynek = 100% (punkt odniesienia badania). −31% przy 100% LaBP, −51% po wysiłku maksymalnym.',
      protocolMismatch:
        'cykloergometr: etapy po 4 min kolejno 60–140% progu mleczanowego oraz test do wyczerpania (pomiar 5 min po)',
      quote:
        'RBF after maximum exercise decreased by 51% in Study 1. In Study 2, RBF showed no significant decrease until 80% LaBP, and showed a significant decrease (31%) at 100% LaBP compared with at rest (p < 0.01).',
      locator: 'Kawakami 2018, abstrakt (Results); pełny tekst Results Study 2, Fig. 2a',
      measuredAt: 'zaraz po 4-min etapie wysiłku; −51%: 5 min po wysiłku maksymalnym',
      tier: 'primary',
    },
    {
      labelPl: 'Hormony oszczędzania wody i soli (ADH, aldosteron)',
      rest: 'niskie',
      sprint: 'rosną (od ok. 60% VO₂max)',
      referenceIds: ['freund_1991', 'poortmans_1984'],
      evidenceLevel: 'established_human',
      notePl: 'Przy tej samej intensywności spadały filtracja w kłębuszkach i ilość moczu. ADH każe kanalikom zbiorczym odzyskiwać wodę.',
      status: 'checked_agent', // #44, #45
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: '20 min ciągłej jazdy przy 25–80% VO₂max',
      quote:
        'Plasma vasopressin (ADH), aldosterone, and plasma renin activity tended to increase progressively with increases in work load, with the increases for all hormones reaching statistical significance when the level of exercise reached greater than or equal to 60% of maximal oxygen consumption.',
      locator: 'Freund 1991, abstrakt; Poortmans 1984, abstrakt (ADH a ilość moczu)',
      measuredAt: 'zaraz po 20-min etapie (minuty, nie sekundy)',
      tier: 'primary',
    },
    {
      labelPl: 'Białko w moczu',
      rest: 'mało',
      sprint: 'po wysiłku przejściowo więcej; połowa znika w ok. 1 h',
      referenceIds: ['poortmans_1984', 'poortmans_1985'],
      evidenceLevel: 'established_human',
      notePl: 'Białkomocz wysiłkowy zależy od intensywności, nie od czasu trwania, i jest przejściowy.',
      status: 'checked_agent', // #46, #47 (usunięte „nie jest chorobą”)
      restStatus: 'draft',
      protocolMismatch: 'przegląd różnych wysiłków intensywnych',
      quote: 'This excretion of proteins in urine is a transient state with a half-time of approximately 1 hour.',
      locator: 'Poortmans 1984, abstrakt',
      measuredAt: 'po wysiłku (mocz zbierany po zakończeniu)',
      tier: 'primary',
    },
    {
      labelPl: 'pH krwi',
      rest: 'ok. 7,4',
      sprint: 'ok. 7,2',
      referenceIds: ['del_coso_2010', 'shaw_2022', 'mckelvie_1989', 'poortmans_1994'],
      evidenceLevel: 'established_human',
      notePl:
        'Kwas z mięśni wiążą bufory krwi, a część usuwa oddech jako CO₂. Nerki dbają o długotrwałą równowagę (godziny), ale z moczem wychodzi mniej niż 2% mleczanu.',
      status: 'checked_agent', // #48
      restStatus: 'checked_agent', // #49
      protocolMismatch:
        '4 serie po 1,5 min przy 163% progu kompensacji oddechowej (wysiłek ponadmaksymalny), aktywna przerwa 4,5–6 min',
      quote:
        'At the end of exercise, L(ONG) in comparison to S(HORT) and M(EDIUM) increased plasma pH (7.32 +/- 0.02 vs. approximately 7.22 +/- 0.03; P < 0.05)',
      conversionNote: 'Spoczynek: Shaw 2022 „The normal blood pH is 7.35–7.45” → środek zakresu ok. 7,4. Sprint: grupy S i M (ok. 7,22).',
      locator:
        'Del Coso 2010, abstrakt; Shaw 2022, sekcja „What is acidosis and what is its relevance?” (7,35–7,45); McKelvie 1989, abstrakt (< 2% mleczanu w moczu)',
      measuredAt: 'koniec ostatniej serii; nerki: godziny po treningu',
      tier: 'primary',
    },
    // ---- dla studentów
    {
      labelPl: 'Przepływ nerkowy przy 60% VO₂peak (pomiar w trakcie)',
      rest: '100%',
      sprint: '−20–25%',
      referenceIds: ['kenney_ho_1995'],
      evidenceLevel: 'established_human',
      notePl: 'Klirens PAH w trakcie jazdy, młodzi i starsi mężczyźni; przy 35% VO₂peak prawie bez zmian.',
      status: 'checked_agent', // #51
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: 'jazda ciągła przy 35 i 60% VO₂peak, 22 i 36 °C',
      conversionNote: 'spoczynek = 100% (punkt odniesienia)', // fakty_kontrola_koncowa.md, cz. 1b
      quote:
        'Renal blood flow was lower at rest in the O group, remained relatively constant at 35% VO2peak, then decreased by 20-25% in both groups at 60% VO2peak.',
      locator: 'Kenney i Ho 1995, abstrakt',
      measuredAt: 'w trakcie wysiłku',
      tier: 'student',
    },
    {
      labelPl: 'Frakcja filtracyjna (część osocza przesączona w kłębuszku)',
      rest: '1×',
      sprint: 'do ok. 2×',
      referenceIds: ['poortmans_1994', 'kawakami_2018'],
      evidenceLevel: 'established_human',
      notePl: 'Przepływ osocza spada bardziej niż filtracja, więc większa jego część przechodzi przez filtr.',
      status: 'checked_agent', // #52
      restStatus: 'checked_agent', // jawnie (zgromadzenie D1): spoczynek = status liczby
      protocolMismatch: 'wysiłek maksymalny (przegląd); Kawakami 2018: wzrost istotny przy 120% progu mleczanowego',
      conversionNote: 'double = 2×; spoczynek = 1×', // fakty_kontrola_koncowa.md, cz. 1b
      quote: 'Despite a major reduction in the renal plasma flow, the filtration fraction can double with maximal exercise',
      locator: 'Poortmans i Vanderstraeten 1994, abstrakt; Kawakami 2018, pełny tekst Fig. 4c',
      measuredAt: 'w trakcie wysiłku maksymalnego',
      tier: 'student',
    },
  ],
  creditsPl:
    'Modele: HuBMAP Human Reference Atlas, VH Male (nerki, miedniczki, kielichy, moczowody, naczynia nerkowe; CC BY 4.0) oraz Z-Anatomy (pęcherz, cewka moczowa, nadnercza, aorta, żyła główna dolna, szkielet, mięśnie; CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Schemat nefronu: BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
