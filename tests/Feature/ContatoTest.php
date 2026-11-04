<?php

namespace Tests\Feature;

use App\Models\Contato;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContatoTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Banco isolado: as migrations legadas usam SQL específico do MySQL.
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'cache.default' => 'array', 'session.driver' => 'array']);
        DB::purge('sqlite');
        (require database_path('migrations/0001_01_01_000000_create_users_table.php'))->up();
        (require database_path('migrations/2026_09_09_120000_create_contatos_table.php'))->up();
        RateLimiter::clear('contato:127.0.0.1');
        $this->withoutVite();
    }

    private function dados(array $overrides = []): array
    {
        return array_replace([
            'nome' => 'Pessoa de Teste',
            'email' => 'teste@example.com',
            'telefone' => '',
            'motivo' => 'agendamento',
            'mensagem' => 'Gostaria de orientação para agendar meus exames.',
        ], $overrides);
    }

    private function usuario(string $perfil): User
    {
        return User::factory()->create(['cpf' => '12345678901', 'tipo_usuario' => $perfil, 'status' => 'Ativo']);
    }

    public function test_visitante_acessa_formulario_sem_ver_mensagens_recebidas(): void
    {
        $this->get('/contato')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Contato/Index')->where('protocolo', null)->missing('contatos'));
    }

    public function test_envio_com_email_persiste_e_exibe_protocolo_sem_confirmar_agendamento(): void
    {
        $this->post('/contato', $this->dados(['atendido_em' => now()->toDateTimeString()]))
            ->assertRedirect('/contato')->assertSessionHasNoErrors()->assertSessionHas('contato_protocolo');
        $contato = Contato::sole();
        $this->assertNull($contato->atendido_em);
        $this->assertNull($contato->telefone);
        $this->assertDatabaseHas('contatos', ['nome' => 'Pessoa de Teste', 'email' => 'teste@example.com']);
        $this->get('/contato')->assertInertia(fn (Assert $page) => $page->where('protocolo', $contato->protocolo));
    }

    public function test_envio_com_telefone_sem_email_e_aceito(): void
    {
        $this->post('/contato', $this->dados(['email' => '', 'telefone' => '(12) 99999-9999']))
            ->assertRedirect('/contato')->assertSessionHasNoErrors();
        $this->assertDatabaseHas('contatos', ['email' => null, 'telefone' => '(12) 99999-9999']);
    }

    public function test_exige_nome_contato_motivo_e_mensagem_validos(): void
    {
        $this->from('/contato')->post('/contato', $this->dados(['nome' => ' ', 'email' => '', 'telefone' => '', 'motivo' => 'invalido', 'mensagem' => 'curta']))
            ->assertRedirect('/contato')->assertSessionHasErrors(['nome', 'email', 'telefone', 'motivo', 'mensagem']);
        $this->assertDatabaseCount('contatos', 0);
    }

    public function test_rejeita_email_telefone_e_tamanho_invalidos(): void
    {
        $this->post('/contato', $this->dados(['email' => 'invalido', 'telefone' => '----------', 'mensagem' => str_repeat('a', 3001)]))
            ->assertSessionHasErrors(['email', 'telefone', 'mensagem']);
        $this->assertDatabaseCount('contatos', 0);
    }

    public function test_limita_envios_repetidos_sem_criar_registro_extra(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->from('/contato')->post('/contato', $this->dados())->assertSessionHasNoErrors();
        }
        $this->from('/contato')->post('/contato', $this->dados())->assertSessionHasErrors('envio');
        $this->assertDatabaseCount('contatos', 5);
    }

    public function test_rejeita_telefone_com_tipo_incorreto_sem_erro_interno(): void
    {
        $this->post('/contato', $this->dados(['telefone' => ['12345678901']]))
            ->assertSessionHasErrors('telefone');
        $this->assertDatabaseCount('contatos', 0);
    }

    public function test_caixa_pagina_as_mensagens_e_prioriza_nao_atendidas(): void
    {
        for ($i = 0; $i < 16; $i++) {
            Contato::create([...$this->dados(['telefone' => null]), 'protocolo' => (string) Str::uuid(), 'atendido_em' => $i === 15 ? now() : null]);
        }
        $this->actingAs($this->usuario('Administrador'))->get('/admin/contatos')
            ->assertInertia(fn (Assert $page) => $page->has('contatos.data', 15)
                ->where('contatos.total', 16)->where('contatos.last_page', 2)
                ->where('contatos.data.0.id', 15)->where('contatos.data.0.atendido_em', null));
        $this->get('/admin/contatos?page=2')->assertInertia(fn (Assert $page) => $page
            ->has('contatos.data', 1)->where('contatos.data.0.id', 16));
    }

    public function test_falha_de_persistencia_nao_informa_sucesso(): void
    {
        Schema::drop('contatos');
        $this->from('/contato')->post('/contato', $this->dados())
            ->assertRedirect('/contato')->assertSessionHasErrors('envio')->assertSessionMissing('contato_protocolo');
    }

    public function test_visitante_e_paciente_nao_acessam_caixa_de_contato(): void
    {
        $contato = Contato::create([...$this->dados(['telefone' => null]), 'protocolo' => (string) Str::uuid()]);
        $this->get('/admin/contatos')->assertRedirect('/login');
        $this->patch('/admin/contatos/'.$contato->id.'/atender')->assertRedirect('/login');
        $this->actingAs($this->usuario('Paciente'));
        $this->get('/admin/contatos')->assertForbidden();
        $this->patch('/admin/contatos/'.$contato->id.'/atender')->assertForbidden();
        $this->assertNull($contato->fresh()->atendido_em);
    }

    public function test_professor_nao_acessa_mensagens_de_contato(): void
    {
        // O perfil Professor foi adicionado por uma migration MySQL posterior.
        $professor = $this->usuario('Tecnico');
        $professor->tipo_usuario = 'Professor';
        $this->actingAs($professor)->get('/admin/contatos')->assertForbidden();
    }

    public function test_administrador_consulta_e_marca_solicitacao_como_atendida(): void
    {
        $contato = Contato::create([...$this->dados(['telefone' => null]), 'protocolo' => (string) Str::uuid()]);
        $this->actingAs($this->usuario('Administrador'));
        $this->get('/admin/contatos')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Contatos')->has('contatos.data', 1)->where('contatos.data.0.email', 'teste@example.com'));
        $this->from('/admin/contatos')->patch('/admin/contatos/'.$contato->id.'/atender')->assertRedirect('/admin/contatos');
        $horario = $contato->fresh()->atendido_em;
        $this->assertNotNull($horario);
        $this->travel(1)->minutes();
        $this->patch('/admin/contatos/'.$contato->id.'/atender');
        $this->assertTrue($contato->fresh()->atendido_em->equalTo($horario));
    }
}
