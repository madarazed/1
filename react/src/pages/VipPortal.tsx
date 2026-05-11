import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Lock, LogOut, ChevronRight, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { PRODUCTS_IMAGE_URL } from '../constants';
import { SeccionExclusiva } from '../components/SeccionExclusiva';

const VipPortal = () => {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.get('/productos');
        // Filtramos para que aquí solo se vean los NO exclusivos (ya que los exclusivos van arriba)
        setProductos(response.data.filter((p: any) => !p.es_exclusivo));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const getImageUrl = (url_imagen: string) => {
    if (!url_imagen) return '/placeholder.png';
    if (url_imagen.startsWith('http')) return url_imagen;
    const filename = url_imagen.split('/').pop();
    if (!filename) return '/placeholder.png';
    if (filename.includes('_')) return `${PRODUCTS_IMAGE_URL}/${filename}`;
    return `/products/${filename}`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.nombre_marca && p.nombre_marca.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-body pb-20">
      {/* Header Premium */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-amber-500/20 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Star className="text-slate-900 fill-slate-900" size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-amber-500 uppercase italic tracking-tighter leading-none">
                Bienvenido a tu Portal VIP
              </h1>
              <p className="text-amber-500/50 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                Rapifrios Nexus · Cliente: {user?.nombre || 'Invitado'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-2 text-xs font-black uppercase text-white/50 hover:text-white transition-colors"
            >
              Ir a Web Pública
            </button>
            <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="bg-slate-800 hover:bg-red-900/40 text-red-400 p-3 rounded-xl transition-all border border-red-500/10 active:scale-95"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        
        {/* Sección Exclusiva (Promociones VIP) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Promociones Exclusivas</h2>
          </div>
          <SeccionExclusiva />
        </div>

        {/* Catálogo Completo */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-white/20 rounded-full" />
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Catálogo General</h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  Haz todo tu pedido en un solo lugar
                </p>
              </div>
            </div>

            {/* Barra de Búsqueda VIP */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-amber-500" size={48} />
              <p className="text-amber-500/50 font-black uppercase tracking-widest text-xs">Cargando Catálogo Completo...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-slate-900/40 border border-slate-800 hover:border-amber-500/30 rounded-3xl p-3 transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="aspect-square rounded-2xl bg-white overflow-hidden p-2 mb-3 relative">
                      <img 
                        src={getImageUrl(product.url_imagen)} 
                        alt={product.nombre}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                      />
                    </div>
                    
                    <div className="space-y-1 flex-1 px-1">
                      <p className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest">
                        {product.nombre_marca || 'General'}
                      </p>
                      <h3 className="font-bold text-white text-xs md:text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                        {product.nombre}
                      </h3>
                      <div className="pt-2">
                        <p className="text-lg font-black text-amber-500 tracking-tighter">
                          {formatCurrency(product.precio)}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => addToCart({ id: product.id, title: product.nombre, currentPrice: product.precio, image: getImageUrl(product.url_imagen) })}
                      className="mt-4 w-full bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ShoppingCart size={14} />
                      Añadir
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20 opacity-30">
              <Search size={48} className="mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">No encontramos productos</p>
            </div>
          )}
        </div>

      </main>

      {/* Floating Cart Button for VIP (opcional, pero ayuda) */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 right-8 z-[200]"
      >
        <button 
          onClick={() => navigate('/catalogo')} // O donde sea que esté el carrito/checkout
          className="bg-amber-500 text-slate-950 p-5 rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center gap-3 font-black"
        >
          <ShoppingCart size={24} />
          <span className="hidden md:inline uppercase text-xs">Ver Carrito</span>
        </button>
      </motion.div>
    </div>
  );
};

export default VipPortal;
