import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  AlertTriangle, 
  Clock, 
  Send, 
  CheckCircle2, 
  X,
  Truck,
  Wrench,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';

interface Pendiente {
  id: number;
  name: string;
  placa_estimada: string;
}

interface Completado {
  id: number;
  name: string;
  checklist_id: number;
  estado_general: string;
}

interface Alerta {
  conductor: string;
  placa: string;
  descripcion: string;
  prioridad: string;
}

interface ComplianceData {
  pendientes: Pendiente[];
  completados: Completado[];
  alertas: Alerta[];
}

const COLORS = ['#10B981', '#F59E0B']; // Green for completed, Amber for pending

const LogisticsCompliance = () => {
  const [data, setData] = useState<ComplianceData>({ pendientes: [], completados: [], alertas: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Pendiente | null>(null);

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      const res = await api.get('/admin/logistica/cumplimiento');
      setData(res.data);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotify = async (driver: Pendiente) => {
    try {
      await api.post('/notificaciones/enviar-recordatorio', {
        user_id: driver.id,
        mensaje: `Recordatorio urgente: Por favor, completa tu checklist pre-operacional para el vehículo ${driver.placa_estimada}.`
      });
      toast.success(`Recordatorio enviado a ${driver.name}`);
      setTimeout(() => {
        setSelectedDriver(null);
      }, 500);
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
      toast.error('Error al enviar recordatorio');
    }
  };

  const chartData = [
    { name: 'Completados', value: data.completados.length },
    { name: 'Pendientes', value: data.pendientes.length }
  ];

  const total = data.completados.length + data.pendientes.length;
  const complianceRate = total > 0 ? Math.round((data.completados.length / total) * 100) : 0;
  
  let complianceColor = '#10B981'; // Green
  if (complianceRate < 50) complianceColor = '#EF4444'; // Red
  else if (complianceRate < 80) complianceColor = '#F59E0B'; // Orange

  const DYNAMIC_COLORS = [complianceColor, '#E2E8F0']; // Active color and gray for pending

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compliance Donut */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity size={100} />
          </div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest self-start w-full mb-4">
            Cumplimiento de Inspecciones
          </h3>
          <div className="h-[200px] w-full relative">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : total === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm font-bold text-gray-400 uppercase">Sin conductores asignados</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DYNAMIC_COLORS[index % DYNAMIC_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900">{complianceRate}%</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hoy</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pendientes List */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Pendientes ({data.pendientes.length})
            </h3>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-lg uppercase tracking-widest">
              Revisar
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
               Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl" />
              ))
            ) : data.pendientes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <CheckCircle2 size={32} className="text-green-500 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">100% Completado</p>
              </div>
            ) : (
              <AnimatePresence>
                {data.pendientes.map((p) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={p.id}
                    className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors flex items-center justify-between group cursor-pointer"
                    onClick={() => setSelectedDriver(p)}
                  >
                    <div>
                      <p className="font-black text-sm text-slate-900 uppercase">{p.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                        <Truck size={10} /> {p.placa_estimada}
                      </p>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Send size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Alertas Críticas */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Alertas ({data.alertas.length})
            </h3>
            {data.alertas.length > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
               Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />
              ))
            ) : data.alertas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <CheckCircle2 size={32} className="text-green-500 mb-2" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Sin Alertas Críticas</p>
              </div>
            ) : (
              <AnimatePresence>
                {data.alertas.map((a, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={i}
                    className="p-4 rounded-2xl border-2 border-red-100 hover:border-red-300 bg-red-50/30 transition-colors shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-sm text-slate-900 uppercase">{a.conductor}</p>
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest">
                        {a.prioridad}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-600 mb-2">{a.descripcion}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Truck size={10} /> Placa: <span className="text-slate-700">{a.placa}</span>
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Predicciones Placeholder (Fase 2) */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <Wrench size={200} />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
          <div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
              <Activity className="text-primary" />
              Predicciones de Mantenimiento
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Análisis predictivo de desgaste y consumo basado en IA (Próximamente)
            </p>
          </div>
          <button disabled className="mt-4 md:mt-0 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest opacity-50 cursor-not-allowed">
            Módulo Inactivo
          </button>
        </div>
      </div>

      {/* Modal Notificar */}
      {createPortal(
        <AnimatePresence>
          {selectedDriver && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative"
              >
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="text-amber-600" />
                </div>
                
                <h3 className="text-center text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Notificar Conductor
                </h3>
                <p className="text-center text-sm font-bold text-gray-500 mt-2 mb-6">
                  Enviar recordatorio a <span className="text-slate-900">{selectedDriver.name}</span> para que complete su inspección de hoy.
                </p>
                
                <button 
                  onClick={() => handleNotify(selectedDriver)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg shadow-amber-500/20"
                >
                  Enviar Recordatorio (WhatsApp)
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default LogisticsCompliance;
