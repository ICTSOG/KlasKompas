import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Pas de standaard fallback aan naar jouw GitHub-repositorynaam indien nodig
  base: process.env.VITE_BASE_PATH || '/klaskompas/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
