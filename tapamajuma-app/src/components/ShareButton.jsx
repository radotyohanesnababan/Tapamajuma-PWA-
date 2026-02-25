import { useState } from 'react';
import { Share2, Check, MessageCircle, Copy } from 'lucide-react';
import api from "@/lib/axios";
import { toast } from 'sonner'; 

const ShareButton = ({ galleryId, title }) => {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // --- HELPER SAKTI: Ubah Link Frontend jadi Link API ---
    const convertToApiUrl = (originalUrl) => {
        try {
            // Asumsi originalUrl bentuknya: https://tapamajuma.my.id/s/TOKEN
            // Kita ambil bagian terakhir (TOKEN)
            const parts = originalUrl.split('/');
            const token = parts[parts.length - 1]; // Ambil token di ujung

            // Kita rakit ulang pakai domain API (Pancingan Laravel)
            return `https://tapamajuma-api.my.id/s/${token}`;
        } catch (e) {
            // Kalau formatnya aneh, balikin aja aslinya
            return originalUrl;
        }
    };

    const handleShare = async () => {
        setLoading(true);
        try {
            // 1. Minta Backend generate Link (biasanya dikasih link FE)
            const res = await api.post(`/api/galleries/${galleryId}/share`);
            
            // 2. KITA UBAH JADI LINK API
            const finalLink = convertToApiUrl(res.data.url);

            // 3. Salin Link API tersebut
            await navigator.clipboard.writeText(finalLink);
            
            setCopied(true);
            toast.success("Link berhasil disalin! (Versi Preview)");
            
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
            // 1. Minta Backend generate Link
            const res = await api.post(`/api/galleries/${galleryId}/share`);
            
            // 2. KITA UBAH JADI LINK API
            const finalLink = convertToApiUrl(res.data.url);

            // 3. Buka WA dengan Link API
            const text = `Cek karya "${title}" di Tapamajuma! 🚀\n${finalLink}`;
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
                        <span>Disalin</span>
                    </>
                ) : (
                    <>
                        <Copy size={16} />
                        <span>Salin Link</span>
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