<?php

namespace App\Http\Controllers;

use App\Models\Checklist;
use App\Models\NovedadLogistica;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ChecklistController extends Controller
{
    public function store(Request $request)
        $vehiculo = Vehiculo::findOrFail($request->vehiculo_id);

        abort_if(
            Auth::id() !== (int) $request->user_id && !Auth::user()->hasRole('Superadmin'), 
            403, 
            'No autorizado para registrar este checklist en nombre de otro usuario.'
        );

        $rules = [
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'estado_general' => 'required|string',
            'observaciones' => 'nullable|string',
            'datos_checklist' => 'required|array',
            'novedades' => 'nullable|array',
            'novedades.*.descripcion' => 'required|string',
            'novedades.*.prioridad' => 'required|in:baja,media,alta,critica',
            'novedades.*.tipo_novedad' => 'required|string',
        ];

        $validated = $request->validate($rules);

        return DB::transaction(function () use ($validated, $request) {
            $checklist = Checklist::create([
                'vehiculo_id' => $validated['vehiculo_id'],
                'user_id' => $request->user_id ?? Auth::id(),
                'fecha' => now()->toDateString(),
                'estado_general' => $validated['estado_general'],
                'observaciones' => $validated['observaciones'],
                'datos_checklist' => $validated['datos_checklist']
            ]);

            // Registrar novedades si existen
            if (!empty($validated['novedades'])) {
                foreach ($validated['novedades'] as $novedad) {
                    NovedadLogistica::create([
                        'checklist_id' => $checklist->id,
                        'vehiculo_id' => $checklist->vehiculo_id,
                        'descripcion' => $novedad['descripcion'],
                        'tipo_novedad' => $novedad['tipo_novedad'],
                        'prioridad' => $novedad['prioridad'],
                        'estado' => 'pendiente'
                    ]);
                }
            }

            return response()->json([
                'message' => 'Checklist y novedades guardados correctamente',
                'data' => $checklist->load('vehiculo')
            ], 201);
        });
    }

    public function index(Request $request)
    {
        $query = Checklist::with(['vehiculo', 'user']);
        
        // Filtro opcional por vehículo
        if ($request->has('vehiculo_id')) {
            $query->where('vehiculo_id', $request->vehiculo_id);
        }

        return response()->json($query->latest()->get());
    }

    public function show($id)
    {
        return response()->json(Checklist::with(['vehiculo', 'user'])->findOrFail($id));
    }

    public function miPerfilLogistico(Request $request)
    {
        $user = $request->user();
        
        $vehiculo = Vehiculo::where('id_usuario_asignado', $user->id)
            ->where('estado', 'Activo')
            ->first();

        if (!$vehiculo) {
            return response()->json(['message' => 'No tienes un vehículo activo asignado.'], 404);
        }

        return response()->json([
            'nombre' => $user->nombre,
            'placa' => $vehiculo->placa,
            'tipo_vehiculo' => $vehiculo->tipo_vehiculo,
            'sede' => $vehiculo->sede,
            'vehiculo_id' => $vehiculo->id
        ]);
    }
}
