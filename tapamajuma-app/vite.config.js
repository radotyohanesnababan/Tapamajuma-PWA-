import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'
import Renderer from '@prerenderer/renderer-jsdom'
import vitePrerender from 'vite-plugin-prerender'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),

    // ✅ Prerender harus SEBELUM VitePWA
    vitePrerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: ['/'], // cukup landing page saja
      renderer: new Renderer(),
    }),

    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        // ✅ Tambah ini: pastikan SW tidak cache / dengan agresif
        // supaya Googlebot selalu dapat HTML fresh dari server
        navigateFallback: null, // ← INI PENTING
      },
      includeAssets: ['favicon.ico', 'iconapp.ico', 'robots.txt', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Tapamajuma App',
        short_name: 'Tapamajuma',
        description: 'Aplikasi Pembelajaran Digital Tapamajuma',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/login',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})