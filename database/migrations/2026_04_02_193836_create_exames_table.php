<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exames', function (Blueprint $table) {
            $table->id('id_exame');
            $table->string('nome_exame');
            $table->decimal('valor', 10, 2)->default(0.00);
            $table->integer('prazo_resultado')->default(5); // Dias úteis
            $table->text('descricao')->nullable();
            
            // Requisito: Instruções específicas de preparo (Jejum, etc)
            $table->text('instrucoes_preparo')->nullable(); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exames');
    }
};