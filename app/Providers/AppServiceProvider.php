<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Tenta carregar as configurações do banco para substituir o .env globalmente
        try {
            if (Schema::hasTable('configuracoes')) {
                $configs = \App\Models\Configuracao::pluck('valor', 'chave')->toArray();

                // Se o servidor SMTP foi preenchido no painel, injeta no motor de e-mail de forma agressiva
                if (!empty($configs['mail_host'])) {
                    
                    // 1. Sobrescreve todo o array de configuração do Laravel em tempo de execução
                    config([
                        'mail.default' => 'smtp',
                        'mail.mailers.smtp.transport' => 'smtp',
                        'mail.mailers.smtp.host' => $configs['mail_host'],
                        'mail.mailers.smtp.port' => $configs['mail_port'] ?? 587,
                        'mail.mailers.smtp.encryption' => $configs['mail_encryption'] ?? 'tls',
                        'mail.mailers.smtp.username' => $configs['mail_username'] ?? '',
                        'mail.mailers.smtp.password' => $configs['mail_password'] ?? '',
                        'mail.from.address' => !empty($configs['mail_from_address']) ? $configs['mail_from_address'] : ($configs['mail_username'] ?? ''),
                        'mail.from.name' => !empty($configs['mail_from_name']) ? $configs['mail_from_name'] : 'AstraLab',
                    ]);

                    // 2. FORÇA o Laravel a esquecer o "carteiro" antigo e recriar a conexão com os dados novos do banco!
                    app()->forgetInstance('mailer');
                    app()->forgetInstance('mail.manager');
                }
            }
        } catch (\Exception $e) {
            // Ignora erros silenciosamente caso o banco de dados ainda não esteja montado (artisan migrate)
        }
    }
}