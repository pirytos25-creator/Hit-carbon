/**
 * Części gabloty serca: klucze zgodne z danymi panelu (src/atlas/data/organs/serce.json, pole `part`),
 * polskie nazwy anatomiczne (etykiety, nie fakty) i przypisanie węzłów HuBMAP (VH_M_*) do części.
 */
export const HEART_PARTS = [
  'right_atrium', 'left_atrium', 'right_ventricle', 'left_ventricle', 'interventricular_septum',
  'tricuspid_valve', 'mitral_valve', 'pulmonary_valve', 'aortic_valve', 'papillary_muscles',
  'aorta', 'pulmonary_trunk', 'venae_cavae', 'pulmonary_veins', 'coronary_arteries', 'cardiac_veins',
  'sinoatrial_node', 'atrioventricular_node',
] as const;
export type HeartPart = (typeof HEART_PARTS)[number];

export const PART_INDEX: Record<HeartPart, number> = Object.fromEntries(HEART_PARTS.map((p, i) => [p, i + 1])) as Record<HeartPart, number>;

export const PART_NAME_PL: Record<HeartPart, string> = {
  right_atrium: 'Prawy przedsionek',
  left_atrium: 'Lewy przedsionek',
  right_ventricle: 'Prawa komora',
  left_ventricle: 'Lewa komora',
  interventricular_septum: 'Przegroda międzykomorowa',
  tricuspid_valve: 'Zastawka trójdzielna',
  mitral_valve: 'Zastawka dwudzielna (mitralna)',
  pulmonary_valve: 'Zastawka pnia płucnego',
  aortic_valve: 'Zastawka aortalna',
  papillary_muscles: 'Mięśnie brodawkowate',
  aorta: 'Aorta',
  pulmonary_trunk: 'Pień płucny',
  venae_cavae: 'Żyły główne',
  pulmonary_veins: 'Żyły płucne',
  coronary_arteries: 'Tętnice wieńcowe',
  cardiac_veins: 'Żyły serca',
  sinoatrial_node: 'Węzeł zatokowo-przedsionkowy',
  atrioventricular_node: 'Węzeł przedsionkowo-komorowy',
};

/** Części, które w gablocie są SCHEMATEM (geometria własna, chip „schemat · bez skali”). */
export const SCHEMATIC_PARTS: ReadonlySet<HeartPart> = new Set(['sinoatrial_node', 'atrioventricular_node']);

/** Klucz części z nazwy węzła HuBMAP (bez prefiksu VH_M_). */
export function partOfNode(node: string): HeartPart | null {
  const n = node.replace(/^VH_M_/, '').replace(/_\d+$/, '');
  if (n === 'right_cardiac_atrium') return 'right_atrium';
  if (n === 'left_cardiac_atrium') return 'left_atrium';
  if (n === 'heart_right_ventricle') return 'right_ventricle';
  if (n === 'heart_left_ventricle') return 'left_ventricle';
  if (n === 'interventricular_septum') return 'interventricular_septum';
  if (n === 'tricuspid_valve' || n === 'mitral_valve' || n === 'pulmonary_valve' || n === 'aortic_valve') return n;
  if (n.startsWith('papillary_muscle')) return 'papillary_muscles';
  if (n.startsWith('pulmonary_vein')) return 'pulmonary_veins';
  if (n.startsWith('pulmonary_trunk') || n.startsWith('pulmonary_artery')) return 'pulmonary_trunk';
  if (n.includes('vena_cava') || n.startsWith('brachiocephalic_vein')) return 'venae_cavae';
  if (n.includes('cardiac_vein') || n === 'coronary_sinus' || n.startsWith('oblique_vein')) return 'cardiac_veins';
  if (n.includes('coronary_artery') || n.includes('descending_artery') || n.includes('marginal') || n.includes('diagonal')) return 'coronary_arteries';
  if (n.includes('aort') || n.includes('carotid') || n.includes('subclavian') || n.startsWith('brachiocephalic_artery')) return 'aorta';
  return null;
}

/** Klucz części panelu (np. 'left_ventricle_wall', 'venae_cavae_obszary') → część sceny. */
export function sceneKeyOfPanelPart(part: string): HeartPart | null {
  const base = part.replace(/_(wall|obszary)$/, '');
  if (base === 'chordae_tendineae') return 'papillary_muscles'; // nici nie ma w siatce HuBMAP: miejsce przyczepu
  return (HEART_PARTS as readonly string[]).includes(base) ? (base as HeartPart) : null;
}

/** Strona krwi (do barwy krwinek i ścian w trybie „ściany w barwie krwi”). */
export const LEFT_PARTS: ReadonlySet<HeartPart> = new Set(['left_atrium', 'left_ventricle', 'interventricular_septum', 'mitral_valve', 'aortic_valve']);
