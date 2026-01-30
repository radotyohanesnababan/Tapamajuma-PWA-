// src/hooks/usePageTitle.js
import { useEffect } from "react";

export function usePageTitle(title) {
  useEffect(() => {
    // Simpan judul asli sebelumnya (opsional, biar rapi saat unmount)
    const prevTitle = document.title;

    // Set judul baru: "Nama Halaman - Nama Aplikasi"
    document.title = `${title} - Superadmin Tapamajuma`;

    // (Opsional) Kembalikan ke judul semula saat keluar halaman
    return () => {
      document.title = prevTitle;
    };
  }, [title]); // Dijalankan ulang jika 'title' berubah
}