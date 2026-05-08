<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;

class AuditoriaFinalMayoSeeder extends Seeder
{
    /**
     * Reconstrucción total de la base de datos de productos.
     * Sincronización 100% con PDF auditado del 5 de mayo de 2026.
     */
    public function run(): void
    {
        // PASO 1: Limpieza de Base de Datos
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Producto::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // PASO 2: Datos Auditados (Sincronización 100%)
        $data = [
            // Cervezas y Maltas
            ['Michelob Ultra Botella 330ml', 'Michelob Ultra', 2891, 'Cervezas'],
            ['Michelob Ultra Lata 269ml', 'Michelob Ultra', 2243, 'Cervezas'],
            ['Poker Lata 269 CC', 'Poker', 2018, 'Cervezas'],
            ['Poker 1000 CC', 'Poker', 4630, 'Cervezas'],
            ['Corona Extra 269 Lta', 'Corona', 2852, 'Cervezas'],
            ['Corona 330 ML NR', 'Corona', 3687, 'Cervezas'],
            ['Aguila 330ml', 'Aguila', 2215, 'Cervezas'],
            ['Pony Malta Botella 330', 'Pony Malta', 2123, 'Cervezas'],
            ['Club Colombia Dorada 330ml', 'Club Colombia', 2903, 'Cervezas'],
            ['Club Colombia Roja 330ml', 'Club Colombia', 2903, 'Cervezas'],
            ['Club Colombia Trigo 330ml', 'Club Colombia', 2903, 'Cervezas'],
            
            // Licores
            ['Aguardiente Rosado Especial Navidad 750ml', 'Aguardiente Rosado', 65000, 'Licores'],
            ['Aguardiente Amarillo 750ml', 'Ag. Amarillo', 55500, 'Licores'],
            ['Aguardiente Tapa Roja Trad. 750ml', 'Ag. Nectar', 47800, 'Licores'],
            ['Whisky Old Parr 750ml', 'Old Parr', 139800, 'Licores'],
            ['Whisky Buchanan\'s Deluxe 200ml', 'Buchanan\'s', 43400, 'Licores'],
            ['Ron Viejo de Caldas 750cc', 'Ron Viejo de Caldas', 54300, 'Licores'],
            
            // No Alcohólicas
            ['Coca Cola 1.5', 'Coca-Cola', 5417, 'Gaseosas'],
            ['Pepsi 1.5 Litrazo', 'Pepsi', 3750, 'Gaseosas'],
            ['Agua Cristal PET 600', 'Cristal', 1333, 'Aguas'],
            ['Postobón 2.5 LT PROMO', 'Postobón', 5000, 'Gaseosas'],
        ];

        foreach ($data as [$name, $brandName, $price, $categoryName]) {
            // PASO 3: Limpieza de Nombres (Reglas de Visualización)
            $cleanName = $this->cleanProductName($name);

            // Asegurar que la marca existe
            $marca = Marca::firstOrCreate(
                ['nombre' => $brandName],
                ['nombre_marca' => $brandName]
            );

            // Asegurar que la categoría existe
            $category = Categoria::firstOrCreate(['nombre' => $categoryName]);

            Producto::create([
                'nombre' => $cleanName,
                'precio' => $price,
                'id_marca' => $marca->id,
                'id_categoria' => $category->id,
                'descripcion' => 'Calidad Garantizada',
                'url_imagen' => 'placeholder.png',
                'stock' => 100,
                'en_promocion' => false
            ]);
        }

        $this->command->info("Auditoría Final Completada: Sincronización Exacta Mayo 2026.");
    }

    /**
     * Elimina palabras técnicas de los nombres comerciales.
     */
    private function cleanProductName($name)
    {
        $patterns = [
            '/\bBAVARIA\b/i',
            '/\bPOSTOBON\b/i',
            '/\bX\s*1\s*UND\b/i',
            '/\bX\s*UND\b/i',
            '/\bX\s*1\s*U\b/i',
            '/\bUND\b/i',
        ];
        
        $cleaned = preg_replace($patterns, '', $name);
        // Limpiar espacios extra
        return trim(preg_replace('/\s+/', ' ', $cleaned));
    }
}
