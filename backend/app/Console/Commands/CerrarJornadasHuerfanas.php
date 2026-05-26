<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\JornadaLaboral;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CerrarJornadasHuerfanas extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logistica:cerrar-jornadas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cierra forzosamente las jornadas logísticas que quedaron abiertas (huérfanas) al finalizar el día.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hoy = Carbon::today()->toDateString();
        
        // Buscar jornadas iniciadas pero no finalizadas de hoy o antes
        $jornadas = JornadaLaboral::where('estado', '!=', 'Finalizada')
            ->where('fecha', '<=', $hoy)
            ->get();

        $count = 0;

        \Illuminate\Support\Facades\DB::transaction(function () use ($jornadas, &$count) {
            foreach ($jornadas as $jornada) {
                $jornada->hora_fin = Carbon::now()->toTimeString();
                $jornada->estado = 'Finalizada'; 
                
                // Si el km final es obligatorio, asumimos el mismo km_inicial o 0 si no hay
                if (!$jornada->km_final) {
                    $jornada->km_final = $jornada->km_inicial ?? 0;
                }

                $jornada->calcularHoras();
                $jornada->save();
                $count++;
            }
        });

        Log::info("Escuadrón de Limpieza (Cron): Se han cerrado forzosamente {$count} jornadas huérfanas.");
        
        $this->info("Se han cerrado forzosamente {$count} jornadas huérfanas.");
    }
}
