import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

const equipe = [
    'Carlos Daniel Felix',
    'Eduardo Ferreira Cabral',
    'Felipe Bueno Rozani',
    'Júlia Santos Souza',
    'Karine dos Santos Amorim',
    'Kauã Felix de Amorim',
    'Pedro Nascimento Puertas',
];

const valores = [
    { titulo: 'Acolhimento', texto: 'Respeitar cada pessoa e tornar as informações sobre seu atendimento mais claras e acessíveis.' },
    { titulo: 'Responsabilidade', texto: 'Valorizar a conferência dos resultados e a identificação dos profissionais envolvidos em cada etapa.' },
    { titulo: 'Privacidade', texto: 'Tratar os dados dos pacientes com cuidado e responsabilidade durante toda a jornada.' },
    { titulo: 'Aprendizado', texto: 'Aproximar a formação dos alunos da rotina laboratorial, com acompanhamento e revisão docente.' },
];

const etapas = [
    { titulo: 'Agendar e se preparar', texto: 'O paciente agenda seu exame e consulta as orientações de preparo para o atendimento.' },
    { titulo: 'Acompanhar o atendimento', texto: 'A equipe organiza os pedidos e registra as informações da coleta e dos exames.' },
    { titulo: 'Revisar os resultados', texto: 'Os resultados registrados pelos alunos passam pela revisão do professor responsável antes da liberação.' },
    { titulo: 'Consultar o laudo', texto: 'Após a liberação, o paciente acessa seu laudo e acompanha o histórico de exames pelo portal.' },
];

export default function SobreNos({ auth }: PageProps) {
    const inicio = auth?.user ? '/dashboard' : '/';
    const portal = auth?.user ? '/dashboard' : '/login';
    const foco = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#15803d]';

    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-700 selection:bg-[#15803d] selection:text-white">
            <Head title="Sobre Nós - AstraLab">
                <meta name="description" content="Conheça o AstraLab: nosso propósito, missão, visão e valores para conectar pacientes, equipe laboratorial e formação supervisionada." />
            </Head>

            <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-4">
                Ir para o conteúdo
            </a>

            <header className="border-b border-slate-200 bg-white/95">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                    <Link href={inicio} aria-label="AstraLab — início" className={`flex items-center gap-3 rounded-lg ${foco}`}>
                        <img src="/favicon.png" alt="" className="h-12 w-auto" />
                        <span className="text-3xl font-black tracking-tight text-[#0f1c3f]">Astra<span className="text-[#15803d]">Lab</span></span>
                    </Link>
                    <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-4 text-sm font-bold sm:gap-6">
                        <Link href={inicio} className={`rounded hover:text-[#15803d] ${foco}`}>{auth?.user ? 'Meu painel' : 'Início'}</Link>
                        <Link href="/sobre-nos" aria-current="page" className={`rounded text-[#15803d] underline decoration-2 underline-offset-8 ${foco}`}>Sobre Nós</Link>
                        <Link href="/contato" className={`rounded hover:text-[#15803d] ${foco}`}>Contato</Link>
                        <Link href={portal} className={`rounded-full bg-[#1f547e] px-5 py-3 text-white transition-colors hover:bg-[#163e5e] ${foco}`}>Portal do paciente</Link>
                    </nav>
                </div>
            </header>

            <main id="conteudo" tabIndex={-1}>
                <section aria-labelledby="sobre-titulo" className="relative overflow-hidden">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-green-100/70 blur-3xl" />
                    <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-24">
                        <div className="lg:col-span-3">
                            <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-[#15803d]">Sobre Nós · AstraLab</p>
                            <h1 id="sobre-titulo" className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#0f1c3f] sm:text-5xl lg:text-6xl">
                                Por trás de cada exame, <span className="text-[#15803d]">existe uma pessoa.</span>
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-relaxed">
                                O AstraLab é um projeto de gestão para laboratórios de análises clínicas que aproxima pacientes, equipe e ensino. Nosso propósito é organizar o caminho entre o agendamento e a entrega do laudo, com informação clara e atenção a cada etapa.
                            </p>
                            <a
                                href="#nosso-proposito"
                                onClick={(event) => {
                                    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
                                    const destino = document.getElementById('nosso-proposito');
                                    if (!destino) return;
                                    event.preventDefault();
                                    destino.scrollIntoView({
                                        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                                        block: 'start',
                                    });
                                }}
                                className={`mt-8 inline-flex rounded-full border border-[#1f547e] px-6 py-3 text-sm font-bold text-[#1f547e] transition-colors duration-300 hover:border-[#0f1c3f] hover:bg-[#0f1c3f] hover:text-white ${foco}`}
                            >
                                Conheça nosso propósito <span aria-hidden="true" className="ml-3">↓</span>
                            </a>
                        </div>
                        <aside className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-[#1f547e]/5 sm:p-9 lg:col-span-2">
                            <p className="text-xs font-black uppercase tracking-widest text-[#1f547e]">Nosso contexto</p>
                            <h2 className="mt-4 text-2xl font-black text-[#0f1c3f]">A rotina de um laboratório, conectada.</h2>
                            <p className="mt-4 leading-relaxed">
                                Um laboratório recebe pacientes, organiza coletas, analisa amostras e entrega resultados. Para que essa jornada aconteça, recepção, equipe técnica e responsáveis pela revisão precisam trabalhar em conjunto.
                            </p>
                            <div className="mt-6 border-t border-slate-100 pt-6">
                                <p className="font-bold text-[#15803d]">Cuidado que também ensina</p>
                                <p className="mt-2 text-sm leading-relaxed">No contexto acadêmico do projeto, alunos participam dessa rotina com supervisão de professores, conectando o aprendizado à responsabilidade no atendimento.</p>
                            </div>
                        </aside>
                    </div>
                </section>

                <section id="nosso-proposito" aria-labelledby="proposito-titulo" className="border-y border-slate-200 bg-white">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
                        <div>
                            <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#15803d]">Por que existimos</p>
                            <h2 id="proposito-titulo" className="text-3xl font-black tracking-tight text-[#0f1c3f]">Mais organização para quem cuida. Mais clareza para quem espera.</h2>
                        </div>
                        <div className="space-y-4 leading-relaxed">
                            <p>Quando as informações de um atendimento ficam dispersas, acompanhar pedidos, conferir resultados e localizar laudos se torna mais difícil. O paciente precisa saber como acessar seus exames, e a equipe precisa entender o que está pendente e quem é responsável por cada etapa.</p>
                            <p>O AstraLab foi desenvolvido para reunir essa jornada em um só sistema. Agendamento, registro do atendimento, revisão e consulta de laudos se conectam para apoiar a organização do laboratório e a formação supervisionada dos alunos.</p>
                        </div>
                    </div>
                </section>

                <section aria-label="Missão, visão e valores" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        <article className="rounded-[2rem] bg-[#0f1c3f] p-8 text-white sm:p-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-green-300">O que nos move</p>
                            <h2 className="mt-3 text-3xl font-black">Nossa missão</h2>
                            <p className="mt-5 leading-relaxed text-slate-200">Apoiar o atendimento laboratorial com uma jornada organizada e acessível, facilitando o trabalho da equipe, o acesso do paciente aos seus laudos e o aprendizado responsável dos alunos.</p>
                        </article>
                        <article className="rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#15803d]">O futuro que buscamos</p>
                            <h2 className="mt-3 text-3xl font-black text-[#0f1c3f]">Nossa visão</h2>
                            <p className="mt-5 leading-relaxed">Contribuir para uma rotina laboratorial em que tecnologia, atendimento humanizado e ensino caminhem juntos, com informações compreensíveis e colaboração entre todos os envolvidos.</p>
                        </article>
                    </div>
                    <h2 className="mb-8 mt-14 text-3xl font-black text-[#0f1c3f]">Os valores que orientam nossas escolhas</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {valores.map((valor, index) => (
                            <article key={valor.titulo} className="rounded-2xl border border-slate-200 bg-white p-6">
                                <span aria-hidden="true" className="text-sm font-black text-[#15803d]">0{index + 1}</span>
                                <h3 className="mb-3 mt-4 text-lg font-black text-[#1f547e]">{valor.titulo}</h3>
                                <p className="text-sm leading-relaxed">{valor.texto}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="jornada-titulo" className="border-y border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                        <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#15803d]">Nosso propósito na prática</p>
                        <h2 id="jornada-titulo" className="text-3xl font-black text-[#0f1c3f]">Do primeiro agendamento ao laudo disponível</h2>
                        <p className="mt-4 max-w-3xl leading-relaxed">Pacientes, recepção, técnicos, alunos, professores e administradores participam de etapas diferentes, mas compartilham a mesma jornada.</p>
                        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {etapas.map((etapa, index) => (
                                <li key={etapa.titulo} className="border-t-2 border-green-200 pt-5">
                                    <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-sm font-black text-[#15803d]">{index + 1}</span>
                                    <h3 className="mb-3 mt-4 font-black text-[#1f547e]">{etapa.titulo}</h3>
                                    <p className="text-sm leading-relaxed">{etapa.texto}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section aria-labelledby="equipe-titulo" className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#15803d]">Quem faz o AstraLab</p>
                        <h2 id="equipe-titulo" className="text-3xl font-black tracking-tight text-[#0f1c3f] sm:text-4xl">Nossa equipe</h2>
                        <div aria-hidden="true" className="mx-auto mt-5 h-1 w-16 rounded-full bg-[#15803d]" />
                    </div>
                    <ul className="flex flex-wrap justify-center gap-6">
                        {equipe.map((nome) => (
                            <li key={nome} className="relative flex min-h-36 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm transition-colors duration-300 hover:border-[#1f547e] sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]">
                                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1f547e] to-[#15803d]" />
                                <p className="max-w-56 text-lg font-bold leading-relaxed text-[#0f1c3f]">{nome}</p>
                            </li>
                        ))}
                    </ul>
                </section>

                <section aria-labelledby="portal-titulo" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] bg-[#1f547e] p-8 text-white sm:p-10 md:flex-row md:items-center">
                        <div>
                            <h2 id="portal-titulo" className="text-2xl font-black">Sua jornada continua por aqui.</h2>
                            <p className="mt-3 max-w-xl leading-relaxed text-blue-100">Acesse o portal para acompanhar seus exames e consultar os laudos liberados.</p>
                        </div>
                        <Link href={portal} className="shrink-0 rounded-full bg-white px-6 py-4 text-sm font-black text-[#1f547e] transition-colors hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Acessar o portal <span aria-hidden="true">→</span></Link>
                    </div>
                </section>
            </main>

            <footer className="bg-[#0f1c3f] text-slate-300">
                <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 py-8 text-sm sm:flex-row sm:items-center sm:px-6 lg:px-8">
                    <p><span className="font-black text-white">AstraLab</span> · Tecnologia, cuidado e aprendizado.</p>
                    <Link href={inicio} className={`self-start rounded font-bold text-white hover:underline sm:self-auto ${foco}`}>{auth?.user ? 'Voltar ao meu painel' : 'Voltar ao início'}</Link>
                </div>
            </footer>
        </div>
    );
}
