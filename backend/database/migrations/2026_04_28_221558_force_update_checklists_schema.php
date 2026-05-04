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
        Schema::table('checklists', function (Blueprint $table) {
            // Eliminar viejas si existen
            if (Schema::hasColumn('checklists', 'id_turno')) {
                $table->dropForeign(['id_turno']);
                $table->dropColumn('id_turno');
            }
            
            // Agregar nuevas si no existen
            if (!Schema::hasColumn('checklists', 'vehiculo_id')) {
                $table->foreignId('vehiculo_id')->constrained('vehiculos')->onDelete('cascade');
            }
            if (!Schema::hasColumn('checklists', 'user_id')) {
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('checklists', 'estado_general')) {
                $table->string('estado_general')->default('Bueno');
            }
            if (!Schema::hasColumn('checklists', 'observaciones')) {
                $table->text('observaciones')->nullable();
            }
            if (!Schema::hasColumn('checklists', 'datos_checklist')) {
                $table->json('datos_checklist')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('checklists', function (Blueprint $table) {
            // En caso de rollback, podrías revertir esto (simplificado)
            $table->dropConstrainedForeignId('vehiculo_id');
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['estado_general', 'observaciones', 'datos_checklist']);
            $table->integer('id_turno')->nullable();
        });
    }
};
