import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Plus, 
    Trash2, 
    Save, 
    Rocket,
    History, // Icon untuk history
    Calendar,
    Tag
} from "lucide-react";
import api from '@/lib/axios';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import ChangelogHistoryModal from '@/components/ChangelogHistoryModal';

export default function AddChangelog() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // State untuk menyimpan versi terakhir dari database
    const [latestLog, setLatestLog] = useState(null);

    // State Form Utama
    const [formData, setFormData] = useState({
        version: '',
        title: '',
        release_date: new Date().toISOString().split('T')[0], 
    });

    const [changes, setChanges] = useState([
        { type: 'new', text: '' }
    ]);

    // --- 1. FETCH VERSI TERAKHIR (NEW CODE) ---
    useEffect(() => {
        const fetchLatestVersion = async () => {
            try {
                const response = await api.get('/api/changelog/latest');
                if (response.data.status === 'success') {
                    setLatestLog(response.data.data);
                }
            } catch {
                console.log("Belum ada history changelog");
            }
        };
        fetchLatestVersion();
    }, []);

    // --- LOGIC DYNAMIC FORM ---
    const addRow = () => {
        setChanges([...changes, { type: 'new', text: '' }]);
    };

    const removeRow = (index) => {
        if (changes.length === 1) return; 
        const newList = [...changes];
        newList.splice(index, 1);
        setChanges(newList);
    };

    const handleRowChange = (index, field, value) => {
        const newList = [...changes];
        newList[index][field] = value;
        setChanges(newList);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            changes: changes 
        };

        try {
            await api.post('/api/admin/changelog', payload);
            toast.success("Update berhasil dirilis!");
            navigate('/superadmin/changelog'); 
        } catch (err) {
            console.error(err);
            toast.error("Gagal menyimpan changelog. Cek inputan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto pb-24">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <Rocket size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Rilis Update Baru</h1>
                    <p className="text-slate-500 text-sm">Input detail perubahan versi aplikasi di sini.</p>
                </div>
            </div>
            {/* --- 1. BUTTON LIHAT HISTORY VERSI --- */}
            <div className="mb-6">
                <ChangelogHistoryModal />
            </div>

            {/* --- 2. PREVIEW VERSI SAAT INI (NEW UI) ---
            {latestLog && (
                <div className="mb-8 p-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                    <div className="bg-white rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <History size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-0.5">Versi Live Saat Ini</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-slate-800">v{latestLog.version}</span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Active</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 text-sm border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 w-full md:w-auto">
                            <div>
                                <p className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                                    <Tag size={12}/> Judul Rilis
                                </p>
                                <p className="font-semibold text-slate-700 max-w-[150px] truncate" title={latestLog.title}>
                                    {latestLog.title}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                                    <Calendar size={12}/> Tanggal Rilis
                                </p>
                                <p className="font-semibold text-slate-700">
                                    {new Date(latestLog.release_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. INFORMASI DASAR */}
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Informasi Versi Baru</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Nomor Versi</Label>
                            <Input 
                                placeholder="Misal: 1.2.0" 
                                value={formData.version}
                                onChange={(e) => setFormData({...formData, version: e.target.value})}
                                required
                                className="font-mono"
                            />
                            <p className="text-[10px] text-slate-400">
                                {latestLog ? `Harus lebih tinggi dari v${latestLog.version}` : 'Versi perdana'}
                            </p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Judul Update</Label>
                            <Input 
                                placeholder="Contoh: Fitur Import Guru & Fix Bug Login" 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tanggal Rilis</Label>
                            <Input 
                                type="date"
                                value={formData.release_date}
                                onChange={(e) => setFormData({...formData, release_date: e.target.value})}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. DETAIL PERUBAHAN (DYNAMIC LIST) */}
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Detail Perubahan (Changes)</CardTitle>
                        <Button type="button" onClick={addRow} size="sm" variant="outline" className="gap-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                            <Plus size={16} /> Tambah Item
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {changes.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                                
                                <div className="w-[140px] shrink-0">
                                    <select 
                                        className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={item.type}
                                        onChange={(e) => handleRowChange(index, 'type', e.target.value)}
                                    >
                                        <option value="new">🎁 Baru</option>
                                        <option value="fix">🐞 Perbaikan</option>
                                        <option value="improve">⚡ Update</option>
                                    </select>
                                </div>

                                <Input 
                                    placeholder="Deskripsikan perubahan..." 
                                    value={item.text}
                                    onChange={(e) => handleRowChange(index, 'text', e.target.value)}
                                    required
                                />

                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeRow(index)}
                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                                    disabled={changes.length === 1} 
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-xl shadow-lg shadow-indigo-200 font-bold text-base"
                    >
                        {loading ? "Menerbitkan..." : (
                            <>
                                <Save size={18} className="mr-2" /> Terbitkan Changelog
                            </>
                        )}
                    </Button>
                </div>

            </form>
        </div>
    );
}