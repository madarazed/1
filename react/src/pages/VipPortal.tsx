import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, LogOut, Search, Loader2, Filter, SlidersHorizontal, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import { SeccionExclusiva } from '../components/SeccionExclusiva';
import SmartImage from '../components/common/SmartImage';
import { useRoleRedirect } from '../hooks/useRoleRedirect';

const categories = [
  "Todos", "Aguas", "Cervezas", "Energizantes", "Gaseosas", "Hidratantes", "Jugos", "Licores", "Sodas"
];

const priceOptions = [
  { value: "all",  label: "Todos los precios" },
  { value: "low",  label: "Menos de $5.000" },
  { value: "mid",  label: "$5.000 - $50.000" },
  { value: "high", label: "Más de $50.000" },
];

const ITEMS_PER_PAGE = 20;

const VipPortal = () => {
  const { user, isLoading: isAuthLoading } = useRoleRedirect();
  const { logout } = useAuth();
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

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Protección adicional: si no está cargando y no hay usuario, mandamos al index
    if (!isAuthLoading && !user) {
      navigate('/');
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

  // Reset a página 1 cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedMarca, priceRange]);



  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  // Lógica de filtrado completo
  const filtered = useMemo(() => {
    return productos.filter(p => {
      if (p.es_exclusivo) return false;

      const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.nombre_marca && p.nombre_marca.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      if (selectedCategory !== "Todos") {
        if (p.nombre_categoria !== selectedCategory) return false;
      }

      if (selectedMarca !== "all") {
        if (String(p.id_marca) !== selectedMarca) return false;
      }

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

  // Paginación: calcular página actual
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll suave al catálogo
    document.getElementById('catalogo-vip')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Generar rango de páginas visibles (máx 5 botones)
  const pageNumbers = useMemo(() => {
    const range: number[] = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    for (let i = left; i <= right; i++) range.push(i);
    return range;
  }, [currentPage, totalPages]);

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
                Bienvenido a tus Ofertas VIP
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

        {/* Catálogo Completo con Filtros y Paginación */}
        <div id="catalogo-vip" className="space-y-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-white/20 rounded-full" />
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Catálogo General</h2>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    {filtered.length} productos · Página {currentPage} de {totalPages || 1}
                  </p>
                </div>
              </div>
            </div>

            {/* Categorías (Chips con Scroll Horizontal) */}
            <div className="relative group">
              <div 
                className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex items-center gap-3 pb-4 min-w-full -webkit-overflow-scrolling-touch"
                style={{ paddingRight: '60px' }}
              >
                {categories.map(cat => (
                  <button
                    key={cat}
                    id={`vip-cat-${cat}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      document.getElementById(`vip-cat-${cat}`)?.scrollIntoView({ 
                        behavior: 'smooth', 
                        inline: 'center', 
                        block: 'nearest' 
                      });
                    }}
                    className={`snap-center min-w-[130px] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                      selectedCategory === cat
                        ? "bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-amber-500/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* Fade Shadow */}
              <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-slate-950/20 to-transparent pointer-events-none z-10 md:hidden" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-[2rem]">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
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
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {paginatedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group bg-slate-900/40 border border-slate-800 hover:border-amber-500/30 rounded-3xl p-3 transition-all duration-500 flex flex-col h-full"
                    >
                      <div className="aspect-square rounded-2xl bg-white overflow-hidden p-2 mb-3 relative">
                        <SmartImage 
                          originalUrl={getImageUrl(product.url_imagen, true)} 
                          productName={product.nombre}
                          alt={product.nombre}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
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
                        onClick={() => addToCart({ id: product.id, title: product.nombre, currentPrice: product.precio, image: getImageUrl(product.url_imagen, true) })}
                        className="mt-4 w-full bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <ShoppingCart size={14} />
                        Añadir
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  {/* Anterior */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Primera página si no está en el rango */}
                  {pageNumbers[0] > 1 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all text-xs font-black active:scale-95"
                      >
                        1
                      </button>
                      {pageNumbers[0] > 2 && (
                        <span className="text-slate-600 font-black text-xs px-1">···</span>
                      )}
                    </>
                  )}

                  {/* Páginas del rango */}
                  {pageNumbers.map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border text-xs font-black transition-all active:scale-95 ${
                        page === currentPage
                          ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-400'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Última página si no está en el rango */}
                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="text-slate-600 font-black text-xs px-1">···</span>
                      )}
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all text-xs font-black active:scale-95"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  {/* Siguiente */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
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
