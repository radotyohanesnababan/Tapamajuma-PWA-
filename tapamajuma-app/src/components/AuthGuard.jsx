import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // <--- Jangan lupa import ini!
import api from "@/lib/axios";

export default function AuthGuard({ children, roleRequired }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // Mencegah update state jika komponen sudah unmount

    const checkAuth = async () => {
      try {
        const res = await api.get("/api/user");
        
        // Jaga-jaga kalau Laravel bungkus pake { data: ... }
        // Kadang response itu res.data, kadang res.data.data tergantung API Resource
        const user = res.data.data ? res.data.data : res.data; 
        const userRole = user.role;

        // Update localStorage biar GuestGuard sinkron sama data terbaru
        localStorage.setItem("user_data", JSON.stringify(user));

        // 1. CEK ONBOARDING
        if (!userRole) {
          console.warn("Role kosong, lempar ke onboarding");
          navigate("/social-callback?needs_onboarding=true", { replace: true });
          return;
        }

        // 2. CEK ROLE SPESIFIK
        if (roleRequired && userRole !== roleRequired) {
          let dashboardTujuan = "/student";
          if (userRole === "superadmin") dashboardTujuan = "/superadmin";
          else if (userRole === "teacher") dashboardTujuan = "/teacher";
          
          navigate(dashboardTujuan, { replace: true });
          return;
        }

        // Jika semua aman
        if (isMounted) setAuthorized(true);

      } catch (err) {
        console.error("AuthGuard Error:", err);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Bersihkan semua sisa token
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          localStorage.removeItem("onboarding_data");
          
          navigate("/login", { replace: true });
        } else {
          // Error jaringan/server (bukan error auth)
          toast.error("Gagal terhubung ke server.");
        }
      } finally {
        // PENTING: Matikan loading apapun yang terjadi!
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    return () => { isMounted = false; };
  }, [navigate, roleRequired]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        <span className="text-xs font-medium text-slate-500 animate-pulse">
          Memverifikasi Sesi...
        </span>
      </div>
    );
  }

  // Jika authorized true, render halaman. Jika tidak, render null (tunggu redirect)
  return authorized ? children : null;
}