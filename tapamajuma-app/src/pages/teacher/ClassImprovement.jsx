import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, MessageSquareQuote, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Sesuaikan path UI Anda

export default function ClassImprovement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <LayoutDashboard className="text-indigo-600 h-8 w-8" />
          Peningkatan Kelas
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Pusat kendali untuk memantau perkembangan siswa dan forum refleksi pembelajaran.
          Silakan pilih menu di bawah ini.
        </p>
      </div>

      {/* MENU CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
        
        {/* CARD 1: ANALISIS SISWA */}
        <div 
          onClick={() => navigate('/teacher/class-improvement/analysis')} 
          className="group cursor-pointer"
        >
          <Card className="h-full border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 size={100} className="text-indigo-600 transform group-hover:scale-110 transition-transform duration-500" />
            </div>
            
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors duration-300">
                <BarChart3 className="text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <CardTitle className="text-xl">Analisis Siswa</CardTitle>
              <CardDescription>
                Lihat statistik performa, grafik nilai, dan perkembangan kompetensi siswa secara visual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-bold text-indigo-600 mt-4 group-hover:translate-x-2 transition-transform">
                Buka Analisis <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CARD 2: FORUM REFLEKSI */}
        <div 
          onClick={() => navigate('/teacher/class-improvement/reflection')} 
          className="group cursor-pointer"
        >
          <Card className="h-full border-slate-200 hover:border-pink-300 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageSquareQuote size={100} className="text-pink-600 transform group-hover:scale-110 transition-transform duration-500" />
            </div>

            <CardHeader>
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 transition-colors duration-300">
                <MessageSquareQuote className="text-pink-600 group-hover:text-white transition-colors" />
              </div>
              <CardTitle className="text-xl">Forum Refleksi</CardTitle>
              <CardDescription>
                Wadah umpan balik dari siswa mengenai tantangan belajar dan target perbaikan mereka.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-bold text-pink-600 mt-4 group-hover:translate-x-2 transition-transform">
                Buka Forum <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}