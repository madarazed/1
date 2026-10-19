import React, { useState, useEffect, useRef } from 'react';

/**
 * ASSET_VAULT: Bóveda de Assets externa.
 * Almacena las URLs de blobs rescatadas para que sobrevivan al desmontaje
 * de componentes (ej: al abrir el carrito) sin necesidad de re-descargar.
 */
const ASSET_VAULT: Record<string, string> = {};

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  productName: string;
  originalUrl: string;
}

/**
 * SmartImage: Componente con persistencia de sesión vía ASSET_VAULT.
 * Garantiza que el rescate de assets VIP sea "One-Time" (una sola vez).
 */
const SmartImage: React.FC<SmartImageProps> = ({ 
  productName, 
  originalUrl, 
  className,
  ...props 
}) => {
  // Bóveda persistente (Se mantiene entre re-renders y remounts)
  const filename = originalUrl.split('/').pop()?.split('?')[0] || '';
  
  // Estado inicial: Priorizar siempre lo que ya esté en la Bóveda
  const [currentSrc, setCurrentSrc] = useState(() => {
    return ASSET_VAULT[filename] || originalUrl;
  });

  const rescueStatus = useRef<'none' | 'pending' | 'success' | 'failed'>(
    ASSET_VAULT[filename] ? 'success' : 'none'
  );
  
  // Sincronización proactiva: Evitar que re-renders pisen un rescate en curso o exitoso
  useEffect(() => {
    const freshFilename = originalUrl.split('/').pop()?.split('?')[0] || '';
    
    if (ASSET_VAULT[freshFilename]) {
      // Si ya está en la bóveda, forzamos esa URL
      setCurrentSrc(ASSET_VAULT[freshFilename]);
      rescueStatus.current = 'success';
    } else if (rescueStatus.current !== 'success' && rescueStatus.current !== 'pending') {
      // SOLO si no estamos rescatando ni hemos tenido éxito, permitimos volver al original
      setCurrentSrc(originalUrl);
      rescueStatus.current = 'none';
    }
  }, [originalUrl]);

  const handleRescue = async () => {
    if (rescueStatus.current === 'success' || rescueStatus.current === 'pending') return;
    
    if (!filename || filename.includes('placeholder')) {
      setCurrentSrc('/products/placeholder.svg');
      rescueStatus.current = 'failed';
      return;
    }

    rescueStatus.current = 'pending';
    console.warn(`[SmartImage] Vault Check: MISS. Rescatando "${productName}"...`);

    try {
      // Rescate directo vía Raw CDN de GitHub (inmortal, sin rate-limit de 60 req/hr de la API REST)
      const githubRawUrl = `https://raw.githubusercontent.com/madarazed/1/main/react/public/products/${filename}`;
      const response = await fetch(githubRawUrl);

      if (!response.ok) {
        // Segundo intento: Backend Render
        const renderUrl = `/products/${filename}`;
        const renderRes = await fetch(renderUrl);
        if (!renderRes.ok) throw new Error(`Asset not found: ${response.status}`);
        const blob = await renderRes.blob();
        const localUrl = URL.createObjectURL(blob);
        ASSET_VAULT[filename] = localUrl;
        rescueStatus.current = 'success';
        setCurrentSrc(localUrl);
        return;
      }

      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      
      // PERSISTENCIA GLOBAL
      ASSET_VAULT[filename] = localUrl;
      
      rescueStatus.current = 'success';
      setCurrentSrc(localUrl);
      console.log(`[SmartImage] ✅ Vault Update: ${filename} nativizado.`);
    } catch (err) {
      console.error(`[SmartImage] ❌ Vault Error: ${productName}`, err);
      rescueStatus.current = 'failed';
      setCurrentSrc('/products/placeholder.svg');
    }
  };

  // Mientras rescatamos (delay de 1.5s), mostramos Skeleton Loader
  if (rescueStatus.current === 'pending') {
    return (
      <div className={`bg-gray-100 animate-pulse rounded-2xl flex flex-col items-center justify-center p-4 ${className}`}>
         <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mb-2" />
         <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">Rescatando Asset...</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      className={className}
      onError={handleRescue}
      {...props}
    />
  );
};

export default SmartImage;
