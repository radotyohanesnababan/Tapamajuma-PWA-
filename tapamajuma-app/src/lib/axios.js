import axios from "axios";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

// =================================================================
// 1. TENANT SLUG DETECTION
// =================================================================
const getSlugFromHost = () => {
  // Local dev: pakai env
  if (import.meta.env.DEV || Capacitor.isNativePlatform()) {
    return import.meta.env.VITE_TENANT_SLUG || 'smpn1siborongborong';
  }

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Format: smpn3siborongborong.tapamajuma.my.id → "smpn3siborongborong"
  if (hostname.endsWith('tapamajuma.my.id')) {
    return parts[0];
  }

  // Format: tapamajuma.smpn1siborongborong.sch.id → pakai env
  return import.meta.env.VITE_TENANT_SLUG || 'smpn1siborongborong';
};

// =================================================================
// 2. CONFIG URL
// =================================================================
const getEnvUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return import.meta.env.VITE_API_URL;
  }
  return import.meta.env.VITE_API_URL;
};

let currentBaseUrl = getEnvUrl();

const api = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  params: { tenant: getSlugFromHost() },
  timeout: 120000,
});

// =================================================================
// 3. INTERCEPTOR REQUEST
// =================================================================
api.interceptors.request.use(
  (config) => {
    config.baseURL = currentBaseUrl;
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =================================================================
// 4. INTERCEPTOR RESPONSE
// =================================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response ? error.response.status : null;

    if (!error.response) {
      toast.error("Koneksi terputus atau server tidak merespon.");
    } else if (status >= 500) {
      toast.error(`Server Utama Error: ${status}`);
    }

    if (status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }

    return Promise.reject(error);
  }
);

export default api;
