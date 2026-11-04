<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AtendimentoController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\RelatorioController;
use App\Http\Controllers\AvaliacaoController;
use App\Http\Controllers\ContatoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes - AstraLab System
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    // Se o usuário já estiver logado e tentar acessar a raiz, manda pro dashboard certo
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('LandingPage'); 
});

Route::get('/sobre-nos', function () {
    return Inertia::render('SobreNos/Index');
})->name('sobre-nos');

Route::get('/contato', [ContatoController::class, 'create'])->name('contato');
Route::post('/contato', [ContatoController::class, 'store'])->name('contato.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin/contatos', [ContatoController::class, 'index'])->name('admin.contatos');
    Route::patch('/admin/contatos/{contato}/atender', [ContatoController::class, 'atender'])->name('admin.contatos.atender');
});

// ============================================================
// DASHBOARDS E TELAS GERAIS (PROTEGIDAS POR AUTH)
// ============================================================
Route::middleware(['auth', 'verified'])->group(function () {

    // Rota Mestra Distribuidora de Tráfego
    Route::get('/dashboard', function () {
        $user = Auth::user();
        $role = strtolower(trim($user->tipo_usuario)); 
        
        if ($role === 'administrador') {
            return redirect()->route('admin.dashboard');
        } 
        
        if ($role === 'professor') {
            return redirect()->route('professor.dashboard');
        }
        
        if (in_array($role, ['tecnico', 'aluno', 'estagiário', 'estagiario'])) {
            return redirect()->route('tecnico.dashboard');
        }
        
        return redirect()->route('paciente.dashboard');
    })->name('dashboard');


    // ============================================================
    // DASHBOARDS ESPECÍFICOS (ADMIN E PROFESSOR)
    // ============================================================
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::get('/professor/dashboard', [ProfessorController::class, 'index'])->name('professor.dashboard');
    Route::get('/professor/protocolos', [ProfessorController::class, 'protocolos'])->name('professor.protocolos');

    // ============================================================
    // DASHBOARD DO ALUNO/TÉCNICO (COM BLINDAGEM DE CARGO)
    // ============================================================
    Route::get('/tecnico/dashboard', function () {
        $user = Auth::user();
        
        // Se a rota der um duplo-redirecionamento, isso impede de perder a mensagem de "Sucesso!"
        if (session()->has('success') || session()->has('error')) {
            session()->reflash();
        }

        // Blindagem: Se for Admin e cair aqui, devolve pro painel do Admin
        if ($user->tipo_usuario === 'Administrador') {
            return redirect()->route('admin.dashboard');
        }

        // Blindagem: Se for Professor e cair aqui, devolve pro painel do Professor
        if ($user->tipo_usuario === 'Professor') {
            return redirect()->route('professor.dashboard');
        }
        
        $stats = [
            'atendimentosAbertos' => \App\Models\PedidoExame::where('status', 'Pendente')->count(),
            'laudosDigitados' => \App\Models\Laudo::where('id_usuario_digitador', $user->id)->count(),
            'aguardandoRevisao' => \App\Models\Laudo::where('id_usuario_digitador', $user->id)->where('status', 'Pendente')->count(),
            'devolvidos' => \App\Models\Laudo::where('id_usuario_digitador', $user->id)->where('status', 'Devolvido')->count(),
        ];

        $recentes = \App\Models\PedidoExame::with('paciente.utilizador')
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id_pedido,
                'protocolo' => $p->protocolo,
                'paciente' => $p->paciente->utilizador->name ?? 'Não identificado',
                'status' => $p->status,
                'hora' => $p->updated_at->diffForHumans()
            ]);

        return Inertia::render('Aluno/Dashboard', [
            'stats' => $stats,
            'recentes' => $recentes
        ]);
    })->name('tecnico.dashboard');


    // ============================================================
    // RELATÓRIOS E MÉTRICAS INSTITUCIONAIS (HUB)
    // ============================================================
    Route::get('/admin/relatorios', [RelatorioController::class, 'index'])->name('admin.relatorios.index');
    Route::get('/admin/relatorios/gerar', [RelatorioController::class, 'gerarPdf'])->name('admin.relatorios.gerar');


    // ============================================================
    // GESTÃO DE USUÁRIOS (EXCLUSIVO ADMIN)
    // ============================================================
    Route::get('/admin/usuarios', [AdminController::class, 'usuarios'])->name('admin.usuarios');
    Route::post('/admin/usuarios', [AdminController::class, 'storeUsuario'])->name('admin.usuarios.store');
    Route::patch('/admin/usuarios/{id}', [AdminController::class, 'updateUsuario'])->name('admin.usuarios.update');
    Route::put('/admin/usuarios/{id}/status', [AdminController::class, 'toggleStatus'])->name('admin.usuarios.status');
    Route::delete('/admin/usuarios/{id}', [AdminController::class, 'destroyUsuario'])->name('admin.usuarios.destroy');


    // ============================================================
    // GESTÃO DE PARÂMETROS, EXAMES E CONFIGURAÇÕES
    // ============================================================
    Route::get('/admin/exames', [AdminController::class, 'examesIndex'])->name('admin.exames');
    Route::post('/admin/exames', [AdminController::class, 'examesStore'])->name('admin.exames.store');
    Route::patch('/admin/exames/{id}', [AdminController::class, 'examesUpdate'])->name('admin.exames.update');
    
    Route::get('/admin/configuracoes', [AdminController::class, 'configuracoesIndex'])->name('admin.configuracoes');
    Route::post('/admin/configuracoes', [AdminController::class, 'configuracoesUpdate'])->name('admin.configuracoes.update');
    Route::post('/admin/configuracoes/testar-email', [AdminController::class, 'testarEmail'])->name('admin.configuracoes.testar-email');


    // ============================================================
    // GESTÃO DE AGENDAMENTOS (RECEPÇÃO / ADMIN)
    // ============================================================
    Route::get('/admin/agendamentos', [AtendimentoController::class, 'indexAgendamentos'])->name('admin.agendamentos');
    Route::patch('/admin/agendamentos/{id}/aprovar', [AtendimentoController::class, 'aprovarAgendamento'])->name('admin.agendamentos.aprovar');
    Route::delete('/admin/agendamentos/{id}/cancelar', [AtendimentoController::class, 'cancelarAgendamento'])->name('admin.agendamentos.cancelar');


    // ============================================================
    // VALIDAÇÃO DE LAUDOS (PROFESSOR / ADMIN)
    // ============================================================
    Route::get('/admin/validacao', [AtendimentoController::class, 'validacaoLaudos'])->name('admin.validacao');
    Route::patch('/admin/validacao/{id}/aprovar', [AtendimentoController::class, 'aprovarLaudo'])->name('admin.validacao.aprovar');
    Route::patch('/admin/validacao/{id}/recusar', [AtendimentoController::class, 'recusarLaudo'])->name('admin.validacao.recusar');
    Route::patch('/admin/validacao/{id}/revogar', [AtendimentoController::class, 'revogarLaudo'])->name('admin.validacao.revogar');


    // ============================================================
    // OPERACIONAL - NOVO ATENDIMENTO E OS (RECEPÇÃO)
    // ============================================================
    Route::get('/tecnico/novo-atendimento', function () {
        return Inertia::render('Tecnico/NovoAtendimento', [
            'examesDisponiveis' => \App\Models\Exame::orderBy('nome_exame')->get()
        ]); 
    })->name('tecnico.novo');
    
    Route::post('/tecnico/novo-atendimento', [AtendimentoController::class, 'store'])->name('tecnico.novo.store');
    Route::get('/tecnico/buscar-paciente/{cpf}', [AtendimentoController::class, 'buscarPaciente']);
    Route::get('/tecnico/buscar-profissional/{crm}', [AtendimentoController::class, 'buscarMedico']);


    // ============================================================
    // FILA DE EXAMES E DIGITAÇÃO DE LAUDOS (TÉCNICO/ALUNO)
    // ============================================================
    Route::get('/tecnico/fila-exames', [AtendimentoController::class, 'filaExames'])->name('tecnico.fila');
    Route::get('/tecnico/correcoes', [AtendimentoController::class, 'filaCorrecoes'])->name('tecnico.correcoes'); 
    Route::post('/tecnico/laudo', [AtendimentoController::class, 'salvarLaudoIndividual'])->name('tecnico.laudo.store');


    // ============================================================
    // ÁREA DO PACIENTE (LAUDOS, HISTÓRICO, AGENDAMENTO)
    // ============================================================
    Route::get('/paciente/dashboard', [AtendimentoController::class, 'dashboardPaciente'])->name('paciente.dashboard');
    Route::get('/paciente/meus-laudos', [AtendimentoController::class, 'meusLaudos'])->name('paciente.laudos');
    Route::get('/paciente/historico', [AtendimentoController::class, 'historico'])->name('paciente.historico');
    Route::post('/paciente/preferencia-nome', [AtendimentoController::class, 'salvarPreferenciaNome'])->name('paciente.salvar_preferencia_nome');
    
    // ⭐ Sistema de Satisfação
    Route::post('/paciente/avaliar', [AvaliacaoController::class, 'store'])->name('paciente.avaliar.store');
    
    // Rotas de PDF
    Route::get('/paciente/laudo/{id_laudo}/download', [AtendimentoController::class, 'downloadLaudoPdf'])->name('paciente.laudo.download');
    Route::get('/paciente/protocolo/{protocolo}/download', [AtendimentoController::class, 'downloadProtocoloPdf'])->name('paciente.laudo.download_protocolo');
    
    Route::get('/paciente/agendar', function () {
        return Inertia::render('Paciente/Agendar', [
            'examesDisponiveis' => \App\Models\Exame::orderBy('nome_exame')->get(),
            'meusAgendamentos' => \App\Models\Agendamento::where('user_id', Auth::id())
                                    ->orderBy('data', 'desc')
                                    ->orderBy('horario', 'desc')
                                    ->get()
        ]);
    })->name('paciente.agendar');
    
    Route::post('/paciente/agendar', [AtendimentoController::class, 'salvarAgendamento'])->name('paciente.agendar.store');


    // ============================================================
    // PERFIL DO USUÁRIO
    // ============================================================
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
