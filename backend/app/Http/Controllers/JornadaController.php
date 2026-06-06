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
        $usuario = Auth::user() ?? \App\Models\User::find($userId);

        if (!$usuario || !$usuario->vehiculo_id) {
            return response()->json([
                'message' => 'No tienes vehículo asignado.'
            ], 403);
        }

        // TODO: Consumir desde tabla 'settings' o parámetro global
        // $reinicioHora = \App\Models\Setting::get('hora_reinicio_turno', '04:00:00');
        // $hoy = Carbon::now()->subHours(4)->toDateString(); // Si se reinicia a las 4am
        $hoy = Carbon::today()->toDateString();

        if (JornadaLaboral::where('user_id', $userId)->where('fecha', $hoy)->where('estado', 'Iniciada')->exists()) {
            return response()->json([
                'message' => 'Ya tienes una jornada activa hoy.'
            ], 422);
        }

        $vehiculo = \App\Models\Vehiculo::find($validated['vehiculo_id']);
        if ($vehiculo && $vehiculo->estado !== 'Bueno' && $vehiculo->estado !== 'Activo') {
            return response()->json([
                'message' => 'Vehículo inmovilizado por administración.'
            ], 403);
        }

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

        $userId = Auth::id() ?? $jornada->user_id;
        $usuario = Auth::user() ?? \App\Models\User::find($userId);

        if (!$usuario || !$usuario->vehiculo_id) {
            return response()->json([
                'message' => 'No tienes vehículo asignado.'
            ], 403);
        }

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

    /**
     * Obtiene la jornada activa de hoy del repartidor.
     */
    public function getJornadaActiva(Request $request)
    {
        $userId = Auth::id();
        $usuario = Auth::user() ?? \App\Models\User::find($userId);

        if (!$usuario || !$usuario->vehiculo_id) {
            return response()->json([
                'message' => 'No tienes vehículo asignado.'
            ], 403);
        }

        // TODO: Consumir desde tabla 'settings' o parámetro global
        // $reinicioHora = \App\Models\Setting::get('hora_reinicio_turno', '04:00:00');
        // $hoy = Carbon::now()->subHours(4)->toDateString(); // Si se reinicia a las 4am
        $hoy = Carbon::today()->toDateString();

        $jornada = JornadaLaboral::where('user_id', $userId)
            ->where('fecha', $hoy)
            ->where('estado', 'Iniciada')
            ->first();

        return response()->json($jornada);
    }

    /**
     * Cierra forzosamente la jornada activa de un empleado y libera su vehículo.
     */
    public function forceResetShift(Request $request, $employeeId)
    {
        $admin = Auth::user() ?? \App\Models\User::find(Auth::id() ?? 1);
        if (!$admin || !$admin->hasRole('Superadmin')) {
            return response()->json([
                'message' => 'Acceso denegado. Se requieren permisos de Superadmin.'
            ], 403);
        }

        // 1. Finalizar jornada si está activa
        $jornada = JornadaLaboral::where('user_id', $employeeId)
            ->where('estado', 'Iniciada')
            ->first();

        if ($jornada) {
            $jornada->estado = 'Finalizada';
            $jornada->hora_fin = Carbon::now()->toTimeString();
            $jornada->km_final = $jornada->km_inicial + 1;
            $jornada->save();
        }

        // 2. Liberar vehículo
        $vehiculo = \App\Models\Vehiculo::where('id_usuario_asignado', $employeeId)->first();
        if ($vehiculo) {
            $vehiculo->id_usuario_asignado = null;
            $vehiculo->save();
        }

        return response()->json([
            'message' => 'Jornada cerrada y vehículo liberado con éxito.'
        ]);
    }
}
