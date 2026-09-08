import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Ghost } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  usePageTitle('404 Halaman Tidak Ditemukan');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-6">
          <Ghost className="w-12 h-12 text-slate-400" />
        </div>

        <h1 className="text-7xl font-black text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Halaman Tidak Ditemukan</h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          Maaf, halaman yang anda cari sepertinya sudah pindah, dihapus, atau memang tidak pernah ada di sistem.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="w-full sm:w-1/2 h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-100 gap-2"
          >
            <ArrowLeft size={18} />
            Kembali
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full sm:w-1/2 h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-600/20"
          >
            <Home size={18} />
            Beranda Utama
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
