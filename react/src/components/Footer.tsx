import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useConfigs } from '../hooks/useConfigs';

const Footer: React.FC = () => {
  const { getConfig } = useConfigs();
  
  const facebookUrl = getConfig('facebook_url', 'https://www.facebook.com/profile.php?id=61555922458459');
  const instagramUrl = getConfig('instagram_url', 'https://www.instagram.com/rapifriosltda/');

  return (
    <footer className="bg-[#002244] text-slate-400 py-12 md:py-16 font-body">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Identity Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
              Rapifrios <span className="text-blue-400">Nexus</span>
            </h3>
            <p className="text-xs md:text-sm font-medium leading-relaxed">
              La evolución del suministro de bebidas. Tecnología y logística de precisión para el mercado de Ibagué. Confianza y calidad en cada entrega.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Navegación</h4>
            <ul className="space-y-2 text-xs md:text-sm font-bold uppercase tracking-widest">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  Inicio
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  Catálogo
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <a href="#contacto" className="hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  Ubicaciones
                  <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Ecosistema</h4>
            <p className="text-xs md:text-sm font-medium leading-relaxed">
              Lideramos la distribución de bebidas en Ibagué, Tolima. Nuestra red Nexus conecta sedes estratégicas para garantizar un suministro ininterrumpido a comercios y hogares.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-[10px] md:text-xs">
                <MapPin size={14} className="text-blue-400" />
                <span>Ibagué, Tolima - Colombia</span>
              </div>
            </div>
          </div>

          {/* Contact Column / Social Links (Dynamic) */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Contacto Directo</h4>
            <div className="space-y-3">
              <a href="mailto:contacto@rapifrios.com" className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Escríbenos</span>
              </a>
              <a href="tel:+573001234567" className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Phone size={16} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Llámanos</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[10px] md:text-xs font-medium tracking-wide">
            Copyright © 2026 <span className="text-white font-bold">Rapifrios LTDA.</span> Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-[10px] md:text-xs font-black uppercase tracking-widest">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
