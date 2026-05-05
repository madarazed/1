import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LogisticsCompliance from '../components/logistics/LogisticsCompliance';
import { 
  AlertTriangle, 
  Truck, 
  DollarSign,
  Users,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => api.get(url).then(res => res.data);

const KPICard = ({ title, value, icon: Icon, color, isCritical }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    animate={isCritical ? { scale: [1, 1.02, 1], boxShadow: ["0px 0px 0px rgba(239,68,68,0)", "0px 0px 20px rgba(239,68,68,0.3)", "0px 0px 0px rgba(239,68,68,0)"] } : {}}
    transition={isCritical ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
    className={`p-6 rounded-3xl border border-gray-100 shadow-sm transition-all ${isCritical ? 'bg-red-50/50' : 'bg-white'}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {isCritical && (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </div>
    <div className="flex flex-col">
      <span className="text-gray-500 text-sm font-medium">{title}</span>
      <span className="text-2xl font-black text-[#0F172A] mt-1">{value}</span>
    </div>
  </motion.div>
);

const DashboardOverview = () => {
  const navigate = useNavigate();
  
  const { data: overview, isLoading: loadingOverview } = useSWR('/dashboard/overview', fetcher, { refreshInterval: 60000 });
  const { data: proyeccion, isLoading: loadingProy } = useSWR('/nominas/proyeccion', fetcher, { refreshInterval: 60000 });
  const { data: alertasCriticas, isLoading: loadingAlertas } = useSWR('/notificaciones/alertas-criticas', fetcher, { refreshInterval: 60000 });

  if (loadingOverview || loadingProy || loadingAlertas) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] uppercase italic tracking-tighter">Panel de Control Operativo</h2>
          <p className="text-gray-500 text-sm">Gestión financiera y operativa centralizada de RAPIFRIOS NEXUS.</p>
        </div>
        <div className="bg-[#0F172A] px-4 py-2 rounded-xl">
          <span className="text-white font-black text-xs uppercase tracking-widest">Torre de Control</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Costo Proyectado Nómina" 
          value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(proyeccion?.neto_pagar_total || 0)} 
          icon={DollarSign} 
          color="bg-[#0F172A]"
        />
        <KPICard 
          title="Alertas de Documentación" 
          value={`${alertasCriticas?.alertas_documentacion_count || 0} Trámites`} 
          icon={AlertTriangle} 
          isCritical={alertasCriticas?.alertas_documentacion_count > 0}
          color={alertasCriticas?.alertas_documentacion_count > 0 ? "bg-red-500" : "bg-emerald-500"}
        />
        <KPICard 
          title="Vehículos Activos" 
          value={`${overview?.stats_operativas?.vehiculos_activos || 0} Unidades`} 
          icon={Truck} 
          color="bg-blue-600"
        />
        <KPICard 
          title="Personal en Turno" 
          value={`${overview?.stats_operativas?.repartidores_activos || 0} Repartidores`} 
          icon={Users} 
          color="bg-amber-500"
        />
      </div>

      {/* Main Operational Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications / Critical Alerts */}
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black uppercase italic tracking-tighter text-[#0F172A]">Vencimientos Críticos</h3>
            <Activity size={18} className="text-[#0F172A]" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <AnimatePresence>
              {alertasCriticas?.vehiculos_afectados?.length > 0 ? (
                alertasCriticas.vehiculos_afectados.map((v: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={v.id} 
                    className="p-4 rounded-2xl bg-red-50 border border-red-100 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-red-100 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-black text-red-900 uppercase">{v.placa}</h4>
                      <button 
                        onClick={() => navigate('/admin/logistica/vehiculos')}
                        className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        Actualizar <ArrowRight size={12} />
                      </button>
                    </div>
                    <div className="text-xs text-red-700 font-medium space-y-1">
                      <p>SOAT: {new Date(v.fecha_soat).toLocaleDateString('es-CO')}</p>
                      <p>Tecno: {new Date(v.fecha_tecnomecanica).toLocaleDateString('es-CO')}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center opacity-50">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                    <Truck size={24} />
                  </div>
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Flota Legalmente al Día</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Operational Status Chart */}
        <div className="lg:col-span-2 bg-[#0F172A] p-8 rounded-[2rem] text-white overflow-hidden relative">
          <div className="relative z-10 h-full flex flex-col">
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Auditoría Financiera - Mayo 2026</h3>
              <p className="text-sm text-slate-400 mb-8">Desglose del gasto de personal basado en asistencia real reportada.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-auto">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Salario Base</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(proyeccion?.salario_base_total || 0)}</span>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Horas Extra</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(proyeccion?.horas_extra_total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        </div>
      </div>

      {/* Cumplimiento Logístico Diario */}
      <div>
        <h2 className="text-xl font-black text-[#0F172A] uppercase italic tracking-tighter mb-4">Estado de Jornadas Laborales</h2>
        <LogisticsCompliance />
      </div>
    </div>
  );
};

export default DashboardOverview;
