import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, FileSpreadsheet, Download, Loader2, Layers, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function SoalImport() {
  const navigate = useNavigate();
  const [xlsxFile, setXlsxFile] = useState(null);
  const [importType, setImportType] = useState("numeracy"); 
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

  // Link langsung ke route Download Template Backend
   const downloadTemplate = async () => {
    setIsDownloading(true);
    try {
        const response = await api.get('/api/teacher/bank-soal/template', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'template_bank_soal.xlsx'); 
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch {
        toast.error("Gagal unduh template");
    } finally {
        setIsDownloading(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!xlsxFile) return toast.error("File wajib dipilih!");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", xlsxFile);
    formData.append("type", importType); // Backend Excel Import butuh info type ini

    try {
      const res = await api.post("/api/teacher/bank-soal/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "Berhasil import soal!");
      setXlsxFile(null); // Reset
    } catch (error) {
      toast.error(error.response?.data?.error || "Gagal melakukan import.");
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
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Import Massal</h2>
          <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.15em]">Via Excel</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500 mt-6 px-4">
        <div className="border-none rounded-[2rem] sm:rounded-[2.5rem] bg-white shadow-xl text-center overflow-hidden p-6 sm:p-10">
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-600 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
            <FileSpreadsheet className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">Import Masal via Excel</h2>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 mb-6 sm:mb-8 px-2 sm:px-8 leading-relaxed">
            Pilih kategori soal dan pastikan format file Anda sesuai dengan template sistem.
          </p>
            <div className="bg-green-50/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 border border-green-100/50 border-dashed text-center">
              <p className="text-[12px] sm:text-[15px] font-black text-green-700 uppercase tracking-widest mb-3">MEDIA BANK SOAL</p>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-700 ">Jika dibutuhkan, ambil link soal dari media bank. Jika belum upload, upload gambar terlebih dahulu</p>
              <Button onClick={() => navigate('/teacher/bank-soal/mediabank')} variant="outline" style={{ marginTop: '1rem' }}>
          Buka Brankas Gambar
          </Button>
            </div>

          <form onSubmit={handleImportSubmit} className="space-y-6 text-left">
            
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pilih Kategori Soal</label>
              <select className="w-full h-12 px-5 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-green-400 appearance-none shadow-inner" value={importType} onChange={(e) => setImportType(e.target.value)}>
                <option value="numeracy">🔢 Kategori: Numerasi</option>
                <option value="literacy">📚 Kategori: Literasi</option>
                <option value="tka">🧠 Kategori: TKA (HOTS)</option>
              </select>
            </div>

            <div className="bg-green-50/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 border border-green-100/50 border-dashed text-center">
              <p className="text-[9px] sm:text-[10px] font-black text-green-400 uppercase tracking-widest mb-3">Langkah 1: Gunakan Template</p>
              <Button 
            variant="outline" 
            onClick={downloadTemplate} 
            disabled={isDownloading} 
            className="w-full sm:w-auto rounded-xl sm:rounded-2xl border-green-200 text-green-600 font-black text-[10px] px-6 h-10 hover:bg-green-600 hover:text-white transition-all shadow-sm"
          >
             {isDownloading ? <Loader2 size={14} className="animate-spin mr-2"/> : <Download size={14} className="mr-2"/>}
             DOWNLOAD TEMPLATE
          </Button>
            </div>
            <div className="space-y-3">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Langkah 2: Unggah File</p>
                <div className="border-4 border-dashed border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-12 relative cursor-pointer hover:bg-slate-50 group transition-colors">
                  <input type="file" accept=".xlsx, .csv" onChange={e => setXlsxFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="text-center space-y-2">
                      <Layers size={28} className="mx-auto text-slate-300 group-hover:text-green-400 transition-colors" />
                      <div className="text-[10px] sm:text-xs font-black text-slate-400 break-all px-2">
                          {xlsxFile ? (
                            <span className="text-green-600 bg-green-50 px-3 py-1.5 rounded-full inline-block border border-green-100">
                              ✅ {xlsxFile.name.length > 20 ? xlsxFile.name.substring(0, 20) + '...' : xlsxFile.name}
                            </span>
                          ) : "Klik atau Tarik file .xlsx / .csv"}
                      </div>
                  </div>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8">
              <button type="button" className="w-full sm:flex-1 rounded-xl sm:rounded-2xl font-bold h-12 sm:h-14 text-slate-500 hover:bg-slate-100 transition-colors" onClick={() => navigate('/teacher/bank-soal')}>
                Batal
              </button>
              <button type="submit" className="w-full sm:flex-[2] bg-green-600 hover:bg-green-700 text-white rounded-xl sm:rounded-2xl h-12 sm:h-14 font-black shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:active:scale-100" disabled={!xlsxFile || isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="mr-2" size={16} />}
                {isSubmitting ? "PROSES..." : "IMPORT SEKARANG"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}