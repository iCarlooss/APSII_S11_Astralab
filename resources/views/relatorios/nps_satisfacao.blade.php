<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de NPS e Satisfação</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #334155; margin: 20px; }
        .header-table { width: 100%; border-bottom: 2px solid #1f547e; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 22px; color: #1f547e; font-weight: bold; text-transform: uppercase; }
        .subtitle { font-size: 11px; color: #64748b; }
        .kpi-table { width: 100%; margin-bottom: 30px; border-spacing: 15px 0; }
        .kpi-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid #15803d; padding: 15px; border-radius: 4px; }
        .kpi-value { font-size: 28px; font-weight: bold; color: #0f1c3f; margin-bottom: 5px; }
        .kpi-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 1px; }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .data-table th { background: #1f547e; color: #ffffff; font-size: 10px; text-transform: uppercase; padding: 10px; text-align: left; }
        .data-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; vertical-align: top; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
        .stars { color: #f59e0b; font-size: 14px; font-weight: bold; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td width="70%">
                <div class="title">Relatório de NPS e Satisfação</div>
                <div class="subtitle">Avaliações dos Pacientes - AstraLab Centro de Diagnóstico</div>
            </td>
            <td width="30%" style="text-align: right;">
                <div style="font-size: 10px; color: #64748b;">
                    <strong>PERÍODO:</strong><br>
                    {{ $dataInicio ? \Carbon\Carbon::parse($dataInicio)->format('d/m/Y') : 'Início' }} a {{ $dataFim ? \Carbon\Carbon::parse($dataFim)->format('d/m/Y') : 'Hoje' }}
                </div>
            </td>
        </tr>
    </table>

    <table class="kpi-table">
        <tr>
            <td width="50%">
                <div class="kpi-box">
                    <div class="kpi-label">Total de Avaliações Recebidas</div>
                    <div class="kpi-value">{{ $dados['total_avaliacoes'] }}</div>
                </div>
            </td>
            <td width="50%">
                <div class="kpi-box" style="border-left-color: #f59e0b;">
                    <div class="kpi-label">Nota Média Geral (Estrelas)</div>
                    <div class="kpi-value">
                        {{ number_format($dados['media_geral'], 1, ',', '.') }} <span class="stars">★</span>
                    </div>
                </div>
            </td>
        </tr>
    </table>

    <h3 style="color: #1f547e; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px;">Mural de Elogios e Comentários</h3>
    
    @if(count($dados['comentarios']) > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th width="10%">Data</th>
                    <th width="15%">Protocolo</th>
                    <th width="20%">Paciente</th>
                    <th width="10%">Nota</th>
                    <th width="45%">Comentário Registrado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($dados['comentarios'] as $comentario)
                    <tr>
                        <td>{{ $comentario['data'] }}</td>
                        <td style="font-family: monospace;">{{ $comentario['protocolo'] }}</td>
                        <td>{{ $comentario['paciente'] }}</td>
                        <td class="stars">
                            {{ str_repeat('★', $comentario['nota']) }}
                        </td>
                        <td><i>"{{ $comentario['comentario'] }}"</i></td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p style="text-align: center; color: #94a3b8; padding: 30px;">Nenhum comentário registrado com texto no período selecionado.</p>
    @endif
</body>
</html>