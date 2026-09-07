import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

export default function TenantGuard() {
  const [checking, setChecking] = useState(true);
  const [hasSlug, setHasSlug] = useState(false);

  useEffect(() => {
    const check = async () => {
      // Bukan native (web/PWA) → skip, langsung lanjut
      if (!Capacitor.isNativePlatform()) {
        setHasSlug(true);
        setChecking(false);
        return;
      }

      const { value } = await Preferences.get({ key: "tenant_slug" });
      console.log("tenant_slug:", value);
      setHasSlug(!!value);
      setChecking(false);
    };

    check();
  }, []);

  if (checking) return <p>Memuat...</p>;

  if (!hasSlug) return <Navigate to="/pilih-sekolah" replace />;

  return <Outlet />;
}