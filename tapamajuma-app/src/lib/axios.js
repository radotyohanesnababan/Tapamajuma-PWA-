import axios from "axios";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

// =================================================================
// 1. TENANT SLUG DETECTION
// =================================================================
const getSlugFromHost = async () => {
  // Native app: baca dari pilihan sekolah yang disimpan saat onboarding
  if (Capacitor.isNativePlatform()) {
    const { value } = await Preferences.get({ key: 'tenant_slug' });
    return value || null;
  }

  // Dev lokal (browser)
  if (import.meta.env.DEV) {
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
  return import.meta.env.VITE_API_URL;
};

let currentBaseUrl = getEnvUrl();

const api = axios.create({
  baseURL: currentBaseUrl,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

// =================================================================
// 3. INTERCEPTOR REQUEST
// =================================================================
api.interceptors.request.use(
  async (config) => {
    config.baseURL = currentBaseUrl;

    const slug = await getSlugFromHost();
    config.params = { ...config.params, tenant: slug, _t: Date.now() };

    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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