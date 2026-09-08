import { useState, useEffect } from "react";
import { Megaphone, Plus, X, Clock, Users, Globe, GraduationCap, School } from "lucide-react";
import { toast } from "sonner";
import devApi from "@/lib/devAxios";

const targetConfig = {
  all:     { label: "Semua",   icon: <Globe size={12} />,        color: "bg-violet-500/10 text-violet-400" },
  student: { label: "Siswa",   icon: <GraduationCap size={12} />, color: "bg-blue-500/10 text-blue-400" },
  teacher: { label: "Guru",    icon: <School size={12} />,       color: "bg-amber-500/10 text-amber-400" },
  admin:   { label: "Admin",   icon: <Users size={12} />,        color: "bg-rose-500/10 text-rose-400" },
};

export default function GlobalAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [saving, setSaving]               = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", target_role: "all", expires_at: "",
  });

  const load = () => {
    setLoading(true);
    devApi.get("/api/developer/announcements")
      .then((res) => setAnnouncements(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Judul dan konten wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await devApi.post("/api/developer/announcements", {
        ...form,
        expires_at: form.expires_at || null,
      });
      toast.success("Pengumuman berhasil dibuat dan dikirim");
      setShowForm(false);
      setForm({ title: "", content: "", target_role: "all", expires_at: "" });
      load();
    } catch (e) {
      toast.error("Gagal: " + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ann) => {
    try {
      await devApi.put(`/api/developer/announcements/${ann.id}`, { is_active: !ann.is_active });
      setAnnouncements((prev) => prev.map((a) => a.id === ann.id ? { ...a, is_active: !ann.is_active } : a));
      toast.success(ann.is_active ? "Pengumuman dinonaktifkan" : "Pengumuman diaktifkan kembali");
    } catch (e) {
      toast.error("Gagal mengubah status");
    }
  };

  const destroy = async (id) => {
    try {
      await devApi.delete(`/api/developer/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success("Pengumuman dihapus");
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Broadcast Pengumuman</h1>
          <p className="text-slate-500 mt-1 text-sm">Kirim pengumuman global dari Dinas ke seluruh sekolah</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 h-10 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold transition-colors"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Batal" : "Buat Pengumuman"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Megaphone size={16} className="text-violet-400" /> Buat Pengumuman Baru
          </h3>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">Judul Pengumuman</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Contoh: Libur Nasional Idul Adha"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-1.5 block">Isi Pengumuman</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
              placeholder="Tulis isi pengumuman di sini…"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Target Penerima</label>
              <select
                value={form.target_role}
                onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="all">Semua (Siswa, Guru, Admin)</option>
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Tanggal Kedaluwarsa (opsional)</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold disabled:opacity-50 transition-colors"
          >
            {saving ? "Mengirim…" : "Kirim ke Seluruh Sekolah"}
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500 text-center py-12">Memuat pengumuman…</p>
        ) : announcements.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Megaphone size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada pengumuman global</p>
          </div>
        ) : announcements.map((ann) => {
          const cfg = targetConfig[ann.target_role] || targetConfig.all;
          const isExpired = ann.expires_at && new Date(ann.expires_at) < new Date();
          return (
            <div
              key={ann.id}
              className={`bg-slate-900 border rounded-2xl p-5 transition-opacity ${
                !ann.is_active || isExpired ? "opacity-50 border-slate-800" : "border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {isExpired && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400">
                        <Clock size={10} /> Kedaluwarsa
                      </span>
                    )}
                    {!ann.is_active && !isExpired && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-500">Nonaktif</span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-200 text-base">{ann.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{ann.content}</p>
                  <p className="text-xs text-slate-600 mt-2">
                    Dibuat {new Date(ann.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    {ann.expires_at && ` · Kedaluwarsa ${new Date(ann.expires_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}`}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive(ann)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      ann.is_active ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    }`}
                  >
                    {ann.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    onClick={() => destroy(ann.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
