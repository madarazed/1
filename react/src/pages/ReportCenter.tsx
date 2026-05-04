import React, { useState, useEffect } from 'react'; // Re-saved to detect sonner
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Truck, 
  Package, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const ReportCenter = () => {
  const [reportType, setReportType] = useState('nomina');
  const [loading, setLoading] = useState(false);
  const [selectedSede, setSelectedSede] = useState('Global');
  const [dateRange, setDateRange] = useState({
    inicio: new Date().toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState('');

  // Cargar entidades según el tipo de reporte
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        if (reportType === 'nomina') {
          const res = await api.get('/nominas');
          setEntities(res.data.data);
        } else if (reportType === 'vehiculo') {
          const res = await api.get('/vehiculos');
          setEntities(res.data);
        }
      } catch (err) {
        console.error('Error fetching entities', err);
      }
    };
    fetchEntities();
  }, [reportType]);

  const handleGeneratePdf = async () => {
    setLoading(true);
    try {
      let url = '';
      let filename = 'reporte.pdf';

      if (reportType === 'nomina') {
        if (!selectedEntity) throw new Error('Selecciona una nómina');
        url = `/reports/nomina/${selectedEntity}/pdf`;
        filename = `desprendible_pago.pdf`;
      } else if (reportType === 'vehiculo') {
        if (!selectedEntity) throw new Error('Selecciona un vehículo');
        url = `/reports/vehiculo/${selectedEntity}/pdf?fecha_inicio=${dateRange.inicio}&fecha_fin=${dateRange.fin}`;
        filename = `hoja_vida_vehicular.pdf`;
      } else if (reportType === 'inventario') {
        url = `/reports/inventario/pdf?sede=${selectedSede}`;
        filename = `reporte_inventario.pdf`;
      }

      // Descargar el archivo
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      toast.success('Reporte generado correctamente', {
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
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <FileText className="text-primary" size={24} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Centro de Reportes</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Generación oficial de documentos, auditoría de nómina y trazabilidad operativa de la flota.
          </p>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
      </div>

      {/* Configuración del Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tipo de Reporte */}
        <div className="md:col-span-1 space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Estructura del Documento</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'nomina', label: 'Nómina', icon: CreditCard },
              { id: 'vehiculo', label: 'Hoja de Vida', icon: Truck },
              { id: 'inventario', label: 'Inventario', icon: Package }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => { setReportType(type.id); setSelectedEntity(''); }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  reportType === type.id 
                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' 
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                }`}
              >
                <type.icon size={20} />
                <span className="font-bold text-sm">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtros Dinámicos */}
        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sede */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <MapPin size={12} /> Sede Correspondiente
              </label>
              <select 
                value={selectedSede}
                onChange={(e) => setSelectedSede(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-primary/20"
              >
                <option>Global</option>
                <option>Principal (Norte)</option>
                <option>Sur</option>
                <option>Centro</option>
              </select>
            </div>

            {/* Fecha */}
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
          </div>

          {/* Selector de Entidad (Si aplica) */}
          {reportType !== 'inventario' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Seleccionar {reportType === 'nomina' ? 'Nómina / Periodo' : 'Vehículo (Placa)'}
              </label>
              <select 
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Seleccione una opción...</option>
                {entities.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {reportType === 'nomina' 
                      ? `${e.user?.nombre} - ${e.periodo} (${e.estado})` 
                      : `${e.placa} - ${e.marca} ${e.modelo}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón de Acción */}
          <div className="pt-4">
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
              {loading ? 'Generando Documento...' : 'Descargar Reporte PDF'}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4 italic">
              Este documento cumple con los estándares corporativos de Rapifrios Nexus v3.0
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Nota de Seguridad */}
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
