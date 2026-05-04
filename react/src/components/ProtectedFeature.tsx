import React from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedFeatureProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para renderizar condicionalmente características basadas en permisos y roles.
 * Ejemplo: <ProtectedFeature permission="edit_offers"> <EditButton /> </ProtectedFeature>
 */
export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { hasPermission, isLoading } = useAuth();

  if (isLoading) return null;

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
