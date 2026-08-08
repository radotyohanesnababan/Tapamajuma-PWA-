import React, { useState } from "react";
import {
  LayoutDashboard, PlusCircle, MonitorPlay,
  ClipboardList, ChevronRight, Radio, Zap
} from "lucide-react";
import ExamList from "@/components/ExamList";
import ExamForm from "@/components/ExamForm";
import ExamLiveControl from "@/components/ExamLiveControl";
import ExamResultsList from "@/components/ExamResultsList";

const TABS = [
  { key: "list", label: "Daftar Paket", icon: ClipboardList },
  { key: "create", label: "Buat Baru", icon: PlusCircle },
];

export default function CBTCenter() {
  const [currentView, setCurrentView] = useState("list");
  const [activeExam, setActiveExam] = useState(null);

  // Gabung tab statis + tab dinamis (live)
  const visibleTabs = [
    ...TABS,
    ...(activeExam
      ? [{ key: "live", label: "Live", icon: Radio }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes pulse-soft { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-slate-200 z-20">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">
                CBT System
              </p>
              <h1 className="text-base font-bold text-slate-800">
                Control Center
              </h1>
              <div>
                <p className="text-[9px] text-slate-800 font-bold mt-1 bg-yellow-300 px-2 py-1 rounded-lg inline-block">
                 Fitur ini masih dalam masa pengembangan. Beberapa fitur mungkin belum tersedia atau masih dalam tahap uji coba.
                </p>
              </div>
            </div>

            {/* Live indicator */}
            {activeExam && currentView !== "live" && (
              <button
                onClick={() => setCurrentView("live")}
                className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-[9px] font-semibold text-emerald-700 hover:bg-emerald-100 transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-soft" />
                Live aktif
                <ChevronRight size={10} />
              </button>
            )}
          </div>

          {/* ═══ TAB BAR ═══ */}
          <div className="flex gap-0 -mb-px">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentView === tab.key;
              const isLive = tab.key === "live";

              return (
                <button
                  key={tab.key}
                  onClick={() => setCurrentView(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-semibold border-b-2 transition -mb-px ${
                    isActive
                      ? isLive
                        ? "border-emerald-500 text-emerald-700"
                        : "border-slate-800 text-slate-800"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-soft" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {currentView === "list" && (
          <ExamList
            setView={setCurrentView}
            setActiveExam={setActiveExam}
          />
        )}
        {currentView === "create" && (
          <ExamForm setView={setCurrentView} />
        )}
        {currentView === "live" && (
          <ExamLiveControl
            exam={activeExam}
            setView={setCurrentView}
          />
        )}
        {currentView === "results" && (
          <ExamResultsList
            exam={activeExam}
            setView={setCurrentView}
          />
        )}
      </div>
    </div>
  );
}