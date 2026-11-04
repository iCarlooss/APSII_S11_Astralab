import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

// Tipagens Dinâmicas baseadas no Banco de Dados
interface ExameCatalogo {
    id_exame: number;
    nome_exame: string;
}

interface AgendamentoData {
    id: number;
    data: string;
    horario: string;
    status: string;
    exames_pretendidos: string[] | string;
}

interface AgendarProps extends PageProps {
    examesDisponiveis?: ExameCatalogo[]; 
    meusAgendamentos?: AgendamentoData[];
}

export default function Agendar({ auth, examesDisponiveis = [], meusAgendamentos = [] }: AgendarProps) {
    // Horários simulados (Num sistema real complexo, o backend enviaria apenas os livres)
    const slotsManha = ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"];
    const slotsTarde = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

    const { data, setData, post, processing, reset, errors } = useForm({
        data: '',
        horario: '',
        exames: [] as string[],
    });

    const toggleExame = (nomeExame: string) => {
        const novosExames = data.exames.includes(nomeExame)
            ? data.exames.filter((e) => e !== nomeExame)
            : [...data.exames, nomeExame];
        setData('exames', novosExames);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('paciente.agendar.store'), {
            onSuccess: () => {
                alert('✅ Solicitação enviada! O laboratório analisará seu pedido e você receberá a confirmação por e-mail.');
                reset();
            },
        });
    };

    const formatarData = (dataIso: string) => {
        if (!dataIso) return '';
        const [ano, mes, dia] = dataIso.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    {/* BOTÃO VOLTAR CORRIGIDO */}
                    <Link 
                        href={route('paciente.dashboard')} 
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                        <span className="text-lg leading-none">←</span> Voltar ao Painel
                    </Link>
                    <h2 className="font-black text-2xl text-teal-950 tracking-tight">Agendar Coleta</h2>
                </div>
            }
        >
            <Head title="AstraLab - Agendamento" />

            <div className="py-12 bg-[#F4F9F9] min-h-screen">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* AVISO DE FLUXO */}
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm shrink-0">
                            📧
                        </div>
                        <div>
                            <h3 className="text-amber-800 font-black text-lg">Como funciona o agendamento?</h3>
                            <p className="text-amber-700/80 font-medium text-sm mt-1 leading-relaxed">
                                Você está realizando uma <strong>pré-reserva</strong>. Nossa equipe técnica avaliará os exames selecionados para garantir que não há conflito de preparo. Após a análise, seu status mudará para Confirmado e você receberá o guia oficial no seu e-mail.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100">
                        <form onSubmit={submit} className="space-y-12">
                            
                            {/* SEÇÃO 1: DATA E HORA */}
                            <div>
                                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                                    <span className="bg-teal-100 text-teal-600 w-8 h-8 flex items-center justify-center rounded-xl">1</span> 
                                    Quando você deseja comparecer?
                                </h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Escolha a Data</label>
                                        <input 
                                            type="date" 
                                            min={new Date().toISOString().split('T')[0]} 
                                            className={`w-full rounded-2xl border-2 p-4 font-black text-slate-700 transition-all ${errors.data ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white focus:border-teal-500 focus:ring-0 shadow-sm'}`}
                                            value={data.data}
                                            onChange={e => setData('data', e.target.value)}
                                        />
                                        {errors.data && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.data}</p>}
                                    </div>

                                    <div className={`transition-all duration-500 ${!data.data ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
                                            {data.data ? 'Horários Livres' : 'Selecione uma data primeiro'}
                                        </label>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 mb-2">Manhã (Jejum)</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {slotsManha.map(hora => (
                                                        <button
                                                            key={hora}
                                                            type="button"
                                                            onClick={() => setData('horario', hora)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-black transition-all border-2 ${
                                                                data.horario === hora 
                                                                ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20' 
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700'
                                                            }`}
                                                        >
                                                            {hora}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 mb-2">Tarde</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {slotsTarde.map(hora => (
                                                        <button
                                                            key={hora}
                                                            type="button"
                                                            onClick={() => setData('horario', hora)}
                                                            className={`px-4 py-2 rounded-xl text-sm font-black transition-all border-2 ${
                                                                data.horario === hora 
                                                                ? 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20' 
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700'
                                                            }`}
                                                        >
                                                            {hora}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {errors.horario && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.horario}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* SEÇÃO 2: SELEÇÃO DINÂMICA DE EXAMES */}
                            <div className={`transition-all duration-500 ${!data.horario ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                <div className="flex justify-between items-end mb-6">
                                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                        <span className="bg-teal-100 text-teal-600 w-8 h-8 flex items-center justify-center rounded-xl">2</span> 
                                        Quais exames você precisa realizar?
                                    </h3>
                                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg">
                                        {data.exames.length} Selecionados
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {examesDisponiveis.map((exame) => (
                                        <div 
                                            key={exame.id_exame}
                                            onClick={() => toggleExame(exame.nome_exame)}
                                            className={`flex items-center p-4 rounded-[1.5rem] border-2 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5 ${
                                                data.exames.includes(exame.nome_exame) 
                                                ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-teal-900/5' 
                                                : 'border-slate-100 bg-white text-slate-600 hover:border-teal-300'
                                            }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all shrink-0 ${
                                                data.exames.includes(exame.nome_exame) ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'
                                            }`}>
                                                {data.exames.includes(exame.nome_exame) && <span className="text-white text-[10px]">✔</span>}
                                            </div>
                                            <span className="text-xs font-bold leading-tight">
                                                {exame.nome_exame}
                                            </span>
                                        </div>
                                    ))}
                                    {examesDisponiveis.length === 0 && (
                                        <p className="text-sm text-slate-400 font-bold col-span-full">Nenhum exame cadastrado no catálogo do laboratório.</p>
                                    )}
                                </div>
                                {errors.exames && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.exames}</p>}
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-sm text-center md:text-left leading-relaxed">
                                    * Certifique-se de comparecer com 15 minutos de antecedência portando documento original com foto.
                                </p>
                                <button 
                                    type="submit" 
                                    disabled={processing || data.exames.length === 0 || !data.horario}
                                    className="w-full md:w-auto px-12 py-5 bg-teal-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {processing ? 'ENVIANDO SOLICITAÇÃO...' : 'SOLICITAR AGENDAMENTO'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ====================================================
                        NOVO: SEÇÃO DE "MEUS AGENDAMENTOS"
                        ==================================================== */}
                    <div className="mt-12">
                        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 pl-2">
                            <span>📅</span> Histórico de Solicitações
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {meusAgendamentos.map((ag) => {
                                // Converter string JSON de exames para Array se necessário
                                const examesParseados = typeof ag.exames_pretendidos === 'string' 
                                    ? JSON.parse(ag.exames_pretendidos) 
                                    : ag.exames_pretendidos;

                                return (
                                    <div key={ag.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                                                <div>
                                                    <p className="text-2xl font-black text-slate-800">{formatarData(ag.data)}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Horário: <span className="text-teal-600">{ag.horario}</span></p>
                                                </div>
                                                {ag.status === 'Confirmado' ? (
                                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                                        <span>✔</span> Confirmado
                                                    </span>
                                                ) : (
                                                    <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                                                        <span>⏳</span> Em Análise
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exames Solicitados</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Array.isArray(examesParseados) && examesParseados.map((exameNome, idx) => (
                                                        <span key={idx} className="bg-slate-50 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-200">
                                                            {exameNome}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {ag.status === 'Confirmado' && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest text-center">
                                                    Guia de preparo enviada para o seu e-mail.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {meusAgendamentos.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                                    <span className="text-4xl block mb-2 opacity-30">📭</span>
                                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Nenhum agendamento realizado.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}