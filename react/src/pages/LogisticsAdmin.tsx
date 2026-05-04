import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, Truck, User as UserIcon, CheckCircle2, XCircle, 
  AlertTriangle, History, ExternalLink, Calendar, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogisticsUser {
  id: number;
  name: string;
  email: string;
  active_jornada?: {
    id: number;
    estado: string;
    vehiculo: {
      placa: string;
      marca: string;
      fecha_soat: string;
      fecha_tecnomecanica: string;
    }
  };
  has_checklist_today: boolean;
  pending_novedades_count: number;
}

const LogisticsAdmin = () => {
  const [users, setUsers] = useState<LogisticsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<LogisticsUser | null>(null);

  const fetchLogisticsData = async () => {
    setLoading(true);
    try {
      // Endpoint ficticio o extendido para admin de logística
      const res = await api.get('/admin/logistica/status');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching logistics admin data:', err);
      // Fallback para demo
      setUsers([
        { 
          id: 1, name: 'Juan Pérez', email: 'juan@rapifrios.com', 
          active_jornada: { id: 10, estado: 'Iniciada', vehiculo: { placa: 'ABC-123', marca: 'Suzuki', fecha_soat: '2026-04-28', fecha_tecnomecanica: '2026-05-10' } },
          has_checklist_today: true, pending_novedades_count: 1
        },
        { 
          id: 2, name: 'Carlos Ruiz', email: 'carlos@rapifrios.com', 
          has_checklist_today: false, pending_novedades_count: 0
        },
        { 
          id: 3, name: 'Mateo Gómez', email: 'mateo@rapifrios.com', 
          active_jornada: { id: 12, estado: 'Iniciada', vehiculo: { placa: 'XYZ-789', marca: 'Yamaha', fecha_soat: '2026-04-20', fecha_tecnomecanica: '2026-12-10' } },
          has_checklist_today: true, pending_novedades_count: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const isExpiringSoon = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 5;
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary">
              <Truck size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Torre de Control</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monitoreo de Flota y Personal</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Repartidores Activos</span>
          <span className="text-3xl font-black text-primary italic tracking-tighter">
            {users.filter(u => u.active_jornada).length}
          </span>
        </div>

        <div className="bg-orange-500 p-6 rounded-[2.5rem] shadow-xl shadow-orange-500/20 text-white flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Alertas Técnicas</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black italic tracking-tighter">
              {users.filter(u => u.active_jornada && (isExpiringSoon(u.active_jornada.vehiculo.fecha_soat) || isExpiringSoon(u.active_jornada.vehiculo.fecha_tecnomecanica))).length}
            </span>
            <AlertTriangle size={20} className="animate-bounce" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar repartidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
            Asignar Vehículo
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Repartidor</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehículo</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Checklist</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Novedades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => {
                const hasAlert = u.active_jornada && (isExpiringSoon(u.active_jornada.vehiculo.fecha_soat) || isExpiringSoon(u.active_jornada.vehiculo.fecha_tecnomecanica));
                const hasNovedades = u.pending_novedades_count > 0;

                return (
                  <tr 
                    key={u.id} 
                    onClick={() => setSelectedUser(u)}
                    className={`group cursor-pointer hover:bg-gray-50/80 transition-all ${hasNovedades ? 'bg-yellow-50/30' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <UserIcon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800">{u.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.active_jornada ? (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-primary uppercase tracking-tighter">{u.active_jornada.vehiculo.placa}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">{u.active_jornada.vehiculo.marca}</span>
                          </div>
                          {hasAlert && (
                            <AlertTriangle size={14} className="text-orange-500 animate-pulse" />
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 italic">No asignado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                        u.active_jornada 
                          ? 'text-green-600 bg-green-50 border-green-100' 
                          : 'text-gray-400 bg-gray-50 border-gray-100'
                      }`}>
                        {u.active_jornada ? 'En Ruta' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {u.has_checklist_today ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <XCircle size={18} className="text-red-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.pending_novedades_count > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full animate-pulse">
                          {u.pending_novedades_count} Pendiente
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300">Sin novedades</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User History Modal (Simplified for demo) */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-4xl rounded-t-[3rem] md:rounded-[3rem] shadow-2xl overflow-hidden h-[90vh] md:h-auto max-h-[90vh] flex flex-col"
            >
              <div className="p-8 bg-primary text-white flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20">
                    <UserIcon size={40} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">{selectedUser.name}</h3>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Historial Logístico • {selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Recent Shifts */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <History size={14} /> Jornadas Recientes
                    </h4>
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Calendar size={18} className="text-primary opacity-40" />
                            <div>
                              <p className="text-sm font-black text-gray-800">Abril {25-i}, 2026</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">8.5 Horas • Km: 12.450 - 12.580</p>
                            </div>
                          </div>
                          <ExternalLink size={14} className="text-primary opacity-20" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Truck size={14} /> Vehículo Actual
                    </h4>
                    {selectedUser.active_jornada ? (
                      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-primary/5">
                          <Truck size={80} />
                        </div>
                        <div className="relative z-10">
                          <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-md uppercase tracking-widest">Placa: {selectedUser.active_jornada.vehiculo.placa}</span>
                          <h5 className="text-2xl font-black text-gray-800 uppercase italic mt-2">{selectedUser.active_jornada.vehiculo.marca}</h5>
                          
                          <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-gray-400 uppercase">Vencimiento SOAT</span>
                              <span className={`uppercase ${isExpiringSoon(selectedUser.active_jornada.vehiculo.fecha_soat) ? 'text-orange-500' : 'text-gray-700'}`}>
                                {selectedUser.active_jornada.vehiculo.fecha_soat}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-gray-400 uppercase">Vencimiento Tecno</span>
                              <span className="text-gray-700 uppercase">{selectedUser.active_jornada.vehiculo.fecha_tecnomecanica}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-100/50 p-12 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <MapPin size={32} className="text-gray-300 mb-2" />
                        <p className="text-xs font-bold text-gray-400 uppercase">Sin vehículo asignado actualmente</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogisticsAdmin;
