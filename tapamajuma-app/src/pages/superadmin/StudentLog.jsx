import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function StudentLog() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get('/api/admin/activity-report/student').then(res => setStudents(res.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Log Aktivitas Siswa</h1>
        {/* Bisa tambah Search Bar disini */}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Total Tugas</th>
                <th className="px-6 py-4">Rata-rata Skor</th>
                <th className="px-6 py-4">Terakhir Aktif</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-600 font-bold">
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-slate-700">{student.name}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">{student.total_tasks}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        student.avg_score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                        {Number(student.avg_score).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {student.last_active 
                        ? formatDistanceToNow(new Date(student.last_active), { addSuffix: true, locale: id }) 
                        : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {/* Logika Status Sederhana */}
                    {!student.last_active ? (
                        <Badge variant="destructive">Pasif</Badge>
                    ) : (
                        <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50">Aktif</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}