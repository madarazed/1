<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PriceCleanupSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = storage_path('app/price_cleanup.txt');
        if (!file_exists($filePath)) {
            $this->command->error("File not found: $filePath");
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        $categories = Categoria::all();
        $defaultCategory = $categories->firstWhere('nombre', 'Gaseosas') ?? $categories->first();

        $keptIds = [];
        $createdCount = 0;
        $updatedCount = 0;

        // Step 1: Process the target list and find/create the "best" product for each line
        foreach ($lines as $line) {
            if (!str_contains($line, '|')) continue;
            
            $parts = explode('|', $line);
            if (count($parts) < 3) continue;

            $name = trim($parts[0]);
            $brandName = trim($parts[1]);
            $priceRaw = trim($parts[2]);
            $price = floatval(str_replace(',', '', $priceRaw));

            // Ensure brand exists
            $marca = Marca::firstOrCreate(
                ['nombre' => $brandName],
                ['nombre_marca' => $brandName]
            );

            // Find all existing products with the EXACT SAME NAME
            // Including soft deleted ones just in case? No, only non-deleted.
            $existingProducts = Producto::where('nombre', $name)->get();

            if ($existingProducts->isEmpty()) {
                // Completely new, never existed
                $newProd = Producto::create([
                    'nombre' => $name,
                    'precio' => $price,
                    'id_marca' => $marca->id,
                    'id_categoria' => $this->guessCategory($name, $categories) ?? $defaultCategory->id,
                    'descripcion' => 'Calidad Garantizada',
                    'url_imagen' => 'placeholder.png',
                    'stock' => 100,
                    'en_promocion' => false
                ]);
                $keptIds[] = $newProd->id;
                $createdCount++;
                $this->command->line("Created: {$name}");
            } else {
                // Exists (could be 1 or multiple due to duplicates from previous imports)
                // We want to KEEP the "best" one.
                // Best = has a real image, or if none do, the one that already has the correct brand, or just the first one.
                
                $bestProduct = null;
                
                // Try to find one with a real image
                foreach ($existingProducts as $p) {
                    if ($p->url_imagen && $p->url_imagen !== 'placeholder.png' && $p->url_imagen !== 'placeholder.jpg') {
                        $bestProduct = $p;
                        break;
                    }
                }
                
                // If no real image, prefer one that already has the exact brand ID
                if (!$bestProduct) {
                    $bestProduct = $existingProducts->firstWhere('id_marca', $marca->id);
                }
                
                // Fallback to the first one found
                if (!$bestProduct) {
                    $bestProduct = $existingProducts->first();
                }

                // Update the best product with the correct brand and price (if needed)
                if ($bestProduct->id_marca !== $marca->id || $bestProduct->precio != $price) {
                    $bestProduct->update([
                        'id_marca' => $marca->id,
                        'precio' => $price
                    ]);
                    $updatedCount++;
                }

                $keptIds[] = $bestProduct->id;
                
                // Soft delete the other duplicates
                foreach ($existingProducts as $p) {
                    if ($p->id !== $bestProduct->id) {
                        $p->delete();
                    }
                }
            }
        }

        // Step 2: Delete ANY product whose ID is NOT in the $keptIds array
        // This ensures ONLY the products from the prompt remain.
        $deletedCount = Producto::whereNotIn('id', $keptIds)->delete();

        $this->command->info("Cleanup Complete!");
        $this->command->info("Created: $createdCount | Updated/Kept: " . count($keptIds) . " | Deleted: $deletedCount");
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
