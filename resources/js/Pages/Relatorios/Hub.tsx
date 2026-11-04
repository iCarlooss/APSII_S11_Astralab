import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

export default function HubRelatorios({ auth, professoresFiltro, alunosFiltro, examesFiltro, userRole }: any) {
    const [relatorioAtivo, setRelatorioAtivo] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false); 
    
    const [alunosSelecionados, setAlunosSelecionados] = useState<number[]>([]);
    const [professoresSelecionados, setProfessoresSelecionados] = useState<number[]>([]);

    const { data, setData } = useForm({
        tipo: '',
        data_inicio: '',
        data_fim: '',
        exame_id: '',
    });

    const abrirModalFiltros = (tipo: string) => {
        setRelatorioAtivo(tipo);
        setData('tipo', tipo);
        setData('exame_id', '');
        setAlunosSelecionados([]);
        setProfessoresSelecionados([]);
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        setRelatorioAtivo(null);
    };

    const toggleSelecao = (id: number, tipoLista: 'aluno' | 'professor') => {
        if (tipoLista === 'aluno') {
            setAlunosSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
            setProfessoresSelecionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }
    };

    const aplicarFiltroData = (periodo: string) => {
        const hoje = new Date();
        let inicio = new Date();
        let fim = new Date(hoje);

        if (periodo === 'mes_atual') {
            inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        } else if (periodo === 'semana') {
            inicio.setDate(hoje.getDate() - 7);
        } else if (periodo === 'ano') {
            inicio = new Date(hoje.getFullYear(), 0, 1);
        }

        setData({
            ...data,
            data_inicio: inicio.toISOString().split('T')[0],
            data_fim: fim.toISOString().split('T')[0]
        });
    };

    const gerarRelatorio = (e: React.FormEvent) => {
        e.preventDefault();
        const queryData: any = { ...data };
        if (alunosSelecionados.length > 0) queryData.aluno_id = alunosSelecionados.join(',');
        if (professoresSelecionados.length > 0) queryData.professor_id = professoresSelecionados.join(',');

        const queryParams = new URLSearchParams(queryData).toString();
        window.open(`/admin/relatorios/gerar?${queryParams}`, '_blank');
        fecharModal(); 
    };

    const inputClass = "mt-1 block w-full rounded-xl border-slate-200 focus:border-[#15803d] focus:ring-[#15803d] text-sm bg-slate-50";

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="font-black text-2xl leading-tight tracking-tight">
                        <span className="text-[#1f547e]">Astra</span><span className="text-[#15803d]">Lab</span> <span className="text-slate-300 mx-2 text-xl font-normal">|</span> <span className="text-[#1f547e]">Central de Relatórios</span>
                    </h2>
                    <Link href={route('dashboard')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-[#1f547e] hover:bg-slate-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm w-fit">
                        <span className="text-lg leading-none">←</span> Voltar ao Painel
                    </Link>
                </div>
            }
        >
            <Head title="AstraLab - Central de Relatórios" />

            <div className="py-12 bg-[#F0F4F8] min-h-screen relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Métricas Operacionais e Administrativas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        {userRole === 'Administrador' && (
                            <>
                                <ReportCard icon="📈" title="Produção Geral" desc="Visão macro e status de laudos." onClick={() => abrirModalFiltros('admin_producao')} />
                                <ReportCard icon="🔬" title="Funil de Exames" desc="Solicitados, preenchidos e pendentes." onClick={() => abrirModalFiltros('admin_exames')} />
                                <ReportCard icon="⏳" title="Raio-X da Fila" desc="Laudos atrasados e gargalos." onClick={() => abrirModalFiltros('admin_fila')} />
                                <ReportCard icon="📊" title="Atendimentos" desc="Mapa de pacientes e recepção." onClick={() => abrirModalFiltros('admin_atendimentos')} />
                                <ReportCard icon="💰" title="Custos e Faturamento" desc="Levantamento de valores." onClick={() => abrirModalFiltros('admin_financeiro')} />
                                <ReportCard icon="⏱️" title="Tempo de Resposta" desc="TAT - Turnaround Time médio." onClick={() => abrirModalFiltros('admin_tat')} />
                                <ReportCard icon="🔍" title="Auditoria de Sistema" desc="Registro de alterações e logs." onClick={() => abrirModalFiltros('admin_auditoria')} />
                            </>
                        )}
                    </div>

                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Métricas Acadêmicas e Qualidade</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ReportCard icon="👨‍🎓" title="Desempenho da Turma" desc="Métricas de digitação e acertos." onClick={() => abrirModalFiltros('produtividade_aluno')} />
                        <ReportCard icon="📉" title="Índice de Rejeição" desc="Exames mais devolvidos." onClick={() => abrirModalFiltros('qualidade_rejeicao')} />
                        <ReportCard icon="⭐" title="NPS e Satisfação" desc="Avaliações dos pacientes." onClick={() => abrirModalFiltros('nps_satisfacao')} />
                    </div>
                </div>

                {/* ==============================================================
                    O POP-UP (MODAL) DE FILTROS
                    ============================================================== */}
                {modalAberto && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                            
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="font-black text-[#1f547e] text-xl">Configuração de Relatório</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Defina os parâmetros de extração</p>
                                </div>
                                <button onClick={fecharModal} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-slate-200">
                                    ✕
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1">
                                <form id="formRelatorio" onSubmit={gerarRelatorio} className="space-y-6">
                                    
                                    <div>
                                        <InputLabel value="Períodos Rápidos" className="mb-2" />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => aplicarFiltroData('semana')} className="flex-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors border border-slate-200">7 Dias</button>
                                            <button type="button" onClick={() => aplicarFiltroData('mes_atual')} className="flex-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors border border-slate-200">Este Mês</button>
                                            <button type="button" onClick={() => aplicarFiltroData('ano')} className="flex-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors border border-slate-200">Este Ano</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <InputLabel value="Data Inicial" />
                                            <TextInput type="date" className={inputClass} value={data.data_inicio} onChange={e => setData('data_inicio', e.target.value)} required />
                                        </div>
                                        <div>
                                            <InputLabel value="Data Final" />
                                            <TextInput type="date" className={inputClass} value={data.data_fim} onChange={e => setData('data_fim', e.target.value)} required />
                                        </div>
                                    </div>

                                    {/* FILTROS DINÂMICOS DEPENDENDO DO RELATÓRIO */}
                                    {relatorioAtivo === 'admin_exames' && (
                                        <div>
                                            <InputLabel value="Focar em Exame Específico" className="mb-1" />
                                            <select className={inputClass + ' py-3'} value={data.exame_id} onChange={e => setData('exame_id', e.target.value)}>
                                                <option value="">🔬 Ver Todos os Exames</option>
                                                {examesFiltro && examesFiltro.map((ex: any) => (
                                                    <option key={ex.id} value={ex.id}>{ex.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Exibir filtro de alunos se for de produtividade ou índice de rejeição */}
                                    {(relatorioAtivo === 'produtividade_aluno' || relatorioAtivo === 'qualidade_rejeicao') && (
                                        <div>
                                            <InputLabel value="Selecionar Alunos (Opcional)" className="mb-2" />
                                            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {alunosFiltro.map((aluno: any) => (
                                                    <label key={aluno.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-200/50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-300">
                                                        <Checkbox checked={alunosSelecionados.includes(aluno.id)} onChange={() => toggleSelecao(aluno.id, 'aluno')} className="!text-[#1f547e] focus:!ring-[#1f547e] rounded" />
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase">{aluno.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Deixe vazio para buscar todos os alunos registrados.</p>
                                        </div>
                                    )}

                                    {relatorioAtivo === 'admin_producao' && (
                                        <div>
                                            <InputLabel value="Selecionar Professores (Opcional)" className="mb-2" />
                                            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {professoresFiltro.map((prof: any) => (
                                                    <label key={prof.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-200/50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-300">
                                                        <Checkbox checked={professoresSelecionados.includes(prof.id)} onChange={() => toggleSelecao(prof.id, 'professor')} className="!text-[#1f547e] focus:!ring-[#1f547e] rounded" />
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase">{prof.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Deixe vazio para contabilizar a produção de todos.</p>
                                        </div>
                                    )}

                                </form>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={fecharModal} className="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors">
                                    Cancelar
                                </button>
                                <button form="formRelatorio" type="submit" className="bg-[#15803d] hover:bg-[#116a32] text-white px-8 py-3 rounded-xl shadow-lg shadow-green-700/20 font-black text-xs uppercase tracking-widest transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                                    <span>🖨️</span> Visualizar / Imprimir PDF
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}

function ReportCard({ icon, title, desc, onClick }: any) {
    return (
        <button onClick={onClick} className="text-left p-6 rounded-3xl border bg-white text-slate-700 border-slate-200 hover:border-[#1f547e] hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col justify-start group">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:bg-blue-50 transition-colors border border-slate-100 shadow-sm">
                {icon}
            </div>
            <h4 className="font-black text-[#1f547e] text-lg mb-1 leading-tight">{title}</h4>
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed mt-2">{desc}</p>
        </button>
    );
}