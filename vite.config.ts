import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force a single instance of three.js — fixes the postprocessing multiple-import warning
    dedupe: ['three'],
  },
  optimizeDeps: {
    include: ['three', 'animejs/lib/anime.js'],
  },
});
