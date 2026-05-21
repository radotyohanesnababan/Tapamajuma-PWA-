import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getStorageUrl = (path) => {
  if (!path) return null;

  const isProd = import.meta.env.MODE === "production";

  const STORAGE_URL =
    import.meta.env.VITE_STORAGE_URL ||
    "https://cdn.tapamajuma-api.my.id";

  const finalPath = path
    .replace(/^\/?storage\//, "")
    .replace(/^\//, "");

  if (!isProd) {
    return `http://127.0.0.1:8000/storage/${finalPath}`;
  }

  return `${STORAGE_URL}/${finalPath}`;
};
