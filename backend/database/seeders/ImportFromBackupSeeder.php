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

        // Garantizar marcas y categorías base
        $defaultMarca = Marca::firstOrCreate(['nombre' => 'General']);
        $defaultCat = Categoria::firstOrCreate(['nombre' => 'General']);

        $count = 0;
        foreach ($data['productos'] as $item) {
            $filename = basename($item['url_imagen'] ?? '');

            // Validar que la marca y categoría existan o asignar la predeterminada
            $marcaId = isset($item['id_marca']) && Marca::where('id', $item['id_marca'])->exists()
                ? $item['id_marca']
                : $defaultMarca->id;

            $categoriaId = isset($item['id_categoria']) && Categoria::where('id', $item['id_categoria'])->exists()
                ? $item['id_categoria']
                : $defaultCat->id;

            Producto::create([
                'nombre'       => $item['nombre'],
                'precio'       => $item['precio'],
                'id_marca'     => $marcaId,
                'id_categoria' => $categoriaId,
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
