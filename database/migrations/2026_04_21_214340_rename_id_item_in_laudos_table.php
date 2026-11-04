<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laudos', function (Blueprint $table) {
            // 1. Renomeia id_item_pedido para id_item (se ainda não foi renomeado)
            if (Schema::hasColumn('laudos', 'id_item_pedido')) {
                $table->renameColumn('id_item_pedido', 'id_item');
            }

            // 2. Garante que id_usuario_tecnico existe (o campo que salva quem fez o laudo)
            if (!Schema::hasColumn('laudos', 'id_usuario_tecnico')) {
                $table->foreignId('id_usuario_tecnico')->after('id_item')->nullable()->constrained('users');
            }
        });
    }

    public function down(): void
    {
        Schema::table('laudos', function (Blueprint $table) {
            $table->renameColumn('id_item', 'id_item_pedido');
        });
    }
};