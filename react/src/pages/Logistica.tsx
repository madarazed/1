import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ChecklistWizard from '../components/ChecklistWizard';
import JornadaComponent from '../components/JornadaComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, User, ChevronRight, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Logistica = () => {
  const { id } = useParams();
  const { user: currentUser, activeSede } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<number | null>(null);
  const [vehiculoActual, setVehiculoActual] = useState<any>(null);

  React.useEffect(() => {
    // Simulación de carga de vehículo asignado
    // En producción esto vendría de un endpoint /api/me/vehiculo-asignado
    setVehiculoActual({
      id: 1,
      placa: 'ABC-123',
      tipo_vehiculo: 'moto', // Puede ser 'moto', 'carro', 'camion'
      marca: 'Suzuki',
      modelo: 'Gixxer 250'
    });
  }, [id]);

  // En un caso real, si hay ID, haríamos fetch del usuario con ese ID.
  // Para demo, simulamos que estamos viendo a ese usuario.
  const isManaging = !!id;
  const targetUser = isManaging ? { name: `Repartidor #${id}`, role: 'Repartidor' } : currentUser;

  const handleRequireChecklist = (vehiculoId: number) => {
    setSelectedVehiculo(vehiculoId);
    setShowWizard(true);
  };

  if (showWizard && vehiculoActual) {
    return (
      <ChecklistWizard 
        vehiculoId={vehiculoActual.id} 
        tipoVehiculo={vehiculoActual.tipo_vehiculo}
        onComplete={() => setShowWizard(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {isManaging && (
        <div className="bg-orange-500 text-white p-3 text-center text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <ShieldCheck size={14} /> Modo Gestión de Administrador • Viendo Perfil de {targetUser?.name}
        </div>
      )}
      
      {/* Header */}
      <div className="bg-primary pt-12 pb-20 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        
        <div className="flex items-center justify-between relative z-10 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <User className="text-white" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                {isManaging ? 'Gestionando a:' : 'Bienvenido,'}
              </p>
              <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">{targetUser?.name || 'Repartidor'}</h1>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
            <Settings size={20} />
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <MapPin className="text-white" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Sede Actual</p>
              <p className="text-sm font-bold text-white uppercase italic">{activeSede?.nombre || 'General'}</p>
            </div>
          </div>
          <ChevronRight className="text-white/30" />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 -mt-8 relative z-20 space-y-6">
        {/* Vehículo Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center text-primary">
              <Truck size={32} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-800 uppercase italic tracking-tighter">Vehículo Asignado</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-widest">
                  PLACA: {vehiculoActual?.placa || 'Cargando...'}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase italic">
                  {vehiculoActual?.tipo_vehiculo || 'Tipo'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowWizard(true)}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all"
          >
            <ClipboardCheck size={20} />
          </button>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Entregas Hoy</span>
            <span className="text-3xl font-black italic text-primary">12</span>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Puntos Gose</span>
            <span className="text-3xl font-black italic text-orange-500">450</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Actividad Reciente</h3>
          <div className="bg-white p-4 rounded-[2rem] border border-gray-50 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">Checklist aprobado correctamente</p>
                <p className="text-[10px] text-gray-400 font-bold">Hoy, 08:30 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700">Inicio de jornada registrado</p>
                <p className="text-[10px] text-gray-400 font-bold">Hoy, 08:32 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Jornada Component */}
      <JornadaComponent onRequireChecklist={handleRequireChecklist} />
    </div>
  );
};

// Internal icon for help
const ClipboardCheck = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="m9 14 2 2 4-4"/>
  </svg>
);

export default Logistica;
