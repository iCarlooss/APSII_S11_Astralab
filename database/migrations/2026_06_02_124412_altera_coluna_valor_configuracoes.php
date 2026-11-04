<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('configuracoes', function (Blueprint $table) {
            // Altera a coluna 'valor' para LONGTEXT para suportar as imagens em Base64
            $table->longText('valor')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('configuracoes', function (Blueprint $table) {
            // Reverte para string normal caso você precise desfazer a migration no futuro
            $table->string('valor', 255)->nullable()->change();
        });
    }
};