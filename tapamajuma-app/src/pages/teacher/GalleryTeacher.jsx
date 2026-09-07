import React, { useState, useEffect, useMemo } from 'react';
import api from "@/lib/axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlayCircle, FileText, Music, Search, Trash2, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import ReactPlayer from 'react-player';
import ShareButton from '@/components/ShareButton';

function TikTokPreview({ url }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThumb = async () => {
      try {
        const res = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
        );
        const data = await res.json();
        if (data.thumbnail_url) {
          setThumbnail(data.thumbnail_url);
        }
      } catch {
        // gagal → fallback
      } finally {
        setLoading(false);
      }
    };
    fetchThumb();
  }, [url]);

  if (loading) {
    return (
      <div className="relative w-full h-full bg-black animate-pulse" />
    );
  }

  if (thumbnail) {
    return (
      <div className="relative w-full h-full bg-black">
        <img
          src={thumbnail}
          alt="TikTok thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <PlayCircle size={36} className="opacity-90 drop-shadow" />
          <span className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-80">TikTok</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <svg className="w-10 h-10 mb-1" fill="white" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
        </svg>
        <PlayCircle size={30} className="opacity-90" />
        <span className="text-[9px] uppercase font-bold tracking-widest mt-1.5 opacity-80">TikTok</span>
      </div>
    </div>
  );
}

export default function GalleryTeacher() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteId, setDeleteId] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("all"); 

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // State Preview
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tiktokEmbedFailed, setTiktokEmbedFailed] = useState(false);

  const [classesList, setClassesList] = useState([]);

  useEffect(() => {
    api.get("/api/teacher/my-classes")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setClassesList(res.data);
        }
      })
      .catch((err) => console.error("Gagal memuat daftar kelas:", err));
  }, []);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async (page = 1) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/teacher/galleries?page=${page}&search=${searchQuery}&class_id=${selectedClassId}`
      );

      setItems(res.data.data || []);
      setCurrentPage(res.data.current_page || 1);
      setLastPage(res.data.last_page || 1);

    } catch {
      toast.error("Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries(1);
  }, [searchQuery, selectedClassId]);

  useEffect(() => {
    if (selectedItem?.file_path?.includes('tiktok.com')) {
      setTiktokEmbedFailed(false);

      if (window.TikTok) {
        window.TikTok.reload();
      } else {
        const existing = document.getElementById('tiktok-embed-script');
        if (!existing) {
          const script = document.createElement('script');
          script.id = 'tiktok-embed-script';
          script.src = 'https://www.tiktok.com/embed.js';
          script.async = true;
          script.onerror = () => setTiktokEmbedFailed(true);
          document.body.appendChild(script);
        }
      }

      const timer = setTimeout(() => {
        const el = document.querySelector('.tiktok-embed iframe');
        if (!el) setTiktokEmbedFailed(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [selectedItem]);

  const getPageNumbers = () => {
    const pages = [];

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(currentPage + 2, lastPage);

    if (currentPage <= 3) {
      end = Math.min(5, lastPage);
    }

    if (currentPage >= lastPage - 2) {
      start = Math.max(lastPage - 4, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  // --- 1. DAFTAR KELAS UNTUK FILTER ---
  const availableClasses = useMemo(() => {
    if (classesList.length > 0) return classesList;
    if (!Array.isArray(items)) return [];

    const classMap = new Map();
    items.forEach((item) => {
      const cls = item.user?.student_class || item.user?.studentClass;
      if (cls && cls.id && cls.name) {
        if (!classMap.has(cls.id)) {
          classMap.set(cls.id, cls.name);
        }
      } else if (item.class_name && item.class_name !== "-") {
        if (!classMap.has(item.class_name)) {
          classMap.set(item.class_name, item.class_name);
        }
      }
    });

    return Array.from(classMap, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [classesList, items]);

  const displayItems = Array.isArray(items) ? items : [];

  // --- LOGIKA DELETE ---
  const handleDeleteClick = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/teacher/galleries/${deleteId}`);
      toast.success("Karya berhasil dihapus");
      setItems(prev => prev.filter(i => i.id !== deleteId));
      if (selectedItem?.id === deleteId) {
        setPreviewOpen(false);
      }
    } catch {
      toast.error("Gagal menghapus karya");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // --- HELPER MEDIA ---
  const getYoutubeId = (url) => {
    if (!url) return null;
    const patterns = [/(?:youtube\.com\/watch\?v=)([^&\n?#]+)/, /(?:youtu\.be\/)([^&\n?#]+)/, /(?:youtube\.com\/embed\/)([^&\n?#]+)/];
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const normalizeYoutubeUrl = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (let pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return `https://www.youtube.com/watch?v=${match[1]}`;
    }
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // Helper render preview di Card (Grid)
  const renderPreviewThumbnail = (item) => {
    if (item.file_type === 'link') {
      const videoId = getYoutubeId(item.file_path);
      if (videoId) {
        return (
          <div className="relative w-full h-full bg-black group">
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              alt="Thumbnail"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle size={36} className="text-white drop-shadow-md bg-black/50 rounded-full p-1" />
            </div>
          </div>
        );
      }

      if (item.file_path?.includes('instagram.com')) {
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex flex-col items-center justify-center text-white">
            <svg className="w-10 h-10 mb-1" fill="white" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="text-[9px] uppercase font-bold tracking-widest opacity-90">Instagram</span>
          </div>
        );
      }

      if (item.file_path?.includes('facebook.com') || item.file_path?.includes('fb.watch')) {
        return (
          <div className="relative w-full h-full bg-blue-600 flex flex-col items-center justify-center text-white">
            <svg className="w-10 h-10 mb-1" fill="white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-[9px] uppercase font-bold tracking-widest opacity-90">Facebook</span>
          </div>
        );
      }

      if (item.file_path?.includes('tiktok.com') || item.file_path?.includes('vm.tiktok.com')) {
        return <TikTokPreview url={item.file_path} />;
      }

      return (
        <div className="flex flex-col items-center justify-center bg-slate-900 w-full h-full text-white">
          <PlayCircle size={36} className="mb-1 opacity-80" />
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
            Video Link
          </span>
        </div>
      );
    }

    const fullPath = item.file_url || item.file_path;
    if (item.file_type === 'image') {
      return (
        <img
          src={fullPath}
          className="w-full h-full object-cover"
          alt={item.title}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      );
    }
    if (item.file_type === 'audio') {
      return (
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10 w-full h-full p-3 text-indigo-600">
          <Music size={36} className="text-indigo-500" />
          <p className="text-[9px] mt-1.5 font-bold tracking-wider uppercase text-indigo-600">Rekaman Suara</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-600 w-full h-full">
        <FileText size={36} />
      </div>
    );
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Memuat Data Siswa...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        .float { animation: floaty 2.6s ease-in-out infinite; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ═══ HEADER ═══ */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">
              Monitoring Karya
            </p>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5">
              Galeri Siswa
            </h1>
          </div>
          <span className="font-mono text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
            {displayItems.length} karya
          </span>
        </div>

        {/* ═══ FILTER BAR ═══ */}
        <div className="flex gap-2">
          {/* Class select */}
          <div className="relative flex-1">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
            >
              <option value="all">Semua Kelas</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id.toString()}>
                  {cls.name}
                </option>
              ))}
            </select>
            <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari siswa / judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-300"
            />
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ═══ GRID ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {displayItems.length > 0 ? (
            displayItems.map((item) => {
              const className = item.class_name || item.user?.student_class?.name || item.user?.studentClass?.name || "—";

              return (
                <div
                  key={item.id}
                  className="rounded-lg bg-white border border-slate-200 overflow-hidden group hover:border-slate-300 transition cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setPreviewOpen(true);
                  }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video w-full bg-slate-100 overflow-hidden relative">
                    {renderPreviewThumbnail(item)}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />

                    {/* File type badge */}
                    <span className="absolute top-1.5 left-1.5 text-[7px] font-semibold uppercase tracking-wider bg-black/50 text-white px-1.5 py-0.5 rounded">
                      {item.file_type}
                    </span>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item.id);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/40 text-white/70 hover:text-rose-400 hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Hapus karya"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-slate-800 truncate" title={item.title}>
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-slate-500 truncate max-w-[70%]">
                        {item.user?.name}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded flex-shrink-0 border border-slate-100">
                        {className}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full rounded-lg bg-white border border-slate-200 p-10 text-center">
              <Search size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-[11px] font-medium text-slate-500">
                Tidak ada karya ditemukan.
              </p>
            </div>
          )}
        </div>

        {/* ═══ PAGINATION ═══ */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => fetchGalleries(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition disabled:opacity-30"
            >
              ←
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => fetchGalleries(page)}
                className={`h-8 min-w-[2rem] rounded-md text-[10px] font-semibold transition border ${
                  currentPage === page
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => fetchGalleries(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="h-8 w-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════
            DELETE DIALOG
        ═══════════════════════════════════════ */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent className="rounded-xl border-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sm font-semibold text-slate-800">
                Hapus Karya Siswa?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[11px] text-slate-500">
                Tindakan ini tidak dapat dibatalkan. Karya akan dihapus permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isDeleting}
                className="h-9 text-[11px] font-medium"
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  confirmDelete();
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white h-9 text-[11px] font-semibold border-none"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ═══════════════════════════════════════
            PREVIEW MODAL
        ═══════════════════════════════════════ */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden border-none bg-white shadow-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedItem?.title}</DialogTitle>
              <DialogDescription>Preview Karya</DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="flex flex-col">
                {/* ── Media Area ── */}
                <div className="w-full bg-slate-900 flex items-center justify-center min-h-[350px] relative">
                  {selectedItem.file_type === "image" && (
                    <img
                      src={selectedItem.file_url || selectedItem.file_path}
                      className="w-full h-auto max-h-[75vh] object-contain"
                      alt={selectedItem.title}
                    />
                  )}

                  {selectedItem.file_type === "audio" && (
                    <div className="flex flex-col items-center p-12 w-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500">
                      <Music size={100} className="text-white/20 mb-6 float" />
                      <audio controls className="w-full h-10 drop-shadow-2xl">
                        <source src={selectedItem.file_url || selectedItem.file_path} type="audio/mpeg" />
                      </audio>
                      <p className="text-white font-extrabold mt-4 tracking-widest text-[10px] uppercase opacity-80">
                        Listening Mode
                      </p>
                    </div>
                  )}

                  {selectedItem.file_type === "link" && (
                    <div className="w-full bg-black min-h-[350px] flex items-center justify-center relative overflow-hidden">
                      {selectedItem.file_path?.includes("instagram.com") ? (
                        <div className="w-full h-[350px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex flex-col items-center justify-center gap-4 p-6">
                          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-semibold text-lg">Postingan Instagram</p>
                            <p className="text-white/80 text-sm mt-1">Konten ini hanya dapat dilihat di Instagram</p>
                          </div>
                          <a
                            href={selectedItem.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 bg-white text-pink-500 font-semibold px-6 py-2 rounded-full text-sm hover:bg-white/90 transition"
                          >
                            Buka di Instagram
                          </a>
                        </div>
                      ) : selectedItem.file_path?.includes("facebook.com") || selectedItem.file_path?.includes("fb.watch") ? (
                        <div className="w-full h-[350px] bg-gradient-to-br from-blue-600 to-blue-400 flex flex-col items-center justify-center gap-4 p-6">
                          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-semibold text-lg">Postingan Facebook</p>
                            <p className="text-white/80 text-sm mt-1">Konten ini hanya dapat dilihat di Facebook</p>
                          </div>
                          <a
                            href={selectedItem.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 bg-white text-blue-600 font-semibold px-6 py-2 rounded-full text-sm hover:bg-white/90 transition"
                          >
                            Buka di Facebook
                          </a>
                        </div>
                      ) : selectedItem.file_path?.includes("tiktok.com") || selectedItem.file_path?.includes("vm.tiktok.com") ? (
                        tiktokEmbedFailed ? (
                          <div className="w-full h-[350px] bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center gap-4 p-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-white font-semibold text-lg">Video TikTok</p>
                              <p className="text-white/60 text-sm mt-1">Konten ini hanya dapat dilihat di TikTok</p>
                            </div>
                            <a href={selectedItem.file_path} target="_blank" rel="noreferrer" className="mt-2 bg-white text-black font-semibold px-6 py-2 rounded-full text-sm hover:bg-white/90 transition">
                              Buka di TikTok
                            </a>
                          </div>
                        ) : (
                          <div className="w-full flex justify-center overflow-hidden">
                            <blockquote
                              className="tiktok-embed"
                              cite={selectedItem.file_path}
                              data-video-id={selectedItem.file_path.match(/video\/(\d+)/)?.[1]}
                              style={{ maxWidth: "605px", minWidth: "325px" }}
                            >
                              <section />
                            </blockquote>
                          </div>
                        )
                      ) : (
                        (() => {
                          const videoId = getYoutubeId(selectedItem.file_path);
                          return videoId ? (
                            <iframe
                              width="100%"
                              height="350"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title="YouTube"
                              frameBorder="0"
                              allowFullScreen
                              className="w-full"
                            />
                          ) : (
                            <ReactPlayer
                              url={normalizeYoutubeUrl(selectedItem.file_path)}
                              width="100%"
                              height="300px"
                              controls={true}
                            />
                          );
                        })()
                      )}
                    </div>
                  )}
                </div>

                {/* ── User Details Footer ── */}
                <div className="p-6 bg-white relative">
                  <div className="absolute -top-5 left-6 bg-white p-1.5 rounded-2xl shadow-lg border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-lg">
                      {selectedItem.user?.name?.charAt(0) || "S"}
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-[1fr_auto] gap-4 items-end">
                    <div className="min-w-0">
                      <h2
                        className="font-display text-base font-extrabold text-slate-800 leading-tight truncate"
                        title={selectedItem.title}
                      >
                        {selectedItem.title}
                      </h2>
                      <div className="flex items-center mt-2.5 gap-2">
                        <div className="flex flex-col">
                          <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-tight">
                            {selectedItem.user?.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-400">
                              {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }) : "—"}
                            </span>
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/80">
                              {selectedItem.class_name || selectedItem.user?.student_class?.name || selectedItem.user?.studentClass?.name || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 pb-1">
                      <ShareButton galleryId={selectedItem.id} title={selectedItem.title} />
                      <button
                        onClick={() => {
                          setPreviewOpen(false);
                          handleDeleteClick(selectedItem.id);
                        }}
                        className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 flex items-center justify-center transition shadow-sm"
                        title="Hapus Karya"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}