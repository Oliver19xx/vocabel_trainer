import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base './' ensures all assets load correctly when hosted in a GitHub Pages subpath e.g. /vocabel_trainer/
  base: './',
  server: {
    port: 3000,
    open: true
  }
});
