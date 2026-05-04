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
        Schema::dropIfExists('nomina'); // Drop legacy table if exists
        Schema::dropIfExists('nominas');

        Schema::create('nominas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('periodo'); // ej. '2026-05'
            $table->integer('dias_trabajados');
            
            // Devengados
            $table->decimal('salario_base', 12, 2);
            $table->decimal('auxilio_transporte', 12, 2);
            $table->decimal('horas_extra', 12, 2)->default(0);
            $table->decimal('bonificaciones', 12, 2)->default(0);
            
            // Deducciones
            $table->decimal('salud', 12, 2); // 4%
            $table->decimal('pension', 12, 2); // 4%
            $table->decimal('otras_deducciones', 12, 2)->default(0);
            
            // Totales
            $table->decimal('total_devengado', 12, 2);
            $table->decimal('total_deducciones', 12, 2);
            $table->decimal('neto_pagar', 12, 2);
            
            $table->string('estado')->default('Borrador'); // Borrador, Pagado
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominas');
    }
};
