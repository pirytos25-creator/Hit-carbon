import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ rozrodczy” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/rozrodczy.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const ROZRODCZY: AtlasPlateLayout = {
  id: "rozrodczy",
  titlePl: "Układ rozrodczy",
  subtitlePl: "Budowa u mężczyzny i u kobiety oraz to, czego o wpływie sprintu jeszcze nie wiadomo",
  colorVar: "--sys-repro",
  views: [
    "side",
    "detail"
  ],
  viewTitlesPl: {
    side: "Miednica męska, z boku",
    detail: "Miednica żeńska, z boku"
  },
  labels: [
    {
      anchor: "testis",
      view: "side",
      namePl: "Jądro",
      nameLat: "testis",
      tier: "primary"
    },
    {
      anchor: "epididymis",
      view: "side",
      namePl: "Najądrze",
      nameLat: "epididymis",
      tier: "primary"
    },
    {
      anchor: "ductus_deferens",
      view: "side",
      namePl: "Nasieniowód",
      nameLat: "ductus deferens",
      tier: "primary"
    },
    {
      anchor: "seminal_gland",
      view: "side",
      namePl: "Pęcherzyk nasienny",
      nameLat: "glandula seminalis",
      tier: "primary"
    },
    {
      anchor: "prostate",
      view: "side",
      namePl: "Gruczoł krokowy (prostata)",
      nameLat: "prostata",
      tier: "primary"
    },
    {
      anchor: "penis",
      view: "side",
      namePl: "Prącie",
      nameLat: "penis",
      tier: "primary"
    },
    {
      anchor: "ejaculatory_duct",
      view: "side",
      namePl: "Przewód wytryskowy",
      nameLat: "ductus ejaculatorius",
      tier: "secondary"
    },
    {
      anchor: "urethra_m",
      view: "side",
      namePl: "Cewka moczowa",
      nameLat: "urethra masculina",
      tier: "secondary"
    },
    {
      anchor: "bladder_m",
      view: "side",
      namePl: "Pęcherz moczowy (tło)",
      nameLat: "vesica urinaria",
      tier: "secondary"
    },
    {
      anchor: "testicular_vessels",
      view: "side",
      namePl: "Naczynia jądrowe",
      nameLat: "a. et v. testicularis",
      tier: "secondary"
    },
    {
      anchor: "ovary",
      view: "detail",
      namePl: "Jajnik",
      nameLat: "ovarium",
      tier: "primary"
    },
    {
      anchor: "uterine_tube",
      view: "detail",
      namePl: "Jajowód",
      nameLat: "tuba uterina",
      tier: "primary"
    },
    {
      anchor: "uterus",
      view: "detail",
      namePl: "Macica",
      nameLat: "uterus",
      tier: "primary"
    },
    {
      anchor: "vagina",
      view: "detail",
      namePl: "Pochwa",
      nameLat: "vagina",
      tier: "primary",
      side: "right"
    },
    {
      anchor: "cervix",
      view: "detail",
      namePl: "Szyjka macicy",
      nameLat: "cervix uteri",
      tier: "secondary",
      side: "right"
    },
    {
      anchor: "ovarian_ligament",
      view: "detail",
      namePl: "Więzadło właściwe jajnika",
      nameLat: "lig. ovarii proprium",
      tier: "secondary"
    },
    {
      anchor: "uterine_artery",
      view: "detail",
      namePl: "Tętnica maciczna",
      nameLat: "a. uterina",
      tier: "secondary",
      side: "right"
    },
    {
      anchor: "bladder_f",
      view: "detail",
      namePl: "Pęcherz moczowy (tło)",
      nameLat: "vesica urinaria",
      tier: "secondary"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP): miednica i narządy płciowe mężczyzny. HuBMAP Human Reference Atlas, VH Female (macica, jajniki, jajowody, pochwa, więzadła jajnika, naczynia maciczne, pęcherz moczowy, miednica, kręgi; CC BY 4.0). Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
