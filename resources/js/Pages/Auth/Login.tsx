import { useEffect, FormEventHandler, useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import CookieBanner from '@/Components/CookieBanner'; // <-- IMPORTAÇÃO DO SEU COMPONENTE
import { PageProps } from '@/types';

export default function Login({ auth, status, canResetPassword }: PageProps<{ status?: string, canResetPassword?: boolean }>) {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        cpf: '', 
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    const formatarCpf = (valor: string) => {
        const numeros = valor.replace(/\D/g, '').slice(0, 11);

        return numeros
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans selection:bg-[#15803d] selection:text-white relative flex items-center justify-center p-4 overflow-hidden">
            <Head title="Acesso ao Sistema | AstraLab" />

            {/* CSS OTIMIZADO (Efeito Glass premium e animações) */}
            <style>{`
                @keyframes ambientLight {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
                    50% { transform: translate3d(20px, -20px, 0) scale(1.05); }
                }
                .animate-ambient { animation: ambientLight 15s ease-in-out infinite; will-change: transform; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                
                .glass-premium {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 1);
                    box-shadow: 0 20px 40px -15px rgba(31, 84, 126, 0.15); 
                    transform: translateZ(0); 
                }
            `}</style>

            {/* FUNDO FIXO ORBS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-[#1f547e]/10 rounded-full blur-3xl animate-ambient"></div>
                <div className="absolute top-[40%] right-[-10%] w-[35rem] h-[35rem] bg-[#15803d]/10 rounded-full blur-3xl animate-ambient delay-200"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-[#1f547e]/10 rounded-full blur-3xl animate-ambient delay-300"></div>
            </div>

            {/* CARD DE LOGIN */}
            <div className="w-full max-w-md glass-premium rounded-[3rem] p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in duration-500">
                
                {/* CABEÇALHO DO CARD */}
                <div className="flex flex-col items-center mb-6">
                    <Link href="/" className="flex flex-col items-center">
                        <img 
                            src="/favicon.png" 
                            alt="Logo AstraLab" 
                            className="h-24 w-auto object-contain drop-shadow-sm mb-2 transition transform hover:scale-105" 
                        />
                        <h2 className="text-4xl font-black tracking-tight">
                            <span className="text-[#0f1c3f]">Astra</span><span className="text-[#15803d]">Lab</span>
                        </h2>
                    </Link>
                    
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 mb-4">
                        Centro de Diagnóstico
                    </p>
                    
                    <p className="text-sm text-slate-500 text-center font-medium leading-relaxed px-2">
                        Digite seu CPF e sua senha para acessar o sistema com o seu perfil.
                    </p>
                </div>

                {status && (
                    <div className="mb-6 font-bold text-sm text-[#15803d] bg-green-50 p-4 rounded-2xl border border-green-200 text-center shadow-sm">
                        {status}
                    </div>
                )}

                {auth?.user && (
                    <div role="status" className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-[#1f547e]">
                        <p>Conta atual: <strong>{auth.user.name}</strong> ({auth.user.tipo_usuario}).</p>
                        <p className="mt-2">Para trocar de conta, informe o CPF e a senha abaixo.</p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    {/* CAMPO DE CPF */}
                    <div>
                        <InputLabel htmlFor="cpf" value="CPF" className="!text-[#1f547e] !font-black !text-xs uppercase tracking-widest mb-1" />
                        <TextInput
                            id="cpf"
                            type="text"
                            name="cpf"
                            value={data.cpf}
                            className="mt-1 block w-full !rounded-2xl !border-slate-200 !bg-slate-50 focus:!bg-white focus:!border-[#15803d] focus:!ring-[#15803d] shadow-sm !p-4 !font-bold text-slate-700 transition-colors"
                            autoComplete="username"
                            inputMode="numeric"
                            maxLength={14}
                            isFocused={true}
                            onChange={(e) => setData('cpf', formatarCpf(e.target.value))}
                            placeholder="000.000.000-00"
                            aria-describedby="cpf-ajuda"
                        />
                        <p id="cpf-ajuda" className="mt-2 text-xs font-medium text-slate-500">A pontuação é adicionada automaticamente.</p>
                        <InputError message={errors.cpf} className="mt-2 font-bold" />
                    </div>

                    {/* CAMPO DE SENHA */}
                    <div>
                        <InputLabel htmlFor="password" value="Senha" className="!text-[#1f547e] !font-black !text-xs uppercase tracking-widest mb-1" />
                        <div className="relative">
                            <TextInput
                                id="password"
                                type={mostrarSenha ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full !rounded-2xl !border-slate-200 !bg-slate-50 focus:!bg-white focus:!border-[#15803d] focus:!ring-[#15803d] shadow-sm !p-4 !pr-24 !font-bold text-slate-700 transition-colors"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Digite sua senha"
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha((valorAtual) => !valorAtual)}
                                aria-pressed={mostrarSenha}
                                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                className="absolute inset-y-0 right-0 flex items-center rounded-r-2xl px-4 text-[10px] font-black uppercase tracking-wider text-[#1f547e] transition-colors hover:text-[#15803d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d]"
                            >
                                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                        <InputError message={errors.password} className="mt-2 font-bold" />
                    </div>

                    {/* LEMBRAR-ME E ESQUECEU A SENHA */}
                    <div className="flex items-center justify-between pt-1 pb-1">
                        <label className="flex items-center cursor-pointer group">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="!text-[#15803d] focus:!ring-[#15803d] !rounded border-slate-300 transition-colors"
                            />
                            <span className="ms-2 text-xs text-slate-500 font-bold uppercase tracking-wider group-hover:text-[#1f547e] transition-colors">
                                Lembrar-me
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-black text-[#15803d] uppercase tracking-wider hover:text-[#1f547e] transition-colors"
                            >
                                Recuperar Senha?
                            </Link>
                        )}
                    </div>

                    {/* BOTÃO DE LOGIN */}
                    <div className="pt-2">
                        <button 
                            disabled={processing}
                            className="w-full bg-[#1f547e] hover:bg-[#163e5e] text-white font-black py-4 px-4 rounded-2xl shadow-lg shadow-[#1f547e]/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs flex justify-center items-center"
                        >
                            {processing ? (
                                <span className="flex items-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Autenticando...
                                </span>
                            ) : 'Entrar no sistema'}
                        </button>
                    </div>
                    
                    {/* LINK DE VOLTAR */}
                    <div className="text-center mt-6 pt-5 border-t border-slate-100">
                        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1f547e] transition-colors flex items-center justify-center gap-2">
                            <span className="text-sm leading-none">←</span> Voltar para a Página Inicial
                        </Link>
                    </div>
                </form>
            </div>

            {/* SEU COMPONENTE DE COOKIES INJETADO AQUI */}
            <CookieBanner />
            
        </div>
    );
}
