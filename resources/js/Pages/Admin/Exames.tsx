import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface ExameData {
    id_exame: number;
    nome_exame: string;
    valor: string | number;
    prazo_resultado: number;
    descricao: string | null;
    instrucoes_preparo: string | null;
    ref_min: string | number | null;
    ref_max: string | number | null;
    ref_texto: string | null;
}

interface ExamesProps extends PageProps {
    examesLista: ExameData[];
}

export default function Exames({ auth, examesLista = [] }: ExamesProps) {
    const { flash } = usePage().props as any;
    const [busca, setBusca] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState(false);

    const { data, setData, post, patch, processing, reset, errors, clearErrors, transform } = useForm({
        id_exame: 0,
        nome_exame: '',
        valor: 0, 
        prazo_resultado: 0,
        descricao: '',
        instrucoes_preparo: '',
        ref_min: '' as any,
        ref_max: '' as any,
        ref_texto: '',
    });

    const examesFiltrados = examesLista.filter(e => 
        e.nome_exame.toLowerCase().includes(busca.toLowerCase())
    );

    // =========================================================
    // O SUPER TEMPLATE DE REFERÊNCIAS (Atualizado com Sexo M/F)
    // =========================================================
    const getTemplateReferenciaUniversal = () => {
        const template = {
            "hemacias": {
                "M": { "min": 4.5, "max": 6.1, "texto": "Homens: 4.5 a 6.1 milhões/mm³" },
                "F": { "min": 4.0, "max": 5.4, "texto": "Mulheres: 4.0 a 5.4 milhões/mm³" }
            },
            "hemoglobina": {
                "M": { "min": 13.0, "max": 18.0, "texto": "Homens: 13.0 a 18.0 g/dL" },
                "F": { "min": 12.0, "max": 16.0, "texto": "Mulheres: 12.0 a 16.0 g/dL" }
            },
            "hematocrito": {
                "M": { "min": 40, "max": 52, "texto": "Homens: 40 a 52 %" },
                "F": { "min": 36, "max": 46, "texto": "Mulheres: 36 a 46 %" }
            },
            "vcm": { "min": 80, "max": 100, "texto": "80 a 100 fL" },
            "hcm": { "min": 26, "max": 34, "texto": "26 a 34 pg" },
            "chcm": { "min": 31, "max": 36, "texto": "31 a 36 g/dL" },
            "rdw": { "min": 11.5, "max": 14.5, "texto": "11.5 a 14.5 %" },
            "leucocitos_totais": { "min": 4000, "max": 10000, "texto": "4.000 a 10.000 /mm³" },
            "neu_rel": { "min": 45, "max": 75, "texto": "45 a 75 %" },
            "neu_abs": { "min": 1500, "max": 7000, "texto": "1.500 a 7.000 /mm³" },
            "lin_rel": { "min": 20, "max": 45, "texto": "20 a 45 %" },
            "lin_abs": { "min": 1000, "max": 4000, "texto": "1.000 a 4.000 /mm³" },
            "mon_rel": { "min": 2, "max": 10, "texto": "2 a 10 %" },
            "mon_abs": { "min": 100, "max": 1000, "texto": "100 a 1.000 /mm³" },
            "eos_rel": { "min": 1, "max": 5, "texto": "1 a 5 %" },
            "eos_abs": { "min": 50, "max": 500, "texto": "50 a 500 /mm³" },
            "baso_rel": { "min": 0, "max": 1, "texto": "0 a 1 %" },
            "baso_abs": { "min": 0, "max": 100, "texto": "0 a 100 /mm³" },
            "bas_rel": { "min": 0, "max": 5, "texto": "0 a 5 %" },
            "bas_abs": { "min": 0, "max": 500, "texto": "0 a 500 /mm³" },
            "seg_rel": { "min": 45, "max": 70, "texto": "45 a 70 %" },
            "seg_abs": { "min": 1500, "max": 7000, "texto": "1.500 a 7.000 /mm³" },
            "lin_ati_rel": { "max": 0, "texto": "0 %" },
            "lin_ati_abs": { "max": 0, "texto": "0 /mm³" },
            "plaquetas": { "min": 150000, "max": 450000, "texto": "150.000 a 450.000 /mm³" },
            "mpv": { "min": 7.0, "max": 11.0, "texto": "7.0 a 11.0 fL" },
            "plcr": { "min": 15, "max": 35, "texto": "15 a 35 %" },
            "glicemia": { "min": 70, "max": 99, "texto": "70 a 99 mg/dL" },
            "colesterol_total": { "max": 190, "texto": "< 190 mg/dL" },
            "hdl": { "min": 40, "texto": "> 40 mg/dL" },
            "ldl": { "max": 130, "texto": "< 130 mg/dL" },
            "vldl": { "max": 30, "texto": "< 30 mg/dL" },
            "triglicerideos": { "max": 150, "texto": "< 150 mg/dL" },
            "acido_urico": { "min": 2.4, "max": 6.0, "texto": "2.4 a 6.0 mg/dL" },
            "proteinas": { "min": 6.0, "max": 8.0, "texto": "6.0 a 8.0 g/dL" },
            "bilirrubina": { "max": 1.2, "texto": "Até 1.2 mg/dL" },
            "densidade": { "min": 1010, "max": 1025, "texto": "1.010 a 1.025" },
            "ph": { "min": 5.0, "max": 7.0, "texto": "5.0 a 7.0" },
            "cor": { "texto": "Amarelo Citrino" },
            "aspecto": { "texto": "Límpido" },
            "cetonas": { "texto": "Ausente" },
            "sangue": { "texto": "Ausente" },
            "nitrito": { "texto": "Negativo" },
            "esterase": { "texto": "Ausente" },
            "leucocitos": { "texto": "Até 10.000 /mL" },
            "celulas_epiteliais": { "texto": "Raras a Algumas" },
            "cilindros": { "texto": "Ausentes" },
            "cristais": { "texto": "Ausentes" },
            "muco": { "texto": "Raro ou Ausente" },
            "bacterias": { "texto": "Ausentes ou Raras" },
            "cor_fezes": { "texto": "Castanho" },
            "consistencia": { "texto": "Pastosa / Sólida" },
            "muco_fezes": { "texto": "Ausente" },
            "sangue_fezes": { "texto": "Ausente" },
            "protozoarios": { "texto": "Negativo" },
            "helmintos": { "texto": "Negativo" },
            "hcg": { "texto": "Inferior a 5 mUI/mL (Negativo)" },
            "crescimento": { "texto": "Ausência de crescimento" }
        };
        return JSON.stringify(template, null, 4); // Formatado bonitinho com 4 espaços
    };

    // Função que garante que o texto JSON vindo do banco fica formatado e bonito na tela
    const formatarTextoParaJson = (texto: string | null) => {
        if (!texto) return '';
        if (texto.trim().startsWith('{')) {
            try {
                let limpo = JSON.parse(texto);
                if (typeof limpo === 'string') limpo = JSON.parse(limpo);
                return JSON.stringify(limpo, null, 4);
            } catch(e) {
                return texto;
            }
        }
        return texto;
    };

    const abrirModalEditar = (exame: ExameData) => {
        clearErrors();
        setEditando(true);
        setData({
            id_exame: exame.id_exame,
            nome_exame: exame.nome_exame,
            valor: 0, 
            prazo_resultado: exame.prazo_resultado,
            descricao: exame.descricao || '', 
            instrucoes_preparo: exame.instrucoes_preparo || '',
            ref_min: exame.ref_min !== null ? String(exame.ref_min) : '',
            ref_max: exame.ref_max !== null ? String(exame.ref_max) : '',
            ref_texto: formatarTextoParaJson(exame.ref_texto),
        });
        setModalAberto(true);
    };

    const abrirModalCriar = () => {
        clearErrors();
        setEditando(false);
        setData({
            id_exame: 0,
            nome_exame: '',
            valor: 0, 
            prazo_resultado: 0,
            descricao: '',
            instrucoes_preparo: '',
            ref_min: '',
            ref_max: '',
            ref_texto: getTemplateReferenciaUniversal(), // Já vem com o JSON preenchido
        });
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        clearErrors();
    };

    // Ação extra: Permite ao admin preencher a caixa vazia com um clique
    const carregarTemplate = () => {
        if (confirm("Isto irá apagar o que está escrito no terminal JSON e colocar o Dicionário Padrão do sistema. Deseja continuar?")) {
            setData('ref_texto', getTemplateReferenciaUniversal());
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Verifica se é JSON válido sem quebrar a página
        if (data.ref_texto && data.ref_texto.trim().startsWith('{')) {
             try {
                 JSON.parse(data.ref_texto); 
             } catch(err) {
                 alert("Aviso: O texto na caixa JSON parece ter um erro de formatação (vírgula ou aspas faltando). Por favor, reveja antes de salvar para não bugar as tarjas vermelhas.");
                 return;
             }
        }

        // Intercepta e converte os valores antes de enviar
        transform((dadosAtuais) => {
            let dadosModificados = { ...dadosAtuais };
            
            if (dadosModificados.ref_min === '') dadosModificados.ref_min = null;
            if (dadosModificados.ref_max === '') dadosModificados.ref_max = null;

            if (dadosModificados.ref_texto && dadosModificados.ref_texto.trim().startsWith('{')) {
                 dadosModificados.ref_texto = JSON.stringify(JSON.parse(dadosModificados.ref_texto)); // Comprime para enviar
            }
            return dadosModificados;
        });

        if (editando) {
            patch(route('admin.exames.update', data.id_exame), {
                preserveScroll: true,
                onSuccess: () => fecharModal(),
            });
        } else {
            post(route('admin.exames.store'), {
                preserveScroll: true,
                onSuccess: () => fecharModal(),
            });
        }
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('admin.dashboard')} 
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-800 hover:border-blue-300 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm group"
                    >
                        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Voltar
                    </Link>
                    <h2 className="font-black text-2xl text-blue-950 tracking-tight">Catálogo de Exames</h2>
                </div>
            }
        >
            <Head title="AstraLab - Gestão de Exames" />

            <div className="py-12 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {flash?.success && (
                        <div className="bg-green-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg animate-in fade-in slide-in-from-top-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-2xl text-blue-600 shadow-inner">⚙️</div>
                            <div>
                                <h3 className="font-black text-slate-800 text-lg">Módulos Operacionais</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prazos e Referências Clínicas</p>
                            </div>
                        </div>
                        
                        <div className="flex w-full md:w-auto items-center gap-4">
                            <div className="relative w-full md:w-80">
                                <span className="absolute left-4 top-3.5 opacity-30">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Buscar exame..." 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-600 transition-all text-sm"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                />
                            </div>
                            
                            <button 
                                onClick={abrirModalCriar}
                                className="bg-green-700 text-white hover:bg-green-800 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md shrink-0 whitespace-nowrap hover:-translate-y-0.5"
                            >
                                + Novo Exame
                            </button>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden rounded-[2.5rem] shadow-sm border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                                        <th className="p-8">Nome do Exame</th>
                                        <th className="p-8 text-center">Prazo (Dias Úteis)</th>
                                        <th className="p-8 text-center">Limites (Tarja)</th>
                                        <th className="p-8 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {examesFiltrados.map((exame) => (
                                        <tr key={exame.id_exame} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="p-8">
                                                <p className="font-black text-slate-800 group-hover:text-blue-950 transition-colors">{exame.nome_exame}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">#{exame.id_exame}</span>
                                                    {exame.instrucoes_preparo && <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-md border border-green-200">Guia Anexado</span>}
                                                </div>
                                            </td>
                                            <td className="p-8 text-center">
                                                <span className="bg-slate-100 text-slate-600 font-black px-4 py-2 rounded-xl text-xs border border-slate-200">{exame.prazo_resultado} dias</span>
                                            </td>
                                            <td className="p-8 text-center">
                                                {exame.ref_min !== null || exame.ref_max !== null ? (
                                                    <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg uppercase border border-blue-200 shadow-sm">Simples (Mín/Máx)</span>
                                                ) : exame.ref_texto?.startsWith('{') ? (
                                                    <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg uppercase border border-purple-200 shadow-sm">Painel Completo (JSON)</span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg uppercase border border-slate-200">Desativada</span>
                                                )}
                                            </td>
                                            <td className="p-8 text-right">
                                                <button 
                                                    onClick={() => abrirModalEditar(exame)}
                                                    className="bg-blue-950 text-white hover:bg-blue-800 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:-translate-y-0.5"
                                                >
                                                    Configurar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {examesFiltrados.length === 0 && (
                            <div className="p-20 text-center">
                                <span className="text-4xl block mb-4 opacity-20">🗂️</span>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum exame encontrado no catálogo.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE CONFIGURAÇÃO */}
            {modalAberto && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
                    <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all border border-slate-100 max-h-[90vh] flex flex-col">
                        
                        <div className="p-8 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-blue-950">{editando ? 'Configuração Completa do Exame' : 'Cadastrar Novo Exame'}</h3>
                                {editando && <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">{data.nome_exame}</p>}
                            </div>
                            <button onClick={fecharModal} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition-all text-xl shadow-sm">&times;</button>
                        </div>

                        <div className="overflow-y-auto p-8 flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <form id="editForm" onSubmit={handleSubmit} className="space-y-8">
                                
                                {!editando && (
                                     <div>
                                         <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nome do Exame</label>
                                         <input 
                                             type="text" 
                                             className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-0 p-4 font-black text-slate-700" 
                                             value={data.nome_exame} 
                                             onChange={e => setData('nome_exame', e.target.value)} 
                                             required 
                                             placeholder="Ex: Hemograma Completo"
                                         />
                                         {errors.nome_exame && <p className="text-red-500 text-xs mt-1">{errors.nome_exame}</p>}
                                     </div>
                                )}

                                <div className="space-y-6">
                                    <h4 className="font-black text-sm text-slate-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> 1. Dados Operacionais
                                    </h4>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Prazo Máximo de Entrega (Dias úteis)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-4 font-black text-slate-400">⏱️</span>
                                            <input type="number" step="1" min="0" className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-0 pl-12 pr-4 py-4 font-black text-slate-700" value={data.prazo_resultado} onChange={e => setData('prazo_resultado', parseInt(e.target.value))} required />
                                        </div>
                                        {errors.prazo_resultado && <p className="text-red-500 text-xs mt-1">{errors.prazo_resultado}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center justify-between">
                                            <span>Instruções de Preparo (Guia do Paciente)</span>
                                        </label>
                                        <textarea rows={3} className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-0 p-4 font-medium text-slate-700 resize-none leading-relaxed" placeholder="Ex: Jejum obrigatório de 8 horas..." value={data.instrucoes_preparo} onChange={e => setData('instrucoes_preparo', e.target.value)}></textarea>
                                        {errors.instrucoes_preparo && <p className="text-red-500 text-xs mt-1">{errors.instrucoes_preparo}</p>}
                                    </div>
                                </div>

                                <div className="space-y-6 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl shrink-0 shadow-inner">🚨</div>
                                        <div>
                                            <h4 className="font-black text-sm text-slate-800 uppercase tracking-widest">
                                                2. Sistema de Alerta Clínico (Tarja Vermelha)
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Estes valores disparam o alerta na tela da Bancada. Para <strong>exames simples</strong> (ex: Glicose), use Mínimo/Máximo. Para <strong>painéis compostos</strong> (ex: Hemograma), use o terminal de código JSON abaixo.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/80">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Mínimo Aceitável</label>
                                            <input type="text" placeholder="Inativo se usar JSON" className="w-full border-2 border-slate-200 bg-white rounded-2xl focus:border-blue-500 focus:ring-0 p-4 font-black text-slate-700 shadow-sm transition-colors" value={data.ref_min} onChange={e => setData('ref_min', e.target.value)} />
                                            {errors.ref_min && <p className="text-red-500 text-xs mt-1">{errors.ref_min}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Máximo Aceitável</label>
                                            <input type="text" placeholder="Inativo se usar JSON" className="w-full border-2 border-slate-200 bg-white rounded-2xl focus:border-blue-500 focus:ring-0 p-4 font-black text-slate-700 shadow-sm transition-colors" value={data.ref_max} onChange={e => setData('ref_max', e.target.value)} />
                                            {errors.ref_max && <p className="text-red-500 text-xs mt-1">{errors.ref_max}</p>}
                                        </div>
                                        
                                        <div className="md:col-span-2 mt-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                                    <span>Dicionário de Painel (JSON)</span>
                                                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">Terminal de Código</span>
                                                </label>
                                                
                                                {/* BOTÃO MÁGICO QUE RECUPERA O JSON PADRÃO */}
                                                <button type="button" onClick={carregarTemplate} className="text-[9px] bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors">
                                                    🔄 Carregar Padrão
                                                </button>
                                            </div>

                                            <textarea 
                                                rows={15} 
                                                className="w-full font-mono text-[11px] bg-slate-900 border-2 border-slate-800 rounded-2xl focus:border-green-500 focus:ring-0 p-5 text-green-400 shadow-inner transition-colors leading-relaxed tracking-wider [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full" 
                                                value={data.ref_texto} 
                                                onChange={e => setData('ref_texto', e.target.value)} 
                                                spellCheck="false"
                                            />
                                            {errors.ref_texto && <p className="text-red-500 text-xs mt-2 font-black">{errors.ref_texto}</p>}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 bg-slate-50 flex gap-4 border-t border-slate-200 shrink-0">
                            <button type="button" onClick={fecharModal} className="flex-1 py-4 bg-white text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 hover:text-slate-800 transition-all border border-slate-300">
                                CANCELAR
                            </button>
                            <button type="submit" onClick={handleSubmit} disabled={processing} className="flex-[2] py-4 bg-green-700 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-green-700/20 hover:bg-green-800 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                                {processing ? 'SALVANDO...' : (editando ? 'SALVAR PARÂMETROS DO EXAME' : 'CRIAR NOVO EXAME')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}