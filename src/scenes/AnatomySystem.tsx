import * as THREE from 'three';
import { AnatomicalLayerKey } from '../types/biogenesis';

/**
 * Mapuje nazwy obiektów z pliku GLB athlete_gym.glb na warstwy anatomiczne
 * i steruje ich przezroczystością oraz widocznością bez alokacji klatkowych.
 */
export function classifyAthleteLayer(meshName: string): AnatomicalLayerKey | 'gym' | 'other' {
  if (meshName.startsWith('Gym_') || meshName.startsWith('Treadmill_')) return 'gym';
  if (meshName.startsWith('Layer_Skin_')) return 'skin';
  if (meshName.startsWith('Layer_Muscular_')) return 'muscle';
  if (meshName.startsWith('Layer_Thoracic_')) return 'skeleton';
  if (meshName.startsWith('Layer_Vascular_') || meshName.startsWith('Layer_Heart_')) return 'vascular';
  if (meshName.startsWith('Layer_Lungs_')) return 'respiratory';
  if (meshName.startsWith('Layer_Nervous_')) return 'nervous';
  return 'other';
}

export function applyAthleteLayerVisibility(
  root: THREE.Object3D,
  layers: Record<AnatomicalLayerKey, boolean>,
  skinOpacity: number,
  muscularOpacity = 0.82
) {
  const showInternals = skinOpacity < 0.96 || !layers.skin;

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const cat = classifyAthleteLayer(obj.name);
    if (cat === 'gym' || cat === 'other') return;

    if (cat === 'skin') {
      const enabled = layers.skin && skinOpacity > 0.03;
      obj.visible = enabled;
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.transparent = skinOpacity < 0.99;
        mat.opacity = skinOpacity;
        mat.depthWrite = skinOpacity >= 0.96;
      }
      return;
    }

    if (!showInternals) {
      obj.visible = false;
      return;
    }

    obj.visible = layers[cat];
    if (cat === 'muscle') {
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.transparent = muscularOpacity < 0.99;
        mat.opacity = muscularOpacity;
        mat.depthWrite = muscularOpacity >= 0.95;
      }
    }
  });
}
