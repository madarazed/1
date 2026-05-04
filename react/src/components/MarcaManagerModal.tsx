import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, Tag, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface Marca {
  id: number;
  nombre: string;
}

interface Props {
  onClose: () => void;
  onRefresh: (msg?: string) => void;
}

const MarcaManagerModal: React.FC<Props> = ({ onClose, onRefresh }) => {
  const [marcas, setMarcas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');

  const fetchMarcas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/marcas');
      // Mapeo defensivo: aceptamos id o id_marca, nombre o nombre_marca
      const normalizedData = res.data.map((m: any) => ({
        id: m.id || m.id_marca,
        nombre: m.nombre || m.nombre_marca
      }));
      setMarcas(normalizedData);
    } catch (err: any) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarcas();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nombre.trim()) return;
    
    setIsSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/marcas/${editingId}`, { nombre });
        onRefresh('Marca actualizada con éxito');
      } else {
        await api.post('/marcas', { nombre });
        onRefresh('Marca añadida con éxito');
      }
      setNombre('');
      setEditingId(null);
      await fetchMarcas();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la marca');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar esta marca?')) return;
    try {
      await api.delete(`/marcas/${id}`);
      fetchMarcas();
      onRefresh('Marca eliminada con éxito');
    } catch (err: any) {
      setError('No se pudo eliminar: la marca podría estar en uso.');
    }
  };

  const startEdit = (m: any) => {
    setEditingId(m.id);
    setNombre(m.nombre);
  };

  // Seguridad: No renderizar si no hay DOM
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-primary p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tag size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Gestionar Marcas</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Formulario de entrada */}
          <form onSubmit={handleSave} className="flex gap-2">
            <input 
              type="text"
              placeholder="Nombre de la marca..."
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-3 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={isSubmitting || !nombre.trim()}
              className="px-6 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[48px]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (editingId ? <Save size={16} /> : <Plus size={16} />)}
              <span>{editingId ? 'Actualizar' : 'Añadir'}</span>
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-start gap-3 border border-red-100 animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Lista de Marcas */}
          <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-hide space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargando Marcas...</span>
              </div>
            ) : marcas.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-bold text-sm uppercase italic">
                No hay marcas registradas
              </div>
            ) : marcas.map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group border border-transparent hover:border-gray-200 transition-all">
                <span className="text-sm font-bold text-gray-700">{m.nombre}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(m)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(m.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default MarcaManagerModal;
