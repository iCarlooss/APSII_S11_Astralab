<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Permite que o laudo seja salvo sem um médico responsável na hora da digitação
        DB::statement('ALTER TABLE laudos MODIFY COLUMN id_medico_responsavel BIGINT UNSIGNED NULL');
        
        // Aproveitamos para garantir que o digitador também possa ser nulo, por segurança
        DB::statement('ALTER TABLE laudos MODIFY COLUMN id_usuario_digitador BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        // Reversão caso precise
    }
};