import axios from "axios";
import { toast } from "sonner";

// =================================================================
// 1. CONFIG URL (PAKAI LINK TROLL)
// =================================================================
const ENV_URL = import.meta.env.VITE_API_URL; 
const PROD_URL = "https://server-palsu-ngawur-troll.com"; // <--- LINK TROLL
const BACKUP_URL = "https://tapamajuma-pwa.onrender.com"; 

const savedBaseUrl = sessionStorage.getItem("active_base_url");
// Kita matikan isDevelopment agar tetap bisa pindah saat ngetes di laptop
// const isDevelopment = import.meta.env.DEV; 

let currentBaseUrl = savedBaseUrl || PROD_URL; 

console.log("🛠️ Testing Mode: Menembak ke", currentBaseUrl);

const api = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 8000, // Kita persingkat timeout biar gak kelamaan nunggu link troll-nya mati
});

// =================================================================
// 2. INTERCEPTOR REQUEST
// =================================================================
api.interceptors.request.use(
  (config) => {
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
// 3. INTERCEPTOR RESPONSE
// =================================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    // --- LOGIC FAILOVER UNIVERSAL ---
    // 1. Kita cek apakah saat ini kita masih pakai URL bermasalah (Troll/DomCloud)
    const isUsingBackup = currentBaseUrl === BACKUP_URL;
    
    // 2. Syarat pindah: Error Koneksi (Network Error) ATAU Server Error (5xx)
    const isErrorServer = !error.response || (status >= 500 && status <= 599);

    console.log("🔍 Mengecek Kondisi...");
    console.log("- Status:", status || "Network Error");
    console.log("- Sudah Pakai Backup?:", isUsingBackup);
    console.log("- Harus Pindah?:", !isUsingBackup && isErrorServer);

    if (!isUsingBackup && isErrorServer && !originalRequest._retry) {
      
      console.warn("🚀 LOGIC JALAN! Link Troll Gagal. Mengalihkan ke Render...");

      originalRequest._retry = true;
      
      // GANTI KE RENDER
      currentBaseUrl = BACKUP_URL;
      api.defaults.baseURL = BACKUP_URL;
      sessionStorage.setItem("active_base_url", BACKUP_URL);

      toast.error("Server Utama (Troll) Mati. Pindah ke Render! 🚀");

      // Update request yang sedang gagal agar nembak ke Render
      originalRequest.baseURL = BACKUP_URL;
      
      if (originalRequest.url.startsWith("http")) {
        const urlObj = new URL(originalRequest.url);
        originalRequest.url = urlObj.pathname + urlObj.search;
      }

      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default api;