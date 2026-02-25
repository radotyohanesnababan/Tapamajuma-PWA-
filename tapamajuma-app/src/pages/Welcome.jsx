/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WelcomeLayout from '@/layouts/WelcomeLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade'; // Tambahan untuk efek fade (opsional, buat swiper lebih smooth)
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Sparkles, Activity, BookOpen, BrainCircuit, Target, Users, CheckCircle2, ImageOff, Download } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';

export default function Welcome() {
    const [auth, setAuth] = useState(false);
    // State khusus PWA
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); // Cegah prompt muncul otomatis
            setDeferredPrompt(e); // Simpan event-nya
            setIsInstallable(true); // Tampilkan tombol
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);
    const handleInstallClick = async () => {
    console.log('Tombol Install diklik...'); // Debugging
    
    if (!deferredPrompt) {
        console.warn('Event beforeinstallprompt belum ditangkap oleh browser.');
        return;
    }
    
    try {
        // Tampilkan prompt
        deferredPrompt.prompt();
        
        // Tunggu respon user
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('PWA Berhasil diinstal!');
            setIsInstallable(false);
        } else {
            console.log('User membatalkan instalasi.');
        }
        
        // Hapus prompt agar tidak bisa dipakai lagi (reset)
        setDeferredPrompt(null);
        
    } catch (error) {
        console.error('Gagal memicu instalasi PWA:', error);
    }
};
    
    // State untuk memicu animasi masuk (entrance animation)
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        if (token) setAuth(true);
        
        // Memicu animasi beberapa milidetik setelah komponen di-render
        setTimeout(() => setIsMounted(true), 100);
    }, []);

    const slides = [
        'images/hero1.png',
        'images/hero2.png',
        'images/hero3.png',
    ];

    const features = [
        { id: 1, name: "Literasi Digital", icon: <BookOpen size={32} className="text-sky-700 mb-3 group-hover:scale-110 transition-transform duration-300" /> },
        { id: 2, name: "Numerasi Aktif", icon: <Activity size={32} className="text-sky-700 mb-3 group-hover:scale-110 transition-transform duration-300" /> },
        { id: 3, name: "TKA (HOTS)", icon: <BrainCircuit size={32} className="text-sky-700 mb-3 group-hover:scale-110 transition-transform duration-300" /> },
        { id: 4, name: "Sesi Mandiri", icon: <Target size={32} className="text-sky-700 mb-3 group-hover:scale-110 transition-transform duration-300" /> },
        { id: 5, name: "Refleksi Jurnal", icon: <Sparkles size={32} className="text-sky-700 mb-3 group-hover:scale-110 transition-transform duration-300" /> },
        { id: 6, name: "Pantau Orang Tua", icon: <Users size={32} className="text-sky-700 mb-3 group-hover:scale-110 transition-transform duration-300" /> },
    ];

    // Fungsi Fallback Image (Jika gambar rusak/tidak ditemukan)
    const handleImageError = (e) => {
        e.target.onerror = null; // Mencegah infinite loop jika fallback juga gagal
        // Mengganti dengan gambar placeholder SVG bawaan
        e.target.src = 'https://placehold.co/800x700/f1f5f9/94a3b8?text=Gambar+Tidak+Tersedia';
    };

    return (
        <>
        <Helmet>
        {/* Ini untuk mengubah "TAPAMAJUMA: Beranda" */}
        <title>TAPAMAJUMA | Platform Monitoring Siswa </title>
        
        {/* Ini untuk mengubah Subtitle/Deskripsi di bawahnya */}
        <meta 
          name="description" 
          content="Pantau aktivitas belajar, literasi, dan numerasi siswa secara real-time. Hubungkan Guru, Siswa, dan Orang Tua dalam satu platform." 
        />
        
        {/* Opsional: Untuk tampilan saat link dibagikan di WA/IG (Open Graph) */}
        <meta property="og:title" content="TAPAMAJUMA - Generasi Maju" />
        <meta property="og:description" content="Platform monitoring pendidikan terintegrasi." />
        <meta property="og:image" content="https://cdn.tapamajuma-api.my.id/images/iconappp.png" />
      </Helmet>

                <WelcomeLayout title="Beranda" auth={auth}>
            <div className="flex flex-col w-full min-h-screen font-sans">
                
                {/* HERO SECTION */}
                <section
                    id="beranda"
                    className="relative flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden bg-gradient-to-b from-sky-50/80 to-white"
                >
                    {/* Background Swiper (Opasitas sangat rendah sebagai tekstur latar) */}
                    <div className="absolute inset-0 -z-10 opacity-[0.15]">
                        <Swiper
                            modules={[Autoplay, EffectFade]}
                            effect="fade"
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            loop={true}
                            className="w-full h-full"
                            
                        >
                            {slides.map((src, index) => (
                                <SwiperSlide key={index}>
                                    <img
                                        src={getStorageUrl(src)}
                                        alt="Rangkuman aktivitas belajar siswa di TAPAMAJUMA"
                                        onError={handleImageError}
                                        className="w-full h-full object-cover"
                                        width='800'
                                        height='700'
                                        loading={index === 0 ? "eager" : "lazy"} 
                                        fetchPriority={index === 0 ? "high" : "low"}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10 mt-8">
                        
                        {/* Area Teks Hero dengan Animasi Staggered */}
                        <div className="text-center md:text-left space-y-6">
                            <div className={`transition-all duration-700 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-none font-bold px-4 py-1.5 shadow-sm uppercase tracking-widest text-[10px]">
                                    Platform Monitoring Belajar
                                </Badge>
                            </div>
                            
                            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 drop-shadow-sm leading-[1.15] tracking-tight transition-all duration-700 delay-200 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                Bersama Membangun <br/>
                                {/* Efek Gradien Teks */}
                                <span className="bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent">
                                    Generasi Maju
                                </span>
                            </h1>
                            
                            <p className={`text-lg text-slate-700 leading-relaxed max-w-lg mx-auto md:mx-0 font-medium transition-all duration-700 delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                TAPAMAJUMA hadir untuk memantau aktivitas belajar, literasi, numerasi, dan perkembangan siswa secara terintegrasi antara guru, siswa, dan orang tua.
                            </p>
                            
                            <div className={`flex justify-center md:justify-start space-x-4 pt-4 transition-all duration-700 delay-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <Link 
                                    to="/login" 
                                    className="group inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 bg-sky-700 text-white shadow-xl shadow-sky-200 hover:bg-sky-700 hover:-translate-y-1 h-14 px-10"
                                >
                                    Mulai Sekarang
                                    <Sparkles size={16} className="ml-2 group-hover:rotate-12 transition-transform" />
                                </Link>
                            {/* TOMBOL INSTALL PWA (Hanya muncul jika di browser yang support & belum diinstal) */}
                            {isInstallable && (
                                <button 
                                    onClick={handleInstallClick}
                                    className="group inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 bg-white border-2 border-sky-100 text-sky-700 shadow-lg hover:border-sky-300 hover:bg-sky-50 hover:-translate-y-1 h-14 px-8"
                                >
                                    <Download size={18} className="mr-2 group-hover:translate-y-1 transition-transform" />
                                    Install Aplikasi
                                </button>
                            )}
                            </div>
                        </div>

                        {/* Area Gambar Hero */}
                        <div className={`flex justify-center md:justify-end relative transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                            {/* Efek Glow di Belakang Gambar */}
                            <div className="absolute inset-0 bg-sky-400 blur-[100px] opacity-20 rounded-full animate-pulse"></div>
                            <img
                                src={getStorageUrl("images/iconappp.png")}
                                alt="Logo TAPAMAJUMA Aplikasi Monitoring Siswa Untuk SMPN 1 Siborongborong"
                                onError={handleImageError}
                                width="500"
                                height="500"
                                className="w-full max-w-sm rounded-[3rem] shadow-2xl border-8 border-white bg-white/50 backdrop-blur-sm transition-transform duration-700 hover:scale-105 relative z-10"
                            />
                        </div>
                    </div>
                </section>

                {/* FITUR SECTION */}
                <section id="fitur" className="bg-white py-24 px-6 relative">
                    <div className="container mx-auto text-center relative z-10">
                        <div className={`transition-all duration-700 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Fokus Pengembangan Siswa</h2>
                            <p className="text-slate-500 font-medium mb-16 max-w-2xl mx-auto">
                                Kami merancang sistem yang berfokus pada pilar pendidikan modern untuk memastikan setiap siswa mendapatkan evaluasi yang komprehensif.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                            {features.map((item, index) => (
                                <Card 
                                    key={item.id} 
                                    // Animasi Staggered: Muncul bergantian berdasarkan index
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                    className={`text-center overflow-hidden transform hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-100 hover:border-sky-300 transition-all duration-500 rounded-3xl border-slate-100 group cursor-pointer ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                >
                                    <CardHeader className="bg-slate-50/50 group-hover:bg-gradient-to-b group-hover:from-sky-50/50 group-hover:to-white flex flex-col items-center justify-center h-44 transition-colors">
                                        <div className="p-4 bg-white rounded-[1.5rem] shadow-sm mb-2">
                                            {item.icon}
                                        </div>
                                        <CardTitle className="text-slate-700 text-sm font-bold mt-2 group-hover:text-sky-700 transition-colors">
                                            {item.name}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TENTANG SECTION */}
                <section id="tentang" className="bg-slate-50 py-24 px-6 overflow-hidden border-t border-slate-100 relative">
                    <div className="container mx-auto grid md:grid-cols-2 items-center gap-16">
                        
                        {/* Image Carousel dengan Fallback */}
                        <div className="w-full h-full rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-white group relative">
                            <Swiper
                                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                                spaceBetween={0}
                                effect="fade"
                                centeredSlides={true}
                                autoplay={{ delay: 3500, disableOnInteraction: false }}
                                pagination={{ clickable: true }}
                                loop={true}
                                className="w-full h-80 md:h-[450px]"
                            >
                                {slides.map((src, index) => (
                                    <SwiperSlide key={index}>
                                        <img
                                            src={getStorageUrl(src)}
                                            alt={`Aktivitas ${index + 1}`}
                                            onError={handleImageError}
                                            className="w-full h-full object-cover transition-transform [transition-duration:10s] ease-linear hover:scale-110"
                                            loading={index === 0 ? "eager" : "lazy"} 
                                            fetchpriority={index === 0 ? "high" : "low"}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Area Teks Tentang */}
                        <div className="space-y-8">
                            <div>
                                <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold px-4 py-1.5 mb-5 shadow-sm uppercase tracking-widest text-[10px]">
                                    Tentang Kami
                                </Badge>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                                    Membangun Ekosistem <br/> Pendidikan Digital
                                </h2>
                            </div>
                            
                            <p className="text-slate-700 leading-relaxed font-medium text-lg">
                                TAPAMAJUMA dirancang khusus untuk menjembatani komunikasi data antara pihak sekolah dan orang tua. Kami memastikan setiap perkembangan akademik dan karakter siswa terekam dengan baik dan transparan.
                            </p>
                            
                            <ul className="space-y-4 pt-4">
                                {/* List Item 1 */}
                                <li className="flex items-start bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                    <div className="bg-sky-50 p-3 rounded-2xl mr-5 flex-shrink-0 group-hover:bg-sky-100 transition-colors">
                                        <CheckCircle2 className="w-6 h-6 text-sky-700" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-base">Pelaporan Real-time</h4>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Data aktivitas dan nilai langsung dapat diakses kapan saja oleh pihak berkepentingan.</p>
                                    </div>
                                </li>
                                {/* List Item 2 */}
                                <li className="flex items-start bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                    <div className="bg-indigo-50 p-3 rounded-2xl mr-5 flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-700" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-base">Notifikasi WhatsApp</h4>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Orang tua menerima pembaruan mingguan otomatis terkait rekam jejak anak.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </WelcomeLayout>
                <WelcomeLayout title="Beranda" auth={auth}>
            <div className="flex flex-col w-full min-h-screen font-sans">
                
                {/* HERO SECTION */}
                <section
                    id="beranda"
                    className="relative flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden bg-gradient-to-b from-sky-50/80 to-white"
                >
                    {/* Background Swiper (Opasitas sangat rendah sebagai tekstur latar) */}
                    <div className="absolute inset-0 -z-10 opacity-[0.15]">
                        <Swiper
                            modules={[Autoplay, EffectFade]}
                            effect="fade"
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            loop={true}
                            className="w-full h-full"
                            
                        >
                            {slides.map((src, index) => (
                                <SwiperSlide key={index}>
                                    <img
                                        src={getStorageUrl(src)}
                                        alt="Rangkuman aktivitas belajar siswa di TAPAMAJUMA"
                                        onError={handleImageError}
                                        className="w-full h-full object-cover"
                                        width='800'
                                        height='700'
                                        loading={index === 0 ? "eager" : "lazy"} 
                                        fetchPriority={index === 0 ? "high" : "low"}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10 mt-8">
                        
                        {/* Area Teks Hero dengan Animasi Staggered */}
                        <div className="text-center md:text-left space-y-6">
                            <div className={`transition-all duration-700 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-none font-bold px-4 py-1.5 shadow-sm uppercase tracking-widest text-[10px]">
                                    Platform Monitoring Belajar
                                </Badge>
                            </div>
                            
                            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 drop-shadow-sm leading-[1.15] tracking-tight transition-all duration-700 delay-200 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                Bersama Membangun <br/>
                                {/* Efek Gradien Teks */}
                                <span className="bg-gradient-to-r from-sky-700 to-indigo-700 bg-clip-text text-transparent">
                                    Generasi Maju
                                </span>
                            </h1>
                            
                            <p className={`text-lg text-slate-700 leading-relaxed max-w-lg mx-auto md:mx-0 font-medium transition-all duration-700 delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                TAPAMAJUMA hadir untuk memantau aktivitas belajar, literasi, numerasi, dan perkembangan siswa secara terintegrasi antara guru, siswa, dan orang tua.
                            </p>
                            
                            <div className={`flex justify-center md:justify-start space-x-4 pt-4 transition-all duration-700 delay-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                                <Link 
                                    to="/login" 
                                    className="group inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 bg-sky-700 text-white shadow-xl shadow-sky-200 hover:bg-sky-700 hover:-translate-y-1 h-14 px-10"
                                >
                                    Mulai Sekarang
                                    <Sparkles size={16} className="ml-2 group-hover:rotate-12 transition-transform" />
                                </Link>
                            {/* TOMBOL INSTALL PWA (Hanya muncul jika di browser yang support & belum diinstal) */}
                            {isInstallable && (
                                <button 
                                    onClick={handleInstallClick}
                                    className="group inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 bg-white border-2 border-sky-100 text-sky-700 shadow-lg hover:border-sky-300 hover:bg-sky-50 hover:-translate-y-1 h-14 px-8"
                                >
                                    <Download size={18} className="mr-2 group-hover:translate-y-1 transition-transform" />
                                    Install Aplikasi
                                </button>
                            )}
                            </div>
                        </div>

                        {/* Area Gambar Hero */}
                        <div className={`flex justify-center md:justify-end relative transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                            {/* Efek Glow di Belakang Gambar */}
                            <div className="absolute inset-0 bg-sky-400 blur-[100px] opacity-20 rounded-full animate-pulse"></div>
                            <img
                                src={getStorageUrl("images/iconappp.png")}
                                alt="Logo TAPAMAJUMA Aplikasi Monitoring Siswa Untuk SMPN 1 Siborongborong"
                                onError={handleImageError}
                                width="500"
                                height="500"
                                className="w-full max-w-sm rounded-[3rem] shadow-2xl border-8 border-white bg-white/50 backdrop-blur-sm transition-transform duration-700 hover:scale-105 relative z-10"
                            />
                        </div>
                    </div>
                </section>

                {/* FITUR SECTION */}
                <section id="fitur" className="bg-white py-24 px-6 relative">
                    <div className="container mx-auto text-center relative z-10">
                        <div className={`transition-all duration-700 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Fokus Pengembangan Siswa</h2>
                            <p className="text-slate-500 font-medium mb-16 max-w-2xl mx-auto">
                                Kami merancang sistem yang berfokus pada pilar pendidikan modern untuk memastikan setiap siswa mendapatkan evaluasi yang komprehensif.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                            {features.map((item, index) => (
                                <Card 
                                    key={item.id} 
                                    // Animasi Staggered: Muncul bergantian berdasarkan index
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                    className={`text-center overflow-hidden transform hover:-translate-y-2 hover:shadow-xl hover:shadow-sky-100 hover:border-sky-300 transition-all duration-500 rounded-3xl border-slate-100 group cursor-pointer ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                >
                                    <CardHeader className="bg-slate-50/50 group-hover:bg-gradient-to-b group-hover:from-sky-50/50 group-hover:to-white flex flex-col items-center justify-center h-44 transition-colors">
                                        <div className="p-4 bg-white rounded-[1.5rem] shadow-sm mb-2">
                                            {item.icon}
                                        </div>
                                        <CardTitle className="text-slate-700 text-sm font-bold mt-2 group-hover:text-sky-700 transition-colors">
                                            {item.name}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TENTANG SECTION */}
                <section id="tentang" className="bg-slate-50 py-24 px-6 overflow-hidden border-t border-slate-100 relative">
                    <div className="container mx-auto grid md:grid-cols-2 items-center gap-16">
                        
                        {/* Image Carousel dengan Fallback */}
                        <div className="w-full h-full rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-white group relative">
                            <Swiper
                                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                                spaceBetween={0}
                                effect="fade"
                                centeredSlides={true}
                                autoplay={{ delay: 3500, disableOnInteraction: false }}
                                pagination={{ clickable: true }}
                                loop={true}
                                className="w-full h-80 md:h-[450px]"
                            >
                                {slides.map((src, index) => (
                                    <SwiperSlide key={index}>
                                        <img
                                            src={getStorageUrl(src)}
                                            alt={`Aktivitas ${index + 1}`}
                                            onError={handleImageError}
                                            className="w-full h-full object-cover transition-transform [transition-duration:10s] ease-linear hover:scale-110"
                                            loading={index === 0 ? "eager" : "lazy"} 
                                            fetchpriority={index === 0 ? "high" : "low"}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* Area Teks Tentang */}
                        <div className="space-y-8">
                            <div>
                                <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold px-4 py-1.5 mb-5 shadow-sm uppercase tracking-widest text-[10px]">
                                    Tentang Kami
                                </Badge>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">
                                    Membangun Ekosistem <br/> Pendidikan Digital
                                </h2>
                            </div>
                            
                            <p className="text-slate-700 leading-relaxed font-medium text-lg">
                                TAPAMAJUMA dirancang khusus untuk menjembatani komunikasi data antara pihak sekolah dan orang tua. Kami memastikan setiap perkembangan akademik dan karakter siswa terekam dengan baik dan transparan.
                            </p>
                            
                            <ul className="space-y-4 pt-4">
                                {/* List Item 1 */}
                                <li className="flex items-start bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                    <div className="bg-sky-50 p-3 rounded-2xl mr-5 flex-shrink-0 group-hover:bg-sky-100 transition-colors">
                                        <CheckCircle2 className="w-6 h-6 text-sky-700" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-base">Pelaporan Real-time</h4>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Data aktivitas dan nilai langsung dapat diakses kapan saja oleh pihak berkepentingan.</p>
                                    </div>
                                </li>
                                {/* List Item 2 */}
                                <li className="flex items-start bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                    <div className="bg-indigo-50 p-3 rounded-2xl mr-5 flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                                        <CheckCircle2 className="w-6 h-6 text-indigo-700" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-base">Notifikasi WhatsApp</h4>
                                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Orang tua menerima pembaruan mingguan otomatis terkait rekam jejak anak.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </WelcomeLayout>
        </>

    );
}