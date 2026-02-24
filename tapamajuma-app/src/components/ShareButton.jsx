import { useState } from 'react';
import { Share2, Check, MessageCircle } from 'lucide-react';
import api from "@/lib/axios";
import { toast } from 'sonner'; // atau 'react-toastify' sesuai library Anda

const ShareButton = ({ galleryId, title }) => {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/api/galleries/${galleryId}/share`);
            const link = res.data.url;

            await navigator.clipboard.writeText(link);
            
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
        try {
                const res = await api.post(`/api/galleries/${galleryId}/share`);
                const text = `Cek karya "${title}" di Tapamajuma! 🚀\n${res.data.url}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        } catch {
                toast.error("Gagal membuka WhatsApp");
        }
    };

    return (
        <div className="flex gap-2">
                <button 
                        onClick={handleShare}
                        disabled={loading}
                        className={`
                                h-10 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2
                                ${copied 
                                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                                }
                        `}
                >
                        {loading ? (
                                <span className="animate-spin text-lg">⏳</span> 
                        ) : copied ? (
                                <>
                                        <Check size={16} />
                                        <span>Disalin</span>
                                </>
                        ) : (
                                <>
                                        <Share2 size={16} />
                                        <span>Share</span>
                                </>
                        )}
                </button>

                <button 
                        onClick={shareToWA}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                        title="Kirim ke WhatsApp"
                >
                        <MessageCircle size={18} />
                </button>
        </div>
    );
};

export default ShareButton;
