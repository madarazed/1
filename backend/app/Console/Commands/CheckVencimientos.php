<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vehiculo;
use App\Models\User;
use App\Models\Checklist;
use App\Models\Notificacion;
use Carbon\Carbon;

class CheckVencimientos extends Command
{
    protected $signature = 'check:vencimientos';
    protected $description = 'Verifica vencimientos de documentos y checklists diarios';

    public function handle()
    {
        $this->info('Iniciando verificación de vencimientos...');

        // 1. Verificar SOAT y Tecno (< 10 días)
        $limite = Carbon::now()->addDays(10);
        $vehiculosVencidos = Vehiculo::where('fecha_soat', '<=', $limite)
            ->orWhere('fecha_tecnomecanica', '<=', $limite)
            ->get();

        $admin = User::whereHas('roles', function($q) {
            $q->where('name', 'Superadmin');
        })->first();

        if ($admin) {
            foreach ($vehiculosVencidos as $v) {
                $mensaje = "El vehículo {$v->placa} tiene documentos próximos a vencer (SOAT: {$v->fecha_soat}, Tecno: {$v->fecha_tecnomecanica})";
                
                Notificacion::updateOrCreate([
                    'user_id' => $admin->id,
                    'titulo' => 'Vencimiento de Documentos',
                    'mensaje' => $mensaje,
                    'tipo' => 'Documentos',
                    'leido' => false
                ]);
            }
        }

        // 2. Verificar Checklists (9:15 AM)
        // Nota: En un entorno real, esto se filtraría por la hora actual. 
        // Aquí implementamos la lógica de detección.
        $hoy = Carbon::today();
        $repartidores = User::whereHas('roles', function($q) {
            $q->where('name', 'Repartidor');
        })->get();

        $pendientes = [];
        foreach ($repartidores as $r) {
            $hizoChecklist = Checklist::where('user_id', $r->id)
                ->whereDate('fecha', $hoy)
                ->exists();
            
            if (!$hizoChecklist) {
                $pendientes[] = $r->name;
            }
        }

        if (count($pendientes) > 0 && $admin) {
            $lista = implode(', ', $pendientes);
            Notificacion::create([
                'user_id' => $admin->id,
                'titulo' => 'Checklist Pendiente',
                'mensaje' => "Los siguientes repartidores no han realizado el checklist hoy: {$lista}",
                'tipo' => 'Logística',
                'leido' => false
            ]);
        }

        $this->info('Verificación completada.');
    }
}
