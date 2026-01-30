import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'EntheoBreath: Дыхание и Биохакинг',
        short_name: 'EntheoBreath',
        description: 'Настройте свою нервную систему. Лучшие техники для глубокого сна, мгновенного фокуса и управления энергией.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        // Exclude large audio/video files from precache (they use runtime cache)
        globIgnores: ['**/*.mp3', '**/*.wav', '**/*.ogg', '**/*.mp4'],
        // Ensures the app shell is always available offline for SPA navigation
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/], // Exclude API routes if any
        runtimeCaching: [
          {
            // Cache Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            // Cache Google Fonts webfont files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
              },
            },
          },
          {
            // Cache CDN resources (Tailwind, Font Awesome, esm.sh)
            urlPattern: /^https:\/\/(cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|esm\.sh)\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
              },
            },
          },
          {
            // Cache audio files at runtime
            urlPattern: /\.(?:mp3|wav|ogg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
          {
            // Cache images
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - cached separately
          'vendor-react': ['react', 'react-dom'],

          // Animation engine - large, rarely changes
          'vendor-motion': ['framer-motion'],

          // Audio engine - very large, load on demand
          'vendor-audio': ['tone'],

          // Icons - moderate size
          'vendor-icons': ['lucide-react'],

          // AI & Markdown - used only for analysis
          'vendor-ai': ['@google/genai', 'react-markdown'],
        },
      },
    },
    // Suppress warning for chunks slightly over 500KB
    chunkSizeWarningLimit: 600,
  },
});