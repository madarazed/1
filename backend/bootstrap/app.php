<?php

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // HandleCors ya es global en Laravel 12; prepend() lo mueve a la capa
        // MÁS EXTERNA (array_unique evita duplicarlo). Así envuelve cualquier
        // excepción convertida en respuesta (500/503) e inyecta los headers CORS.
        $middleware->prepend(HandleCors::class);

        // Render termina TLS en su proxy: confiar en X-Forwarded-* para que
        // Laravel detecte https y genere URLs correctas.
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'permission' => \App\Http\Middleware\CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Toda la API responde errores en JSON (nunca HTML), aunque el
        // cliente no envíe "Accept: application/json".
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson()
        );

        // Fallos de base de datos en la API: respuesta JSON limpia sin filtrar
        // host/credenciales en producción. El detalle completo queda en el log.
        $exceptions->render(function (QueryException $e, Request $request) {
            if (! $request->is('api/*')) {
                return null; // Deja el manejo por defecto fuera de la API.
            }

            $isConnectionError = in_array((string) $e->getCode(), ['08006', '08001', '08004'], true)
                || str_contains($e->getMessage(), 'could not translate host name')
                || str_contains($e->getMessage(), 'Connection refused');

            return response()->json([
                'message' => $isConnectionError
                    ? 'Servicio de base de datos no disponible temporalmente.'
                    : 'Error interno al consultar la base de datos.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], $isConnectionError ? 503 : 500);
        });
    })->create();
