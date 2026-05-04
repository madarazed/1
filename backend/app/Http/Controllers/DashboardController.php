<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use App\Models\User;
use App\Models\Nomina;
use App\Models\JornadaLaboral;
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

        // 2. Costo Proyectado de Nómina (Mes en curso)
        $periodoActual = $hoy->format('Y-m');
        
        // Sumar lo ya liquidado (Pagado o Borrador)
        $costoLiquidado = Nomina::where('periodo', $periodoActual)->sum('neto_pagar');

        // Proyectar para los que no tienen nómina creada aún pero tienen jornadas
        $usuariosConJornada = JornadaLaboral::whereMonth('fecha', $hoy->month)
            ->whereYear('fecha', $hoy->year)
            ->pluck('user_id')
            ->unique();
            
        $usuariosConNomina = Nomina::where('periodo', $periodoActual)->pluck('user_id');
        $usuariosSinNomina = $usuariosConJornada->diff($usuariosConNomina);

        $proyeccionExtra = 0;
        // Valores base 2026 (Estimados para el sistema)
        $salarioBase = 1450000;
        $auxTransporte = 180000;

        foreach ($usuariosSinNomina as $userId) {
            $stats = Nomina::calcularCostosOperativos($userId, $periodoActual);
            $dias = $stats['dias_trabajados'];
            
            // Cálculo proporcional simple
            $devengado = ($salarioBase / 30 * $dias) + ($auxTransporte / 30 * $dias);
            $deducciones = ($salarioBase / 30 * $dias) * 0.08; // 4% salud + 4% pension
            
            $proyeccionExtra += ($devengado - $deducciones);
        }

        $costoProyectado = $costoLiquidado + $proyeccionExtra;

        // 3. Notificaciones no leídas para el usuario actual
        $notificaciones = Notificacion::where('user_id', auth()->id())
            ->where('leido', false)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'alertas_documentacion' => $alertasDocumentos,
            'costo_proyectado_nomina' => round($costoProyectado, 2),
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

    public function getProyeccionNomina()
    {
        $hoy = Carbon::now();
        $periodoActual = $hoy->format('Y-m');
        
        $nominasLiquidadas = Nomina::where('periodo', $periodoActual)->get();
        $costoLiquidado = $nominasLiquidadas->sum('neto_pagar');
        $salarioBaseLiquidado = $nominasLiquidadas->sum('salario_base');
        $horasExtraLiquidado = $nominasLiquidadas->sum('horas_extra');

        $usuariosConJornada = JornadaLaboral::whereMonth('fecha', $hoy->month)
            ->whereYear('fecha', $hoy->year)
            ->pluck('user_id')
            ->unique();
            
        $usuariosConNomina = $nominasLiquidadas->pluck('user_id');
        $usuariosSinNomina = $usuariosConJornada->diff($usuariosConNomina);

        $proyeccionExtra = 0;
        $proyeccionSalarioBase = 0;
        $proyeccionHorasExtra = 0;
        
        $salarioBase = 1450000;
        $auxTransporte = 180000;

        foreach ($usuariosSinNomina as $userId) {
            $stats = Nomina::calcularCostosOperativos($userId, $periodoActual);
            $dias = $stats['dias_trabajados'];
            
            $baseProporcional = ($salarioBase / 30 * $dias);
            $auxProporcional = ($auxTransporte / 30 * $dias);
            $extraEstimado = $stats['horas_extra'] * ($salarioBase / 240 * 1.25); // Estimación básica
            
            $devengado = $baseProporcional + $auxProporcional + $extraEstimado;
            $deducciones = $baseProporcional * 0.08;
            
            $proyeccionExtra += ($devengado - $deducciones);
            $proyeccionSalarioBase += $baseProporcional;
            $proyeccionHorasExtra += $extraEstimado;
        }

        return response()->json([
            'neto_pagar_total' => round($costoLiquidado + $proyeccionExtra, 2),
            'salario_base_total' => round($salarioBaseLiquidado + $proyeccionSalarioBase, 2),
            'horas_extra_total' => round($horasExtraLiquidado + $proyeccionHorasExtra, 2),
            'periodo' => $periodoActual
        ]);
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
