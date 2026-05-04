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
        // Tabla para el stock actual por sede
        if (!Schema::hasTable('sucursal_producto')) {
            Schema::create('sucursal_producto', function (Blueprint $table) {
                $table->id();
                $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
                $table->foreignId('sucursal_id')->constrained('sucursales')->onDelete('cascade');
                $table->integer('stock')->default(0);
                $table->timestamps();
                
                $table->unique(['producto_id', 'sucursal_id']);
            });
        }

        // Tabla de historial como solicitó el usuario
        if (!Schema::hasTable('historial_inventario')) {
            Schema::create('historial_inventario', function (Blueprint $table) {
                $table->id();
                $table->foreignId('producto_id')->constrained('productos')->onDelete('cascade');
                $table->foreignId('sede_id')->constrained('sucursales')->onDelete('cascade'); // Cambiado a sede_id para coincidir con solicitud
                $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
                $table->integer('cantidad_cambiada');
                $table->string('tipo_movimiento'); // Entrada, Salida, Ajuste
                $table->text('motivo')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historial_inventario');
        Schema::dropIfExists('sucursal_producto');
    }
};
