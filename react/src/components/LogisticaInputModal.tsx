import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, X, ChevronRight, Loader2 } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  placeholder?: string;
  defaultValue?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  isLoading?: boolean;
}

const LogisticaInputModal: React.FC<Props> = ({ 
  title, 
  description, 
  placeholder = "0", 
  defaultValue = "",
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || isNaN(parseInt(value))) return;
    onConfirm(value);
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0a0f1a]/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden p-8"
      >
        <div className="flex justify-end mb-2 absolute top-6 right-6">
          <button onClick={onClose} className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-center mt-4">
          <div className="w-20 h-20 bg-primary/5 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Gauge size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter mb-2">
            {title}
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 leading-relaxed px-4">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                autoFocus
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-5 text-2xl font-black text-center focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-200"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                KM
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading || !value}
                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Confirmar Registro
                    <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-gray-500 transition-colors"
              >
                Cancelar Operación
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default LogisticaInputModal;
