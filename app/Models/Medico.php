<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Medico extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_medico';

    protected $fillable = [
        'nome',
        'crm', // O número do registro (ex: 12345-SP)
        'conselho_tipo', // NOVO: Tipo do conselho (CRM, CRO, COREN, CRBM)
        'especialidade',
        'telefone',
        'email',
        'hospital_vinculado'
    ];

    public function pedidos()
    {
        return $this->hasMany(PedidoExame::class, 'id_medico');
    }
}