<?php

namespace App\Http\Controllers;

use App\Models\Config;
use App\Models\Sucursal;
use App\Models\Categoria;
use App\Models\Marca;
use App\Models\Producto;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    // Solo Superadmin
    public function __construct()
    {
        // En una app real, aquí va middleware de roles, validamos en el método por ahora
    }

    private function checkSuperAdmin()
    {
        $user = auth()->user();
        if (!$user || !$user->roles->contains('nombre', 'Superadmin')) {
            abort(403, 'Acceso denegado. Solo el Superadmin puede modificar la configuración.');
        }
    }

    // -- PARÁMETROS GLOBALES (Key-Value) --
    
    public function getGlobalConfigs()
    {
        $this->checkSuperAdmin();
        return response()->json(Config::all());
    }

    public function updateGlobalConfigs(Request $request)
    {
        $this->checkSuperAdmin();
        $configs = $request->all(); // Array de [ { key: 'hora_limite', value: '08:00', type: 'string' } ]
        
        foreach ($configs as $conf) {
            Config::updateOrCreate(
                ['key' => $conf['key']],
                [
                    'value' => $conf['value'],
                    'type' => $conf['type'] ?? 'string',
                    'description' => $conf['description'] ?? null
                ]
            );
        }

        return response()->json(['message' => 'Configuraciones actualizadas con éxito']);
    }

    // -- SEDES --
    
    public function getSedes()
    {
        $this->checkSuperAdmin();
        return response()->json(Sucursal::all());
    }

    public function createSede(Request $request)
    {
        $this->checkSuperAdmin();
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:50'
        ]);

        $sede = Sucursal::create($validated);
        return response()->json(['message' => 'Sede creada', 'sede' => $sede]);
    }

    public function updateSede(Request $request, $id)
    {
        $this->checkSuperAdmin();
        $sede = Sucursal::findOrFail($id);
        $sede->update($request->only(['nombre', 'direccion', 'telefono']));
        return response()->json(['message' => 'Sede actualizada', 'sede' => $sede]);
    }

    // -- CATEGORÍAS --
    
    public function createCategoria(Request $request)
    {
        $this->checkSuperAdmin();
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:categorias,nombre',
            'descripcion' => 'nullable|string'
        ]);
        $cat = Categoria::create($validated);
        return response()->json(['message' => 'Categoría creada', 'categoria' => $cat]);
    }

    public function updateCategoria(Request $request, $id)
    {
        $this->checkSuperAdmin();
        $cat = Categoria::findOrFail($id);
        $cat->update($request->only(['nombre', 'descripcion']));
        return response()->json(['message' => 'Categoría actualizada']);
    }

    public function deleteCategoria($id)
    {
        $this->checkSuperAdmin();
        $categoria = Categoria::findOrFail($id);

        if (strtolower(trim($categoria->nombre)) === 'general') {
            return response()->json([
                'message' => 'La categoría "General" es predeterminada y no se puede eliminar.'
            ], 403);
        }

        // Asegurar que exista la categoría General para reasignación
        $categoriaGeneral = Categoria::firstOrCreate(
            ['nombre' => 'General'],
            ['descripcion' => 'Categoría predeterminada del sistema']
        );

        // Reasignar productos de forma segura para no violar restricciones de clave foránea
        Producto::where('id_categoria', $categoria->id)
            ->update(['id_categoria' => $categoriaGeneral->id]);

        $nombre = $categoria->nombre;
        $categoria->delete();

        return response()->json([
            'success' => true,
            'message' => "Categoría '{$nombre}' eliminada con éxito. Los productos asociados fueron transferidos a 'General'."
        ]);
    }
}
