<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MarcaController;

Route::get('/test', function () {
    return response()->json(['message' => 'RAPIFRIOS API is running']);
});

// Ruta segura para importar datos (Protegida por Token)
Route::get('/importar-datos-secreto', function (\Illuminate\Http\Request $request) {
    // Si no tiene el token correcto, deniega el acceso
    if ($request->query('token') !== 'rapifrios_2026_admin') {
        return response('No autorizado', 403);
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('data:sync', ['action' => 'import']);
        return response('<pre>' . \Illuminate\Support\Facades\Artisan::output() . '</pre>');
    } catch (\Exception $e) {
        return response($e->getMessage(), 500);
    }
});

Route::get('/promociones', [PromotionController::class, 'index']);
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/marcas', [MarcaController::class, 'index']);
Route::get('/categorias', [\App\Http\Controllers\CategoriaController::class, 'index']);

// Auth Routes
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('admin/logistica')->group(function () {
        Route::get('/status', [LogisticsController::class, 'status']);
        Route::get('/cumplimiento', [LogisticsController::class, 'obtenerResumenCumplimiento']);
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/user/update-sede', [AuthController::class, 'updateSede']);
    Route::post('/promociones/special', [PromotionController::class, 'storeSpecial']);
    
    // Gestión de Productos
    Route::get('/ofertas-exclusivas', [ProductoController::class, 'exclusivas']);
    Route::post('/productos', [ProductoController::class, 'store']);
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
    Route::get('/admin/logistica/status', [\App\Http\Controllers\LogisticsController::class, 'status']);
    Route::get('/admin/logistica/vehiculos/stats', [\App\Http\Controllers\VehiculoController::class, 'getDashboardStats']);
    Route::get('/vehiculos/disponibles', [\App\Http\Controllers\VehiculoController::class, 'getDisponibles']);
    Route::apiResource('vehiculos', \App\Http\Controllers\VehiculoController::class);
    Route::post('/logistica/checklists', [\App\Http\Controllers\ChecklistController::class, 'store']);
    Route::get('/logistica/checklists', [\App\Http\Controllers\ChecklistController::class, 'index']);
    Route::post('/logistica/jornada/iniciar', [\App\Http\Controllers\JornadaController::class, 'iniciarJornada']);
    Route::post('/logistica/jornada/finalizar/{id}', [\App\Http\Controllers\JornadaController::class, 'finalizarJornada']);

    // Dashboard y Notificaciones
    Route::get('/dashboard/overview', [\App\Http\Controllers\DashboardController::class, 'getOverview']);
    Route::get('/nominas/proyeccion', [\App\Http\Controllers\DashboardController::class, 'getProyeccionNomina']);
    Route::get('/notificaciones/alertas-criticas', [\App\Http\Controllers\DashboardController::class, 'getAlertasCriticas']);
    Route::post('/notificaciones/enviar-recordatorio', [\App\Http\Controllers\DashboardController::class, 'enviarRecordatorio']);
    Route::get('/notificaciones', [\App\Http\Controllers\DashboardController::class, 'getNotificaciones']);
    Route::patch('/notificaciones/{id}/leer', [\App\Http\Controllers\DashboardController::class, 'marcarLeida']);

    // Gestión de Nómina
    Route::get('/nominas', [\App\Http\Controllers\NominaController::class, 'index']);
    Route::post('/nominas', [\App\Http\Controllers\NominaController::class, 'store']);
    // Solo Superadmin puede aprobar (se valida dentro del controlador o vía middleware si existiera uno de rol)
    Route::patch('/nominas/{id}/aprobar', [\App\Http\Controllers\NominaController::class, 'aprobar']);

    // Centro de Reportes
    Route::get('/reports/nomina/{id}/pdf', [\App\Http\Controllers\ReportController::class, 'generateNominaPdf']);
    Route::get('/reports/vehiculo/{id}/pdf', [\App\Http\Controllers\ReportController::class, 'generateVehiculoPdf']);
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
    });

    // Ejemplo de ruta protegida para ofertas
    Route::post('/ofertas/update', function() {
        return response()->json(['message' => 'Oferta actualizada con éxito']);
    })->middleware('permission:edit_offers');
});
