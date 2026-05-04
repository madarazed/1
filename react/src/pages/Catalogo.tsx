import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, ChevronRight, Filter, Star, Tag, Loader2, ImageOff, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { PRODUCTS_IMAGE_URL } from '../constants';

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
  id_marca: number;
  nombre_marca: string;
}

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery]   = useState("");
  const [priceRange, setPriceRange]     = useState("all");
  const [selectedMarca, setSelectedMarca] = useState("all");
  const [productos, setProductos]       = useState<Producto[]>([]);
  const [marcas, setMarcas]             = useState<Marca[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);

  const activeCategory = searchParams.get('categoria') || categories[0];

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

    if (activeCategory === 'Promociones') {
      filtered = filtered.filter(p => Boolean(p.en_promocion));
    } else {
      const keys = keywordMap[activeCategory] || [];
      if (keys.length > 0) {
        filtered = filtered.filter(p =>
          keys.some(k => p.nombre.toLowerCase().includes(k))
        );
      }
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getImageUrl = (url_imagen: string) => {
    if (!url_imagen) return '/placeholder.png';
    if (url_imagen.startsWith('http')) return url_imagen;
    
    // Limpiar el nombre del archivo de prefijos como 'productos/'
    const filename = url_imagen.split('/').pop();
    
    if (!filename) return '/placeholder.png';

    // Si tiene un guion bajo, es una subida nueva del backend
    if (filename.includes('_')) {
      return `${PRODUCTS_IMAGE_URL}/${filename}`;
    }
    
    // De lo contrario, es un asset local del frontend
    return `/products/${filename}`;
  };

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-body pt-20 lg:pt-24">
      <div className="flex-1 max-w-7xl mx-auto w-full flex">
        {/* ── Sidebar ── */}
        <aside className="w-64 border-r border-gray-100 p-8 hidden lg:block sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-2 mb-4 text-primary opacity-50">
            <Filter size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Categorías</span>
          </div>

            <nav className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-2"
                      : "text-gray-500 hover:bg-gray-100"
                  } ${cat === "Promociones" && activeCategory !== cat ? "text-orange-600 font-black" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {cat === "Promociones" && (
                      <Star size={14} className={`${activeCategory === cat ? "text-white fill-white" : "text-orange-500 fill-orange-500"}`} />
                    )}
                    {cat}
                  </div>
                  <ChevronRight size={16} className={`${activeCategory === cat ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}`} />
                </button>
              ))}
            </nav>


        </aside>

        {/* ── Main ── */}
        <main className="flex-1 px-4 md:px-8 py-8 min-w-0">

          {/* Header row: title + search + price + brand filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-3">
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

            {/* Filters row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm w-full md:w-48">
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
                  <option value="all">Todas las marcas</option>
                  {marcas.map(m => (
                    <option key={m.id_marca} value={m.id_marca}>{m.nombre_marca}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Mobile selectors */}
          <div className="mb-6 lg:hidden flex flex-wrap gap-2">
            <select
              value={activeCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="flex-1 min-w-[120px] bg-white border border-gray-100 rounded-xl px-3 py-2.5 font-black text-primary uppercase italic tracking-tighter shadow-sm text-xs"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-black text-primary outline-none shadow-sm"
            >
              {priceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 text-xs font-black text-primary outline-none shadow-sm flex-1 min-w-[120px]"
            >
              <option value="all">Todas las marcas</option>
              {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre_marca}</option>)}
            </select>
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
              <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                          <img
                            src={getImageUrl(product.url_imagen)}
                            alt={product.nombre}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="space-y-1 mb-3 md:mb-4 flex-1">
                          <span className="text-[10px] font-black text-primary-light uppercase tracking-widest">{activeCategory}</span>
                          <h3 className="font-black text-primary uppercase italic text-xs md:text-sm leading-tight tracking-tight line-clamp-2">
                            {product.nombre}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-base md:text-lg font-black text-primary tracking-tighter">
                              {product.en_promocion && product.precio_oferta && product.precio_oferta > 0 
                                ? formatCurrency(product.precio_oferta) 
                                : formatCurrency(product.precio)}
                            </p>
                            {Boolean(product.en_promocion && Number(product.precio_oferta) > 0) && (
                              <p className="text-[10px] md:text-xs text-gray-400 line-through font-bold">
                                {formatCurrency(product.precio)}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart({ id: product.id, title: product.nombre, currentPrice: product.precio, image: getImageUrl(product.url_imagen) })}
                          disabled={product.stock === 0}
                          className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            product.stock === 0
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-primary text-white shadow-lg shadow-primary/10 hover:bg-primary-light hover:scale-[1.02] active:scale-[0.98]"
                          }`}
                        >
                          {product.stock === 0 ? 'Sin Stock' : <><ShoppingCart size={14} /> Añadir al Carrito</>}
                        </button>
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
  );
};

export default Catalogo;
