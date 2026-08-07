import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Search, Plus, Loader2, Trash2,
  CheckCircle2, Database, ChevronRight, ChevronDown,
  PenTool, Eye, Hash, CircleDot
} from "lucide-react";
import api from "@/lib/axios";
import { getStorageUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function SoalList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("numeracy");
  const [expandedId, setExpandedId] = useState(null);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/teacher/bank-soal", {
        params: { type: filterType, page, search: searchQuery },
      });
      const responseData = res.data;
      const actualQuestions = Array.isArray(responseData)
        ? responseData
        : responseData.data || [];

      setQuestions(actualQuestions);
      setPagination({
        current_page: responseData.current_page || 1,
        last_page: responseData.last_page || 1,
        total: responseData.total || actualQuestions.length,
      });
    } catch {
      toast.error("Gagal mengambil data soal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(1);
  }, [filterType]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchQuestions(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus soal" + " ini?")) return;
    try {
      await api.delete(`/api/teacher/bank-soal/${id}`);
      toast.success("Soal dihapus.");
      setQuestions(questions.filter((q) => q.id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
    } catch {
      toast.error("Gagal menghapus soal.");
    }
  };

  // Kategori label
  const typeLabels = {
    numeracy: "Numerasi",
    literacy: "Literasi",
    tka: "TKA",
    official: "Resmi",
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Daftar Soal</h2>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              {typeLabels[filterType] || "Semua"} ·{" "}
              <span className="font-mono">{pagination.total}</span> entri
            </p>
          </div>
              </div>

        <button
          onClick={() => navigate("/teacher/bank-soal/add")}
          className="h-8 px-3 rounded-lg bg-slate-800 text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-slate-700 transition active:scale-[0.97] border-none"
        >
          <Plus size={12} /> Baru
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">

        {/* ═══ FILTER BAR ═══ */}
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
          >
            <option value="numeracy">Numerasi</option>
            <option value="literacy">Literasi</option>
            <option value="tka">TKA (HOTS)</option>
            <option value="official">Soal Resmi</option>
          </select>

          <div className="relative flex-1">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              placeholder="Cari soal... (Enter)"
              className="w-full h-8 pl-7 pr-3 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchQuestions(1);
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setTimeout(() => fetchQuestions(1), 50);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ═══ QUESTION LIST ═══ */}
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-white border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-lg bg-white border border-slate-200 p-10 text-center">
            <Database size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-[11px] font-medium text-slate-500">
              Belum ada soal untuk filter ini.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {questions.map((q) => {
              const isExpanded = expandedId === q.id;
              const correctKey = q.correct_key;

              return (
                <div
                  key={q.id}
                  className="rounded-lg bg-white border border-slate-200 overflow-hidden"
                >
                  {/* ── Summary row ── */}
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition"
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  >
                    {/* ID */}
                    <span className="font-mono text-[9px] text-slate-400 w-8 text-right flex-shrink-0">
                      #{q.id}
                    </span>

                    {/* Content preview */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-slate-800 truncate leading-tight">
                        {q.question_text}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                          {q.subject?.name || "Umum"}
                        </span>
                        <span className="text-slate-200">·</span>
                        <span className="text-[8px] font-semibold text-slate-400">
                          {q.target_class?.name || "?"}
                        </span>
                      </div>
                    </div>

                    {/* Correct key badge — always visible */}
                    <span className="font-mono text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded flex-shrink-0">
                      {correctKey}
                    </span>

                    {/* Image indicator */}
                    {q.image && (
                      <CircleDot size={10} className="text-slate-400 flex-shrink-0" />
                    )}

                    {/* Expand */}
                    <ChevronDown
                      size={12}
                      className={`text-slate-400 transition-transform flex-shrink-0 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* ── Expanded detail ── */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-3 py-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {/* Full question text */}
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {q.question_text}
                      </p>

                      {/* Image */}
                      {q.image && (
                        <img
                          src={getStorageUrl(q.image)}
                          alt="Soal"
                          className="max-h-48 rounded-md border border-slate-200"
                        />
                      )}

                      {/* Options grid */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {Object.entries(q.options || {}).map(([key, value]) => {
                          const isCorrect = key === correctKey;
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
                                {key}
                              </span>
                              <span
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

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-mono text-[8px] text-slate-400">
                          ID: {q.id}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(q.id);
                          }}
                          className="text-[9px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
                        >
                          <Trash2 size={10} /> Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ PAGINATION ═══ */}
        {!isLoading && pagination.lastPage > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="h-8 px-3 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft size={12} /> Prev
            </button>

            <span className="font-mono text-[10px] font-semibold text-slate-500">
              {pagination.current_page}/{pagination.last_page}
            </span>

            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={
                pagination.current_page === pagination.last_page ||
                pagination.last_page === 0
              }
              className="h-8 px-3 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-30 flex items-center gap-1"
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}