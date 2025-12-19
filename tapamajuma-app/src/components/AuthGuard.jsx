import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";

export default function AuthGuard({ children, roleRequired }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Cek siapa yang login
        const res = await api.get("/user");
        
        // Jika butuh role spesifik (misal: guru)
        if (roleRequired && res.data.role !== roleRequired) {
          navigate(res.data.role === "teacher" ? "/teacher" : "/"); 
          return;
        }

        setAuthorized(true);
      } catch  {
        // Jika 401 (belum login), tendang ke login
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, roleRequired]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-medium animate-pulse">
        Memverifikasi Sesi...
      </div>
    );
  }

  return authorized ? children : null;
}