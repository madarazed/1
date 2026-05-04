import { Instagram, Facebook, Twitter, Code, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface FooterProps {
  onInicioClick: () => void;
  onCategoriasClick: () => void;
  onPromocionesClick: () => void;
  onContactoClick: () => void;
}

const Footer = ({ onInicioClick, onCategoriasClick, onPromocionesClick, onContactoClick }: FooterProps) => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Col 1: Brand & Logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onInicioClick}>
              <img src="/logo.png" alt="Rapifrios" className="h-10 w-auto" />
              <span className="text-2xl font-black text-white italic tracking-tighter uppercase">Rapifrios</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sub-Zero Sophistication. Llevamos la frescura a tu puerta con la mayor rapidez y calidad en Ibagué.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest">Navegación</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><button onClick={onInicioClick} className="hover:text-white transition-colors">Inicio</button></li>
              <li><button onClick={onCategoriasClick} className="hover:text-white transition-colors">Categorías</button></li>
              <li><button onClick={onPromocionesClick} className="hover:text-white transition-colors">Promociones</button></li>
              <li><button onClick={onContactoClick} className="hover:text-white transition-colors">Contacto</button></li>
            </ul>
          </div>

          {/* Col 3: Legal Links */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Políticas de Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Políticas de Envíos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Aviso Legal</a></li>
            </ul>
          </div>

          {/* Col 4: Developer Branding */}
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest opacity-50">Desarrollo</h4>
            <div className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
              
              <div className="relative p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#004a99] to-[#002244] rounded-xl flex items-center justify-center text-white shadow-xl group-hover:rotate-3 transition-transform duration-500 border border-white/10">
                      <Code size={22} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full shadow-lg"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-primary-light font-black uppercase tracking-[0.2em] mb-0.5">Lead Architect</span>
                    <h5 className="text-white font-black text-xl tracking-tighter leading-none">David</h5>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Data Designer</span>
                  </div>
                </div>
                
                <a 
                  href="https://github.com/madarazed" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 text-[10px] text-white font-black uppercase tracking-[0.15em] transition-all group/link border border-white/5"
                >
                  Project Portfolio
                  <ExternalLink size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/10 my-10" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <motion.a 
              whileHover={{ scale: 1.1, y: -2 }}
              href="#" className="text-gray-400 hover:text-white transition-colors"
            >
              <Instagram size={20} />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.1, y: -2 }}
              href="https://www.facebook.com/profile.php?id=61555922458459"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Facebook size={20} />
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.1, y: -2 }}
              href="#" className="text-gray-400 hover:text-white transition-colors"
            >
              <Twitter size={20} />
            </motion.a>
          </div>
          
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            © 2026 Rapifrios LTDA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
