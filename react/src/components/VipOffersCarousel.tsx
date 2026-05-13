import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import api from '../services/api';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  precio_oferta: number;
  url_imagen: string;
  nombre_marca?: string;
  es_exclusivo?: boolean | number;
}

const VipOffersCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Fetch global de productos con parámetro all para obtener exclusivos
        const response = await api.get('/productos?all=1');
        const data = Array.isArray(response.data) ? response.data : [];
        
        // FILTRO MAESTRO: Solo productos marcados como exclusivos (VIP) y con oferta activa
        // Excluimos explícitamente cualquier variante de "Aguardiente" (Oferta del Día)
        const vipOffers = data.filter((p: any) => 
          (p.es_exclusivo === true || p.es_exclusivo === 1 || p.es_exclusivo === "1") && 
          p.precio_oferta && 
          Number(p.precio_oferta) > 0 &&
          !p.nombre.toLowerCase().includes('aguardiente')
        );
        
        setProducts(vipOffers);
      } catch (error) {
        console.error("Error al cargar ofertas VIP:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return '$0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Skeleton Loader corporativo (Navy/Dorado)
  if (loading) {
    return (
      <section className="bg-slate-50 py-12 border-y border-gray-100 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="min-w-[200px] md:flex-1 bg-white rounded-[2.5rem] p-4 border border-gray-100 animate-pulse">
                <div className="aspect-square bg-gray-50 rounded-[2rem] mb-4" />
                <div className="h-4 w-3/4 bg-gray-50 rounded mb-2" />
                <div className="h-6 w-1/2 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay productos tras el filtro VIP, no renderizamos nada
  if (products.length === 0) return null;

  return (
    <section className="bg-slate-50 py-12 border-y border-gray-100 relative group/section">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-[#1E3A8A] p-3 rounded-2xl shadow-xl shadow-blue-900/20">
               <Star className="text-amber-400 fill-amber-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1E3A8A] uppercase italic tracking-tighter leading-none">OFERTAS VIP</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aprovecha precios de distribución mayorista</p>
            </div>
          </div>
          
          {/* Navegación Desktop */}
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2.5 bg-white border border-gray-100 rounded-full hover:bg-[#1E3A8A] hover:text-white transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={22} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2.5 bg-white border border-gray-100 rounded-full hover:bg-[#1E3A8A] hover:text-white transition-all shadow-sm active:scale-95"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Contenedor de Scroll / Grid */}
        <div className="relative">
          {/* Indicador de Scroll Móvil (Gradiente y Flecha) */}
          <div className="absolute right-0 top-0 bottom-6 w-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-30 md:hidden flex items-center justify-end pr-2">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-white/80 p-2 rounded-full shadow-lg backdrop-blur-sm"
            >
              <ChevronRight className="text-[#1E3A8A]" size={20} />
            </motion.div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 relative z-10"
          >
            {products.map((p) => {
               const imageUrl = getImageUrl(p.url_imagen);
               const discount = p.precio && p.precio_oferta 
                 ? Math.round(((Number(p.precio) - Number(p.precio_oferta)) / Number(p.precio)) * 100) 
                 : 0;

               return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="min-w-[80vw] md:min-w-0 bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 snap-start relative group flex flex-col"
                >
                  <div className="aspect-square bg-slate-50 rounded-[2rem] overflow-hidden mb-4 relative shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={p.nombre}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => handleImageError(e, p.nombre, imageUrl)}
                    />
                    {/* Badge Dinámico % Descuento */}
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg z-10">
                        -{discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between mb-4">
                    <h3 className="text-sm font-medium text-slate-800 tracking-tight line-clamp-2 leading-snug min-h-[2.8em]">
                      {p.nombre}
                    </h3>
                    <div className="flex flex-col mt-2">
                      <span className="text-xs text-slate-400 line-through font-bold">
                        {formatCurrency(p.precio)}
                      </span>
                      <span className="text-xl font-black text-[#1E3A8A] tracking-tighter leading-none">
                        {formatCurrency(p.precio_oferta)}
                      </span>
                    </div>
                  </div>

                  {/* Botón "+" Premium */}
                  <button
                    onClick={() => addToCart({
                      id: p.id,
                      title: p.nombre,
                      currentPrice: Number(p.precio_oferta),
                      image: imageUrl
                    })}
                    className="absolute bottom-4 right-4 bg-[#1E3A8A] text-white p-2.5 rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-[#2563EB] hover:scale-110 active:scale-95 transition-all z-20"
                  >
                    <Plus size={18} />
                  </button>
                </motion.div>
               );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VipOffersCarousel;
