import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';


import {
  ShoppingCart, Search, MessageCircle, CreditCard, Banknote, Store,
  Calendar, Handshake, Award, ArrowRight,
  MapPin, ChevronRight, Loader2, Plus
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
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { SEDES, PRODUCTS_IMAGE_URL } from '../constants';



const Landing = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600 + 45 * 60 + 23); // 1h 45m 23s inicial
  const [timeUntilSix, setTimeUntilSix] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem('hasSeenMichelobModal');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
        sessionStorage.setItem('hasSeenMichelobModal', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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




  // Countdown logic for Flash Sale
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown logic for 6 PM
  useEffect(() => {
    const calculateTimeUntilSix = () => {
      const now = new Date();
      const sixPM = new Date();
      sixPM.setHours(18, 0, 0, 0);

      if (now >= sixPM) {
        sixPM.setDate(sixPM.getDate() + 1);
      }

      const diff = Math.floor((sixPM.getTime() - now.getTime()) / 1000);
      setTimeUntilSix(diff);
    };

    calculateTimeUntilSix();
    const timer = setInterval(calculateTimeUntilSix, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getImageUrl = (url_imagen: string | null | undefined) => {
    if (!url_imagen) return '/products/placeholder.jpg';
    if (url_imagen.startsWith('http')) return url_imagen;
    
    const filename = url_imagen.split('/').pop();
    if (!filename) return '/products/placeholder.jpg';

    // Si el nombre del archivo contiene un guion bajo, es probable que venga del backend
    // (prefijo timestamp_nombrearchivo)
    if (filename.includes('_')) {
      return `${PRODUCTS_IMAGE_URL}/${filename}`;
    }
    
    // De lo contrario, buscamos en los assets locales
    return `/products/${filename}`;
  };

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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.toLowerCase();
    return allProducts.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      (p.nombre_marca && p.nombre_marca.toLowerCase().includes(term))
    ).slice(0, 6); // Limitar a 6 resultados para que no sea gigante
  }, [searchQuery, allProducts]);

  return (
    <div className="bg-surface-light text-text-main font-body selection:bg-primary-light/30 scroll-smooth">

      <main>
        {/* Hero Section */}
        <section className="relative h-[100dvh] flex flex-col justify-center overflow-hidden bg-white pt-28 pb-16 md:pt-32 md:pb-0">
          {/* Background Image Container */}
          <motion.div 
            style={{ y: yParallax }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/90 to-transparent w-full md:w-[70%]"></div>
            <img alt="Rapifrios delivery dynamic hero" className="w-full h-full object-cover object-right" src="/images/hero.png"/>
          </motion.div>
          
          {/* Content */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 w-full">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl space-y-6 scale-90 md:scale-95 lg:scale-100 origin-left"
            >
              <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black font-headline tracking-tighter leading-[1.05] text-primary">
                Variedad y Calidad <br className="hidden sm:block"/>
                <span className="text-primary-light">Garantizada</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-text-main text-xl max-w-md font-medium leading-relaxed">
                Desde gaseosas, cervezas y todo tipo de bebidas en un solo lugar. Frescura a un click de distancia.
              </motion.p>

              {/* New Conversion Flow Block */}
              <motion.div variants={itemVariants} className="flex flex-col gap-5 mt-10">
                {promos.find(p => p.badge === 'Oferta Relámpago') && (
                  <motion.div 
                    onClick={() => document.getElementById('promociones')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    animate={{ 
                      backgroundColor: ["#ffffff", "#004b93", "#ffffff", "#e31b23", "#ffffff"],
                      scale: [1, 1.05, 1, 1.05, 1],
                      boxShadow: [
                        "0 0 15px rgba(0, 75, 147, 0.3)",
                        "0 0 35px rgba(0, 75, 147, 0.7)",
                        "0 0 15px rgba(0, 75, 147, 0.3)",
                        "0 0 35px rgba(227, 27, 35, 0.7)",
                        "0 0 15px rgba(0, 75, 147, 0.3)"
                      ]
                    }}
                    whileHover={{ 
                      scale: 1.08,
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="p-4 rounded-r-3xl rounded-l-lg border-l-4 border-[#004b93] flex items-center gap-5 cursor-pointer w-full max-w-[320px] md:max-w-[350px] relative z-10 shadow-xl"
                  >
                    <div className="bg-gradient-to-br from-[#004b93] to-[#e31b23] p-1 rounded-lg shadow-lg shadow-[#004b93]/20 transform -rotate-12 w-16 h-16 shrink-0 overflow-hidden border-2 border-white/40">
                      <img 
                        src={getImageUrl(promos.find(p => p.badge === 'Oferta Relámpago')?.image)} 
                        className="w-full h-full object-cover rounded-md"
                        alt="Flash Sale"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-4">
                        <motion.span 
                          animate={{ color: ["#004b93", "#ffffff", "#e31b23", "#ffffff", "#004b93"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="text-[12px] font-black uppercase tracking-[0.2em]"
                        >
                          🏆 Oferta Mundialista ⚽
                        </motion.span>
                        <motion.div 
                          animate={{ backgroundColor: ["rgba(0,0,0,0.1)", "rgba(255,255,255,0.2)", "rgba(0,0,0,0.1)", "rgba(255,255,255,0.2)", "rgba(0,0,0,0.1)"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="px-2 py-0.5 rounded-lg border border-black/5"
                        >
                          <motion.span 
                            animate={{ color: ["#0f172a", "#ffffff", "#0f172a", "#ffffff", "#0f172a"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="font-mono text-xs font-bold"
                          >
                            {formatTime(timeLeft)}
                          </motion.span>
                        </motion.div>
                      </div>
                      
                      <div className="flex items-baseline gap-2">
                        <motion.span 
                          animate={{ color: ["#0f172a", "#ffffff", "#0f172a", "#ffffff", "#0f172a"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="text-3xl font-black font-headline tracking-tighter"
                        >
                          {formatCurrency(promos.find(p => p.badge === 'Oferta Relámpago')?.currentPrice)}
                        </motion.span>
                        {Number(promos.find(p => p.badge === 'Oferta Relámpago')?.oldPrice) > 0 && (
                          <motion.span 
                            animate={{ color: ["#64748b", "#ffffff", "#64748b", "#ffffff", "#64748b"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="text-xs line-through font-bold opacity-60"
                          >
                            {formatCurrency(promos.find(p => p.badge === 'Oferta Relámpago')?.oldPrice)}
                          </motion.span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <motion.span 
                          animate={{ color: ["#334155", "#ffffff", "#334155", "#ffffff", "#334155"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="text-[10px] font-bold italic leading-none"
                        >
                          {promos.find(p => p.badge === 'Oferta Relámpago')?.title}
                        </motion.span>
                        <motion.div
                          animate={{ color: ["#004b93", "#ffffff", "#e31b23", "#ffffff", "#004b93"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ChevronRight size={16} />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. Main CTA Button (With Smart Switch) */}
                <motion.div 
                  animate={{ 
                    opacity: isScrolled ? 0 : 1,
                    scale: isScrolled ? 0.95 : 1,
                    pointerEvents: isScrolled ? 'none' : 'auto'
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap items-center gap-6"
                >
                  <button 
                    onClick={() => scrollToSection('categorias')}
                    className="bg-gradient-to-r from-[#002244] to-[#004a99] px-10 py-5 rounded-cta text-lg flex items-center gap-4 active:scale-95 justify-center text-white font-black shadow-[0_0_20px_rgba(0,74,153,0.3)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,74,153,0.5)] transition-all w-full max-w-[320px] md:max-w-[350px]"
                  >
                    <ShoppingCart size={22} className="mr-1" />
                    Pide ahora
                  </button>
                  {/* Customer Social Proof next to button on Desktop */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                          <img alt="customer" className="w-full h-full object-cover" src={`https://i.pravatar.cc/150?u=${i + 10}`} />
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] font-bold text-text-main/60 uppercase tracking-tighter">
                      <span className="text-primary font-black">8k+</span> Clientes en <span className="font-bold text-blue-600">IBAGUÉ</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* Featured Promotions (Responsive Optimized) */}
        <section id="promociones" className="min-h-[100dvh] w-full flex items-center brand-gradient relative z-0 overflow-hidden py-16 md:py-0">
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
              {promos.map((promo) => {
                let cardClass = "product-card group p-4 rounded-[2rem] relative bg-white w-full max-w-[340px] mx-auto md:max-w-none md:mx-0 shadow-2xl";
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
                  <div key={promo.id} className={cardClass}>
                    {badgeText && (
                      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10 whitespace-nowrap flex items-center gap-2 ${badgeColorClass}`}>
                        <span>{badgeText === 'Oferta Relámpago' ? '🏆 Oferta Mundialista' : badgeText}</span>
                        {promo.badge === 'Promoción del Día' && (
                          <div className="bg-white/20 px-1.5 py-0.5 rounded border border-white/20 shadow-sm flex items-center">
                            <span className="font-mono text-[10px] font-bold tracking-wider">{formatTime(timeUntilSix)}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="relative aspect-video mb-6 rounded-[1.5rem] overflow-hidden">
                      <img alt={promo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={promo.image}/>
                      {promo.title.toLowerCase().includes('michelob') && (
                        <div className="absolute top-2 left-2 bg-[#004b93] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md z-20">
                          Suministro Oficial ⚽
                        </div>
                      )}
                    </div>
                    <div className="px-4 pb-4 space-y-5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-black text-primary italic leading-tight">{promo.title}</h3>
                          <p className="text-primary-light text-xs font-black mt-1">{subtitleText}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          {Number(promo.oldPrice) > 0 && (
                            <span className="text-sm text-text-main/40 line-through font-bold">
                              {formatCurrency(promo.oldPrice)}
                            </span>
                          )}
                          <span className="text-2xl font-black text-primary font-headline tracking-tighter">
                            {formatCurrency(promo.currentPrice)}
                          </span>
                          {promo.title.toLowerCase().includes('michelob') && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#004b93] mt-0.5">
                              Cerveza Superior Light
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => addToCart(promo)}
                        className="w-full primary-cta-btn py-4 rounded-cta text-white active:scale-95 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={20} />
                        Añadir al Carrito
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Full-Viewport Categories Dashboard (Fitted) */}
        <section id="categorias" className="w-full px-4 md:px-8 bg-white min-h-[100dvh] flex flex-col justify-center py-24 md:py-32 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
          {/* Top Search Bar (Anclado) */}
          <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-black font-headline tracking-tighter uppercase text-primary shrink-0">Categorías</h2>
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-12 pr-6 py-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-bold focus:ring-2 focus:ring-primary-light/20 transition-all shadow-sm" 
                placeholder="¿Buscas algún producto o marca?" 
                type="text"
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] backdrop-blur-xl"
                  >
                    {searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              addToCart({ 
                                id: product.id, 
                                title: product.nombre, 
                                currentPrice: product.precio, 
                                image: getImageUrl(product.url_imagen) 
                              });
                              setSearchQuery("");
                            }}
                            className="w-full px-6 py-4 hover:bg-gray-50 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="flex items-center gap-4 text-left">
                              <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 p-1">
                                <img src={getImageUrl(product.url_imagen)} alt="" className="w-full h-full object-contain" />
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
                        <button 
                          onClick={() => navigate(`/catalogo?search=${searchQuery}`)}
                          className="w-full py-4 bg-gray-50/50 text-[10px] font-black text-primary-light uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          Ver todos los resultados <ArrowRight size={12} />
                        </button>
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

        {/* Delivery Methods (Full-Viewport) */}
        <section className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 py-20 md:py-32 brand-gradient relative z-0">
          <div className="max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-white text-center mb-20 uppercase italic">Métodos de Entrega</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Punto Físico Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-center flex flex-col items-center">
                <div className="w-28 h-28 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-8 group-hover:bg-white/20 transition-colors">
                  <Store className="text-white" size={48} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">Punto Físico</h3>
                <p className="text-white/90 font-semibold text-lg">Recoge en bodega sin filas</p>
              </div>
              {/* Domicilio Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-center flex flex-col items-center">
                <div className="w-28 h-28 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-8 group-hover:bg-white/20 transition-colors">
                  <Calendar className="text-white" size={48} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">Domicilio</h3>
                <p className="text-white/90 font-semibold text-lg">Entregas programadas a tu negocio</p>
              </div>
              {/* Contra Entrega Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group text-center flex flex-col items-center">
                <div className="w-28 h-28 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mb-8 group-hover:bg-white/20 transition-colors">
                  <Banknote className="text-white" size={48} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">Contra Entrega</h3>
                <p className="text-white/90 font-semibold text-lg">Paga seguro al recibir</p>
              </div>
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
                <button className="bg-white text-primary hover:bg-primary-light hover:text-white px-8 py-3.5 rounded-cta text-base transition-all duration-300 flex items-center gap-3 font-bold shadow-xl">
                  Quiénes somos
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact and Locations Section (Fitted Full-Viewport) */}
        <ContactSection />


      <Footer 
        onInicioClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onCategoriasClick={() => navigate('/catalogo')}
        onPromocionesClick={() => scrollToSection('promociones')}
        onContactoClick={() => scrollToSection('contacto')}
      />

      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowWelcomeModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 max-w-lg w-full text-center border-4 border-[#004b93]/10"
            >
              <button 
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#004b93] transition-colors"
              >
                ✕
              </button>
              
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#004b93] to-[#e31b23] rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-3xl">
                  🍺
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-[#004b93] uppercase italic tracking-tighter mb-4">
                Michelob Ultra
              </h2>
              <div className="bg-[#f0f7ff] rounded-xl p-4 mb-6 inline-block">
                <p className="text-[#004b93] font-black text-lg tracking-widest uppercase">
                  95 Calorías <span className="opacity-40">•</span> 2.6g Carbs
                </p>
              </div>
              
              <p className="text-gray-600 font-medium text-lg mb-8 leading-relaxed">
                Vive el Mundial con ligereza.<br/>El equilibrio perfecto para tu pasión.
              </p>
              
              <button 
                onClick={() => {
                  setShowWelcomeModal(false);
                  document.getElementById('promociones')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="w-full py-4 bg-gradient-to-r from-[#004b93] to-[#e31b23] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                Ver Oferta Mundialista ⚽
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </main>

    </div>
  );
};

export default Landing;
