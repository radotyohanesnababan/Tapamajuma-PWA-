import React, { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  AlertCircle, CheckCircle2, HelpCircle, X, ChevronRight,
  TrendingUp, BookOpen, Calendar, Filter, AlertTriangle,
  CircleDot, ArrowRight, Eye, Users, Search, SlidersHorizontal
} from "lucide-react";

// ── STATUS CONFIG (single source of truth) ──
const STATUS = {
  akurat:        { label: "Akurat",         color: "#10b981", desc: "Paham & Yakin",      action: "Siap Pengayaan",      actionDesc: "Pemahaman optimal. Bisa menjadi tutor sebaya." },
  overconfident: { label: "Overconfident",  color: "#ef4444", desc: "Keliru tapi Yakin",   action: "Prioritas Intervensi", actionDesc: "Siswa yakin tapi salah. Perlu perbaikan konsep segera." },
  underconfident:{ label: "Underconfident", color: "#f59e0b", desc: "Paham tapi Ragu",     action: "Bangun Kepercayaan",  actionDesc: "Siswa benar tapi ragu. Butuh penguatan mental." },
  berkembang:    { label: "Berkembang",     color: "#64748b", desc: "Proses Belajar",      action: null,                   actionDesc: null },
};

function classify(score, conf) {
  const s = Number(score);
  const c = Number(conf);
  if (s >= 80 && c >= 4) return "akurat";
  if (s < 50 && c >= 3) return "overconfident";
  if (s >= 80 && c <= 2) return "underconfident";
  return "berkembang";
}

export default function AnalysisTab() {
  const [rawAnalysisList, setRawAnalysisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    api
      .get("/api/teacher/dashboard")
      .then((res) => {
        setRawAnalysisList(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error(err);
        setRawAnalysisList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 1. DATE FILTER
  const analysisList = useMemo(() => {
    let list = rawAnalysisList;
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      list = list.filter((item) => new Date(item.created_at) >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      list = list.filter((item) => new Date(item.created_at) <= e);
    }
    return list;
  }, [rawAnalysisList, startDate, endDate]);

  const getClassName = (item) =>
    item.user?.student_class?.name || item.user?.class?.name || item.class_name || item.user?.class_id || "—";

  // 2. UNIQUE CLASSES
  const availableClasses = useMemo(() => {
    const classes = new Set();
    analysisList.forEach((item) => {
      if (item.user) classes.add(getClassName(item));
    });
    return Array.from(classes).sort();
  }, [analysisList]);

  // 3. CLASS FILTER
  const filteredList = useMemo(() => {
    if (activeTab === "all") return analysisList;
    return analysisList.filter((item) => getClassName(item) === activeTab);
  }, [analysisList, activeTab]);

  // 4. CHART DATA
  const chartData = useMemo(() => {
    if (!filteredList.length) return [];
    const counts = { akurat: 0, overconfident: 0, underconfident: 0, berkembang: 0 };
    filteredList.forEach((d) => {
      counts[classify(d.score, d.confidence_level)]++;
    });
    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        key,
        name: STATUS[key].label,
        value,
        color: STATUS[key].color,
        desc: STATUS[key].desc,
      }));
  }, [filteredList]);

  // MODAL HANDLER
  const handleOpenModal = (key) => {
    const students = filteredList.filter(
      (d) => classify(d.score, d.confidence_level) === key
    );
    setSelectedCategory({ key, students });
    setIsModalOpen(true);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const s = STATUS[d.key];
      return (
        <div className="bg-white border border-slate-200 p-2 rounded-lg shadow-lg text-[10px] z-50">
          <p className="font-semibold" style={{ color: d.color }}>{s.label}</p>
          <p className="text-slate-500 font-mono">{d.value} siswa</p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── DERIVED ──
  const alertCount = useMemo(
    () => filteredList.filter((d) => classify(d.score, d.confidence_level) === "overconfident").length,
    [filteredList]
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
          .font-mono { font-family: 'JetBrains Mono', monospace; }
        `}</style>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-[11px] font-medium text-slate-500">Menganalisis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes pulse-soft { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      `}</style>

      <div className="max-w-lg mx-auto px-4 pt-2 space-y-4">

        {/* ═══ DATE FILTER ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <SlidersHorizontal size={12} className="text-slate-500" />
            <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
              Periode
            </span>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="ml-auto text-[9px] font-semibold text-rose-600 hover:text-rose-700 uppercase tracking-wider"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-[11px] font-medium border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 transition"
              />
            </div>
            <span className="text-slate-300 self-center text-[10px]">→</span>
            <div className="flex-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-[11px] font-medium border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 transition"
              />
            </div>
          </div>
        </div>

        {/* ═══ EMPTY STATE ═══ */}
        {analysisList.length === 0 ? (
          <div className="rounded-lg bg-white border border-slate-200 p-10 text-center">
            <Users size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-500">
              {rawAnalysisList.length > 0
                ? "Tidak ada aktivitas pada rentang tanggal tersebut."
                : "Data analisis akan muncul setelah siswa mengerjakan tugas."}
            </p>
          </div>
        ) : (
          <>
            {/* ═══ CLASS TABS ═══ */}
            <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-hide">
              <button
                onClick={() => setActiveTab("all")}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-[10px] font-semibold transition border ${
                  activeTab === "all"
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                Semua
              </button>
              {availableClasses.map((className) => (
                <button
                  key={className}
                  onClick={() => setActiveTab(className)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-md text-[10px] font-semibold transition border ${
                    activeTab === className
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {className}
                </button>
              ))}
            </div>

            {/* ═══ CHART + LEGEND ═══ */}
            <div className="rounded-lg bg-white border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  Sebaran Pemahaman
                </span>
                <span className="font-mono text-[10px] font-semibold text-slate-400">
                  n={filteredList.length}
                </span>
              </div>

              {filteredList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-[11px]">
                  Tidak ada data untuk filter ini.
                </div>
              ) : (
                <div className="flex items-center gap-4 px-3.5 pb-3.5">
                  {/* Donut */}
                  <div className="h-32 w-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius="62%"
                          outerRadius="100%"
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="font-mono text-lg font-bold text-slate-800 leading-none">
                        {filteredList.length}
                      </span>
                      <span className="text-[8px] text-slate-400 mt-0.5">siswa</span>
                    </div>
                  </div>

                  {/* Legend — compact */}
                  <div className="flex-1 space-y-1.5">
                    {chartData.map((item) => {
                      const pct = Math.round((item.value / filteredList.length) * 100);
                      return (
                        <button
                          key={item.key}
                          onClick={() => handleOpenModal(item.key)}
                          className="w-full flex items-center gap-2 py-1 px-2 rounded-md hover:bg-slate-50 transition text-left group"
                        >
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[10px] font-semibold text-slate-700 flex-1 truncate">
                            {item.name}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-slate-800">
                            {item.value}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">
                            {pct}%
                          </span>
                          <ChevronRight
                            size={10}
                            className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ STACKED BAR (signal overview) ═══ */}
            {filteredList.length > 0 && (
              <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
                {chartData.map((item) => (
                  <div
                    key={item.key}
                    className="transition-all duration-300"
                    style={{
                      backgroundColor: item.color,
                      width: `${(item.value / filteredList.length) * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* ═══ ACTIONABLE INSIGHTS ═══ */}
            {filteredList.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Rekomendasi Tindakan
                </span>

                {["overconfident", "underconfident", "akurat"]
                  .filter((key) => chartData.find((c) => c.key === key))
                  .map((key) => {
                    const data = chartData.find((c) => c.key === key);
                    const cfg = STATUS[key];
                    const isUrgent = key === "overconfident";

                    return (
                      <div
                        key={key}
                        onClick={() => handleOpenModal(key)}
                        className={`rounded-lg bg-white border p-3 flex items-center gap-3 cursor-pointer transition hover:border-slate-300 active:scale-[0.99] group ${
                          isUrgent ? "border-rose-200 border-l-[3px]" : "border-slate-200"
                        }`}
                        style={isUrgent ? { borderLeftColor: cfg.color } : undefined}
                      >
                        {/* Dot */}
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${isUrgent ? "pulse-soft" : ""}`}
                          style={{ backgroundColor: cfg.color }}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-800">
                              {cfg.action}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: cfg.color + "18", color: cfg.color }}>
                              {data.value}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {cfg.actionDesc}
                          </p>
                        </div>

                        <ChevronRight
                          size={14}
                          className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0"
                        />
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}

        {/* ═════════════════════════════════════════════════
            MODAL — COMPACT TABLE
        ═════════════════════════════════════════════════ */}
        {isModalOpen && selectedCategory && (
          <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <div className="relative bg-slate-50 w-full sm:max-w-md max-h-[90vh] sm:max-h-[80vh] flex flex-col shadow-2xl rounded-t-2xl sm:rounded-2xl animate-in slide-in-from-bottom duration-200">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: STATUS[selectedCategory.key].color }}
                  />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">
                      {STATUS[selectedCategory.key].label}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {activeTab !== "all" ? `Kelas ${activeTab}` : "Keseluruhan"} · {selectedCategory.students.length} entri
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-400 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Column headers */}
              <div className="flex items-center px-3.5 py-2 text-[8px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-white">
                <span className="w-7" />
                <span className="flex-1 ml-2">Nama</span>
                <span className="w-10 text-center">Skor</span>
                <span className="w-10 text-center">Yakin</span>
                <span className="w-16 text-right">Tanggal</span>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {selectedCategory.students.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {selectedCategory.students.map((student, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 transition"
                      >
                        {/* Index */}
                        <span className="font-mono text-[9px] text-slate-400 w-7 text-right flex-shrink-0">
                          {idx + 1}
                        </span>

                        {/* Name */}
                        <div className="flex-1 min-w-0 ml-2">
                          <p className="text-[11px] font-semibold text-slate-800 truncate">
                            {student.user?.name || "—"}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate">
                            {getClassName(student)}
                          </p>
                        </div>

                        {/* Score */}
                        <span className={`font-mono text-[11px] font-bold w-10 text-center flex-shrink-0 ${
                          Number(student.score) < 60 ? "text-rose-600" : "text-slate-700"
                        }`}>
                          {student.score}
                        </span>

                        {/* Confidence */}
                        <div className="w-10 flex justify-center gap-px flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-3 rounded-full ${
                                i < student.confidence_level ? "bg-slate-600" : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Date */}
                        <span className="font-mono text-[9px] text-slate-400 w-16 text-right flex-shrink-0">
                          {student.created_at
                            ? new Date(student.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400">Tidak ada data.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-200 bg-white rounded-b-2xl">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold hover:bg-slate-200 transition border-none"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}