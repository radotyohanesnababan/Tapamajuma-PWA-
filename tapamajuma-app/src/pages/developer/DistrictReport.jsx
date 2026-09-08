import { useState } from "react";
import { Calendar, Download, TrendingUp, BookOpen, Users, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import devApi from "@/lib/devAxios";

export default function DistrictReport() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate]   = useState(() => new Date().toISOString().split("T")[0]);
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await devApi.get("/api/developer/reports/district-summary", {
        params: { start_date: startDate, end_date: endDate },
      });
      setReport(res.data.data);
    } catch (e) {
      toast.error("Gagal mengambil laporan: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const adoptionColor = (rate) => {
    if (rate >= 70) return "text-emerald-400";
    if (rate >= 40) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Laporan Daerah</h1>
        <p className="text-slate-500 mt-1 text-sm">Rekapitulasi keaktifan belajar se-kabupaten</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1.5 block">Dari Tanggal</label>
          <input
            type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 mb-1.5 block">Sampai Tanggal</label>
          <input
            type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
          />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="h-10 px-5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <BarChart2 size={15} />
          {loading ? "Memuat…" : "Generate Laporan"}
        </button>
      </div>

      {report && (
        <>
          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Sekolah", value: report.schools.length, icon: <TrendingUp size={20} />, color: "text-violet-400 bg-violet-500/10" },
              { label: "Total Siswa", value: report.totals.students, icon: <Users size={20} />, color: "text-blue-400 bg-blue-500/10" },
              { label: "Total Aktivitas", value: report.totals.activities, icon: <BookOpen size={20} />, color: "text-emerald-400 bg-emerald-500/10" },
              { label: "Literasi", value: report.totals.literacy, icon: <BookOpen size={20} />, color: "text-amber-400 bg-amber-500/10" },
            ].map((m) => (
              <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</p>
                  <h3 className="text-2xl font-black text-slate-100 mt-1">{m.value?.toLocaleString("id-ID")}</h3>
                </div>
                <div className={`p-3 rounded-xl ${m.color}`}>{m.icon}</div>
              </div>
            ))}
          </div>

          {/* Per-school table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300">Peringkat Per Sekolah</h3>
              <span className="text-xs text-slate-500">
                Periode: {report.period.start} s.d {report.period.end}
              </span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">#</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Sekolah</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-right">Siswa</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-right">Aktif</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-right">Aktivitas</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-right">Adopsi</th>
                </tr>
              </thead>
              <tbody>
                {report.schools.map((s, idx) => (
                  <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-slate-600 font-bold">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-200">{s.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{s.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-300">{s.total_students}</td>
                    <td className="px-5 py-3 text-right text-slate-300">{s.active_students}</td>
                    <td className="px-5 py-3 text-right text-slate-300">{s.total_activities}</td>
                    <td className={`px-5 py-3 text-right font-black ${adoptionColor(s.adoption_rate)}`}>
                      {s.adoption_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
