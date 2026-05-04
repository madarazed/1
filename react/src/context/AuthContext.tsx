import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface Role {
  id: number;
  nombre: string;
}

interface Sucursal {
  id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
}

interface User {
  id: number;
  nombre: string;
  email: string;
  id_sucursal_actual: number | null;
  roles: Role[];
  sucursal_actual?: Sucursal;
}

interface AuthContextType {
  user: User | null;
  roles: string[];
  activeSede: Sucursal | null;
  sucursales: Sucursal[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateActiveSede: (id_sucursal: number) => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/me');
          setUser(res.data.user);
          setSucursales(res.data.sucursales);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    const { access_token, user, sucursales } = res.data;
    localStorage.setItem('token', access_token);
    setUser(user);
    setSucursales(sucursales);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateActiveSede = async (id_sucursal: number) => {
    const res = await api.post('/user/update-sede', { id_sucursal });
    setUser(res.data.user);
  };

  const roles = user?.roles.map(r => r.nombre) || [];
  const activeSede = user?.sucursal_actual || null;

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // a) Superadmin -> Acceso total
    if (roles.includes('Superadmin')) return true;

    // b) Lógica Admin Sucursal para ofertas
    if (roles.includes('Admin Sucursal')) {
      if (permission === 'edit_offers') {
        // La lógica de 'Centro' debe ser por ID o nombre cargado dinámicamente
        // En este caso, verificamos si la sede activa es 'Centro'
        return activeSede?.nombre === 'Centro';
      }
    }

    // Otros roles
    return roles.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      roles, 
      activeSede, 
      sucursales, 
      login, 
      logout, 
      updateActiveSede, 
      isLoading,
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
