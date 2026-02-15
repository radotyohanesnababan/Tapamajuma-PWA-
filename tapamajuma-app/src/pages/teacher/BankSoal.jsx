import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  List, 
  PlusCircle, 
  FileUp, 
  ArrowRight,
  Database,
  PenTool,
  UploadCloud,
  Sparkles
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BankSoal() {
  const navigate = useNavigate();

  const menus = [
    {
      title: "Daftar Soal",
      desc: "Lihat, edit, atau hapus soal Numerasi, Literasi, dan TKA yang ada di database.",
      icon: <List size={24} />,
      bgIcon: <Database size={120} />,
      path: 'list',
      color: "indigo",
      accentIcon: <List size={14} className="fill-current" />,
      tags: ["Manajemen", "Edit Data"]
    },
    {
      title: "Tambah Manual",
      desc: "Ketik dan buat soal pilihan ganda baru satu per satu langsung di aplikasi.",
      icon: <PlusCircle size={24} />,
      bgIcon: <PenTool size={120} />,
      path: 'add',
      color: "emerald",
      accentIcon: <PlusCircle size={14} className="fill-current" />,
      tags: ["Input Cepat", "Satu per Satu"]
    },
    {
      title: "Import Massal",
      desc: "Upload ratusan soal sekaligus menggunakan template Excel atau CSV standar.",
      icon: <FileUp size={24} />,
      bgIcon: <UploadCloud size={120} />,
      path: 'import',
      color: "amber",
      accentIcon: <FileUp size={14} className="fill-current" />,
      tags: ["Excel/CSV", "Otomatisasi"]
    }
  ];

  const colorConfig = {
    indigo: "bg-indigo-50 text-indigo-600 hover:border-indigo-300 shadow-indigo-100/50",
    emerald: "bg-emerald-50 text-emerald-600 hover:border-emerald-300 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 hover:border-amber-300 shadow-amber-100/50"
  };

  const btnConfig = {
    indigo: "bg-indigo-600 shadow-indigo-200",
    emerald: "bg-emerald-600 shadow-emerald-200",
    amber: "bg-amber-600 shadow-amber-200"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 pb-24 space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="space-y-2 pt-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <Layers className="text-indigo-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bank Soal</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Management</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm max-w-2xl leading-relaxed font-medium">
          Kelola seluruh materi ujian dan latihan siswa. Pilih metode input soal yang paling sesuai dengan kebutuhanmu hari ini.
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
              <div className={`absolute -top-6 -right-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 ${menu.color === 'indigo' ? 'text-indigo-600' : menu.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}`}>
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
                  <span>Lihat</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* FOOTER TIPS */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6 mt-12 flex items-center gap-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm shrink-0">
          <Sparkles className="text-emerald-600" size={20} />
        </div>
        <p className="text-xs font-medium text-emerald-700 leading-relaxed">
          <b>Tips Import:</b> Pastikan kolom di Excel kamu persis sama dengan template agar tidak terjadi error saat proses upload massal.
        </p>
      </div>
    </div>
  );
}