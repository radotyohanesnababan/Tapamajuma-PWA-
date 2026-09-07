import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

export default function TenantGuard() {
  // Bukan native (web/PWA) → skip langsung secara sinkron
  if (!Capacitor.isNativePlatform()) {
    return <Outlet />;
  }

  const [checking, setChecking] = useState(true);
  const [hasSlug, setHasSlug] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const { value } = await Preferences.get({ key: "tenant_slug" });
        setHasSlug(!!value);
      } catch (err) {
        console.error("Gagal membaca tenant_slug:", err);
        setHasSlug(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, []);

  if (checking) return <p>Memuat...</p>;

  if (!hasSlug) return <Navigate to="/pilih-sekolah" replace />;

  return <Outlet />;
}