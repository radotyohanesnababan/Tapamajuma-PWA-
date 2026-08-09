import { useState, useEffect } from "react";
import { School, CheckCircle2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import devApi from "@/lib/devAxios";

export default function DeveloperDashboard() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [meta, setMeta] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    devApi.get("/api/developer/schools")
      .then((res) => {
        setSchools(res.data.data || []);
        setMeta(res.data.meta || { total: 0, active: 0 });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola seluruh sekolah dalam platform</p>
        </div>
        <button
          onClick={() => navigate("/developer/onboard-school")}
          className="bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg px-4 h-10 flex items-center gap-2 text-sm transition-colors"
        >
          <PlusCircle size={16} />
          Onboard Sekolah
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sekolah</p>
            <h3 className="text-3xl font-black text-slate-100 mt-1">{meta.total}</h3>
          </div>
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
            <School size={22} />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sekolah Aktif</p>
            <h3 className="text-3xl font-black text-slate-100 mt-1">{meta.active}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Daftar Sekolah</h3>
        <div className="space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500 text-center py-8">Memuat...</p>
          ) : schools.length > 0 ? (
            schools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-slate-200">{school.name}</p>
                  <p className="text-xs text-slate-500">{school.slug}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    school.is_active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {school.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">Belum ada sekolah terdaftar</p>
          )}
        </div>
      </div>
    </div>
  );
}