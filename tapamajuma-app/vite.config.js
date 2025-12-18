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
      manifest: {
        name: 'Aksi Siswa TAPAMAJUMA',
        short_name: 'TAPAMA',
        display: 'standalone',
        // ... sisa konfigurasi PWA Anda
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})