import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Printer, Users, Loader2, Calendar,
  ArrowLeft, FileText, Hash
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function SesiPrint() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const [teacherName, setTeacherName] = useState("Memuat...");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [attendances, setAttendances] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 1. Ambil profil guru & kelas
  useEffect(() => {
    api
      .get("/api/user")
      .then((res) => setTeacherName(res.data.name))
      .catch(() => setTeacherName("________________________"));

    api
      .get("/api/teacher/accessible-classes")
      .then((res) => setClasses(res.data))
      .catch(() => toast.error("Gagal memuat daftar kelas."));
  }, []);

  // 2. Fetch rekapitulasi
  const fetchAttendances = async (classId, start, end) => {
    if (!classId) return setAttendances([]);
    setIsLoading(true);
    try {
      const res = await api.get("/api/teacher/print-session", {
        params: { class_id: classId, start_date: start, end_date: end },
      });
      setAttendances(res.data);
      setSelectedStudent(null);
    } catch {
      toast.error("Gagal memuat rekapitulasi sesi.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Auto-fetch saat filter berubah
  useEffect(() => {
    if (selectedClass) {
      fetchAttendances(selectedClass, startDate, endDate);
    }
  }, [selectedClass, startDate, endDate]);

  const handlePrint = () => {
    setIsPrinting(true);
    setSelectedStudent(null);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  // Hitung summary
  const totalActive = attendances.reduce((sum, a) => sum + (a.total_active || 0), 0);
  const maxActive = attendances.length > 0 ? Math.max(...attendances.map((a) => a.total_active || 0)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 print:bg-white print:pb-0">
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
        }
      `}</style>

      {/* ═══ STICKY HEADER (web only) ═══ */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between z-20 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition active:scale-95"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Cetak Rekap Sesi</h2>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
              Laporan Keaktifan
            </p>
          </div>
        </div>

        {attendances.length > 0 && (
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="h-9 px-4 bg-slate-800 text-white rounded-lg text-[11px] font-semibold flex items-center gap-2 hover:bg-slate-700 transition active:scale-[0.98] disabled:opacity-50 border-none"
          >
            {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
            Cetak
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 print:mt-0 print:p-0 print:max-w-none space-y-4">

        {/* ═══ JUDUL LAPORAN (visible di print) ═══ */}
        <div className="print:mb-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-base font-bold text-slate-800 print:text-lg">
              Rekapitulasi Keaktifan Siswa — Sesi Pagi
            </h1>
            <div className="hidden print:block text-[10px] text-slate-600 font-mono">
              {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 print:hidden">
            Pilih parameter untuk melihat rekapitulasi sesi belajar mandiri.
          </p>
        </div>

        {/* ═══ FILTER (web only) ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-3 space-y-2.5 print:hidden">
          <div className="flex gap-2">
            {/* Kelas */}
            <div className="flex-1">
              <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Kelas
              </label>
              <select
                className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer appearance-none"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">— Pilih —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dari */}
            <div className="flex-1">
              <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Dari
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>

            {/* Sampai */}
            <div className="flex-1">
              <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Sampai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>
          </div>
        </div>

        {/* ═══ SUMMARY BAR ═══ */}
        {!isLoading && attendances.length > 0 && (
          <div className="grid grid-cols-3 gap-2 print:hidden">
            <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-center">
              <p className="font-mono text-base font-bold text-slate-800 leading-none">
                {attendances.length}
              </p>
              <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Siswa</p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-center">
              <p className="font-mono text-base font-bold text-emerald-600 leading-none">
                {totalActive}
              </p>
              <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Aktif</p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-center">
              <p className="font-mono text-base font-bold text-slate-800 leading-none">
                {maxActive}x
              </p>
              <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Tertinggi</p>
            </div>
          </div>
        )}

        {/* ═══ TABEL ═══ */}
        {isLoading ? (
          <div className="flex flex-col items-center py-10 print:hidden">
            <Loader2 className="animate-spin h-6 w-6 text-slate-400 mb-3" />
            <p className="text-[11px] font-medium text-slate-500">Merekap data...</p>
          </div>
        ) : attendances.length > 0 ? (
          <div className="space-y-3">
            {/* Periode caption untuk print */}
            <div className="hidden print:block text-center text-sm text-slate-700 mb-4 border-b border-slate-300 pb-2">
              Periode: {new Date(startDate).toLocaleDateString("id-ID")} — {new Date(endDate).toLocaleDateString("id-ID")}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 print:border-black print:rounded-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 print:bg-white print:border-black">
                    <th className="py-2.5 px-3 text-[8px] font-semibold text-slate-500 uppercase tracking-wider print:text-black print:border-b print:border-black print:text-[10px] w-10">
                      No
                    </th>
                    <th className="py-2.5 px-3 text-[8px] font-semibold text-slate-500 uppercase tracking-wider print:text-black print:border-b print:border-black print:text-[10px]">
                      Nama Siswa
                    </th>
                    <th className="py-2.5 px-3 text-[8px] font-semibold text-slate-500 uppercase tracking-wider print:text-black print:border-b print:border-black print:text-[10px] text-center w-20">
                      Aktif
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {attendances.map((item, index) => {
                    const isHigh = item.total_active >= maxActive * 0.8;
                    const isLow = item.total_active <= maxActive * 0.3 && maxActive > 0;

                    return (
                      <React.Fragment key={index}>
                        {/* Baris utama */}
                        <tr
                          onClick={() =>
                            setSelectedStudent(selectedStudent === index ? null : index)
                          }
                          className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition print:border-slate-300 print:cursor-default"
                        >
                          {/* No */}
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 print:text-black">
                            {index + 1}
                          </td>

                          {/* Nama */}
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] font-semibold text-slate-800 print:text-black">
                              {item.student_name}
                            </span>
                            <span className="text-[8px] text-slate-400 ml-2 print:hidden">
                              {selectedStudent === index ? "▲" : "▼"}
                            </span>
                          </td>

                          {/* Total aktif — warna status */}
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`font-mono text-[11px] font-bold print:text-black ${
                                isHigh
                                  ? "text-emerald-600"
                                  : isLow
                                  ? "text-rose-600"
                                  : "text-slate-700"
                              }`}
                            >
                              {item.total_active}x
                            </span>
                          </td>
                        </tr>

                        {/* Rincian tanggal (web only) */}
                        {selectedStudent === index && item.active_dates && (
                          <tr className="bg-slate-50 print:hidden">
                            <td colSpan="3" className="px-6 py-3 border-b border-slate-100">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Calendar size={11} className="text-slate-400" />
                                <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">
                                  Riwayat Tanggal Aktif
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.active_dates.map((date, dIdx) => (
                                  <span
                                    key={dIdx}
                                    className="font-mono text-[9px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded"
                                  >
                                    {date}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tanda tangan (print only) */}
            <div className="hidden print:flex justify-end mt-16 pr-8">
              <div className="text-center min-w-[200px] text-sm">
                <p>Siborongborong, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="mb-20">Guru Pengampu,</p>
                <p className="font-bold underline tracking-wide">{teacherName}</p>
                <p className="text-xs mt-1">NIP. ...........................</p>
              </div>
            </div>
          </div>
        ) : (
          selectedClass && !isLoading && (
            <div className="rounded-lg bg-white border border-slate-200 p-8 text-center print:hidden">
              <p className="text-[11px] font-medium text-slate-500">
                Belum ada data keaktifan pada periode ini.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}