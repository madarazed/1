import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useMotionValue } from 'framer-motion';


import {
  ShoppingCart, Search, MessageCircle, CreditCard, Banknote, Store,
  Calendar, Handshake, Award, ArrowRight,
  MapPin, ChevronRight, Loader2, Plus, LayoutGrid, Pointer,
  Beer, Zap, Droplets, CupSoda, Wine, GlassWater, Activity, Citrus
} from 'lucide-react';

const WhatsAppIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

import ContactSection from '../components/ContactSection';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import { SEDES } from '../constants';
import { useAuth } from '../context/AuthContext';
import VipOffersCarousel from '../components/VipOffersCarousel';
import SmartImage from '../components/common/SmartImage';
import { useRoleRedirect } from '../hooks/useRoleRedirect';
import MagneticBubblesBackground from '../components/common/MagneticBubblesBackground';
import { useTutorial } from '../context/TutorialContext';
import { useDebounce } from '../hooks/useDebounce';

const heroImages = [
  "/images/hero.png",
  "/images/hero1.png",
  "/images/hero2.png"
];

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useRoleRedirect();
  const { addToCart, setIsCartOpen } = useCart();
  const { tutorialStep, setStep, isStep2Dismissed, isActive } = useTutorial();
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleFullSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // 3D Parallax motion values for right column product pack
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [15, -15]);
  const rotateY = useTransform(mouseX, [0, 1], [-15, 15]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width;
    const y = (e.clientY - rect.top) / height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };



  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Hacemos scroll exactamente al borde superior de la sección.
      // Como el header se oculta al hacer scroll down, si restamos su altura 
      // dejamos expuesta la sección anterior (hueco azul).
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
    }
  };








  // Usando utilidad global

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Parallax logic
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, 80]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    setIsScrolled(latest > 50);

    // Smart Reveal: Ocultar al bajar, mostrar al subir
    if (latest > previous && latest > 150) {
      // Logic for hiding if needed
    } else {
      // Logic for showing if needed
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as any }
    },
  };


  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await api.get('/promociones');
        if (response.data && response.data.length > 0) {
          const mappedPromos = response.data.map((promo: any) => {
            const currentPrice = Number(promo.precio_actual) > 0 ? Number(promo.precio_actual) : Number(promo.precio_original);
            const oldPrice = Number(promo.precio_actual) > 0 ? Number(promo.precio_original) : 0;
            
            return {
              id: promo.id || promo.id_producto,
              id_producto: promo.id_producto,
              title: promo.titulo_producto || promo.titulo,
              currentPrice: currentPrice,
              oldPrice: oldPrice,
              image: getImageUrl(promo.imagen_producto || promo.url_media),
              badge: promo.tipo,
              subtitle: "Calidad Garantizada"
            };
          });

          // Ordenar: 1. Oferta Relámpago, 2. Promoción del Día, 3. Otros
          const sortedPromos = [...mappedPromos].sort((a, b) => {
            const order: Record<string, number> = { 'Oferta Relámpago': 1, 'Promoción del Día': 2 };
            return (order[a.badge] || 3) - (order[b.badge] || 3);
          });

          setPromos(sortedPromos.slice(0, 3));
        }
      } catch (error) {
        console.error("Error cargando promociones de la base de datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromos();
  }, []);

  // Fetch all products for search autocomplete
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/productos');
        setAllProducts(response.data || []);
      } catch (error) {
        console.error("Error fetching all products:", error);
      }
    };
    fetchProducts();
  }, []);

  // IntersectionObserver para avanzar al Paso 2 del Onboarding cuando el catálogo de promos es visible
  useEffect(() => {
    const target = document.getElementById('promociones');
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isActive && tutorialStep < 2 && !isStep2Dismissed) {
          setStep(2);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [tutorialStep, setStep, isStep2Dismissed, isActive]);

  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];
    const term = debouncedSearchQuery.toLowerCase();
    return allProducts.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      (p.nombre_marca && p.nombre_marca.toLowerCase().includes(term))
    );
  }, [debouncedSearchQuery, allProducts]);

  return (
    <div className="bg-surface-light text-text-main font-body selection:bg-primary-light/30 scroll-smooth relative">
      <MagneticBubblesBackground />

      <main className={`relative ${
        isActive && tutorialStep === 1 ? 'z-auto' : 'z-[1]'
      }`}>
        {/* Contenedor de Lienzo Continuo (Hero + VIP) */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-white to-gray-50">
          {/* Background Image Container compartido */}
          <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-black/5">
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/95 to-transparent w-full md:w-[70%]"></div>
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentBgIndex}
                src={heroImages[currentBgIndex]}
                alt="Rapifrios Background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }} 
                className="absolute inset-0 w-full h-full object-cover object-right"
              />
            </AnimatePresence>
          </div>

          {/* Ambient Orbs — Decorative, pointer-events-none */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-blue-600 pointer-events-none mix-blend-multiply z-0 -top-32 -left-32"
            animate={{ x: [0, 40, -20, 0], y: [0, 30, 50, 0] }}
            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-10 bg-primary pointer-events-none mix-blend-multiply z-0 bottom-0 right-0"
            animate={{ x: [0, -30, 20, 0], y: [0, -40, -20, 0] }}
            transition={{ repeat: Infinity, duration: 22, ease: "linear", delay: 3 }}
          />

          <div className="relative z-10">
            {/* Hero Section */}
            <section className={`relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between pt-2 lg:pt-6 overflow-x-hidden bg-transparent ${
              isActive && tutorialStep === 1 ? 'z-auto' : 'z-10'
            }`}>
              
              {/* Content Container */}
              <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 w-full">
            <div className="relative z-10 flex flex-col min-h-[calc(100vh-80px)] max-h-screen justify-between w-full pt-16 pb-4">
              
              {/* Bloque Superior (Grid) */}
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
                
                {/* Bloque Izquierdo: Copys y Buscador */}
              <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left pointer-events-auto relative z-30 w-full">
                {/* Diseño del Buscador Reciclado */}
                <div id="tutorial-search" className="w-full max-w-xl bg-white rounded-full p-2 pl-6 flex items-center justify-between shadow-lg border border-slate-100 relative z-50 pointer-events-auto mb-6">
                  <input 
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFullSearch();
                      }
                    }}
                    className="w-full bg-transparent border-none outline-none text-slate-800 text-sm font-bold placeholder:text-slate-400 mr-2" 
                    placeholder="¿Buscas algún producto o marca?" 
                    type="text"
                  />
                  <button 
                    onClick={handleFullSearch}
                    className="w-12 h-12 rounded-full bg-[#003366] flex items-center justify-center text-white transition-transform hover:scale-105 shrink-0 cursor-pointer hover:bg-[#002244] transition-colors"
                  >
                    <Search size={20} />
                  </button>

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {isSearchFocused && searchQuery.trim().length > 0 && (
                      <motion.div
                        id="tutorial-search-results"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl z-[60] overflow-hidden text-left border border-gray-100"
                      >
                        {searchResults.length > 0 ? (
                          <div className="py-2">
                            {searchResults.slice(0, 4).map((product) => (
                              <button
                                key={product.id}
                                onClick={(e) => {
                                  addToCart({ 
                                    id: product.id, 
                                    title: product.nombre, 
                                    currentPrice: product.precio, 
                                    image: getImageUrl(product.url_imagen) 
                                  }, e);
                                  setSearchQuery("");
                                  if (tutorialStep === 2) {
                                    setStep(3);
                                    setIsCartOpen(true);
                                  } else if (isActive && tutorialStep === 1) {
                                    setIsCartOpen(true);
                                  }
                                }}
                                className="w-full px-6 py-4 hover:bg-gray-50 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                              >
                                <div className="flex items-center gap-4 text-left">
                                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1">
                                    <SmartImage 
                                      originalUrl={getImageUrl(product.url_imagen)} 
                                      productName={product.nombre}
                                      alt="" 
                                      className="w-full h-full object-contain" 
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-primary uppercase italic line-clamp-1">{product.nombre}</p>
                                    <p className="text-xs font-bold text-primary-light">{formatCurrency(product.precio)}</p>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all bg-primary/5 p-2 rounded-xl scale-90 group-hover:scale-100">
                                  <Plus size={18} className="text-primary" />
                                </div>
                              </button>
                            ))}
                            {searchResults.length > 4 && (
                              <button 
                                onClick={() => navigate(`/catalogo?search=${encodeURIComponent(searchQuery)}`)}
                                className="w-full py-4 bg-gray-50/50 text-[10px] font-black text-primary-light uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                Ver todos los resultados <ArrowRight size={12} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="p-8 text-center opacity-40">
                            <Search size={32} className="mx-auto mb-2" />
                            <p className="text-xs font-bold uppercase tracking-widest">No encontramos coincidencias</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-primary leading-tight tracking-tight mb-3 text-balance">
                  Tu Bodega de Bebidas en Ibagué.
                </h1>
                <p className="mt-3 sm:mt-4 text-base sm:text-lg lg:text-lg text-slate-600 max-w-lg font-medium text-balance">
                  Frescura a un clic. El mayor catálogo de licores y bebidas a domicilio.
                </p>
                <button 
                  onClick={() => navigate('/catalogo')}
                  className="mt-4 px-8 py-3.5 bg-primary text-white font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/30 hover:scale-[1.02] hover:bg-primary/90 transition-all duration-300 w-full md:w-auto text-sm flex items-center justify-center gap-2"
                >
                  EXPLORAR CATÁLOGO
                </button>
              </div>

              {/* Bloque Derecho: Objeto Flotante Standalone 3D */}
              <div className="flex justify-center relative pointer-events-none z-10 w-full mt-8 lg:mt-0">
                <div 
                  onPointerMove={handlePointerMove}
                  onPointerLeave={handlePointerLeave}
                  className="relative w-64 h-64 md:w-[350px] md:h-[350px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] flex items-center justify-center pointer-events-auto isolate"
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative w-full h-full flex items-center justify-center cursor-pointer z-10"
                    onClick={() => document.getElementById('promociones')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    {/* La Imagen del Producto (etiqueta img estándar, PROHIBIDO SMARTIMAGE) */}
                    <img 
                      src="/michelontrasparente.png" 
                      alt="Paca Michelob Ultra 24 Latas" 
                      className="max-h-[30vh] lg:max-h-[45vh] w-full object-contain drop-shadow-2xl mx-auto"
                    />

                    {/* Insignia de Oferta Flash */}
                    <div 
                      className="absolute -top-4 -right-4 z-20 bg-red-600 text-white rounded-full px-6 py-3 shadow-xl shadow-red-900/50 border border-red-400/30 flex flex-col items-center justify-center"
                      style={{ transform: "translateZ(40px)" }}
                    >
                      <span className="text-[10px] text-red-200 font-bold tracking-widest uppercase mb-0.5">OFERTA FLASH</span>
                      <span className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">-23% DCTO</span>
                    </div>
                  </motion.div>

                  {/* Sutil Halo de Luz Azul Sincronizado */}
                  <motion.div
                    className="absolute inset-0 bg-blue-500 rounded-full blur-[60px] pointer-events-none z-0"
                    animate={{ 
                      opacity: [0, 0, 0.5, 0, 0],
                      scale: [0.8, 0.8, 1.1, 1.3, 0.8]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      times: [0, 0.28, 0.32, 0.45, 1], 
                      delay: 1.5,
                      ease: "easeOut"
                    }}
                  />

                  {/* Cursor Animado (Hint UI) */}
                  <motion.div
                    className="absolute bottom-[15%] right-[25%] z-30 pointer-events-none drop-shadow-2xl"
                    animate={{ 
                      opacity: [0, 1, 1, 1, 0, 0],
                      x: [40, 0, 0, 0, 40, 40],
                      y: [40, 0, 0, 0, 40, 40],
                      scale: [1, 1, 0.8, 1, 1, 1]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      times: [0, 0.15, 0.3, 0.35, 0.5, 1],
                      delay: 1.5,
                      ease: "easeInOut"
                    }}
                  >
                    <Pointer className="w-8 h-8 text-[#003366] fill-white drop-shadow-md" />
                  </motion.div>
                </div>
              </div>

              </div>

              {/* Bloque Inferior: Carrusel de Categorías Horizontal (Tarjetas Flotantes Blancas) */}
              <div className="w-full max-w-7xl mx-auto px-4 pb-4 pt-4 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 justify-start lg:justify-center z-20 shrink-0">
                {[
                  { name: 'Aguas', icon: Droplets },
                  { name: 'Cervezas', icon: Beer },
                  { name: 'Energizantes', icon: Zap },
                  { name: 'Gaseosas', icon: CupSoda },
                  { name: 'Hidratantes', icon: Activity },
                  { name: 'Jugos', icon: Citrus },
                  { name: 'Licores', icon: Wine },
                  { name: 'Sodas', icon: GlassWater }
                ].map((cat) => (
                  <motion.div
                    key={cat.name}
                    onClick={() => navigate(`/catalogo?categoria=${cat.name}`)}
                    className="snap-center shrink-0 bg-white shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-primary/20 min-w-[100px] h-[110px] rounded-2xl md:rounded-3xl flex flex-col items-center justify-center p-3 cursor-pointer transition-all duration-300 hover:-translate-y-2 group border border-slate-100"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2 shrink-0 text-primary">
                      <cat.icon size={32} className="text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    </div>
                    <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-widest text-center">{cat.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <VipOffersCarousel />
      </div>
    </div>

    {/* --- INICIO: MARQUESINA INFINITA --- */}
    <div className="w-full bg-slate-900 text-white py-3 overflow-hidden flex whitespace-nowrap border-y border-slate-800 relative z-10">
      <motion.div className="flex items-center" animate={{ x: [0, "-50%"] }} transition={{ repeat: Infinity, ease: "linear", duration: 25 }}>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-12 items-center px-6 text-sm md:text-base font-medium uppercase tracking-wider">
            <span className="flex items-center gap-2"><span className="text-amber-400">⚡</span> Domicilios a todo Ibagué</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-2"><span className="text-amber-400">💎</span> Precios mayoristas</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-2"><span className="text-amber-400">🏆</span> Rapifrios LTDA la mejor Distribuidora de bebidas en Ibagué</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-2"><span className="text-amber-400">🧊</span> Explora nuestro catálogo</span>
            <span className="text-slate-500">•</span>
          </div>
        ))}
      </motion.div>
    </div>
    {/* --- FIN: MARQUESINA INFINITA --- */}

        {/* Featured Promotions (Responsive Optimized) */}
        <section id="promociones" className="min-h-[100dvh] w-full flex items-center brand-gradient relative z-0 overflow-hidden py-16 md:py-0 scroll-mt-[5rem]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
            <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-end mb-12 gap-6">
              <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white mb-3 flex flex-col md:flex-row items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-2">
                    🔥 PROMOCIONES
                    {isLoading && <Loader2 className="animate-spin text-white/50" size={24} />}
                  </div>
                  <span className="text-sm md:text-2xl font-bold text-white mt-1 md:mt-0 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">¡Ahorra hasta un 25%!</span>
                </h2>
                <p className="text-white/80 text-base md:text-lg font-semibold">Favoritos de <span className="text-white font-black uppercase">IBAGUÉ</span></p>
              </div>
              <button 
                onClick={() => navigate('/catalogo?categoria=Promociones')}
                className="text-white font-black flex items-center gap-2 hover:translate-x-2 transition-all bg-white/10 px-6 py-3 rounded-full md:bg-transparent md:px-0 md:py-0 md:rounded-none"
              >
                Ver Catálogo Completo <ChevronRight size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {promos.map((promo, index) => {
                let cardClass = "product-card group p-4 rounded-[2rem] relative bg-white w-full max-w-[340px] mx-auto md:max-w-none md:mx-0 shadow-2xl flex flex-col";
                let badgeText = promo.badge;
                let badgeColorClass = "bg-primary-light";
                let subtitleText = "Calidad Garantizada";

                if (promo.badge === 'Oferta Relámpago') {
                  cardClass += " shadow-[0_0_30px_rgba(0,75,147,0.5)] border-2 border-[#004b93]/50";
                  badgeColorClass = "bg-gradient-to-r from-[#004b93] to-[#e31b23] shadow-lg shadow-[#004b93]/30";
                  subtitleText = "¡Temporada de Mundial!";
                } else if (promo.badge === 'Promoción del Día') {
                  cardClass += " shadow-[0_0_30px_rgba(59,130,246,0.5)] border-2 border-blue-500/50";
                  badgeColorClass = "bg-blue-500 shadow-lg shadow-blue-500/30";
                  subtitleText = "Solo por hoy";
                }

                return (
                  <motion.div
                    key={promo.id}
                    className={cardClass}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.12 }}
                  >
                    {badgeText && (
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10 whitespace-nowrap flex items-center gap-2 ${badgeColorClass} shadow-md`}>
                        <span>{badgeText === 'Oferta Relámpago' ? '🏆 Oferta Mundialista' : badgeText}</span>
                      </div>
                    )}
                    <div className="relative h-48 md:h-52 mb-6 rounded-[1.5rem] overflow-hidden bg-gray-50/30 flex items-center justify-center">
                      <SmartImage 
                        originalUrl={promo.image} 
                        productName={promo.title}
                        alt={promo.title} 
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-4" 
                      />
                      {promo.title.toLowerCase().includes('michelob') && (
                        <div className="absolute top-2 left-2 bg-[#004b93] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md z-20">
                          Suministro Oficial ⚽
                        </div>
                      )}
                    </div>
                    <div className="px-2 pb-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex-1 min-h-[3.5rem]">
                          <h3 className="text-lg md:text-xl font-black text-primary italic leading-tight uppercase line-clamp-2">{promo.title}</h3>
                          <p className="text-primary-light text-[10px] font-black mt-1 uppercase tracking-widest">{subtitleText}</p>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0">
                          {Number(promo.oldPrice) > 0 && (
                            <span className="text-xs text-text-main/40 line-through font-bold">
                              {formatCurrency(promo.oldPrice)}
                            </span>
                          )}
                          <span className="text-xl md:text-2xl font-black text-primary font-headline tracking-tighter">
                            {formatCurrency(promo.currentPrice)}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        id={index === 0 ? "tutorial-add-cart-promo" : undefined}
                        onClick={(e) => {
                          addToCart(promo, e);
                          if (tutorialStep === 2) {
                            setStep(3);
                            setIsCartOpen(true);
                          }
                        }}
                        className="w-full primary-cta-btn py-4 rounded-cta text-white active:scale-95 flex items-center justify-center gap-2 mt-auto"
                      >
                        <ShoppingCart size={20} />
                        Añadir al Carrito
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Full-Viewport Categories Dashboard (Fitted) */}
        <section id="categorias" className="w-full px-4 md:px-8 bg-white min-h-[100dvh] flex flex-col justify-center py-24 md:py-32 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
          {/* Top Header */}
          <div className="mb-8 flex justify-between items-center w-full border-b border-gray-100 pb-4">
            <h2 className="text-3xl font-black font-headline tracking-tighter uppercase text-primary shrink-0">Categorías</h2>
          </div>

          {/* Categories Grid (8 Items) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0">
            {[
              { name: 'Aguas', color: 'from-teal-500/80 to-emerald-800/90', img: '/categorias/aguas.png' },
              { name: 'Cervezas', color: 'from-blue-600/80 to-blue-900/90', img: '/categorias/cervezas.png' },
              { name: 'Energizantes', color: 'from-orange-600/80 to-orange-900/90', img: '/categorias/energizantes.png' },
              { name: 'Gaseosas', color: 'from-red-600/80 to-red-900/90', img: '/categorias/gaseosas.png' },
              { name: 'Hidratantes', color: 'from-cyan-600/80 to-cyan-900/90', img: '/categorias/hidratantes.png' },
              { name: 'Jugos', color: 'from-yellow-600/80 to-yellow-900/90', img: '/categorias/jugos.png' },
              { name: 'Licores', color: 'from-purple-700/80 to-indigo-900/90', img: '/categorias/licores.png' },
              { name: 'Sodas', color: 'from-pink-500/80 to-rose-800/90', img: '/categorias/sodas.png' }
            ].map((cat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                whileHover={{ y: -5 }}
                className="relative group rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full bg-surface-light"
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} mix-blend-multiply transition-opacity`}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-5 flex flex-col h-full justify-end items-start text-white">
                  <div className="space-y-3 w-full">
                    <h3 className="text-3xl font-black font-headline tracking-tighter italic uppercase drop-shadow-lg">{cat.name}</h3>
                    <button 
                      onClick={() => navigate(`/catalogo?categoria=${cat.name}`)}
                      className="w-full py-3 bg-white text-primary font-black rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 group/btn shadow-xl active:scale-95 text-sm"
                    >
                      Explorar
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA (Full-Viewport Fitted) */}
        <section className="min-h-[100dvh] w-full flex items-center justify-center px-4 md:px-6 bg-surface-light py-24 md:py-32">
          <div className="max-w-4xl w-full mx-auto rounded-[2.5rem] overflow-hidden relative brand-gradient p-8 md:p-12 text-center shadow-2xl max-h-[90vh] flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-white/20"></div>
            <div className="relative z-10 space-y-6 md:space-y-8">
              <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white leading-tight uppercase italic text-balance">REALIZA TU PEDIDO <br/> <span className="text-white/80">POR WHATSAPP</span></h2>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed text-balance">Elige tu punto mas cercano. Desde el sur hasta la 80 elige Centro, de la 80 en adelante elige Salado</p>
              
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-[400px] mx-auto">
                  <button 
                    onClick={() => window.open(`https://wa.me/${SEDES.CENTRO.wa}`, '_blank')}
                    className="whatsapp-btn px-6 py-4 rounded-2xl text-white font-black text-lg hover:scale-105 transition-transform flex items-center gap-3 shadow-xl flex-1 min-w-[160px] justify-center"
                  >
                    Centro
                    <WhatsAppIcon size={20} />
                  </button>
                  <button 
                    onClick={() => window.open(`https://wa.me/${SEDES.SALADO.wa}`, '_blank')}
                    className="whatsapp-btn px-6 py-4 rounded-2xl text-white font-black text-lg hover:scale-105 transition-transform flex items-center gap-3 shadow-xl flex-1 min-w-[160px] justify-center"
                  >
                    Salado
                    <WhatsAppIcon size={20} />
                  </button>
                </div>
                <a className="text-white/70 hover:text-white font-medium text-sm transition-all" href="#">
                  ¿Tienes dudas? habla con un humano
                </a>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                  <div className="flex items-center gap-2 opacity-80">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DA0081]"></span>
                    <span className="text-white font-black text-xs uppercase tracking-widest">Nequi</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-80">
                    <CreditCard className="text-white" size={16} />
                    <span className="text-white font-black text-xs uppercase tracking-widest">Tarjeta</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-80">
                    <Banknote className="text-white" size={16} />
                    <span className="text-white font-black text-xs uppercase tracking-widest">Efectivo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-20 md:py-32 brand-gradient relative z-0">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white text-center mb-20 uppercase italic">Métodos de Entrega</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Punto Físico Card */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.2)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-lg text-center flex flex-col items-center cursor-default"
              >
                <div className="w-36 h-36 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-8 transition-colors">
                  <Store className="text-white" size={64} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">Punto Físico</h3>
                <p className="text-white/90 font-semibold text-lg">Recoge en bodega sin filas</p>
              </motion.div>

              {/* Domicilio Card */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.2)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-lg text-center flex flex-col items-center cursor-default"
              >
                <div className="w-36 h-36 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-8 transition-colors">
                  <Calendar className="text-white" size={64} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">Domicilio</h3>
                <p className="text-white/90 font-semibold text-lg">Entregas programadas a tu negocio</p>
              </motion.div>

              {/* Contra Entrega Card */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.2)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-lg text-center flex flex-col items-center cursor-default"
              >
                <div className="w-36 h-36 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-8 transition-colors">
                  <Banknote className="text-white" size={64} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">Contra Entrega</h3>
                <p className="text-white/90 font-semibold text-lg">Paga seguro al recibir</p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Purchase Flow Section (Full-Viewport) */}
        <section className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-20 md:py-32 bg-surface-light relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-primary text-center mb-24 uppercase italic">Flujo de Compra en 3 Pasos</h2>
            <div className="relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-primary/10"></div>
              <div className="grid md:grid-cols-3 gap-16 relative z-10">
                {/* Step 1 */}
                <div className="text-center space-y-8 flex flex-col items-center group">
                  <div className="w-24 h-24 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center relative group-hover:border-primary transition-colors duration-500">
                    <div className="absolute -top-3 -right-3 w-10 h-10 brand-gradient text-white rounded-full flex items-center justify-center font-black shadow-lg">1</div>
                    <ShoppingCart className="text-primary" size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight mb-3 uppercase italic">Selecciona tus productos</h3>
                    <p className="text-text-main text-base font-semibold max-w-xs mx-auto">Navega por nuestro catálogo y añade tus bebidas favoritas al carrito de compras.</p>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="text-center space-y-8 flex flex-col items-center group">
                  <div className="w-24 h-24 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center relative group-hover:border-primary transition-colors duration-500">
                    <div className="absolute -top-3 -right-3 w-10 h-10 brand-gradient text-white rounded-full flex items-center justify-center font-black shadow-lg">2</div>
                    <MapPin className="text-primary" size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight mb-3 uppercase italic">Selecciona tu sede</h3>
                    <p className="text-text-main text-base font-semibold max-w-xs mx-auto">Elige la sede más cercana (Centro o Salado) para garantizar una entrega rápida y fresca.</p>
                  </div>
                </div>
                {/* Step 3 */}
                <div className="text-center space-y-8 flex flex-col items-center group">
                  <div className="w-24 h-24 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center relative group-hover:border-primary transition-colors duration-500">
                    <div className="absolute -top-3 -right-3 w-10 h-10 brand-gradient text-white rounded-full flex items-center justify-center font-black shadow-lg">3</div>
                    <MessageCircle className="text-primary" size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-primary tracking-tight mb-3 uppercase italic">Pide por WhatsApp</h3>
                    <p className="text-text-main text-base font-semibold max-w-xs mx-auto">Envía tu lista por WhatsApp y coordina el pago y la entrega con nuestro equipo.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Identity and Commitment (Full-Viewport) */}
        <section className="min-h-[100dvh] w-full flex items-center justify-center px-6 py-20 md:py-32 bg-primary overflow-hidden relative z-0">
          <div className="max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white/10 max-w-full">
                <img alt="Sede Principal Rapifrios Ibagué" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" src="/sede-rapifrios.jpg"/>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-black text-white italic mb-2 tracking-tighter">ORGULLO IBAGUEREÑO</h3>
                  <div className="w-12 h-1 bg-primary-light rounded-full"></div>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white mb-4 uppercase text-balance">Identidad y Compromiso</h2>
                  <p className="text-white/90 text-lg font-medium leading-relaxed text-balance">Somos una empresa nacida en Ibagué, dedicada a brindar el mejor servicio a nuestra comunidad con estándares mundiales.</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <Handshake className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-1">Confiabilidad</h4>
                      <p className="text-white/80 text-sm font-medium">Cumplimos lo que prometemos, asegurando puntualidad.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                      <Award className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-1">📦 Stock Garantizado</h4>
                      <p className="text-white/80 text-sm font-medium">Directo de Distribuidora, asegurando calidad y suministro.</p>
                    </div>
                  </div>
                </div>
                <a
  href="https://view.genially.com/6ac676b0b927ccff11958638"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-white text-primary hover:bg-primary-light hover:text-white px-8 py-3.5 rounded-cta text-base transition-all duration-300 inline-flex items-center gap-3 font-bold shadow-xl"
>
  Quiénes somos
  <ArrowRight size={16} />
</a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact and Locations Section (Fitted Full-Viewport) */}
        <ContactSection />






      </main>

    </div>
  );
};

export default Landing;
