import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Award, Calendar, Printer, Loader2, CheckCircle2 } from "lucide-react";
// import './Certificate.css'; // Opsional, jika masih ada style khusus print

// --- KOMPONEN CETAK (Disembunyikan dari layar, hanya untuk printer) ---
const PrintableCertificate = React.forwardRef(({ data }, ref) => {
    if (!data) return null;
    return (
        <div ref={ref} className="print-area" style={{ padding: "40px", fontFamily: "serif", width: "297mm", height: "210mm", boxSizing: "border-box" }}>
            <div style={{ border: "10px double #ea580c", height: "100%", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#333" }}>
                <h1 style={{ fontSize: "48px", color: "#ea580c", margin: "0 0 10px 0", textTransform: "uppercase" }}>Sertifikat Penghargaan</h1>
                <p style={{ fontSize: "20px", fontStyle: "italic", margin: "0 0 20px 0" }}>Diberikan kepada</p>
                <h2 style={{ fontSize: "36px", margin: "10px 0", borderBottom: "2px solid #333", display: "inline-block", paddingBottom: "5px", minWidth: "400px" }}>
                    {/* Ganti dengan nama user dinamis jika ada */}
                    Siswa Teladan
                </h2>
                <p style={{ fontSize: "18px", marginTop: "20px" }}>Atas kelulusannya dalam materi:</p>
                <h3 style={{ fontSize: "32px", color: "#c2410c", fontWeight: "bold", margin: "10px 0 30px 0" }}>{data.title}</h3>
                
                <div style={{ display: "flex", justifyContent: "space-between", width: "80%", marginTop: "50px" }}>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "5px 0", fontSize: "14px" }}>Tanggal Penyelesaian</p>
                        <p style={{ fontWeight: "bold" }}>{data.date}</p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "5px 0", fontSize: "14px" }}>Penerbit</p>
                        <p style={{ fontWeight: "bold" }}>{data.issuer}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- KOMPONEN UTAMA (Tampilan Dashboard) ---
export default function Certificate() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCert, setSelectedCert] = useState(null);
    const componentRef = useRef();

    // Setup fungsi print
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Sertifikat-${selectedCert?.title || 'Download'}`,
    });

    useEffect(() => {
        // Simulasi Fetch Data
        setTimeout(() => {
            setCertificates([
                { id: 1, title: 'Dasar Pemrograman Web', issuer: 'Tapamajuma Academy', date: '2025-01-20' },
                { id: 2, title: 'Matematika Aljabar Level 1', issuer: 'Tapamajuma Math', date: '2025-02-10' },
                { id: 3, title: 'Literasi Digital Dasar', issuer: 'Perpusnas', date: '2025-02-15' },
            ]);
            setLoading(false);
        }, 1500);
    }, []);

    const onPrintClick = (cert) => {
        setSelectedCert(cert);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 space-y-6 animate-in slide-in-from-bottom-4 max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-orange-50 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                        <Award className="text-orange-500 w-6 h-6" />
                        Galeri Sertifikat
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Kumpulan pencapaian hebatmu ada di sini.
                    </p>
                </div>
                <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                    {certificates.length} Sertifikat
                </div>
            </div>

            {/* Content State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-300" />
                    <span className="text-sm">Menyiapkan sertifikatmu...</span>
                </div>
            ) : certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                        <div 
                            key={cert.id} 
                            className="group relative bg-white border-2 border-slate-100 hover:border-orange-200 rounded-2xl p-5 transition-all hover:shadow-md flex flex-col justify-between"
                        >
                            {/* Icon Background Decoration */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Award className="w-24 h-24 text-orange-600" />
                            </div>

                            <div className="space-y-3 z-10">
                                <div className="flex items-start justify-between">
                                    <div className="bg-orange-100/50 p-2 rounded-xl text-orange-600">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                        Terverifikasi
                                    </span>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight group-hover:text-orange-700 transition-colors">
                                        {cert.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                        {cert.issuer}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-50">
                                    <Calendar className="w-3 h-3" />
                                    {cert.date}
                                </div>
                            </div>

                            {/* Button Cetak */}
                            <button 
                                onClick={() => onPrintClick(cert)}
                                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-orange-50 text-orange-700 font-bold text-sm border border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Printer className="w-4 h-4" />
                                Cetak Sertifikat
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Belum ada sertifikat yang didapat.</p>
                </div>
            )}

            {/* Hidden Print Component */}
            <div style={{ display: "none" }}>
                <PrintableCertificate 
                    ref={componentRef} 
                    data={selectedCert} 
                />
            </div>
        </div>
    );
}