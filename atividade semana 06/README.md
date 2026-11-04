# APSII_S06_AstraLab — Changelog de melhorias

**Grupo 01 — AstraLab**  
**Semana 06 — Melhoria contínua da experiência do usuário**  
**Data da revisão:** 04/11/2026

## Identificação do grupo

- Carlos Daniel Felix
- Eduardo Ferreira Cabral
- Felipe Bueno Rozani
- Júlia Santos Souza
- Karine dos Santos Amorim
- Kauã Felix de Amorim
- Pedro Nascimento Puertas

## Objetivo da iteração

Esta iteração teve como foco o refino da experiência nas etapas de entrada e primeiro contato com o AstraLab. Durante um teste de navegação feito pelo grupo, percebemos que alguns textos da tela de login estavam direcionados somente ao paciente, embora o mesmo acesso também seja usado por administradores, professores e alunos. Também observamos que o contato estava disponível no menu, mas pouco destacado na área principal da Home, e que o formulário poderia orientar melhor o preenchimento. Esses pontos foram registrados no backlog e priorizados por terem impacto direto na clareza, no número de cliques e na prevenção de erros.

## Changelog — Antes → Depois

| Melhoria | Antes | Depois | Motivação e impacto esperado |
|---|---|---|---|
| Login mais claro e acessível | O CPF era digitado sem formatação, não havia opção para visualizar a senha e os textos mencionavam somente “Portal do Paciente” e “Senha/Protocolo”. | O CPF recebe máscara automática, o campo possui o comando “Mostrar/Ocultar senha” e os textos passaram a usar “Entrar no sistema” e “acessar com o seu perfil”. | Percepção do grupo: pessoas de diferentes perfis poderiam interpretar que aquela tela era exclusiva para pacientes. O refino reduz dúvidas e ajuda a identificar erros de digitação antes do envio. |
| Contato direto pela Home | A área principal da Home exibia apenas o botão de acesso ao portal. Para falar com a equipe, o usuário precisava localizar “Contato” no menu. | Foi adicionado o botão secundário “Falar com a equipe” ao lado de “Consultar resultados”, levando diretamente ao formulário. | Teste de navegação do grupo: o primeiro contato é uma ação importante do funil e precisava estar visível sem depender da exploração do menu. A mudança reduz cliques e deixa os dois caminhos principais evidentes. |
| Formulário com orientação durante o preenchimento | O formulário explicava os limites somente por texto fixo, sem informar visualmente se um canal de retorno já havia sido preenchido e sem adaptar a orientação ao motivo escolhido. | O formulário mostra “Contato informado” ou “Informe uma opção”, apresenta exemplo de mensagem conforme o motivo, exibe contador de caracteres e usa o rótulo mais preciso “Enviar solicitação”. | Percepção do grupo: o usuário precisava interpretar sozinho se e-mail e telefone eram ambos obrigatórios. O retorno visual previne erros, melhora a clareza e torna a mensagem de ação coerente com diferentes motivos de contato. |

## Relação com melhoria contínua

O trabalho representa uma nova iteração sobre telas que já estavam funcionais. Em vez de reconstruir o sistema, o grupo analisou a jornada existente, identificou dificuldades, registrou os pontos no backlog e aplicou um refino de interface e conteúdo. A prioridade foi dada a mudanças pequenas com impacto visível no fluxo: nomenclaturas coerentes, menos cliques, prevenção de erro e melhor resposta visual. Como próximos itens do backlog, o grupo poderá validar essas alterações com usuários externos e revisar outras telas internas para manter o mesmo padrão de mensagens e acessibilidade.

## Arquivos alterados

- `resources/js/Pages/Auth/Login.tsx`
- `resources/js/Pages/LandingPage.tsx`
- `resources/js/Pages/Contato/Index.tsx`

## Validação

A versão foi conferida pela compilação do TypeScript e do Vite, concluída sem erros. Também foram executados os testes automatizados relacionados aos perfis de login e à página de contato: **24 testes aprovados e 255 asserções verificadas**.

## Roteiro para o screenshot comparativo

Como o screenshot é opcional, ele não interfere no funcionamento da entrega. Para incluí-lo no documento da disciplina, use uma imagem da entrega anterior e uma imagem desta versão no mesmo tamanho:

1. **Home:** destaque que antes havia somente a ação de acesso ao portal e que agora existem “Consultar resultados” e “Falar com a equipe”.
2. **Login:** destaque a máscara do CPF, o comando “Mostrar senha” e o novo texto “Entrar no sistema”.
3. Identifique as imagens como “Antes — versão anterior” e “Depois — Semana 06”.
