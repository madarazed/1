<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ImportFromBackupSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data_export.json');
        if (!File::exists($jsonPath)) {
            $this->command->error("No se encontró data_export.json");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);
        if (!$data) {
            $this->command->error("Error leyendo JSON");
            return;
        }

        // 1. Limpieza total de tablas dependientes en PostgreSQL
        DB::statement('TRUNCATE TABLE productos, categorias, marcas RESTART IDENTITY CASCADE;');

        // 2. Restaurar Categorías con sus IDs originales
        if (isset($data['categorias'])) {
            foreach ($data['categorias'] as $cat) {
                DB::table('categorias')->updateOrInsert(
                    ['id' => $cat['id']],
                    [
                        'nombre'     => $cat['nombre'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        // 3. Restaurar Marcas con sus IDs originales
        if (isset($data['marcas'])) {
            foreach ($data['marcas'] as $marca) {
                DB::table('marcas')->updateOrInsert(
                    ['id' => $marca['id']],
                    [
                        'nombre'     => $marca['nombre'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        // 4. Restaurar los 907 Productos
        $productosList = $data['productos'] ?? [];
        $chunks = array_chunk($productosList, 100);

        foreach ($chunks as $chunk) {
            $insertData = [];
            foreach ($chunk as $p) {
                $filename = basename($p['url_imagen'] ?? '');
                $insertData[] = [
                    'id'                => $p['id'] ?? null,
                    'nombre'            => $p['nombre'],
                    'descripcion'       => $p['descripcion'] ?? 'Calidad Garantizada',
                    'precio'            => $p['precio'] ?? 0,
                    'stock'             => $p['stock'] ?? 100,
                    'id_marca'          => $p['id_marca'] ?? 1,
                    'id_categoria'      => $p['id_categoria'] ?? 1,
                    'url_imagen'        => $filename ?: 'placeholder.jpg',
                    'en_promocion'      => false,
                    'precio_oferta'     => null,
                    'fecha_fin_oferta'  => null,
                    'es_exclusivo'      => false, // Garantiza que NINGUNO quede oculto
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ];
            }
            DB::table('productos')->insert($insertData);
        }

        // Sincronizar secuencias de PostgreSQL para futuros inserts
        DB::statement("SELECT setval(pg_get_serial_sequence('productos', 'id'), coalesce(max(id), 1)) FROM productos;");
        DB::statement("SELECT setval(pg_get_serial_sequence('categorias', 'id'), coalesce(max(id), 1)) FROM categorias;");
        DB::statement("SELECT setval(pg_get_serial_sequence('marcas', 'id'), coalesce(max(id), 1)) FROM marcas;");

        $total = DB::table('productos')->count();
        $this->command->info("ÉXITO TOTAL: {$total} productos y sus categorías importados.");
    }
}
