<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>TAT - Turnaround Time</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; color: #334155; margin: 20px; }
        .header-table { width: 100%; border-bottom: 2px solid #1f547e; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 22px; color: #1f547e; font-weight: bold; text-transform: uppercase; }
        .subtitle { font-size: 11px; color: #64748b; }
        .kpi-table { width: 100%; margin-bottom: 30px; border-spacing: 15px 0; }
        .kpi-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 5px solid #16a34a; padding: 25px; border-radius: 4px; text-align: center; }
        .kpi-value { font-size: 40px; font-weight: bold; color: #166534; margin-bottom: 5px; }
        .kpi-label { font-size: 12px; text-transform: uppercase; color: #16a34a; font-weight: bold; letter-spacing: 1px; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 4px; font-size: 13px; line-height: 1.6; }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td width="70%">
                <div class="title">Indicador de Eficiência (TAT)</div>
                <div class="subtitle">Turnaround Time Operacional Analítico - AstraLab</div>
            </td>
            <td width="30%" style="text-align: right;">
                <div style="font-size: 10px; color: #64748b;">
                    <strong>PERÍODO AVALIADO:</strong><br>
                    {{ $dataInicio ? \Carbon\Carbon::parse($dataInicio)->format('d/m/Y') : 'Início' }} a {{ $dataFim ? \Carbon\Carbon::parse($dataFim)->format('d/m/Y') : 'Hoje' }}
                </div>
            </td>
        </tr>
    </table>

    <table class="kpi-table">
        <tr>
            <td width="50%">
                <div class="kpi-box" style="background: #f8fafc; border-color:#e2e8f0; border-left-color: #1f547e;">
                    <div class="kpi-label" style="color: #1f547e;">Volume de Laudos Concluídos</div>
                    <div class="kpi-value" style="color: #0f1c3f;">{{ $dados['laudos_analisados'] }}</div>
                </div>
            </td>
            <td width="50%">
                <div class="kpi-box">
                    <div class="kpi-label">Tempo Médio de Liberação</div>
                    <div class="kpi-value">{{ $dados['tat_medio_horas'] }} <span style="font-size: 20px;">Horas</span></div>
                </div>
            </td>
        </tr>
    </table>

    <div class="info-box">
        <h3 style="margin-top: 0; color: #1f547e;">O que é o TAT?</h3>
        <p>O <strong>Turnaround Time (TAT)</strong> é a principal métrica de performance de um laboratório clínico. Ele mede exatamente a quantidade de horas que decorrem desde o exato segundo em que a receção do AstraLab abriu a Ordem de Serviço (OS) até o exato segundo em que o Administrador/Professor assinou o laudo final, libertando-o para o paciente no sistema.</p>
        
        <p><strong>Meta Institucional:</strong> Idealmente, em um laboratório não-urgente, a meta é manter o TAT abaixo de 48 horas operacionais, garantindo fluidez para a equipe e segurança para a conduta médica do paciente.</p>
    </div>
</body>
</html>