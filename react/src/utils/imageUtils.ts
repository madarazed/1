import { PRODUCTS_IMAGE_URL } from '../constants';

/**
 * Utilidad centralizada para resolución de imágenes.
 * Maneja la lógica de paths entre el backend (Render) y el frontend (Local/Git).
 */
export const getImageUrl = (url_imagen: string | null | undefined): string => {
  if (!url_imagen || url_imagen === 'placeholder.png' || url_imagen === 'placeholder.jpg') {
    return '/products/placeholder.jpg';
  }

  // Si ya es una URL completa (ej: S3 o externa)
  if (url_imagen.startsWith('http')) {
    return url_imagen;
  }

  const filename = url_imagen.split('/').pop() || '';
  
  // Si el nombre tiene un guion bajo, es una subida del backend (Render)
  const baseUrl = filename.includes('_') ? PRODUCTS_IMAGE_URL : '/products';
  return `${baseUrl}/${filename}?v=${new Date().getTime()}`;
};

/**
 * Sistema de Recuperación de Imágenes (Smart Fallback)
 * Si una imagen falla (especialmente las VIP que se borran en Render),
 * intenta buscar una local en Git basada en el nombre del producto.
 */
export const handleImageError = (
  e: any, 
  productName: string,
  originalUrl?: string
) => {
  const target = e.currentTarget;
  const tried = target.getAttribute('data-tried') || 'none';
  
  if (tried === 'placeholder') return;

  // Mapeo Forense: Normalizado Completo y Nombre Simple
  const normalized = productName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const simple = productName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const query = `?v_fb=${new Date().getTime()}`;

  // Log de Depuración Forense
  console.warn(`[Asset Shield] Fallo en Render para: "${productName}". Intentando rescate desde Git (Paso: ${tried})`);

  if (tried === 'none') {
    target.setAttribute('data-tried', 'local_full_png');
    target.src = `/products/${normalized}.png` + query;
  } else if (tried === 'local_full_png') {
    target.setAttribute('data-tried', 'local_full_jpg');
    target.src = `/products/${normalized}.jpg` + query;
  } else if (tried === 'local_full_jpg') {
    target.setAttribute('data-tried', 'local_simple_png');
    target.src = `/products/${simple}.png` + query;
  } else if (tried === 'local_simple_png') {
    target.setAttribute('data-tried', 'local_simple_jpg');
    target.src = `/products/${simple}.jpg` + query;
  } else if (tried === 'local_simple_jpg') {
    target.setAttribute('data-tried', 'local_simple_webp');
    target.src = `/products/${simple}.webp` + query;
  } else {
    target.setAttribute('data-tried', 'placeholder');
    target.src = '/products/placeholder.jpg';
    console.error(`[Asset Shield] Fallo total de rescate para: "${productName}". Usando placeholder.`);
  }
};
