import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Timer, CheckCircle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import LogisticaInputModal from './LogisticaInputModal';

interface Jornada {
  id: number;
  estado: string;
  hora_inicio: string;
}

interface Props {
  onRequireChecklist: (vehiculoId: number) => void;
}

const JornadaComponent: React.FC<Props> = ({ onRequireChecklist }) => {
  const [jornada, setJornada] = useState<Jornada | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    description: string;
    type: 'start' | 'finish';
  }>({ title: '', description: '', type: 'start' });

  const checkTodayJornada = async () => {
    setIsLoading(true);
    try {
      // En un caso real, buscaríamos la jornada activa del usuario logueado
      const res = await api.get('/logistica/jornada/activa'); 
      // Si no existe el endpoint, fallará, lo manejamos.
      setJornada(res.data);
    } catch (err) {
      setJornada(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkTodayJornada();
  }, []);

  const handleStart = () => {
    setModalConfig({
      title: 'Kilometraje Inicial',
      description: 'Por favor, registra el kilometraje actual del vehículo para iniciar tu jornada laboral.',
      type: 'start'
    });
    setShowModal(true);
  };

  const processStart = async (km: string) => {
    setIsProcessing(true);
    setError('');
    try {
      // 1. Verificar si hay checklist hoy
      const checkRes = await api.get('/logistica/checklists');
      const today = new Date().toISOString().split('T')[0];
      const hasChecklist = checkRes.data.some((c: any) => c.fecha.startsWith(today) && c.estado_general === '1');

      if (!hasChecklist) {
        // Redirigir al wizard (vehículo 1 por defecto para demo)
        onRequireChecklist(1);
        return;
      }

      // 2. Iniciar jornada
      const res = await api.post('/logistica/jornada/iniciar', { 
        vehiculo_id: 1,
        km_inicial: parseInt(km)
      });
      setJornada(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar jornada');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    setModalConfig({
      title: 'Kilometraje Final',
      description: 'Ingresa el kilometraje actual para finalizar tu jornada y registrar el recorrido total.',
      type: 'finish'
    });
    setShowModal(true);
  };

  const processFinish = async (km: string) => {
    if (!jornada) return;
    setIsProcessing(true);
    try {
      await api.post(`/logistica/jornada/finalizar/${jornada.id}`, { 
        tomo_almuerzo: true,
        km_final: parseInt(km)
      });
      setJornada({ ...jornada, estado: 'Finalizada' });
    } catch (err) {
      setError('Error al finalizar jornada');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModalConfirm = (km: string) => {
    if (modalConfig.type === 'start') {
      processStart(km);
    } else {
      processFinish(km);
    }
    setShowModal(false);
  };

  if (isLoading) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[100]">
      <AnimatePresence mode="wait">
        {!jornada || jornada.estado === 'Inactivo' ? (
          <motion.button
            key="start"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={handleStart}
            disabled={isProcessing}
            className="w-full bg-primary text-white p-6 rounded-[2.5rem] shadow-2xl shadow-primary/40 flex items-center justify-between group overflow-hidden relative"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={20} />}
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-60">Listo para trabajar</span>
                <span className="text-lg font-black uppercase italic tracking-tighter">Iniciar Jornada</span>
              </div>
            </div>
            <ChevronRight className="group-hover:translate-x-2 transition-transform opacity-40" />
            
            {/* Glossy Effect */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-full transition-all duration-1000" />
          </motion.button>
        ) : jornada.estado === 'Iniciada' ? (
          <motion.div
            key="active"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="w-full bg-green-500 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-green-500/40"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                  <Timer size={20} />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-widest opacity-60">En Curso</span>
                  <span className="text-sm font-black uppercase italic tracking-tighter">Turno Activo</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black italic tracking-tighter">{jornada.hora_inicio.substring(0, 5)}</span>
              </div>
            </div>
            <button 
              onClick={handleFinish}
              disabled={isProcessing}
              className="w-full py-4 bg-white text-green-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <><Square size={16} fill="currentColor" /> Finalizar Turno</>}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="finished"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full bg-gray-800 text-white p-6 rounded-[2.5rem] shadow-2xl shadow-black/20 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest opacity-40">Misión Cumplida</span>
              <span className="text-lg font-black uppercase italic tracking-tighter">Jornada Finalizada</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full mb-4 w-full p-4 bg-red-500 text-white rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold"
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && (
          <LogisticaInputModal
            isOpen={showModal}
            title={modalConfig.title}
            description={modalConfig.description}
            onClose={() => setShowModal(false)}
            onConfirm={handleModalConfirm}
            isLoading={isProcessing}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JornadaComponent;
