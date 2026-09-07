import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { getStorageUrl } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Activity, BookOpen, Sparkles, Trophy, Target,
  Calendar, ChevronLeft, ChevronRight,
  Clock, Star, Volume2, FileText,
  ExternalLink, RefreshCw, Layers, Award,
  ArrowRight, BrainCircuit, Music,
  FileCheck, CheckCircle2, ChevronDown, FolderOpen
} from "lucide-react";
import { toast } from "sonner";

// ── Helper Warna & Label Tipe Aktivitas ───────────────────────────
const TYPE_CONFIG = {
  literacy: {
    label: "Literasi Digital",
    shortLabel: "Literasi",
    icon: BookOpen,
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    grad: "from-cyan-500 to-blue-600",
    pillBg: "bg-cyan-100 text-cyan-800",
  },
  numeracy: {
    label: "Numerasi Aktif",
    shortLabel: "Numerasi",
    icon: Activity,
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    grad: "from-indigo-500 to-violet-600",
    pillBg: "bg-indigo-100 text-indigo-800",
  },
  tka: {
    label: "TKA (HOTS)",
    shortLabel: "TKA HOTS",
    icon: BrainCircuit,
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    grad: "from-amber-500 to-orange-600",
    pillBg: "bg-amber-100 text-amber-800",
  },
};

const getScoreColor = (score) => {
  const num = Number(score) || 0;
  if (num >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (num >= 70) return "text-indigo-600 bg-indigo-50 border-indigo-200";
  if (num >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-rose-600 bg-rose-50 border-rose-200";
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
};

export default function StudentActivityLog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── States Utama ────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Summary & Semester Stats
  const [summary, setSummary] = useState({
    total_activities: 0,
    average_score: 0,
    total_galleries: 0,
    type_counts: { literacy: 0, numeracy: 0, tka: 0 },
    average_confidence: 0,
  });
  const [semesterStats, setSemesterStats] = useState([]);
  const [academicPeriods, setAcademicPeriods] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  // Modal Detail Semester State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null); // null = semua, or object period
  const [modalTab, setModalTab] = useState("latihan");
  const [modalLoading, setModalLoading] = useState(false);

  // Filter di dalam Modal
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Data Kegiatan Latihan (Paginasi 20)
  const [activities, setActivities] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityLastPage, setActivityLastPage] = useState(1);
  const [totalActivitiesFiltered, setTotalActivitiesFiltered] = useState(0);

  // Data Galeri (Paginasi 20)
  const [galleries, setGalleries] = useState([]);
  const [galleryPage, setGalleryPage] = useState(1);
  const [galleryLastPage, setGalleryLastPage] = useState(1);
  const [totalGalleriesFiltered, setTotalGalleriesFiltered] = useState(0);

  // ── Fetch Data Ringkasan Awal ───────────────────────────────────
  const fetchSummaryData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/api/student/activity-logs?per_page=1&gallery_per_page=1");
      const data = res.data;

      setSummary(data.summary || {
        total_activities: 0,
        average_score: 0,
        total_galleries: 0,
        type_counts: { literacy: 0, numeracy: 0, tka: 0 },
        average_confidence: 0,
      });

      setSemesterStats(data.semester_stats || []);
      setAcademicPeriods(data.academic_periods || []);
      setSubjectsList(data.subjects || []);
    } catch (err) {
      console.error("Gagal memuat ringkasan aktivitas:", err);
      toast.error("Gagal memuat data riwayat kegiatan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "student") {
      fetchSummaryData();
    }
  }, [user, fetchSummaryData]);

  // ── Fetch Detail Activities & Galleries per Semester (Paginasi 20) ─
  const fetchModalData = useCallback(async () => {
    setModalLoading(true);
    try {
      const params = new URLSearchParams({
        per_page: 20,
        gallery_per_page: 20,
        page: activityPage,
        gallery_page: galleryPage,
      });

      if (selectedSemester && selectedSemester.id) {
        params.append("academic_period_id", selectedSemester.id);
      }

      if (selectedType !== "all") {
        params.append("type", selectedType);
      }

      if (selectedSubject !== "all") {
        params.append("subject", selectedSubject);
      }

      const res = await api.get(`/api/student/activity-logs?${params.toString()}`);
      const data = res.data;

      if (data.activities) {
        setActivities(data.activities.data || []);
        setActivityLastPage(data.activities.last_page || 1);
        setTotalActivitiesFiltered(data.activities.total || 0);
      }

      if (data.galleries) {
        setGalleries(data.galleries.data || []);
        setGalleryLastPage(data.galleries.last_page || 1);
        setTotalGalleriesFiltered(data.galleries.total || 0);
      }

      if (data.subjects && data.subjects.length > 0) {
        setSubjectsList(data.subjects);
      }
    } catch (err) {
      console.error("Gagal memuat detail kegiatan semester:", err);
      toast.error("Gagal memuat data kegiatan.");
    } finally {
      setModalLoading(false);
    }
  }, [selectedSemester, selectedType, selectedSubject, activityPage, galleryPage]);

  useEffect(() => {
    if (isModalOpen) {
      fetchModalData();
    }
  }, [isModalOpen, fetchModalData]);

  // ── Handler Klik Semester ───────────────────────────────────────
  const handleOpenSemesterModal = (periodObj) => {
    setSelectedSemester(periodObj);
    setSelectedType("all");
    setSelectedSubject("all");
    setActivityPage(1);
    setGalleryPage(1);
    setModalTab("latihan");
    setIsModalOpen(true);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setActivityPage(1);
  };

  const handleSubjectChange = (subjectName) => {
    setSelectedSubject(subjectName);
    setActivityPage(1);
  };

  // ── RENDER LOADING ──────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <div className="space-y-6 pt-2 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="w-32 h-6 bg-slate-200 rounded-md" />
            <div className="w-48 h-3.5 bg-slate-200 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="w-8 h-8 bg-slate-200 rounded-lg" />
              <div className="w-16 h-5 bg-slate-200 rounded-md" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-100 rounded-2xl p-4" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {/* ══════════════════════════════════════════════════════════
          1. HEADER
      ══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/student/other")}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
            title="Kembali ke Menu Lainnya"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-slate-800 tracking-tight">
                Riwayat Kegiatan
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Activity size={12} /> Log Siswa
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Pantau progress latihan dan karya per semester
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchSummaryData(true)}
          disabled={refreshing}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
          title="Segarkan Data"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin text-indigo-600" : ""} />
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. METRIC / SUMMARY CARDS
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Latihan */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
          <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Latihan
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800 font-display">
                {summary.total_activities}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Kegiatan dikerjakan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nilai Rata-rata */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
          <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Trophy size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Rata-rata
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-indigo-600 font-display flex items-baseline gap-1">
                {summary.average_score}
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Nilai keseluruhan
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Galeri */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Galeri
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800 font-display">
                {summary.total_galleries}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Karya diunggah
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tingkat Keyakinan */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
          <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Target size={18} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Keyakinan
              </span>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-600 font-display flex items-baseline gap-1">
                {summary.average_confidence}
                <span className="text-xs font-semibold text-slate-400">/ 5 ★</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Rata-rata kepercayaan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. DAFTAR CAPAIAN PER SEMESTER (CLICKABLE CARDS)
      ══════════════════════════════════════════════════════════ */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar size={15} />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-slate-800">
                Capaian per Semester
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Klik semester untuk melihat riwayat latihan & galeri
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {semesterStats.length} Periode
          </span>
        </div>

        <div className="p-4 space-y-3">
          {semesterStats.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-medium">
              Belum ada periode semester yang terdaftar.
            </div>
          ) : (
            semesterStats.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOpenSemesterModal(item)}
                className={`w-full text-left p-4 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm hover:shadow-md ${
                  item.is_active
                    ? "bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 border-indigo-200"
                    : "bg-slate-50/70 hover:bg-white border-slate-200/80"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {item.name || `Semester ${item.semester} (${item.academic_year})`}
                    </span>
                    {item.is_active && (
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 font-bold text-xs">
                    <span>Lihat Rincian</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Progress Bar Visual Nilai */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Rata-rata Nilai:</span>
                    <span className="font-extrabold font-display text-indigo-600">
                      {item.average_score} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.average_score >= 80
                          ? "bg-emerald-500"
                          : item.average_score >= 70
                          ? "bg-indigo-500"
                          : item.average_score >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, item.average_score))}%` }}
                    />
                  </div>
                </div>

                {/* Statistik Latihan & Galeri */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center gap-1.5 font-medium">
                    <BookOpen size={13} className="text-cyan-600" />
                    <b>{item.activities_count}</b> Latihan Soal
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles size={13} className="text-amber-500" />
                    <b>{item.galleries_count}</b> Karya Galeri
                  </span>
                </div>
              </button>
            ))
          )}

          {/* Tombol Lihat Semua Semester */}
          <button
            onClick={() => handleOpenSemesterModal(null)}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/50 text-indigo-600 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Layers size={15} /> Lihat Semua Riwayat (Semua Semester)
          </button>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════
          4. MODAL DETAIL RIWAYAT LATIHAN & GALERI (PAGINASI 20)
      ══════════════════════════════════════════════════════════ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 bg-white border border-slate-200 shadow-2xl">
          <DialogHeader className="text-left space-y-1 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {selectedSemester ? "Rincian Semester" : "Semua Semester"}
              </span>
              {selectedSemester?.is_active && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                  Aktif
                </span>
              )}
            </div>
            <DialogTitle className="text-lg font-bold text-slate-800 font-display">
              {selectedSemester?.name || "Riwayat Lengkap Aktivitas Siswa"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {selectedSemester
                ? `Rata-rata Nilai: ${selectedSemester.average_score} • ${selectedSemester.activities_count} Latihan • ${selectedSemester.galleries_count} Galeri`
                : "Menampilkan seluruh riwayat latihan soal dan galeri karya yang telah dikerjakan."}
            </DialogDescription>
          </DialogHeader>

          {/* Modal Tabs: Latihan & Galeri */}
          <Tabs defaultValue="latihan" value={modalTab} onValueChange={setModalTab} className="space-y-4 pt-2">
            <TabsList className="w-full grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger
                value="latihan"
                className="rounded-lg text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
              >
                <BookOpen size={14} /> Riwayat Latihan
              </TabsTrigger>
              <TabsTrigger
                value="galeri"
                className="rounded-lg text-xs font-bold py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} /> Riwayat Galeri
              </TabsTrigger>
            </TabsList>

            {/* ──────────────────────────────────────────────────
                TAB LATIHAN DALAM MODAL (PAGINASI 20)
            ────────────────────────────────────────────────── */}
            <TabsContent value="latihan" className="space-y-4 m-0">
              {/* Filter Pills Tipe */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => handleTypeChange("all")}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedType === "all"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Semua Tipe
                </button>
                <button
                  onClick={() => handleTypeChange("literacy")}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                    selectedType === "literacy"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100"
                  }`}
                >
                  <BookOpen size={12} /> Literasi
                </button>
                <button
                  onClick={() => handleTypeChange("numeracy")}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                    selectedType === "numeracy"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                  }`}
                >
                  <Activity size={12} /> Numerasi
                </button>
                <button
                  onClick={() => handleTypeChange("tka")}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                    selectedType === "tka"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <BrainCircuit size={12} /> TKA HOTS
                </button>
              </div>

              {/* Filter Dropdown Mata Pelajaran */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Filter Mata Pelajaran:
                </label>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="all">Semua Mata Pelajaran</option>
                    {subjectsList.map((subName, index) => (
                      <option key={index} value={subName}>
                        {subName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Status Jumlah Data */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
                <span>Ditemukan {totalActivitiesFiltered} kegiatan latihan</span>
                <span>Paginasi 20 per halaman</span>
              </div>

              {/* List Data Latihan */}
              {modalLoading ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw size={24} className="animate-spin text-indigo-500 mx-auto" />
                  <p className="text-xs font-medium">Memuat riwayat latihan...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FolderOpen size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Belum ada data latihan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tidak ditemukan riwayat latihan dengan filter yang dipilih.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((act) => {
                    const config = TYPE_CONFIG[act.type] || TYPE_CONFIG.numeracy;
                    const IconComponent = config.icon;

                    return (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow transition-all space-y-2.5"
                      >
                        {/* Baris Atas: Badge Tipe, Mapel, & Skor */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeBg}`}>
                              <IconComponent size={12} />
                              {config.shortLabel}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                              {act.subject || "Umum"}
                            </span>
                          </div>

                          <div className={`px-2.5 py-0.5 rounded-lg font-display font-extrabold text-xs border ${getScoreColor(act.score)}`}>
                            Nilai: {act.score ?? 100}
                          </div>
                        </div>

                        {/* Baris Tengah: Tanggal & Keyakinan */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={12} />
                            {formatDate(act.created_at)}
                          </span>

                          {act.confidence_level && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">Yakin:</span>
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={11}
                                    className={i < act.confidence_level ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Catatan Jurnal */}
                        {act.journal && (
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[11px] text-slate-600 italic flex items-start gap-2">
                            <FileText size={13} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="line-clamp-2">"{act.journal}"</p>
                          </div>
                        )}

                        {/* Audio jika ada */}
                        {act.audio_path && (
                          <div className="bg-cyan-50/70 border border-cyan-100 rounded-xl p-2 flex items-center gap-2">
                            <Volume2 size={14} className="text-cyan-600 shrink-0" />
                            <audio controls className="w-full h-7 scale-90 origin-left" src={getStorageUrl(act.audio_path)} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Paginasi 20 Latihan */}
                  {activityLastPage > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                        disabled={activityPage === 1 || modalLoading}
                        className="rounded-xl text-xs font-semibold h-8"
                      >
                        <ChevronLeft size={14} className="mr-1" /> Sebelumnya
                      </Button>

                      <span className="text-xs text-slate-500 font-medium">
                        Halaman <b>{activityPage}</b> dari <b>{activityLastPage}</b>
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActivityPage((p) => Math.min(activityLastPage, p + 1))}
                        disabled={activityPage === activityLastPage || modalLoading}
                        className="rounded-xl text-xs font-semibold h-8"
                      >
                        Selanjutnya <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ──────────────────────────────────────────────────
                TAB GALERI DALAM MODAL (PAGINASI 20)
            ────────────────────────────────────────────────── */}
            <TabsContent value="galeri" className="space-y-4 m-0">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
                <span>Ditemukan {totalGalleriesFiltered} karya di galeri</span>
                <span>Paginasi 20 per halaman</span>
              </div>

              {modalLoading ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw size={24} className="animate-spin text-amber-500 mx-auto" />
                  <p className="text-xs font-medium">Memuat galeri karya...</p>
                </div>
              ) : galleries.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <FolderOpen size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Belum ada karya di semester ini</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Unggah karya kreatifmu di menu Galeri!
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate("/student/galeri");
                    }}
                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold h-8"
                  >
                    Buka Galeri <ArrowRight size={13} className="ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {galleries.map((item) => {
                      const isImage = item.file_type === "image";
                      const isAudio = item.file_type === "audio";
                      const isPdf = item.file_type === "pdf";

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow transition-all overflow-hidden flex flex-col"
                        >
                          <div className="relative h-28 bg-slate-100 flex items-center justify-center overflow-hidden">
                            {isImage && item.file_path ? (
                              <img
                                src={getStorageUrl(item.file_path)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/400x200/f1f5f9/94a3b8?text=Gambar+Karya";
                                }}
                              />
                            ) : isAudio ? (
                              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Music size={20} />
                              </div>
                            ) : isPdf ? (
                              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                <FileCheck size={20} />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                                <ExternalLink size={20} />
                              </div>
                            )}

                            <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900/70 text-white backdrop-blur-sm">
                              {item.file_type || "Link"}
                            </span>
                          </div>

                          <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1">
                                {item.subject?.name || "Umum"}
                              </span>
                              <h4 className="font-display text-xs font-bold text-slate-800 line-clamp-1">
                                {item.title}
                              </h4>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                              <span>{formatDate(item.created_at)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIsModalOpen(false);
                                  navigate("/student/galeri");
                                }}
                                className="h-6 px-1.5 text-indigo-600 hover:text-indigo-700 text-[11px] font-bold"
                              >
                                Galeri <ArrowRight size={11} className="ml-0.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Paginasi 20 Galeri */}
                  {galleryLastPage > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGalleryPage((p) => Math.max(1, p - 1))}
                        disabled={galleryPage === 1 || modalLoading}
                        className="rounded-xl text-xs font-semibold h-8"
                      >
                        <ChevronLeft size={14} className="mr-1" /> Sebelumnya
                      </Button>

                      <span className="text-xs text-slate-500 font-medium">
                        Halaman <b>{galleryPage}</b> dari <b>{galleryLastPage}</b>
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGalleryPage((p) => Math.min(galleryLastPage, p + 1))}
                        disabled={galleryPage === galleryLastPage || modalLoading}
                        className="rounded-xl text-xs font-semibold h-8"
                      >
                        Selanjutnya <ChevronRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
