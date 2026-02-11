import React, { useState } from 'react';
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
// Import Ikon biar seru
import { 
  PencilLine, 
  Frown, 
  Sparkles, 
  Rocket, 
  Send, 
  Loader2, 
  ChevronLeft 
} from "lucide-react";

export default function WeeklyReflection() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    difficulties: '', 
    improvements: '',
    targets: ''
  });

  const handleSubmit = async () => {
    if (!formData.difficulties || !formData.improvements || !formData.targets) {
      toast.error("Ups! Isi semua kotaknya dulu ya sebelum dikirim.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/reflections', {
        category: 'mingguan',
        content: formData.difficulties,
        improvements: formData.improvements,
        targets: formData.targets,
        activity_id: null 
      });
      toast.success("Keren! Refleksi mingguanmu sudah tersimpan. 🚀");
      setFormData({ difficulties: '', improvements: '', targets: '' });
    } catch {
      toast.error("Gagal mengirim data. Coba cek internetmu ya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-6 max-w-md mx-auto bg-slate-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col items-center text-center space-y-2 pt-4">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <PencilLine className="text-indigo-500" size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Refleksi Mingguan</h2>
        <p className="text-xs text-slate-500 font-medium px-6">
            Satu minggu telah berlalu! Mari kita lihat apa saja yang sudah kamu lalui.
        </p>
      </div>

      <div className="space-y-4">
        {/* BOX 1: KESULITAN */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
                    <Frown size={18} />
                </div>
                <label className="text-xs font-black text-rose-600 uppercase tracking-wider">Rintangan Terberat</label>
            </div>
            <Textarea 
              className="text-sm rounded-2xl border-none bg-slate-50 focus-visible:ring-rose-400 min-h-[100px]" 
              placeholder="Apa hal yang paling sulit atau membuatmu bingung minggu ini?"
              value={formData.difficulties}
              onChange={e => setFormData({...formData, difficulties: e.target.value})}
            />
          </CardContent>
        </Card>
        
        {/* BOX 2: KEMAJUAN */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border-l-4 border-emerald-500">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                    <Sparkles size={18} />
                </div>
                <label className="text-xs font-black text-emerald-600 uppercase tracking-wider">Kemenangan Kecilku</label>
            </div>
            <Textarea 
              className="text-sm rounded-2xl border-none bg-slate-50 focus-visible:ring-emerald-400 min-h-[100px]" 
              placeholder="Hal apa yang sekarang kamu sudah merasa lebih jago?"
              value={formData.improvements}
              onChange={e => setFormData({...formData, improvements: e.target.value})}
            />
          </CardContent>
        </Card>

        {/* BOX 3: TARGET */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                    <Rocket size={18} />
                </div>
                <label className="text-xs font-black text-indigo-600 uppercase tracking-wider">Misi Minggu Depan</label>
            </div>
            <Textarea 
              className="text-sm rounded-2xl border-none bg-slate-50 focus-visible:ring-indigo-400 min-h-[100px]" 
              placeholder="Apa target atau hal seru yang ingin kamu capai besok?"
              value={formData.targets}
              onChange={e => setFormData({...formData, targets: e.target.value})}
            />
          </CardContent>
        </Card>

        {/* SUBMIT BUTTON */}
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-7 rounded-3xl shadow-lg shadow-indigo-200 transition-all active:scale-95 group"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" size={20} />
          ) : (
            <>
                Simpan & Akhiri Minggu Ini
                <Send className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} />
            </>
          )}
        </Button>

        <p className="text-[10px] text-center text-slate-400 font-medium">
            Refleksi ini akan membantu gurumu memberikan feedback yang pas buat kamu! ✨
        </p>
      </div>
    </div>
  );
}