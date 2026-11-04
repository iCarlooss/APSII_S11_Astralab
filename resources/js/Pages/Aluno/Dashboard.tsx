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

interface AlunoProps extends PageProps {
    stats: {
        atendimentosAbertos: number;
        laudosDigitados: number;
        aguardandoRevisao: number;
        devolvidos: number;
    };
    recentes: RecentOS[];
}

export default function Dashboard({ auth, stats, recentes = [] }: AlunoProps) {
    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-black text-2xl text-blue-950 leading-tight tracking-tight">Estágio AstraLab</h2>}
        >
            <Head title="AstraLab - Meu Plantão" />

            <div className="py-8 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* ==========================================
                        BANNER PRINCIPAL (CIANO ESCURO - FULL WIDTH)
                        Aqui aplicamos pb-32 para dar espaço para os botões subirem
                        ========================================== */}
                    <div className="relative bg-gradient-to-br from-[#0F172A] via-[#164E63] to-[#0891B2] rounded-[2.5rem] p-10 pb-32 shadow-lg overflow-hidden border border-cyan-800 flex flex-col gap-10">
                        
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            
                            {/* Textos do Banner */}
                            <div className="max-w-2xl">
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 border border-white/10 shadow-sm text-cyan-50">
                                    Portal Técnico do Aluno
                                </span>
                                <h1 className="text-4xl font-black mb-2 tracking-tight text-white">Bom plantão, {auth.user.name.split(' ')[0]}! 🎓</h1>
                                <p className="text-cyan-100 text-sm font-medium opacity-90 leading-relaxed">
                                    Sua bancada virtual está pronta. Lembre-se: todos os laudos que você digitar serão enviados para a revisão rigorosa do Professor antes de chegar ao paciente.
                                </p>
                            </div>

                            {/* CAIXA DE ALERTA PULANDO (Alinhada à direita) */}
                            {stats.devolvidos > 0 && (
                                <Link 
                                    href={route('tecnico.correcoes')} 
                                    className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-2xl shadow-red-900/20 border-b-4 border-red-500 animate-bounce shrink-0 group hover:bg-red-50 transition-colors"
                                >
                                    <div className="text-3xl group-hover:scale-110 transition-transform">⚠️</div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-red-600 mb-0.5">Ação Necessária</span>
                                        <span className="text-base font-black leading-none text-slate-800">{stats.devolvidos} Laudos p/ Corrigir</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                        
                        {/* Efeitos de Fundo do Banner */}
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
                        <div className="absolute left-10 -bottom-20 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none mix-blend-screen"></div>
                    </div>

                    {/* ==========================================
                        BOTÕES DE AÇÃO 
                        O -mt-24 é o segredo aqui: puxa os botões para cima, sobrepondo o banner!
                        ========================================== */}
                    <div className="relative z-20 px-4 -mt-24 mb-10">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-6 max-w-5xl mx-auto">
                            
                            <QuickAction 
                                href={route('tecnico.novo')} 
                                icon="📋" 
                                title="Recepção" 
                                desc="Cadastrar Nova OS" 
                                color="blue" 
                                customClass="w-full md:w-72" 
                            />
                            
                            <QuickAction 
                                href={route('tecnico.fila')} 
                                icon="🧪" 
                                title="Bancada Virtual" 
                                desc="Digitação de Exames" 
                                color="cyan" 
                                customClass="w-full md:w-72" 
                            />
                            
                            {/* O Botão de Correções só fica vermelho e clicável se houver recusas */}
                            {stats.devolvidos > 0 ? (
                                <QuickAction 
                                    href={route('tecnico.correcoes')} 
                                    icon="🔙" 
                                    title="Correções" 
                                    desc="Revisar Recusados" 
                                    color="red" 
                                    customClass="w-full md:w-72 ring-2 ring-red-400 shadow-red-500/30" 
                                />
                            ) : (
                                <QuickAction 
                                    href="#" 
                                    icon="✅" 
                                    title="Correções" 
                                    desc="Tudo em Ordem" 
                                    color="slate" 
                                    customClass="w-full md:w-72 opacity-60 cursor-not-allowed shadow-none" 
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* COLUNA ESQUERDA: LISTAGEM GERAL */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                                <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                                    <div>
                                        <h3 className="text-lg font-black text-cyan-950 flex items-center gap-2">
                                            <span className="w-2 h-6 bg-cyan-700 rounded-full"></span>
                                            Últimas Movimentações
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pacientes e exames da unidade</p>
                                    </div>
                                </div>
                                
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            <tr>
                                                <th className="px-8 py-5">Protocolo</th>
                                                <th className="px-8 py-5">Paciente</th>
                                                <th className="px-8 py-5">Status da O.S.</th>
                                                <th className="px-8 py-5">Hora</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {recentes.length > 0 ? recentes.map((os) => (
                                                <tr key={os.id} className="transition-colors group hover:bg-cyan-50/30">
                                                    <td className="px-8 py-5 font-mono text-xs font-bold text-cyan-800 group-hover:text-cyan-950">
                                                        {os.protocolo}
                                                    </td>
                                                    <td className="px-8 py-5 text-xs font-bold text-slate-700 uppercase">
                                                        {os.paciente}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm border ${
                                                            os.status === 'Devolvido' 
                                                            ? 'bg-red-100 text-red-800 border-red-200'
                                                            : os.status === 'Aguardando Validação' || os.status === 'Aguardando_Supervisor'
                                                            ? 'bg-indigo-100 text-indigo-800 border-indigo-200' 
                                                            : os.status === 'Concluido' || os.status === 'Liberado'
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                                        }`}>
                                                            {os.status === 'Devolvido' ? 'RECUSADO - CORRIGIR ❌' : 
                                                             os.status === 'Aguardando Validação' || os.status === 'Aguardando_Supervisor' ? 'EM REVISÃO ⏳' : 
                                                             os.status === 'Concluido' || os.status === 'Liberado' ? 'LIBERADO FINAL ✅' : 
                                                             'PENDENTE (NA BANCADA)'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        {os.hora}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-8 py-20 text-center">
                                                        <span className="text-4xl block mb-4 opacity-20 text-cyan-900">📭</span>
                                                        <span className="text-slate-400 font-black text-xs uppercase tracking-widest">Nenhuma movimentação recente.</span>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* COLUNA DIREITA: MÉTRICAS E AVISOS */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Métricas do Plantão</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 shadow-sm border border-slate-100">📋</div>
                                            <span className="font-bold text-xs text-slate-700 uppercase tracking-widest">Fila Geral</span>
                                        </div>
                                        <span className="font-black text-xl text-slate-600">{stats.atendimentosAbertos}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 border border-green-100 group hover:border-green-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-green-50">✅</div>
                                            <span className="font-bold text-xs text-green-800 uppercase tracking-widest">Seus Laudos</span>
                                        </div>
                                        <span className="font-black text-xl text-green-700">{stats.laudosDigitados}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100 group hover:border-indigo-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-50">⏳</div>
                                            <span className="font-bold text-xs text-indigo-800 uppercase tracking-widest">Em Revisão</span>
                                        </div>
                                        <span className="font-black text-xl text-indigo-700">{stats.aguardandoRevisao}</span>
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

// COMPONENTES INTERNOS REDESENHADOS
function QuickAction({ href, icon, title, desc, color, customClass }: any) {
    const styles: any = {
        blue: "text-blue-700 bg-blue-50 group-hover:bg-blue-700",
        cyan: "text-cyan-700 bg-cyan-50 group-hover:bg-cyan-700",
        indigo: "text-indigo-700 bg-indigo-50 group-hover:bg-indigo-700",
        green: "text-green-700 bg-green-50 group-hover:bg-green-700",
        red: "text-red-700 bg-red-50 group-hover:bg-red-700",
        slate: "text-slate-400 bg-slate-50 group-hover:bg-slate-50 group-hover:text-slate-400",
    };
    
    const textHover: any = {
        blue: "group-hover:text-blue-800",
        cyan: "group-hover:text-cyan-800",
        indigo: "group-hover:text-indigo-800",
        green: "group-hover:text-green-800",
        red: "group-hover:text-red-800",
        slate: "group-hover:text-slate-400",
    };

    return (
        <Link 
            href={href} 
            className={`bg-white p-6 rounded-[2rem] shadow-xl shadow-cyan-900/5 border border-slate-100 flex items-center gap-5 group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${customClass || ''}`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-colors shadow-inner shrink-0 ${color !== 'slate' ? 'group-hover:text-white' : ''} border border-slate-50 ${styles[color]}`}>
                {icon}
            </div>
            <div>
                <h3 className={`font-black text-slate-800 text-base transition-colors ${textHover[color]}`}>{title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
            </div>
        </Link>
    );
}