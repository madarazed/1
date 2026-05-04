<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sucursal extends Model
{
    protected $table = 'sucursales';
    protected $fillable = ['nombre', 'direccion', 'telefono'];

    public function users()
    {
        return $this->hasMany(User::class, 'id_sucursal_actual');
    }
}
