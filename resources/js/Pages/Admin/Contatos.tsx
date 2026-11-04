import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

interface ContatoData {
    id: number;
    protocolo: string;
    nome: string;
    email: string | null;
    telefone: string | null;
    motivo: string;
    mensagem: string;
    created_at: string;
    atendido_em: string | null;
}

const motivos: Record<string, string> = { agendamento: 'Orientação para agendamento', duvida: 'Dúvida', suporte: 'Suporte ao portal', outro: 'Outro assunto' };

function Solicitacao({ contato }: { contato: ContatoData }) {
    const { patch, processing } = useForm({});

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-bold text-[#15803d]">{motivos[contato.motivo] ?? contato.motivo}</p>
                    <h2 className="mt-2 break-words text-xl font-black text-[#0f1c3f]">{contato.nome}</h2>
                    <p className="mt-2 text-xs text-slate-500">Recebida em {new Date(contato.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${contato.atendido_em ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>{contato.atendido_em ? 'Atendida' : 'Nova'}</span>
            </div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="font-bold">E-mail</dt><dd className="mt-1 break-all">{contato.email || 'Não informado'}</dd></div>
                <div><dt className="font-bold">Telefone</dt><dd className="mt-1">{contato.telefone || 'Não informado'}</dd></div>
            </dl>
            <p className="mt-5 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-relaxed">{contato.mensagem}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="break-all text-xs text-slate-500">Protocolo: {contato.protocolo}</p>
                {contato.atendido_em ? (
                    <p className="text-xs font-bold text-green-800">Atendida em {new Date(contato.atendido_em).toLocaleString('pt-BR')}</p>
                ) : (
                    <button type="button" disabled={processing} onClick={() => patch(`/admin/contatos/${contato.id}/atender`, { preserveScroll: true })} className="rounded-full bg-[#1f547e] px-5 py-3 text-sm font-bold text-white hover:bg-[#163e5e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f547e] disabled:opacity-50">{processing ? 'Salvando…' : 'Marcar como atendida'}</button>
                )}
            </div>
        </article>
    );
}

export default function Contatos({ auth, contatos }: PageProps<{ contatos: { data: ContatoData[]; current_page: number; last_page: number; total: number; prev_page_url: string | null; next_page_url: string | null } }>) {
    return (
        <AuthenticatedLayout user={auth.user} header={<h1 className="text-2xl font-black text-[#0f1c3f]">Solicitações de contato</h1>}>
            <Head title="Solicitações de contato - AstraLab" />
            <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
                <p className="text-sm leading-relaxed text-slate-600">Consulte as mensagens recebidas e use o e-mail ou telefone informado para retornar. Marque como atendida após tratar a solicitação. Essa ação registra o atendimento e não envia uma resposta automaticamente.</p>
                <p className="text-sm font-bold text-[#1f547e]">{contatos.total} solicitação(ões) · Novas primeiro</p>
                {contatos.data.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Nenhuma solicitação de contato recebida.</div>}
                {contatos.data.map(contato => <Solicitacao key={contato.id} contato={contato} />)}
                {contatos.last_page > 1 && (
                    <nav aria-label="Páginas de solicitações" className="flex flex-wrap items-center justify-between gap-4 text-sm">
                        {contatos.prev_page_url ? <Link href={contatos.prev_page_url} className="rounded-xl bg-white px-5 py-3 font-bold text-[#1f547e]">Anterior</Link> : <span />}
                        <span>Página {contatos.current_page} de {contatos.last_page}</span>
                        {contatos.next_page_url ? <Link href={contatos.next_page_url} className="rounded-xl bg-white px-5 py-3 font-bold text-[#1f547e]">Próxima</Link> : <span />}
                    </nav>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
