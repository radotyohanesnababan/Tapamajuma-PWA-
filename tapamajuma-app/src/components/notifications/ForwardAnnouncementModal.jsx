import { useState } from "react";
import { X, Globe, Users, GraduationCap, School, Share2, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function ForwardAnnouncementModal({ announcement, isOpen, onClose, onSuccess }) {
  const [targetRole, setTargetRole] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !announcement) return null;

  const handleForward = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/api/admin/announcements/forward-global", {
        global_announcement_id: announcement.raw_id,
        target_role: targetRole,
      });
      toast.success("Pengumuman berhasil diteruskan ke sekolah!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal meneruskan pengumuman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = [
    {
      value: "all",
      label: "Semua Warga Sekolah",
      desc: "Diteruskan ke seluruh Dewan Guru dan Siswa",
      icon: <Users size={18} className="text-indigo-500" />,
    },
    {
      value: "teacher",
      label: "Khusus Dewan Guru",
      desc: "Hanya tampil di lonceng notifikasi Guru",
      icon: <School size={18} className="text-amber-500" />,
    },
    {
      value: "student",
      label: "Khusus Siswa",
      desc: "Hanya tampil di lonceng notifikasi Siswa",
      icon: <GraduationCap size={18} className="text-blue-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Teruskan Pengumuman</h3>
              <p className="text-[11px] text-slate-400">Salin informasi dinas ke lingkungan sekolah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              <Globe size={12} /> Dari Stakeholder / Dinas
            </div>
            <p className="text-xs font-bold text-slate-800 line-clamp-1">{announcement.title}</p>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{announcement.content}</p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Pilih Sasaran Distribusi</label>
            <div className="space-y-2">
              {options.map((opt) => (
                <label
                  key={opt.value}
                  onClick={() => setTargetRole(opt.value)}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    targetRole === opt.value
                      ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="mt-0.5">{opt.icon}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  <input
                    type="radio"
                    name="targetRole"
                    value={opt.value}
                    checked={targetRole === opt.value}
                    onChange={() => setTargetRole(opt.value)}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleForward}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Meneruskan...
              </>
            ) : (
              <>
                <Share2 size={14} /> Teruskan Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
