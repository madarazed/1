<?php
$sql = file_get_contents(__DIR__ . '/u774017147_rapi (2).sql');

// Extract only the productos block
$start = strpos($sql, "-- Volcado de datos para la tabla `productos`");
$end   = strpos($sql, "-- --------------------------------------------------------", $start + 10);
$block = substr($sql, $start, $end - $start);

// Match all product rows
preg_match_all(
    '/\((\d+),\s*(\d+),\s*\'((?:[^\'\\\\]|\\\\.|\'\')*)\',\s*(NULL|\'(?:[^\'\\\\]|\\\\.)*\'),\s*([\d.]+),\s*\'((?:[^\'\\\\]|\\\\.)*)\',\s*(\d+)\)/',
    $block,
    $matches,
    PREG_SET_ORDER
);

echo "Filas encontradas: " . count($matches) . "\n";

$rows = [];
foreach ($matches as $m) {
    $id     = $m[1];
    $marca  = $m[2];
    $nombre = str_replace("'", "''", $m[3]);
    $desc   = ($m[4] === 'NULL') ? "''" : "'" . str_replace("'", "''", trim($m[4], "'")) . "'";
    $precio = $m[5];
    $img    = preg_replace('/^img\//', '', $m[6]);
    $stock  = ($m[7] === '1') ? 10 : 0;
    $rows[] = "({$id}, '{$nombre}', {$desc}, '{$img}', {$precio}, {$stock}, {$marca}, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
}

$output  = "-- ============================================================\n";
$output .= "-- productos_migracion.sql\n";
$output .= "-- Migración: id_producto->id, nombre_producto->nombre,\n";
$output .= "--   descripcion_producto->descripcion (''),\n";
$output .= "--   url_imagen_producto->url_imagen (sin 'img/'),\n";
$output .= "--   precio->precio, disponible->stock (1=10,0=0),\n";
$output .= "--   id_marca_fk->id_marca, id_categoria=NULL\n";
$output .= "-- ============================================================\n";
$output .= "SET NAMES utf8mb4;\n";
$output .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";
$output .= "INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `url_imagen`, `precio`, `stock`, `id_marca`, `id_categoria`, `created_at`, `updated_at`) VALUES\n";
$output .= implode(",\n", $rows) . ";\n\n";
$output .= "SET FOREIGN_KEY_CHECKS = 1;\n";

file_put_contents(__DIR__ . '/productos_migracion.sql', $output);
echo "Archivo productos_migracion.sql generado con " . count($rows) . " productos.\n";
