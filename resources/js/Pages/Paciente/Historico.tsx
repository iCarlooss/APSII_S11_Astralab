import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

// Tipagem baseada nos relacionamentos do Controller
interface LaudoData {
    id_laudo: number;
    resultado: any; 
    observacao: string | null; 
    data_resultado: string; 
    status: string;
    item_pedido: {
        id_item: number;
        exame: {
            id_exame: number;
            nome_exame: string;
        };
        pedido: {
            protocolo: string;
        }
    }
}

interface HistoricoProps extends PageProps {
    laudos: LaudoData[];
}

export default function Historico({ auth, laudos = [] }: HistoricoProps) {
    const [expandedLaudo, setExpandedLaudo] = useState<number | null>(null);

    // Formata data para exibição (Ex: 25 Mai 2023)
    const formatarData = (dataIso: string) => {
        const date = new Date(dataIso);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    /**
     * DICIONÁRIO DE TRADUÇÃO PARA O PACIENTE
     * Transforma as chaves do banco em nomes amigáveis para leitura
     */
    const nomesAmigaveis: Record<string, string> = {
        hemacias: 'Hemácias',
        hemoglobina: 'Hemoglobina',
        hematocrito: 'Hematócrito',
        vcm: 'VCM',
        hcm: 'HCM',
        chcm: 'CHCM',
        rdw: 'RDW (Variação de Tamanho)',
        leucocitos_totais: 'Leucócitos Totais',
        neu_rel: 'Neutrófilos (%)',
        neu_abs: 'Neutrófilos (Absoluto)',
        lin_rel: 'Linfócitos (%)',
        lin_abs: 'Linfócitos (Absoluto)',
        mon_rel: 'Monócitos (%)',
        mon_abs: 'Monócitos (Absoluto)',
        eos_rel: 'Eosinófilos (%)',
        eos_abs: 'Eosinófilos (Absoluto)',
        baso_rel: 'Basófilos (%)',
        baso_abs: 'Basófilos (Absoluto)',
        bas_rel: 'Bastonetes (%)',
        bas_abs: 'Bastonetes (Absoluto)',
        seg_rel: 'Segmentados (%)',
        seg_abs: 'Segmentados (Absoluto)',
        lin_ati_rel: 'Linfócitos Atípicos (%)',
        lin_ati_abs: 'Linfócitos Atípicos (Absoluto)',
        plaquetas: 'Plaquetas Totais',
        mpv: 'Volume Plaquetário Médio (VPM)',
        plcr: 'Plaquetas Grandes (P-LCR)',
        glicemia: 'Glicemia em Jejum',
        glicose: 'Glicose',
        colesterol_total: 'Colesterol Total',
        hdl: 'HDL (Colesterol Bom)',
        ldl: 'LDL (Colesterol Ruim)',
        vldl: 'VLDL',
        triglicerideos: 'Triglicerídeos',
        acido_urico: 'Ácido Úrico',
        cor: 'Cor da Amostra',
        aspecto: 'Aspecto',
        densidade: 'Densidade',
        ph: 'pH',
        proteinas: 'Proteínas',
        cetonas: 'Corpos Cetônicos',
        bilirrubina: 'Bilirrubina',
        sangue: 'Sangue / Hemoglobina',
        nitrito: 'Nitrito',
        esterase: 'Esterase Leucocitária',
        leucocitos: 'Leucócitos',
        celulas_epiteliais: 'Células Epiteliais',
        cilindros: 'Cilindros',
        cristais: 'Cristais',
        muco: 'Muco',
        bacterias: 'Bactérias',
        hcg: 'Beta hCG (Gravidez)',
        sangue_oculto: 'Sangue Oculto',
        abo: 'Grupo Sanguíneo (ABO)',
        rh: 'Fator Rh',
        cor_fezes: 'Cor das Fezes',
        consistencia: 'Consistência',
        muco_fezes: 'Muco',
        sangue_fezes: 'Sangue',
        protozoarios: 'Pesquisa de Protozoários',
        helmintos: 'Pesquisa de Helmintos',
        outros_achados: 'Outros Achados',
        crescimento: 'Crescimento Bacteriano',
        contagem: 'Contagem de Colônias',
        identificacao_agente: 'Bactéria Identificada',
    };

    /**
     * LÓGICA DE COMPARAÇÃO (DELTA)
     */
    const buscarLaudoAnterior = (laudoAtual: LaudoData, indexAtual: number) => {
        for (let i = indexAtual + 1; i < laudos.length; i++) {
            if (
                laudos[i].item_pedido.exame.id_exame === laudoAtual.item_pedido.exame.id_exame &&
                laudos[i].status === 'Liberado'
            ) {
                return laudos[i];
            }
        }
        return null;
    };

    /**
     * RENDERIZAÇÃO DINÂMICA DE RESULTADOS COM DELTA
     */
    const renderizarLinhasResultado = (currentResult: any, previousResult: any | null) => {
        if (!currentResult || typeof currentResult !== 'object') return null;

        return Object.keys(currentResult).map((key) => {
            // Pula campos de controle interno e antibiogramas
            if (key === 'antibiograma' || key === 'observacao_clinica' || key === 'metodo') return null;
            if (currentResult[key] === null || currentResult[key] === '') return null;

            // Busca o nome amigável ou formata a chave original dinamicamente para exames novos
            const label = nomesAmigaveis[key] || key.replace(/_/g, ' ').toUpperCase();
            const value = currentResult[key];
            const prevValue = previousResult ? previousResult[key] : null;

            const currentNum = parseFloat(String(value).replace(',', '.'));
            const previousNum = prevValue ? parseFloat(String(prevValue).replace(',', '.')) : null;

            let deltaHtml = null;

            if (!isNaN(currentNum) && previousNum !== null && !isNaN(previousNum)) {
                const diff = currentNum - previousNum;
                const percentage = previousNum !== 0 ? ((Math.abs(diff) / previousNum) * 100).toFixed(1) : "0";
                
                // Setas indicativas com cores neutras (Azul Metálico) para não indicar saúde/doença
                if (diff > 0) {
                    deltaHtml = <span className="text-[#1f547e] font-black text-[10px] bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-100 shadow-sm" title={`Aumento de ${percentage}%`}>⬆️ Subiu {diff.toFixed(2)}</span>;
                } else if (diff < 0) {
                    deltaHtml = <span className="text-[#1f547e] font-black text-[10px] bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-100 shadow-sm" title={`Queda de ${percentage}%`}>⬇️ Caiu {Math.abs(diff).toFixed(2)}</span>;
                } else {
                    deltaHtml = <span className="text-slate-400 text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg" title="Sem alteração">(=) Manteve</span>;
                }
            } else if (prevValue && prevValue !== value) {
                 deltaHtml = <span className="text-[#1f547e] font-black text-[10px] bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-100 shadow-sm">ALTERADO</span>;
            }

            return (
                <div key={key} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors px-4 rounded-xl group gap-3">
                    <span className="text-xs font-black text-slate-500 group-hover:text-[#1f547e] transition-colors uppercase tracking-widest">{label}</span>
                    
                    <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 w-full sm:w-auto">
                        
                        {/* Mostra o valor ANTIGO para contexto visual (se existir e for diferente) */}
                        {prevValue && prevValue !== value && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200" title="Resultado Anterior">
                                    {prevValue}
                                </span>
                                <span className="text-slate-300 font-bold">➔</span>
                            </div>
                        )}
                        
                        {/* Mostra o valor ATUAL em destaque */}
                        <span className="font-black text-[#1f547e] text-sm bg-blue-50 px-3 py-1.5 rounded-lg border border-[#1f547e]/20 shadow-sm">
                            {value}
                        </span>

                        {/* Mostra a setinha de diferença */}
                        {deltaHtml && (
                            <div className="ml-1">
                                {deltaHtml}
                            </div>
                        )}
                    </div>
                </div>
            );
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
                    <h2 className="font-black text-2xl text-[#1f547e] tracking-tight">Linha do Tempo</h2>
                </div>
            }
        >
            <Head title="AstraLab - Meu Histórico" />

            <div className="py-12 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* CABEÇALHO DA TELA */}
                    <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl text-[#1f547e] border border-[#1f547e]/20 shadow-inner">📈</div>
                            <div>
                                <h3 className="font-black text-slate-800 text-lg leading-tight">Histórico de Resultados</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Evolução Clínica e Comparativa</p>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 px-6 py-2 rounded-2xl shadow-sm text-center">
                            <span className="text-[#15803d] font-black text-xs uppercase tracking-widest">{laudos.length} Registros Encontrados</span>
                        </div>
                    </div>

                    {/* AVISO MÉDICO (DISCLAIMER) PARA O PACIENTE */}
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-col sm:flex-row gap-5 shadow-sm">
                        <div className="text-3xl sm:text-4xl drop-shadow-sm">⚠️</div>
                        <div className="leading-relaxed">
                            <h4 className="font-black text-amber-900 uppercase tracking-widest text-xs mb-2">Aviso Médico Importante</h4>
                            <p className="text-sm text-amber-800 font-medium">
                                A linha do tempo abaixo mostra a evolução matemática dos seus exames. As setas de variação (<span className="font-black text-[#1f547e]">⬆️ Subiu</span> / <span className="font-black text-[#1f547e]">⬇️ Caiu</span>) <strong>são meramente ilustrativas</strong> em relação à sua coleta anterior. <br/><br/>Um aumento ou queda de um valor não significa, necessariamente, uma piora ou melhora da sua saúde. <strong>Apenas um médico especialista pode interpretar estes resultados de forma correta e realizar um diagnóstico.</strong> Nunca tome decisões médicas baseadas apenas nesta tela.
                            </p>
                        </div>
                    </div>

                    {/* ESTRUTURA VISUAL DA LINHA DO TEMPO */}
                    <div className="relative space-y-10 before:absolute before:inset-0 before:left-7 before:h-full before:w-1 before:bg-slate-200 before:content-['']">
                        
                        {laudos.length === 0 ? (
                            <div className="relative pl-16 py-10">
                                <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center shadow-sm">
                                    <span className="text-6xl block mb-6 opacity-20 text-[#1f547e]">🔬</span>
                                    <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">Nenhum Laudo Encontrado</h4>
                                    <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Você ainda não possui exames realizados ou liberados em nosso sistema.</p>
                                </div>
                            </div>
                        ) : (
                            laudos.map((laudo, index) => {
                                const isLiberado = laudo.status === 'Liberado';
                                const laudoAnterior = isLiberado ? buscarLaudoAnterior(laudo, index) : null;
                                const isExpanded = expandedLaudo === laudo.id_laudo;

                                return (
                                    <div key={laudo.id_laudo} className="relative pl-16 group">
                                        {/* PONTO NA LINHA DO TEMPO */}
                                        <div className={`absolute left-4 top-6 w-7 h-7 rounded-full border-4 border-[#F0F4F8] shadow-md transition-all duration-500 flex items-center justify-center ${isExpanded ? 'bg-[#1f547e] scale-125' : (isLiberado ? 'bg-white group-hover:bg-blue-50' : 'bg-slate-200')} z-10`}>
                                            <div className={`w-2 h-2 rounded-full ${isExpanded ? 'bg-white' : (isLiberado ? 'bg-[#1f547e] group-hover:bg-[#1f547e]' : 'bg-slate-400')}`}></div>
                                        </div>
                                        
                                        {/* CARD DO LAUDO */}
                                        <div className={`bg-white rounded-[2.5rem] shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-[#1f547e]/30 shadow-xl shadow-blue-900/5' : 'border-slate-200 hover:shadow-md'} ${!isLiberado ? 'opacity-80' : ''}`}>
                                            <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                        <span className="text-sm font-black text-[#1f547e] uppercase tracking-tighter">{laudo.item_pedido.exame.nome_exame}</span>
                                                        
                                                        {isLiberado ? (
                                                            <span className="text-[9px] bg-green-100 border border-green-200 text-[#15803d] px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm">Liberado</span>
                                                        ) : (
                                                            <span className="text-[9px] bg-amber-100 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md font-black uppercase tracking-widest shadow-sm">Em Análise</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4">
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Protocolo: <span className="text-slate-600 font-mono">{laudo.item_pedido.pedido.protocolo}</span></p>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Atualizado: <span className="text-slate-600">{formatarData(laudo.data_resultado)}</span></p>
                                                    </div>
                                                </div>
                                                
                                                {/* BOTÃO DE EXPANDIR */}
                                                {isLiberado ? (
                                                    <button 
                                                        onClick={() => setExpandedLaudo(isExpanded ? null : laudo.id_laudo)}
                                                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${isExpanded ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-[#1f547e] text-white hover:bg-[#163e5e] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/20'}`}
                                                    >
                                                        {isExpanded ? 'Ocultar' : 'Comparar Resultados'}
                                                    </button>
                                                ) : (
                                                    <div className="px-6 py-3.5 rounded-2xl text-[9px] bg-slate-100 text-slate-400 font-black uppercase tracking-widest border border-slate-200 flex items-center gap-2 cursor-not-allowed">
                                                        <span>🔒</span> Aguardando Validação
                                                    </div>
                                                )}
                                            </div>

                                            {/* ÁREA EXPANDIDA (Detalhes e Comparação) */}
                                            {isExpanded && isLiberado && (
                                                <div className="p-8 bg-slate-50 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
                                                    
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                                        <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-[0.2em] border-l-4 border-[#1f547e] pl-3">Análise Detalhada</h4>
                                                        {laudoAnterior && (
                                                            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
                                                                <span className="text-lg">⚖️</span>
                                                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                                                    Comparando com: <span className="text-[#1f547e]">{formatarData(laudoAnterior.data_resultado)}</span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
                                                        {renderizarLinhasResultado(laudo.resultado, laudoAnterior?.resultado)}
                                                    </div>

                                                    {/* EXIBIÇÃO DE OBSERVAÇÃO DO BIOMÉDICO SE HOUVER */}
                                                    {laudo.observacao && (
                                                        <div className="mb-6 bg-blue-50/50 border border-blue-100 p-5 rounded-2xl shadow-sm">
                                                            <h5 className="text-[10px] font-black uppercase text-[#1f547e] tracking-widest mb-1 flex items-center gap-2">
                                                                <span>ℹ️</span> Nota do Laboratório
                                                            </h5>
                                                            <p className="text-xs font-medium text-slate-700">{laudo.observacao}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-center border-t border-slate-200 pt-8 mt-4">
                                                        {/* ROTA DE DOWNLOAD COM DESIGN FORTE E CLARO */}
                                                        <a href={route('paciente.laudo.download', { id_laudo: laudo.id_laudo })}
                                                           target="_blank"
                                                           className="px-8 py-4 bg-[#15803d] border border-green-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-green-800 hover:-translate-y-0.5 transition-all flex items-center gap-3 shadow-lg shadow-green-700/30">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                            Baixar Laudo Oficial em PDF
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}