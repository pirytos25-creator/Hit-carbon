import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ kostny” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/kostny.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const KOSTNY: AtlasPlateLayout = {
  id: "kostny",
  titlePl: "Układ kostny",
  subtitlePl: "Ile waży każdy krok: nacisk podłoża na stopę",
  colorVar: "--sys-bone",
  heroMetricId: "kostny.metric.szczyt_nacisku_podloza_na_stope",
  views: [
    "front",
    "side",
    "detail"
  ],
  viewTitlesPl: {
    front: "Widok z przodu",
    side: "Widok z boku",
    detail: "Przekrój kości udowej (wnętrze: schemat)"
  },
  labels: [
    {
      anchor: "femur",
      view: "front",
      namePl: "Kość udowa",
      nameLat: "femur",
      tier: "primary"
    },
    {
      anchor: "tibia",
      view: "front",
      namePl: "Kość piszczelowa",
      nameLat: "tibia",
      tier: "primary"
    },
    {
      anchor: "hip_bone",
      view: "front",
      namePl: "Kość miedniczna",
      nameLat: "os coxae",
      tier: "primary"
    },
    {
      anchor: "knee",
      view: "front",
      namePl: "Staw kolanowy (łąkotki)",
      nameLat: "articulatio genus, menisci",
      tier: "primary"
    },
    {
      anchor: "patella",
      view: "front",
      namePl: "Rzepka",
      nameLat: "patella",
      tier: "secondary"
    },
    {
      anchor: "fibula",
      view: "front",
      namePl: "Kość strzałkowa",
      nameLat: "fibula",
      tier: "secondary"
    },
    {
      anchor: "humerus",
      view: "front",
      namePl: "Kość ramienna",
      nameLat: "humerus",
      tier: "secondary"
    },
    {
      anchor: "lumbar",
      view: "side",
      namePl: "Kręgosłup lędźwiowy",
      nameLat: "vertebrae lumbales L1–L5",
      tier: "primary"
    },
    {
      anchor: "disc",
      view: "side",
      namePl: "Krążek międzykręgowy",
      nameLat: "discus intervertebralis L4–L5",
      tier: "primary"
    },
    {
      anchor: "calcaneus",
      view: "side",
      namePl: "Kość piętowa",
      nameLat: "calcaneus",
      tier: "primary"
    },
    {
      anchor: "sacrum",
      view: "side",
      namePl: "Kość krzyżowa",
      nameLat: "os sacrum",
      tier: "secondary"
    },
    {
      anchor: "femoral_head",
      view: "side",
      namePl: "Głowa kości udowej",
      nameLat: "caput femoris",
      tier: "secondary"
    },
    {
      anchor: "talus",
      view: "side",
      namePl: "Kość skokowa",
      nameLat: "talus",
      tier: "secondary"
    },
    {
      anchor: "d_cortex",
      view: "detail",
      namePl: "Istota zbita",
      nameLat: "substantia compacta",
      tier: "primary"
    },
    {
      anchor: "d_spongy",
      view: "detail",
      namePl: "Istota gąbczasta (beleczki)",
      nameLat: "substantia spongiosa",
      tier: "primary"
    },
    {
      anchor: "d_marrow",
      view: "detail",
      namePl: "Jama szpikowa",
      nameLat: "cavitas medullaris",
      tier: "primary"
    },
    {
      anchor: "d_head",
      view: "detail",
      namePl: "Głowa kości udowej",
      nameLat: "caput femoris",
      tier: "secondary"
    },
    {
      anchor: "d_trochanter",
      view: "detail",
      namePl: "Krętarz większy",
      nameLat: "trochanter major",
      tier: "secondary"
    },
    {
      anchor: "d_compressive",
      view: "detail",
      namePl: "Pasmo beleczek ściskanych",
      tier: "student"
    },
    {
      anchor: "d_tensile",
      view: "detail",
      namePl: "Pasmo beleczek rozciąganych",
      tier: "student"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Wnętrze kości w przekroju: schemat. W widoku z boku pominięto prawą kończynę górną (zasłaniała miednicę). Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
