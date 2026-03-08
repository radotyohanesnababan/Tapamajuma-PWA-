import { useState } from 'react';
import { Check, MessageCircle, Copy } from 'lucide-react';
import api from "@/lib/axios";
import { toast } from 'sonner'; 

const ShareButton = ({ galleryId, title }) => {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/api/galleries/${galleryId}/share`);
            await navigator.clipboard.writeText(res.data.url);
            setCopied(true);
            toast.success("Link berhasil disalin!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Gagal mengambil link share.");
        } finally {
            setLoading(false);
        }
    };

    const shareToWA = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/api/galleries/${galleryId}/share`);
            const text = `Cek karya "${title}" di Tapamajuma! 🚀\n${res.data.url}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        } catch {
            toast.error("Gagal membuka WhatsApp");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2 items-center">
            <button 
                onClick={handleShare}
                disabled={loading}
                className={`
                    h-10 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border shadow-sm
                    ${copied 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-2 ring-emerald-500/20' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600'
                    }
                `}
            >
                {loading ? (
                    <span className="animate-spin">⏳</span> 
                ) : copied ? (
                    <>
                        <Check size={16} />
                        <span>Link Disalin!</span>
                    </>
                ) : (
                    <>
                        <Copy size={16} />
                        <span>Salin Link/Bagikan</span>
                    </>
                )}
            </button>

            <button 
                onClick={shareToWA}
                disabled={loading}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm transition-all hover:-translate-y-0.5 active:scale-95"
                title="Kirim ke WhatsApp"
            >
                <MessageCircle size={20} />
            </button>
        </div>
    );
};

export default ShareButton;