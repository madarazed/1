<?php

namespace App\Http\Controllers;

use App\Models\HistorialInventario;
use App\Models\SucursalProducto;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $sedeId = $request->query('sede_id');
        
        $query = DB::table('productos as p')
            ->leftJoin('marcas as m', 'p.id_marca', '=', 'm.id')
            ->leftJoin('sucursal_producto as sp', function($join) use ($sedeId) {
                $join->on('p.id', '=', 'sp.producto_id');
                if ($sedeId && $sedeId !== 'all') {
                    $join->where('sp.sucursal_id', '=', $sedeId);
                }
            })
            ->select(
                'p.id',
                'p.nombre',
                'p.url_imagen',
                'p.precio',
                'p.es_exclusivo',
                'p.id_categoria',
                'm.nombre as nombre_marca',
                DB::raw('COALESCE(SUM(sp.stock), 0) as stock')
            )
            ->whereNull('p.deleted_at')
            ->groupBy('p.id', 'p.nombre', 'p.url_imagen', 'p.precio', 'p.es_exclusivo', 'p.id_categoria', 'm.nombre');

        if ($request->filled('search')) {
            $query->where('p.nombre', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->get());
    }

    public function ajustar(Request $request)
    {
        $validated = $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'sede_id' => 'required|exists:sucursales,id',
            'cantidad' => 'required|integer',
            'tipo_movimiento' => 'required|string|in:Entrada,Salida,Ajuste',
            'motivo' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Actualizar o crear stock en sucursal_producto
            $stockSede = SucursalProducto::firstOrNew([
                'producto_id' => $validated['producto_id'],
                'sucursal_id' => $validated['sede_id'],
            ]);

            $cantidadCambio = $validated['cantidad'];
            
            if ($validated['tipo_movimiento'] === 'Salida') {
                $stockSede->stock -= $cantidadCambio;
            } elseif ($validated['tipo_movimiento'] === 'Entrada') {
                $stockSede->stock += $cantidadCambio;
            } else { // Ajuste directo
                $stockSede->stock = $cantidadCambio;
                // Calculamos la diferencia para el historial si es ajuste directo
                // Pero el usuario pidió "cantidad_cambiada" en el historial.
                // En un ajuste, la cantidad cambiada es la diferencia.
            }
            
            $stockSede->save();

            // 2. Registrar en historial
            HistorialInventario::create([
                'producto_id' => $validated['producto_id'],
                'sede_id' => $validated['sede_id'],
                'usuario_id' => Auth::id() ?? 1, // Fallback a admin si no hay auth
                'cantidad_cambiada' => $validated['cantidad'],
                'tipo_movimiento' => $validated['tipo_movimiento'],
                'motivo' => $validated['motivo'],
            ]);

            // 3. Sincronizar el stock global en la tabla productos (opcional, para compatibilidad)
            $totalStock = SucursalProducto::where('producto_id', $validated['producto_id'])->sum('stock');
            Producto::where('id', $validated['producto_id'])->update(['stock' => $totalStock]);

            return response()->json([
                'message' => 'Stock ajustado correctamente',
                'nuevo_stock' => $stockSede->stock
            ]);
        });
    }
}
