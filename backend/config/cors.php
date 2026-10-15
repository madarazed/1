<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
    | Orígenes explícitos. FRONTEND_URL / CORS_EXTRA_ORIGINS (separados por coma)
    | permiten agregar dominios desde Render sin tocar código.
    */
    'allowed_origins' => array_values(array_unique(array_filter(array_merge([
        // Producción (Vercel + dominio propio)
        'https://rapifrios.online',
        'https://www.rapifrios.online',
        'https://1-sable-tau.vercel.app',
        'https://rapifrios-nexus.vercel.app',

        // Desarrollo local
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',

        env('FRONTEND_URL'),
    ], array_map('trim', explode(',', (string) env('CORS_EXTRA_ORIGINS', ''))))))),

    /*
    | Cualquier subdominio HTTPS de rapifrios.online y cualquier preview de Vercel.
    */
    'allowed_origins_patterns' => [
        '#^https://([a-z0-9-]+\.)*rapifrios\.online$#i',
        '#^https://[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$#i',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Content-Disposition'],

    // Cachea el preflight (OPTIONS) 24h para reducir latencia en Render.
    'max_age' => 86400,

    // Con orígenes explícitos (nunca '*') es seguro habilitar credenciales.
    'supports_credentials' => true,

];
