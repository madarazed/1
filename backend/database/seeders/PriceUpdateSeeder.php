<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PriceUpdateSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = storage_path('app/price_list.txt');
        if (!file_exists($filePath)) {
            $this->command->error("File not found: $filePath");
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        $brands = Marca::all();
        $categories = Categoria::all();

        foreach ($lines as $line) {
            if (!str_contains($line, ':')) continue;
            
            [$name, $price] = explode(':', $line);
            $name = trim($name);
            $price = floatval(str_replace(',', '', trim($price)));

            $product = Producto::where('nombre', $name)->first();

            if ($product) {
                $product->update(['precio' => $price]);
                $this->command->info("Updated: $name -> $price");
            } else {
                // Guess Brand
                $brandId = $this->guessBrand($name, $brands);
                // Guess Category
                $categoryId = $this->guessCategory($name, $categories);

                Producto::create([
                    'nombre' => $name,
                    'precio' => $price,
                    'id_marca' => $brandId,
                    'id_categoria' => $categoryId,
                    'descripcion' => 'Calidad Garantizada',
                    'url_imagen' => 'placeholder.png',
                    'stock' => 0,
                    'en_promocion' => false
                ]);
                $this->command->warn("Created: $name -> $price");
            }
        }
    }

    private function guessBrand($name, $brands)
    {
        $nameUpper = strtoupper($name);
        
        if (Str::contains($nameUpper, ['POKER', 'AGUILA', 'CLUB', 'COSTEÑA', 'COSTEÑITA', 'COLA Y POLA', 'REDDS', 'PONY MALTA', 'MALTA LEONA', 'BUDWEISER', 'STELLA', 'CORONA', 'MODELO', 'BACANA', 'BACANITA', 'CERO'])) {
            return $brands->firstWhere('nombre_marca', 'Bavaria')?->id ?? $brands->first()->id;
        }
        if (Str::contains($nameUpper, ['COCA COLA', 'BRISA', 'QUATRO', 'SPRITE', 'FUZE TEA', 'MANANTIAL', 'POWERADE', 'FLASHLYTE', 'VALLE'])) {
            return $brands->firstWhere('nombre_marca', 'Coca-Cola')?->id ?? $brands->first()->id;
        }
        if (Str::contains($nameUpper, ['POSTOBON', 'GINGER', 'HIT', 'MR TEA', 'BRETAÑA', 'H2O', 'TUTTI FRUTT', 'GATORADE', 'SQUASH'])) {
            return $brands->firstWhere('nombre_marca', 'Postobón')?->id ?? $brands->first()->id;
        }
        if (Str::contains($nameUpper, 'PEPSI')) {
            return $brands->firstWhere('nombre_marca', 'Pepsi')?->id ?? $brands->first()->id;
        }
        if (Str::contains($nameUpper, 'CRISTAL')) {
            return $brands->firstWhere('nombre_marca', 'Cristal')?->id ?? $brands->first()->id;
        }
        if (Str::contains($nameUpper, 'RED BULL')) {
            return Marca::firstOrCreate(['nombre' => 'Red Bull'], ['nombre_marca' => 'Red Bull'])->id;
        }
        if (Str::contains($nameUpper, 'GLACIAL')) {
            return Marca::firstOrCreate(['nombre' => 'Glacial'], ['nombre_marca' => 'Glacial'])->id;
        }
        
        return $brands->first()->id;
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
        if (Str::contains($nameUpper, ['OLDPAR', 'SOMETHING', 'AGUARDIENTE', 'RON', 'VODKA', 'WHISKY', 'JOSE CUERVO', 'SELLO ROJO', 'BLACK & WHITE', 'CHIVAS', 'BUCHANAN'])) {
            return $categories->firstWhere('nombre', 'Licores')?->id;
        }
        if (Str::contains($nameUpper, ['SODA', 'BRETAÑA', 'GINGER', 'SCHWEPPES', 'HATSU SODA'])) {
            return $categories->firstWhere('nombre', 'Sodas')?->id;
        }

        return $categories->firstWhere('nombre', 'Gaseosas')?->id; // Default
    }
}
