import { Navigate } from "react-router-dom";

// Domain yang boleh akses grup Developer.
// Tambah entry baru di sini kalau nanti butuh akses dari domain/port lain.
const ALLOWED_HOSTS = ["dev.tapamajuma.my.id", "localhost", "127.0.0.1"];

export default function DeveloperDomainGuard({ children }) {
  const hostname = window.location.hostname;
  const isAllowed = ALLOWED_HOSTS.includes(hostname);

  if (!isAllowed) {
    // Domain gak diizinkan -> lempar balik ke halaman utama, seolah-olah route ini gak pernah ada.
    return <Navigate to="/" replace />;
  }

  return children;
}