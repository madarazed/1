<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Marca extends Model
{
    use SoftDeletes;

    protected $table = 'marcas';
    
    protected $fillable = [
        'nombre',
        'nombre_marca'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'id_marca', 'id');
    }
}
