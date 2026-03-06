import axios from "axios";
import { toast } from "sonner";

// =================================================================
// 1. CONFIG URL
// =================================================================
const ENV_URL = "http://127.0.0.1:8000";
const PROD_URL = "https://tapamajuma-api.my.id"; // Balik ke DomCloud
const BACKUP_URL = "https://tapamajuma-pwa.onrender.com"; // Render
const isDevelopment = import.meta.env.DEV;

const savedBaseUrl = !isDevelopment ? sessionStorage.getItem("active_base_url") : null;
let currentBaseUrl = savedBaseUrl || (isDevelopment ? ENV_URL : PROD_URL);




const api = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000, 
});

// =================================================================
// 2. INTERCEPTOR REQUEST
// =================================================================
api.interceptors.request.use(
  (config) => {
    config.baseURL = currentBaseUrl; // Selalu pakai yang paling update
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

    // Failover hanya di production
    if (!isDevelopment) {
      const isUsingBackup = currentBaseUrl === BACKUP_URL;
      const isServerError = !error.response || (status >= 500 && status <= 599);

      if (!isUsingBackup && isServerError && !originalRequest._retry) {
        console.warn("🚨 DOMCLOUD GANGGUAN. SWITCHING TO RENDER...");
        originalRequest._retry = true;
        currentBaseUrl = BACKUP_URL;
        api.defaults.baseURL = BACKUP_URL;
        sessionStorage.setItem("active_base_url", BACKUP_URL);
        toast.error("Server Utama gangguan. Dialihkan ke cadangan...", { duration: 10000 });
        originalRequest.baseURL = BACKUP_URL;
        if (originalRequest.url.startsWith("http")) {
          const urlObj = new URL(originalRequest.url);
          originalRequest.url = urlObj.pathname + urlObj.search;
        }
        return api(originalRequest);
      }
    }

    // Auto logout 401 — tetap jalan di dev maupun prod
    if (status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);



export default api;