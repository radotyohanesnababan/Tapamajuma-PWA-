/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Zap, Target, Star, 
  Calendar, Flame, Rocket, Smile, 
  ZapIcon, Lock, ShieldAlert,
  KeySquare, ShieldCheckIcon, Loader2, Megaphone, Trophy
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
  const lastSeen = localStorage.getItem('announcement_seen');
  const today = new Date().toDateString();
  return lastSeen !== today; // Muncul kalau belum dilihat hari ini
});

const handleCloseAnnouncement = () => {
  localStorage.setItem('announcement_seen', new Date().toDateString());
  setShowAnnouncementModal(false);
};

  // --- 1. FUNGSI FETCH UTAMA (Didefinisikan di luar agar bisa dipanggil ulang) ---
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsDataLoading(true);
      const response = await api.get("/api/dashboard");
      
      // Ambil data dari backend
      const { is_nis_valid, needs_password, announcements } = response.data;

      // 1. Set Pengumuman (sudah benar)
      if (announcements && announcements.length > 0) {
        setAnnouncementText(announcements.map(a => a.content).join("   •   "));
      } else {
        setAnnouncementText("");
      }

      // 2. Update States
      setNeedsPassword(needs_password);
      setIsNisValid(is_nis_valid);

      // 3. LOGIKA MODAL (KUNCI):
      // Modal harus muncul JIKA (NIS belum valid) ATAU (Butuh set password)
      if (!is_nis_valid || needs_password) {
        setShowNisModal(true);
      } else {
        setShowNisModal(false);
      }

    } catch (err) {
      console.error("Gagal memuat dashboard:", err);
      // Jika kena middleware 403, paksa munculkan modal
      if (err.response?.status === 403) setShowNisModal(true);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // --- 2. AUTH REDIRECT ---
  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) navigate("/login");
      else if (user.role !== "student") navigate(`/${user.role}`, { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  // --- 3. INITIAL FETCH ---
  useEffect(() => {
    if (user && user.role === 'student') {
      fetchDashboardData();
      
      // Fetch activities terpisah jika NIS sudah ada
      if (user.nis) {
        api.get("/api/activities")
          .then((res) => {
            setActivities(res.data.data);
            setTotalActivities(res.data.total);
          })
          .catch((err) => console.error(err));
      }
    }
  }, [user, fetchDashboardData]);

  // --- 4. HANDLER CLAIM NISN ---
  const handleClaimNis = async (e) => {
    e.preventDefault();
    setIsSubmittingNis(true);

    try {
            const payload = {
        // Hanya kirim NIS jika memang belum valid
        ...(!isNisValid && { nis: nisInput }),
        ...(needsPassword && { 
          password: password, 
          password_confirmation: passwordConfirm 
        })
      };

      const response = await api.post('/api/claim-nis', payload);
      toast.success("Akses Dibuka!", { description: response.data.message });

      // Reset & Refresh UI
      setNisInput(""); setPassword(""); setPasswordConfirm("");
      await fetchDashboardData(); 
      
    } catch (err) {
      const msg = err.response?.data?.message || "Terjadi kesalahan sistem.";
      toast.error("Gagal", { description: msg });
    } finally {
      setIsSubmittingNis(false);
    }
  };

  // --- DATA FORMATTING ---
  if (isAuthLoading || isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Rocket className="animate-bounce text-indigo-500" size={48} />
        <p className="font-bold text-slate-600 animate-pulse">Menyiapkan petualanganmu...</p>
      </div>
    ); 
  }

  const chartData = (activities || []).map((act, index) => ({
    name: `Aksi ${index + 1}`,
    skor: act.score,
    yakin: act.confidence_level * 20,
  }));

  const levelInfo = (lvl) => {
    if (lvl >= 3) return { label: "Master", color: "bg-purple-500", icon: <Star size={14} /> };
    if (lvl === 2) return { label: "Explorer", color: "bg-blue-500", icon: <Target size={14} /> };
    return { label: "Beginner", color: "bg-emerald-500", icon: <Smile size={14} /> };
  };
  const level = levelInfo(user?.level || 1);

  return (

    <>

{showAnnouncementModal && (
  <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
    <div className="bg-white w-full sm:w-[90vw] sm:max-w-3xl h-[92vh] sm:h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-400">
      
      {/* Header Modal */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
            Pengumuman Semester Baru
          </span>
        </div>
        <button
          onClick={handleCloseAnnouncement}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all active:scale-90 font-bold text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* iframe konten HTML */}
      <iframe
        src="/specialchangelog/taganjil2728.html"
        className="w-full flex-1 border-none"
        title="Pengumuman Semester Baru"
      />

      {/* Footer */}
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

{showNisModal && (
  <div className="fixed inset-0 z-[99] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 relative overflow-hidden text-center animate-in fade-in zoom-in duration-300">
      
      {/* Icon menyesuaikan kondisi */}
      <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-2xl mb-6 rotate-3 ${!isNisValid ? 'bg-rose-100 text-rose-500' : 'bg-indigo-100 text-indigo-600'}`}>
        {!isNisValid ? <ShieldAlert size={32} /> : <KeySquare size={32} />}
      </div>

      <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
        {!isNisValid ? "Akses Terkunci!" : "Set Password Manual"}
      </h2>
      
      <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
        {!isNisValid 
          ? "Sistem mendeteksi Anda belum memasukkan NISN yang valid untuk sinkronisasi data."
          : "Akun Google terdeteksi. Silakan buat password untuk login manual dan akses ujian"}
      </p>

      <form onSubmit={handleClaimNis} className="space-y-4 relative z-10 text-left">
        
        {/* INPUT NISN: Hanya muncul jika NIS belum valid */}
        {!isNisValid && (
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="number"
              placeholder="Masukkan NISN"
              className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={nisInput}
              onChange={(e) => setNisInput(e.target.value)}
              required
            />
          </div>
        )}

        {/* INPUT PASSWORD: Muncul jika butuh password */}
        {needsPassword && (
          <div className="space-y-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] text-indigo-600 font-bold tracking-wider px-1 uppercase">
              Akun Google Terdeteksi.
            </p>
              <p className="text-[10px] text-slate-500 font-medium px-1">
                Silakan buat password untuk login manual dan akses ujian
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
          className={`w-full h-12 mt-2 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${!isNisValid ? 'bg-slate-900 hover:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isSubmittingNis ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>{!isNisValid ? 'Buka Gembok Akun' : 'Simpan Kredensial'} <Zap size={16} /></>
          )}
        </button>
      </form>
    </div>
  </div>
)}



        <div className="space-y-6 pb-24 p-4 bg-slate-50 min-h-screen"> 
      {/* RUNNING ANNOUNCEMENT */}
  {announcementText && (
  <div className="bg-indigo-600/10 border border-indigo-100 rounded-2xl h-10 flex items-center overflow-hidden relative mb-6">
    <div className="absolute left-0 top-0 bottom-0 bg-indigo-600 text-white px-3 flex items-center gap-2 z-10 rounded-r-xl">
      <Megaphone size={14} className="animate-bounce" />
      <span className="text-[10px] font-black uppercase">Info</span>
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="animate-marquee text-xs font-bold text-indigo-700">
        {announcementText}
      </p>
    </div>
  </div>
)}
      {/* GREETING SECTION */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            Halo, {user?.name.split(' ')[0]}! 👋
          </h2>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[10px] font-bold w-fit ${level.color} shadow-sm`}>
            {level.icon} {level.label.toUpperCase()} LVL {user.level || 1}
          </div>
        </div>
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <Flame className="text-orange-500" size={24} />
        </div>
      </div>
      
      {/* STATS SUMMARY (GRID) */}
      <div className="grid grid-cols-2 gap-4">
          <Card className="border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg overflow-hidden relative">
            <Zap className="absolute -right-2 -bottom-2 opacity-20 rotate-12" size={80} />
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase opacity-80">Total Aksi</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                <p className="text-3xl font-black">{totalActivities}</p>
                <p className="text-[9px] mt-1 opacity-80 italic">Hebat! Terus tingkatkan.</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm border border-slate-100">
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase text-slate-400">Poin XP Semester Ini</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                <p className="text-3xl font-black text-slate-800">{user?.xp_points ?? 0}</p>
                <div className="flex items-center text-[9px] text-amber-500 font-bold mt-1">
                </div>
            </CardContent>
          </Card>
      </div>

      {/* GRAFIK PROGRES */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Target className="text-rose-500" size={18} /> Statistik Belajarmu
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSkor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="skor" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSkor)" />
              <Area type="monotone" dataKey="yakin" stroke="#2dd4bf" strokeWidth={3} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 text-[10px] font-bold mt-2">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-indigo-400 rounded-full" /> SKOR</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-teal-400 rounded-full" /> KEYAKINAN</span>
          </div>
        </CardContent>
      </Card>
      
      {/* PROGRES LEVEL UP */}
      <Card className="border-none shadow-md bg-white rounded-3xl p-5 relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
                <Trophy className="text-amber-500" size={18} /> Misi Naik Level
            </h3>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                {activities.length} / 10 AKSI
            </span>
        </div>
        <Progress value={(activities.length / 10) * 100} className="h-3 bg-slate-100 [&>div]:bg-blue-500" />
        <p className="text-[10px] mt-3 text-slate-500 text-center font-medium">
            Tinggal <span className="text-indigo-600 font-bold">{10 - activities.length} aksi lagi</span> untuk jadi <span className="italic">Explorer!</span>
        </p>
      </Card>

      {/* LIST AKTIVITAS TERAKHIR */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Jejak Langkahmu</h3>
            <Calendar className="text-slate-400" size={16} />
        </div>
        
        <div className="space-y-3">
            {activities.slice().reverse().map((act) => (
            <Card key={act.id} className="border-none shadow-sm  rounded-2xl bg-white hover:scale-[1.02] transition-transform">
                <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${act.score > 70 ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'}`}>
                        <ZapIcon size={20} />
                    </div>
                    <div>
                        <p className="font-black uppercase text-sm text-slate-700">{act.type}</p>
                        <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1">
                           {new Date(act.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-black text-lg text-slate-800">{act.score}</p>
                    <div className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg">
                    🔥 {act.confidence_level}/5
                    </div>
                </div>
                </CardContent>
            </Card>
            ))}

            {activities.length === 0 && (
            <div className="text-center bg-white rounded-3xl py-12 border-2 border-dashed border-slate-200">
                <Smile className="mx-auto text-slate-300 mb-2" size={40} />
                <p className="text-slate-400 text-xs font-medium">Belum ada aksi hari ini.<br/>Ayo buat sejarahmu!</p>
            </div>
            )}
        </div>
      </div>
    </div>
    
    </>

  );
}