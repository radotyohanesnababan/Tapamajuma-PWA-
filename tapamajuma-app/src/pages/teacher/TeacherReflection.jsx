/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import {
  MessageCircle, Send, Quote, CheckCircle2,
  Sparkles, Filter, Calendar, SearchX,
  ChevronLeft, ChevronRight, MessageSquare,
  Clock, AlertCircle, ChevronDown, Hash
} from "lucide-react";
import { toast } from "sonner";

// ── COMPACT REFLECTION ROW ──
const ReflectionRow = ({ data, onResponded }) => {
  const [feedback, setFeedback] = useState(data.feedback_teacher || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hasResponded = !!data.feedback_teacher;
  const isChanged = feedback !== (data.feedback_teacher || "");

  const handleSubmit = async () => {
    if (!feedback.trim()) return toast.error("Masukan tidak boleh kosong.");
    setIsSubmitting(true);
    try {
      await api.post(`/api/teacher/reflections/${data.id}/feedback`, {
        feedback_teacher: feedback,
      });
      toast.success("Tanggapan terkirim.");
      if (onResponded) onResponded();
    } catch {
      toast.error("Gagal mengirim masukan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-lg bg-white border overflow-hidden transition-all ${
        hasResponded
          ? "border-slate-200"
          : "border-amber-200 border-l-[3px]"
      }`}
    >
      {/* Main row — always visible */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status dot */}
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            hasResponded ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-800 truncate">
            {data.user?.name || "—"}
          </p>
          <p className="text-[9px] text-slate-400 truncate">
            {data.user?.student_class?.name || "—"}
          </p>
        </div>

        {/* Category */}
        <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">
          {data.category}
        </span>

        {/* Status badge */}
        <span
  className={`text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 ${
    hasResponded
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700"
  }`}
>
          {hasResponded ? "Dijawab" : "Menunggu"}
        </span>

        {/* Date */}
        <span className="font-mono text-[9px] text-slate-400 flex-shrink-0">
          {new Date(data.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          })}
        </span>

        {/* Expand chevron */}
        <ChevronDown
          size={12}
          className={`text-slate-400 transition-transform flex-shrink-0 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-3 py-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Student content */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Refleksi
            </p>
            <p className="text-[11px] text-slate-700 leading-relaxed italic">
              "{data.content}"
            </p>
            {data.targets && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                  Target
                </p>
                <p className="text-[11px] text-slate-700 font-medium">
                  {data.targets}
                </p>
              </div>
            )}
          </div>

          {/* Teacher response */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              Tanggapan Guru
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tulis saran atau motivasi..."
              className="w-full text-[11px] min-h-[72px] bg-white border border-slate-200 rounded-lg p-2.5 text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-300 resize-none font-medium"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !feedback.trim() || !isChanged}
                className={`h-8 px-4 rounded-md text-[10px] font-semibold transition border-none flex items-center gap-1.5 ${
                  isChanged && feedback.trim()
                    ? "bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.97]"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Menyimpan...</span>
                ) : (
                  <>
                    <Send size={11} /> Kirim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── MAIN COMPONENT ──
export default function TeacherReflection() {
  const [reflections, setReflections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [unrespondedOnly, setUnrespondedOnly] = useState(false);

  // Fetch classes
  useEffect(() => {
    api
      .get("/api/teacher/accessible-classes")
      .then((res) => setClasses(res.data))
      .catch(() => toast.error("Gagal memuat daftar kelas."));
  }, []);

  // Fetch reflections
  const fetchReflections = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await api.get("/api/teacher/reflections", {
          params: {
            class_id: selectedClass,
            start_date: startDate,
            end_date: endDate,
            unresponded_only: unrespondedOnly ? "true" : undefined,
            page,
            per_page: 10,
          },
        });
        setReflections(res.data.data);
        setCurrentPage(res.data.current_page);
        setLastPage(res.data.last_page);
        setTotal(res.data.total);
      } catch {
        toast.error("Gagal memuat data refleksi.");
      } finally {
       setLoading(false);
      }
    },
    [selectedClass, startDate, endDate, unrespondedOnly]
  );

  // Auto-fetch on filter change (reset to page 1)
  useEffect(() => {
    fetchReflections(1);
  }, [selectedClass, startDate, endDate, unrespondedOnly]);

  // Fetch specific page
  const goToPage = (page) => {
    fetchReflections(page);
  };

  // After responding, refresh current page
  const handleResponded = () => {
    fetchReflections(currentPage);
  };

  const pendingCount = reflections.filter((r) => !r.feedback_teacher).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ═══ HEADER ═══ */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">
            Forum Refleksi
          </p>
          <h1 className="text-lg font-bold text-slate-800 mt-0.5">
            Jurnal Siswa
          </h1>
        </div>

        {/* ═══ FILTER BAR ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Filter size={11} className="text-slate-500" />
            <span className="text-[9px] font-semibold text-slate-=500 uppercase tracking-wider">
              Filter
            </span>
            {(startDate !== today || endDate !== today || selectedClass || unrespondedOnly) && (
              <button
                onClick={() => {
                  setSelectedClass("");
                  setStartDate(today);
                  setEndDate(today);
                  setUnrespondedOnly(false);
                }}
                className="ml-auto text-[9px] font-semibold text-rose-600 uppercase tracking-wider"
              >
                Reset
              </button>
            )}
          </div>

          {/* Row 1: Class + Unresponded toggle */}
          <div className="flex gap-2">
            <select
              className="flex-1 h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setUnrespondedOnly(!unrespondedOnly)}
              className={`h-8 px-3 rounded-md text-[10px] font-semibold border transition ${
                unrespondedOnly
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {unrespondedOnly ? "Menunggu saja" : "Semua status"}
            </button>
          </div>

          {/* Row 2: Date range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
            />
            <span className="text-slate-300 self-center text-[10px]">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>
        </div>

        {/* ═══ COUNT BAR ═══ */}
        {!loading && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="font-mono text-slate-600">{total}</span> catatan
            </span>
            {pendingCount > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-semibold text-amber-600">
                <AlertCircle size={10} />
                <span className="font-mono">{pendingCount}</span> belum ditanggapi
              </span>
            )}
          </div>
        )}

        {/* ═══ REFLECTION LIST ═══ */}
        <div className="space-y-1.5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-11 rounded-lg bg-white border border-slate-100 animate-pulse"
              />
            ))
          ) : reflections.length === 0 ? (
            <div className="rounded-lg bg-white border border-slate-200 p-10 text-center">
              <SearchX size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-[11px] font-medium text-slate-500">
                Tidak ada jurnal pada filter ini.
              </p>
            </div>
          ) : (
            <>
              {/* Column header */}
              <div className="flex items-center px-3 py-1.5 text-[8px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                <span className="w-2" />
                <span className="flex-1 ml-2.5">Nama</span>
                <span className="w-12 text-center">Kategori</span>
                <span className="w-16 text-center">Status</span>
                <span className="w-12 text-right">Tanggal</span>
                <span className="w-4" />
              </div>

              {reflections.map((item) => (
                <ReflectionRow
                  key={item.id}
                  data={item}
                  onResponded={handleResponded}
                />
              ))}
            </>
          )}
        </div>

        {/* ═══ PAGINATION ═══ */}
        {!loading && lastPage > 1 && (
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-3 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft size={12} /> Prev
            </button>

            <span className="font-mono text-[10px] font-semibold text-slate-500">
              {currentPage} / {lastPage}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === lastPage}
              className="h-8 px-3 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-30 flex items-center gap-1"
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}