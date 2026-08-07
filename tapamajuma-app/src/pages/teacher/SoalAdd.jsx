import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Loader2, PenTool, Image,
  CheckCircle2, Type, Hash
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function SoalAdd() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    type: "numeracy",
    subject_id: "",
    class_id: "",
    question_text: "",
    optA: "",
    optB: "",
    optC: "",
    optD: "",
    optE: "",
    correct_key: "A",
  });

  useEffect(() => {
    api
      .get("/api/admin/subjects")
      .then((res) => setSubjects(res.data))
      .catch((err) => console.error(err));
    api
      .get("/api/admin/classes")
      .then((res) => setClasses(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payloadData = new FormData();
    payloadData.append("type", formData.type);
    payloadData.append("subject_id", formData.subject_id);
    payloadData.append("class_id", formData.class_id);
    payloadData.append("question_text", formData.question_text);
    payloadData.append("correct_key", formData.correct_key);
    payloadData.append("options[A]", formData.optA);
    payloadData.append("options[B]", formData.optB);
    payloadData.append("options[C]", formData.optC);
    payloadData.append("options[D]", formData.optD);
    payloadData.append("options[E]", formData.optE);

    if (imageFile) {
      payloadData.append("image", imageFile);
    }

    try {
      await api.post("/api/teacher/bank-soal", payloadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Soal berhasil disimpan.");
      navigate("/teacher/bank-soal/list");
    } catch (error) {
      console.error("Error validasi:", error.response?.data);
      toast.error(error.response?.data?.message || "Gagal menyimpan soal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cek kelengkapan form
  const requiredFields = [
    formData.type,
    formData.subject_id,
    formData.class_id,
    formData.question_text,
    formData.optA,
    formData.optB,
    formData.optC,
    formData.optD,
    formData.optE,
  ];
  const filledCount = requiredFields.filter((v) => v && v.trim() !== "").length;
  const isComplete = filledCount === requiredFields.length;

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
            <h2 className="text-sm font-semibold text-slate-800">Tambah Soal Manual</h2>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              Input Data
            </p>
          </div>
        </div>

        {/* Completion indicator */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {requiredFields.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-3 rounded-full transition-colors ${
                  i < filledCount ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-[9px] text-slate-400">
            {filledCount}/{requiredFields.length}
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ═══ METADATA ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3.5 space-y-3">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
            Data Awal</p>

          {/* Row 1: Kategori + Kunci */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Kategori
              </label>
              <select
                className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="numeracy">Numerasi</option>
                <option value="literacy">Literasi</option>
                <option value="tka">TKA (HOTS)</option>
                <option value="official">Soal Resmi</option>
              </select>
            </div>

            <div className="w-24">
              <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Kunci
              </label>
              <select
                className="w-full h-8 px-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 outline-none focus:ring-1 focus:ring-emerald-300 cursor-pointer appearance-none text-center"
                value={formData.correct_key}
                onChange={(e) => setFormData({ ...formData, correct_key: e.target.value })}
              >
                {["A", "B", "C", "D", "E"].map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Mapel + Kelas */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Mata Pelajaran
              </label>
              <select
                className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                required
              >
                <option value="">— Pilih —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Target Kelas
              </label>
              <select
                className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                required
              >
                <option value="">— Pilih —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ═══ PERTANYAAN ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3.5 space-y-2.5">
          <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
            Pertanyaan
          </label>
          <textarea
  className="w-full rounded-md bg-white border border-slate-200 p-3 text-[12px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-300 min-h-[100px] resize-none"
            required
            placeholder="Tuliskan butir soal di sini..."
            value={formData.question_text}
            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          />
        </div>

        {/* ═══ GAMBAR ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3.5 space-y-2">
          <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Image size={10} /> Gambar (opsional)
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          {imageFile && (
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={10} /> {imageFile.name}
            </p>
          )}
        </div>

        {/* ═══ PILIHAN JAWABAN ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 overflow-hidden">
          <div className="px-3.5 pt-3.5 pb-2">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              Pilihan Jawaban (A–E)
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {["A", "B", "C", "D", "E"].map((opt) => {
              const isCorrect = formData.correct_key === opt;
              return (
                <div
                  key={opt}
                  className={`flex items-center gap-2.5 px-3.5 py-2 ${
                    isCorrect ? "bg-emerald-50/50" : ""
                  }`}
                >
                  {/* Label huruf */}
                  <span
                    className={`font-mono text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                      isCorrect
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {opt}
                  </span>

                  {/* Input */}
                  <input
                    required
                    placeholder={`Teks pilihan ${opt}...`}
                    value={formData[`opt${opt}`]}
                    onChange={(e) =>
                      setFormData({ ...formData, [`opt${opt}`]: e.target.value })
                    }
                    className={`flex-1 h-8 px-2.5 rounded-md border text-[11px] font-medium text-slate-700 placeholder:text-slate-400 outline-none transition ${
                      isCorrect
                        ? "border-emerald-200 bg-white focus:ring-1 focus:ring-emerald-300"
                        : "border-slate-200 bg-white focus:ring-1 focus:ring-slate-300"
                    }`}
                  />

                  {/* Correct indicator */}
                  {isCorrect && (
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
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
            onClick={handleManualSubmit}
            disabled={isSubmitting || !isComplete}
            className={`flex-[2] h-10 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-2 border-none ${
              isComplete
                ? "bg-slate-800 text-white hover:bg-slate-700 active:scale-[0.98]"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <>
                <PenTool size={12} /> Simpan Soal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}