import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Jika pakai shadcn scroll-area, atau div biasa
import { 
    History, 
    Calendar, 
    Gift, 
    Bug, 
    Zap, 
    Rocket,
    Loader2 
} from "lucide-react";
import api from '@/lib/axios';

// Helper Warna (Sama seperti sebelumnya)
const getTypeConfig = (type) => {
    switch(type) {
        case 'new': return { bg: 'bg-green-100', text: 'text-green-700', icon: <Gift size={12}/> };
        case 'fix': return { bg: 'bg-red-100', text: 'text-red-700', icon: <Bug size={12}/> };
        case 'improve': return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Zap size={12}/> };
        default: return { bg: 'bg-slate-100', text: 'text-slate-700', icon: <Rocket size={12}/> };
    }
}

export default function ChangelogHistoryModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data hanya saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            const fetchLogs = async () => {
                setLoading(true);
                try {
                    const response = await api.get('/api/admin/changelog/all');
                    if (response.data.status === 'success') {
                        setLogs(response.data.data);
                    }
                } catch (error) {
                    console.error("Gagal ambil history", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchLogs();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600">
                    <History size={18} /> 
                    <span className="hidden md:inline">Lihat Riwayat Versi</span>
                </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 pb-2 shrink-0 border-b border-slate-100">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <History className="text-indigo-600" /> Riwayat Update Aplikasi
                    </DialogTitle>
                    <p className="text-sm text-slate-500">
                        Daftar lengkap perubahan versi dari awal rilis.
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                            <Loader2 className="animate-spin" size={32} />
                            <p className="text-sm">Memuat data...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center text-slate-400 py-10">
                            Belum ada riwayat changelog.
                        </div>
                    ) : (
                        <div className="space-y-6 relative border-l-2 border-slate-200 ml-3 pl-6 md:ml-6 md:pl-8">
                            {logs.map((log, index) => (
                                <div key={log.id} className="relative group">
                                    {/* Titik Timeline */}
                                    <div className="absolute -left-[33px] md:-left-[41px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white ring-4 ring-slate-50 group-hover:bg-indigo-500 transition-colors"></div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black text-slate-800">v{log.version}</span>
                                                    {index === 0 && (
                                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            LATEST
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-slate-700">{log.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                                                <Calendar size={12} />
                                                {new Date(log.release_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {log.changes.map((change, idx) => {
                                                const style = getTypeConfig(change.type);
                                                return (
                                                    <div key={idx} className="flex gap-3 items-start text-sm">
                                                        <div className={`mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${style.bg} ${style.text}`}>
                                                            {style.icon}
                                                        </div>
                                                                                                            <span 
                                                            className="text-slate-600 leading-snug"
                                                            dangerouslySetInnerHTML={{ __html: change.text }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}