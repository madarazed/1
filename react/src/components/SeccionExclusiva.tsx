import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { ShoppingCart, Star, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';

const getImageUrl = (path?: string) => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/products/${path}`;
};

const formatCurrency = (amount: number | string | undefined) => {
  if (amount === undefined) return '$0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

export const SeccionExclusiva = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchExclusivas = async () => {
      try {
        const response = await api.get('/ofertas-exclusivas');
        setProductos(response.data);
      } catch (error) {
        console.error("Error fetching exclusivas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExclusivas();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin text-amber-400">Loading...</div>
    </div>
  );

  return (
    <section className="py-12 bg-slate-900 border-y-4 border-amber-400 relative overflow-hidden my-8 rounded-3xl mx-4 md:mx-auto max-w-7xl shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Star size={120} className="text-amber-400" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="text-amber-400" size={28} />
          <h2 className="text-3xl font-black text-amber-400 uppercase italic tracking-tighter">Ofertas Exclusivas VIP</h2>
          <span className="bg-amber-400 text-slate-900 text-xs font-black uppercase px-3 py-1 rounded-full ml-2">Solo Clientes</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {productos.length > 0 ? productos.map(p => (
            <motion.div 
              key={p.id}
              whileHover={{ y: -5 }}
              className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col"
            >
              <div className="aspect-square bg-white rounded-xl mb-4 overflow-hidden p-2 relative">
                <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full z-10">
                  Top Secret
                </div>
                <img 
                  src={getImageUrl(p.url_imagen)} 
                  alt={p.nombre} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-white font-black leading-tight text-lg">{p.nombre}</h3>
                <p className="text-amber-400/80 text-xs font-bold uppercase">{p.nombre_marca}</p>
                <div className="text-2xl font-black text-amber-400 pt-2">
                  {formatCurrency(p.precio)}
                </div>
              </div>
              <button
                onClick={() => addToCart({
                  id: p.id,
                  title: p.nombre,
                  currentPrice: p.precio,
                  image: getImageUrl(p.url_imagen)
                })}
                className="mt-4 w-full bg-amber-400 text-slate-900 py-3 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors"
              >
                <ShoppingCart size={18} /> Añadir VIP
              </button>
            </motion.div>
          )) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-amber-400 font-bold uppercase tracking-widest opacity-50">
                No hay ofertas VIP disponibles por ahora. ¡Vuelve pronto!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
