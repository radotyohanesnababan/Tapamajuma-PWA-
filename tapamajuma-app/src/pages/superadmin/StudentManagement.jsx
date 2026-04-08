import React, { useState } from 'react';
import { GraduationCap, Users, KeyRound } from "lucide-react";
import { usePageTitle } from '@/hooks/usePageTitle';

// Import Hook & Komponen yang baru kita buat
import { useAdminData } from '@/hooks/useAdminData'; 
import StudentDataTable from './StudentDataTable'; 
import NisManagementTable from './NisManagementTable'; 

export default function StudentManagement() {
  usePageTitle("Manajemen Siswa & NISN");
  
  // Inisialisasi satu hook utama
  const adminData = useAdminData();
  
  // State untuk Tab Aktif ('students' atau 'nis')
  const [activeTab, setActiveTab] = useState('students');

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-6 font-sans text-slate-900">
      
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            Siswa & Kredensial
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Kelola data profil siswa dan ketersediaan NISN sekolah.
          </p>
        </div>
      </div>

      {/* SISTEM TABS */}
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'students' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={16} /> Data Siswa
        </button>
        <button
          onClick={() => setActiveTab('nis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'nis' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <KeyRound size={16} /> Master NISN
        </button>
      </div>

      {/* RENDER KOMPONEN BERDASARKAN TAB */}
      <div className="mt-4">
        {activeTab === 'students' ? (
          <StudentDataTable hookData={adminData} />
        ) : (
          <NisManagementTable hookData={adminData} />
        )}
      </div>

    </div>
  );
}