<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class UsuariosTesteSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('As contas de teste só podem ser configuradas no ambiente local ou de testes.');
        }

        $contas = [
            ['cpf' => '11111111111', 'name' => 'Administrador Teste AstraLab', 'email' => 'admin@astralab.com', 'tipo_usuario' => 'Administrador'],
            ['cpf' => '22222222222', 'name' => 'Professor Teste AstraLab', 'email' => 'professor@astralab.com', 'tipo_usuario' => 'Professor'],
            ['cpf' => '33333333333', 'name' => 'Aluno Teste AstraLab', 'email' => 'aluno@astralab.com', 'tipo_usuario' => 'Aluno'],
        ];

        DB::transaction(function () use ($contas) {
            foreach ($contas as $conta) {
                $user = User::firstOrNew(['cpf' => $conta['cpf']]);

                if (! $user->exists) {
                    if (User::where('email', $conta['email'])->exists()) {
                        throw new RuntimeException('O e-mail de uma conta de teste já está associado a outro CPF. Nenhuma conta foi alterada.');
                    }
                    $user->name = $conta['name'];
                    $user->email = $conta['email'];
                }

                $user->forceFill([
                    'tipo_usuario' => $conta['tipo_usuario'],
                    'status' => 'Ativo',
                    'password' => Hash::make('senha123'),
                    'email_verified_at' => now(),
                ])->save();
            }
        });

        $this->command?->info('Contas de Administrador, Professor e Aluno configuradas.');
    }
}
