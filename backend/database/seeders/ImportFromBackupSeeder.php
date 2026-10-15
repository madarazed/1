<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\File;

class ImportFromBackupSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('data_export.json');
        if (!File::exists($jsonPath)) {
            $this->command->error("No se encontró data_export.json en database/");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);
        if (!$data || !isset($data['productos'])) {
            $this->command->error("Formato inválido en data_export.json");
            return;
        }

        Schema::disableForeignKeyConstraints();

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('TRUNCATE TABLE productos RESTART IDENTITY CASCADE;');
        } else {
            Producto::truncate();
        }

        Schema::enableForeignKeyConstraints();

        $count = 0;
        foreach ($data['productos'] as $item) {
            // Extrae solo el nombre del archivo (ej: 1778706175_CORONA...jpg)
            $filename = basename($item['url_imagen'] ?? '');

            Producto::create([
                'nombre'       => $item['nombre'],
                'precio'       => $item['precio'],
                'id_marca'     => $item['id_marca'] ?? 1,
                'id_categoria' => $item['id_categoria'] ?? 1,
                'descripcion'  => $item['descripcion'] ?? 'Calidad Garantizada',
                'url_imagen'   => $filename ?: 'placeholder.jpg',
                'stock'        => $item['stock'] ?? 100,
                'en_promocion' => $item['en_promocion'] ?? false,
                'es_exclusivo' => $item['es_exclusivo'] ?? false,
            ]);
            $count++;
        }

        $this->command->info("Restaurados {$count} productos con sus nombres de imagen reales.");
    }
}
