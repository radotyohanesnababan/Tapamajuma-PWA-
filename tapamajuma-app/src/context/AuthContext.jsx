import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios"; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Default true agar tidak "flash" konten sebelum cek selesai
    const [isLoading, setIsLoading] = useState(true); 

    // 1. CEK USER (Auto Login)
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("auth_token");
            
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const { data } = await api.get("/api/user");
                setUser(data);
            } catch (error) {
                console.error("Token invalid:", error);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user_data");
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = async (formData) => {
        const response = await api.post("/login", formData);
        // Simpan token SEGERA setelah dapat dari server
        localStorage.setItem("auth_token", response.data.access_token);
        localStorage.setItem("user_data", JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        return response.data; 
    };

    const logout = async () => {
        // Set loading true agar UI bisa menampilkan spinner/disable tombol
        setIsLoading(true); 
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout server error (abaikan):", error);
        } finally {
            // HAPUS SECARA BRUTAL (Wajib)
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            setUser(null);
            setIsLoading(false);
            
            // Redirect Paksa
            window.location.href = "/login";
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);