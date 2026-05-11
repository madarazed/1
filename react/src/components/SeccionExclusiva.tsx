import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { ShoppingCart, Star, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS_IMAGE_URL } from '../constants';

const getImageUrl = (url_imagen: string) => {
  if (!url_imagen || url_imagen === 'placeholder.png' || url_imagen === 'placeholder.jpg') {
    return 'https://placehold.co/200x200?text=S%2FI';
  }
  if (url_imagen.startsWith('http')) return url_imagen;
  const filename = url_imagen.split('/').pop() || url_imagen;
  // Siempre usa la URL absoluta del backend de Render para evitar rutas rotas en Vercel
  return `${PRODUCTS_IMAGE_URL}/${filename}`;
};

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

// Precio VIP tachado: si hay precio_oferta activo, mostramos el normal tachado
const getPricing = (p: any) => {
  const hasVipPrice = p.precio_oferta && Number(p.precio_oferta) > 0 && p.en_promocion;
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
    <section className="py-12 bg-slate-900 border-4 border-amber-400 relative overflow-hidden my-8 rounded-3xl shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Star size={120} className="text-amber-400" />
      </div>
      <div className="px-6 relative z-10">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Lock className="text-amber-400 shrink-0" size={28} />
          <div>
            <h2 className="text-3xl font-black text-amber-400 uppercase italic tracking-tighter">
              ⭐ TUS OFERTAS VIP DISPONIBLES
            </h2>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">
              Precios exclusivos para clientes registrados · Confidencial
            </p>
          </div>
          <span className="bg-amber-400 text-slate-900 text-xs font-black uppercase px-3 py-1 rounded-full shrink-0">
            Solo Clientes
          </span>
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-3">
            <div className="w-6 h-6 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-amber-400 font-bold uppercase text-sm tracking-widest">
              Cargando ofertas VIP...
            </span>
          </div>
        )}

        {/* Error de autenticación */}
        {!loading && errorMsg && (
          <div className="py-12 text-center border-2 border-amber-400/30 rounded-2xl">
            <p className="text-amber-400 font-bold uppercase tracking-widest text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Sin productos */}
        {!loading && !errorMsg && productos.length === 0 && (
          <div className="py-12 text-center border-2 border-amber-400/30 rounded-2xl">
            <Star size={48} className="text-amber-400 mx-auto mb-4 opacity-50" />
            <p className="text-amber-400 font-black uppercase tracking-widest text-lg">
              ⭐ PORTAL VIP: Próximamente nuevas ofertas para ti
            </p>
            <p className="text-white/30 text-xs mt-2 font-bold uppercase tracking-widest">
              Estamos preparando ofertas exclusivas para nuestros mejores clientes
            </p>
          </div>
        )}

        {/* Grid de productos */}
        {!loading && !errorMsg && productos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {productos.map(p => {
              const { precioActivo, precioTachado } = getPricing(p);
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -5 }}
                  className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 flex flex-col"
                >
                  <div className="aspect-square bg-white rounded-xl mb-4 overflow-hidden p-2 relative">
                    <div className="absolute top-2 right-2 bg-amber-500 text-slate-900 text-[10px] font-black uppercase px-2 py-1 rounded-full z-10">
                      VIP
                    </div>
                    <img
                      src={getImageUrl(p.url_imagen)}
                      alt={p.nombre}
                      className="w-full h-full object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/200x200?text=S%2FI'; }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-white font-black leading-tight text-sm uppercase">{p.nombre}</h3>
                    <p className="text-amber-400/80 text-xs font-bold uppercase">{p.nombre_marca}</p>

                    {/* Bloque de Precios Dinámico con tachado */}
                    <div className="pt-2 space-y-0.5">
                      {precioTachado && (
                        <p className="text-white/40 text-xs font-bold line-through">
                          {formatCurrency(precioTachado)}
                        </p>
                      )}
                      <p className="text-2xl font-black text-amber-400">
                        {formatCurrency(precioActivo)}
                      </p>
                      {precioTachado && (
                        <span className="inline-block bg-amber-400/20 text-amber-300 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                          Precio Exclusivo VIP
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart({
                      id: p.id,
                      title: p.nombre,
                      currentPrice: precioActivo,
                      image: getImageUrl(p.url_imagen)
                    })}
                    className="mt-4 w-full bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 border border-amber-500/10"
                  >
                    <ShoppingCart size={14} /> Añadir
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
