import axios from "axios";

// =================================================================
// KONFIGURASI URL DINAMIS
// =================================================================

// 1. Ambil dari .env dulu (Settingan Local/Vercel)
// Jika tidak ada di .env, baru gunakan URL Production sebagai fallback
const ENV_URL = import.meta.env.VITE_API_URL;
const PROD_URL = "https://tapamajuma-api.my.id"; 
const BACKUP_URL = "https://tapamajuma-pwa.onrender.com";

// Logic Penentuan URL Utama:
// - Di Localhost: Pastikan .env isinya http://127.0.0.1:8000
// - Di Vercel: Pastikan Environment Variable diset ke https://tapamajuma-api.my.id
const PRIMARY_URL = ENV_URL || PROD_URL;

console.log("🌐 Axios Base URL:", PRIMARY_URL); // Debugging: Cek URL mana yang dipakai

const api = axios.create({
  baseURL: PRIMARY_URL,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  // Tambahkan timeout agar tidak menunggu selamanya (misal 10 detik)
  timeout: 10000, 
});

// =================================================================
// 1. INTERCEPTOR REQUEST (Auth Token)
// =================================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =================================================================
// 2. INTERCEPTOR RESPONSE (Failover & Auto Logout)
// =================================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- LOGIKA 1: FAILOVER SERVER (Hanya jika BUKAN Localhost) ---
    // Kita tidak mau failover saat development, karena akan membingungkan
    // (Dikira data local, padahal data dari server backup)
    const isLocalhost = PRIMARY_URL.includes("127.0.0.1") || PRIMARY_URL.includes("localhost");

    if (!isLocalhost && (!error.response || [502, 503, 504].includes(error.response.status))) {
      
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        console.warn("⚠️ Server Utama Down. Mengalihkan ke Backup Server:", BACKUP_URL);

        // Ganti baseURL default axios
        api.defaults.baseURL = BACKUP_URL;

        // Ganti URL request yang sedang gagal
        if (originalRequest.url.includes(PRIMARY_URL)) {
            originalRequest.url = originalRequest.url.replace(PRIMARY_URL, BACKUP_URL);
        } else {
            // Jika url relatif (misal '/api/user'), pasang baseURL baru
            originalRequest.baseURL = BACKUP_URL;
        }

        return api(originalRequest);
      }
    } else if (isLocalhost && !error.response) {
       console.error("❌ Backend Local Mati! Pastikan 'php artisan serve' jalan.");
    }

    // --- LOGIKA 2: AUTO LOGOUT (401 Unauthorized) ---
    if (error.response && error.response.status === 401) {
      // Cek agar tidak logout terus menerus jika halaman login mengecek status
      if (window.location.pathname !== '/login') {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        // Gunakan replace agar history bersih
        window.location.href = "/login"; 
      }
    }

    return Promise.reject(error);
  }
);

export default api;