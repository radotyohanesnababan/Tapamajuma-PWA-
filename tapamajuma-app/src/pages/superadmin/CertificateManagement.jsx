import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award, Plus, Download, CheckCircle, Clock,
  Send, Eye, Loader2, ChevronDown, ChevronRight,
  Users, TrendingUp, BookOpen, Calendar, X,
  AlertCircle, Medal, FileText,
  AwardIcon,Trash2
} from "lucide-react";
import { IconCertificate } from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";
import api from "@/lib/axios";

// ── Helpers ──────────────────────────────────────────────────────
const TYPE_LABELS = {
  top_xp:             { label: "Top XP Tertinggi",   icon: <TrendingUp size={14} />, color: "text-indigo-600 bg-indigo-50"  },
  top_active:         { label: "Top Siswa Teraktif",  icon: <AwardIcon size={14} />,      color: "text-emerald-600 bg-emerald-50"},
  top_active_morning: { label: "Top Rajin Sesi Pagi", icon: <Users size={14} />,      color: "text-orange-600 bg-orange-50"  },
  top_teladan:        { label: "Siswa Teladan",       icon: <Medal size={14} />,      color: "text-amber-600 bg-amber-50"    },
  manual:             { label: "Penghargaan Manual",  icon: <FileText size={14} />,   color: "text-slate-600 bg-slate-100"   },
};

const SCOPE_LABELS = {
  global: "Semua Siswa",
  grade:  (v) => `Angkatan ${v}`,
  class:  (v) => `Kelas ${v}`,
};

const STATUS_CONFIG = {
  draft:    { label: "Draft",    color: "text-slate-500 bg-slate-100",   icon: <Clock size={12} /> },
  printed:  { label: "Dicetak",  color: "text-amber-600 bg-amber-50",    icon: <CheckCircle size={12} /> },
  released: { label: "Dirilis",  color: "text-emerald-600 bg-emerald-50",icon: <Send size={12} /> },
};

const RANK_MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const cfg = TYPE_LABELS[type] ?? { label: type, color: "text-slate-600 bg-slate-100" };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ── Generate Modal ────────────────────────────────────────────────
function GenerateModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1=form, 2=preview
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  const [form, setForm] = useState({
    type:         "top_xp",
    scope:        "global",
    scope_value:  "",
    start_date:   "",
    end_date:     "",
    period_label: "",
    limit:        5,
  });

  const [manualEntries, setManualEntries] = useState([
    { nis: "", name: "", rank: 1, score_label: "" }
  ]);

  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get("/api/admin/classes").then(r => setClasses(r.data ?? [])).catch(() => {});
  }, []);

  const isManual = form.type === "manual";

  const handlePreview = async () => {
    // Jika manual, sebenarnya tidak perlu preview ranking, tapi jika tetap ingin panggil:
    if (!isManual && (!form.start_date || !form.end_date)) {
      toast.error("Isi rentang tanggal terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      // Bersihkan payload: jika manual, paksa tanggal jadi null
      const payload = {
        ...form,
        start_date: isManual ? null : form.start_date,
        end_date: isManual ? null : form.end_date,
      };

      const res = await api.post("/api/admin/certificates/preview", payload);
      setPreviewData(res.data.data ?? []);
      setStep(2);
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Gagal memuat preview");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Bersihkan payload sebelum kirim
      const payload = {
        ...form,
        // KUNCI UTAMA: Ubah "" menjadi null agar lolos validasi 'nullable|date' di Laravel
        start_date: isManual ? null : form.start_date,
        end_date: isManual ? null : form.end_date,
        entries: isManual ? manualEntries : undefined,
      };

      await api.post("/api/admin/certificates/generate", payload);
      toast.success("Batch sertifikat berhasil dibuat!");
      onSuccess();
      onClose();
    } catch (e) {
      // Tampilkan error detail dari Laravel agar tahu field mana yang salah
      const errorData = e?.response?.data;
      toast.error(errorData?.message || "Gagal generate");
    } finally {
      setLoading(false);
    }
  };
  
  const scopeNeedsValue = form.scope === "grade" || form.scope === "class";

  return (
    <div style={{ minHeight: 480, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
      className="fixed inset-0 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-black text-slate-800">
              {step === 1 ? "Generate Sertifikat" : "Preview Ranking"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === 1 ? "Pilih tipe dan periode penilaian" : "Cek daftar siswa sebelum generate"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X size={18} />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              {/* Tipe */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipe Ranking</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  {Object.entries(TYPE_LABELS).map(([val, { label }]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {!isManual && (
                <>
                  {/* Scope */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cakupan</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["global", "grade", "class"].map(s => (
                        <button key={s}
                          onClick={() => setForm(f => ({ ...f, scope: s, scope_value: "" }))}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            form.scope === s
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          {s === "global" ? "Global" : s === "grade" ? "Per Angkatan" : "Per Kelas"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scope value */}
                  {form.scope === "grade" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Angkatan</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["VII", "VIII", "IX"].map(g => (
                          <button key={g}
                            onClick={() => setForm(f => ({ ...f, scope_value: g }))}
                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                              form.scope_value === g
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                            }`}
                          >
                            Kelas {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {form.scope === "class" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kelas</label>
                      <select
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={form.scope_value}
                        onChange={e => setForm(f => ({ ...f, scope_value: e.target.value }))}
                      >
                        <option value="">-- Pilih Kelas --</option>
                        {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Tanggal */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dari Tanggal</label>
                      <input type="date"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={form.start_date}
                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sampai Tanggal</label>
                      <input type="date"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={form.end_date}
                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Jumlah */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Jumlah Penerima (Top N)
                    </label>
                    <div className="flex gap-2">
                      {[3, 5, 10].map(n => (
                        <button key={n}
                          onClick={() => setForm(f => ({ ...f, limit: n }))}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            form.limit === n
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                          }`}
                        >
                          Top {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Period Label */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Label Periode</label>
                <input type="text" placeholder="cth: Semester I T.A. 2024/2025"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.period_label}
                  onChange={e => setForm(f => ({ ...f, period_label: e.target.value }))}
                />
              </div>

              {/* Manual entries */}
              {isManual && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600">Daftar Penerima</label>
                  {manualEntries.map((entry, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-1 text-center text-xs font-bold text-slate-400">{i + 1}</div>
                      <input type="number" placeholder="Masukkan NISN"
                        className="col-span-3 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={entry.nis}
                        onChange={e => {
                          const n = [...manualEntries];
                          n[i].nis = e.target.value;
                          setManualEntries(n);
                        }}
                      />
                      <input type="text" placeholder="Keterangan Penghargaan"
                        className="col-span-6 border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={entry.score_label}
                        onChange={e => {
                          const n = [...manualEntries];
                          n[i].score_label = e.target.value;
                          setManualEntries(n);
                        }}
                      />
                      <button onClick={() => setManualEntries(e => e.filter((_, j) => j !== i))}
                        className="col-span-2 text-rose-400 hover:text-rose-600 flex justify-center">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setManualEntries(e => [...e, { nis: "", rank: e.length + 1, score_label: "" }])}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    + Tambah Penerima
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Batal</Button>
                {isManual ? (
                  <Button onClick={handleGenerate} disabled={loading} className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                    {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                    Generate
                  </Button>
                ) : (
                  <Button onClick={handlePreview} disabled={loading} className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700">
                    {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Eye size={16} className="mr-2" />}
                    Preview Ranking
                  </Button>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                {previewData.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Tidak ada data ditemukan untuk filter ini.</p>
                  </div>
                )}
                {previewData.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-lg w-8 text-center">{RANK_MEDAL[i + 1] ?? `#${i + 1}`}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.class_name}</p>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                      {s.score_label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">
                  ← Ubah Filter
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || previewData.length === 0}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                >
                  {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                  Generate Sertifikat
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Batch Card ────────────────────────────────────────────────────
// ── Batch Card ────────────────────────────────────────────────────
function BatchCard({ batch, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingRelease, setLoadingRelease] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false); // State untuk loading hapus
  const [certs, setCerts] = useState(null);

  const scopeLabel = batch.scope === "global"
    ? "Semua Siswa"
    : batch.scope === "grade"
    ? `Angkatan ${batch.scope_value}`
    : `Kelas ${batch.scope_value}`;

  const handleExpand = async () => {
    if (!expanded && !certs) {
      try {
        const res = await api.get(`/api/admin/certificates/${batch.id}`);
        setCerts(res.data.data?.certificates ?? []);
      } catch { setCerts([]); }
    }
    setExpanded(e => !e);
  };

  const handleGeneratePdf = async () => {
    setLoadingPdf(true);
    try {
      await api.post(`/api/admin/certificates/${batch.id}/generate-pdf`);
      toast.success("PDF berhasil digenerate!");
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Gagal generate PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleRelease = async () => {
    if (!confirm("Yakin rilis sertifikat ke semua siswa?")) return;
    setLoadingRelease(true);
    try {
      await api.post(`/api/admin/certificates/${batch.id}/release`);
      toast.success("Sertifikat berhasil dirilis!");
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Gagal rilis");
    } finally {
      setLoadingRelease(false);
    }
  };

  // FUNGSI HAPUS BATCH 
  const handleDeleteBatch = async () => {
    if (!confirm(
      `HAPUS TOTAL BATCH ID #${batch.id}?\n\n` +
      `PERINGATAN: Aksi ini akan menghapus:\n` +
      `1. Data Batch ini permanen.\n` +
      `2. SEMUA (${batch.certificates_count}) sertifikat siswa terkait dari server & storage.\n` +
      `3. Siswa TIDAK AKAN LAGI melihat sertifikat ini di aplikasinya.\n\n` +
      `Aksi ini tidak bisa dibatalkan. Yakin?`
    )) return;

    setLoadingDelete(true);
    try {
      await api.delete(`/api/admin/certificates/${batch.id}`);
      toast.success("Batch dan sertifikat berhasil dihapus total dari server!");
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Gagal menghapus batch");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Medal size={20} className="text-indigo-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <TypeBadge type={batch.type} />
                <span className="text-xs text-slate-400">{scopeLabel}</span>
              </div>
              <p className="text-sm font-bold text-slate-800 mt-1">{batch.period_label}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar size={11} /> {batch.start_date} – {batch.end_date}
                </span>
                <span className="text-xs text-slate-400">
                  {batch.certificates_count} sertifikat
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={batch.status} />

            {/* Action Buttons */}
            {batch.status === "draft" && (
              <Button size="sm" onClick={handleGeneratePdf} disabled={loadingPdf}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs h-8 px-3">
                {loadingPdf ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} className="mr-1" />}
                Generate PDF
              </Button>
            )}
            
            {batch.status === "printed" && (
              <Button size="sm" onClick={handleRelease} disabled={loadingRelease}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3">
                {loadingRelease ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} className="mr-1" />}
                Rilis ke Siswa
              </Button>
            )}

            {/* Tombol Hapus Total (Warna Merah) */}
            <Button size="sm" onClick={handleDeleteBatch} disabled={loadingDelete} variant="destructive"
              className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs h-8 px-3">
              {loadingDelete ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} className="mr-1" />}
              Hapus Total
            </Button>

            <Button variant="ghost" size="icon" onClick={handleExpand}
              className="rounded-xl h-8 w-8 text-slate-400">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          </div>
        </div>

        {/* Expanded: daftar sertifikat */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {certs === null && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            )}
            {certs?.map((cert, i) => (
              <div key={cert.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                <span className="text-base w-7 text-center">{RANK_MEDAL[cert.rank] ?? `#${cert.rank}`}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {cert.user?.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {cert.user?.class_name?.name ?? cert.user?.className?.name}
                  </p>
                </div>
                {cert.score_label && (
                  <span className="text-xs text-indigo-600 font-semibold">{cert.score_label}</span>
                )}
                {cert.pdf_path && (
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const res = await api.get(`/api/admin/certificates/cert/${cert.id}/download`);
                        window.open(res.data.url, "_blank");
                      } catch { toast.error("Gagal membuka PDF"); }
                    }}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Download size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function CertificateManagement() {
  usePageTitle("Manajemen Sertifikat");

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const fetchBatches = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/certificates?page=${p}`);
      setBatches(res.data.data?.data ?? []);
      setMeta(res.data.data);
    } catch {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(page); }, [page]);

  const stats = {
    total:    batches.length,
    draft:    batches.filter(b => b.status === "draft").length,
    printed:  batches.filter(b => b.status === "printed").length,
    released: batches.filter(b => b.status === "released").length,
  };

  const filtered = filterStatus === "all"
    ? batches
    : batches.filter(b => b.status === filterStatus);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showModal && (
        <GenerateModal
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchBatches(1)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Sertifikat</h1>
          <p className="text-slate-500 mt-1">Generate, cetak, dan rilis sertifikat penghargaan siswa.</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 px-5"
        >
          <Plus size={16} /> Generate Sertifikat
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Batch",  value: stats.total,    color: "text-slate-700",   bg: "bg-slate-100"   },
          { label: "Draft",        value: stats.draft,    color: "text-slate-500",   bg: "bg-slate-50"    },
          { label: "Siap Cetak",   value: stats.printed,  color: "text-amber-600",   bg: "bg-amber-50"    },
          { label: "Dirilis",      value: stats.released, color: "text-emerald-600", bg: "bg-emerald-50"  },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Alur Status */}
      <Card className="border-none shadow-sm bg-slate-900 text-white">
        <CardContent className="p-6">
          <p className="text-xs font-semibold text-slate-400 mb-4 tracking-widest uppercase">Alur Sertifikat</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { step: "1", label: "Generate", sub: "Pilih tipe & periode", icon: <Plus size={14} />, color: "bg-indigo-600" },
              { step: "→" },
              { step: "2", label: "Generate PDF", sub: "Render & simpan ke R2", icon: <Download size={14} />, color: "bg-amber-500" },
              { step: "→" },
              { step: "3", label: "Prosesi Fisik", sub: "Cetak & serahkan", icon: <Award size={14} />, color: "bg-orange-500" },
              { step: "→" },
              { step: "4", label: "Rilis Digital", sub: "Siswa bisa akses", icon: <Send size={14} />, color: "bg-emerald-500" },
            ].map((s, i) =>
              s.step === "→" ? (
                <ChevronRight key={i} size={16} className="text-slate-600 flex-shrink-0" />
              ) : (
                <div key={i} className="flex items-center gap-2.5 bg-slate-800 px-3 py-2 rounded-xl">
                  <div className={`w-6 h-6 rounded-lg ${s.color} flex items-center justify-center`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.sub}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter + List */}
      <div>
        <div className="flex gap-2 mb-4">
          {["all", "draft", "printed", "released"].map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                filterStatus === s
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {s === "all" ? "Semua" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-slate-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <IconCertificate size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">Belum ada batch sertifikat</p>
            <p className="text-xs mt-1">Klik "Generate Sertifikat" untuk mulai</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(batch => (
              <BatchCard key={batch.id} batch={batch} onRefresh={() => fetchBatches(page)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page === 1}
              onClick={() => setPage(p => p - 1)} className="rounded-xl">
              ← Prev
            </Button>
            <span className="text-xs text-slate-500 self-center px-3">
              {page} / {meta.last_page}
            </span>
            <Button variant="outline" size="sm" disabled={page === meta.last_page}
              onClick={() => setPage(p => p + 1)} className="rounded-xl">
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}