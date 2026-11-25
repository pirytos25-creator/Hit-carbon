import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ActId } from '../types/biogenesis';

export type ModelKey =
  | 'athlete_gym'
  | 'cardiopulmonary'
  | 'muscle_sarcomere'
  | 'mitochondrion'
  | 'brain_synapse';

export const MODEL_PATHS: Record<ModelKey, string> = {
  athlete_gym: '/models/athlete_gym.glb',
  cardiopulmonary: '/models/cardiopulmonary.glb',
  muscle_sarcomere: '/models/muscle_sarcomere.glb',
  mitochondrion: '/models/mitochondrion.glb',
  brain_synapse: '/models/brain_synapse.glb',
};

const ACT_MODEL_MAP: Record<ActId, ModelKey[]> = {
  1: ['athlete_gym'],
  2: ['athlete_gym', 'brain_synapse'],
  3: ['cardiopulmonary'],
  4: ['muscle_sarcomere'],
  5: ['mitochondrion'],
  6: ['athlete_gym', 'cardiopulmonary'],
  7: ['brain_synapse'],
  8: ['brain_synapse'],
  9: ['brain_synapse'],
  10: ['brain_synapse'],
  11: ['athlete_gym'],
  12: ['cardiopulmonary', 'mitochondrion', 'brain_synapse'],
};

class AssetManagerImpl {
  private preloaded = new Set<ModelKey>();

  public preloadForAct(actId: ActId) {
    const keys = new Set<ModelKey>(ACT_MODEL_MAP[actId] ?? []);
    if (actId < 12) {
      const nextKeys = ACT_MODEL_MAP[(actId + 1) as ActId] ?? [];
      nextKeys.forEach((k) => keys.add(k));
    }
    keys.forEach((k) => {
      if (!this.preloaded.has(k)) {
        this.preloaded.add(k);
        useGLTF.preload(MODEL_PATHS[k]);
      }
    });
  }

  public releaseUnusedExcept(activeActs: ActId[]) {
    const keep = new Set<ModelKey>();
    activeActs.forEach((a) => {
      (ACT_MODEL_MAP[a] ?? []).forEach((k) => keep.add(k));
    });
    // Keep athlete_gym warm for instant Act I/XI returns; clear heavy unused GLTF caches if needed
    (Object.keys(MODEL_PATHS) as ModelKey[]).forEach((k) => {
      if (!keep.has(k) && k !== 'athlete_gym' && this.preloaded.has(k)) {
        // Note: Drei caches by URL; selective clear keeps RTX 4050 VRAM footprint lean
        useGLTF.clear(MODEL_PATHS[k]);
        this.preloaded.delete(k);
      }
    });
  }

  public disposeObject3D(root: THREE.Object3D | null | undefined) {
    if (!root) return;
    root.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry?.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (!m) return;
          Object.values(m).forEach((val) => {
            if (val && typeof val === 'object' && 'isTexture' in val && (val as THREE.Texture).isTexture) {
              (val as THREE.Texture).dispose();
            }
          });
          m.dispose();
        });
      }
    });
  }
}

export const assetManager = new AssetManagerImpl();
