import React, { useState, useEffect } from "react";
import {
  Play, Trash2, Eye, RefreshCw, X, Check, FileText,
  MonitorPlay, BarChart2, ChevronRight, ChevronDown,
  Radio, Hash, Clock, Target, AlertCircle, CheckCircle2
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import DOMPurify from "dompurify";

const STATUS_CONFIG = {
  active: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Aktif",
  },
  draft: {
    dot: "bg-slate-300",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
    label: "Draft",
  },
  completed: {
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-600 border-slate-200",
    label: "Selesai",
  },
};

const ExamList = ({ setView, setActiveExam }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedExamTitle, setSelectedExamTitle] = useState("");

  const fetchExams = async () => {
    try {
      const res = await api.get("/api/teacher/cbt/exams");
      setExams(res.data.data || []);
    } catch {
      toast.error("Gagal memuat daftar paket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenPreview = async (exam) => {
    setSelectedExamTitle(exam.title);
    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const res = await api.get(`/api/teacher/cbt/exams/${exam.id}/preview`);
      setPreviewData(res.data.data);
    } catch {
      toast.error("Gagal memuat detail soal.");
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Yakin ingin menghapus paket ujian ini? Data hasil ujian juga akan hilang."
      )
    )
      return;
    try {
      const res = await api.delete(`/api/teacher/cbt/exams/${id}`);
      toast.success(res.data.message);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus paket.");
    }
  };

  const handleReleaseToken = async (id) => {
    try {
      toast.loading("Merilis token...");
      const res = await api.post(`/api/teacher/cbt/exams/${id}/release-token`);
      toast.dismiss();
      if (res.data.status === "success") {
        toast.success("Token berhasil dirilis.");
        fetchExams();
      }
    } catch {
      toast.dismiss();
      toast.error("Gagal merilis token.");
    }
  };

  // Derived counts
  const activeCount = exams.filter((e) => e.status === "active").length;

  if (loading) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-white border border-slate-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes pulse-soft { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      `}</style>

      {/* ═══ SUMMARY BAR ═══ */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
          <span className="font-mono text-slate-600">{exams.length}</span> paket
        </span>
        {activeCount > 0 && (
          <span className="flex items-center gap-1.5 text-[9px] font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-soft" />
            <span className="font-mono">{activeCount}</span> sedang aktif
          </span>
        )}
      </div>

      {/* ═══ EXAM LIST ═══ */}
      {exams.length === 0 ? (
        <div className="rounded-lg bg-white border border-slate-200 p-10 text-center">
          <FileText size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-[11px]+ font-medium text-slate-500">
            Belum ada paket ujian.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Column header */}
          <div className="flex items-center px-3 py-1.5 text-[8px] font-semibold text-slate-400 uppercase tracking-wider select-none">
            <span className="w-2" />
            <span className="flex-1 ml-3">Paket</span>
            <span className="w-16 text-center">Soal</span>
            <span className="w-16 text-center">Durasi</span>
            <span className="w-14 text-center">Status</span>
            <span className="w-6" />
          </div>

          {exams.map((exam) => {
            const statusKey = exam.status || "draft";
            const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.draft;
            const isActive = exam.status === "active";

            return (
              <div
                key={exam.id}
                className={`rounded-lg bg-white border overflow-hidden transition ${
                  isActive
                    ? "border-emerald-200 border-l-[3px]"
                    : "border-slate-200"
                }`}
                style={isActive ? { borderLeftColor: "#10b981" } : undefined}
              >
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  {/* Status dot */}
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isActive ? "pulse-soft" : ""
                    } ${status.dot}`}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-800 truncate leading-tight">
                      {exam.title}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                      {exam.subject?.name || "—"}
                    </p>
                  </div>

                  {/* Questions */}
                  <span className="font-mono text-[10px] font-bold text-slate-600 w-16 text-center flex-shrink-0">
                    {exam.total_questions}
                  </span>

                  {/* Duration */}
                  <span className="font-mono text-[10px] font-semibold text-slate-500 w-16 text-center flex-shrink-0">
                    {exam.duration_minutes}m
                  </span>

                  {/* Status badge */}
                  <span
                    className={`text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 w-14 text-center ${status.badge}`}
                  >
                    {status.label}
                  </span>

                  {/* Actions dropdown */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Preview */}
                    <button
                      onClick={() => handleOpenPreview(exam)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                      title="Pratinjau"
                    >
                      <Eye size={13} />
                    </button>

                    {/* Results */}
                    <button
                      onClick={() => {
                        setActiveExam(exam);
                        setView("results");
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                      title="Hasil"
                    >
                      <BarChart2 size={13} />
                    </button>

                    {/* Primary action */}
                    {isActive ? (
                      <button
                        onClick={() => {
                          setActiveExam(exam);
                          setView("live");
                        }}
                        className="h-7 px-2.5 rounded-md bg-emerald-500 text-white text-[9px] font-semibold flex items-center gap-1 hover:bg-emerald-600 transition border-none"
                      >
                        <Radio size={10} /> Live
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReleaseToken(exam.id)}
                        className="h-7 px-2.5 rounded-md bg-slate-800 text-white text-[9px] font-semibold flex items-center gap-1 hover:bg-slate-700 transition border-none"
                      >
                        <Play size={10} /> Rilis
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════
          MODAL: PREVIEW SOAL
      ═══════════════════════════════════════ */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-50 w-full sm:max-w-2xl sm:h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-xs font-semibold text-slate-800">
                  {selectedExamTitle}
                </h3>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                  Pratinjau Soal ·{" "}
                  <span className="font-mono">{previewData.length}</span> butir
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <RefreshCw
                    size={24}
                    className="animate-spin text-slate-400"
                  />
                  <p className="text-[11px] text-slate-500">
                    Menyusun pratinjau...
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {previewData.map((q, index) => (
                    <div key={q.id} className="px-4 py-4 space-y-3">
                      {/* Question header */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          #{index + 1}
                        </span>
                        <span className="text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {q.type}
                        </span>
                      </div>

                      {/* Question text */}
                      <div
                        className="text-[F11px] text-slate-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(q.question_text),
                        }}
                      />

                      {/* Options */}
                      {q.options && (
                        <div className="grid grid-cols-2 gap-1.5">
                          {Object.entries(
                            typeof q.options === "string"
                              ? JSON.parse(q.options)
                              : q.options
                          ).map(([key, value]) => {
                            const isCorrect = key === q.correct_key;
                            return (
                              <div
                                key={key}
                                className={`flex items-center gap-2 p-2 rounded-md border text-[10px] ${
                                  isCorrect
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-white border-slate-100"
                                }`}
                              >
                                <span
                                  className={`font-mono font-bold w-4 h-4 rounded flex items-center justify-center text-[8px] flex-shrink-0 ${
                                    isCorrect
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {key.toUpperCase()}
                                </span>
7                                <span
                                  className={`truncate ${
                                    isCorrect
                                      ? "font-semibold text-emerald-800"
                                      : "text-slate-600"
                                  }`}
                                >
                                  {value}
                                </span>
                                {isCorrect && (
                                  <CheckCircle2
                                    size={10}
                                    className="text-emerald-500 flex-shrink-0 ml-auto"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full h-9 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold hover:bg-slate-200 transition border-none"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamList;