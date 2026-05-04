<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NovedadLogistica extends Model
{
    protected $table = 'novedades_logistica';
    protected $fillable = [
        'checklist_id', 
        'vehiculo_id',
        'descripcion', 
        'tipo_novedad', 
        'prioridad',
        'estado',
        'fecha_resolucion'
    ];

    protected $casts = [
        'fecha_resolucion' => 'date'
    ];

    public function checklist()
    {
        return $this->belongsTo(Checklist::class);
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }
}
