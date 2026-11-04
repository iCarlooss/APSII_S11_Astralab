<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Laudo extends Model
{
    use HasFactory;

    protected $table = 'laudos';
    protected $primaryKey = 'id_laudo';

    protected $fillable = [
        'id_item_pedido',
        'id_usuario_tecnico',
        'id_usuario_digitador',  
        'id_usuario_validador',  // <-- ADICIONADO: Essencial para a assinatura digital!
        'id_medico_responsavel', 
        'resultado',
        'observacao',
        'data_resultado',
        'status',
        'caminho_pdf'
    ];

    protected $casts = [
        'resultado' => 'array',
        'data_resultado' => 'datetime',
    ];

    public function itemPedido()
    {
        return $this->belongsTo(PedidoExameItem::class, 'id_item_pedido', 'id_item');
    }

    public function digitador()
    {
        return $this->belongsTo(User::class, 'id_usuario_digitador');
    }

    // <-- ADICIONADO: A relação que permite ao PDF e à tela puxar o nome de quem assinou!
    public function validador()
    {
        return $this->belongsTo(User::class, 'id_usuario_validador');
    }
}