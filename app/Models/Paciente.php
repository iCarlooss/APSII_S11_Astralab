<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paciente extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_paciente';

    // ADICIONE OS CAMPOS NOVOS AQUI:
    protected $fillable = [
        'user_id', 
        'data_nascimento', 
        'sexo', 
        'telefone', 
        'telefone2', 
        'cep', 
        'endereco', 
        'nome_social',       // <-- ADICIONE
        'usar_nome_social',  // <-- ADICIONE
        'peso', 
        'altura', 
        'nome_responsavel'
    ];

    public function utilizador()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}