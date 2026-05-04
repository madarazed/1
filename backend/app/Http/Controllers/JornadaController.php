<?php

namespace App\Http\Controllers;

use App\Models\JornadaLaboral;
use App\Models\Checklist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class JornadaController extends Controller
{
    /**
     * Inicia la jornada laboral de un repartidor.
     * Valida que el vehículo tenga un checklist aprobado para el día de hoy.
     */
    public function iniciarJornada(Request $request)
    {
        $validated = $request->validate([
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'km_inicial' => 'required|integer'
        ]);

        $userId = Auth::id() ?? 1;
        $hoy = Carbon::today()->toDateString();

        // VALIDACIÓN: Verificar si el vehículo tiene un checklist aprobado (1) para hoy
        $checklistAprobado = Checklist::where('vehiculo_id', $validated['vehiculo_id'])
            ->where('fecha', $hoy)
            ->where('estado_general', '1') // 1 = Aprobado/Apto según requerimiento
            ->exists();

        if (!$checklistAprobado) {
            return response()->json([
                'message' => 'Vehículo no apto para operar. Debe completar y aprobar el checklist diario primero.'
            ], 403);
        }

        // Crear registro de jornada
        $jornada = JornadaLaboral::create([
            'user_id' => $userId,
            'vehiculo_id' => $validated['vehiculo_id'],
            'km_inicial' => $validated['km_inicial'],
            'fecha' => $hoy,
            'hora_inicio' => Carbon::now()->toTimeString(),
            'estado' => 'Iniciada'
        ]);

        return response()->json([
            'message' => 'Jornada iniciada con éxito',
            'data' => $jornada
        ]);
    }

    /**
     * Finaliza la jornada laboral y calcula el total de horas.
     */
    public function finalizarJornada(Request $request, $id)
    {
        $validated = $request->validate([
            'km_final' => 'required|integer',
            'tomo_almuerzo' => 'nullable|boolean'
        ]);

        $jornada = JornadaLaboral::findOrFail($id);

        if ($jornada->estado === 'Finalizada') {
            return response()->json(['message' => 'La jornada ya ha sido finalizada previamente.'], 400);
        }

        $jornada->hora_fin = Carbon::now()->toTimeString();
        $jornada->km_final = $validated['km_final'];
        $jornada->estado = 'Finalizada';
        
        // El usuario puede enviar si tomó almuerzo en este request
        if ($request->has('tomo_almuerzo')) {
            $jornada->hora_almuerzo = $validated['tomo_almuerzo'] ? '01:00:00' : null;
        }

        // Calcular automáticamente el total de horas usando el método del modelo
        $jornada->calcularHoras();
        $jornada->save();

        return response()->json([
            'message' => 'Jornada finalizada y horas calculadas correctamente',
            'data' => $jornada
        ]);
    }
}
