<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Sucursal;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // a) Superadmin -> Acceso total
        if ($user->hasRole('Superadmin')) {
            return $next($request);
        }

        // b) Lógica de Admin Sucursal para ofertas
        if ($user->hasRole('Admin Sucursal')) {
            if ($permission === 'edit_offers') {
                $centro = Sucursal::where('nombre', 'Centro')->first();
                
                if ($centro && $user->id_sucursal_actual === $centro->id) {
                    return $next($request);
                }
                
                return response()->json([
                    'message' => 'Permiso denegado: El Admin Sucursal solo puede editar ofertas si está en la sede Centro.'
                ], 403);
            }
        }

        // Otros roles y permisos genéricos
        if ($user->hasRole($permission)) {
            return $next($request);
        }

        return response()->json(['message' => 'Permiso insuficiente'], 403);
    }
}
