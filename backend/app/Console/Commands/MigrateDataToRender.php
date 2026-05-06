<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class MigrateDataToRender extends Command
{
    protected $signature = 'data:sync {action}';
    protected $description = 'Sync data between environments (export/import)';

    public function handle()
    {
        $action = $this->argument('action');

        if ($action === 'export') {
            $this->exportData();
        } elseif ($action === 'import') {
            $this->importData();
        } else {
            $this->error("Acción inválida. Usa 'export' o 'import'.");
        }
    }

    private function exportData()
    {
        // Ignorar tablas del sistema
        $ignoredTables = ['migrations', 'personal_access_tokens', 'failed_jobs', 'password_reset_tokens'];
        
        $tables = array_map('current', DB::select('SHOW TABLES'));
        $data = [];

        foreach ($tables as $table) {
            if (in_array($table, $ignoredTables)) continue;
            $data[$table] = DB::table($table)->get()->toArray();
        }

        File::put(database_path('data_export.json'), json_encode($data, JSON_PRETTY_PRINT));
        $this->info("¡Datos exportados con éxito a database/data_export.json!");
    }

    private function importData()
    {
        $file = database_path('data_export.json');
        if (!File::exists($file)) {
            $this->error("No se encontró el archivo data_export.json");
            return;
        }

        $data = json_decode(File::get($file), true);

        // Orden estricto para evitar errores de llaves foráneas al insertar
        $order = [
            'sucursales', 'marcas', 'categorias', 
            'permissions', 'roles', 'role_has_permissions', 
            'users', 'model_has_roles', 'model_has_permissions',
            'productos', 'promociones',
            'vehiculos', 'jornadas', 'checklists', 'nominas'
        ];

        // Ordenar las tablas según el arreglo de arriba, las que no estén van al final
        uksort($data, function($a, $b) use ($order) {
            $posA = array_search($a, $order);
            $posB = array_search($b, $order);
            if ($posA === false) $posA = 999;
            if ($posB === false) $posB = 999;
            return $posA <=> $posB;
        });

        // 1. Vaciar TODAS las tablas primero usando CASCADE para evitar bloqueos
        foreach ($data as $table => $rows) {
            try {
                DB::statement("TRUNCATE TABLE {$table} CASCADE;");
            } catch (\Exception $e) {
                // Si falla (ej. tabla no existe), no detener todo
            }
        }

        // 2. Insertar los datos en el orden correcto
        foreach ($data as $table => $rows) {
            $this->info("Importando tabla: $table...");
            if (empty($rows)) continue;

            // Obtener las columnas que REALMENTE existen en la base de datos de producción
            $validColumns = \Illuminate\Support\Facades\Schema::getColumnListing($table);
            if (empty($validColumns)) continue;
            
            $validColumnsFlip = array_flip($validColumns);

            $chunks = array_chunk($rows, 100);
            foreach ($chunks as $chunk) {
                $cleanChunk = [];
                // Convertir booleanos y limpiar columnas inexistentes
                foreach ($chunk as $row) {
                    // Filtrar solo las columnas válidas
                    $cleanRow = array_intersect_key($row, $validColumnsFlip);
                    
                    foreach ($cleanRow as $key => &$val) {
                        if ($val === "1" && in_array($key, ['en_promocion', 'activa', 'status'])) $val = true;
                        if ($val === "0" && in_array($key, ['en_promocion', 'activa', 'status'])) $val = false;
                        if ($val === 1 && in_array($key, ['en_promocion', 'activa', 'status'])) $val = true;
                        if ($val === 0 && in_array($key, ['en_promocion', 'activa', 'status'])) $val = false;

                        // Sanitizar Foreign Keys inválidas (ej. MySQL permite 0, pero PostgreSQL no)
                        if ($table === 'productos' && in_array($key, ['id_categoria', 'id_marca']) && $val == 0) {
                            $val = 1; // Asignar al ID 1 por defecto
                        }
                    }
                    $cleanChunk[] = $cleanRow;
                }
                DB::table($table)->insert($cleanChunk);
            }

            // Actualizar la secuencia de auto-incremento para PostgreSQL
            try {
                DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id)+1 FROM {$table}), 1), false)");
            } catch (\Exception $e) {
                // Ignorar si la tabla no tiene secuencia
            }
        }

        $this->info("¡Importación finalizada con éxito!");
    }
}
