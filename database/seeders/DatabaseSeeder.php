<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Paciente;
use App\Models\Medico;
use App\Models\Exame;
use App\Models\PedidoExame;
use App\Models\PedidoExameItem;
use App\Models\Laudo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ==========================================
        // 1. CRIANDO A EQUIPE (ADMINS, PROFESSOR E ALUNO)
        // ==========================================
        
        $admin1 = User::create([
            'name' => 'Admin AstraLab',
            'cpf' => '11111111111',
            'email' => 'admin@astralab.test',
            'password' => Hash::make('senha123'),
            'tipo_usuario' => 'Administrador',
            'status' => 'Ativo'
        ]);

        User::create([
            'name' => 'Administrador de Teste 2',
            'cpf' => '44444444444',
            'email' => 'admin2@astralab.test',
            'password' => Hash::make('senha123'),
            'tipo_usuario' => 'Administrador',
            'status' => 'Ativo'
        ]);

        User::create([
            'name' => 'Administrador de Teste 3',
            'cpf' => '55555555555',
            'email' => 'admin3@astralab.test',
            'password' => Hash::make('senha123'),
            'tipo_usuario' => 'Administrador',
            'status' => 'Ativo'
        ]);

        // Professor para Validação
        $professor = User::create([
            'name' => 'Professor Orientador',
            'cpf' => '22222222222',
            'email' => 'professor@astralab.test',
            'password' => Hash::make('senha123'),
            'tipo_usuario' => 'Professor', 
            'status' => 'Ativo'
        ]);

        // Aluno para Digitação
        $aluno = User::create([
            'name' => 'Aluno Estagiário',
            'cpf' => '33333333333',
            'email' => 'aluno@astralab.test',
            'password' => Hash::make('senha123'),
            'tipo_usuario' => 'Aluno',
            'status' => 'Ativo'
        ]);

        // ==========================================
        // 2. CRIANDO O PACIENTE
        // ==========================================
        $pacienteUser = User::create([
            'name' => 'João Cliente Teste',
            'cpf' => '66666666666',
            'email' => 'paciente@astralab.test',
            'password' => Hash::make('senha123'),
            'tipo_usuario' => 'Paciente',
            'status' => 'Ativo'
        ]);

        $paciente = Paciente::create([
            'user_id' => $pacienteUser->id,
            'data_nascimento' => '1990-05-15',
            'sexo' => 'M',
            'telefone' => '11999999999',
            'cep' => '11660000',
            'endereco' => 'Rua da Faculdade, 123',
            'peso' => 75.5,
            'altura' => 1.75,
        ]);

        // ==========================================
        // 3. BASE DE DADOS MÉDICA E CATÁLOGO DE EXAMES
        // ==========================================
        $medico = Medico::create([
            'nome' => 'Dr. House Diagnósticos',
            'crm' => '12345-SP',
            'especialidade' => 'Clínico Geral',
        ]);

        // Catálogo oficial com os 11 exames mais comuns
        $catalogoExames = [
            ['nome_exame' => 'Tipagem Sanguínea', 'valor' => 20.00, 'prazo_resultado' => 1],
            ['nome_exame' => 'Urina Tipo 1', 'valor' => 15.00, 'prazo_resultado' => 1],
            ['nome_exame' => 'Teste de Gravidez', 'valor' => 30.00, 'prazo_resultado' => 1],
            ['nome_exame' => 'Sangue Oculto nas Fezes', 'valor' => 20.00, 'prazo_resultado' => 2],
            ['nome_exame' => 'Perfil Lipídico', 'valor' => 35.00, 'prazo_resultado' => 2],
            ['nome_exame' => 'Parasitológico', 'valor' => 18.00, 'prazo_resultado' => 2],
            ['nome_exame' => 'Hemograma Completo', 'valor' => 25.00, 'prazo_resultado' => 1],
            ['nome_exame' => 'Exame PCR Latex Piloto', 'valor' => 28.00, 'prazo_resultado' => 1],
            ['nome_exame' => 'Cultura e Antibiograma', 'valor' => 50.00, 'prazo_resultado' => 5],
            ['nome_exame' => 'Ácido Úrico', 'valor' => 15.00, 'prazo_resultado' => 1],
            ['nome_exame' => 'Glicemia em Jejum', 'valor' => 15.00, 'prazo_resultado' => 1],
        ];

        foreach ($catalogoExames as $exame) {
            Exame::create($exame);
        }

        // ==========================================
        // 4. INJETANDO LAUDOS DE TESTE (Com JSON 100% Realista)
        // ==========================================
        $hoje = Carbon::now();

        // Puxa os exames recém-criados para gerar o teste
        $exameHemo = Exame::where('nome_exame', 'Hemograma Completo')->first();
        $exameGlic = Exame::where('nome_exame', 'Glicemia em Jejum')->first();
        $exameLipi = Exame::where('nome_exame', 'Perfil Lipídico')->first();

        // ---------------------------------------------------------
        // TESTE 1: LAUDO APROVADO (Hemograma Completo - Passou direto)
        // ---------------------------------------------------------
        $pedido1 = PedidoExame::create(['protocolo' => 'ASTRA-001', 'id_paciente' => $paciente->id_paciente, 'id_medico' => $medico->id_medico, 'id_tecnico' => $admin1->id, 'status' => 'Concluido', 'created_at' => clone $hoje->subDays(4)]);
        $item1 = PedidoExameItem::create(['id_pedido' => $pedido1->id_pedido, 'id_exame' => $exameHemo->id_exame, 'valor_unitario' => $exameHemo->valor]);
        
        $jsonHemograma = [
            'Hemácias' => '4.8',
            'Hemoglobina' => '14.2',
            'Hematócrito' => '42.5',
            'VCM' => '88.5',
            'HCM' => '29.6',
            'CHCM' => '33.4',
            'RDW' => '12.8',
            'Leucócitos Totais' => '7500',
            'Neutrófilos' => '55%',
            'Linfócitos' => '30%',
            'Eosinófilos' => '2%',
            'Monócitos' => '6%',
            'Basófilos' => '0%',
            'Plaquetas' => '250.000'
        ];

        Laudo::create([
            'id_item_pedido' => $item1->id_item, 'id_usuario_digitador' => $aluno->id, 'id_usuario_validador' => $professor->id,
            'resultado' => json_encode($jsonHemograma),
            'observacao' => 'Amostra com aspecto normal. Sem alterações morfológicas celulares.',
            'data_resultado' => clone $hoje->subDays(3), 'status' => 'Liberado', 'created_at' => clone $hoje->subDays(4), 'updated_at' => clone $hoje->subDays(3)
        ]);

        // ---------------------------------------------------------
        // TESTE 2: LAUDO DEVOLVIDO (Glicemia - Erro grave do aluno)
        // ---------------------------------------------------------
        $pedido2 = PedidoExame::create(['protocolo' => 'ASTRA-002', 'id_paciente' => $paciente->id_paciente, 'id_medico' => $medico->id_medico, 'id_tecnico' => $admin1->id, 'status' => 'Aguardando Validação', 'created_at' => clone $hoje->subDays(2)]);
        $item2 = PedidoExameItem::create(['id_pedido' => $pedido2->id_pedido, 'id_exame' => $exameGlic->id_exame, 'valor_unitario' => $exameGlic->valor]);
        
        $jsonGlicemiaComErro = [
            'Glicose em Jejum' => '999', // Erro de digitação proposital para o teste
            'Insulina Basal' => '12.5',
            'HOMA-IR' => '2.1'
        ];

        Laudo::create([
            'id_item_pedido' => $item2->id_item, 'id_usuario_digitador' => $aluno->id, 'id_usuario_validador' => $professor->id,
            'resultado' => json_encode($jsonGlicemiaComErro),
            'observacao' => 'O aluno digitou 999 em vez de 99. Devolvido para correção urgente.',
            'data_resultado' => clone $hoje->subDays(1), 'status' => 'Devolvido', 'created_at' => clone $hoje->subDays(2), 'updated_at' => clone $hoje->subDays(1)
        ]);

        // ---------------------------------------------------------
        // TESTE 3: LAUDO PENDENTE (Perfil Lipídico - Na Fila de Digitação)
        // ---------------------------------------------------------
        $pedido3 = PedidoExame::create(['protocolo' => 'ASTRA-003', 'id_paciente' => $paciente->id_paciente, 'id_medico' => $medico->id_medico, 'id_tecnico' => $admin1->id, 'status' => 'Pendente', 'created_at' => clone $hoje->subDays(5)]);
        $item3 = PedidoExameItem::create(['id_pedido' => $pedido3->id_pedido, 'id_exame' => $exameLipi->id_exame, 'valor_unitario' => $exameLipi->valor]);
        
        $jsonPerfilLipidicoVazio = [
            'Colesterol Total' => '',
            'Colesterol HDL' => '',
            'Colesterol LDL' => '',
            'Colesterol VLDL' => '',
            'Triglicerídeos' => '',
            'Risco Cardíaco' => ''
        ];

        Laudo::create([
            'id_item_pedido' => $item3->id_item, 
            'resultado' => json_encode($jsonPerfilLipidicoVazio),
            'observacao' => null,
            'data_resultado' => clone $hoje->subDays(5), 'status' => 'Pendente', 'created_at' => clone $hoje->subDays(5), 'updated_at' => clone $hoje->subDays(5)
        ]);
    }
}
