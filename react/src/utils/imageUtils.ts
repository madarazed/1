import { PRODUCTS_IMAGE_URL } from '../constants';

/**
 * Utilidad centralizada para resolución de imágenes.
 * Maneja la lógica de paths entre el backend (Render) y el frontend (Local/Git).
 */
export const getImageUrl = (url_imagen: string | null | undefined, isVip: boolean = false): string => {
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
  
  // Para VIP evitamos el timestamp para no romper el ciclo de vida del SmartImage
  if (isVip) {
    return `${baseUrl}/${filename}`;
  }
  
  return `${baseUrl}/${filename}?v=${new Date().getTime()}`;
};

/**
 * Sistema de Recuperación de Imágenes (Smart Fallback)
 * Si una imagen falla (especialmente las VIP que se borran en Render),
 * intenta buscar una local en Git vía GitHub API para bypass de caché.
 */
export const handleImageError = (
  e: any, 
  productName: string,
  originalUrl?: string
) => {
  const target = e.currentTarget as HTMLImageElement;
  const tried = target.getAttribute('data-tried') || 'none';
  
  if (tried === 'placeholder' || tried === 'github_api_pending') return;

  if (tried === 'none') {
    const filename = originalUrl?.split('/').pop()?.split('?')[0] || '';
    
    if (filename && filename !== 'placeholder.jpg') {
      // Marcamos como pendiente y esperamos 1.5s para dar tiempo al commit de GitHub
      target.setAttribute('data-tried', 'github_api_pending');
      
      console.warn(`[Asset Shield] Fallo en Render para: "${productName}". Iniciando rescate vía GITHUB API en 1.5s...`);

      setTimeout(async () => {
        try {
          const githubApiUrl = `https://api.github.com/repos/madarazed/1/contents/react/public/products/${filename}`;
          
          const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3.raw'
          };

          const response: Response = await fetch(githubApiUrl, { headers });

          if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);

          const blob: Blob = await response.blob();
          const imageUrl: string = URL.createObjectURL(blob);
          
          target.setAttribute('data-tried', 'github_api_success');
          target.src = imageUrl;
          console.log(`[Asset Shield] Rescate EXITOSO vía GitHub API para: ${filename}`);
        } catch (err) {
          console.error(`[Asset Shield] Fallo en rescate GitHub API para: ${productName}`, err);
          target.setAttribute('data-tried', 'placeholder');
          target.src = '/products/placeholder.jpg';
        }
      }, 1500);
    } else {
      target.setAttribute('data-tried', 'placeholder');
      target.src = '/products/placeholder.jpg';
    }
  } else {
    // Si ya falló la API o cualquier otro intento previo
    target.setAttribute('data-tried', 'placeholder');
    target.src = '/products/placeholder.jpg';
  }
};
