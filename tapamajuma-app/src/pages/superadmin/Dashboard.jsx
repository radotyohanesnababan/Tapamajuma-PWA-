import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, Megaphone, Send, Trash2, Loader2 } from "lucide-react"; // Tambahkan icon baru
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { getStorageUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function SuperadminDashboard() {
  usePageTitle("Dashboard");
  const [stats, setStats] = useState({
    total_students: 0,
    total_xp: 0,
    recent_activities: []
  });

  // --- STATE PENGUMUMAN ---
  const [announcementInput, setAnnouncementInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAnnouncements, setActiveAnnouncements] = useState([]);

  useEffect(() => {
    fetchData();
    fetchAnnouncements();
  }, []);

  const fetchData = () => {
    api.get("/api/admin/student-summary")
      .then((response) => setStats(response.data))
      .catch((error) => console.error(error));
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/api/admin/announcements");
      setActiveAnnouncements(res.data);
    } catch (err) {
      console.error("Gagal ambil pengumuman");
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementInput.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/admin/announcements", { content: announcementInput });
      toast.success("Pengumuman berhasil dipublikasikan!");
      setAnnouncementInput("");
      fetchAnnouncements(); // Refresh list
    } catch (err) {
      toast.error("Gagal mengirim pengumuman");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.delete(`/api/admin/announcements/${id}`);
      toast.success("Pengumuman dihapus");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Gagal menghapus");
    }
  };

  const statCards = [
    { title: "Total Siswa", value: stats.total_students, icon: <Users className="text-blue-500" />, color: "bg-blue-50" },
    { title: "Total Energi (XP)", value: stats.total_xp, icon: <Star className="text-amber-500" />, color: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ringkasan Sistem</h1>
        <p className="text-slate-500">Pantau progres belajar dan aktivitas siswa di sini.</p>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{card.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${card.color}`}>
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KOLOM KIRI: AKTIVITAS TERBARU */}
        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Aktivitas Terbaru 
              <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full uppercase tracking-tighter">Live Update</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent_activities?.length > 0 ? (
                stats.recent_activities.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-slate-200 shadow-sm shrink-0">
                        {item.avatar && (
                          <AvatarImage src={getStorageUrl(item.avatar)} className="object-cover" />
                        )}
                        <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold uppercase">
                          {item.student_name ? item.student_name[0] : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.student_name}</p>
                        <p className="text-xs text-slate-400">Menyelesaikan {item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-indigo-600">+{item.score} XP</p>
                      <p className="text-[10px] text-slate-400">{item.time_ago}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs italic">Belum ada aktivitas.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KOLOM KANAN: PENGUMUMAN MANAGER (BARU) */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-indigo-600 text-white relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone size={20} /> Buat Pengumuman Berjalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea 
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all min-h-[100px]"
                placeholder="Tulis informasi penting untuk siswa di sini..."
                value={announcementInput}
                onChange={(e) => setAnnouncementInput(e.target.value)}
              />
              <Button 
                onClick={handlePostAnnouncement}
                disabled={isSubmitting}
                className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl gap-2 h-12"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Publikasikan Sekarang</>}
              </Button>
            </CardContent>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </Card>

          {/* LIST PENGUMUMAN AKTIF */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Pengumuman Aktif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAnnouncements.length > 0 ? (
                  activeAnnouncements.map((ann) => (
                    <div key={ann.id} className="group flex items-start justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <p className="text-xs font-medium text-slate-700 leading-relaxed pr-4">
                        {ann.content}
                      </p>
                      <button 
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-slate-400 py-4 italic">Tidak ada pengumuman aktif.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}