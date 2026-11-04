<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Os atributos que podem ser preenchidos em massa.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'cpf',           // Login via CPF
        'password',      // Senha (Hash do Protocolo para pacientes)
        'tipo_usuario',  // Administrador, Tecnico, Paciente
        'status',  
        'email'      // Ativo, Inativo
    ];

    /**
     * Os atributos que devem ser escondidos em arrays (segurança).
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Os atributos que devem ser convertidos (Casting).
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * RELACIONAMENTOS DO SISTEMA ASTRALAB
     */

    /**
     * Se o usuário for um 'Paciente', este método retorna os seus dados médicos.
     */
    public function paciente()
    {
        return $this->hasOne(Paciente::class, 'user_id');
    }

    /**
     * Se o usuário for um 'Tecnico', retorna as Ordens de Serviço (Pedidos) que ele criou.
     */
    public function pedidosGerados()
    {
        return $this->hasMany(PedidoExame::class, 'id_tecnico');
    }

    /**
     * Se o usuário for um 'Tecnico' ou 'Admin', retorna os laudos que ele digitou no sistema.
     */
    public function laudosDigitados()
    {
        return $this->hasMany(Laudo::class, 'id_usuario_digitador');
    }

    /**
     * MÉTODOS AUXILIARES DE PERFIL
     */

    public function isAdmin()
    {
        return $this->tipo_usuario === 'Administrador';
    }

    public function isTecnico()
    {
        return $this->tipo_usuario === 'Tecnico';
    }

    public function isPaciente()
    {
        return $this->tipo_usuario === 'Paciente';
    }
}