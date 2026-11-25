import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three';
          }
          if (
            id.includes('node_modules/@react-three') ||
            id.includes('node_modules/postprocessing')
          ) {
            return 'r3f';
          }
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/lucide-react') ||
            id.includes('node_modules/zustand') ||
            id.includes('node_modules/gsap')
          ) {
            return 'ui';
          }
          return undefined;
        },
      },
    },
  },
});
