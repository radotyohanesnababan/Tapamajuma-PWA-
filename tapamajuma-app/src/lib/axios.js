import axios from "axios";
import { toast } from "sonner"; // Kita butuh notifikasi biar tau kalau lagi switch

// =================================================================
// 1. CONFIG URL
// =================================================================
const ENV_URL = import.meta.env.VITE_API_URL; // Dari .env (Local/Vercel)
const PROD_URL = "https://tapamajuma-api.my.id"; // DomCloud (Utama)
const BACKUP_URL = "https://tapamajuma-pwa.onrender.com"; // Render (Cadangan)

// Logic Pintar:
// Cek dulu di SessionStorage, apakah kita sedang dalam "Mode Darurat"?
const savedBaseUrl = sessionStorage.getItem("active_base_url");

// Tentukan URL Awal:
// 1. Kalau ada settingan di storage (bekas failover), pakai itu.
// 2. Kalau lagi dev, pakai localhost.
// 3. Default pakai PROD_URL.
const isDevelopment = import.meta.env.DEV;
let currentBaseUrl = savedBaseUrl || (isDevelopment ? ENV_URL : PROD_URL);

console.log("🌐 Initial Base URL:", currentBaseUrl);

const api = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 Detik (Render free tier butuh waktu bangun tidur)
});

// =================================================================
// 2. INTERCEPTOR REQUEST (Token Injector)
// =================================================================
api.interceptors.request.use(
  (config) => {
    // Pastikan baseURL selalu update sesuai kondisi terakhir
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
// 3. INTERCEPTOR RESPONSE (The Failover Logic)
// =================================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Deteksi Error:
    // 1. Network Error (DNS/Connection Refused) -> error.response undefined
    // 2. Server Error (500, 502, 503, 504) -> Server nyerah
    // 3. Timeout (ECONNABORTED)
    const isNetworkError = !error.response || error.code === "ERR_NETWORK";
    const isServerError = error.response && [500, 502, 503, 504].includes(error.response.status);
    const isTimeout = error.code === "ECONNABORTED";

    // SYARAT FAILOVER:
    // - Errornya parah (Mati/Down)
    // - Bukan di Localhost (Kita gak mau switch ke Render pas lagi coding di laptop)
    // - Belum pernah retry sebelumnya (Mencegah infinite loop)
    if ((isNetworkError || isServerError || isTimeout) && !isDevelopment && !originalRequest._retry) {
      
      // Cek: Apakah kita masih pakai URL Utama? Kalau iya, pindah ke Backup.
      if (currentBaseUrl !== BACKUP_URL) {
        console.warn("🚨 SERVER UTAMA DOWN! Mengalihkan ke Backup Server...");
        
        // 1. Tandai request ini sudah diretry
        originalRequest._retry = true;

        // 2. Ganti URL Global
        currentBaseUrl = BACKUP_URL;
        api.defaults.baseURL = BACKUP_URL;
        
        // 3. Simpan ke Storage (Biar kalau direfresh tetap pakai Backup)
        sessionStorage.setItem("active_base_url", BACKUP_URL);

        // 4. Beri Notifikasi ke User (Opsional tapi berguna)
        toast.error("Server utama gangguan. Mengalihkan ke server cadangan...", {
            duration: 5000,
        });

        // 5. Update URL request yang gagal tadi
        // Ganti domain lama dengan domain baru
        originalRequest.baseURL = BACKUP_URL;
        
        // Hapus URL absolut kalau ada, paksa pakai baseURL baru
        if (originalRequest.url.startsWith("http")) {
            const path = new URL(originalRequest.url).pathname;
            originalRequest.url = path;
        }

        // 6. Coba request ulang ke server baru
        return api(originalRequest);
      }
    }

    // --- LOGIKA AUTO LOGOUT (401) ---
    if (error.response && error.response.status === 401) {
       // Jangan logout kalau errornya dari endpoint cek status login (biar gak loop)
       if (window.location.pathname !== '/login') {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          window.location.href = "/login";
       }
    }

    return Promise.reject(error);
  }
);

export default api;