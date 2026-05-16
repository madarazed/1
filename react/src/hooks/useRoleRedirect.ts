import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Custom Hook to handle role-based redirection.
 * Centralizes the logic to avoid duplication in Landing, Catalog, and VIP Portal.
 */
export const useRoleRedirect = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !user) return;

    const userRoles = user.roles?.map(r => r.nombre) || [];
    
    // 1. Admin & Office Roles
    const isAdmin = userRoles.some(r => 
      ['Superadmin', 'Admin Sucursal', 'Cajera', 'Contabilidad'].includes(r)
    );

    // 2. Logistics Roles
    const isLogistics = userRoles.some(r => 
      ['Repartidor', 'Conductor'].includes(r)
    );

    // 3. Client Role (VIP)
    const isClient = String(user.id_rol) === '6' || user.role === 'cliente';

    if (isAdmin) {
      navigate('/admin');
    } else if (isLogistics) {
      navigate('/repartidor/checkin');
    } else if (isClient) {
      // If we are already on the VIP portal, we don't need to redirect
      if (window.location.pathname !== '/vip-portal') {
        navigate('/vip-portal');
      }
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
};
