<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    public function index()
    {
        // 1. Obtener las promociones especiales asignadas (Flash y Daily)
        $especiales = DB::table('promociones as pr')
            ->join('productos as p', 'pr.id_producto', '=', 'p.id')
            ->where('pr.activa', true)
            ->whereNull('p.deleted_at')
            ->select(
                'pr.id',
                'pr.id_producto',
                'pr.tipo',
                'p.nombre as titulo_producto',
                'p.precio as precio_original',
                'p.precio_oferta as precio_actual',
                'p.url_imagen as imagen_producto'
            )
            ->get();

        $idsEspeciales = $especiales->pluck('id_producto')->toArray();

        // 2. Obtener productos que tienen el flag en_promocion pero no son las especiales actuales
        $genericas = DB::table('productos')
            ->where('en_promocion', true)
            ->whereNull('deleted_at')
            ->whereNotIn('id', $idsEspeciales)
            ->inRandomOrder()
            ->limit(10)
            ->select(
                DB::raw('NULL as id'),
                'id as id_producto',
                DB::raw("'Oferta Especial' as tipo"),
                'nombre as titulo_producto',
                'precio as precio_original',
                'precio_oferta as precio_actual',
                'url_imagen as imagen_producto'
            )
            ->get();

        // Combinar ambas listas
        $resultado = $especiales->concat($genericas);

        // 3. Si aún no tenemos al menos 3, rellenar con productos aleatorios activos
        if ($resultado->count() < 3) {
            $idsYaIncluidos = $resultado->pluck('id_producto')->toArray();
            $extras = DB::table('productos')
                ->whereNull('deleted_at')
                ->whereNotIn('id', $idsYaIncluidos)
                ->inRandomOrder()
                ->limit(3 - $resultado->count())
                ->select(
                    DB::raw('NULL as id'),
                    'id as id_producto',
                    DB::raw("'Recomendado' as tipo"),
                    'nombre as titulo_producto',
                    'precio as precio_original',
                    'precio_oferta as precio_actual',
                    'url_imagen as imagen_producto'
                )
                ->get();
            $resultado = $resultado->concat($extras);
        }

        // Asegurar que los precios no sean 0 si hay un precio_original
        foreach ($resultado as $item) {
            if (!$item->precio_actual || $item->precio_actual <= 0) {
                $item->precio_actual = $item->precio_original;
                $item->precio_original = null; // No tachar si es el mismo
            }
        }

        return response()->json($resultado);
    }

    public function storeSpecial(Request $request)
    {
        $request->validate([
            'id_producto' => 'required|exists:productos,id',
            'tipo' => 'required|string|in:flash,daily'
        ]);

        $tipoMap = [
            'flash' => 'Oferta Relámpago',
            'daily' => 'Promoción del Día'
        ];

        $tipo = $request->tipo;
        $id_producto = $request->id_producto;

        // Desactivar promociones anteriores del mismo tipo
        DB::table('promociones')->where('tipo', $tipoMap[$tipo])->update(['activa' => false]);

        // Crear la nueva promoción vinculada al producto
        // Obtenemos los datos del producto para llenar campos legacy si es necesario
        $producto = DB::table('productos')->where('id', $id_producto)->first();

        DB::table('promociones')->insert([
            'id_producto' => $id_producto,
            'titulo' => $producto->nombre,
            'descripcion' => $producto->descripcion ?? 'Oferta especial de Rapifrios',
            'url_media' => $producto->url_imagen ?? '',
            'tipo' => $tipoMap[$tipo],
            'fechas' => now()->toDateString(),
            'activa' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json(['message' => 'Oferta asignada correctamente']);
    }
}
