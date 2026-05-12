import { PRODUCTS_IMAGE_URL } from '../constants';

/**
 * Función única y global para resolver URLs de imágenes.
 * Soporta:
 * 1. URLs absolutas (http...)
 * 2. Imágenes subidas al backend (con guion bajo _) -> PRODUCTS_IMAGE_URL
 * 3. Imágenes legacy o manuales (sin guion bajo) -> Carpeta /products del frontend
 * Incluye Cache Buster (?v=timestamp) para evitar persistencia de placeholders.
 */
export const getImageUrl = (url_imagen: string | null | undefined): string => {
  if (!url_imagen || url_imagen === 'placeholder.png' || url_imagen === 'placeholder.jpg') {
    return '/products/placeholder.jpg';
  }
  
  if (url_imagen.startsWith('http')) {
    return url_imagen;
  }

  const filename = url_imagen.split('/').pop() || '';
  
  // Si el nombre tiene un guion bajo, es una subida del backend (Render)
  const baseUrl = filename.includes('_') ? PRODUCTS_IMAGE_URL : '/products';
  
  // Añadimos cache buster para asegurar que la imagen se refresque
  return `${baseUrl}/${filename}?v=${new Date().getTime()}`;
};
