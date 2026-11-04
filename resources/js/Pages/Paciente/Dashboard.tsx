import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface DashboardProps extends PageProps {
    meusAgendamentos?: {
        nome_exame: string;
        instrucoes_preparo: string | null;
        status?: 'Pendente' | 'Aguardando Validação' | 'Liberado';
        data_solicitacao?: string;
        prazo_previsto?: string;
        id_laudo?: number;
    }[];
    dadosNomeSocial?: {
        nome_social: string | null;
        usar_nome_social: boolean | null;
    };
}

export default function Dashboard({ auth, meusAgendamentos = [], dadosNomeSocial }: DashboardProps) {
    const { flash } = usePage().props as any;
    const [exameExpandido, setExameExibido] = useState<number | null>(null);

    // =========================================================
    // LÓGICA DO NOME SOCIAL E POP-UP (CORRIGIDA)
    // =========================================================
    const [processing, setProcessing] = useState(false);

    // O Pop-up só abre se o paciente TIVER um nome social cadastrado E se ele NUNCA tiver escolhido antes (null)
    const deveMostrarPopup = dadosNomeSocial?.nome_social && dadosNomeSocial?.usar_nome_social === null;

    const submeterPreferencia = (escolha: boolean) => {
        setProcessing(true); // Bloqueia os botões para evitar duplo clique
        
        // Usamos o router.post para enviar o dado instantaneamente sem depender do estado do React
        router.post(route('paciente.salvar_preferencia_nome'), 
            { usar_nome_social: escolha }, 
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false)
            }
        );
    };

    // Dinâmica de Boas-Vindas: Se optou pelo social, usa o social. Se não, usa o civil.
    const nomeExibicao = (dadosNomeSocial?.usar_nome_social && dadosNomeSocial?.nome_social) 
        ? dadosNomeSocial.nome_social.split(' ')[0] 
        : auth.user.name.split(' ')[0];

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={<h2 className="font-black text-2xl text-blue-950 leading-tight tracking-tight">Portal do Paciente</h2>}
        >
            <Head title="AstraLab - Meu Painel" />

            {/* Fundo atualizado para a identidade AstraLab */}
            <div className="py-8 bg-[#F0F4F8] min-h-screen relative">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Alerta de Sucesso (Ex: quando salva a preferência do nome) */}
                    {flash?.success && (
                        <div className="bg-green-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg animate-in fade-in slide-in-from-top-4 shadow-green-600/20">
                            {flash.success}
                        </div>
                    )}

                    {/* BANNER PRINCIPAL (Gradiente Azul Marinho Corporativo) */}
                    <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 rounded-[2.5rem] p-10 pb-24 shadow-lg overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-6">
                            <div>
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 border border-white/10">
                                    Centro de Monitoramento
                                </span>
                                {/* NOME DINÂMICO AQUI! */}
                                <h1 className="text-4xl font-black mb-2 tracking-tight">Olá, {nomeExibicao}! 👋</h1>
                                <p className="text-blue-100 text-sm font-medium opacity-90 max-w-2xl leading-relaxed">
                                    Bem-vindo ao seu painel clínico. Acompanhe o status dos seus exames e visualize seus laudos oficiais com rapidez e total segurança.
                                </p>
                            </div>

                            <div className="flex bg-white/5 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/10 gap-4 shrink-0 shadow-inner">
                                <div className="text-center px-4 border-r border-white/10">
                                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                        <p className="text-white font-black text-xs uppercase tracking-tight">Conta Ativa</p>
                                    </div>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[9px] font-black text-blue-300 uppercase tracking-widest mb-1">Unidade</p>
                                    <p className="text-white font-black text-xs uppercase tracking-tight flex items-center gap-1">📍 Matriz AstraLab</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                    </div>

                    {/* BOTÕES DE AÇÃO */}
                    <div className="relative z-20 px-2 sm:px-4 -mt-12 mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <QuickAction 
                                href={route('paciente.laudos')} 
                                icon="📄" 
                                title="Meus Resultados" 
                                desc="Ver Laudos e Baixar PDF" 
                                color="green" 
                                customClass="py-8" 
                            />
                            <QuickAction 
                                href={route('paciente.historico')} 
                                icon="📈" 
                                title="Evolução Clínica" 
                                desc="Histórico e Linha do Tempo" 
                                color="blue" 
                                customClass="py-8" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* COLUNA ESQUERDA: LOG DE ATIVIDADES DE EXAMES */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
                                
                                <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                                    <div>
                                        <h3 className="text-lg font-black text-blue-950 flex items-center gap-2">
                                            <span className="w-2 h-6 bg-green-700 rounded-full"></span>
                                            📊 Log de Exames Recentes
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acompanhe o progresso das suas análises em tempo real</p>
                                    </div>
                                </div>
                                
                                <div className="p-6 md:p-8 pt-4">
                                    <div className="space-y-3">
                                        {meusAgendamentos.length > 0 ? (
                                            meusAgendamentos.map((exame, idx) => (
                                                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all group">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                        
                                                        {/* Info do Exame */}
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl shadow-inner border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">🧪</div>
                                                            <div>
                                                                <h4 className="font-black text-slate-800 text-sm uppercase group-hover:text-blue-950 transition-colors">{exame.nome_exame}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">Em: {exame.data_solicitacao}</span>
                                                                    {exame.status !== 'Liberado' && exame.prazo_previsto && (
                                                                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Previsto: {exame.prazo_previsto}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Badges e Ações */}
                                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                                            <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm border ${
                                                                exame.status === 'Liberado' ? 'bg-green-100 text-green-800 border-green-200' :
                                                                exame.status === 'Aguardando Validação' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                                exame.instrucoes_preparo ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                                                            }`}>
                                                                {exame.status === 'Liberado' ? 'Laudo Pronto' :
                                                                 exame.status === 'Aguardando Validação' ? 'Em Revisão Médica' :
                                                                 exame.instrucoes_preparo ? 'Aguardando Coleta' : 'Em Análise'}
                                                            </span>

                                                            {exame.status === 'Liberado' && exame.id_laudo ? (
                                                                <a 
                                                                    href={route('paciente.laudo.download', exame.id_laudo)} 
                                                                    className="text-[10px] font-black text-white bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-all uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                                                >
                                                                    Baixar PDF
                                                                </a>
                                                            ) : exame.instrucoes_preparo && (
                                                                <button 
                                                                    onClick={() => setExameExibido(exameExpandido === idx ? null : idx)}
                                                                    className="text-[10px] font-black text-green-700 bg-green-50 hover:bg-green-700 hover:text-white px-3 py-1.5 rounded-lg border border-green-200 transition-all uppercase tracking-tighter"
                                                                >
                                                                    {exameExpandido === idx ? 'Fechar Guia' : 'Guia de Preparo'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {exameExpandido === idx && exame.instrucoes_preparo && (
                                                        <div className="mt-4 p-4 bg-green-50/50 rounded-xl border border-green-100 animate-in slide-in-from-top-2 duration-300">
                                                            <p className="text-xs font-bold text-green-800 mb-2 uppercase tracking-widest">📝 Instruções Obrigatórias antes da Coleta:</p>
                                                            <p className="text-xs text-green-700 leading-relaxed italic">{exame.instrucoes_preparo}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                                                <span className="text-5xl block mb-4 opacity-30">🧬</span>
                                                <h3 className="text-lg font-black text-blue-950">Tudo em dia!</h3>
                                                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-widest">
                                                    Você não possui exames pendentes ou em análise no momento.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUNA DIREITA: LEMBRETES */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-blue-950 p-8 rounded-[2rem] shadow-lg text-white relative overflow-hidden group h-full flex flex-col border border-blue-900">
                                <div className="flex items-center gap-3 mb-6 border-b border-blue-900 pb-4 relative z-10 shrink-0">
                                    <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-xl shadow-inner">⚠️</div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-100">Atenção!</h3>
                                        <p className="text-[10px] text-blue-300 font-medium">Lembretes importantes</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-5 relative z-10 text-[11px] flex-grow flex flex-col">
                                    
                                    {/* 1. ACESSO AOS RESULTADOS */}
                                    <div className="bg-blue-900/50 p-5 rounded-2xl border border-blue-800">
                                        <h4 className="font-black text-green-400 uppercase mb-2">Acesso aos Resultados</h4>
                                        <p className="text-blue-100 leading-relaxed">Para visualizar ou retirar seus laudos presencialmente, é obrigatório apresentar o <span className="font-bold text-white bg-blue-800 px-1 py-0.5 rounded">Número de Protocolo</span> recebido no atendimento e seu documento de identificação.</p>
                                    </div>

                                    {/* 2. QUADRADO EM BRANCO (Espaço reservado) */}
                                    <div className="flex-grow bg-blue-900/20 p-4 rounded-2xl border border-blue-800/50 border-dashed min-h-[5rem] flex items-center justify-center opacity-50 mt-5">
                                    </div>

                                </div>
                                <div className="absolute -right-10 -bottom-10 text-[10rem] opacity-5 select-none group-hover:scale-110 transition-transform duration-1000">⏰</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ==============================================================
                    POP-UP DE PREFERÊNCIA DE NOME SOCIAL (APENAS NO 1º ACESSO)
                    ============================================================== */}
                {deveMostrarPopup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 border border-cyan-200 shadow-sm">
                                ✨
                            </div>
                            <h3 className="font-black text-[#1f547e] text-2xl tracking-tight mb-3">Como prefere ser chamado?</h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                                Identificamos que você possui o nome social <strong className="text-slate-800">"{dadosNomeSocial.nome_social}"</strong> cadastrado na nossa recepção. 
                                Como prefere que ele seja exibido nos seus laudos e no nosso sistema?
                            </p>

                            <div className="space-y-3">
                                <button 
                                    onClick={() => submeterPreferencia(true)}
                                    disabled={processing}
                                    className="w-full bg-[#1f547e] hover:bg-[#15803d] text-white font-black text-[11px] uppercase tracking-widest py-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    Quero usar meu Nome Social
                                </button>
                                <button 
                                    onClick={() => submeterPreferencia(false)}
                                    disabled={processing}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[11px] uppercase tracking-widest py-4 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Prefiro usar meu Nome Civil
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function QuickAction({ href, icon, title, desc, color, customClass }: any) {
    const styles: any = {
        blue: "text-blue-700 bg-blue-50 group-hover:bg-blue-700",
        green: "text-green-700 bg-green-50 group-hover:bg-green-700",
    };
    
    const textHover: any = {
        blue: "group-hover:text-blue-800",
        green: "group-hover:text-green-800",
    };

    return (
        <Link 
            href={href} 
            className={`bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-slate-100 flex items-center gap-6 group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${customClass || ''}`}
        >
            <div className={`w-16 h-14 rounded-2xl flex items-center justify-center text-4xl transition-colors shadow-inner shrink-0 group-hover:text-white ${styles[color]}`}>
                {icon}
            </div>
            <div>
                <h3 className={`font-black text-blue-950 text-xl transition-colors leading-tight mb-1 ${textHover[color]}`}>{title}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
            </div>
        </Link>
    );
}