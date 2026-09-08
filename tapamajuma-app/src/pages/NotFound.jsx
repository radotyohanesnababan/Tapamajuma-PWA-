import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Helmet>
        <title>Halaman Tidak Ditemukan | Tapamajuma</title>
      </Helmet>
      
      <div className="w-full max-w-md text-center space-y-8">
        
        {/* Animated illustration / 404 Text */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <h1 className="text-9xl font-extrabold text-slate-200 tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-200/50">
              <Compass className="w-12 h-12" />
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-3xl font-bold text-slate-900">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            Maaf, halaman yang Anda cari mungkin telah dihapus, namanya diubah, atau sementara tidak tersedia.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
        >
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="w-full sm:w-auto flex items-center gap-2 h-12 rounded-xl text-slate-700 border-slate-300 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full sm:w-auto flex items-center gap-2 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Button>
        </motion.div>
        
      </div>
    </div>
  );
};

export default NotFound;
