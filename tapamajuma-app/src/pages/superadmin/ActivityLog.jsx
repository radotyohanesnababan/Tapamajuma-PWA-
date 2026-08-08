import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ActivityLogPage() {
  usePageTitle("Log Aktivitas");
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, last_page: 1, total: 0 });
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs(1);
  }, [date]);

  const fetchLogs = (page) => {
    setLoading(true);
    api.get("/api/activity-log", { params: { page, per_page: 20, date: date || undefined } })
      .then((res) => {
        setLogs(res.data.data || []);
        setMeta(res.data.meta || { page: 1, last_page: 1, total: 0 });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Log Aktivitas</h1>
        <p className="text-slate-500 mt-1">Riwayat aktivitas pengguna di sistem (7 hari terakhir)</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity size={20} />
              Aktivitas
            </CardTitle>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-400 font-medium">Memuat log...</p>
            </div>
          ) : logs.length > 0 ? (
            <>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        User #{log.user_id}
                      </p>
                      <p className="text-xs text-slate-500">{log.action}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-slate-400 font-medium">
                  Halaman {meta.page} dari {meta.last_page} ({meta.total} log)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => fetchLogs(meta.page - 1)}
                    className="h-8 px-3"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={meta.page >= meta.last_page}
                    onClick={() => fetchLogs(meta.page + 1)}
                    className="h-8 px-3"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-2">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <Activity className="text-slate-300" size={28} />
              </div>
              <p className="text-sm text-slate-400 font-medium">Belum ada aktivitas tercatat</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}