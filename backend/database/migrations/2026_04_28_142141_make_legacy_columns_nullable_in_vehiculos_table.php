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
            $table->string('capacidad')->nullable()->change();
            $table->foreignId('id_usuario_asignado')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehiculos', function (Blueprint $table) {
            $table->string('capacidad')->nullable(false)->change();
            $table->foreignId('id_usuario_asignado')->nullable(false)->change();
        });
    }
};
