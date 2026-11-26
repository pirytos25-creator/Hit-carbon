// Osobny serwer prototypów 3D atlasu (nie dotyka głównej aplikacji ani vite.config.ts).
// Uruchom z katalogu repo:  npx vite --config prototypes/atlas3d/vite.config.mjs
// Strony: /p1_gablota/  /p2_scena/  /p3_przestrzen/   (GLB z _assets/, poza Gitem)
import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..');

export default defineConfig({
  root: here,
  publicDir: false,
  server: { port: 5201, strictPort: true, host: '127.0.0.1', fs: { allow: [repo] } },
  build: {
    outDir: resolve(here, '_assets', 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(here, 'index.html'),
        p1: resolve(here, 'p1_gablota', 'index.html'),
        p2: resolve(here, 'p2_scena', 'index.html'),
        p3: resolve(here, 'p3_przestrzen', 'index.html'),
      },
    },
  },
});
