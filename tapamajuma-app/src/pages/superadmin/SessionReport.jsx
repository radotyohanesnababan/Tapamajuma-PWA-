import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar } from "lucide-react"; // Zap dihapus karena tidak dipakai
import api from "@/lib/axios";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function SessionReport() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/api/admin/activity-report/session').then(res => setSessions(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Keaktifan Belajar Di Kelas</h1>
      <p className="text-slate-500">Analisis presensi siswa di setiap sesi.</p>

      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="border-none shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Bagian Kiri: Info Sesi */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{session.class_name}</span>
                        <span className="flex items-center gap-1"><Calendar size={12}/> {session.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{session.topic}</h3>
                    <p className="text-sm text-slate-500">Guru: {session.teacher}</p>
                </div>

                {/* --- BAGIAN TENGAH (HANYA HADIR) --- */}
               {/* --- BAGIAN TENGAH (HANYA HADIR) --- */}
<div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[140px] flex justify-center">
    
    <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-bold mb-1">
            <Users size={14} /> HADIR
        </div>
        
        {/* LOGIKA: Cek dulu apakah ada yang hadir? */}
        {session.attendees_count > 0 ? (
            // JIKA ADA (> 0): Tampilkan tombol Popover
            <Dialog>
                <DialogTrigger asChild>
                    <button type="button" className="text-xl font-bold text-slate-700 hover:text-indigo-600 hover:underline decoration-dashed underline-offset-4 transition-all relative z-10">
                        {session.attendees_count}
                    </button>
                </DialogTrigger>
                
                <DialogContent className="w-60 p-0" align="center">
                    <div className="bg-slate-50 p-3 border-b border-slate-100">
                        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                            Daftar Hadir ({session.attendees_count})
                        </h4>
                    </div>
                    <ScrollArea className="h-[200px] w-full p-2">
                        <ul className="space-y-1">
                            {session.attendees_list.map((name, index) => (
                                <li key={index} className="text-sm text-slate-700 px-2 py-1.5 hover:bg-slate-100 rounded-md flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    {name}
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        ) : (
            // JIKA NOL (0): Tampilkan angka biasa (Teks mati)
            <span className="text-xl font-bold text-slate-300 cursor-not-allowed">
                0
            </span>
        )}
    </div>

</div>
                {/* --- END BAGIAN TENGAH --- */}

                {/* Bagian Kanan: Persentase Efektivitas (Masih disimpan sbg info tambahan) */}
                <div className="text-right min-w-[100px]">
                    <p className="text-xs text-slate-400 mb-1">Efektivitas</p>
                    <div className={`text-3xl font-black ${
                        session.conversion_rate > 50 ? 'text-emerald-600' : 'text-slate-300'
                    }`}>
                        {session.conversion_rate}%
                    </div>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}