import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ pokarmowy i wątroba” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/pokarmowy.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const POKARMOWY: AtlasPlateLayout = {
  id: "pokarmowy",
  titlePl: "Układ pokarmowy",
  subtitlePl: "Trawienie zwalnia, a wątroba uwalnia paliwo dla mięśni",
  colorVar: "--sys-digest",
  changeLinks: [
    { metric: "pokarmowy.metric.tempo_oddawania_glukozy_do_krwi", anchors: ["liver","hepatic_veins","d_liver","d_hepatic_veins"] },
    { metric: "pokarmowy.metric.przeplyw_krwi_przez_watrobe", anchors: ["liver","portal_vein","d_liver","d_portal"] },
    { metric: "pokarmowy.metric.spadek_przeplywu_pien_trzewny_t_krezkowa_gorna", anchors: ["stomach","small_intestine"] },
    { metric: "pokarmowy.metric.glukoza_we_krwi", anchors: ["hepatic_veins"] },
  ],
  heroMetricId: "pokarmowy.metric.tempo_oddawania_glukozy_do_krwi",
  views: [
    "front",
    "detail"
  ],
  viewTitlesPl: {
    front: "Jama brzuszna z przodu",
    detail: "Wątroba i jej naczynia (zbliżenie)"
  },
  labels: [
    {
      anchor: "oesophagus",
      view: "front",
      namePl: "Przełyk",
      nameLat: "oesophagus",
      tier: "primary"
    },
    {
      anchor: "stomach",
      view: "front",
      namePl: "Żołądek",
      nameLat: "gaster",
      tier: "primary"
    },
    {
      anchor: "liver",
      view: "front",
      namePl: "Wątroba",
      nameLat: "hepar",
      tier: "primary"
    },
    {
      anchor: "gallbladder",
      view: "front",
      namePl: "Pęcherzyk żółciowy",
      nameLat: "vesica biliaris",
      tier: "primary"
    },
    {
      anchor: "small_intestine",
      view: "front",
      namePl: "Jelito cienkie",
      nameLat: "intestinum tenue",
      tier: "primary"
    },
    {
      anchor: "colon",
      view: "front",
      namePl: "Jelito grube",
      nameLat: "intestinum crassum (colon ascendens)",
      tier: "primary"
    },
    {
      anchor: "duodenum",
      view: "front",
      namePl: "Dwunastnica",
      nameLat: "duodenum",
      tier: "secondary"
    },
    {
      anchor: "transverse_colon",
      view: "front",
      namePl: "Okrężnica poprzeczna",
      nameLat: "colon transversum",
      tier: "secondary"
    },
    {
      anchor: "sigmoid",
      view: "front",
      namePl: "Okrężnica esowata",
      nameLat: "colon sigmoideum",
      tier: "secondary"
    },
    {
      anchor: "portal_vein",
      view: "front",
      namePl: "Żyła wrotna",
      nameLat: "v. portae hepatis",
      tier: "secondary"
    },
    {
      anchor: "hepatic_veins",
      view: "front",
      namePl: "Żyły wątrobowe",
      nameLat: "vv. hepaticae → v. cava inferior",
      tier: "secondary"
    },
    {
      anchor: "d_liver",
      view: "detail",
      namePl: "Wątroba",
      nameLat: "hepar",
      tier: "primary"
    },
    {
      anchor: "d_portal",
      view: "detail",
      namePl: "Żyła wrotna",
      nameLat: "v. portae hepatis",
      tier: "primary"
    },
    {
      anchor: "d_hepatic_veins",
      view: "detail",
      namePl: "Żyły wątrobowe",
      nameLat: "vv. hepaticae",
      tier: "primary"
    },
    {
      anchor: "d_pancreas",
      view: "detail",
      namePl: "Trzustka",
      nameLat: "pancreas",
      tier: "primary"
    },
    {
      anchor: "d_hepatic_artery",
      view: "detail",
      namePl: "T. wątrobowa wspólna",
      nameLat: "a. hepatica communis",
      tier: "secondary"
    },
    {
      anchor: "d_gallbladder",
      view: "detail",
      namePl: "Pęcherzyk żółciowy",
      nameLat: "vesica biliaris",
      tier: "secondary"
    },
    {
      anchor: "d_bile_duct",
      view: "detail",
      namePl: "Drogi żółciowe",
      nameLat: "ductus cysticus, ductus hepaticus communis, ductus choledochus",
      tier: "secondary"
    },
    {
      anchor: "d_duodenum",
      view: "detail",
      namePl: "Dwunastnica",
      nameLat: "duodenum",
      tier: "secondary"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP): narządy jamy brzusznej, naczynia i szkielet; HuBMAP Human Reference Atlas, VH Male (CC BY 4.0): wątroba z naczyniami, drogi żółciowe, pęcherzyk, trzustka i dwunastnica w zbliżeniu. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
