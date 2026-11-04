<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Agendamento extends Model
{
    use HasFactory;

    /**
     * Campos que podem ser preenchidos em massa.
     */
    protected $fillable = [
        'user_id',
        'data',
        'horario',
        'exames_pretendidos',
        'status',
    ];

    /**
     * Conversão de tipos (Casting).
     * Essencial para que o array de exames do React seja salvo corretamente.
     */
    protected $casts = [
        'data' => 'date',
        'exames_pretendidos' => 'array', // Transforma o JSON do banco em Array PHP automaticamente
    ];

    /**
     * Relacionamento: Um agendamento pertence a um Usuário.
     * ATENÇÃO: O nome da função deve ser 'user' para alinhar com o Controller.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}