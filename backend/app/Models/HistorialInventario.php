<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialInventario extends Model
{
    protected $table = 'historial_inventario';
    protected $fillable = ['producto_id', 'sede_id', 'usuario_id', 'cantidad_cambiada', 'tipo_movimiento', 'motivo'];
}
