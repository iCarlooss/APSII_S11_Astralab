<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoExameItem extends Model
{
    use HasFactory;

    // Forçamos o nome da tabela em português
    protected $table = 'pedido_exame_itens';
    protected $primaryKey = 'id_item';

    protected $fillable = [
        'id_pedido',
        'id_exame',
        'quantidade',
        'valor_unitario',
        'observacoes_item'
    ];

    public function pedido()
    {
        return $this->belongsTo(PedidoExame::class, 'id_pedido');
    }

    public function exame()
    {
        return $this->belongsTo(Exame::class, 'id_exame');
    }

    // Um item de pedido gera exatamente UM laudo
    public function laudo()
    {
        return $this->hasOne(Laudo::class, 'id_item_pedido');
    }
}