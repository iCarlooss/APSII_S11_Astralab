<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedido_exame_itens', function (Blueprint $table) {
            $table->id('id_item');
            
            $table->foreignId('id_pedido')->constrained('pedido_exames', 'id_pedido')->onDelete('cascade');
            $table->foreignId('id_exame')->constrained('exames', 'id_exame')->onDelete('restrict');
            
            $table->integer('quantidade')->default(1);
            $table->decimal('valor_unitario', 10, 2);
            $table->text('observacoes_item')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedido_exame_itens');
    }
};