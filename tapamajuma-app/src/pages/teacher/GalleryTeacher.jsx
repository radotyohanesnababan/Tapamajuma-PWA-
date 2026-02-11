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

  // State Preview
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchGalleries();
  }, []);

const fetchGalleries = async () => {
  try {
    const res = await api.get('/api/teacher/galleries');
    
    console.log('Raw API Response:', res.data); // DEBUG
    
    // Handle berbagai struktur response
    let galleriesData = [];
    
    if (Array.isArray(res.data)) {
      galleriesData = res.data;
    } else if (res.data.data && Array.isArray(res.data.data)) {
      galleriesData = res.data.data;
    } else {
      console.error('Unexpected response structure:', res.data);
    }
    
    console.log('Galleries Data:', galleriesData); // DEBUG
    setItems(galleriesData);
    
  } catch (error) {
    console.error('Fetch error:', error);
    toast.error("Gagal memuat galeri");
    setItems([]); // Tetap set array kosong saat error
  } finally {
    setLoading(false);
  }
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
    const cls = item.user?.student_class;
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
    const storageUrl = import.meta.env.VITE_STORAGE_URL || "";

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

    const fullPath = item.file_path ? `${storageUrl}${item.file_path}` : "";
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Galeri Karya Siswa</h1>
          <p className="text-sm text-slate-500">
            Monitoring kelas: <span className="font-bold text-indigo-600">{availableClasses.map(c => c.name).join(', ')}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* FILTER KELAS */}
            <div className="w-full sm:w-48">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="bg-white border-slate-200 shadow-sm">
                    <div className="flex items-center text-slate-600">
                    <Filter size={14} className="mr-2" />
                    <SelectValue placeholder="Semua Kelas" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                        Kelas {cls.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            
            {/* SEARCH BAR */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                placeholder="Cari siswa/judul..." 
                className="pl-10 bg-white shadow-sm border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* GRID CONTENT */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            // Kita definisikan nama kelas di sini (di dalam loop)
            const className = item.user?.student_class?.name || "Tanpa Kelas";

            return (
                <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white">
                    {/* Thumbnail Area */}
                    <div 
                        className="aspect-video w-full bg-slate-100 cursor-pointer overflow-hidden relative"
                        onClick={() => {setSelectedItem(item); setPreviewOpen(true);}}
                    >
                        {/* Panggil fungsi renderPreviewThumbnail dengan parameter item */}
                        {renderPreviewThumbnail(item)}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>

                    {/* Info Area */}
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                            <div className="w-full overflow-hidden">
                                <h3 className="font-bold text-slate-800 text-sm truncate mb-1" title={item.title}>{item.title}</h3>
                                
                                <div className="flex flex-col">
                                    <div className="flex items-center text-xs text-indigo-600 mb-1 font-medium">
                                        <User size={12} className="mr-1" />
                                        <span className="truncate">{item.user?.name}</span>
                                    </div>
                                    
                                    {/* LABEL KELAS */}
                                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit border border-slate-200 font-semibold">
                                        Kelas {className}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Tombol Hapus */}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50 -mr-2 flex-shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(item.id);
                                }}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 text-slate-400 bg-slate-50 border-2 border-dashed rounded-xl">
            <p>Tidak ada karya ditemukan.</p>
          </div>
        )}
      </div>

      {/* --- ALERT DIALOG DELETE --- */}
      {/* Perhatikan: Di sini kita TIDAK BOLEH pakai variabel 'item' */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Karya Siswa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Karya ini akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); confirmDelete(); }} 
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- PREVIEW DIALOG --- */}
      {/* Perhatikan: Di sini kita pakai 'selectedItem', BUKAN 'item' */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="sr-only">
             <DialogTitle>Preview</DialogTitle>
             <DialogDescription>Detail Karya</DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="flex flex-col">
              {/* AREA KONTEN */}
              <div className="w-full bg-black min-h-[300px] flex items-center justify-center relative">
                {selectedItem.file_type === 'image' && (
                  <img src={`${import.meta.env.VITE_STORAGE_URL}${selectedItem.file_path}`} className="w-full h-auto max-h-[70vh] object-contain" />
                )}
                {selectedItem.file_type === 'audio' && (
                  <div className="w-full bg-indigo-50 p-10 flex flex-col items-center">
                    <Music size={60} className="text-indigo-500 mb-4 animate-bounce" />
                    <audio controls className="w-full"><source src={`${import.meta.env.VITE_STORAGE_URL}${selectedItem.file_path}`} type="audio/mpeg" /></audio>
                  </div>
                )}
                {/* VIDEO PLAYER */}
                {selectedItem.file_type === 'link' && (
                  <div className="w-full">
                     {selectedItem.file_path.includes('instagram.com') ? (
                        <div className="p-10 text-center text-white bg-gradient-to-br from-purple-600 to-orange-500 h-[300px] flex flex-col items-center justify-center">
                           <p className="font-bold mb-4">Instagram Content</p>
                           <Button variant="secondary" onClick={() => window.open(selectedItem.file_path, '_blank')}>Buka di Instagram</Button>
                        </div>
                     ) : selectedItem.file_path.includes('facebook.com') || selectedItem.file_path.includes('fb.watch') ? (
                        <iframe 
                           src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(selectedItem.file_path)}&show_text=false&width=500`}
                           width="100%" height="300" style={{border:'none', overflow:'hidden'}} allowFullScreen={true}
                        />
                     ) : (
                        <ReactPlayer 
                           url={normalizeYoutubeUrl(selectedItem.file_path)}
                           width="100%" height="350px" controls={true} playing={false}
                        />
                     )}
                  </div>
                )}
              </div>

              {/* FOOTER INFO SISWA */}
              <div className="p-5 bg-white border-t">
                 <h2 className="text-xl font-bold text-slate-900">{selectedItem.title}</h2>
                 <div className="flex items-center mt-3 gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                       {selectedItem.user?.name?.charAt(0)}
                    </div>
                    <div>
                       <p className="text-sm font-semibold text-slate-700">{selectedItem.user?.name}</p>
                       <p className="text-xs text-slate-500">
                           {/* Kita pakai optional chaining biar gak error */}
                           Kelas: {selectedItem.user?.student_class?.name || "Tanpa Kelas"}
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}