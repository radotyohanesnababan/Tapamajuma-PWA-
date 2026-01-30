import React, { useState } from 'react';
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner" 

export default function WeeklyReflection() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    difficulties: '', // Akan masuk ke kolom 'content'
    improvements: '',
    targets: ''
  });

  const handleSubmit = async () => {
    if (!formData.difficulties || !formData.improvements || !formData.targets) {
      toast.error("Semua kolom harus diisi sebelum mengirim refleksi.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/reflections', {
        category: 'mingguan',
        content: formData.difficulties,
        improvements: formData.improvements,
        targets: formData.targets,
        activity_id: null // Refleksi mingguan bersifat mandiri
      });
      toast.success("Refleksi mingguan berhasil disimpan! Semangat terus!");
      setFormData({ difficulties: '', improvements: '', targets: '' });
    } catch {
      toast.error("Gagal mengirim data. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">Refleksi Mingguan 📝</h2>
        <p className="text-xs text-slate-500">Mari syukuri progresmu minggu ini</p>
      </div>

      <Card className="border-none shadow-md bg-white">
        <CardContent className="pt-6 space-y-5">
          {/* Box 1: Kesulitan */}
          <div>
            <label className="text-[11px] font-bold text-red-600 uppercase">1. Kesulitan Minggu Ini</label>
            <Textarea 
              className="text-xs mt-1 bg-slate-50" 
              placeholder="Apa yang paling sulit kamu pelajari minggu ini?"
              value={formData.difficulties}
              onChange={e => setFormData({...formData, difficulties: e.target.value})}
            />
          </div>
          
          {/* Box 2: Kemajuan */}
          <div>
            <label className="text-[11px] font-bold text-green-600 uppercase">2. Kemajuan Saya</label>
            <Textarea 
              className="text-xs mt-1 bg-slate-50" 
              placeholder="Hal apa yang sekarang kamu sudah lebih bisa?"
              value={formData.improvements}
              onChange={e => setFormData({...formData, improvements: e.target.value})}
            />
          </div>

          {/* Box 3: Target */}
          <div>
            <label className="text-[11px] font-bold text-blue-600 uppercase">3. Target Minggu Depan</label>
            <Textarea 
              className="text-xs mt-1 bg-slate-50" 
              placeholder="Apa yang ingin kamu capai minggu depan?"
              value={formData.targets}
              onChange={e => setFormData({...formData, targets: e.target.value})}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6"
          >
            {loading ? "Mengirim..." : "Simpan Refleksi Mingguan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}