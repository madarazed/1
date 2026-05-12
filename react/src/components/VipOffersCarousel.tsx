import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  precio_oferta: number;
  url_imagen: string;
  nombre_marca?: string;
}

const VipOffersCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await api.get('/productos?all=1');
        const data = Array.isArray(response.data) ? response.data : [];
        
        // Filtro quirúrgico: solo productos con precio_oferta válido
        // Excluye explícitamente "Aguardiente Amarillo" (Oferta del Día)
        const offers = data.filter((p: any) => 
          p.precio_oferta && 
          Number(p.precio_oferta) > 0 && 
          Number(p.precio_oferta) < Number(p.precio) &&
          !p.nombre.toLowerCase().includes('aguardiente amarillo')
        );
        
        setProducts(offers);
      } catch (error) {
        console.error("Error silencioso al cargar carrusel VIP:", error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Skeleton Loader corporativo
  if (loading) {
    return (
      <section className="bg-slate-50 py-8 border-y border-gray-100 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="min-w-[160px] md:flex-1 bg-white rounded-3xl p-3 border border-gray-100">
                <div className="aspect-square bg-gray-50 rounded-2xl animate-pulse mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-50 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-gray-50 rounded animate-pulse" />
                  <div className="h-5 w-1/2 bg-gray-100 rounded animate-pulse pt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Si no hay productos tras el filtro, no renderizamos nada (Nota de Seguridad)
  if (products.length === 0) return null;

  return (
    <section className="bg-slate-50 py-8 border-y border-gray-100 relative group/section">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-xl shadow-lg shadow-amber-200">
               <Star className="text-white fill-white" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary uppercase italic tracking-tighter leading-none">Ofertas Estrella</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Precios Especiales Seleccionados</p>
            </div>
          </div>
          
          {/* Navegación Desktop */}
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 bg-white border border-gray-100 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 bg-white border border-gray-100 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Contenedor de Scroll / Grid */}
        <div 
          ref={scrollContainerRef}
          className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        >
          {products.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -5 }}
              className="min-w-[160px] md:min-w-0 bg-white rounded-3xl p-3 border border-gray-100 shadow-sm snap-start relative group flex flex-col"
            >
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 relative shrink-0">
                <img 
                  src={getImageUrl(p.url_imagen)} 
                  alt={p.nombre}
                  className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/products/placeholder.jpg';
                  }}
                />
                {/* Badge movido a la derecha superior */}
                <div className="absolute top-2 right-2 bg-amber-400 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase shadow-sm z-10">
                  Oferta
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between pr-8">
                <h3 className="text-[11px] font-black text-primary uppercase line-clamp-2 italic leading-tight mb-2 min-h-[2.2em]">
                  {p.nombre}
                </h3>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-400 line-through font-bold">
                    {formatCurrency(p.precio)}
                  </span>
                  <span className="text-sm font-black text-[#002244] tracking-tighter leading-none">
                    {formatCurrency(p.precio_oferta)}
                  </span>
                </div>
              </div>

              {/* Botón "+" Minimalista */}
              <button
                onClick={() => addToCart({
                  id: p.id,
                  title: p.nombre,
                  currentPrice: p.precio_oferta,
                  image: getImageUrl(p.url_imagen)
                })}
                className="absolute bottom-3 right-3 bg-[#002244] text-white p-2 rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all z-20"
              >
                <Plus size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VipOffersCarousel;
