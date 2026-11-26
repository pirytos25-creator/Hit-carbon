// Kompresja GLB prototypów: meshopt + kwantyzacja (gltf-transform CLI, darmowe).
// Wejście: prototypes/atlas3d/_assets/raw/*.glb (z blender/atlas/proto_export_glb.py)
// Wyjście: prototypes/atlas3d/_assets/*.glb + _assets/sizes.json
// _ID (ID struktury w wierzchołku) NIE jest kwantyzowany: kwantyzacja normalizuje wartości i zepsułaby numery.
// Uruchom: node prototypes/atlas3d/tools/pack_assets.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '_assets');
const raw = path.join(root, 'raw');
// shell: true (gltf-transform to skrypt .cmd na Windows), więc każdy argument w cudzysłowie (spacje i „ź” w ścieżce)
const run = (...a) => execFileSync('gltf-transform', a.map((x) => `"${x}"`), { stdio: 'pipe', shell: true });

const sizes = {};
for (const f of fs.readdirSync(raw).filter((x) => x.endsWith('.glb'))) {
  const src = path.join(raw, f);
  const tmp = path.join(root, f.replace('.glb', '.q.glb'));
  const out = path.join(root, f);
  // 1) kwantyzacja tylko pozycji i normalnych (14 / 10 bitów; ok. 0,1 mm przy 1,8 m ciała)
  run('quantize', src, tmp, '--pattern', '{POSITION,NORMAL}', '--quantize-position', '14', '--quantize-normal', '10');
  // 2) meshopt (EXT_meshopt_compression) bez ponownej kwantyzacji _ID
  run('meshopt', tmp, out, '--level', 'medium', '--quantize-generic', '0');
  fs.rmSync(tmp);
  sizes[f] = { raw: fs.statSync(src).size, packed: fs.statSync(out).size };
  const ids = path.join(raw, `ids_${f.replace('.glb', '')}.json`);
  if (fs.existsSync(ids)) fs.copyFileSync(ids, path.join(root, path.basename(ids)));
  console.log(f, (sizes[f].raw / 1e6).toFixed(2), 'MB ->', (sizes[f].packed / 1e6).toFixed(2), 'MB');
}
fs.writeFileSync(path.join(root, 'sizes.json'), JSON.stringify(sizes, null, 1));
