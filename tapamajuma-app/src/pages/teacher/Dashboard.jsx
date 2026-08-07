import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import {
  Search, ChevronLeft, ChevronRight, Loader2,
  Trophy, Users, Target, BookOpen,
  Filter, LayoutDashboard, BrainCircuit, Zap,
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Clock, Eye, MessageSquare, ChevronDown, CircleDot,
  ArrowRight, Activity, BarChart3, Send, Download,
  CalendarDays, MoreHorizontal, Star, AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ── STATUS ENGINE ──
const STATUS_MAP = {
  akurat:        { label: "Akurat",         dot: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
  overconfident: { label: "Overconfident",  dot: "bg-rose-500",    bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-100 text-rose-700" },
  underconfident:{ label: "Underconfident", dot: "bg-amber-500",   bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700" },
  berkembang:    { label: "Berkembang",     dot: "bg-slate-400",   bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-600",   badge: "bg-slate-100 text-slate-600" },
};

function classify(score, conf) {
  const s = Number(score);
  const c = Number(conf);
  if (s >= 80 && c >= 4) return "akurat";
  if (s < 50 && c >= 3) return "overconfident";
  if (s >= 80 && c <= 2) return "underconfident";
  return "berkembang";
}

// ── THRESHOLDS ──
const SCORE_WARN = 60;
const CONF_WARN = 3;

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [masterClasses, setMasterClasses] = useState([]);
  const [summary, setSummary] = useState({
    total_students_active: 0,
    average_score: 0,
    average_confidence: 0,
    total_submissions: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 8; // more dense → more rows

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/api/public/classes");
        setMasterClasses(response.data);
      } catch (error) {
        console.error("Gagal ambil data kelas", error);
      }
    };
    fetchClasses();
  }, []);

  const teacherClasses = useMemo(() => {
    const userClassIds = user?.accessible_classes || [];
    if (user?.role === "superadmin") return masterClasses;
    return masterClasses.filter((cls) =>
      userClassIds.some((myId) => String(myId) === String(cls.id))
    );
  }, [user, masterClasses]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dashboardRes, statsRes] = await Promise.all([
          api.get(`/api/teacher/dashboard?class_id=${selectedClass}`),
          api.get(`/api/teacher/stats?class_id=${selectedClass}`),
        ]);
        setData(dashboardRes.data);
        setSummary(statsRes.data);
      } catch (err) {
        console.error("Gagal ambil data dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedClass]);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      (item.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── DERIVED SIGNALS ──
  const alertCount = useMemo(
    () => data.filter((d) => classify(d.score, d.confidence_level) !== "akurat").length,
    [data]
  );
  const onTrackCount = useMemo(
    () => data.filter((d) => classify(d.score, d.confidence_level) === "akurat").length,
    [data]
  );
  const scoreTrendUp = summary.average_score >= 70;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes pulse-soft { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      `}</style>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">
              Mission Control
            </p>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5">
              {selectedClass === "All" ? "Semua Kelas" : selectedClass}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wider">Live</span>
            </div>
          </div>
        </div>

        {/* ═══ CLASS HEALTH BENTO ═══ */}
        <div className="grid grid-cols-4 gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white animate-pulse" />
            ))
          ) : (
            <>
              {/* Avg Score */}
              <div className="col-span-2 rounded-xl bg-white border border-slate-200 p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Skor</span>
                  {scoreTrendUp ? (
                    <TrendingUp size={12} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={12} className="text-rose-500" />
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-2xl font-bold text-slate-800 leading-none">
                    {summary.average_score}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 pb-0.5">/100</span>
                </div>
                {/* Mini bar */}
                <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${scoreTrendUp ? "bg-emerald-500" : "bg-rose-400"}`}
                    style={{ width: `${summary.average_score}%` }}
                  />
                </div>
              </div>

              {/* Active Students */}
              <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex flex-col justify-between">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Aktif</span>
                <span className="font-mono text-xl font-bold text-slate-800 mt-1">
                  {summary.total_students_active}
                </span>
                <span className="text-[8px] font-semibold text-slate-400">minggu ini</span>
              </div>

              {/* Alerts */}
              <div className={`rounded-xl ${alertCount > 0 ? "bg-rose-50 border border-rose-200" : "bg-white border border-slate-200"} p-3.5 flex flex-col justify-between`}>
                <span className="text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1 ${alertCount > 0 ? 'text-rose-600' : 'text-slate-500'}">
                  <AlertTriangle size={9} className={alertCount > 0 ? "text-rose-500" : "text-slate-400"} />
                  <span className={alertCount > 0 ? "text-rose-600" : "text-slate-500"}>Alert</span>
                </span>
                <span className={`font-mono text-xl font-bold mt-1 ${alertCount > 0 ? "text-rose-700" : "text-slate-800"}`}>
                  {alertCount}
                </span>
                {alertCount > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 pulse-soft self-end" />
                )}
              </div>
            </>
          )}
        </div>

        {/* ═══ DISTRIBUTION BAR ═══ */}
        {!isLoading && data.length > 0 && (
          <div className="rounded-xl bg-white border border-slate-200 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Distribusi Status</span>
              <span className="text-[9px] font-mono font-semibold text-slate-400">{data.length} siswa</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
              <div className="bg-emerald-500 transition-all" style={{ width: `${(onTrackCount / data.length) * 100}%` }} />
              <div className="bg-amber-400 transition-all" style={{ width: `${(data.filter(d => classify(d.score, d.confidence_level) === "underconfident").length / data.length) * 100}%` }} />
              <div className="bg-slate-400 transition-all" style={{ width: `${(data.filter(d => classify(d.score, d.confidence_level) === "berkembang").length / data.length) * 100}%` }} />
              <div className="bg-rose-500 transition-all" style={{ width: `${(data.filter(d => classify(d.score, d.confidence_level) === "overconfident").length / data.length) * 100}%` }} />
            </div>
            <div className="flex gap-3 mt-2">
              {Object.entries(STATUS_MAP).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${val.dot}`} />
                  <span className="text-[8px] font-semibold text-slate-500">{val.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PRIMARY ACTION ═══ */}
        <button
          onClick={() => navigate("/teacher/mandiri-session")}
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-2 border-none"
        >
          <BookOpen size={16} />
          Catat Sesi Kelas Siswa
          <ArrowRight size={14} className="ml-1 opacity-50" />
        </button>

        {/* ═══ SEARCH & FILTER ═══ */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari siswa..."
              className="w-full pl-9 pr-3 h-10 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <select
              className="h-10 rounded-xl px-3 pr-7 text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-slate-300 transition"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isLoading}
            >
              <option value="All">Semua Kelas</option>
              {teacherClasses.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ═══ STUDENT FEED — COMPACT LIST ═══ */}
        <div className="space-y-1.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white animate-pulse" />
            ))
          ) : currentItems.length > 0 ? (
            <>
              {/* Column header */}
              <div className="flex items-center px-3 py-1.5 text-[8px] font-semibold text-slate-400 uppercase tracking-wider">
                <span className="w-8" />
                <span className="flex-1 ml-2.5">Nama</span>
                <span className="w-14 text-center">Skor</span>
                <span className="w-14 text-center">Yakin</span>
                <span className="w-20 text-right">Status</span>
                <span className="w-6" />
              </div>

              {currentItems.map((item) => {
                const statusKey = classify(item.score, item.confidence_level);
                const status = STATUS_MAP[statusKey];
                const isAlert = statusKey !== "akurat";
                const scoreLow = Number(item.score) < SCORE_WARN;
                const confLow = Number(item.confidence_level) < CONF_WARN;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl bg-white border p-3 flex items-center gap-2.5 transition-all hover:bg-slate-50 cursor-pointer group ${
                      isAlert ? `${status.border} border-l-[3px]` : "border-slate-200"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg ${status.bg} ${status.text} flex items-center justify-center font-bold text-[11px] flex-shrink-0`}>
                      {item.user?.name?.charAt(0)}
                    </div>

                    {/* Name + Class */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                        {item.user?.name}
                      </p>
                      <p className="text-[9px] font-medium text-slate-400 truncate">
                        {item.user?.student_class?.name || "—"}
                      </p>
                    </div>

                    {/* Score — monospace, color if warning */}
                    <div className="w-14 text-center flex-shrink-0">
                      <span className={`font-mono text-xs font-bold ${scoreLow ? "text-rose-600" : "text-slate-700"}`}>
                        {item.score}
                      </span>
                    </div>

                    {/* Confidence — monospace, color if warning */}
                    <div className="w-14 text-center flex-shrink-0">
                      <span className={`font-mono text-xs font-bold ${confLow ? "text-amber-600" : "text-slate-700"}`}>
                        {item.confidence_level}<span className="text-[9px] text-slate-400">/5</span>
                      </span>
                    </div>

                    {/* Status badge — compact */}
                    <div className="w-20 flex justify-end flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${status.badge}`}>
                        {isAlert && statusKey === "overconfident" && (
                          <AlertTriangle size={8} className="pulse-soft" />
                        )}
                        {status.label}
                      </span>
                    </div>

                    {/* Expand chevron */}
                    <div className="w-6 flex-shrink-0 flex items-center justify-center">
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="rounded-xl bg-white border border-slate-200 p-10 text-center">
              <Search size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-400">
                Belum ada aktivitas di kelas ini.
              </p>
            </div>
          )}
        </div>

        {/* ═══ PAGINATION ═══ */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="text-[10px] font-semibold text-slate-400 font-mono">
              {currentPage}/{totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}