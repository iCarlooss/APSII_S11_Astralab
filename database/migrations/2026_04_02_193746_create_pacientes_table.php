<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id('id_paciente');
            
            // Ligação com a tabela users
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->date('data_nascimento');
            $table->enum('sexo', ['M', 'F', 'Outro']);
            $table->string('telefone', 20)->nullable();
            $table->string('telefone2', 20)->nullable(); // Telefone de recado
            
            // Endereço e Rastreabilidade
            $table->string('cep', 10)->nullable();
            $table->string('endereco', 255)->nullable();
            
            // Dados Antropométricos (Importantes para cálculos de exames)
            $table->decimal('peso', 5, 2)->nullable(); // Ex: 120.50
            $table->decimal('altura', 3, 2)->nullable(); // Ex: 1.75
            
            // Segurança Jurídica (Menores de idade)
            $table->string('nome_responsavel', 255)->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};