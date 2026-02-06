/* eslint-disable react-hooks/static-components */
import React, { useEffect, useState } from 'react';
import { 
    Gift, 
    Zap, 
    Bug, 
    X, 
    PartyPopper,
    Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import api from '@/lib/axios'; // Sesuaikan path axios kamu

// Helper untuk memilih warna & icon berdasarkan tipe update
const getTypeConfig = (type) => {
    switch(type) {
        case 'new': return { 
            bg: 'bg-green-100', text: 'text-green-700', label: 'BARU', icon: <Gift size={14}/> 
        };
        case 'fix': return { 
            bg: 'bg-red-100', text: 'text-red-700', label: 'PERBAIKAN', icon: <Bug size={14}/> 
        };
        case 'improve': return { 
            bg: 'bg-blue-100', text: 'text-blue-700', label: 'UPDATE', icon: <Zap size={14}/> 
        };
        default: return { 
            bg: 'bg-slate-100', text: 'text-slate-700', label: 'INFO', icon: <Rocket size={14}/> 
        };
    }
}

export default function ChangelogModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        // 1. Cek Data ke API
        const checkUpdate = async () => {
            try {
                const response = await api.get('/api/changelog/latest');
                if (response.data.status === 'success') {
                    const latestLog = response.data.data;
                    const savedVersion = localStorage.getItem('app_version');

                    // 2. Logic: Jika versi di LocalStorage BEDA dengan API, tampilkan popup
                    if (savedVersion !== latestLog.version) {
                        setData(latestLog);
                        setIsOpen(true);
                    }
                }
            } catch (error) {
                console.error("Gagal cek update:", error);
            }
        };

        checkUpdate();

        // Listener resize untuk responsif
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        // Simpan versi baru agar popup tidak muncul lagi sampai update berikutnya
        if (data) {
            localStorage.setItem('app_version', data.version);
            
            // OPSIONAL: Reload halaman untuk memastikan user dapat aset JS/CSS terbaru (PWA caching issue)
            // window.location.reload(); 
        }
    };

    if (!data) return null;

    // --- KONTEN UI (Reusable) ---
    const Content = () => (
        <div className="flex flex-col h-full">
            {/* Header Ilustrasi */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-6 text-white text-center relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm shadow-inner">
                        <PartyPopper size={32} className="text-yellow-300" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Update Baru! v{data.version}</h2>
                    <p className="text-indigo-100 text-xs mt-1 opacity-90">
                        {new Date(data.release_date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </p>
                </div>
                
                {/* Tombol Close Absolute (Khusus Mobile) */}
                {isMobile && (
                    <button onClick={handleClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Body List Changes */}
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4 flex-1 bg-white">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Apa yang baru?
                </h3>
                
                {data.changes.map((item, idx) => {
                    const style = getTypeConfig(item.type);
                    return (
                        <div key={idx} className="flex gap-3 items-start group">
                            <div className={`mt-0.5 shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${style.bg} ${style.text}`}>
                                {style.icon}
                            </div>
                            <div>
                                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mb-1 ${style.bg} ${style.text}`}>
                                    {style.label}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {item.text}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer Button */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                <Button 
                    onClick={handleClose} 
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                    Mantap, Saya Mengerti!
                </Button>
            </div>
        </div>
    );

    // --- RENDER LOGIC ---

    // 1. Tampilan MOBILE (Bottom Sheet Manual dengan CSS Tailwind)
    if (isMobile) {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-[9999] flex items-end justify-center">
                {/* Backdrop Gelap */}
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={handleClose}
                ></div>
                
                {/* Bottom Sheet Panel */}
                <div className="relative bg-white w-full max-h-[85vh] rounded-t-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col">
                    {/* Handle Bar (Garis kecil di atas buat swipe visual) */}
                    <div className="w-full flex justify-center pt-3 pb-1 bg-gradient-to-br from-indigo-500 to-purple-600">
                        <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
                    </div>
                    
                    <Content />
                </div>
            </div>
        );
    }

    // 2. Tampilan DESKTOP (Modal / Dialog biasa)
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-2xl shadow-2xl bg-white">
                <Content />
            </DialogContent>
        </Dialog>
    );
}