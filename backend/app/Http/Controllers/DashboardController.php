<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use App\Models\User;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getOverview()
    {
        $hoy = Carbon::now();
        $limiteDocs = Carbon::now()->addDays(10);

        // 1. Alertas de Documentación
        $alertasDocumentos = Vehiculo::where('fecha_soat', '<=', $limiteDocs)
            ->orWhere('fecha_tecnomecanica', '<=', $limiteDocs)
            ->count();



        // 3. Notificaciones no leídas para el usuario actual
        $notificaciones = Notificacion::where('user_id', auth()->id())
            ->where('leido', false)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'alertas_documentacion' => $alertasDocumentos,
            'notificaciones_recientes' => $notificaciones,
            'stats_operativas' => [
                'vehiculos_activos' => Vehiculo::where('estado', 'Activo')->count(),
                'repartidores_activos' => User::whereHas('roles', function($q) {
                    $q->where('nombre', 'Repartidor');
                })->where('activo', true)->count(),
            ]
        ]);
    }

    public function getNotificaciones()
    {
        return response()->json(
            Notificacion::where('user_id', auth()->id())
                ->latest()
                ->paginate(20)
        );
    }

    public function marcarLeida($id)
    {
        $notif = Notificacion::where('user_id', auth()->id())->findOrFail($id);
        $notif->update(['leido' => true]);
        return response()->json(['message' => 'Notificación marcada como leída']);
    }



    public function getAlertasCriticas()
    {
        $limiteDocs = Carbon::now()->addDays(10);
        $vehiculosVencidos = Vehiculo::where('fecha_soat', '<=', $limiteDocs)
            ->orWhere('fecha_tecnomecanica', '<=', $limiteDocs)
            ->get(['id', 'placa', 'fecha_soat', 'fecha_tecnomecanica']);

        return response()->json([
            'alertas_documentacion_count' => $vehiculosVencidos->count(),
            'vehiculos_afectados' => $vehiculosVencidos
        ]);
    }

    public function enviarRecordatorio(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'mensaje' => 'required|string'
        ]);

        $notificacion = Notificacion::create([
            'user_id' => $request->user_id,
            'emisor_id' => auth()->id(),
            'titulo' => 'Recordatorio Operativo',
            'mensaje' => $request->mensaje,
            'tipo' => 'Logística',
            'leido' => false
        ]);

        return response()->json(['message' => 'Recordatorio enviado', 'notificacion' => $notificacion]);
    }
}
