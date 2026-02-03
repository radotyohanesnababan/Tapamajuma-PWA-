import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getStorageUrl = (path) => {
  if (!path) return null; // atau return placeholder image
  const baseUrl = import.meta.env.VITE_API_URL;
  return `${baseUrl}/storage/${path}`;
};
