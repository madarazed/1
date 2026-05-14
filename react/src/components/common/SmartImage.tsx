import React, { useState, useEffect, useRef } from 'react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  productName: string;
  originalUrl: string;
}

/**
 * SmartImage: Componente atómico para renderizado de assets con "Inmortalidad".
 * Maneja su propio estado de carga y rescate vía GitHub API para evitar
 * el parpadeo causado por re-renderizados de React.
 */
const SmartImage: React.FC<SmartImageProps> = ({ 
  productName, 
  originalUrl, 
  className,
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState(originalUrl);
  const rescueStatus = useRef<'none' | 'pending' | 'success' | 'failed'>('none');
  
  // Mantener sincronizado si la prop cambia externamente
  useEffect(() => {
    // Solo actualizamos si no hemos tenido éxito rescatando (para no perder el blob)
    if (rescueStatus.current !== 'success') {
      setCurrentSrc(originalUrl);
    }
  }, [originalUrl]);

  // Limpieza de memoria para Object URLs
  useEffect(() => {
    return () => {
      if (currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc);
      }
    };
  }, [currentSrc]);

  const handleRescue = async () => {
    if (rescueStatus.current !== 'none' && rescueStatus.current !== 'failed') return;
    
    const filename = originalUrl.split('/').pop()?.split('?')[0] || '';
    if (!filename || filename === 'placeholder.jpg') {
      setCurrentSrc('/products/placeholder.jpg');
      rescueStatus.current = 'failed';
      return;
    }

    rescueStatus.current = 'pending';
    console.warn(`[SmartImage] Iniciando rescate de "${productName}" desde GitHub...`);

    // Pequeño delay de cortesía para propagación de GitHub
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
      
      rescueStatus.current = 'success';
      setCurrentSrc(localUrl);
      console.log(`[SmartImage] ✅ Asset rescatado y nativizado: ${filename}`);
    } catch (err) {
      console.error(`[SmartImage] ❌ Fallo crítico en rescate: ${productName}`, err);
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
