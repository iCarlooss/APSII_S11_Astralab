<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PedidoExame;
use App\Models\PedidoExameItem;
use App\Models\Laudo;
use App\Models\Exame;
use App\Models\Configuracao; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    /**
     * DASHBOARD - VISÃO GERAL
     */
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'atendimentosHoje' => PedidoExame::whereDate('created_at', Carbon::today())->count(),
                'laudosPendentes'  => PedidoExameItem::doesntHave('laudo')->count(),
                'pacientesTotal'   => User::where('tipo_usuario', 'Paciente')->count(),
                'examesRealizados' => Laudo::count(),
            ],
            'recentes' => PedidoExame::with('paciente.utilizador')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id_pedido,
                    'protocolo' => $p->protocolo,
                    'paciente' => $p->paciente && $p->paciente->utilizador ? $p->paciente->utilizador->name : 'Paciente Não Identificado',
                    'status' => $p->status,
                    'hora' => $p->created_at->format('H:i'),
                ])
        ]);
    }

    /**
     * GESTÃO DE USUÁRIOS - LISTAGEM
     */
    public function usuarios()
    {
        return Inertia::render('Admin/Usuarios', [
            'usuariosLista' => User::orderBy('name', 'asc')->get()
        ]);
    }

    /**
     * CRIAR NOVO USUÁRIO
     */
    public function storeUsuario(Request $request)
    {
        $cpfLimpo = preg_replace('/[^0-9]/', '', $request->cpf);
        $request->merge(['cpf' => $cpfLimpo]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'cpf' => 'required|string|min:11|max:14|unique:users,cpf',
            'tipo_usuario' => 'required|string', 
            'password' => 'required|string|min:6',
        ], [
            'cpf.unique' => 'Atenção: Este CPF já está cadastrado no sistema!',
            'email.unique' => 'Atenção: Este E-mail já está em uso por outro usuário.',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'cpf' => $request->cpf, 
            'tipo_usuario' => $request->tipo_usuario,
            'password' => Hash::make($request->password),
            'status' => 'Ativo',
        ]);

        return redirect()->back()->with('success', 'Usuário cadastrado com sucesso!');
    }

    /**
     * ATUALIZAR USUÁRIO
     */
    public function updateUsuario(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $cpfLimpo = preg_replace('/[^0-9]/', '', $request->cpf ?? $user->cpf);
        $request->merge(['cpf' => $cpfLimpo]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'cpf' => ['required', 'string', 'min:11', 'max:14', Rule::unique('users')->ignore($user->id)],
            'tipo_usuario' => 'required|string', 
            'status' => 'required|in:Ativo,Inativo',
            'password' => 'nullable|string|min:6',
        ], [
            'cpf.unique' => 'Atenção: Este CPF já pertence a outro usuário!',
            'email.unique' => 'Atenção: Este E-mail já está em uso por outro usuário.',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->cpf = $request->cpf; 
        $user->tipo_usuario = $request->tipo_usuario; 
        $user->status = $request->status;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', "O perfil de {$user->name} foi atualizado.");
    }

    /**
     * EXCLUIR USUÁRIO
     */
    public function destroyUsuario($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Auto-exclusão negada. Você não pode deletar a si mesmo.');
        }

        $user->delete();
        return redirect()->back()->with('success', 'Usuário removido do banco de dados.');
    }

    /**
     * ATIVAR/INATIVAR RÁPIDO
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);
        $user->status = ($user->status === 'Ativo') ? 'Inativo' : 'Ativo';
        $user->save();

        return redirect()->back()->with('success', "Status alterado para {$user->status}.");
    }

    /**
     * GESTÃO DE EXAMES - LISTAGEM
     */
    public function examesIndex()
    {
        return Inertia::render('Admin/Exames', [
            'examesLista' => Exame::orderBy('nome_exame')->get()
        ]);
    }

    /**
     * SALVAR NOVO EXAME (CREATE)
     */
    public function examesStore(Request $request)
    {
        try {
            // Limpeza cirúrgica: Aceita vírgulas ou pontos, e converte caixas vazias para NULL real
            $ref_min = trim($request->ref_min ?? '');
            $ref_max = trim($request->ref_max ?? '');
            $valor   = trim($request->valor ?? '');

            $request->merge([
                'ref_min' => $ref_min === '' ? null : (float) str_replace(',', '.', $ref_min),
                'ref_max' => $ref_max === '' ? null : (float) str_replace(',', '.', $ref_max),
                'valor'   => $valor === '' ? 0 : (float) str_replace(',', '.', $valor),
            ]);

            $request->validate([
                'nome_exame' => 'required|string|max:255',
                'prazo_resultado' => 'required|integer|min:0',
                'valor' => 'nullable|numeric|min:0',
                'descricao' => 'nullable|string',
                'instrucoes_preparo' => 'nullable|string',
                'ref_min' => 'nullable|numeric',
                'ref_max' => 'nullable|numeric',
                'ref_texto' => 'nullable|string',
                'metodo' => 'nullable|string|max:255',   // ADICIONE ESTA LINHA
                'material' => 'nullable|string|max:255', // ADICIONE ESTA LINHA
            ]);

            Exame::create([
                'nome_exame' => $request->nome_exame,
                'valor' => $request->valor,
                'prazo_resultado' => $request->prazo_resultado,
                'descricao' => $request->descricao,
                'instrucoes_preparo' => $request->instrucoes_preparo,
                'ref_min' => $request->ref_min,
                'ref_max' => $request->ref_max,
                'ref_texto' => $request->ref_texto,
                'metodo' => $request->metodo,     // ADICIONE ESTA LINHA
                'material' => $request->material,
            ]);

            return redirect()->back()->with('success', 'Novo exame adicionado ao catálogo com sucesso!');
        } 
        catch (\Exception $e) {
            // SE O BANCO DE DADOS FALHAR, MANDA O ERRO PARA A TELA EM VEZ DE QUEBRAR (ERRO 500)
            return redirect()->back()->withErrors(['ref_texto' => 'ERRO NO BANCO DE DADOS: ' . $e->getMessage()]);
        }
    }

    /**
     * EDITAR PARÂMETROS E PREPARO DO EXAME (UPDATE)
     */
    public function examesUpdate(Request $request, $id)
    {
        try {
            $exame = Exame::findOrFail($id);

            // Limpeza cirúrgica: Aceita vírgulas ou pontos, e converte caixas vazias para NULL real
            $ref_min = trim($request->ref_min ?? '');
            $ref_max = trim($request->ref_max ?? '');
            $valor   = trim($request->valor ?? '');

            $request->merge([
                'ref_min' => $ref_min === '' ? null : (float) str_replace(',', '.', $ref_min),
                'ref_max' => $ref_max === '' ? null : (float) str_replace(',', '.', $ref_max),
                'valor'   => $valor === '' ? 0 : (float) str_replace(',', '.', $valor),
            ]);

            $request->validate([
                'nome_exame' => 'required|string|max:255',
                'prazo_resultado' => 'required|integer|min:0',
                'valor' => 'nullable|numeric|min:0',
                'descricao' => 'nullable|string',
                'instrucoes_preparo' => 'nullable|string', 
                'ref_min' => 'nullable|numeric',
                'ref_max' => 'nullable|numeric',
                'ref_texto' => 'nullable|string',
            ]);

            $exame->update([
                'nome_exame' => $request->nome_exame,
                'valor' => $request->valor, 
                'prazo_resultado' => $request->prazo_resultado,
                'descricao' => $request->descricao,
                'instrucoes_preparo' => $request->instrucoes_preparo,
                'ref_min' => $request->ref_min,
                'ref_max' => $request->ref_max,
                'ref_texto' => $request->ref_texto,
            ]);

            return redirect()->back()->with('success', 'Parâmetros do exame atualizados!');
        }
        catch (\Exception $e) {
            // SE O BANCO DE DADOS FALHAR, MANDA O ERRO PARA A TELA EM VEZ DE QUEBRAR (ERRO 500)
            return redirect()->back()->withErrors(['ref_texto' => 'ERRO NO BANCO DE DADOS: ' . $e->getMessage()]);
        }
    }

    /**
     * GESTÃO DE CONFIGURAÇÕES GERAIS E HUB
     */
    public function configuracoesIndex()
    {
        $configs = Configuracao::pluck('valor', 'chave')->toArray();
        $examesLista = Exame::orderBy('nome_exame')->get();

        return Inertia::render('Admin/Configuracoes', [
            'configs' => $configs,
            'examesLista' => $examesLista
        ]);
    }

    public function configuracoesUpdate(Request $request)
    {
        $dados = $request->except(['_token', '_method']);

        foreach ($dados as $chave => $valor) {
            if ($chave === 'mail_password' && empty($valor)) {
                continue; 
            }

            Configuracao::updateOrCreate(
                ['chave' => $chave],
                ['valor' => $valor ?? '']
            );
        }

        return redirect()->back()->with('success', 'Todas as configurações foram salvas com sucesso!');
    }

    /**
     * TESTAR CONEXÃO SMTP
     */
    public function testarEmail()
    {
        try {
            $emailDestino = auth()->user()->email;
            
            Mail::raw(
                "Este é um e-mail de teste gerado pelo sistema AstraLab. Se você está lendo isso, suas configurações SMTP estão perfeitamente corretas e o sistema está pronto para notificar pacientes e recuperar senhas!", 
                function ($message) use ($emailDestino) {
                    $message->to($emailDestino)
                            ->subject('Teste de Conexão SMTP - AstraLab');
                }
            );

            return redirect()->back()->with('success', "SUCESSO! E-mail de teste enviado para: {$emailDestino}");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', "ERRO SMTP: " . $e->getMessage());
        }
    }
}