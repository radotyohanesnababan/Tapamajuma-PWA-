/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios"; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
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
            const userData = data.data ? data.data : data; // ← normalisasi
            setUser(userData);
            } 
            catch (error) {
                // Token expired/salah
                console.error("Session invalid:", error);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user_data");
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, []);
    const refreshUser = async () => {
    try {
        const { data } = await api.get("/api/user");
        const userData = data.data ? data.data : data;
        setUser(userData);

        // optional: sync ke localStorage
        localStorage.setItem("user_data", JSON.stringify(userData));

    } catch (error) {
        console.error("Failed to refresh user:", error);
    }
};

    const login = async (formData) => {
        const response = await api.post("/login", formData);
        
        // Simpan token & user
        localStorage.setItem("auth_token", response.data.access_token);
        localStorage.setItem("user_data", JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        return response.data; 
    };

    const logout = () => {
        // --- 1. HAPUS DULUAN (OPTIMISTIC) ---
        // Jangan pakai 'await'. Langsung hapus biar UI responsif & bersih.
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        setUser(null);
        
        // --- 2. KABARI SERVER (BACKGROUND) ---
        // Biarkan dia jalan di background, kita tidak peduli hasilnya sukses/gagal
        // yang penting di HP user sudah bersih.
        api.post("/api/logout").catch((err) => console.error("Logout server error:", err));

        // --- 3. LEMPAR KE LOGIN ---
        window.location.href = "/login";
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);