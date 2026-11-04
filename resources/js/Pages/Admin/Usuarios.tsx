import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface UserData {
    id: number;
    name: string;
    email: string;
    cpf: string;
    tipo_usuario: string;
    status: string;
}

interface UsuariosProps extends PageProps {
    usuariosLista: UserData[];
}

export default function Usuarios({ auth, usuariosLista = [] }: UsuariosProps) {
    const { flash } = usePage().props as any; 
    const [busca, setBusca] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [modalAberto, setModalAberto] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);

    const { data, setData, post, patch, processing, reset, errors, clearErrors } = useForm({
        id: 0,
        name: '',
        email: '', 
        cpf: '',
        tipo_usuario: 'Tecnico',
        status: 'Ativo',
        password: '',
    });

    const usuariosFiltrados = usuariosLista.filter(u => {
        const matchesBusca = 
            u.name.toLowerCase().includes(busca.toLowerCase()) || 
            u.cpf.includes(busca) || 
            u.email.toLowerCase().includes(busca.toLowerCase());
        const matchesTipo = filtroTipo === 'Todos' || u.tipo_usuario === filtroTipo;
        return matchesBusca && matchesTipo;
    });

    const abrirModalNovo = () => {
        setModoEdicao(false);
        reset();
        clearErrors();
        setModalAberto(true);
    };

    const abrirModalEditar = (u: UserData) => {
        setModoEdicao(true);
        clearErrors();
        setData({
            id: u.id,
            name: u.name,
            email: u.email,
            cpf: u.cpf,
            tipo_usuario: u.tipo_usuario,
            status: u.status,
            password: '', 
        });
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
        reset();
    };

    // Máscara inteligente para o CPF
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, ''); 
        
        if (v.length > 11) {
            v = v.substring(0, 11);
        }

        if (v.length > 9) {
            v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        } else if (v.length > 6) {
            v = v.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
        } else if (v.length > 3) {
            v = v.replace(/(\d{3})(\d{3})/, "$1.$2");
        }
        setData('cpf', v);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modoEdicao) {
            patch(route('admin.usuarios.update', data.id), {
                onSuccess: () => fecharModal(),
            });
        } else {
            post(route('admin.usuarios.store'), {
                onSuccess: () => fecharModal(),
            });
        }
    };

    const handleToggleStatus = (id: number) => {
        if (confirm('Deseja alterar o status de acesso deste usuário?')) {
            router.put(route('admin.usuarios.status', id));
        }
    };

    const handleExcluir = (id: number, nome: string) => {
        if (confirm(`AVISO CRÍTICO: Deseja realmente excluir permanentemente o usuário ${nome}? Esta ação não pode ser desfeita.`)) {
            router.delete(route('admin.usuarios.destroy', id));
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
                    <h2 className="font-black text-2xl text-blue-950 tracking-tight">Gestão de Usuários</h2>
                </div>
            }
        >
            <Head title="AstraLab - Gerenciar Equipe" />
            
            {/* Fundo padronizado AstraLab */}
            <div className="py-12 bg-[#F0F4F8] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* AVISO DE SUCESSO FLUTUANTE */}
                    {flash?.success && (
                        <div className="bg-green-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg animate-in fade-in slide-in-from-top-4">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center shadow-lg animate-in fade-in slide-in-from-top-4">
                            {flash.error}
                        </div>
                    )}

                    {/* BARRA DE FERRAMENTAS AVANÇADA */}
                    <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center">
                        
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto flex-1">
                            <div className="hidden xl:flex items-center gap-4 mr-2 shrink-0">
                                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-2xl text-blue-600 shadow-inner">👥</div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg leading-tight">Equipe</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acessos</p>
                                </div>
                            </div>

                            <div className="relative w-full md:w-72 shrink-0">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Nome, CPF ou E-mail..." 
                                    className="w-full pl-12 pr-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-600 transition-all text-sm h-[48px]"
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 w-full md:w-auto overflow-x-auto h-[48px] items-center hide-scrollbar">
                                {['Todos', 'Administrador', 'Professor', 'Tecnico', 'Aluno', 'Paciente'].map((tipo) => (
                                    <button
                                        key={tipo}
                                        onClick={() => setFiltroTipo(tipo)}
                                        className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all whitespace-nowrap h-full flex items-center ${
                                            filtroTipo === tipo 
                                            ? 'bg-white text-blue-800 shadow-sm border border-slate-200' 
                                            : 'text-slate-400 hover:text-blue-600'
                                        }`}
                                    >
                                        {tipo === 'Tecnico' ? 'Staff' : tipo === 'Todos' ? 'Geral' : tipo}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button 
                            onClick={abrirModalNovo}
                            className="bg-green-700 text-white px-6 h-[48px] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-800 shadow-lg shadow-green-700/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full lg:w-auto justify-center shrink-0"
                        >
                            <span>+</span> NOVO USUÁRIO
                        </button>
                    </div>

                    {/* LISTAGEM PRINCIPAL */}
                    <div className="bg-white overflow-hidden rounded-[2.5rem] shadow-sm border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                                        <th className="p-8">Informações Básicas</th>
                                        <th className="p-8 text-center">Perfil</th>
                                        <th className="p-8 text-center">Acesso</th>
                                        <th className="p-8 text-right">Controle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {usuariosFiltrados.map((u) => (
                                        <tr key={u.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="p-8">
                                                <div className="flex items-center gap-5">
                                                    {/* Cores padronizadas por perfil */}
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border ${
                                                        u.tipo_usuario === 'Administrador' ? 'bg-blue-950 text-white border-blue-900' :
                                                        u.tipo_usuario === 'Professor' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                                        u.tipo_usuario === 'Paciente' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                                                        'bg-cyan-100 text-cyan-700 border-cyan-200'
                                                    }`}>
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-lg leading-tight group-hover:text-blue-900 transition-colors">{u.name}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs font-mono font-bold text-slate-400">{u.cpf}</span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                            <span className="text-[11px] font-bold text-slate-400">{u.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-8 text-center">
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border shadow-sm ${
                                                    u.tipo_usuario === 'Administrador' ? 'bg-blue-950 text-white border-blue-900' :
                                                    u.tipo_usuario === 'Professor' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                    u.tipo_usuario === 'Paciente' ? 'bg-slate-50 text-slate-600 border-slate-200' : 
                                                    'bg-cyan-50 text-cyan-700 border-cyan-100'
                                                }`}>
                                                    {u.tipo_usuario}
                                                </span>
                                            </td>
                                            <td className="p-8 text-center">
                                                <button 
                                                    onClick={() => handleToggleStatus(u.id)}
                                                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black transition-all border-2 shadow-sm ${
                                                        u.status === 'Ativo' 
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Ativo' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                    {u.status.toUpperCase()}
                                                </button>
                                            </td>
                                            <td className="p-8 text-right space-x-2 whitespace-nowrap">
                                                <button 
                                                    onClick={() => abrirModalEditar(u)}
                                                    className="bg-slate-100 text-slate-500 hover:bg-blue-950 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all"
                                                >
                                                    EDITAR
                                                </button>
                                                <button 
                                                    onClick={() => handleExcluir(u.id, u.name)}
                                                    className="bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all"
                                                >
                                                    EXCLUIR
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {usuariosFiltrados.length === 0 && (
                            <div className="p-20 text-center">
                                <span className="text-4xl block mb-4 opacity-20 text-blue-900">👥</span>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum usuário encontrado para esta pesquisa.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE GESTÃO COMPLETA */}
            {modalAberto && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all border border-slate-100 flex flex-col max-h-[90vh]">
                        
                        <div className="bg-slate-50 p-8 flex justify-between items-center border-b border-slate-200 shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-blue-950 leading-tight">
                                    {modoEdicao ? 'Configuração de Perfil' : 'Novo Membro AstraLab'}
                                </h3>
                                <p className="text-blue-600 text-[10px] font-bold uppercase mt-1 tracking-widest">
                                    {modoEdicao ? `Editando Usuário: #${data.id}` : 'Cadastro Inicial de Usuário'}
                                </p>
                            </div>
                            <button onClick={fecharModal} className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">&times;</button>
                        </div>

                        <div className="overflow-y-auto p-8 flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <form id="userForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nome Completo</label>
                                        <input 
                                            type="text" 
                                            className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-0 p-4 font-bold text-slate-700 transition-all" 
                                            value={data.name} 
                                            onChange={e => setData('name', e.target.value)} 
                                            required 
                                        />
                                        {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">E-mail de Acesso</label>
                                        <input 
                                            type="email" 
                                            className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-0 p-4 font-bold text-slate-700 transition-all" 
                                            value={data.email} 
                                            onChange={e => setData('email', e.target.value)} 
                                            required 
                                        />
                                        {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.email}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">CPF (Identificação Única)</label>
                                        <input 
                                            type="text" 
                                            disabled={modoEdicao}
                                            className={`w-full border-2 rounded-2xl p-4 font-mono font-bold text-slate-700 transition-all ${modoEdicao ? 'border-slate-50 bg-slate-100 opacity-60 cursor-not-allowed' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'}`} 
                                            value={data.cpf} 
                                            onChange={handleCpfChange} 
                                            placeholder="000.000.000-00"
                                            required 
                                        />
                                        {errors.cpf && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.cpf}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Cargo / Permissão</label>
                                        <select 
                                            className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-0 p-4 font-bold text-slate-700 transition-all appearance-none"
                                            value={data.tipo_usuario}
                                            onChange={e => setData('tipo_usuario', e.target.value)}
                                        >
                                            <option value="Administrador">Administrador</option>
                                            <option value="Professor">Professor / Supervisor</option>
                                            <option value="Tecnico">Técnico / Staff</option>
                                            <option value="Aluno">Aluno Estagiário</option>
                                            <option value="Paciente">Paciente</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Status no Sistema</label>
                                        <select 
                                            className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-0 p-4 font-bold text-slate-700 transition-all appearance-none"
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                        >
                                            <option value="Ativo">Ativo</option>
                                            <option value="Inativo">Inativo / Suspenso</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                                            {modoEdicao ? 'Redefinir Senha (Opcional)' : 'Senha Inicial de Acesso'}
                                        </label>
                                        <input 
                                            type="password" 
                                            placeholder={modoEdicao ? "Deixe em branco para manter a atual" : "*******"}
                                            className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-0 p-4 font-black text-slate-700 transition-all placeholder:font-medium" 
                                            value={data.password} 
                                            onChange={e => setData('password', e.target.value)} 
                                            required={!modoEdicao}
                                        />
                                        {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.password}</p>}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 bg-white flex gap-4 border-t border-slate-200 shrink-0">
                            <button 
                                type="button" 
                                onClick={fecharModal} 
                                className="flex-1 py-4 bg-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 hover:text-slate-700 transition-all border border-slate-200"
                            >
                                CANCELAR
                            </button>
                            <button 
                                type="submit" 
                                form="userForm"
                                disabled={processing}
                                className="flex-[2] py-4 bg-green-700 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-green-700/20 hover:bg-green-800 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                            >
                                {processing ? 'PROCESSANDO...' : 'SALVAR USUÁRIO'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}