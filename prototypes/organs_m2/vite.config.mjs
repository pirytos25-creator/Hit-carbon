// Test techniczny M2 (gabloty narządów): osobny serwer, nie dotyka aplikacji.
// Uruchom z katalogu repo:  node node_modules/vite/bin/vite.js --config prototypes/organs_m2/vite.config.mjs
// Zasoby: prototypes/organs_m2/_assets/ (poza Gitem) budowane przez tools/build_heart_m2.py + gltf-transform.
import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..');

export default defineConfig({
  root: here,
  publicDir: false,
  server: { port: 5202, strictPort: true, host: '127.0.0.1', fs: { allow: [repo] } },
});
