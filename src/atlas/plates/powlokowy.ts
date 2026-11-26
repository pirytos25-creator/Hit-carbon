import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Skóra (układ powłokowy)” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/powlokowy.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const POWLOKOWY: AtlasPlateLayout = {
  id: "powlokowy",
  titlePl: "Skóra",
  subtitlePl: "Jak skóra pozbywa się ciepła z pracujących mięśni",
  colorVar: "--sys-skin",
  changeIllustration: ["skin_forehead","skin_back","skin_trunk","sweat_gland","vessels_sup"],
  heroMetricId: "powlokowy.metric.energia_z_pracy_miesni_zamieniana_w_cieplo",
  scaleFreeViews: ["detail"],
  views: [
    "front",
    "back",
    "detail"
  ],
  viewTitlesPl: {
    front: "Widok z przodu",
    back: "Widok z tyłu",
    detail: "Przekrój skóry (schemat)"
  },
  labels: [
    {
      anchor: "skin_forehead",
      view: "front",
      namePl: "Skóra czoła",
      nameLat: "cutis",
      tier: "primary"
    },
    {
      anchor: "skin_trunk",
      view: "front",
      namePl: "Skóra tułowia",
      nameLat: "cutis",
      tier: "primary"
    },
    {
      anchor: "external_jugular",
      view: "front",
      namePl: "Ż. szyjna zewnętrzna",
      nameLat: "v. jugularis externa",
      tier: "secondary"
    },
    {
      anchor: "cephalic",
      view: "front",
      namePl: "Żyła odpromieniowa",
      nameLat: "v. cephalica",
      tier: "primary"
    },
    {
      anchor: "median_cubital",
      view: "front",
      namePl: "Ż. pośrodkowa łokcia",
      nameLat: "v. mediana cubiti",
      tier: "secondary"
    },
    {
      anchor: "basilic",
      view: "front",
      namePl: "Żyła odłokciowa",
      nameLat: "v. basilica",
      tier: "secondary"
    },
    {
      anchor: "hand_veins",
      view: "front",
      namePl: "Sieć żylna grzbietowa ręki",
      nameLat: "rete venosum dorsale manus",
      tier: "secondary"
    },
    {
      anchor: "great_saphenous",
      view: "front",
      namePl: "Żyła odpiszczelowa",
      nameLat: "v. saphena magna",
      tier: "primary"
    },
    {
      anchor: "skin_back",
      view: "back",
      namePl: "Skóra pleców",
      nameLat: "cutis",
      tier: "primary"
    },
    {
      anchor: "small_saphenous",
      view: "back",
      namePl: "Żyła odstrzałkowa",
      nameLat: "v. saphena parva",
      tier: "secondary"
    },
    {
      anchor: "epidermis",
      view: "detail",
      namePl: "Naskórek",
      nameLat: "epidermis",
      tier: "primary"
    },
    {
      anchor: "sweat_pore",
      view: "detail",
      namePl: "Por potowy",
      tier: "secondary"
    },
    {
      anchor: "dermis",
      view: "detail",
      namePl: "Skóra właściwa",
      nameLat: "dermis",
      tier: "primary"
    },
    {
      anchor: "vessels_sup",
      view: "detail",
      namePl: "Naczynia krwionośne skóry",
      tier: "primary"
    },
    {
      anchor: "arrector_pili",
      view: "detail",
      namePl: "Mięsień przywłosowy",
      nameLat: "m. arrector pili",
      tier: "secondary"
    },
    {
      anchor: "sebaceous",
      view: "detail",
      namePl: "Gruczoł łojowy",
      nameLat: "glandula sebacea",
      tier: "secondary"
    },
    {
      anchor: "hair_follicle",
      view: "detail",
      namePl: "Mieszek włosowy",
      nameLat: "folliculus pili",
      tier: "secondary"
    },
    {
      anchor: "sweat_gland",
      view: "detail",
      namePl: "Gruczoł potowy ekrynowy",
      nameLat: "glandula sudorifera",
      tier: "primary"
    },
    {
      anchor: "vessels_deep",
      view: "detail",
      namePl: "Głęboka sieć naczyń skóry",
      tier: "secondary"
    },
    {
      anchor: "hypodermis",
      view: "detail",
      namePl: "Tkanka podskórna",
      nameLat: "tela subcutanea",
      tier: "primary"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP): szkielet, mięśnie, żyły powierzchowne; sylwetka skóry wyliczona z tych modeli. Schemat przekroju skóry: BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
