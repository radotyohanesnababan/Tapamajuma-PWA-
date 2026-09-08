import { useState } from "react";
import {
  ServerCog, Database, CheckCircle, XCircle, AlertTriangle,
  Play, RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import devApi from "@/lib/devAxios";

const StatusIcon = ({ status }) => {
  if (status === "ok")    return <CheckCircle size={16} className="text-emerald-400 shrink-0" />;
  if (status === "error") return <XCircle size={16} className="text-rose-400 shrink-0" />;
  return <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
};

export default function SystemMaintenance() {
  const [health, setHealth]         = useState(null);
  const [migrateResult, setMigrateResult] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingMigrate, setLoadingMigrate] = useState(false);
  const [expandedSchools, setExpandedSchools] = useState({});

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await devApi.get("/api/developer/maintenance/health");
      setHealth(res.data.data);
    } catch (e) {
      toast.error("Gagal cek health: " + (e.response?.data?.message || e.message));
    } finally {
      setLoadingHealth(false);
    }
  };

  const runMigrations = async () => {
    if (!confirm("Jalankan migrasi ke SEMUA sekolah aktif? Pastikan migrasi Anda sudah aman.")) return;
    setLoadingMigrate(true);
    setMigrateResult(null);
    try {
      const res = await devApi.post("/api/developer/maintenance/migrate-all");
      setMigrateResult(res.data);
      toast.success(res.data.message);
    } catch (e) {
      toast.error("Gagal: " + (e.response?.data?.message || e.message));
    } finally {
      setLoadingMigrate(false);
    }
  };

  const toggleExpand = (id) => setExpandedSchools((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Pemeliharaan Sistem</h1>
        <p className="text-slate-500 mt-1 text-sm">Cek konektivitas database dan jalankan migrasi ke seluruh tenant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Check Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-blue-400" />
              <h3 className="text-sm font-bold text-slate-300">Cek Koneksi Database</h3>
            </div>
            <button
              onClick={checkHealth}
              disabled={loadingHealth}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={13} className={loadingHealth ? "animate-spin" : ""} />
              {loadingHealth ? "Mengecek…" : "Cek Sekarang"}
            </button>
          </div>

          {health && (
            <div className="space-y-2">
              <div className="flex gap-4 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-400" /> {health.summary.healthy} sehat</span>
                {health.summary.errors > 0 && (
                  <span className="flex items-center gap-1"><XCircle size={12} className="text-rose-400" /> {health.summary.errors} error</span>
                )}
              </div>
              {health.schools.map((s) => (
                <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl ${s.status === "ok" ? "bg-slate-950/50" : "bg-rose-500/5 border border-rose-500/20"}`}>
                  <StatusIcon status={s.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-300 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{s.db_name}</p>
                  </div>
                  {s.status === "ok" && (
                    <span className="text-[10px] text-slate-500 shrink-0">{s.migration_count} migrations</span>
                  )}
                  {s.status === "error" && (
                    <span className="text-[10px] text-rose-400 shrink-0 max-w-[100px] truncate">{s.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Migrate All Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ServerCog size={18} className="text-violet-400" />
            <h3 className="text-sm font-bold text-slate-300">Migrasi Massal Tenant</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Menjalankan <code className="bg-slate-800 px-1 rounded text-slate-300">php artisan migrate</code> ke database milik seluruh sekolah aktif secara berurutan. Gunakan setelah deploy migration baru.
          </p>
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-400 flex items-start gap-1.5">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              Operasi ini berjalan secara sinkron dan mungkin memakan waktu beberapa menit tergantung jumlah sekolah.
            </p>
          </div>
          <button
            onClick={runMigrations}
            disabled={loadingMigrate}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold disabled:opacity-50 transition-colors"
          >
            {loadingMigrate
              ? <><RefreshCw size={15} className="animate-spin" /> Migrasi Berjalan…</>
              : <><Play size={15} /> Jalankan Migrasi ke Semua Sekolah</>
            }
          </button>

          {migrateResult && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-slate-400">{migrateResult.message}</p>
              {migrateResult.data?.map((r, i) => (
                <div key={i} className={`rounded-xl overflow-hidden border ${r.status === "success" ? "border-emerald-500/20" : "border-rose-500/20"}`}>
                  <button
                    onClick={() => toggleExpand(i)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left ${r.status === "success" ? "bg-emerald-500/5 text-emerald-400" : "bg-rose-500/5 text-rose-400"}`}
                  >
                    <StatusIcon status={r.status} />
                    <span className="flex-1">{r.school}</span>
                    {expandedSchools[i] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {expandedSchools[i] && r.output && (
                    <pre className="px-3 py-2 text-[10px] text-slate-400 bg-slate-950 overflow-auto max-h-32">{r.output || r.error}</pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
