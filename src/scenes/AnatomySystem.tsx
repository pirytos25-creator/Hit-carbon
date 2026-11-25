import * as THREE from 'three';
import { AnatomicalLayerKey } from '../types/biogenesis';
import { applyBioPbrSurface } from '../shaders/bioPbrTextures';
import { OrganicCutawayUniforms, patchMaterialWithOrganicCutaway } from '../shaders/cutawayShader';

/**
 * Classifies meshes inside `athlete_gym.glb` into anatomical layers vs environment.
 */
export function classifyAthleteLayer(meshName: string): AnatomicalLayerKey | 'athlete_outer' | 'gym' | 'other' {
  if (meshName.startsWith('Gym_') || meshName.startsWith('Treadmill_')) return 'gym';
  if (meshName === 'Layer_Skin_Singlet' || meshName === 'Layer_Skin_Shorts' || meshName.startsWith('Sneaker_') || meshName.startsWith('Athlete_')) {
    return 'athlete_outer';
  }
  if (meshName.startsWith('Layer_Skin_')) return 'skin';
  if (meshName.startsWith('Layer_Muscular_')) return 'muscle';
  if (meshName.startsWith('Layer_Thoracic_')) return 'skeleton';
  if (meshName.startsWith('Layer_Vascular_') || meshName.startsWith('Layer_Heart_')) return 'vascular';
  if (meshName.startsWith('Layer_Lungs_')) return 'respiratory';
  if (meshName.startsWith('Layer_Nervous_')) return 'nervous';
  return 'other';
}

/**
 * Configures procedural PBR maps (`skin`, `muscle`, `gym_floor`) and patches outer
 * skin & garments with organic noise-modulated cutaway shader uniforms.
 */
export function upgradeAthleteAndGymMaterials(
  root: THREE.Object3D,
  cutawayUniforms: OrganicCutawayUniforms
): { skinMaterials: THREE.MeshPhysicalMaterial[]; outerMaterials: THREE.MeshStandardMaterial[] } {
  const skinMaterials: THREE.MeshPhysicalMaterial[] = [];
  const outerMaterials: THREE.MeshStandardMaterial[] = [];

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.castShadow = true;
    obj.receiveShadow = true;

    const oldMat = obj.material as THREE.MeshStandardMaterial;
    if (!oldMat) return;
    const mat = oldMat.clone();

    if (obj.name === 'Gym_Floor') {
      applyBioPbrSurface(mat, 'gym_floor', 0.55, 8, 8);
      mat.roughness = 0.78;
    } else if (obj.name === 'Layer_Skin_Body') {
      const phys = new THREE.MeshPhysicalMaterial({
        color: mat.color.clone().set('#c9947d'),
        roughness: 0.60,
        metalness: 0.0,
        clearcoat: 0.02,
        clearcoatRoughness: 0.40,
        sheen: 0.18,
        sheenColor: new THREE.Color('#f7c6b3'),
      });
      applyBioPbrSurface(phys, 'skin', 0.35, 5, 5);
      patchMaterialWithOrganicCutaway(phys, cutawayUniforms);
      obj.material = phys;
      skinMaterials.push(phys);
      outerMaterials.push(phys);
      mat.dispose();
      return;
    } else if (obj.name === 'Layer_Skin_Singlet' || obj.name === 'Layer_Skin_Shorts') {
      patchMaterialWithOrganicCutaway(mat, cutawayUniforms);
      outerMaterials.push(mat);
    } else if (obj.name.startsWith('Layer_Muscular_')) {
      const muscPhys = new THREE.MeshPhysicalMaterial({
        color: '#b42830',
        roughness: 0.34,
        metalness: 0.02,
        clearcoat: 0.45,
        clearcoatRoughness: 0.22,
      });
      applyBioPbrSurface(muscPhys, 'muscle', 0.85, 6, 8);
      obj.material = muscPhys;
      mat.dispose();
      return;
    } else if (obj.name.startsWith('Sneaker_')) {
      patchMaterialWithOrganicCutaway(mat, cutawayUniforms);
      outerMaterials.push(mat);
    }

    obj.material = mat;
  });

  return { skinMaterials, outerMaterials };
}

export function applyAthleteLayerVisibility(
  root: THREE.Object3D,
  layers: Record<AnatomicalLayerKey, boolean>,
  skinOpacity: number,
  muscularOpacity = 0.92,
  cutawayActive = false
) {
  const showInternals = skinOpacity < 0.96 || !layers.skin || cutawayActive;

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const cat = classifyAthleteLayer(obj.name);
    if (cat === 'gym' || cat === 'other') return;

    if (cat === 'athlete_outer') {
      const enabled = layers.skin && skinOpacity > 0.03;
      obj.visible = enabled;
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (mat && (obj.name === 'Layer_Skin_Singlet' || obj.name === 'Layer_Skin_Shorts')) {
        mat.transparent = skinOpacity < 0.99;
        mat.opacity = skinOpacity;
        mat.depthWrite = skinOpacity >= 0.96;
      }
      return;
    }

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
