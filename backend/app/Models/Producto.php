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
        'es_exclusivo',
    ];

    protected $casts = [
        'precio' => 'float',
        'stock'  => 'integer',
        'en_promocion' => 'boolean',
        'precio_oferta' => 'float',
        'es_exclusivo' => 'boolean',
    ];

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'id_marca');
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria');
    }

    /**
     * Accessor para la imagen.
     * Retorna únicamente el nombre plano del archivo.
     * Toda resolución de URL, fallbacks y CDN queda delegada
     * exclusivamente al frontend via getImageUrl() y SmartImage.tsx.
     */
    public function getUrlImagenAttribute($value)
    {
        if (!$value) {
            return null;
        }

        // Si ya es un nombre de archivo simple (sin slashes de ruta completa),
        // lo retornamos tal cual.
        if (!str_contains($value, '/') && !str_contains($value, '\\')) {
            return $value;
        }

        // Si contiene una URL completa (http/https), extraemos solo el basename.
        return basename($value);
    }
}
