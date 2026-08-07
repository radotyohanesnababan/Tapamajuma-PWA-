import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import {
  Heart, MessageSquare, Sparkles, PartyPopper, Smile,
  Send, User, Quote, ChevronRight, Zap, Flame,
  Rocket, Star, HandMetal, Trophy, CheckCircle2,
  MessageCircleHeart, Ghost
} from "lucide-react";
import { toast } from "sonner";

const POSITIVE_TEMPLATES = [
  { text: "Keren banget progresmu! 🔥", color: "from-orange-400 to-rose-400" },
  { text: "Semangat terus ya kawan! ✨", color: "from-amber-400 to-orange-400" },
  { text: "Inspiratif sekali ceritanya! 🙌", color: "from-indigo-400 to-violet-400" },
  { text: "Ayo kita belajar bareng! 🤝", color: "from-sky-400 to-indigo-400" },
  { text: "Hebat! Aku bangga sama kamu! 😊", color: "from-emerald-400 to-teal-400" },
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
      const res = await api.get("/api/reflections/peer-feed");
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
    const updatedFeeds = feeds.map((feed) => {
      if (feed.id === reflectionId) {
        const newFeedback = {
          user_name: "Kamu",
          comment: templateText,
          created_at: new Date().toISOString(),
        };
        return {
          ...feed,
          peer_feedback: [...(feed.peer_feedback || []), newFeedback],
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
        comment: templateText,
      });
    } catch {
      setFeeds(previousFeeds);
      toast.error("Gagal mengirim dukungan.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5fb] flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap');
          .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
          @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
          .float { animation: floaty 2.6s ease-in-out infinite; }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <PartyPopper className="text-indigo-500 float" size={44} />
          <p className="font-display font-extrabold text-slate-600 animate-pulse">
            Mencari inspirasi dari temanmu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5fb] pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        .float { animation: floaty 2.6s ease-in-out infinite; }
        @keyframes heart-pop { 0% { transform: scale(0) } 50% { transform: scale(1.3) } 100% { transform: scale(1) } }
        .heart-pop { animation: heart-pop 0.4s ease-out; }
      `}</style>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-slate-400">
              Komunitas Belajar
            </p>
            <h2 className="font-display text-[28px] font-extrabold text-slate-800 leading-tight">
              Kabar Teman
            </h2>
            <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed">
              Lihat apa yang berhasil dicapai temanmu dan beri mereka semangat! 🌟
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl shadow-[0_2px_10px_rgba(251,191,36,0.15)] border border-amber-50 flex-shrink-0 mt-1">
            <Sparkles className="text-amber-500 float" size={22} fill="currentColor" fillOpacity={0.15} />
          </div>
        </div>

        {/* ── FEED COUNT BADGE ── */}
        {feeds.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 rounded-full" />
            <span className="text-[10px] font-extrabold text-slate-400 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
              {feeds.length} cerita minggu ini
            </span>
            <div className="flex-1 h-1 bg-gradient-to-r from-fuchsia-400 via-violet-400 to-indigo-400 rounded-full" />
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {feeds.length === 0 ? (
          <div className="rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] p-10 text-center border-2 border-dashed border-indigo-100">
            <div className="text-5xl mb-3 float inline-block">🌱</div>
            <h3 className="font-display text-lg font-extrabold text-slate-700 mb-1">
              Belum ada kabar terbaru
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Jadilah yang pertama menginspirasi temanmu!
            </p>
          </div>
        ) : (
          /* ── FEED CARDS ── */
          <div className="space-y-4">
            {feeds.map((feed) => {
              const feedbackCount = (feed.peer_feedback || []).length;
              const isActive = activeCommentId === feed.id;

              return (
                <div
                  key={feed.id}
                  className="rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] overflow-hidden transition-all duration-300 hover:shadow-[0_8px_20px_rgba(99,102,241,0.1)]"
                >
                  {/* Gradient strip */}
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

                  <div className="p-5 pt-4">
                    {/* ── USER INFO ── */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold shadow-[0_4px_10px_rgba(99,102,241,0.25)]">
                        {feed.user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-extrabold text-slate-800 leading-tight truncate">
                          {feed.user.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Flame className="text-orange-500" size={11} fill="currentColor" fillOpacity={0.3} />
                          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-tight">
                            Berhasil Meningkat!
                          </p>
                        </div>
                      </div>
                      <div className="text-[9.5px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg flex-shrink-0">
                        {new Date(feed.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>

                    {/* ── ACHIEVEMENT QUOTE ── */}
                    <div className="relative bg-gradient-to-br from-indigo-50/80 to-violet-50/80 p-5 rounded-2xl mb-4 border border-indigo-100/60">
                      <Quote
                        className="absolute top-2.5 left-3 text-indigo-200"
                        size={20}
                        fill="currentColor"
                      />
                      <p className="text-[12.5px] text-indigo-900 leading-relaxed font-bold italic text-center px-4 pt-1">
                        "{feed.improvements}"
                      </p>
                    </div>

                    {/* ── EXISTING PEER FEEDBACK ── */}
                    {feedbackCount > 0 && (
                      <div className="mb-4 pb-4 border-b border-slate-100">
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.15em] mb-2.5 flex items-center gap-1.5">
                          <MessageCircleHeart size={11} className="text-rose-400" />
                          Dukungan Teman ({feedbackCount})
                        </p>
                        <div className="space-y-2">
                          {feed.peer_feedback.map((fb, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[8px] font-extrabold text-slate-500">
                                  {fb.user_name.charAt(0)}
                                </span>
                              </div>
                              <div className="bg-slate-50 border border-slate-100/80 px-3 py-2 rounded-2xl rounded-tl-none">
                                <p className="text-[11px] leading-snug text-slate-700">
                                  <span className="font-extrabold text-indigo-600 mr-1">
                                    {fb.user_name}
                                  </span>
                                  {fb.comment}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── INTERACTION BAR ── */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() =>
                          setActiveCommentId(isActive ? null : feed.id)
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-extrabold transition-all active:scale-95 ${
                          isActive
                            ? "bg-rose-50 text-rose-500 shadow-inner ring-1 ring-rose-200"
                            : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
                        }`}
                      >
                        {isActive ? (
                          <>Batal</>
                        ) : (
                          <>
                            <Heart size={13} /> Beri Semangat
                          </>
                        )}
                      </button>

                      {/* Feedback avatars */}
                      {feedbackCount > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            {feed.peer_feedback.slice(0, 3).map((fb, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-[8px] font-extrabold text-white shadow-sm"
                              >
                                {fb.user_name.charAt(0)}
                              </div>
                            ))}
                          </div>
                          {feedbackCount > 3 && (
                            <span className="text-[9px] font-bold text-slate-400">
                              +{feedbackCount - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── TEMPLATE PICKER ── */}
                    {isActive && (
                      <div className="mt-5 pt-4 border-t-2 border-dashed border-indigo-50 animate-in slide-in-from-top-3 duration-300">
                        <div className="flex items-center gap-2 mb-3">
                          <HandMetal className="text-amber-500" size={13} />
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            Pilih Kata Semangat:
                          </p>
                        </div>
                        <div className="space-y-2">
                          {POSITIVE_TEMPLATES.map((tmpl, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                handleSendFeedback(feed.id, tmpl.text)
                              }
                              className={`w-full text-left text-[11px] font-bold bg-gradient-to-r ${tmpl.color} text-white px-4 py-3 rounded-2xl transition-all active:scale-[0.97] hover:shadow-md flex items-center justify-between group`}
                            >
                              <span>{tmpl.text}</span>
                              <ChevronRight
                                size={14}
                                className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="pt-6 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Heart size={10} className="text-rose-400" fill="currentColor" fillOpacity={0.3} />
            Dibuat dengan cinta untuk belajarmu
          </p>
        </div>
      </div>
    </div>
  );
}