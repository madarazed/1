<?php

namespace App\Http\Controllers;

use App\Models\Nomina;
use App\Models\Vehiculo;
use App\Models\Producto;
use App\Models\Checklist;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    public function generateNominaPdf($id)
    {
        $nomina = Nomina::with('user.roles')->findOrFail($id);
        
        // Auditoría
        Log::info("Reporte de Nómina generado por usuario ID: " . auth()->id() . " para Nómina ID: $id");

        $pdf = Pdf::loadView('reports.nomina', compact('nomina'));
        return $pdf->download("desprendible_{$nomina->user->nombre}_{$nomina->periodo}.pdf");
    }

    public function generateVehiculoPdf(Request $request, $id)
    {
        $vehiculo = Vehiculo::findOrFail($id);
        $fecha_inicio = $request->fecha_inicio ?? now()->startOfMonth()->toDateString();
        $fecha_fin = $request->fecha_fin ?? now()->toDateString();

        $checklists = Checklist::where('vehiculo_id', $id)
            ->whereBetween('fecha', [$fecha_inicio, $fecha_fin])
            ->with('user')
            ->get();

        Log::info("Reporte Vehicular generado para placa: {$vehiculo->placa}");

        $pdf = Pdf::loadView('reports.hoja_vida_vehicular', compact('vehiculo', 'checklists', 'fecha_inicio', 'fecha_fin'));
        return $pdf->download("hoja_vida_{$vehiculo->placa}.pdf");
    }

    public function generateInventarioPdf(Request $request)
    {
        $sede = $request->sede;
        $query = Producto::with(['marca', 'categoria']);
        
        if ($sede && $sede !== 'Global') {
            // Suponiendo que hay una relación de productos con sedes o un campo sede
            // $query->where('sede', $sede);
        }

        $productos = $query->get();

        Log::info("Reporte de Inventario generado para sede: $sede");

        $pdf = Pdf::loadView('reports.inventario', compact('productos', 'sede'));
        return $pdf->download("inventario_" . ($sede ?: 'global') . "_" . now()->format('Ymd') . ".pdf");
    }
}
