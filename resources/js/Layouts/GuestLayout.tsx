import { Link } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';
import CookieBanner from '@/Components/CookieBanner';
import logoCruzeiro from '../assets/logo-cruzeiro.png';

export default function Guest({ children }: PropsWithChildren) {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        // Fundo e Seleção atualizados para a paleta Astra (Azul/Verde)
        <div className="min-h-screen flex flex-col items-center justify-center pt-6 sm:pt-0 bg-[#F0F4F8] font-sans relative overflow-hidden selection:bg-green-700 selection:text-white">
            
            {/* Animações otimizadas com translate3d para melhor performance */}
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 20px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
                @keyframes float { 0% { transform: translate3d(0, 0px, 0); } 50% { transform: translate3d(0, -15px, 0); } 100% { transform: translate3d(0, 0px, 0); } }
                .animate-fade-in { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; will-change: opacity, transform; }
                .animate-float { animation: float 8s ease-in-out infinite; will-change: transform; }
            `}</style>

            {/* Luzes de fundo (Blobs) com as novas cores do AstraLab */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            {/* Botão Voltar (Padronizado com o novo Design System) */}
            <div className={`w-full max-w-md px-6 absolute top-8 left-0 right-0 mx-auto z-10 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
                <Link 
                    href="/" 
                    className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px] text-slate-500 bg-white/70 backdrop-blur-md w-fit px-5 py-3 rounded-2xl shadow-sm border border-white hover:bg-white hover:text-blue-950 hover:border-blue-200 hover:-translate-y-0.5 transition-all"
                >
                    <span className="text-lg leading-none">←</span> Voltar ao Início
                </Link>
            </div>

            {/* LOGO INSTITUCIONAL PADRONIZADA */}
            <div className={`mt-24 sm:mt-12 z-10 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                <Link href="/" className="flex flex-col items-center gap-4 group">
                    <img 
                        src={logoCruzeiro} 
                        alt="Logo Astralab" 
                        className="h-20 w-auto object-contain drop-shadow-xl transform group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="text-center">
                        {/* Logo com a quebra de cor oficial: Astra (Azul) lab (Verde) */}
                        <span className="block font-black text-4xl tracking-tighter leading-none text-blue-950">
                            Astra<span className="text-green-700">lab</span>
                        </span>
                        <span className="text-blue-800 font-black text-[10px] uppercase tracking-[0.2em] mt-1 block opacity-80">
                            Portal de Acesso
                        </span>
                    </div>
                </Link>
            </div>

            {/* Caixa de Ação (Vidro Premium atualizado para azul marinho nas sombras) */}
            <div className={`w-full sm:max-w-md mt-8 px-8 py-10 bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(2,27,79,0.08)] overflow-hidden sm:rounded-[2.5rem] border border-white z-10 hover:shadow-[0_8px_32px_rgba(2,27,79,0.12)] transition-shadow duration-500 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                {children}
            </div>
            
            <p className={`mt-8 mb-8 text-xs text-slate-400 font-bold uppercase tracking-widest z-10 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                &copy; 2026 Laboratório Astralab
            </p>

            {/* AVISO DE LGPD */}
            <CookieBanner />
        </div>
    );
}