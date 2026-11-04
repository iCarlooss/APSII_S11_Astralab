<?php

namespace App\Http\Controllers;

use App\Models\Contato;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContatoController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('Contato/Index', [
            'protocolo' => $request->session()->get('contato_protocolo'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nome' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['nullable', 'required_without:telefone', 'email', 'max:254'],
            'telefone' => ['bail', 'nullable', 'required_without:email', 'string', 'max:25', 'regex:/^\+?[0-9 ()-]+$/', function ($attribute, $value, $fail) {
                $digits = preg_replace('/\D/', '', $value);
                if (strlen($digits) < 10 || strlen($digits) > 15) {
                    $fail('Informe um telefone com DDD, entre 10 e 15 dígitos.');
                }
            }],
            'motivo' => ['required', Rule::in(['agendamento', 'duvida', 'suporte', 'outro'])],
            'mensagem' => ['required', 'string', 'min:10', 'max:3000'],
        ], [
            'nome.required' => 'Informe seu nome.',
            'nome.min' => 'Informe um nome com pelo menos 2 caracteres.',
            'nome.max' => 'O nome deve ter no máximo 120 caracteres.',
            'email.required_without' => 'Informe um e-mail ou telefone para retorno.',
            'email.email' => 'Informe um e-mail válido.',
            'email.max' => 'O e-mail deve ter no máximo 254 caracteres.',
            'telefone.required_without' => 'Informe um telefone ou e-mail para retorno.',
            'telefone.regex' => 'Informe um telefone válido com DDD.',
            'telefone.max' => 'O telefone deve ter no máximo 25 caracteres.',
            'motivo.required' => 'Selecione o motivo do contato.',
            'motivo.in' => 'Selecione um motivo válido.',
            'mensagem.required' => 'Escreva sua mensagem.',
            'mensagem.min' => 'Escreva pelo menos 10 caracteres na mensagem.',
            'mensagem.max' => 'A mensagem deve ter no máximo 3.000 caracteres.',
        ]);

        $limiterKey = 'contato:' . $request->ip();
        if (RateLimiter::tooManyAttempts($limiterKey, 5)) {
            return back()->withErrors(['envio' => 'Você enviou várias mensagens. Aguarde um minuto antes de tentar novamente.']);
        }

        try {
            $contato = Contato::create([...$data, 'protocolo' => (string) Str::uuid()]);
        } catch (QueryException $exception) {
            // Não registrar os dados pessoais contidos no SQL da mensagem.
            return back()->withErrors(['envio' => 'Não foi possível registrar sua mensagem. Tente novamente ou use o e-mail de contato.']);
        }

        RateLimiter::hit($limiterKey, 60);

        return to_route('contato')->with('contato_protocolo', $contato->protocolo);
    }

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->isAdmin(), 403);

        return Inertia::render('Admin/Contatos', [
            'contatos' => Contato::orderByRaw('atendido_em IS NOT NULL')->latest('id')->paginate(15),
        ]);
    }

    public function atender(Request $request, Contato $contato): RedirectResponse
    {
        abort_unless($request->user()?->isAdmin(), 403);
        if ($contato->atendido_em === null) {
            $contato->update(['atendido_em' => now()]);
        }

        return back();
    }
}
