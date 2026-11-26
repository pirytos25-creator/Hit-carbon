import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ mięśniowy” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/miesniowy.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const MIESNIOWY: AtlasPlateLayout = {
  id: "miesniowy",
  titlePl: "Układ mięśniowy",
  subtitlePl: "Które mięśnie napędzają sprint na bieżni",
  colorVar: "--sys-muscle",
  changeLinks: [
    { metric: "miesniowy.metric.zapotrzebowanie_miesni_na_atp", anchors: ["rectus_femoris","vastus_lateralis","gluteus_maximus","biceps_femoris","semitendinosus","gastrocnemius","soleus","tibialis_anterior","d_vastus_lateralis","d_hamstrings"] },
  ],
  heroMetricId: "miesniowy.metric.rekrutowane_wlokna_miesniowe",
  views: [
    "front",
    "back",
    "detail"
  ],
  viewTitlesPl: {
    front: "Widok z przodu",
    back: "Widok z tyłu",
    detail: "Zbliżenie: udo, włókna, białka"
  },
  labels: [
    {
      anchor: "deltoid",
      view: "front",
      namePl: "M. naramienny",
      nameLat: "m. deltoideus",
      tier: "secondary"
    },
    {
      anchor: "rectus_abdominis",
      view: "front",
      namePl: "M. prosty brzucha",
      nameLat: "m. rectus abdominis",
      tier: "secondary"
    },
    {
      anchor: "rectus_femoris",
      view: "front",
      namePl: "M. prosty uda",
      nameLat: "m. rectus femoris",
      tier: "primary"
    },
    {
      anchor: "vastus_lateralis",
      view: "front",
      namePl: "M. obszerny boczny",
      nameLat: "m. vastus lateralis",
      tier: "primary"
    },
    {
      anchor: "tibialis_anterior",
      view: "front",
      namePl: "M. piszczelowy przedni",
      nameLat: "m. tibialis anterior",
      tier: "primary"
    },
    {
      anchor: "gluteus_maximus",
      view: "back",
      namePl: "M. pośladkowy wielki",
      nameLat: "m. gluteus maximus",
      tier: "primary"
    },
    {
      anchor: "biceps_femoris",
      view: "back",
      namePl: "M. dwugłowy uda",
      nameLat: "m. biceps femoris",
      tier: "primary"
    },
    {
      anchor: "semitendinosus",
      view: "back",
      namePl: "M. półścięgnisty",
      nameLat: "m. semitendinosus",
      tier: "primary"
    },
    {
      anchor: "gastrocnemius",
      view: "back",
      namePl: "M. brzuchaty łydki",
      nameLat: "m. gastrocnemius",
      tier: "primary"
    },
    {
      anchor: "soleus",
      view: "back",
      namePl: "M. płaszczkowaty",
      nameLat: "m. soleus",
      tier: "primary"
    },
    {
      anchor: "d_vastus_lateralis",
      view: "detail",
      namePl: "M. obszerny boczny",
      nameLat: "m. vastus lateralis",
      tier: "primary"
    },
    {
      anchor: "d_femur",
      view: "detail",
      namePl: "Kość udowa",
      nameLat: "femur",
      tier: "secondary"
    },
    {
      anchor: "d_hamstrings",
      view: "detail",
      namePl: "M. dwugłowy uda",
      nameLat: "m. biceps femoris",
      tier: "primary"
    },
    {
      anchor: "d_fiber_I",
      view: "detail",
      namePl: "Włókno typu I",
      nameLat: "wolne, tlenowe · ok. 42%",
      tier: "primary"
    },
    {
      anchor: "d_fiber_IIa",
      view: "detail",
      namePl: "Włókno typu IIa",
      nameLat: "szybkie, mieszane · ok. 35%",
      tier: "primary"
    },
    {
      anchor: "d_fiber_IIx",
      view: "detail",
      namePl: "Włókno typu IIx",
      nameLat: "najszybsze, beztlenowe · ok. 23%",
      tier: "primary"
    },
    {
      anchor: "d_myosin",
      view: "detail",
      namePl: "Główka miozyny",
      nameLat: "mostek poprzeczny (PDB 5H53)",
      tier: "primary"
    },
    {
      anchor: "d_actin",
      view: "detail",
      namePl: "Filament aktynowy",
      nameLat: "aktyna F",
      tier: "secondary"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Mostek poprzeczny: PDB 5H53 (Fujii i Namba 2017, struktura z mięśnia królika), Molecular Nodes. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
