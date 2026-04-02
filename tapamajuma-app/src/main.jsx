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

// Letakkan ini di baris Paling Atas main.jsx

// 1. Cek apakah pengguna berada di domain yang lama
const currentHostname = window.location.hostname;
const oldDomains = [
  'tapamajuma.my.id', 
  'tapamajuma-pwa.vercel.app'
];

if (oldDomains.includes(currentHostname)) {
  // 2. Jika ya, bunuh Service Worker yang nyangkut di domain lama ini
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  // 3. Paksa pindah ke domain resmi beserta path-nya (misal: /login atau /dashboard)
  const newDomain = 'https://tapamajuma.smpn1siborongborong.sch.id';
  window.location.replace(newDomain + window.location.pathname + window.location.search);
}

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
