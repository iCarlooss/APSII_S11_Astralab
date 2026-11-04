<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contatos', function (Blueprint $table) {
            $table->id();
            $table->uuid('protocolo')->unique();
            $table->string('nome', 120);
            $table->string('email', 254)->nullable();
            $table->string('telefone', 25)->nullable();
            $table->string('motivo', 30);
            $table->text('mensagem');
            $table->timestamp('atendido_em')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contatos');
    }
};
