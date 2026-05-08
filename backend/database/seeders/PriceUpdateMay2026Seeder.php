<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;

class PriceUpdateMay2026Seeder extends Seeder
{
    public function run(): void
    {
        $prices = [
            // Cervezas y Maltas
            ['Michelob Ultra Botella 330ml', 'Michelob Ultra', 2891, 'Cervezas'],
            ['Michelob Ultra Lata 269ml', 'Michelob Ultra', 2243, 'Cervezas'],
            ['Corona Extra Lata 269ml', 'Corona', 2852, 'Cervezas'],
            ['Corona 330ml NR', 'Corona', 3687, 'Cervezas'],
            ['Pony Malta 330ml Botella', 'Pony Malta', 2123, 'Cervezas'],
            ['Poker Lata 269ml', 'Poker', 2018, 'Cervezas'],
            
            // Licores y Larga Duración
            ['Whisky Old Parr 750ml', 'Old Parr', 139800, 'Licores'],
            ['Aguardiente Amarillo 750ml', 'Ag. Amarillo', 55500, 'Licores'],
            ['Aguardiente Tapa Roja Trad. 750ml', 'Ag. Nectar', 47800, 'Licores'],
            ['Ron Viejo de Caldas 750cc', 'Ron Viejo de Caldas', 54300, 'Licores'],
            
            // No Alcohólicas
            ['Coca Cola 1.5L', 'Coca-Cola', 5417, 'Gaseosas'],
            ['Pepsi 1.5L', 'Pepsi', 3750, 'Gaseosas'],
            ['Agua Cristal 600ml', 'Cristal', 1333, 'Aguas'],
        ];

        foreach ($prices as [$name, $brandName, $price, $categoryName]) {
            // Find or create Marca
            $marca = Marca::where('nombre', $brandName)
                        ->orWhere('nombre_marca', $brandName)
                        ->first();
            
            if (!$marca) {
                $marca = Marca::create(['nombre' => $brandName, 'nombre_marca' => $brandName]);
            }

            // Find or create Category
            $category = Categoria::where('nombre', $categoryName)->first();
            if (!$category) {
                $category = Categoria::create(['nombre' => $categoryName]);
            }

            // Find product by name (trying exact match first)
            $product = Producto::where('nombre', $name)->first();

            // If not found exactly, try a broader search but only if it's unique-ish
            if (!$product) {
                $product = Producto::where('nombre', 'like', "%$name%")->first();
            }

            if ($product) {
                $product->update([
                    'precio' => $price,
                    'id_marca' => $marca->id,
                    'id_categoria' => $category->id
                ]);
                $this->command->info("Actualizado: $name -> $price");
            } else {
                // If still not found, create it
                Producto::create([
                    'nombre' => $name,
                    'precio' => $price,
                    'id_marca' => $marca->id,
                    'id_categoria' => $category->id,
                    'descripcion' => 'Calidad Garantizada',
                    'url_imagen' => 'placeholder.png',
                    'stock' => 100,
                    'en_promocion' => false
                ]);
                $this->command->warn("Creado Nuevo: $name -> $price");
            }
        }
        
        $this->command->info("Sincronización de precios de Mayo 2026 completada.");
    }
}
