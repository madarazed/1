import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';
import SmartImage from './common/SmartImage';

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
    <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-16 border-y border-white/5 relative group/section overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-3.5 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)]">
               <Star className="text-white fill-white" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">OFERTAS VIP</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Precios de distribución mayorista de élite</p>
            </div>
          </div>
          
          {/* Navegación Desktop */}
          <div className="hidden md:flex gap-2">
          <div className="hidden md:flex gap-3">
            <button 
              onClick={() => scroll('left')}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-all shadow-xl active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-all shadow-xl active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          </div>
        </div>

        {/* Contenedor de Scroll / Grid */}
        <div className="relative">
          {/* Indicador de Scroll Móvil (Gradiente y Flecha) */}
          <div className="absolute right-0 top-0 bottom-6 w-24 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-30 md:hidden flex items-center justify-end pr-3">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-white/10 backdrop-blur-md p-2.5 rounded-full shadow-2xl border border-white/10"
            >
              <ChevronRight className="text-white" size={20} />
            </motion.div>
          </div>

          <div 
            ref={scrollContainerRef}
            className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 relative z-10 scroll-smooth"
            style={{ scrollPadding: '0 24px' }}
          >
            {products.map((p) => {
               const imageUrl = getImageUrl(p.url_imagen, true);
               const discount = p.precio && p.precio_oferta 
                 ? Math.round(((Number(p.precio) - Number(p.precio_oferta)) / Number(p.precio)) * 100) 
                 : 0;

               return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="min-w-[82vw] md:min-w-0 bg-white rounded-[2.5rem] p-5 border border-amber-400/20 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_15px_30px_rgba(234,179,8,0.2)] hover:border-amber-400/50 transition-all duration-500 snap-center relative group flex flex-col mx-1 md:mx-0"
                >
                  <div className="aspect-square bg-slate-50/50 rounded-[2rem] overflow-hidden mb-5 relative shrink-0">
                    <SmartImage 
                      originalUrl={imageUrl} 
                      productName={p.nombre}
                      alt={p.nombre}
                      className="w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Badge de Descuento Lujo */}
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-br from-amber-400 to-amber-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg z-10 border border-white/20">
                        -{discount}%
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-blue-950/5 px-3 py-1 rounded-full border border-blue-950/10 backdrop-blur-sm">
                       <span className="text-[9px] font-black text-blue-950 uppercase tracking-widest">Exclusivo VIP</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col mb-5">
                    <h3 className="text-[13px] md:text-sm font-black text-slate-800 tracking-tight line-clamp-2 leading-tight min-h-[2.8em] uppercase italic">
                      {p.nombre}
                    </h3>
                    <div className="flex flex-col mt-3">
                      <span className="text-[11px] text-slate-400 line-through font-bold decoration-amber-500/30">
                        {formatCurrency(p.precio)}
                      </span>
                      <span className="text-2xl font-black text-blue-950 tracking-tighter leading-none mt-1">
                        {formatCurrency(p.precio_offer || p.precio_oferta)}
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
                    className="absolute bottom-5 right-5 bg-blue-950 text-white p-3 rounded-2xl shadow-xl shadow-blue-950/20 hover:bg-blue-900 hover:scale-110 active:scale-95 transition-all z-20 border border-white/10"
                  >
                    <Plus size={20} />
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
