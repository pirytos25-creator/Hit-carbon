import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ krwionośny” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/krwionosny.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const KRWIONOSNY: AtlasPlateLayout = {
  id: "krwionosny",
  titlePl: "Układ krwionośny",
  subtitlePl: "Jak serce i naczynia przerzucają krew do nóg w sprincie",
  colorVar: "--sys-artery",
  changeLinks: [
    { metric: "krwionosny.metric.udzial_miesni_w_przeplywie_krwi", anchors: ["femoral","anterior_tibial"] },
    { metric: "krwionosny.metric.rzut_serca", anchors: ["heart","aortic_arch","d_left_ventricle","d_aortic_arch"] },
    { metric: "krwionosny.metric.tetno_hr", anchors: ["heart"] },
    { metric: "krwionosny.metric.przeplyw_wiencowy", anchors: ["d_rca","d_lad"] },
    { metric: "krwionosny.metric.objetosc_wyrzutowa", anchors: ["d_left_ventricle"] },
  ],
  heroMetricId: "krwionosny.metric.udzial_miesni_w_przeplywie_krwi",
  views: [
    "front",
    "detail"
  ],
  viewTitlesPl: {
    front: "Widok z przodu",
    detail: "Serce z przodu"
  },
  labels: [
    {
      anchor: "carotid",
      view: "front",
      namePl: "T. szyjna wspólna",
      nameLat: "a. carotis communis",
      tier: "secondary"
    },
    {
      anchor: "jugular",
      view: "front",
      namePl: "Ż. szyjna wewnętrzna",
      nameLat: "v. jugularis interna",
      tier: "secondary"
    },
    {
      anchor: "aortic_arch",
      view: "front",
      namePl: "Łuk aorty",
      nameLat: "arcus aortae",
      tier: "primary"
    },
    {
      anchor: "heart",
      view: "front",
      namePl: "Serce",
      nameLat: "cor",
      tier: "primary"
    },
    {
      anchor: "brachial",
      view: "front",
      namePl: "T. ramienna",
      nameLat: "a. brachialis",
      tier: "secondary"
    },
    {
      anchor: "portal",
      view: "front",
      namePl: "Naczynia trzewne",
      nameLat: "a. lienalis (t. śledzionowa)",
      tier: "secondary"
    },
    {
      anchor: "femoral",
      view: "front",
      namePl: "T. udowa",
      nameLat: "a. femoralis",
      tier: "primary"
    },
    {
      anchor: "saphenous",
      view: "front",
      namePl: "Ż. odpiszczelowa",
      nameLat: "v. saphena magna",
      tier: "primary"
    },
    {
      anchor: "anterior_tibial",
      view: "front",
      namePl: "T. piszczelowa przednia",
      nameLat: "a. tibialis anterior",
      tier: "primary"
    },
    {
      anchor: "d_aortic_arch",
      view: "detail",
      namePl: "Aorta",
      nameLat: "aorta",
      tier: "primary"
    },
    {
      anchor: "d_svc",
      view: "detail",
      namePl: "Ż. główna górna",
      nameLat: "v. cava superior",
      tier: "secondary"
    },
    {
      anchor: "d_pulmonary_trunk",
      view: "detail",
      namePl: "Pień płucny",
      nameLat: "truncus pulmonalis",
      tier: "primary"
    },
    {
      anchor: "d_rca",
      view: "detail",
      namePl: "T. wieńcowa prawa",
      nameLat: "a. coronaria dextra",
      tier: "primary"
    },
    {
      anchor: "d_lad",
      view: "detail",
      namePl: "Gałąź przednia (LAD)",
      nameLat: "r. interventricularis anterior",
      tier: "primary"
    },
    {
      anchor: "d_cardiac_vein",
      view: "detail",
      namePl: "Ż. wielka serca",
      nameLat: "v. cordis magna",
      tier: "secondary"
    },
    {
      anchor: "d_left_ventricle",
      view: "detail",
      namePl: "Lewa komora",
      nameLat: "ventriculus sinister",
      tier: "primary"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (widok całego ciała: naczynia tętnicze i żylne całego ciała, jamy serca, szkielet; CC BY-SA 4.0, na bazie BodyParts3D © DBCLS, CC BY-SA 2.1 JP) oraz HuBMAP Human Reference Atlas (zbliżenie serca: jamy serca, aorta, żyły główne, naczynia wieńcowe i płucne; CC BY 4.0). Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
