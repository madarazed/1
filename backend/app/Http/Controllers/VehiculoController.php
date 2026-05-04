<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use App\Models\NovedadLogistica;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class VehiculoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Vehiculo::query();

        // Si NO es superadmin, filtrar por la sede actual del usuario
        if (!$user->hasRole('Superadmin')) {
            $query->where('sede', $user->sucursalActual?->nombre);
        }

        $vehiculos = $query->get()->map(function ($v) {
            $v->mantenimiento = $v->checkMantenimiento();
            // Contar novedades críticas o altas
            $v->novedades_criticas = $v->novedades()
                ->whereIn('prioridad', ['alta', 'critica'])
                ->where('estado', '!=', 'resuelta')
                ->count();
            return $v;
        });

        return response()->json($vehiculos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'placa' => 'required|string|unique:vehiculos,placa|max:10',
            'marca' => 'required|string',
            'modelo' => 'required|string',
            'tipo_vehiculo' => 'required|in:moto,carro,camion',
            'capacidad_carga' => 'required_if:tipo_vehiculo,camion|nullable|numeric',
            'cilindraje' => 'nullable|numeric',
            'kilometraje_actual' => 'required|numeric',
            'frecuencia_mantenimiento' => 'nullable|numeric',
            'km_ultimo_mantenimiento' => 'nullable|numeric',
            'fecha_soat' => 'required|date',
            'fecha_tecnomecanica' => 'required|date',
            'estado' => 'required|string',
            'sede' => 'nullable|string'
        ]);

        $vehiculo = Vehiculo::create($validated);

        return response()->json([
            'message' => 'Vehículo registrado correctamente',
            'data' => $vehiculo
        ], 201);
    }

    public function show($id)
    {
        $vehiculo = Vehiculo::with(['novedades' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->findOrFail($id);
        
        $vehiculo->mantenimiento = $vehiculo->checkMantenimiento();
        
        return response()->json($vehiculo);
    }

    public function update(Request $request, $id)
    {
        $vehiculo = Vehiculo::findOrFail($id);

        $validated = $request->validate([
            'placa' => 'required|string|max:10|unique:vehiculos,placa,' . $id,
            'marca' => 'required|string',
            'modelo' => 'required|string',
            'tipo_vehiculo' => 'required|in:moto,carro,camion',
            'capacidad_carga' => 'required_if:tipo_vehiculo,camion|nullable|numeric',
            'cilindraje' => 'nullable|numeric',
            'kilometraje_actual' => 'required|numeric',
            'frecuencia_mantenimiento' => 'nullable|numeric',
            'km_ultimo_mantenimiento' => 'nullable|numeric',
            'fecha_soat' => 'required|date',
            'fecha_tecnomecanica' => 'required|date',
            'estado' => 'required|string',
            'sede' => 'nullable|string'
        ]);

        $vehiculo->update($validated);

        return response()->json([
            'message' => 'Vehículo actualizado correctamente',
            'data' => $vehiculo
        ]);
    }

    public function destroy($id)
    {
        $vehiculo = Vehiculo::findOrFail($id);
        $vehiculo->delete();
        return response()->json(['message' => 'Vehículo eliminado']);
    }

    public function getNovedades($id)
    {
        $novedades = NovedadLogistica::where('vehiculo_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($novedades);
    }

    public function getDashboardStats(Request $request)
    {
        $user = $request->user();
        $query = Vehiculo::query();

        if (!$user->hasRole('Superadmin')) {
            $query->where('sede', $user->sucursalActual?->nombre);
        }

        $stats = (clone $query)->select('tipo_vehiculo', DB::raw('count(*) as total'))
            ->groupBy('tipo_vehiculo')
            ->get();

        $alerts = (clone $query)->where(function($q) {
            $q->where('fecha_soat', '<=', now()->addDays(5))
              ->orWhere('fecha_tecnomecanica', '<=', now()->addDays(5));
        })->count();

        return response()->json([
            'by_type' => $stats,
            'total_alerts' => $alerts,
            'active_fleet' => (clone $query)->where('estado', 'Activo')->count()
        ]);
    }

    public function getDisponibles()
    {
        // Vehículos activos que no tienen un usuario asignado
        $vehiculos = Vehiculo::where('estado', 'Activo')
            ->whereNull('id_usuario_asignado')
            ->get(['id', 'placa', 'marca', 'modelo', 'tipo_vehiculo']);
        
        return response()->json($vehiculos);
    }
}
