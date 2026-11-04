<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determina se o utilizador está autorizado a fazer este pedido.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * As regras de validação que se aplicam ao pedido.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'cpf' => ['required', 'string'], // Validamos o CPF
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Tenta autenticar as credenciais do pedido.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Tenta fazer o login no banco de dados procurando pelo CPF
        if (! Auth::attempt($this->only('cpf', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                // Mensagem de erro de login traduzida e amigável:
                'cpf' => 'Atenção: O CPF ou a Senha informados estão incorretos.', 
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    protected function prepareForValidation()
    {
        // Se o seu campo de login no formulário se chamar 'cpf'
        if ($this->has('cpf')) {
            $this->merge([
                'cpf' => preg_replace('/[^0-9]/', '', $this->cpf),
            ]);
        }

        // CASO você tenha mantido o nome original do Laravel ('email') para o campo de CPF no React:
        if ($this->has('email')) {
            // Remove tudo que não for número
            $apenasNumeros = preg_replace('/[^0-9]/', '', $this->email);
            
            // Se o que sobrou for exatamente um CPF (11 números), ele substitui o valor
            if (strlen($apenasNumeros) === 11) {
                $this->merge([
                    'email' => $apenasNumeros,
                ]);
            }
        }
    }

    /**
     * Garante que o pedido de login não excedeu o limite de tentativas.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());
        $minutos = ceil($seconds / 60);

        throw ValidationException::withMessages([
            // Mensagem de bloqueio por muitas tentativas (throttle) traduzida:
            'cpf' => "Muitas tentativas de login. Por favor, tente novamente em {$minutos} minuto(s).",
        ]);
    }

    /**
     * Obtém a chave de limite de taxa (throttle) para o pedido.
     */
    public function throttleKey(): string
    {
        // Usa o CPF e o IP para bloquear spam de tentativas de login
        return Str::transliterate(Str::lower($this->input('cpf')).'|'.$this->ip());
    }
}