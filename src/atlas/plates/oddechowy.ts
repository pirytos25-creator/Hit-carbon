import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ oddechowy” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/oddechowy.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const ODDECHOWY: AtlasPlateLayout = {
  id: "oddechowy",
  titlePl: "Układ oddechowy",
  subtitlePl: "Skąd bierze się tlen na sprint i dokąd znika CO₂",
  colorVar: "--sys-resp",
  views: [
    "front",
    "detail"
  ],
  viewTitlesPl: {
    front: "Widok z przodu",
    detail: "Pęcherzyk płucny (schemat)"
  },
  labels: [
    {
      anchor: "larynx",
      view: "front",
      namePl: "Krtań",
      nameLat: "larynx",
      tier: "secondary"
    },
    {
      anchor: "trachea",
      view: "front",
      namePl: "Tchawica",
      nameLat: "trachea",
      tier: "primary"
    },
    {
      anchor: "scalene",
      view: "front",
      namePl: "Mm. pochyłe",
      nameLat: "mm. scaleni",
      tier: "secondary"
    },
    {
      anchor: "main_bronchus",
      view: "front",
      namePl: "Oskrzele główne prawe",
      nameLat: "bronchus principalis dexter",
      tier: "primary"
    },
    {
      anchor: "lung",
      view: "front",
      namePl: "Płuco prawe",
      nameLat: "pulmo dexter",
      tier: "primary"
    },
    {
      anchor: "intercostal",
      view: "front",
      namePl: "Mm. międzyżebrowe",
      nameLat: "mm. intercostales",
      tier: "primary"
    },
    {
      anchor: "diaphragm",
      view: "front",
      namePl: "Przepona",
      nameLat: "diaphragma",
      tier: "primary"
    },
    {
      anchor: "bronchiole",
      view: "detail",
      namePl: "Oskrzelik końcowy",
      nameLat: "bronchiolus terminalis",
      tier: "secondary"
    },
    {
      anchor: "alveolus",
      view: "detail",
      namePl: "Pęcherzyk płucny",
      nameLat: "alveolus pulmonis",
      tier: "primary"
    },
    {
      anchor: "capillary",
      view: "detail",
      namePl: "Naczynia włosowate",
      nameLat: "vasa capillaria",
      tier: "primary"
    }
  ],
  flows: [
    {
      view: "front",
      kind: "air",
      labelPl: "Wdech: powietrze do płuca prawego",
      points: [
        [
          573,
          179
        ],
        [
          573,
          298
        ],
        [
          573,
          597
        ],
        [
          505,
          665
        ],
        [
          466,
          767
        ],
        [
          377,
          817
        ]
      ]
    },
    {
      view: "front",
      kind: "air",
      labelPl: "Wdech: powietrze do płuca lewego",
      points: [
        [
          573,
          597
        ],
        [
          716,
          699
        ],
        [
          722,
          757
        ],
        [
          825,
          855
        ]
      ]
    },
    {
      view: "front",
      kind: "air",
      labelPl: "Płat górny prawy",
      points: [
        [
          505,
          665
        ],
        [
          439,
          562
        ]
      ]
    },
    {
      view: "front",
      kind: "air",
      labelPl: "Płat górny lewy",
      points: [
        [
          716,
          699
        ],
        [
          753,
          584
        ]
      ]
    },
    {
      view: "detail",
      kind: "air",
      labelPl: "Powietrze do pęcherzyków",
      points: [
        [
          632,
          111
        ],
        [
          586,
          498
        ],
        [
          575,
          930
        ]
      ]
    },
    {
      view: "detail",
      kind: "air",
      labelPl: "O₂: z pęcherzyka do krwi",
      points: [
        [
          552,
          1089
        ],
        [
          427,
          998
        ],
        [
          302,
          930
        ]
      ]
    },
    {
      view: "detail",
      kind: "air",
      labelPl: "CO₂: z krwi do pęcherzyka",
      points: [
        [
          870,
          907
        ],
        [
          734,
          975
        ],
        [
          620,
          1043
        ]
      ]
    },
    {
      view: "detail",
      kind: "vein",
      labelPl: "Krew odtlenowana z serca",
      points: [
        [
          52,
          634
        ],
        [
          189,
          861
        ],
        [
          302,
          1043
        ]
      ]
    },
    {
      view: "detail",
      kind: "artery",
      labelPl: "Krew utlenowana do serca",
      points: [
        [
          859,
          1089
        ],
        [
          984,
          1293
        ],
        [
          1098,
          1543
        ]
      ]
    }
  ],
  creditsPl: "Modele: HuBMAP Human Reference Atlas, VH Male v1.4 (płuca, tchawica, oskrzela główne, krtań; CC BY 4.0) oraz Z-Anatomy (CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Schemat pęcherzyka: BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
