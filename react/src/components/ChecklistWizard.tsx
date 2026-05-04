import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, 
  FileText, CircleDot, Shield, Zap, Wrench, Truck, ClipboardCheck,
  AlertTriangle, X, Save
} from 'lucide-react';
import api from '../services/api';

const getSecciones = (tipo: string) => {
  const base = [
    { id: 'documentacion', label: 'Documentación', icon: FileText, items: ['SOAT Vigente', 'Tecnomecánica', 'Tarjeta de Propiedad', 'Licencia de Conducción'] },
    { id: 'llantas', label: 'Llantas', icon: CircleDot, items: ['Presión Adecuada', 'Labrado (Profundidad)', 'Sin cortes/burbujas'] },
    { id: 'electrico', label: 'Eléctrico', icon: Zap, items: ['Luces Delanteras', 'Luces Traseras', 'Direccionales', 'Pito/Claxon'] },
  ];

  if (tipo === 'moto') {
    base.push({ id: 'estabilidad', label: 'Estabilidad', icon: Shield, items: ['Tensión Cadena', 'Frenos (Del/Tras)', 'Pata Lateral', 'Espejos'] });
  }

  if (tipo === 'camion' || tipo === 'carro') {
    base.push({ id: 'motor', label: 'Motor', icon: Wrench, items: ['Nivel Aceite', 'Líquido Refrigerante', 'Batería', 'Frenos Aire/Hidráulico'] });
    base.push({ id: 'estructura', label: 'Estructura', icon: Truck, items: ['Parabrisas', 'Puertas', 'Cinturones', 'Limpiabrisas'] });
  }

  if (tipo === 'camion') {
    base.push({ id: 'furgon', label: 'Furgón y Carga', icon: Shield, items: ['Estado Furgón', 'Cierre de Puertas', 'Sellos de Seguridad', 'Iluminación Carga'] });
  }

  base.push({ id: 'declaraciones', label: 'Declaraciones', icon: ClipboardCheck, items: ['Estoy apto para conducir', 'Uso Elementos Protección'] });
  
  return base;
};

interface NovedadInput {
  item: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  tipo_novedad: string;
}

interface Props {
  vehiculoId?: number;
  tipoVehiculo?: 'moto' | 'carro' | 'camion';
  onComplete: () => void;
}

const ChecklistWizard: React.FC<Props> = ({ vehiculoId, tipoVehiculo, onComplete }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const vId = vehiculoId || profileData?.vehiculo_id;
  const tVehiculo = tipoVehiculo || profileData?.tipo_vehiculo || 'moto';
  
  const SECCIONES = getSecciones(tVehiculo);
  const [currentStep, setCurrentStep] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, Record<string, boolean>>>({});
  const [novedades, setNovedades] = useState<NovedadInput[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [activeNovedad, setActiveNovedad] = useState<string | null>(null); // Item que está fallando
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!vehiculoId || !tipoVehiculo) {
      api.get('/repartidor/mi-perfil-logistico').then(res => {
        setProfileData(res.data);
      }).catch(err => console.error(err));
    }
  }, [vehiculoId, tipoVehiculo]);

  const handleToggle = (seccion: string, item: string, success: boolean) => {
    setRespuestas(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [item]: success
      }
    }));

    if (!success) {
      setActiveNovedad(item);
    } else {
      // Si se marca como éxito, eliminar novedad si existía
      setNovedades(prev => prev.filter(n => n.item !== item));
    }
  };

  const handleSaveNovedad = (descripcion: string, prioridad: any) => {
    if (activeNovedad) {
      const nuevaNovedad: NovedadInput = {
        item: activeNovedad,
        descripcion,
        prioridad,
        tipo_novedad: SECCIONES[currentStep].label
      };
      setNovedades(prev => [...prev.filter(n => n.item !== activeNovedad), nuevaNovedad]);
      setActiveNovedad(null);
    }
  };

  const isStepComplete = () => {
    const seccion = SECCIONES[currentStep];
    const checks = respuestas[seccion.id] || {};
    // El paso está completo si todos los items tienen una respuesta (True o False)
    return seccion.items.every(item => checks[item] !== undefined);
  };

  const handleNext = () => {
    if (currentStep < SECCIONES.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const totalItems = SECCIONES.reduce((acc, s) => acc + s.items.length, 0);
      const passedItems = Object.values(respuestas).reduce((acc, s) => acc + Object.values(s).filter(v => v).length, 0);
      
      const estadoGeneral = passedItems === totalItems ? 'Bueno' : (passedItems / totalItems > 0.8 ? 'Regular' : 'Malo');

      const obs = observaciones.trim() === '' ? 'Sin novedad' : observaciones;

      await api.post('/logistica/checklists', {
        vehiculo_id: vId,
        user_id: user?.id,
        estado_general: estadoGeneral,
        observaciones: obs,
        datos_checklist: respuestas,
        novedades: novedades.map(n => ({
          descripcion: `[${n.item}] ${n.descripcion}`,
          prioridad: n.prioridad,
          tipo_novedad: n.tipo_novedad
        }))
      });
      onComplete();
    } catch (err: any) {
      setError('Hubo un error al guardar el checklist. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / SECCIONES.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col font-body">
      {/* Header */}
      <div className="bg-primary p-6 text-white sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ClipboardCheck size={24} className="text-primary-light" />
            <h1 className="text-xl font-black uppercase italic tracking-tighter">Inspección Pre-Operativa</h1>
          </div>
          <span className="text-[10px] font-black bg-white/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
            {currentStep + 1} / {SECCIONES.length}
          </span>
        </div>
        
        {/* Perfil Header Read-Only */}
        {profileData && (
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex flex-wrap gap-4 items-center justify-between mt-4">
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Conductor</p>
              <p className="text-sm font-bold uppercase">{profileData.nombre}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Vehículo</p>
              <p className="text-sm font-bold uppercase">{profileData.placa} ({profileData.tipo_vehiculo})</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Sede</p>
              <p className="text-sm font-bold uppercase">{profileData.sede}</p>
            </div>
          </div>
        )}
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary-light shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-8 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <div className="w-14 h-14 bg-primary rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-primary/20">
                {React.createElement(SECCIONES[currentStep].icon, { size: 28 })}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-800 uppercase italic leading-none mb-1">{SECCIONES[currentStep].label}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paso {currentStep + 1} de {SECCIONES.length}</p>
              </div>
            </div>

            <div className="space-y-4">
              {SECCIONES[currentStep].items.map((item) => (
                <div key={item} className="space-y-2">
                  <div className={`p-5 rounded-3xl border-2 transition-all flex flex-col gap-4 ${
                    respuestas[SECCIONES[currentStep].id]?.[item] === true ? 'border-green-100 bg-green-50/30' :
                    respuestas[SECCIONES[currentStep].id]?.[item] === false ? 'border-red-100 bg-red-50/30' :
                    'border-gray-50 bg-white'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-gray-700 text-sm">{item}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggle(SECCIONES[currentStep].id, item, false)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                            respuestas[SECCIONES[currentStep].id]?.[item] === false 
                              ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' 
                              : 'border-gray-100 text-gray-300'
                          }`}
                        >
                          <X size={20} />
                        </button>
                        <button 
                          onClick={() => handleToggle(SECCIONES[currentStep].id, item, true)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                            respuestas[SECCIONES[currentStep].id]?.[item] === true 
                              ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20' 
                              : 'border-gray-100 text-gray-300'
                          }`}
                        >
                          <CheckCircle2 size={20} />
                        </button>
                      </div>
                    </div>
                    
                    {novedades.find(n => n.item === item) && (
                      <div className="bg-white/60 p-3 rounded-2xl flex items-start gap-3 border border-red-100">
                        <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black text-red-500 uppercase">Novedad Registrada</p>
                          <p className="text-xs font-medium text-gray-600">{novedades.find(n => n.item === item)?.descripcion}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Observaciones generales en el último paso */}
              {currentStep === SECCIONES.length - 1 && (
                <div className="mt-8 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Observaciones Generales</label>
                  <textarea 
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Añade observaciones adicionales (Opcional)"
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-3 text-red-600 text-xs font-black uppercase tracking-widest animate-shake">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-white border-t border-gray-100 flex gap-4 sticky bottom-0 z-50">
        <button
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="w-16 h-16 rounded-2xl bg-gray-50 text-gray-400 disabled:opacity-0 transition-all flex items-center justify-center"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isStepComplete() || isSubmitting}
          className={`flex-1 h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${
            isStepComplete() 
              ? 'bg-primary text-white shadow-primary/20 hover:scale-[1.02]' 
              : 'bg-gray-100 text-gray-400 shadow-none'
          }`}
        >
          {isSubmitting ? 'Procesando...' : (
            currentStep === SECCIONES.length - 1 ? 'Finalizar Auditoría' : 'Continuar Inspección'
          )}
          {!isSubmitting && <ChevronRight size={18} />}
        </button>
      </div>

      {/* Novedad Modal */}
      <AnimatePresence>
        {activeNovedad && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 uppercase italic leading-none mb-1">Reportar Falla</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeNovedad}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Descripción de la Novedad</label>
                  <textarea 
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-red-500/20 outline-none transition-all min-h-[120px]"
                    placeholder="Ej. Las luces direccionales traseras no encienden..."
                    id="novedad_desc"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Prioridad</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'baja', label: 'Baja', color: 'bg-green-500' },
                      { id: 'media', label: 'Media', color: 'bg-yellow-500' },
                      { id: 'alta', label: 'Alta', color: 'bg-orange-500' },
                      { id: 'critica', label: 'Crítica', color: 'bg-red-500' }
                    ].map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          const desc = (document.getElementById('novedad_desc') as HTMLTextAreaElement).value;
                          handleSaveNovedad(desc || 'Sin descripción detallada', p.id);
                        }}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-transform active:scale-95 ${p.color}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setActiveNovedad(null)}
                  className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChecklistWizard;
