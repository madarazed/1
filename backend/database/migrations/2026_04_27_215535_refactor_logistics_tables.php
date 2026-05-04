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
        Schema::table('vehiculos', function (Blueprint $table) {
            // Agregar columnas faltantes si no existen
            if (!Schema::hasColumn('vehiculos', 'kilometraje_actual')) {
                $table->integer('kilometraje_actual')->default(0)->after('modelo');
            }
            if (!Schema::hasColumn('vehiculos', 'fecha_soat')) {
                $table->date('fecha_soat')->nullable()->after('kilometraje_actual');
            }
            if (!Schema::hasColumn('vehiculos', 'fecha_tecnomecanica')) {
                $table->date('fecha_tecnomecanica')->nullable()->after('fecha_soat');
            }
            if (!Schema::hasColumn('vehiculos', 'estado')) {
                $table->string('estado')->default('Activo')->after('fecha_tecnomecanica');
            }

            // Columnas para la refactorización de logística
            $table->integer('frecuencia_mantenimiento')->default(5000)->after('kilometraje_actual');
            $table->integer('km_ultimo_mantenimiento')->default(0)->after('frecuencia_mantenimiento');
            $table->string('sede')->nullable()->after('estado'); // Centro, Salado, etc.
        });

        // Asegurar que novedades_logistica tenga lo necesario
        Schema::table('novedades_logistica', function (Blueprint $table) {
            if (!Schema::hasColumn('novedades_logistica', 'vehiculo_id')) {
                $table->foreignId('vehiculo_id')->nullable()->after('checklist_id')->constrained('vehiculos')->onDelete('cascade');
            }
            if (!Schema::hasColumn('novedades_logistica', 'prioridad')) {
                $table->enum('prioridad', ['baja', 'media', 'alta', 'critica'])->default('baja')->after('tipo_novedad');
            }
            if (!Schema::hasColumn('novedades_logistica', 'estado')) {
                $table->string('estado')->default('pendiente')->after('prioridad'); // pendiente, en_proceso, resuelta
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->dropColumn(['kilometraje_actual', 'fecha_soat', 'fecha_tecnomecanica', 'estado', 'frecuencia_mantenimiento', 'km_ultimo_mantenimiento', 'sede']);
        });

        Schema::table('novedades_logistica', function (Blueprint $table) {
            $table->dropConstrainedForeignId('vehiculo_id');
            $table->dropColumn(['prioridad', 'estado']);
        });
    }
};
