import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

export default function FilaCorrecoes({ auth, pedidosCorrecao }: PageProps & { pedidosCorrecao: any[] }) {
    const [exameSelecionado, setExameSelecionado] = useState<any | null>(null);
    
    const { data, setData, post, processing, reset } = useForm({
        id_item: '',
        resultado: {} as any,
        observacao: ''
    });

    const abrirCorrecao = (item: any, protocolo: string, paciente: string) => {
        setExameSelecionado({ ...item, protocolo, paciente });
        
        // SUPER LIMPADOR DE JSON: Força a descompactação mesmo se estiver duplamente "sujo" no banco
        let resLimpo = item.resultado_anterior;
        while (typeof resLimpo === 'string') {
            try {
                const parsed = JSON.parse(resLimpo);
                if (parsed === resLimpo) break;
                resLimpo = parsed;
            } catch(e) { 
                break; 
            }
        }

        // Se por acaso ainda não for um objeto válido, cria um vazio para não quebrar a tela
        if (typeof resLimpo !== 'object' || resLimpo === null) {
            resLimpo = {};
        }

        setData({
            id_item: item.id_item,
            resultado: resLimpo,
            observacao: item.observacao_anterior || ''
        });
    };

    // =========================================================
    // MOTOR DE VALIDAÇÃO EM TEMPO REAL PARA O ALUNO (Tarjas)
    // =========================================================
    const getInputClass = (nomeCampo: string, valor: any) => {
        const baseClass = "w-full bg-white border focus:ring-0 rounded-xl px-4 py-3 font-bold shadow-sm transition-all ";
        if (!valor || valor === '') return baseClass + "border-slate-200 text-slate-800 focus:border-red-400";
        
        let isAlert = false;
        if (exameSelecionado && exameSelecionado.referencias) {
            const numValor = parseFloat(valor.toString().replace(',', '.'));
            if (!isNaN(numValor)) {
                const refs = exameSelecionado.referencias;
                if (refs.json && refs.json.startsWith('{')) {
                    try {
                        const parsedJson = JSON.parse(refs.json);
                        if (parsedJson[nomeCampo]) {
                            const min = parsedJson[nomeCampo].min !== undefined ? parseFloat(parsedJson[nomeCampo].min) : -Infinity;
                            const max = parsedJson[nomeCampo].max !== undefined ? parseFloat(parsedJson[nomeCampo].max) : Infinity;
                            if (numValor < min || numValor > max) isAlert = true;
                        }
                    } catch(e) {}
                } else if (refs.min !== null || refs.max !== null) {
                    const min = refs.min !== null ? parseFloat(refs.min as any) : -Infinity;
                    const max = refs.max !== null ? parseFloat(refs.max as any) : Infinity;
                    if (numValor < min || numValor > max) isAlert = true;
                }
            }
        }

        if (isAlert) return baseClass + "border-red-500 bg-red-50 text-red-900 focus:border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
        return baseClass + "border-green-400 bg-green-50 text-green-900 focus:border-green-600";
    };

    const temAlertaGeral = Object.keys(data.resultado).some(campo => {
        const classNames = getInputClass(campo, data.resultado[campo]);
        return classNames.includes('border-red-500');
    });

    const handleInputChange = (chave: string, valor: string) => {
        setData('resultado', { ...data.resultado, [chave]: valor });
    };

    const reenviarLaudo = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Deseja salvar estas correções e reenviar o laudo para a revisão do Professor?')) {
            post(route('tecnico.laudo.store'), {
                onSuccess: () => {
                    setExameSelecionado(null);
                    reset();
                }
            });
        }
    };

    const nomesAmigaveis: Record<string, string> = {
        hemacias: 'Hemácias', hemoglobina: 'Hemoglobina', hematocrito: 'Hematócrito', vcm: 'VCM', hcm: 'HCM', chcm: 'CHCM', rdw: 'RDW',
        leucocitos_totais: 'Leucócitos Totais', neu_rel: 'Neutrófilos (%)', neu_abs: 'Neutrófilos (Abs)', lin_rel: 'Linfócitos (%)', lin_abs: 'Linfócitos (Abs)', mon_rel: 'Monócitos (%)', mon_abs: 'Monócitos (Abs)', eos_rel: 'Eosinófilos (%)', eos_abs: 'Eosinófilos (Abs)', baso_rel: 'Basófilos (%)', baso_abs: 'Basófilos (Abs)',
        plaquetas: 'Plaquetas Totais', glicemia: 'Glicemia em Jejum', glicose: 'Glicose', colesterol_total: 'Colesterol Total', hdl: 'HDL (Colesterol Bom)', ldl: 'LDL (Colesterol Ruim)', vldl: 'VLDL', triglicerideos: 'Triglicerídeos', acido_urico: 'Ácido Úrico'
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link href={route('tecnico.dashboard')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-red-700 hover:border-red-300 hover:bg-red-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm group">
                        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Voltar ao Painel
                    </Link>
                    <h2 className="font-black text-2xl text-red-950 tracking-tight">Fila de Correções</h2>
                </div>
            }
        >
            <Head title="AstraLab - Correções Pendentes" />
            
            <div className="py-12 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {!exameSelecionado ? (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-t-8 border-red-500">
                            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-red-200 text-red-600 animate-pulse">⚠️</div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-xl leading-tight">Laudos Recusados</h3>
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Estes laudos precisam da sua correção urgente</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pedidosCorrecao.flatMap(pedido => 
                                    pedido.itens.map((item: any) => (
                                        <div key={item.id_item} className="p-6 rounded-[1.5rem] border-2 bg-red-50/30 border-red-200 cursor-pointer hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-1 transition-all group" onClick={() => abrirCorrecao(item, pedido.protocolo, pedido.paciente)}>
                                            
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest border bg-red-100 text-red-800 border-red-200">
                                                    RECUSADO ❌
                                                </span>
                                                <span className="text-xs font-mono font-bold text-red-700">{pedido.protocolo}</span>
                                            </div>
                                            
                                            <h4 className="font-black text-slate-800 text-lg mb-2 truncate group-hover:text-red-700 transition-colors">{item.nome_exame}</h4>
                                            
                                            <div className="mt-4 flex items-center gap-2 pt-4 border-t border-red-100">
                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-600">
                                                    {pedido.paciente.charAt(0)}
                                                </div>
                                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide truncate">
                                                    {pedido.paciente}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                {pedidosCorrecao.length === 0 && (
                                    <div className="col-span-full py-16 text-center">
                                        <span className="text-5xl opacity-20 block mb-4 text-green-600">✅</span>
                                        <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">Nenhuma correção pendente!</h4>
                                        <p className="text-slate-400 text-sm mt-2">Excelente trabalho. Sua fila de correções está limpa.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-t-8 border-red-500 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                            <button onClick={() => setExameSelecionado(null)} className="absolute top-8 right-8 text-slate-400 hover:text-red-600 font-black text-xs uppercase tracking-widest bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-colors hover:bg-red-50">
                                Cancelar Correção X
                            </button>

                            <div className="mb-8 pr-24">
                                <h3 className="text-3xl font-black text-red-950 tracking-tight mb-2">Corrigir: {exameSelecionado.nome_exame}</h3>
                                <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">
                                    <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">PCT: <span className="text-slate-700">{exameSelecionado.paciente}</span></span>
                                    <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">OS: <span className="text-slate-700">{exameSelecionado.protocolo}</span></span>
                                </div>
                            </div>

                            <div className="mb-8 p-5 bg-red-50 rounded-2xl border border-red-200 flex gap-4">
                                <span className="text-3xl">🛑</span>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase text-red-800 tracking-widest mb-1">Atenção na Revisão</h4>
                                    <p className="text-sm font-bold text-red-600">Por favor, revise os valores abaixo. O Professor identificou inconsistências e recusou a liberação.</p>
                                </div>
                            </div>

                            {/* TARJA VERMELHA GLOBAL DE AVISO (Aparece se houver erro digitado na tela de correção) */}
                            {temAlertaGeral && (
                                <div className="mb-8 p-5 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-4 animate-in slide-in-from-top-4 relative z-10 border border-red-700">
                                    <span className="text-3xl animate-pulse">⚠️</span>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-widest">Atenção Crítica: Valores Fora da Referência</h4>
                                        <p className="text-xs font-medium text-red-100 mt-1">
                                            Você está a digitar resultados que excedem os limites biológicos. Justifique obrigatoriamente nas Observações Clínicas abaixo.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={reenviarLaudo}>
                                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 mb-8 shadow-sm">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Revisão de Parâmetros Lançados</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                        {Object.keys(data.resultado).map((key) => {
                                            if (key === 'antibiograma' || key === 'metodo') return null;
                                            
                                            const label = nomesAmigaveis[key] || key.replace(/_/g, ' ').toUpperCase();
                                            
                                            return (
                                                <div key={key} className="flex flex-col mb-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1">{label}</label>
                                                    <input 
                                                        type="text" 
                                                        value={data.resultado[key] || ''} 
                                                        onChange={(e) => handleInputChange(key, e.target.value)}
                                                        className={getInputClass(key, data.resultado[key])}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1 flex items-center gap-2">
                                        <span>📝</span> Observação Clínica / Justificativa
                                        {temAlertaGeral && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[9px]">Obrigatório para justificar a tarja</span>}
                                    </label>
                                    <textarea 
                                        value={data.observacao}
                                        onChange={(e) => setData('observacao', e.target.value)}
                                        className={`w-full border-2 border-dashed rounded-2xl px-5 py-4 font-medium text-sm transition-all h-24 resize-none ${temAlertaGeral && !data.observacao ? 'border-red-400 bg-red-50 focus:border-red-600 text-red-900' : 'bg-white border-slate-300 text-slate-700 focus:border-cyan-500'}`}
                                        placeholder="Se necessário, justifique a alteração dos valores para o Professor..."
                                        required={temAlertaGeral}
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={processing} 
                                        className="px-8 py-4 bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-800 transition-all shadow-lg shadow-red-700/20 flex items-center gap-3 hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        <span className="text-base">📤</span> Salvar e Reenviar p/ Professor
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}