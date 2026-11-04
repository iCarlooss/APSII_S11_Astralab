import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

export default function ValidacaoLaudos({ auth, laudosPendentes }: PageProps & { laudosPendentes: any[] }) {
    const [laudoSelecionado, setLaudoSelecionado] = useState<any | null>(null);
    const { patch, processing } = useForm();

    const isProfessor = auth.user.tipo_usuario === 'Professor';
    const isAdmin = auth.user.tipo_usuario === 'Administrador';

    const aprovar = (id: number) => {
        const msg = isAdmin 
            ? 'Tem certeza que deseja assinar eletronicamente e liberar este laudo para o paciente?'
            : 'Deseja assinar a parte clínica e enviar para a SUPERVISÃO FINAL do Administrador?';

        if (confirm(msg)) {
            patch(route('admin.validacao.aprovar', id), {
                onSuccess: () => setLaudoSelecionado(null),
            });
        }
    };

    const devolver = (id: number) => {
        const msg = isAdmin
            ? 'Isto irá devolver o laudo para a fila do PROFESSOR revisar novamente. Confirmar Devolução?'
            : 'Isto irá devolver o laudo para a fila do ALUNO corrigir. Confirmar Devolução?';

        if (confirm(msg)) {
            patch(route('admin.validacao.recusar', id), {
                onSuccess: () => setLaudoSelecionado(null),
            });
        }
    };

    const revogar = (id: number) => {
        if (confirm('ATENÇÃO: Isto irá retirar o laudo do portal do paciente e devolvê-lo para a fila de correção. Confirmar?')) {
            patch(route('admin.validacao.revogar', id), {
                onSuccess: () => setLaudoSelecionado(null),
            });
        }
    };

    // MOTOR DE ALERTA DO PROFESSOR (SUPER LIMPADOR DE JSON + CÁLCULO SEGURO)
    const renderResultados = (resultado: any, limitesExame: any) => {
        if (!resultado) return <p className="text-slate-400 italic text-sm">Sem resultados preenchidos.</p>;
        
        let objResultado = resultado;
        
        // Descompacta as camadas do JSON sujo do banco de testes
        while (typeof objResultado === 'string') {
            try {
                const parsed = JSON.parse(objResultado);
                if (parsed === objResultado) break;
                objResultado = parsed;
            } catch(e) { 
                break; 
            }
        }

        if (typeof objResultado !== 'object' || objResultado === null) {
            return <p className="font-bold text-slate-800 text-sm whitespace-pre-wrap">{String(resultado)}</p>;
        }

        let referenciasMultiplas: any = null;
        if (limitesExame?.ref_texto && typeof limitesExame.ref_texto === 'string' && limitesExame.ref_texto.trim().startsWith('{')) {
             try { referenciasMultiplas = JSON.parse(limitesExame.ref_texto); } catch (e) {}
        }

        // Função de blindagem matemática: Lê números do banco que podem ter vírgulas ou estar nulos
        const getLimite = (valor: any) => {
            if (valor === null || valor === undefined || valor === '') return null;
            const parsed = parseFloat(valor.toString().replace(',', '.'));
            return isNaN(parsed) ? null : parsed;
        };

        const refMinSimples = getLimite(limitesExame?.ref_min);
        const refMaxSimples = getLimite(limitesExame?.ref_max);

        return Object.keys(objResultado).map((key) => {
            if (key === 'antibiograma' || key === 'observacao_clinica' || key === 'metodo') return null;
            
            const val = objResultado[key];
            let isAlert = false;
            let textoReferencia = '';

            // Limpa o valor digitado pelo aluno para verificar se é um número
            const numericVal = parseFloat(val?.toString().replace(',', '.'));

            // SE O EXAME FOR UM PAINEL (LÊ DO JSON)
            if (referenciasMultiplas && referenciasMultiplas[key]) {
                const refItem = referenciasMultiplas[key];
                textoReferencia = refItem.texto || '';
                
                const min = getLimite(refItem.min);
                const max = getLimite(refItem.max);
                
                if (!isNaN(numericVal)) {
                    if (min !== null && numericVal < min) isAlert = true;
                    if (max !== null && numericVal > max) isAlert = true;
                }
            } 
            // SE O EXAME FOR SIMPLES (LÊ DO ref_min E ref_max DIRETO DO BANCO)
            else if (!referenciasMultiplas && val !== null && val !== undefined && val !== '') {
                 textoReferencia = limitesExame?.ref_texto || '';
                 
                 // Se o admin não digitou um texto base, criamos um formato bonitinho com os limites
                 if (!textoReferencia) {
                     if (refMinSimples !== null && refMaxSimples !== null) textoReferencia = `${refMinSimples} a ${refMaxSimples}`;
                     else if (refMinSimples !== null) textoReferencia = `> ${refMinSimples}`;
                     else if (refMaxSimples !== null) textoReferencia = `< ${refMaxSimples}`;
                 }

                 // Validação de disparo do Alerta (Tarja Vermelha)
                 if (!isNaN(numericVal)) {
                     if (refMinSimples !== null && numericVal < refMinSimples) isAlert = true;
                     if (refMaxSimples !== null && numericVal > refMaxSimples) isAlert = true;
                 }
            }

            const nomesAmigaveis: Record<string, string> = {
                hemacias: 'Hemácias', hemoglobina: 'Hemoglobina', hematocrito: 'Hematócrito',
                vcm: 'VCM', hcm: 'HCM', chcm: 'CHCM', rdw: 'RDW',
                leucocitos_totais: 'Leucócitos Totais', neu_rel: 'Neutrófilos (%)', neu_abs: 'Neutrófilos (Abs)',
                lin_rel: 'Linfócitos (%)', lin_abs: 'Linfócitos (Abs)', mon_rel: 'Monócitos (%)', mon_abs: 'Monócitos (Abs)',
                eos_rel: 'Eosinófilos (%)', eos_abs: 'Eosinófilos (Abs)', baso_rel: 'Basófilos (%)', baso_abs: 'Basófilos (Abs)',
                plaquetas: 'Plaquetas Totais', glicemia: 'Glicemia em Jejum', glicose: 'Glicose',
                colesterol_total: 'Colesterol Total', hdl: 'HDL (Colesterol Bom)', ldl: 'LDL (Colesterol Ruim)', vldl: 'VLDL',
                triglicerideos: 'Triglicerídeos', acido_urico: 'Ácido Úrico'
            };

            const labelAmigavel = nomesAmigaveis[key] || key.replace(/_/g, ' ').toUpperCase();

            return (
                <div key={key} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-5 border-b last:border-0 rounded-2xl transition-all mb-2 ${
                    isAlert ? 'bg-red-50 border-2 border-red-200 shadow-sm' : 'bg-slate-50 border border-slate-100 hover:bg-white'
                }`}>
                    <span className={`text-[11px] font-black uppercase tracking-widest w-full sm:w-1/3 mb-1 sm:mb-0 ${isAlert ? 'text-red-800' : 'text-slate-500'}`}>
                        {labelAmigavel}
                    </span>
                    
                    <span className="w-full sm:w-1/3 text-left sm:text-center text-[11px] font-medium text-slate-400 italic mb-1 sm:mb-0">
                        {textoReferencia ? `Ref: ${textoReferencia}` : ''}
                    </span>

                    <span className={`font-black w-full sm:w-1/3 text-left sm:text-right flex items-center sm:justify-end gap-2 ${isAlert ? 'text-red-600 text-xl' : 'text-blue-900 text-lg'}`}>
                        {isAlert && <span className="text-2xl animate-pulse" title="Atenção: Fora da referência!">⚠️</span>}
                        {val}
                    </span>
                </div>
            );
        });
    };

    const rotaVoltar = isProfessor ? route('professor.dashboard') : route('admin.dashboard');

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link href={rotaVoltar} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-800 hover:border-blue-300 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm group">
                        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Voltar
                    </Link>
                    <h2 className="font-black text-2xl text-blue-950 tracking-tight">Validação de Laudos</h2>
                </div>
            }
        >
            <Head title="AstraLab - Validação" />
            
            <div className="py-12 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {!laudoSelecionado ? (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-indigo-200 text-indigo-700">🧑‍🏫</div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-xl leading-tight">Fila de Correção</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {isAdmin ? 'Aguardando Liberação Final' : 'Aguardando Validação Clínica'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {laudosPendentes.map(laudo => (
                                    <div key={laudo.id_laudo} className={`p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer shadow-sm hover:-translate-y-1 flex flex-col justify-between ${laudo.status === 'Liberado' ? 'bg-green-50 border-green-200 hover:shadow-green-500/20' : 'bg-slate-50 border-slate-200 hover:shadow-indigo-500/20 hover:border-indigo-300'}`} onClick={() => setLaudoSelecionado(laudo)}>
                                        
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-md uppercase tracking-widest border ${
                                                    laudo.status === 'Liberado' ? 'bg-green-100 text-green-800 border-green-200' : 
                                                    laudo.status === 'Devolvido_Supervisor' ? 'bg-red-100 text-red-800 border-red-200 animate-pulse' :
                                                    'bg-indigo-100 text-indigo-800 border-indigo-200'
                                                }`}>
                                                    {laudo.status === 'Liberado' ? 'Já Liberado ✅' : 
                                                     laudo.status === 'Devolvido_Supervisor' ? 'RECUSADO PELO ADMIN ❌' : 
                                                     'Para Revisão ⏳'}
                                                </span>
                                            </div>
                                            
                                            <h4 className="font-black text-slate-800 text-lg mb-1 truncate group-hover:text-blue-900 transition-colors">{laudo.item_pedido?.exame?.nome_exame}</h4>
                                            
                                            <div className="mt-3 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-300">
                                                    {laudo.item_pedido?.pedido?.paciente?.utilizador?.name?.charAt(0) || '?'}
                                                </div>
                                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide truncate">
                                                    {laudo.item_pedido?.pedido?.paciente?.utilizador?.name || 'Paciente Não Identificado'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-200/60 pt-4 mt-6">
                                            <span>Por: {laudo.digitador?.name?.split(' ')[0] || 'Aluno'}</span>
                                            <span className="bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-500">OS: {laudo.item_pedido?.pedido?.protocolo}</span>
                                        </div>
                                    </div>
                                ))}
                                {laudosPendentes.length === 0 && (
                                    <div className="col-span-full py-12 text-center">
                                        <span className="text-4xl opacity-20 block mb-2 text-blue-900">🎉</span>
                                        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Nenhum laudo pendente de correção.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                            <button onClick={() => setLaudoSelecionado(null)} className="absolute top-8 right-8 text-slate-400 hover:text-red-600 font-black text-xs uppercase tracking-widest bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl transition-colors hover:bg-red-50">
                                Fechar X
                            </button>

                            <div className="mb-10 pr-24">
                                <h3 className="text-3xl font-black text-blue-950 tracking-tight mb-2">{laudoSelecionado.item_pedido?.exame?.nome_exame}</h3>
                                <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">
                                    <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">PCT: <span className="text-slate-700">{laudoSelecionado.item_pedido?.pedido?.paciente?.utilizador?.name}</span></span>
                                    <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">OS: <span className="text-slate-700">{laudoSelecionado.item_pedido?.pedido?.protocolo}</span></span>
                                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">Digitado por: {laudoSelecionado.digitador?.name}</span>
                                </div>
                            </div>

                            {laudoSelecionado.status === 'Devolvido_Supervisor' && isProfessor && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                                    <span className="text-xl animate-pulse">🛑</span>
                                    <div>
                                        <span className="block text-[10px] font-black text-red-800 uppercase tracking-widest">Laudo Recusado pela Administração</span>
                                        <span className="text-sm font-bold text-red-600">Verifique os valores ou devolva ao aluno para correção antes de re-enviar.</span>
                                    </div>
                                </div>
                            )}

                            {laudoSelecionado.resultado?.metodo && (
                                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                                    <span className="text-xl">🧪</span>
                                    <div>
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Análise Utilizado</span>
                                        <span className="text-sm font-bold text-slate-700">{laudoSelecionado.resultado.metodo}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mb-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-200">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2">Valores Lançados pelo Aluno</h4>
                                {renderResultados(laudoSelecionado.resultado, laudoSelecionado.item_pedido?.exame)}
                            </div>

                            {(laudoSelecionado.observacao || laudoSelecionado.item_pedido?.pedido?.observacao_clinica) && (
                                <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {laudoSelecionado.item_pedido?.pedido?.observacao_clinica && (
                                        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-sm font-medium text-blue-800">
                                            <span className="block text-[10px] font-black uppercase tracking-widest mb-2 text-blue-600 flex items-center gap-2">
                                                <span>ℹ️</span> Condição do Paciente (Recepção)
                                            </span>
                                            {laudoSelecionado.item_pedido.pedido.observacao_clinica}
                                        </div>
                                    )}
                                    
                                    {laudoSelecionado.observacao && (
                                        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 text-sm font-medium text-amber-800">
                                            <span className="block text-[10px] font-black uppercase tracking-widest mb-2 text-amber-600 flex items-center gap-2">
                                                <span>⚠️</span> Nota do Digitador (Bancada)
                                            </span>
                                            {laudoSelecionado.observacao}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                                {laudoSelecionado.status === 'Liberado' ? (
                                    <button onClick={() => revogar(laudoSelecionado.id_laudo)} disabled={processing} className="w-full py-4 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-sm flex justify-center items-center gap-2 border border-amber-200">
                                        <span className="text-base">⚠️</span> Revogar Liberação
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => aprovar(laudoSelecionado.id_laudo)} disabled={processing} className="w-full sm:w-2/3 py-4 bg-green-700 text-white hover:bg-green-800 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-green-700/20 flex justify-center items-center gap-2 hover:-translate-y-0.5">
                                            <span className="text-base">{isAdmin ? '✅' : '📤'}</span> 
                                            {isAdmin ? 'Assinar e Liberar Laudo Oficial' : 'Validar Clínica e Enviar Supervisão'}
                                        </button>
                                        
                                        <button onClick={() => devolver(laudoSelecionado.id_laudo)} disabled={processing} className="w-full sm:w-1/3 py-4 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex justify-center items-center gap-2">
                                            <span className="text-base">🔙</span> 
                                            {isAdmin ? 'Devolver p/ Professor' : 'Devolver p/ Aluno'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}