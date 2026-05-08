<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;

class StockVipSeeder extends Seeder
{
    /**
     * Inserta productos exclusivos VIP.
     * Estos productos solo son visibles para clientes con acceso VIP.
     * No aparecen en el catálogo general (es_exclusivo = true).
     */
    public function run(): void
    {
        $categoriaLicores = Categoria::firstOrCreate(['nombre' => 'Licores']);

        $productosVip = [
            [
                'nombre'      => 'Whisky Old Parr 750ml',
                'marca'       => 'Old Parr',
                'precio'      => 139800,
                'descripcion' => 'El clásico escocés en botella especial. Exclusivo para clientes VIP.',
            ],
            [
                'nombre'      => 'Aguardiente Amarillo 750ml',
                'marca'       => 'Ag. Amarillo',
                'precio'      => 55500,
                'descripcion' => 'Sabor tradicional colombiano en edición exclusiva VIP.',
            ],
            [
                'nombre'      => "Whisky Buchanan's Deluxe 200ml",
                'marca'       => "Buchanan's",
                'precio'      => 43400,
                'descripcion' => 'Blended scotch whisky. Presentación ejecutiva exclusiva para VIP.',
            ],
            [
                'nombre'      => 'Ron Viejo de Caldas Gran Reserva 750ml',
                'marca'       => 'Ron Viejo de Caldas',
                'precio'      => 68900,
                'descripcion' => 'Gran reserva artesanal. Precio especial solo para clientes VIP.',
            ],
        ];

        foreach ($productosVip as $item) {
            $marca = Marca::firstOrCreate(['nombre' => $item['marca']]);

            // Usar updateOrCreate para evitar duplicados en re-despliegues
            Producto::updateOrCreate(
                [
                    'nombre'       => $item['nombre'],
                    'es_exclusivo' => true,
                ],
                [
                    'precio'      => $item['precio'],
                    'descripcion' => $item['descripcion'],
                    'id_marca'    => $marca->id,
                    'id_categoria'=> $categoriaLicores->id,
                    'url_imagen'  => 'placeholder.png',
                    'stock'       => 50,
                    'en_promocion'=> false,
                    'es_exclusivo'=> true,
                ]
            );
        }

        $this->command->info('StockVipSeeder: ' . count($productosVip) . ' productos VIP cargados correctamente.');
    }
}
