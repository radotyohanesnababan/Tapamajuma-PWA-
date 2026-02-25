/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Download, ExternalLink, Music, Play, AlertCircle,
  Instagram, Facebook, ArrowUpRight, Eye, MessageCircle, Phone,
  Video
} from "lucide-react";
import api from "@/lib/axios";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function detectPlatform(url) {
  if (!url) return "generic";
  if (/instagram\.com|instagr\.am/i.test(url)) return "instagram";
  if (/facebook\.com|fb\.com|fb\.watch/i.test(url)) return "facebook";
  if (/whatsapp\.com|wa\.me/i.test(url)) return "whatsapp"; // Tambahan WA
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  return "generic";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function YouTubeEmbed({ url, title }) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <div className="w-full aspect-video bg-black rounded-b-xl md:rounded-b-none md:rounded-r-xl overflow-hidden">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title || "YouTube Video"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function SocialCard({ url, platform, title }) {
  // Konfigurasi Tampilan per Platform
  const configs = {
    instagram: {
      gradient: "from-[#833ab4] via-[#fd1d1d] to-[#f77737]",
      bgGlow: "bg-fuchsia-500",
      icon: <Instagram className="w-12 h-12 text-white" />,
      label: "Instagram",
      btnClass: "bg-gradient-to-r from-[#833ab4] to-[#f77737] hover:opacity-90 border-0",
      tagline: "Postingan Instagram",
      sub: "Konten ini berada di Instagram. Klik tombol di bawah untuk melihatnya.",
      action: "Buka Instagram"
    },
    facebook: {
      gradient: "from-[#1877F2] to-[#0a5dc2]",
      bgGlow: "bg-blue-500",
      icon: <Facebook className="w-12 h-12 text-white" />,
      label: "Facebook",
      btnClass: "bg-[#1877F2] hover:bg-[#0a5dc2] border-0",
      tagline: "Postingan Facebook",
      sub: "Konten ini berada di Facebook. Klik tombol di bawah untuk melihatnya.",
      action: "Buka Facebook"
    },
    whatsapp: {
      gradient: "from-[#25D366] to-[#128C7E]",
      bgGlow: "bg-green-500",
      icon: <MessageCircle className="w-12 h-12 text-white" />, // Atau Icon Phone
      label: "WhatsApp",
      btnClass: "bg-[#25D366] hover:bg-[#128C7E] border-0",
      tagline: "Tautan WhatsApp",
      sub: "Ini adalah tautan obrolan atau grup WhatsApp. Klik untuk bergabung/chat.",
      action: "Buka WhatsApp"
    },
    tiktok: {
      gradient: "from-[#000000] to-[#161616]",
      bgGlow: "bg-black",
      icon: <Video className="w-12 h-12 text-white" />,
      label: "TikTok",
      btnClass: "bg-black hover:bg-gray-900 border-0",
      tagline: "Video TikTok",
      sub: "Konten ini berada di TikTok. Klik tombol di bawah untuk melihatnya.",
      action: "Buka TikTok"
    }

  };

  const config = configs[platform] || configs.instagram; // Default ke IG kalo error

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-900 min-h-[400px] relative overflow-hidden group">
      
      {/* Background Animated Blobs */}
      <div className={`absolute -top-20 -left-20 w-72 h-72 rounded-full ${config.bgGlow} opacity-20 blur-[100px] pointer-events-none group-hover:opacity-30 transition-opacity duration-700`} />
      <div className={`absolute -bottom-20 -right-20 w-72 h-72 rounded-full ${config.bgGlow} opacity-20 blur-[100px] pointer-events-none group-hover:opacity-30 transition-opacity duration-700`} />

      {/* Icon Wrapper */}
      <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-8 shadow-2xl transform group-hover:scale-110 transition-transform duration-500`}>
        <div className="absolute inset-0 bg-white opacity-10 rounded-3xl animate-pulse"></div>
        {config.icon}
      </div>

      <span className={`text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-3`}>
        {config.label} Link
      </span>

      <h3 className="text-white text-2xl font-bold mb-3 max-w-md leading-snug">
        {title || config.tagline}
      </h3>
      
      <p className="text-slate-400 text-sm mb-10 max-w-xs leading-relaxed">
        {config.sub}
      </p>

      {/* URL Preview Bar */}
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-full px-5 py-3 flex items-center gap-3 mb-8 backdrop-blur-md">
        <div className={`w-2 h-2 rounded-full ${config.bgGlow}`}></div>
        <span className="text-slate-300 text-xs truncate font-mono opacity-70">{url}</span>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 ${config.btnClass} text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-95`}
      >
        <ArrowUpRight size={20} />
        {config.action}
      </a>
    </div>
  );
}

function ImageEmbed({ url, title }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full flex items-center justify-center bg-slate-900 min-h-[400px] relative overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Blurred Background for Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
            style={{ backgroundImage: `url(${url})` }}
        />
        <img
            src={url}
            alt={title}
            onLoad={() => setLoaded(true)}
            className={`relative max-h-[80vh] w-auto max-w-full object-contain shadow-2xl rounded-lg transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        />
      </div>
    </div>
  );
}

function AudioEmbed({ url }) {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-slate-900 min-h-[300px] py-12 px-6 relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-indigo-900/20" />
      
      <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(99,102,241,0.5)] animate-[pulse_3s_ease-in-out_infinite]">
        <Music className="w-14 h-14 text-white" />
      </div>
      <audio controls className="relative z-10 w-full max-w-md rounded-xl overflow-hidden shadow-xl border border-white/10">
        <source src={url} />
        Browser Anda tidak mendukung audio player.
      </audio>
    </div>
  );
}

function PDFEmbed({ url }) {
  return (
    <iframe
      src={url}
      className="w-full h-[80vh] bg-white border-0"
      title="PDF Viewer"
    />
  );
}

function GenericVideoEmbed({ url, title }) {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-slate-900 min-h-[400px] py-12 px-6 text-center">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20 backdrop-blur-sm">
        <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
      </div>
      <h3 className="text-white text-xl font-bold mb-2">Video Eksternal</h3>
      <p className="text-slate-400 mb-8 max-w-sm">
        Video ini dihosting di platform eksternal. Klik tombol di bawah untuk menonton.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition shadow-lg hover:shadow-red-900/20"
      >
        <Play size={18} fill="currentColor" /> Tonton Video
      </a>
    </div>
  );
}

// ─── Content Router ──────────────────────────────────────────────────────────

function ContentPreview({ data }) {
  const { type, url, title } = data;
  const platform = detectPlatform(url);

  if (type === "image") return <ImageEmbed url={url} title={title} />;
  if (type === "audio") return <AudioEmbed url={url} />;
  if (type === "pdf")   return <PDFEmbed url={url} />;

  // Logic untuk Link & Video
  if (type === "link" || type === "video") {
    if (platform === "youtube")   return <YouTubeEmbed url={url} title={title} />;
    
    // Grouping Social Media (IG, FB, WA) ke SocialCard
    if (["instagram", "facebook", "whatsapp",'tiktok'].includes(platform)) {
        return <SocialCard url={url} platform={platform} title={title} />;
    }
    
    return <GenericVideoEmbed url={url} title={title} />;
  }

  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SharedGallery() {
  const { token } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/public/gallery/${token}`);
        setData(response.data);
      } catch (err) {
        console.error("Gagal memuat galeri:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Memuat Karya...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4 inline-block">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Link Tidak Ditemukan</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Mungkin link ini sudah kadaluarsa, dihapus oleh pemiliknya, atau Anda salah mengetik URL.
        </p>
      </div>
    );
  }

  const platform = detectPlatform(data.url);
  const isSocial = ["instagram", "facebook", "whatsapp", "youtube", "tiktok"].includes(platform);
  const isDirectFile = ["image", "audio", "pdf"].includes(data.type);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5 transition-all">

        {/* ── Header ── */}
        <div className="bg-white p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-200 shrink-0">
            {data.owner_name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight truncate mb-1">
              {data.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 font-medium">
              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {data.owner_name}
              </span>
              <span>•</span>
              <span>{data.created_at || "Baru saja"}</span>
            </div>
          </div>
        </div>

        {/* ── Content Preview Area ── */}
        <div className="bg-slate-900">
            <ContentPreview data={data} />
        </div>

        {/* ── Footer / Action Bar ── */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center md:text-left">
            Shared via Tapamajuma
          </div>

          <a
            href={data.url}
            // Download hanya aktif jika BUKAN sosmed dan TIPE file langsung
            download={!isSocial && isDirectFile ? true : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl w-full md:w-auto justify-center
                ${isSocial 
                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5"
                }
            `}
          >
            {isSocial ? (
              <><ExternalLink size={18} /> Buka Link Asli</>
            ) : (
              <><Download size={18} /> Download File</>
            )}
          </a>
        </div>

      </div>
    </div>
  );
}