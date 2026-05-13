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

  const query = `?v_fb=${new Date().getTime()}`;

  if (tried === 'none') {
    // PASO DE RESCATE 1: Intentar con el nombre EXACTO de la DB en la carpeta local (Vercel/Git)
    // Extraemos el nombre del archivo de la URL original (limpiando query params)
    const filename = originalUrl?.split('/').pop()?.split('?')[0] || '';
    
    if (filename && filename !== 'placeholder.jpg') {
      console.warn(`[Asset Shield] Fallo en Render para: "${productName}". Intentando rescate LOCAL EXACTO: /products/${filename}`);
      target.setAttribute('data-tried', 'exact');
      target.src = `/products/${filename}` + query;
    } else {
      // Si no hay nombre válido, saltar directamente al placeholder
      target.setAttribute('data-tried', 'placeholder');
      target.src = '/products/placeholder.jpg';
    }
  } else {
    // PASO DE RESCATE Final: Placeholder
    target.setAttribute('data-tried', 'placeholder');
    target.src = '/products/placeholder.jpg';
    console.error(`[Asset Shield] Fallo total de rescate para: "${productName}". Usando placeholder.`);
  }
};
