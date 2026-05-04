<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Producto extends Model
{
    use SoftDeletes;

    protected $table = 'productos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'url_imagen',
        'precio',
        'stock',
        'id_marca',
        'id_categoria',
        'en_promocion',
        'precio_oferta',
        'fecha_fin_oferta',
    ];

    protected $casts = [
        'precio' => 'float',
        'stock'  => 'integer',
        'en_promocion' => 'boolean',
        'precio_oferta' => 'float',
    ];

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'id_marca');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria');
    }
}
