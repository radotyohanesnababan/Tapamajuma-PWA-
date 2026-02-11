import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  MessageSquareQuote, 
  ArrowRight, 
  GalleryHorizontal,
  Zap,
  Heart,
  Sparkles
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ClassImprovement() {
  const navigate = useNavigate();

  const menus = [
    {
      title: "Analisis Siswa",
      desc: "Pantau statistik performa, grafik nilai, dan perkembangan kompetensi siswa.",
      icon: <BarChart3 size={24} />,
      bgIcon: <BarChart3 size={120} />,
      path: '/teacher/class-improvement/analysis',
      color: "indigo",
      accentIcon: <Zap size={14} className="fill-current" />,
      tags: ["Grafik Nilai", "Status Akurasi"]
    },
    {
      title: "Forum Refleksi",
      desc: "Wadah umpan balik mengenai tantangan belajar dan target perbaikan siswa.",
      icon: <MessageSquareQuote size={24} />,
      bgIcon: <MessageSquareQuote size={120} />,
      path: '/teacher/class-improvement/reflection',
      color: "rose",
      accentIcon: <Heart size={14} className="fill-current" />,
      tags: ["Feedback Guru", "Peer Support"]
    },
    {
      title: "Galeri Siswa",
      desc: "Apresiasi karya kreatif dan publikasi hasil belajar siswa dalam bentuk visual.",
      icon: <GalleryHorizontal size={24} />,
      bgIcon: <GalleryHorizontal size={120} />,
      path: '/teacher/class-improvement/gallery',
      color: "amber",
      accentIcon: <Sparkles size={14} className="fill-current" />,
      tags: ["Publikasi", "Karya Kreatif"]
    }
  ];

  const colorConfig = {
    indigo: "bg-indigo-50 text-indigo-600 hover:border-indigo-300 shadow-indigo-100/50",
    rose: "bg-rose-50 text-rose-600 hover:border-rose-300 shadow-rose-100/50",
    amber: "bg-amber-50 text-amber-600 hover:border-amber-300 shadow-amber-100/50"
  };

  const btnConfig = {
    indigo: "bg-indigo-600 shadow-indigo-200",
    rose: "bg-rose-600 shadow-rose-200",
    amber: "bg-amber-600 shadow-amber-200"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 pb-24 space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="space-y-2 pt-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <LayoutDashboard className="text-indigo-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Peningkatan Kelas</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Control Center & Analysis</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm max-w-2xl leading-relaxed font-medium">
          Pantau grafik perkembangan, berikan feedback pada refleksi mingguan, atau apresiasi karya kreatif siswa di sini.
        </p>
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {menus.map((menu, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(menu.path)} 
            className="group cursor-pointer perspective-1000"
          >
            <Card className={`h-full border-none rounded-[2.5rem] bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden flex flex-col`}>
              
              {/* STYLIZED BACKGROUND ICON */}
              <div className={`absolute -top-6 -right-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 ${menu.color === 'indigo' ? 'text-indigo-600' : menu.color === 'rose' ? 'text-rose-600' : 'text-amber-600'}`}>
                {menu.bgIcon}
              </div>
              
              <CardHeader className="p-8 pb-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${colorConfig[menu.color].split(' ')[0]} ${colorConfig[menu.color].split(' ')[1]}`}>
                  {menu.icon}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
                      {menu.title}
                    </CardTitle>
                    <div className={`p-1 rounded-full ${colorConfig[menu.color].split(' ')[0]} ${colorConfig[menu.color].split(' ')[1]}`}>
                      {menu.accentIcon}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    {menu.desc}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-0 mt-auto relative z-10">
                {/* TAGS */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {menu.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* ACTION BUTTON */}
                <div className={`flex items-center justify-between w-full py-4 px-6 rounded-2xl font-black text-white text-xs transition-all duration-300 shadow-lg ${btnConfig[menu.color]} group-hover:gap-4`}>
                  <span>BUKA MENU</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* FOOTER TIPS */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-6 mt-12 flex items-center gap-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm">
          <Sparkles className="text-indigo-600" size={20} />
        </div>
        <p className="text-xs font-medium text-indigo-700 leading-relaxed">
          <b>Tips Guru:</b> Periksa "Forum Refleksi" secara rutin untuk mengetahui kendala teknis atau emosional yang dialami siswa saat mengerjakan tugas.
        </p>
      </div>

    </div>
  );
}