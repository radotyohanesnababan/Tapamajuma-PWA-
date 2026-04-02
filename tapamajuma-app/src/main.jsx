import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from '@sentry/react'
import 'virtual:pwa-register'


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

Sentry.init({
  // Masukkan DSN khusus project React di sini
  dsn: "https://b215a4cf747c48bab8441407f9ccf8d0@o4510889778413568.ingest.de.sentry.io/4511150968930384",
  
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Set ke 0.1 (10%) untuk menghemat kuota free tier Sentry
  tracesSampleRate: 0.1, 

  // Rekam video layar (Replay) saat terjadi error saja
  replaysSessionSampleRate: 0.0, 
  replaysOnErrorSampleRate: 1.0, 
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
    <AuthProvider>
       <App />
    </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
