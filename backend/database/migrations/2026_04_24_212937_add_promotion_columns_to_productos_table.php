<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->boolean('en_promocion')->default(false)->after('id_categoria');
            $table->decimal('precio_oferta', 10, 2)->nullable()->after('en_promocion');
            $table->date('fecha_fin_oferta')->nullable()->after('precio_oferta');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn(['en_promocion', 'precio_oferta', 'fecha_fin_oferta']);
        });
    }
};
