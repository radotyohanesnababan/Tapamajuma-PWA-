import React, { useState, useEffect, useCallback } from "react";
import {
  Save, ListChecks, Shuffle, Search, X, CheckCircle2,
  ChevronLeft, ChevronRight, Hash, Clock, Target,
  ShuffleIcon, ListChecksIcon
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import DOMPurify from "dompurify";

const ExamForm = ({ setView }) => {
  const [loading, setLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [options, setOptions] = useState({
    subjects: [],
    classes: [],
    teachers: [],
  });
  const [questionData, setQuestionData] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
  });
  const [filters, setFilters] = useState({
    type: "",
    subject_id: "",
    class_id: "",
    teacher_id: "",
    search: "",
    page: 1,
  });

  const [formData, setFormData] = useState({
    title: "",
    subject_id: "",
    duration_minutes: 90,
    selection_mode: "random",
    total_questions: 40,
    allowed_classes: [],
    allowed_types: {
      official: true,
      numeracy: false,
      tka: false,
      literacy: false,
    },
    question_ids: [],
  });

  // 1. Load Options
  useEffect(() => {
    const getOptions = async () => {
      try {
        const res = await api.get("/api/teacher/cbt/options");
        const data = res.data.subjects ? res.data : res.data.data;
        setOptions(data || { subjects: [], classes: [], teachers: [] });
      } catch (err) {
        console.error("Gagal ambil options:", err);
      }
    };
    getOptions();
  }, []);

  // 2. Fetch Soal
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/api/teacher/cbt/question-bank?${params}`);
      setQuestionData(res.data);
    } catch {
      toast.error("Gagal memuat bank soal.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (showGallery) fetchQuestions();
  }, [showGallery, fetchQuestions]);

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      allowed_types: { ...prev.allowed_types, [type]: !prev.allowed_types[type] },
    }));
  };

  const handleClassChange = (classId) => {
    setFormData((prev) => {
      const isSelected = prev.allowed_classes.includes(classId);
      return {
        ...prev,
        allowed_classes: isSelected
          ? prev.allowed_classes.filter((id) => id !== classId)
          : [...prev.allowed_classes, classId],
      };
    });
  };

  const handleSelectQuestion = (id) => {
    setFormData((prev) => {
      const isSelected = prev.question_ids.includes(id);
      return {
        ...prev,
        question_ids: isSelected
          ? prev.question_ids.filter((qId) => qId !== id)
          : [...prev.question_ids, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const selectedTypes = Object.keys(formData.allowed_types).filter(
      (key) => formData.allowed_types[key]
    );

    try {
      await api.post("/api/teacher/cbt/exams", {
        ...formData,
        allowed_question_types: selectedTypes,
      });
      toast.success("Paket ujian berhasil disimpan.");
      setView("list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan paket.");
    } finally {
      setLoading(false);
    }
  };

  // Completion tracking
  const requiredChecks = [
    !!formData.title,
    !!formData.subject_id,
    formData.allowed_classes.length > 0,
    formData.selection_mode === "random"
      ? Object.values(formData.allowed_types).some(Boolean)
      : formData.question_ids.length > 0,
  ];
  const filledCount = requiredChecks.filter(Boolean).length;

  return (
    <div className="space-y-3 pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ═══ CONFIG: Title + Subject ═══ */}
      <div className="rounded-lg bg-white border border-slate-200 p-3.5 space-y-3">
        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
          Konfigurasi Dasar
        </p>

        <div className="flex gap-2">
          <div className="flex-[2]">
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-300"
              placeholder="Judul ujian (mis: UTS Ganjil Matematika)"
            />
          </div>
          <div className="flex-1">
            <select
              required
              value={formData.subject_id}
              onChange={(e) =>
                setFormData({ ...formData, subject_id: e.target.value })
              }
              className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
            >
              <option value="">— Mapel —</option>
              {options.subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ═══ SELECTION MODE ═══ */}
      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden">
        <div className="px-3.5 pt-3.5 pb-2">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
            Mode Seleksi Soal
          </p>
        </div>

        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, selection_mode: "random" })
            }
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-semibold border-b-2 transition -mb-px ${
              formData.selection_mode === "random"
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Shuffle size={13} /> Acak Sistem
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, selection_mode: "manual" })
            }
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-semibold border-b-2 transition -mb-px ${
              formData.selection_mode === "manual"
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <ListChecks size={13} /> Pilih Manual
          </button>
        </div>

        <div className="p-3.5">
          {formData.selection_mode === "random" ? (
            <div className="space-y-3">
              {/* Duration + Count */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    <Clock size={9} className="inline mr-1" />
                    Durasi (menit)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: e.target.value,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    <Target size={9} className="inline mr-1" />
                    Jumlah soal
                  </label>
                  <input
                    type="number"
                    value={formData.total_questions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_questions: e.target.value,
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </div>
              </div>

              {/* Target Classes */}
              <div>
                <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Target Kelas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {options.classes?.map((c) => {
                    const isSelected = formData.allowed_classes.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleClassChange(c.id)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-semibold border transition ${
                          isSelected
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Sumber Tipe Soal
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["official", "numeracy", "literacy", "tka"].map((type) => {
                    const isActive = formData.allowed_types[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeChange(type)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-semibold border transition capitalize ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {isActive && (
                          <CheckCircle2
                            size={10}
                            className="inline mr-1 -mt-0.5"
                          />
                        )}
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Manual mode */
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Mode Manual
                </p>
                <p className="text-[10px] text-slate-500">
                  Terpilih:{" "}
                  <span className="font-mono font-bold text-slate-700">
                    {formData.question_ids.length}
                  </span>{" "}
                  soal
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGallery(true)}
                className="h-8 px-3 rounded-md bg-slate-800 text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-slate-700 transition border-none"
              >
                <Search size={12} /> Pilih Soal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SUBMIT ═══ */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-0.5">
          {requiredChecks.map((v, i) => (
            <div
              key={i}
              className={`w-1.5 h-3 rounded-full transition-colors ${
                v ? "bg-emerald-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || filledCount < requiredChecks.length}
          className={`h-10 px-6 rounded-lg text-[11px] font-semibold transition flex items-center gap-2 border-none ${
            filledCount >= requiredChecks.length
              ? "bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.98]"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <span className="animate-pulse">Menyimpan...</span>
            </>
          ) : (
            <>
              <Save size={12} /> Simpan Paket
            </>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════
          MODAL: GALERI SOAL (Manual Mode)
      ═══════════════════════════════════════ */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-50 w-full sm:max-w-2xl sm:h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-800">
                  Bank Soal
                </h3>
                <span className="font-mono text-[9px] text-slate-400">
                  {formData.question_ids.length} terpilih
                </span>
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filter bar */}
            <div className="p-2.5 bg-white border-b border-slate-100 flex gap-1.5 flex-shrink-0 overflow-x-auto">
              <select
                className="h-7 px-2 rounded-md border border-slate-200 bg-white text-[10px] font-medium text-slate-700 outline-none appearance-none flex-shrink-0"
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value, page: 1 })
                }
              >
                <option value="">Tipe</option>
                <option value="official">Resmi</option>
                <option value="numeracy">Numerasi</option>
                <option value="literacy">Literasi</option>
                <option value="tka">TKA</option>
              </select>
              <select
                className="h-7 px-2 rounded-md border border-slate-200 bg-white text-[10px] font-medium text-slate-700 outline-none appearance-none flex-shrink-0"
                value={filters.subject_id}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    subject_id: e.target.value,
                    page: 1,
                  })
                }
              >
                <option value="">Mapel</option>
                {options.subjects?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                className="h-7 px-2 rounded-md border border-slate-200 bg-white text-[10px] font-medium text-slate-700 outline-none appearance-none flex-shrink-0"
                value={filters.class_id}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    class_id: e.target.value,
                    page: 1,
                  })
                }
              >
                <option value="">Kelas</option>
                {options.classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="relative flex-1 min-w-[120px]">
                <Search
                  size={11}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  placeholder="Cari..."
                  className="w-full h-7 pl-6 pr-2 rounded-md border border-slate-200 bg-white text-[10px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-300"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      search: e.target.value,
                      page: 1,
                    })
                  }
                />
              </div>
            </div>

            {/* Question list */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {questionData.data?.map((q) => {
                  const isSelected = formData.question_ids.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleSelectQuestion(q.id)}
                      className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition ${
                        isSelected
                          ? "bg-emerald-50/50 border-l-[3px] border-l-emerald-500"
                          : "bg-white hover:bg-slate-50 border-l-[3px] border-l-transparent"
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                          isSelected
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {q.type}
                          </span>
                          <span className="text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-indigo-600">
                            {q.subject?.name}
                          </span>
                          <span className="font-mono text-[8px] text-slate-400 ml-auto">
                            #{q.id}
                          </span>
                        </div>
                        <div
                          className="text-[11px] text-slate-700 leading-relaxed line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(q.question_text),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {questionData.data?.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-[11px]">
                  Soal tidak ditemukan.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-slate-600">
                <span className="font-mono font-bold text-emerald-600">
                  {formData.question_ids.length}
                </span>{" "}
                soal terpilih
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  className="h-7 px-3 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-30"
                >
                  Prev
                </button>
                <span className="font-mono text-[10px] text-slate-400 self-center px-2">
                  {filters.page}/{questionData.last_page || 1}
                </span>
                <button
                  disabled={filters.page >= questionData.last_page}
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  className="h-7 px-3 rounded-md text-[10px] font-semibold bg-slate-800 text-white hover:bg-slate-700 transition disabled:opacity-30 border-none"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamForm;