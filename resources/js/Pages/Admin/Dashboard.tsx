import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface RecentOS {
    id: number;
    protocolo: string;
    paciente: string;
    status: string;
    hora: string;
}

interface AdminProps extends PageProps {
    stats: {
        atendimentosHoje: number;
        laudosPendentes: number;
        pacientesTotal: number;
        examesRealizados: number;
    };
    recentes: RecentOS[];
}

export default function Dashboard({ auth, stats, recentes = [] }: AdminProps) {
    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex items-center gap-3">
                    <h2 className="font-black text-2xl leading-tight tracking-tight">
                        <span className="text-slate-800">Astra</span><span className="text-cyan-600">Lab</span> <span className="text-slate-300 mx-2 text-xl font-normal">|</span> <span className="text-slate-500">Painel de Controle</span>
                    </h2>
                </div>
            }
        >
            <Head title="AstraLab - Admin Dashboard" />

            <div className="py-8 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* ==========================================
                        BANNER PRINCIPAL (Estética Premium Dark)
                        ========================================== */}
                    <div className="relative bg-slate-900 rounded-[2.5rem] p-10 pb-24 shadow-2xl overflow-hidden border border-slate-800">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-6">
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-slate-800/50 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest mb-4 border border-slate-700/50 shadow-sm text-cyan-400">
                                    Administração Central
                                </span>
                                <h1 className="text-4xl font-black mb-2 tracking-tight text-white">Olá, {auth.user.name.split(' ')[0]}! 👋</h1>
                                <p className="text-slate-400 text-sm font-medium max-w-2xl leading-relaxed">
                                    Gestão centralizada do laboratório. Monitore a fila operacional, extraia relatórios institucionais e configure o sistema em tempo real.
                                </p>
                            </div>
                        </div>
                        
                        {/* Orbs de luz com cores tecnológicas sutis (Ciano e Índigo) */}
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute left-10 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                        {/* Padrão de grade sutil para dar ar de painel de controle */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>
                    </div>

                    {/* ==========================================
                        BOTÕES DE AÇÃO RÁPIDA
                        ========================================== */}
                    <div className="relative z-20 px-2 sm:px-4 -mt-12 mb-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <QuickAction href={route('tecnico.novo')} icon="📋" title="Recepção" desc="Nova OS" customHover="hover:border-cyan-500 group-hover:bg-cyan-50 group-hover:text-cyan-900" />
                            <QuickAction href={route('tecnico.fila')} icon="🧪" title="Bancada" desc="Operação" customHover="hover:border-amber-500 group-hover:bg-amber-50 group-hover:text-amber-900" />
                            <QuickAction href={route('admin.validacao')} icon="🛡️" title="Validação" desc="Aprovar Laudos" customHover="hover:border-indigo-500 group-hover:bg-indigo-50 group-hover:text-indigo-900" />
                            <QuickAction href={route('admin.relatorios.index')} icon="📊" title="Relatórios" desc="Métricas e PDF" customHover="hover:border-emerald-500 group-hover:bg-emerald-50 group-hover:text-emerald-900" />
                            
                            <QuickAction href={route('admin.usuarios')} icon="👥" title="Usuários" desc="Acessos" />
                            <QuickAction href={route('admin.exames')} icon="🔬" title="Catálogo" desc="Valores" />
                            <QuickAction href={route('admin.configuracoes')} icon="⚙️" title="Ajustes" desc="Parâmetros" />
                            
                            {/* O 8º BOTÃO - CEREJA DO BOLO */}
                            <QuickAction href={route('professor.protocolos')} icon="📑" title="Supervisão" desc="Rastreio e NPS" customHover="hover:border-purple-500 group-hover:bg-purple-50 group-hover:text-purple-900" />
                        </div>
                    </div>

                    {/* ==========================================
                        INDICADORES REAIS (KPIs CLICÁVEIS)
                        ========================================== */}
                    <div className="mb-10">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Visão Geral do Dia</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard href={route('admin.agendamentos')} icon="📈" label="Atendimentos Hoje" value={stats.atendimentosHoje} color="blue" subtitle="Ver Agendamentos" />
                            <StatCard href={route('tecnico.fila')} icon="⌛" label="Fila de Espera" value={stats.laudosPendentes} color="amber" subtitle="Exames Pendentes" />
                            <StatCard href={route('admin.usuarios')} icon="👥" label="Total Pacientes" value={stats.pacientesTotal} color="indigo" subtitle="Base de Dados" />
                            <StatCard href={route('admin.validacao')} icon="✅" label="Laudos Emitidos" value={stats.examesRealizados} color="green" subtitle="Auditoria Geral" />
                        </div>
                    </div>

                    {/* ==========================================
                        BASE DA TELA: LISTAGEM E STATUS (Duas Colunas)
                        ========================================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* COLUNA ESQUERDA (2/3): TABELA DE MOVIMENTAÇÕES */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                                <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-white z-20">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                            <span className="w-2 h-6 bg-cyan-600 rounded-full"></span>
                                            Últimas Movimentações (OS)
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acompanhamento do Fluxo Operacional</p>
                                    </div>
                                    <Link href={route('tecnico.fila')} className="text-[10px] font-black text-cyan-700 hover:text-cyan-800 uppercase tracking-widest bg-cyan-50 hover:bg-cyan-100 px-4 py-2 rounded-xl transition-colors">
                                        Ver Todas
                                    </Link>
                                </div>
                                
                                <div className="overflow-x-auto max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    <table className="w-full text-left border-collapse relative">
                                        <thead className="bg-slate-50/90 backdrop-blur-sm text-[10px] font-black uppercase text-slate-400 tracking-widest sticky top-0 z-10">
                                            <tr>
                                                <th className="px-8 py-5">Protocolo</th>
                                                <th className="px-8 py-5">Paciente</th>
                                                <th className="px-8 py-5">Status</th>
                                                <th className="px-8 py-5">Última Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {recentes.length > 0 ? recentes.map((os) => (
                                                <tr key={os.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-8 py-5 font-mono text-xs font-bold text-slate-700">{os.protocolo}</td>
                                                    <td className="px-8 py-5 text-xs font-bold text-slate-800 uppercase">{os.paciente}</td>
                                                    <td className="px-8 py-5">
                                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-tighter shadow-sm border ${
                                                            os.status === 'Concluido' || os.status === 'Liberado'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                            : os.status === 'Aguardando_Supervisor' || os.status === 'Aguardando Validação'
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                                        }`}>
                                                            {os.status === 'Aguardando_Supervisor' ? 'Aguard. Validação' : os.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{os.hora}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center">
                                                        <span className="text-4xl block mb-4 opacity-20 text-slate-400">📭</span>
                                                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Nenhuma atividade registrada.</span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* COLUNA DIREITA (1/3): STATUS DO SISTEMA (Estética Dark) */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white border border-slate-800 relative overflow-hidden">
                                {/* Detalhe de fundo */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>

                                <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-5 relative z-10">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xl shadow-inner border border-slate-700/50">💻</div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-100">Status do Servidor</h3>
                                        <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">Monitoramento em tempo real</p>
                                    </div>
                                </div>
                                <div className="space-y-5 relative z-10">
                                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                        <span className="text-xs font-bold text-slate-300">Banco de Dados</span>
                                        <span className="flex items-center gap-2 text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span> ONLINE
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                        <span className="text-xs font-bold text-slate-300">Gerador PDF (Laudos)</span>
                                        <span className="text-[10px] font-black bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 tracking-widest border border-slate-600">ESTÁVEL</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                        <span className="text-xs font-bold text-slate-300">Disparo de E-mails</span>
                                        <span className="text-[10px] font-black bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 tracking-widest border border-slate-600">ATIVO</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ==============================================
// COMPONENTES INTERNOS REDESENHADOS
// ==============================================

function StatCard({ href, icon, label, value, color, subtitle }: any) {
    const colors: any = {
        blue: 'text-cyan-700 bg-cyan-50 border-cyan-100 hover:border-cyan-400',
        amber: 'text-amber-700 bg-amber-50 border-amber-100 hover:border-amber-400',
        indigo: 'text-indigo-700 bg-indigo-50 border-indigo-100 hover:border-indigo-400',
        green: 'text-emerald-700 bg-emerald-50 border-emerald-100 hover:border-emerald-400',
    };

    const cardContent = (
        <div className={`p-5 rounded-[1.5rem] shadow-sm border-2 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white cursor-pointer group ${colors[color]}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-opacity-50 shadow-sm bg-white`}>
                {icon}
            </div>
            <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">{label}</span>
                <div className="flex flex-col">
                    <h4 className="text-xl font-black text-slate-800 leading-none">{value}</h4>
                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-80 group-hover:opacity-100 transition-opacity`}>{subtitle}</span>
                </div>
            </div>
        </div>
    );

    return href ? (
        <Link href={href} className="block">
            {cardContent}
        </Link>
    ) : cardContent;
}

function QuickAction({ href, icon, title, desc, disabled, customHover }: any) {
    return (
        <Link 
            href={disabled ? '#' : href} 
            className={`p-4 rounded-[1.5rem] border-2 flex items-center gap-4 group transition-all duration-300 ${
                disabled 
                ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100' 
                : `bg-white hover:shadow-md border-transparent shadow-sm ${customHover || 'hover:border-slate-300'}`
            }`}
        >
            <div className={`w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-all shadow-inner ${customHover ? '' : 'group-hover:bg-slate-800 group-hover:text-white'}`}>
                {icon}
            </div>
            <div className="text-left">
                <h4 className={`font-black text-slate-800 text-xs transition-colors ${customHover ? '' : 'group-hover:text-slate-900'}`}>{title}</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{desc}</p>
            </div>
        </Link>
    );
}