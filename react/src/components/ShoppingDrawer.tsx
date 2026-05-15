import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SmartImage from './common/SmartImage';

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

interface ShoppingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShoppingDrawer = ({ isOpen, onClose }: ShoppingDrawerProps) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    totalAmount, 
    totalItems,
    selectedSede,
    setSelectedSede,
    generateWhatsAppLink
  } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white border-l border-gray-100 shadow-2xl z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-primary/5 p-2 rounded-xl">
                  <ShoppingBag className="text-primary" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Tu Carrito</h2>
                  <p className="text-[10px] font-bold text-text-main/40 uppercase tracking-widest">{totalItems} Productos seleccionados</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-primary"
              >
                <X size={24} />
              </button>
            </div>

            {/* Products List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                  <ShoppingBag size={64} />
                  <p className="font-black text-xl uppercase italic">Tu carrito está vacío</p>
                  <p className="text-xs font-bold uppercase tracking-widest">¡Agrega algo delicioso!</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0 relative p-2">
                        <SmartImage 
                          originalUrl={item.image} 
                          productName={item.title} 
                          alt={item.title} 
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-black text-primary text-sm uppercase leading-tight italic">{item.title}</h4>
                      <p className="text-xs font-bold text-primary-light">{item.subtitle || 'Calidad Garantizada'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-black text-primary text-sm">{formatCurrency(item.currentPrice * item.quantity)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors self-start p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer (Fixed) */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-gray-100 space-y-4 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                
                {/* Sede Selector reubicado y compactado */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="h-[1px] bg-gray-100 flex-1" />
                    <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Sede</span>
                    <div className="h-[1px] bg-gray-100 flex-1" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedSede('centro')}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        selectedSede === 'centro'
                          ? "border-primary text-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 text-gray-400 hover:border-gray-200 bg-white"
                      }`}
                    >
                      Sede Centro
                    </button>
                    <button
                      onClick={() => setSelectedSede('salado')}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        selectedSede === 'salado'
                          ? "border-primary text-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 text-gray-400 hover:border-gray-200 bg-white"
                      }`}
                    >
                      El Salado
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <div className="flex justify-between items-start">
                    <span className="text-lg font-black text-primary uppercase italic tracking-tighter">Total</span>
                    <div className="flex flex-col items-end gap-0">
                      <span className="text-3xl font-black text-primary font-headline tracking-tighter leading-tight">{formatCurrency(totalAmount)}</span>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest text-right leading-none italic">
                        + costo de envío
                      </span>
                      <span className="text-[8px] font-bold text-primary/60 uppercase tracking-tight text-right mt-1 italic leading-none">
                        (envio gratis en la mayoria de productos)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-0">
                  <button 
                    onClick={() => {
                      const link = generateWhatsAppLink();
                      if (link) window.open(link, '_blank');
                    }}
                    disabled={!selectedSede}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${
                      !selectedSede
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-50"
                        : "bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 hover:scale-[1.02] active:scale-[0.98]"
                    }`}
                  >
                    {!selectedSede ? "Elige una Sede" : "Finalizar Pedido"}
                    <WhatsAppIcon size={18} className={!selectedSede ? "opacity-30" : "opacity-100"} />
                  </button>
                  
                  {!selectedSede && (
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest text-center mt-2 animate-pulse">
                      Debes elegir una sede para continuar
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShoppingDrawer;
