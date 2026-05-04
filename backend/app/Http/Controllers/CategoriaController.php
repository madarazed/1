<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        return response()->json(
            Categoria::orderBy('nombre')
                ->select('id', 'nombre')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255'
        ]);

        $categoria = Categoria::create([
            'nombre' => $request->nombre
        ]);

        return response()->json($categoria, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255'
        ]);

        $categoria = Categoria::findOrFail($id);
        $categoria->update([
            'nombre' => $request->nombre
        ]);

        return response()->json($categoria);
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);
        $categoria->delete();
        return response()->json(null, 204);
    }
}
