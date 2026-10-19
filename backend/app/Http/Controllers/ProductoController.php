<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Marca;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('productos as p')
            ->leftJoin('marcas as m', 'p.id_marca', '=', 'm.id')
            ->leftJoin('categorias as c', 'p.id_categoria', '=', 'c.id')
            ->whereNull('p.deleted_at')
            ->select(
                'p.id',
                'p.nombre',
                'p.descripcion',
                'p.url_imagen',
                'p.precio',
                'p.stock',
                'p.id_marca',
                'p.id_categoria',
                'p.en_promocion',
                'p.precio_oferta',
                'p.fecha_fin_oferta',
                'p.es_exclusivo',
                'm.nombre as nombre_marca',
                'c.nombre as nombre_categoria'
            );

        // Solo se ocultan productos si se solicita explícitamente ver solo los exclusivos
        if ($request->has('solo_exclusivos')) {
            $query->where('p.es_exclusivo', true);
        }

        // Búsqueda flexible por texto compatible con PostgreSQL y MySQL
        if ($request->filled('search')) {
            $driver = DB::getDriverName();
            $likeOp = $driver === 'pgsql' ? 'ilike' : 'like';
            $query->where('p.nombre', $likeOp, '%' . $request->search . '%');
        }

        // Filtro flexible por categoría (sin sensibilidad a mayúsculas/minúsculas)
        if ($request->filled('categoria') && !in_array(strtolower($request->categoria), ['todos', 'all', ''])) {
            $driver = DB::getDriverName();
            if ($driver === 'pgsql') {
                $query->where('c.nombre', 'ilike', trim($request->categoria));
            } else {
                $query->where('c.nombre', trim($request->categoria));
            }
        }

        if ($request->filled('marca') && $request->marca !== 'all') {
            $query->where('p.id_marca', $request->marca);
        }

        $productos = $query->orderBy('p.nombre')->get();

        return response()->json($productos);
    }

    public function exclusivas(Request $request)
    {
        $user = $request->user();
        if (!$user || !($user->hasRole('Cliente') || $user->hasRole('cliente') || $user->hasRole('admin') || $user->hasRole('Admin') || $user->hasRole('Superadmin'))) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $query = DB::table('productos as p')
            ->leftJoin('marcas as m', 'p.id_marca', '=', 'm.id')
            ->leftJoin('categorias as c', 'p.id_categoria', '=', 'c.id')
            ->whereNull('p.deleted_at')
            ->where('p.es_exclusivo', true)
            ->select(
                'p.id',
                'p.nombre',
                'p.descripcion',
                'p.url_imagen',
                'p.precio',
                'p.stock',
                'p.id_marca',
                'p.id_categoria',
                'p.en_promocion',
                'p.precio_oferta',
                'p.fecha_fin_oferta',
                'p.es_exclusivo',
                'm.nombre as nombre_marca',
                'c.nombre as nombre_categoria'
            );

        $productos = $query->orderBy('p.nombre')->get();
        Log::info('Respuesta API VIP (exclusivas):', ['count' => count($productos), 'user_id' => $user->id]);

        return response()->json($productos);
    }

    public function show($id)
    {
        $producto = Producto::findOrFail($id);
        return response()->json($producto);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'            => 'required|string|max:255',
            'descripcion'       => 'nullable|string',
            'precio'            => 'required|numeric|min:0',
            'id_marca'          => 'required|exists:marcas,id',
            'id_categoria'      => 'required|exists:categorias,id',
            'imagen'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'en_promocion'      => 'nullable',
            'precio_oferta'     => 'nullable|numeric|min:0',
            'fecha_fin_oferta'  => 'nullable|date',
            'es_exclusivo'      => 'nullable|boolean',
            'url_imagen_manual' => 'nullable|string', 
        ]);

        if (!isset($validated['stock'])) {
            $validated['stock'] = 0;
        }

        if ($request->hasFile('imagen')) {
            $file = $request->file('imagen');
            $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            
            $uploadPath = env('RENDER_DISK_PATH', public_path('products'));
            if (!file_exists($uploadPath)) {
                @mkdir($uploadPath, 0777, true);
            }
            
            $file->move($uploadPath, $filename);
            $validated['url_imagen'] = $filename;

            $this->pushImageToGitHub($filename, $uploadPath . '/' . $filename);
        } elseif ($request->filled('url_imagen_manual')) {
            $validated['url_imagen'] = $request->url_imagen_manual;
        }

        if ($request->has('en_promocion')) {
            $validated['en_promocion'] = filter_var($request->en_promocion, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->has('es_exclusivo')) {
            $validated['es_exclusivo'] = filter_var($request->es_exclusivo, FILTER_VALIDATE_BOOLEAN);
        } else {
            $validated['es_exclusivo'] = false;
        }

        $producto = Producto::create($validated);

        DB::table('sucursal_producto')->updateOrInsert(
            ['producto_id' => $producto->id, 'sucursal_id' => 1],
            ['stock' => 0, 'updated_at' => now(), 'created_at' => now()]
        );

        Log::info('Producto VIP creado:', ['id' => $producto->id, 'nombre' => $producto->nombre]);

        return response()->json([
            'message'  => 'Producto creado con éxito',
            'producto' => $producto
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        $validated = $request->validate([
            'nombre'            => 'required|string|max:255',
            'descripcion'       => 'nullable|string',
            'precio'            => 'required|numeric|min:0',
            'id_marca'          => 'required|exists:marcas,id',
            'id_categoria'      => 'nullable|exists:categorias,id',
            'imagen'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'en_promocion'      => 'nullable',
            'precio_oferta'     => 'nullable|numeric|min:0',
            'fecha_fin_oferta'  => 'nullable|date',
            'es_exclusivo'      => 'nullable|boolean',
            'url_imagen_manual' => 'nullable|string',
        ]);

        if ($request->hasFile('imagen')) {
            if ($producto->url_imagen && !str_starts_with($producto->url_imagen, 'http')) {
                $oldPath = env('RENDER_DISK_PATH', public_path('products')) . '/' . $producto->url_imagen;
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }
            
            $file = $request->file('imagen');
            $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            
            $uploadPath = env('RENDER_DISK_PATH', public_path('products'));
            if (!file_exists($uploadPath)) {
                @mkdir($uploadPath, 0777, true);
            }
            
            $file->move($uploadPath, $filename);
            $validated['url_imagen'] = $filename;

            $this->pushImageToGitHub($filename, $uploadPath . '/' . $filename);
        } elseif ($request->filled('url_imagen_manual')) {
            $validated['url_imagen'] = $request->url_imagen_manual;
        }

        if ($request->has('en_promocion')) {
            $validated['en_promocion'] = filter_var($request->en_promocion, FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->has('es_exclusivo')) {
            $validated['es_exclusivo'] = filter_var($request->es_exclusivo, FILTER_VALIDATE_BOOLEAN);
        }

        $producto->update($validated);

        return response()->json([
            'message'  => 'Producto actualizado con éxito',
            'producto' => $producto
        ]);
    }

    public function destroy($id)
    {
        try {
            $producto = Producto::findOrFail($id);
            $producto->delete();

            return response()->json([
                'message' => 'Producto eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el producto: ' . $e->getMessage()
            ], 500);
        }
    }

    private function pushImageToGitHub($filename, $localPath)
    {
        $token = env('GITHUB_TOKEN');
        $username = env('GITHUB_USER') ?? env('GITHUB_USERNAME') ?? 'madarazed';
        $repo = env('GITHUB_REPO', '1');
        
        $cleanFilename = basename($filename);
        $path = "react/public/products/{$cleanFilename}";
        $apiUrl = "https://api.github.com/repos/{$username}/{$repo}/contents/{$path}";

        Log::info("[GitHub Sync] INFORME DE RUTA FORENSE:", [
            'url_api_destino' => $apiUrl,
            'archivo_local'   => $localPath,
            'ruta_github'     => $path
        ]);

        if (!$token) {
            Log::error("[GitHub Sync] CRÍTICO: GITHUB_TOKEN no encontrado en el entorno.");
            return;
        }

        try {
            $response = Http::withToken($token)
                ->withHeaders(['User-Agent' => 'Rapifrios-Nexus-App'])
                ->get($apiUrl);
            
            $sha = null;
            if ($response->successful()) {
                $sha = $response->json()['sha'];
                Log::info("[GitHub Sync] Archivo existente detectado. SHA: {$sha}");
            } elseif ($response->status() !== 404) {
                Log::error("[GitHub Sync] Error al verificar existencia en GitHub", [
                    'status' => $response->status(),
                    'body'   => $response->json()
                ]);
            }

            if (!file_exists($localPath)) {
                Log::error("[GitHub Sync] CRÍTICO: El archivo local no existe: {$localPath}");
                return;
            }
            
            $fileSize = filesize($localPath);
            if ($fileSize === 0 || $fileSize === false) {
                Log::error("[GitHub Sync] CRÍTICO: El archivo local está vacío o corrupto (0 bytes): {$localPath}");
                return;
            }

            $rawContent = file_get_contents($localPath);
            if ($rawContent === false) {
                Log::error("[GitHub Sync] CRÍTICO: file_get_contents devolvió false para: {$localPath}");
                return;
            }

            $content = base64_encode($rawContent);
            Log::info("[GitHub Sync] Validación de Contenido:", [
                'tamanio_original_bytes' => $fileSize,
                'longitud_base64'        => strlen($content)
            ]);

            $putData = [
                'message' => "feat: persistent asset upload for {$cleanFilename} via Super Admin",
                'content' => $content,
                'branch'  => 'main'
            ];
            if ($sha) {
                $putData['sha'] = $sha;
            }

            $putResponse = Http::withToken($token)
                ->withHeaders([
                    'Accept'     => 'application/vnd.github.v3+json',
                    'User-Agent' => 'Rapifrios-Nexus-App'
                ])
                ->put($apiUrl, $putData);

            if ($putResponse->successful()) {
                Log::info("[GitHub Sync] ✅ Sincronización exitosa con GitHub para {$cleanFilename}");
            } else {
                Log::error("[GitHub Sync] ❌ Fallo en la subida a GitHub", [
                    'status'   => $putResponse->status(),
                    'response' => $putResponse->json()
                ]);
            }
        } catch (\Exception $e) {
            Log::error("[GitHub Sync] ☢️ Excepción crítica en sincronización: " . $e->getMessage());
        }
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $normalizar = function ($cadena) {
            $str = strtoupper($cadena);
            $str = preg_replace('/(UNIDADES|UNIDAD|UNDS|UND)\b/i', '', $str);
            return preg_replace('/[^A-Z0-9]/', '', $str);
        };

        $marcaDefault = Marca::firstOrCreate(['nombre' => 'Genérica'])->id;
        $categoriaDefault = Categoria::firstOrCreate(['nombre' => 'General'])->id;

        $legacyProductsRaw = Producto::whereNull('codigo_referencia')
                                     ->orWhere('codigo_referencia', '')
                                     ->get(['id', 'nombre']);
        $legacyProducts = [];
        foreach ($legacyProductsRaw as $prod) {
            $nombreLimpio = $normalizar($prod->nombre);
            $legacyProducts[$nombreLimpio] = $prod->id;
        }

        $marcasCache = ['Genérica' => $marcaDefault];

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        if (!$handle) {
            return response()->json(['message' => 'No se pudo abrir el archivo.'], 400);
        }

        $headerFound = false;
        $refIndex = null;
        $detailIndex = null;
        $priceIndex = null;
        $marcaIndex = null;
        $chunks = [];
        $count = 0;
        $descartadosPorUnidad = 0;
        $codigosProcesados = [];

        while (($row = fgetcsv($handle, 1000, ';')) !== false) {
            if (empty($row) || count($row) < 3) {
                continue;
            }

            if (!$headerFound) {
                if (trim($row[0]) === 'REFERENCIA') {
                    $headerFound = true;
                    foreach ($row as $index => $col) {
                        $colName = trim($col);
                        if ($colName === 'REFERENCIA') $refIndex = $index;
                        if ($colName === 'DETALLE') $detailIndex = $index;
                        if ($colName === 'LISTA GENERAL') $priceIndex = $index;
                        if ($colName === 'MARCA') $marcaIndex = $index;
                    }
                }
                continue;
            }

            if ($refIndex === null || $detailIndex === null || $priceIndex === null) {
                fclose($handle);
                return response()->json(['message' => 'El formato del archivo CSV es inválido. Faltan columnas requeridas.'], 400);
            }

            $ref = isset($row[$refIndex]) ? trim($row[$refIndex]) : '';
            if ($ref === '' || str_starts_with($ref, '$') || $ref === 'REFERENCIA') {
                continue;
            }

            if (str_ends_with($ref, '.0')) {
                $ref = substr($ref, 0, -2);
            }

            $detalle = isset($row[$detailIndex]) ? trim($row[$detailIndex]) : '';

            if (empty($detalle)) {
                continue;
            }

            // Filtro Quirúrgico: Descartar productos por unidad individual ("X UND", "X 1 UND")
            // Los multipacks como "X 18 UND", "X 24 UND" continúan normalmente el flujo
            if (preg_match('/\bX\s*UND\b|\bX\s*1(?!\d)\s*UND/i', $detalle)) {
                $descartadosPorUnidad++;
                continue;
            }

            $codigosProcesados[] = $ref;

            $priceStr = isset($row[$priceIndex]) ? trim($row[$priceIndex]) : '0';

            $priceStr = str_replace(['$', ' '], '', $priceStr);
            $priceStr = str_replace('.', '', $priceStr);
            $priceStr = str_replace(',', '.', $priceStr);
            $precio = floatval($priceStr);

            $detalleLimpio = $normalizar($detalle);
            if (isset($legacyProducts[$detalleLimpio])) {
                $legacyId = $legacyProducts[$detalleLimpio];
                Producto::where('id', $legacyId)->update(['codigo_referencia' => $ref]);
                unset($legacyProducts[$detalleLimpio]);
            }

            $nombreMarca = 'Genérica';
            $actualMarcaIndex = $marcaIndex ?? (isset($row[3]) ? 3 : null);
            if ($actualMarcaIndex !== null && isset($row[$actualMarcaIndex])) {
                $nombreMarca = trim($row[$actualMarcaIndex]);
            }
            if (empty($nombreMarca)) {
                $nombreMarca = 'Genérica';
            }

            if (!isset($marcasCache[$nombreMarca])) {
                $marcasCache[$nombreMarca] = Marca::firstOrCreate(['nombre' => $nombreMarca])->id;
            }
            $marcaId = $marcasCache[$nombreMarca];

            $chunks[] = [
                'codigo_referencia' => $ref,
                'nombre'            => $detalle,
                'precio'            => $precio,
                'id_marca'          => $marcaId,
                'id_categoria'      => $categoriaDefault,
                'descripcion'       => 'Importado desde Syscafe',
                'url_imagen'        => 'placeholder.png',
                'stock'             => 100,
                'en_promocion'      => false,
                'es_exclusivo'      => false,
                'created_at'        => now(),
                'updated_at'        => now()
            ];

            if (count($chunks) >= 500) {
                Producto::upsert($chunks, ['codigo_referencia'], ['nombre', 'precio', 'updated_at']);
                $count += count($chunks);
                $chunks = [];
            }
        }
        fclose($handle);

        if (count($chunks) > 0) {
            Producto::upsert($chunks, ['codigo_referencia'], ['nombre', 'precio', 'updated_at']);
            $count += count($chunks);
        }

        // Sincronización Maestra: Purga de productos no presentes en el CSV
        Producto::whereNotIn('codigo_referencia', $codigosProcesados)
                ->orWhereNull('codigo_referencia')
                ->orWhere('codigo_referencia', '')
                ->delete();

        // Purga preventiva directa: asegurar que ningún producto con "X UND" o "X 1 UND" persista
        Producto::where('nombre', 'LIKE', '%X UND%')
                ->orWhere('nombre', 'LIKE', '%X 1 UND%')
                ->orWhere('nombre', 'LIKE', '%X1 UND%')
                ->delete();

        $mensaje = "Sincronización masiva de Syscafe completada con éxito. {$count} productos procesados.";
        if ($descartadosPorUnidad > 0) {
            $mensaje .= " ({$descartadosPorUnidad} productos individuales con 'X UND' descartados/eliminados).";
        }

        return response()->json([
            'success' => true,
            'message' => $mensaje
        ]);
    }

    public function limpiarBasuraImportacion()
    {
        $deleted = Producto::where('url_imagen', 'placeholder.png')
            ->whereDate('created_at', today())
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "Se eliminaron {$deleted} productos basura creados hoy con placeholder.png."
        ]);
    }
}
