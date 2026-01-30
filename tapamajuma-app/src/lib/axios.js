import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  //withCredentials: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor: Setiap mau kirim request, cek saku apakah ada Token?
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        // Tempelkan token di Header
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// Interceptor: Setiap mau kirim request, kirim juga XSRF-TOKEN dari cookie
api.interceptors.request.use((config) => {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const token = getCookie('XSRF-TOKEN');
    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
    return config;
});

export default api;