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
        Schema::table('vehiculos', function (Blueprint $col) {
            $col->enum('tipo_vehiculo', ['moto', 'carro', 'camion'])->default('moto')->after('modelo');
            $col->decimal('capacidad_carga', 10, 2)->nullable()->after('tipo_vehiculo')->comment('Capacidad en KG');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehiculos', function (Blueprint $col) {
            $col->dropColumn(['tipo_vehiculo', 'capacidad_carga']);
        });
    }
};
