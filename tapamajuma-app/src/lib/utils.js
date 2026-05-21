import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getStorageUrl = (path) => {
  if (!path) return null;

  const isDev = import.meta.env.DEV;

  const STORAGE_URL =
    import.meta.env.VITE_STORAGE_URL ||
    "https://cdn.tapamajuma-api.my.id";

  const API_URL =
    sessionStorage.getItem("active_base_url") ||
    import.meta.env.VITE_API_URL;

  // URL penuh
  if (path.startsWith("http")) {
    try {
      const urlObj = new URL(path);

      if (
        !isDev &&
        [
          "127.0.0.1",
          "localhost",
          "tapamajuma-api.my.id",
        ].includes(urlObj.hostname)
      ) {
        const cleanPath = urlObj.pathname
          .replace(/^\/storage\//, "") // buang /storage
          .replace(/^\//, "");

        return `${STORAGE_URL}/${cleanPath}`;
      }

      return path;
    } catch {
      return path;
    }
  }

  // bersihkan path lokal
  const finalPath = path
    .replace(/^\/?storage\//, "") // buang storage/
    .replace(/^\//, "");

  // LOCAL
  if (isDev) {
    return `${API_URL.replace(/\/api$/, "")}/storage/${finalPath}`;
  }

  // PROD — TANPA /storage
  return `${STORAGE_URL}/${finalPath}`;
};
