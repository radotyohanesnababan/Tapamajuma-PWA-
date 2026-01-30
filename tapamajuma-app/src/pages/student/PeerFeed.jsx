import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const POSITIVE_TEMPLATES = [
  "Keren banget progresmu! 🔥",
  "Semangat terus ya kawan! ✨",
  "Inspiratif sekali ceritanya! 🙌",
  "Ayo kita belajar bareng! 🤝",
  "Hebat! Aku bangga sama kamu! 😊"
];

export default function PeerFeed() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentId, setActiveCommentId] = useState(null);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const res = await api.get('/api/peer-feed');
      setFeeds(res.data);
    } catch (err) {
      console.error("Detail Error Laravel:", err.response?.data);
        console.log("Gagal mengambil feed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (reflectionId, templateText) => {
    // 1. Simpan salinan data lama untuk jaga-jaga jika error
    const previousFeeds = [...feeds];

    // 2. Update UI secara instan (Optimistic Update)
    const updatedFeeds = feeds.map(feed => {
        if (feed.id === reflectionId) {
            const newFeedback = {
                user_name: "Kamu", // Beri tanda sementara
                comment: templateText,
                created_at: new Date().toISOString()
            };
            return {
                ...feed,
                peer_feedback: [...(feed.peer_feedback || []), newFeedback]
            };
        }
        return feed;
    });
    
    setFeeds(updatedFeeds);
    setActiveCommentId(null);
    toast.success("Dukungan terkirim! ✨"); // Gunakan sonner yang tadi kita pasang

    try {
        await api.post(`/api/reflections/${reflectionId}/peer-feedback`, { 
            comment: templateText 
        });
        // Tidak perlu fetchFeeds() lagi jika data sudah sinkron
    } catch {
        setFeeds(previousFeeds); // Kembalikan data jika gagal
        toast.error("Gagal mengirim dukungan.");
    }
};

  if (loading) return <div className="p-10 text-center text-xs animate-pulse">Memuat kabar baik...</div>;

  return (
    <div className="p-4 space-y-4 pb-24 max-w-md mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-yellow-500" size={18} />
          Inspirasi Teman
        </h2>
        <p className="text-[10px] text-slate-500">Saling menyemangati dalam proses belajar</p>
      </div>

      {feeds.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xs text-slate-400">Belum ada kabar terbaru minggu ini.</p>
        </div>
      ) : (
        feeds.map((feed) => (
          <Card key={feed.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              {/* Header: Nama Siswa */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                  {feed.user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">{feed.user.name}</p>
                  <p className="text-[9px] text-slate-400">Baru saja memperbarui progres</p>
                </div>
              </div>
              
              {/* Konten: Peningkatan (Improvements) */}
              <div className="bg-indigo-50/50 p-3 rounded-xl mb-4 border border-indigo-100/50">
                <p className="text-[11px] font-semibold text-indigo-700 uppercase mb-1 tracking-wider">Peningkatan Minggu Ini:</p>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{feed.improvements}"
                </p>
              </div>

              {/* Komentar yang ada di kolom JSON */}
              {feed.peer_feedback && feed.peer_feedback.length > 0 && (
                <div className="space-y-2 mb-4 bg-slate-50 p-2 rounded-lg">
                  {feed.peer_feedback.map((fb, idx) => (
  <div key={idx} className="flex items-start gap-2 mb-2 last:mb-0">
    <div className="bg-white border border-slate-100 px-3 py-1.5 rounded-2xl rounded-tl-none shadow-[2px_2px_0px_rgba(0,0,0,0,02)]">
      <p className="text-[10px] leading-tight">
        <span className="font-bold text-indigo-600 mr-1">{fb.user_name}</span> 
        <span className="text-slate-600">{fb.comment}</span>
      </p>
    </div>
  </div>
))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => setActiveCommentId(activeCommentId === feed.id ? null : feed.id)}
                  className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${activeCommentId === feed.id ? 'text-indigo-600' : 'text-slate-500'}`}
                >
                  <MessageSquare size={14} />
                  {activeCommentId === feed.id ? 'Tutup Pilihan' : 'Beri Semangat'}
                </button>
              </div>

              {/* Template Selection Panel */}
              {activeCommentId === feed.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in zoom-in duration-200">
                  <p className="text-[9px] font-bold text-slate-400 mb-2 uppercase">Pilih Pesan Positif:</p>
                  <div className="flex flex-wrap gap-2">
                    {POSITIVE_TEMPLATES.map((text, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendFeedback(feed.id, text)}
                        className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}