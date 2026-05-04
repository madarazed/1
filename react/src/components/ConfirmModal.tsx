import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmText?: string;
  variant?: 'danger' | 'primary' | 'success';
}

const ConfirmModal: React.FC<Props> = ({ 
  title, 
  description, 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false,
  confirmText = "Confirmar",
  variant = 'primary'
}) => {
  const colors = {
    danger: 'bg-red-500 shadow-red-500/20 text-white',
    primary: 'bg-primary shadow-primary/20 text-white',
    success: 'bg-green-500 shadow-green-500/20 text-white'
  };

  const iconColors = {
    danger: 'bg-red-50 text-red-500',
    primary: 'bg-primary/5 text-primary',
    success: 'bg-green-50 text-green-500'
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
        className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center"
      >
        <div className="flex justify-end mb-2 absolute top-6 right-6">
          <button onClick={onClose} className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className={`w-20 h-20 ${iconColors[variant]} rounded-[2rem] flex items-center justify-center mx-auto mb-6 mt-4`}>
          <AlertTriangle size={32} />
        </div>
        
        <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter mb-2">
          {title}
        </h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 leading-relaxed px-4">
          {description}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-5 ${colors[variant]} rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Check size={18} />
                {confirmText}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-gray-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
