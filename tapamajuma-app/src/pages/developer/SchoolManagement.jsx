import { useState, useEffect, useCallback } from "react";
import {
  Search, ExternalLink, Edit2, KeyRound, ToggleLeft, ToggleRight,
  AlertCircle, CheckCircle, Copy, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import devApi from "@/lib/devAxios";

export default function SchoolManagement() {
  const [schools, setSchools]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal state
  const [editModal, setEditModal]     = useState(null); // school object
  const [resetModal, setResetModal]   = useState(null); // school object
  const [resetResult, setResetResult] = useState(null); // { password, school_name }
  const [editForm, setEditForm]       = useState({});
  const [saving, setSaving]           = useState(false);
  const [impersonating, setImpersonating] = useState(null);
  const [showPwd, setShowPwd]         = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    devApi.get("/api/developer/schools")
      .then((res) => setSchools(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = schools.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" ||
                        (filterStatus === "active" && s.is_active) ||
                        (filterStatus === "inactive" && !s.is_active);
    return matchSearch && matchStatus;
  });

  const handleToggleStatus = async (school) => {
    try {
      const res = await devApi.patch(`/api/developer/schools/${school.id}/toggle-status`);
      setSchools((prev) => prev.map((s) =>
        s.id === school.id ? { ...s, is_active: res.data.is_active } : s
      ));
      toast.success(res.data.is_active ? `${school.name} diaktifkan` : `${school.name} dinonaktifkan`);
    } catch (e) {
      toast.error("Gagal mengubah status sekolah");
    }
  };

  const handleImpersonate = async (school) => {
    setImpersonating(school.id);
    try {
      const res = await devApi.post(`/api/developer/schools/${school.id}/impersonate`);
      window.open(res.data.redirect_url, "_blank");
      toast.success(`Membuka dashboard admin ${school.name}`);
    } catch (e) {
      toast.error("Gagal masuk sebagai admin sekolah: " + (e.response?.data?.message || e.message));
    } finally {
      setImpersonating(null);
    }
  };

  const handleOpenEdit = (school) => {
    setEditModal(school);
    setEditForm({
      name:           school.name || "",
      address:        school.address || "",
      phone:          school.phone || "",
      email:          school.email || "",
      principal_name: school.principal_name || "",
      principal_nip:  school.principal_nip || "",
      manager_name:   school.manager_name || "",
      manager_nip:    school.manager_nip || "",
    });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await devApi.put(`/api/developer/schools/${editModal.id}`, editForm);
      setSchools((prev) => prev.map((s) => s.id === editModal.id ? { ...s, ...res.data.data } : s));
      toast.success("Profil sekolah diperbarui");
      setEditModal(null);
    } catch (e) {
      toast.error("Gagal menyimpan: " + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setSaving(true);
    try {
      const res = await devApi.post(`/api/developer/schools/${resetModal.id}/reset-admin`);
      setResetResult({ password: res.data.new_password, school_name: resetModal.name });
      setResetModal(null);
      toast.success("Password admin berhasil direset");
    } catch (e) {
      toast.error("Gagal reset password: " + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Manajemen Sekolah</h1>
        <p className="text-slate-500 mt-1 text-sm">Kontrol dan pantau seluruh tenant sekolah</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau slug sekolah…"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        {["all", "active", "inactive"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              filterStatus === f ? "bg-violet-600 text-white" : "bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {f === "all" ? "Semua" : f === "active" ? "Aktif" : "Nonaktif"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <p className="text-sm text-slate-500 text-center py-16">Memuat data sekolah…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-16">Tidak ada sekolah ditemukan</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Sekolah</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Kepala Sekolah</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((school) => (
                <tr key={school.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-200">{school.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{school.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{school.principal_name || "–"}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggleStatus(school)} className="flex items-center gap-1.5 group">
                      {school.is_active
                        ? <ToggleRight size={20} className="text-emerald-400 group-hover:text-emerald-300" />
                        : <ToggleLeft size={20} className="text-slate-600 group-hover:text-slate-400" />
                      }
                      <span className={`text-xs font-semibold ${school.is_active ? "text-emerald-400" : "text-slate-500"}`}>
                        {school.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleImpersonate(school)}
                        disabled={impersonating === school.id}
                        title="Masuk sebagai Admin Sekolah"
                        className="p-2 rounded-lg bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
                      >
                        <ExternalLink size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(school)}
                        title="Edit Profil Sekolah"
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setResetModal(school)}
                        title="Reset Password Admin"
                        className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        <KeyRound size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-black text-slate-100">Edit Profil Sekolah</h2>
            <p className="text-sm text-slate-500">{editModal.name}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "name", label: "Nama Sekolah" },
                { key: "address", label: "Alamat" },
                { key: "phone", label: "Telepon" },
                { key: "email", label: "Email" },
                { key: "principal_name", label: "Nama Kepala Sekolah" },
                { key: "principal_nip", label: "NIP Kepala Sekolah" },
                { key: "manager_name", label: "Nama Pengurus" },
                { key: "manager_nip", label: "NIP Pengurus" },
              ].map(({ key, label }) => (
                <div key={key} className={key === "name" || key === "address" ? "col-span-2" : ""}>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">{label}</label>
                  <input
                    value={editForm[key] || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditModal(null)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 text-sm font-semibold">Batal</button>
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold disabled:opacity-50">
                {saving ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Confirm Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={22} className="text-amber-400 shrink-0" />
              <h2 className="text-base font-black text-slate-100">Reset Password Admin</h2>
            </div>
            <p className="text-sm text-slate-400">
              Password superadmin <strong className="text-slate-200">{resetModal.name}</strong> akan direset. Password baru akan ditampilkan sekali saja.
            </p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setResetModal(null)} className="flex-1 py-2 rounded-lg border border-slate-700 text-slate-400 text-sm font-semibold">Batal</button>
              <button onClick={handleResetPassword} disabled={saving} className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold disabled:opacity-50">
                {saving ? "Mereset…" : "Ya, Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Result Modal */}
      {resetResult && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={22} className="text-emerald-400 shrink-0" />
              <h2 className="text-base font-black text-slate-100">Password Berhasil Direset</h2>
            </div>
            <p className="text-sm text-slate-400">Password baru admin <strong className="text-slate-200">{resetResult.school_name}</strong>:</p>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3">
              <span className="flex-1 font-mono text-base text-slate-100 tracking-wider">
                {showPwd ? resetResult.password : "•".repeat(resetResult.password.length)}
              </span>
              <button onClick={() => setShowPwd((v) => !v)} className="text-slate-500 hover:text-slate-300">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(resetResult.password); toast.success("Disalin!"); }} className="text-slate-500 hover:text-slate-300">
                <Copy size={16} />
              </button>
            </div>
            <p className="text-xs text-amber-400">⚠ Simpan password ini segera. Tidak akan ditampilkan lagi.</p>
            <button onClick={() => setResetResult(null)} className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
