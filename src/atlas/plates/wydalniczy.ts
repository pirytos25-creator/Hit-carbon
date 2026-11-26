import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ moczowy (wydalniczy)” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/wydalniczy.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const WYDALNICZY: AtlasPlateLayout = {
  id: "wydalniczy",
  titlePl: "Układ moczowy (wydalniczy)",
  subtitlePl: "Dlaczego w sprincie nerki pracują ciszej i oszczędzają wodę",
  colorVar: "--sys-urinary",
  views: [
    "front",
    "detail"
  ],
  viewTitlesPl: {
    front: "Jama brzuszna i miednica z przodu",
    detail: "Nefron (schemat)"
  },
  labels: [
    {
      anchor: "kidney",
      view: "front",
      side: "left",
      namePl: "Nerka",
      nameLat: "ren",
      tier: "primary"
    },
    {
      anchor: "renal_pelvis",
      view: "front",
      side: "left",
      namePl: "Miedniczka nerkowa",
      nameLat: "pelvis renalis",
      tier: "primary"
    },
    {
      anchor: "renal_artery",
      view: "front",
      side: "left",
      namePl: "Tętnica nerkowa",
      nameLat: "arteria renalis",
      tier: "primary"
    },
    {
      anchor: "renal_vein",
      view: "front",
      side: "left",
      namePl: "Żyła nerkowa",
      nameLat: "vena renalis",
      tier: "secondary"
    },
    {
      anchor: "ureter",
      view: "front",
      side: "left",
      namePl: "Moczowód",
      nameLat: "ureter",
      tier: "primary"
    },
    {
      anchor: "bladder",
      view: "front",
      side: "left",
      namePl: "Pęcherz moczowy",
      nameLat: "vesica urinaria",
      tier: "primary"
    },
    {
      anchor: "urethra",
      view: "front",
      side: "left",
      namePl: "Cewka moczowa",
      nameLat: "urethra",
      tier: "primary"
    },
    {
      anchor: "adrenal",
      view: "front",
      side: "left",
      namePl: "Nadnercze",
      nameLat: "glandula suprarenalis",
      tier: "primary"
    },
    {
      anchor: "aorta",
      view: "front",
      side: "left",
      namePl: "Aorta brzuszna",
      nameLat: "pars abdominalis aortae",
      tier: "secondary"
    },
    {
      anchor: "ivc",
      view: "front",
      side: "left",
      namePl: "Żyła główna dolna",
      nameLat: "vena cava inferior",
      tier: "secondary"
    },
    {
      anchor: "glomerulus",
      view: "detail",
      side: "left",
      namePl: "Kłębuszek nerkowy",
      nameLat: "glomerulus renalis",
      tier: "primary"
    },
    {
      anchor: "bowman",
      view: "detail",
      side: "left",
      namePl: "Torebka kłębuszka",
      nameLat: "capsula glomeruli",
      tier: "secondary"
    },
    {
      anchor: "afferent",
      view: "detail",
      side: "left",
      namePl: "Tętniczka doprowadzająca",
      nameLat: "arteriola glomerularis afferens",
      tier: "secondary"
    },
    {
      anchor: "tubule",
      view: "detail",
      side: "left",
      namePl: "Kanalik nerkowy",
      nameLat: "tubulus renalis",
      tier: "primary"
    },
    {
      anchor: "loop",
      view: "detail",
      side: "left",
      namePl: "Pętla nefronu (Henlego)",
      nameLat: "ansa nephroni",
      tier: "secondary"
    },
    {
      anchor: "collecting_duct",
      view: "detail",
      side: "left",
      namePl: "Kanalik zbiorczy (cewka zbiorcza)",
      nameLat: "tubulus renalis colligens",
      tier: "primary"
    }
  ],
  creditsPl: "Modele: HuBMAP Human Reference Atlas, VH Male (nerki, miedniczki, kielichy, moczowody, naczynia nerkowe; CC BY 4.0) oraz Z-Anatomy (pęcherz, cewka moczowa, nadnercza, aorta, żyła główna dolna, szkielet, mięśnie; CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Schemat nefronu: BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
