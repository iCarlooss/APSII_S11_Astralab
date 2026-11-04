<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agendamentos', function (Blueprint $table) {
            $table->id();
            
            // Relacionamento com o usuário que agendou
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->date('data');
            $table->string('horario');
            
            // Armazena a lista de exames como JSON (por causa do cast no Model)
            $table->json('exames_pretendidos');
            
            $table->string('status')->default('Agendado'); // Agendado, Confirmado, Cancelado
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agendamentos');
    }
};