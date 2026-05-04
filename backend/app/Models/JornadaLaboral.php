<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class JornadaLaboral extends Model
{
    protected $table = 'jornadas_laborales';
    protected $fillable = [
        'user_id', 
        'vehiculo_id', 
        'fecha', 
        'hora_inicio', 
        'hora_fin', 
        'hora_almuerzo', 
        'km_inicial',
        'km_final',
        'estado'
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    /**
     * Calcula el total de horas restando el tiempo de almuerzo.
     * Asumimos que hora_almuerzo es un string representativo o un valor en minutos/horas.
     * Según el diseño común, restaremos 1 hora (60 min) si el campo es true o un valor específico.
     */
    public function calcularHoras()
    {
        if (!$this->hora_inicio || !$this->hora_fin) {
            return 0;
        }

        $inicio = Carbon::parse($this->hora_inicio);
        $fin = Carbon::parse($this->hora_fin);
        
        $diffEnMinutos = $inicio->diffInMinutes($fin);
        
        // Restar almuerzo (asumimos 60 min si existe registro de almuerzo)
        if ($this->hora_almuerzo) {
            $diffEnMinutos -= 60; 
        }

        $total = max(0, $diffEnMinutos / 60);
        $this->total_horas = round($total, 2);
        
        return $this->total_horas;
    }
}
