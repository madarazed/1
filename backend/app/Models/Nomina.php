<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Nomina extends Model
{
    use SoftDeletes;

    protected $table = 'nominas';

    protected $fillable = [
        'user_id',
        'periodo',
        'dias_trabajados',
        'salario_base',
        'auxilio_transporte',
        'horas_extra',
        'bonificaciones',
        'salud',
        'pension',
        'otras_deducciones',
        'total_devengado',
        'total_deducciones',
        'neto_pagar',
        'estado'
    ];

    protected $casts = [
        'salario_base' => 'float',
        'auxilio_transporte' => 'float',
        'horas_extra' => 'float',
        'bonificaciones' => 'float',
        'salud' => 'float',
        'pension' => 'float',
        'otras_deducciones' => 'float',
        'total_devengado' => 'float',
        'total_deducciones' => 'float',
        'neto_pagar' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calcula automáticamente horas extra y recargos nocturnos del periodo.
     * Basado en la legislación colombiana básica (Jornada ordinaria 8h).
     */
    public static function calcularCostosOperativos($userId, $periodo)
    {
        $inicioMes = Carbon::parse($periodo . '-01')->startOfMonth();
        $finMes = Carbon::parse($periodo . '-01')->endOfMonth();

        $jornadas = JornadaLaboral::where('user_id', $userId)
            ->whereBetween('fecha', [$inicioMes, $finMes])
            ->get();

        $totalHorasExtra = 0;
        $diasTrabajados = $jornadas->unique('fecha')->count();

        foreach ($jornadas as $jornada) {
            $horas = $jornada->calcularHoras();
            if ($horas > 8) {
                $totalHorasExtra += ($horas - 8);
            }
            
            // Recargo nocturno simplificado (después de las 21:00)
            if ($jornada->hora_fin) {
                $fin = Carbon::parse($jornada->hora_fin);
                $limiteNocturno = Carbon::parse($jornada->hora_fin)->setTime(21, 0, 0);
                if ($fin->gt($limiteNocturno)) {
                    // Solo como ejemplo de cálculo
                }
            }
        }

        return [
            'dias_trabajados' => $diasTrabajados,
            'horas_extra' => $totalHorasExtra
        ];
    }
}
