import type { AtlasPlateLayout } from '../facts';

/**
 * Układ planszy „Układ limfatyczny i odpornościowy” (E1-K2): kotwice, widoki, kolejność, tier, nazwy struktur i strzałki.
 * Treść faktów (opisy ról, statusy, źródła, liczby, podsumowania, zdanie o „sprincie”) jest wyłącznie w
 * src/atlas/data/facts/limfatyczny.json; planszę składa src/atlas/facts.ts (buildPlate). Walidator
 * scripts/atlas_check_data.mjs pilnuje, żeby w tym pliku nie było tekstów faktów.
 */
export const LIMFATYCZNY: AtlasPlateLayout = {
  id: "limfatyczny",
  titlePl: "Układ limfatyczny",
  subtitlePl: "Jak wysiłek wypycha komórki odpornościowe do krwi",
  colorVar: "--sys-lymph",
  changeLinks: [
    { metric: "limfatyczny.metric.objetosc_sledziony", anchors: ["spleen"] },
  ],
  heroMetricId: "limfatyczny.metric.komorki_nk_we_krwi",
  scaleFreeViews: ["detail"],
  views: [
    "front",
    "detail"
  ],
  viewTitlesPl: {
    front: "Widok z przodu (węzły powiększone, naczynia chłonne: schemat)",
    detail: "Węzeł chłonny w przekroju"
  },
  labels: [
    {
      anchor: "cervical",
      view: "front",
      namePl: "Węzły chłonne szyjne",
      nameLat: "nodi lymphoidei cervicales",
      tier: "primary"
    },
    {
      anchor: "axillary",
      view: "front",
      namePl: "Węzły chłonne pachowe",
      nameLat: "nodi lymphoidei axillares",
      tier: "primary"
    },
    {
      anchor: "thymus",
      view: "front",
      namePl: "Grasica",
      nameLat: "thymus",
      tier: "primary"
    },
    {
      anchor: "thoracic_duct",
      view: "front",
      namePl: "Przewód piersiowy (schemat)",
      nameLat: "ductus thoracicus",
      tier: "primary"
    },
    {
      anchor: "spleen",
      view: "front",
      namePl: "Śledziona",
      nameLat: "splen (lien)",
      tier: "primary"
    },
    {
      anchor: "inguinal",
      view: "front",
      namePl: "Węzły chłonne pachwinowe",
      nameLat: "nodi lymphoidei inguinales",
      tier: "primary"
    },
    {
      anchor: "venous_angle",
      view: "front",
      namePl: "Ujście limfy do krwi",
      nameLat: "angulus venosus sinister",
      tier: "primary"
    },
    {
      anchor: "leg_lymph",
      view: "front",
      namePl: "Naczynia chłonne nogi (schemat)",
      nameLat: "vasa lymphatica membri inferioris",
      tier: "secondary"
    },
    {
      anchor: "cisterna",
      view: "front",
      namePl: "Zbiornik mleczu (schemat)",
      nameLat: "cisterna chyli",
      tier: "secondary"
    },
    {
      anchor: "mediastinal",
      view: "front",
      namePl: "Węzły tchawiczo-oskrzelowe",
      nameLat: "nodi lymphoidei tracheobronchiales",
      tier: "secondary"
    },
    {
      anchor: "abdominal",
      view: "front",
      namePl: "Węzły krezkowe",
      nameLat: "nodi lymphoidei mesenterici",
      tier: "secondary"
    },
    {
      anchor: "iliac",
      view: "front",
      namePl: "Węzły biodrowe",
      nameLat: "nodi lymphoidei iliaci",
      tier: "secondary"
    },
    {
      anchor: "d_afferent",
      view: "detail",
      namePl: "Naczynie chłonne doprowadzające",
      nameLat: "vas lymphaticum afferens",
      tier: "primary"
    },
    {
      anchor: "d_follicle",
      view: "detail",
      namePl: "Grudka chłonna",
      nameLat: "nodulus lymphoideus",
      tier: "primary"
    },
    {
      anchor: "d_efferent",
      view: "detail",
      namePl: "Naczynie chłonne odprowadzające",
      nameLat: "vas lymphaticum efferens",
      tier: "primary"
    },
    {
      anchor: "d_capsule",
      view: "detail",
      namePl: "Torebka węzła",
      nameLat: "capsula",
      tier: "secondary"
    },
    {
      anchor: "d_paracortex",
      view: "detail",
      namePl: "Strefa przykorowa",
      nameLat: "paracortex",
      tier: "secondary"
    },
    {
      anchor: "d_medulla",
      view: "detail",
      namePl: "Rdzeń węzła",
      nameLat: "medulla",
      tier: "secondary"
    }
  ],
  creditsPl: "Modele: Z-Anatomy (węzły chłonne, śledziona, grasica, migdałki, szkielet, żyły; CC BY-SA 4.0), na bazie BodyParts3D © DBCLS (CC BY-SA 2.1 JP), oraz HuBMAP Human Reference Atlas (węzeł chłonny NIH_M_Lymph_Node; CC BY 4.0). Schemat naczyń chłonnych i powiększenie węzłów: BIOGENESIS. Render i opracowanie: BIOGENESIS, CC BY-SA 4.0."
};
