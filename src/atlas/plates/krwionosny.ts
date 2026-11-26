import type { AtlasPlateContent } from '../types';

/**
 * Plansza układu krwionośnego (faza 1: agent 5; v2 i poprawki faktów: integrator K2/K3). Render: blender/atlas/plate_krwionosny.py.
 * Kolory = utlenowanie krwi (konwencja atlasów): czerwony = krew utlenowana, niebieski = odtlenowana.
 * Dlatego pień płucny jest niebieski, a żyły płucne czerwone.
 * Fakty: docs/atlas_audyt/fakty_krwionosny.md (statusy, cytaty i lokalizatory stamtąd; numery # = wiersze audytu).
 */
const JOYNER = 'joyner_casey_2015';

export const KRWIONOSNY: AtlasPlateContent = {
  id: 'krwionosny',
  titlePl: 'Układ krwionośny',
  subtitlePl: 'Jak serce i naczynia przerzucają krew do nóg w sprincie',
  colorVar: '--sys-artery',
  views: ['front', 'detail'],
  viewTitlesPl: { front: 'Widok z przodu', detail: 'Serce z przodu' },
  summary: {
    rest: 'W spoczynku serce bije ok. 60 razy na minutę i pompuje ok. 5 litrów krwi na minutę. Mięśnie dostają mniej niż 20% tej krwi. Dużo trafia do wątroby, jelit i nerek.',
    sprint:
      'W sprincie serce bije znacznie szybciej i mocniej się kurczy. Przy wysiłku maksymalnym rzut serca rośnie do ok. 20–25 L/min, a do pracujących mięśni płynie ok. 80% krwi. Naczynia trzewne się zwężają, a przepływ wieńcowy rośnie ok. 3–5 razy. Mięśnie nóg działają jak pompa, która wyciska krew żyłami z powrotem do serca.',
  },
  summaryReferenceIds: { rest: [JOYNER], sprint: [JOYNER, 'calbet_joyner_2010', 'duncker_bache_2008'] },
  summaryStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // fakty_draft_K3_zaopatrzenie.md: Joyner & Casey 2015 III.A–C, tab. 1; Calbet & Joyner 2010; Duncker & Bache 2008
  labels: [
    {
      anchor: 'carotid',
      view: 'front',
      namePl: 'T. szyjna wspólna',
      nameLat: 'a. carotis communis',
      role: { rest: 'Krew do głowy i mózgu', sprint: 'Przepływ do mózgu prawie stały' },
      tier: 'secondary',
      referenceIds: [JOYNER],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #23
    },
    {
      anchor: 'jugular',
      view: 'front',
      namePl: 'Ż. szyjna wewnętrzna',
      nameLat: 'v. jugularis interna',
      role: { rest: 'Odprowadza krew z mózgu', sprint: 'Odprowadza krew z mózgu' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'aortic_arch',
      view: 'front',
      namePl: 'Łuk aorty',
      nameLat: 'arcus aortae',
      role: { rest: 'Ok. 5 L krwi na minutę', sprint: 'Nawet 20–25 L krwi na minutę' },
      tier: 'primary',
      referenceIds: [JOYNER],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #7, #8
    },
    {
      anchor: 'heart',
      view: 'front',
      namePl: 'Serce',
      nameLat: 'cor',
      role: { rest: 'Ok. 60 uderzeń na minutę', sprint: 'Bije szybko; maksimum w wieku 25 lat to ok. 190/min' },
      conversionNote: '208 − 0,7 × 25 = 190,5 /min (Tanaka 2001).',
      tier: 'primary',
      referenceIds: [JOYNER, 'tanaka_2001'],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #1, #3; fakty_draft_1b.md: Tanaka 2001, abstrakt, Conclusions (+ conversionNote)
    },
    {
      anchor: 'brachial',
      view: 'front',
      namePl: 'T. ramienna',
      nameLat: 'a. brachialis',
      role: { rest: 'Krew do ramienia', sprint: 'Ramiona pracują słabiej: mniej krwi, więcej pobranego tlenu' },
      tier: 'secondary',
      referenceIds: [JOYNER],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #24; fakty_draft_K3_zaopatrzenie.md: Joyner & Casey 2015, III.B
    },
    {
      anchor: 'portal',
      view: 'front',
      namePl: 'Naczynia trzewne',
      nameLat: 'a. lienalis (t. śledzionowa)',
      role: { rest: 'Duży przepływ przez jelita i wątrobę', sprint: 'Mniej krwi: naczynia trzewne się zwężają' },
      tier: 'secondary',
      referenceIds: [JOYNER],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #20, #25; fakty_draft_K3_zaopatrzenie.md: Joyner & Casey 2015, III.C
    },
    {
      anchor: 'femoral',
      view: 'front',
      namePl: 'T. udowa',
      nameLat: 'a. femoralis',
      role: { rest: 'Mały przepływ do nogi', sprint: 'Wielokrotnie większy przepływ do uda i łydki' },
      tier: 'primary',
      referenceIds: [JOYNER],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #26
    },
    {
      anchor: 'saphenous',
      view: 'front',
      namePl: 'Ż. odpiszczelowa',
      nameLat: 'v. saphena magna',
      role: { rest: 'Powrót krwi z nogi', sprint: 'Pompa mięśniowa przyspiesza powrót' },
      tier: 'primary',
      referenceIds: [JOYNER],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #22
    },
    {
      anchor: 'anterior_tibial',
      view: 'front',
      namePl: 'T. piszczelowa przednia',
      nameLat: 'a. tibialis anterior',
      role: { rest: 'Krew do przedniej części goleni', sprint: 'Zasila m. piszczelowy przedni' },
      tier: 'primary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' },
    },
    {
      anchor: 'd_aortic_arch',
      view: 'detail',
      namePl: 'Aorta',
      nameLat: 'aorta',
      role: { rest: 'Krew utlenowana do ciała', sprint: 'Wyższe ciśnienie skurczowe' },
      tier: 'primary',
      referenceIds: [JOYNER],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #27
    },
    {
      anchor: 'd_svc',
      view: 'detail',
      namePl: 'Ż. główna górna',
      nameLat: 'v. cava superior',
      // #28: „Szybszy powrót krwi” bez oparcia w źródłach; zostaje opis anatomiczny.
      role: { rest: 'Krew z głowy i ramion', sprint: 'Krew z głowy i ramion' },
      tier: 'secondary',
      roleStatus: { rest: 'anatomy', sprint: 'anatomy' }, // fakty_draft_K3_zaopatrzenie.md: sprint = ten sam opis budowy (anatomy, decyzja Dyrygenta 1b)
    },
    {
      anchor: 'd_pulmonary_trunk',
      view: 'detail',
      namePl: 'Pień płucny',
      nameLat: 'truncus pulmonalis',
      role: { rest: 'Krew odtlenowana do płuc', sprint: 'Cały rzut serca przez płuca' },
      tier: 'primary',
      referenceIds: ['fletcher_2013'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #29
    },
    {
      anchor: 'd_rca',
      view: 'detail',
      namePl: 'T. wieńcowa prawa',
      nameLat: 'a. coronaria dextra',
      role: { rest: 'Odżywia prawą komorę', sprint: 'Więcej krwi dla prawej komory' },
      tier: 'primary',
      referenceIds: ['duncker_bache_2008'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #30; fakty_draft_K3_zaopatrzenie.md: Duncker & Bache 2008, prawa komora (badania na zwierzętach)
    },
    {
      anchor: 'd_lad',
      view: 'detail',
      namePl: 'Gałąź przednia (LAD)',
      nameLat: 'r. interventricularis anterior',
      role: { rest: 'Odżywia lewą komorę i przegrodę', sprint: 'Przepływ wieńcowy ok. 3–5× większy' },
      tier: 'primary',
      referenceIds: ['duncker_bache_2008', JOYNER],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #13; fakty_draft_K3_zaopatrzenie.md: Duncker & Bache 2008, II.B.1; Joyner & Casey 2015, III.C
    },
    {
      anchor: 'd_cardiac_vein',
      view: 'detail',
      namePl: 'Ż. wielka serca',
      nameLat: 'v. cordis magna',
      role: { rest: 'Odprowadza krew z mięśnia serca', sprint: 'Więcej krwi z pracującego serca' },
      tier: 'secondary',
      referenceIds: ['duncker_bache_2008'],
      roleStatus: { rest: 'anatomy', sprint: 'checked_agent' }, // #31
    },
    {
      anchor: 'd_left_ventricle',
      view: 'detail',
      namePl: 'Lewa komora',
      nameLat: 'ventriculus sinister',
      role: { rest: 'Ok. 90 mL na jedno uderzenie', sprint: 'Ok. 125 mL na uderzenie' },
      tier: 'primary',
      referenceIds: [JOYNER],
      roleStatus: { rest: 'checked_agent', sprint: 'checked_agent' }, // #4, #5; fakty_draft_K3_zaopatrzenie.md: Joyner & Casey 2015, tab. 1 (Active)
    },
  ],
  metrics: [
    {
      labelPl: 'Tętno (HR)',
      rest: 'ok. 60',
      sprint: 'do ok. 190',
      unit: '/min',
      referenceIds: [JOYNER, 'tanaka_2001'],
      evidenceLevel: 'established_human',
      notePl:
        'Tętno maksymalne zależy głównie od wieku: ok. 208 − 0,7 × wiek, czyli ok. 190/min w wieku 25 lat. Pomiaru z końca 45 s pracy przy 88% VO₂max nie znaleźliśmy, więc podajemy górną granicę.',
      protocolMismatch: 'tętno maksymalne (testy do wyczerpania)',
      conversionNote: '208 − 0,7 × 25 = 190,5 /min (Tanaka 2001). Spoczynek: Joyner & Casey 2015, tab. 1, kategoria „Active”.',
      quote: 'A regression equation to predict HRmax is 208 - 0.7 x age in healthy adults.',
      locator: 'Tanaka 2001, abstrakt (Conclusions); Joyner & Casey 2015, tab. 1',
      status: 'checked_agent', // fakty_draft_K3_zaopatrzenie.md
    },
    {
      labelPl: 'Objętość wyrzutowa',
      rest: 'ok. 90',
      sprint: 'ok. 125',
      unit: 'mL na uderzenie',
      referenceIds: [JOYNER],
      evidenceLevel: 'established_human',
      notePl: 'Osoba rekreacyjnie aktywna. U wyczynowych sportowców wytrzymałościowych (elita) ok. 150–200 mL.',
      protocolMismatch: 'wysiłek maksymalny',
      quote: 'Stroke volume, ml Sed ∼65 ∼100 … Active ∼90 ∼125',
      locator: 'Joyner & Casey 2015, tab. 1, Reference Man, Rest / Exercise (maximal) (komórki tabeli)',
      status: 'checked_agent', // fakty_draft_1b.md
    },
    {
      labelPl: 'Rzut serca',
      rest: 'ok. 5',
      sprint: 'ok. 20–25',
      unit: 'L/min',
      referenceIds: [JOYNER],
      evidenceLevel: 'established_human',
      notePl: 'Rzut serca = tętno × objętość wyrzutowa.',
      protocolMismatch: 'wysiłek maksymalny',
      quote: 'CO, l/min Sed ∼5 ∼20 … Active ∼5–6 ∼25',
      locator: 'Joyner & Casey 2015, tab. 1',
      status: 'checked_agent',
    },
    {
      labelPl: 'Udział mięśni w przepływie krwi',
      rest: 'poniżej 20',
      sprint: 'ok. 80',
      unit: '% rzutu serca',
      referenceIds: [JOYNER, 'calbet_joyner_2010'],
      evidenceLevel: 'established_human',
      notePl: 'Naczynia trzewi i nerek się zwężają, a naczynia pracujących mięśni się rozszerzają.',
      protocolMismatch: 'wysiłek maksymalny całego ciała',
      conversionNote: 'Spoczynek: ok. 80% rzutu serca trafia do mózgu, serca, nerek i wątroby (Joyner & Casey 2015), więc na mięśnie zostaje mniej niż 20%.',
      quote: '70–80% (or perhaps more) of cardiac output is directed towards the active muscles',
      locator: 'Calbet & Joyner 2010, rozdz. o układzie współczulnym; Joyner & Casey 2015, rozdz. III.C',
      status: 'checked_agent', // fakty_draft_K3_zaopatrzenie.md
    },
    {
      labelPl: 'Przepływ wieńcowy',
      rest: '1×',
      sprint: 'ok. 3–5×',
      referenceIds: ['duncker_bache_2008', JOYNER],
      evidenceLevel: 'probable_human',
      notePl:
        'Serce już w spoczynku pobiera z krwi 70–80% tlenu, więc więcej tlenu dostaje głównie dzięki większemu przepływowi. U ludzi zmierzono ok. 3–4×.',
      protocolMismatch: 'wysiłek maksymalny, częściowo badania na zwierzętach',
      quote: 'peak values during maximal exercise typically three to five times the resting level',
      locator: 'Duncker & Bache 2008, rozdz. II.B.1; Joyner & Casey 2015, rozdz. III.C („three- to fourfold”)',
      status: 'checked_agent', // fakty_draft_K3_zaopatrzenie.md
    },
    {
      labelPl: 'Ciśnienie skurczowe',
      rest: 'ok. 120',
      sprint: 'ok. 200',
      unit: 'mmHg',
      referenceIds: ['kenney_2022'],
      evidenceLevel: 'established_human',
      notePl: 'Ciśnienie rozkurczowe zmienia się niewiele albo lekko spada.',
      protocolMismatch: 'wysiłek maksymalny',
      status: 'unverifiable',
    },
    {
      labelPl: 'Pobór tlenu z krwi (różnica tętniczo-żylna)',
      rest: 'ok. 5',
      sprint: 'ok. 15',
      unit: 'mL O₂ / 100 mL krwi',
      referenceIds: [JOYNER],
      evidenceLevel: 'established_human',
      protocolMismatch: 'wysiłek maksymalny, osoba nietrenująca',
      conversionNote: '140–150 mL O₂ na litr krwi = 14–15 mL/100 mL; spoczynek: 200 mL/L × (1 − 0,75) ≈ 5 mL/100 mL (do ok. 6,6 wg podpisu ryc. 5).',
      quote: '∼140–150 ml of oxygen is extracted by the peripheral tissues for each liter of cardiac output',
      locator: 'Joyner & Casey 2015, rozdz. III.B',
      status: 'checked_agent',
    },
  ],
  // Strzałki przepływu: public/atlas/krwionosny/flows3d.json (metry, tory po krzywych naczyń Z-Anatomy,
  // kierunek sprawdzony z topologią drzewa naczyń; generuje blender/atlas/plate_krwionosny.py).
  creditsPl:
    'Modele: Z-Anatomy (widok całego ciała: naczynia tętnicze i żylne całego ciała, jamy serca, szkielet; CC BY-SA 4.0, na bazie BodyParts3D © DBCLS) oraz HuBMAP Human Reference Atlas (zbliżenie serca: jamy serca, aorta, żyły główne, naczynia wieńcowe i płucne; CC BY 4.0). Render i opracowanie: BIOGENESIS, CC BY-SA 4.0.',
};
