<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Fundo e tipografia neutra para e-mails */
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f0f4f8; padding: 20px; color: #334155; margin: 0; }
        
        /* Container principal */
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 35px; border-radius: 12px; border-top: 6px solid #1f547e; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        
        /* Cabeçalho */
        .header { font-size: 28px; font-weight: 900; margin-bottom: 25px; text-align: center; letter-spacing: -0.5px; }
        .header-astra { color: #1f547e; } /* Azul Metálico AstraLab */
        .header-lab { color: #15803d; }   /* Verde AstraLab */
        
        /* Conteúdo */
        .content { font-size: 15px; line-height: 1.6; color: #475569; }
        
        /* Caixa de Destaque (Exame) */
        .destaque { background-color: #f8fafc; padding: 20px; border-radius: 8px; font-weight: bold; margin: 25px 0; text-align: center; border-left: 4px solid #15803d; }
        .nome-exame { color: #1f547e; font-size: 18px; display: block; margin-top: 5px; text-transform: uppercase; }
        
        /* Caixa do Protocolo (Login) */
        .protocolo-box { border: 2px dashed #94a3b8; background-color: #eff6ff; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0; }
        .protocolo-valor { color: #1f547e; font-size: 28px; font-weight: 900; letter-spacing: 4px; display: block; margin-top: 10px; font-family: 'Courier New', Courier, monospace; }
        
        /* Botão */
        .btn { display: inline-block; background-color: #1f547e; color: #ffffff; text-decoration: none; padding: 18px 32px; border-radius: 8px; font-weight: 900; margin-top: 10px; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; }
        .btn:hover { background-color: #163e5e; }
        
        /* Rodapé */
        .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="header-astra">Astra</span><span class="header-lab">Lab</span>
        </div>
        
        <div class="content">
            <p>Olá, <strong style="color: #1e293b;">{{ $nomePaciente }}</strong>!</p>
            <p>Temos uma ótima notícia: o resultado do seu exame já passou pela nossa equipe de especialistas, foi assinado eletronicamente e acaba de ser liberado.</p>
            
            <div class="destaque">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Exame Liberado</span>
                <span class="nome-exame">{{ $nomeExame }}</span>
            </div>

            <p>Para acompanhar a sua evolução clínica na Linha do Tempo ou fazer o download do seu <strong>Laudo Oficial em PDF</strong>, acesse o Portal do Paciente utilizando os seus dados de acesso:</p>
            
            <div class="protocolo-box">
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Seu Login:</span> 
                <strong style="color: #1e293b; font-size: 14px;">Seu CPF</strong><br><br>
                
                <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Sua Senha (Protocolo da OS):</span>
                <span class="protocolo-valor">{{ $protocolo }}</span>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ url('/login') }}" class="btn">Acessar Meus Resultados</a>
            </div>
        </div>

        <div class="footer">
            Este é um aviso automático gerado pelo sistema integrado <strong>AstraLab</strong>. Por favor, não responda a este e-mail.<br>
            Centro de Diagnóstico e Laboratório Escola © {{ date('Y') }}. Todos os direitos reservados.
        </div>
    </div>
</body>
</html>