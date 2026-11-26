import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ActId } from '../types/biogenesis';

export type ModelKey =
  | 'athlete_gym'
  | 'cardiopulmonary'
  | 'bloodstream_tunnel'
  | 'muscle_sarcomere'
  | 'mitochondrion'
  | 'brain_macro'
  | 'neural_forest'
  | 'synapse_hero';

export const MODEL_PATHS: Record<ModelKey, string> = {
  athlete_gym: '/models/athlete_gym.glb',
  cardiopulmonary: '/models/cardiopulmonary.glb',
  bloodstream_tunnel: '/models/bloodstream_tunnel.glb',
  muscle_sarcomere: '/models/muscle_sarcomere.glb',
  mitochondrion: '/models/mitochondrion.glb',
  brain_macro: '/models/brain_macro.glb',
  neural_forest: '/models/neural_forest.glb',
  synapse_hero: '/models/synapse_hero.glb',
};

// Zgodne z modelami, które sceny faktycznie wczytują (useGLTF / AthleteGymRig); poprawka M4 (przegląd filmu):
// akt 2 nie używa sportowca ani neural_forest, a używa brain_macro; akt 6 nie używa cardiopulmonary;
// akt 12 nie używa mitochondrion.glb (mitochondria w akcie 12 są proceduralne).
const ACT_MODEL_MAP: Record<ActId, ModelKey[]> = {
  1: ['athlete_gym'],
  2: ['brain_macro', 'synapse_hero'],
  3: ['cardiopulmonary', 'bloodstream_tunnel'],
  4: ['muscle_sarcomere'],
  5: ['mitochondrion'],
  6: ['athlete_gym'],
  7: ['bloodstream_tunnel'],
  8: ['brain_macro', 'neural_forest'],
  9: ['neural_forest', 'synapse_hero'],
  10: ['neural_forest', 'synapse_hero', 'brain_macro'],
  11: ['athlete_gym'],
  12: ['cardiopulmonary', 'brain_macro'],
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
    // Keep athlete_gym warm for Act I/VI/XI continuity; release heavy off-window caches on RTX 4050
    (Object.keys(MODEL_PATHS) as ModelKey[]).forEach((k) => {
      if (!keep.has(k) && k !== 'athlete_gym' && this.preloaded.has(k)) {
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
