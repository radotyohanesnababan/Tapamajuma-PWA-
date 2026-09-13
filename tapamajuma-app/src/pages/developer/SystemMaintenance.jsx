import { useState } from "react";
import {
  ServerCog, Database, CheckCircle, XCircle, AlertTriangle,
  Play, RefreshCw, X, Terminal, AlertOctagon, Info,
} from "lucide-react";
import { toast } from "sonner";
import devApi from "@/lib/devAxios";

/* Status Icon */
const StatusIcon = ({ status }) => {
  if (status === "ok" || status === "success")
    return <CheckCircle size={15} className="text-emerald-400 shrink-0" />;
  if (status === "error" || status === "failed")
    return <XCircle size={15} className="text-rose-400 shrink-0" />;
  return <AlertTriangle size={15} className="text-amber-400 shrink-0" />;
};

/* Detail Modal */
function DetailModal({ item, onClose }) {
  if (!item) return null;
  const isError = item.status === "error" || item.status === "failed";
  const content = item.error || item.output || "(tidak ada detail)";
  const title   = isError ? "Detail Error" : "Output Migrasi";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className={`px-5 py-4 flex items-center justify-between border-b ${isError ? "border-rose-500/20 bg-rose-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
          <div className="flex items-center gap-2.5">
            {isError ? <AlertOctagon size={16} className="text-rose-400" /> : <Terminal size={16} className="text-emerald-400" />}
            <div>
              <p className={`text-sm font-bold ${isError ? "text-rose-300" : "text-emerald-300"}`}>{title}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                {item.school || item.name}{(item.slug || item.db_name) ? ` · ${item.slug || item.db_name}` : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition">
            <X size={16} />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-80">
          <pre className={`text-[11px] leading-relaxed whitespace-pre-wrap break-words font-mono ${isError ? "text-rose-300" : "text-slate-300"}`}>
            {content}
          </pre>
        </div>
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* Main Component */
export default function SystemMaintenance() {
  const [health, setHealth]                 = useState(null);
  const [migrateResult, setMigrateResult]   = useState(null);
  const [loadingHealth, setLoadingHealth]   = useState(false);
  const [loadingMigrate, setLoadingMigrate] = useState(false);
  const [modalItem, setModalItem]           = useState(null);

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

  return (
    <>
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
              <button onClick={checkHealth} disabled={loadingHealth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50 transition-colors">
                <RefreshCw size={13} className={loadingHealth ? "animate-spin" : ""} />
                {loadingHealth ? "Mengecek…" : "Cek Sekarang"}
              </button>
            </div>

            {health && (
              <div className="space-y-2">
                <div className="flex gap-3 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-400" />{health.summary.healthy} sehat</span>
                  {health.summary.errors > 0 && (
                    <span className="flex items-center gap-1"><XCircle size={12} className="text-rose-400" />{health.summary.errors} error</span>
                  )}
                </div>
                {health.schools.map((s) => (
                  <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl ${s.status === "ok" ? "bg-slate-950/50" : "bg-rose-500/5 border border-rose-500/20"}`}>
                    <StatusIcon status={s.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-300 truncate">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{s.db_name}</p>
                    </div>
                    {s.status === "ok" && <span className="text-[10px] text-slate-500 shrink-0">{s.migration_count} migrations</span>}
                    {s.status === "error" && (
                      <button onClick={() => setModalItem(s)}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold transition">
                        <Info size={10} /> Lihat Error
                      </button>
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
              Menjalankan <code className="bg-slate-800 px-1 rounded text-slate-300">php artisan migrate</code> ke database
              milik seluruh sekolah aktif secara berurutan. Gunakan setelah deploy migration baru.
            </p>
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400 flex items-start gap-1.5">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                Operasi ini berjalan secara sinkron dan mungkin memakan waktu beberapa menit.
              </p>
            </div>
            <button onClick={runMigrations} disabled={loadingMigrate}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold disabled:opacity-50 transition-colors">
              {loadingMigrate
                ? <><RefreshCw size={15} className="animate-spin" /> Migrasi Berjalan…</>
                : <><Play size={15} /> Jalankan Migrasi ke Semua Sekolah</>
              }
            </button>

            {migrateResult && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-400">{migrateResult.message}</p>
                {migrateResult.data?.map((r, i) => {
                  const isErr     = r.status === "error" || r.status === "failed";
                  const hasDetail = !!(r.error || r.output);
                  return (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${isErr ? "bg-rose-500/5 border-rose-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
                      <StatusIcon status={r.status} />
                      <span className={`flex-1 text-xs font-semibold truncate ${isErr ? "text-rose-300" : "text-emerald-300"}`}>{r.school}</span>
                      <span className={`text-[10px] font-mono shrink-0 ${isErr ? "text-rose-500" : "text-emerald-600"}`}>{r.slug}</span>
                      {hasDetail && (
                        <button onClick={() => setModalItem(r)}
                          className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${isErr ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400" : "bg-slate-700/60 hover:bg-slate-700 text-slate-400"}`}>
                          {isErr ? <><Info size={10} /> Lihat Error</> : <><Terminal size={10} /> Output</>}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      <DetailModal item={modalItem} onClose={() => setModalItem(null)} />
    </>
  );
}
