<?php

namespace App\Http\Controllers;

use App\Models\PedidoExame;
use App\Models\PedidoExameItem;
use App\Models\Laudo;
use App\Models\User;
use App\Models\Avaliacao; // <-- 1. IMPORTAÇÃO DO MODEL ADICIONADA AQUI
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ProfessorController extends Controller
{
    /**
     * DASHBOARD DO PROFESSOR (Alimenta a tela inicial do Professor)
     */
    public function index()
    {
        // 1. Cálculos Estatísticos para a Bancada do Professor
        $atendimentosHoje = PedidoExame::whereDate('created_at', Carbon::today())->count();
        
        // Exames que ainda não têm laudo ou cujo laudo foi devolvido ao aluno
        $laudosPendentes = PedidoExameItem::whereDoesntHave('laudo', function($q) {
            $q->where('status', '!=', 'Devolvido');
        })->count();

        // Laudos que o Aluno já digitou e estão à espera da assinatura do Professor
        $aguardandoValidacao = Laudo::where('status', 'Pendente')->count();

        // Laudos que o Professor já assinou hoje (e foram para o Admin) ou que já foram emitidos
        $laudosLiberados = Laudo::whereIn('status', ['Aguardando_Supervisor', 'Liberado'])
                                ->whereDate('updated_at', Carbon::today())
                                ->count();

        // 2. Últimas Movimentações (OS)
        $recentes = PedidoExame::with('paciente.utilizador')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id_pedido,
                    'protocolo' => $p->protocolo,
                    'paciente' => $p->paciente && $p->paciente->utilizador ? $p->paciente->utilizador->name : 'Paciente Não Identificado',
                    'status' => $p->status,
                    'hora' => $p->created_at->format('H:i'),
                ];
            });

        return Inertia::render('Professor/Dashboard', [
            'stats' => [
                'atendimentosHoje' => $atendimentosHoje,
                'laudosPendentes' => $laudosPendentes,
                'aguardandoValidacao' => $aguardandoValidacao,
                'laudosLiberados' => $laudosLiberados,
            ],
            'recentes' => $recentes
        ]);
    }

    /**
     * RASTREIO E SUPERVISÃO GERAL
     */
    public function protocolos(Request $request)
    {
        // 1. Busca todos os alunos/técnicos para o filtro
        $staff = User::whereIn('tipo_usuario', ['Tecnico', 'Aluno', 'Estagiário', 'Estagiario', 'Professor'])
            ->orderBy('name', 'asc')
            ->get(['id', 'name']);

        // 2. Query principal com relacionamentos
        $query = PedidoExame::with([
            'paciente.utilizador', 
            'itens.exame', 
            'itens.laudo.digitador', // Para saber quem digitou cada exame
            'tecnico' // Para saber quem abriu a OS na recepção
        ]);

        // 3. Aplicação de Filtros
        if ($request->filled('busca')) {
            $busca = $request->busca;
            $query->where('protocolo', 'like', "%{$busca}%")
                  ->orWhereHas('paciente.utilizador', function($q) use ($busca) {
                      $q->where('name', 'like', "%{$busca}%");
                  });
        }

        if ($request->filled('staff_id')) {
            $staffId = $request->staff_id;
            $query->where(function($q) use ($staffId) {
                $q->where('id_tecnico', $staffId) // Quem abriu a OS
                  ->orWhereHas('itens.laudo', function($sq) use ($staffId) {
                      $sq->where('id_usuario_digitador', $staffId); // Quem digitou
                  });
            });
        }

        $protocolos = $query->latest()->paginate(10)->withQueryString();

        // 4. A MÁGICA: Anexar a Avaliação de cada protocolo (se ela existir)
        // Isso varre os 10 registros da página e procura a nota na tabela de avaliações!
        $protocolos->getCollection()->transform(function ($pedido) {
            $pedido->avaliacao = Avaliacao::where('protocolo', $pedido->protocolo)->first();
            return $pedido;
        });

        return Inertia::render('Professor/Protocolos', [
            'protocolos' => $protocolos,
            'staff' => $staff,
            'filtros' => $request->all(['busca', 'staff_id'])
        ]);
    }
}