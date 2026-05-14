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
  const filename = originalUrl.split('/').pop()?.split('?')[0] || '';
  
  // Estado inicial: Priorizar siempre lo que ya esté en la Bóveda
  const [currentSrc, setCurrentSrc] = useState(() => {
    return ASSET_VAULT[filename] || originalUrl;
  });

  const rescueStatus = useRef<'none' | 'pending' | 'success' | 'failed'>(
    ASSET_VAULT[filename] ? 'success' : 'none'
  );
  
  // Sincronización proactiva con la Bóveda
  useEffect(() => {
    const freshFilename = originalUrl.split('/').pop()?.split('?')[0] || '';
    if (ASSET_VAULT[freshFilename]) {
      setCurrentSrc(ASSET_VAULT[freshFilename]);
      rescueStatus.current = 'success';
    } else if (rescueStatus.current !== 'success') {
      setCurrentSrc(originalUrl);
      rescueStatus.current = 'none';
    }
  }, [originalUrl]);

  const handleRescue = async () => {
    // Si ya está en éxito (vault) o pendiente, no hacemos nada
    if (rescueStatus.current === 'success' || rescueStatus.current === 'pending') return;
    
    if (!filename || filename === 'placeholder.jpg') {
      setCurrentSrc('/products/placeholder.jpg');
      rescueStatus.current = 'failed';
      return;
    }

    rescueStatus.current = 'pending';
    console.warn(`[SmartImage] Vault Check: No hallado. Rescatando "${productName}" desde GitHub...`);

    // Delay para sincronización de commit
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const githubApiUrl = `https://api.github.com/repos/madarazed/1/contents/react/public/products/${filename}`;
      const response = await fetch(githubApiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw'
        }
      });

      if (!response.ok) throw new Error(`GitHub API: ${response.status}`);

      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);
      
      // PERSISTENCIA: Guardar en la bóveda externa
      ASSET_VAULT[filename] = localUrl;
      
      rescueStatus.current = 'success';
      setCurrentSrc(localUrl);
      console.log(`[SmartImage] ✅ Vault Update: Asset "${filename}" persistido para la sesión.`);
    } catch (err) {
      console.error(`[SmartImage] ❌ Vault Error: ${productName}`, err);
      rescueStatus.current = 'failed';
      setCurrentSrc('/products/placeholder.jpg');
    }
  };

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
