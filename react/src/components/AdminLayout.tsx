import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, HelpCircle 
} from 'lucide-react';
import HelpModal from './HelpModal';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

const AdminLayout = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Contenidos de ayuda por ruta
  const helpContents: Record<string, any> = {
    '/admin/catalogo': {
      title: 'Catálogo de Productos',
      description: 'Gestión maestra de productos, marcas y categorías de Rapifrios. Estos cambios afectan directamente lo que los clientes ven en la tienda virtual.',
      steps: [
        'Añadir Producto: Usa el botón "+ Nuevo Producto" y sube una fotografía real.',
        'Editar: Usa el icono de lápiz azul para modificar precios, nombres o marcas.',
        'Filtros Avanzados: Utiliza los selectores de "Marca" y "Categoría" en la parte superior para segmentar la lista.',
        'Búsqueda Inteligente: Escribe el nombre o marca en la barra para búsquedas rápidas.',
        'Promociones: Asigna Ofertas Relámpago (⚡) o del Día (🔥) para destacar productos.',
        'Gestión de Marcas: Usa el botón "Marcas" para administrar los fabricantes disponibles.'
      ],
      notes: [
        'El encabezado es estático: los filtros siempre estarán visibles mientras navegas.',
        'El stock NO se edita aquí, ve al módulo de Inventario.',
        'Los precios de oferta deben ser menores al precio normal para que se muestren correctamente.'
      ]
    },
    '/admin/inventario': {
      title: 'Control de Inventario',
      description: 'Módulo para actualizar existencias reales y cambiar de sede de trabajo.',
      steps: [
        'Cambiar Sede: Usa el selector para ver el stock de una sucursal específica.',
        'Actualizar Stock: Haz clic en el número de existencias para modificarlo.',
        'Bajas: Si un producto se daña, ajusta el número aquí directamente.'
      ],
      notes: [
        'Cada sede tiene su propio stock independiente.',
        'Si un producto llega a 0, dejará de ser visible para los clientes.'
      ]
    },
    '/admin/logistica': {
      title: 'Logística y Operaciones',
      description: 'Centro de mando para la distribución y entrega de pedidos.',
      steps: [
        'Gestión de Repartidores: Supervisa turnos, checklists y ubicación del personal.',
        'Gestión de Vehículos: Control técnico, legal y asignación de la flota.',
        'Torre de Control: Monitoreo en tiempo real de la operación diaria.'
      ],
      notes: [
        'Asegúrate de que cada vehículo tenga su SOAT al día.',
        'El sistema bloquea a repartidores que no completen su checklist diario.'
      ]
    },
    '/admin/logistica/repartidores': {
      title: 'Gestión de Repartidores',
      description: 'Panel de control del equipo de entrega.',
      steps: [
        'Ver Estado: El punto verde indica que el repartidor está en ruta activa.',
        'Checklist: Verifica que el icono sea verde (Cumplido) antes de asignar carga.',
        'Historial: Haz clic en el nombre para ver el rendimiento y jornadas pasadas.'
      ],
      notes: [
        'Las jornadas laborales se calculan restando automáticamente 1 hora de almuerzo.'
      ]
    },
    '/admin/logistica/vehiculos': {
      title: 'Gestión de Flota',
      description: 'Inventario técnico de los vehículos de la empresa.',
      steps: [
        'Alertas: Los textos en rojo indican documentos vencidos o por vencer.',
        'Asignación: Vincula un repartidor a un vehículo para habilitar su jornada.',
        'Mantenimiento: Registra novedades técnicas para programar revisiones.'
      ],
      notes: [
        'El kilometraje se actualiza automáticamente al finalizar cada jornada.'
      ]
    },
    '/admin/usuarios': {
      title: 'Gestión de Personal',
      description: 'Módulo integral para la administración de colaboradores y permisos.',
      steps: [
        'Filtros por Rol: Usa las pestañas superiores para ver el conteo y filtrar empleados.',
        'Numeración: La tabla se numera automáticamente para facilitar auditorías.',
        'Asignación de Vehículo: Al crear repartidores, selecciona su vehículo desde el selector inteligente.',
        'Seguridad: Solo existe un Superadmin. Los demás usuarios tienen roles operativos limitados.'
      ],
      notes: [
        'Suspender a un usuario le quita acceso inmediato al sistema sin borrar sus datos.',
        'El sistema previene la creación de múltiples Superadmins por seguridad.'
      ]
    },
    '/admin': {
      title: 'Torre de Control Operativa',
      description: 'Vista general de la salud financiera y logística en tiempo real. Aquí no ves ventas, sino el costo de la operación y el cumplimiento.',
      steps: [
        'Costo Proyectado Nómina: Estimación en vivo del gasto en salarios (Base + Horas Extra) según las jornadas registradas en el mes actual.',
        'Alertas de Documentación: Control estricto de los vehículos con SOAT o Tecnomecánica por vencer. Un indicador rojo significa atención urgente.',
        'Auditoría Financiera: Desglose exacto del gasto acumulado de mayo 2026 en salarios y recargos.',
        'Jornadas Laborales: Verifica qué conductores han completado sus inspecciones (verde), quiénes faltan (naranja) o presentan fallos críticos (rojo).'
      ],
      notes: [
        'Usa el botón "Actualizar" en la lista de vencimientos para renovar fechas directamente.',
        'Puedes enviar un recordatorio por WhatsApp a los conductores pendientes desde el panel de Jornadas.'
      ]
    },
    '/admin/reportes': {
      title: 'Centro de Reportes',
      description: 'Módulo oficial para la generación de documentos legales y operativos en formato PDF.',
      steps: [
        'Tipo de Reporte: Selecciona entre Nómina, Hoja de Vida Vehicular o Inventario.',
        'Filtros: Ajusta el rango de fechas y la sede para segmentar los datos.',
        'Entidad: Para nómina y vehículos, selecciona el registro específico que deseas exportar.',
        'Descarga: Haz clic en "Descargar Reporte PDF" para generar el archivo oficial.'
      ],
      notes: [
        'Los reportes de nómina incluyen desgloses automáticos según la legislación 2026.',
        'Las hojas de vida vehicular consolidan checklists y novedades de forma automática.'
      ]
    },
    '/admin/configuracion': {
      title: 'Configuración Maestra',
      description: 'Módulo de parametrización del sistema. Permite ajustar variables técnicas que afectan el comportamiento de toda la plataforma.',
      steps: [
        'Parámetros Globales: Actualiza valores como el Salario Mínimo o Auxilio de Transporte; estos impactan inmediatamente los cálculos de nómina.',
        'Sedes: Registra nuevas sucursales operativas.',
        'Categorías: Modifica la clasificación de productos para el catálogo público.'
      ],
      notes: [
        'Esta vista está restringida exclusivamente para el rol Superadmin.',
        'Las variables técnicas utilizan un sistema de caché para maximizar el rendimiento. Los cambios son instantáneos.'
      ]
    }
  };

  const currentHelp = helpContents[location.pathname] || {
    title: 'Panel Administrativo',
    description: 'Bienvenido al ecosistema de administración de Rapifrios.',
    steps: ['Navega usando el menú lateral.', 'Consulta la ayuda en cada sección para más detalles.'],
    notes: ['Mantén tu sesión protegida.', 'Cierra sesión al terminar tu jornada.']
  };

  // Security Guard
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-surface-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      '/admin': 'Dashboard',
      '/admin/catalogo': 'Catálogo',
      '/admin/inventario': 'Inventario',
      '/admin/usuarios': 'Personal',
      '/admin/reportes': 'Centro de Reportes',
      '/admin/contabilidad': 'Contabilidad',
      '/admin/logistica': 'Logística',
      '/admin/configuracion': 'Configuración'
    };
    return titles[location.pathname] || 'Panel Admin';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex overflow-hidden font-body">
      
      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Floating Toggle (Mobile) ── */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 left-6 z-50 p-4 bg-primary text-white rounded-2xl shadow-2xl lg:hidden hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Menu size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
        logout={logout} 
      />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-50 rounded-xl lg:hidden text-gray-500"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-black text-gray-800 uppercase italic tracking-tighter">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Help Button */}
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="p-2.5 bg-white text-[#0F172A] hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all group relative shadow-sm active:scale-95"
              title="Centro de Ayuda"
            >
              <HelpCircle size={22} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-gray-800">{user.nombre}</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {user.roles[0]?.nombre || 'Usuario'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                {user.nombre.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Help Modal */}
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        content={currentHelp} 
      />
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default AdminLayout;
