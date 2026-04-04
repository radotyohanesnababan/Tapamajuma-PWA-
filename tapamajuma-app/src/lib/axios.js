import axios from "axios";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

// =================================================================
// 1. CONFIG URL
// =================================================================
const PROD_URL = "https://tapamajuma-api.my.id";
const BACKUP_URL = "https://tapamajuma-pwa.onrender.com";
const isDevelopment = import.meta.env.DEV;

// ← Fix: di Capacitor selalu pakai PROD_URL, jangan pakai hostname
const getEnvUrl = () => {
  if (Capacitor.isNativePlatform()) return PROD_URL;
  if (isDevelopment) {
    const currentHostname = window.location.hostname;
    return `http://${currentHostname}:8000`;
  }
  return PROD_URL;
};

// ← Fix: pakai localStorage bukan sessionStorage (lebih persistent di Capacitor)
const savedBaseUrl = !isDevelopment && !Capacitor.isNativePlatform()
  ? localStorage.getItem("active_base_url")
  : null;

let currentBaseUrl = savedBaseUrl || getEnvUrl();

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

    // Failover hanya di production web (bukan Capacitor)
    if (!isDevelopment && !Capacitor.isNativePlatform()) {
      const isUsingBackup = currentBaseUrl === BACKUP_URL;
      const isServerError = !error.response || (status >= 500 && status <= 599);

      if (!isUsingBackup && isServerError && !originalRequest._retry) {
        console.warn("🚨 DOMCLOUD GANGGUAN. SWITCHING TO RENDER...");
        originalRequest._retry = true;
        currentBaseUrl = BACKUP_URL;
        api.defaults.baseURL = BACKUP_URL;
        localStorage.setItem("active_base_url", BACKUP_URL); // ← ganti ke localStorage
        toast.error("Server Utama gangguan. Dialihkan ke cadangan...", { duration: 10000 });
        originalRequest.baseURL = BACKUP_URL;
        if (originalRequest.url.startsWith("http")) {
          const urlObj = new URL(originalRequest.url);
          originalRequest.url = urlObj.pathname + urlObj.search;
        }
        return api(originalRequest);
      }
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