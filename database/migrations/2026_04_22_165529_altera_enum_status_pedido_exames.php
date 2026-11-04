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
        // Atualiza a coluna para aceitar o novo status do nosso Workflow
        DB::statement("ALTER TABLE pedido_exames MODIFY COLUMN status ENUM('Pendente', 'Aguardando Validação', 'Concluido', 'Cancelado') NOT NULL DEFAULT 'Pendente'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverte se necessário
        DB::statement("ALTER TABLE pedido_exames MODIFY COLUMN status ENUM('Pendente', 'Concluido', 'Cancelado') NOT NULL DEFAULT 'Pendente'");
    }
};