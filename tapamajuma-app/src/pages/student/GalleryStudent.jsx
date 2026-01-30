import React, { useState, useEffect, useRef } from 'react'; // Tambahkan useRef
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlayCircle, FileText, Image as ImageIcon, Plus, Music, FileUp, Loader2, Mic, Square, Trash2 } from "lucide-react"; // Tambahkan ikon Mic & Square
import { toast } from "sonner";
import { useAuth } from '@/context/AuthContext';

export default function GalleryStudent() {
  const [items, setItems] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

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
    if (!file || !title) return toast.error("Isi semua data!");

    setUploading(true);

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      await api.post('/api/galleries', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
        
      });
      toast.success("Karya berhasil diunggah!");
      setOpen(false);
      setTitle("");
      setFile(null);
      setAudioUrl(null); // Reset preview audio
      fetchGalleries();
    } catch {
      toast.error("Gagal mengunggah karya");
    } finally {
      setUploading(false);
    }
  };

  // (Fungsi renderPreview tetap sama seperti sebelumnya)
  const renderPreview = (item) => {
    const backendUrl = "https://tapamajuma-pwa.domcloud.dev/";
    const fileUrl = `${backendUrl}/storage/${item.file_path}`;
    
    if (item.file_type === 'image') {
      return <img src={fileUrl} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://placehold.co/400?text=Error"; }} />;
    }

    if (item.file_type === 'audio') {
      return (
        <div className="flex flex-col items-center justify-center bg-indigo-50 w-full h-full p-4 text-indigo-600">
          <Music size={40} />
          <audio controls className="mt-2 w-full h-8 scale-75"><source src={fileUrl} type="audio/mpeg" /></audio>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center bg-rose-50 w-full h-full p-4 text-rose-600">
        <FileText size={40} />
        <div className='bg-rose-100 p-1 mt-1 rounded-xl text-sm'>PDF File</div>
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
              <Tabs defaultValue="file">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Pilih File</TabsTrigger>
                  <TabsTrigger value="record">Rekam Suara</TabsTrigger>
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
  <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none bg-white">
    {selectedItem && (
      <div className="flex flex-col">
        {/* Konten Utama */}
        <div className="w-full bg-slate-100 flex items-center justify-center min-h-[300px]">
          {selectedItem.file_type === 'image' && (
            <img 
              src={`https://tapamajuma-pwa.domcloud.dev/storage/${selectedItem.file_path}`} 
              className="w-full h-auto max-h-[70vh] object-contain"
              alt={selectedItem.title}
            />
          )}

          {selectedItem.file_type === 'audio' && (
            <div className="flex flex-col items-center p-10 w-full bg-indigo-50">
              <Music size={80} className="text-indigo-500 mb-4 animate-bounce" />
              <audio controls autoPlay className="w-full">
                <source src={`https://tapamajuma-pwa.domcloud.dev/storage/${selectedItem.file_path}`} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {selectedItem.file_type === 'pdf' && (
            <div className="flex flex-col items-center p-10 w-full bg-rose-50">
              <FileText size={80} className="text-rose-500 mb-4" />
              <Button 
                onClick={() => window.open(`https://tapamajuma-pwa.domcloud.dev/storage/${selectedItem.file_path}`, '_blank')}
                className="bg-rose-600 hover:bg-rose-700 rounded-full"
              >
                Buka Dokumen Lengkap
              </Button>
            </div>
          )}
        </div>

        {/* Info Detail */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800">{selectedItem.title}</h2>
          <div className="flex items-center mt-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px] font-bold mr-2">
              {selectedItem.user?.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">{selectedItem.user?.name}</p>
              <p className="text-[10px] text-slate-500">Diterbitkan pada {new Date(selectedItem.created_at).toLocaleDateString('id-ID')}</p>
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