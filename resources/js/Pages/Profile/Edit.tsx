import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Edit({ auth, mustVerifyEmail, status }: PageProps<{ mustVerifyEmail: boolean, status?: string }>) {
    
    // LÓGICA INTELIGENTE DO BOTÃO VOLTAR
    const rotaVoltar = auth.user.tipo_usuario === 'Administrador' 
        ? route('admin.dashboard') 
        : auth.user.tipo_usuario === 'Tecnico' || auth.user.tipo_usuario === 'Aluno'
            ? route('tecnico.dashboard') 
            : route('dashboard'); // Se não for Admin, Professor ou Aluno, volta pro Paciente

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <Link 
                        href={rotaVoltar} 
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-500 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                        <span className="text-lg leading-none">←</span> Voltar
                    </Link>
                    <h2 className="font-black text-2xl text-teal-950 tracking-tight">Meu Perfil</h2>
                </div>
            }
        >
            <Head title="AstraLab - Meu Perfil" />
            
            <div className="py-12 bg-[#F4F9F9] min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* CABEÇALHO DA TELA DE PERFIL */}
                    <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-teal-100 rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-teal-600 shadow-inner">
                            {auth.user.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-xl leading-tight">{auth.user.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{auth.user.tipo_usuario}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-[11px] font-mono text-slate-400">CPF: {auth.user.cpf}</span>
                            </div>
                        </div>
                    </div>

                    {/* FORMULÁRIOS PADRÃO DO LARAVEL COM DESIGN AJUSTADO */}
                    <div className="p-8 bg-white shadow-sm rounded-[2.5rem] border border-slate-100 transition-all hover:border-teal-200">
                        <UpdateProfileInformationForm 
                            mustVerifyEmail={mustVerifyEmail} 
                            status={status} 
                            className="max-w-xl" 
                        />
                    </div>

                    <div className="p-8 bg-white shadow-sm rounded-[2.5rem] border border-slate-100 transition-all hover:border-teal-200">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}