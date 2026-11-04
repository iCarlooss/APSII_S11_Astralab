<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pedido_exames', function (Blueprint $table) {
            // Verifica se a coluna não existe antes de criar (evita erros)
            if (!Schema::hasColumn('pedido_exames', 'observacao_clinica')) {
                $table->text('observacao_clinica')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pedido_exames', function (Blueprint $table) {
            if (Schema::hasColumn('pedido_exames', 'observacao_clinica')) {
                $table->dropColumn('observacao_clinica');
            }
        });
    }
};