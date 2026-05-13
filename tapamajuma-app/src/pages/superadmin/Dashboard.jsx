import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, Megaphone, Send, Trash2, Loader2, TrendingUp, FileText, UserPlus, BookOpen, ArrowRight } from "lucide-react";
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
      fetchAnnouncements();
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

  // Quick Actions Data
  const quickActions = [
    { label: "Tambah Siswa", icon: <UserPlus size={18} />, color: "bg-blue-50 text-blue-600 hover:bg-blue-100", link: "/superadmin/student-mgmt" },
    { label: "Buat Soal", icon: <BookOpen size={18} />, color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100", link: "/superadmin/question-bank-mgmt" },
    { label: "Laporan Lengkap", icon: <FileText size={18} />, color: "bg-amber-50 text-amber-600 hover:bg-amber-100", link: "/superadmin/activity-report" },
  ];

  const statCards = [
    { 
      title: "Total Siswa", 
      value: stats.total_students, 
      icon: <Users size={24} />, 
      color: "bg-blue-500",
      trend: "+12% dari bulan lalu"
    },
    { 
      title: "Total Energi (XP)", 
      value: stats.total_xp.toLocaleString(), 
      icon: <Star size={24} />, 
      color: "bg-amber-500",
      trend: "+2.4% minggu ini"
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ringkasan Sistem</h1>
          <p className="text-slate-500 mt-1">Pantau progres belajar dan aktivitas siswa secara real-time</p>
        </div>
        
        {/* Quick Actions - Horizontal Pills */}
        <div className="flex items-center gap-2">
          {quickActions.map((action, i) => (
            <Button
              key={i}
              variant="ghost"
              className={`${action.color} font-semibold text-xs px-4 py-2 h-9 rounded-full transition-all shadow-sm hover:shadow-md`}
              onClick={() => window.location.href = action.link}
            >
              {action.icon}
              <span className="ml-1.5">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards - Improved Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {statCards.map((card, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-4xl font-black text-slate-900">{card.value}</h3>
                  
                </div>
                <div className={`p-4 rounded-2xl ${card.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
              </div>
              {/* Subtle gradient overlay */}
              <div className={`h-1 ${card.color} opacity-20`}></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Recent Activities */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                Aktivitas Terbaru
              </CardTitle>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full uppercase tracking-wider border border-blue-200">
                Live
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.recent_activities?.length > 0 ? (
              stats.recent_activities.slice(0, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-11 h-11 border-2 border-white shadow-md shrink-0">
                      {item.avatar && (
                        <AvatarImage src={getStorageUrl(item.avatar)} className="object-cover" />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
                        {item.student_name ? item.student_name[0] : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {item.student_name}
                      </p>
                      <p className="text-xs text-slate-500">Menyelesaikan {item.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">+{item.score} XP</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.time_ago}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 space-y-2">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-slate-300" size={28} />
                </div>
                <p className="text-sm text-slate-400 font-medium">Belum ada aktivitas terbaru</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Announcements Section */}
        <div className="space-y-5">
          {/* Create Announcement Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            
            <CardHeader className="relative z-10 pb-3">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Megaphone size={20} /> 
                Buat Pengumuman Berjalan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 relative z-10">
              <textarea 
                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-sm placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all min-h-[90px] backdrop-blur-sm resize-none"
                placeholder="Apa yang ingin kamu umumkan?"
                value={announcementInput}
                onChange={(e) => setAnnouncementInput(e.target.value)}
              />
              <Button 
                onClick={handlePostAnnouncement}
                disabled={isSubmitting || !announcementInput.trim()}
                className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-lg gap-2 h-11 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Send size={16} /> 
                    Publikasikan Sekarang
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Active Announcements List */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Pengumuman Aktif
                {activeAnnouncements.length > 0 && (
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {activeAnnouncements.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {activeAnnouncements.length > 0 ? (
                  activeAnnouncements.map((ann) => (
                    <div 
                      key={ann.id} 
                      className="group flex items-start gap-3 p-3.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-slate-100"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                      <p className="text-[13px] font-medium text-slate-700 leading-relaxed flex-1">
                        {ann.content}
                      </p>
                      <button 
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                      <Megaphone className="text-slate-300" size={24} />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Tidak ada pengumuman aktif</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}