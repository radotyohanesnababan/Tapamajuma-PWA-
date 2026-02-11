import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  PartyPopper, 
  Smile, 
  Send, 
  User,
  Quote
} from 'lucide-react';
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
      console.error("Gagal mengambil feed", err);
      toast.error("Gagal memuat kabar baik.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (reflectionId, templateText) => {
    const previousFeeds = [...feeds];
    const updatedFeeds = feeds.map(feed => {
        if (feed.id === reflectionId) {
            const newFeedback = {
                user_name: "Kamu",
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
    toast.success("Dukungan terkirim! ✨", {
        icon: <PartyPopper className="text-indigo-500" size={16} />,
    });

    try {
        await api.post(`/api/reflections/${reflectionId}/peer-feedback`, { 
            comment: templateText 
        });
    } catch {
        setFeeds(previousFeeds);
        toast.error("Gagal mengirim dukungan.");
    }
};

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <PartyPopper className="animate-bounce text-indigo-500" size={40} />
        <p className="text-xs font-bold text-slate-500 animate-pulse">Mencari inspirasi dari temanmu...</p>
    </div>
  );

  return (
    <div className="p-4 pb-24 space-y-6 max-w-md mx-auto bg-slate-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col items-center text-center space-y-2 pt-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <Sparkles className="text-amber-500" size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Kabar Teman</h2>
        <p className="text-xs text-slate-500 font-medium px-6 leading-relaxed">
            Lihat apa yang berhasil dicapai temanmu dan beri mereka semangat! 🌟
        </p>
      </div>

      {feeds.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <Smile className="mx-auto text-slate-300 mb-2" size={40} />
          <p className="text-xs text-slate-400 font-medium">Belum ada kabar terbaru minggu ini.<br/>Jadilah yang pertama menginspirasi!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feeds.map((feed) => (
            <Card key={feed.id} className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-6">
                
                {/* User Info */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-inner">
                    {feed.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-800 leading-none">{feed.user.name}</p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter mt-1">Berhasil Meningkat!</p>
                  </div>
                  <div className="text-[9px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {new Date(feed.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                
                {/* Achievement Quote Box */}
                <div className="relative bg-indigo-50/50 p-5 rounded-2xl mb-5 border border-indigo-100/50">
                  <Quote className="absolute -top-2 -left-1 text-indigo-200" size={24} fill="currentColor" />
                  <p className="text-xs text-indigo-900 leading-relaxed font-bold italic text-center px-2">
                    "{feed.improvements}"
                  </p>
                </div>

                {/* Peer Feedback Section (Speech Bubbles) */}
                {feed.peer_feedback && feed.peer_feedback.length > 0 && (
                  <div className="space-y-3 mb-5 border-t border-slate-50 pt-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Dukungan Teman:</p>
                    <div className="flex flex-col gap-2">
                        {feed.peer_feedback.map((fb, idx) => (
                            <div key={idx} className="flex items-start gap-2 group">
                                <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-2xl rounded-tl-none shadow-sm transition-all hover:bg-white">
                                    <p className="text-[10px] leading-tight text-slate-700">
                                        <span className="font-black text-indigo-600 mr-1">{fb.user_name}</span> 
                                        {fb.comment}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Interaction Area */}
                <div className="flex items-center justify-between mt-2">
                  <button 
                    onClick={() => setActiveCommentId(activeCommentId === feed.id ? null : feed.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black transition-all active:scale-95 ${
                        activeCommentId === feed.id 
                        ? 'bg-rose-50 text-rose-500 shadow-inner' 
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    }`}
                  >
                    {activeCommentId === feed.id ? (
                        <>Batal</>
                    ) : (
                        <><Heart size={14} fill={activeCommentId === feed.id ? "currentColor" : "none"} /> Beri Semangat</>
                    )}
                  </button>
                  
                  <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                         <div key={i} className={`w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold`}>
                             {i}
                         </div>
                     ))}
                  </div>
                </div>

                {/* Template Selection Panel (Animated) */}
                {activeCommentId === feed.id && (
                  <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <Smile className="text-amber-500" size={14} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Pilih Kata-Kata Keren:</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POSITIVE_TEMPLATES.map((text, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendFeedback(feed.id, text)}
                          className="text-[10px] font-bold bg-white text-slate-700 border-2 border-slate-100 px-3 py-2 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-all active:scale-90 flex items-center gap-1 shadow-sm"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="py-10 text-center">
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
             <Heart size={10} className="text-rose-400" /> Dibuat dengan cinta untuk belajarmu
         </p>
      </div>
    </div>
  );
}