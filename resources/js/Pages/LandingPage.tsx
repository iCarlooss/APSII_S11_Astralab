import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';

export default function LandingPage({ auth }: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // MÁGICA DO SCROLL REVEAL E CARREGAMENTO
    useEffect(() => {
        setIsLoaded(true);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show-reveal');
                }
            });
        }, { threshold: 0.15 });

        const hiddenElements = document.querySelectorAll('.scroll-reveal');
        hiddenElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const urlDestino = auth?.user ? '/dashboard' : '/login';

    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans selection:bg-[#15803d] selection:text-white relative text-slate-800 overflow-x-hidden">
            <Head title="AstraLab - Centro de Diagnóstico" />

            {/* CSS ALTAMENTE OTIMIZADO PARA PERFORMANCE (FIM DOS TRAVAMENTOS) */}
            <style>{`
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translate3d(0, 30px, 0); } 
                    to { opacity: 1; transform: translate3d(0, 0, 0); } 
                }
                
                @keyframes subtleFloat {
                    0%, 100% { transform: translate3d(0, 0px, 0); }
                    50% { transform: translate3d(0, -10px, 0); }
                }

                @keyframes ambientLight {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    50% { transform: translate3d(15px, -15px, 0); }
                }

                .animate-fade-in { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; will-change: opacity, transform; backface-visibility: hidden; }
                .animate-subtle-float { animation: subtleFloat 6s ease-in-out infinite; will-change: transform; backface-visibility: hidden; }
                .animate-ambient { animation: ambientLight 15s ease-in-out infinite; will-change: transform; backface-visibility: hidden; }
                
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                
                .scroll-reveal {
                    opacity: 0;
                    transform: translate3d(0, 40px, 0);
                    transition: opacity 0.8s cubic-bezier(0.5, 0, 0, 1), transform 0.8s cubic-bezier(0.5, 0, 0, 1);
                    will-change: opacity, transform;
                    backface-visibility: hidden;
                }
                .show-reveal {
                    opacity: 1;
                    transform: translate3d(0, 0, 0);
                }
                
                .glass-premium {
                    background: rgba(255, 255, 255, 0.80);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.9);
                    box-shadow: 0 10px 30px -10px rgba(31, 84, 126, 0.1); 
                    transform: translateZ(0); 
                }
                
                .glass-dark {
                    background: rgba(15, 28, 63, 0.98); 
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    transform: translateZ(0);
                }
            `}</style>

            {/* FUNDO FIXO ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-[#1f547e]/20 rounded-full blur-3xl animate-ambient"></div>
                <div className="absolute top-[40%] right-[-10%] w-[35rem] h-[35rem] bg-[#15803d]/15 rounded-full blur-3xl animate-ambient delay-200"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-[#1f547e]/15 rounded-full blur-3xl animate-ambient delay-300"></div>
            </div>

            {/* HEADER DA LANDING PAGE */}
            <nav className="fixed w-full z-50 glass-premium transition-all duration-300 py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        
                        {/* LOGO E NOME ASTRALAB OFICIAL (Maior e com Cores Institucionais) */}
                        <div className="flex items-center gap-3 z-50">
                            <img 
                                src="/favicon.png" 
                                alt="Logo AstraLab" 
                                className="h-14 w-auto object-contain drop-shadow-sm"
                            />
                            <span className="font-black text-3xl tracking-tight cursor-default">
                                <span className="text-[#0f1c3f]">Astra</span><span className="text-[#15803d]">Lab</span>
                            </span>
                        </div>
                        
                        {/* Links Desktop */}
                        <div className="hidden xl:flex space-x-6 z-50">
                            <a href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')} className="text-slate-600 hover:text-[#15803d] font-bold transition-colors cursor-pointer">Início</a>
                            <a href="#exames" onClick={(e) => scrollToSection(e, 'exames')} className="text-slate-600 hover:text-[#15803d] font-bold transition-colors cursor-pointer">Especialidades</a>
                            <a href="#qualidade" onClick={(e) => scrollToSection(e, 'qualidade')} className="text-slate-600 hover:text-[#15803d] font-bold transition-colors cursor-pointer">Qualidade</a>
                            <Link href="/sobre-nos" className="text-slate-600 hover:text-[#15803d] font-bold transition-colors">Sobre Nós</Link>
                            <Link href="/contato" className="text-slate-600 hover:text-[#15803d] font-bold transition-colors">Contato</Link>
                        </div>
                        
                        {/* Botão Desktop */}
                        <div className="hidden xl:block z-50">
                            <Link href={urlDestino} className="bg-[#1f547e] hover:bg-[#163e5e] text-white font-black px-8 py-3.5 rounded-full shadow-lg shadow-[#1f547e]/20 transition-all transform hover:-translate-y-0.5 inline-block text-[11px] uppercase tracking-widest border border-[#1f547e]">
                                Entrar no sistema
                            </Link>
                        </div>

                        {/* Botão Mobile */}
                        <div className="xl:hidden flex items-center z-50">
                            <button aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#1f547e] p-2 cursor-pointer">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menu Mobile */}
                <div className={`xl:hidden absolute top-0 left-0 w-full h-screen glass-premium flex flex-col items-center justify-center gap-8 transition-all duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto visible' : '-translate-y-full opacity-0 pointer-events-none invisible'}`}>
                    <a href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')} className="text-2xl font-black text-[#1f547e]">Início</a>
                    <a href="#exames" onClick={(e) => scrollToSection(e, 'exames')} className="text-2xl font-black text-[#1f547e]">Especialidades</a>
                    <a href="#qualidade" onClick={(e) => scrollToSection(e, 'qualidade')} className="text-2xl font-black text-[#1f547e]">Qualidade</a>
                    <Link href="/sobre-nos" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-[#1f547e]">Sobre Nós</Link>
                    <Link href="/contato" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-[#1f547e]">Contato</Link>
                    <Link href={urlDestino} className="mt-4 bg-[#1f547e] text-white font-black px-10 py-4 rounded-full shadow-lg text-sm uppercase tracking-widest w-3/4 text-center">
                        Entrar no sistema
                    </Link>
                </div>
            </nav>

            {/* SESSÃO 1: HOMEPAGE HERO (#inicio) */}
            <main id="inicio" className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 min-h-screen flex items-center z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        
                        <div className={`text-center lg:text-left mb-16 lg:mb-0 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
                            <span className="inline-block py-1.5 px-4 rounded-full bg-white text-[#1f547e] text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm border border-slate-200">
                                🔬 Referência em Análises Clínicas
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight mb-6 leading-tight">
                                Tecnologia a favor da sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f547e] to-[#15803d]">Saúde</span>
                            </h1>
                            <p className="text-lg text-slate-500 mb-10 font-bold max-w-xl mx-auto lg:mx-0">
                                Laboratório focado em precisão, agilidade e segurança. Acesse seus laudos e acompanhe seu histórico com facilidade e tecnologia de ponta.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link href={urlDestino} className="px-8 py-4 bg-[#15803d] text-white font-black rounded-full shadow-xl shadow-[#15803d]/20 hover:bg-[#116a32] transition transform hover:-translate-y-1 text-center uppercase tracking-widest text-[11px] border border-[#15803d]">
                                    Consultar resultados
                                </Link>
                                <Link href="/contato" className="px-8 py-4 bg-white/80 text-[#1f547e] font-black rounded-full hover:bg-white hover:border-[#1f547e] transition transform hover:-translate-y-1 text-center uppercase tracking-widest text-[11px] border border-slate-300">
                                    Falar com a equipe
                                </Link>
                            </div>
                        </div>

                        {/* Card Glassmorphism */}
                        <div className={`relative mx-auto w-full max-w-md ${isLoaded ? 'animate-fade-in delay-200' : 'opacity-0'}`}>
                            <div className="glass-premium rounded-[2.5rem] p-8 transition-transform duration-500 hover:-translate-y-2">
                                
                                <div className="absolute -left-4 -top-6 sm:-left-8 glass-premium p-4 rounded-2xl flex items-center gap-3 animate-subtle-float border border-slate-200">
                                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-xl font-bold text-[#15803d]">✓</div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">Laudo Liberado</p>
                                        <p className="text-[10px] text-[#1f547e] font-bold">Pronto para visualizar</p>
                                    </div>
                                </div>

                                <div className="mt-6 mb-6 pb-4 border-b border-slate-200">
                                    <h3 className="font-black text-slate-800 text-xl">Exames Recentes</h3>
                                </div>

                                <div className="space-y-4 relative z-20">
                                    <div className="flex justify-between items-center bg-white/90 p-4 rounded-xl border border-slate-100 hover:bg-white transition shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#1f547e]">🩸</div>
                                            <span className="text-sm font-black text-slate-700">Hemograma Completo</span>
                                        </div>
                                        <span className="text-[9px] bg-green-100 text-[#15803d] px-3 py-1 rounded-md font-black uppercase tracking-widest">Normal</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center bg-white/90 p-4 rounded-xl border border-slate-100 hover:bg-white transition shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-[#15803d]">🧪</div>
                                            <span className="text-sm font-black text-slate-700">Glicemia em Jejum</span>
                                        </div>
                                        <span className="text-[9px] bg-green-100 text-[#15803d] px-3 py-1 rounded-md font-black uppercase tracking-widest">Normal</span>
                                    </div>

                                    <div className="flex justify-between items-center bg-white/90 p-4 rounded-xl border border-slate-100 hover:bg-white transition shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">🔬</div>
                                            <span className="text-sm font-black text-slate-700">Perfil Lipídico</span>
                                        </div>
                                        <span className="text-[9px] bg-amber-100 text-amber-700 px-3 py-1 rounded-md font-black uppercase tracking-widest">Em Análise</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* SESSÃO 2: Serviços (#exames) */}
            <section id="exames" className="py-24 relative z-10 bg-white/50 border-y border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-black text-[#1f547e] mb-4 scroll-reveal">Nossas Especialidades</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto mb-16 font-bold scroll-reveal delay-100">Diagnósticos precisos realizados com equipamentos de alta tecnologia para todas as suas necessidades clínicas.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: '🩸', title: 'Hematologia', desc: 'Análises detalhadas com foco em precisão celular e diagnósticos rápidos do sangue.' },
                            { icon: '🧪', title: 'Bioquímica', desc: 'Mapeamento completo da saúde metabólica, renal, hepática e função de órgãos vitais.' },
                            { icon: '🧫', title: 'Microbiologia', desc: 'Identificação assertiva de microrganismos para o melhor direcionamento clínico.' },
                            { icon: '🔬', title: 'Uroanálise', desc: 'Avaliação físico-química e microscópica rigorosa para detecção de patologias renais e urinárias.' },
                            { icon: '🦠', title: 'Parasitologia', desc: 'Pesquisa clínica avançada de parasitas, protozoários e helmintos em amostras biológicas.' },
                            { icon: '🧬', title: 'Imunologia e Hormônios', desc: 'Dosagens hormonais e testes imunológicos para marcadores virais, autoimunes e gestação.' }
                        ].map((item, index) => (
                            <div key={index} className="bg-white p-8 rounded-[2rem] hover:shadow-xl hover:shadow-[#1f547e]/10 transition-all duration-300 transform hover:-translate-y-2 text-left border border-slate-100 scroll-reveal" style={{ transitionDelay: `${index * 50}ms` }}>
                                <div className="text-4xl mb-6 bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl shadow-inner border border-slate-100">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-black text-[#1f547e] mb-3">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-bold">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SESSÃO 3: Qualidade (#qualidade) */}
            <section id="qualidade" className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-premium rounded-[3rem] p-10 md:p-16 text-center md:text-left md:flex items-center gap-12 scroll-reveal">
                        <div className="md:w-1/2 mb-10 md:mb-0">
                            <h2 className="text-3xl font-black text-[#1f547e] mb-6">Padrão de Excelência em Cada Amostra</h2>
                            <p className="text-slate-500 mb-6 font-bold leading-relaxed">
                                Nosso laboratório opera sob rigorosos protocolos de controle de qualidade, garantindo que cada resultado liberado seja absolutamente seguro para a tomada de decisão médica.
                            </p>
                            <ul className="space-y-4 text-slate-700 font-black text-sm uppercase tracking-widest">
                                <li className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md bg-[#15803d] text-white flex items-center justify-center text-xs shadow-sm">✓</span> Dupla checagem de resultados
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md bg-[#15803d] text-white flex items-center justify-center text-xs shadow-sm">✓</span> Adequação total à LGPD
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md bg-[#15803d] text-white flex items-center justify-center text-xs shadow-sm">✓</span> Profissionais altamente capacitados
                                </li>
                            </ul>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <div className="w-full max-w-sm h-64 bg-white rounded-3xl border border-slate-100 shadow-xl flex items-center justify-center p-8 transform transition hover:scale-105 duration-500">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🏆</div>
                                    <h3 className="font-black text-[#1f547e] text-xl">Certificação de Qualidade</h3>
                                    <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">Acreditada pelos principais órgãos de fiscalização.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* RODAPÉ INTEGRADO */}
            <footer className="glass-dark text-slate-300 py-12 relative z-20 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 scroll-reveal">
                    <div>
                        {/* LOGO NO RODAPÉ ESCURO */}
                        <div className="flex items-center gap-3 mb-6">
                            <img 
                                src="/favicon.png" 
                                alt="Logo AstraLab" 
                                className="h-10 w-auto object-contain brightness-0 invert opacity-90"
                            />
                            <span className="font-black text-2xl text-white tracking-tight">
                                Astra<span className="text-[#15803d]">Lab</span>
                            </span>
                        </div>
                        <p className="text-xs max-w-sm leading-relaxed font-bold uppercase tracking-widest text-slate-400">
                            Estrutura de ponta para análises clínicas. Segurança, rapidez e tecnologia a favor da sua saúde.
                        </p>
                    </div>
                    <div className="md:text-right">
                        <h4 className="text-white font-black mb-4 uppercase text-xs tracking-[0.2em]">Atendimento ao Paciente</h4>
                        <p className="text-xs mb-2 font-bold text-slate-400 tracking-wider">Segunda a Sexta: 07h às 18h</p>
                        <a href="mailto:c.alves@cs.modulo.edu.br" className="text-xs font-bold text-slate-300 tracking-wider hover:underline">c.alves@cs.modulo.edu.br</a>
                    </div>
                </div>
                <div className="border-t border-slate-700 mt-10 pt-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <p>&copy; 2026 Laboratório AstraLab. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
