<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contato extends Model
{
    protected $fillable = ['protocolo', 'nome', 'email', 'telefone', 'motivo', 'mensagem', 'atendido_em'];

    protected function casts(): array
    {
        return ['atendido_em' => 'datetime'];
    }
}
