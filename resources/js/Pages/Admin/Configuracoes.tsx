import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { FormEventHandler, useState, useRef } from 'react';
import { PageProps } from '@/types';

// Tipagem limpa: Apenas configurações globais do sistema e assinaturas
interface ConfigProps extends PageProps {
    configs: {
        lab_nome?: string; lab_endereco?: string; lab_telefone?: string; lab_email?: string;
        revisor_nome?: string; revisor_crbm?: string; rubrica_revisor?: string;
        liberador_nome?: string; liberador_crbm?: string; rubrica_liberador?: string;
        rodape_laudo?: string; aviso_paciente?: string;
        mail_host?: string; mail_port?: string; mail_encryption?: string; mail_username?: string; mail_from_address?: string; mail_from_name?: string;
    };
}

export default function Configuracoes({ auth, configs = {} as any }: ConfigProps) {
    const { flash } = usePage().props as any;
    
    // Controle das Abas do Menu Lateral
    const [abaAtiva, setAbaAtiva] = useState('instituicao');

    // Referências para os inputs de arquivo ocultos
    const fileInputRevisor = useRef<HTMLInputElement>(null);
    const fileInputLiberador = useRef<HTMLInputElement>(null);

    // Formulário enxuto, focado na Instituição e E-mail
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        // 1. INSTITUIÇÃO E ASSINATURAS
        lab_nome: configs.lab_nome || 'AstraLab - Laboratório Escola',
        lab_endereco: configs.lab_endereco || "Rua Maria D'Assumpção, 1000 - Martim de Sá | CEP: 11.662-047 - Caraguatatuba/SP",
        lab_telefone: configs.lab_telefone || '(12) 3897-2000',
        lab_email: configs.lab_email || 'contato@astralab.modulo.br',
        
        revisor_nome: configs.revisor_nome || 'Dra. Karin D. Oliveira',
        revisor_crbm: configs.revisor_crbm || '69274',
        rubrica_revisor: configs.rubrica_revisor || '',
        
        liberador_nome: configs.liberador_nome || 'Dr. Luiz Carlos Barone',
        liberador_crbm: configs.liberador_crbm || '2691',
        rubrica_liberador: configs.rubrica_liberador || '',
        
        rodape_laudo: configs.rodape_laudo || 'Este documento foi assinado eletronicamente e possui validade legal (MP nº 2.200-2/2001). AstraLab - Centro Universitário Módulo.',
        aviso_paciente: configs.aviso_paciente || 'Lembre-se de verificar o preparo necessário. A grande maioria dos exames de sangue exige jejum obrigatório de 8 a 12 horas.',
        
        // 2. E-MAIL E SMTP
        mail_host: configs.mail_host || '',
        mail_port: configs.mail_port || '587',
        mail_encryption: configs.mail_encryption || 'tls',
        mail_username: configs.mail_username || '',
        mail_password: '', 
        mail_from_address: configs.mail_from_address || '',
        mail_from_name: configs.mail_from_name || 'AstraLab',
    });

    // =========================================================
    // O CONVERSOR MÁGICO DE IMAGEM PARA BASE64
    // =========================================================
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'rubrica_revisor' | 'rubrica_liberador') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('A imagem é muito grande. Escolha uma assinatura com menos de 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.configuracoes.update'));
    };

    const inputClass = "mt-1 block w-full rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 text-sm font-medium text-slate-700 bg-white shadow-sm";

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-teal-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm">
                        <span className="text-lg leading-none">←</span> Voltar
                    </Link>
                    <h2 className="font-black text-2xl text-slate-800 tracking-tight">Hub de Configurações</h2>
                </div>
            }
        >
            <Head title="AstraLab - Hub Config" />

            <div className="py-12 bg-[#F4F9F9] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {flash?.success && <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg">{flash.success}</div>}

                    <div className="flex flex-col md:flex-row gap-8">
                        
                        {/* ==========================================
                            MENU LATERAL DE NAVEGAÇÃO (Limpo)
                            ========================================== */}
                        <div className="w-full md:w-1/4 space-y-2">
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 sticky top-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 pl-2">Geral</h3>
                                <button type="button" onClick={() => setAbaAtiva('instituicao')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${abaAtiva === 'instituicao' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'text-slate-600 hover:bg-slate-50'}`}>🏢 Instituição e PDF</button>
                                <button type="button" onClick={() => setAbaAtiva('email')} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${abaAtiva === 'email' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'text-slate-600 hover:bg-slate-50'}`}>📩 Servidor de E-mail</button>
                            </div>
                        </div>

                        {/* ==========================================
                            ÁREA DE CONTEÚDO (O FORMULÁRIO)
                            ========================================== */}
                        <div className="w-full md:w-3/4">
                            <form onSubmit={submit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative pb-28 min-h-[600px]">
                                
                                {/* ABA: INSTITUIÇÃO E ASSINATURAS */}
                                {abaAtiva === 'instituicao' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <h3 className="text-2xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">Dados Institucionais e Impressão</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2"><InputLabel value="Nome do Laboratório" /><TextInput className={inputClass} value={data.lab_nome} onChange={e => setData('lab_nome', e.target.value)} /></div>
                                            <div className="md:col-span-2"><InputLabel value="Endereço Completo (Cabeçalho do PDF)" /><TextInput className={inputClass} value={data.lab_endereco} onChange={e => setData('lab_endereco', e.target.value)} /></div>
                                            <div><InputLabel value="Telefone de Contato" /><TextInput className={inputClass} value={data.lab_telefone} onChange={e => setData('lab_telefone', e.target.value)} /></div>
                                            <div><InputLabel value="E-mail Público" /><TextInput className={inputClass} value={data.lab_email} onChange={e => setData('lab_email', e.target.value)} /></div>
                                            
                                            <h4 className="md:col-span-2 text-sm font-black text-teal-700 mt-4 uppercase">Assinaturas do Laudo</h4>
                                            
                                            {/* BLOCO DO REVISOR */}
                                            <div><InputLabel value="Nome do Revisor (Aprova)" /><TextInput className={inputClass} value={data.revisor_nome} onChange={e => setData('revisor_nome', e.target.value)} /></div>
                                            <div><InputLabel value="CRBM do Revisor" /><TextInput className={inputClass} value={data.revisor_crbm} onChange={e => setData('revisor_crbm', e.target.value)} /></div>
                                            <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 items-center mb-4">
                                                <div className="w-full md:w-1/3">
                                                    <InputLabel value="Rubrica / Assinatura (Revisor)" className="mb-2" />
                                                    <input type="file" accept="image/png, image/jpeg" className="hidden" ref={fileInputRevisor} onChange={e => handleImageUpload(e, 'rubrica_revisor')} />
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => fileInputRevisor.current?.click()} className="flex-1 py-2.5 bg-teal-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-teal-700 transition-colors shadow-sm">Carregar .PNG</button>
                                                        {data.rubrica_revisor && (
                                                            <button type="button" onClick={() => setData('rubrica_revisor', '')} className="py-2.5 px-4 bg-red-100 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-200 transition-colors" title="Remover Assinatura">X</button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-2/3 h-20 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {data.rubrica_revisor ? <img src={data.rubrica_revisor} alt="Rubrica Revisor" className="max-h-full object-contain p-2" /> : <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Nenhuma imagem carregada</span>}
                                                </div>
                                            </div>

                                            {/* BLOCO DO LIBERADOR */}
                                            <div><InputLabel value="Nome do Liberador (Assina)" /><TextInput className={inputClass} value={data.liberador_nome} onChange={e => setData('liberador_nome', e.target.value)} /></div>
                                            <div><InputLabel value="CRBM do Liberador" /><TextInput className={inputClass} value={data.liberador_crbm} onChange={e => setData('liberador_crbm', e.target.value)} /></div>
                                            <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                                                <div className="w-full md:w-1/3">
                                                    <InputLabel value="Rubrica / Assinatura (Liberador)" className="mb-2" />
                                                    <input type="file" accept="image/png, image/jpeg" className="hidden" ref={fileInputLiberador} onChange={e => handleImageUpload(e, 'rubrica_liberador')} />
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => fileInputLiberador.current?.click()} className="flex-1 py-2.5 bg-teal-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-teal-700 transition-colors shadow-sm">Carregar .PNG</button>
                                                        {data.rubrica_liberador && (
                                                            <button type="button" onClick={() => setData('rubrica_liberador', '')} className="py-2.5 px-4 bg-red-100 text-red-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-200 transition-colors" title="Remover Assinatura">X</button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-2/3 h-20 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {data.rubrica_liberador ? <img src={data.rubrica_liberador} alt="Rubrica Liberador" className="max-h-full object-contain p-2" /> : <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Nenhuma imagem carregada</span>}
                                                </div>
                                            </div>

                                            <h4 className="md:col-span-2 text-sm font-black text-teal-700 mt-4 uppercase">Textos Padrão</h4>
                                            <div className="md:col-span-2"><InputLabel value="Rodapé Fixo do Laudo PDF" /><textarea rows={2} className={`${inputClass} resize-none p-3`} value={data.rodape_laudo} onChange={e => setData('rodape_laudo', e.target.value)} /></div>
                                            <div className="md:col-span-2"><InputLabel value="Aviso do Painel do Paciente (Preparo)" /><textarea rows={2} className={`${inputClass} resize-none p-3`} value={data.aviso_paciente} onChange={e => setData('aviso_paciente', e.target.value)} /></div>
                                        </div>
                                    </div>
                                )}

                                {/* ABA: E-MAIL */}
                                {abaAtiva === 'email' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                            <h3 className="text-2xl font-black text-slate-800">Servidor SMTP</h3>
                                            <button type="button" onClick={() => router.post(route('admin.configuracoes.testar-email'))} className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-100 transition-colors shadow-sm">📩 Testar Conexão</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><InputLabel value="Host SMTP" /><TextInput className={inputClass} value={data.mail_host} onChange={e => setData('mail_host', e.target.value)} /></div>
                                            <div><InputLabel value="Porta" /><TextInput className={inputClass} value={data.mail_port} onChange={e => setData('mail_port', e.target.value)} /></div>
                                            <div className="md:col-span-2"><InputLabel value="Usuário (E-mail)" /><TextInput type="email" className={inputClass} value={data.mail_username} onChange={e => setData('mail_username', e.target.value)} /></div>
                                            <div className="md:col-span-2"><InputLabel value="Senha do E-mail (Oculta)" /><TextInput type="password" placeholder="Em branco para não alterar" className={inputClass} value={data.mail_password} onChange={e => setData('mail_password', e.target.value)} /></div>
                                            <div><InputLabel value="Nome do Remetente" /><TextInput className={inputClass} value={data.mail_from_name} onChange={e => setData('mail_from_name', e.target.value)} /></div>
                                            <div><InputLabel value="Segurança" />
                                                <select className={`${inputClass} p-3`} value={data.mail_encryption} onChange={e => setData('mail_encryption', e.target.value)}>
                                                    <option value="tls">TLS</option><option value="ssl">SSL</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RODAPÉ FIXO DO FORMULÁRIO (Salvar) */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-sm border-t border-slate-100 rounded-b-[2.5rem] flex items-center justify-end gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                                    {recentlySuccessful && <p className="text-sm font-bold text-teal-600 animate-pulse bg-teal-50 px-4 py-2 rounded-xl border border-teal-100">✔ Salvo com sucesso!</p>}
                                    <button type="submit" disabled={processing} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg hover:-translate-y-1 disabled:opacity-50">
                                        {processing ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}