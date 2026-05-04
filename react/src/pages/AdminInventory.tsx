import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SedeSelector } from '../components/SedeSelector';
import { Search, Package, ArrowUpRight, ArrowDownRight, Warehouse, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AdjustStockModal from '../components/AdjustStockModal';

interface Product {
  id: number;
  nombre: string;
  url_imagen: string;
  stock: number;
  nombre_marca?: string;
}

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const { activeSede } = useAuth();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/inventario?sede_id=${activeSede?.id || 'all'}&search=${searchTerm}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeSede?.id]); 

  // Debounce search could be better, but for now:
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Stats & Sede Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary">
              <Warehouse size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 uppercase italic tracking-tighter">Control de Inventario</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gestiona existencias por sede</p>
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <SedeSelector variant="dark" />
          </div>
        </div>

        <div className="bg-primary p-8 rounded-[2rem] shadow-xl shadow-primary/20 text-white flex flex-col justify-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Referencias</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black italic tracking-tighter">{products.length}</span>
            <Package size={20} className="mb-2 opacity-60" />
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar producto en inventario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sede</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Existencias</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        <img 
                          src={p.url_imagen && p.url_imagen.startsWith('http') ? p.url_imagen : `/products/${p.url_imagen ? p.url_imagen.replace('productos/', '') : 'placeholder.jpg'}`} 
                          alt={p.nombre} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary/10">
                      {activeSede?.nombre || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm transition-all ${
                      p.stock <= 5 
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
                        : p.stock <= 10 
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {p.stock <= 5 && <AlertTriangle size={14} />}
                      {p.stock}
                      {p.stock > 10 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setAdjustingProduct(p)}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-4 py-2 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all"
                    >
                      Ajustar Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjustingProduct && (
        <AdjustStockModal 
          product={adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          onSuccess={() => {
            setAdjustingProduct(null);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
};

export default AdminInventory;
