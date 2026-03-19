import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { HelmetProvider } from 'react-helmet-async'


// --- TAMBAHKAN INI (Import registerSW) ---
import { registerSW } from 'virtual:pwa-register'

// --- TAMBAHKAN INI (Jalankan register) ---
// intervalMS: cek update setiap 1 jam (opsional)
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Aplikasi versi baru tersedia. Refresh sekarang?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('Aplikasi siap bekerja offline')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
    <AuthProvider>
       <App />
    </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
