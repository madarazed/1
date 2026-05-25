import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import api from '../services/api';
import { 
  User as UserIcon, CheckCircle2, 
  ChevronRight, AlertTriangle, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then(res => res.data);

const LogisticsDrivers = () => {
  const navigate = useNavigate();
  
  // Consumo estricto sin mocks ni catch hardcodeados
  const { data, error, isLoading } = useSWR('/admin/logistica/cumplimiento', fetcher, { 
    refreshInterval: 60000 
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Gestión de Repartidores</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Auditoría en tiempo real de operaciones y ausencias
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div 
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Skeleton Izquierda */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded-xl w-1/3 animate-pulse" />
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-[2rem] animate-pulse" />
              ))}
            </div>
            {/* Skeleton Derecha */}
            <div className="space-y-4">
              <div className="h-8 bg-red-100 rounded-xl w-1/3 animate-pulse" />
              {[1,2].map(i => (
                <div key={i} className="h-24 bg-red-50 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 text-red-500 p-8 rounded-[2.5rem] border border-red-100 flex flex-col items-center justify-center text-center"
          >
            <AlertTriangle size={48} className="mb-4" />
            <h3 className="text-xl font-black uppercase tracking-widest">Error de Conexión</h3>
            <p className="text-sm font-bold opacity-80">No se pudo cargar el resumen de cumplimiento.</p>
          </motion.div>
        )}

        {data && (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Columna Izquierda: Cumplieron */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">Completados</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operativos en ruta</p>
                </div>
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {data.completados?.length > 0 ? (
                  data.completados.map((user: any) => (
                    <div 
                      key={user.id} 
                      className="group p-5 rounded-3xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 tracking-tighter">{user.name}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mt-1 inline-block ${
                            user.estado_general === 'Bueno' ? 'bg-green-100 text-green-700' :
                            user.estado_general === 'Regular' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            Estado: {user.estado_general}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/admin/logistica/repartidor/${user.id}`)}
                        className="w-10 h-10 bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 rounded-xl flex items-center justify-center transition-all shadow-sm"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-300">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">Ningún conductor operativo</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Ausentes / Pendientes */}
            <div className="bg-red-50 p-6 md:p-8 rounded-[2.5rem] border border-red-100 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 text-red-500/5 rotate-12">
                <AlertTriangle size={150} />
              </div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-red-900 uppercase italic tracking-tighter">Ausentes / Pendientes</h3>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Sin registro hoy</p>
                </div>
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <span className="font-black text-xl italic tracking-tighter">{data.pendientes?.length || 0}</span>
                </div>
              </div>

              <div className="space-y-4 flex-1 relative z-10">
                {data.pendientes?.length > 0 ? (
                  data.pendientes.map((user: any) => (
                    <div 
                      key={user.id} 
                      className="p-5 rounded-3xl bg-white border border-red-100 shadow-sm hover:shadow-md hover:border-red-300 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-red-900 tracking-tighter">{user.name}</p>
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-0.5">
                            Placa Estimada: <span className="font-black">{user.placa_estimada}</span>
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/admin/logistica/repartidor/${user.id}`)}
                        className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-500 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-colors flex items-center gap-1"
                      >
                        Gestionar <ChevronRight size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-red-300">
                    <CheckCircle2 size={48} className="mb-4 opacity-50" />
                    <p className="text-xs font-black uppercase tracking-widest text-red-400">Todo el personal está activo</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogisticsDrivers;
