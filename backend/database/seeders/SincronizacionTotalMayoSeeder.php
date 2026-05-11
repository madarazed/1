<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SincronizacionTotalMayoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Limpieza Total
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Producto::truncate();
        DB::table('sucursal_producto')->truncate();
        DB::table('historial_inventario')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $filePath = storage_path('app/price_list.txt');
        if (!file_exists($filePath)) {
            $this->command->error("Archivo price_list.txt no encontrado en storage/app");
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $brands = Marca::all();
        $categories = Categoria::all();

        $count = 0;
        foreach ($lines as $line) {
            if (!str_contains($line, ':')) continue;
            
            [$name, $price] = explode(':', $line);
            $name = trim($name);
            $price = floatval(str_replace(',', '', trim($price)));

            // Limpieza de nombre (quitar basura técnica)
            $cleanName = $this->cleanProductName($name);
            
            // Adivinar Marca y Categoría
            $brandId = $this->guessBrand($cleanName, $brands);
            $categoryId = $this->guessCategory($cleanName, $categories);

            Producto::create([
                'nombre' => $cleanName,
                'precio' => $price,
                'id_marca' => $brandId,
                'id_categoria' => $categoryId,
                'descripcion' => 'Calidad Garantizada',
                'url_imagen' => 'placeholder.png',
                'stock' => 100, // Stock base para evitar 'Agotado' inicial
                'en_promocion' => false,
                'es_exclusivo' => $this->isExclusive($cleanName)
            ]);
            $count++;
        }

        // 2. Agregar productos especiales que podrían no estar en el TXT
        $especiales = [
            ['Aguardiente Rosado Especial Navidad 750ml', 'Aguardiente Rosado', 65000, 'Licores', true],
            ['Whisky Old Parr 750ml', 'Old Parr', 139800, 'Licores', true],
            ['Aguardiente Amarillo 750ml', 'Ag. Amarillo', 55500, 'Licores', true],
        ];

        foreach ($especiales as [$name, $brandName, $price, $catName, $exclusive]) {
            $product = Producto::where('nombre', $name)->first();
            if (!$product) {
                $marca = Marca::firstOrCreate(['nombre' => $brandName], ['nombre_marca' => $brandName]);
                $categoria = Categoria::firstOrCreate(['nombre' => $catName]);
                
                Producto::create([
                    'nombre' => $name,
                    'precio' => $price,
                    'id_marca' => $marca->id,
                    'id_categoria' => $categoria->id,
                    'descripcion' => 'Producto Premium Exclusivo',
                    'url_imagen' => 'placeholder.png',
                    'stock' => 100,
                    'en_promocion' => false,
                    'es_exclusivo' => $exclusive
                ]);
                $count++;
            }
        }

        $this->command->info("Sincronización Total Completada: $count productos procesados.");
    }

    private function cleanProductName($name) {
        $patterns = ['/\bBAVARIA\b/i', '/\bPOSTOBON\b/i', '/\bX\s*\d+\s*UND\b/i', '/\bUND\b/i', '/\bUNID\b/i'];
        $cleaned = preg_replace($patterns, '', $name);
        return trim(preg_replace('/\s+/', ' ', $cleaned));
    }

    private function guessBrand($name, $brands) {
        $nameUpper = strtoupper($name);
        if (Str::contains($nameUpper, ['POKER', 'AGUILA', 'CLUB', 'COSTEÑA', 'BUDWEISER', 'STELLA', 'CORONA', 'MODELO', 'BACANA'])) return $brands->firstWhere('nombre_marca', 'Bavaria')?->id ?? 1;
        if (Str::contains($nameUpper, ['COCA COLA', 'BRISA', 'QUATRO', 'SPRITE', 'POWERADE'])) return $brands->firstWhere('nombre_marca', 'Coca-Cola')?->id ?? 1;
        if (Str::contains($nameUpper, ['POSTOBON', 'GINGER', 'HIT', 'BRETAÑA', 'GATORADE'])) return $brands->firstWhere('nombre_marca', 'Postobón')?->id ?? 1;
        return 1;
    }

    private function guessCategory($name, $categories) {
        $nameUpper = strtoupper($name);
        if (Str::contains($nameUpper, ['AGUA', 'CRISTAL', 'BRISA', 'ZALVA'])) return $categories->firstWhere('nombre', 'Aguas')?->id;
        if (Str::contains($nameUpper, ['POKER', 'AGUILA', 'CLUB', 'CORONA', 'BUDWEISER'])) return $categories->firstWhere('nombre', 'Cervezas')?->id;
        if (Str::contains($nameUpper, ['COCA COLA', 'PEPSI', 'POSTOBON', 'SPRITE'])) return $categories->firstWhere('nombre', 'Gaseosas')?->id;
        if (Str::contains($nameUpper, ['RON', 'WHISKY', 'AGUARDIENTE', 'VODKA', 'OLDPAR'])) return $categories->firstWhere('nombre', 'Licores')?->id;
        return $categories->firstWhere('nombre', 'Gaseosas')?->id;
    }

    private function isExclusive($name) {
        return Str::contains(strtoupper($name), ['OLD PARR', 'OLDPAR', 'AMARILLO', 'ROSADO', 'BUCHANAN']);
    }
}
