import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import devApi from "@/lib/devAxios";

const initialForm = {
  name: "",
  slug: "",
  address: "",
  phone: "",
  email: "",
  principal_name: "",
  principal_nip: "",
  manager_name: "",
  manager_nip: "",
};

export default function OnboardSchool() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // auto-generate slug dari nama, kecuali user udah edit slug manual
    if (name === "name") {
      setForm((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, ""),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);

    try {
      const res = await devApi.post("/api/developer/onboard-school", form);
      setSuccess(res.data.data);
      toast.success("Sekolah berhasil di-onboard!");
      setForm(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.message || "Onboarding gagal");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Nama Sekolah", required: true, placeholder: "SMP Negeri 5 Siborongborong" },
    { name: "slug", label: "Slug", required: true, placeholder: "smpn5siborongborong" },
    { name: "address", label: "Alamat", placeholder: "Jl. Pendidikan No. 5" },
    { name: "phone", label: "Telepon", placeholder: "0633-00000" },
    { name: "email", label: "Email", placeholder: "info@smpn5siborongborong.sch.id" },
    { name: "principal_name", label: "Nama Kepala Sekolah", placeholder: "Drs. Nama, M.Pd" },
    { name: "principal_nip", label: "NIP Kepala Sekolah", placeholder: "196505101990031005" },
    { name: "manager_name", label: "Nama Manager", placeholder: "Nama, S.Pd" },
    { name: "manager_nip", label: "NIP Manager", placeholder: "197802152005012008" },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/developer")}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Onboard Sekolah Baru</h1>
          <p className="text-slate-500 mt-1 text-sm">Buat database, migrasi, seeder, dan academic period otomatis</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-400">Sekolah berhasil dibuat</p>
            <p className="text-xs text-slate-400 mt-1">
              {success.name} ({success.slug}) sudah aktif dan siap dipakai.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {field.label}
              {field.required && <span className="text-rose-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500"
            />
          </div>
        ))}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg h-11 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Memproses (buat DB, migrasi, seeder)...
              </>
            ) : (
              <>
                <School size={18} />
                Onboard Sekolah
              </>
            )}
          </button>
          {loading && (
            <p className="text-xs text-slate-500 text-center mt-2">
              Proses ini bisa memakan waktu beberapa detik, mohon tunggu.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}