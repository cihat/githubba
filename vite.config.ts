// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa'
import manifest from './public/manifest.json';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'apple-icon-57x57.png',
        'apple-icon-60x60.png',
        'apple-icon-72x72.png',
        '/apple-icon-76x76.png',
        'apple-icon-114x114.png',
        'apple-icon-120x120.png',
        'apple-icon-144x144.png',
        'apple-icon-152x152.png',
        'apple-icon-180x180.png',
        'android-icon-192x192.png',
        'favicon-32x32.png',
        'favicon-96x96.png',
        'favicon-16x16.png'
      ],
      manifest,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })],
});
