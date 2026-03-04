
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { IconBrandFacebook, IconLink, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { getStorageUrl } from '@/lib/utils';

export default function WelcomeLayout({ title, children, auth }) {
    const defaultTitle = 'TAPAMAJUMA - Monitoring Siswa SMP Negeri 1 Siborongborong';
    const pageTitle = title ? `${title} | TAPAMAJUMA` : defaultTitle;

    // Mengubah title browser secara dinamis
    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    return (
        <>
            <Toaster position="top-center" richColors />

            <div className="flex flex-col min-h-screen text-slate-800 scroll-smooth overflow-x-hidden font-sans">
                {/* HEADER */}
                <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md shadow-lg shadow-cyan-100/30">
                    <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <img
                                src={getStorageUrl("images/iconappp.webp")}
                                alt="Logo TAPAMAJUMA"
                                className="h-10 w-10 rounded-full object-contain border border-slate-100 shadow-sm"
                                loading="lazy"
                            />
                            <span className="text-xl font-black text-cyan-800 tracking-tight">TAPAMAJUMA</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            {
                                [
                                    { label: 'Beranda', href: '#beranda' },
                                    { label: 'Fitur', href: '#fitur' },
                                    { label: 'Tentang', href: '#tentang' }
                                ].map((item, index) => (
                                    <a 
                                        key={index}
                                        href={item.href} 
                                        className="relative group text-slate-600 hover:text-cyan-700 font-bold transition-colors duration-300 pt-1 pb-1 text-sm"
                                    >
                                        {item.label}
                                        <span className="absolute left-0 bottom-[-6px] h-[3px] rounded-full w-full bg-cyan-500 transition-transform duration-300 transform scale-x-0 origin-center group-hover:scale-x-100"></span>
                                    </a>
                                ))
                            }
                        </nav>
                        <div className="flex items-center gap-3">
                            {/* Cek auth dari props yang dikirim Welcome.jsx */}
                            {auth ? (
                                <Link
                                   to="/teacher" // Atau arahkan sesuai role user-nya nanti
                                    className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 shadow-md whitespace-nowrap bg-cyan-600 text-white hover:bg-cyan-700 hover:-translate-y-0.5"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 shadow-md whitespace-nowrap bg-cyan-600 text-white hover:bg-cyan-700 hover:-translate-y-0.5"
                                    >
                                        Masuk
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* KONTEN UTAMA */}
                <main className="flex-1">{children}</main>

                {/* FOOTER */}
                <footer className="bg-slate-50 text-slate-700 pt-16 pb-0 border-t border-slate-200 mt-12">
                    <div className="container mx-auto px-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-12">
                            
                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={getStorageUrl("images/iconappp.webp")}
                                        alt="Logo TAPAMAJUMA"
                                        className="h-8 w-8 rounded-full object-contain"
                                        loading="lazy"
                                    />
                                    <span className="text-2xl font-black text-cyan-800 tracking-tight">TAPAMAJUMA</span>
                                </div>
                                <p className="text-slate-500 text-sm max-w-sm leading-relaxed font-medium">
                                    Sistem Pemantauan Aktivitas dan Perkembangan Belajar 
                                </p>
                                <p className='text-slate-500 text-sm font-medium'>Dibuat untuk SMP Negeri 1 Siborongborong.</p>
                                <div className="flex items-start text-slate-500 text-sm mt-4 font-medium">
                                    <svg className="w-5 h-5 mr-3 mt-0.5 text-cyan-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.899a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <div>
                                        <p>Jl. Siliwangi No.2, Siborongborong</p>
                                        <p>Kabupaten Tapanuli Utara, Provinsi Sumatera Utara</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="hidden md:block md:col-span-1"> 
                            </div>

                            <div className="md:col-span-1">
                                <h3 className="text-sm font-black text-slate-800 mb-4 border-b pb-2 border-slate-200 tracking-wider">HUBUNGI KAMI</h3>
                                                                <a 
                                    href="mailto:smpn1siborongborong.taput@gmail.com" 
                                    aria-label="Kirim Email ke SMPN 1 Siborongborong" // <--- Tambahkan ini
                                    className="inline-block hover:text-emerald-600 font-bold transition text-sm mb-6 text-slate-600"
                                >
                                    smpn1siborongborong.taput@gmail.com
                                </a>

                                <h3 className="text-sm font-black text-slate-800 mb-4 border-b pb-2 border-slate-200 tracking-wider">SOSIAL MEDIA</h3>
                                
                                <div className="flex space-x-3">
                                    <a href="#" aria-label="Facebook Sekolah" className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 hover:border-cyan-500 hover:shadow-cyan-100 transition-all group">
                                        <IconBrandFacebook className="w-5 h-5 text-slate-500 group-hover:text-cyan-600 transition-colors" />
                                    </a>
                                    <a href="#" aria-label="Website Sekolah" className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 hover:border-cyan-500 hover:shadow-cyan-100 transition-all group">
                                        <IconLink className="w-5 h-5 text-slate-500 group-hover:text-cyan-600 transition-colors" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-200 mt-12 py-5">
                        <div className="container mx-auto px-6 text-center text-xs font-bold text-slate-500 tracking-wide">
                            &copy; {new Date().getFullYear()} TAPAMAJUMA - For SMP Negeri 1 Siborongborong. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}