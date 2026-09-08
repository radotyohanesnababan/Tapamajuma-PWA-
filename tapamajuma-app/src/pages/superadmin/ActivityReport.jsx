import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileBarChart, 
  Users, 
  Presentation, 
  ArrowRight, 
  Download, 
  FileText, 
  Loader2,
  CircleSlashIcon,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ActivityReport() {
  usePageTitle("Laporan Aktivitas");
  const navigate = useNavigate();

  // --- State PDF Download ---
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStep, setDownloadStep] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // --- State Semester Selector ---
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(true);

  // Fetch daftar periode akademik saat mount
  useEffect(() => {
    api.get('/api/admin/activity-report/academic-periods')
      .then(res => {
        const data = res.data.data || [];
        setPeriods(data);
        // Auto-select semester yang sedang aktif
        const active = data.find(p => p.is_active);
        if (active) setSelectedPeriodId(active.id);
        else if (data.length > 0) setSelectedPeriodId(data[0].id);
      })
      .catch(err => console.error("Gagal mengambil periode akademik:", err))
      .finally(() => setIsLoadingPeriods(false));
  }, []);

  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);

  // Konfigurasi 6 Menu Laporan
  const reportMenus = [
    {
      id: "executive",
      title: "Ringkasan Eksekutif",
      description: "Metrik level sekolah, tren keaktifan total, dan rata-rata performa.",
      icon: <FileBarChart className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50",
      btnColor: "text-blue-600 hover:bg-blue-50",
      path: "executive" 
    },
    {
      id: "student",
      title: "Log Aktivitas Siswa",
      description: "Detail per individu siswa. Cek siapa yang rajin dan siapa yang pasif.",
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      bg: "bg-emerald-50",
      btnColor: "text-emerald-600 hover:bg-emerald-50",
      path: "students"
    },
    {
      id: "classes",
      title: "Rangkuman Aktivitas Per Kelas",
      description: "Laporan aktivitas siswa per kelas dan rangkuman performa tiap kelas.",
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      bg: "bg-purple-50",
      btnColor: "text-purple-600 hover:bg-purple-50",
      path: "classes"
    },
    {
      id: "teacher",
      title: "Rangkuman Aktivitas Guru",
      description: "Laporan aktivitas guru dan performa tiap guru.",
      icon: <FileText className="w-8 h-8 text-cyan-600" />,
      bg: "bg-cyan-50",
      btnColor: "text-cyan-600 hover:bg-cyan-50",
      path: "teachers"
    },
    {
      id: "session",
      title: "Efektivitas Sesi Guru",
      description: "Laporan sesi 'Self Study' terhadap guru",
      icon: <Presentation className="w-8 h-8 text-orange-600" />,
      bg: "bg-orange-50",
      btnColor: "text-orange-600 hover:bg-orange-50",
      path: "sessions"
    },
    {
      id: "morning_session",
      title: "Laporan Sesi Pagi",
      description: "Laporan sesi 'Self Study' terhadap siswa",
      icon: <CircleSlashIcon className="w-8 h-8 text-orange-600" />,
      bg: "bg-orange-50",
      btnColor: "text-orange-600 hover:bg-orange-50",
      path: "morning-sessions"
    }
  ];

  // Navigasi dengan period_id di-inject ke URL
  const handleMenuClick = (path) => {
    const query = selectedPeriodId ? `?period_id=${selectedPeriodId}` : '';
    navigate(path + query);
  };

  // --- FUNGSI DOWNLOAD PDF ---
  const handleDownloadFullReport = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStep('Menghubungkan ke server...');

    let currentProgress = 0;
    const steps = [
      { target: 15, label: 'Mengambil data siswa & aktivitas...', duration: 1500 },
      { target: 35, label: 'Memproses statistik per kelas...', duration: 2000 },
      { target: 55, label: 'Meminta analisis AI...', duration: 8000 },
      { target: 75, label: 'Menghasilkan analisis AI...', duration: 8000 },
      { target: 85, label: 'Menyusun halaman PDF...', duration: 3000 },
    ];

    const runSteps = async () => {
      for (const step of steps) {
        setDownloadStep(step.label);
        const increment = (step.target - currentProgress) / (step.duration / 100);
        await new Promise(resolve => {
          const interval = setInterval(() => {
            currentProgress = Math.min(currentProgress + increment, step.target);
            setDownloadProgress(Math.round(currentProgress));
            if (currentProgress >= step.target) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      }
    };

    runSteps(); // sengaja tidak di-await — jalan di background

    try {
      const params = new URLSearchParams();
      if (reportStartDate) params.append('start_date', reportStartDate);
      if (reportEndDate) params.append('end_date', reportEndDate);

      const response = await api.get(`/api/admin/activity-report/pdf?${params.toString()}`, {
        responseType: 'blob',
        timeout: 0,
      });

      setDownloadProgress(100);
      setDownloadStep('PDF siap, memulai unduhan...');

      await new Promise(r => setTimeout(r, 600));

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Lengkap_Tapamajuma_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Laporan berhasil diunduh!");

    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mengunduh laporan. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadStep('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pusat Laporan</h1>
        <p className="text-slate-500">Pilih jenis laporan yang ingin kamu analisis atau unduh.</p>
      </div>

      {/* === SEMESTER SELECTOR === */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-indigo-50 to-violet-50">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Icon + Label */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Filter Semester</p>
                <p className="text-sm font-semibold text-slate-700">
                  Data laporan akan ditampilkan sesuai semester ini
                </p>
              </div>
            </div>

            {/* Dropdown Semester */}
            <div className="sm:ml-auto flex items-center gap-3 flex-wrap">
              {isLoadingPeriods ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat semester...
                </div>
              ) : (
                <>
                  <div className="relative">
                    <select
                      id="semester-selector"
                      className="appearance-none h-10 pl-4 pr-10 rounded-xl border border-indigo-200 bg-white text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm outline-none transition-all min-w-[220px]"
                      value={selectedPeriodId ?? ''}
                      onChange={(e) => setSelectedPeriodId(Number(e.target.value))}
                    >
                      {periods.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.academic_year}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Badge Status */}
                  {selectedPeriod && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${
                      selectedPeriod.is_active
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {selectedPeriod.is_active ? '● Aktif / Berjalan' : '✓ Selesai'}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6 Menu Kartu Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportMenus.map((menu) => (
          <Card 
            key={menu.id} 
            className="border-none shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
            onClick={() => handleMenuClick(menu.path)}
          >
            <CardContent className="p-6 space-y-4">
              <div className={`w-16 h-16 rounded-2xl ${menu.bg} flex items-center justify-center mb-4`}>
                {menu.icon}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {menu.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {menu.description}
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-between group-hover:pl-4 transition-all ${menu.btnColor} font-bold`}
                >
                  Buka Laporan <ArrowRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section Cetak Laporan PDF — INDEPENDEN dari semester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-3 border-none shadow-sm bg-slate-900 text-white relative overflow-hidden">
          <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
            <h2 className="text-2xl font-bold mb-2">Butuh Laporan PDF?</h2>
            <p className="text-slate-300 mb-6 max-w-md">
              Unduh seluruh data aktivitas siswa dan performa kelas dalam format PDF.
              Filter tanggal bebas, tidak terikat semester.
            </p>
            
            {/* Filter Tanggal Inline (Tema Gelap) — Independen dari semester */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Dari Tanggal</label>
                <input 
                  type="date" 
                  className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto color-scheme-dark"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Sampai Tanggal</label>
                <input 
                  type="date" 
                  className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto color-scheme-dark"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDownloadFullReport}
                disabled={isDownloading}
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold min-w-[220px]"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? 'Memproses...' : 'Export Laporan PDF'}
              </Button>

              {/* Progress bar */}
              {isDownloading && (
                <div className="flex flex-col justify-center min-w-[240px] gap-1">
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-white transition-all duration-300 ease-out"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 truncate max-w-[190px]">
                      {downloadStep}
                    </span>
                    <span className="text-xs text-slate-300 font-mono ml-2 flex-shrink-0">
                      {downloadProgress}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Dekorasi */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 -mr-16 -mt-16 pointer-events-none"></div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}