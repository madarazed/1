import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  Package, 
  Users, 
  BarChart3, 
  Truck, 
  Settings, 
  ChevronRight, 
  LogOut,
  Home,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Inicio', path: '/admin', icon: Home, exact: true },
    { name: 'Catálogo', path: '/admin/catalogo', icon: LayoutGrid },
    { name: 'Inventario', path: '/admin/inventario', icon: Package },
    { name: 'Logística', path: '/admin/logistica', icon: Truck },
    { name: 'Personal', path: '/admin/usuarios', icon: Users },
    { name: 'Reportes', path: '/admin/reportes', icon: FileText },
    { name: 'Contabilidad', path: '/admin/contabilidad', icon: BarChart3 },
    { name: 'Configuración', path: '/admin/configuracion', icon: Settings },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin');
  };

  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transition-transform duration-300 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="h-full flex flex-col p-6">
        <div className="flex items-center gap-3 mb-12 px-2">
          <img src="/logo.png" alt="Rapifrios" className="h-8" />
          <div className="flex flex-col">
            <span className="text-sm font-black text-primary uppercase italic tracking-tighter">Panel Admin</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">v2.0 Beta</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  active 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={active ? "text-white" : "text-primary/60 group-hover:text-primary"} />
                  <span className="text-sm font-bold">{item.name}</span>
                </div>
                {active && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-gray-50">
          <div className="mb-4 px-4 py-3 bg-gray-50 rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                {user?.nombre?.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-gray-800 truncate">{user?.nombre}</span>
                <span className="text-[10px] text-gray-500 truncate">{user?.roles?.[0]?.nombre}</span>
              </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
