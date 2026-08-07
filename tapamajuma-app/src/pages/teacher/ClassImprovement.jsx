import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, MessageSquareQuote, GalleryHorizontal,
  ArrowRight, Zap, Heart, Sparkles, Star,
  Printer, ChevronRight, LayoutGrid, Activity,
  TrendingUp, MessageCircle, Image, FileText
} from "lucide-react";

// ── MENU DEFINITION ──
const MENUS = [
  {
    title: "Analisis Siswa",
    desc: "Statistik performa, grafik nilai, dan perkembangan kompetensi.",
    icon: TrendingUp,
    path: "/teacher/class-improvement/analysis",
    tags: ["Grafik Nilai", "Status Akurasi"],
    accent: "text-emerald-600",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    title: "Forum Refleksi",
    desc: "Umpan balik tantangan belajar dan target perbaikan siswa.",
    icon: MessageCircle,
    path: "/teacher/class-improvement/reflection",
    tags: ["Feedback Guru", "Peer Support"],
    accent: "text-indigo-600",
    accentBg: "bg-indigo-50",
    accentBorder: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  {
    title: "Galeri Siswa",
    desc: "Apresiasi karya kreatif dan publikasi hasil belajar.",
    icon: Image,
    path: "/teacher/class-improvement/gallery",
    tags: ["Publikasi", "Karya Kreatif"],
    accent: "text-amber-600",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    dot: "bg-amber-500",
  },
  {
    title: "Cetak Nilai Keaktifan",
    desc: "Laporan nilai keaktifan siswa terstruktur untuk dicetak.",
    icon: FileText,
    path: "/teacher/class-improvement/print-session-activity",
    tags: ["Laporan", "Cetak"],
    accent: "text-slate-600",
    accentBg: "bg-slate-50",
    accentBorder: "border-slate-200",
    dot: "bg-slate-400",
  },
];

export default function ClassImprovement() {
  const navigate = useNavigate();

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
            Control Center
          </p>
          <h1 className="text-lg font-bold text-slate-800 mt-0.5">
            Peningkatan Kelas
          </h1>
          <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-1 max-w-sm">
            Pantau perkembangan, berikan feedback, dan apresiasi karya siswa.
          </p>
        </div>


        {/* ═══ MENU LIST ═══ */}
        <div className="space-y-2">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
            Modul Tersedia
          </p>

          {MENUS.map((menu) => {
            const Icon = menu.icon;
            return (
              <div
                key={menu.title}
                onClick={() => navigate(menu.path)}
                className="rounded-xl bg-white border border-slate-200 overflow-hidden cursor-pointer transition-all hover:border-slate-300 active:scale-[0.99] group"
              >
                {/* Top accent line — subtle, functional */}
                <div className={`h-0.5 ${menu.dot} opacity-40`} />

                <div className="p-4 flex items-start gap-3.5">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg ${menu.accentBg} ${menu.accent} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-slate-800 leading-tight">
                        {menu.title}
                      </h3>
                      <div className={`w-1.5 h-1.5 rounded-full ${menu.dot} flex-shrink-0`} />
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                      {menu.desc}
                    </p>

                    {/* Tags — minimal */}
                    <div className="flex gap-1.5 mt-2">
                      {menu.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${menu.accentBg} ${menu.accent} border ${menu.accentBorder}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chevron */}
                  <div className="flex-shrink-0 mt-1">
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-slate-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ TIP ═══ */}
        <div className="rounded-lg bg-slate-100 border border-slate-200 p-3.5 flex items-start gap-3">
          <Activity size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
            <span className="font-semibold">Tip:</span> Periksa Forum Refleksi secara rutin untuk mengetahui kendala yang dialami siswa saat mengerjakan tugas.
          </p>
        </div>

        {/* ═══ FOOTER ═══ */}
        <p className="text-[8px] text-slate-400 text-center font-medium pt-4 uppercase tracking-wider">
          Class Improvement Module · Tapamajuma
        </p>
      </div>
    </div>
  );
}