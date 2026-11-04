<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Executa as correções para estabilizar a tabela de laudos.
     */
    public function up(): void
    {
        Schema::table('laudos', function (Blueprint $table) {
            // 1. Se a coluna estiver com o nome "id_item", volta para o original "id_item_pedido"
            if (Schema::hasColumn('laudos', 'id_item')) {
                $table->renameColumn('id_item', 'id_item_pedido');
            }

            // 2. Garante que a coluna de técnico responsável existe
            if (!Schema::hasColumn('laudos', 'id_usuario_tecnico')) {
                $table->foreignId('id_usuario_tecnico')->after('id_item_pedido')->nullable()->constrained('users');
            }

            // 3. Garante que a coluna de observação existe (singular para bater com o React)
            if (!Schema::hasColumn('laudos', 'observacao')) {
                $table->text('observacao')->after('resultado')->nullable();
            }
        });

        // 4. Correção de tipos de dados via SQL puro (mais seguro contra erros de ENUM/Truncate)
        // Isso resolve o erro "Data truncated for column status"
        DB::statement('ALTER TABLE laudos MODIFY COLUMN status VARCHAR(50) DEFAULT "Pendente"');
        
        // Isso garante que o banco aceite o formato "2026-04-21 21:25:54" (com hora)
        DB::statement('ALTER TABLE laudos MODIFY COLUMN data_resultado DATETIME');
    }

    /**
     * Reverte as alterações (caso necessário).
     */
    public function down(): void
    {
        Schema::table('laudos', function (Blueprint $table) {
            // Caminho reverso se precisar dar rollback
            if (Schema::hasColumn('laudos', 'id_item_pedido')) {
                $table->renameColumn('id_item_pedido', 'id_item');
            }
        });
    }
};