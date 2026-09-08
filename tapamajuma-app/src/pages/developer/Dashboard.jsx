import { useState, useEffect } from "react";
import {
  School, CheckCircle2, PlusCircle, Users, BookOpen,
  TrendingUp, RefreshCw, AlertTriangle, CircleDot, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import devApi from "@/lib/devAxios";

const statusConfig = {
  sangat_aktif:    { label: "Sangat Aktif", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  aktif:           { label: "Aktif",        color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  perlu_perhatian: { label: "Perlu Perhatian", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  pasif:           { label: "Pasif",        color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  error:           { label: "Error",        color: "bg-slate-700 text-slate-400 border-slate-600" },
};

const MetricCard = ({ label, value, icon, color }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-black text-slate-100 mt-1">
        {value === null ? <span className="text-slate-600 text-xl">Memuat…</span> : value.toLocaleString('id-ID')}
      </h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
  </div>
);

export default function DeveloperDashboard() {
  const navigate = useNavigate();
  const [schools, setSchools]       = useState([]);
  const [meta, setMeta]             = useState({ total: 0, active: 0 });
  const [metrics, setMetrics]       = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    devApi.get("/api/developer/schools")
      .then((res) => {
        setSchools(res.data.data || []);
        setMeta(res.data.meta || { total: 0, active: 0 });
      })
      .catch(console.error)
      .finally(() => setLoadingMeta(false));

    fetchMetrics(false);
    fetchLeaderboard();
  }, []);

  const fetchMetrics = (refresh = false) => {
    setLoadingMetrics(true);
    setRefreshing(refresh);
    devApi.get("/api/developer/analytics/ecosystem", { params: { refresh: refresh ? 1 : 0 } })
      .then((res) => setMetrics(res.data.data))
      .catch(console.error)
      .finally(() => { setLoadingMetrics(false); setRefreshing(false); });
  };

  const fetchLeaderboard = () => {
    devApi.get("/api/developer/analytics/leaderboard")
      .then((res) => setLeaderboard(res.data.data || []))
      .catch(console.error);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Dashboard Eksekutif</h1>
          <p className="text-slate-500 mt-1 text-sm">Ringkasan kinerja platform secara keseluruhan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 h-10 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Segarkan Data
          </button>
          <button
            onClick={() => navigate("/developer/onboard-school")}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg px-4 h-10 flex items-center gap-2 text-sm transition-colors"
          >
            <PlusCircle size={16} />
            Onboard Sekolah
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Sekolah Aktif"    value={loadingMeta ? null : meta.active}                      icon={<School size={22} />}   color="bg-violet-500/10 text-violet-400" />
        <MetricCard label="Total Siswa"            value={loadingMetrics ? null : metrics?.total_students}        icon={<Users size={22} />}    color="bg-blue-500/10 text-blue-400" />
        <MetricCard label="Total Guru"             value={loadingMetrics ? null : metrics?.total_teachers}        icon={<BookOpen size={22} />} color="bg-amber-500/10 text-amber-400" />
        <MetricCard label="Aktivitas Bulan Ini"    value={loadingMetrics ? null : metrics?.total_activities_this_month} icon={<Activity size={22} />} color="bg-emerald-500/10 text-emerald-400" />
      </div>

      {/* Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-violet-400" />
          <h3 className="text-sm font-bold text-slate-300">Papan Peringkat Sekolah</h3>
          <span className="text-xs text-slate-500 ml-auto">Berdasarkan tingkat adopsi 14 hari terakhir</span>
        </div>
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Memuat data leaderboard…</p>
          ) : leaderboard.map((school, idx) => {
            const cfg = statusConfig[school.status] || statusConfig.error;
            return (
              <div key={school.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/40 transition-colors">
                <span className="text-lg font-black text-slate-600 w-6 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">{school.name}</p>
                  <p className="text-xs text-slate-500">{school.total_students ?? '–'} siswa · {school.active_students_14d ?? '–'} aktif</p>
                </div>
                <div className="text-right mr-2">
                  <p className="text-lg font-black text-slate-100">{school.adoption_rate ?? '–'}<span className="text-xs font-normal text-slate-500">%</span></p>
                  <p className="text-[10px] text-slate-500">Adopsi</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider whitespace-nowrap ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schools quick list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-slate-300 mb-4">Daftar Sekolah Terdaftar</h3>
        <div className="space-y-2">
          {loadingMeta ? (
            <p className="text-sm text-slate-500 text-center py-8">Memuat…</p>
          ) : schools.length > 0 ? (
            schools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => navigate("/developer/schools")}
              >
                <div>
                  <p className="text-sm font-bold text-slate-200">{school.name}</p>
                  <p className="text-xs text-slate-500">{school.slug}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  school.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"
                }`}>
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