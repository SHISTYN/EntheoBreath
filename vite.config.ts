
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline', // Внедряем скрипт регистрации прямо в index.html
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'og-banner.svg'],
      manifest: {
        name: 'EntheoBreath',
        short_name: 'EntheoBreath',
        description: 'Энтеогенные дыхательные практики и таймеры сознания',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
        // Кэшируем всё необходимое для оффлайна
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/esm\.sh\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'external-modules' }
          }
        ]
      }
    })
  ],
});
