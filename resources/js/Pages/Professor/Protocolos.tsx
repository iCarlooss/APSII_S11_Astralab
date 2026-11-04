import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

// Tipagens baseadas na resposta paginada e nos relacionamentos do Controller
interface Digitador {
    name: string;
}

interface Laudo {
    status: string;
    digitador?: Digitador;
}

interface ExameItem {
    id_item: number;
    exame: { nome_exame: string };
    laudo?: Laudo;
}

interface Avaliacao {
    nota: number;
    comentario?: string;
}

interface Protocolo {
    id_pedido: number;
    protocolo: string;
    data_pedido: string;
    status: string;
    paciente?: { utilizador?: { name: string } };
    tecnico?: { name: string }; 
    itens: ExameItem[];
    // Adicionado para receber a relação (se você implementar no back-end)
    avaliacao?: Avaliacao | null; 
}

interface PaginatedData {
    data: Protocolo[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
}

interface StaffMember {
    id: number;
    name: string;
}

interface SupervisaoProps extends PageProps {
    protocolos: PaginatedData;
    staff: StaffMember[];
    filtros: {
        busca?: string;
        staff_id?: string;
    };
}

export default function Protocolos({ auth, protocolos, staff, filtros }: SupervisaoProps) {
    const [busca, setBusca] = useState(filtros.busca || '');
    const [staffId, setStaffId] = useState(filtros.staff_id || '');

    // Aplica os filtros disparando uma nova requisição GET para a mesma rota
    const aplicarFiltros = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(route('professor.protocolos'), {
            busca,
            staff_id: staffId
        }, { preserveState: true, preserveScroll: true });
    };

    // Limpa os filtros
    const limparFiltros = () => {
        setBusca('');
        setStaffId('');
        router.get(route('professor.protocolos'));
    };

    const formatarData = (dataIso: string) => {
        return new Date(dataIso).toLocaleDateString('pt-BR', { 
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
    };

    // Função auxiliar para renderizar as estrelas
    const renderEstrelas = (nota: number) => {
        return (
            <div className="flex gap-0.5 text-lg" title={`Nota: ${nota}/5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= nota ? 'text-amber-400' : 'text-slate-200'}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('dashboard')} 
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-800 hover:border-blue-300 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm group"
                    >
                        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Voltar
                    </Link>
                    <h2 className="font-black text-2xl text-blue-950 tracking-tight">Supervisão de Protocolos</h2>
                </div>
            }
        >
            <Head title="AstraLab - Supervisão Geral" />

            <div className="py-12 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* BARRA DE FERRAMENTAS E FILTROS */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                        <form onSubmit={aplicarFiltros} className="flex flex-col xl:flex-row gap-6 justify-between items-center">
                            
                            <div className="flex items-center gap-4 w-full xl:w-auto">
                                <div className="hidden md:flex items-center gap-4 mr-2">
                                    <div className="w-12 h-12 bg-blue-100 border border-blue-200 rounded-2xl flex items-center justify-center text-2xl text-blue-700 shadow-inner">🗂️</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg leading-tight">Rastreio de O.S.</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auditoria e Qualidade</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                                <div className="relative w-full md:w-64">
                                    <span className="absolute left-4 top-3.5 opacity-30">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Paciente ou Protocolo..." 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold text-slate-600 transition-all text-sm"
                                        value={busca}
                                        onChange={(e) => setBusca(e.target.value)}
                                    />
                                </div>

                                <div className="w-full md:w-64">
                                    <select 
                                        className="w-full py-3 px-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold text-slate-600 transition-all text-sm appearance-none cursor-pointer"
                                        value={staffId}
                                        onChange={(e) => setStaffId(e.target.value)}
                                    >
                                        <option value="">Todos os Alunos/Atendentes</option>
                                        {staff.map(membro => (
                                            <option key={membro.id} value={membro.id}>{membro.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button type="submit" className="bg-blue-950 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all shadow-md hover:-translate-y-0.5">
                                    Filtrar
                                </button>

                                {(filtros.busca || filtros.staff_id) && (
                                    <button type="button" onClick={limparFiltros} className="bg-slate-100 text-slate-500 border border-slate-200 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                                        Limpar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Exibindo <span className="text-blue-700">{protocolos.data.length}</span> de <span className="text-blue-700">{protocolos.total}</span> registros
                        </p>
                    </div>

                    {/* LISTAGEM DE PROTOCOLOS */}
                    <div className="space-y-6">
                        {protocolos.data.length > 0 ? (
                            protocolos.data.map((os) => (
                                <div key={os.id_pedido} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                    
                                    {/* CABEÇALHO DA O.S. (Agora com Botão PDF e Avaliação) */}
                                    <div className="bg-slate-50/50 p-6 md:p-8 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                        
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                                                📋
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                                    <h3 className="font-black text-blue-950 text-xl font-mono">{os.protocolo}</h3>
                                                    <span className={`text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest border shadow-sm ${
                                                        os.status === 'Concluido' || os.status === 'Liberado' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        os.status === 'Aguardando Validação' || os.status === 'Aguardando_Supervisor' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                                        'bg-amber-100 text-amber-800 border-amber-200'
                                                    }`}>
                                                        {os.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 uppercase mb-1">{os.paciente?.utilizador?.name || 'Paciente não identificado'}</p>
                                                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    <span>📅 {formatarData(os.data_pedido)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span>👩‍💻 Recepção: <span className="text-blue-700">{os.tecnico?.name || 'Sistema'}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* NOVO BLOCO DE AÇÕES (PDF E ESTRELAS) */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            
                                            {/* Bloco de Avaliação (Só mostra se o paciente já avaliou) */}
                                            {os.avaliacao ? (
                                                <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4 w-full sm:w-auto">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avaliação do Paciente</span>
                                                    {renderEstrelas(os.avaliacao.nota)}
                                                    {os.avaliacao.comentario && (
                                                        <span className="text-[10px] text-slate-500 italic mt-1 max-w-[200px] truncate" title={os.avaliacao.comentario}>
                                                            "{os.avaliacao.comentario}"
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-slate-100 pb-3 sm:pb-0 sm:pr-4 w-full sm:w-auto">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avaliação do Paciente</span>
                                                    <span className="text-xs font-bold text-slate-300">Ainda não avaliado</span>
                                                </div>
                                            )}

                                            {/* Botões de Ação */}
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                {(os.status === 'Concluido' || os.status === 'Liberado') && (
                                                    <a 
                                                        href={route('paciente.laudo.download_protocolo', { protocolo: os.protocolo })}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 hover:text-white transition-all shadow-sm group"
                                                    >
                                                        <span className="text-sm">📄</span> Baixar PDF
                                                    </a>
                                                )}

                                                {(os.status === 'Aguardando Validação' || os.status === 'Aguardando_Supervisor') && (
                                                    <Link 
                                                        href={route('admin.validacao')} 
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 hover:text-white transition-all shadow-sm"
                                                    >
                                                        Revisar Laudo
                                                    </Link>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    {/* LISTA DE EXAMES INTERNOS (A AUDITORIA) */}
                                    <div className="p-6 md:p-8 bg-white">
                                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 border-b border-slate-100 pb-2">Composição do Pedido</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {os.itens.map(item => (
                                                <div key={item.id_item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4">
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                                                        <span className="font-black text-slate-700 text-sm">{item.exame.nome_exame}</span>
                                                    </div>

                                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                        {item.laudo ? (
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex flex-col text-right">
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digitado por</span>
                                                                    <span className="text-xs font-black text-slate-700">{item.laudo.digitador?.name || 'Desconhecido'}</span>
                                                                </div>
                                                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-md uppercase tracking-widest border shadow-sm ${
                                                                    item.laudo.status === 'Liberado' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                                    item.laudo.status === 'Aguardando_Supervisor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                                    item.laudo.status === 'Devolvido' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}>
                                                                    {item.laudo.status === 'Liberado' ? 'VALIDADO FINAL ✅' : 
                                                                     item.laudo.status === 'Aguardando_Supervisor' ? 'AGUARDA ADMIN ⏳' : 
                                                                     item.laudo.status === 'Devolvido' ? 'RECUSADO ❌' : 
                                                                     'EM ANÁLISE ⏳'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Responsável</span>
                                                                <span className="text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                                                                    Aguardando Digitação
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                                <span className="text-5xl block mb-4 opacity-20 text-blue-900">🔎</span>
                                <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">Nenhum protocolo encontrado</h4>
                                <p className="text-slate-400 text-sm mt-2">Tente ajustar os filtros de busca acima.</p>
                            </div>
                        )}
                    </div>

                    {/* PAGINAÇÃO */}
                    {protocolos.links && protocolos.links.length > 3 && (
                        <div className="flex justify-center mt-10 gap-2">
                            {protocolos.links.map((link, index) => {
                                if (link.url === null) return null;
                                
                                return (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xs transition-all shadow-sm ${
                                            link.active 
                                            ? 'bg-blue-950 text-white shadow-blue-900/20' 
                                            : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-800 border border-slate-200'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}