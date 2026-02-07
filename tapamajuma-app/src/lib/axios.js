import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Penting untuk cookie/sanctum
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },

});

// HANYA SATU INTERCEPTOR: Auth Bearer Token
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

// OPSIONAL: Auto Logout jika 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token ditolak server -> Hapus lokal
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      // Opsional: Redirect
      // window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;