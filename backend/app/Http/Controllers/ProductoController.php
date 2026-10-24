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
        // Normalización tolerante de categoría (acepta id_categoria, categoria_id, o nombre de categoría)
        $catInput = $request->input('id_categoria') 
            ?? $request->input('categoria_id') 
            ?? $request->input('categoria');

        if ($catInput !== null && $catInput !== '' && $catInput !== 'null') {
            if (is_numeric($catInput)) {
                $catId = (int)$catInput;
                if ($catId > 0 && Categoria::where('id', $catId)->exists()) {
                    $request->merge(['id_categoria' => $catId]);
                } else {
                    $defaultCat = Categoria::firstOrCreate(['nombre' => 'General']);
                    $request->merge(['id_categoria' => $defaultCat->id]);
                }
            } else {
                $cat = Categoria::firstOrCreate(['nombre' => trim((string)$catInput)]);
                $request->merge(['id_categoria' => $cat->id]);
            }
        }

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

        Log::info('Producto VIP creado:', ['id' => $producto->id, 'nombre' => $producto->nombre, 'id_categoria' => $producto->id_categoria]);

        return response()->json([
            'message'  => 'Producto creado con éxito',
            'producto' => [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'descripcion' => $producto->descripcion,
                'url_imagen' => $producto->url_imagen,
                'precio' => $producto->precio,
                'stock' => $producto->stock,
                'id_marca' => $producto->id_marca,
                'id_categoria' => $producto->id_categoria,
                'nombre_marca' => $producto->marca?->nombre,
                'nombre_categoria' => $producto->categoria?->nombre,
                'en_promocion' => (bool)$producto->en_promocion,
                'precio_oferta' => $producto->precio_oferta,
                'fecha_fin_oferta' => $producto->fecha_fin_oferta,
                'es_exclusivo' => (bool)$producto->es_exclusivo,
            ]
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);

        // Normalización tolerante de categoría (acepta id_categoria, categoria_id, o nombre de categoría)
        $catInput = $request->input('id_categoria') 
            ?? $request->input('categoria_id') 
            ?? $request->input('categoria');

        if ($catInput !== null && $catInput !== '' && $catInput !== 'null') {
            if (is_numeric($catInput)) {
                $catId = (int)$catInput;
                if ($catId > 0 && Categoria::where('id', $catId)->exists()) {
                    $request->merge(['id_categoria' => $catId]);
                } else {
                    $defaultCat = Categoria::firstOrCreate(['nombre' => 'General']);
                    $request->merge(['id_categoria' => $defaultCat->id]);
                }
            } else {
                $cat = Categoria::firstOrCreate(['nombre' => trim((string)$catInput)]);
                $request->merge(['id_categoria' => $cat->id]);
            }
        }

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

        // Asignación explícita para garantizar persistencia inequívoca en base de datos
        if (isset($validated['id_categoria'])) {
            $producto->id_categoria = (int)$validated['id_categoria'];
        }

        $producto->update($validated);
        $producto->refresh();

        Log::info("Producto {$producto->id} actualizado exitosamente:", [
            'id' => $producto->id,
            'nombre' => $producto->nombre,
            'id_categoria' => $producto->id_categoria,
            'nombre_categoria' => $producto->categoria?->nombre
        ]);

        return response()->json([
            'message'  => 'Producto actualizado con éxito',
            'producto' => [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'descripcion' => $producto->descripcion,
                'url_imagen' => $producto->url_imagen,
                'precio' => $producto->precio,
                'stock' => $producto->stock,
                'id_marca' => $producto->id_marca,
                'id_categoria' => $producto->id_categoria,
                'nombre_marca' => $producto->marca?->nombre,
                'nombre_categoria' => $producto->categoria?->nombre,
                'en_promocion' => (bool)$producto->en_promocion,
                'precio_oferta' => $producto->precio_oferta,
                'fecha_fin_oferta' => $producto->fecha_fin_oferta,
                'es_exclusivo' => (bool)$producto->es_exclusivo,
            ]
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
            'file' => 'required|file|max:51200'
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $ext = strtolower($file->getClientOriginalExtension() ?: pathinfo($originalName, PATHINFO_EXTENSION));

        if (!in_array($ext, ['csv', 'txt', 'xlsx', 'xls'])) {
            return response()->json([
                'success' => false,
                'message' => 'Formato de archivo no soportado. Por favor, sube un archivo .csv, .txt o .xlsx.'
            ], 400);
        }

        $normalizar = function ($cadena) {
            $str = mb_strtoupper((string)$cadena, 'UTF-8');
            $str = preg_replace('/(UNIDADES|UNIDAD|UNDS|UND)\b/i', '', $str);
            return preg_replace('/[^A-Z0-9]/', '', $str);
        };

        $marcaDefault = Marca::firstOrCreate(['nombre' => 'Genérica'])->id;
        $categoriasCache = [];
        foreach (Categoria::all() as $cat) {
            $categoriasCache[mb_strtolower(trim($cat->nombre), 'UTF-8')] = $cat->id;
        }
        $categoriaDefault = $categoriasCache['general'] ?? Categoria::firstOrCreate(['nombre' => 'General'])->id;

        $marcasCache = ['genérica' => $marcaDefault, 'generica' => $marcaDefault];
        foreach (Marca::all() as $m) {
            $marcasCache[mb_strtolower(trim($m->nombre), 'UTF-8')] = $m->id;
        }

        // Cache de productos existentes sin código de referencia para mapeo por nombre
        $legacyProductsRaw = Producto::withTrashed()
            ->whereNull('codigo_referencia')
            ->orWhere('codigo_referencia', '')
            ->get(['id', 'nombre']);
        $legacyProducts = [];
        foreach ($legacyProductsRaw as $prod) {
            $nombreLimpio = $normalizar($prod->nombre);
            if ($nombreLimpio !== '') {
                $legacyProducts[$nombreLimpio] = $prod->id;
            }
        }

        // 1. Extraer todas las filas usando el parser adecuado (.xlsx o .csv/.txt)
        try {
            $rows = $this->parseUploadedFile($file, $ext);
        } catch (\Exception $e) {
            Log::error("[Importación] Error crítico al leer el archivo: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'No se pudo procesar el archivo: ' . $e->getMessage()
            ], 400);
        }

        if (empty($rows)) {
            return response()->json([
                'success' => false,
                'message' => 'El archivo está vacío o no contiene registros válidos.'
            ], 400);
        }

        Log::info("[Importación] Iniciando procesamiento de archivo '{$originalName}'. Total de filas leídas: " . count($rows));

        // 2. Detección flexible de encabezados de columnas
        $headerFound = false;
        $refIndex = null;
        $detailIndex = null;
        $priceIndex = null;
        $fallbackPriceIndex = null;
        $marcaIndex = null;
        $categoryIndex = null;
        $startRowIndex = 0;

        foreach ($rows as $rowIndex => $row) {
            $tempRef = null;
            $tempDetail = null;
            $tempPrice = null;
            $tempFallbackPrice = null;
            $tempMarca = null;
            $tempCategory = null;

            foreach ($row as $index => $col) {
                if ($index === '__sheet') continue;
                $colName = mb_strtoupper(trim((string)$col), 'UTF-8');
                $colNameNoAccents = str_replace(
                    ['Á','É','Í','Ó','Ú','Ü','Ñ'], 
                    ['A','E','I','O','U','U','N'], 
                    $colName
                );

                // Referencia / Código
                if (in_array($colNameNoAccents, ['REFERENCIA', 'REF', 'CODIGO', 'COD', 'ID_PRODUCTO', 'ITEM', 'PLU', 'SKU']) && $tempRef === null) {
                    $tempRef = $index;
                }
                // Detalle / Nombre de Producto
                if (in_array($colNameNoAccents, ['DETALLE', 'NOMBRE', 'DESCRIPCION', 'PRODUCTO', 'ARTICULO', 'NAME', 'DESCRIP', 'TITLE']) && $tempDetail === null) {
                    $tempDetail = $index;
                }
                // Precio
                if (in_array($colNameNoAccents, ['LISTA GENERAL', 'PRECIO', 'PRECIO VENTA', 'PRECIO_VENTA', 'VALOR', 'VALOR UNITARIO', 'PRICE', 'PVP', 'BASE'])) {
                    if ($tempPrice === null) {
                        $tempPrice = $index;
                    } elseif ($tempFallbackPrice === null) {
                        $tempFallbackPrice = $index;
                    }
                }
                // Marca / Fabricante
                if (in_array($colNameNoAccents, ['MARCA', 'FABRICANTE', 'PROVEEDOR', 'BRAND']) && $tempMarca === null) {
                    $tempMarca = $index;
                }
                // Categoría / Hoja / Pestaña / Grupo
                if (in_array($colNameNoAccents, ['CATEGORIA', 'HOJA', 'PESTANA', 'GRUPO', 'LINEA', 'LINEAS', 'SUBGRUPO', 'CLASE', 'FAMILY', 'SECCION']) && $tempCategory === null) {
                    $tempCategory = $index;
                }
            }

            // Identificar si esta fila es el encabezado principal
            if ($tempDetail !== null && ($tempRef !== null || $tempPrice !== null)) {
                $headerFound = true;
                $refIndex = $tempRef ?? 0;
                $detailIndex = $tempDetail;
                $priceIndex = $tempPrice;
                $fallbackPriceIndex = $tempFallbackPrice;
                $marcaIndex = $tempMarca;
                $categoryIndex = $tempCategory;
                $startRowIndex = $rowIndex + 1;
                break;
            }
        }

        // Si no se encontró fila con nombres explícitos, usar mapeo posicional por defecto
        if (!$headerFound) {
            $refIndex = 0;
            $detailIndex = 1;
            $priceIndex = count($rows[0] ?? []) > 2 ? 2 : null;
            $startRowIndex = 0;
            Log::info("[Importación] Encabezado con nombres estándar no detectado. Usando índices posicionales (0: Ref, 1: Detalle).");
        }

        $creados = 0;
        $actualizados = 0;
        $descartadosPorUnidad = 0;
        $filasRechazadas = [];
        $codigosProcesados = [];
        $categoriasCreadasNuevas = [];

        // 3. Procesamiento fila a fila con UPSERT y manejo explícito de errores
        $totalFilasProcesadas = 0;

        for ($i = $startRowIndex; $i < count($rows); $i++) {
            $row = $rows[$i];
            $rowNum = $i + 1;
            $totalFilasProcesadas++;

            $detalle = isset($row[$detailIndex]) ? trim((string)$row[$detailIndex]) : '';

            // Omitir filas vacías o si coincide con la palabra 'DETALLE'/'NOMBRE'
            if ($detalle === '' || strcasecmp($detalle, 'detalle') === 0 || strcasecmp($detalle, 'nombre') === 0) {
                if ($detalle === '') {
                    $filasRechazadas[] = [
                        'fila' => $rowNum,
                        'motivo' => 'Nombre o detalle del producto vacío'
                    ];
                    Log::warning("[Importación Fila {$rowNum}] Registro omitido: Nombre/Detalle vacío.");
                }
                continue;
            }

            // Filtro de unidad individual ("X UND", "X 1 UND")
            if (preg_match('/\bX\s*UND\b|\bX\s*1(?!\d)\s*UND/i', $detalle)) {
                $descartadosPorUnidad++;
                Log::info("[Importación Fila {$rowNum}] Descartado producto por unidad individual ('X UND'): '{$detalle}'");
                continue;
            }

            // Código de Referencia
            $ref = isset($row[$refIndex]) ? trim((string)$row[$refIndex]) : '';
            if (str_ends_with($ref, '.0')) {
                $ref = substr($ref, 0, -2);
            }
            if ($ref === '' || str_starts_with($ref, '$') || strcasecmp($ref, 'referencia') === 0 || strcasecmp($ref, 'codigo') === 0) {
                // Generar código único y determinístico basado en el nombre del producto si el archivo no lo incluye
                $ref = 'REF-' . strtoupper(substr(md5($normalizar($detalle)), 0, 8));
                Log::info("[Importación Fila {$rowNum}] Código de referencia generado automáticamente: '{$ref}' para '{$detalle}'");
            }

            // Precio
            $priceStr = ($priceIndex !== null && isset($row[$priceIndex])) ? trim((string)$row[$priceIndex]) : '';
            if (($priceStr === '' || $priceStr === '0' || $priceStr === '$0') && $fallbackPriceIndex !== null && isset($row[$fallbackPriceIndex])) {
                $alt = trim((string)$row[$fallbackPriceIndex]);
                if ($alt !== '' && $alt !== '0' && $alt !== '$0') {
                    $priceStr = $alt;
                }
            }
            $priceStr = str_replace(['$', ' '], '', $priceStr);
            if (substr_count($priceStr, '.') > 1) {
                $priceStr = str_replace('.', '', $priceStr);
            }
            if (substr_count($priceStr, ',') > 0 && substr_count($priceStr, '.') > 0) {
                $priceStr = str_replace('.', '', $priceStr);
                $priceStr = str_replace(',', '.', $priceStr);
            } else {
                $priceStr = str_replace(',', '.', $priceStr);
            }
            $precio = floatval($priceStr);
            if ($precio < 0) {
                $precio = 0;
            }

            // Determinación y creación dinámica de Categoría (columna, pestaña/hoja o regex)
            $catCandidate = '';
            if ($categoryIndex !== null && isset($row[$categoryIndex])) {
                $catCandidate = trim((string)$row[$categoryIndex]);
            }
            if ($catCandidate === '' && !empty($row['__sheet'])) {
                $catCandidate = trim((string)$row['__sheet']);
            }

            // Determinación y creación dinámica de Marca
            $nombreMarca = 'Genérica';
            $actualMarcaIndex = $marcaIndex ?? (isset($row[3]) && $row[3] !== $catCandidate ? 3 : null);
            if ($actualMarcaIndex !== null && isset($row[$actualMarcaIndex])) {
                $mVal = trim((string)$row[$actualMarcaIndex]);
                if ($mVal !== '') {
                    $nombreMarca = $mVal;
                }
            }
            $marcaKey = mb_strtolower($nombreMarca, 'UTF-8');
            if (!isset($marcasCache[$marcaKey])) {
                $newMarca = Marca::firstOrCreate(['nombre' => $nombreMarca]);
                $marcasCache[$marcaKey] = $newMarca->id;
            }
            $marcaId = $marcasCache[$marcaKey];

            if ($catCandidate !== '') {
                $catKey = mb_strtolower($catCandidate, 'UTF-8');
                if (!isset($categoriasCache[$catKey])) {
                    $newCat = Categoria::firstOrCreate(['nombre' => $catCandidate]);
                    $categoriasCache[$catKey] = $newCat->id;
                    $categoriasCreadasNuevas[] = $newCat->nombre;
                    Log::info("[Importación Fila {$rowNum}] Nueva categoría creada dinámicamente desde el archivo: '{$newCat->nombre}'");
                }
                $categoriaId = $categoriasCache[$catKey];
            } else {
                $categoriaId = $this->determinarCategoriaId($detalle, $nombreMarca, $categoriasCache);
            }

            // UPSERT del Producto: Verificar si existe (incluso si está soft-deleted)
            try {
                $producto = Producto::withTrashed()->where('codigo_referencia', $ref)->first();
                if (!$producto) {
                    $detalleLimpio = $normalizar($detalle);
                    if (isset($legacyProducts[$detalleLimpio])) {
                        $producto = Producto::withTrashed()->find($legacyProducts[$detalleLimpio]);
                    } else {
                        $producto = Producto::withTrashed()
                            ->whereRaw('LOWER(TRIM(nombre)) = ?', [mb_strtolower(trim($detalle), 'UTF-8')])
                            ->first();
                    }
                }

                if ($producto) {
                    // Si estaba eliminado suavemente, restaurarlo a activo
                    if ($producto->trashed()) {
                        $producto->restore();
                        Log::info("[Importación Fila {$rowNum}] Producto reactivado y restaurado al catálogo: '{$detalle}' (Código: {$ref})");
                    }
                    $producto->nombre = $detalle;
                    $producto->precio = $precio;
                    $producto->id_marca = $marcaId;
                    $producto->id_categoria = $categoriaId;
                    if (!$producto->codigo_referencia) {
                        $producto->codigo_referencia = $ref;
                    }
                    if (!$producto->url_imagen) {
                        $producto->url_imagen = 'placeholder.png';
                    }
                    $producto->save();
                    $actualizados++;
                } else {
                    // NO existe: INSERTAR nuevo producto
                    $producto = Producto::create([
                        'codigo_referencia' => $ref,
                        'nombre'            => $detalle,
                        'precio'            => $precio,
                        'id_marca'          => $marcaId,
                        'id_categoria'      => $categoriaId,
                        'descripcion'       => 'Importado desde catálogo actualizado',
                        'url_imagen'        => 'placeholder.png',
                        'stock'             => 100,
                        'en_promocion'      => false,
                        'es_exclusivo'      => false,
                    ]);
                    $creados++;
                    Log::info("[Importación Fila {$rowNum}] ¡Nuevo producto insertado exitosamente!: '{$detalle}' (Código: {$ref}, Categoría ID: {$categoriaId})");
                }

                // Sincronizar existencias base en sucursal_producto
                DB::table('sucursal_producto')->updateOrInsert(
                    ['producto_id' => $producto->id, 'sucursal_id' => 1],
                    ['stock' => $producto->stock ?? 100, 'updated_at' => now(), 'created_at' => now()]
                );

                $codigosProcesados[] = $ref;

            } catch (\Exception $e) {
                Log::error("[Importación Fila {$rowNum}] Error al guardar producto '{$detalle}' (Ref: {$ref}): " . $e->getMessage());
                $filasRechazadas[] = [
                    'fila' => $rowNum,
                    'producto' => $detalle,
                    'motivo' => 'Error en base de datos: ' . $e->getMessage()
                ];
            }
        }

        // 4. Sincronización Maestra: Desactivar únicamente productos con código de referencia que no aparecieron en el archivo
        // NOTA: Se preservan intactos los productos creados manualmente en la plataforma (sin código de referencia)
        if (!empty($codigosProcesados)) {
            Producto::whereNotNull('codigo_referencia')
                ->where('codigo_referencia', '!=', '')
                ->whereNotIn('codigo_referencia', $codigosProcesados)
                ->delete();
        }

        // Purga preventiva de productos unitarios individuales
        Producto::where('nombre', 'LIKE', '%X UND%')
            ->orWhere('nombre', 'LIKE', '%X 1 UND%')
            ->orWhere('nombre', 'LIKE', '%X1 UND%')
            ->delete();

        $categoriasUnicasNuevas = array_values(array_unique($categoriasCreadasNuevas));

        $mensaje = "Sincronización completada con éxito. {$creados} productos nuevos creados, {$actualizados} productos actualizados.";
        if (count($categoriasUnicasNuevas) > 0) {
            $mensaje .= " Se crearon dinámicamente " . count($categoriasUnicasNuevas) . " categorías nuevas (" . implode(', ', $categoriasUnicasNuevas) . ").";
        }
        if ($descartadosPorUnidad > 0) {
            $mensaje .= " ({$descartadosPorUnidad} productos individuales 'X UND' descartados).";
        }

        Log::info("[Importación Finalizada] Resumen:", [
            'total_filas_procesadas' => $totalFilasProcesadas,
            'creados' => $creados,
            'actualizados' => $actualizados,
            'descartados_unidad' => $descartadosPorUnidad,
            'rechazados' => count($filasRechazadas),
            'categorias_nuevas' => $categoriasUnicasNuevas
        ]);

        return response()->json([
            'success' => true,
            'message' => $mensaje,
            'stats' => [
                'total_filas' => $totalFilasProcesadas,
                'creados' => $creados,
                'actualizados' => $actualizados,
                'rechazados' => count($filasRechazadas),
                'descartados_unidad' => $descartadosPorUnidad,
                'categorias_nuevas' => $categoriasUnicasNuevas,
            ],
            'filas_rechazadas' => array_slice($filasRechazadas, 0, 50)
        ]);
    }

    /**
     * Parsea el archivo subido según su extensión (.xlsx o .csv/.txt).
     */
    private function parseUploadedFile($file, string $extension): array
    {
        if (in_array($extension, ['xlsx', 'xlsm'])) {
            return $this->parseXlsxFile($file->getRealPath());
        }

        return $this->parseCsvOrTxtFile($file->getRealPath());
    }

    /**
     * Parsea un archivo Excel .xlsx de forma nativa usando ZipArchive y SimpleXML,
     * extrayendo cada pestaña/hoja con su nombre para relacionar categorías dinámicamente.
     */
    private function parseXlsxFile(string $filePath): array
    {
        $rows = [];
        $zip = new \ZipArchive();

        if ($zip->open($filePath) !== true) {
            Log::warning("[Parser XLSX] No se pudo abrir como archivo ZIP/Excel. Reintentando como texto.");
            return $this->parseCsvOrTxtFile($filePath);
        }

        // 1. Cargar cadenas compartidas (sharedStrings.xml)
        $sharedStrings = [];
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedStringsXml) {
            $xml = @simplexml_load_string($sharedStringsXml);
            if ($xml && isset($xml->si)) {
                foreach ($xml->si as $val) {
                    if (isset($val->t)) {
                        $sharedStrings[] = (string)$val->t;
                    } elseif (isset($val->r)) {
                        $text = '';
                        foreach ($val->r as $r) {
                            $text .= (string)$r->t;
                        }
                        $sharedStrings[] = $text;
                    } else {
                        $sharedStrings[] = '';
                    }
                }
            }
        }

        // 2. Mapear hojas (workbook.xml y workbook.xml.rels)
        $sheets = [];
        $workbookXml = $zip->getFromName('xl/workbook.xml');
        $relsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');
        $relMap = [];

        if ($relsXml) {
            $xmlRels = @simplexml_load_string($relsXml);
            if ($xmlRels) {
                foreach ($xmlRels->Relationship as $rel) {
                    $relMap[(string)$rel['Id']] = (string)$rel['Target'];
                }
            }
        }

        if ($workbookXml) {
            $xmlWorkbook = @simplexml_load_string($workbookXml);
            if ($xmlWorkbook && isset($xmlWorkbook->sheets->sheet)) {
                foreach ($xmlWorkbook->sheets->sheet as $sheet) {
                    $sheetName = (string)$sheet['name'];
                    $rId = (string)$sheet->attributes('http://schemas.openxmlformats.org/officeDocument/2006/relationships')['id'];
                    $target = $relMap[$rId] ?? null;
                    if ($target) {
                        $path = str_starts_with($target, 'worksheets/') 
                            ? 'xl/' . $target 
                            : (str_starts_with($target, '/') ? substr($target, 1) : 'xl/' . $target);
                        $sheets[] = ['name' => $sheetName, 'path' => $path];
                    }
                }
            }
        }

        // Fallback si no se pudieron extraer las hojas por relaciones
        if (empty($sheets)) {
            for ($i = 1; $i <= 50; $i++) {
                $path = "xl/worksheets/sheet{$i}.xml";
                if ($zip->locateName($path) !== false) {
                    $sheets[] = ['name' => "Hoja {$i}", 'path' => $path];
                }
            }
        }

        // 3. Procesar cada pestaña / hoja del libro
        foreach ($sheets as $sheetInfo) {
            $sheetName = $sheetInfo['name'];
            $sheetXml = $zip->getFromName($sheetInfo['path']);
            if (!$sheetXml) continue;

            $xmlSheet = @simplexml_load_string($sheetXml);
            if (!$xmlSheet || !isset($xmlSheet->sheetData->row)) continue;

            foreach ($xmlSheet->sheetData->row as $rowNode) {
                $rowArray = [];
                foreach ($rowNode->c as $cell) {
                    $r = (string)$cell['r'];
                    preg_match('/^([A-Z]+)(\d+)$/', $r, $matches);
                    $colLetters = $matches[1] ?? 'A';

                    // Convertir letras de columna (A, B, AA) en índice numérico 0-based
                    $colIndex = 0;
                    $len = strlen($colLetters);
                    for ($k = 0; $k < $len; $k++) {
                        $colIndex = $colIndex * 26 + (ord($colLetters[$k]) - ord('A') + 1);
                    }
                    $colIndex -= 1;

                    $cellType = (string)$cell['t'];
                    $cellVal = isset($cell->v) ? (string)$cell->v : '';

                    if ($cellType === 's' && is_numeric($cellVal)) {
                        $cellText = $sharedStrings[(int)$cellVal] ?? '';
                    } elseif ($cellType === 'inlineStr' && isset($cell->is->t)) {
                        $cellText = (string)$cell->is->t;
                    } else {
                        $cellText = $cellVal;
                    }

                    $rowArray[$colIndex] = trim($cellText);
                }

                if (!empty($rowArray)) {
                    $maxKey = max(array_keys($rowArray));
                    $denseRow = [];
                    for ($idx = 0; $idx <= $maxKey; $idx++) {
                        $denseRow[$idx] = $rowArray[$idx] ?? '';
                    }
                    // Asociar el nombre de la pestaña/hoja a la fila
                    $denseRow['__sheet'] = $sheetName;
                    $rows[] = $denseRow;
                }
            }
        }

        $zip->close();
        return $rows;
    }

    /**
     * Parsea un archivo .csv o .txt detectando automáticamente delimitadores,
     * eliminando marcas UTF-8 BOM y capturando nombres de hojas/secciones.
     */
    private function parseCsvOrTxtFile(string $filePath): array
    {
        $content = file_get_contents($filePath);
        if ($content === false) {
            return [];
        }

        // Eliminar marca UTF-8 BOM si está presente
        if (str_starts_with($content, "\xEF\xBB\xBF")) {
            $content = substr($content, 3);
        }

        $lines = preg_split("/\r\n|\n|\r/", $content);
        if (empty($lines)) {
            return [];
        }

        // Auto-detección del delimitador más probable
        $sample = array_slice(array_filter($lines, fn($l) => trim($l) !== ''), 0, 15);
        $delimiters = [';', ',', "\t", '|'];
        $counts = [';' => 0, ',' => 0, "\t" => 0, '|' => 0];
        foreach ($sample as $line) {
            foreach ($delimiters as $delim) {
                $counts[$delim] += substr_count($line, $delim);
            }
        }
        arsort($counts);
        $delimiter = key($counts) ?: ';';

        $rows = [];
        $currentSheet = null;

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '') continue;

            // Detectar si la fila actúa como encabezado de pestaña, hoja o categoría
            if (preg_match('/^(?:hoja|pestaña|pestana|sheet|tab|categor[ií]a)\s*[:=]\s*(.+)$/i', $trimmed, $m)) {
                $currentSheet = trim($m[1], " \t\n\r\0\x0B\"'[]");
                continue;
            }
            if (preg_match('/^\[([a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_]+)\]$/', $trimmed, $m)) {
                $currentSheet = trim($m[1]);
                continue;
            }
            if (preg_match('/^={3,}\s*([a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ\-_]+)\s*={3,}$/', $trimmed, $m)) {
                $currentSheet = trim($m[1]);
                continue;
            }

            $parsed = str_getcsv($line, $delimiter);
            if (!empty($parsed)) {
                $parsed['__sheet'] = $currentSheet;
                $rows[] = $parsed;
            }
        }

        return $rows;
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

    public function purgarUnidadesIndividuales()
    {
        $productos = Producto::all();
        $eliminados = [];

        foreach ($productos as $producto) {
            if (preg_match('/\bX\s*UND\b|\bX\s*1(?!\d)\s*UND/i', $producto->nombre)) {
                $eliminados[] = [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'precio' => $producto->precio
                ];
                $producto->delete();
            }
        }

        return response()->json([
            'success' => true,
            'total_eliminados' => count($eliminados),
            'productos_eliminados' => $eliminados,
            'message' => 'Se eliminaron exitosamente ' . count($eliminados) . " productos de unidad individual ('X UND') del catálogo."
        ]);
    }

    /**
     * Determina el ID de la categoría correspondiente según patrones en el nombre y marca.
     */
    public function determinarCategoriaId(string $nombre, string $marca = '', array &$categoriasCache = []): int
    {
        if (empty($categoriasCache)) {
            foreach (Categoria::all() as $cat) {
                $categoriasCache[strtolower(trim($cat->nombre))] = $cat->id;
            }
        }

        $generalId = $categoriasCache['general'] ?? Categoria::firstOrCreate(['nombre' => 'General'])->id;
        $n = strtoupper($nombre . ' ' . $marca);

        // 1. Licores
        if (preg_match('/\b(AGUARDIENTE|WHISKY|WHISKEY|BUCHANAN|CHIVAS|SOMETHING SPECIAL|OLD PARR|RON|VODKA|TEQUILA|TAPA ROJA|CUATES|COCTEL|GINEBRA|BRANDY)\b/i', $n)) {
            return $categoriasCache['licores'] ?? $generalId;
        }

        // 2. Cervezas
        if (preg_match('/\b(AGUILA|BACANA|BBC|BUDWEISER|CERO LATA|CLUB COLOMBIA|CLUB DORADA|CLUB ROJA|COLA Y POLA|CORONA|CORONITA|COSTEÑA|COSTEÑITA|MICHELOB|MODELO|PILSEN|POKER|REDDS|STELLA|CORDILLERAS|HEINEKEN|LIGHT)\b/i', $n)) {
            return $categoriasCache['cervezas'] ?? $generalId;
        }

        // 3. Energizantes
        if (preg_match('/\b(SPEED|SPEED MAX|VIVE 100|VIVE100|RED BULL|REDBULL|AMPER|MONSTER|VOLT|PEAK)\b/i', $n)) {
            return $categoriasCache['energizantes'] ?? $generalId;
        }

        // 4. Hidratantes
        if (preg_match('/\b(GATORADE|POWERADE|SPORADE|SQUASH|FLASHLYTE|ELECTROLIT|PEDIALYTE)\b/i', $n)) {
            return $categoriasCache['hidratantes'] ?? $generalId;
        }

        // 5. Jugos
        if (preg_match('/\b(HIT|CIFRUT|TUTTI|VALLE|DEL VALLE|SAVILOE|FRUTTO|PULP)\b/i', $n)) {
            return $categoriasCache['jugos'] ?? $generalId;
        }

        // 6. Sodas
        if (preg_match('/\b(BRETAÑA|SODA|SCHWEPPES|TONICA|H2O|GINGER)\b/i', $n)) {
            return $categoriasCache['sodas'] ?? $generalId;
        }

        // 7. Aguas
        if (preg_match('/\b(AGUA|BRISA|CRISTAL|GLACIAL|CIELO|MANANTIAL|BOTELLON|SOPORTE BOTELLON)\b/i', $n)) {
            return $categoriasCache['aguas'] ?? $generalId;
        }

        // 8. Gaseosas
        if (preg_match('/\b(COCA COLA|COCA-COLA|PEPSI|POSTOBON|BIG COLA|KOLA ROMAN|SPRITE|QUATRO|CUATRO|QUA-SPRI|MANZANA|COLOMBIANA|NARANJADA|UVA|SEVEN UP|7 UP)\b/i', $n)) {
            return $categoriasCache['gaseosas'] ?? $generalId;
        }

        // 9. Bebidas (Té, Malta, etc.)
        if (preg_match('/\b(TEA|FUZE|HATSU|PONY MALTA|PONY|MALTA)\b/i', $n)) {
            return $categoriasCache['bebidas'] ?? $generalId;
        }

        // 10. Lácteos
        if (preg_match('/\b(LECHE|YOGUR|YOGURT|KUMIS|AVENA|QUESO|ALPINA|COLANTA)\b/i', $n)) {
            return $categoriasCache['lácteos'] ?? ($categoriasCache['lacteos'] ?? $generalId);
        }

        return $generalId;
    }

    /**
     * Auto-categoriza masivamente todos los productos activos de la base de datos.
     */
    public function autoCategorizar()
    {
        $categoriasCache = [];
        $categoriaNombres = [];
        foreach (Categoria::all() as $cat) {
            $key = strtolower(trim($cat->nombre));
            $categoriasCache[$key] = $cat->id;
            $categoriaNombres[$cat->id] = $cat->nombre;
        }

        $productos = Producto::all();
        $totalProcesados = count($productos);
        $totalActualizados = 0;
        $resumen = [];

        foreach ($productos as $p) {
            $nombreMarca = $p->id_marca ? (Marca::find($p->id_marca)?->nombre ?? '') : '';
            $catId = $this->determinarCategoriaId($p->nombre, $nombreMarca, $categoriasCache);
            $nombreCat = $categoriaNombres[$catId] ?? 'General';

            $resumen[$nombreCat] = ($resumen[$nombreCat] ?? 0) + 1;

            if ($p->id_categoria !== $catId) {
                $p->id_categoria = $catId;
                $p->save();
                $totalActualizados++;
            }
        }

        arsort($resumen);
        $detallePartes = [];
        foreach (array_slice($resumen, 0, 5) as $cat => $cant) {
            $detallePartes[] = "{$cant} {$cat}";
        }
        $detalleTexto = implode(', ', $detallePartes);

        return response()->json([
            'success' => true,
            'total_procesados' => $totalProcesados,
            'total_actualizados' => $totalActualizados,
            'resumen' => $resumen,
            'message' => "¡Auto-categorización exitosa! {$totalProcesados} productos clasificados ({$detalleTexto})."
        ]);
    }
}
