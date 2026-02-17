/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Image as ImageIcon, UploadCloud, Copy, Trash2, Loader2, Link } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePageTitle } from '@/hooks/usePageTitle';

export default function MediaBank() {
  usePageTitle("Brankas Gambar Soal");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Ambil data gambar dari server
  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/teacher/media-bank');
      setMediaList(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat brankas gambar.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // 2. Proses Auto-Upload saat gambar dipilih
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran simpel di sisi frontend (opsional)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 2MB!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      await api.post("/api/teacher/media-bank", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Gambar berhasil ditambahkan ke brankas!");
      fetchMedia(); // Refresh daftar gambar
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengunggah gambar.");
    } finally {
      setIsUploading(false);
      // Reset input file agar bisa pilih file yang sama lagi jika diperlukan
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  // 3. Salin Link ke Clipboard
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link berhasil disalin! Siap di-paste ke Excel.");
  };

  // 4. Hapus Gambar
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus gambar ini? Gambar yang sudah dipakai di soal mungkin akan hilang/rusak (broken link).")) return;
    
    try {
      await api.delete(`/api/teacher/media-bank/${id}`);
      setMediaList(prev => prev.filter(item => item.id !== id));
      toast.success("Gambar berhasil dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus gambar.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans text-slate-900">
      
      {/* STICKY HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center justify-between z-20 shadow-sm px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-all active:scale-95">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Brankas Gambar</h2>
            <p className="text-[10px] text-lime-500 font-black uppercase tracking-[0.15em]">Media Khusus Import Excel</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 space-y-8">
        
        {/* HEADER SECTION & UPLOAD BUTTON */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-3 text-slate-800">
              <ImageIcon className="h-7 w-7 text-lime-600" /> Galeri Media Soal
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Unggah gambar pendukung di sini, lalu salin <b>Direct Link</b>-nya untuk ditempel (paste) ke dalam template Excel Bank Soal.
            </p>
          </div>
          
          <div>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading}
              className="bg-lime-600 hover:bg-lime-700 text-white shadow-lg shadow-lime-200 rounded-xl h-12 px-6 font-bold w-full md:w-auto"
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Mengunggah...</>
              ) : (
                <><UploadCloud className="mr-2 h-5 w-5" /> Unggah Gambar Baru</>
              )}
            </Button>
          </div>
        </div>

        {/* GRID GAMBAR */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-lime-300" />
            <p className="text-sm font-medium">Memuat brankas gambar...</p>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-slate-700 font-bold mb-1">Brankas Masih Kosong</h3>
            <p className="text-slate-400 text-sm">Mulai unggah gambar pertama Anda untuk digunakan pada soal Excel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mediaList.map((media) => (
              <div key={media.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col">
                
                {/* Thumbnail Gambar */}
                <div className="relative h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src={media.url} 
                    alt={media.file_name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Tombol Hapus (Muncul saat di-hover) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(media.id)}
                      className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm shadow-sm transition-colors"
                      title="Hapus Gambar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Info & Aksi */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700 truncate mb-1" title={media.file_name}>
                      {media.file_name}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <UploadCloud size={10} /> {media.created_at}
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => handleCopyLink(media.url)}
                    className="w-full flex items-center justify-center gap-2 border-lime-200 text-lime-700 hover:bg-lime-50 hover:border-lime-300 font-bold text-xs h-9 rounded-lg"
                  >
                    <Link size={14} /> Salin Link Excel
                  </Button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}