import path from "path"
import { fileURLToPath } from "url" // Tambahkan ini
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

// Buat simulasi __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
 plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'iconapp.ico', 'robots.txt', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Tapamajuma App',
        short_name: 'Tapamajuma',
        description: 'Aplikasi Pembelajaran Digital Tapamajuma',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // <--- INI PENTING! Biar address bar browser HILANG
        scope: '/',
        start_url: '/login',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png', // Anda harus siapkan gambar ini nanti
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Dan ini
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: '127.0.0.1', // atau '0.0.0.0' agar bisa diakses IP apa saja
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})