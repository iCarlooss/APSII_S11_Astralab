import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PageProps } from '@/types';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface ItemExame {
    id_item: number;
    nome_exame: string;
    referencias: {
        min: number | null;
        max: number | null;
        json: string | null;
    };
}

interface PedidoPendente {
    id_pedido: number;
    protocolo: string;
    paciente: string;
    sexo: string; // <-- LER O SEXO E ESCOLHER A REFERÊNCIA M/F
    data: string;
    itens: ItemExame[];
}

export default function FilaExames({ auth, pedidosPendentes = [] }: PageProps & { pedidosPendentes: PedidoPendente[] }) {
    const { flash } = usePage().props as any;
    const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoPendente | null>(null);
    const [exameEmPreenchimento, setExameEmPreenchimento] = useState<ItemExame | null>(null);
    const [busca, setBusca] = useState('');
    
    // ESTADO PARA GERENCIAR QUAL TICKET VAMOS IMPRIMIR
    const [ticketParaImprimir, setTicketParaImprimir] = useState<PedidoPendente | null>(null);

    // Identificação de papéis (Hierarquia Tripla)
    const isProfessor = auth.user.tipo_usuario === 'Professor';
    const isAdmin = auth.user.tipo_usuario === 'Administrador';

    const { data, setData, post, processing, reset } = useForm({
        id_pedido: '',
        id_item: '',
        resultado: {} as any, 
        observacao: '',
    });

    useEffect(() => {
        if (pedidoSelecionado) {
            const pedidoAindaExiste = pedidosPendentes.find(p => p.id_pedido === pedidoSelecionado.id_pedido);
            if (!pedidoAindaExiste) {
                setPedidoSelecionado(null);
                setExameEmPreenchimento(null);
            } else {
                setPedidoSelecionado(pedidoAindaExiste);
            }
        }
    }, [pedidosPendentes]);

    const rotaVoltar = route('dashboard');

    const abrirPedido = (pedido: PedidoPendente) => {
        setPedidoSelecionado(pedido);
        setExameEmPreenchimento(null);
    };

    // =========================================================
    // INJEÇÃO AUTOMÁTICA DE MÉTODO E MATERIAL
    // =========================================================
    const iniciarPreenchimento = (item: ItemExame) => {
        setExameEmPreenchimento(item);
        
        let initialData: any = {};
        const nome = item.nome_exame.toLowerCase();
        const chaveGenerica = nome.replace(/ /g, '_');

        if (nome.includes('hemograma')) {
            initialData = { metodo: 'Automação - Citometria de Fluxo e Impedância', material: 'Sangue Total (EDTA)', leucocitos_totais: '', hemacias: '', hemoglobina: '', hematocrito: '' };
        } else if (nome.includes('cultura')) {
            initialData = { metodo: 'Cultura em meio Ágar e Antibiograma por Disco-Difusão', material: 'Urina (Jato Médio)', crescimento: 'Negativo', antibiograma: {} };
        } else if (nome.includes('urina')) {
            initialData = { metodo: 'Fita Reativa e Análise de Sedimento (Microscopia)', material: 'Urina (Jato Médio)', cor: 'Amarelo Citrino', aspecto: 'Límpido', glicose: 'Ausente', proteinas: 'Ausente' };
        } else if (nome.includes('parasit')) {
            initialData = { metodo: 'Hoffman, Pons e Janer', material: 'Fezes', cor_fezes: 'Castanho', consistencia: 'Pastosa', muco_fezes: 'Ausente', sangue_fezes: 'Ausente', protozoarios: 'Negativo', helmintos: 'Negativo' };
        } else if (nome.includes('tipagem')) {
            initialData = { metodo: 'Aglutinação Direta em Tubo', material: 'Sangue Total', abo: '', rh: '' };
        } else if (nome.includes('lipídico') || nome.includes('lipidico')) {
            initialData = { metodo: 'Enzimático Colorimétrico', material: 'Soro', colesterol_total: '', hdl: '', ldl: '', vldl: '', triglicerideos: '' };
        } else if (nome.includes('pcr') || nome.includes('proteína c') || nome.includes('proteina c')) {
            initialData = { metodo: 'Aglutinação em Látex', material: 'Soro', resultado_pcr: '' };
        } else if (nome.includes('glicemia') || nome.includes('glicose')) {
            initialData = { metodo: 'Enzimático Colorimétrico', material: 'Plasma Fluoretado', glicemia: '' };
        } else if (nome.includes('ácido úrico') || nome.includes('acido urico')) {
            initialData = { metodo: 'Enzimático Colorimétrico Trinder', material: 'Soro', acido_urico: '' };
        } else if (nome.includes('gravidez') || nome.includes('hcg')) {
            initialData = { metodo: 'Imunocromatografia', material: 'Soro', hcg: '' };
        } else if (nome.includes('sangue oculto')) {
            initialData = { metodo: 'Imunocromatografia', material: 'Fezes', sangue_oculto: '' };
        } else {
            initialData = { metodo: '', material: '', [chaveGenerica]: '' };
        }

        setData({
            id_pedido: pedidoSelecionado!.id_pedido.toString(),
            id_item: item.id_item.toString(),
            resultado: initialData,
            observacao: ''
        });
    };

    const fecharTudo = () => {
        setPedidoSelecionado(null);
        setExameEmPreenchimento(null);
        reset();
    };

    const atualizarCampoResultado = (campo: string, valor: any) => {
        setData('resultado', { ...data.resultado, [campo]: valor });
    };

    const atualizarAntibiograma = (antibiotico: string, sensibilidade: string) => {
        setData('resultado', {
            ...data.resultado,
            antibiograma: { ...data.resultado.antibiograma, [antibiotico]: sensibilidade }
        });
    };

    const salvarLaudoIndividual = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tecnico.laudo.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setExameEmPreenchimento(null);
            },
        });
    };

    const calcularPrevisao = (dataStr: string) => {
        try {
            const partes = dataStr.split('/');
            if(partes.length === 3) {
                const d = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
                d.setDate(d.getDate() + 5);
                return d.toLocaleDateString('pt-BR');
            }
        } catch(e) {}
        return "Prazo padrão (5 dias úteis)";
    };

    const pedidosFiltrados = pedidosPendentes.filter(p => 
        p.paciente.toLowerCase().includes(busca.toLowerCase()) || 
        p.protocolo.toLowerCase().includes(busca.toLowerCase())
    );

    const listaAntibioticos = ["Amicacina", "Ampicilina", "Amoxicilina + Clavulanato", "Cefalexina", "Ceftriaxona", "Cefepime", "Ciprofloxacino", "Norfloxacino", "Sulfametoxazol + Trimetoprim", "Piperacilina + Tazobactam", "Gentamicina", "Nitrofurantoína"];

    const labelClass = "block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest";
    const sectionClass = "bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-black text-cyan-950 uppercase tracking-widest mb-4 shadow-sm";

    const nomeExame = exameEmPreenchimento?.nome_exame.toLowerCase() || '';
    const isHemograma = nomeExame.includes('hemograma');
    const isUrina = nomeExame.includes('urina');
    const isCultura = nomeExame.includes('cultura');
    const isParasit = nomeExame.includes('parasit');
    const isTipagem = nomeExame.includes('tipagem');
    const isLipidico = nomeExame.includes('lipídico') || nomeExame.includes('lipidico');
    const isPCR = nomeExame.includes('pcr') || nomeExame.includes('proteína c') || nomeExame.includes('proteina c');
    const isGlicose = nomeExame.includes('glicemia') || nomeExame.includes('glicose');
    const isAcidoUrico = nomeExame.includes('ácido úrico') || nomeExame.includes('acido urico');
    const isGravidez = nomeExame.includes('gravidez') || nomeExame.includes('hcg');
    const isSangueOculto = nomeExame.includes('sangue oculto');
    const isGenerico = exameEmPreenchimento && !(isHemograma || isUrina || isCultura || isParasit || isTipagem || isLipidico || isPCR || isGlicose || isAcidoUrico || isGravidez || isSangueOculto);
    const chaveGenerica = nomeExame.replace(/ /g, '_');

    // =========================================================
    // MOTOR DE VALIDAÇÃO EM TEMPO REAL (Gera as cores dinâmicas)
    // =========================================================
    
    // CAPTURA O SEXO DO PACIENTE SELECIONADO
    const pacienteSexo = pedidoSelecionado?.sexo || 'M';

    const getInputClass = (nomeCampo: string, valor: any) => {
        const baseClass = "w-full border-2 rounded-xl focus:ring-0 p-3 font-bold transition-all ";
        
        if (!valor || valor === '') return baseClass + "border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:border-cyan-500";
        
        let isAlert = false;
        
        if (exameEmPreenchimento && exameEmPreenchimento.referencias) {
            const numValor = parseFloat(valor.toString().replace(',', '.'));
            
            if (!isNaN(numValor)) {
                const refs = exameEmPreenchimento.referencias;
                
                // Validação para Painéis (JSON)
                if (refs.json && refs.json.startsWith('{')) {
                    try {
                        const parsedJson = JSON.parse(refs.json);
                        let refItem = parsedJson[nomeCampo];

                        if (refItem) {
                            // A MÁGICA: Se o JSON tem divisão de sexo, ele entra no "M" ou "F" do paciente!
                            if (refItem[pacienteSexo]) {
                                refItem = refItem[pacienteSexo];
                            }

                            const min = refItem.min !== undefined ? parseFloat(refItem.min) : -Infinity;
                            const max = refItem.max !== undefined ? parseFloat(refItem.max) : Infinity;
                            if (numValor < min || numValor > max) isAlert = true;
                        }
                    } catch(e) {}
                } 
                // Validação para Exames Simples (Min / Max nativos)
                else if (refs.min !== null || refs.max !== null) {
                    const min = refs.min !== null ? parseFloat(refs.min as any) : -Infinity;
                    const max = refs.max !== null ? parseFloat(refs.max as any) : Infinity;
                    if (numValor < min || numValor > max) isAlert = true;
                }
            }
        }

        // Se estiver fora da referência, grita a Tarja Vermelha no Input!
        if (isAlert) {
            return baseClass + "border-red-400 bg-red-50 text-red-900 focus:border-red-600 focus:bg-red-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
        }
        
        // Se estiver dentro da referência, fica verdinho sucesso!
        return baseClass + "border-green-400 bg-green-50 text-green-900 focus:border-green-600";
    };

    // Verifica se existe QUALQUER campo em alerta para mostrar a Tarja Gigante no topo
    const temAlertaGeral = Object.keys(data.resultado).some(campo => {
        const classNames = getInputClass(campo, data.resultado[campo]);
        return classNames.includes('border-red-400');
    });

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center hide-on-print">
                    <Link href={rotaVoltar} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm group">
                        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Voltar
                    </Link>
                    <h2 className="font-black text-2xl text-cyan-950 tracking-tight">Fila de Produção</h2>
                </div>
            }
        >
            <Head title="AstraLab - Fila de Exames" />
            
            {/* CSS BLINDADO DE IMPRESSÃO */}
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body, #app, .min-h-screen { 
                        background-color: white !important; 
                        min-height: 0 !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    nav, header, footer { display: none !important; }
                    .hide-on-print { display: none !important; }
                    
                    .print-backdrop {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        background: transparent !important;
                        backdrop-filter: none !important;
                        display: block !important;
                        padding: 2cm !important;
                        margin: 0 !important;
                    }
                    
                    .print-area {
                        position: relative !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border: 1px dashed #cbd5e1 !important;
                        border-top: 8px solid #172554 !important; 
                        margin: 0 auto !important;
                        padding: 20px !important;
                        page-break-inside: avoid;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            <div className="py-12 bg-[#F0F4F8] min-h-screen hide-on-print">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {flash?.success && (
                        <div className="bg-green-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-4 shadow-lg shadow-green-600/20">
                            {flash.success}
                        </div>
                    )}

                    {!pedidoSelecionado ? (
                        <>
                            {/* TELA INICIAL: LISTA GERAL DE PEDIDOS PENDENTES */}
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner text-amber-600 border border-amber-200">⌛</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg leading-tight">Pedidos Pendentes</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aguardando digitação de resultados</p>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-96">
                                    <span className="absolute left-4 top-3.5 opacity-30">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar paciente ou protocolo..." 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-600 font-bold text-slate-600 transition-all text-sm shadow-inner"
                                        value={busca}
                                        onChange={e => setBusca(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden rounded-[2.5rem] shadow-sm border border-slate-200">
                                <div className="overflow-x-auto w-full pb-4">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                                <th className="p-6">Protocolo</th>
                                                <th className="p-6">Paciente</th>
                                                <th className="p-6 text-center">Exames</th>
                                                <th className="p-6">Data</th>
                                                <th className="p-6 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {pedidosFiltrados.map((pedido) => (
                                                <tr key={pedido.id_pedido} className="hover:bg-cyan-50/30 transition-colors group">
                                                    <td className="p-6 font-mono text-sm text-cyan-700 font-bold">{pedido.protocolo}</td>
                                                    <td className="p-6 font-black text-slate-800 uppercase group-hover:text-cyan-900 transition-colors">{pedido.paciente}</td>
                                                    <td className="p-6 text-center">
                                                        <span className="bg-amber-50 text-amber-600 border border-amber-200 font-black px-4 py-1.5 rounded-xl text-[10px] shadow-sm">
                                                            {pedido.itens.length} Pendentes
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-slate-500 text-xs font-bold">{pedido.data}</td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex justify-end gap-2 items-center">
                                                            <button 
                                                                onClick={() => setTicketParaImprimir(pedido)} 
                                                                title="Imprimir Ficha de Protocolo"
                                                                className="bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-950 hover:border-blue-950 hover:text-white px-4 py-3 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center"
                                                            >
                                                                🖨️
                                                            </button>
                                                            <button 
                                                                onClick={() => abrirPedido(pedido)} 
                                                                className="bg-cyan-700 text-white hover:bg-cyan-800 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md whitespace-nowrap hover:-translate-y-0.5"
                                                            >
                                                                Abrir Pedido
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {pedidosFiltrados.length === 0 && (
                                    <div className="p-20 text-center">
                                        <span className="text-5xl block mb-4 opacity-20 text-cyan-900">📭</span>
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Fila de espera vazia. Nenhum laudo pendente.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : !exameEmPreenchimento ? (
                        /* TELA SECUNDÁRIA: LISTA DE EXAMES DE UM PEDIDO ESPECÍFICO */
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 animate-in fade-in zoom-in duration-300">
                            <button onClick={fecharTudo} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-700 mb-6 transition-colors flex items-center gap-1">
                                <span className="text-lg leading-none">←</span> Voltar para a Fila Geral
                            </button>
                            <h3 className="text-2xl font-black text-cyan-950 mb-2">Exames de {pedidoSelecionado.paciente}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Protocolo: <span className="font-mono text-cyan-700">{pedidoSelecionado.protocolo}</span></p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pedidoSelecionado.itens.map((item) => (
                                    <div key={item.id_item} className="p-6 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 flex flex-col justify-between items-start hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group">
                                        <h4 className="text-sm font-black text-slate-800 mb-6 flex items-start gap-2 group-hover:text-cyan-900 transition-colors">
                                            <span className="text-cyan-600">🧪</span> {item.nome_exame}
                                        </h4>
                                        <button onClick={() => iniciarPreenchimento(item)} className="w-full py-3 bg-white border-2 border-slate-200 hover:border-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 text-slate-600 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all">
                                            Digitar Resultado
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* TELA TERCIÁRIA: FORMULÁRIO DE DIGITAÇÃO DO LAUDO */
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-cyan-200 animate-in slide-in-from-right-4 duration-300 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6 relative z-10">
                                <div>
                                    <h3 className="text-xl font-black text-cyan-950">{exameEmPreenchimento.nome_exame}</h3>
                                    <p className="text-cyan-700 text-[10px] font-black uppercase tracking-widest mt-1">Amostra: {pedidoSelecionado.paciente} | Protocolo: {pedidoSelecionado.protocolo}</p>
                                </div>
                                <button onClick={() => setExameEmPreenchimento(null)} className="text-3xl text-slate-400 hover:text-red-600 hover:bg-red-50 w-12 h-12 flex items-center justify-center rounded-full font-light transition-colors border border-transparent hover:border-red-200">&times;</button>
                            </div>

                            {/* TARJA VERMELHA GLOBAL DE AVISO */}
                            {temAlertaGeral && (
                                <div className="mb-8 p-5 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-4 animate-in slide-in-from-top-4 relative z-10 border border-red-700">
                                    <span className="text-3xl animate-pulse">⚠️</span>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-widest">Atenção Crítica: Valores Fora da Referência</h4>
                                        <p className="text-xs font-medium text-red-100 mt-1">
                                            Você digitou resultados que excedem os limites biológicos configurados. Verifique a digitação antes de salvar ou justifique nas Observações Clínicas.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={salvarLaudoIndividual} className="space-y-10 relative z-10">
                                
                                {/* 1. HEMOGRAMA */}
                                {isHemograma && (
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className={sectionClass}>Eritrograma (Série Vermelha)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {['hemacias', 'hemoglobina', 'hematocrito', 'vcm', 'hcm', 'chcm', 'rdw'].map(f => (
                                                    <div key={f}><label className={labelClass}>{f}</label><input type="number" step="0.01" className={getInputClass(f, data.resultado[f])} value={data.resultado[f] || ''} onChange={e => atualizarCampoResultado(f, e.target.value)} required /></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className={sectionClass}>Leucograma (Série Branca)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div className="col-span-full bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 flex justify-between items-center shadow-sm">
                                                    <label className="font-black text-cyan-950 text-xs uppercase tracking-widest">Leucócitos Totais (/mm³)</label>
                                                    <input type="number" className={`text-right w-32 p-3 ${getInputClass('leucocitos_totais', data.resultado.leucocitos_totais)}`} value={data.resultado.leucocitos_totais || ''} onChange={e => atualizarCampoResultado('leucocitos_totais', e.target.value)} required />
                                                </div>
                                                {['neu', 'bas', 'seg', 'lin', 'mon', 'eos', 'baso'].map(f => (
                                                    <div key={f} className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <label className="block text-[10px] font-black uppercase text-cyan-800 mb-2 tracking-widest">{f} (%)</label>
                                                        <input type="number" step="0.1" className={getInputClass(f+'_rel', data.resultado[f+'_rel'])} value={data.resultado[f+'_rel'] || ''} onChange={e => atualizarCampoResultado(f+'_rel', e.target.value)} />
                                                        <label className="block text-[10px] font-black uppercase text-slate-400 mt-2 mb-2 tracking-widest">{f} (abs)</label>
                                                        <input type="number" className={getInputClass(f+'_abs', data.resultado[f+'_abs'])} value={data.resultado[f+'_abs'] || ''} onChange={e => atualizarCampoResultado(f+'_abs', e.target.value)} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className={sectionClass}>Plaquetograma</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {['plaquetas', 'mpv', 'plcr'].map(f => (
                                                    <div key={f}><label className={labelClass}>{f}</label><input type="number" step="any" className={getInputClass(f, data.resultado[f])} value={data.resultado[f] || ''} onChange={e => atualizarCampoResultado(f, e.target.value)} required /></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. URINA TIPO I (EAS) */}
                                {isUrina && (
                                    <div className="space-y-8">
                                        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                                            <h4 className="font-black text-sm uppercase text-amber-800 mb-4 tracking-widest">Exame Físico e Químico</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {['cor', 'aspecto', 'densidade', 'ph', 'glicose', 'proteinas', 'cetonas', 'bilirrubina', 'sangue', 'nitrito', 'esterase', 'hemacias', 'leucocitos', 'celulas_epiteliais', 'cilindros', 'cristais', 'muco', 'bacterias'].map(f => (
                                                    <div key={f}><label className={labelClass}>{f.replace('_', ' ')}</label>
                                                    <input type="text" className={getInputClass(f, data.resultado[f])} value={data.resultado[f] || ''} onChange={e => atualizarCampoResultado(f, e.target.value)} required /></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. CULTURA E ANTIBIOGRAMA */}
                                {isCultura && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div><label className={labelClass}>Crescimento</label><select className={getInputClass('crescimento', data.resultado.crescimento)} value={data.resultado.crescimento || ''} onChange={e => atualizarCampoResultado('crescimento', e.target.value)} required><option value="Negativo">Ausente</option><option value="Positivo">Presente</option></select></div>
                                            <div><label className={labelClass}>Contagem (UFC/mL)</label><input type="text" className={getInputClass('contagem', data.resultado.contagem)} value={data.resultado.contagem || ''} onChange={e => atualizarCampoResultado('contagem', e.target.value)} placeholder="Ex: > 100.000" /></div>
                                            <div><label className={labelClass}>Agente Isolado</label><input type="text" className={getInputClass('identificacao_agente', data.resultado.identificacao_agente)} value={data.resultado.identificacao_agente || ''} onChange={e => atualizarCampoResultado('identificacao_agente', e.target.value)} placeholder="Ex: E. coli" /></div>
                                        </div>
                                        <div>
                                            <h4 className={sectionClass}>Antibiograma (Sensibilidade)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {listaAntibioticos.map(atb => (
                                                    <div key={atb} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-cyan-300 transition-colors">
                                                        <label className="block text-[9px] font-black text-slate-500 mb-2 truncate" title={atb}>{atb}</label>
                                                        <select className="w-full text-xs font-bold border-none bg-slate-50 rounded-lg focus:ring-cyan-600 cursor-pointer" value={data.resultado.antibiograma?.[atb] || ''} onChange={e => atualizarAntibiograma(atb, e.target.value)}>
                                                            <option value="">Não testado</option><option value="S">Sensível (S)</option><option value="I">Intermediário (I)</option><option value="R">Resistente (R)</option>
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. PARASITOLÓGICO DE FEZES (EPF) */}
                                {isParasit && (
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className={sectionClass}>1. Aspecto Macroscópico</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div><label className={labelClass}>Cor</label><input type="text" className={getInputClass('cor_fezes', data.resultado.cor_fezes)} value={data.resultado.cor_fezes || ''} onChange={e => atualizarCampoResultado('cor_fezes', e.target.value)} required /></div>
                                                <div><label className={labelClass}>Consistência</label><input type="text" className={getInputClass('consistencia', data.resultado.consistencia)} value={data.resultado.consistencia || ''} onChange={e => atualizarCampoResultado('consistencia', e.target.value)} required /></div>
                                                <div>
                                                    <label className={labelClass}>Muco</label>
                                                    <select className={getInputClass('muco_fezes', data.resultado.muco_fezes)} value={data.resultado.muco_fezes || ''} onChange={e => atualizarCampoResultado('muco_fezes', e.target.value)} required>
                                                        <option value="">Selecione</option><option value="Ausente">Ausente</option><option value="Presente">Presente</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Sangue</label>
                                                    <select className={getInputClass('sangue_fezes', data.resultado.sangue_fezes)} value={data.resultado.sangue_fezes || ''} onChange={e => atualizarCampoResultado('sangue_fezes', e.target.value)} required>
                                                        <option value="">Selecione</option><option value="Ausente">Ausente</option><option value="Presente">Presente</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <label className={labelClass}>Outros achados macroscópicos</label>
                                                <input type="text" className={getInputClass('outros_achados', data.resultado.outros_achados)} value={data.resultado.outros_achados || ''} onChange={e => atualizarCampoResultado('outros_achados', e.target.value)} placeholder="Ex: Restos alimentares, parasitas inteiros" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className={sectionClass}>2. Pesquisa Microscópica</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><label className={labelClass}>Protozoários (Cistos/Trofozoítas)</label><input type="text" className={getInputClass('protozoarios', data.resultado.protozoarios)} value={data.resultado.protozoarios || ''} onChange={e => atualizarCampoResultado('protozoarios', e.target.value)} required placeholder="Ex: Negativo" /></div>
                                                <div><label className={labelClass}>Helmintos (Ovos/Larvas)</label><input type="text" className={getInputClass('helmintos', data.resultado.helmintos)} value={data.resultado.helmintos || ''} onChange={e => atualizarCampoResultado('helmintos', e.target.value)} required placeholder="Ex: Negativo" /></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 5. TIPAGEM SANGUÍNEA */}
                                {isTipagem && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Sistema ABO</label>
                                            <select className={getInputClass('abo', data.resultado.abo)} value={data.resultado.abo || ''} onChange={e => atualizarCampoResultado('abo', e.target.value)} required>
                                                <option value="">Selecione...</option>
                                                {['A', 'B', 'AB', 'O'].map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Fator Rh (D)</label>
                                            <select className={getInputClass('rh', data.resultado.rh)} value={data.resultado.rh || ''} onChange={e => atualizarCampoResultado('rh', e.target.value)} required>
                                                <option value="">Selecione...</option><option value="Positivo">Positivo (Rh+)</option><option value="Negativo">Negativo (Rh-)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* 6. PERFIL LIPÍDICO */}
                                {isLipidico && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {['colesterol_total', 'hdl', 'ldl', 'vldl', 'triglicerideos'].map(f => (
                                            <div key={f}><label className={labelClass}>{f.replace('_', ' ')} (mg/dL)</label>
                                            <input type="number" step="0.1" className={getInputClass(f, data.resultado[f])} value={data.resultado[f] || ''} onChange={e => atualizarCampoResultado(f, e.target.value)} required /></div>
                                        ))}
                                    </div>
                                )}

                                {/* 7. PROTEÍNA C REATIVA (PCR) LÁTEX */}
                                {isPCR && (
                                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4">
                                        <h4 className={sectionClass}>Proteína C Reativa (PCR) - Látex</h4>
                                        <div className="max-w-md">
                                            <label className={labelClass}>Resultado Qualitativo</label>
                                            <select className={getInputClass('resultado_pcr', data.resultado.resultado_pcr)} value={data.resultado.resultado_pcr || ''} onChange={e => atualizarCampoResultado('resultado_pcr', e.target.value)} required>
                                                <option value="">Selecione o resultado...</option>
                                                <option value="Reagente">Reagente (Aglutinação Positiva - &gt; 6,0 mg/dL)</option>
                                                <option value="Não Reagente">Não Reagente (Sem aglutinação - &lt; 6,0 mg/dL)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* OUTROS SIMPLES */}
                                {isGlicose && (
                                    <div className="max-w-xs"><label className={labelClass}>Glicose (mg/dL)</label><input type="number" step="0.1" className={getInputClass('glicemia', data.resultado.glicemia)} value={data.resultado.glicemia || ''} onChange={e => atualizarCampoResultado('glicemia', e.target.value)} required /></div>
                                )}

                                {isAcidoUrico && (
                                    <div className="max-w-xs"><label className={labelClass}>Ácido Úrico (mg/dL)</label><input type="number" step="0.1" className={getInputClass('acido_urico', data.resultado.acido_urico)} value={data.resultado.acido_urico || ''} onChange={e => atualizarCampoResultado('acido_urico', e.target.value)} required /></div>
                                )}

                                {isGravidez && (
                                    <div className="max-w-xs"><label className={labelClass}>Beta hCG</label><select className={getInputClass('hcg', data.resultado.hcg)} value={data.resultado.hcg || ''} onChange={e => atualizarCampoResultado('hcg', e.target.value)} required><option value="">Selecionar</option><option value="Negativo">Não Reagente</option><option value="Positivo">Reagente</option></select></div>
                                )}

                                {isSangueOculto && (
                                    <div className="max-w-xs"><label className={labelClass}>Resultado</label><select className={getInputClass('sangue_oculto', data.resultado.sangue_oculto)} value={data.resultado.sangue_oculto || ''} onChange={e => atualizarCampoResultado('sangue_oculto', e.target.value)} required><option value="">Selecionar</option><option value="Negativo">Negativo</option><option value="Positivo">Positivo</option></select></div>
                                )}

                                {/* FORMULÁRIO GENÉRICO E ADAPTATIVO */}
                                {isGenerico && (
                                    <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 shadow-sm animate-in fade-in duration-300 text-center mb-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-blue-200 shadow-inner">✨</div>
                                        <h4 className="font-black text-lg text-blue-900 mb-2">Formulário Adaptativo</h4>
                                        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto font-medium">
                                            Este exame utiliza o modelo genérico. O valor preenchido abaixo será mapeado diretamente para o PDF do paciente.
                                        </p>
                                        
                                        <div className="text-left max-w-lg mx-auto">
                                            <InputLabel value="Resultado Analítico Obtido" className="!text-blue-900 !font-black !text-xs uppercase tracking-widest" />
                                            <input 
                                                className={`w-full mt-2 !py-4 !text-xl !font-black text-center ${getInputClass(chaveGenerica, data.resultado[chaveGenerica])}`} 
                                                placeholder="Digite o resultado exato..."
                                                required 
                                                value={data.resultado[chaveGenerica] || ''}
                                                onChange={e => atualizarCampoResultado(chaveGenerica, e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* BLOCO COMUM: MÉTODO, MATERIAL, OBSERVAÇÕES E BOTÕES */}
                                <div className="pt-6 border-t border-slate-200 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Método de Análise Utilizado</label>
                                            <input 
                                                type="text" 
                                                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:border-cyan-600 focus:ring-0 p-3 font-bold text-slate-700 transition-all"
                                                placeholder="Ex: Espectrofotometria, Microscopia..." 
                                                value={data.resultado.metodo || ''} 
                                                onChange={e => atualizarCampoResultado('metodo', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Material Analisado</label>
                                            <input 
                                                type="text" 
                                                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:border-cyan-600 focus:ring-0 p-3 font-bold text-slate-700 transition-all"
                                                placeholder="Ex: Soro, Sangue Total, Urina..." 
                                                value={data.resultado.material || ''} 
                                                onChange={e => atualizarCampoResultado('material', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`${labelClass} flex items-center gap-2`}>
                                            Observações Clínicas (Laudo)
                                            {temAlertaGeral && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[9px]">Obrigatório para justificar a tarja</span>}
                                        </label>
                                        <textarea 
                                            rows={3} 
                                            className={`w-full border-2 border-dashed bg-slate-50 rounded-2xl p-4 text-sm font-medium transition-all resize-none ${temAlertaGeral && !data.observacao ? 'border-red-400 focus:border-red-600 focus:bg-red-50' : 'border-slate-300 focus:bg-white focus:border-cyan-600'}`} 
                                            placeholder="Ex: Amostra hemolisada, repetido para confirmação..." 
                                            value={data.observacao} 
                                            onChange={e => setData('observacao', e.target.value)}
                                            required={temAlertaGeral} // Torna obrigatório se houver alerta
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
                                    <button type="button" onClick={() => setExameEmPreenchimento(null)} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:text-red-600 transition-all w-full md:w-auto shadow-sm">
                                        Cancelar
                                    </button>
                                    
                                    <button type="submit" disabled={processing} className={`px-10 py-4 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl transition-all disabled:opacity-50 w-full md:w-auto flex justify-center items-center gap-2 ${isAdmin ? 'bg-green-700 hover:bg-green-800 shadow-green-700/20' : isProfessor ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-700/20' : 'bg-cyan-700 hover:bg-cyan-800 shadow-cyan-700/20 hover:-translate-y-0.5'}`}>
                                        {processing ? 'Processando...' : 
                                            (isAdmin ? '✅ Assinar e Liberar ao Paciente' : 
                                            isProfessor ? '📤 Enviar para Revisão (Administração)' : 
                                            '📤 Enviar para Revisão (Professor)')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DO TICKET GIGANTE PARA IMPRESSÃO */}
            {ticketParaImprimir && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print-backdrop">
                    <div className="bg-white max-w-md w-full p-8 shadow-2xl print-area rounded-lg border-t-8 border-blue-950">
                        <div className="text-center mb-6 border-b border-slate-100 pb-4 relative">
                            <button onClick={() => setTicketParaImprimir(null)} className="absolute -top-4 -right-4 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors hide-on-print">✕</button>
                            <h2 className="text-2xl font-black text-blue-950 tracking-tighter uppercase">ASTRALAB</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Laboratório de Análises Clínicas</p>
                        </div>
                        <div className="space-y-3 mb-6">
                            <h3 className="text-center font-black text-xs border-y border-slate-100 py-2 bg-slate-50 uppercase tracking-widest text-blue-900">FICHA DE PROTOCOLO DE ENTREGA</h3>
                            <div className="text-[11px] space-y-1 pt-2 text-slate-700">
                                <p><strong>PACIENTE:</strong> <span className="uppercase">{ticketParaImprimir.paciente}</span></p>
                                <p><strong>DATA ENTRADA:</strong> {ticketParaImprimir.data}</p>
                                <p><strong>PREVISÃO ENTREGA:</strong> <span className="font-bold text-green-700">{calcularPrevisao(ticketParaImprimir.data)}</span></p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl text-center border-2 border-dashed border-slate-300 mb-6">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Protocolo / Senha de Acesso</p>
                            <p className="text-3xl font-black text-blue-950 tracking-widest font-mono">{ticketParaImprimir.protocolo}</p>
                        </div>
                        <div className="text-[9px] text-slate-500 leading-relaxed text-justify mb-8">
                            Para retirar seus resultados presencialmente, apresente este protocolo e seu documento original com foto. Você também pode acessar seus laudos em nosso site oficial <strong>(www.astralab.com.br)</strong> utilizando o seu CPF como login e o Protocolo acima como senha.
                        </div>
                        <div className="flex gap-3 hide-on-print">
                            <button onClick={() => setTicketParaImprimir(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black text-[11px] tracking-widest rounded-xl hover:bg-slate-200 border border-slate-200 uppercase">FECHAR</button>
                            <button onClick={() => window.print()} className="flex-[2] py-4 bg-blue-950 text-white font-black text-[11px] tracking-widest rounded-xl shadow-lg hover:bg-blue-900 uppercase flex items-center justify-center gap-2">
                                🖨️ IMPRIMIR FICHA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}