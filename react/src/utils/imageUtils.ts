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

  // Extraemos la primera palabra significativa (ej: CORONA, STELLA, AGUA)
  const firstName = productName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const query = `?v_fb=${new Date().getTime()}`;

  if (tried === 'none') {
    target.setAttribute('data-tried', 'ext_rotation');
    // Si era .jpg intenta .png del mismo path original
    if (originalUrl) {
      const baseUrl = originalUrl.split('?')[0];
      target.src = baseUrl.replace(/\.[^/.]+$/, ".png") + query;
    } else {
      target.src = `/products/${firstName}.jpg` + query;
    }
  } else if (tried === 'ext_rotation') {
    target.setAttribute('data-tried', 'local_guess_jpg');
    target.src = `/products/${firstName}.jpg` + query;
  } else if (tried === 'local_guess_jpg') {
    target.setAttribute('data-tried', 'local_guess_webp');
    target.src = `/products/${firstName}.webp` + query;
  } else if (tried === 'local_guess_webp') {
    target.setAttribute('data-tried', 'local_guess_png');
    target.src = `/products/${firstName}.png` + query;
  } else {
    target.setAttribute('data-tried', 'placeholder');
    target.src = '/products/placeholder.jpg';
  }
};
