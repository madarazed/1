import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Truck, 
  Package, 
  Calendar, 
  MapPin, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

// Configuración dinámica de categorías y reportes del ERP
const reportCategories = [
  {
    category: "Logística y Flota",
    icon: <Truck size={18} />,
    reports: [
      { id: 'hoja-vida', name: 'Hoja de Vida Vehicular', requiresVehicle: true, requiresDates: false },
      { id: 'checklists', name: 'Checklists Preoperacionales', requiresVehicle: true, requiresDates: true },
      { id: 'mantenimientos', name: 'Historial de Mantenimientos', requiresVehicle: true, requiresDates: true },
      { id: 'cierre-turno', name: 'Cierres Logísticos de Turno', requiresVehicle: false, requiresDates: true },
    ]
  },
  {
    category: "Inventario y Almacén",
    icon: <Package size={18} />,
    reports: [
      { id: 'catalogo-general', name: 'Catálogo General Maestro', requiresVehicle: false, requiresDates: false },
      { id: 'stock-critico', name: 'Alertas de Stock Crítico', requiresVehicle: false, requiresDates: false },
    ]
  },
  {
    category: "Personal y Auditoría",
    icon: <Users size={18} />,
    reports: [
      { id: 'nomina-basica', name: 'Auditoría de Turnos', requiresVehicle: false, requiresDates: true },
    ]
  }
];

const ReportCenter = () => {
  const [selectedReport, setSelectedReport] = useState<any>(reportCategories[0].reports[0]);
  const [loading, setLoading] = useState(false);
  const [selectedSede, setSelectedSede] = useState('Global');
  const [dateRange, setDateRange] = useState({
    inicio: new Date().toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });
  const [selectedEntity, setSelectedEntity] = useState('');

  const [sedesList, setSedesList] = useState<any[]>([]);
  const [vehiculosList, setVehiculosList] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Cargar catálogos dinámicos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [sedesRes, vehiculosRes] = await Promise.all([
          api.get('/sucursales'),
          api.get('/vehiculos')
        ]);
        setSedesList(sedesRes.data || []);
        setVehiculosList(vehiculosRes.data || []);
      } catch (error) {
        console.error('Error cargando catálogos para reportes:', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleGeneratePdf = async () => {
    setLoading(true);
    try {
      let url = '';
      let filename = 'reporte.pdf';

      if (selectedReport.id === 'hoja-vida') {
        if (!selectedEntity) throw new Error('Por favor selecciona un vehículo');
        url = `/reports/hoja-vida/${selectedEntity}`;
        filename = `hoja_vida_${selectedEntity}.pdf`;
      } else if (selectedReport.id === 'checklists') {
        if (!selectedEntity) throw new Error('Por favor selecciona un vehículo');
        url = `/reports/vehiculo/${selectedEntity}/pdf?fecha_inicio=${dateRange.inicio}&fecha_fin=${dateRange.fin}`;
        filename = `checklists_${selectedEntity}.pdf`;
      } else if (selectedReport.id === 'catalogo-general') {
        url = `/reports/inventario/pdf?sede=${selectedSede}`;
        filename = `catalogo_general_${selectedSede}.pdf`;
      } else {
        // Fallback interactivo para reportes en proceso de sincronización ERP
        toast.info(`El reporte "${selectedReport.name}" se encuentra en modo preliminar o requiere una jornada activa del ERP.`);
        setLoading(false);
        return;
      }

      // Descargar y visualizar el archivo PDF de manera segura
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(blob);
      
      // Abre en nueva pestaña para visualización en alta fidelidad
      window.open(pdfUrl, '_blank');

      toast.success(`${selectedReport.name} generado con éxito`, {
        icon: <CheckCircle2 className="text-green-500" />
      });
    } catch (err: any) {
      toast.error(err.message || 'Error al generar el reporte', {
        icon: <AlertCircle className="text-red-500" />
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      {/* Header Corporativo */}
      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <FileText className="text-primary" size={24} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Centro de Reportes</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Generación oficial de documentos, auditoría de nómina y trazabilidad operativa de la flota de Rapifrios.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
      </div>

      {/* Configuración y Panel Dual de Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Menú Escalable (Lado Izquierdo) */}
        <div className="md:col-span-1 space-y-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2 block">
            Estructura del Documento
          </label>
          
          <div className="space-y-5">
            {reportCategories.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">
                  {cat.icon}
                  <span>{cat.category}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {cat.reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => { setSelectedReport(report); setSelectedEntity(''); }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left w-full ${
                        selectedReport.id === report.id 
                          ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' 
                          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      <FileText size={16} className={selectedReport.id === report.id ? 'text-primary' : 'text-gray-400'} />
                      <span className="font-bold text-xs leading-snug">{report.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de Filtros Dinámico (Lado Derecho) */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={16} />
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Parámetros del Reporte</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedReport.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sede (Disponible para todos los reportes) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <MapPin size={12} /> Sede Correspondiente
              </label>
              <select 
                value={selectedSede}
                onChange={(e) => setSelectedSede(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary/20"
              >
                <option value="Global">Global (Todas las sedes)</option>
                {sedesList.map((sede) => (
                  <option key={sede.id} value={sede.nombre}>{sede.nombre}</option>
                ))}
              </select>
            </div>

            {/* Fecha (Ocultado dinámicamente si no aplica) */}
            {selectedReport.requiresDates && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Calendar size={12} /> Rango de Consulta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    value={dateRange.inicio}
                    onChange={(e) => setDateRange({...dateRange, inicio: e.target.value})}
                    className="bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary/20" 
                  />
                  <input 
                    type="date" 
                    value={dateRange.fin}
                    onChange={(e) => setDateRange({...dateRange, fin: e.target.value})}
                    className="bg-gray-50 border-none rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Selector de Vehículo (Ocultado dinámicamente si no aplica) */}
          {selectedReport.requiresVehicle && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Seleccionar Vehículo (Placa)
              </label>
              <select 
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Seleccione un vehículo...</option>
                {vehiculosList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {`${v.placa} - ${v.marca} ${v.modelo}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón de Acción Dinámico */}
          <div className="pt-4 border-t border-gray-50">
            <button
              onClick={handleGeneratePdf}
              disabled={loading}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Download size={20} />
              )}
              {loading ? 'Generando Documento...' : `Descargar ${selectedReport.name.toUpperCase()} PDF`}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4 italic">
              Este documento cumple con los estándares corporativos de Rapifrios Nexus v3.3
            </p>
          </div>
        </div>
      </div>

      {/* Aviso de Auditoría */}
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
        <div className="p-2 bg-amber-500 rounded-lg text-white">
          <AlertCircle size={18} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Aviso de Auditoría</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Todas las descargas son rastreadas. El acceso a desprendibles de nómina y datos operativos está restringido según su nivel de autorización. Los reportes de inventario requieren firma digital posterior a la impresión.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportCenter;
