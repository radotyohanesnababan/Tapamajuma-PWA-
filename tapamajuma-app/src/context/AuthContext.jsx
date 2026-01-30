import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios"; 

const AuthContext = createContext({
    user: null,
    login: () => {},
    logout: () => {},
    isLoading: true
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. CEK USER SAAT APLIKASI DIMUAT (Auto Login)
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("auth_token");
            
            // Kalau tidak ada token di saku, tidak usah tanya server
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Token otomatis ditempel oleh axios.js (Interceptor)
                const { data } = await api.get("/api/user");
                setUser(data);
            } catch (error) {
                // Jika token kadaluarsa/tidak valid
                console.error("Sesi habis:", error);
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user_data");
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, []);

    // 2. FUNGSI LOGIN (Updated untuk Token)
    const login = async (formData) => {
        // HAPUS baris csrf-cookie. Kita tidak butuh lagi.
        // await api.get("/sanctum/csrf-cookie"); 

        // Langsung tembak login
        const response = await api.post("/login", formData);
        
        // Backend kita sekarang mengembalikan { user, access_token }
        // Kita set state user di sini agar UI langsung update
        setUser(response.data.user);

        // PENTING: Return data aslinya (agar Login.jsx bisa baca access_token)
        return response.data; 
    };

    // 3. FUNGSI LOGOUT (Bersih-bersih)
    const logout = async () => {
        try {
            // Request ke backend agar token dihapus dari database
            await api.post("/logout");
        } catch (error) {
            console.error("Logout error (abaikan):", error);
        } finally {
            // Hapus data di Frontend (Wajib)
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            setUser(null);
            // Redirect manual atau biarkan Login.jsx yang handle
            window.location.href = "/login";
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