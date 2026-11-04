import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface ExameAgendado {
    nome_exame: string;
}

interface AgendamentoData {
    id: number;
    paciente: string;
    cpf: string;
    data: string;
    horario: string;
    status: 'Pendente' | 'Confirmado' | 'Cancelado';
    exames_pretendidos: string[];
    created_at: string;
}

interface AgendamentosProps extends PageProps {
    agendamentos: AgendamentoData[];
    stats: {
        pendentes: number;
        confirmadosHoje: number;
    };
}

export default function GestaoAgendamentos({ auth, agendamentos = [], stats = { pendentes: 0, confirmadosHoje: 0 } }: AgendamentosProps) {
    const [busca, setBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState<'Todos' | 'Pendente' | 'Confirmado'>('Pendente');

    // Filtra por nome, CPF e Status
    const agendamentosFiltrados = agendamentos.filter(a => {
        const matchesBusca = a.paciente.toLowerCase().includes(busca.toLowerCase()) || a.cpf.includes(busca);
        const matchesStatus = filtroStatus === 'Todos' || a.status === filtroStatus;
        return matchesBusca && matchesStatus;
    });

    const formatarData = (dataIso: string) => {
        // Ajuste simples para não dar problema de fuso horário no frontend
        const [ano, mes, dia] = dataIso.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // Ações da Recepção
    const aprovarAgendamento = (id: number) => {
        if (confirm('Deseja aprovar este agendamento? Um e-mail de confirmação com a guia de preparo será enviado ao paciente.')) {
            // Rota que criaremos no Controller depois
            router.patch(route('admin.agendamentos.aprovar', id));
        }
    };

    const cancelarAgendamento = (id: number) => {
        if (confirm('Tem certeza que deseja cancelar esta solicitação?')) {
            router.delete(route('admin.agendamentos.cancelar', id));
        }
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('admin.dashboard')} 
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                        <span className="text-lg leading-none">←</span> Voltar
                    </Link>
                    <h2 className="font-black text-2xl text-teal-950 tracking-tight">Gestão de Agendamentos</h2>
                </div>
            }
        >
            <Head title="AstraLab - Agendamentos" />

            <div className="py-12 bg-[#F4F9F9] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* KPIs da Recepção */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] shadow-sm flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">Aguardando Avaliação</p>
                                <h3 className="text-4xl font-black text-amber-900">{stats.pendentes}</h3>
                            </div>
                            <div className="text-5xl opacity-50 relative z-10">📥</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-[2.5rem] shadow-sm flex justify-between items-center relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1">Confirmados para Hoje</p>
                                <h3 className="text-4xl font-black text-emerald-900">{stats.confirmadosHoje}</h3>
                            </div>
                            <div className="text-5xl opacity-50 relative z-10">✅</div>
                        </div>
                    </div>

                    {/* BARRA DE FERRAMENTAS */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col xl:flex-row gap-6 justify-between items-center">
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                            <div className="relative w-full md:w-80">
                                <span className="absolute left-4 top-3.5 opacity-30">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Buscar paciente ou CPF..." 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-500 font-bold text-slate-600 transition-all"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 w-full md:w-auto overflow-x-auto">
                                {['Pendente', 'Confirmado', 'Todos'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFiltroStatus(status as any)}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                                            filtroStatus === status 
                                            ? 'bg-white text-teal-700 shadow-sm border border-slate-100' 
                                            : 'text-slate-400 hover:text-teal-600'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* LISTAGEM DE AGENDAMENTOS */}
                    <div className="grid grid-cols-1 gap-4">
                        {agendamentosFiltrados.length > 0 ? (
                            agendamentosFiltrados.map((agenda) => (
                                <div key={agenda.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 hover:border-teal-200 transition-colors group">
                                    
                                    {/* Info do Paciente e Data */}
                                    <div className="flex gap-6 items-center w-full xl:w-auto">
                                        <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center shrink-0 shadow-inner ${agenda.status === 'Pendente' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            <span className="text-xs font-black uppercase tracking-widest">{agenda.data.split('-')[2]}</span>
                                            <span className="text-[10px] font-bold uppercase">{agenda.horario}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-black text-slate-800">{agenda.paciente}</h4>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${agenda.status === 'Pendente' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                                                    {agenda.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 font-mono">CPF: {agenda.cpf}</p>
                                        </div>
                                    </div>

                                    {/* Lista de Exames */}
                                    <div className="flex-1 w-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Exames Solicitados:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {agenda.exames_pretendidos.map((exame, i) => (
                                                <span key={i} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-lg shadow-sm">
                                                    {exame}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-3 w-full xl:w-auto pt-4 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                                        {agenda.status === 'Pendente' && (
                                            <>
                                                <button 
                                                    onClick={() => cancelarAgendamento(agenda.id)}
                                                    className="flex-1 xl:flex-none px-6 py-4 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                >
                                                    Recusar
                                                </button>
                                                <button 
                                                    onClick={() => aprovarAgendamento(agenda.id)}
                                                    className="flex-1 xl:flex-none px-8 py-4 bg-teal-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-1 transition-all"
                                                >
                                                    Aprovar & Enviar E-mail
                                                </button>
                                            </>
                                        )}
                                        {agenda.status === 'Confirmado' && (
                                            <button 
                                                disabled
                                                className="w-full px-8 py-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-70 cursor-not-allowed"
                                            >
                                                Agendamento Confirmado
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
                                <span className="text-5xl block mb-4 opacity-20">📭</span>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Nenhum agendamento encontrado.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}