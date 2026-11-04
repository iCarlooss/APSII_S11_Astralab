<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exame extends Model
{
    use HasFactory;

    protected $table = 'exames'; 
    protected $primaryKey = 'id_exame';

    /**
     * ATUALIZADO: Incluindo os campos de descrição, preparo 
     * e os novos campos de Valores de Referência (Tarja Vermelha)
     * para permitir que o AdminController salve esses dados em massa.
     */
    protected $fillable = [
        'nome_exame',
        'prazo_resultado',
        'valor',
        'descricao',           
        'instrucoes_preparo',  
        // NOVOS CAMPOS DE REFERÊNCIA AUTORIZADOS
        'ref_min',
        'ref_max',
        'ref_texto',
        'metodo',   // <-- GARANTINDO O MÉTODO AQUI
        'material', // <-- O NOVO CAMPO DE MATERIAL AQUI
    ];

    /**
     * Relacionamento com os itens de pedido.
     */
    public function itensPedido()
    {
        return $this->hasMany(PedidoExameItem::class, 'id_exame', 'id_exame');
    }
}