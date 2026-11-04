<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Laudo Laboratorial - AstraLab</title>
    <style>
        /* ==========================================
           CONFIGURAÇÕES DE IMPRESSÃO E PAGINAÇÃO
           ========================================== */
        @page {
            /* Aumentado o topo (de 130px para 150px) para caber o logo maior */
            margin: 150px 40px 100px 40px;
        }
        
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #334155;
            font-size: 11px;
            line-height: 1.4;
        }

        /* Cores Laboratoriais AstraLab */
        .text-blue-950 { color: #1f547e; } 
        .text-green-700 { color: #15803d; }
        .text-danger { color: #dc2626; }

        table { width: 100%; border-collapse: collapse; }
        
        /* Regras vitais para o DOMPDF não criar páginas em branco */
        table.tabela-resultados { page-break-inside: auto; }
        .tabela-resultados tr { page-break-inside: avoid; page-break-after: auto; }
        .tabela-resultados thead { display: table-header-group; }
        .tabela-resultados tfoot { display: table-footer-group; }

        /* Cabeçalho Fixo - Aumentado para o logo */
        header {
            position: fixed;
            top: -120px; /* Ajustado */
            left: 0;
            right: 0;
            height: 100px; /* Ajustado */
            border-bottom: 2px solid #1f547e;
            padding-bottom: 10px;
        }

        /* Rodapé Fixo */
        footer {
            position: fixed;
            bottom: -70px;
            left: 0;
            right: 0;
            height: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            text-align: center;
            font-size: 9px;
            color: #64748b;
        }

        /* Box de Dados do Paciente */
        .paciente-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 15px;
            padding: 12px 15px;
        }
        
        .label { font-weight: bold; color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-weight: bold; color: #0f172a; font-size: 12px; }

        /* Título do Exame */
        .titulo-exame {
            background-color: #1f547e; 
            color: white;
            text-align: center;
            padding: 8px;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 15px;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-radius: 4px;
        }

        /* Design da Tabela de Resultados */
        .tabela-resultados th {
            background-color: #f1f5f9;
            color: #1f547e;
            font-weight: bold;
            font-size: 10px;
            text-align: left;
            padding: 8px;
            border-top: 2px solid #1f547e;
            border-bottom: 2px solid #cbd5e1;
            text-transform: uppercase;
        }
        
        .tabela-resultados td {
            padding: 7px 8px;
            font-size: 11px;
            border-bottom: 1px solid #f1f5f9;
        }

        /* Linhas alternadas para facilitar a leitura */
        .tabela-resultados tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }

        /* Box de Assinaturas */
        .assinatura-box {
            margin-top: 40px;
            page-break-inside: avoid;
            text-align: center; /* Centraliza tudo dentro do box */
        }

        .assinatura-img {
            width: 250px;       /* Defina aqui o tamanho ideal (ex: 200px a 300px) */
            height: auto;       /* Mantém a proporção da imagem */
            display: block;
            margin: 0 auto 10px auto; /* Centraliza a imagem e dá espaço para a linha */
        }

        .linha-assinatura {
            border-top: 1px solid #1f547e;
            margin: 5px auto;   /* Centralizado */
            width: 80%;
        }
    </style>
</head>
<body>

    <header>
        <table>
            <tr>
                <td style="width: 30%;">
                    <h2 style="margin: 0; color: #0f1c3f; font-size: 30px; font-weight: 900;">Astra<span style="color: #15803d;">lab</span></h2>
                    <span style="font-size: 9px; color: #64748b; font-weight: bold; letter-spacing: 1.5px;">CENTRO DE DIAGNÓSTICO</span>
                </td>
                <td style="width: 40%; text-align: center; font-size: 9px; color: #64748b; line-height: 1.3;">
                    <strong style="color: #334155; font-size: 11px;">Matriz Operacional - Cruzeiro do Sul</strong><br>
                    Avenida Pres. Juscelino Kubitschek - São Paulo/SP<br>
                    Padrão de Qualidade Certificado
                </td>
                <td style="width: 30%; text-align: right;">
                    @if(!empty($logoBase64))
                        <img src="{{ $logoBase64 }}" alt="Logo" style="height: 80px; width: auto; max-width: 180px;">
                    @else
                        <strong style="color: #0f1c3f; font-size: 16px;">Cruzeiro do Sul</strong>
                    @endif
                </td>
            </tr>
        </table>
    </header>

    <footer>
        {{ $configsDB['rodape_laudo'] ?? 'Este documento foi assinado eletronicamente e possui validade legal. AstraLab - Cruzeiro do Sul.' }}<br>
        Documento impresso em {{ date('d/m/Y \à\s H:i') }}. Página <span class="page-number"></span>
    </footer>

    <main>
        @foreach($laudos as $laudo)
            @php 
                $n = $laudo->itemPedido->exame->nome_exame; 
                $refs = [];
                $refSimplesTexto = '';
                $sexoPaciente = $pedido->paciente->sexo ?? 'M'; 
                
                // Descompacta o Dicionário Universal
                $textoRefBanco = $laudo->itemPedido->exame->ref_texto;
                while (is_string($textoRefBanco) && str_starts_with(trim($textoRefBanco), '{')) {
                    $parsed = json_decode($textoRefBanco, true);
                    if (json_last_error() === JSON_ERROR_NONE && $parsed !== $textoRefBanco) {
                        $textoRefBanco = $parsed;
                    } else { break; }
                }

                if (is_array($textoRefBanco)) {
                    $refs = $textoRefBanco;
                } else {
                    $min = $laudo->itemPedido->exame->ref_min;
                    $max = $laudo->itemPedido->exame->ref_max;
                    if ($min !== null && $max !== null) { $refSimplesTexto = "{$min} a {$max}"; } 
                    elseif ($min !== null) { $refSimplesTexto = "Maior que {$min}"; } 
                    elseif ($max !== null) { $refSimplesTexto = "Até {$max}"; } 
                    else { $refSimplesTexto = $laudo->itemPedido->exame->ref_texto ?? 'Consulte o médico'; }
                }

                // Descompacta os Resultados
                $resultadoArr = $laudo->resultado;
                while (is_string($resultadoArr) && str_starts_with(trim($resultadoArr), '{')) {
                    $parsed = json_decode($resultadoArr, true);
                    if (json_last_error() === JSON_ERROR_NONE && $parsed !== $resultadoArr) {
                        $resultadoArr = $parsed;
                    } else { break; }
                }
            @endphp
            
            <div class="paciente-box">
                <table style="width: 100%;">
                    <tr>
                        <td colspan="2" style="width: 50%;">
                            <span class="label">Paciente:</span><br>
                            <span class="value" style="font-size: 15px; color: #1f547e;">
                                @if($pedido->paciente->usar_nome_social && !empty($pedido->paciente->nome_social))
                                    {{ $pedido->paciente->nome_social }}
                                    <span style="font-size: 10px; color: #64748b; font-weight: normal; margin-left: 5px;">
                                        (Nome Civil: {{ $pedido->paciente->utilizador->name }})
                                    </span>
                                @else
                                    {{ $pedido->paciente->utilizador->name }}
                                @endif
                            </span>
                        </td>
                        <td style="width: 25%;">
                            <span class="label">Nascimento / Idade:</span><br>
                            <span class="value">{{ \Carbon\Carbon::parse($pedido->paciente->data_nascimento)->format('d/m/Y') }} ({{ \Carbon\Carbon::parse($pedido->paciente->data_nascimento)->age }} anos)</span>
                        </td>
                        <td style="width: 25%; text-align: right;">
                            <span class="label">Sexo:</span><br>
                            <span class="value">{{ $pedido->paciente->sexo == 'M' ? 'Masculino' : ($pedido->paciente->sexo == 'F' ? 'Feminino' : 'Não Informado') }}</span>
                        </td>
                    </tr>
                    
                    <tr>
                        <td colspan="4" style="padding-top: 8px;">
                            <span class="label">Endereço:</span> 
                            <span style="font-size: 11px; color: #334155;">
                                {{ $pedido->paciente->endereco ?? 'Não Informado' }} 
                                @if($pedido->paciente->cep) | <strong>CEP:</strong> {{ $pedido->paciente->cep }} @endif
                            </span>
                        </td>
                    </tr>

                    <tr>
                        <td colspan="4" style="padding: 10px 0;"><div style="border-top: 1px dashed #cbd5e1;"></div></td>
                    </tr>

                    <tr>
                        <td style="width: 25%;"><span class="label">Protocolo (OS):</span><br><span class="value">{{ $pedido->protocolo }}</span></td>
                        <td style="width: 35%;"><span class="label">Médico Solicitante:</span><br><span class="value">{{ $pedido->medico->nome ?? 'Pedido Próprio' }} @if(!empty($pedido->medico->crm) && $pedido->medico->crm != 'N/A') <span style="font-size: 9px; font-weight: normal;">(Reg: {{ $pedido->medico->crm }})</span> @endif</span></td>
                        <td style="width: 20%;"><span class="label">Data da Coleta:</span><br><span class="value">{{ \Carbon\Carbon::parse($pedido->data_pedido)->format('d/m/Y') }}</span></td>
                        <td style="width: 20%; text-align: right;"><span class="label">Data de Liberação:</span><br><span class="value text-green-700">{{ \Carbon\Carbon::parse($laudo->updated_at)->format('d/m/Y \à\s H:i') }}</span></td>
                    </tr>
                </table>
            </div>

            <div class="titulo-exame">{{ $n }}</div>
            
            <table class="tabela-resultados">
                <thead>
                    <tr>
                        <th width="40%">Exame / Parâmetro Analisado</th>
                        <th width="20%" style="text-align: right;">Resultado</th>
                        <th width="40%" style="text-align: right;">Valores de Referência</th>
                    </tr>
                </thead>
                <tbody>
                    @if(is_array($resultadoArr))
                        @foreach($resultadoArr as $key => $val)
                            @if(!in_array($key, ['metodo', 'material', 'observacao_clinica', 'antibiograma']))
                                @php
                                    $textoRef = '';
                                    if (isset($refs[$key])) {
                                        $refItem = $refs[$key];
                                        if (isset($refItem[$sexoPaciente])) {
                                            $textoRef = $refItem[$sexoPaciente]['texto'] ?? '';
                                        } else {
                                            $textoRef = $refItem['texto'] ?? '';
                                        }
                                    } else {
                                        $textoRef = $refSimplesTexto;
                                    }
                                    $labelAmigavel = str_replace('_', ' ', $key);
                                @endphp
                                <tr>
                                    <td style="text-transform: capitalize; color: #475569; font-weight: bold;">{{ $labelAmigavel }}</td>
                                    <td style="text-align: right; font-size: 13px; color: #1f547e;"><strong>{{ is_array($val) ? json_encode($val) : $val }}</strong></td>
                                    <td style="text-align: right; font-size: 10px; color: #64748b;">{{ $textoRef }}</td>
                                </tr>
                            @endif
                        @endforeach
                    @else
                        <tr><td colspan="3" style="text-align: center; padding: 20px;">Resultado registrado em formato não estruturado.</td></tr>
                    @endif
                </tbody>
            </table>

            @if((isset($resultadoArr['metodo']) && !empty($resultadoArr['metodo'])) || (isset($resultadoArr['material']) && !empty($resultadoArr['material'])))
                <div style="font-size: 9px; color: #64748b; margin-top: 8px; text-transform: uppercase;">
                    @if(isset($resultadoArr['metodo']) && !empty($resultadoArr['metodo']))
                        <strong>MÉTODO:</strong> {{ $resultadoArr['metodo'] }}
                    @endif
                    
                    @if(isset($resultadoArr['metodo']) && !empty($resultadoArr['metodo']) && isset($resultadoArr['material']) && !empty($resultadoArr['material']))
                        &nbsp; | &nbsp; 
                    @endif
                    
                    @if(isset($resultadoArr['material']) && !empty($resultadoArr['material']))
                        <strong>MATERIAL:</strong> {{ $resultadoArr['material'] }}
                    @endif
                </div>
            @endif

            @if(!empty($laudo->observacao))
                <div style="margin-top: 15px; padding: 10px; border-left: 3px solid #1f547e; background-color: #f8fafc;">
                    <strong style="color: #1f547e; font-size: 10px; text-transform: uppercase;">Nota do Laboratório / Observações Clínicas:</strong><br>
                    <span style="font-size: 11px; color: #334155;">{{ $laudo->observacao }}</span>
                </div>
            @endif

<div class="assinatura-box" style="margin-top: 40px;">
    <table style="width: 100%; border-collapse: collapse; text-align: center;">
        <tr>
            <td style="width: 50%; padding: 5px; vertical-align: bottom;">
                <div style="height: 85px; text-align: center; display: block;"> 
                    @if(!empty($configsDB['rubrica_revisor']))
                        <img src="{{ $configsDB['rubrica_revisor'] }}" 
                             style="max-width: 160px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;">
                    @endif
                </div>
                <div class="linha-assinatura" style="margin: 5px auto; width: 70%; border-top: 1px solid #1f547e;"></div>
                <strong style="color: #1f547e; font-size: 10px; text-transform: uppercase;">Revisado Clínicamente por:</strong><br>
                <span style="font-size: 10px; color: #475569; font-weight: bold;">{{ $configsDB['revisor_nome'] ?? ($laudo->validador->name ?? 'Dra. Karin D. Oliveira') }}</span><br>
                <span style="font-size: 8px; color: #64748b;">CRBM/Docente: {{ $configsDB['revisor_crbm'] ?? '69274' }}</span>
            </td>
            
            <td style="width: 50%; padding: 5px; vertical-align: bottom;">
                <div style="height: 85px; text-align: center; display: block;">
                    @if(!empty($configsDB['rubrica_liberador']))
                        <img src="{{ $configsDB['rubrica_liberador'] }}" 
                             style="max-width: 160px; max-height: 80px; width: auto; height: auto; display: block; margin: 0 auto;">
                    @endif
                </div>
                <div class="linha-assinatura" style="margin: 5px auto; width: 70%; border-top: 1px solid #1f547e;"></div>
                <strong style="color: #1f547e; font-size: 10px; text-transform: uppercase;">Liberado e Assinado por:</strong><br>
                <span style="font-size: 10px; color: #475569; font-weight: bold;">{{ $configsDB['liberador_nome'] ?? ($laudo->validador->name ?? 'Dr. Luiz Carlos Barone') }}</span><br>
                <span style="font-size: 8px; color: #64748b;">CRBM/CRF: {{ $configsDB['liberador_crbm'] ?? '2691' }}</span>
            </td>
        </tr>
    </table>
    
    <div style="text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
        <span style="font-size: 8px; color: #94a3b8; text-transform: uppercase;">
            Protocolo Digital de Validação: {{ hash('crc32', $laudo->id_laudo . ($pedido->protocolo ?? 'N/A') . $laudo->updated_at) }}<br>
            A assinatura eletrônica deste documento cumpre os requisitos de autenticidade (MP nº 2.200-2/2001).
        </span>
    </div>
</div>
            @if(!$loop->last) <div style="page-break-after: always;"></div> @endif

        @endforeach
    </main>
</body>
</html>