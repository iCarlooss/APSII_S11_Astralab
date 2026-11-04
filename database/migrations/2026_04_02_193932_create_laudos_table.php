<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laudos', function (Blueprint $table) {
            $table->id('id_laudo');
            
            $table->foreignId('id_item_pedido')->constrained('pedido_exame_itens', 'id_item')->onDelete('cascade');
            $table->foreignId('id_medico_responsavel')->constrained('medicos', 'id_medico')->onDelete('restrict');
            $table->foreignId('id_usuario_digitador')->constrained('users', 'id')->onDelete('restrict');
            
            $table->json('resultado');
            
            // CORRIGIDO: Singular para bater com o Controller e Model
            $table->text('observacao')->nullable(); 
            
            $table->date('data_resultado');
            
            // CORRIGIDO: Adicionado 'Em Validação' para o fluxo Aluno -> Professor
            $table->enum('status', ['Em Validação', 'Liberado', 'Retificado'])->default('Em Validação');
            
            $table->string('caminho_pdf', 255)->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laudos');
    }
};