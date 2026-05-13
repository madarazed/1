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
    // PASO DE RESCATE 1: Intentar vía GITHUB RAW (Bypass de Vercel Build Delay)
    // Extraemos el nombre del archivo de la URL original (limpiando query params)
    const filename = originalUrl?.split('/').pop()?.split('?')[0] || '';
    
    if (filename && filename !== 'placeholder.jpg') {
      const githubRawUrl = `https://raw.githubusercontent.com/madarazed/1/main/react/public/products/${filename}`;
      console.warn(`[Asset Shield] Fallo en Render para: "${productName}". Intentando rescate vía GITHUB RAW (Instant Bypass): ${filename}`);
      target.setAttribute('data-tried', 'github_raw');
      target.src = githubRawUrl + query;
    } else {
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
