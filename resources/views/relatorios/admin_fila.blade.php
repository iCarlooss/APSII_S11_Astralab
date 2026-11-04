<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Raio-X da Fila - AstraLab</title>
    <style>
        @page { margin: 40px; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #334155; font-size: 12px; }
        .header { border-bottom: 2px solid #1f547e; padding-bottom: 10px; margin-bottom: 20px; }
        .header table { width: 100%; }
        .title { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0; }
        .subtitle { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .data-table th { background-color: #1f547e; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
        .data-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; vertical-align: middle; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
        .alerta-atraso { color: #dc2626; font-weight: bold; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td style="width: 50%;">
                    <h1 class="title"><span style="color: #1f547e;">Astra</span><span style="color: #15803d;">Lab</span></h1>
                    <span class="subtitle">Raio-X da Fila Operacional (Pendências)</span>
                </td>
                <td style="width: 50%; text-align: right;">
                    <span class="subtitle">Data de Extração:</span><br>
                    <strong style="color: #334155; font-size: 14px;">{{ date('d/m/Y H:i') }}</strong>
                </td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%;">Protocolo</th>
                <th style="width: 35%;">Paciente</th>
                <th style="width: 25%;">Status Atual</th>
                <th style="width: 25%; text-align: center;">Tempo na Fila</th>
            </tr>
        </thead>
        <tbody>
            @forelse($dados['fila_pendente'] as $item)
                <tr>
                    <td style="font-weight: bold; font-family: monospace; font-size: 14px; color: #1f547e;">{{ $item['protocolo'] }}</td>
                    <td style="font-weight: bold; text-transform: uppercase;">{{ $item['paciente'] }}</td>
                    <td><span style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1;">{{ $item['status'] }}</span></td>
                    <td style="text-align: center;">
                        @if($item['dias_espera'] == 0)
                            <span style="color: #15803d; font-weight: bold;">Hoje</span>
                        @elseif($item['dias_espera'] > 2)
                            <span class="alerta-atraso">⚠️ {{ $item['dias_espera'] }} dias</span>
                        @else
                            <span style="color: #ca8a04; font-weight: bold;">{{ $item['dias_espera'] }} dias</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px; color: #15803d; font-weight: bold;">
                        ✅ Excelente! Não existem laudos atrasados ou pendentes neste período.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Gerado pelo Sistema AstraLab - Acesso Administrativo Institucional
    </div>
</body>
</html>