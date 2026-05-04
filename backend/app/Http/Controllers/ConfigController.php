<?php

namespace App\Http\Controllers;

use App\Models\Config;
use App\Models\Sucursal;
use App\Models\Categoria;
use App\Models\Marca;
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
        $configs = $request->all(); // Array de [ { key: 'salario_minimo', value: '1450000', type: 'integer' } ]
        
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
}
