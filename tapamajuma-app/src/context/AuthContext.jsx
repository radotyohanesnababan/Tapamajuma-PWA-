import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios"; // Sesuaikan path axios kamu

const AuthContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
    isLoading: true
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // FUNGSI KRUSIAL: Cek sesi setiap kali aplikasi dimuat/refresh
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get("/api/user");
                setUser(data);
            } catch  {
                setUser(null); // Jika 401, berarti belum login
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (formData) => {
        await api.get("/sanctum/csrf-cookie");
        await api.post("/login", formData);
        // Ambil data user terbaru setelah login sukses
        const { data } = await api.get("/api/user");
        setUser(data);
        return data; // Kembalikan data agar bisa dipakai di Login.jsx untuk navigasi
    };
    const logout = async () => {
        try {
            await api.post("/logout");
            setUser(null);
        } catch (error) {
            console.error("Logout gagal:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);