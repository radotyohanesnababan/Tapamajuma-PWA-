import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const isNative = mode === 'native'
  console.log(`Build target: ${isNative ? 'Capacitor (Native)' : 'Web (PWA)'}`)
  console.log('isNative:', isNative)

  return {
    base: '/',
    plugins: [
      react(),
      !isNative && VitePWA({
        strategies: 'generateSW',
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/tapamajuma-api\.my\.id\/.*/i,
              handler: 'NetworkOnly',
            }
          ]
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
    ].filter(Boolean),
        build: {
      rollupOptions: {
        external: isNative ? ['virtual:pwa-register'] : [],
      }
    },
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

  }
})