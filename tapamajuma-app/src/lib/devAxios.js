import axios from "axios";
import { toast } from "sonner";

const devApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

devApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("dev_token"); // key beda dari 'auth_token'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

devApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (!error.response) {
      toast.error("Koneksi terputus atau server tidak merespon.");
    }
    if (status === 401 && window.location.pathname !== "/developer/login") {
      localStorage.removeItem("dev_token");
      localStorage.removeItem("dev_data");
      window.location.href = "/developer/login";
    }
    return Promise.reject(error);
  }
);

export default devApi;