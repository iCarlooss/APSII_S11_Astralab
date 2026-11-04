import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface LaudoData {
    id_laudo: number;
    data_resultado: string;
    item_pedido: {
        exame: {
            nome_exame: string;
        };
        pedido: {
            protocolo: string;
            data_pedido: string;
            medico?: {
                nome: string;
            };
        };
    };
    status: string;
}

interface MeusLaudosProps extends PageProps {
    laudos: LaudoData[];
}

export default function MeusLaudos({ auth, laudos = [] }: MeusLaudosProps) {
    const { flash } = usePage().props as any;
    const [busca, setBusca] = useState('');
    
    // Controle do Modal de Avaliação
    const [protocoloAvaliacao, setProtocoloAvaliacao] = useState<string | null>(null);

    // Formulário de Avaliação
    const { data, setData, post, processing, reset } = useForm({
        protocolo: '',
        nota: 0,
        comentario: '',
    });

    const laudosFiltrados = laudos.filter(l => 
        l.item_pedido.exame.nome_exame.toLowerCase().includes(busca.toLowerCase()) ||
        l.item_pedido.pedido.protocolo.toLowerCase().includes(busca.toLowerCase())
    );

    const laudosAgrupados = laudosFiltrados.reduce((acc, laudo) => {
        const protocolo = laudo.item_pedido.pedido.protocolo;
        if (!acc[protocolo]) {
            acc[protocolo] = {
                data_pedido: laudo.item_pedido.pedido.data_pedido,
                medico: laudo.item_pedido.pedido.medico?.nome || 'Não Informado',
                exames: []
            };
        }
        acc[protocolo].exames.push(laudo);
        return acc;
    }, {} as Record<string, { data_pedido: string, medico: string, exames: LaudoData[] }>);

    const formatarData = (dataIso: string) => {
        if (!dataIso) return '--/--/----';
        return new Date(dataIso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const abrirAvaliacao = (protocolo: string) => {
        setProtocoloAvaliacao(protocolo);
        setData('protocolo', protocolo);
    };

    const fecharAvaliacao = () => {
        setProtocoloAvaliacao(null);
        reset();
    };

    const enviarAvaliacao = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('paciente.avaliar.store'), {
            onSuccess: () => {
                fecharAvaliacao();
            }
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('paciente.dashboard')} 
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-[#1f547e] hover:bg-slate-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm group"
                    >
                        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Voltar ao Painel
                    </Link>
                    <h2 className="font-black text-2xl text-[#1f547e] tracking-tight">Meus Resultados</h2>
                </div>
            }
        >
            <Head title="AstraLab - Meus Laudos" />

            <div className="py-12 bg-[#F0F4F8] min-h-screen relative">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {flash?.success && (
                        <div className="bg-green-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg shadow-green-600/20">
                            {flash.success}
                        </div>
                    )}

                    {/* BARRA DE BUSCA */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <span className="absolute left-4 top-3.5 opacity-30">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Buscar por exame ou protocolo..." 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#15803d] font-medium text-slate-600 transition-colors"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Total: <span className="text-[#15803d]">{laudosFiltrados.length} exames liberados</span>
                        </p>
                    </div>

                    {/* LISTAGEM DE LAUDOS AGRUPADOS */}
                    <div className="space-y-8">
                        {Object.keys(laudosAgrupados).length > 0 ? (
                            Object.entries(laudosAgrupados).map(([protocolo, dados]) => (
                                <div key={protocolo} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden group transition-all">
                                    
                                    {/* CABEÇALHO DO PROTOCOLO */}
                                    <div className="bg-[#1f547e] p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center text-xl border border-white/20">
                                                📁
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white leading-tight">Atendimento: <span className="font-mono text-green-300">{protocolo}</span></h3>
                                                <div className="flex flex-wrap gap-x-4 mt-1">
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                                        Coleta: <span className="text-white">{formatarData(dados.data_pedido)}</span>
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                                        Solicitante: <span className="text-white">{dados.medico}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* GRUPO DE BOTÕES (AVALIAR E BAIXAR TODOS) */}
                                        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                                            <button 
                                                onClick={() => abrirAvaliacao(protocolo)}
                                                className="flex items-center justify-center gap-2 bg-amber-400 text-amber-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-300 transition-all shadow-md w-full sm:w-auto border border-amber-500"
                                            >
                                                <span className="text-sm leading-none">⭐</span> Avaliar Equipe
                                            </button>

                                            <a 
                                                href={route('paciente.laudo.download_protocolo', { protocolo: protocolo })}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 bg-white text-[#1f547e] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-md w-full sm:w-auto border border-transparent"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Baixar Todos
                                            </a>
                                        </div>
                                    </div>

                                    {/* LISTAGEM DE EXAMES DENTRO DO PROTOCOLO */}
                                    <div className="p-6 md:p-8 space-y-4 bg-white">
                                        {dados.exames.map((laudo) => (
                                            <div key={laudo.id_laudo} className="flex flex-col sm:flex-row justify-between items-center p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors gap-4 shadow-sm">
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-lg opacity-80">📄</div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-800">{laudo.item_pedido.exame.nome_exame}</h4>
                                                        <p className="text-[9px] font-bold text-[#15803d] uppercase tracking-widest mt-0.5">Liberado em: {formatarData(laudo.data_resultado)}</p>
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-auto">
                                                    <a 
                                                        href={route('paciente.laudo.download', { id_laudo: laudo.id_laudo })}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center justify-center gap-2 bg-[#1f547e] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#15803d] transition-all shadow-md w-full sm:w-auto"
                                                    >
                                                        Baixar PDF
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-200 shadow-sm">
                                <span className="text-5xl block mb-4 opacity-20 text-[#1f547e]">🔎</span>
                                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Nenhum laudo encontrado.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ==========================================
                    MODAL DE AVALIAÇÃO (POP-UP)
                    ========================================== */}
                {protocoloAvaliacao && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Fundo escuro borrado */}
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={fecharAvaliacao}></div>
                        
                        {/* Caixa do Pop-up */}
                        <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <button onClick={fecharAvaliacao} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">✕</button>
                            
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner border border-amber-200">🎓</div>
                                <h2 className="text-2xl font-black text-[#1f547e] mb-2 tracking-tight">Sua Opinião Importa!</h2>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                    O AstraLab é um laboratório acadêmico. A sua avaliação sobre este atendimento vai <strong>direto para a nota dos nossos alunos</strong>. Ajude-nos a formar profissionais de excelência!
                                </p>
                            </div>

                            <form onSubmit={enviarAvaliacao} className="space-y-6">
                                {/* Interação das Estrelas */}
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setData('nota', star)}
                                            className={`text-4xl transition-all ${data.nota >= star ? 'text-amber-400 scale-110 drop-shadow-md' : 'text-slate-200 hover:text-amber-200 hover:scale-110'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                {data.nota === 0 && <p className="text-center text-[10px] text-red-500 font-bold uppercase tracking-widest">Por favor, selecione uma nota acima</p>}

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest text-center">
                                        Deixe um elogio ou sugestão (Opcional)
                                    </label>
                                    <textarea 
                                        className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl p-4 text-sm font-medium transition-all resize-none focus:bg-white focus:border-[#15803d] focus:ring-0 text-center"
                                        rows={3}
                                        placeholder="Os alunos foram atenciosos?"
                                        value={data.comentario}
                                        onChange={e => setData('comentario', e.target.value)}
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={processing || data.nota === 0}
                                    className="w-full bg-[#1f547e] text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-[#15803d] transition-colors shadow-lg shadow-[#1f547e]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Enviando...' : 'Enviar Avaliação aos Professores'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}