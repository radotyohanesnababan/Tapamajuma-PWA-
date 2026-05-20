import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download, Award, Clock, CheckCircle,
  Loader2, Medal, Calendar, ExternalLink
} from "lucide-react";
import { IconCertificate } from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";
import api from "@/lib/axios";

// ── Helpers ──────────────────────────────────────────────────────
const TYPE_LABELS = {
  top_xp:             "Skor Terbaik",
  top_active:         "Siswa Teraktif",
  top_active_morning: "Sesi Pagi Teraktif",
  top_teladan:        "Siswa Teladan",
  manual:             "Penghargaan Khusus",
};

const RANK_MEDAL  = { 1: "🥇", 2: "🥈", 3: "🥉" };

// Tambahkan warna garis aksen atas (accent)
const RANK_COLORS = {
  1: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-700", accent: "bg-amber-400" },
  2: { bg: "bg-slate-50",  border: "border-slate-200", text: "text-slate-600", accent: "bg-slate-400" },
  3: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", accent: "bg-orange-400" },
};

function CertificateCard({ cert }) {
  const [downloading, setDownloading] = useState(false);
  const rankColor = RANK_COLORS[cert.rank] ?? { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-600", accent: "bg-indigo-400" };
  const isReleased = cert.status === "released";

  const handleDownload = async () => {
    if (!isReleased) return;
    setDownloading(true);
    try {
      const res = await api.get(`/api/admin/certificates/cert/${cert.id}/download`);
      window.open(res.data.url, "_blank");
    } catch {
      toast.error("Gagal membuka sertifikat");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className={`relative overflow-hidden rounded-2xl border ${rankColor.border} bg-white shadow-sm transition-all hover:shadow-md flex flex-col`}>
      {/* Garis aksen di bagian atas kartu */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${rankColor.accent}`} />

      {/* Bagian Info Utama */}
      <div className="p-4 pt-5 flex-1 flex flex-col gap-4">
        
        {/* Row 1: Badge Status & Tanggal */}
        <div className="flex justify-between items-start">
          {isReleased ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
              <CheckCircle size={12} /> Siap Diunduh
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
              <Clock size={12} /> Menunggu
            </span>
          )}
          
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Calendar size={12} />
            <span>{cert.period_label}</span>
          </div>
        </div>

        {/* Row 2: Medali & Teks Prestasi */}
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl shrink-0 ${rankColor.bg} border ${rankColor.border}`}>
            {RANK_MEDAL[cert.rank] ?? "🎖️"}
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-xs font-extrabold ${rankColor.text} mb-0.5`}>
              PERINGKAT {cert.rank}
            </p>
            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate">
              {TYPE_LABELS[cert.type] ?? cert.type}
            </h3>
            
            {/* Skor / Angkatan / Kelas diringkas dalam satu baris */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
              {cert.score_label && (
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {cert.score_label}
                </span>
              )}
              {cert.scope !== "global" && (
                <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                  {cert.scope === "grade" ? `Angkatan ${cert.scope_value}` : `Kelas ${cert.scope_value}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Tombol (Footer Kartu) */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 mt-auto">
        {isReleased ? (
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs h-10 gap-2 shadow-sm"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? "Membuka Dokumen..." : "Unduh PDF"}
            <ExternalLink size={12} className="opacity-50 ml-auto" />
          </Button>
        ) : (
          <div className="w-full rounded-xl bg-slate-200/50 text-slate-400 text-xs h-10 flex items-center justify-center gap-2 font-medium">
            Tersedia setelah prosesi
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Certificate() {
  usePageTitle("Sertifikat Saya");

  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/api/certificates")
      .then(r => setCerts(r.data?.data ?? []))
      .catch(() => toast.error("Gagal memuat sertifikat"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? certs
    : filter === "released" ? certs.filter(c => c.status === "released")
    : certs.filter(c => c.status !== "released");

  const releasedCount = certs.filter(c => c.status === "released").length;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Sertifikatku</h1>
        <p className="text-sm text-slate-500 mt-1">Koleksi penghargaan prestasimu.</p>
      </div>

      {/* Stats Strip - Menggunakan Grid 2 kolom agar seimbang di HP */}
      {!loading && certs.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-1">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1">
              <IconCertificate size={16} className="text-indigo-600" />
              <p className="text-[11px] sm:text-xs text-indigo-600 font-bold uppercase tracking-wide">Total</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-900 leading-none">{certs.length}</p>
          </div>
          
          {releasedCount > 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-emerald-600" />
                <p className="text-[11px] sm:text-xs text-emerald-600 font-bold uppercase tracking-wide">Bisa Diunduh</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-900 leading-none">{releasedCount}</p>
            </div>
          )}
        </div>
      )}

      {/* Filter - Horizontal Scrollable untuk layar sempit */}
      {certs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 px-1 -mx-1 no-scrollbar">
          {[
            { key: "all",      label: "Semua" },
            { key: "released", label: "Siap Diunduh" },
            { key: "pending",  label: "Menunggu Prosesi" },
          ].map(f => (
            <button key={f.key}
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filter === f.key
                  ? "bg-slate-800 text-white border-slate-800 shadow-md"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Grid - Dirubah dari 3 kolom paksa menjadi 1 kolom (atau maks 2 di tablet) */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-slate-300" />
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <IconCertificate size={36} className="text-slate-300" />
          </div>
          <p className="text-base font-bold text-slate-600">Belum ada sertifikat</p>
          <p className="text-sm mt-1 max-w-[250px] mx-auto leading-relaxed">
            Terus tingkatkan prestasimu, sertifikat akan otomatis muncul di sini.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Medal size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Tidak ada sertifikat di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
          {filtered.map(cert => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
        </div>
      )}
    </div>
  );
}