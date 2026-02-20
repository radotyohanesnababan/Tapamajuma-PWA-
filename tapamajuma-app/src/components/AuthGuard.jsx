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
      const res = await api.get("/api/user");
      const user = res.data;
      const userRole = user.role;

      // 1. CEK ONBOARDING: Jika sudah login tapi belum pilih role
if (!user.role) {
  // Jika login sukses tapi role belum ada, JANGAN ke login!
  // Lempar balik ke halaman onboarding saja.
  navigate("/social-callback?needs_onboarding=true", { replace: true });
  return;
}

      // 2. Cek Role Spesifik (Guru/Superadmin)
      if (roleRequired && userRole !== roleRequired) {
        let dashboardTujuan = "/"; 
        if (userRole === "superadmin") dashboardTujuan = "/superadmin";
        else if (userRole === "teacher") dashboardTujuan = "/teacher";

        navigate(dashboardTujuan, { replace: true });
        return;
      }

      setAuthorized(true);
    } catch (err) {
      // Jika error 401 (Unauthorized)
      console.error("AuthGuard Error:", err);
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