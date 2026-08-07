import React, { useState, useEffect } from "react";
import {
  RefreshCw, Clock, AlertTriangle, ArrowLeft,
  Radio, ShieldCheck, Hash, Eye
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

const ExamLiveControl = ({ exam, setView }) => {
  const [token, setToken] = useState(exam?.token || "------");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Refresh Token
  const handleRefreshToken = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await api.post(
        `/api+api+/teacher/cbt/exams/${exam.id}/release-token`
      );
      setToken(res.data.token);
      toast.success("Token baru dirilis.");
    } catch {
      toast.error("Gagal memperbarui token.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Close Exam
  const handleCloseExam = async () => {
    if (
      !window.confirm(
        "Yakin ingin menutup ujian ini? Siswa tidak akan bisa masuk lagi."
      )
    )
      return;

    setIsClosing(true);
    try {
      await api.post(`/api/teacher/cbt/exams/${exam.id}/close`);
      toast.success("Ujian ditutup.");
      setView("list");
    } catch {
      toast.error("Gagal menutup ujian.");
    } finally {
      setIsClosing(false);
    }
  };

  if (!exam) return null;

  return (
    <div className="space-y-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes pulse-soft { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
        @keyframes token-glow { 0%,100% { text-shadow: 0 0 20px rgba(16,185,129,0.3) } 50% { text-shadow: 0 0 40px rgba(16,185,129,0.6) } }
        .token-glow { animation: token-glow 3s ease-in-out infinite; }
      `}</style>

      {/* ═══ LIVE BANNER ═══ */}
      <div className="rounded-lg bg-emerald-900 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-soft" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            Ujian Berlangsung
          </span>
          <span className="text-emerald-300">·</span>
          <span className="font-mono text-[10px] font-bold text-emerald-300">
            {currentTime.toLocaleTimeString("id-ID")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-semibold text-emerald-300">
            {exam.subject?.name || "—"}
          </span>
          <span className="text-emerald-400">·</span>
          <span className="font-mono text-[9px] text-emerald-300">
            {exam.duration_minutes}m
          </span>
        </div>
      </div>

      {/* ═══ TOKEN DISPLAY — PRIMARY ═══ */}
      <div className="rounded-xl bg-white border-2 border-emerald-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={13} className="text-emerald-600" />
            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
              Token Aktif
            </span>
          </div>
          <span className="text-[9px] font-semibold text-emerald-500 flex items-center gap-1">
            <Eye size={10} /> Tampilkan ke siswa
          </span>
        </div>

        {/* Token number */}
        <div className="py-10 px-4 text-center bg-gradient-to-b from-white to-emerald-50/30">
          <p className="font-mono text-6xl sm:text-7xl font-extrabold text-emerald-700 tracking-[0.15em] token-glow select-all">
            {token}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-4">
            Masukkan kode di atas pada aplikasi ujian
          </p>
        </div>
      </div>

      {/* ═══ ACTIONS ═══ */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleRefreshToken}
          disabled={isRefreshing}
          className="h-11 rounded-lg bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition active:scale-[0.98] disabled:opacity-50 border-none"
        >
          {isRefreshing ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {isRefreshing ? "Memperbarui..." : "Refresh Token"}
        </button>

        <button
          onClick={handleCloseExam}
          disabled={isClosing}
          className="h-11 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold flex items-center justify-center gap-2 hover:bg-rose-100 transition active:scale-[0.98] disabled:opacity-50"
        >
          {isClosing ? (
            <span className="animate-pulse">Menutup...</span>
          ) : (
            <>
              <AlertTriangle size={14} /> Selesaikan Ujian
            </>
          )}
        </button>
      </div>

      {/* ═══ EXAM INFO ═══ */}
      <div className="rounded-lg bg-white border border-slate-200 p-3">
        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Detail Paket
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-[10px] text-slate-500">Judul</span>
            <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[60%] text-right">
              {exam.title}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-[10px] text-slate-500">Mapel</span>
            <span className="text-[11px] font-semibold text-slate-700">
              {exam.subject?.name || "—"}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-[10px] text-slate-500">Durasi</span>
            <span className="font-mono text-[11px] font-bold text-slate-700">
              {exam.duration_minutes} menit
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-50">
            <span className="text-[10px] text-slate-500">Jumlah Soal</span>
            <span className="font-mono text-[11px] font-bold text-slate-700">
              {exam.total_questions}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-[10px] text-slate-500">Status</span>
            <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Berjalan
            </span>
          </div>
        </div>
      </div>

      {/* ═══ WARNING ═══ */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5">
        <AlertTriangle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
          <span className="font-semibold">Jangan tutup halaman ini</span> selama
          ujian berlangsung. Token hanya terlihat di sini.
        </p>
      </div>

      {/* ═══ BACK ═══ */}
      <button
        onClick={() => setView("list")}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition"
      >
        <ArrowLeft size={12} /> Kembali ke Daftar Paket
      </button>
    </div>
  );
};

export default ExamLiveControl;