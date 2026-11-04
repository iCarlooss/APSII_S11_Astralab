<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório Gerencial - AstraLab</title>
    <style>
        @page { margin: 40px; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #334155; font-size: 12px; }
        .header { border-bottom: 2px solid #1f547e; padding-bottom: 10px; margin-bottom: 20px; }
        .header table { width: 100%; }
        .header td { vertical-align: middle; }
        .title { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0; }
        .subtitle { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .kpi-container { width: 100%; margin-bottom: 30px; border-collapse: separate; border-spacing: 15px 0; }
        .kpi-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; width: 25%; }
        .kpi-title { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
        .kpi-value { font-size: 24px; font-weight: 900; color: #1f547e; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .data-table th { background-color: #1f547e; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
        .data-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
        .section-title { font-size: 14px; font-weight: 900; color: #1f547e; margin-bottom: 10px; border-left: 4px solid #15803d; padding-left: 8px; text-transform: uppercase; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td style="width: 50%;">
                    <h1 class="title"><span style="color: #1f547e;">Astra</span><span style="color: #15803d;">Lab</span></h1>
                    <span class="subtitle">Relatório Gerencial de Produção</span>
                </td>
                <td style="width: 50%; text-align: right;">
                    <span class="subtitle">Período Analisado:</span><br>
                    <strong style="color: #334155; font-size: 14px;">
                        {{ \Carbon\Carbon::parse($dataInicio)->format('d/m/Y') }} a {{ \Carbon\Carbon::parse($dataFim)->format('d/m/Y') }}
                    </strong>
                </td>
            </tr>
        </table>
    </div>

    <table class="kpi-container">
        <tr>
            <td class="kpi-box">
                <div class="kpi-title">Total de Laudos Processados</div>
                <div class="kpi-value">{{ $dados['total_laudos'] }}</div>
            </td>
            <td class="kpi-box" style="border-bottom: 3px solid #15803d;">
                <div class="kpi-title">Laudos Liberados</div>
                <div class="kpi-value" style="color: #15803d;">{{ $dados['liberados'] }}</div>
            </td>
            <td class="kpi-box" style="border-bottom: 3px solid #dc2626;">
                <div class="kpi-title">Devolvidos / Recusados</div>
                <div class="kpi-value" style="color: #dc2626;">{{ $dados['recusados'] }}</div>
            </td>
            <td class="kpi-box" style="border-bottom: 3px solid #eab308;">
                <div class="kpi-title">Aguardando Análise</div>
                <div class="kpi-value" style="color: #ca8a04;">{{ $dados['em_analise'] }}</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Produtividade por Professor (Validações Realizadas)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 70%;">Nome do Professor Responsável</th>
                <th style="width: 30%; text-align: center;">Volume de Laudos Validados</th>
            </tr>
        </thead>
        <tbody>
            @forelse($dados['produtividade_professores'] as $prof)
                <tr>
                    <td style="font-weight: bold;">{{ $prof['nome'] }}</td>
                    <td style="text-align: center; font-weight: 900; color: #1f547e; font-size: 14px;">
                        {{ $prof['total'] }} <span style="font-size: 10px; color: #64748b; font-weight: normal;">laudos</span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="2" style="text-align: center; padding: 20px; color: #64748b;">Nenhuma validação registrada neste período.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Gerado pelo Sistema AstraLab em {{ date('d/m/Y H:i:s') }} - Acesso Administrativo Institucional
    </div>
</body>
</html>