/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Download, ExternalLink, Music, Play, AlertCircle,
  Instagram, Facebook, ArrowUpRight, Eye
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
  if (!url) return null;
  if (/instagram\.com/i.test(url)) return "instagram";
  if (/facebook\.com|fb\.com|fb\.watch/i.test(url)) return "facebook";
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/tiktok\.com/i.test(url)) return "tiktok";
  return "generic";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function YouTubeEmbed({ url, title }) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <div className="w-full aspect-video bg-black">
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
  const isInstagram = platform === "instagram";
  const isFacebook  = platform === "facebook";

  const config = isInstagram
    ? {
        gradient: "from-[#833ab4] via-[#fd1d1d] to-[#f77737]",
        icon: <Instagram className="w-12 h-12 text-white" />,
        label: "Instagram",
        btnClass: "bg-gradient-to-r from-[#833ab4] to-[#f77737] hover:opacity-90",
        tagline: "Konten ini ada di Instagram",
        sub: "Klik tombol di bawah untuk melihat postingan asli",
      }
    : {
        gradient: "from-[#1877F2] to-[#0a5dc2]",
        icon: <Facebook className="w-12 h-12 text-white" />,
        label: "Facebook",
        btnClass: "bg-[#1877F2] hover:bg-[#0a5dc2]",
        tagline: "Konten ini ada di Facebook",
        sub: "Klik tombol di bawah untuk melihat postingan asli",
      };

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-900 min-h-[380px] relative overflow-hidden">
      {/* Decorative blobs */}
      <div className={`absolute -top-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br ${config.gradient} opacity-20 blur-3xl pointer-events-none`} />
      <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-tl ${config.gradient} opacity-20 blur-3xl pointer-events-none`} />

      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-6 shadow-2xl`}>
        {config.icon}
      </div>

      <span className={`text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent mb-2`}>
        {config.label}
      </span>

      <h3 className="text-white text-xl font-bold mb-2 max-w-xs leading-snug">
        {title || config.tagline}
      </h3>
      <p className="text-slate-400 text-sm mb-8 max-w-xs">
        {config.sub}
      </p>

      {/* Mini "preview" bar */}
      <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3 mb-8 backdrop-blur-sm">
        <Eye className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-slate-300 text-xs truncate font-mono">{url}</span>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 ${config.btnClass} text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5`}
      >
        <ArrowUpRight size={18} />
        Buka di {config.label}
      </a>
    </div>
  );
}

function ImageEmbed({ url, title }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full flex items-center justify-center bg-slate-900 min-h-[380px] relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={title}
        onLoad={() => setLoaded(true)}
        className={`max-h-[80vh] w-auto object-contain transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

function AudioEmbed({ url }) {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-slate-900 min-h-[380px] py-12 px-6">
      <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-purple-900/50 animate-[pulse_3s_ease-in-out_infinite]">
        <Music className="w-14 h-14 text-white" />
      </div>
      <audio controls className="w-full max-w-md rounded-xl overflow-hidden">
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
      className="w-full h-[640px] bg-white border-0"
      title="PDF Viewer"
    />
  );
}

function GenericVideoEmbed({ url, title }) {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-slate-900 min-h-[380px] py-12 px-6 text-center">
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20">
        <Play className="w-10 h-10 text-white" fill="currentColor" />
      </div>
      <p className="text-slate-300 mb-6">Konten Video Eksternal</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition"
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

  // Link / video types — route by platform
  if (type === "link" || type === "video") {
    if (platform === "youtube")   return <YouTubeEmbed url={url} title={title} />;
    if (platform === "instagram") return <SocialCard url={url} platform="instagram" title={title} />;
    if (platform === "facebook")  return <SocialCard url={url} platform="facebook"  title={title} />;
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
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Link Tidak Ditemukan</h1>
        <p className="text-slate-500 max-w-md">
          Mungkin link ini sudah kadaluarsa, dihapus oleh pemiliknya, atau Anda salah mengetik URL.
        </p>
      </div>
    );
  }

  const platform = detectPlatform(data.url);
  const isSocial  = platform === "instagram" || platform === "facebook";
  const isYouTube = platform === "youtube";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5">

        {/* ── Header ── */}
        <div className="bg-white p-6 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 shrink-0">
            {data.owner_name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight truncate">
              {data.title}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Karya oleh{" "}
              <span className="text-indigo-600">{data.owner_name}</span>{" "}
              • {data.created_at}
            </p>
          </div>
        </div>

        {/* ── Preview ── */}
        <ContentPreview data={data} />

        {/* ── Footer ── */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Powered by Tapamajuma Learning Platform
          </div>

          <a
            href={data.url}
            download={!isSocial && !isYouTube ? true : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-xl w-full md:w-auto justify-center"
          >
            {isSocial || data.type === "link" ? (
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