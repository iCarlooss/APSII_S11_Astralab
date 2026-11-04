import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { PageProps } from '@/types';

export default function Contato({ auth, protocolo }: PageProps<{ protocolo: string | null }>) {
    const inicio = auth?.user ? '/dashboard' : '/';
    const [falhaDeRede, setFalhaDeRede] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        nome: auth?.user?.name ?? '',
        email: auth?.user?.email ?? '',
        telefone: '',
        motivo: '',
        mensagem: '',
        envio: '',
    });
    const campo = 'mt-2 w-full rounded-xl border-slate-300 bg-white text-slate-800 focus:border-[#15803d] focus:ring-[#15803d]';
    const foco = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#15803d]';
    const canalInformado = Boolean(data.email.trim() || data.telefone.trim());
    const exemplosPorMotivo: Record<string, string> = {
        agendamento: 'Informe quais exames deseja realizar e os melhores dias ou horários para atendimento.',
        duvida: 'Descreva sua dúvida para que a equipe possa orientar você com clareza.',
        suporte: 'Conte o que aconteceu no portal e em qual etapa você precisa de ajuda.',
        outro: 'Conte como a equipe do AstraLab pode ajudar você.',
    };

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFalhaDeRede(false);
        let recebeuResposta = false;
        post('/contato', {
            preserveScroll: true,
            onSuccess: () => { recebeuResposta = true; reset('mensagem', 'motivo'); },
            onError: () => { recebeuResposta = true; },
            onFinish: () => { if (!recebeuResposta) setFalhaDeRede(true); },
        });
    }

    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-700">
            <Head title="Contato - AstraLab" />
            <a href="#formulario-contato" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-4">Ir para o formulário</a>
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-4 py-5 sm:px-6 lg:px-8">
                    <Link href={inicio} aria-label="AstraLab — início" className={`flex items-center gap-3 rounded-lg ${foco}`}>
                        <img src="/favicon.png" alt="" className="h-12 w-auto" />
                        <span className="text-3xl font-black tracking-tight text-[#0f1c3f]">Astra<span className="text-[#15803d]">Lab</span></span>
                    </Link>
                    <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-5 text-sm font-bold">
                        <Link href={inicio} className={`rounded hover:text-[#15803d] ${foco}`}>{auth?.user ? 'Meu painel' : 'Início'}</Link>
                        <Link href="/sobre-nos" className={`rounded hover:text-[#15803d] ${foco}`}>Sobre Nós</Link>
                        <Link href="/contato" aria-current="page" className={`rounded text-[#15803d] underline underline-offset-8 ${foco}`}>Contato</Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:gap-16 lg:px-8 lg:py-20">
                <section aria-labelledby="contato-titulo" className="lg:col-span-2">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#15803d]">Vamos conversar</p>
                    <h1 id="contato-titulo" className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#0f1c3f] sm:text-5xl">Seu primeiro contato começa aqui.</h1>
                    <p className="mt-6 text-lg leading-relaxed">Precisa de orientação sobre agendamento, tem uma dúvida ou precisa de ajuda com o portal? Conte para a equipe do AstraLab.</p>
                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                        <h2 className="font-black text-[#1f547e]">Prefere falar por e-mail?</h2>
                        <a href="mailto:c.alves@cs.modulo.edu.br" className={`mt-3 inline-block break-all rounded text-[#15803d] underline underline-offset-4 ${foco}`}>c.alves@cs.modulo.edu.br</a>
                    </div>
                    {/*
                    <div className="mt-6 rounded-2xl bg-[#0f1c3f] p-6 text-white">
                        <h2 className="text-xl font-black">Já quer escolher seus exames?</h2>
                        <p className="mt-3 text-sm leading-relaxed text-slate-200">No portal do paciente, você pode selecionar exames, data e horário para solicitar uma pré-reserva.</p>
                        <Link href="/paciente/agendar" className="mt-5 inline-block rounded-full bg-white px-5 py-3 text-sm font-bold text-[#1f547e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{auth?.user ? 'Solicitar agendamento' : 'Entrar para agendar'} <span aria-hidden="true">→</span></Link>
                    </div>
                    */}
                </section>

                <section aria-labelledby="formulario-titulo" className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-[#1f547e]/5 sm:p-10 lg:col-span-3">
                    <h2 id="formulario-titulo" className="text-2xl font-black text-[#0f1c3f]">Fale conosco</h2>
                    <p id="contato-orientacao" className="mt-3 text-sm leading-relaxed">Não é preciso ter cadastro. Informe seu nome, um e-mail ou telefone para retorno e o motivo do contato.</p>
                    {protocolo && (
                        <div role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900">
                            <p className="font-bold">Mensagem registrada com sucesso!</p>
                            <p className="mt-2 text-sm">A equipe poderá consultar sua solicitação. Este envio não confirma um agendamento.</p>
                            <p className="mt-3 break-all text-xs">Protocolo: <strong>{protocolo}</strong></p>
                        </div>
                    )}
                    {(errors.envio || falhaDeRede) && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{errors.envio || 'Não foi possível confirmar o envio. Verifique sua conexão antes de tentar novamente.'}</p>}
                    <form id="formulario-contato" onSubmit={submit} aria-describedby="contato-orientacao" className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="nome" className="text-sm font-bold">Nome <span className="text-[#15803d]">*</span></label>
                            <input id="nome" name="nome" autoComplete="name" required minLength={2} maxLength={120} value={data.nome} onChange={e => setData('nome', e.target.value)} className={campo} aria-invalid={!!errors.nome} aria-describedby={errors.nome ? 'nome-erro' : undefined} />
                            {errors.nome && <p id="nome-erro" role="alert" className="mt-2 text-sm text-red-700">{errors.nome}</p>}
                        </div>
                        <fieldset>
                            <legend className="text-sm font-bold">Como podemos retornar? <span className="text-[#15803d]">*</span></legend>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs text-slate-500">Use e-mail, telefone ou ambos. Apenas uma opção já é suficiente.</p>
                                <span aria-live="polite" className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${canalInformado ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {canalInformado ? 'Contato informado' : 'Informe uma opção'}
                                </span>
                            </div>
                            <div className="mt-4 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="email" className="text-sm font-bold">E-mail</label>
                                    <input id="email" name="email" type="email" autoComplete="email" required={!data.telefone.trim()} maxLength={254} value={data.email} onChange={e => setData('email', e.target.value)} className={campo} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-erro' : undefined} />
                                    {errors.email && <p id="email-erro" role="alert" className="mt-2 text-sm text-red-700">{errors.email}</p>}
                                </div>
                                <div>
                                    <label htmlFor="telefone" className="text-sm font-bold">Telefone com DDD</label>
                                    <input id="telefone" name="telefone" type="tel" autoComplete="tel" required={!data.email.trim()} maxLength={25} placeholder="(12) 99999-9999" value={data.telefone} onChange={e => setData('telefone', e.target.value)} className={campo} aria-invalid={!!errors.telefone} aria-describedby={errors.telefone ? 'telefone-erro' : undefined} />
                                    {errors.telefone && <p id="telefone-erro" role="alert" className="mt-2 text-sm text-red-700">{errors.telefone}</p>}
                                </div>
                            </div>
                        </fieldset>
                        <div>
                            <label htmlFor="motivo" className="text-sm font-bold">Motivo do contato <span className="text-[#15803d]">*</span></label>
                            <select id="motivo" name="motivo" required value={data.motivo} onChange={e => setData('motivo', e.target.value)} className={campo} aria-invalid={!!errors.motivo} aria-describedby={errors.motivo ? 'motivo-erro' : undefined}>
                                <option value="">Selecione uma opção</option>
                                <option value="agendamento">Orientação para agendamento</option>
                                <option value="duvida">Tirar uma dúvida</option>
                                <option value="suporte">Suporte ao portal</option>
                                <option value="outro">Outro assunto</option>
                            </select>
                            {errors.motivo && <p id="motivo-erro" role="alert" className="mt-2 text-sm text-red-700">{errors.motivo}</p>}
                        </div>
                        <div>
                            <label htmlFor="mensagem" className="text-sm font-bold">Mensagem <span className="text-[#15803d]">*</span></label>
                            <textarea id="mensagem" name="mensagem" required minLength={10} maxLength={3000} rows={6} value={data.mensagem} onChange={e => setData('mensagem', e.target.value)} placeholder={exemplosPorMotivo[data.motivo] ?? 'Selecione o motivo e conte como podemos ajudar você.'} className={campo} aria-invalid={!!errors.mensagem} aria-describedby={`mensagem-ajuda${errors.mensagem ? ' mensagem-erro' : ''}`} />
                            <div id="mensagem-ajuda" className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                                <span>Mínimo de 10 caracteres. Evite incluir senhas ou resultados de exames.</span>
                                <span aria-live="polite" className={data.mensagem.length >= 10 ? 'font-bold text-green-700' : 'font-bold'}>{data.mensagem.length}/3.000</span>
                            </div>
                            {errors.mensagem && <p id="mensagem-erro" role="alert" className="mt-2 text-sm text-red-700">{errors.mensagem}</p>}
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500">Os dados informados serão usados pela equipe para tratar sua solicitação e entrar em contato. Campos com * são obrigatórios.</p>
                        <button type="submit" disabled={processing} className={`w-full rounded-full bg-[#15803d] px-6 py-4 text-sm font-black text-white transition-colors hover:bg-[#116a32] disabled:cursor-wait disabled:opacity-60 ${foco}`}>{processing ? 'Enviando solicitação…' : 'Enviar solicitação'}</button>
                    </form>
                </section>
            </main>
            <footer className="border-t border-slate-200 bg-white px-4 py-7 text-center text-sm text-slate-600">AstraLab · Tecnologia, cuidado e aprendizado.</footer>
        </div>
    );
}
