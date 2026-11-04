<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoExame extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_pedido';

    protected $fillable = [
        'protocolo',
        'id_paciente',
        'id_medico',
        'id_tecnico',
        'data_pedido',
        'status',
        'observacao_clinica' // <-- NOME CORRIGIDO AQUI
    ];

    public function paciente()
    {
        return $this->belongsTo(Paciente::class, 'id_paciente');
    }

    public function medico()
    {
        return $this->belongsTo(Medico::class, 'id_medico');
    }

    public function tecnico()
    {
        return $this->belongsTo(User::class, 'id_tecnico');
    }

    public function itens()
    {
        return $this->hasMany(PedidoExameItem::class, 'id_pedido');
    }
}