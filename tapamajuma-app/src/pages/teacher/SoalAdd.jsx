import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Zap, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";


export default function SoalAdd() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tambahkan state untuk file
const [imageFile, setImageFile] = useState(null);
  
  // Data Master untuk Dropdown
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [formData, setFormData] = useState({
    type: "numeracy",
    subject_id: "",
    class_id: "",
    question_text: "",
    optA: "", optB: "", optC: "", optD: "", optE: "", // State sementara
    correct_key: "A"
  });

  // Ambil data Mapel & Kelas saat halaman dimuat
  useEffect(() => {
    // Asumsi route kamu adalah /api/teacher/subjects dan classes
    api.get("/api/admin/subjects").then(res => setSubjects(res.data)).catch(err => console.error(err));
    api.get("/api/admin/classes").then(res => setClasses(res.data)).catch(err => console.error(err));
  }, []);

const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Buat FormData
    const payloadData = new FormData();

    // 2. Append data dasar
    payloadData.append("type", formData.type);
    payloadData.append("subject_id", formData.subject_id);
    payloadData.append("class_id", formData.class_id);
    payloadData.append("question_text", formData.question_text);
    payloadData.append("correct_key", formData.correct_key);

    // 3. FIX: Kirim Opsi sebagai Array/Object untuk Laravel!
    payloadData.append("options[A]", formData.optA);
    payloadData.append("options[B]", formData.optB);
    payloadData.append("options[C]", formData.optC);
    payloadData.append("options[D]", formData.optD);
    payloadData.append("options[E]", formData.optE);

    // 4. Append File Gambar (Jika ada)
    if (imageFile) {
      payloadData.append("image", imageFile);
    }

    try {
      // 5. Kirim via Axios
      // Jangan set Content-Type manual, biarkan Axios dan Browser yang mengatur boundary multipart-nya
      await api.post("/api/teacher/bank-soal", payloadData,
        {
          headers: {
          "Content-Type": "multipart/form-data",
        }
        }
      );
      
      
      toast.success("Soal berhasil disimpan!");
      navigate("/teacher/bank-soal/list");
    } catch (error) {
      console.error("Error validasi:", error.response?.data);
      toast.error(error.response?.data?.message || "Gagal menyimpan soal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* ... [STICKY HEADER SAMA SEPERTI SEBELUMNYA] ... */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center gap-4 z-20 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Tambah Manual</h2>
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.15em]">Input Data</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500 mt-6 px-4">
        <div className="border-none rounded-[2.5rem] bg-white shadow-xl overflow-hidden p-8 md:p-12">
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Zap size={24} /></div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Buat Soal Baru</h2>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Soal</label>
              <select className="w-full h-12 px-4 rounded-2xl bg-emerald-50 border-none text-sm font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-400 appearance-none shadow-inner" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                <option value="numeracy">🔢 Numerasi</option>
                <option value="literacy">📚 Literasi</option>
                <option value="tka">🧠 TKA (HOTS)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mata Pelajaran</label>
                <select className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400" value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} required>
                  <option value="">-- Pilih Mapel --</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Kelas</label>
                <select className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400" value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} required>
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pertanyaan Utama</label>
              <textarea className="w-full rounded-2xl bg-slate-50 border-none p-5 text-sm font-medium focus:ring-2 focus:ring-emerald-400 min-h-[120px] shadow-inner outline-none" required placeholder="Tuliskan butir soal di sini..." value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Gambar (Jika ada)</label>
              <input type="file" accept="image/*" className="w-full rounded-2xl bg-slate-50 border-none p-5 text-sm font-medium focus:ring-2 focus:ring-emerald-400 shadow-inner outline-none" onChange={e => setImageFile(e.target.files[0])} />
              {imageFile && <p className="text-xs text-emerald-600 font-medium">✓ {imageFile.name}</p>}
            </div>

            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilihan Jawaban (A-E)</p>
              {['A','B','C','D','E'].map((opt) => (
                <div key={opt} className="flex gap-4 items-center">
                  <span className="font-black text-slate-300 w-4">{opt}</span>
                  <input required placeholder={`Teks pilihan ${opt}...`} value={formData[`opt${opt}`]} onChange={e => setFormData({...formData, [`opt${opt}`]: e.target.value})} className="w-full bg-white rounded-xl border border-slate-100 h-11 px-4 shadow-sm outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium"/>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kunci Jawaban Benar</label>
                <select className="w-full h-12 px-4 rounded-2xl bg-emerald-50 border-none text-emerald-700 font-black outline-none focus:ring-2 focus:ring-emerald-400 appearance-none shadow-sm" value={formData.correct_key} onChange={e => setFormData({...formData, correct_key: e.target.value})}>
                  {['A','B','C','D','E'].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" className="flex-1 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors" onClick={() => navigate('/teacher/bank-soal')}>Batal</button>
                <button type="submit" className="flex-[2] flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl h-12 font-black shadow-lg shadow-emerald-200 transition-all active:scale-95" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4"/> : "SIMPAN SOAL ✨"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}