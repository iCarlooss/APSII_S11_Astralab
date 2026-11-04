<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Auditoria do Sistema - AstraLab</title>
    <style>
        @page { margin: 40px; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #334155; font-size: 12px; }
        .header { border-bottom: 2px solid #1f547e; padding-bottom: 10px; margin-bottom: 20px; }
        .header table { width: 100%; }
        .title { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0; }
        .subtitle { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .data-table th { background-color: #0f172a; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
        .data-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td style="width: 50%;">
                    <h1 class="title"><span style="color: #1f547e;">Astra</span><span style="color: #15803d;">Lab</span></h1>
                    <span class="subtitle">Auditoria de Ações e Logs do Sistema</span>
                </td>
                <td style="width: 50%; text-align: right;">
                    <span class="subtitle">Período de Análise:</span><br>
                    <strong style="color: #334155; font-size: 14px;">
                        {{ \Carbon\Carbon::parse($dataInicio)->format('d/m/Y') }} a {{ \Carbon\Carbon::parse($dataFim)->format('d/m/Y') }}
                    </strong>
                </td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 20%;">Data / Hora</th>
                <th style="width: 20%;">Protocolo Alvo</th>
                <th style="width: 30%;">Ação Registada</th>
                <th style="width: 30%;">Utilizador Responsável</th>
            </tr>
        </thead>
        <tbody>
            @forelse($dados['logs'] as $log)
                <tr>
                    <td style="color: #64748b; font-weight: bold;">{{ $log['data'] }}</td>
                    <td style="font-family: monospace; font-weight: bold; color: #1f547e; font-size: 13px;">{{ $log['protocolo'] }}</td>
                    <td>{{ $log['acao'] }}</td>
                    <td style="text-transform: uppercase; font-weight: bold; color: #0f172a;">{{ $log['usuario'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">Nenhum log de alteração encontrado no período.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">Documento Restrito - Gerado pelo Sistema AstraLab em {{ date('d/m/Y H:i:s') }}</div>
</body>
</html>