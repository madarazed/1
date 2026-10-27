<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Producto extends Model
{
    use SoftDeletes;

    protected $table = 'productos';

    protected $fillable = [
        'codigo_referencia',
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
     * Sanitiza texto reparando secuencias de mojibake (CP437, CP850, Windows-1252)
     * como ├æ -> Ñ, ├± -> ñ, etc.
     */
    public static function sanitizarTexto($texto)
    {
        if ($texto === null || $texto === '') {
            return $texto;
        }

        $reemplazos = [
            '├æ' => 'Ñ',
            '├±' => 'ñ',
            '├ñ' => 'ñ',
            'Ã‘' => 'Ñ',
            'Ã±' => 'ñ',
            '├' => 'Á',
            '├ë' => 'É',
            '├Í' => 'Í',
            '├ô' => 'Ó',
            '├Ü' => 'Ú',
            '├í' => 'á',
            '├©' => 'é',
            '├¡' => 'í',
            '├ó' => 'ó',
            '├│' => 'ó',
            '├ú' => 'ú',
            '├║' => 'ú',
            'Ã' => 'Á',
            'Ã‰' => 'É',
            'Ã' => 'Í',
            'Ã“' => 'Ó',
            'Ãš' => 'Ú',
            'Ã¡' => 'á',
            'Ã©' => 'é',
            'Ã­' => 'í',
            'Ã³' => 'ó',
            'Ãº' => 'ú',
            '┬░' => '°',
        ];

        return strtr((string)$texto, $reemplazos);
    }

    /**
     * Sanitiza y normaliza precios en pesos colombianos (COP).
     * Corrige casos donde un precio en miles como 18.000 se parseó o persistió como 18.
     * Conserva intactos los precios legítimos como 500, 1500, 18500, etc.
     */
    public static function normalizarPrecio($valor): float
    {
        if ($valor === null || $valor === '') {
            return 0.0;
        }

        $str = trim((string)$valor);
        $str = preg_replace('/[^\d.,]/', '', $str);
        if ($str === '') {
            return 0.0;
        }

        // Si tiene comas y puntos: ej '18.000,00' o '18,000.00'
        if (strpos($str, '.') !== false && strpos($str, ',') !== false) {
            $lastDot = strrpos($str, '.');
            $lastComma = strrpos($str, ',');
            if ($lastComma > $lastDot) {
                // 18.000,00 (español): punto miles, coma decimal
                $str = str_replace('.', '', $str);
                $str = str_replace(',', '.', $str);
            } else {
                // 18,000.00 (inglés): coma miles, punto decimal
                $str = str_replace(',', '', $str);
            }
            $val = floatval($str);
        } elseif (strpos($str, '.') !== false) {
            $parts = explode('.', $str);
            if (count($parts) > 2) {
                // 1.250.000 (múltiples puntos miles)
                $val = floatval(str_replace('.', '', $str));
            } else {
                // 1 solo punto: ej '18.000' o '1.500' o '500.00' o '18000.00'
                $afterDot = $parts[1];
                if (strlen($afterDot) === 3) {
                    // Exactamente 3 dígitos: separador de miles colombiano (18.000 -> 18000, 1.500 -> 1500)
                    $val = floatval($parts[0] . $parts[1]);
                } else {
                    // 18000.00 o 500.00 (punto decimal)
                    $val = floatval($str);
                }
            }
        } elseif (strpos($str, ',') !== false) {
            $parts = explode(',', $str);
            if (count($parts) > 2) {
                $val = floatval(str_replace(',', '', $str));
            } else {
                $afterComma = $parts[1];
                if (strlen($afterComma) === 3) {
                    // 18,000 (coma miles)
                    $val = floatval($parts[0] . $parts[1]);
                } else {
                    // 500,00 o 18000,00 (coma decimal)
                    $val = floatval($parts[0] . '.' . $parts[1]);
                }
            }
        } else {
            // Solo dígitos: '18000', '500'
            $val = floatval($str);
        }

        // En Colombia ningún producto cuesta entre 1 y 99 pesos (ej: 18 -> 18000, 23 -> 23000).
        // Los productos de 500 pesos se conservan intactos porque 500 >= 100.
        if ($val > 0 && $val < 100) {
            $val = $val * 1000;
        }

        return $val;
    }

    public function getPrecioAttribute($value)
    {
        return self::normalizarPrecio($value);
    }

    public function setPrecioAttribute($value)
    {
        $this->attributes['precio'] = self::normalizarPrecio($value);
    }

    public function getPrecioOfertaAttribute($value)
    {
        return self::normalizarPrecio($value);
    }

    public function setPrecioOfertaAttribute($value)
    {
        $this->attributes['precio_oferta'] = self::normalizarPrecio($value);
    }

    public function getNombreAttribute($value)
    {
        return self::sanitizarTexto($value);
    }

    public function setNombreAttribute($value)
    {
        $this->attributes['nombre'] = self::sanitizarTexto($value);
    }

    public function getDescripcionAttribute($value)
    {
        return self::sanitizarTexto($value);
    }

    public function setDescripcionAttribute($value)
    {
        $this->attributes['descripcion'] = self::sanitizarTexto($value);
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
