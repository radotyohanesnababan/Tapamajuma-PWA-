import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from '@sentry/react'
//import { registerSW } from 'virtual:pwa-register'
import { Capacitor } from '@capacitor/core'


if (typeof window !== 'undefined' && !Capacitor.isNativePlatform()) {
  const currentHostname = window.location.hostname
  const oldDomains = ['tapamajuma.my.id', 'tapamajuma-pwa.vercel.app']

  if (oldDomains.includes(currentHostname)) {
    const nukeAndRedirect = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (let r of registrations) await r.unregister()
        } catch (e) { console.error("Gagal cabut SW:", e) }
      }
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          for (let c of cacheNames) await caches.delete(c)
        } catch (e) { console.error("Gagal hapus cache:", e) }
      }
      const newDomain = 'https://tapamajuma.smpn1siborongborong.sch.id'
      const timestamp = new Date().getTime()
      window.location.replace(`${newDomain}${window.location.pathname}?t=${timestamp}`)
    }
    nukeAndRedirect()
  }

  const swCleared = localStorage.getItem('sw_cleared_v3')
  if (!swCleared) {
    const nukeSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (let r of registrations) await r.unregister()
        } catch (e) { console.error("Gagal cabut SW:", e) }
      }
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys()
          for (let c of cacheNames) await caches.delete(c)
        } catch (e) { console.error("Gagal hapus cache:", e) }
      }
      localStorage.setItem('sw_cleared_v3', 'true')
      window.location.reload()
    }
    nukeSW()
  } else {
    // ← dynamic import, hanya resolve saat PWA plugin aktif (web build)
    import('virtual:pwa-register').then(({ registerSW }) => {
      const updateSW = registerSW({
        onNeedRefresh() {
          if (confirm('Aplikasi versi baru tersedia. Refresh sekarang?')) updateSW(true)
        },
        onOfflineReady() {
          console.log('Aplikasi siap bekerja offline')
        },
      })
    }).catch(() => {
      // ← native build: virtual:pwa-register tidak ada, skip saja
      console.log('PWA tidak aktif di platform ini')
    })
  }
}

// Sentry boleh di luar guard
Sentry.init({
  dsn: "https://b215a4cf747c48bab8441407f9ccf8d0@o4510889778413568.ingest.de.sentry.io/4511150968930384",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 1.0,
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