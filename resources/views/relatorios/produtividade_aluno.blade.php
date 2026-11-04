<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Desempenho de Turma - AstraLab</title>
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
        .tag-green { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
        .tag-red { background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
        .tag-neutral { background-color: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <table>
            <tr>
                <td style="width: 50%;">
                    <h1 class="title"><span style="color: #1f547e;">Astra</span><span style="color: #15803d;">Lab</span></h1>
                    <span class="subtitle">Relatório Acadêmico de Desempenho (Turmas)</span>
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
                <th style="width: 35%;">Nome do Aluno / Digitador</th>
                <th style="width: 15%; text-align: center;">Total Produzido</th>
                <th style="width: 15%; text-align: center;">Aprovados</th>
                <th style="width: 15%; text-align: center;">Devolvidos (Erros)</th>
                <th style="width: 20%; text-align: center;">Taxa de Acerto</th>
            </tr>
        </thead>
        <tbody>
            @forelse($dados['metricas_alunos'] as $aluno)
                <tr>
                    <td style="font-weight: bold; color: #1e293b;">{{ $aluno['nome'] }}</td>
                    <td style="text-align: center;"><span class="tag-neutral">{{ $aluno['total'] }} laudos</span></td>
                    <td style="text-align: center;"><span class="tag-green">{{ $aluno['aprovados'] }} corretos</span></td>
                    <td style="text-align: center;"><span class="tag-red">{{ $aluno['devolvidos'] }} erros</span></td>
                    <td style="text-align: center;">
                        <strong style="font-size: 14px; color: {{ $aluno['taxa_acerto'] >= 80 ? '#15803d' : ($aluno['taxa_acerto'] >= 50 ? '#ca8a04' : '#dc2626') }};">
                            {{ $aluno['taxa_acerto'] }}%
                        </strong>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #64748b;">Nenhuma atividade de digitação encontrada para os alunos no período selecionado.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Documento Restrito - Gerado pelo Sistema AstraLab em {{ date('d/m/Y H:i:s') }}
    </div>
</body>
</html>