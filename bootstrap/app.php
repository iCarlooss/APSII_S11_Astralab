<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Configuração do Web Middleware (Inertia)
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // 1. Confiança nos Proxies (Essencial para HTTPS no aaPanel)
        $middleware->trustProxies(at: '*');

        // O login usa a proteção CSRF padrão, inclusive ao trocar de conta.
        $middleware->validateCsrfTokens(except: [
            'logout',
            'register',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
