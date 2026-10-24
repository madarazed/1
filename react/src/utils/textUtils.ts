/**
 * Utilidades de sanitización y formateo de texto para el catálogo y la plataforma.
 * Corrige problemas de codificación de caracteres (mojibake) generados por software contable
 * (como Syscafe) exportados en páginas de códigos DOS/Windows (CP437, CP850, Windows-1252).
 */

export const sanitizeProductName = (text: string | null | undefined): string => {
  if (!text) return '';

  return text
    // CP437 / CP850 mojibake
    .replace(/├æ/g, 'Ñ')
    .replace(/├±/g, 'ñ')
    .replace(/├ñ/g, 'ñ')
    .replace(/├\s/g, 'Á')
    .replace(/├ë/g, 'É')
    .replace(/├Í/g, 'Í')
    .replace(/├ô/g, 'Ó')
    .replace(/├Ü/g, 'Ú')
    .replace(/├í/g, 'á')
    .replace(/├©/g, 'é')
    .replace(/├¡/g, 'í')
    .replace(/├ó/g, 'ó')
    .replace(/├│/g, 'ó')
    .replace(/├ú/g, 'ú')
    .replace(/├║/g, 'ú')
    // Double-encoded UTF-8 artifacts
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã\s/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã\s/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/┬░/g, '°');
};
