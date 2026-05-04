import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, Truck, AlertTriangle, CheckCircle2, 
  ChevronRight, Calendar, Settings, Plus, UserPlus
} from 'lucide-react';

interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  tipo_vehiculo: string;
  estado: string;
  fecha_soat: string;
  fecha_tecnomecanica: string;
}

const LogisticsVehicles = () => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVehiculos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehiculos');
      setVehiculos(res.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      // Mock data for demo
      setVehiculos([
        { id: 1, placa: 'ABC-123', marca: 'Suzuki', modelo: 'Gixxer 250', tipo_vehiculo: 'Moto', estado: 'Activo', fecha_soat: '2026-04-28', fecha_tecnomecanica: '2026-10-10' },
        { id: 2, placa: 'XYZ-789', marca: 'Yamaha', modelo: 'NMAX', tipo_vehiculo: 'Moto', estado: 'Taller', fecha_soat: '2026-12-10', fecha_tecnomecanica: '2026-12-10' },
        { id: 3, placa: 'JKL-456', marca: 'Chevrolet', modelo: 'N300', tipo_vehiculo: 'Camioneta', estado: 'Activo', fecha_soat: '2026-05-02', fecha_tecnomecanica: '2026-08-15' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const isExpiringSoon = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays >= 0;
  };

  const filteredVehiculos = vehiculos.filter(v => v.placa.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Gestión de Flota</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Control técnico y asignación de vehículos</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Plus size={18} /> Nuevo Vehículo
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por placa..."
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
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehículo / Placa</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Documentación</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVehiculos.map((v) => {
                const soatAlert = isExpiringSoon(v.fecha_soat);
                const tecnoAlert = isExpiringSoon(v.fecha_tecnomecanica);

                return (
                  <tr key={v.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Truck size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800">{v.placa}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{v.marca} {v.modelo} • {v.tipo_vehiculo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${
                        v.estado === 'Activo' 
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {v.estado}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${soatAlert ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                            SOAT {v.fecha_soat} {soatAlert && <AlertTriangle size={10} />}
                          </span>
                          <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${tecnoAlert ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                            TECNO {v.fecha_tecnomecanica} {tecnoAlert && <AlertTriangle size={10} />}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-3 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm bg-primary/5">
                          <UserPlus size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/logistica/vehiculo/${v.placa}`)}
                          className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-white border border-primary/20 rounded-xl transition-all"
                        >
                          Ver Detalles
                        </button>
                      </div>
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

export default LogisticsVehicles;
