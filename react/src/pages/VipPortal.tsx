import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, LogOut, Search, Loader2, Filter, SlidersHorizontal, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { PRODUCTS_IMAGE_URL } from '../constants';
import { SeccionExclusiva } from '../components/SeccionExclusiva';

const categories = [
  "Todos", "Aguas", "Cervezas", "Energizantes", "Gaseosas", "Hidratantes", "Jugos", "Licores", "Sodas"
];

const priceOptions = [
  { value: "all",  label: "Todos los precios" },
  { value: "low",  label: "Menos de $5.000" },
  { value: "mid",  label: "$5.000 - $50.000" },
  { value: "high", label: "Más de $50.000" },
];

const VipPortal = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [productos, setProductos] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedMarca, setSelectedMarca] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || String(user.id_rol) !== '6') {
        navigate('/');
      }
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, marcaRes] = await Promise.all([
          api.get('/productos'),
          api.get('/marcas')
        ]);
        setProductos(prodRes.data);
        setMarcas(marcaRes.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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

  // Lógica de filtrado
  const filtered = useMemo(() => {
    return productos.filter(p => {
      // 1. No mostrar exclusivos en el catálogo general (van en SeccionExclusiva)
      if (p.es_exclusivo) return false;

      // 2. Búsqueda
      const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.nombre_marca && p.nombre_marca.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // 3. Categoría
      if (selectedCategory !== "Todos") {
        if (p.nombre_categoria !== selectedCategory) return false;
      }

      // 4. Marca
      if (selectedMarca !== "all") {
        if (String(p.id_marca) !== selectedMarca) return false;
      }

      // 5. Precio
      if (priceRange === "low") {
        if (p.precio >= 5000) return false;
      } else if (priceRange === "mid") {
        if (p.precio < 5000 || p.precio > 50000) return false;
      } else if (priceRange === "high") {
        if (p.precio <= 50000) return false;
      }

      return true;
    });
  }, [productos, searchQuery, selectedCategory, selectedMarca, priceRange]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-body pb-20">
      {/* Header Premium (Sin Web Pública) */}
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
              onClick={() => { logout(); navigate('/login'); }}
              className="bg-slate-800 hover:bg-red-900/40 text-red-400 px-4 py-2.5 rounded-xl transition-all border border-red-500/10 active:scale-95 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              <LogOut size={16} />
              Cerrar Sesión
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

        {/* Catálogo Completo con Filtros */}
        <div className="space-y-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-white/20 rounded-full" />
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Catálogo General</h2>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                  Filtra y encuentra todo lo que necesitas
                </p>
              </div>
            </div>

            {/* Panel de Filtros VIP */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-[2rem]">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
              </div>

              {/* Categorías */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 transition-all"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Marcas */}
              <div className="relative">
                <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select 
                  value={selectedMarca}
                  onChange={(e) => setSelectedMarca(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 transition-all"
                >
                  <option value="all">Todas las Marcas</option>
                  {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>

              {/* Precio */}
              <div className="relative">
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select 
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-amber-500/20 transition-all"
                >
                  {priceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-amber-500" size={48} />
              <p className="text-amber-500/50 font-black uppercase tracking-widest text-xs">Cargando Catálogo...</p>
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
              <p className="font-black uppercase tracking-widest">No encontramos productos con esos filtros</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default VipPortal;
