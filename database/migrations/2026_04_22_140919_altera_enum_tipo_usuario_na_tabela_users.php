<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Usamos uma query bruta (RAW) porque o Laravel tem algumas limitações nativas ao alterar colunas ENUM
        DB::statement("ALTER TABLE users MODIFY COLUMN tipo_usuario ENUM('Administrador', 'Professor', 'Tecnico', 'Aluno', 'Paciente') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Se precisar reverter, volta para como era antes (Cuidado: se houver algum 'Professor' no banco, isso dará erro na reversão)
        DB::statement("ALTER TABLE users MODIFY COLUMN tipo_usuario ENUM('Administrador', 'Tecnico', 'Aluno', 'Paciente') NOT NULL");
    }
};