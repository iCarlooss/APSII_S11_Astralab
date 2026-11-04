<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Índice de Rejeição e Qualidade</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #334155; margin: 20px; }
        .header-table { width: 100%; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 22px; color: #dc2626; font-weight: bold; text-transform: uppercase; }
        .subtitle { font-size: 11px; color: #64748b; }
        .kpi-box { background: #fef2f2; border: 1px solid #fecaca; border-left: 5px solid #dc2626; padding: 15px; border-radius: 4px; text-align: center; margin-bottom: 30px; }
        .kpi-value { font-size: 28px; font-weight: bold; color: #991b1b; margin-bottom: 5px; }
        .kpi-label { font-size: 10px; text-transform: uppercase; color: #dc2626; font-weight: bold; letter-spacing: 1px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { background: #991b1b; color: #ffffff; font-size: 10px; text-transform: uppercase; padding: 10px; text-align: left; }
        .data-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        .data-table tr:nth-child(even) { background-color: #f8fafc; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td width="70%">
                <div class="title">Auditoria de Qualidade e Rejeição</div>
                <div class="subtitle">Controle de Laudos Recusados/Devolvidos pelos Professores</div>
            </td>
            <td width="30%" style="text-align: right;">
                <div style="font-size: 10px; color: #64748b;">
                    <strong>PERÍODO:</strong><br>
                    {{ $dataInicio ? \Carbon\Carbon::parse($dataInicio)->format('d/m/Y') : 'Início' }} a {{ $dataFim ? \Carbon\Carbon::parse($dataFim)->format('d/m/Y') : 'Hoje' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="kpi-box">
        <div class="kpi-label">Volume Total de Laudos Devolvidos para Correção (Erro Técnico)</div>
        <div class="kpi-value">{{ $dados['total_rejeitados'] }}</div>
    </div>

    <table width="100%" cellpadding="15">
        <tr>
            <td width="50%" valign="top">
                <h3 style="color: #991b1b;">Ranking por Exame (Gargalo Técnico)</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th width="75%">Nome do Exame</th>
                            <th width="25%">Devoluções</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($dados['ranking_exames'] as $exame)
                            <tr>
                                <td>{{ $exame['nome'] }}</td>
                                <td style="text-align: center; font-weight: bold; color: #dc2626;">{{ $exame['quantidade'] }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="2" style="text-align: center;">Nenhuma rejeição registrada.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
            <td width="50%" valign="top">
                <h3 style="color: #991b1b;">Ranking por Aluno (Gargalo Operacional)</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th width="75%">Nome do Aluno/Técnico</th>
                            <th width="25%">Devoluções</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($dados['ranking_alunos'] as $aluno)
                            <tr>
                                <td>{{ $aluno['nome'] }}</td>
                                <td style="text-align: center; font-weight: bold; color: #dc2626;">{{ $aluno['quantidade'] }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="2" style="text-align: center;">Nenhuma rejeição registrada.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>