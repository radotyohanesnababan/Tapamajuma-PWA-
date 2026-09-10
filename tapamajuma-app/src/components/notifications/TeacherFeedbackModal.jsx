import { X, Sparkles, MessageSquareHeart, CheckCircle2, Target, TrendingUp, Calendar } from "lucide-react";

export default function TeacherFeedbackModal({ item, isOpen, onClose }) {
  if (!isOpen || !item) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-6 text-white relative overflow-hidden">
          <Sparkles className="absolute right-4 top-4 text-white/20" size={64} />
          <div className="flex items-center justify-between relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
              <MessageSquareHeart size={14} /> Balasan Guru
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X size={18} />
            </button>
          </div>
          <h2 className="text-xl font-black mt-3 relative z-10 tracking-tight">
            Tanggapan Refleksi
          </h2>
          <p className="text-xs text-indigo-100 mt-1 relative z-10">
            Guru telah membaca dan memberikan umpan balik untuk refleksi belajarmu.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Kotak Feedback Guru */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Pesan dari Guru
              </span>
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                <Calendar size={11} /> {formatDate(item.created_at)}
              </span>
            </div>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed italic bg-white/70 p-3 rounded-xl border border-emerald-100 shadow-sm">
              &ldquo;{item.content}&rdquo;
            </p>
          </div>

          {/* Detail Refleksi Siswa */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Refleksi yang Kamu Kirimkan
            </p>

            {item.improvements && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                  <TrendingUp size={12} className="text-indigo-500" /> Hal yang ingin diperbaiki
                </div>
                <p className="text-xs text-slate-700 font-medium">{item.improvements}</p>
              </div>
            )}

            {item.targets && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                  <Target size={12} className="text-amber-500" /> Target belajar berikutnya
                </div>
                <p className="text-xs text-slate-700 font-medium">{item.targets}</p>
              </div>
            )}

            {item.student_content && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Isi Jurnal Refleksi</p>
                <p className="text-xs text-slate-700 font-medium">{item.student_content}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            Terima Kasih, Mengerti ✓
          </button>
        </div>
      </div>
    </div>
  );
}
