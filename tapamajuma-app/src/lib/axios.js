import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// HANYA SATU INTERCEPTOR: Tempel Token dari LocalStorage
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

// OPSIONAL: Interceptor Response (Untuk handle error 401 otomatis)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika server membalas 401 (Unauthorized), paksa logout di frontend
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      // Jangan redirect window.location di sini biar tidak loop, 
      // biarkan UI yang bereaksi terhadap hilangnya token
    }
    return Promise.reject(error);
  }
);

export default api;