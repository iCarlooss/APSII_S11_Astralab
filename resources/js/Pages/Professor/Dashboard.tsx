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

interface ProfessorProps extends PageProps {
    stats: {
        atendimentosHoje: number;
        laudosPendentes: number;
        aguardandoValidacao: number;
        laudosLiberados: number;
    };
    recentes: RecentOS[];
}

export default function Dashboard({ 
    auth, 
    stats = { atendimentosHoje: 0, laudosPendentes: 0, aguardandoValidacao: 0, laudosLiberados: 0 }, 
    recentes = [] 
}: ProfessorProps) {
    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-black text-2xl text-blue-950 leading-tight tracking-tight">Bancada do Professor</h2>}
        >
            <Head title="AstraLab - Painel do Professor" />

            {/* Fundo padronizado AstraLab */}
            <div className="py-8 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* BANNER PRINCIPAL (Autoridade Acadêmica: Blue-900 com toques de Green-600) */}
                    <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 rounded-[2.5rem] p-10 pb-24 shadow-lg overflow-hidden border border-blue-800">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-6">
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 border border-white/10 shadow-sm">
                                    Painel de Supervisão Clínica
                                </span>
                                <h1 className="text-4xl font-black mb-2 tracking-tight">Olá, Prof. {auth.user.name.split(' ')[0]}! 🔬</h1>
                                <p className="text-blue-100 text-sm font-medium opacity-95 max-w-2xl leading-relaxed">
                                    Acompanhe a produção do estágio e valide os laudos pendentes antes da liberação oficial para os pacientes.
                                </p>
                            </div>

                            {/* ALERTA DE VALIDAÇÃO (Chama atenção se houver laudos) */}
                            {stats.aguardandoValidacao > 0 && (
                                <Link 
                                    href={route('admin.validacao')} 
                                    className="bg-white text-blue-950 hover:bg-blue-50 transition-transform font-black px-6 py-4 rounded-2xl shadow-xl shadow-green-900/20 border-l-4 border-green-600 flex items-center gap-4 animate-bounce shrink-0 group"
                                >
                                    <span className="text-3xl group-hover:scale-110 transition-transform">⚠️</span>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500">Ação Necessária</span>
                                        <span className="text-lg leading-none text-blue-950">{stats.aguardandoValidacao} Laudos para Revisar</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                        
                        {/* Efeitos de Fundo do Banner */}
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-green-500/20 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
                        <div className="absolute left-10 -bottom-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
                    </div>

                    {/* BOTÕES DE AÇÃO PRINCIPAIS (Invadindo o Banner em 4 Colunas) */}
                    <div className="relative z-20 px-2 sm:px-4 -mt-12 mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <QuickAction href={route('tecnico.novo')} icon="📋" title="Recepção" desc="Cadastrar Nova OS" color="blue" />
                            <QuickAction href={route('tecnico.fila')} icon="🧪" title="Bancada" desc="Digitação de Exames" color="cyan" />
                            <QuickAction href={route('admin.validacao')} icon="🛡️" title="Validação" desc="Revisar Alunos" color="indigo" customClass={stats.aguardandoValidacao > 0 ? "ring-2 ring-indigo-400 shadow-indigo-500/30" : ""} />
                            <QuickAction href={route('professor.protocolos')} icon="🗂️" title="Supervisão" desc="Rastreio Geral" color="green" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* COLUNA ESQUERDA: LISTAGEM DA FILA GERAL */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                                <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                                    <div>
                                        <h3 className="text-lg font-black text-blue-950 flex items-center gap-2">
                                            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                                            Acompanhamento da Fila Geral
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Últimas movimentações da unidade</p>
                                    </div>
                                    <Link href={route('tecnico.fila')} className="text-[10px] font-black text-white hover:text-white uppercase tracking-widest bg-blue-900 hover:bg-blue-950 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                        Fila Completa
                                    </Link>
                                </div>
                                
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            <tr>
                                                <th className="px-8 py-5">Protocolo</th>
                                                <th className="px-8 py-5">Paciente</th>
                                                <th className="px-8 py-5">Status</th>
                                                <th className="px-8 py-5">Última Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {recentes.length > 0 ? recentes.map((os) => (
                                                <tr key={os.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-8 py-5 font-mono text-xs font-bold text-blue-700 group-hover:text-blue-900">{os.protocolo}</td>
                                                    <td className="px-8 py-5 text-xs font-bold text-slate-700 uppercase">{os.paciente}</td>
                                                    <td className="px-8 py-5">
                                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm border ${
                                                            os.status === 'Aguardando Validação' 
                                                            ? 'bg-purple-100 text-purple-800 border-purple-200' 
                                                            : os.status === 'Concluido' || os.status === 'Liberado'
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                                        }`}>
                                                            {os.status === 'Aguardando Validação' ? 'ALUNO DIGITOU' : os.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{os.hora}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center">
                                                        <span className="text-4xl block mb-4 opacity-20 text-blue-900">📭</span>
                                                        <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Nenhuma OS movimentada recentemente.</span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* COLUNA DIREITA: MÉTRICAS DA BANCADA */}
                        <div className="lg:col-span-1 space-y-6">
                            
                            {/* CAIXAS DE ENTRADA (Inboxes) */}
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Métricas da Unidade</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100 group hover:border-blue-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">📋</div>
                                            <span className="font-bold text-xs text-blue-800 uppercase tracking-widest">Recepção Hoje</span>
                                        </div>
                                        <span className="font-black text-xl text-blue-600">{stats.atendimentosHoje}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100 group hover:border-amber-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-50">🧪</div>
                                            <span className="font-bold text-xs text-amber-800 uppercase tracking-widest">Fila de Exames</span>
                                        </div>
                                        <span className="font-black text-xl text-amber-600">{stats.laudosPendentes}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100 relative overflow-hidden group hover:border-indigo-300 transition-colors">
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">🛡️</div>
                                            <span className="font-bold text-xs text-indigo-800 uppercase tracking-widest">Para Revisão</span>
                                        </div>
                                        <span className="font-black text-xl text-indigo-600 relative z-10">{stats.aguardandoValidacao}</span>
                                        <div className="absolute -right-4 -bottom-4 text-5xl opacity-10 rotate-12 group-hover:scale-110 transition-transform">🛡️</div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 border border-green-100 group hover:border-green-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-green-50">✅</div>
                                            <span className="font-bold text-xs text-green-800 uppercase tracking-widest">Liberados Hoje</span>
                                        </div>
                                        <span className="font-black text-xl text-green-600">{stats.laudosLiberados}</span>
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

function QuickAction({ href, icon, title, desc, color, customClass }: any) {
    const styles: any = {
        blue: "text-blue-700 bg-blue-50 group-hover:bg-blue-700",
        cyan: "text-cyan-700 bg-cyan-50 group-hover:bg-cyan-700",
        indigo: "text-indigo-700 bg-indigo-50 group-hover:bg-indigo-700",
        green: "text-green-700 bg-green-50 group-hover:bg-green-700",
    };
    
    const textHover: any = {
        blue: "group-hover:text-blue-800",
        cyan: "group-hover:text-cyan-800",
        indigo: "group-hover:text-indigo-800",
        green: "group-hover:text-green-800",
    };

    return (
        <Link 
            href={href} 
            className={`bg-white p-5 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-4 group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${customClass || ''}`}
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-colors shadow-inner shrink-0 group-hover:text-white border border-slate-50 ${styles[color]}`}>
                {icon}
            </div>
            <div>
                <h3 className={`font-black text-slate-800 text-sm transition-colors ${textHover[color]}`}>{title}</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
            </div>
        </Link>
    );
}