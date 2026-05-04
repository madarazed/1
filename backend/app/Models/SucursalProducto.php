<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SucursalProducto extends Model
{
    protected $table = 'sucursal_producto';
    protected $fillable = ['producto_id', 'sucursal_id', 'stock'];
}
