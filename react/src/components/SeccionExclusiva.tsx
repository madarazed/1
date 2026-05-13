import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { ShoppingCart, Star, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const formatCurrency = (amount: number | string | undefined) => {
  if (amount === undefined || amount === null) return '$0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

// Precio VIP tachado: si hay precio_oferta activo (> 0), mostramos el normal tachado
const getPricing = (p: any) => {
  const hasVipPrice = p.precio_oferta && Number(p.precio_oferta) > 0;
  return {
    precioActivo: hasVipPrice ? Number(p.precio_oferta) : Number(p.precio),
    precioTachado: hasVipPrice ? Number(p.precio) : null,
  };
};

export const SeccionExclusiva = () => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchExclusivas = async () => {
      try {
        const response = await api.get('/ofertas-exclusivas');
        // Maneja respuesta directa (array) o paginada (response.data.data)
        let rawData = response.data;
        if (rawData && rawData.data && Array.isArray(rawData.data)) {
          rawData = rawData.data;
        }
        const data = Array.isArray(rawData) ? rawData : [];
        setProductos(data);
      } catch (error: any) {
        console.error('Error fetching exclusivas:', error);
        setErrorMsg(error?.response?.status === 403
          ? 'Acceso VIP no autorizado. Inicia sesión como cliente.'
          : 'Error al cargar ofertas. Intenta de nuevo.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchExclusivas();
  }, []);

  // NUNCA retorna null — siempre se renderiza la sección
  return (
    <section className="py-16 bg-white border-y border-slate-100 relative overflow-hidden my-8">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Star size={180} className="text-[#1E3A8A]" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-[#1E3A8A] p-4 rounded-3xl shadow-2xl shadow-blue-900/20">
               <Star className="text-amber-400 fill-amber-400" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-[#1E3A8A] uppercase italic tracking-tighter">
                PORTAL VIP EXCLUSIVO
              </h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                Aprovecha precios de distribución mayorista
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg shadow-amber-200">
              Acceso Restringido
            </span>
          </div>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#1E3A8A] font-bold uppercase text-sm tracking-widest">
              Verificando Credenciales VIP...
            </span>
          </div>
        )}

        {/* Error de autenticación */}
        {!loading && errorMsg && (
          <div className="py-24 text-center border-2 border-slate-100 rounded-[3rem] bg-slate-50/50">
            <Lock size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Sin productos */}
        {!loading && !errorMsg && productos.length === 0 && (
          <div className="py-24 text-center border-2 border-slate-100 rounded-[3rem] bg-slate-50/50">
            <Star size={64} className="text-slate-200 mx-auto mb-4" />
            <p className="text-[#1E3A8A] font-black uppercase tracking-widest text-xl">
              ⭐ PRÓXIMAMENTE NUEVAS OFERTAS VIP
            </p>
            <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">
              Estamos preparando precios exclusivos para tu cuenta
            </p>
          </div>
        )}

        {/* Grid de productos */}
        {!loading && !errorMsg && productos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productos.map(p => {
              const { precioActivo, precioTachado } = getPricing(p);
              const discount = precioTachado 
                ? Math.round(((precioTachado - precioActivo) / precioTachado) * 100) 
                : 0;

              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="bg-white border border-slate-100 rounded-[2.5rem] p-5 flex flex-col shadow-sm hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="aspect-square bg-slate-50 rounded-[2rem] mb-5 overflow-hidden p-6 relative">
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-full z-10 shadow-lg">
                        -{discount}%
                      </div>
                    )}
                    <img
                      src={getImageUrl(p.url_imagen)}
                      alt={p.nombre}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => handleImageError(e, p.nombre, getImageUrl(p.url_imagen))}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-slate-800 font-medium tracking-tight leading-tight text-base min-h-[3em] line-clamp-2">{p.nombre}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{p.nombre_marca}</p>

                    {/* Bloque de Precios Dinámico */}
                    <div className="pt-4 space-y-1">
                      {precioTachado && (
                        <p className="text-slate-400 text-xs font-bold line-through">
                          {formatCurrency(precioTachado)}
                        </p>
                      )}
                      <p className="text-2xl font-black text-[#1E3A8A] tracking-tighter">
                        {formatCurrency(precioActivo)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart({
                      id: p.id,
                      title: p.nombre,
                      currentPrice: precioActivo,
                      image: getImageUrl(p.url_imagen)
                    })}
                    className="mt-6 w-full bg-[#1E3A8A] hover:bg-[#2563EB] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-blue-900/20"
                  >
                    <ShoppingCart size={18} /> Añadir al Carrito
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
