<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. Adicionamos a coluna do Validador na tabela de Laudos
        Schema::table('laudos', function (Blueprint $table) {
            if (!Schema::hasColumn('laudos', 'id_usuario_validador')) {
                $table->unsignedBigInteger('id_usuario_validador')->nullable()->after('id_usuario_digitador');
            }
        });

        // 2. Transformamos a coluna 'status' de ENUM para STRING (VARCHAR).
        // Isto impede que o banco de dados rejeite os nossos novos status como "Aguardando_Supervisor".
        // Usamos DB::statement porque o Laravel tem limitações nativas ao alterar colunas ENUM.
        
        try {
            DB::statement("ALTER TABLE laudos MODIFY COLUMN status VARCHAR(255) DEFAULT 'Pendente'");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE pedido_exames MODIFY COLUMN status VARCHAR(255) DEFAULT 'Pendente'");
        } catch (\Exception $e) {}
    }

    public function down()
    {
        Schema::table('laudos', function (Blueprint $table) {
            if (Schema::hasColumn('laudos', 'id_usuario_validador')) {
                $table->dropColumn('id_usuario_validador');
            }
        });
    }
};