import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Mózg” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/mozg.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const MOZG: AtlasPlateLayout = {
  id: "mozg",
  titlePl: "Mózg",
  subtitlePl: "Kto steruje sprintem i czym mózg się wtedy żywi",
  colorVar: "--sys-brain",
  heroMetricId: "mozg.metric.mleczan_z_krwi_jako_paliwo_mozgu",
  views: [
    "side",
    "detail"
  ],
  viewTitlesPl: {
    side: "Lewa półkula z boku",
    detail: "Przekrój pośrodkowy"
  },
  labels: [
    {
      anchor: "prefrontal",
      view: "side",
      namePl: "Kora przedczołowa",
      nameLat: "cortex praefrontalis",
      tier: "secondary"
    },
    {
      anchor: "motor_cortex",
      view: "side",
      namePl: "Kora ruchowa",
      nameLat: "gyrus praecentralis",
      tier: "primary"
    },
    {
      anchor: "sensory_cortex",
      view: "side",
      namePl: "Kora czuciowa",
      nameLat: "gyrus postcentralis",
      tier: "secondary"
    },
    {
      anchor: "cerebellum",
      view: "side",
      namePl: "Móżdżek",
      nameLat: "cerebellum",
      tier: "primary"
    },
    {
      anchor: "brainstem",
      view: "side",
      namePl: "Pień mózgu",
      nameLat: "truncus encephali",
      tier: "primary"
    },
    {
      anchor: "paracentral",
      view: "detail",
      namePl: "Płacik okołośrodkowy",
      nameLat: "lobulus paracentralis",
      tier: "primary"
    },
    {
      anchor: "basal_ganglia",
      view: "detail",
      namePl: "Jądra podstawy (rzut)",
      nameLat: "nuclei basales",
      tier: "primary"
    },
    {
      anchor: "thalamus",
      view: "detail",
      namePl: "Wzgórze",
      nameLat: "thalamus",
      tier: "secondary"
    },
    {
      anchor: "hypothalamus",
      view: "detail",
      namePl: "Podwzgórze",
      nameLat: "hypothalamus",
      tier: "primary"
    },
    {
      anchor: "vermis",
      view: "detail",
      namePl: "Robak móżdżku",
      nameLat: "vermis cerebelli",
      tier: "primary"
    },
    {
      anchor: "medulla",
      view: "detail",
      namePl: "Rdzeń przedłużony",
      nameLat: "medulla oblongata",
      tier: "primary"
    }
  ],
  flows: [
    {
      view: "detail",
      kind: "artery",
      labelPl: "Krew przynosi mleczan i glukozę (schemat drogi, nie przebieg naczyń)",
      points: [
        [
          640,
          1057
        ],
        [
          585,
          914
        ],
        [
          505,
          800
        ],
        [
          452,
          671
        ],
        [
          414,
          600
        ],
        [
          314,
          471
        ],
        [
          371,
          357
        ],
        [
          543,
          307
        ],
        [
          671,
          243
        ],
        [
          757,
          157
        ]
      ]
    }
  ],
  creditsPl: "Model: Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP); w Z-Anatomy użyto też modeli „Brainder” i „White matter” (University of Washington). Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
