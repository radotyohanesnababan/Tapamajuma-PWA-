import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
// Import Ikon biar makin keren
import { 
  Zap, Trophy, Target, Star, 
  Calendar, Flame, Rocket, Smile 
} from "lucide-react";

export default function StudentDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth(); 
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) navigate("/login");
      else if (user.role === "superadmin") navigate("/superadmin", { replace: true });
      else if (user.role === "teacher") navigate("/teacher", { replace: true });
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (user) {
        api.get("/api/activities")
        .then((res) => setActivities(res.data))
        .catch((err) => console.error("Gagal ambil activities", err))
        .finally(() => setIsDataLoading(false));
    }
  }, [user]);

  if (isAuthLoading || isDataLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
            <Rocket className="animate-bounce text-indigo-500" size={48} />
            <p className="font-bold text-slate-600 animate-pulse">Menyiapkan petualanganmu...</p>
        </div>
    ); 
  }

  if (!user) return null;

  const chartData = activities.map((act, index) => ({
    name: `Aksi ${index + 1}`,
    skor: act.score,
    yakin: act.confidence_level * 20, 
  }));

  // Logika Level Badge
  const getLevelInfo = (lvl) => {
    if (lvl >= 3) return { label: "Master", color: "bg-purple-500", icon: <Star size={14} /> };
    if (lvl === 2) return { label: "Explorer", color: "bg-blue-500", icon: <Target size={14} /> };
    return { label: "Beginner", color: "bg-emerald-500", icon: <Smile size={14} /> };
  };

  const level = getLevelInfo(user.level || 1);

  return (
    <div className="space-y-6 pb-24 p-4 bg-slate-50 min-h-screen"> 
      
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
                <p className="text-3xl font-black">{activities.length}</p>
                <p className="text-[9px] mt-1 opacity-80 italic">Hebat! Terus tingkatkan.</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-sm border border-slate-100">
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[10px] font-bold uppercase text-slate-400">Poin XP</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                <p className="text-3xl font-black text-slate-800">{activities.reduce((acc, curr) => acc + curr.score, 0)}</p>
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
        <Progress value={(activities.length / 10) * 100} className="h-3 bg-slate-100" indicatorClassName="bg-gradient-to-r from-indigo-500 to-teal-400" />
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
            <Card key={act.id} className="border-none shadow-sm rounded-2xl bg-white hover:scale-[1.02] transition-transform">
                <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${act.score > 70 ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'}`}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="font-black capitalize text-sm text-slate-700">{act.type}</p>
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
  );
}