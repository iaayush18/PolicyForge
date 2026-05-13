import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Enable Brotli size reporting for better bundle insight (free tier compatible)
  build: {
    brotliSize: true,
    // Enable CSS code splitting for optimal loading
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    // Vite dev server already serves HTTP/2 when possible; no extra config needed on Vercel.
    // Adding generic caching headers for static assets (will be respected by Vercel edge)
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
});