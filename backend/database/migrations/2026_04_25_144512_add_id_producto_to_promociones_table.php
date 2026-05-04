<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promociones', function (Blueprint $table) {
            $table->unsignedBigInteger('id_producto')->nullable()->after('id');
            $table->foreign('id_producto')->references('id')->on('productos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('promociones', function (Blueprint $table) {
            $table->dropForeign(['id_producto']);
            $table->dropColumn('id_producto');
        });
    }
};
