<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Funil de Exames - AstraLab</title>
    <style>
        @page { margin: 40px; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #334155; font-size: 12px; }
        .header { border-bottom: 2px solid #1f547e; padding-bottom: 10px; margin-bottom: 20px; }
        .header table { width: 100%; }
        .title { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0; }
        .subtitle { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .data-table th { background-color: #1f547e; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
        .data-table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; vertical-align: middle; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
        .tag-blue { background-color: #e0f2fe; color: #075985; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .tag-green { background-color: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .tag-amber { background-color: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td style="width: 50%;">
                    <h1 class="title"><span style="color: #1f547e;">Astra</span><span style="color: #15803d;">Lab</span></h1>
                    <span class="subtitle">Estatísticas e Funil de Demanda (Exames)</span>
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
                <th style="width: 10%; text-align: center;">Posição</th>
                <th style="width: 45%;">Nomenclatura do Exame</th>
                <th style="width: 15%; text-align: center;">Qtd. Solicitada</th>
                <th style="width: 15%; text-align: center;">Preenchidos</th>
                <th style="width: 15%; text-align: center;">Pendentes</th>
            </tr>
        </thead>
        <tbody>
            @php $posicao = 1; @endphp
            @forelse($dados['ranking_exames'] as $exame)
                <tr>
                    <td style="text-align: center; font-weight: bold; color: #64748b;">{{ $posicao++ }}º</td>
                    <td style="font-weight: bold; color: #1e293b; text-transform: uppercase;">{{ $exame['nome_exame'] }}</td>
                    <td style="text-align: center;"><span class="tag-blue">{{ $exame['solicitados'] }}</span></td>
                    <td style="text-align: center;"><span class="tag-green">{{ $exame['concluidos'] }}</span></td>
                    <td style="text-align: center;">
                        @if($exame['pendentes'] > 0)
                            <span class="tag-amber">{{ $exame['pendentes'] }}</span>
                        @else
                            <span style="color: #cbd5e1; font-weight: bold;">0</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">Nenhuma solicitação encontrada no período.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Gerado pelo Sistema AstraLab em {{ date('d/m/Y H:i:s') }} - Acesso Administrativo Institucional
    </div>
</body>
</html>