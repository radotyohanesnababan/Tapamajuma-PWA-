import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, FileSpreadsheet, Download, Loader2,
  Layers, Upload, ArrowLeft, CheckCircle2, AlertCircle,
  FileUp, Image
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function SoalImport() {
  const navigate = useNavigate();
  const [xlsxFile, setXlsxFile] = useState(null);
  const [importType, setImportType] = useState("numeracy");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get("/api/teacher/bank-soal/template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_bank_soal.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Gagal unduh template.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!xlsxFile) return toast.error("File wajib dipilih.");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", xlsxFile);
    formData.append("type", importType);

    try {
      const res = await api.post("/api/teacher/bank-soal/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
      });
      toast.success(res.data.message || "Berhasil import soal.");
      setXlsxFile(null);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Gagal import. Waktu habis atau format salah."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center gap-3 z-20">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Import Massal
          </h2>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
            Via Excel / CSV
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">

        {/* ═══ KATEGORI ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3">
          <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Kategori Soal
          </label>
          <select
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
            className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
          >
            <option value="numeracy">Numerasi</option>
            <option value="literacy">Literasi</option>
            <option value="tka">TKA (HOTS)</option>
            <option value="official">Soal Resmi</option>
          </select>
        </div>

        {/* ═══ LANGKAH 1: TEMPLATE ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
              1
            </span>
            <span className="text-[10px] font-semibold text-slate-700">
              Download template
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed pl-7">
            Gunakan template standar agar kolom sesuai format sistem.
          </p>
          <div className="pl-7">
            <button
              onClick={downloadTemplate}
              disabled={isDownloading}
              className="h-8 px-3 rounded-md bg-slate-800 text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-slate-700 transition active:scale-[0.97] disabled:opacity-50 border-none"
            >
              {isDownloading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Download size={12} />
              )}
              {isDownloading ? "Mengunduh..." : "Template .xlsx"}
            </button>
          </div>
        </div>

        {/* ═══ LANGKAH 2: UPLOAD FILE ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
              2
            </span>
            <span className="text-[10px] font-semibold text-slate-700">
              Unggah file
            </span>
          </div>

          <div className="pl-7">
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setXlsxFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div
                className={`rounded-lg border-2 border-dashed p-5 text-center transition cursor-pointer ${
                  xlsxFile
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {xlsxFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-500 flex-shrink-0"
                    />
                    <span className="text-[11px] font-semibold text-emerald-700 truncate max-w-[200px]">
                      {xlsxFile.name}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <FileUp
                      size={20}
                      className="mx-auto text-slate-300"
                    />
                    <p className="text-[10px] font-medium text-slate-400">
                      Klik untuk pilih file .xlsx / .csv
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ LANGKAH 3: BRANKAS GAMBAR (opsional) ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
              3
            </span>
            <span className="text-[10px] font-semibold text-slate-700">
              Brankas gambar
              <span className="text-slate-400 font-normal ml-1">
                (opsional)
              </span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed pl-7">
            Jika soal membutuhkan gambar, upload dulu ke brankas lalu ambil
            link-nya.
          </p>
          <div className="pl-7">
            <button
              type="button"
              onClick={() => navigate("/teacher/bank-soal/7mediabank")}
              className="h-8 px-3 rounded-md bg-white border border7-slate-200 text-[10px] font-semibold text-slate-600 flex items-center gap-1.5 hover:bg-slate-50 transition"
            >
              <Image size={12} /> Buka Brankas Gambar
            </button>
          </div>
        </div>

        {/* ═══ PERHATIAN ═══ */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5">
          <AlertCircle
            size={13}
            className="text-amber-600 flex-shrink-0 mt-0.5"
          />
          <p className="text-[10px] text-Eamber-800 font-medium leading-relaxed">
            Pastikan kolom di Excel <span className="font-semibold">persis sama</span> dengan
            template. File yang tidak sesuai format akan ditolak oleh sistem.
          </p>
        </div>

        {/* ═══ ACTIONS ═══ */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => navigate("/teacher/bank-soal")}
            className="flex-1 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleImportSubmit}
            disabled={!xlsxFile || isSubmitting}
            className={`flex-[2] h-10 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-2 border-none ${
              xlsxFile && !isSubmitting
                ? "bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.98]"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <Upload size={12} /> Import Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}