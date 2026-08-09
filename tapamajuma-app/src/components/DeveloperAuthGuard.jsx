import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDeveloperAuth } from "@/context/DeveloperAuthContext";
import { developerLoginPath } from "@/utils/devPath";

export default function DeveloperAuthGuard({ children }) {
  const { developer, isLoading } = useDeveloperAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !developer) {
      navigate(developerLoginPath(), { replace: true });
    }
  }, [developer, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!developer) return null;
  return children;
}