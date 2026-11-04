# 🔬 AstraLab - Laboratory Information System (LIS)

O **AstraLab** é um sistema de gestão laboratorial de ponta a ponta, desenvolvido para integrar a jornada do paciente — desde o agendamento online até a liberação do laudo técnico assinado. O projeto foi construído seguindo diretrizes de biossegurança, rastreabilidade e normas da **ANVISA (RDC 786/2023)**.

---

## 🌟 Diferenciais Técnicos (Foco Acadêmico/Saúde)

Para garantir a segurança diagnóstica, o sistema implementa:
- **Rastreabilidade Total:** Controle de data/hora de coleta e identificação de técnicos e validadores.
- **Gestão Pré-Analítica:** Coleta de dados vitais (Peso, Altura, DUM e Jejum) para cálculos automáticos de TFG (Taxa de Filtração Glomerular) e interpretação hormonal.
- **Validação Docente:** Fluxo de trabalho acadêmico onde laudos digitados por alunos exigem revisão e assinatura digital de um professor responsável.
- **Segurança Jurídica:** Registro de responsáveis para menores de idade e termos de consentimento.

---

## 🚀 Stack Tecnológica
- **Core:** Laravel 12 (PHP 8.2+)
- **Frontend:** React + TypeScript (Modern UI/UX)
- **Comunicação:** Inertia.js (Single Page Application sem refresh de página)
- **Estilização:** Tailwind CSS (Design System Minimalista)
- **Banco de Dados:** MySQL (Produção)
- **Infraestrutura:** Git, Vite e Mailtrap (Testes de E-mail)

---

## 📋 Funcionalidades Implementadas

### 👤 Portal do Paciente
- [x] Agendamento Online com Guia de Preparo automática.
- [x] Histórico de Exames com **Análise de Delta** (comparação gráfica de resultados anteriores).
- [x] Download de Laudos Oficiais em PDF.

### 🏥 Gestão Administrativa & Recepção
- [x] Triagem completa e geração de Protocolo de Atendimento.
- [x] Gestão de agendas e confirmação de exames via e-mail.
- [x] Cadastro de tabelas de exames e valores de referência.

### 🧪 Bancada Técnica (Técnico/Aluno)
- [x] Fila de trabalho em tempo real.
- [x] Digitação de resultados com campo de observações pré-analíticas.
- [x] Alerta automático de valores críticos.

### 🛡️ Supervisão (Professor)
- [x] Painel de validação e revisão de laudos.
- [x] Assinatura e liberação automática de resultados para o paciente.

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- PHP 8.2+ e Composer
- Node.js & NPM
- XAMPP/WAMP ou Docker

### Instalação
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/iCarlooss/AstraLab-APSII.git
   cd AstraLab
   ```

2. **Instale as dependências:**
   ```bash
   composer install
   npm ci
   ```

3. **Configure o ambiente:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   No Windows PowerShell, use `Copy-Item .env.example .env`. Depois configure a conexão MySQL no `.env` e crie o banco vazio.

4. **Prepare o banco e a interface:**
   ```bash
   php artisan migrate
   npm run build
   ```

5. **Execute o sistema:**
   ```bash
   php artisan serve
   ```

   Acesse `http://127.0.0.1:8000`.

## 📚 Entrega APSII - Semana 06

- [Changelog em Markdown](atividade%20semana%2006/README.md)
- [Changelog em PDF](output/pdf/APSII_S11_AstraLab_Changelog.pdf)

Nesta iteração foram refinados o login, o acesso ao contato pela Home e as orientações do formulário. A compilação TypeScript/Vite foi concluída sem erros e os 24 testes relacionados a login e contato foram aprovados.
