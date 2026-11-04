<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendamento Confirmado - AstraLab</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F4F9F9; margin: 0; padding: 0; color: #334155; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #0f766e; padding: 30px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; }
        .header p { color: #ccfbf1; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 40px; }
        .content h2 { color: #0f172a; font-size: 20px; margin-top: 0; }
        .content p { font-size: 15px; line-height: 1.6; color: #475569; }
        .box-info { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 25px 0; }
        .box-info p { margin: 5px 0; color: #166534; }
        .box-info strong { color: #14532d; }
        .alert-box { background-color: #fffbeb; border: 1px solid #fef08a; border-radius: 12px; padding: 20px; margin: 25px 0; }
        .alert-box h3 { color: #b45309; margin-top: 0; font-size: 16px; margin-bottom: 10px; }
        .alert-box ul { margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; }
        .alert-box li { margin-bottom: 5px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AstraLab</h1>
            <p>Laboratório Escola</p>
        </div>
        <div class="content">
            <h2>Olá, {{ $nomePaciente }}!</h2>
            <p>Seu agendamento para coleta de exames foi <strong>aprovado</strong> pela nossa equipe de recepção. Estamos te esperando!</p>
            
            <div class="box-info">
                <p><strong>Data:</strong> {{ $data }}</p>
                <p><strong>Horário:</strong> {{ $horario }}</p>
                <p><strong>Local:</strong> Matriz AstraLab - Centro Universitário Módulo</p>
            </div>

            <p><strong>Exames Solicitados:</strong><br>
                {{ implode(', ', $exames) }}
            </p>

            <div class="alert-box">
                <h3>⚠️ Guia de Preparo Obrigatório</h3>
                <ul>
                    @foreach($instrucoes as $instrucao)
                        <li><strong>{{ $instrucao->nome_exame }}:</strong> {{ $instrucao->instrucoes_preparo ?? 'Nenhum preparo especial necessário.' }}</li>
                    @endforeach
                </ul>
                <p style="margin-top: 15px; font-size: 12px; font-style: italic;">Não seguir as instruções de jejum pode impossibilitar a realização do exame no dia.</p>
            </div>

            <p>Por favor, compareça com <strong>15 minutos de antecedência</strong> portando um documento original com foto.</p>
        </div>
        <div class="footer">
            <p><strong>AstraLab - Centro Universitário Módulo</strong></p>
            <p>Rua Maria D'Assumpção, 1000 - Martim de Sá, Caraguatatuba/SP</p>
            <p>Este é um e-mail automático, por favor, não responda.</p>
        </div>
    </div>
</body>
</html>