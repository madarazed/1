import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, ChevronRight, Filter, Star, Tag, Loader2, ImageOff, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import SmartImage from '../components/common/SmartImage';
import FilterDrawer from '../components/FilterDrawer';


const categories = [
  "Promociones", "Aguas", "Cervezas", "Energizantes", "Gaseosas", "Hidratantes", "Jugos", "Licores", "Sodas"
];

const priceOptions = [
  { value: "all",  label: "Todos los precios" },
  { value: "low",  label: "Menos de $5.000" },
  { value: "mid",  label: "$5.000 - $50.000" },
  { value: "high", label: "Más de $50.000" },
];

const ITEMS_PER_PAGE = 24;

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  url_imagen: string;
  precio: number;
  stock: number;
  id_marca: number;
  nombre_marca: string;
  id_categoria: number | null;
  en_promocion?: boolean;
  precio_oferta?: number;
}

interface Marca {
  id: number;
  nombre: string;
}

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange]     = useState("all");
  const [selectedMarca, setSelectedMarca] = useState("all");
  const [productos, setProductos]       = useState<Producto[]>([]);
  const [marcas, setMarcas]             = useState<Marca[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const activeCategory = searchParams.get('categoria') || (searchParams.get('search') ? 'Búsqueda' : categories[0]);

  // Sincronizar el estado de búsqueda con los parámetros de la URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      
      // Si llegamos con búsqueda, limpiamos la categoría para que sea global
      if (searchParams.has('categoria')) {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('categoria');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user) return;

    // Redirección por rol
    const isRepartidor = user.roles?.some(r => r.nombre === 'Repartidor' || r.nombre === 'Conductor');
    const isAdmin = user.roles?.some(r => ['Superadmin', 'Admin Sucursal', 'Cajera', 'Contabilidad'].includes(r.nombre));
    const isCliente = user.role === 'cliente' || String(user.id_rol) === '6';

    if (isRepartidor && !isAdmin) {
      navigate('/repartidor/checkin');
    } else if (isAdmin) {
      navigate('/admin');
    } else if (isCliente) {
      navigate('/vip-portal');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [prodRes, marcaRes] = await Promise.all([
          api.get('/productos'),
          api.get('/marcas'),
        ]);
        setProductos(prodRes.data);
        setMarcas(marcaRes.data);
      } catch (e) {
        setError('No se pudieron cargar los productos.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [activeCategory, searchQuery, priceRange, selectedMarca]);

  // Extracción dinámica de marcas desde los productos para asegurar la totalidad
  const availableBrands = useMemo(() => {
    const brandsMap = new Map<number, string>();
    
    // Primero añadimos las que vienen de la API de marcas (si existen)
    marcas.forEach(m => brandsMap.set(m.id, m.nombre));
    
    // Luego nos aseguramos de incluir cualquier marca que aparezca en los productos
    productos.forEach(p => {
      if (p.id_marca && p.nombre_marca) {
        brandsMap.set(p.id_marca, p.nombre_marca);
      }
    });

    return Array.from(brandsMap.entries())
      .map(([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [productos, marcas]);

  const handleCategoryChange = (category: string) => {
    setSearchParams({ categoria: category });
  };

  const keywordMap: Record<string, string[]> = {
    "Aguas":        ["agua", "brisa", "cristal", "manantial", "glacial", "pool", "h2o", "cordillera", "bless", "botellon", "cielo", "zalva"],
    "Cervezas":     ["aguila", "poker", "club", "costeña", "corona", "budweiser", "stella", "michelob", "redds", "cola y pola", "bacana", "bbc", "andina", "sol", "tecate", "heinik", "pony malta", "malta leona"],
    "Energizantes": ["vive 100", "red bull", "speed", "amper", "spartan", "monster"],
    "Gaseosas":     ["coca cola", "pepsi", "postobon", "bretaña", "big cola", "tropikola", "quatro", "sprite", "ginger"],
    "Hidratantes":  ["gatorade", "powerade", "sporade", "hatsu", "fuze tea", "saviloe", "squash", "cifrut", "fruttsi", "like", "zen", "panelada", "frizz", "electrolit"],
    "Jugos":        ["hit", "mr tea", "valle", "del valle", "cifrut"],
    "Licores":      ["aguardiente", "ron", "whisky", "vodka", "tequila", "jose cuervo", "johnnie", "four loko", "cuates", "old parr", "chivas", "black"],
    "Sodas":        ["schweppes", "tonica", "soda", "bretaña", "brisa gas", "cristal gas"],
    "Promociones":  [],
  };
  
  const getFilteredProducts = () => {
    let filtered = [...productos];

    // Prioridad de Filtrado: Si es una búsqueda global (sin categoría explícita), 
    // evitamos filtrar por la categoría default "Promociones".
    const hasExplicitCategory = searchParams.has('categoria');
    const isGlobalSearch = !hasExplicitCategory && searchQuery.trim() !== "";

    if (!isGlobalSearch) {
      if (activeCategory === 'Promociones') {
        filtered = filtered.filter(p => Boolean(p.en_promocion));
      } else if (activeCategory !== 'Búsqueda') {
        const keys = keywordMap[activeCategory] || [];
        if (keys.length > 0) {
          filtered = filtered.filter(p =>
            keys.some(k => p.nombre.toLowerCase().includes(k))
          );
        }
      }
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        (p.nombre_marca && p.nombre_marca.toLowerCase().includes(term))
      );
    }

    if (selectedMarca !== 'all') {
      filtered = filtered.filter(p => p.id_marca === Number(selectedMarca));
    }

    if (priceRange === "low")  filtered = filtered.filter(p => p.precio < 5000);
    if (priceRange === "mid")  filtered = filtered.filter(p => p.precio >= 5000 && p.precio <= 50000);
    if (priceRange === "high") filtered = filtered.filter(p => p.precio > 50000);

    return filtered;
  };

  // Usando utilidad global unificada

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);

  const filtered   = getFilteredProducts();
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleOpenFilters = () => setIsFilterDrawerOpen(true);
    window.addEventListener('open-filters', handleOpenFilters);
    return () => window.removeEventListener('open-filters', handleOpenFilters);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-body pt-20 lg:pt-24 landscape-pt">
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col">
        <div className="relative sticky top-[73px] lg:top-[88px] z-30 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-gray-100 mb-2">
          <div 
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex items-center gap-3 px-4 py-4 min-w-full pb-1 -webkit-overflow-scrolling-touch"
            style={{ paddingRight: '60px' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                id={`cat-${cat}`}
                onClick={() => {
                  handleCategoryChange(cat);
                  document.getElementById(`cat-${cat}`)?.scrollIntoView({ 
                    behavior: 'smooth', 
                    inline: 'center', 
                    block: 'nearest' 
                  });
                }}
                className={`snap-center min-w-[140px] px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-primary to-blue-600 border-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-white border-gray-100 text-gray-500 hover:border-primary/30"
                } ${cat === "Promociones" && activeCategory !== cat ? "text-orange-600 border-orange-200" : ""}`}
              >
                <div className="flex items-center justify-center gap-2">
                  {cat === "Promociones" && (
                    <Star size={12} className={`${activeCategory === cat ? "text-white fill-white" : "text-orange-500 fill-orange-500"}`} />
                  )}
                  {cat}
                </div>
              </button>
            ))}
          </div>
          {/* Sombra de desvanecimiento derecha (Affordance de scroll) */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#F8F9FA] to-transparent pointer-events-none z-40 lg:hidden" />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          
        {/* ── Main ── */}
        <main className="flex-1 px-4 md:px-8 py-8 min-w-0">

          {/* Header row: title + search + price + brand filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-start mb-6 md:mb-8 gap-4 md:gap-8">
            <div className="flex items-center gap-4 shrink-0">
              <div className="w-1.5 h-8 bg-primary rounded-full hidden md:block" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-primary uppercase italic tracking-tighter flex items-center gap-2">
                  {activeCategory}
                  {activeCategory === "Promociones" && (
                    <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full not-italic">Hot</span>
                  )}
                </h2>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {isLoading ? 'Cargando...' : `${filtered.length} productos`}
                </p>
              </div>
            </div>

            {/* Filters row - Aligned to left */}
            <div className="hidden lg:flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm w-64">
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="flex-1 bg-transparent text-xs font-bold outline-none text-primary placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-primary text-xs font-black leading-none">✕</button>
                )}
              </div>

              {/* Price filter */}
              <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                <Tag size={13} className="text-gray-400 shrink-0" />
                <select
                  value={priceRange}
                  onChange={e => setPriceRange(e.target.value)}
                  className="bg-transparent text-xs font-black text-primary outline-none cursor-pointer"
                >
                  {priceOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Brand filter */}
              <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                <SlidersHorizontal size={13} className="text-gray-400 shrink-0" />
                <select
                  value={selectedMarca}
                  onChange={e => setSelectedMarca(e.target.value)}
                  className="bg-transparent text-xs font-black text-primary outline-none cursor-pointer max-w-[130px]"
                >
                  <option key="all" value="all">Todas las marcas</option>
                  {availableBrands.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Search only */}
            <div className="lg:hidden flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm flex-1">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="¿Qué buscas hoy?"
                className="flex-1 bg-transparent text-xs font-bold outline-none text-primary placeholder:text-gray-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>


          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <ImageOff size={64} className="mb-4 text-primary" />
              <h3 className="text-xl font-black uppercase italic">{error}</h3>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && (
            <>
              <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                  {paginated.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="group"
                    >
                      <div className="bg-white rounded-3xl p-3 md:p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col h-full">
                        {product.stock === 0 ? (
                          <div className="absolute top-4 right-4 z-10 bg-red-500/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            Agotado
                          </div>
                        ) : Boolean(product.en_promocion) && (
                          <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <Star size={10} className="fill-white" /> Oferta
                          </div>
                        )}

                        <div className="aspect-video rounded-2xl overflow-hidden bg-gray-50 mb-3 md:mb-4 relative">
                          <SmartImage
                            originalUrl={getImageUrl(product.url_imagen)}
                            productName={product.nombre}
                            alt={product.nombre}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {product.nombre.toLowerCase().includes('michelob') && (
                            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#004b93] to-[#e31b23] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-md">
                              Suministro Oficial ⚽
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 mb-3 md:mb-4 flex-1">
                          <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">{activeCategory}</span>
                          <h3 className="font-black text-primary uppercase italic text-xs md:text-sm leading-tight tracking-tight line-clamp-2">
                            {product.nombre}
                          </h3>
                          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {product.nombre_marca || 'Importado'}
                          </p>
                          <div className="mt-3 md:mt-4 flex flex-col">
                            {Number(product.precio_oferta) > 0 && (
                              <span className="text-[10px] md:text-xs text-orange-500 line-through font-bold">
                                {formatCurrency(product.precio)}
                              </span>
                            )}
                            <span className="text-xl md:text-2xl font-black text-primary tracking-tighter italic">
                              {formatCurrency(Number(product.precio_oferta) > 0 ? Number(product.precio_oferta) : Number(product.precio))}
                            </span>
                          </div>
                        </div>

                        <motion.button 
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart({ id: product.id, title: product.nombre, currentPrice: product.precio, image: getImageUrl(product.url_imagen) })}
                          disabled={product.stock === 0}
                          className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            product.stock === 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-primary text-white shadow-lg shadow-primary/10 hover:bg-primary-light hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        >
                          {product.stock === 0 ? 'Sin Stock' : <><ShoppingCart size={14} /> Añadir al Carrito</>}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Empty state */}
              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                  <Search size={64} className="mb-4" />
                  <h3 className="text-xl font-black uppercase italic">No se encontraron productos</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mt-2">Intenta con otra búsqueda o categoría</p>
                </div>
              )}

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-primary font-black disabled:opacity-30 hover:border-primary transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '…' ? (
                        <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 font-bold">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goToPage(p as number)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm transition-all ${
                            currentPage === p
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )
                  }

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-primary font-black disabled:opacity-30 hover:border-primary transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>

                  <span className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </main>
        </div>
      </div>


      {/* Filter Drawer Component */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedMarca={selectedMarca}
        setSelectedMarca={setSelectedMarca}
        availableBrands={availableBrands}
        priceOptions={priceOptions}
      />
    </div>
  );
};

export default Catalogo;
