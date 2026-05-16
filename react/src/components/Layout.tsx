import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { 
  ShoppingCart, Instagram, Facebook
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import ShoppingDrawer from './ShoppingDrawer';
import { SEDES } from '../constants';

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

import { useAuth } from '../context/AuthContext';
import { SedeSelector } from './SedeSelector';
import { useConfigs } from '../hooks/useConfigs';
import Footer from './Footer';

const Layout = () => {
  const { totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const { getConfig } = useConfigs();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const facebookUrl = getConfig('facebook_url', 'https://www.facebook.com/profile.php?id=61555922458459');
  const instagramUrl = getConfig('instagram_url', 'https://www.instagram.com/rapifriosltda/');
  
  const { scrollY } = useScroll();

  const isCatalog = location.pathname === '/catalogo';

  // Reset scroll on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    setIsScrolled(latest > 50);
    
    // Smart Reveal: Ocultar al bajar, mostrar al subir
    if (latest > previous && latest > 150) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  const scrollToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/#' + id);
      // Wait for navigation and then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
    }
  };

  const handleInicioClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-surface-light text-text-main font-body selection:bg-primary-light/30 min-h-screen flex flex-col scroll-smooth overflow-x-hidden">
      
      {/* Social Sidebar */}
      <aside className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex flex-col gap-5 p-3 sidebar-glass rounded-l-2xl border-y border-l border-white/20">
        <a className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:scale-110 group" href={instagramUrl} target="_blank" rel="noopener noreferrer" title="Instagram">
          <Instagram className="text-[#E4405F]" size={22} />
        </a>
        <a className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:scale-110 group" href={facebookUrl} target="_blank" rel="noopener noreferrer" title="Facebook">
          <Facebook className="text-[#1877F2]" size={22} />
        </a>
      </aside>

      {/* Floating WhatsApp Button */}
      <a 
        href={`https://wa.me/${SEDES.CENTRO.wa}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed z-[70] w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 group ${
          isCatalog 
            ? 'bottom-[90px] right-6 lg:bottom-6' 
            : 'bottom-[90px] md:bottom-6 right-6'
        }`}
        title="WhatsApp Support"
      >
        <WhatsAppIcon className="text-white group-hover:rotate-12 transition-transform" size={32} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
        </span>
      </a>

      {/* TopAppBar */}
      {location.pathname !== '/vip-portal' && (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? "bg-white shadow-lg border-b border-slate-100" 
            : "bg-transparent border-transparent"
        } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className={`flex justify-between items-center w-full px-4 md:px-6 max-w-7xl mx-auto transition-all duration-500 ${
            isScrolled ? "py-3" : "py-5"
          }`}>
            <div className="flex items-center gap-4 md:gap-12">
              <div className="h-8 md:h-10 overflow-hidden flex items-center cursor-pointer shrink-0" onClick={handleInicioClick}>
                <img alt="Rapifrios Logo" className="h-full object-contain" src="/logo.png"/>
              </div>
              <nav className="flex items-center gap-3 md:gap-10">
                {[
                  { name: 'Inicio', onClick: handleInicioClick },
                  { name: 'Catálogo', onClick: () => navigate('/catalogo') },
                  { name: 'Contáctanos', onClick: () => scrollToSection('contacto') },
                ].map((link) => (
                  <motion.button
                    key={link.name}
                    onClick={link.onClick}
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`relative flex items-center justify-center transition-colors duration-500 text-primary`}
                  >
                    <span className={`text-[11px] md:text-base landscape-text-sm font-headline tracking-tight ${
                      hoveredLink === link.name ? "font-bold" : "font-semibold"
                    }`}>
                      {link.name}
                    </span>
                    
                    {hoveredLink === link.name && (
                      <motion.div
                        layoutId="nav-underline"
                        className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary-light`}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3 md:gap-6">
              <SedeSelector />
              
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase tracking-tighter italic text-primary transition-colors duration-500`}>Hola, {user.nombre.split(' ')[0]}</span>
                    <button onClick={logout} className={`text-[9px] font-bold uppercase tracking-widest transition-colors duration-500 text-gray-400 hover:text-red-500`}>Cerrar Sesión</button>
                  </div>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 bg-primary/10 border border-primary/20 text-primary`}>
                    {user.nombre.charAt(0)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 w-full z-[80] lg:hidden bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-around py-3 px-6 safe-area-inset-bottom">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-primary"
        >
          <div className="p-2 rounded-xl bg-primary/5">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-2 bg-orange-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">Carrito</span>
        </button>

        {isCatalog && (
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-filters'))}
            className="flex flex-col items-center gap-1 text-primary"
          >
            <div className="p-2 rounded-xl bg-primary/5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter">Filtrar</span>
          </button>
        )}
      </div>

      {/* Persistent Floating Cart Button (PC ONLY) */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: (location.pathname === '/vip-portal' ? 1 : (location.pathname === '/' ? (isScrolled ? 1 : 0) : 1)), 
          scale: (location.pathname === '/vip-portal' ? 1 : (location.pathname === '/' ? (isScrolled ? 1 : 0.5) : 1)),
          pointerEvents: (location.pathname === '/vip-portal' ? 'auto' : (location.pathname === '/' ? (isScrolled ? 'auto' : 'none') : 'auto'))
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="fixed bottom-6 left-6 z-[60] hidden lg:flex bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/40 transition-shadow hover:ring-4 hover:ring-primary/20 ring-offset-2"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart size={28} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            {totalItems}
          </span>
        )}
      </motion.button>

      <ShoppingDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      {/* Corporate Footer (Public Pages Only) */}
      {location.pathname !== '/vip-portal' && <Footer />}
    </div>
  );
};

export default Layout;
