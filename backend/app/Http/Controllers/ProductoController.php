<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('productos as p')
            ->leftJoin('marcas as m', 'p.id_marca', '=', 'm.id')
            ->leftJoin('categorias as c', 'p.id_categoria', '=', 'c.id')
            ->whereNull('p.deleted_at')
            ->where('p.es_exclusivo', false)
            ->select(
                'p.id',
                'p.nombre',
                'p.descripcion',
                'p.url_imagen',
                'p.precio',
                'p.stock',
                'p.id_marca',
                'p.id_categoria',
                'p.en_promocion',
                'p.precio_oferta',
                'p.fecha_fin_oferta',
                'p.es_exclusivo',
                'm.nombre as nombre_marca',
                'c.nombre as nombre_categoria'
            );

        if ($request->filled('search')) {
            $query->where('p.nombre', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('marca') && $request->marca !== 'all') {
            $query->where('p.id_marca', $request->marca);
        }

        $productos = $query->orderBy('p.nombre')->get();

        return response()->json($productos);
    }

    public function exclusivas(Request $request)
    {
        $user = $request->user();
        if (!$user || !($user->hasRole('Cliente') || $user->hasRole('cliente') || $user->hasRole('admin') || $user->hasRole('Admin') || $user->hasRole('Superadmin'))) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $query = DB::table('productos as p')
            ->leftJoin('marcas as m', 'p.id_marca', '=', 'm.id')
            ->leftJoin('categorias as c', 'p.id_categoria', '=', 'c.id')
            ->whereNull('p.deleted_at')
            ->where('p.es_exclusivo', true)
            ->select(
                'p.id',
                'p.nombre',
                'p.descripcion',
                'p.url_imagen',
                'p.precio',
                'p.stock',
                'p.id_marca',
                'p.id_categoria',
                'p.en_promocion',
                'p.precio_oferta',
                'p.fecha_fin_oferta',
                'p.es_exclusivo',
                'm.nombre as nombre_marca',
                'c.nombre as nombre_categoria'
            );

        $productos = $query->orderBy('p.nombre')->get();
        return response()->json($productos);
    }

    public function show($id)
    {
        $producto = Producto::findOrFail($id);
        return response()->json($producto);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'id_marca' => 'required|exists:marcas,id',
            'id_categoria' => 'nullable|exists:categorias,id',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'en_promocion' => 'nullable',
            'precio_oferta' => 'nullable|numeric|min:0',
            'fecha_fin_oferta' => 'nullable|date',
            'es_exclusivo' => 'nullable|boolean',
        ]);

        if (!isset($validated['stock'])) {
            $validated['stock'] = 0;
        }

        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');
            $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $file->move(public_path('products'), $filename);
            $validated['url_imagen'] = $filename;
        }

        if ($request->has('en_promocion')) {
            $validated['en_promocion'] = filter_var($request->en_promocion, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->has('es_exclusivo')) {
            $validated['es_exclusivo'] = filter_var($request->es_exclusivo, FILTER_VALIDATE_BOOLEAN);
        } else {
            $validated['es_exclusivo'] = false;
        }

        $producto = Producto::create($validated);

        return response()->json([
            'message' => 'Producto creado con éxito',
            'producto' => $producto
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'id_marca' => 'required|exists:marcas,id',
            'id_categoria' => 'nullable|exists:categorias,id',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'en_promocion' => 'nullable',
            'precio_oferta' => 'nullable|numeric|min:0',
            'fecha_fin_oferta' => 'nullable|date',
            'es_exclusivo' => 'nullable|boolean',
        ]);

        if ($request->hasFile('imagen')) {
            // Eliminar imagen anterior si existe y es un archivo local
            if ($producto->url_imagen && !str_starts_with($producto->url_imagen, 'http')) {
                $oldPath = public_path('products/' . $producto->url_imagen);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }
            
            $file = $request->file('imagen');
            $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $file->move(public_path('products'), $filename);
            $validated['url_imagen'] = $filename;
        }

        if ($request->has('en_promocion')) {
            $validated['en_promocion'] = filter_var($request->en_promocion, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->has('es_exclusivo')) {
            $validated['es_exclusivo'] = filter_var($request->es_exclusivo, FILTER_VALIDATE_BOOLEAN);
        }

        $producto->update($validated);

        return response()->json([
            'message' => 'Producto actualizado con éxito',
            'producto' => $producto
        ]);
    }

    public function destroy($id)
    {
        try {
            $producto = Producto::findOrFail($id);
            $producto->delete();

            return response()->json([
                'message' => 'Producto eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el producto: ' . $e->getMessage()
            ], 500);
        }
    }
}
