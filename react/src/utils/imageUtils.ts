import { PRODUCTS_IMAGE_URL } from '../constants';

/**
 * Utilidad centralizada para resolución de imágenes.
 * Maneja la lógica de paths entre el backend (Render) y el frontend (Local/Git).
 */
export const getImageUrl = (url_imagen: string | null | undefined, isVip: boolean = false): string => {
  if (!url_imagen || url_imagen === 'placeholder.png' || url_imagen === 'placeholder.jpg' || url_imagen === 'placeholder.svg') {
    return '/products/placeholder.svg';
  }

  // Si ya es una URL completa (ej: S3 o externa)
  if (url_imagen.startsWith('http')) {
    return url_imagen;
  }

  const filename = url_imagen.split('/').pop() || '';
  
  // Las imágenes del catálogo residen directamente en /products servidas por Vercel / Vite
  const baseUrl = '/products';
  
  // Para VIP evitamos el timestamp para no romper el ciclo de vida del SmartImage
  if (isVip) {
    return `${baseUrl}/${filename}`;
  }
  
  return `${baseUrl}/${filename}?v=${new Date().getTime()}`;
};

/**
 * Sistema de Recuperación de Imágenes (Smart Fallback)
 * Si una imagen falla en el host local/Vercel (ej: subida reciente que aún no compila),
 * intenta rescatarla vía Raw CDN de GitHub (sin límites de API REST) o Render.
 */
export const handleImageError = (
  e: any, 
  _productName?: string,
  originalUrl?: string
) => {
  const target = e.currentTarget as HTMLImageElement;
  const tried = target.getAttribute('data-tried') || 'none';
  
  if (tried === 'placeholder' || tried === 'rescue_pending') return;

  if (tried === 'none') {
    const filename = originalUrl?.split('/').pop()?.split('?')[0] || '';
    
    if (filename && !filename.includes('placeholder')) {
      target.setAttribute('data-tried', 'rescue_pending');
      
      // Fallback 1: Raw GitHub CDN (inmortal y sin rate limit de 60 req/hr)
      const githubRawUrl = `https://raw.githubusercontent.com/madarazed/1/main/react/public/products/${filename}`;
      
      const img = new Image();
      img.onload = () => {
        target.setAttribute('data-tried', 'github_raw_success');
        target.src = githubRawUrl;
      };
      img.onerror = () => {
        // Fallback 2: Backend Render si aún reside en el disco temporal
        const renderUrl = `${PRODUCTS_IMAGE_URL}/${filename}`;
        const imgRender = new Image();
        imgRender.onload = () => {
          target.setAttribute('data-tried', 'render_success');
          target.src = renderUrl;
        };
        imgRender.onerror = () => {
          target.setAttribute('data-tried', 'placeholder');
          target.src = '/products/placeholder.svg';
        };
        imgRender.src = renderUrl;
      };
      img.src = githubRawUrl;
    } else {
      target.setAttribute('data-tried', 'placeholder');
      target.src = '/products/placeholder.svg';
    }
  } else {
    target.setAttribute('data-tried', 'placeholder');
    target.src = '/products/placeholder.svg';
  }
};
