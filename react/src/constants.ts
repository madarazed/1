export const SEDES = {
  CENTRO: { 
    id: 'centro',
    nombre: 'Centro (La 17)', 
    tel: '3124900547', 
    wa: '573124900547' 
  },
  SALADO: { 
    id: 'salado',
    nombre: 'El Salado', 
    tel: '3184915295', 
    wa: '573184915295' 
  }
};

// La URL del backend se infiere de VITE_API_URL si existe.
// Fallback EXPLÍCITO a la URL de producción de Render (NO localhost).
export const BACKEND_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
  : 'https://rapifrios-backend.onrender.com';

export const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;
export const PRODUCTS_IMAGE_URL = `${BACKEND_URL}/products`;
