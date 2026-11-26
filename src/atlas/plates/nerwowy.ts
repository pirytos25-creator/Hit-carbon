import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ nerwowy” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/nerwowy.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const NERWOWY: AtlasPlateLayout = {
  id: "nerwowy",
  titlePl: "Układ nerwowy",
  subtitlePl: "Jak rozkaz z mózgu dociera do nóg i jak układ współczulny mobilizuje ciało",
  colorVar: "--sys-nerve",
  heroMetricId: "nerwowy.metric.rekrutacja_jednostek_ruchowych",
  views: [
    "front",
    "back"
  ],
  viewTitlesPl: {
    front: "Widok z przodu",
    back: "Widok z tyłu"
  },
  labels: [
    {
      anchor: "intercostal",
      view: "front",
      namePl: "Nerwy międzyżebrowe",
      nameLat: "nn. intercostales",
      tier: "secondary"
    },
    {
      anchor: "sympathetic_trunk",
      view: "front",
      namePl: "Pień współczulny",
      nameLat: "truncus sympathicus",
      tier: "primary"
    },
    {
      anchor: "adrenal",
      view: "front",
      namePl: "Rdzeń nadnercza",
      nameLat: "medulla glandulae suprarenalis",
      tier: "primary"
    },
    {
      anchor: "lumbar_plexus",
      view: "front",
      namePl: "Splot lędźwiowy",
      nameLat: "plexus lumbalis",
      tier: "secondary"
    },
    {
      anchor: "femoral",
      view: "front",
      namePl: "Nerw udowy",
      nameLat: "n. femoralis",
      tier: "primary"
    },
    {
      anchor: "obturator",
      view: "front",
      namePl: "Nerw zasłonowy",
      nameLat: "n. obturatorius",
      tier: "secondary"
    },
    {
      anchor: "deep_fibular",
      view: "front",
      namePl: "Nerw strzałkowy głęboki",
      nameLat: "n. fibularis profundus",
      tier: "secondary"
    },
    {
      anchor: "motor_cortex",
      view: "back",
      namePl: "Kora ruchowa",
      nameLat: "gyrus precentralis",
      tier: "primary"
    },
    {
      anchor: "spinal_cord",
      view: "back",
      namePl: "Rdzeń kręgowy",
      nameLat: "medulla spinalis",
      tier: "primary"
    },
    {
      anchor: "cauda_equina",
      view: "back",
      namePl: "Ogon koński",
      nameLat: "cauda equina",
      tier: "secondary"
    },
    {
      anchor: "sciatic",
      view: "back",
      namePl: "Nerw kulszowy",
      nameLat: "n. ischiadicus",
      tier: "primary"
    },
    {
      anchor: "common_fibular",
      view: "back",
      namePl: "Nerw strzałkowy wspólny",
      nameLat: "n. fibularis communis",
      tier: "primary"
    },
    {
      anchor: "tibial",
      view: "back",
      namePl: "Nerw piszczelowy",
      nameLat: "n. tibialis",
      tier: "primary"
    },
    {
      anchor: "motor_units",
      view: "back",
      namePl: "Jednostki ruchowe nogi",
      nameLat: "unitates motoriae",
      tier: "primary"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP); w Z-Anatomy użyto też modeli „Brainder” (University of Washington) i „Cranial Nerves and Foramina” (University of Dundee, CAHID, CC BY 4.0). Sylwetka wyliczona z tych samych modeli. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
