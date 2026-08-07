import React, { useState, useEffect, useMemo } from 'react';
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayCircle, FileText, Music, Search, Trash2, User, Loader2, Filter } from "lucide-react";
import { toast } from "sonner";
import ReactPlayer from 'react-player';

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

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async (page = 1) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/api/teacher/galleries?page=${page}&search=${searchQuery}&class_id=${selectedClassId}`
      );

      setItems(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);

    } catch (error) {
      toast.error("Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGalleries(1);
  }, [searchQuery, selectedClassId]);

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

  // --- 1. LOGIKA EKSTRAK KELAS ---
  const availableClasses = useMemo(() => {
  // PERBAIKAN: Pastikan items adalah array
  if (!Array.isArray(items)) {
    console.warn('Items is not an array:', items);
    return [];
  }

  const classMap = new Map();
  
  items.forEach(item => {
    const cls = item.user?.student_class || item.user?.studentClass;
    if (cls && cls.id && cls.name) {
      if (!classMap.has(cls.id)) {
        classMap.set(cls.id, cls.name);
      }
    }
  });
  
  return Array.from(classMap, ([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

  // --- 2. LOGIKA FILTERING ---
  const filteredItems = useMemo(() => {
  // PERBAIKAN: Cek apakah items adalah array
  if (!Array.isArray(items)) {
    console.warn('Items is not an array in filter:', items);
    return [];
  }

  return items.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const studentClassId = item.user?.student_class?.id;
    const matchesClass = selectedClassId === "all" || 
      (studentClassId && studentClassId.toString() === selectedClassId);
    
    return matchesSearch && matchesClass;
  });
}, [items, searchQuery, selectedClassId]);

  // --- LOGIKA DELETE ---
  const handleDeleteClick = (id) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/teacher/galleries/${deleteId}`);
      toast.success("Karya berhasil dihapus");
      setItems(prev => prev.filter(i => i.id !== deleteId));
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
    const videoId = getYoutubeId(url);
    if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // Helper render preview di Card (Grid)
  const renderPreviewThumbnail = (item) => {
    const storageUrl = item.file_url || item.file_path;"";

    if (item.file_type === 'link') {
      const videoId = getYoutubeId(item.file_path);
      if (videoId) {
        return (
          <div className="relative w-full h-full bg-black group">
             <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} className="w-full h-full object-cover opacity-80" alt="Thumbnail" />
             <div className="absolute inset-0 flex items-center justify-center"><PlayCircle size={40} className="text-white bg-black/50 rounded-full p-1" /></div>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center bg-slate-900 w-full h-full text-white">
          <PlayCircle size={40} className="mb-2 opacity-80" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
             {item.file_path.includes('instagram') ? 'Instagram' : 'Video Link'}
          </span>
        </div>
      );
    }

const fullPath = item.file_url || item.file_path;
    if (item.file_type === 'image') return <img src={fullPath} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />;
    if (item.file_type === 'audio') {
      return (
        <div className="flex flex-col items-center justify-center bg-indigo-50 w-full h-full p-4 text-indigo-600">
           <Music size={40} />
           <p className="text-[10px] mt-2 font-bold">REKAMAN SUARA</p>
        </div>
      );
    }
    return <div className="flex flex-col items-center justify-center bg-rose-50 text-rose-600 w-full h-full"><FileText size={40} /></div>;
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Memuat Data Siswa...</div>;

    return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
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
            {filteredItems.length} karya
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
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const className = item.user?.student_class?.name || "—";

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
            PREVIEW DIALOG
        ═══════════════════════════════════════ */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-lg rounded-xl p-0 overflow-hidden bg-white border-slate-200">
            <DialogHeader className="sr-only">
              <DialogTitle>Preview</DialogTitle>
              <DialogDescription>Detail Karya</DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="flex flex-col">
                {/* Media area */}
                <div className="w-full bg-slate-900 min-h-[280px] flex items-center justify-center relative">
                  {selectedItem.file_type === "image" && (
                    <img
                      src={selectedItem.file_url || selectedItem.file_path}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      alt={selectedItem.title}
                    />
                  )}

                  {selectedItem.file_type === "audio" && (
                    <div className="w-full bg-slate-800 p-10 flex flex-col items-center">
                      <Music size={48} className="text-slate-500 mb-4" />
                      <audio controls className="w-full">
                        <source src={selectedItem.file_url} type="audio/mpeg" />
                      </audio>
                    </div>
                  )}

                  {selectedItem.file_type === "link" && (
                    <div className="w-full">
                      {selectedItem.file_path.includes("instagram.com") ? (
                        <div className="p-10 text-center text-white bg-gradient-to-br from-purple-600 to-orange-500 h-[280px] flex flex-col items-center justify-center gap-3">
                          <p className="text-sm font-semibold">Instagram Content</p>
                          <a
                            href={selectedItem.file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white text-slate-900 px-4 py-2 rounded-md text-xs font-semibold"
                          >
                            Buka di Instagram →
                          </a>
                        </div>
                      ) : selectedItem.file_path.includes("facebook.com") ||
                        selectedItem.file_path.includes("fb.watch") ? (
                        <iframe
                          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(selectedItem.file_path)}&show_text=false&width=500`}
                          width="100%"
                          height="280"
                          style={{ border: "none", overflow: "hidden" }}
                          allowFullScreen
                        />
                      ) : (
                        <ReactPlayer
                          url={normalizeYoutubeUrl(selectedItem.file_path)}
                          width="100%"
                          height="320px"
                          controls
                          playing={false}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Info footer */}
                <div className="p-4 bg-white border-t border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-800">
                    {selectedItem.title}
                  </h2>
                  <div className="flex items-center gap-2.5 mt-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold flex-shrink-0">
                      {selectedItem.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">
                        {selectedItem.user?.name}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {selectedItem.user?.student_class?.name || "—"}
                      </p>
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