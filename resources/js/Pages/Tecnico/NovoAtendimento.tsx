import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect, useState } from 'react';

interface ExameCatalogo {
    id_exame: number;
    nome_exame: string;
}

interface NovoAtendimentoProps extends PageProps {
    examesDisponiveis: ExameCatalogo[];
}

export default function NovoAtendimento({ auth, examesDisponiveis = [] }: NovoAtendimentoProps) {
    const { flash } = usePage().props as any; 
    const [mostrarErroCpf, setMostrarErroCpf] = useState(false);

    // VALORES VAZIOS: Adicionado o nome_social
    const valoresIniciais = {
        cpf: '', nome: '', nome_social: '', email: '', data_nascimento: '', sexo: '', 
        telefone: '', telefone2: '', cep: '', endereco: '', peso: '', 
        altura: '', nome_responsavel: '', conselho_tipo: 'Nenhum', 
        medico_crm: '', medico_nome: '', exames: [] as string[], observacao_clinica: '',
    };

    const { data, setData, post, processing, errors, clearErrors } = useForm(valoresIniciais);

    useEffect(() => {
        if (errors.cpf || errors.email) {
            setMostrarErroCpf(true);
            const timer = setTimeout(() => setMostrarErroCpf(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // =========================================================
    // FUNÇÕES: Validação e Buscas
    // =========================================================
    const validarCpf = (cpfStr: string) => {
        const cpfLimpo = cpfStr.replace(/\D/g, '');
        if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) return false;

        let soma = 0; let resto;
        for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpfLimpo.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;

        return true; 
    };

    const buscarCpf = async () => {
        const cpfLimpo = data.cpf.replace(/\D/g, '');
        
        if (cpfLimpo.length === 0) {
            setData(valoresIniciais);
            clearErrors();
            return;
        }

        if (cpfLimpo.length < 11) {
            alert('Digite um CPF com 11 números para buscar.'); return;
        }
        
        if (!validarCpf(cpfLimpo)) {
            alert('❌ Atenção: O CPF digitado é INVÁLIDO. Por favor, verifique os números.'); return; 
        }

        try {
            const response = await fetch(`/tecnico/buscar-paciente/${cpfLimpo}`);
            const result = await response.json();
            
            if (result.encontrado) {
                // PREENCHE: Traz o nome_social do banco de dados também!
                setData({ 
                    ...data, 
                    nome: result.nome || '', 
                    nome_social: result.nome_social || '', 
                    email: result.email || '', 
                    data_nascimento: result.data_nascimento || '', 
                    sexo: result.sexo || '', 
                    telefone: result.telefone || '', 
                    telefone2: result.telefone2 || '',
                    cep: result.cep || '', 
                    endereco: result.endereco || '', 
                    peso: result.peso || '',
                    altura: result.altura || '', 
                    nome_responsavel: result.nome_responsavel || ''
                });
            } else {
                setData({
                    ...data, 
                    nome: '', nome_social: '', email: '', data_nascimento: '', sexo: '', 
                    telefone: '', telefone2: '', cep: '', endereco: '', 
                    peso: '', altura: '', nome_responsavel: ''
                });
                alert('Paciente não encontrado no AstraLab. Prossiga com o cadastro manual preenchendo os campos abaixo.');
            }
        } catch (error) { console.error("Erro na busca:", error); }
    };

    const buscarCep = async (cepBuscado: string) => {
        const cepLimpo = cepBuscado.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const result = await response.json();
            if (!result.erro) setData('endereco', `${result.logradouro}, Bairro: ${result.bairro}, ${result.localidade} - ${result.uf}`);
        } catch (error) { console.error("Erro ao buscar CEP", error); }
    };

    const buscarProfissional = async () => {
        if (!data.medico_crm || data.conselho_tipo === 'Nenhum') return;
        try {
            const response = await fetch(`/tecnico/buscar-profissional/${data.medico_crm}`);
            const result = await response.json();
            if (result.encontrado) setData('medico_nome', result.nome);
        } catch (e) { console.error(e); }
    };

    const toggleExame = (nomeExame: string) => {
        let novosExames = data.exames.includes(nomeExame) 
            ? data.exames.filter(e => e !== nomeExame) 
            : [...data.exames, nomeExame];
        setData('exames', novosExames);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tecnico.novo.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setData(valoresIniciais); 
                clearErrors();
                window.scrollTo(0, 0);
            }
        });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('dashboard')} 
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-cyan-700 hover:border-cyan-300 hover:bg-cyan-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm group"
                    >
                        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">←</span> Voltar
                    </Link>
                    <h2 className="font-black text-2xl text-cyan-950 tracking-tight">Novo Atendimento</h2>
                </div>
            }
        >
            <Head title="AstraLab - Nova OS" />
            
            <div className="py-10 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {flash?.success && (
                        <div className="bg-green-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg animate-in fade-in slide-in-from-top-4 shadow-green-600/20">
                            {flash.success}
                        </div>
                    )}

                    {mostrarErroCpf && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-2xl shadow-md animate-bounce">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">⚠️</span>
                                    <div>
                                        <p className="font-black text-xs uppercase tracking-widest text-red-800">Erro de Cadastro</p>
                                        <p className="text-sm font-bold mt-1">{errors.cpf || errors.email || 'Verifique os dados informados.'}</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setMostrarErroCpf(false)} className="text-red-500 font-black px-2 text-xl hover:text-red-800 transition-colors">&times;</button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* BLOCO 1: DADOS DO PACIENTE */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 p-2 rounded-lg text-lg border border-blue-200 shadow-inner">👤</span> 1. Identificação do Paciente
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">CPF (Busca/Limpa)</label>
                                            <div className="flex gap-2">
                                                <input type="text" className={`w-full rounded-xl border-2 px-4 py-2 font-mono font-bold text-sm ${errors.cpf ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors'}`} value={data.cpf} onChange={e => setData('cpf', e.target.value)} placeholder="000.000.000-00" />
                                                <button type="button" onClick={buscarCpf} title="Deixe vazio e clique para limpar a tela" className="bg-blue-950 text-white px-4 rounded-xl font-bold text-xs hover:bg-blue-800 transition-colors shadow-sm shrink-0">BUSCAR</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">E-mail (Envio de Laudos)</label>
                                            <input type="email" className={`w-full rounded-xl border-2 px-4 py-2 text-sm font-bold ${errors.email ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors'}`} value={data.email} onChange={e => setData('email', e.target.value)} placeholder="paciente@email.com" />
                                        </div>
                                    </div>

                                    {/* LINHA NOVA: NOME CIVIL E NOME SOCIAL */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Nome Completo (Civil)</label>
                                            <input type="text" className={`w-full rounded-xl border-2 px-4 py-2 font-bold text-sm ${errors.nome ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors'}`} value={data.nome} onChange={e => setData('nome', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Nome Social (Opcional)</label>
                                            <input type="text" className={`w-full rounded-xl border-2 px-4 py-2 font-bold text-sm ${errors.nome_social ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors'}`} value={data.nome_social} onChange={e => setData('nome_social', e.target.value)} placeholder="Ex: Maria" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Responsável Legal (Caso menor de idade)</label>
                                        <input type="text" className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 bg-slate-50 text-sm font-bold focus:bg-white focus:border-blue-500 transition-colors" value={data.nome_responsavel} onChange={e => setData('nome_responsavel', e.target.value)} placeholder="Nome completo do responsável" />
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Data Nasc.</label>
                                            <input type="date" className={`w-full rounded-xl border-2 px-3 py-2 text-sm font-bold ${errors.data_nascimento ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors'}`} value={data.data_nascimento} onChange={e => setData('data_nascimento', e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Sexo</label>
                                            <select className={`w-full rounded-xl border-2 px-3 py-2 text-sm font-bold ${errors.sexo ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors'}`} value={data.sexo} onChange={e => setData('sexo', e.target.value)} required>
                                                <option value="">...</option>
                                                <option value="M">Masc</option>
                                                <option value="F">Fem</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Celular</label>
                                            <input type="text" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors" value={data.telefone} onChange={e => setData('telefone', e.target.value)} placeholder="(11) 9..." />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Recado</label>
                                            <input type="text" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors" value={data.telefone2} onChange={e => setData('telefone2', e.target.value)} placeholder="(11) 9..." />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 mt-2">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Peso (kg)</label>
                                            <input type="number" step="0.01" className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 font-bold text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors" value={data.peso} onChange={e => setData('peso', e.target.value)} placeholder="0.0" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Altura (cm)</label>
                                            <input type="number" className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 font-bold text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors" value={data.altura} onChange={e => setData('altura', e.target.value)} placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">CEP</label>
                                            <input type="text" className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 font-bold text-sm bg-slate-50 focus:bg-white focus:border-blue-500 transition-colors" value={data.cep} onBlur={(e) => buscarCep(e.target.value)} onChange={e => setData('cep', e.target.value)} placeholder="00000-000" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Endereço Completo</label>
                                        <input type="text" className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 bg-slate-50 text-sm font-bold focus:bg-white focus:border-blue-500 transition-colors" value={data.endereco} onChange={e => setData('endereco', e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
                                    </div>
                                </div>
                            </div>

                            {/* BLOCO 2: CLÍNICO E EXAMES */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col">
                                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="bg-cyan-100 text-cyan-700 border border-cyan-200 p-2 rounded-lg text-lg shadow-inner">🧪</span> 2. Dados Clínicos e Exames
                                </h3>

                                <div className="space-y-4 flex-grow">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Conselho</label>
                                            <select className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 font-bold text-slate-700 bg-slate-50 focus:bg-white focus:border-cyan-500 transition-colors" value={data.conselho_tipo} onChange={e => setData('conselho_tipo', e.target.value)}>
                                                <option value="Nenhum">Nenhum</option>
                                                <option value="CRM">CRM</option>
                                                <option value="CRBM">CRBM</option>
                                                <option value="COREN">COREN</option>
                                                <option value="CRN">CRN</option>
                                                <option value="CRO">CRO</option>
                                                <option value="CRF">CRF</option>
                                                <option value="Outro">Outro</option>
                                            </select>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Nº do Registro (Opcional)</label>
                                            <input 
                                                type="text" 
                                                className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 bg-slate-50 focus:bg-white focus:border-cyan-500 disabled:bg-slate-100 disabled:text-slate-400 font-bold transition-colors" 
                                                value={data.medico_crm} 
                                                onBlur={buscarProfissional} 
                                                onChange={e => setData('medico_crm', e.target.value)} 
                                                placeholder={data.conselho_tipo === 'Nenhum' ? "Profissional não informado" : `Ex: 12345-SP`} 
                                                disabled={data.conselho_tipo === 'Nenhum'}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Nome do Profissional Solicitante</label>
                                        <input 
                                            type="text" 
                                            className="w-full rounded-xl border-2 border-slate-200 px-4 py-2 bg-slate-50 focus:bg-white focus:border-cyan-500 disabled:bg-slate-100 disabled:text-slate-400 font-bold transition-colors" 
                                            value={data.medico_nome} 
                                            onChange={e => setData('medico_nome', e.target.value)} 
                                            disabled={data.conselho_tipo === 'Nenhum'}
                                        />
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <label className="block text-[10px] font-black uppercase text-amber-700 mb-2 tracking-widest">
                                            ⚠️ Observações Clínicas / Condições do Paciente
                                        </label>
                                        <textarea 
                                            className="w-full rounded-xl border-2 border-amber-200 bg-amber-50/50 px-4 py-3 text-sm font-medium text-amber-900 focus:bg-white focus:border-amber-400 transition-all resize-none" 
                                            rows={2}
                                            value={data.observacao_clinica}
                                            onChange={e => setData('observacao_clinica', e.target.value)}
                                            placeholder="Ex: Hemodiálise, uso de anticoagulantes, jejum quebrado, gestante..."
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Catálogo de Exames (Mínimo 1)</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-2 border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full shadow-inner">
                                            {examesDisponiveis.map((exame) => (
                                                <label key={exame.id_exame} className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${data.exames.includes(exame.nome_exame) ? 'bg-cyan-50 border-cyan-500 shadow-sm' : 'bg-white border-transparent shadow-sm hover:border-slate-300'}`}>
                                                    <input type="checkbox" className="hidden" checked={data.exames.includes(exame.nome_exame)} onChange={() => toggleExame(exame.nome_exame)} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-slate-800 leading-tight">{exame.nome_exame}</span>
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Clique para Selecionar</span>
                                                    </div>
                                                </label>
                                            ))}
                                            {examesDisponiveis.length === 0 && (
                                                <div className="col-span-full text-center py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                    Nenhum exame cadastrado no sistema.
                                                </div>
                                            )}
                                        </div>
                                        {errors.exames && <p className="text-red-500 text-[10px] mt-2 font-bold">{errors.exames}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 gap-4">
                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Técnico Responsável: <span className="text-blue-950 font-black">{auth.user.name}</span>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button type="submit" disabled={processing} className="w-full md:w-auto px-10 py-4 bg-cyan-700 text-white font-black rounded-2xl shadow-lg shadow-cyan-700/20 hover:bg-cyan-800 hover:-translate-y-1 transition-all text-xs tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                                    {processing ? 'GERANDO...' : '✅ GERAR ORDEM DE SERVIÇO'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}