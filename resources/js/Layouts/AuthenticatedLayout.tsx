import { useState, PropsWithChildren, ReactNode } from 'react';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';
import { User } from '@/types';

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // LÓGICA DE ROTEAMENTO CONDICIONAL
    const rotaHome = user.tipo_usuario === 'Administrador' 
        ? route('admin.dashboard') 
        : user.tipo_usuario === 'Professor'
            ? route('professor.dashboard')
            : user.tipo_usuario === 'Tecnico' || user.tipo_usuario === 'Aluno' || user.tipo_usuario === 'Estagiário' || user.tipo_usuario === 'Estagiario'
                ? route('tecnico.dashboard') 
                : route('paciente.dashboard');

    const isStaff = user.tipo_usuario !== 'Paciente';
    const isGestor = user.tipo_usuario === 'Administrador' || user.tipo_usuario === 'Professor';
    
    // Verifica rigorosamente se está na rota do paciente
    const isViewingPatientArea = route().current('paciente.*');

    return (
        // Fundo e Seleção atualizados para a paleta Astra
        <div className="min-h-screen bg-[#F0F4F8] selection:bg-[#15803d] selection:text-white">
            
            {/* ==========================================
                BARRA DE NAVEGAÇÃO SUPERIOR (Navbar)
                ========================================== */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        
                        {/* Lado Esquerdo: Logo e Ações */}
                        <div className="flex items-center gap-8">
                            <div className="shrink-0 flex items-center">
                                {/* LOGO ATUALIZADA: Ícone maior (h-14) e Texto com cores/proporções oficiais */}
                                <Link href={rotaHome} className="font-black text-3xl tracking-tighter hover:scale-105 hover:-rotate-1 transition-all duration-300 group flex items-center gap-3">
                                    <img src="/favicon.png" alt="Icone AstraLab" className="h-14 w-auto drop-shadow-sm" />
                                    <span>
                                        <span className="text-[#0f1c3f]">Astra</span><span className="text-[#15803d]">Lab</span>
                                    </span>
                                </Link>
                            </div>

                            {/* BOTOES DE "MÚLTIPLOS CHAPÉUS" E RELATÓRIOS */}
                            {isStaff && (
                                <div className="hidden md:flex items-center gap-4 border-l-2 border-slate-100 pl-8">
                                    
                                    {/* Botão de Relatórios (Apenas para Admin e Professor e se NÃO estiver na área do paciente) */}
                                    {isGestor && !isViewingPatientArea && (
                                        <Link 
                                            href={route('admin.relatorios.index')} 
                                            className="flex items-center gap-2 px-5 py-2.5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1f547e] hover:text-white transition-all duration-300 border border-transparent hover:border-[#1f547e] hover:shadow-lg hover:-translate-y-0.5"
                                        >
                                            <span className="text-sm">📊</span> <span>Relatórios e Métricas</span>
                                        </Link>
                                    )}

                                    {/* Botão Trocar de Área */}
                                    {!isViewingPatientArea ? (
                                        <Link href={route('paciente.dashboard')} className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-[#15803d] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#15803d] hover:text-white transition-all duration-300 border border-green-200 hover:shadow-lg hover:shadow-green-700/20 hover:-translate-y-0.5">
                                            <span className="text-sm">🏥</span> <span>Área do Paciente</span>
                                        </Link>
                                    ) : (
                                        <Link href={rotaHome} className="flex items-center gap-2 px-5 py-2.5 bg-[#1f547e] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#163e5e] transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#1f547e]/20 hover:-translate-y-0.5">
                                            <span className="text-sm">⚙️</span> <span>Painel {user.tipo_usuario}</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Lado Direito: Menu do Usuário (Desktop) */}
                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl shadow-sm border border-slate-200 hover:border-[#1f547e] transition-colors bg-slate-50 hover:bg-white cursor-pointer group">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-[#1f547e] focus:outline-none transition ease-in-out duration-150 gap-3"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-[#1f547e]/10 text-[#1f547e] flex items-center justify-center text-sm shadow-inner group-hover:bg-[#1f547e] group-hover:text-white transition-colors">
                                                    {user.name.charAt(0)}
                                                </div>
                                                
                                                <div className="flex flex-col items-start leading-tight">
                                                    <span>{user.name.split(' ')[0]}</span>
                                                    <span className="text-[9px] text-[#15803d] font-bold">{user.tipo_usuario}</span>
                                                </div>

                                                <svg className="h-4 w-4 text-slate-400 group-hover:text-[#1f547e] transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href="/contato" className="font-bold text-xs uppercase tracking-widest text-slate-600 hover:text-[#1f547e]">
                                            Contato
                                        </Dropdown.Link>
                                        {user.tipo_usuario === 'Administrador' && (
                                            <Dropdown.Link href="/admin/contatos" className="font-bold text-xs uppercase tracking-widest text-slate-600 hover:text-[#1f547e]">
                                                Solicitações de contato
                                            </Dropdown.Link>
                                        )}
                                        <Dropdown.Link href="/sobre-nos" className="font-bold text-xs uppercase tracking-widest text-slate-600 hover:text-[#1f547e] hover:bg-[#1f547e]/5 transition-colors">
                                            Sobre Nós
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('profile.edit')} className="font-bold text-xs uppercase tracking-widest text-slate-600 hover:text-[#1f547e] hover:bg-[#1f547e]/5 transition-colors">
                                            Meu Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="font-bold text-xs uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 transition-colors">
                                            Sair do Sistema
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Hamburger Menu (Mobile) */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-3 rounded-xl text-[#1f547e] hover:bg-[#1f547e]/10 focus:outline-none focus:bg-[#1f547e]/10 transition duration-150 ease-in-out border border-transparent hover:border-slate-200"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dropdown Mobile */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden absolute w-full bg-white/95 backdrop-blur-md shadow-2xl border-b border-slate-200'}>
                    <div className="pt-6 pb-4 border-t border-slate-100">
                        <div className="px-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#1f547e]/10 text-[#1f547e] flex items-center justify-center text-xl font-black shadow-inner">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-black text-lg text-[#1f547e] leading-tight">{user.name}</div>
                                <div className="font-bold text-[10px] uppercase tracking-widest text-[#15803d]">{user.tipo_usuario}</div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-1">
                            <ResponsiveNavLink href="/contato" className="font-black text-xs uppercase tracking-widest text-slate-500 hover:text-[#1f547e]">
                                Contato
                            </ResponsiveNavLink>
                            {user.tipo_usuario === 'Administrador' && (
                                <ResponsiveNavLink href="/admin/contatos" className="font-black text-xs uppercase tracking-widest text-slate-500 hover:text-[#1f547e]">
                                    Solicitações de contato
                                </ResponsiveNavLink>
                            )}
                            <ResponsiveNavLink href="/sobre-nos" className="font-black text-xs uppercase tracking-widest text-slate-500 hover:text-[#1f547e] hover:bg-[#1f547e]/5">
                                Sobre Nós
                            </ResponsiveNavLink>
                            {isStaff && (
                                <>
                                    {isGestor && !isViewingPatientArea && (
                                        <ResponsiveNavLink href={route('admin.relatorios.index')} className="font-black text-xs uppercase tracking-widest text-[#1f547e] hover:bg-[#1f547e]/5">
                                            📊 Relatórios e Métricas
                                        </ResponsiveNavLink>
                                    )}
                                    <ResponsiveNavLink href={!isViewingPatientArea ? route('paciente.dashboard') : rotaHome} className="font-black text-xs uppercase tracking-widest text-[#15803d] bg-green-50 hover:bg-green-100">
                                        {!isViewingPatientArea ? '🏥 Ir para Área do Paciente' : '⚙️ Voltar ao Painel'}
                                    </ResponsiveNavLink>
                                </>
                            )}
                            <ResponsiveNavLink href={route('profile.edit')} className="font-black text-xs uppercase tracking-widest text-slate-500 hover:text-[#1f547e] hover:bg-[#1f547e]/5">
                                Meu Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                                Sair do Sistema
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ==========================================
                CABEÇALHO SECUNDÁRIO (Se houver)
                ========================================== */}
            {header && (
                <header className="bg-white shadow-sm border-b border-slate-200 relative z-40">
                    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* ==========================================
                CONTEÚDO PRINCIPAL (Main)
                ========================================== */}
            <main className="relative z-30">
                {children}
            </main>
            
        </div>
    );
}
