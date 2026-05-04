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
        Schema::table('users', function (Blueprint $table) {
            $table->string('telefono')->after('cedula');
            $table->text('direccion')->after('telefono');
            $table->string('dia_descanso')->nullable()->after('direccion');
            $table->enum('estado', ['activo', 'inactivo'])->default('activo')->after('dia_descanso');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
