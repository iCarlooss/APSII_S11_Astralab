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
    Schema::table('pacientes', function (Blueprint $table) {
        $table->string('nome_social')->nullable()->after('id_paciente');
        // Usaremos boolean nullable: null = ainda não escolheu (mostrar pop-up), true = usar social, false = usar civil
        $table->boolean('usar_nome_social')->nullable()->after('nome_social');
    });
}

public function down(): void
{
    Schema::table('pacientes', function (Blueprint $table) {
        $table->dropColumn(['nome_social', 'usar_nome_social']);
    });
}
};
