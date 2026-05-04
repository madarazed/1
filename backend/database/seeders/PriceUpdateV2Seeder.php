<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PriceUpdateV2Seeder extends Seeder
{
    public function run(): void
    {
        $filePath = storage_path('app/price_update_v2.txt');
        if (!file_exists($filePath)) {
            $this->command->error("File not found: $filePath");
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        $categories = Categoria::all();
        $defaultCategory = $categories->firstWhere('nombre', 'Gaseosas') ?? $categories->first();

        $updatedCount = 0;
        $createdCount = 0;

        foreach ($lines as $line) {
            if (!str_contains($line, '|')) continue;
            
            $parts = explode('|', $line);
            if (count($parts) < 3) continue;

            $name = trim($parts[0]);
            $brandName = trim($parts[1]);
            $priceRaw = trim($parts[2]);
            $price = floatval(str_replace(',', '', $priceRaw));

            // Find or create the Marca
            $marca = Marca::firstOrCreate(
                ['nombre' => $brandName],
                ['nombre_marca' => $brandName]
            );

            // Find the Product by exact name AND brand
            $product = Producto::where('nombre', $name)
                               ->where('id_marca', $marca->id)
                               ->first();

            if ($product) {
                // If found, update price ONLY IF DIFFERENT
                if ($product->precio != $price) {
                    $product->update(['precio' => $price]);
                    $this->command->info("Updated Price: {$name} | {$brandName} -> {$price}");
                    $updatedCount++;
                } else {
                    $this->command->line("Skipped (Same Price): {$name}");
                }
            } else {
                // Not found (name + brand combination), create new
                Producto::create([
                    'nombre' => $name,
                    'precio' => $price,
                    'id_marca' => $marca->id,
                    'id_categoria' => $this->guessCategory($name, $categories) ?? $defaultCategory->id,
                    'descripcion' => 'Calidad Garantizada',
                    'url_imagen' => 'placeholder.png', // Or null depending on schema, placeholder.png was used before
                    'stock' => 100, // From previous instructions, set stock to avoid 'Agotado'
                    'en_promocion' => false
                ]);
                $this->command->warn("Created New: {$name} | {$brandName} -> {$price}");
                $createdCount++;
            }
        }

        $this->command->info("Process Finished. Updated: $updatedCount | Created: $createdCount");
    }

    private function guessCategory($name, $categories)
    {
        $nameUpper = strtoupper($name);

        if (Str::contains($nameUpper, ['AGUA', 'CRISTAL', 'BRISA', 'GLACIAL', 'MANANTIAL', 'ZALVA', 'BLESS', 'BOTELLON'])) {
            return $categories->firstWhere('nombre', 'Aguas')?->id;
        }
        if (Str::contains($nameUpper, ['POKER', 'AGUILA', 'CLUB', 'COSTEÑA', 'COSTEÑITA', 'BUDWEISER', 'STELLA', 'CORONA', 'MODELO', 'BACANA', 'BACANITA'])) {
            return $categories->firstWhere('nombre', 'Cervezas')?->id;
        }
        if (Str::contains($nameUpper, ['VIVE 100', 'SPEED', 'AMPER', 'RED BULL', 'MONSTER'])) {
            return $categories->firstWhere('nombre', 'Energizantes')?->id;
        }
        if (Str::contains($nameUpper, ['COCA COLA', 'PEPSI', 'POSTOBON', 'QUATRO', 'SPRITE', 'KOLA ROMAN', 'BIG COLA', 'TROPIKOLA'])) {
            return $categories->firstWhere('nombre', 'Gaseosas')?->id;
        }
        if (Str::contains($nameUpper, ['GATORADE', 'POWERADE', 'SPORADE', 'SQUASH', 'ELECTROLIT', 'HIDRALYTE', 'FLASHLYTE'])) {
            return $categories->firstWhere('nombre', 'Hidratantes')?->id;
        }
        if (Str::contains($nameUpper, ['HIT', 'VALLE', 'TUTTI FRUTT', 'CIFRUT', 'PULP'])) {
            return $categories->firstWhere('nombre', 'Jugos')?->id;
        }
        if (Str::contains($nameUpper, ['OLDPAR', 'SOMETHING', 'AGUARDIENTE', 'RON', 'VODKA', 'WHISKY', 'JOSE CUERVO', 'SELLO ROJO', 'BLACK & WHITE', 'CHIVAS', 'BUCHANAN', 'BALLANTINE'])) {
            return $categories->firstWhere('nombre', 'Licores')?->id;
        }
        if (Str::contains($nameUpper, ['SODA', 'BRETAÑA', 'GINGER', 'SCHWEPPES', 'HATSU SODA'])) {
            return $categories->firstWhere('nombre', 'Sodas')?->id;
        }

        return null;
    }
}
