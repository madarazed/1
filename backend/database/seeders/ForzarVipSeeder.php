<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ForzarVipSeeder extends Seeder
{
    /**
     * Inserta el producto VIP de emergencia directamente via DB para evitar
     * cualquier problema con modelos o relaciones.
     */
    public function run(): void
    {
        // Buscar o crear la marca "Old Parr"
        $marcaId = DB::table('marcas')->where('nombre', 'Old Parr')->value('id');
        if (!$marcaId) {
            $marcaId = DB::table('marcas')->insertGetId([
                'nombre'     => 'Old Parr',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Buscar o crear la categoría "Licores"
        $catId = DB::table('categorias')->where('nombre', 'Licores')->value('id');
        if (!$catId) {
            $catId = DB::table('categorias')->insertGetId([
                'nombre'     => 'Licores',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Insertar el producto VIP de emergencia si no existe
        $existe = DB::table('productos')
            ->where('nombre', 'WHISKY OLD PARR 750 ML')
            ->where('es_exclusivo', true)
            ->exists();

        if (!$existe) {
            DB::table('productos')->insert([
                'nombre'       => 'WHISKY OLD PARR 750 ML',
                'descripcion'  => 'Edición exclusiva VIP. Acceso restringido a clientes registrados.',
                'precio'       => 139800,
                'stock'        => 50,
                'id_marca'     => $marcaId,
                'id_categoria' => $catId,
                'url_imagen'   => 'placeholder.png',
                'es_exclusivo' => true,
                'en_promocion' => false,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
            $this->command->info('ForzarVipSeeder: WHISKY OLD PARR 750 ML insertado correctamente.');
        } else {
            $this->command->info('ForzarVipSeeder: El producto VIP ya existe, se omite la inserción.');
        }
    }
}
