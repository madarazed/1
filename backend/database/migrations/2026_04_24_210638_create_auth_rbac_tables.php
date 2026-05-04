<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Asegurar que roles tenga la estructura básica
        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('nombre')->unique();
                $table->timestamps();
            });
        }

        // 2. Asegurar que sucursales (sedes) tenga la estructura básica
        if (!Schema::hasTable('sucursales')) {
            Schema::create('sucursales', function (Blueprint $table) {
                $table->id();
                $table->string('nombre')->unique();
                $table->string('direccion')->nullable();
                $table->string('telefono')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('sucursales', function (Blueprint $table) {
                if (!Schema::hasColumn('sucursales', 'direccion')) {
                    $table->string('direccion')->nullable()->after('nombre');
                }
                if (!Schema::hasColumn('sucursales', 'telefono')) {
                    $table->string('telefono')->nullable()->after('direccion');
                }
            });
        }

        // 3. Modificar Tabla Users para id_sucursal_actual
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'id_sucursal_actual')) {
                $table->foreignId('id_sucursal_actual')->nullable()->constrained('sucursales')->nullOnDelete();
            }
        });

        // 4. Tabla Pivote Role-User (Para relación n:m solicitada)
        if (!Schema::hasTable('role_user')) {
            Schema::create('role_user', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('role_id')->constrained()->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('role_user');
        // No borramos roles ni sucursales por si tienen data legacy, 
        // solo revertimos la columna de users si es necesario.
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'id_sucursal_actual')) {
                $table->dropConstrainedForeignId('id_sucursal_actual');
            }
        });
    }
};
