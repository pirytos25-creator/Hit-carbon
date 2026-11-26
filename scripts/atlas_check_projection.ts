/**
 * Sprawdza, że rzut w przeglądarce (src/atlas/projection.ts) daje te same współrzędne co Blender:
 * dla każdej planszy z kamerą w anchors.json (schemaVersion 2) rzutuje anchors3d i porównuje z anchors.
 * Uruchomienie (Node 22.6+):  node scripts/atlas_check_projection.ts
 * Sprawdza też rozdzielczość na widok: obraz widoku (webp) ma rozmiar `views.<widok>.resolution` albo, gdy jej
 * nie ma, `resolution` pliku.
 * Wynik: kod 0, gdy wszystkie różnice < 0,5 px renderu i rozmiary obrazów się zgadzają; kod 1 w przeciwnym razie.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { projectPoint, viewResolution } from '../src/atlas/projection.ts';
import type { AtlasAnchorsFile } from '../src/atlas/types.ts';

const root = join(import.meta.dirname, '..', 'public', 'atlas');
let worst = 0;
let checked = 0;
let sizeErrors = 0;

/** Rozmiar obrazu WebP z nagłówka (VP8X, VP8, VP8L) albo null. */
function webpSize(path: string): [number, number] | null {
  const b = readFileSync(path);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (chunk === 'VP8L') {
    const n = b.readUInt32LE(21);
    return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)];
  }
  return null;
}
for (const id of readdirSync(root)) {
  const path = join(root, id, 'anchors.json');
  if (!existsSync(path)) continue;
  const a = JSON.parse(readFileSync(path, 'utf-8')) as AtlasAnchorsFile;
  for (const [view, v] of Object.entries(a.views)) {
    const res = viewResolution(a, view);
    for (const img of new Set(Object.values(v?.images ?? {}))) {
      const p = join(root, id, img as string);
      if (!existsSync(p)) continue;
      const sz = webpSize(p);
      if (sz && (sz[0] !== res[0] || sz[1] !== res[1])) {
        sizeErrors++;
        console.log(`ROZDZIELCZOŚĆ ${id}/${view}/${img}: obraz ${sz[0]}×${sz[1]}, anchors.json ${res[0]}×${res[1]}`);
      }
    }
    if (!v?.camera || !v.anchors3d) {
      console.log(`${id}/${view}: brak kamery (render sprzed schemaVersion 2) - pominięte`);
      continue;
    }
    for (const [key, p3] of Object.entries(v.anchors3d)) {
      const [u, w] = projectPoint(p3, v.camera, res);
      const [eu, ew] = v.anchors[key];
      const dpx = Math.hypot((u - eu) * res[0], (w - ew) * res[1]);
      worst = Math.max(worst, dpx);
      checked++;
      if (dpx >= 0.5) console.log(`ROZBIEŻNOŚĆ ${id}/${view}/${key}: ${dpx.toFixed(2)} px`);
    }
    console.log(`${id}/${view}: ${Object.keys(v.anchors3d).length} kotwic sprawdzonych`);
  }
}
console.log(`Kotwice: ${checked}, największa różnica: ${worst.toFixed(3)} px renderu; obrazy o złej rozdzielczości: ${sizeErrors}`);
process.exit(worst < 0.5 && sizeErrors === 0 ? 0 : 1);
