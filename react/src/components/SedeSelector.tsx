import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, ChevronDown } from 'lucide-react';

interface SedeSelectorProps {
  variant?: 'light' | 'dark';
}

export const SedeSelector: React.FC<SedeSelectorProps> = ({ variant = 'light' }) => {
  const { user, activeSede, sucursales, updateActiveSede, roles } = useAuth();

  // Solo mostrar si el usuario es Admin Sucursal o Superadmin
  const canChangeSede = roles.includes('Admin Sucursal') || roles.includes('Superadmin');

  if (!user || !canChangeSede) return null;

  const isDark = variant === 'dark';

  return (
    <div className="relative group">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${
        isDark 
          ? 'bg-gray-100/50 border-gray-200 text-primary hover:bg-gray-100' 
          : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20'
      }`}>
        <MapPin size={16} className={isDark ? 'text-primary' : 'text-primary-light'} />
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'opacity-70'}`}>Sede Activa</span>
          <span className="text-xs font-black uppercase italic tracking-tighter">
            {activeSede ? activeSede.nombre : 'Sin Sede'}
          </span>
        </div>
        <ChevronDown size={14} className={`ml-2 transition-transform group-hover:rotate-180 ${isDark ? 'text-primary opacity-50' : 'opacity-50'}`} />
      </div>

      {/* Dropdown */}
      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="px-4 py-2 border-b border-gray-50 mb-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cambiar Sede</span>
        </div>
        {sucursales.map((sede) => (
          <button
            key={sede.id}
            onClick={() => updateActiveSede(sede.id)}
            className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-between ${
              activeSede?.id === sede.id ? 'text-primary bg-primary/5' : 'text-gray-600'
            }`}
          >
            {sede.nombre}
            {activeSede?.id === sede.id && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
