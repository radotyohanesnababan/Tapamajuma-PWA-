import React from "react";
import { useNavigate } from "react-router-dom";
import {
  List, PlusCircle, FileUp, ChevronRight,
  Database, PenTool, UploadCloud, Layers,
  AlertCircle
} from "lucide-react";

const MENUS = [
  {
    title: "Daftar Soal",
    desc: "Lihat, edit, atau hapus soal Numerasi, Literasi, dan TKA.",
    icon: Database,
    path: "list",
    accent: "text-slate-600",
    accentBg: "bg-slate-50",
    accentBorder: "border-slate-200",
    dot: "bg-slate-400",
    tags: ["Manajemen", "Edit Data"],
  },
  {
    title: "Tambah Manual",
    desc: "Buat soal pilihan ganda baru satu per satu di aplikasi.",
    icon: PenTool,
    path: "add",
    accent: "text-emerald-600",
    accentBg: "bg-emerald-50",
    accentBorder: "border-emerald-200",
    dot: "bg-emerald-500",
    tags: ["Input Cepat", "Satu per Satu"],
  },
  {
    title: "Import Massal",
    desc: "Upload ratusan soal sekaligus via template Excel atau CSV.",
    icon: UploadCloud,
    path: "import",
    accent: "text-amber-600",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    dot: "bg-amber-500",
    tags: ["Excel/CSV", "Otomatisasi"],
  },
];

export default function BankSoal() {
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
            Data Management
          </p>
          <h1 className="text-lg font-bold text-slate-800 mt-0.5">
            Bank Soal
          </h1>
          <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-1 max-w-sm">
            Kelola materi ujian dan latihan. Pilih metode input soal yang sesuai.
          </p>
        </div>

        {/* ═══ MENU LIST ═══ */}
        <div className="space-y-2">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
            Modul
          </p>

          {MENUS.map((menu) => {
            const Icon = menu.icon;
            return (
              <div
                key={menu.title}
                onClick={() => navigate(menu.path)}
                className="rounded-xl bg-white border border-slate-200 overflow-hidden cursor-pointer transition hover:border-slate-300 active:scale-[0.99] group"
              >
                <div className={`h-0.5 ${menu.dot} opacity-40`} />

                <div className="p-4 flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-lg ${menu.accentBg} ${menu.accent} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} />
                  </div>

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

                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ TIP ═══ */}
        <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 flex items-start gap-2.5">
          <AlertCircle size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
            <span className="font-semibold">Tip:</span> Pastikan kolom Excel persis sama dengan template agar tidak error saat upload massal.
          </p>
        </div>

        {/* ═══ FOOTER ═══ */}
        <p className="text-[8px] text-slate-400 text-center font-medium pt-4 uppercase tracking-wider">
          Question Bank Module · Tapamajuma
        </p>
      </div>
    </div>
  );
}