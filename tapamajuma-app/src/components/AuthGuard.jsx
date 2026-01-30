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
      // 1. Ambil data user dari backend Laravel
      const res = await api.get("/api/user");
      const userRole = res.data.role; // Role dari database (student, teacher, atau superadmin)
      
      // 2. Jika rute ini butuh role spesifik dan user tidak memilikinya
      if (roleRequired && userRole !== roleRequired) {
        // Tentukan rute pulang berdasarkan role asli user
        let dashboardTujuan = "/"; // Default untuk student
        
        if (userRole === "superadmin") {
          dashboardTujuan = "/superadmin"; // Rute WebView Superadmin
        } else if (userRole === "teacher") {
          dashboardTujuan = "/teacher";
        }

        navigate(dashboardTujuan, { replace: true });
        return;
      }

      setAuthorized(true);
    } catch {
      // Jika belum login (401), arahkan ke login
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