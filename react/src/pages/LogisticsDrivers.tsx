import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, User as UserIcon, CheckCircle2, XCircle, 
  AlertTriangle, ChevronRight, MapPin, Truck
} from 'lucide-react';

interface LogisticsUser {
  id: number;
  name: string;
  email: string;
  active_jornada?: {
    id: number;
    estado: string;
    vehiculo: {
      placa: string;
    }
  };
  has_checklist_today: boolean;
  pending_novedades_count: number;
}

const LogisticsDrivers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LogisticsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogisticsData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logistica/status');
      setUsers(res.data);
    } catch (err) {
      // Mock data for demo
      setUsers([
        { 
          id: 1, name: 'Juan Pérez', email: 'juan@rapifrios.com', 
          active_jornada: { id: 10, estado: 'Iniciada', vehiculo: { placa: 'ABC-123' } },
          has_checklist_today: true, pending_novedades_count: 1
        },
        { 
          id: 2, name: 'Carlos Ruiz', email: 'carlos@rapifrios.com', 
          has_checklist_today: false, pending_novedades_count: 0
        },
        { 
          id: 3, name: 'Mateo Gómez', email: 'mateo@rapifrios.com', 
          active_jornada: { id: 12, estado: 'Iniciada', vehiculo: { placa: 'XYZ-789' } },
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

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Gestión de Repartidores</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monitoreo de actividad y cumplimiento</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar repartidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Repartidor</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actividad</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Checklist Hoy</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => {
                const hasNovedades = u.pending_novedades_count > 0;

                return (
                  <tr 
                    key={u.id} 
                    className={`group hover:bg-gray-50/80 transition-all ${hasNovedades ? 'bg-yellow-50/30' : ''}`}
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
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> En Ruta
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase italic">Placa: {u.active_jornada.vehiculo.placa}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Inactivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {u.has_checklist_today ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <XCircle size={18} className="text-red-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/logistica/repartidor/${u.id}`)}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 ml-auto"
                      >
                        Gestionar <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LogisticsDrivers;
