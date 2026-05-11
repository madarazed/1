import { useState, useEffect, type FC } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Edit3, Trash2, Plus, Loader2, ShieldCheck, ImageOff } from 'lucide-react';
import api from '../services/api';
import ProductEditModal from './ProductEditModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ExclusiveProduct {
  id: number;
  nombre: string;
  descripcion: string;
  url_imagen: string;
  precio: number;
  id_marca: number;
  id_categoria: number | null;
  nombre_marca?: string;
  nombre_categoria?: string;
  es_exclusivo: boolean;
}

interface Props {
  onClose: () => void;
  onRefresh: (msg?: string) => void;
}

const ExclusiveProductsManager: FC<Props> = ({ onClose, onRefresh }) => {
  const [products, setProducts] = useState<ExclusiveProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for secondary modals
  const [selectedProduct, setSelectedProduct] = useState<ExclusiveProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [forceExclusive, setForceExclusive] = useState(false);

  const fetchExclusiveProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/productos/exclusivas');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Error fetching exclusive products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExclusiveProducts();
  }, []);

  const handleRemoveExclusive = async (product: ExclusiveProduct) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('nombre', product.nombre);
      formData.append('precio', product.precio.toString());
      formData.append('id_marca', product.id_marca.toString());
      formData.append('es_exclusivo', '0');
      
      await api.post(`/productos/${product.id}`, formData);
      
      fetchExclusiveProducts();
      onRefresh('Producto removido de la sección VIP');
    } catch (err) {
      console.error('Error removing exclusive flag:', err);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setForceExclusive(true);
    setIsEditModalOpen(true);
  };

  const handleEdit = (product: ExclusiveProduct) => {
    setSelectedProduct(product);
    setForceExclusive(true);
    setIsEditModalOpen(true);
  };

  const handleDelete = (product: ExclusiveProduct) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header - Limpieza Absoluta y Centralización */}
        <div className="bg-amber-500 p-10 text-slate-900 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 bg-[#0F172A] text-white rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-90"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
              <Star className="text-amber-500 fill-amber-500" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                Gestión VIP
              </h2>
              <p className="text-xs font-black opacity-60 uppercase tracking-widest mt-1">
                Control exclusivo del catálogo para clientes especiales
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 scrollbar-hide bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-amber-500" size={48} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Cargando exclusivos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Star size={40} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No hay productos VIP registrados</p>
              <button 
                onClick={handleCreateNew}
                className="mt-6 text-amber-600 font-black uppercase tracking-widest text-xs hover:underline transition-all"
              >
                Comienza añadiendo uno ahora
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalles</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio VIP</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm p-1">
                            {p.url_imagen ? (
                              <img 
                                src={p.url_imagen.startsWith('http') ? p.url_imagen : `/products/${p.url_imagen.split('/').pop()}`} 
                                alt={p.nombre} 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                <ImageOff className="text-slate-200" size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase leading-tight">{p.nombre}</p>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">
                              {p.nombre_marca || 'Sin Marca'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-4 py-2 rounded-xl uppercase tracking-widest">
                          {p.nombre_categoria || 'S/C'}
                        </span>
                      </td>
                      <td className="px-4 py-6">
                        <span className="text-sm font-black text-slate-900 italic">
                          {formatCurrency(p.precio)}
                        </span>
                      </td>
                      <td className="px-4 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={() => handleRemoveExclusive(p)}
                            className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            title="Quitar de VIP"
                          >
                            <ShieldCheck size={18} />
                          </button>
                          <button 
                            onClick={() => handleEdit(p)}
                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Editar"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(p)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Area - Consistencia con Registro de Usuarios */}
        <footer className="p-10 border-t border-slate-100 bg-white shrink-0">
          <div className="flex flex-col items-center gap-8">
            <div className="w-full flex justify-end">
              <button 
                onClick={handleCreateNew}
                className="bg-[#0F172A] text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3"
              >
                <Plus size={20} />
                Crear Nuevo VIP
              </button>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] text-center max-w-md leading-relaxed">
              Los cambios en esta sección se reflejan instantáneamente en el Portal del Cliente
            </p>
          </div>
        </footer>
      </motion.div>

      {/* Sub-modales */}
      <AnimatePresence>
        {isEditModalOpen && (
          <ProductEditModal 
            product={selectedProduct || undefined}
            esExclusivo={forceExclusive}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              setIsEditModalOpen(false);
              fetchExclusiveProducts();
              onRefresh(selectedProduct ? 'Producto VIP actualizado' : 'Nuevo producto VIP creado');
            }}
          />
        )}

        {isDeleteModalOpen && selectedProduct && (
          <ConfirmDeleteModal 
            productId={selectedProduct.id}
            productName={selectedProduct.nombre}
            onClose={() => setIsDeleteModalOpen(false)}
            onSuccess={() => {
              setIsDeleteModalOpen(false);
              fetchExclusiveProducts();
              onRefresh('Producto eliminado definitivamente');
            }}
          />
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default ExclusiveProductsManager;
