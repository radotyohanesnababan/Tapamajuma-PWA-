import axios from "axios";

// Ambil URL utama dari .env, dan siapkan URL Render sebagai cadangan
// const PRIMARY_URL = import.meta.env.VITE_API_URL;
const PRIMARY_URL = "https://wi.woko.appx"; // Ganti dengan URL DomCloud asli kamu
const BACKUP_URL = "https://tapamajuma-pwa.onrender.com"; // Ganti dengan URL Render asli kamu

const api = axios.create({
  baseURL: PRIMARY_URL,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// 1. INTERCEPTOR REQUEST: Tetap sama untuk Auth
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

// 2. INTERCEPTOR RESPONSE: Gabungan Failover & Auto Logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // --- LOGIKA 1: AUTO-SWITCH KE RENDER ---
    // Jika tidak ada respon (network error) atau server DomCloud lagi tepar (502, 503, 504)
    if (!error.response || [502, 503, 504].includes(error.response.status)) {
      
      // Jika kita belum pernah mencoba pindah (biar nggak looping)
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        console.warn("⚠️ DomCloud Down! Mengalihkan request ke Render...");
        
        // Ubah baseURL utama agar request selanjutnya langsung ke Render
        api.defaults.baseURL = BACKUP_URL;
        
        // Update URL request yang sedang gagal ini
        originalRequest.baseURL = BACKUP_URL;

        // Coba lagi pengiriman datanya
        return api(originalRequest);
      }
    }

    // --- LOGIKA 2: AUTO LOGOUT (Existing kamu) ---
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      // window.location.href = "/login"; // Buka jika ingin langsung lempar ke login
    }

    return Promise.reject(error);
  }
);

export default api;