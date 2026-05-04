<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Marca;
use App\Models\Categoria;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        // Marcas reales para Rapifrios
        $marcas = [
            'Postobón', 'Coca-Cola', 'Bavaria', 'Pepsi', 'Nutresa', 
            'Colombina', 'Cerveza Corona', 'Heineken', 'Gatorade', 'Cristal'
        ];
        foreach ($marcas as $m) {
            Marca::firstOrCreate(['nombre' => $m], ['nombre_marca' => $m]);
        }

        // Categorías que coinciden con el Index/Landing
        $categorias = [
            'Aguas', 'Cervezas', 'Energizantes', 'Gaseosas', 
            'Hidratantes', 'Jugos', 'Licores', 'Sodas'
        ];
        foreach ($categorias as $c) {
            Categoria::firstOrCreate(['nombre' => $c]);
        }
    }
}
