<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\UsuariosTesteSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PerfisLoginTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:', 'session.driver' => 'array', 'cache.default' => 'array']);
        DB::purge('sqlite');
        (require database_path('migrations/0001_01_01_000000_create_users_table.php'))->up();
        // Equivalente portátil aos perfis acrescentados pela migration MySQL.
        Schema::table('users', function (Blueprint $table) {
            $table->string('tipo_usuario')->default('Paciente')->change();
        });
        $this->withoutVite();
        $this->seed(UsuariosTesteSeeder::class);
    }

    public function test_administrador_vai_para_o_painel_administrativo(): void
    {
        $this->verificarLogin('11111111111', 'Administrador', 'admin.dashboard');
    }

    public function test_professor_vai_para_o_painel_do_professor(): void
    {
        $this->verificarLogin('22222222222', 'Professor', 'professor.dashboard');
    }

    public function test_aluno_vai_para_a_bancada_do_aluno(): void
    {
        $this->verificarLogin('33333333333', 'Aluno', 'tecnico.dashboard');
    }

    private function verificarLogin(string $cpf, string $perfil, string $rota): void
    {
        $this->post('/login', ['cpf' => $cpf, 'password' => 'senha123'])
            ->assertSessionHasNoErrors()->assertRedirect('/dashboard');
        $user = User::where('cpf', $cpf)->sole();
        $this->assertAuthenticatedAs($user);
        $this->assertSame($perfil, $user->tipo_usuario);
        $this->get('/dashboard')->assertRedirect(route($rota));
    }

    public function test_perfil_prevalece_sobre_email_da_conta(): void
    {
        $professor = User::where('cpf', '22222222222')->sole();
        $professor->update(['tipo_usuario' => 'Aluno']);
        $this->actingAs($professor)->get('/dashboard')->assertRedirect(route('tecnico.dashboard'));
    }

    public function test_senha_incorreta_nao_autentica(): void
    {
        $this->post('/login', ['cpf' => '22222222222', 'password' => 'senha-incorreta'])
            ->assertSessionHasErrors('cpf');
        $this->assertGuest();
    }

    public function test_professor_pode_entrar_com_cpf_do_admin_na_mesma_sessao(): void
    {
        $this->verificarLogin('22222222222', 'Professor', 'professor.dashboard');
        $this->verificarLogin('11111111111', 'Administrador', 'admin.dashboard');
    }

    public function test_troca_entre_os_tres_perfis_na_mesma_sessao(): void
    {
        $this->verificarLogin('11111111111', 'Administrador', 'admin.dashboard');
        $this->verificarLogin('22222222222', 'Professor', 'professor.dashboard');
        $this->verificarLogin('33333333333', 'Aluno', 'tecnico.dashboard');
        $this->verificarLogin('11111111111', 'Administrador', 'admin.dashboard');
    }

    public function test_login_abre_com_a_identificacao_da_conta_atual(): void
    {
        $professor = User::where('cpf', '22222222222')->sole();
        $this->actingAs($professor)->get('/login')->assertOk()
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('Auth/Login')->where('auth.user.id', $professor->id)
                ->where('auth.user.tipo_usuario', 'Professor'));
    }

    public function test_troca_com_senha_incorreta_nao_mantem_a_conta_anterior(): void
    {
        $this->verificarLogin('22222222222', 'Professor', 'professor.dashboard');
        $this->post('/login', ['cpf' => '11111111111', 'password' => 'senha-incorreta'])
            ->assertSessionHasErrors('cpf');
        $this->assertGuest();
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_troca_remove_dados_e_cookie_da_sessao_anterior(): void
    {
        $login = $this->post('/login', ['cpf' => '22222222222', 'password' => 'senha123', 'remember' => true]);
        $cookieName = auth()->guard()->getRecallerName();
        $this->withCookie($cookieName, $login->getCookie($cookieName)->getValue());
        $this->withSession(['dado_da_conta_anterior' => 'remover']);
        $sessaoAnterior = session()->getId();
        $this->post('/login', ['cpf' => '11111111111', 'password' => 'senha123'])
            ->assertSessionMissing('dado_da_conta_anterior')
            ->assertCookieExpired(auth()->guard()->getRecallerName());
        $this->assertNotSame($sessaoAnterior, session()->getId());
        $this->assertAuthenticatedAs(User::where('cpf', '11111111111')->sole());
    }

    public function test_login_exige_token_csrf_e_aceita_token_valido(): void
    {
        $this->app->bind(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class, function ($app) {
            return new class($app, $app['encrypter']) extends \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken {
                protected function runningUnitTests()
                {
                    return false;
                }
            };
        });
        $this->post('/login', ['cpf' => '11111111111', 'password' => 'senha123'])->assertStatus(419);
        $this->assertGuest();
        $token = 'token-csrf-de-teste';
        $this->withSession(['_token' => $token])->post('/login', [
            'cpf' => '11111111111', 'password' => 'senha123', '_token' => $token,
        ])->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs(User::where('cpf', '11111111111')->sole());
    }

    public function test_reexecutar_seeder_atualiza_apenas_as_tres_contas(): void
    {
        $outro = User::factory()->create(['cpf' => '44444444444', 'tipo_usuario' => 'Paciente']);
        $antes = $outro->fresh()->getAttributes();
        $ids = User::whereIn('cpf', ['11111111111', '22222222222', '33333333333'])->pluck('id')->all();
        User::where('cpf', '33333333333')->update(['tipo_usuario' => 'Administrador']);
        $this->seed(UsuariosTesteSeeder::class);
        $this->assertDatabaseCount('users', 4);
        $this->assertSame($antes, $outro->fresh()->getAttributes());
        $this->assertSame($ids, User::whereIn('cpf', ['11111111111', '22222222222', '33333333333'])->pluck('id')->all());
        $this->assertSame('Aluno', User::where('cpf', '33333333333')->sole()->tipo_usuario);
        foreach (User::whereIn('id', $ids)->get() as $user) {
            $this->assertTrue(Hash::check('senha123', $user->password));
        }
    }
}
