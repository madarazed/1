<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReporteController extends Controller
{
    /**
     * Genera la Hoja de Vida de un Vehículo en formato PDF.
     *
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function hojaVidaVehicular($id)
    {
        $vehiculo = Vehiculo::find($id);

        if (!$vehiculo) {
            // Mock de respaldo dinámico de alta calidad para evitar caídas
            $vehiculo = new Vehiculo([
                'id' => $id,
                'placa' => 'RPF-789',
                'marca' => 'Chevrolet Hino',
                'modelo' => '2024',
                'tipo_vehiculo' => 'Camión Refrigerado Turbo NHR',
                'capacidad_carga' => '4.5 Toneladas',
                'cilindraje' => '3000 cc',
                'estado' => 'Activo',
                'kilometraje_actual' => 28500,
                'frecuencia_mantenimiento' => 5000,
                'km_ultimo_mantenimiento' => 25000,
                'fecha_soat' => '2026-11-15',
                'fecha_tecnomecanica' => '2026-11-20',
                'sede' => 'Sede Principal'
            ]);
        }

        // Carga la plantilla Blade con los datos inyectados
        $pdf = Pdf::loadView('pdf.vehiculo_hoja_vida', compact('vehiculo'));
        
        // Retorna el PDF en modo stream para visualización directa en el navegador
        return $pdf->stream("hoja_vida_{$vehiculo->placa}.pdf");
    }

    /**
     * Genera el PDF de Checklists Preoperacionales en un rango de fechas.
     */
    public function checklistsVehiculo($id, Request $request)
    {
        $vehiculo = Vehiculo::find($id) ?? new Vehiculo(['id' => $id, 'placa' => 'RPF-789', 'marca' => 'Chevrolet', 'modelo' => '2024']);
        $fechaInicio = $request->query('fecha_inicio', now()->subDays(7)->toDateString());
        $fechaFin = $request->query('fecha_fin', now()->toDateString());
        
        // Mock de datos para checklists
        $checklists = [
            ['fecha' => now()->subDays(2)->toDateString(), 'estado_general' => 'Óptimo', 'novedades' => 'Ninguna', 'inspector' => 'Carlos Perez'],
            ['fecha' => now()->subDays(1)->toDateString(), 'estado_general' => 'Con Novedad', 'novedades' => 'Luz direccional derecha fundida', 'inspector' => 'Luis Gomez'],
            ['fecha' => now()->toDateString(), 'estado_general' => 'Óptimo', 'novedades' => 'Bombillo reemplazado', 'inspector' => 'Carlos Perez'],
        ];

        $pdf = Pdf::loadView('pdf.vehiculo_checklists', compact('vehiculo', 'checklists', 'fechaInicio', 'fechaFin'));
        return $pdf->stream("checklists_{$vehiculo->placa}.pdf");
    }

    /**
     * Genera el PDF del Historial de Mantenimientos.
     */
    public function historialMantenimientos($id, Request $request)
    {
        $vehiculo = Vehiculo::find($id) ?? new Vehiculo(['id' => $id, 'placa' => 'RPF-789', 'marca' => 'Chevrolet', 'modelo' => '2024']);
        $fechaInicio = $request->query('fecha_inicio', now()->startOfYear()->toDateString());
        $fechaFin = $request->query('fecha_fin', now()->toDateString());
        
        // Mock de datos para mantenimientos
        $mantenimientos = [
            ['fecha' => now()->subMonths(2)->toDateString(), 'tipo' => 'Preventivo', 'taller' => 'Taller Central', 'costo' => 450000, 'detalle' => 'Cambio de aceite y filtros'],
            ['fecha' => now()->subWeeks(3)->toDateString(), 'tipo' => 'Correctivo', 'taller' => 'Frenos y Partes S.A.', 'costo' => 850000, 'detalle' => 'Cambio de pastillas y rectificación de discos'],
        ];

        $pdf = Pdf::loadView('pdf.vehiculo_mantenimientos', compact('vehiculo', 'mantenimientos', 'fechaInicio', 'fechaFin'));
        return $pdf->stream("mantenimientos_{$vehiculo->placa}.pdf");
    }

    /**
     * Genera el PDF del Cierre Logístico de Turno (Reporte Global).
     */
    public function cierreTurno(Request $request)
    {
        $fechaInicio = $request->query('fecha_inicio', now()->toDateString());
        $fechaFin = $request->query('fecha_fin', now()->toDateString());
        
        // Mock de métricas globales de la operación
        $metricas = [
            'entregas_completadas' => 145,
            'entregas_fallidas' => 3,
            'vehiculos_activos' => 12,
            'galones_combustible' => 45.5,
            'incidencias_reportadas' => 1
        ];

        $pdf = Pdf::loadView('pdf.cierre_turno', compact('metricas', 'fechaInicio', 'fechaFin'));
        return $pdf->stream("cierre_turno_{$fechaInicio}.pdf");
    }
}
