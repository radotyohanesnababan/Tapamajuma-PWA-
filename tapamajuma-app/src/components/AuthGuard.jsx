import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // TAMBAHKAN useLocation
import { toast } from "sonner";
import api from "@/lib/axios";

export default function AuthGuard({ children, roleRequired }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // TAMBAHKAN INI (untuk rekam jejak URL)

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const res = await api.get("/api/user");
        const user = res.data.data ? res.data.data : res.data; 
        const userRole = user.role;

        localStorage.setItem("user_data", JSON.stringify(user));

        if (!userRole) {
          navigate("/social-callback?needs_onboarding=true", { replace: true });
          return;
        }

        if (roleRequired && userRole !== roleRequired) {
          let dashboardTujuan = "/student";
          if (userRole === "superadmin") dashboardTujuan = "/superadmin";
          else if (userRole === "teacher") dashboardTujuan = "/teacher";
          
          navigate(dashboardTujuan, { replace: true });
          return;
        }

        if (isMounted) setAuthorized(true);

      } catch (err) {
        console.error("AuthGuard Error:", err);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          localStorage.removeItem("onboarding_data");
          
          // UBAH BARIS INI: Titipkan lokasi asal ke state
          navigate("/login", { 
            replace: true, 
            state: { from: location } // <-- INI KUNCINYA
          });
        } else {
          toast.error("Gagal terhubung ke server.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();
    return () => { isMounted = false; };
  }, [navigate, roleRequired]); // Tambahkan location di dependency

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

  return authorized ? children : null;
}