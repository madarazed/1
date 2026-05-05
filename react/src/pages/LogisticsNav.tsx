import { useNavigate } from 'react-router-dom';
import { Users, Truck, ChevronRight, Activity, ShieldCheck, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';

const LogisticsNav = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'repartidores',
      title: 'Gestión de Repartidores',
      description: 'Supervisa jornadas, rendimientos y checklists de los conductores.',
      icon: Users,
      color: 'bg-blue-500',
      path: '/admin/logistica/repartidores'
    },
    {
      id: 'vehiculos',
      title: 'Gestión de Vehículos',
      description: 'Control técnico, documentación legal y estado de la flota.',
      icon: Truck,
      color: 'bg-primary',
      path: '/admin/logistica/vehiculos'
    }
  ];

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="max-w-4xl">
        <h2 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter mb-2">Módulo de Logística</h2>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Panel Administrativo de Operaciones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(item.path)}
            className="group relative bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 text-left hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden"
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-0 group-hover:opacity-5 rounded-bl-[100%] transition-opacity`} />
            
            <div className="relative z-10">
              <div className={`w-20 h-20 ${item.color} rounded-[2rem] flex items-center justify-center text-white shadow-lg mb-8 group-hover:scale-110 transition-transform`}>
                <item.icon size={40} />
              </div>
              
              <h3 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter mb-4 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              
              <p className="text-sm font-bold text-gray-400 leading-relaxed mb-8">
                {item.description}
              </p>

              <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest group-hover:gap-4 transition-all">
                Ingresar Gestión <ChevronRight size={16} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="bg-gray-50 p-6 rounded-[2rem] flex items-center gap-4">
          <Activity size={20} className="text-green-500" />
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">En Ruta</p>
            <p className="text-lg font-black text-gray-800">12 Conductores</p>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-[2rem] flex items-center gap-4">
          <ShieldCheck size={20} className="text-blue-500" />
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Checklists Hoy</p>
            <p className="text-lg font-black text-gray-800">15 Realizados</p>
          </div>
        </div>
        <div className="bg-gray-50 p-6 rounded-[2rem] flex items-center gap-4">
          <ClipboardList size={20} className="text-orange-500" />
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Novedades</p>
            <p className="text-lg font-black text-gray-800">3 Pendientes</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LogisticsNav;
