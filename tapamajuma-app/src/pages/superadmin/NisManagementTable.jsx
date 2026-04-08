import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Pastikan Input di-import
import { Upload, Trash2, ShieldCheck, ShieldAlert, Download, Loader2, Search } from "lucide-react";

export default function NisManagementTable({ hookData }) {
  const { 
    nisList, isNisLoading, handleNisImport, handleNisUnbind, handleDownloadNisTemplate,
    nisSearchQuery, setNisSearchQuery, nisPagination, setNisPagination
  } = hookData;
  
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleNisImport(file);
    fileInputRef.current.value = null; 
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      
      {/* Toolbar Atas */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Pencarian */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            placeholder="Cari NISN atau Nama Siswa..." 
            className="pl-9 bg-white"
            value={nisSearchQuery} 
            onChange={(e) => setNisSearchQuery(e.target.value)}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap justify-end gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={handleDownloadNisTemplate} className="w-full sm:w-auto text-indigo-600 border-indigo-200">
            <Download className="mr-2 h-4 w-4" /> Template Excel
          </Button>
          <input type="file" accept=".csv, .xlsx, .xls" className="hidden" ref={fileInputRef} onChange={onFileChange} />
          <Button onClick={() => fileInputRef.current.click()} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
            <Upload className="mr-2 h-4 w-4" /> Import Data
          </Button>
        </div>
      </div>

      {/* Tabel NISN */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
            <tr>
              <th className="px-6 py-4">NISN Valid</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Digunakan Oleh</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isNisLoading ? (
              <tr><td colSpan="4" className="text-center py-12"><Loader2 className="animate-spin mx-auto text-emerald-600" /></td></tr>
            ) : nisList.length > 0 ? (
              nisList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.nis}</td>
                  <td className="px-6 py-4">
                    {item.is_used ? (
                      <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2 py-1 rounded-md w-fit font-bold text-[10px]"><ShieldAlert size={14}/> TERPAKAI</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit font-bold text-[10px]"><ShieldCheck size={14}/> TIDAK TERPAKAI</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.user ? <div className="font-semibold">{item.user.name} <br/><span className="text-xs text-slate-400">{item.user.email}</span></div> : <span className="italic text-slate-400">-</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.is_used && (
                      <Button variant="ghost" size="sm" onClick={() => handleNisUnbind(item.id, item.user?.name)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" title="Cabut Akses Siswa">
                        <Trash2 className="h-4 w-4 mr-2" /> Cabut
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-12 text-slate-400">Pencarian tidak ditemukan atau data kosong.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-slate-100 bg-white">
        
        {/* KIRI: Info & Selector Jumlah Data */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Menampilkan <span className="font-medium text-slate-700">{nisPagination.from || 0}</span> - <span className="font-medium text-slate-700">{nisPagination.to || 0}</span> dari <span className="font-medium text-slate-700">{nisPagination.total || 0}</span>
          </div>
          
          <select 
            className="text-xs border rounded p-1.5 bg-white text-slate-600 outline-none focus:border-indigo-500"
            value={nisPagination.perPage} 
            onChange={(e) => setNisPagination(prev => ({ ...prev, perPage: Number(e.target.value), currentPage: 1 }))}
          >
            <option value={15}>15 per hal</option>
            <option value={50}>50 per hal</option>
            <option value={100}>100 per hal</option>
          </select>
        </div>

        {/* KANAN: Navigasi */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-slate-400">Ke hal:</span>
            <input 
              type="number" min="1" max={nisPagination.lastPage}
              className="w-12 border rounded p-1 text-xs text-center outline-none focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = Math.max(1, Math.min(Number(e.target.value), nisPagination.lastPage));
                  setNisPagination(prev => ({ ...prev, currentPage: val }));
                }
              }}
              placeholder={nisPagination.currentPage}
            />
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline" size="sm" className="h-8 px-3"
              onClick={() => setNisPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={nisPagination.currentPage === 1}
            >
              Prev
            </Button>

            <div className="hidden md:flex gap-1">
              {[...Array(nisPagination.lastPage)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === nisPagination.lastPage || (pageNum >= nisPagination.currentPage - 1 && pageNum <= nisPagination.currentPage + 1)) {
                  return (
                    <Button
                      key={pageNum}
                      variant={nisPagination.currentPage === pageNum ? "default" : "ghost"} size="sm"
                      className={`h-8 w-8 p-0 ${nisPagination.currentPage === pageNum ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                      onClick={() => setNisPagination(prev => ({ ...prev, currentPage: pageNum }))}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (pageNum === nisPagination.currentPage - 2 || pageNum === nisPagination.currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-slate-300">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline" size="sm" className="h-8 px-3"
              onClick={() => setNisPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={nisPagination.currentPage === nisPagination.lastPage || nisPagination.lastPage === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}