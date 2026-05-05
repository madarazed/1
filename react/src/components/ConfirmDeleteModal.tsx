import { useState, type FC } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import api from '../services/api';

interface Props {
  productName: string;
  productId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ConfirmDeleteModal: FC<Props> = ({ productName, productId, onClose, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/productos/${productId}`);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar el producto');
      setIsDeleting(false);
    }
  };

  // Seguridad: No renderizar si no hay DOM
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden p-8"
      >
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter mb-2">
            ¿Estás seguro?
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
            Estás a punto de eliminar <span className="text-gray-800">"{productName}"</span>. Esta acción no se puede deshacer.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors shadow-xl shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Eliminar Producto
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default ConfirmDeleteModal;
