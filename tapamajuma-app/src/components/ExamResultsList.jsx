import React, { useState, useEffect } from "react";
import {
  Search, Printer, CheckCircle2, XCircle,
  ChevronLeft, Filter, ArrowLeft, Hash,
  AlertCircle
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

const ExamResultsList = ({ exam, setView }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("Semua");
  const [availableClasses, setAvailableClasses] = useState(["Semua"]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/teacher/cbt/exams/${exam.id}/results`);
      const data = res.data.data || [];
      setResults(data);
      const classes = [
        "Semua",
        ...new Set(
          data
            .map((item) => item.user?.student_class?.name)
            .filter(Boolean)
        ),
      ].sort();
      setAvailableClasses(classes);
    } catch {
      toast.error("Gagal memuat daftar nilai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [exam.id]);

  const handlePrint = () => {
    window.print();
  };

  const filteredResults = results.filter((r) => {
    const matchName = r.user?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchClass =
      selectedClass === "Semua" ||
      r.user?.student_class?.name === selectedClass;
    return matchName && matchClass;
  });

  // Derived stats
  const passCount = filteredResults.filter((r) => r.score >= 75).length;
  const failCount = filteredResults.length - passCount;
  const avgScore =
    filteredResults.length > 0
      ? Math.round(
          filteredResults.reduce((sum, r) => sum + r.score, 0) /
            filteredResults.length
        )
      : 0;

  return (
    <div className="space-y-3 print:space-y-2 print:bg-white print:m-0 print:p-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @media print {
          nav, footer, .bottom-nav, [role="navigation"], .fixed.bottom-0 {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
       D}
      `}</style>

      {/* ═══ HEADER (web only) ═══ */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-600 uppercase tracking-wider mb-1"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
          <h2 className="text-sm font-semibold text-slate-800">
            {exam.title}
          </h2>
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
            Laporan Hasil Ujian
          </p>
        </div>

        {filteredResults.length > 0 && (
          <button
            onClick={handlePrint}
            className="h-8 px-3 rounded-lg bg-slate-800 text-white text-[10px] font-semibold flex items-center gap-1.5 hover:bg-slate-700 transition border-none"
          >
            <Printer size={12} /> Cetak
          </button>
        )}
      </div>

      {/* ═══ FILTER BAR (web only) ═══ */}
      <div className="flex gap-2 print:hidden">
        <div className="relative flex-1">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari siswa..."
            className="w-full h-8 pl-7 pr-3 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
        >
          {availableClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls === "Semua" ? "Semua Kelas" : cls}
            </option>
          ))}
        </select>
      </div>

      {/* ═══ SUMMARY BAR (web only) ═══ */}
      {!loading && filteredResults.length > 0 && (
        <div className="grid grid-cols-3 gap-2 print:hidden">
          <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-center">
            <p className="font-mono text-base font-bold text-slate-800 leading-none">
              {avgScore}
            </p>
            <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Rata-rata
            </p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-center">
            <p className="font-mono text-base font-bold text-emerald-600 leading-none">
              {passCount}
            </p>
            <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Tuntas
            </p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-center">
            <p className="font-mono text-base font-bold text-rose-600 leading-none">
              {failCount}
            </p>
            <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Remedial
            </p>
          </div>
        </div>
      )}

      {/* ═══ PRINT HEADER (print only) ═══ */}
      <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-lg font-bold uppercase">
          Laporan Hasil Ujian CBT
        </h1>
        <h2 className="text-sm font-bold uppercase">{exam.title}</h2>
        <p className="text-xs">
          {selectedClass === "Semua" ? "Semua Kelas" : `Kelas ${selectedClass}`}{" "}
          · {exam.subject?.name}
        </p>
      </div>

      {/* ═══ TABLE ═══ */}
      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden print:rounded-none print:border-none print:shadow-none">
        <table className="w-full text-left border-collapse print:text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 print:bg-gray-200 print:border-b print:border-black text-[8px] print:text-[10px] font-semibold text-slate-500 print:text-black uppercase tracking-wider">
              <th className="py-2 px-3 w-8 print:p-1.5 print:border-r print:border-black">
                No
              </th>
              <th className="py-2 px-3 print:p-1.5 print:border-r print:border-black">
                Nama
              </th>
              <th className="py-2 px-3 w-14 print:p-1.5 print:border-r print:border-black">
                Kelas
              </th>
              <th className="py-2 px-3 w-10 text-center print:p-1.5 print:border-r print:border-black">
                ✓
              </th>
              <th className="py-2 px-3 w-10 text-center print:p-1.5 print:border-r print:border-black">
                ✗
              </th>
              <th className="py-2 px-3 w-12 text-center print:p-1.5 print:border-r print:border-black">
                Skor
              </th>
              <th className="py-2 px-3 w-14 text-center print:p-1.5 print:hidden">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 print:divide-y print:divide-black">
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="py-16 text-center text-[11px] text-slate-400"
                >
                  Memproses data...
                </td>
              </tr>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((res, index) => {
                const isPass = res.score >= 75;
                return (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50 transition print:border-b print:border-black"
                  >
                    <td className="py-2 px-3 print:p-1.5 print:border-r print:border-black">
                      <span className="font-mono text-[10px] text-slate-400 print:text-black">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 px-3 print:p-1.5 print:border-r print:border-black">
                      <span className="text-[11px] font-semibold text-slate-800 print:text-black">
                        {res.user?.name}
                      </span>
                    </td>
                    <td className="py-2 px-3 print:p-1.5 print:border-r print:border-black">
                      <span className="text-[10px] font-medium text-slate-500 print:text-black">
                        {res.user?.student_class?.name || "—"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center print:p-1.5 print:border-r print:border-black">
                      <span className="font-mono text-[11px] font-bold text-emerald-600 print:text-black">
                        {res.correct_answers}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center print:p-1.5 print:border-r print:border-black">
                      <span className="font-mono text-[11px] font-bold text-rose-500 print:text-black">
                        {res.wrong_answers}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center print:p-1.5 print:border-r print:border-black">
                      <span
                        className={`font-mono text-[12px] font-bold print:text-black ${
                          isPass
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {res.score}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center print:hidden">
                      <span
                        className={`text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          isPass
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {isPass ? "Tuntas" : "Remedial"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-16 text-center text-[11px] text-slate-400 uppercase tracking-wider print:text-black"
                >
                  Belum ada data nilai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamResultsList;