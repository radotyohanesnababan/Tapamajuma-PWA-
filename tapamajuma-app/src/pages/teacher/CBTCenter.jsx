import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, MonitorPlay } from 'lucide-react';
import ExamList from '@/components/ExamList';
import ExamForm from '@/components/ExamForm';
import ExamLiveControl from '@/components/ExamLiveControl';
import ExamResultsList from '@/components/ExamResultsList';

const CBTCenter = () => {
  // view: 'list' | 'create' | 'live'
  const [currentView, setCurrentView] = useState('list');
  const [activeExam, setActiveExam] = useState(null); // Menyimpan data ujian yang sedang di-Live-kan

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 mb-24">
      
      {/* HEADER & NAVIGASI TAB */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">CBT Control Center</h1>
          <p className="text-slate-500">Sistem Ujian Berbasis Komputer</p>
        </div>
        <div>
          <h1></h1>
        </div>
        
        <div className="flex bg-white rounded-full p-1 border border-slate-200 shadow-sm">
          <button 
            onClick={() => setCurrentView('list')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} /> Daftar Paket
          </button>
          <button 
            onClick={() => setCurrentView('create')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'create' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <PlusCircle size={18} /> Buat Paket Baru
          </button>
          {activeExam && (
             <button 
               onClick={() => setCurrentView('live')}
               className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${currentView === 'live' ? 'bg-emerald-500 text-white' : 'text-emerald-600 hover:bg-emerald-50'}`}
             >
               <MonitorPlay size={18} /> Live Control
             </button>
          )}
        </div>
      </div>

      {/* RENDER KOMPONEN BERDASARKAN TAB */}
      <div className="mt-6">
        {currentView === 'list' && <ExamList setView={setCurrentView} setActiveExam={setActiveExam} />}
        {currentView === 'create' && <ExamForm setView={setCurrentView} />}
        {currentView === 'live' && <ExamLiveControl exam={activeExam} setView={setCurrentView} />}
        {currentView === 'results' && <ExamResultsList exam={activeExam} setView={setCurrentView} />}
      </div>
    </div>
  );
};

export default CBTCenter;