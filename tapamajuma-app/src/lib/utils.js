import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getStorageUrl = (path) => {
  if (!path) return null;

  // 1. Deteksi Lingkungan
  const isDev = import.meta.env.DEV; // True jika jalan di 'npm run dev'
  const CDN_URL = "https://cdn.tapamajuma-api.my.id";
  
  // 2. Tentukan API Domain Aktif (untuk Failover)
  const activeApiUrl = sessionStorage.getItem("active_base_url") || import.meta.env.VITE_API_URL || "https://tapamajuma-api.my.id";
  const domainApi = activeApiUrl.replace(/\/api$/, "");

  // 3. JIKA PATH ADALAH URL UTUH (Handle Link Hantu 127.0.0.1 di Prod)
  if (path.startsWith('http')) {
    try {
      const urlObj = new URL(path);
      
      // Jika di PRODUCTION tapi ada link 127.0.0.1 (Ghost Link)
      if (!isDev && (urlObj.hostname === '127.0.0.1' || urlObj.hostname === 'localhost')) {
         const cleanPath = urlObj.pathname.includes('/storage/') 
            ? urlObj.pathname.split('/storage/')[1] 
            : urlObj.pathname.replace(/^\//, "");
         
         return `${CDN_URL}/${cleanPath}`;
      }
      
      return path; // Biarkan apa adanya jika sudah benar
    } catch (e) {
      return path;
    }
  }

  // 4. JIKA PATH STRING PENDEK (Misal: "avatars/foto.jpg")
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const finalPath = cleanPath.replace(/^storage\//, "");

  // ==========================================
  // LOGIC PEMISAH LOKAL vs PRODUKSI
  // ==========================================
  
  if (isDev) {
    // DI LOCAL: Pakai URL API Local (biasanya http://127.0.0.1:8000)
    // Kita tambahkan /storage karena local biasanya pakai filesystem 'public'
    return `${domainApi}/storage/${finalPath}`;
  } else {
    // DI PRODUCTION:
    // Jika aset sistem (bukan upload user), pakai domain API aktif
    if (finalPath.startsWith('images/') || finalPath.startsWith('assets/')) {
        return `${domainApi}/${finalPath}`;
    }
    // Jika file upload user, tembak ke CDN R2
    return `${CDN_URL}/${finalPath}`;
  }
};
