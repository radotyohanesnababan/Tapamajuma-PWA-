import { useState } from "react";
import { X, Bell, Globe, Megaphone, MessageSquareHeart, Share2, ArrowRight } from "lucide-react";
import ForwardAnnouncementModal from "./ForwardAnnouncementModal";

export default function NotificationModal({
  isOpen,
  onClose,
  notifications = [],
  isLoading = false,
  onRefresh,
  onSelectFeedback,
}) {
  const [forwardingItem, setForwardingItem] = useState(null);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getItemBadge = (item) => {
    if (item.type === "global_announcement") {
      return {
        label: "Dinas / Stakeholder",
        icon: <Globe size={11} />,
        badgeClass: "bg-violet-50 text-violet-600 border-violet-100",
        iconBg: "bg-violet-100 text-violet-600",
      };
    }
    if (item.type === "teacher_feedback") {
      return {
        label: "Balasan Guru",
        icon: <MessageSquareHeart size={11} />,
        badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
        iconBg: "bg-emerald-100 text-emerald-600",
      };
    }
    return {
      label: item.source || "Sekolah",
      icon: <Megaphone size={11} />,
      badgeClass: "bg-indigo-50 text-indigo-600 border-indigo-100",
      iconBg: "bg-indigo-100 text-indigo-600",
    };
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Bell size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">Pusat Notifikasi</h3>
                  {notifications.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">Pengumuman & informasi terbaru</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Belum Ada Notifikasi</p>
                  <p className="text-xs text-slate-400 mt-0.5">Semua informasi dan pengumuman terbaru akan muncul di sini.</p>
                </div>
              </div>
            ) : (
              notifications.map((item) => {
                const badge = getItemBadge(item);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-all shadow-sm space-y-2.5"
                  >
                    {/* Badge & Tanggal */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.badgeClass}`}
                      >
                        {badge.icon} {badge.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    {/* Judul & Konten */}
                    <div className="space-y-1">
                      {item.title && (
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{item.title}</h4>
                      )}
                      <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-pre-line">
                        {item.content}
                      </p>
                    </div>

                    {/* Action Button: Teruskan (Admin) */}
                    {item.can_forward && (
                      <div className="pt-2 border-t border-slate-50 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setForwardingItem(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition"
                        >
                          <Share2 size={13} /> Teruskan ke Sekolah
                        </button>
                      </div>
                    )}

                    {/* Action Button: Balasan Guru (Siswa) */}
                    {item.type === "teacher_feedback" && (
                      <div className="pt-2 border-t border-slate-50 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectFeedback) onSelectFeedback(item);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition"
                        >
                          <MessageSquareHeart size={13} /> Lihat Detail Balasan <ArrowRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tapamajuma Notification Center</span>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Submodal Forward Announcement */}
      {forwardingItem && (
        <ForwardAnnouncementModal
          announcement={forwardingItem}
          isOpen={!!forwardingItem}
          onClose={() => setForwardingItem(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
}
