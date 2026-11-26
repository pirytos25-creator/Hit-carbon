import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ dokrewny (hormonalny)” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/hormonalny.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const HORMONALNY: AtlasPlateLayout = {
  id: "hormonalny",
  titlePl: "Układ hormonalny",
  subtitlePl: "Jak hormony, zwłaszcza adrenalina, przestawiają organizm na wysiłek",
  colorVar: "--sys-endo",
  heroMetricId: "hormonalny.metric.adrenalina_we_krwi",
  views: [
    "front",
    "detail"
  ],
  viewTitlesPl: {
    front: "Głowa i tułów z przodu",
    detail: "Nadnercze prawe: kora i rdzeń (schemat)"
  },
  labels: [
    {
      anchor: "hypothalamus",
      view: "front",
      namePl: "Podwzgórze",
      nameLat: "hypothalamus",
      tier: "primary",
      side: "left"
    },
    {
      anchor: "pituitary",
      view: "front",
      namePl: "Przysadka mózgowa",
      nameLat: "hypophysis",
      tier: "primary",
      side: "right"
    },
    {
      anchor: "pineal",
      view: "front",
      namePl: "Szyszynka",
      nameLat: "glandula pinealis",
      tier: "secondary",
      side: "right"
    },
    {
      anchor: "thyroid",
      view: "front",
      namePl: "Tarczyca",
      nameLat: "glandula thyroidea",
      tier: "primary"
    },
    {
      anchor: "thymus",
      view: "front",
      namePl: "Grasica (narząd limfatyczny)",
      nameLat: "thymus",
      tier: "secondary"
    },
    {
      anchor: "liver",
      view: "front",
      namePl: "Wątroba (narząd docelowy)",
      nameLat: "hepar",
      tier: "primary",
      side: "left"
    },
    {
      anchor: "pancreas",
      view: "front",
      namePl: "Trzustka",
      nameLat: "pancreas",
      tier: "primary",
      side: "left"
    },
    {
      anchor: "portal_vein",
      view: "front",
      namePl: "Żyła wrotna",
      nameLat: "v. portae hepatis",
      tier: "secondary"
    },
    {
      anchor: "ivc",
      view: "front",
      namePl: "Żyła główna dolna",
      nameLat: "v. cava inferior",
      tier: "secondary"
    },
    {
      anchor: "adrenal",
      view: "front",
      namePl: "Nadnercza",
      nameLat: "glandulae suprarenales",
      tier: "primary",
      side: "right"
    },
    {
      anchor: "kidney",
      view: "front",
      namePl: "Nerka lewa",
      nameLat: "ren sinister",
      tier: "secondary",
      side: "right"
    },
    {
      anchor: "d_cortex",
      view: "detail",
      namePl: "Kora nadnercza",
      nameLat: "cortex glandulae suprarenalis",
      tier: "primary"
    },
    {
      anchor: "d_medulla",
      view: "detail",
      namePl: "Rdzeń nadnercza",
      nameLat: "medulla glandulae suprarenalis",
      tier: "primary"
    },
    {
      anchor: "d_artery",
      view: "detail",
      namePl: "T. nadnerczowa dolna",
      nameLat: "a. suprarenalis inferior",
      tier: "secondary"
    },
    {
      anchor: "d_ivc",
      view: "detail",
      namePl: "Żyła główna dolna",
      nameLat: "v. cava inferior",
      tier: "secondary"
    },
    {
      anchor: "d_kidney",
      view: "detail",
      namePl: "Nerka prawa",
      nameLat: "ren dexter",
      tier: "secondary"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (gruczoły dokrewne, naczynia jako krzywe, szkielet; CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP), oraz HuBMAP Human Reference Atlas, VH Male (nerki; CC BY 4.0). Podział nadnercza na korę i rdzeń: schemat BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
