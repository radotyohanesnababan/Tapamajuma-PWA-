import axios from "axios";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

// =================================================================
// 1. CONFIG URL
// =================================================================
const PROD_URL = "https://tapamajuma-api.my.id";
const BACKUP_URL = "https://tapamajuma-pwa.onrender.com";
const isDevelopment = import.meta.env.DEV;

const getEnvUrl = () => {
  if (Capacitor.isNativePlatform()) return PROD_URL;
  if (isDevelopment) {
    const currentHostname = window.location.hostname;
    return `http://${currentHostname}:8000`;
  }
  return PROD_URL;
};

// Bagian ini di-comment agar tidak mengambil URL backup yang lama
// const savedBaseUrl = !isDevelopment && !Capacitor.isNativePlatform()
//   ? localStorage.getItem("active_base_url")
//   : null;

let currentBaseUrl = getEnvUrl(); // Dipaksa selalu mulai dari DomCloud/Localhost

const api = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
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

    // Cache buster biar request-nya kelihatan terus di Network Tab
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
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
    // const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    /* --- LOGIC FAILOVER (OFF SEMENTARA) ---
    if (!isDevelopment && !Capacitor.isNativePlatform()) {
      const isUsingBackup = currentBaseUrl === BACKUP_URL;
      const isServerError = !error.response || (status >= 500 && status <= 599);

      if (!isUsingBackup && isServerError && !originalRequest._retry) {
        console.warn("🚨 FAILOVER DIAKTIFKAN...");
        originalRequest._retry = true;
        currentBaseUrl = BACKUP_URL;
        api.defaults.baseURL = BACKUP_URL;
        // localStorage.setItem("active_base_url", BACKUP_URL); 
        toast.error("Server Utama gangguan. Dialihkan ke cadangan...", { duration: 10000 });
        originalRequest.baseURL = BACKUP_URL;
        if (originalRequest.url.startsWith("http")) {
          const urlObj = new URL(originalRequest.url);
          originalRequest.url = urlObj.pathname + urlObj.search;
        }
        return api(originalRequest);
      }
    }
    */

    // Jika terjadi error, kita beri notifikasi toast biasa agar tahu ada masalah
    if (!error.response) {
      toast.error("Koneksi terputus atau server tidak merespon.");
    } else if (status >= 500) {
      toast.error(`Server Utama Error: ${status}`);
    }

    // Auto logout 401
    if (status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }

    return Promise.reject(error);
  }
);

export default api;