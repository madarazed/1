import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Loader2, Package, ArrowUpCircle, ArrowDownCircle, Settings2 } from 'lucide-react';
import api from '../services/api';

interface Product {
  id: number;
  nombre: string;
  url_imagen: string;
}

interface Props {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

const AdjustStockModal: React.FC<Props> = ({ product, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      sede_id: '1', // Por defecto Sede Centro
      tipo_movimiento: 'Entrada',
      cantidad: 1,
      motivo: ''
    }
  });

  const tipoMovimiento = watch('tipo_movimiento');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/inventario/ajustar', {
        producto_id: product.id,
        sede_id: parseInt(data.sede_id),
        cantidad: parseInt(data.cantidad),
        tipo_movimiento: data.tipo_movimiento,
        motivo: data.motivo
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al ajustar el inventario');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Package size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Ajustar Inventario</h2>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{product.nombre}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Sede de Movimiento</label>
              <select 
                {...register('sede_id', { required: true })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                <option value="1">Sede Centro</option>
                <option value="2">Sede El Salado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Tipo de Operación</label>
              <select 
                {...register('tipo_movimiento', { required: true })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                <option value="Entrada">Entrada (+)</option>
                <option value="Salida">Salida (-)</option>
                <option value="Ajuste">Ajuste Directo (=)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
              {tipoMovimiento === 'Ajuste' ? 'Stock Final' : 'Cantidad a Mover'}
            </label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-50">
                {tipoMovimiento === 'Entrada' && <ArrowUpCircle size={20} />}
                {tipoMovimiento === 'Salida' && <ArrowDownCircle size={20} />}
                {tipoMovimiento === 'Ajuste' && <Settings2 size={20} />}
              </div>
              <input 
                type="number"
                {...register('cantidad', { required: true, min: 0 })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Motivo del Ajuste</label>
            <textarea 
              {...register('motivo', { required: 'Indica un motivo' })}
              rows={3}
              placeholder="Ej: Reposición de stock, Producto dañado, Inventario anual..."
              className="w-full bg-gray-50 border border-gray-100 rounded-3xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
            {errors.motivo && <p className="text-[10px] text-red-500 font-bold ml-4">{errors.motivo.message}</p>}
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <Save size={18} />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default AdjustStockModal;
