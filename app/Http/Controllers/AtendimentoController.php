<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Paciente;
use App\Models\PedidoExame;
use App\Models\PedidoExameItem;
use App\Models\Medico; 
use App\Models\Exame;
use App\Models\Laudo;
use App\Models\Agendamento;
use App\Models\Configuracao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use App\Mail\LaudoLiberadoMail;
use App\Mail\AgendamentoConfirmadoMail;
use Illuminate\Support\Facades\Log;

class AtendimentoController extends Controller
{
    /**
     * DICIONÁRIO UNIVERSAL DE REFERÊNCIAS
     * Este dicionário é injetado automaticamente se o exame não tiver sido configurado pelo Admin.
     * Inclui separação inteligente de Homens (M) e Mulheres (F) para Hemogramas.
     */
    private function getTemplateReferenciaUniversal()
    {
        return json_encode([
            "hemacias" => [
                "M" => ["min" => 4.5, "max" => 6.1, "texto" => "Homens: 4.5 a 6.1 milhões/mm³"],
                "F" => ["min" => 4.0, "max" => 5.4, "texto" => "Mulheres: 4.0 a 5.4 milhões/mm³"]
            ],
            "hemoglobina" => [
                "M" => ["min" => 13.0, "max" => 18.0, "texto" => "Homens: 13.0 a 18.0 g/dL"],
                "F" => ["min" => 12.0, "max" => 16.0, "texto" => "Mulheres: 12.0 a 16.0 g/dL"]
            ],
            "hematocrito" => [
                "M" => ["min" => 40, "max" => 52, "texto" => "Homens: 40 a 52 %"],
                "F" => ["min" => 36, "max" => 46, "texto" => "Mulheres: 36 a 46 %"]
            ],
            "vcm" => ["min" => 80, "max" => 100, "texto" => "80 a 100 fL"],
            "hcm" => ["min" => 26, "max" => 34, "texto" => "26 a 34 pg"],
            "chcm" => ["min" => 31, "max" => 36, "texto" => "31 a 36 g/dL"],
            "rdw" => ["min" => 11.5, "max" => 14.5, "texto" => "11.5 a 14.5 %"],
            "leucocitos_totais" => ["min" => 4000, "max" => 10000, "texto" => "4.000 a 10.000 /mm³"],
            "neu_rel" => ["min" => 45, "max" => 75, "texto" => "45 a 75 %"],
            "neu_abs" => ["min" => 1500, "max" => 7000, "texto" => "1.500 a 7.000 /mm³"],
            "lin_rel" => ["min" => 20, "max" => 45, "texto" => "20 a 45 %"],
            "lin_abs" => ["min" => 1000, "max" => 4000, "texto" => "1.000 a 4.000 /mm³"],
            "mon_rel" => ["min" => 2, "max" => 10, "texto" => "2 a 10 %"],
            "mon_abs" => ["min" => 100, "max" => 1000, "texto" => "100 a 1.000 /mm³"],
            "eos_rel" => ["min" => 1, "max" => 5, "texto" => "1 a 5 %"],
            "eos_abs" => ["min" => 50, "max" => 500, "texto" => "50 a 500 /mm³"],
            "baso_rel" => ["min" => 0, "max" => 1, "texto" => "0 a 1 %"],
            "baso_abs" => ["min" => 0, "max" => 100, "texto" => "0 a 100 /mm³"],
            "bas_rel" => ["min" => 0, "max" => 5, "texto" => "0 a 5 %"],
            "bas_abs" => ["min" => 0, "max" => 500, "texto" => "0 a 500 /mm³"],
            "seg_rel" => ["min" => 45, "max" => 70, "texto" => "45 a 70 %"],
            "seg_abs" => ["min" => 1500, "max" => 7000, "texto" => "1.500 a 7.000 /mm³"],
            "lin_ati_rel" => ["max" => 0, "texto" => "0 %"],
            "lin_ati_abs" => ["max" => 0, "texto" => "0 /mm³"],
            "plaquetas" => ["min" => 150000, "max" => 450000, "texto" => "150.000 a 450.000 /mm³"],
            "mpv" => ["min" => 7.0, "max" => 11.0, "texto" => "7.0 a 11.0 fL"],
            "plcr" => ["min" => 15, "max" => 35, "texto" => "15 a 35 %"],
            "glicemia" => ["min" => 70, "max" => 99, "texto" => "70 a 99 mg/dL"],
            "glicose" => ["min" => 70, "max" => 99, "texto" => "70 a 99 mg/dL"],
            "colesterol_total" => ["max" => 190, "texto" => "< 190 mg/dL"],
            "hdl" => ["min" => 40, "texto" => "> 40 mg/dL"],
            "ldl" => ["max" => 130, "texto" => "< 130 mg/dL"],
            "vldl" => ["max" => 30, "texto" => "< 30 mg/dL"],
            "triglicerideos" => ["max" => 150, "texto" => "< 150 mg/dL"],
            "acido_urico" => ["min" => 2.4, "max" => 6.0, "texto" => "2.4 a 6.0 mg/dL"],
            "proteinas" => ["min" => 6.0, "max" => 8.0, "texto" => "6.0 a 8.0 g/dL"],
            "bilirrubina" => ["max" => 1.2, "texto" => "Até 1.2 mg/dL"],
            "densidade" => ["min" => 1010, "max" => 1025, "texto" => "1.010 a 1.025"],
            "ph" => ["min" => 5.0, "max" => 7.0, "texto" => "5.0 a 7.0"],
            "cor" => ["texto" => "Amarelo Citrino"],
            "aspecto" => ["texto" => "Límpido"],
            "cetonas" => ["texto" => "Ausente"],
            "sangue" => ["texto" => "Ausente"],
            "nitrito" => ["texto" => "Negativo"],
            "esterase" => ["texto" => "Ausente"],
            "leucocitos" => ["texto" => "Até 10.000 /mL"],
            "celulas_epiteliais" => ["texto" => "Raras a Algumas"],
            "cilindros" => ["texto" => "Ausentes"],
            "cristais" => ["texto" => "Ausentes"],
            "muco" => ["texto" => "Raro ou Ausente"],
            "bacterias" => ["texto" => "Ausentes ou Raras"],
            "cor_fezes" => ["texto" => "Castanho"],
            "consistencia" => ["texto" => "Pastosa / Sólida"],
            "muco_fezes" => ["texto" => "Ausente"],
            "sangue_fezes" => ["texto" => "Ausente"],
            "protozoarios" => ["texto" => "Negativo"],
            "helmintos" => ["texto" => "Negativo"],
            "hcg" => ["texto" => "Inferior a 5 mUI/mL (Negativo)"],
            "crescimento" => ["texto" => "Ausência de crescimento"]
        ], JSON_UNESCAPED_UNICODE);
    }

    // ==========================================
    // ÁREA DE RECEPÇÃO E ATENDIMENTO (TÉCNICO)
    // ==========================================

    public function buscarPaciente($cpf)
    {
        $cpfLimpo = preg_replace('/[^0-9]/', '', $cpf);
        $user = User::where('cpf', $cpfLimpo)->orWhere('cpf', $cpf)->first();
        
        if ($user && $user->paciente) {
            return response()->json([
                'encontrado' => true,
                'nome' => $user->name,
                'email' => $user->email,
                'data_nascimento' => $user->paciente->data_nascimento,
                'sexo' => $user->paciente->sexo,
                'telefone' => $user->paciente->telefone,
                'telefone2' => $user->paciente->telefone2,
                'cep' => $user->paciente->cep,
                'endereco' => $user->paciente->endereco,
                'peso' => $user->paciente->peso,
                'altura' => $user->paciente->altura,
                'nome_responsavel' => $user->paciente->nome_responsavel,
                'nome_social' => $user->paciente->nome_social,
            ]);
        }
        return response()->json(['encontrado' => false]);
    }

    public function buscarMedico($registro)
    {
        $registroLimpo = trim($registro);
        $profissional = Medico::where('crm', $registroLimpo)->first();
        
        if ($profissional) {
            return response()->json(['encontrado' => true, 'nome' => $profissional->nome]);
        }
        return response()->json(['encontrado' => false]);
    }

    public function store(Request $request)
    {
        $cpfLimpo = preg_replace('/[^0-9]/', '', $request->cpf);
        $userExistente = User::where('cpf', $cpfLimpo)->first();

        $request->validate([
            'nome' => 'required|string|max:255',
            'nome_social' => 'nullable|string|max:255',
            'email' => $userExistente 
                ? 'required|email|unique:users,email,' . $userExistente->id 
                : 'required|email|unique:users,email',
            'cpf' => 'required|string|min:11|max:14',
            'data_nascimento' => 'required|date',
            'sexo' => 'required|in:M,F',
            'telefone' => 'nullable|string|max:20',
            'telefone2' => 'nullable|string|max:20',
            'cep' => 'nullable|string|max:10',
            'endereco' => 'nullable|string|max:255',
            'peso' => 'nullable|numeric',
            'altura' => 'nullable|numeric',
            'nome_responsavel' => 'nullable|string|max:255',
            'conselho_tipo' => 'required|string|in:Nenhum,CRM,CRO,COREN,CRBM,CRN,CRF,CRMV,Outro', 
            'medico_nome' => 'nullable|string|max:255',
            'medico_crm' => 'nullable|string|max:50',
            'exames' => 'required|array|min:1',
            'observacao_clinica' => 'nullable|string',
        ], [
            'email.unique' => 'Atenção: Este e-mail já pertence a outro paciente cadastrado no AstraLab!',
        ]);

        $protocolo = 'ASTRA-' . strtoupper(Str::random(5));

        if ($userExistente) {
            $usaSenhaPadrao = false;
            
            if ($userExistente->paciente) {
                $ultimoPedido = PedidoExame::where('id_paciente', $userExistente->paciente->id_paciente)
                                           ->orderBy('created_at', 'desc')
                                           ->first();

                if ($ultimoPedido && Hash::check($ultimoPedido->protocolo, $userExistente->password)) {
                    $usaSenhaPadrao = true;
                }
            }

            if ($usaSenhaPadrao) {
                $userExistente->update(['password' => Hash::make($protocolo)]);
            }
            $user = $userExistente;
        } else {
            $user = User::create([
                'name' => $request->nome,
                'email' => $request->email ?? $cpfLimpo . '@paciente.astralab.com',
                'cpf' => $cpfLimpo,
                'tipo_usuario' => 'Paciente', 
                'password' => Hash::make($protocolo),
                'status' => 'Ativo'
            ]);
        }

        $alturaFormatada = $request->altura;
        if ($alturaFormatada && $alturaFormatada > 3) {
            $alturaFormatada = $alturaFormatada / 100;
        }

        $paciente = Paciente::updateOrCreate(
            ['user_id' => $user->id],
            [
                'nome_social' => $request->nome_social,
                'data_nascimento' => $request->data_nascimento,
                'sexo' => $request->sexo,
                'telefone' => $request->telefone,
                'telefone2' => $request->telefone2,
                'cep' => $request->cep,
                'endereco' => $request->endereco,
                'peso' => $request->peso,
                'altura' => $alturaFormatada, 
                'nome_responsavel' => $request->nome_responsavel,
            ]
        );

        $idMedico = null;
        if ($request->conselho_tipo !== 'Nenhum' && $request->medico_nome) {
            $registroFormatado = $request->medico_crm ? $request->conselho_tipo . ' ' . $request->medico_crm : $request->conselho_tipo;
            $medico = Medico::updateOrCreate(
                ['crm' => $registroFormatado],
                ['nome' => $request->medico_nome] 
            );
            $idMedico = $medico->id_medico;
        } else {
            $medicoPadrao = Medico::firstOrCreate(
                ['crm' => 'N/A'], 
                ['nome' => 'Solicitação Própria / Sem Pedido Médico']
            );
            $idMedico = $medicoPadrao->id_medico;
        }

        $pedido = PedidoExame::create([
            'protocolo' => $protocolo,
            'id_paciente' => $paciente->id_paciente,
            'id_medico' => $idMedico,
            'id_tecnico' => Auth::id(), 
            'data_pedido' => now(),
            'observacao_clinica' => $request->observacao_clinica,
            'status' => 'Pendente'
        ]);

        foreach ($request->exames as $nomeExame) {
            $exame = Exame::firstOrCreate(
                ['nome_exame' => $nomeExame],
                ['valor' => 0.00, 'prazo_resultado' => 5]
            );
            
            PedidoExameItem::create([
                'id_pedido' => $pedido->id_pedido,
                'id_exame' => $exame->id_exame,
                'quantidade' => 1,
                'valor_unitario' => $exame->valor
            ]);
        }

        return redirect()->back()->with('success', "Protocolo {$protocolo} gerado com sucesso!");
    }


    // ==========================================
    // ÁREA DE DIGITAÇÃO DE LAUDOS (ALUNO/TÉCNICO)
    // ==========================================

    public function filaExames()
    {
        $templateUniversal = $this->getTemplateReferenciaUniversal();

        $pedidos = PedidoExame::with(['paciente.utilizador', 'itens' => function($query) {
                $query->whereDoesntHave('laudo')->with('exame');
            }])
            ->where('status', 'Pendente')
            ->whereHas('itens', function($query) {
                $query->whereDoesntHave('laudo');
            })
            ->orderBy('data_pedido', 'asc')
            ->get()
            ->map(function ($pedido) use ($templateUniversal) {
                return [
                    'id_pedido' => $pedido->id_pedido,
                    'protocolo' => $pedido->protocolo,
                    'paciente'  => $pedido->paciente->utilizador->name ?? 'Não identificado',
                    'sexo'      => $pedido->paciente->sexo ?? 'M', 
                    'data' => \Carbon\Carbon::parse($pedido->data_pedido)->format('d/m/Y'),
                    'status' => $pedido->status,
                    'itens'     => $pedido->itens->map(function ($item) use ($templateUniversal) {
                        
                        $usarUniversal = empty(trim((string)$item->exame->ref_texto)) 
                                      && $item->exame->ref_min === null 
                                      && $item->exame->ref_max === null;

                        return [
                            'id_item' => $item->id_item,
                            'nome_exame' => $item->exame->nome_exame,
                            'referencias' => [
                                'min' => $item->exame->ref_min,
                                'max' => $item->exame->ref_max,
                                'json' => $usarUniversal ? $templateUniversal : $item->exame->ref_texto 
                            ]
                        ];
                    })
                ];
            });

        return Inertia::render('Tecnico/FilaExames', [
            'pedidosPendentes' => $pedidos
        ]);
    }

    public function filaCorrecoes()
    {
        $userId = Auth::id();
        $templateUniversal = $this->getTemplateReferenciaUniversal();

        $pedidos = PedidoExame::with(['paciente.utilizador', 'itens' => function($query) use ($userId) {
                $query->whereHas('laudo', function($q) use ($userId) {
                    $q->whereIn('status', ['Devolvido', 'Devolvido_Supervisor'])
                      ->where('id_usuario_digitador', $userId);
                })->with(['exame', 'laudo']); 
            }])
            ->whereHas('itens.laudo', function($query) use ($userId) {
                $query->whereIn('status', ['Devolvido', 'Devolvido_Supervisor'])
                      ->where('id_usuario_digitador', $userId);
            })
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($pedido) use ($templateUniversal) {
                return [
                    'id_pedido' => $pedido->id_pedido,
                    'protocolo' => $pedido->protocolo,
                    'paciente'  => $pedido->paciente->utilizador->name ?? 'Não identificado',
                    'sexo'      => $pedido->paciente->sexo ?? 'M', 
                    'data' => \Carbon\Carbon::parse($pedido->data_pedido)->format('d/m/Y'),
                    'itens'     => $pedido->itens->map(function ($item) use ($templateUniversal) {
                        
                        $usarUniversal = empty(trim((string)$item->exame->ref_texto)) 
                                      && $item->exame->ref_min === null 
                                      && $item->exame->ref_max === null;

                        return [
                            'id_item' => $item->id_item,
                            'nome_exame' => $item->exame->nome_exame,
                            'resultado_anterior' => $item->laudo ? $item->laudo->resultado : null,
                            'observacao_anterior' => $item->laudo ? $item->laudo->observacao : null,
                            'status_laudo' => $item->laudo ? $item->laudo->status : null,
                            'referencias' => [
                                'min' => $item->exame->ref_min,
                                'max' => $item->exame->ref_max,
                                'json' => $usarUniversal ? $templateUniversal : $item->exame->ref_texto 
                            ]
                        ];
                    })
                ];
            });

        return Inertia::render('Tecnico/FilaCorrecoes', [
            'pedidosCorrecao' => $pedidos
        ]);
    }

    public function salvarLaudoIndividual(Request $request)
    {
        $request->validate([
            'id_item' => 'required|exists:pedido_exame_itens,id_item',
            'resultado' => 'required', 
        ]);

        $item = PedidoExameItem::with('pedido')->findOrFail($request->id_item);
        $user = auth()->user();

        $statusFinal = 'Pendente'; 
        if ($user->tipo_usuario === 'Professor') {
            $statusFinal = 'Aguardando_Supervisor';
        } elseif ($user->tipo_usuario === 'Administrador') {
            $statusFinal = 'Liberado';
        }

        $resultadoTratado = is_string($request->resultado) ? json_decode($request->resultado, true) : $request->resultado;

        try {
            $laudoExistente = Laudo::where('id_item_pedido', $request->id_item)->first();

            if ($laudoExistente) {
                $laudoExistente->update([
                    'resultado'             => $resultadoTratado,
                    'data_resultado'        => now(),
                    'id_usuario_digitador'  => $user->id,
                    'status'                => $statusFinal,
                    'observacao'            => $request->observacao,
                ]);
            } else {
                Laudo::create([
                    'id_item_pedido'        => $request->id_item,
                    'resultado'             => $resultadoTratado, 
                    'data_resultado'        => now(),
                    'id_usuario_tecnico'    => $user->id, 
                    'id_usuario_digitador'  => $user->id, 
                    'id_medico_responsavel' => $item->pedido->id_medico, 
                    'status'                => $statusFinal, 
                    'observacao'            => $request->observacao,
                ]);
            }

            $pedidoId = $item->pedido->id_pedido;

            $itensSemLaudo = PedidoExameItem::where('id_pedido', $pedidoId)
                ->whereDoesntHave('laudo')
                ->count();

            $temPendentesOuDevolvidos = Laudo::whereHas('itemPedido', function($q) use ($pedidoId) {
                $q->where('id_pedido', $pedidoId);
            })->whereIn('status', ['Pendente', 'Devolvido', 'Devolvido_Supervisor', 'Aguardando_Supervisor'])->exists();

            if ($itensSemLaudo === 0) {
                if ($temPendentesOuDevolvidos) {
                    PedidoExame::where('id_pedido', $pedidoId)->update(['status' => 'Aguardando Validação']);
                } else {
                    PedidoExame::where('id_pedido', $pedidoId)->update(['status' => 'Concluido']);
                }
            } else {
                PedidoExame::where('id_pedido', $pedidoId)->update(['status' => 'Pendente']);
            }

            $mensagem = 'Laudo salvo e enviado para a fila do Professor.';
            if ($statusFinal === 'Aguardando_Supervisor') $mensagem = 'Laudo salvo/corrigido e enviado para a liberação do Administrador.';
            if ($statusFinal === 'Liberado') $mensagem = 'Laudo assinado e liberado diretamente para o paciente!';

            $rotaRetorno = $user->tipo_usuario === 'Professor' ? 'professor.dashboard' : 'tecnico.dashboard';
            return redirect()->route($rotaRetorno)->with('success', $mensagem);

        } catch (\Exception $e) {
            Log::error('Erro ao salvar laudo (500): ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Falha interna no Banco de Dados. Contate o suporte.']);
        }
    }

    // ==========================================
    // ÁREA DA RECEPÇÃO (GESTÃO DE AGENDAMENTOS)
    // ==========================================

    public function indexAgendamentos()
    {
        $agendamentos = Agendamento::with('user')
            ->orderBy('data', 'asc')
            ->orderBy('horario', 'asc')
            ->get()
            ->map(function ($ag) {
                return [
                    'id' => $ag->id,
                    'paciente' => $ag->user->name ?? 'Não identificado',
                    'cpf' => $ag->user->cpf ?? 'N/I',
                    'data' => $ag->data,
                    'horario' => $ag->horario,
                    'status' => $ag->status,
                    'exames_pretendidos' => is_string($ag->exames_pretendidos) ? json_decode($ag->exames_pretendidos) : $ag->exames_pretendidos
                ];
            });

        $stats = [
            'pendentes' => $agendamentos->where('status', 'Agendado')->count(),
            'confirmadosHoje' => $agendamentos->where('status', 'Confirmado')->where('data', now()->toDateString())->count(),
        ];

        return Inertia::render('Admin/Agendamentos', [
            'agendamentos' => $agendamentos->values(),
            'stats' => $stats
        ]);
    }

    public function aprovarAgendamento($id)
    {
        $agendamento = Agendamento::with('user')->findOrFail($id);
        $agendamento->update(['status' => 'Confirmado']);

        $examesArray = $agendamento->exames_pretendidos;

        $instrucoes = Exame::whereIn('nome_exame', $examesArray)->select('nome_exame', 'instrucoes_preparo')->get();

        try {
            Mail::to($agendamento->user->email)->send(new AgendamentoConfirmadoMail(
                $agendamento->user->name, $agendamento->data, $agendamento->horario, $examesArray, $instrucoes
            ));
            return redirect()->back()->with('success', 'Agendamento confirmed e e-mail com guia de preparo enviado!');
        } catch (\Exception $e) {
            return redirect()->back()->with('success', 'Agendamento confirmado, mas houve um erro no servidor de e-mail.');
        }
    }

    public function cancelarAgendamento($id)
    {
        Agendamento::findOrFail($id)->delete(); 
        return redirect()->back()->with('success', 'Agendamento cancelado/recusado.');
    }


    // ==========================================
    // ÁREA DO PROFESSOR (VALIDAÇÃO DE LAUDOS E REVOGAÇÃO)
    // ==========================================

    public function validacaoLaudos()
    {
        $user = auth()->user();
        $query = Laudo::with(['itemPedido.exame', 'itemPedido.pedido.paciente.utilizador', 'digitador']);

        if ($user->tipo_usuario === 'Professor') {
            $query->whereIn('status', ['Pendente', 'Devolvido_Supervisor', 'Liberado']);
        } elseif ($user->tipo_usuario === 'Administrador') {
            $query->whereIn('status', ['Aguardando_Supervisor', 'Liberado']);
        } else {
            $query->whereIn('status', ['Pendente', 'Aguardando_Supervisor', 'Liberado']);
        }

        $templateUniversal = $this->getTemplateReferenciaUniversal();

        // Mapeia e injeta o Dicionário Universal se o exame estiver completamente em branco no banco
        $laudosPendentes = $query->orderBy('updated_at', 'desc')->get()->map(function($laudo) use ($templateUniversal) {
            if ($laudo->itemPedido && $laudo->itemPedido->exame) {
                if (empty(trim((string)$laudo->itemPedido->exame->ref_texto)) &&
                    $laudo->itemPedido->exame->ref_min === null &&
                    $laudo->itemPedido->exame->ref_max === null) {
                    
                    $laudo->itemPedido->exame->ref_texto = $templateUniversal;
                }
            }
            return $laudo;
        });

        return Inertia::render('Tecnico/ValidacaoLaudos', [
            'laudosPendentes' => $laudosPendentes
        ]);
    }

    public function aprovarLaudo($id)
    {
        try {
            $laudo = Laudo::with(['itemPedido.exame', 'itemPedido.pedido.paciente.utilizador'])->findOrFail($id);
            $user = auth()->user();

            if ($user->tipo_usuario === 'Professor') {
                $laudo->update([
                    'status' => 'Aguardando_Supervisor',
                    'id_usuario_validador' => $user->id 
                ]);
                return redirect()->back()->with('success', 'Laudo validado clinicamente! Enviado para liberação final do Administrador.');
            }

            $laudo->update([
                'status' => 'Liberado',
                'id_usuario_validador' => $user->id 
            ]);

            $pedidoId = $laudo->itemPedido->id_pedido ?? null;
            
            if ($pedidoId) {
                $restantes = PedidoExameItem::where('id_pedido', $pedidoId)->whereHas('laudo', function($q) {
                    $q->where('status', '!=', 'Liberado');
                })->count();

                $semLaudo = PedidoExameItem::where('id_pedido', $pedidoId)->whereDoesntHave('laudo')->count();

                if ($restantes === 0 && $semLaudo === 0) {
                    PedidoExame::where('id_pedido', $pedidoId)->update(['status' => 'Concluido']);
                }
            }

            try {
                $paciente = $laudo->itemPedido->pedido->paciente->utilizador ?? null;
                if ($paciente && $paciente->email) {
                    Mail::to($paciente->email)->send(new LaudoLiberadoMail($laudo, $paciente->name, $laudo->itemPedido->exame->nome_exame, $laudo->itemPedido->pedido->protocolo));
                }
                return redirect()->back()->with('success', 'Laudo aprovado e paciente notificado via E-mail!');
            } catch (\Exception $e) {
                return redirect()->back()->with('success', 'Laudo aprovado, mas o servidor de E-mail falhou (Paciente não notificado).');
            }
        } catch (\Exception $e) {
            Log::error("Erro 500 no Aprovar Laudo: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Falha no Banco de Dados.']);
        }
    }

    public function recusarLaudo($id)
    {
        try {
            $laudo = Laudo::with('itemPedido')->findOrFail($id);
            $pedidoId = $laudo->itemPedido->id_pedido ?? null;
            $user = auth()->user();
            
            if ($user->tipo_usuario === 'Administrador') {
                $novoStatus = 'Devolvido_Supervisor';
                $mensagem = 'Laudo devolvido para a fila do Professor para correções.';
            } else {
                $novoStatus = 'Devolvido';
                $mensagem = 'Laudo devolvido para a Bancada Virtual do Aluno para correções.';
            }
            
            $laudo->update([
                'status' => $novoStatus,
                'id_usuario_validador' => $user->id 
            ]);
            
            if ($pedidoId) {
                PedidoExame::where('id_pedido', $pedidoId)->update(['status' => 'Pendente']);
            }

            return redirect()->back()->with('success', $mensagem);
        } catch (\Exception $e) {
            Log::error("Erro 500 no Recusar Laudo: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Falha no Banco de Dados. A coluna "status" pode não estar aceitando a palavra "'.$novoStatus.'".']);
        }
    }

    public function revogarLaudo($id)
    {
        $laudo = Laudo::findOrFail($id);
        $laudo->update([
            'status' => 'Pendente',
            'id_usuario_validador' => null
        ]);
        
        $pedidoId = $laudo->itemPedido->id_pedido;
        PedidoExame::where('id_pedido', $pedidoId)->update(['status' => 'Aguardando Validação']);

        return redirect()->back()->with('success', 'Laudo REVOGADO com sucesso. Ele voltou para a sua Fila de Revisão.');
    }


    // ==========================================
    // ÁREA DO USUÁRIO (PACIENTE)
    // ==========================================

    public function dashboardPaciente()
    {
        $user = Auth::user();
        $pacienteModel = $user->paciente; // Captura o model do relacionamento
        $pacienteId = $pacienteModel->id_paciente ?? 0;

        $pedidos = PedidoExame::with(['itens.exame', 'itens.laudo'])
            ->where('id_paciente', $pacienteId)
            ->orderBy('created_at', 'desc')
            ->get();

        $logDeExames = [];

        foreach ($pedidos as $pedido) {
            $dataSolicitacao = \Carbon\Carbon::parse($pedido->data_pedido)->format('d/m/Y');
            
            $maiorPrazoDias = 0;
            foreach ($pedido->itens as $item) {
                if ($item->exame && $item->exame->prazo_resultado > $maiorPrazoDias) {
                    $maiorPrazoDias = $item->exame->prazo_resultado;
                }
            }
            
            $dataPrevista = \Carbon\Carbon::parse($pedido->data_pedido)->addWeekdays($maiorPrazoDias)->format('d/m/Y');

            foreach ($pedido->itens as $item) {
                if ($item->exame) {
                    $statusExame = 'Em Análise'; 
                    $idLaudo = null;
                    
                    if ($item->laudo) {
                        $statusExame = $item->laudo->status; 
                        
                        if ($statusExame === 'Pendente' || $statusExame === 'Aguardando_Supervisor' || $statusExame === 'Devolvido' || $statusExame === 'Devolvido_Supervisor') {
                            $statusExame = 'Aguardando Validação'; 
                        }
                        if ($statusExame === 'Liberado') {
                            $idLaudo = $item->laudo->id_laudo;
                        }
                    }

                    $mostrarInstrucoes = ($statusExame !== 'Liberado') ? $item->exame->instrucoes_preparo : null;

                    $logDeExames[] = [
                        'nome_exame' => $item->exame->nome_exame,
                        'instrucoes_preparo' => $mostrarInstrucoes,
                        'status' => $statusExame,
                        'data_solicitacao' => $dataSolicitacao,
                        'prazo_previsto' => $dataPrevista,
                        'id_laudo' => $idLaudo
                    ];
                }
            }
        }

        $agendamentosFuturos = Agendamento::where('user_id', $user->id)
            ->whereIn('status', ['Agendado', 'Confirmado'])
            ->get();

        foreach ($agendamentosFuturos as $ag) {
            $dadosBrutos = $ag->exames_pretendidos ?? [];
            $examesPretendidos = is_string($dadosBrutos) ? json_decode($dadosBrutos, true) : $dadosBrutos;
            
            if (is_array($examesPretendidos) && !empty($examesPretendidos)) {
                $instrucoesDB = Exame::whereIn('nome_exame', $examesPretendidos)->get();
                foreach ($instrucoesDB as $ex) {
                    $logDeExames[] = [
                        'nome_exame' => $ex->nome_exame,
                        'instrucoes_preparo' => $ex->instrucoes_preparo,
                        'status' => $ag->status, 
                        'data_solicitacao' => \Carbon\Carbon::parse($ag->data)->format('d/m/Y'),
                        'prazo_previsto' => null,
                        'id_laudo' => null
                    ];
                }
            }
        }

        return Inertia::render('Paciente/Dashboard', [
            'meusAgendamentos' => $logDeExames,
            // <-- ENVIANDO DADOS DO NOME SOCIAL E PREFERÊNCIA PARA CONTROLAR O POP-UP NO REACT
            'dadosNomeSocial' => [
                'nome_social' => $pacienteModel->nome_social ?? null,
                'usar_nome_social' => $pacienteModel->usar_nome_social ?? null
            ]
        ]);
    }

    /**
     * SALVAR PREFERÊNCIA DE USO DO NOME SOCIAL (1º ACESSO DO PACIENTE)
     */
    public function salvarPreferenciaNome(Request $request)
    {
        $request->validate([
            'usar_nome_social' => 'required|boolean'
        ]);

        $paciente = auth()->user()->paciente;
        $paciente->update([
            'usar_nome_social' => $request->usar_nome_social
        ]);

        $msg = $request->usar_nome_social 
            ? 'Preferência salva! A partir de agora utilizaremos seu Nome Social nas dependências do laboratório.' 
            : 'Preferência salva! Manteremos a exibição do seu Nome Civil.';

        return redirect()->back()->with('success', $msg);
    }

    public function historico()
    {
        $user = Auth::user();
        $pacienteId = $user->paciente->id_paciente ?? 0;

        $laudos = Laudo::whereHas('itemPedido.pedido', function($q) use ($pacienteId) {
            $q->where('id_paciente', $pacienteId);
        })
        ->with(['itemPedido.exame', 'itemPedido.pedido'])
        ->orderBy('data_resultado', 'desc')
        ->get();

        return Inertia::render('Paciente/Historico', [
            'laudos' => $laudos
        ]);
    }

    public function meusLaudos()
    {
        $user = Auth::user();
        $pacienteId = $user->paciente->id_paciente ?? 0;

        $laudos = Laudo::with(['itemPedido.exame', 'itemPedido.pedido.medico'])
            ->whereHas('itemPedido.pedido', function ($query) use ($pacienteId) {
                $query->where('id_paciente', $pacienteId);
            })
            ->where('status', 'Liberado')
            ->orderBy('data_resultado', 'desc')
            ->get();

        return Inertia::render('Paciente/MeusLaudos', [
            'laudos' => $laudos
        ]);
    }

    public function salvarAgendamento(Request $request)
    {
        $request->validate([
            'data' => 'required|date|after:today',
            'horario' => 'required|string',
            'exames' => 'required|array|min:1'
        ]);

        $conflito = Agendamento::where('data', $request->data)->where('horario', $request->horario)->where('status', 'Agendado')->exists();

        if ($conflito) return redirect()->back()->withErrors(['horario' => 'Este horário já está reservado. Por favor, escolha outro.']);

        Agendamento::create([
            'user_id' => Auth::id(),
            'data' => $request->data,
            'horario' => $request->horario,
            'exames_pretendidos' => $request->exames, 
            'status' => 'Agendado'
        ]);

        return redirect()->route('paciente.dashboard')->with('success', 'Agendamento confirmado! Verifique sua guia de preparo no painel.');
    }

    // ==========================================
    // DOWNLOAD DE LAUDOS E PROTOCOLOS EM PDF
    // ==========================================

    public function downloadLaudoPdf($id_laudo)
    {
        $user = Auth::user();
        $tipoUsuario = $user->tipo_usuario;

        $query = Laudo::with(['itemPedido.exame', 'itemPedido.pedido.medico', 'itemPedido.pedido.paciente.utilizador', 'validador'])
            ->where('id_laudo', $id_laudo)
            ->where('status', 'Liberado');

        if ($tipoUsuario === 'Paciente') {
            $pacienteId = $user->paciente->id_paciente ?? 0;
            $query->whereHas('itemPedido.pedido', function($q) use ($pacienteId) {
                $q->where('id_paciente', $pacienteId);
            });
        }

        $laudo = $query->firstOrFail();

        $laudos = collect([$laudo]);
        $pedido = $laudo->itemPedido->pedido;

        $logoPath = public_path('logo-cruzeiro.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }

        $configsDB = Configuracao::pluck('valor', 'chave')->toArray();
        
        $assinaturas = [
            'revisor_nome' => $configsDB['revisor_nome'] ?? 'Dra. Karin D. Oliveira',
            'revisor_crbm' => $configsDB['revisor_crbm'] ?? '69274',
            'liberador_nome' => $configsDB['liberador_nome'] ?? 'Dr. Luiz Carlos Barone',
            'liberador_crbm' => $configsDB['liberador_crbm'] ?? '2691',
        ];

        $pdf = Pdf::loadView('pdf.laudo', compact('pedido', 'laudos', 'logoBase64', 'assinaturas', 'configsDB'));
        
        $nomeExame = \Str::slug($laudo->itemPedido->exame->nome_exame);
        return $pdf->download("Laudo_{$nomeExame}_{$pedido->protocolo}.pdf");
    }

    public function downloadProtocoloPdf($protocolo)
    {
        $user = Auth::user();
        $tipoUsuario = $user->tipo_usuario;

        $query = Laudo::with(['itemPedido.exame', 'itemPedido.pedido.medico', 'itemPedido.pedido.paciente.utilizador', 'validador'])
            ->whereHas('itemPedido.pedido', function($q) use ($protocolo) {
                $q->where('protocolo', $protocolo);
            })
            ->where('status', 'Liberado');

        if ($tipoUsuario === 'Paciente') {
            $pacienteId = $user->paciente->id_paciente ?? 0;
            $query->whereHas('itemPedido.pedido', function($q) use ($pacienteId) {
                $q->where('id_paciente', $pacienteId);
            });
        }

        $laudos = $query->get();

        if ($laudos->isEmpty()) {
            abort(404, 'Nenhum laudo liberado encontrado para este protocolo.');
        }

        $pedido = $laudos->first()->itemPedido->pedido;

        $logoPath = public_path('logo-cruzeiro.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }

        $configsDB = \App\Models\Configuracao::pluck('valor', 'chave')->toArray();
        
        $assinaturas = [
            'revisor_nome' => $configsDB['revisor_nome'] ?? 'Dra. Karin D. Oliveira',
            'revisor_crbm' => $configsDB['revisor_crbm'] ?? '69274',
            'liberador_nome' => $configsDB['liberador_nome'] ?? 'Dr. Luiz Carlos Barone',
            'liberador_crbm' => $configsDB['liberador_crbm'] ?? '2691',
        ];

        $pdf = Pdf::loadView('pdf.laudo', compact('pedido', 'laudos', 'logoBase64', 'assinaturas', 'configsDB'));
        
        return $pdf->download("Resultados_Completos_{$protocolo}.pdf");
    }
}