/**
 * Sprawdza, że rzut w przeglądarce (src/atlas/projection.ts) daje te same współrzędne co Blender:
 * dla każdej planszy z kamerą w anchors.json (schemaVersion 2) rzutuje anchors3d i porównuje z anchors.
 * Uruchomienie (Node 22.6+):  node scripts/atlas_check_projection.ts
 * Wynik: kod 0, gdy wszystkie różnice < 0,5 px renderu; kod 1 w przeciwnym razie.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { projectPoint } from '../src/atlas/projection.ts';
import type { AtlasAnchorsFile } from '../src/atlas/types.ts';

const root = join(import.meta.dirname, '..', 'public', 'atlas');
let worst = 0;
let checked = 0;
for (const id of readdirSync(root)) {
  const path = join(root, id, 'anchors.json');
  if (!existsSync(path)) continue;
  const a = JSON.parse(readFileSync(path, 'utf-8')) as AtlasAnchorsFile;
  for (const [view, v] of Object.entries(a.views)) {
    if (!v?.camera || !v.anchors3d) {
      console.log(`${id}/${view}: brak kamery (render sprzed schemaVersion 2) - pominięte`);
      continue;
    }
    for (const [key, p3] of Object.entries(v.anchors3d)) {
      const [u, w] = projectPoint(p3, v.camera, a.resolution);
      const [eu, ew] = v.anchors[key];
      const dpx = Math.hypot((u - eu) * a.resolution[0], (w - ew) * a.resolution[1]);
      worst = Math.max(worst, dpx);
      checked++;
      if (dpx >= 0.5) console.log(`ROZBIEŻNOŚĆ ${id}/${view}/${key}: ${dpx.toFixed(2)} px`);
    }
    console.log(`${id}/${view}: ${Object.keys(v.anchors3d).length} kotwic sprawdzonych`);
  }
}
console.log(`Kotwice: ${checked}, największa różnica: ${worst.toFixed(3)} px renderu`);
process.exit(worst < 0.5 ? 0 : 1);
