<?php

namespace App\Http\Controllers;

use App\Models\Nomina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NominaController extends Controller
{
    public function index(Request $request)
    {
        $query = Nomina::with('user');
        
        if ($request->periodo) {
            $query->where('periodo', $request->periodo);
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        // Lógica para crear o actualizar nómina basada en jornadas
        $userId = $request->user_id;
        $periodo = $request->periodo;

        $stats = Nomina::calcularCostosOperativos($userId, $periodo);
        
        // Valores base 2026
        $salarioBase = 1450000;
        $auxTransporte = 180000;
        
        $devengadoBase = ($salarioBase / 30) * $stats['dias_trabajados'];
        $auxTransProporcional = ($auxTransporte / 30) * $stats['dias_trabajados'];
        
        $salud = $devengadoBase * 0.04;
        $pension = $devengadoBase * 0.04;
        
        $totalDevengado = $devengadoBase + $auxTransProporcional + ($request->bonificaciones ?? 0);
        $totalDeducciones = $salud + $pension + ($request->otras_deducciones ?? 0);

        $nomina = Nomina::updateOrCreate(
            ['user_id' => $userId, 'periodo' => $periodo],
            [
                'dias_trabajados' => $stats['dias_trabajados'],
                'salario_base' => $salarioBase,
                'auxilio_transporte' => $auxTransProporcional,
                'horas_extra' => $stats['horas_extra'],
                'bonificaciones' => $request->bonificaciones ?? 0,
                'salud' => $salud,
                'pension' => $pension,
                'otras_deducciones' => $request->otras_deducciones ?? 0,
                'total_devengado' => $totalDevengado,
                'total_deducciones' => $totalDeducciones,
                'neto_pagar' => $totalDevengado - $totalDeducciones,
                'estado' => 'Borrador'
            ]
        );

        return response()->json($nomina);
    }

    public function aprobar($id)
    {
        $user = Auth::user();
        
        // Verificar si es Superadmin (usando el sistema de roles del proyecto)
        if (!$user->hasRole('Superadmin')) {
            return response()->json(['error' => 'No tienes permisos para aprobar nóminas.'], 403);
        }

        $nomina = Nomina::findOrFail($id);
        $nomina->update(['estado' => 'Pagado']);

        return response()->json(['message' => 'Nómina aprobada y marcada como pagada.', 'nomina' => $nomina]);
    }
}
