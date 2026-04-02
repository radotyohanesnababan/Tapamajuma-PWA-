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


const currentHostname = window.location.hostname;
const oldDomains = [
  'tapamajuma.my.id', 
  'tapamajuma-pwa.vercel.app'
];

if (oldDomains.includes(currentHostname)) {
  
  // Gunakan Async/Await agar dieksekusi berurutan
  const nukeAndRedirect = async () => {
    // A. Tunggu sampai semua Service Worker dicabut
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      } catch (e) {
        console.error("Gagal cabut SW:", e);
      }
    }

    // B. Hancurkan semua Cache Storage PWA di HP pengguna
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (let cacheName of cacheNames) {
          await caches.delete(cacheName);
        }
      } catch (e) {
        console.error("Gagal hapus cache:", e);
      }
    }

    // C. Pindah ke domain baru dengan Cache Buster (memaksa server memberi file baru)
    const newDomain = 'https://tapamajuma.smpn1siborongborong.sch.id';
    const timestamp = new Date().getTime(); // Hasilkan angka acak
    
    // Format redirect: https://domainbaru.sch.id/path?t=123456789
    const targetUrl = `${newDomain}${window.location.pathname}?t=${timestamp}`;
    
    window.location.replace(targetUrl);
  };

  // Eksekusi fungsi pembunuhnya
  nukeAndRedirect();
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
