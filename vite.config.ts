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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Exclude large audio/video files from precache
        globIgnores: ['**/*.mp3', '**/*.wav', '**/*.ogg', '**/*.mp4'],
        runtimeCaching: [
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