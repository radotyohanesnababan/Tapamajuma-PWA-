import { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar, Download, TrendingUp, BookOpen, Users, BarChart2,
  Sparkles, RefreshCw, Printer, Search, School as SchoolIcon,
  ChevronRight, Award, AlertTriangle, CheckCircle2, Info, Building2,
  Phone, UserCheck, ArrowUpDown, ChevronDown, Check, ArrowUpRight,
  PieChart as PieIcon, Activity, Flame
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { toast } from "sonner";
import devApi from "@/lib/devAxios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STATUS_CONFIG = {
  sangat_aktif: {
    label: "Sangat Aktif",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    barColor: "#10b981",
  },
  aktif: {
    label: "Aktif",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    barColor: "#3b82f6",
  },
  perlu_perhatian: {
    label: "Perlu Perhatian",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    barColor: "#f59e0b",
  },
  pasif: {
    label: "Pasif",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    barColor: "#f43f5e",
  },
};

const CHART_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];

export default function DistrictReport() {
  // Rentang Tanggal
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [activePreset, setActivePreset] = useState("this_month");

  // State Data
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // State AI Executive Summary
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // State Filter & Search Tabel
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("adoption_rate"); // adoption_rate | total_students | total_activities

  // State Drilldown Modal
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolDetail, setSchoolDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch Report Data
  const fetchReport = async (s = startDate, e = endDate) => {
    setLoading(true);
    try {
      const res = await devApi.get("/api/developer/reports/district-summary", {
        params: { start_date: s, end_date: e },
      });
      setReport(res.data.data);
    } catch (err) {
      toast.error("Gagal mengambil laporan: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI Summary
  const fetchAiSummary = async (s = startDate, e = endDate) => {
    setLoadingAi(true);
    try {
      const res = await devApi.post("/api/developer/reports/district-ai-summary", {
        start_date: s,
        end_date: e,
      });
      setAiSummary(res.data.data);
      toast.success("Analisis Eksekutif AI berhasil disintesis!");
    } catch (err) {
      toast.error("Gagal memproses analisis AI: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAi(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchReport();
  }, []);

  // Handle Preset Cepat
  const applyPreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    let s = "";
    let e = now.toISOString().split("T")[0];

    if (preset === "7d") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      s = d.toISOString().split("T")[0];
    } else if (preset === "30d") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      s = d.toISOString().split("T")[0];
    } else if (preset === "this_month") {
      const d = new Date();
      d.setDate(1);
      s = d.toISOString().split("T")[0];
    } else if (preset === "last_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      s = firstDay.toISOString().split("T")[0];
      e = lastDay.toISOString().split("T")[0];
    } else {
      return; // custom
    }

    setStartDate(s);
    setEndDate(e);
    fetchReport(s, e);
  };

  // Open Drilldown Modal
  const openSchoolDetail = async (school) => {
    setSelectedSchool(school);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const res = await devApi.get(`/api/developer/reports/district-school/${school.id}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      setSchoolDetail(res.data.data);
    } catch (err) {
      toast.error("Gagal mengambil rincian sekolah: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingDetail(false);
    }
  };

  // Export CSV
  const exportToCSV = () => {
    if (!report || !report.schools?.length) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const headers = [
      "Peringkat",
      "Nama Sekolah",
      "Slug",
      "Kepala Sekolah",
      "Telepon",
      "Total Siswa",
      "Siswa Aktif",
      "Tingkat Adopsi (%)",
      "Total Aktivitas",
      "Literasi",
      "Numerasi",
      "TKA",
      "Karya Galeri",
      "Refleksi",
      "Status",
    ];

    const rows = report.schools.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      s.slug,
      `"${s.principal_name || '-'}"`,
      `"${s.phone || '-'}"`,
      s.total_students,
      s.active_students,
      `${s.adoption_rate}%`,
      s.total_activities,
      s.literacy,
      s.numeracy,
      s.tka,
      s.galleries,
      s.reflections,
      STATUS_CONFIG[s.status]?.label || s.status,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Daerah_Tapamajuma_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV berhasil diunduh");
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Filtered and Sorted Schools
  const filteredSchools = useMemo(() => {
    if (!report?.schools) return [];
    return report.schools
      .filter((s) => {
        const matchSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || s.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "adoption_rate") return b.adoption_rate - a.adoption_rate;
        if (sortBy === "total_students") return b.total_students - a.total_students;
        if (sortBy === "total_activities") return b.total_activities - a.total_activities;
        return 0;
      });
  }, [report, searchQuery, statusFilter, sortBy]);

  // Data Distribusi Aktivitas untuk PieChart
  const activityDistributionData = useMemo(() => {
    if (!report?.totals) return [];
    return [
      { name: "Literasi", value: report.totals.literacy },
      { name: "Numerasi", value: report.totals.numeracy },
      { name: "TKA / Akademik", value: report.totals.tka },
      { name: "Karya Galeri", value: report.totals.galleries },
      { name: "Refleksi", value: report.totals.reflections },
    ].filter((item) => item.value > 0);
  }, [report]);

  // Top 8 Sekolah untuk BarChart Komparasi
  const topSchoolsChartData = useMemo(() => {
    if (!report?.schools) return [];
    return report.schools.slice(0, 8).map((s) => ({
      name: s.name.length > 15 ? s.name.substring(0, 15) + "…" : s.name,
      fullName: s.name,
      adoption: s.adoption_rate,
      activities: s.total_activities,
    }));
  }, [report]);

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside, nav, header, button, .print\\:hidden {
            display: none !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            overflow: visible !important;
          }
        }
      `}</style>
      {/* Header & Print Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">Laporan Wilayah & Stakeholder</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Executive View
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Rekapitulasi komprehensif keaktifan platform, evaluasi pembelajaran, dan analisis AI se-kabupaten
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={!report || loading}
            className="h-10 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Unduh file CSV"
          >
            <Download size={15} />
            Ekspor CSV
          </button>
          <button
            onClick={handlePrint}
            disabled={!report || loading}
            className="h-10 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Cetak format dinas resmi"
          >
            <Printer size={15} />
            Cetak / PDF
          </button>
          <button
            onClick={() => fetchReport()}
            disabled={loading}
            className="h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-violet-600/20"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Menyinkronkan…" : "Segarkan"}
          </button>
        </div>
      </div>

      {/* Printable Official Header (Hanya muncul saat print) */}
      <div className="hidden print:block border-b-2 border-black pb-4 text-center">
        <h2 className="text-lg font-black uppercase tracking-wider text-black">
          PEMERINTAH KABUPATEN / DINAS PENDIDIKAN
        </h2>
        <h1 className="text-xl font-bold uppercase text-black mt-1">
          LAPORAN KINERJA PEMBELAJARAN DIGITAL SISWA (TAPAMAJUMA)
        </h1>
        <p className="text-xs text-gray-700 mt-1">
          Periode Evaluasi: {report?.period?.start} s.d. {report?.period?.end} | Dicetak pada:{" "}
          {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Filter Bar & Preset Cepat */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <Calendar size={13} /> Preset:
            </span>
            {[
              { id: "this_month", label: "Bulan Ini" },
              { id: "7d", label: "7 Hari Terakhir" },
              { id: "30d", label: "30 Hari Terakhir" },
              { id: "last_month", label: "Bulan Lalu" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activePreset === p.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range Picker */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-semibold">Rentang:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset("custom");
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <span className="text-xs text-slate-600">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset("custom");
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
            <button
              onClick={() => fetchReport(startDate, endDate)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>

      {/* AI Executive Briefing Widget (Powered by Gemini) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-950/40 via-slate-900 to-slate-900 border border-violet-500/30 rounded-2xl p-6 shadow-xl print:border-black print:bg-white print:text-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 print:border-black pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30 print:hidden">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-100 print:text-black tracking-tight">
                  Analisis Eksekutif Cerdas (AI Policy & Executive Synthesis)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 print:border-black print:text-black">
                  Powered by Gemini
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-gray-600 mt-0.5">
                Simplifikasi otomatis data daerah menjadi ringkasan strategis untuk Pimpinan & Pengawas Dinas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => fetchAiSummary()}
              disabled={loadingAi || loading}
              className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-violet-600/30 disabled:opacity-50"
            >
              <Sparkles size={14} className={loadingAi ? "animate-spin" : ""} />
              {loadingAi ? "Menyintesis AI…" : aiSummary ? "Perbarui Analisis AI" : "Muat Analisis AI Wilayah"}
            </button>
          </div>
        </div>

        {/* Konten AI */}
        {loadingAi ? (
          <div className="py-10 text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-violet-500/10 text-violet-400 animate-spin">
              <Sparkles size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-300">Gemini sedang menyintesis data se-kabupaten…</p>
            <p className="text-xs text-slate-500">Mengkaji tren partisipasi, rasio literasi/numerasi, dan merumuskan rekomendasi kebijakan.</p>
          </div>
        ) : aiSummary ? (
          <div className="mt-5 space-y-5">
            {/* Skor Kesehatan & Narasi Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 print:bg-gray-100 border border-slate-800/80 print:border-black rounded-xl p-4 flex flex-col justify-center items-center text-center">
                <span className="text-xs font-bold text-slate-400 print:text-black uppercase tracking-wider">Indeks Wilayah</span>
                <div className="text-3xl font-black text-violet-400 print:text-black mt-1">
                  {aiSummary.health_score ?? 85}<span className="text-sm text-slate-500">/100</span>
                </div>
                <span className="mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 print:border-black print:text-black">
                  {aiSummary.health_label ?? "Baik"}
                </span>
              </div>
              <div className="md:col-span-3 bg-slate-950/40 print:bg-transparent border border-slate-800/80 print:border-0 rounded-xl p-4 flex items-center">
                <p className="text-sm leading-relaxed text-slate-200 print:text-black">
                  {aiSummary.executive_summary}
                </p>
              </div>
            </div>

            {/* 3 Kolom Insight: Sorotan, Titik Perhatian, Rekomendasi Kebijakan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Highlights */}
              <div className="bg-slate-950/40 print:bg-gray-50 border border-slate-800/60 print:border-black rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-400 print:text-black" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-black">Capaian Positif</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 print:text-black">
                  {aiSummary.key_highlights?.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 print:text-black font-black">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attention Areas */}
              <div className="bg-slate-950/40 print:bg-gray-50 border border-slate-800/60 print:border-black rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-amber-400 print:text-black" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-black">Area Supervisi Dinas</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 print:text-black">
                  {aiSummary.attention_areas?.map((a, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 print:text-black font-black">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Policy Recommendations */}
              <div className="bg-slate-950/40 print:bg-gray-50 border border-slate-800/60 print:border-black rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={16} className="text-violet-400 print:text-black" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 print:text-black">Rekomendasi Taktis</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 print:text-black">
                  {aiSummary.policy_recommendations?.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-violet-400 print:text-black">{i + 1}.</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 bg-slate-950/40 rounded-xl p-4 border border-slate-800/60">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-violet-400 shrink-0" />
              <span>
                Klik tombol <strong>&quot;Muat Analisis AI Wilayah&quot;</strong> untuk menghasilkan narasi ringkasan eksekutif, analisis kendala sekolah, dan rekomendasi aksi kebijakan otomatis menggunakan Google Gemini.
              </span>
            </div>
            <button
              onClick={() => fetchAiSummary()}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold shrink-0 transition-colors"
            >
              Mulai Analisis
            </button>
          </div>
        )}
      </div>

      {report && (
        <>
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between print:border-black print:bg-white print:text-black">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Adopsi Daerah</span>
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-slate-100 print:text-black">
                  {report.average_adoption_rate}%
                </h3>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden print:hidden">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, report.average_adoption_rate)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between print:border-black print:bg-white print:text-black">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Siswa Aktif</span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Users size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-slate-100 print:text-black">
                  {report.totals.active_students?.toLocaleString("id-ID")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  dari {report.totals.students?.toLocaleString("id-ID")} total siswa
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between print:border-black print:bg-white print:text-black">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aktivitas Belajar</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <BookOpen size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-slate-100 print:text-black">
                  {report.totals.activities?.toLocaleString("id-ID")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {report.totals.literacy} Literasi · {report.totals.numeracy} Numerasi
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between print:border-black print:bg-white print:text-black">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guru Terlibat</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <UserCheck size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-slate-100 print:text-black">
                  {report.totals.active_teachers?.toLocaleString("id-ID")}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  dari {report.totals.teachers?.toLocaleString("id-ID")} guru sekolah
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between col-span-2 md:col-span-1 print:border-black print:bg-white print:text-black">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sekolah Aktif</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <SchoolIcon size={16} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-black text-slate-100 print:text-black">
                  {report.totals.active_schools}
                  <span className="text-sm font-normal text-slate-500"> / {report.totals.total_schools}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {report.totals.inactive_schools} sekolah belum aktif
                </p>
              </div>
            </div>
          </div>

          {/* Visual Analytics Section (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
            {/* Tren Harian Aktivitas Se-Daerah */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Tren Aktivitas Pembelajaran Harian</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Fluktuasi volume belajar seluruh siswa se-kabupaten</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-violet-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" /> Total
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Literasi
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Numerasi
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                {report.timeline?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="#64748b"
                        fontSize={11}
                        tickFormatter={(v) => v.split("-").slice(1).join("/")}
                      />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Area type="monotone" dataKey="activities" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorTotal)" name="Total Aktivitas" />
                      <Area type="monotone" dataKey="literacy" stroke="#3b82f6" strokeWidth={2} fill="url(#colorLit)" name="Literasi" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Belum ada data timeline pada rentang tanggal ini
                  </div>
                )}
              </div>
            </div>

            {/* Komposisi Jenis Pembelajaran */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Komposisi Pembelajaran</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sebaran tipe aktivitas belajar siswa</p>
              </div>

              <div className="h-52 w-full my-auto">
                {activityDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {activityDistributionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Belum ada aktivitas
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                {activityDistributionData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="text-slate-400 truncate">{item.name}:</span>
                    <span className="font-bold text-slate-200 ml-auto">{item.value.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabel Rekapitulasi & Peringkat Sekolah */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden print:border-black print:bg-white">
            {/* Header & Filter Tabel */}
            <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-black">
              <div>
                <h3 className="text-sm font-bold text-slate-200 print:text-black">
                  Peringkat & Kinerja Sekolah se-Kabupaten
                </h3>
                <p className="text-xs text-slate-500 print:text-gray-700 mt-0.5">
                  Menampilkan {filteredSchools.length} dari {report.schools?.length} sekolah
                </p>
              </div>

              {/* Controls: Search, Status Filter, Sort */}
              <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari sekolah..."
                    className="h-9 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500 w-44"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="sangat_aktif">Sangat Aktif (≥75%)</option>
                  <option value="aktif">Aktif (50-74%)</option>
                  <option value="perlu_perhatian">Perlu Perhatian (25-49%)</option>
                  <option value="pasif">Pasif (&lt;25%)</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="adoption_rate">Urut: Adopsi Tertinggi</option>
                  <option value="total_activities">Urut: Aktivitas Terbanyak</option>
                  <option value="total_students">Urut: Populasi Siswa</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm print:text-black">
                <thead>
                  <tr className="border-b border-slate-800 print:border-black text-[11px] font-bold text-slate-500 print:text-black uppercase tracking-wider bg-slate-950/40 print:bg-gray-100">
                    <th className="px-5 py-3 w-12 text-center">#</th>
                    <th className="px-5 py-3">Nama Sekolah</th>
                    <th className="px-4 py-3 text-right">Populasi</th>
                    <th className="px-4 py-3 text-right">Siswa Aktif</th>
                    <th className="px-5 py-3 text-left w-44">Tingkat Adopsi</th>
                    <th className="px-4 py-3 text-right">Literasi</th>
                    <th className="px-4 py-3 text-right">Numerasi</th>
                    <th className="px-4 py-3 text-right">Total Aktivitas</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-black">
                  {filteredSchools.length > 0 ? (
                    filteredSchools.map((s, idx) => {
                      const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pasif;
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-800/30 transition-colors print:hover:bg-transparent"
                        >
                          <td className="px-5 py-3.5 text-center font-black text-slate-600 print:text-black text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-200 print:text-black text-sm">{s.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 print:text-gray-600">
                              <span>KS: {s.principal_name || "-"}</span>
                              <span>•</span>
                              <span className="font-mono text-[10px]">{s.slug}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-medium text-slate-300 print:text-black">
                            {s.total_students}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-100 print:text-black">
                            {s.active_students}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-black text-slate-200 print:text-black">{s.adoption_rate}%</span>
                            </div>
                            <div className="w-full bg-slate-800 print:bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, s.adoption_rate)}%`,
                                  backgroundColor: cfg.barColor,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right text-xs text-blue-400 print:text-black font-semibold">
                            {s.literacy}
                          </td>
                          <td className="px-4 py-3.5 text-right text-xs text-emerald-400 print:text-black font-semibold">
                            {s.numeracy}
                          </td>
                          <td className="px-4 py-3.5 text-right font-black text-slate-100 print:text-black">
                            {s.total_activities?.toLocaleString("id-ID")}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider whitespace-nowrap ${cfg.badge} print:border-black print:text-black`}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center print:hidden">
                            <button
                              onClick={() => openSchoolDetail(s)}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              Rincian
                              <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-xs text-slate-500">
                        Tidak ada sekolah yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signature Endorsement Block (Hanya muncul saat print) */}
            <div className="hidden print:grid grid-cols-2 gap-10 pt-16 px-10 text-center text-xs text-black">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold mt-1">Koordinator Pengawas Pendidikan</p>
                <div className="h-20" />
                <p className="font-bold underline">_________________________</p>
                <p>NIP. ........................................</p>
              </div>
              <div>
                <p>Kabupaten, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="font-bold mt-1">Kepala Dinas Pendidikan</p>
                <div className="h-20" />
                <p className="font-bold underline">_________________________</p>
                <p>NIP. ........................................</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Drill-Down Modal Rincian Sekolah */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 p-6 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                <SchoolIcon size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-100">
                  {selectedSchool?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Rincian partisipasi kelas dan aktivitas periode {startDate} s/d {endDate}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {loadingDetail ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-violet-400" />
              Mengambil rincian data sekolah…
            </div>
          ) : schoolDetail ? (
            <div className="space-y-6 mt-4">
              {/* Profil & Kontak Singkat */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Kepala Sekolah</span>
                  <span className="text-slate-200 font-bold">{schoolDetail.school.principal_name || "-"}</span>
                  {schoolDetail.school.principal_nip && (
                    <span className="text-[11px] text-slate-500 block">NIP: {schoolDetail.school.principal_nip}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Kontak / Telepon</span>
                  <span className="text-slate-200 font-bold">{schoolDetail.school.phone || "-"}</span>
                  <span className="text-[11px] text-slate-500 block">{schoolDetail.school.email || "-"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold block">Alamat</span>
                  <span className="text-slate-300">{schoolDetail.school.address || "-"}</span>
                </div>
              </div>

              {/* Rincian Partisipasi Kelas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Users size={14} className="text-violet-400" /> Partisipasi Antar Kelas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {schoolDetail.classes?.length > 0 ? (
                    schoolDetail.classes.map((c, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3">
                        <p className="font-bold text-sm text-slate-200">{c.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{c.total_students} Siswa</p>
                        {c.activities > 0 && (
                          <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                            {c.activities} Aktivitas
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 col-span-3 py-3">Belum ada kelas terdata</p>
                  )}
                </div>
              </div>

              {/* Top Mata Pelajaran */}
              {schoolDetail.top_subjects?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-blue-400" /> Mata Pelajaran Teraktif
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {schoolDetail.top_subjects.map((sub, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold flex items-center gap-2"
                      >
                        {sub.subject}
                        <span className="bg-blue-500/20 px-1.5 py-0.5 rounded text-[10px] font-black">
                          {sub.total}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Aktivitas Terbaru */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-400" /> Log Aktivitas Terakhir
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {schoolDetail.recent_activities?.length > 0 ? (
                    schoolDetail.recent_activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-200">{act.student_name}</span>
                          {act.student_class && (
                            <span className="text-slate-500 ml-2">Kelas {act.student_class}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300 capitalize">
                            {act.type}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(act.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-3">Belum ada aktivitas pada periode ini</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
