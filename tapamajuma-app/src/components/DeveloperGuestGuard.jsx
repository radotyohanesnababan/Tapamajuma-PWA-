import { Navigate, Outlet } from "react-router-dom";
import { useDeveloperAuth } from "@/context/DeveloperAuthContext";

export default function DeveloperGuestGuard() {
  const { developer, isLoading } = useDeveloperAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  if (developer) {
    return <Navigate to="/developer" replace />;
  }

  return <Outlet />;
}
