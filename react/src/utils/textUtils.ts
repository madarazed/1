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

/**
 * Normaliza precios en COP (Pesos Colombianos).
 * Corrige casos donde un precio en miles (como 18.000 COP) se recibió o persistió como 18 (< 100 COP).
 * Preserva intactos precios como 500, 1500, 18500, 24000, etc.
 */
export const normalizeProductPrice = (price: number | string | null | undefined): number => {
  if (price === null || price === undefined || price === '') return 0;
  const num = typeof price === 'string' ? parseFloat(price) : Number(price);
  if (isNaN(num) || num <= 0) return 0;
  if (num > 0 && num < 100) {
    return num * 1000;
  }
  return num;
};

/**
 * Formatea un monto a moneda colombiana COP oficial (ej: $ 18.000, $ 500).
 */
export const formatProductPrice = (amount: number | string | null | undefined): string => {
  const normalized = normalizeProductPrice(amount);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(normalized);
};

