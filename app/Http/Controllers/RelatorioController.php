<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

// Importação Oficial dos Models baseados na sua arquitetura
use App\Models\User;
use App\Models\Laudo;
use App\Models\Exame;
use App\Models\PedidoExame;
use App\Models\PedidoExameItem; 
use App\Models\Avaliacao; // <-- IMPORTAÇÃO DA AVALIAÇÃO ADICIONADA

class RelatorioController extends Controller
{
    public function index(Request $request)
    {
        $professores = User::whereIn('tipo_usuario', ['Professor', 'Administrador'])->get(['id', 'name']);
        $alunos = User::whereNotIn('tipo_usuario', ['Paciente', 'Administrador', 'Professor'])->get(['id', 'name']);
        
        $exames = [];
        try { 
            $exames = Exame::orderBy('nome_exame')->get(['id_exame as id', 'nome_exame as nome']); 
        } catch (\Throwable $e) { }

        return Inertia::render('Relatorios/Hub', [
            'professoresFiltro' => $professores,
            'alunosFiltro' => $alunos,
            'examesFiltro' => $exames,
            'userRole' => auth()->user()->tipo_usuario 
        ]);
    }

    public function gerarPdf(Request $request)
    {
        $tipoRelatorio = $request->input('tipo');
        $dataInicioRaw = $request->input('data_inicio');
        $dataFimRaw = $request->input('data_fim');
        
        $inicio = $dataInicioRaw ? Carbon::parse($dataInicioRaw)->startOfDay() : Carbon::now()->startOfMonth();
        $fim = $dataFimRaw ? Carbon::parse($dataFimRaw)->endOfDay() : Carbon::now()->endOfDay();

        $dados = [];
        $viewTemplate = '';

        switch ($tipoRelatorio) {
            
            // ==================================================
            // 1. PRODUÇÃO GERAL
            // ==================================================
            case 'admin_producao':
                $queryBase = Laudo::whereBetween('updated_at', [$inicio, $fim]);
                if ($request->filled('professor_id')) {
                    $profIds = explode(',', $request->professor_id);
                    $queryBase->whereIn('id_usuario_validador', $profIds);
                }

                $totalLaudos = (clone $queryBase)->count();
                $liberados = (clone $queryBase)->whereIn('status', ['Liberado', 'Concluido', 'Finalizado'])->count();
                $recusados = (clone $queryBase)->whereIn('status', ['Recusado', 'Devolvido', 'Correção', 'Retificado'])->count();
                $emAnalise = $totalLaudos - ($liberados + $recusados);

                $produtividadeProfessores = (clone $queryBase)
                    ->with('validador') 
                    ->whereNotNull('id_usuario_validador')
                    ->get()
                    ->groupBy('id_usuario_validador')
                    ->map(function ($laudos) {
                        return [
                            'nome' => $laudos->first()->validador->name ?? 'Usuário Removido',
                            'total' => $laudos->count(),
                        ];
                    })->sortByDesc('total');

                $dados = ['total_laudos' => $totalLaudos, 'liberados' => $liberados, 'recusados' => $recusados, 'em_analise' => $emAnalise, 'produtividade_professores' => $produtividadeProfessores];
                $viewTemplate = 'relatorios.admin_producao';
                break;

            // ==================================================
            // 2. FUNIL DE EXAMES 
            // ==================================================
            case 'admin_exames':
                try {
                    $itensSolicitados = PedidoExameItem::with(['exame', 'laudo'])
                        ->whereBetween('created_at', [$inicio, $fim])
                        ->get();
                    
                    $estatisticas = [];

                    foreach ($itensSolicitados as $item) {
                        $nomeExame = $item->exame->nome_exame ?? 'Exame Removido (ID: ' . $item->id_exame . ')';
                        if ($request->filled('exame_id') && $item->id_exame != $request->exame_id) { continue; }

                        if (!isset($estatisticas[$nomeExame])) {
                            $estatisticas[$nomeExame] = ['solicitados' => 0, 'concluidos' => 0, 'pendentes' => 0];
                        }

                        $estatisticas[$nomeExame]['solicitados']++;
                        
                        if ($item->laudo && in_array($item->laudo->status, ['Liberado', 'Concluido', 'Finalizado'])) {
                            $estatisticas[$nomeExame]['concluidos']++;
                        } else {
                            $estatisticas[$nomeExame]['pendentes']++;
                        }
                    }

                    $ranking = collect($estatisticas)->map(function ($stats, $nome) {
                        return ['nome_exame' => $nome, 'solicitados' => $stats['solicitados'], 'concluidos' => $stats['concluidos'], 'pendentes' => $stats['pendentes']];
                    })->sortByDesc('solicitados')->values();

                    $dados = ['ranking_exames' => $ranking];
                } catch (\Throwable $e) {
                    $dados = ['ranking_exames' => []];
                }
                $viewTemplate = 'relatorios.admin_exames';
                break;

            // ==================================================
            // 3. RAIO-X DA FILA
            // ==================================================
            case 'admin_fila':
                try {
                    $pendentes = Laudo::with(['itemPedido.pedido.paciente.utilizador'])
                        ->whereNotIn('status', ['Liberado', 'Concluido', 'Finalizado'])
                        ->whereBetween('created_at', [$inicio, $fim])
                        ->orderBy('created_at', 'asc') 
                        ->get()
                        ->map(function ($laudo) {
                            $pacienteNome = 'Não Identificado';
                            $protocolo = 'Sem OS';

                            if ($laudo->itemPedido && $laudo->itemPedido->pedido) {
                                $protocolo = $laudo->itemPedido->pedido->protocolo;
                                if ($laudo->itemPedido->pedido->paciente && $laudo->itemPedido->pedido->paciente->utilizador) {
                                    $pacienteNome = $laudo->itemPedido->pedido->paciente->utilizador->name;
                                }
                            }

                            $diasInteiros = (int) floor(Carbon::parse($laudo->created_at)->diffInDays(Carbon::now()));

                            return [
                                'protocolo' => $protocolo,
                                'paciente' => $pacienteNome,
                                'status' => $laudo->status ?? 'Pendente',
                                'dias_espera' => $diasInteiros,
                            ];
                        });
                    
                    $dados = ['fila_pendente' => $pendentes];
                } catch (\Throwable $e) {
                    $dados = ['fila_pendente' => []];
                }
                $viewTemplate = 'relatorios.admin_fila';
                break;

            // ==================================================
            // 4. MAPA DE ATENDIMENTOS (RECEÇÃO)
            // ==================================================
            case 'admin_atendimentos':
                try {
                    $atendimentos = PedidoExame::with(['paciente.utilizador'])
                        ->whereBetween('created_at', [$inicio, $fim])
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->map(function ($pedido) {
                            $pacienteNome = 'Não Identificado';
                            if ($pedido->paciente && $pedido->paciente->utilizador) {
                                $pacienteNome = $pedido->paciente->utilizador->name;
                            }
                            return [
                                'data' => Carbon::parse($pedido->created_at)->format('d/m/Y H:i'),
                                'protocolo' => $pedido->protocolo ?? 'N/A',
                                'paciente' => $pacienteNome,
                                'status' => $pedido->status ?? 'Pendente'
                            ];
                        });
                    $dados = ['atendimentos' => $atendimentos, 'total' => $atendimentos->count()];
                } catch (\Throwable $e) {
                    $dados = ['atendimentos' => [], 'total' => 0];
                }
                $viewTemplate = 'relatorios.admin_atendimentos';
                break;

            // ==================================================
            // 5. AUDITORIA DO SISTEMA (LOGS)
            // ==================================================
            case 'admin_auditoria':
                try {
                    $logs = Laudo::with(['validador', 'digitador', 'itemPedido.pedido'])
                        ->whereBetween('updated_at', [$inicio, $fim])
                        ->orderBy('updated_at', 'desc')
                        ->limit(100)
                        ->get()
                        ->map(function ($laudo) {
                            $usuarioNome = 'Ação de Sistema';
                            if ($laudo->validador) {
                                $usuarioNome = $laudo->validador->name;
                            } elseif ($laudo->digitador) {
                                $usuarioNome = $laudo->digitador->name;
                            }
                            $protocolo = 'S/N';
                            if ($laudo->itemPedido && $laudo->itemPedido->pedido) {
                                $protocolo = $laudo->itemPedido->pedido->protocolo;
                            }
                            return [
                                'data' => Carbon::parse($laudo->updated_at)->format('d/m/Y H:i:s'),
                                'acao' => 'O Laudo foi processado/salvo com o Status: ' . ($laudo->status ?? 'Atualizado'),
                                'protocolo' => $protocolo,
                                'usuario' => $usuarioNome
                            ];
                        });
                    $dados = ['logs' => $logs];
                } catch (\Throwable $e) {
                    $dados = ['logs' => []];
                }
                $viewTemplate = 'relatorios.admin_auditoria';
                break;

            // ==================================================
            // 6. PRODUTIVIDADE DO ALUNO (PROFESSOR)
            // ==================================================
            case 'produtividade_aluno':
                $queryBase = Laudo::whereBetween('updated_at', [$inicio, $fim]);
                $idsPermitidos = User::whereNotIn('tipo_usuario', ['Paciente', 'Administrador', 'Professor'])->pluck('id')->toArray();

                if ($request->filled('aluno_id')) {
                    $alunosIds = explode(',', $request->aluno_id);
                    $idsFinais = array_intersect($alunosIds, $idsPermitidos);
                    $queryBase->whereIn('id_usuario_digitador', $idsFinais);
                } else {
                    $queryBase->whereIn('id_usuario_digitador', $idsPermitidos);
                }

                $agrupadoPorAluno = (clone $queryBase)->with('digitador')->whereNotNull('id_usuario_digitador')->get()->groupBy('id_usuario_digitador');

                $metricas = $agrupadoPorAluno->map(function($laudos) {
                    $total = $laudos->count();
                    $aprovados = $laudos->whereIn('status', ['Liberado', 'Concluido', 'Finalizado'])->count();
                    $devolvidos = $laudos->whereIn('status', ['Devolvido', 'Recusado', 'Correção'])->count();
                    $avaliados = $aprovados + $devolvidos;
                    $taxaAcerto = $avaliados > 0 ? round(($aprovados / $avaliados) * 100, 1) : 0;

                    return [
                        'nome' => $laudos->first()->digitador->name ?? 'Aluno Removido', 
                        'total' => $total, 
                        'aprovados' => $aprovados, 
                        'devolvidos' => $devolvidos, 
                        'taxa_acerto' => $taxaAcerto
                    ];
                })->sortByDesc('total');

                $dados = ['metricas_alunos' => $metricas];
                $viewTemplate = 'relatorios.produtividade_aluno';
                break;

            // ==================================================
            // 7. CUSTOS E FATURAMENTO
            // ==================================================
            case 'admin_financeiro':
                try {
                    $itensFaturados = PedidoExameItem::with(['exame'])
                        ->whereHas('laudo', function($q) use ($inicio, $fim) {
                            $q->whereIn('status', ['Liberado', 'Concluido', 'Finalizado'])
                              ->whereBetween('updated_at', [$inicio, $fim]);
                        })->get();

                    $faturamentoTotal = 0;
                    $agrupadoExames = [];

                    foreach($itensFaturados as $item) {
                        $valor = $item->valor_unitario ?? ($item->exame->valor ?? 0);
                        $faturamentoTotal += $valor;
                        
                        $nome = $item->exame->nome_exame ?? 'Exame Removido';
                        if(!isset($agrupadoExames[$nome])) {
                            $agrupadoExames[$nome] = ['quantidade' => 0, 'valor_total' => 0];
                        }
                        $agrupadoExames[$nome]['quantidade']++;
                        $agrupadoExames[$nome]['valor_total'] += $valor;
                    }

                    $rankingFinanceiro = collect($agrupadoExames)->map(function ($data, $nome) {
                        return ['nome' => $nome, 'quantidade' => $data['quantidade'], 'valor_total' => $data['valor_total']];
                    })->sortByDesc('valor_total')->values();

                    $dados = ['faturamento_total' => $faturamentoTotal, 'detalhamento' => $rankingFinanceiro];
                } catch (\Throwable $e) {
                    $dados = ['faturamento_total' => 0, 'detalhamento' => []];
                }
                $viewTemplate = 'relatorios.admin_financeiro';
                break;

            // ==================================================
            // 8. TEMPO DE RESPOSTA (TAT - Turnaround Time)
            // ==================================================
            case 'admin_tat':
                try {
                    $laudosLiberados = Laudo::with(['itemPedido.pedido'])
                        ->whereIn('status', ['Liberado', 'Concluido', 'Finalizado'])
                        ->whereBetween('updated_at', [$inicio, $fim])
                        ->get();

                    $somaHorasTotais = 0;
                    $contagemTat = 0;
                    
                    foreach($laudosLiberados as $l) {
                        if ($l->itemPedido && $l->itemPedido->pedido) {
                            $dataPedido = Carbon::parse($l->itemPedido->pedido->created_at);
                            $dataLiberacao = Carbon::parse($l->updated_at);
                            $horasDecorridas = $dataPedido->diffInHours($dataLiberacao);
                            
                            $somaHorasTotais += $horasDecorridas;
                            $contagemTat++;
                        }
                    }

                    $tatMedio = $contagemTat > 0 ? round($somaHorasTotais / $contagemTat, 1) : 0;
                    $dados = ['tat_medio_horas' => $tatMedio, 'laudos_analisados' => $contagemTat];
                } catch (\Throwable $e) {
                    $dados = ['tat_medio_horas' => 0, 'laudos_analisados' => 0];
                }
                $viewTemplate = 'relatorios.admin_tat';
                break;

            // ==================================================
            // 9. ÍNDICE DE REJEIÇÃO (QUALIDADE)
            // ==================================================
            case 'qualidade_rejeicao':
                try {
                    $queryDevolvidos = Laudo::with(['itemPedido.exame', 'digitador'])
                        ->whereIn('status', ['Devolvido', 'Recusado', 'Correção'])
                        ->whereBetween('updated_at', [$inicio, $fim]);

                    if ($request->filled('aluno_id')) {
                        $alunosIds = explode(',', $request->aluno_id);
                        $queryDevolvidos->whereIn('id_usuario_digitador', $alunosIds);
                    }

                    $devolvidos = $queryDevolvidos->get();

                    $rankingPorExame = $devolvidos->groupBy(function($l) {
                        return $l->itemPedido->exame->nome_exame ?? 'Exame Desconhecido';
                    })->map(function($group, $nome) {
                        return ['nome' => $nome, 'quantidade' => $group->count()];
                    })->sortByDesc('quantidade')->values();

                    $rankingPorAluno = $devolvidos->groupBy(function($l) {
                        return $l->digitador->name ?? 'Aluno Removido';
                    })->map(function($group, $nome) {
                        return ['nome' => $nome, 'quantidade' => $group->count()];
                    })->sortByDesc('quantidade')->values();

                    $dados = [
                        'total_rejeitados' => $devolvidos->count(),
                        'ranking_exames' => $rankingPorExame,
                        'ranking_alunos' => $rankingPorAluno
                    ];
                } catch (\Throwable $e) {
                    $dados = ['total_rejeitados' => 0, 'ranking_exames' => [], 'ranking_alunos' => []];
                }
                $viewTemplate = 'relatorios.qualidade_rejeicao';
                break;

            // ==================================================
            // 10. NPS E SATISFAÇÃO (AVALIAÇÕES DOS PACIENTES)
            // ==================================================
            case 'nps_satisfacao':
                try {
                    $avaliacoes = Avaliacao::with('paciente')
                        ->whereBetween('created_at', [$inicio, $fim])
                        ->orderBy('created_at', 'desc')
                        ->get();

                    $totalAvaliacoes = $avaliacoes->count();
                    $mediaGeral = $totalAvaliacoes > 0 ? round($avaliacoes->avg('nota'), 1) : 0;
                    
                    $distribuicao = [
                        '5' => $avaliacoes->where('nota', 5)->count(),
                        '4' => $avaliacoes->where('nota', 4)->count(),
                        '3' => $avaliacoes->where('nota', 3)->count(),
                        '2' => $avaliacoes->where('nota', 2)->count(),
                        '1' => $avaliacoes->where('nota', 1)->count(),
                    ];

                    $comentarios = $avaliacoes->whereNotNull('comentario')->where('comentario', '!=', '')->map(function($av) {
                        return [
                            'paciente' => $av->paciente->name ?? 'Anônimo',
                            'protocolo' => $av->protocolo ?? 'S/N',
                            'nota' => $av->nota,
                            'comentario' => $av->comentario,
                            'data' => Carbon::parse($av->created_at)->format('d/m/Y')
                        ];
                    })->values();

                    $dados = [
                        'total_avaliacoes' => $totalAvaliacoes,
                        'media_geral' => $mediaGeral,
                        'distribuicao' => $distribuicao,
                        'comentarios' => $comentarios
                    ];
                } catch (\Throwable $e) {
                    $dados = ['total_avaliacoes' => 0, 'media_geral' => 0, 'distribuicao' => [], 'comentarios' => []];
                }
                $viewTemplate = 'relatorios.nps_satisfacao';
                break;

            default:
                abort(404, 'O tipo de relatório solicitado não está configurado no sistema.');
        }

        if (!view()->exists($viewTemplate)) {
            abort(404, "A folha PDF para este relatório ($viewTemplate.blade.php) ainda não foi criada na pasta resources/views/relatorios/.");
        }

        $pdf = Pdf::loadView($viewTemplate, ['dados' => $dados, 'dataInicio' => $dataInicioRaw, 'dataFim' => $dataFimRaw])->setPaper('a4', 'landscape');
        return $pdf->stream("relatorio_{$tipoRelatorio}_" . date('Ymd_His') . ".pdf");
    }
}