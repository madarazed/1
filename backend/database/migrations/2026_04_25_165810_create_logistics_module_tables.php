<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabla Vehículos
        if (!Schema::hasTable('vehiculos')) {
            Schema::create('vehiculos', function (Blueprint $table) {
                $table->id();
                $table->string('placa')->unique();
                $table->string('marca');
                $table->string('modelo');
                $table->string('tipo_vehiculo'); // Moto, Camioneta, etc.
                $table->string('estado')->default('Activo'); // Activo, Taller, Inactivo
                $table->integer('kilometraje_actual');
                $table->date('fecha_soat');
                $table->date('fecha_tecnomecanica');
                $table->softDeletes();
                $table->timestamps();
            });
        }

        // 2. Tabla Checklists
        if (!Schema::hasTable('checklists')) {
            Schema::create('checklists', function (Blueprint $table) {
                $table->id();
                $table->foreignId('vehiculo_id')->constrained('vehiculos')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->date('fecha')->index();
                $table->string('estado_general'); // Bueno, Regular, Malo
                $table->text('observaciones')->nullable();
                
                // Usamos JSON para las 7 secciones: documentacion, llantas, chasis, electrico, motor, estructura, declaraciones
                $table->json('datos_checklist');
                
                $table->timestamps();
            });
        }

        // 3. Tabla Jornadas Laborales
        if (!Schema::hasTable('jornadas_laborales')) {
            Schema::create('jornadas_laborales', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('vehiculo_id')->nullable()->constrained('vehiculos')->onDelete('set null');
                $table->date('fecha')->index();
                $table->time('hora_inicio');
                $table->time('hora_fin')->nullable();
                $table->time('hora_almuerzo')->nullable(); // Duración o hora de inicio de almuerzo
                $table->decimal('total_horas', 5, 2)->default(0);
                $table->string('estado')->default('Iniciada'); // Iniciada, Pausada, Finalizada
                $table->timestamps();
            });
        }

        // 4. Tabla Novedades Logística
        if (!Schema::hasTable('novedades_logistica')) {
            Schema::create('novedades_logistica', function (Blueprint $table) {
                $table->id();
                $table->foreignId('checklist_id')->constrained('checklists')->onDelete('cascade');
                $table->text('descripcion');
                $table->string('tipo_novedad'); // Mecánica, Documentación, Estética, etc.
                $table->date('fecha_resolucion')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('novedades_logistica');
        Schema::dropIfExists('jornadas_laborales');
        Schema::dropIfExists('checklists');
        Schema::dropIfExists('vehiculos');
    }
};
