import React, { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  PencilLine, Frown, Sparkles, Rocket, Send,
  Loader2, ChevronLeft, Heart, Target, Flame,
  ShieldCheck, CircleDot, CheckCircle2
} from "lucide-react";

const REFLECTION_FIELDS = [
  {
    key: "difficulties",
    label: "Rintangan Terberat",
    placeholder: "Apa hal yang paling sulit atau membuatmu bingung minggu ini?",
    icon: Frown,
    theme: {
      grad: "from-rose-400 to-orange-400",
      iconBg: "bg-rose-100",
      iconText: "text-rose-500",
      labelText: "text-rose-600",
      ring: "focus-visible:ring-rose-400",
      strip: "from-rose-400 to-orange-300",
      shadow: "shadow-[0_4px_14px_rgba(251,113,133,0.12)]",
    },
    emoji: "💪",
  },
  {
    key: "improvements",
    label: "Kemenangan Kecilku",
    placeholder: "Hal apa yang sekarang kamu sudah merasa lebih jago?",
    icon: Sparkles,
    theme: {
      grad: "from-emerald-400 to-teal-400",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-500",
      labelText: "text-emerald-600",
      ring: "focus-visible:ring-emerald-400",
      strip: "from-emerald-400 to-teal-300",
      shadow: "shadow-[0_4px_14px_rgba(52,211,153,0.12)]",
    },
    emoji: "✨",
  },
  {
    key: "targets",
    label: "Misi Minggu Depan",
    placeholder: "Apa target atau hal seru yang ingin kamu capai besok?",
    icon: Rocket,
    theme: {
      grad: "from-indigo-500 to-violet-500",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-500",
      labelText: "text-indigo-600",
      ring: "focus-visible:ring-indigo-400",
      strip: "from-indigo-400 to-violet-400",
      shadow: "shadow-[0_4px_14px_rgba(99,102,241,0.12)]",
    },
    emoji: "🚀",
  },
];

export default function WeeklyReflection() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    difficulties: "",
    improvements: "",
    targets: "",
  });

  const filledCount = Object.values(formData).filter((v) => v.trim() !== "").length;

  const handleSubmit = async () => {
    if (!formData.difficulties || !formData.improvements || !formData.targets) {
      toast.error("Ups! Isi semua kotaknya dulu ya sebelum dikirim.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/reflections", {
        category: "mingguan",
        content: formData.difficulties,
        improvements: formData.improvements,
        targets: formData.targets,
        activity_id: null,
      });
      toast.success("Keren! Refleksi mingguanmu sudah tersimpan. 🚀");
      setSubmitted(true);
    } catch {
      toast.error("Gagal mengirim data. Coba cek internetmu ya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5fb] pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        .float { animation: floaty 2.6s ease-in-out infinite; }
        @keyframes shine { 0% { transform: translateX(-100%) } 100% { transform: translateX(220%) } }
        .shine { position: relative; overflow: hidden; }
        .shine::after {
          content: ''; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: shine 2.8s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-slate-400">
              Refleksi Diri
            </p>
            <h2 className="font-display text-[28px] font-extrabold text-slate-800 leading-tight">
              Mingguan Check-in
            </h2>
            <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed">
              Satu minggu telah berlalu! Mari kita lihat apa saja yang sudah kamu lalui.
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-2xl shadow-[0_2px_10px_rgba(99,102,241,0.12)] border border-indigo-50 flex-shrink-0 mt-1">
            <PencilLine className="text-indigo-500 float" size={22} />
          </div>
        </div>

        {/* ── PROGRESS TRACK ── */}
        <div className="rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-extrabold text-[14px] text-slate-800 flex items-center gap-1.5">
              <Heart className="text-rose-500" size={15} fill="currentColor" fillOpacity={0.2} /> Progress Refleksi
            </h3>
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {filledCount} / 3
            </span>
          </div>

          <div className="relative px-1 py-2">
            <div className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-2 bg-slate-100 rounded-full" />
            <div
              className="absolute left-1 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all duration-700"
              style={{ width: `calc(${(filledCount / 3) * 100}% - 4px)` }}
            />
            <div className="relative flex justify-between">
              {REFLECTION_FIELDS.map((field, i) => {
                const filled = formData[field.key].trim() !== "";
                const isCurrent = filled && i === filledCount - 1;
                return (
                  <div key={field.key} className="relative flex flex-col items-center">
                    {isCurrent && (
                      <Rocket
                        className="absolute -top-6 text-indigo-500 float"
                        size={14}
                        fill="currentColor"
                        fillOpacity={0.15}
                        style={{ transform: "rotate(45deg)" }}
                      />
                    )}
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-colors duration-300 ${
                        filled ? "bg-violet-400" : "bg-slate-200"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10.5px] mt-3 text-slate-500 text-center font-semibold">
            {filledCount === 3 ? (
              <span className="text-emerald-600 font-extrabold">Siap dikirim! 🎉</span>
            ) : (
              <>
                Tinggal <span className="text-indigo-600 font-extrabold">{3 - filledCount} lagi</span> untuk menyelesaikan
              </>
            )}
          </p>
        </div>

        {/* ── FORM FIELDS ── */}
        {submitted ? (
          <SubmittedState />
        ) : (
          <div className="space-y-3.5">
            {REFLECTION_FIELDS.map((field) => {
              const Icon = field.icon;
              const t = field.theme;
              return (
                <div
                  key={field.key}
                  className={`rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] overflow-hidden transition-all duration-300`}
                >
                  {/* Color strip */}
                  <div className={`h-1 bg-gradient-to-r ${t.strip}`} />

                  <div className="p-5 pt-4 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.iconBg} ${t.iconText}`}>
                        <Icon size={17} />
                      </div>
                      <div className="flex-1">
                        <label className={`text-[11px] font-extrabold ${t.labelText} uppercase tracking-wider`}>
                          {field.label}
                        </label>
                      </div>
                      {formData[field.key].trim() !== "" && (
                        <CheckCircle2 className="text-emerald-500" size={16} fill="currentColor" fillOpacity={0.15} />
                      )}
                    </div>

                    <textarea
                      className={`w-full text-[13px] leading-relaxed rounded-2xl border border-slate-100 bg-slate-50/80 p-4 min-h-[100px] outline-none resize-none font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 ${t.ring} transition-all`}
                      placeholder={field.placeholder}
                      value={formData[field.key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field.key]: e.target.value })
                      }
                    />
                  </div>
                </div>
              );
            })}

            {/* ── SUBMIT BUTTON ── */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full rounded-[1.75rem] p-3.5 flex items-center group relative overflow-hidden text-white font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${
                filledCount === 3
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_8px_24px_rgba(99,102,241,0.3)]"
                  : "bg-slate-400 shadow-[0_4px_14px_rgba(15,23,42,0.1)]"
              }`}
            >
              <div className="bg-white/20 p-3.5 rounded-full mr-4 transition-transform group-hover:scale-110 flex-shrink-0">
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </div>

              <div className="text-left flex-1">
                <p className="font-display text-lg font-extrabold leading-tight">
                  {loading ? "Menyimpan..." : "Simpan & Akhiri Minggu Ini"}
                </p>
                <p className="text-white/70 text-[11px] font-semibold mt-0.5">
                  Submit Weekly Reflection
                </p>
              </div>

              {/* Shine sweep */}
              {filledCount === 3 && (
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-y-0 -left-full w-1/3"
                    style={{
                      background:
                        "linear-gradient(115deg, transparent, rgba(255,255,255,0.2), transparent)",
                      animation: "shine 3s ease-in-out infinite",
                    }}
                  />
                </div>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 font-medium pt-1">
              Refleksi ini akan membantu gurumu memberikan feedback yang pas buat kamu! ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── SUBMITTED STATE ── */
const SubmittedState = () => (
  <div className="rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] p-8 relative overflow-hidden text-center">
    <div className="absolute top-4 left-6 w-2 h-2 bg-emerald-400 rounded-full opacity-60" />
    <div className="absolute top-8 right-10 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-50" />
    <div className="absolute bottom-6 left-12 w-1 h-1 bg-indigo-400 rounded-full opacity-40" />
    <div className="absolute top-12 left-1/2 w-2.5 h-2.5 bg-rose-400 rounded-full opacity-30" />

    <div className="relative z-10">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white mb-5 rotate-3 shadow-[0_8px_20px_rgba(52,211,153,0.35)]">
        <ShieldCheck size={32} fill="currentColor" fillOpacity={0.2} />
      </div>

      <h2 className="font-display text-2xl font-extrabold text-slate-800 mb-2">
        Refleksi Tersimpan! 🎉
      </h2>
      <p className="text-slate-500 text-sm font-medium mb-6">
        Minggu yang produktif! Guru kamu akan baca dan kasih feedback ya.
      </p>

      <a
        href="/student"
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md"
      >
        <ChevronLeft size={16} />
        Kembali ke Dashboard
      </a>
    </div>
  </div>
);