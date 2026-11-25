import type { AtlasCamera } from './types';

/**
 * Rzut ortograficzny punktu świata (metry, układ Z-Anatomy) na obraz widoku: wynik [u, v] w skali 0-1,
 * v liczone od GÓRY obrazu (jak kotwice w anchors.json). To ta sama matematyka co w Blenderze
 * (atlas_lib.Plate._project, kamera ORTHO, sensor_fit AUTO: orthoScale obejmuje dłuższy bok obrazu).
 * Zgodność sprawdza scripts/atlas_check_projection.ts (anchors3d -> anchors).
 */
export function projectPoint(p: readonly number[], cam: AtlasCamera, resolution: readonly [number, number]): [number, number] {
  const [W, H] = resolution;
  const wWorld = W >= H ? cam.orthoScale : (cam.orthoScale * W) / H;
  const hWorld = W >= H ? (cam.orthoScale * H) / W : cam.orthoScale;
  const d = [p[0] - cam.center[0], p[1] - cam.center[1], p[2] - cam.center[2]];
  const x = d[0] * cam.right[0] + d[1] * cam.right[1] + d[2] * cam.right[2];
  const y = d[0] * cam.up[0] + d[1] * cam.up[1] + d[2] * cam.up[2];
  return [0.5 + x / wWorld, 0.5 - y / hWorld];
}

/** Rzut na piksele renderu (format AtlasFlow.points). */
export function projectToPixels(p: readonly number[], cam: AtlasCamera, resolution: readonly [number, number]): [number, number] {
  const [u, v] = projectPoint(p, cam, resolution);
  return [u * resolution[0], v * resolution[1]];
}
