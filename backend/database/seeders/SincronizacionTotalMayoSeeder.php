<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SincronizacionTotalMayoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Limpieza Total compatible con PostgreSQL y MySQL
        Schema::disableForeignKeyConstraints();

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('TRUNCATE TABLE productos, sucursal_producto, historial_inventario RESTART IDENTITY CASCADE;');
        } else {
            Producto::truncate();
            DB::table('sucursal_producto')->truncate();
            DB::table('historial_inventario')->truncate();
        }

        Schema::enableForeignKeyConstraints();

        // 2. Crear Marcas Base usando únicamente la columna 'nombre'
        $marcasData = ['Bavaria', 'Coca-Cola', 'Postobón', 'Aguardiente Rosado', 'Old Parr', 'Ag. Amarillo', 'Nacional'];
        foreach ($marcasData as $nombreMarca) {
            Marca::firstOrCreate(['nombre' => $nombreMarca]);
        }

        // 3. Crear Categorías Base
        $categoriasData = ['Cervezas', 'Gaseosas', 'Aguas', 'Licores', 'Snacks'];
        foreach ($categoriasData as $nombreCat) {
            Categoria::firstOrCreate(['nombre' => $nombreCat]);
        }

        $brands = Marca::all();
        $categories = Categoria::all();

        $count = 0;

        // 4. Catálogo esencial en memoria si no existe price_list.txt
        $filePath = storage_path('app/price_list.txt');
        $items = [];

        if (file_exists($filePath)) {
            $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (str_contains($line, ':')) {
                    [$name, $price] = explode(':', $line);
                    $items[] = [
                        'name' => trim($name),
                        'price' => floatval(str_replace(',', '', trim($price)))
                    ];
                }
            }
        } else {
            $items = [
                ['name' => 'Cerveza Poker 330ml', 'price' => 2800],
                ['name' => 'Cerveza Aguila Original 330ml', 'price' => 2800],
                ['name' => 'Cerveza Club Colombia Dorada 330ml', 'price' => 3500],
                ['name' => 'Cerveza Corona 355ml', 'price' => 4500],
                ['name' => 'Coca-Cola Sabor Original 1.5L', 'price' => 5000],
                ['name' => 'Coca-Cola 400ml', 'price' => 2500],
                ['name' => 'Gaseosa Postobón Manzana 1.5L', 'price' => 4500],
                ['name' => 'Agua Cristal Sin Gas 600ml', 'price' => 1800],
                ['name' => 'Agua Brisa con Gas 600ml', 'price' => 2000],
                ['name' => 'Aguardiente Amarillo 750ml', 'price' => 55500],
                ['name' => 'Whisky Old Parr 750ml', 'price' => 139800],
                ['name' => 'Aguardiente Rosado Especial Navidad 750ml', 'price' => 65000],
            ];
        }

        foreach ($items as $item) {
            $cleanName = $this->cleanProductName($item['name']);
            $brandId = $this->guessBrand($cleanName, $brands);
            $categoryId = $this->guessCategory($cleanName, $categories);

            Producto::create([
                'nombre' => $cleanName,
                'precio' => $item['price'],
                'id_marca' => $brandId,
                'id_categoria' => $categoryId,
                'descripcion' => 'Calidad Garantizada',
                'url_imagen' => 'placeholder.png',
                'stock' => 100,
                'en_promocion' => false,
                'es_exclusivo' => $this->isExclusive($cleanName)
            ]);
            $count++;
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
        if (Str::contains($nameUpper, ['POKER', 'AGUILA', 'CLUB', 'COSTEÑA', 'BUDWEISER', 'STELLA', 'CORONA', 'MODELO', 'BACANA'])) return $brands->firstWhere('nombre', 'Bavaria')?->id ?? $brands->first()?->id ?? 1;
        if (Str::contains($nameUpper, ['COCA COLA', 'BRISA', 'QUATRO', 'SPRITE', 'POWERADE'])) return $brands->firstWhere('nombre', 'Coca-Cola')?->id ?? $brands->first()?->id ?? 1;
        if (Str::contains($nameUpper, ['POSTOBON', 'GINGER', 'HIT', 'BRETAÑA', 'GATORADE'])) return $brands->firstWhere('nombre', 'Postobón')?->id ?? $brands->first()?->id ?? 1;
        if (Str::contains($nameUpper, ['AMARILLO'])) return $brands->firstWhere('nombre', 'Ag. Amarillo')?->id ?? 1;
        if (Str::contains($nameUpper, ['ROSADO'])) return $brands->firstWhere('nombre', 'Aguardiente Rosado')?->id ?? 1;
        if (Str::contains($nameUpper, ['OLD PARR', 'OLDPAR'])) return $brands->firstWhere('nombre', 'Old Parr')?->id ?? 1;
        return $brands->first()?->id ?? 1;
    }

    private function guessCategory($name, $categories) {
        $nameUpper = strtoupper($name);
        if (Str::contains($nameUpper, ['AGUA', 'CRISTAL', 'BRISA', 'ZALVA'])) return $categories->firstWhere('nombre', 'Aguas')?->id ?? 1;
        if (Str::contains($nameUpper, ['POKER', 'AGUILA', 'CLUB', 'CORONA', 'BUDWEISER'])) return $categories->firstWhere('nombre', 'Cervezas')?->id ?? 1;
        if (Str::contains($nameUpper, ['COCA COLA', 'PEPSI', 'POSTOBON', 'SPRITE'])) return $categories->firstWhere('nombre', 'Gaseosas')?->id ?? 1;
        if (Str::contains($nameUpper, ['RON', 'WHISKY', 'AGUARDIENTE', 'VODKA', 'OLDPAR', 'AMARILLO', 'ROSADO'])) return $categories->firstWhere('nombre', 'Licores')?->id ?? 1;
        return $categories->firstWhere('nombre', 'Gaseosas')?->id ?? 1;
    }

    private function isExclusive($name) {
        return Str::contains(strtoupper($name), ['OLD PARR', 'OLDPAR', 'AMARILLO', 'ROSADO', 'BUCHANAN']);
    }
}
