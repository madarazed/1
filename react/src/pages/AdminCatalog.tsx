import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Edit3, Trash2, Plus, Filter, Tag, Zap, Flame } from 'lucide-react';
import ProductEditModal from '../components/ProductEditModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import MarcaManagerModal from '../components/MarcaManagerModal';
import Toast from '../components/Toast';

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  url_imagen: string;
  precio: number;
  stock: number;
  id_marca: number;
  id_categoria: number | null;
  nombre_marca?: string;
  nombre_categoria?: string;
  en_promocion?: boolean;
  precio_oferta?: number;
  fecha_fin_oferta?: string;
}

interface Marca {
  id: number;
  nombre: string;
}

interface Category {
  id: number;
  nombre: string;
}

const AdminCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMarca, setSelectedMarca] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [specialPromos, setSpecialPromos] = useState<any[]>([]);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMarcaModalOpen, setIsMarcaModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
  };

  const fetchProducts = async () => {
    try {
      const [prodRes, promoRes, marcasRes, catsRes] = await Promise.all([
        api.get('/productos'),
        api.get('/promociones'),
        api.get('/marcas'),
        api.get('/categorias')
      ]);
      setProducts(prodRes.data);
      setSpecialPromos(promoRes.data);
      setMarcas(marcasRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const setSpecialPromo = async (id: number, tipo: 'flash' | 'daily') => {
    try {
      await api.post('/promociones/special', { id_producto: id, tipo });
      showToast(`Producto asignado como ${tipo === 'flash' ? 'Oferta Relámpago' : 'Promoción del Día'}`);
      fetchProducts();
    } catch (err) {
      console.error('Error setting special promo:', err);
      showToast('Error al asignar la promoción');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.nombre_marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.nombre_categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMarca = selectedMarca === '' || p.id_marca === Number(selectedMarca);
    const matchesCategory = selectedCategory === '' || p.id_categoria === Number(selectedCategory);
    
    return matchesSearch && matchesMarca && matchesCategory;
  });

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0';
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="relative">
      
      {/* Header Actions */}
      <div className="sticky top-0 z-30 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          <div className="flex flex-1 gap-4">
            {/* Filtro de Marcas */}
            <div className="relative flex-1 min-w-[150px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer"
              >
                <option value="">Todas las Marcas</option>
                {marcas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>

            {/* Filtro de Categorías */}
            <div className="relative flex-1 min-w-[150px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-black uppercase tracking-widest text-gray-500 focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer"
              >
                <option value="">Todas las Categorías</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMarcaModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-primary border-2 border-primary/20 hover:bg-primary/5 transition-all"
          >
            <Tag size={18} />
            Marcas
          </button>
          
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 primary-cta-btn px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            <Plus size={18} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Marca</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        <img 
                          src={(() => {
                            if (!p.url_imagen) return '/products/placeholder.jpg';
                            if (p.url_imagen.startsWith('http')) return p.url_imagen;
                            const filename = p.url_imagen.split('/').pop();
                            return filename?.includes('_') 
                              ? `http://127.0.0.1:8000/products/${filename}` 
                              : `/products/${filename}`;
                          })()} 
                          alt={p.nombre} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes('127.0.0.1')) {
                               const filename = p.url_imagen?.split('/').pop();
                               target.src = `/products/${filename || 'placeholder.jpg'}`;
                            } else {
                               target.src = 'https://placehold.co/100x100?text=No+Image';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-800 leading-tight">{p.nombre}</span>
                          {specialPromos.find(sp => sp.id_producto === p.id && sp.tipo === 'Oferta Relámpago') && (
                            <Zap size={14} className="text-orange-500 fill-orange-500" />
                          )}
                          {specialPromos.find(sp => sp.id_producto === p.id && sp.tipo === 'Promoción del Día') && (
                            <Flame size={14} className="text-blue-500 fill-blue-500" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">ID: #{p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                      {p.nombre_marca || 'S/M'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                      {p.nombre_categoria || 'S/C'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-primary italic">
                        {Boolean(p.en_promocion) && Number(p.precio_oferta) > 0 
                          ? formatCurrency(p.precio_oferta) 
                          : formatCurrency(p.precio)}
                      </span>
                      {Boolean(p.en_promocion) && Number(p.precio_oferta) > 0 && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 line-through opacity-70">
                            Normal: {formatCurrency(p.precio)}
                          </span>
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">
                            ¡En Oferta!
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.stock > 0 ? (
                      <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-100">Activo</span>
                    ) : (
                      <span className="text-[10px] font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-red-100">Agotado</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSpecialPromo(p.id, 'flash')}
                        className={`p-2.5 rounded-xl transition-all shadow-sm ${specialPromos.find(sp => sp.id_producto === p.id && sp.tipo === 'Oferta Relámpago') ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white'}`}
                        title="Asignar como Oferta Relámpago"
                      >
                        <Zap size={16} />
                      </button>
                      <button 
                        onClick={() => setSpecialPromo(p.id, 'daily')}
                        className={`p-2.5 rounded-xl transition-all shadow-sm ${specialPromos.find(sp => sp.id_producto === p.id && sp.tipo === 'Promoción del Día') ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white'}`}
                        title="Asignar como Promoción del Día"
                      >
                        <Flame size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(p)}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición/Creación */}
      {isEditModalOpen && (
        <ProductEditModal 
          product={selectedProduct || undefined} 
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }} 
          onSuccess={() => {
            setIsEditModalOpen(false);
            showToast(selectedProduct ? 'Producto actualizado con éxito' : 'Producto creado con éxito');
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}

      {/* Modal de Gestión de Marcas */}
      {isMarcaModalOpen && (
        <MarcaManagerModal 
          onClose={() => setIsMarcaModalOpen(false)}
          onRefresh={(msg?: string) => {
            fetchProducts();
            if (msg) showToast(msg);
          }}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && selectedProduct && (
        <ConfirmDeleteModal 
          productId={selectedProduct.id}
          productName={selectedProduct.nombre}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setIsDeleteModalOpen(false);
            showToast('Producto eliminado con éxito');
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}

      {/* Toast Notification */}
      <Toast 
        message={toastMessage} 
        isVisible={isToastVisible} 
        onClose={() => setIsToastVisible(false)} 
      />
    </div>
  );
};

export default AdminCatalog;
