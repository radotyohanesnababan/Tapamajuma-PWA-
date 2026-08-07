import React, { useState, useEffect, useRef } from 'react'; // Tambahkan useRef
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "@/components/ui/dialog";
import { PlayCircle, FileText, Image as ImageIcon, Plus, Music, FileUp, Loader2, Mic, Square, Trash2, Rocket, Sparkles, Globe, User, Heart, Share, Save,Zap} from "lucide-react"; // Tambahkan ikon Mic & Square
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
import ReactPlayer from 'react-player';
import { InstagramEmbed, FacebookEmbed } from 'react-social-media-embed';
import ShareButton from '@/components/ShareButton';
import { SlidersHorizontal, X } from "lucide-react";

export default function GalleryStudent() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tiktokEmbedFailed, setTiktokEmbedFailed] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState("file");
  const [linkUrl, setLinkUrl] = useState("");

  // Voice Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null); 
  const [subjectId, setSubjectId] = useState("");

  //State Pagination
  const [items, setItems] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [lastPage, setLastPage] = useState(1);
const [loading, setLoading] = useState(false);

const [quota, setQuota] = useState(null);

const fetchGalleries = async (page = 1, subjectId = selectedSubjectId) => {
    setLoading(true);
    const params = new URLSearchParams({ page });
    if (subjectId) params.append('subject_id', subjectId);

    const res = await api.get(`/api/galleries?${params}`);
    if (page === 1) {
        setItems(res.data.data);
    } else {
        setItems(prev => [...prev, ...res.data.data]);
    }
    setCurrentPage(res.data.current_page);
    setLastPage(res.data.last_page);
    if (res.data.quota) setQuota(res.data.quota); 

    setLoading(false);
};

  useEffect(() => {
        fetchGalleries(1);
        // ✅ Fix — tambah catch + log
    api.get('/api/galleries/subjects')
    .then(res => {
        console.log('subjects:', res.data); // cek isinya dulu
        setSubjects(res.data);
    })
    .catch(err => console.error('subjects error:', err));
    }, []);

  useEffect(() => {
  if (selectedItem?.file_path?.includes('tiktok.com')) {
    setTiktokEmbedFailed(false); // reset tiap ganti item

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

    // Fallback timer — jika 5 detik belum render, tampilkan preview
    const timer = setTimeout(() => {
      const el = document.querySelector('.tiktok-embed iframe');
      if (!el) setTiktokEmbedFailed(true);
    }, 5000);

    return () => clearTimeout(timer);
  }
}, [selectedItem]);



  // --- LOGIKA VOICE RECORDER ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Simpan sebagai file untuk diunggah
        const recordedFile = new File([audioBlob], `cerita-suara-${Date.now()}.mp3`, { type: 'audio/mpeg' });
        setFile(recordedFile);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch  {
      toast.error("Izinkan akses mikrofon untuk merekam");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
  };

const getYoutubeId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/
  ];
  
  for (let pattern of patterns) {
    const match = url.match(pattern); // Tetap pakai URL asli untuk matching
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};
const normalizeYoutubeUrl = (url) => {
  if (!url) return null;
  
  // Ekstrak video ID dulu
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Jika langsung video ID
  ];
  
  for (let pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Kembalikan format standar YouTube TANPA parameter playlist
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
  }
  
  // Fallback
  return url.startsWith('http') ? url : `https://${url}`;
};

  const handleOpenPreview = (item) => {
  setSelectedItem(item);
  setPreviewOpen(true);
};

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

  // Loading state
  if (loading) {
    return (
      <div className="relative w-full h-full bg-black animate-pulse" />
    );
  }

  // Ada thumbnail → tampilkan
  if (thumbnail) {
    return (
      <div className="relative w-full h-full bg-black">
        <img
          src={thumbnail}
          alt="TikTok thumbnail"
          className="w-full h-full object-cover"
        />
        {/* Overlay gelap tipis */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Icon play + label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <PlayCircle size={36} className="opacity-90 drop-shadow" />
          <span className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-80">TikTok</span>
        </div>
      </div>
    );
  }

  // Fallback — tidak ada thumbnail
  return (
    <div className="relative w-full h-full bg-black">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <svg className="w-12 h-12 mb-2" fill="white" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
        </svg>
        <PlayCircle size={32} className="opacity-90" />
        <span className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-80">TikTok</span>
      </div>
    </div>
  );
}

 const handleUpload = async (e) => {
    e.preventDefault();
    if (!title) return toast.error("Judul karya wajib diisi!");
    if (!subjectId) return toast.error("Pilih mata pelajaran dulu!"); // ← tambah

    if (uploadType === 'link') {
        if (!linkUrl) return toast.error("Masukkan link video dulu!");
    } else {
        if (!file) return toast.error("Pilih file atau rekam suara dulu!");
    }

    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject_id', subjectId); // ← tambah

    if (uploadType === 'link') {
        formData.append('type', 'link');
        formData.append('url', linkUrl);
    } else {
        formData.append('type', 'file');
        formData.append('file', file);
    }

    try {
        await api.post('/api/galleries', formData, {
            headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
        });
        toast.success("Karya berhasil diunggah!");
        setOpen(false);
        setTitle("");
        setFile(null);
        setAudioUrl(null);
        setLinkUrl("");
        setUploadType("file");
        setSubjectId(""); // ← tambah
        fetchGalleries();
    } catch (err) {
        const message = err.response?.data?.message || "Gagal mengunggah karya";
        toast.error(message);
    } finally {
        setUploading(false);
    }
};



  // (Fungsi renderPreview tetap sama seperti sebelumnya)
  const renderPreview = (item) => {
    // URL Dasar Storage
    // eslint-disable-next-line no-unused-vars
    const storageUrl = import.meta.env.VITE_STORAGE_URL;

    if (item.file_type === 'link') {
      const videoId = getYoutubeId(item.file_path); 

      // A. Jika Link Youtube Valid -> Tampilkan Thumbnail Asli
      if (videoId) {
        return (
          <div className="relative w-full h-full group bg-black">
             {/* Ambil gambar langsung dari server Youtube */}
             <img 
               src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
               className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
               alt="Youtube Thumbnail"
               onError={(e) => { e.target.style.display = 'none'; }} // Fallback kalau gagal
             />
             {/* Ikon Play di tengah */}
             <div className="absolute inset-0 flex items-center justify-center">
               <PlayCircle size={40} className="text-white drop-shadow-md bg-black/50 rounded-full p-1" />
             </div>
          </div>
        );
      }
      // B. Instagram - Gradient dengan Icon
    if (item.file_path.includes('instagram.com')) {
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            {/* Icon Instagram */}
            <svg className="w-12 h-12 mb-2" fill="white" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <PlayCircle size={32} className="opacity-90" />
            <span className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-80">Instagram</span>
          </div>
        </div>
      );
    }

     if (item.file_path.includes('facebook.com') || item.file_path.includes('fb.watch')) {
      return (
        <div className="relative w-full h-full bg-blue-600">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            {/* Icon Facebook */}
            <svg className="w-12 h-12 mb-2" fill="white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <PlayCircle size={32} className="opacity-90" />
            <span className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-80">Facebook</span>
          </div>
        </div>
      );
    }

    if (item.file_path.includes('tiktok.com') || item.file_path.includes('vm.tiktok.com')) {
  return <TikTokPreview url={item.file_path} />;
}
      // C. Fallback untuk link lain (misal: Vimeo, Dailymotion, dll)
      return (
        <div className="relative w-full h-full bg-gray-800">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <PlayCircle size={40} className="opacity-90" />
            <span className="text-[10px] uppercase font-bold tracking-widest mt-2 opacity-80">Video Link</span>
          </div>
        </div>
      );
    }
    
    // 1. Cek Tipe LINK (Prioritas Utama)
    if (item.file_type === 'link') {
      return (
        <div className="flex flex-col items-center justify-center bg-slate-900 w-full h-full text-white">
          {/* Pastikan import PlayCircle dari lucide-react */}
          <PlayCircle size={40} className="mb-2 opacity-80" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Video Link</span>
        </div>
      );
    }

    // 2. Susun URL untuk file fisik (Gambar/Audio/PDF)
    // Hati-hati: Pastikan item.file_path tidak null
    if (!item.file_path) return null;
    const fullPath = item.file_url || item.file_path;

    if (item.file_type === 'image') {
      return <img src={fullPath} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400?text=Error"; }} />;
    }

    if (item.file_type === 'audio') {
      return (
        <div className="flex flex-col items-center justify-center bg-indigo-50 w-full h-full p-4 text-indigo-600">
          <Music size={40} />
          <audio controls className="mt-2 w-full h-8 scale-75"><source src={fullPath} type="audio/mpeg" /></audio>
        </div>
      );
    }

    // 3. Default (PDF / Lainnya)
    return (
      <div className="flex flex-col items-center justify-center bg-rose-50 w-full h-full p-4 text-rose-600">
        <FileText size={40} />
        <div className='bg-rose-100 p-1 mt-1 rounded-xl text-sm'>
             {item.file_type ? item.file_type.toUpperCase() : "DOKUMEN"}
        </div>
      </div>
    );
  };
  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400">Memuat Galeri...</div>;

  return (
    <div className="min-h-screen bg-[#f6f5fb] pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        .float { animation: floaty 2.6s ease-in-out infinite; }
        @keyframes shine { 0% { transform: translateX(-100%) } 100% { transform: translateX(220%) } }
        .shine { position: relative; overflow: hidden; }
        .shine::after {
          content: ''; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: shine 2.8s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-slate-400">
              Galeri Karya
            </p>
            <h2 className="font-display text-[28px] font-extrabold text-slate-800 leading-tight">
              Aksi Bulanan
            </h2>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setFilterOpen(true)}
              className={`rounded-2xl h-11 w-11 flex items-center justify-center relative transition-all border-none ${
                selectedSubjectId
                  ? "bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
                  : "bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)] border border-slate-100"
              }`}
            >
              <SlidersHorizontal
                size={18}
                className={selectedSubjectId ? "text-white" : "text-slate-500"}
              />
              {selectedSubjectId && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full ring-2 ring-white" />
              )}
            </button>

            <Dialog
              open={open}
              onOpenChange={(val) => {
                setOpen(val);
                if (!val) {
                  setAudioUrl(null);
                  setSubjectId("");
                }
              }}
            >
              <DialogTrigger asChild>
                <button className="rounded-2xl h-11 w-11 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_4px_14px_rgba(99,102,241,0.3)] transition-transform active:scale-90 border-none">
                  <Plus size={22} className="text-white" />
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                {/* Gradient header strip */}
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

                <DialogHeader className="items-center pb-2 pt-6 px-6">
                  <div className="bg-indigo-50 p-3 rounded-2xl mb-2">
                    <Rocket className="text-indigo-600" size={28} />
                  </div>
                  <DialogTitle className="font-display text-xl font-extrabold text-slate-800">
                    Unggah Karya Terbaik
                  </DialogTitle>
                  <DialogDescription className="text-xs text-center font-medium">
                    Siap menginspirasi teman-temanmu hari ini?
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpload} className="space-y-5 pt-2 px-6 pb-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-extrabold uppercase text-slate-400 ml-1 tracking-wider">
                      Judul Keren
                    </Label>
                    <Input
                      className="rounded-2xl bg-slate-50 border-none h-12 focus-visible:ring-indigo-500 shadow-inner font-medium"
                      placeholder="Apa nama karyamu?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-extrabold uppercase text-slate-400 ml-1 tracking-wider">
                      Mata Pelajaran
                    </Label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border-none h-12 px-4 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner appearance-none"
                    >
                      <option value="">-- Pilih Mata Pelajaran --</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Tabs value={uploadType} onValueChange={setUploadType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-2xl p-1 h-auto shadow-inner">
                      <TabsTrigger
                        type="button"
                        value="file"
                        className="rounded-xl py-2.5 text-[10px] font-extrabold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        📁 FILES
                      </TabsTrigger>
                      <TabsTrigger
                        type="button"
                        value="record"
                        className="rounded-xl py-2.5 text-[10px] font-extrabold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        🎙️ VOICE
                      </TabsTrigger>
                      <TabsTrigger
                        type="button"
                        value="link"
                        className="rounded-xl py-2.5 text-[10px] font-extrabold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        🔗 LINKS
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="border-2 border-dashed rounded-[1.75rem] p-8 flex flex-col items-center bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group relative">
                        <FileUp className="text-slate-300 group-hover:text-indigo-500 transition-colors mb-3" size={40} />
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Ketuk untuk pilih file
                        </p>
                        <input
                          type="file"
                          accept=".jpg,.png,.mp3,.pdf"
                          onChange={(e) => setFile(e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {file && (
                          <div className="mt-3 flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-emerald-100 animate-bounce">
                            <span>✅ {file.name.length > 20 ? file.name.substring(0, 20) + "..." : file.name}</span>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="record" className="pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex flex-col items-center p-8 bg-indigo-50/50 rounded-[1.75rem] border-2 border-indigo-100 border-dashed relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Mic size={100} />
                        </div>

                        {!audioUrl ? (
                          <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`rounded-full w-16 h-16 shadow-2xl transition-all duration-300 border-none flex items-center justify-center ${
                              isRecording
                                ? "bg-rose-500 animate-pulse scale-110 ring-4 ring-rose-100"
                                : "bg-gradient-to-br from-indigo-500 to-violet-500 hover:scale-110 shadow-[0_4px_14px_rgba(99,102,241,0.3)]"
                            }`}
                          >
                            {isRecording ? <Square size={24} fill="white" /> : <Mic size={28} />}
                          </button>
                        ) : (
                          <div className="w-full space-y-4 z-10">
                            <div className="bg-white p-2 rounded-2xl shadow-sm">
                              <audio src={audioUrl} controls className="w-full h-10" />
                            </div>
                            <button
                              type="button"
                              className="w-full text-[10px] font-extrabold text-rose-500 hover:bg-rose-100 rounded-xl py-2.5 bg-transparent border-none"
                              onClick={() => {
                                setAudioUrl(null);
                                setFile(null);
                              }}
                            >
                              HAPUS & REKAM ULANG
                            </button>
                          </div>
                        )}
                        <p className={`text-[10px] mt-6 font-extrabold uppercase tracking-widest z-10 ${isRecording ? "text-rose-500" : "text-indigo-400"}`}>
                          {isRecording ? "Sedang Merekam..." : audioUrl ? "Rekaman Siap!" : "Klik Mic untuk Bicara"}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="link" className="pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-white p-6 rounded-[1.75rem] border-2 border-slate-100 shadow-sm space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-extrabold uppercase text-slate-400 ml-1 tracking-wider">
                            Alamat Link (URL)
                          </Label>
                          <Input
                            className="rounded-2xl bg-slate-50 border-none h-12 shadow-inner focus-visible:ring-indigo-500 font-medium"
                            placeholder="Tempel link YT/IG/Tiktok di sini..."
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                          />
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 border border-amber-100">
                          <Sparkles className="text-amber-500 shrink-0" size={18} />
                          <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                            PENTING: Pastikan videomu diatur sebagai "Publik" agar bisa dilihat guru dan teman sekelas!
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white h-14 rounded-2xl font-extrabold shadow-[0_8px_24px_rgba(99,102,241,0.3)] transition-all active:scale-[0.98] disabled:opacity-60 border-none flex items-center justify-center gap-2 text-sm"
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={16} />}
                    {uploading ? "Mengunggah..." : "PUBLIKASIKAN KARYA"}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── QUOTA BAR ── */}
        {quota && (
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[11px] font-bold shadow-[0_2px_10px_rgba(15,23,42,0.04)] ${
            quota.remaining === 0
              ? "bg-rose-50 text-rose-500 border border-rose-100"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              quota.remaining === 0 ? "bg-rose-100 text-rose-500" : "bg-emerald-100 text-emerald-500"
            }`}>
              <Zap size={14} />
            </div>
            <span>
              {quota.remaining === 0
                ? "Kuota minggu ini sudah habis"
                : `Sisa kuota upload minggu ini: ${quota.remaining}/${quota.max}`}
            </span>
          </div>
        )}

        {/* ── NAVIGATION TABS ── */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full bg-white rounded-2xl p-1.5 h-auto shadow-[0_2px_10px_rgba(15,23,42,0.04)] border border-slate-100">
            <TabsTrigger value="all" className="flex-1 rounded-xl py-2.5 font-extrabold text-[11px] gap-2 data-[state=active]:shadow-sm">
              <Globe size={14} /> JELAJAH
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1 rounded-xl py-2.5 font-extrabold text-[11px] gap-2 data-[state=active]:shadow-sm">
              <User size={14} /> KARYA SAYA
            </TabsTrigger>
          </TabsList>

          {/* ── TAB: JELAJAH ── */}
          <TabsContent value="all" className="mt-5 space-y-4">
            {selectedSubjectId && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-[10px] font-extrabold border border-indigo-100">
                  <span>{subjects.find((s) => s.id === selectedSubjectId)?.name}</span>
                  <button
                    onClick={() => {
                      setSelectedSubjectId(null);
                      fetchGalleries(1, null);
                    }}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{items.length} karya</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.5rem] overflow-hidden bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.12)] hover:-translate-y-0.5 transition-all cursor-pointer group"
                  onClick={() => handleOpenPreview(item)}
                >
                  <div className="aspect-square flex items-center justify-center overflow-hidden relative bg-slate-50">
                    {renderPreview(item)}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-extrabold text-slate-800 truncate mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold">
                      Oleh {item.user?.name.split(" ")[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {currentPage < lastPage && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => fetchGalleries(currentPage + 1)}
                  disabled={loading}
                  className="text-[11px] font-bold text-indigo-500 py-2.5 px-6 rounded-full border border-indigo-200 hover:bg-indigo-50 transition bg-transparent"
                >
                  {loading ? "Memuat..." : "Muat lebih banyak"}
                </button>
              </div>
            )}
          </TabsContent>

          {/* ── TAB: KARYA SAYA ── */}
          <TabsContent value="mine" className="mt-5">
            <div className="grid grid-cols-2 gap-3">
              {items
                .filter((i) => i.user_id === user?.id)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] overflow-hidden bg-white shadow-[0_4px_14px_rgba(99,102,241,0.1)] border-2 border-indigo-200 relative cursor-pointer hover:-translate-y-0.5 transition-all"
                    onClick={() => handleOpenPreview(item)}
                  >
                    <div className="aspect-square flex items-center justify-center overflow-hidden bg-slate-50">
                      {renderPreview(item)}
                    </div>
                    <div className="absolute top-2 right-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white p-1.5 rounded-full shadow-md">
                      <Heart size={10} fill="white" />
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] font-extrabold text-slate-800 truncate mb-0.5">
                        {item.title}
                      </p>
                      <p className="text-[8px] text-indigo-500 font-extrabold uppercase tracking-widest">
                        Karyamu ✨
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ══════════════════════════════════════════════════
            PREVIEW MODAL
        ══════════════════════════════════════════════════ */}
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
                      src={selectedItem.file_url}
                      className="w-full h-auto max-h-[75vh] object-contain"
                      alt={selectedItem.title}
                    />
                  )}

                  {selectedItem.file_type === "audio" && (
                    <div className="flex flex-col items-center p-12 w-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500">
                      <Music size={100} className="text-white/20 mb-6 float" />
                      <audio controls className="w-full h-10 drop-shadow-2xl">
                        <source src={selectedItem.file_url} type="audio/mpeg" />
                      </audio>
                      <p className="text-white font-extrabold mt-4 tracking-widest text-[10px] uppercase opacity-80">
                        Listening Mode
                      </p>
                    </div>
                  )}

                  {selectedItem.file_type === "link" && (
                    <div className="w-full bg-black min-h-[350px] flex items-center justify-center relative overflow-hidden">
                      {selectedItem.file_path.includes("instagram.com") ? (
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
                      ) : selectedItem.file_path.includes("facebook.com") || selectedItem.file_path.includes("fb.watch") ? (
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
                      ) : selectedItem.file_path.includes("tiktok.com") || selectedItem.file_path.includes("vm.tiktok.com") ? (
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
                      {selectedItem.user?.name?.charAt(0)}
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
                          <p className="text-[10px] font-semibold text-slate-400">
                            {new Date(selectedItem.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 pb-1">
                      <ShareButton galleryId={selectedItem.id} title={selectedItem.title} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════════════════
            FILTER BOTTOM SHEET
        ══════════════════════════════════════════════════ */}
        {filterOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setFilterOpen(false)}
            />

            <div className="relative bg-white rounded-t-[2rem] p-6 space-y-5 animate-in slide-in-from-bottom duration-300 z-[70]">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-slate-800 text-lg">
                  Filter Mata Pelajaran
                </h3>
                {selectedSubjectId && (
                  <button
                    onClick={() => {
                      setSelectedSubjectId(null);
                      fetchGalleries(1, null);
                      setFilterOpen(false);
                    }}
                    className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest bg-transparent border-none"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pb-4">
                <button
                  onClick={() => {
                    setSelectedSubjectId(null);
                    fetchGalleries(1, null);
                    setFilterOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    !selectedSubjectId
                      ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  Semua
                </button>
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSubjectId(s.id);
                      fetchGalleries(1, s.id);
                      setFilterOpen(false);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                      selectedSubjectId === s.id
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}