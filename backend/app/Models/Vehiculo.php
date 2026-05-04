<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehiculo extends Model
{
    use SoftDeletes;

    protected $table = 'vehiculos';
    protected $fillable = [
        'placa', 
        'marca', 
        'modelo', 
        'tipo_vehiculo', 
        'capacidad_carga',
        'cilindraje',
        'estado', 
        'kilometraje_actual', 
        'frecuencia_mantenimiento',
        'km_ultimo_mantenimiento',
        'fecha_soat', 
        'fecha_tecnomecanica',
        'sede'
    ];

    /**
     * Lógica de alertas de mantenimiento
     * Verde: Km para mantenimiento > 500
     * Amarillo: Km para mantenimiento entre 0 y 500
     * Rojo: Mantenimiento vencido (Km > frecuencia)
     */
    public function checkMantenimiento()
    {
        $kmRecorridos = $this->kilometraje_actual - $this->km_ultimo_mantenimiento;
        $kmRestantes = $this->frecuencia_mantenimiento - $kmRecorridos;

        if ($kmRestantes > 500) {
            return [
                'estado' => 'verde',
                'mensaje' => "Próximo mantenimiento en {$kmRestantes} KM",
                'color' => '#10B981'
            ];
        } elseif ($kmRestantes >= 0) {
            return [
                'estado' => 'amarillo',
                'mensaje' => "Mantenimiento cercano ({$kmRestantes} KM restantes)",
                'color' => '#F59E0B'
            ];
        } else {
            return [
                'estado' => 'rojo',
                'mensaje' => "Mantenimiento VENCIDO por " . abs($kmRestantes) . " KM",
                'color' => '#EF4444'
            ];
        }
    }

    public function novedades()
    {
        return $this->hasMany(NovedadLogistica::class, 'vehiculo_id');
    }
}
