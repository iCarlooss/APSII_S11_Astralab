<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedido_exames', function (Blueprint $table) {
            $table->id('id_pedido');
            $table->string('protocolo', 20)->unique();
            
            // Chaves Estrangeiras
            $table->foreignId('id_paciente')->constrained('pacientes', 'id_paciente')->onDelete('restrict');
            $table->foreignId('id_medico')->constrained('medicos', 'id_medico')->onDelete('restrict');
            $table->foreignId('id_tecnico')->constrained('users', 'id')->onDelete('restrict');
            
            $table->dateTime('data_pedido')->useCurrent();
            $table->enum('status', ['Pendente', 'Em Análise', 'Concluído'])->default('Pendente');
            $table->text('observacoes')->nullable();
            
            $table->index('data_pedido');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedido_exames');
    }
};