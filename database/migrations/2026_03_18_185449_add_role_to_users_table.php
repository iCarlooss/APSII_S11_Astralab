<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // O que acontece quando rodamos a migração (Cria a coluna)
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Cria a coluna 'role', com valor padrão 'paciente'
            // CORREÇÃO: Removemos o ->after('email') para evitar o erro de coluna não encontrada.
            // O Laravel vai apenas adicionar a coluna no final da tabela.
            $table->string('role')->default('paciente');
        });
    }

    // O que acontece se precisarmos desfazer (Deleta a coluna)
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};