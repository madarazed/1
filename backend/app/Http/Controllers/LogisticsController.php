<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Checklist;
use App\Models\JornadaLaboral;
use App\Models\NovedadLogistica;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LogisticsController extends Controller
{
    public function status()
    {
        $hoy = Carbon::today()->toDateString();
        
        // Obtener usuarios que tienen el rol de repartidor
        // (Asumimos que el rol se llama 'Repartidor')
        $repartidores = User::whereHas('roles', function($q) {
            $q->where('nombre', 'Repartidor');
        })->get();

        if ($repartidores->isEmpty()) {
            // Si no hay repartidores con rol, traemos todos para la demo
            $repartidores = User::all();
        }

        $data = $repartidores->map(function($user) use ($hoy) {
            // Jornada activa de hoy
            $activeJornada = JornadaLaboral::where('user_id', $user->id)
                ->where('fecha', $hoy)
                ->where('estado', 'Iniciada')
                ->with('vehiculo')
                ->first();

            // Vehículo asignado por defecto
            $vehiculoAsignado = \App\Models\Vehiculo::where('id_usuario_asignado', $user->id)
                ->where('estado', 'Activo')
                ->first();

            // Checklist de hoy
            $hasChecklist = Checklist::where('user_id', $user->id)
                ->where('fecha', $hoy)
                ->exists();

            // Novedades Críticas o Altas de hoy
            $novedadesHoy = NovedadLogistica::with('vehiculo')
                ->whereHas('checklist', function($q) use ($user, $hoy) {
                    $q->where('user_id', $user->id)
                      ->where('fecha', $hoy);
                })
                ->whereIn('prioridad', ['alta', 'critica'])
                ->get()
                ->map(function($n) {
                    return [
                        'id' => $n->id,
                        'descripcion' => $n->descripcion,
                        'prioridad' => $n->prioridad,
                        'vehiculo' => $n->vehiculo ? $n->vehiculo->placa : 'N/A',
                        'vehiculo_id' => $n->vehiculo_id
                    ];
                });

            return [
                'id' => $user->id,
                'name' => $user->nombre,
                'email' => $user->email,
                'active_jornada' => $activeJornada ? [
                    'id' => $activeJornada->id,
                    'estado' => $activeJornada->estado,
                    'vehiculo' => $activeJornada->vehiculo ? [
                        'id' => $activeJornada->vehiculo->id,
                        'placa' => $activeJornada->vehiculo->placa,
                        'marca' => $activeJornada->vehiculo->marca,
                    ] : null
                ] : null,
                'has_checklist_today' => $hasChecklist,
                'vehiculo_asignado' => $vehiculoAsignado ? $vehiculoAsignado->placa : 'Sin Asignar',
                'alertas_novedades' => $novedadesHoy
            ];
        });

        // Agrupar para el frontend
        $pendientes = $data->filter(fn($d) => !$d['has_checklist_today'])->values();
        $alertas = $data->flatMap(fn($d) => $d['alertas_novedades'])->map(function($alerta) use ($data) {
            // Adjuntar conductor a la alerta
            $conductor = $data->firstWhere('id', '!=', null); // Simplemente para estructura, mejor:
            return $alerta;
        })->values();

        // Refinar alertas
        $alertasList = [];
        foreach ($data as $d) {
            foreach ($d['alertas_novedades'] as $al) {
                $alertasList[] = [
                    'conductor' => $d['name'],
                    'vehiculo' => $al['vehiculo'],
                    'vehiculo_id' => $al['vehiculo_id'],
                    'descripcion' => $al['descripcion'],
                    'prioridad' => $al['prioridad']
                ];
            }
        }

        return response()->json([
            'pendientes' => $pendientes,
            'alertas' => $alertasList
        ]);
    }
    public function obtenerResumenCumplimiento()
    {
        $hoy = Carbon::today()->toDateString();
        
        // Obtener todos los repartidores
        $repartidores = User::whereHas('roles', function($q) {
            $q->where('nombre', 'Repartidor');
        })->get();

        if ($repartidores->isEmpty()) {
            $repartidores = User::all();
        }

        $completados = [];
        $pendientes = [];
        $alertas = [];

        foreach ($repartidores as $user) {
            $checklistHoy = Checklist::with('vehiculo')
                ->where('user_id', $user->id)
                ->where('fecha', $hoy)
                ->first();

            $vehiculoAsignado = \App\Models\Vehiculo::where('id_usuario_asignado', $user->id)->first();
            $placa = $vehiculoAsignado ? $vehiculoAsignado->placa : 'Sin Asignar';

            if ($checklistHoy) {
                $completados[] = [
                    'id' => $user->id,
                    'name' => $user->nombre,
                    'checklist_id' => $checklistHoy->id,
                    'estado_general' => $checklistHoy->estado_general
                ];

                // Check for alerts if the general state is 'Malo' or 'Regular' (which maps to 'No Aprobado' / 'Requiere Mantenimiento')
                if (in_array($checklistHoy->estado_general, ['Malo', 'Regular'])) {
                    // Try to get specific novedades, or fallback to general description
                    $novedades = NovedadLogistica::where('checklist_id', $checklistHoy->id)
                        ->whereIn('prioridad', ['alta', 'critica'])
                        ->get();

                    if ($novedades->isNotEmpty()) {
                        foreach ($novedades as $nov) {
                            $alertas[] = [
                                'conductor' => $user->nombre,
                                'placa' => $checklistHoy->vehiculo ? $checklistHoy->vehiculo->placa : $placa,
                                'descripcion' => $nov->descripcion,
                                'prioridad' => $nov->prioridad
                            ];
                        }
                    } else {
                         $alertas[] = [
                            'conductor' => $user->nombre,
                            'placa' => $checklistHoy->vehiculo ? $checklistHoy->vehiculo->placa : $placa,
                            'descripcion' => 'Estado general: ' . $checklistHoy->estado_general,
                            'prioridad' => 'alta'
                        ];
                    }
                }
            } else {
                $pendientes[] = [
                    'id' => $user->id,
                    'name' => $user->nombre,
                    'placa_estimada' => $placa
                ];
            }
        }

        return response()->json([
            'pendientes' => $pendientes,
            'completados' => $completados,
            'alertas' => $alertas
        ]);
    }
}
