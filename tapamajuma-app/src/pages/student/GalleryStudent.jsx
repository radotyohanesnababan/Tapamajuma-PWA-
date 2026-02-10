import React, { useState, useEffect, useRef } from 'react'; // Tambahkan useRef
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,DialogDescription } from "@/components/ui/dialog";
import { PlayCircle, FileText, Image as ImageIcon, Plus, Music, FileUp, Loader2, Mic, Square, Trash2 } from "lucide-react"; // Tambahkan ikon Mic & Square
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';
// ... import lainnya
import ReactPlayer from 'react-player';
import { InstagramEmbed, FacebookEmbed } from 'react-social-media-embed';

export default function GalleryStudent() {
  const [items, setItems] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await api.get('/api/galleries');
      setItems(res.data);
    } catch {
      toast.error("Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
  };

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
  // -----------------------------

  const handleOpenPreview = (item) => {
  setSelectedItem(item);
  setPreviewOpen(true);
};

  const handleUpload = async (e) => {
    e.preventDefault();
    /// 1. Validasi Judul (Wajib untuk semua)
    if (!title) return toast.error("Judul karya wajib diisi!");

    // 2. Validasi Berdasarkan Tipe Upload
    if (uploadType === 'link') {
        // Kalau tipe LINK, yang dicek linkUrl-nya
        if (!linkUrl) return toast.error("Masukkan link video dulu!");
    } else {
        // Kalau tipe FILE atau RECORD, yang dicek file-nya
        if (!file) return toast.error("Pilih file atau rekam suara dulu!");
    }

    setUploading(true);

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    // Kirim data sesuai tipe
  if (uploadType === 'link') {
    formData.append('type', 'link'); // Beritahu backend ini adalah link
    formData.append('url', linkUrl); // Kirim URL-nya
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
      setAudioUrl(null); // Reset preview audio
      setLinkUrl("");
      setUploadType("file");
      fetchGalleries();
    } catch {
      toast.error("Gagal mengunggah karya");
    } finally {
      setUploading(false);
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // (Fungsi renderPreview tetap sama seperti sebelumnya)
  const renderPreview = (item) => {
    // URL Dasar Storage
    const storageUrl = import.meta.env.VITE_STORAGE_URL;

    if (item.file_type === 'link') {
      const videoId = getYoutubeId(item.file_path); // file_path isinya URL Youtube

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
    const fullPath = item.file_path ? `${storageUrl}${item.file_path}` : "";

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
    <div className="p-4 pb-24 max-w-md mx-auto bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Galeri</h1>
          <p className="text-xs text-slate-500">Aksi Bulanan: Publikasi Karya</p>
        </div>

        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) setAudioUrl(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-indigo-600 shadow-lg"><Plus className="mr-2" size={18} /> Karya</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader><DialogTitle>Unggah Karya Terbaik</DialogTitle></DialogHeader>
            
            <form onSubmit={handleUpload} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Judul Karya</Label>
                <Input placeholder="Judul cerita/tugas..." value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              {/* INTEGRASI TABS UNTUK PILIH FILE ATAU REKAM */}
              <Tabs value={uploadType} onValueChange={setUploadType}>
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 rounded-xl">
                  <TabsTrigger value="file">Pilih File</TabsTrigger>
                  <TabsTrigger value="record">Rekam Suara</TabsTrigger>
                  <TabsTrigger value="link">Link YT/IG/FB</TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="space-y-3 pt-2">
                  <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center bg-slate-50">
                    <FileUp className="text-slate-400 mb-2" />
                    <input type="file" accept=".jpg,.png,.mp3,.pdf" onChange={(e) => setFile(e.target.files[0])} className="text-xs" />
                  </div>
                </TabsContent>

                <TabsContent value="record" className="space-y-3 pt-2">
                  <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 border-dashed">
                    {!audioUrl ? (
                      <Button 
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording} 
                        className={`rounded-full w-12 h-12 ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'}`}
                      >
                        {isRecording ? <Square size={20} /> : <Mic size={24} />}
                      </Button>
                    ) : (
                      <div className="w-full text-center">
                        <audio src={audioUrl} controls className="w-full h-8 mb-2" />
                        <Button type="button" variant="ghost" className="text-[10px] text-rose-500" onClick={() => {setAudioUrl(null); setFile(null);}}>Hapus & Rekam Ulang</Button>
                      </div>
                    )}
                    <p className="text-[10px] mt-2 font-bold text-indigo-400 uppercase">
                      {isRecording ? "Merekam..." : audioUrl ? "Rekaman Tersimpan" : "Klik untuk Rekam"}
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="link" className="space-y-3 pt-2">
                  <div className="border-2 border-dashed rounded-2xl p-4 flex flex-col items-center bg-slate-50">
                    <Input placeholder="Tempel link YT/IG/FB di sini..."
                    value={linkUrl}
      onChange={(e) => setLinkUrl(e.target.value)}/>
                    
                    <p className="text-[10px] text-red-500 mt-2 font-bold">Untuk Link FB atau IG, pastikan akun tidak di set private/gembok</p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full bg-indigo-600" disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin mr-2" /> : "Publikasikan Karya"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full bg-white mb-6">
          <TabsTrigger value="all" className="flex-1">Jelajah</TabsTrigger>
          <TabsTrigger value="mine" className="flex-1">Karya Saya</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white"
            onClick={() => handleOpenPreview(item)}>
              <div className="aspect-square flex items-center justify-center overflow-hidden">{renderPreview(item)}</div>
              <CardContent className="p-2">
                <p className="text-[10px] font-bold truncate">{item.title}</p>
                <p className="text-[8px] text-slate-400">Oleh: {item.user?.name}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mine" className="grid grid-cols-2 gap-4">
          {items.filter(i => i.user_id === user?.id).map((item) => (
             <Card key={item.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white border-2 border-indigo-100"
             onClick={() => handleOpenPreview(item)}>
               <div className="aspect-square flex items-center justify-center overflow-hidden">{renderPreview(item)}</div>
               <CardContent className="p-2">
                 <p className="text-[10px] font-bold truncate">{item.title}</p>
                 <p className="text-[8px] text-indigo-500 font-bold uppercase">Karya Kamu</p>
               </CardContent>
             </Card>
          ))}
        </TabsContent>
      </Tabs>

{/* Pastikan storageUrl didefinisikan di dalam component atau pakai env */}
{/* const storageUrl = import.meta.env.VITE_STORAGE_URL; */}

<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
  <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none bg-white">
    
    {/* 1. HEADER WAJIB DI DALAM CONTENT (Untuk Screen Reader) */}
    <DialogHeader className="sr-only">
      <DialogTitle>{selectedItem?.title || "Preview Karya"}</DialogTitle>
      <DialogDescription>
        Preview karya {selectedItem?.title}
      </DialogDescription>
    </DialogHeader>

    {selectedItem && (
      <div className="flex flex-col">
        {/* Wadah Utama */}
        <div className="w-full bg-slate-100 flex items-center justify-center min-h-[300px] relative">
          
          {/* === A. LOGIKA GAMBAR === */}
          {selectedItem.file_type === 'image' && (
            <img 
              // Pastikan storageUrl sudah didefinisikan di atas component
              src={`${import.meta.env.VITE_STORAGE_URL}${selectedItem.file_path}`} 
              className="w-full h-auto max-h-[70vh] object-contain"
              alt={selectedItem.title}
              onError={(e) => e.target.src = "https://placehold.co/600x400?text=Gambar+Rusak"}
            />
          )}

          {/* === B. LOGIKA AUDIO === */}
          {selectedItem.file_type === 'audio' && (
            <div className="flex flex-col items-center p-10 w-full bg-indigo-50">
              <Music size={80} className="text-indigo-500 mb-4 animate-bounce" />
              <audio controls className="w-full">
                <source src={`${import.meta.env.VITE_STORAGE_URL}${selectedItem.file_path}`} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {/* === C. LOGIKA LINK VIDEO (Youtube/IG/FB) === */}
          {/* PENTING: Wajib dibungkus pengecekan tipe 'link' */}
          {selectedItem.file_type === 'link' && (
            <div className="w-full flex justify-center bg-black min-h-[300px] items-center relative overflow-hidden">
                
                {/* 1. Cek Instagram */}
                {selectedItem.file_path.includes('instagram.com') ? (
                  <InstagramEmbed url={selectedItem.file_path} width={328} />
                ) 
                
                /* 2. Cek Facebook */
                : selectedItem.file_path.includes('facebook.com') || selectedItem.file_path.includes('fb.watch') ? (
                  <FacebookEmbed url={selectedItem.file_path} width="100%" />
                ) 
                
                /* 3. Default: YOUTUBE & Lainnya */
                : (
                  <ReactPlayer 
                    url={selectedItem.file_path} 
                    width="100%" 
                    height="300px" // Tinggi fix biar rapi
                    controls={true} 
                    playing={false} // Matikan autoplay biar aman dari blokir browser
                    config={{
    youtube: {
      playerVars: { showinfo: 1 }
    }
  }}
                  />
                )}
            </div>
          )}

        </div>

        {/* Info Detail User (Footer) */}
        <div className="p-6 bg-white">
          <h2 className="text-xl font-bold text-slate-800">{selectedItem.title}</h2>
          <div className="flex items-center mt-2">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold mr-2">
                {selectedItem.user?.name?.charAt(0) || "?"}
             </div>
             <div>
                <p className="text-xs font-bold text-slate-700">{selectedItem.user?.name}</p>
                <p className="text-[10px] text-slate-500">
                  {new Date(selectedItem.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}
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