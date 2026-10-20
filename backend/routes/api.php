<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MarcaController;

Route::get('/test', function () {
    return response()->json(['message' => 'RAPIFRIOS API is running']);
});

// Ruta segura para importar datos (Protegida por Token)
Route::get('/debug-log', function () {
    $path = storage_path('logs/laravel.log');
    if (!file_exists($path)) return 'No log file';
    $lines = array_slice(file($path), -100);
    return response(implode("", $lines))->header('Content-Type', 'text/plain');
});

Route::get('/clear-cache-secreto', function (Request $request) {
    if ($request->query('token') !== 'rapifrios_2026_admin') {
        return response('No autorizado', 403);
    }
    try {
        Artisan::call('optimize:clear');
        return response('<h1>Cache cleared successfully</h1><pre>' . Artisan::output() . '</pre>');
    } catch (\Exception $e) {
        return response('<h1>Error clearing cache</h1><p>' . $e->getMessage() . '</p>', 500);
    }
});

Route::get('/importar-datos-secreto', function (Request $request) {
    if ($request->query('token') !== 'rapifrios_2026_admin') {
        return response('No autorizado', 403);
    }

    try {
        Artisan::call('data:sync', ['action' => 'import']);
        return response('<pre>' . Artisan::output() . '</pre>');
    } catch (\Exception $e) {
        return response($e->getMessage(), 500);
    }
});

Route::get('/purgar-unidades-secreto', function (Request $request) {
    if ($request->query('token') !== 'rapifrios_2026_admin') {
        return response('No autorizado', 403);
    }

    return app(ProductoController::class)->purgarUnidadesIndividuales();
});

Route::get('/auto-categorizar-secreto', function (Request $request) {
    if ($request->query('token') !== 'rapifrios_2026_admin') {
        return response('No autorizado', 403);
    }

    return app(ProductoController::class)->autoCategorizar();
});

Route::get('/restaurar-imagenes-backup', function () {
    try {
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\ImportFromBackupSeeder',
            '--force' => true
        ]);
        return response()->json([
            'status' => 'success',
            'output' => Artisan::output()
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Ejecutar Seeder de Autenticación y Permisos RBAC
Route::get('/run-auth-seeder', function () {
    try {
        Artisan::call('db:seed', [
            '--class' => 'AuthRbacSeeder',
            '--force' => true
        ]);
        return response()->json([
            'status'  => 'success',
            'message' => 'AuthRbacSeeder ejecutado correctamente',
            'output'  => Artisan::output()
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status'  => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/promociones', [PromotionController::class, 'index']);
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/marcas', [MarcaController::class, 'index']);
Route::get('/categorias', [\App\Http\Controllers\CategoriaController::class, 'index']);
Route::get('/configuracion/whatsapp', [\App\Http\Controllers\ConfigController::class, 'getWhatsappConfigs']);
Route::get('/reports/hoja-vida/{id}', [\App\Http\Controllers\ReporteController::class, 'hojaVidaVehicular']);
Route::get('/reports/vehiculo/{id}/pdf', [\App\Http\Controllers\ReporteController::class, 'checklistsVehiculo']);
Route::get('/reports/vehiculo/{id}/mantenimientos', [\App\Http\Controllers\ReporteController::class, 'historialMantenimientos']);
Route::get('/reports/cierre-turno', [\App\Http\Controllers\ReporteController::class, 'cierreTurno']);

// Auth Routes
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('admin/logistica')->group(function () {
        Route::get('/status', [\App\Http\Controllers\LogisticsController::class, 'status']);
        Route::get('/cumplimiento', [\App\Http\Controllers\LogisticsController::class, 'obtenerResumenCumplimiento']);
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/user/update-sede', [AuthController::class, 'updateSede']);
    Route::post('/promociones/special', [PromotionController::class, 'storeSpecial']);
    
    // Gestión de Productos
    Route::get('/ofertas-exclusivas', [ProductoController::class, 'exclusivas']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::post('/productos/importar-masivo', [ProductoController::class, 'importCsv']);
    Route::post('/productos/purgar-unidades', [ProductoController::class, 'purgarUnidadesIndividuales']);
    Route::post('/productos/auto-categorizar', [ProductoController::class, 'autoCategorizar']);
    Route::put('/productos/{id}', [ProductoController::class, 'update']);
    Route::delete('/productos/{id}', [ProductoController::class, 'destroy']);
    
    // Gestión de Personal (Usuarios)
    Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);
    Route::get('/users/stats', [\App\Http\Controllers\UserController::class, 'getStats']);
    Route::post('/users', [\App\Http\Controllers\UserController::class, 'store']);
    Route::put('/users/{id}', [\App\Http\Controllers\UserController::class, 'update']);
    Route::patch('/users/{id}/toggle-status', [\App\Http\Controllers\UserController::class, 'toggleStatus']);
    Route::get('/roles', [\App\Http\Controllers\UserController::class, 'getRoles']);
    Route::get('/sucursales', [\App\Http\Controllers\UserController::class, 'getSucursales']);
    
    // Gestión de Marcas (Privado)
    Route::post('/marcas', [MarcaController::class, 'store']);
    Route::put('/marcas/{id}', [MarcaController::class, 'update']);
    Route::delete('/marcas/{id}', [MarcaController::class, 'destroy']);
    
    // Gestión de Inventario
    Route::get('/inventario', [\App\Http\Controllers\InventoryController::class, 'index']);
    Route::post('/inventario/ajustar', [\App\Http\Controllers\InventoryController::class, 'ajustar']);

    // Logística y Operaciones
    Route::get('/repartidor/mi-perfil-logistico', [\App\Http\Controllers\ChecklistController::class, 'miPerfilLogistico']);
    Route::get('/repartidor/vehiculo-asignado', [\App\Http\Controllers\VehiculoController::class, 'getVehiculoAsignado']);
    Route::get('/admin/conductores/{id}/vehiculo', [\App\Http\Controllers\VehiculoController::class, 'getVehiculoAsignadoPorUsuario']);
    Route::get('/admin/logistica/vehiculos/stats', [\App\Http\Controllers\VehiculoController::class, 'getDashboardStats']);
    Route::get('/vehiculos/disponibles', [\App\Http\Controllers\VehiculoController::class, 'getDisponibles']);
    Route::get('/vehiculos/selector', [\App\Http\Controllers\VehiculoController::class, 'getVehiculosSelector']);
    Route::get('/logistica/novedades/activas', [\App\Http\Controllers\VehiculoController::class, 'getNovedadesActivas']);
    Route::patch('/logistica/novedades/{id}/resolver', [\App\Http\Controllers\VehiculoController::class, 'resolverNovedad']);
    Route::apiResource('vehiculos', \App\Http\Controllers\VehiculoController::class);
    Route::post('/logistica/checklists', [\App\Http\Controllers\ChecklistController::class, 'store']);
    Route::get('/logistica/checklists', [\App\Http\Controllers\ChecklistController::class, 'index']);
    Route::get('/logistica/jornada/activa', [\App\Http\Controllers\JornadaController::class, 'getJornadaActiva']);
    Route::post('/logistica/jornada/iniciar', [\App\Http\Controllers\JornadaController::class, 'iniciarJornada']);
    Route::post('/logistica/jornada/finalizar/{id}', [\App\Http\Controllers\JornadaController::class, 'finalizarJornada']);
    Route::post('/admin/logistica/jornada/force-reset/{employeeId}', [\App\Http\Controllers\JornadaController::class, 'forceResetShift']);

    // Dashboard y Notificaciones
    Route::get('/dashboard/overview', [\App\Http\Controllers\DashboardController::class, 'getOverview']);
    Route::get('/notificaciones/alertas-criticas', [\App\Http\Controllers\DashboardController::class, 'getAlertasCriticas']);
    Route::post('/notificaciones/enviar-recordatorio', [\App\Http\Controllers\DashboardController::class, 'enviarRecordatorio']);
    Route::get('/notificaciones', [\App\Http\Controllers\DashboardController::class, 'getNotificaciones']);
    Route::patch('/notificaciones/{id}/leer', [\App\Http\Controllers\DashboardController::class, 'marcarLeida']);

    // Centro de Reportes
    Route::get('/reports/inventario/pdf', [\App\Http\Controllers\ReportController::class, 'generateInventarioPdf']);

    // Configuración Global y Tablas Maestras
    Route::prefix('admin/configuracion')->group(function () {
        Route::get('/global', [\App\Http\Controllers\ConfigController::class, 'getGlobalConfigs']);
        Route::post('/global', [\App\Http\Controllers\ConfigController::class, 'updateGlobalConfigs']);
        
        Route::get('/sedes', [\App\Http\Controllers\ConfigController::class, 'getSedes']);
        Route::post('/sedes', [\App\Http\Controllers\ConfigController::class, 'createSede']);
        Route::put('/sedes/{id}', [\App\Http\Controllers\ConfigController::class, 'updateSede']);
        
        Route::post('/categorias', [\App\Http\Controllers\ConfigController::class, 'createCategoria']);
        Route::put('/categorias/{id}', [\App\Http\Controllers\ConfigController::class, 'updateCategoria']);
        Route::delete('/categorias/{id}', [\App\Http\Controllers\ConfigController::class, 'deleteCategoria']);
        Route::post('/categorias/{id}/delete', [\App\Http\Controllers\ConfigController::class, 'deleteCategoria']);

        Route::get('/whatsapp', [\App\Http\Controllers\ConfigController::class, 'getWhatsappConfigs']);
        Route::post('/whatsapp', [\App\Http\Controllers\ConfigController::class, 'updateWhatsappConfigs']);
    });

    Route::delete('/categorias/{id}', [\App\Http\Controllers\ConfigController::class, 'deleteCategoria']);
    Route::post('/categorias/{id}/delete', [\App\Http\Controllers\ConfigController::class, 'deleteCategoria']);

    Route::post('/ofertas/update', function() {
        return response()->json(['message' => 'Oferta actualizada con éxito']);
    })->middleware('permission:edit_offers');
});
