import axios from "axios";
import { toast } from "sonner";

// =================================================================
// 1. CONFIG URL
// =================================================================
const ENV_URL = import.meta.env.VITE_API_URL; // URL Local (.env)
const PROD_URL = "https://server-palsu-ini-pasti-error.com"; // DomCloud (Utama)
const BACKUP_URL = "https://tapamajuma-pwa.onrender.com"; // Render (Cadangan)

// Cek Storage: Apakah sebelumnya sudah pernah pindah ke Render?
const savedBaseUrl = sessionStorage.getItem("active_base_url");
const isDevelopment = import.meta.env.DEV;

// Logic Awal:
// Prioritas 1: URL yang tersimpan di storage (bekas failover)
// Prioritas 2: Localhost (kalau lagi dev)
// Prioritas 3: DomCloud (Default)
let currentBaseUrl = savedBaseUrl || (isDevelopment ? ENV_URL : PROD_URL);

console.log("🚀 Axios Start URL:", currentBaseUrl);

const api = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  // Timeout agak panjang biar Render sempat bangun tidur
  timeout: 15000, 
});

// =================================================================
// 2. INTERCEPTOR REQUEST
// =================================================================
api.interceptors.request.use(
  (config) => {
    // Selalu paksa pakai URL yang sedang aktif
    config.baseURL = currentBaseUrl;
    
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =================================================================
// 3. INTERCEPTOR RESPONSE (LOGIC "MAKSA" PINDAH)
// =================================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Ambil status error (misal: 404, 500, undefined)
    const status = error.response ? error.response.status : null;

    // Cek apakah request ini menembak ke DomCloud?
    // Kita cek URL aslinya atau baseURL saat ini
    const isTargetingDomCloud = 
        (originalRequest.baseURL && originalRequest.baseURL.includes("tapamajuma-api.my.id")) ||
        (currentBaseUrl && currentBaseUrl.includes("tapamajuma-api.my.id")) || 
        (originalRequest.url && originalRequest.url.includes("tapamajuma-api.my.id"));

    // Cek apakah ini error user? (Salah password, validasi gagal, dll)
    // Error 4xx (400-499) adalah salah user, BUKAN salah server. Jangan pindah server.
    const isUserError = status >= 400 && status < 500; 

    // SYARAT FAILOVER "AGRESIF":
    // 1. Request mengarah ke DomCloud (Bukan localhost, bukan Render)
    // 2. Errornya BUKAN salah user (Berarti Network Error, Timeout, atau 500 Server Error)
    // 3. Belum pernah dicoba ulang (retry)
    if (isTargetingDomCloud && !isUserError && !originalRequest._retry) {
      
      console.warn(`🚨 DOMCLOUD BERMASALAH (Status: ${status || 'Network Error'}). MAKSA PINDAH KE RENDER!`);

      // 1. Tandai sudah diretry biar gak loop
      originalRequest._retry = true;

      // 2. UPDATE VARIABEL GLOBAL
      currentBaseUrl = BACKUP_URL;
      api.defaults.baseURL = BACKUP_URL;
      
      // 3. SIMPAN KE SESSION STORAGE
      // Supaya kalau di-refresh, dia INGAT pakai Render, gak balik ke DomCloud
      sessionStorage.setItem("active_base_url", BACKUP_URL);

      // 4. BERI TAU USER
      toast.error("Server Utama Down. Mengalihkan koneksi ke Backup Server...", {
        duration: 4000,
        style: { background: '#fee2e2', color: '#b91c1c' }
      });

      // 5. REKONSTRUKSI REQUEST YANG GAGAL
      // Paksa request ini pakai URL Render sekarang juga
      originalRequest.baseURL = BACKUP_URL;

      // Bersihkan URL absolute lama jika ada (misal: https://domcloud.../api/user jadi /api/user)
      if (originalRequest.url.startsWith("http")) {
        const urlObj = new URL(originalRequest.url);
        originalRequest.url = urlObj.pathname + urlObj.search; // Ambil buntutnya aja
      }

      // 6. JALANKAN ULANG REQUEST KE RENDER
      return api(originalRequest);
    }

    // --- LOGIKA AUTO LOGOUT (401) ---
    // Hanya jalan kalau status 401 dan bukan sedang di halaman login
    if (status === 401 && window.location.pathname !== '/login') {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;