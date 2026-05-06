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

        // Desactivar temporalmente validaciones de llaves foráneas en PostgreSQL
        DB::statement('SET session_replication_role = replica;');

        foreach ($data as $table => $rows) {
            $this->info("Importando tabla: $table...");
            
            // Vaciar la tabla primero
            DB::table($table)->truncate();

            if (empty($rows)) continue;

            $chunks = array_chunk($rows, 100);
            foreach ($chunks as $chunk) {
                // Convertir booleanos de MySQL (0/1) a PostgreSQL (false/true)
                foreach ($chunk as &$row) {
                    foreach ($row as $key => $val) {
                        // Cuidado con los tipos booleanos que MySQL exporta como strings o enteros
                        if ($val === "1" && in_array($key, ['en_promocion', 'activa', 'status'])) $row[$key] = true;
                        if ($val === "0" && in_array($key, ['en_promocion', 'activa', 'status'])) $row[$key] = false;
                        if ($val === 1 && in_array($key, ['en_promocion', 'activa', 'status'])) $row[$key] = true;
                        if ($val === 0 && in_array($key, ['en_promocion', 'activa', 'status'])) $row[$key] = false;
                    }
                }
                DB::table($table)->insert($chunk);
            }

            // Actualizar la secuencia de auto-incremento para PostgreSQL
            try {
                DB::statement("SELECT setval('{$table}_id_seq', COALESCE((SELECT MAX(id)+1 FROM {$table}), 1), false)");
            } catch (\Exception $e) {
                // Ignorar si la tabla no tiene secuencia (ej. tablas pivote)
            }
        }

        // Reactivar llaves foráneas
        DB::statement('SET session_replication_role = DEFAULT;');
        
        $this->info("¡Importación finalizada con éxito!");
    }
}
