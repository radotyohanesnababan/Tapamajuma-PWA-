import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AuthGuard({ children, roleRequired }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return; // tunggu context selesai load

    if (!user) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    if (roleRequired && user.role !== roleRequired) {
      let dashboard = "/student";
      if (user.role === "superadmin") dashboard = "/superadmin";
      else if (user.role === "teacher") dashboard = "/teacher";
      navigate(dashboard, { replace: true });
    }
  }, [user, isLoading, roleRequired]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        <span className="text-xs font-medium text-slate-500 animate-pulse">
          Memverifikasi Sesi...
        </span>
      </div>
    );
  }

  if (!user) return null;
  if (roleRequired && user.role !== roleRequired) return null;

  return children;
}