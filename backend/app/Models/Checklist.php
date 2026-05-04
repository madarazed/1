<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Checklist extends Model
{
    protected $table = 'checklists';
    protected $fillable = [
        'vehiculo_id', 
        'user_id', 
        'fecha', 
        'estado_general', 
        'observaciones', 
        'datos_checklist'
    ];

    protected $casts = [
        'datos_checklist' => 'array',
        'fecha' => 'date'
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
