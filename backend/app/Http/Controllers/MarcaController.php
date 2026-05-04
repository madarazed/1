<?php

namespace App\Http\Controllers;

use App\Models\Marca;
use Illuminate\Http\Request;

class MarcaController extends Controller
{
    public function index()
    {
        // Usamos select para asegurar que el frontend reciba 'id' y 'nombre' sin importar el nombre interno
        return response()->json(
            Marca::orderBy('nombre')
                ->select('id', 'nombre')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255'
        ]);

        $marca = Marca::create([
            'nombre' => $request->nombre,
            'nombre_marca' => $request->nombre
        ]);

        return response()->json($marca, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255'
        ]);

        $marca = Marca::findOrFail($id);
        $marca->update([
            'nombre' => $request->nombre,
            'nombre_marca' => $request->nombre
        ]);

        return response()->json($marca);
    }

    public function destroy($id)
    {
        $marca = Marca::findOrFail($id);
        $marca->delete();
        return response()->json(null, 204);
    }
}

