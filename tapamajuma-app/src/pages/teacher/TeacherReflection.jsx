import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, User, Users } from "lucide-react";
import { toast } from "sonner";

export default function TeacherReflection() {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
      // Endpoint ini harus mengembalikan semua refleksi siswa di kelas guru tersebut
      const res = await api.get("/api/teacher/reflections");
      setReflections(res.data);
    } catch {
      toast.error("Gagal mengambil data refleksi");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (id, feedbackText) => {
    if (!feedbackText) return toast.error("Masukan tidak boleh kosong");

    setSubmittingId(id);
    try {
      // TAMBAHKAN prefix /teacher/ di tengah URL sesuai route:list
      await api.post(`/api/teacher/reflections/${id}/feedback`, {
        feedback_teacher: feedbackText,
      });
      
      toast.success("Masukan berhasil dikirim ke siswa!");
      fetchReflections();
    } catch (error) {
      console.error("Error Detail:", error.response?.data);
      toast.error("Gagal mengirim masukan");
    } finally {
      setSubmittingId(null);
    }
};

  if (loading) return <div className="p-10 text-center text-sm animate-pulse">Memuat refleksi siswa...</div>;

  return (
    <div className="p-4 space-y-4 pb-24 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Bimbingan Refleksi</h1>
        <p className="text-xs text-slate-500">Berikan masukan pedagogis untuk proses belajar siswa</p>
      </div>

      {reflections.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <p className="text-sm text-slate-400">Belum ada refleksi masuk dari siswa.</p>
        </div>
      ) : (
        reflections.map((ref) => (
          <Card key={ref.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-50 flex flex-row items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                  <User size={14} />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold">{ref.user.name}</CardTitle>
                  <p className="text-[10px] text-slate-400">Kelas: {ref.user.class_id}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
                {ref.category}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Konten Refleksi Siswa */}
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tantangan/Kesulitan:</p>
                  <p className="text-xs text-slate-700 italic">"{ref.content}"</p>
                </div>
                <div className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/50">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Target Perbaikan:</p>
                  <p className="text-xs text-indigo-900 font-medium">{ref.targets}</p>
                </div>
              </div>

              {/* Status Dukungan Teman (Insight untuk Guru) */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                <Users size={12} className="text-indigo-400" />
                <span>{ref.peer_feedback?.length || 0} dukungan dari teman sekelas</span>
              </div>

              {/* Input Feedback Guru */}
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2 px-1">
                  Masukan Pedagogis Guru:
                </label>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Contoh: Strategi berhitungmu sudah bagus, coba tingkatkan di bagian..."
                    className="text-xs min-h-[80px] bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                    defaultValue={ref.feedback_teacher}
                    id={`feedback-${ref.id}`}
                  />
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs h-9 rounded-xl gap-2"
                    disabled={submittingId === ref.id}
                    onClick={() => {
                      const val = document.getElementById(`feedback-${ref.id}`).value;
                      handleSendFeedback(ref.id, val);
                    }}
                  >
                    {submittingId === ref.id ? (
                      "Mengirim..."
                    ) : (
                      <>
                        <Send size={14} /> Simpan Masukan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}