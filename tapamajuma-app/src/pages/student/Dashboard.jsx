/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  Zap, Target, Star, Calendar, Flame, Smile,
  Trophy, Megaphone, Sparkles, Rocket, Medal, ChevronRight,
  ShieldAlert, KeySquare, Lock, ShieldCheckIcon, Loader2
} from "lucide-react";

export default function StudentDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // --- STATES ---
  const [activities, setActivities] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [announcementText, setAnnouncementText] = useState("");
  const [isNisValid, setIsNisValid] = useState(true);
  const [showNisModal, setShowNisModal] = useState(false);
  const [nisInput, setNisInput] = useState("");
  const [isSubmittingNis, setIsSubmittingNis] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(() => {
    const lastSeen = localStorage.getItem("announcement_seen");
    const today = new Date().toDateString();
    return lastSeen !== today;
  });

  const handleCloseAnnouncement = () => {
    localStorage.setItem("announcement_seen", new Date().toDateString());
    setShowAnnouncementModal(false);
  };

  // --- FETCH DASHBOARD ---
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const response = await api.get("/api/dashboard");
      const { is_nis_valid, needs_password, announcements } = response.data;

      if (announcements && announcements.length > 0) {
        setAnnouncementText(announcements.map((a) => a.content).join("   •   "));
      } else {
        setAnnouncementText("");
      }

      setNeedsPassword(needs_password);
      setIsNisValid(is_nis_valid);

      if (!is_nis_valid || needs_password) {
        setShowNisModal(true);
      } else {
        setShowNisModal(false);
      }
    } catch (err) {
      console.error("Gagal memuat dashboard:", err);
      if (err.response?.status === 403) setShowNisModal(true);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // --- AUTH REDIRECT ---
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) navigate("/login");
      else if (user.role !== "student") navigate(`/${user.role}`, { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  // --- INITIAL FETCH ---
  useEffect(() => {
    if (user && user.role === "student") {
      fetchDashboardData();
      if (user.nis) {
        api
          .get("/api/activities")
          .then((res) => {
            setActivities(res.data.data);
            setTotalActivities(res.data.total);
          })
          .catch((err) => console.error(err));
      }
    }
  }, [user, fetchDashboardData]);

  // --- HANDLER CLAIM NISN ---
  const handleClaimNis = async (e) => {
    e.preventDefault();
    if (isSubmittingNis) return;
    setIsSubmittingNis(true);

    try {
      const payload = {
        ...(!isNisValid && { nis: nisInput }),
        ...(needsPassword && {
          password: password,
          password_confirmation: passwordConfirm,
        }),
      };

      if (Object.keys(payload).length === 0) {
        toast.error("Tidak ada perubahan untuk disimpan.");
        return;
      }

      const response = await api.post("/api/claim-nis", payload);
      toast.success("Akses Dibuka!", { description: response.data.message });

      setNisInput("");
      setPassword("");
      setPasswordConfirm("");
      setShowNisModal(false);
      await fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || "Terjadi kesalahan sistem.";
      toast.error("Gagal", { description: msg });
    } finally {
      setIsSubmittingNis(false);
    }
  };

  // --- LOADING ---
  if (isAuthLoading || isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f5fb] gap-4">
        <Rocket className="text-indigo-500 float" size={48} />
        <p className="font-bold text-slate-600 animate-pulse">Menyiapkan petualanganmu...</p>
      </div>
    );
  }

  // --- DATA FORMATTING ---
  const chartData = (activities || []).map((act, i) => ({
    name: `Aksi ${i + 1}`,
    skor: act.score,
    yakin: act.confidence_level * 20,
  }));

  const levelInfo = (lvl) => {
    if (lvl >= 3) return { label: "Master", grad: "from-violet-500 to-fuchsia-500", icon: <Star size={13} fill="currentColor" /> };
    if (lvl === 2) return { label: "Explorer", grad: "from-sky-500 to-indigo-500", icon: <Target size={13} /> };
    return { label: "Beginner", grad: "from-emerald-400 to-teal-500", icon: <Smile size={13} /> };
  };
  const level = levelInfo(user?.level || 1);
  const questTotal = 10;
  const questDone = Math.min(activities.length, questTotal);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        .float { animation: floaty 2.6s ease-in-out infinite; }
        @keyframes shine { 0% { transform: translateX(-100%) } 100% { transform: translateX(220%) } }
        .shine { position: relative; overflow: hidden; }
        .shine::after {
          content: ''; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: shine 2.8s ease-in-out infinite;
        }
      `}</style>

      {/* ═══ ANNOUNCEMENT MODAL ═══ */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full sm:w-[90vw] sm:max-w-3xl h-[92vh] sm:h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-400">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                Pengumuman Semester Baru
              </span>
              <button
                onClick={handleCloseAnnouncement}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all active:scale-90 font-bold text-lg leading-none"
              >
                ×
              </button>
            </div>
            <iframe
              src="/specialchangelog/taganjil2728.html"
              className="w-full flex-1 border-none"
              title="Pengumuman Semester Baru"
            />
            <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={handleCloseAnnouncement}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
              >
                Sudah Baca, Tutup ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NIS / PASSWORD MODAL ═══ */}
      {showNisModal && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 relative overflow-hidden text-center animate-in fade-in zoom-in duration-300">
            <div
              className={`mx-auto w-16 h-16 flex items-center justify-center rounded-2xl mb-6 rotate-3 ${
                !isNisValid ? "bg-rose-100 text-rose-500" : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {!isNisValid ? <ShieldAlert size={32} /> : <KeySquare size={32} />}
            </div>

            <h2 className="font-display text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">
              {!isNisValid ? "Akses Terkunci!" : "Set Password Manual"}
            </h2>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
              {!isNisValid
                ? "Sistem mendeteksi Anda belum memasukkan NISN yang valid untuk sinkronisasi data."
                : "Akun Google terdeteksi. Silakan buat password untuk login manual dan akses ujian."}
            </p>

            <form onSubmit={handleClaimNis} className="space-y-4 relative z-10 text-left">
              {!isNisValid && (
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Masukkan NISN"
                    className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={nisInput}
                    onChange={(e) => setNisInput(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                  />
                </div>
              )}

              {needsPassword && (
                <div className="space-y-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-indigo-600 font-bold tracking-wider px-1 uppercase">
                    Akun Google Terdeteksi.
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium px-1">
                    Silakan buat password untuk login manual dan akses ujian.
                  </p>

                  <div className="relative">
                    <KeySquare className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Buat Password Baru"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="relative">
                    <ShieldCheckIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Konfirmasi Password"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingNis}
                className={`w-full h-12 mt-2 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !isNisValid ? "bg-slate-900 hover:bg-slate-800" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmittingNis ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {!isNisValid ? "Buka Gembok Akun" : "Simpan Kredensial"} <Zap size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MAIN DASHBOARD ═══ */}
      <div className="min-h-screen bg-[#f6f5fb] pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-md mx-auto p-4 space-y-5">

          {/* ANNOUNCEMENT BAR */}
          {announcementText && (
            <div className="bg-white rounded-2xl h-11 flex items-center overflow-hidden relative shadow-[0_2px_10px_rgba(99,102,241,0.08)] border border-indigo-50">
              <div className="h-full bg-gradient-to-b from-indigo-500 to-violet-500 text-white px-3.5 flex items-center gap-1.5 z-10 rounded-r-2xl flex-shrink-0">
                <Megaphone size={13} />
                <span className="text-[10px] font-extrabold uppercase tracking-wide">Info</span>
              </div>
              <div className="flex-1 overflow-hidden px-3">
                <p className="whitespace-nowrap text-[11px] font-semibold text-indigo-700">
                  {announcementText}
                </p>
              </div>
            </div>
          )}

          {/* GREETING */}
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <h2 className="font-display text-[26px] font-extrabold text-slate-800 flex items-center gap-1.5">
                Halo, {user?.name.split(" ")[0]}!{" "}
                <span className="float inline-block">👋</span>
              </h2>
              <div
                className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full text-white text-[10px] font-extrabold w-fit bg-gradient-to-r ${level.grad} shadow-md`}
              >
                <span className="bg-white/25 rounded-full w-4 h-4 flex items-center justify-center">
                  {level.icon}
                </span>
                {level.label.toUpperCase()} · LVL {user?.level || 1}
              </div>
            </div>
            <div className="relative bg-white p-2.5 rounded-2xl shadow-[0_2px_10px_rgba(251,113,133,0.15)] border border-rose-50">
              <Flame className="text-orange-500 float" size={24} fill="currentColor" fillOpacity={0.15} />
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#f6f5fb]">
                {totalActivities > 99 ? "99+" : totalActivities}
              </span>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="relative rounded-[1.75rem] p-4 pt-3.5 bg-gradient-to-br from-indigo-500 via-indigo-500 to-fuchsia-500 text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] overflow-hidden">
              <Zap className="absolute -right-3 -bottom-3 opacity-20 rotate-12" size={84} fill="currentColor" />
              <p className="text-[10px] font-extrabold uppercase tracking-wide opacity-85">Total Aksi</p>
              <p className="font-display text-4xl font-extrabold mt-0.5">{totalActivities}</p>
              <p className="text-[9.5px] mt-1 opacity-85 font-medium italic">Hebat! Terus tingkatkan.</p>
            </div>

            <div className="relative rounded-[1.75rem] p-4 pt-3.5 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] border border-amber-50 overflow-hidden">
              <div className="shine">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-500 flex items-center gap-1">
                  <Sparkles size={11} /> Poin XP
                </p>
                <p className="font-display text-4xl font-extrabold mt-0.5 text-slate-800">
                  {user?.xp_points ?? 0}
                </p>
              </div>
              <p className="text-[9.5px] mt-1 text-slate-400 font-semibold">Semester ini</p>
            </div>
          </div>

          {/* QUEST TRACK */}
          <div className="rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] p-5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-extrabold text-[15px] text-slate-800 flex items-center gap-1.5">
                <Trophy className="text-amber-500" size={18} fill="currentColor" fillOpacity={0.2} /> Misi Naik Level
              </h3>
              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {questDone} / {questTotal}
              </span>
            </div>

            <div className="relative px-1 py-2">
              <div className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-2 bg-slate-100 rounded-full" />
              <div
                className="absolute left-1 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `calc(${(questDone / questTotal) * 100}% - 4px)` }}
              />
              <div className="relative flex justify-between">
                {Array.from({ length: questTotal }).map((_, i) => {
                  const passed = i < questDone;
                  const isCurrent = i === questDone - 1;
                  return (
                    <div key={i} className="relative flex flex-col items-center">
                      {isCurrent && (
                        <Rocket
                          className="absolute -top-6 text-indigo-500 float"
                          size={16}
                          fill="currentColor"
                          fillOpacity={0.15}
                          style={{ transform: "rotate(45deg)" }}
                        />
                      )}
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                          passed ? "bg-teal-400" : "bg-slate-200"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[10.5px] mt-4 text-slate-500 text-center font-semibold">
              Tinggal{" "}
              <span className="text-indigo-600 font-extrabold">
                {questTotal - questDone} aksi lagi
              </span>{" "}
              untuk jadi <span className="italic text-slate-700">Explorer!</span>
            </p>
          </div>

          {/* CHART */}
          <div className="rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="p-5 pb-1">
              <h3 className="font-display font-extrabold text-[15px] text-slate-800 flex items-center gap-1.5">
                <Target className="text-rose-500" size={17} /> Statistik Belajarmu
              </h3>
            </div>
            <div className="h-56 px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSkor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="skor" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSkor)" />
                  <Area type="monotone" dataKey="yakin" stroke="#2dd4bf" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-[10px] font-bold pb-4 pt-1">
              <span className="flex items-center gap-1.5 text-slate-500">
                <div className="w-2 h-2 bg-indigo-400 rounded-full" /> SKOR
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <div className="w-2 h-2 bg-teal-400 rounded-full" /> KEYAKINAN
              </span>
            </div>
          </div>

          {/* AKTIVITAS TERAKHIR */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">
                Jejak Langkahmu
              </h3>
              <Calendar className="text-slate-400" size={15} />
            </div>

            <div className="space-y-2.5">
              {activities.slice().reverse().map((act) => {
                const isTop = act.score >= 85;
                return (
                  <div
                    key={act.id}
                    className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] p-3.5 flex justify-between items-center hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(99,102,241,0.12)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isTop
                            ? "bg-gradient-to-br from-amber-300 to-orange-400 text-white"
                            : "bg-indigo-50 text-indigo-500"
                        }`}
                      >
                        {isTop ? <Medal size={18} /> : <Zap size={18} />}
                      </div>
                      <div>
                        <p className="font-extrabold uppercase text-[12.5px] text-slate-700">{act.type}</p>
                        <p className="text-[9.5px] font-semibold text-slate-400">
                          {new Date(act.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="font-display font-extrabold text-lg text-slate-800 leading-none">{act.score}</p>
                        <div className="text-[9px] font-bold px-1.5 py-0.5 mt-1 bg-slate-100 text-slate-500 rounded-md">
                          🔥 {act.confidence_level}/5
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-slate-300" />
                    </div>
                  </div>
                );
              })}

              {activities.length === 0 && (
                <div className="text-center bg-white rounded-[1.75rem] py-12 border-2 border-dashed border-indigo-100">
                  <div className="text-5xl mb-2 float inline-block">🚀</div>
                  <p className="text-slate-400 text-xs font-semibold">
                    Belum ada aksi hari ini.
                    <br />
                    Ayo buat sejarahmu!
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}