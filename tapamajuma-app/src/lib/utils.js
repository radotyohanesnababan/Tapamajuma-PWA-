import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getStorageUrl = (path) => {
  if (!path) return null;

  // 1. Deteksi Lingkungan
  const isDev = import.meta.env.DEV; 
  const CDN_URL = "https://cdn.tapamajuma-api.my.id";
  
  // 2. Tentukan API Domain Aktif (untuk Failover)
  const activeApiUrl = sessionStorage.getItem("active_base_url") || import.meta.env.VITE_API_URL || "https://tapamajuma-api.my.id";
  const domainApi = activeApiUrl.replace(/\/api$/, "");

  // 3. JIKA PATH ADALAH URL UTUH (Handle Link Hantu 127.0.0.1 di Prod)
  if (path.startsWith('http')) {
    try {
      const urlObj = new URL(path);
      
      // Jika di PRODUCTION tapi ada link localhost yang nyasar dari database
      if (!isDev && (urlObj.hostname === '127.0.0.1' || urlObj.hostname === 'localhost')) {
         const cleanPath = urlObj.pathname.includes('/storage/') 
            ? urlObj.pathname.split('/storage/')[1] 
            : urlObj.pathname.replace(/^\//, "");
         
         return `${CDN_URL}/${cleanPath}`;
      }
      
      return path; 
    } catch (e) {
      return path;
    }
  }

  // 4. Pembersihan Path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const finalPath = cleanPath.replace(/^storage\//, "");

  // ==========================================
  // LOGIC PEMISAH LOKAL vs PRODUKSI
  // ==========================================
  if (isDev) {
    // DI LOCAL: Tetap pakai storage lokal (untuk simulasi upload)
    return `${domainApi}/storage/${finalPath}`;
  } else {
    // DI PRODUCTION: SEMUANYA (termasuk folder images/) ambil dari CDN R2
    // Kita tidak pakai domainApi lagi di sini supaya nggak nyasar ke DomCloud/Render
    return `${CDN_URL}/${finalPath}`;
  }
};
