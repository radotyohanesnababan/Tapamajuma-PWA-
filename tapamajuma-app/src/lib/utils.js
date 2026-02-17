import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getStorageUrl = (path) => {
  if (!path) return null;

  // 1. Cek apakah path sudah berupa URL utuh (dari Excel / Brankas Gambar)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; // Langsung kembalikan apa adanya
  }

  // 2. Jika path masih berupa teks pendek (dari Tambah Manual)
  // Sesuaikan variabel env ini dengan milikmu (misal: import.meta.env.VITE_API_BASE_URL)
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000'; 
  
  // Hapus garis miring di awal path jika ada, agar tidak double slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${baseUrl}/${cleanPath}`;
};
